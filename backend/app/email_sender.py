"""U2 Notifications: the email sender behind a small interface (FR5.3: email is the only channel).

Two senders, picked by EMAIL_BACKEND:
  * ``log`` (default): nothing leaves the machine. Logs the event ID and kind only.
  * ``ses``: Amazon SES, API v2 (``sesv2`` ``send_email``). Credentials come from the standard AWS chain
    (environment, profile or the server's role); none are kept in code or files.

Every failure is one of two types so the caller can decide what to do (ADR-006, contract C7):
  * TransientEmailError: worth retrying later (throttling, sending limits, a paused account, 5xx answers,
    network and timeout errors).
  * PermanentEmailError: retrying cannot help (message rejected, sender not verified, account suspended,
    bad request).
Neither error, nor any log line here, contains an email address (ADR-006, NFR14): only an error code is kept.
"""
import logging
from functools import lru_cache
from typing import Protocol

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError, ParamValidationError

from . import config

log = logging.getLogger("notifications")

# SESv2 SendEmail errors, checked against botocore's sesv2 service model (SendEmail "errors"), plus the generic
# AWS throttling and server codes that any AWS endpoint may answer with.
TRANSIENT_CODES = frozenset({
    "TooManyRequestsException",  # 429, request rate too high
    "LimitExceededException",  # sending quota reached for now
    "SendingPausedException",  # sending paused for the account or configuration set; may resume
    "Throttling",
    "ThrottlingException",
    "RequestTimeout",
    "ServiceUnavailable",
    "InternalFailure",
})
PERMANENT_CODES = frozenset({
    "MessageRejected",  # invalid content, or (in SES test mode) an unverified address
    "MailFromDomainNotVerifiedException",
    "AccountSuspendedException",
    "NotFoundException",  # e.g. the configuration set does not exist
    "BadRequestException",
})


class EmailError(Exception):
    """Base for send failures. ``code`` is a short machine code; the text never holds an address."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code[:60]


class TransientEmailError(EmailError):
    """Try again later."""


class PermanentEmailError(EmailError):
    """Do not try again."""


class EmailConfigError(RuntimeError):
    """The email settings cannot work. Raised at startup so a misconfiguration fails fast."""


class EmailSender(Protocol):
    def send(self, to: str, subject: str, text: str, html: str, event_id: str, *, kind: str | None = None) -> str:
        """Send one email and return the provider's message ID."""


def _check_recipient(to: str) -> None:
    if not to or "@" not in to or any(c.isspace() for c in to):
        raise PermanentEmailError("InvalidRecipient")


class LogSender:
    """Default for local runs and tests: writes a log line instead of sending."""

    def send(self, to: str, subject: str, text: str, html: str, event_id: str, *, kind: str | None = None) -> str:
        _check_recipient(to)
        log.info("email for event %s (%s) written to the log instead of sent", event_id, kind or "-")
        return f"log-{event_id}"


def classify_client_error(error: ClientError) -> EmailError:
    """Map a botocore ClientError to Transient or Permanent by its error code and HTTP status."""
    code = str(error.response.get("Error", {}).get("Code") or "UnknownError")
    status = int(error.response.get("ResponseMetadata", {}).get("HTTPStatusCode") or 0)
    if code in TRANSIENT_CODES or status >= 500 or status == 429:
        return TransientEmailError(code)
    return PermanentEmailError(code)


class SesSender:
    """Amazon SES (API v2). One client per sender; botocore's own retries are kept short because the outbox
    retries with growing pauses itself."""

    def __init__(self, from_address: str, region: str, configuration_set: str | None = None, client=None):
        if not from_address:
            raise EmailConfigError("EMAIL_FROM must be set when EMAIL_BACKEND is 'ses'.")
        self.from_address = from_address
        self.configuration_set = configuration_set
        self.client = client or boto3.client(
            "sesv2",
            region_name=region,
            config=Config(connect_timeout=5, read_timeout=10, retries={"max_attempts": 2, "mode": "standard"}),
        )

    def send(self, to: str, subject: str, text: str, html: str, event_id: str, *, kind: str | None = None) -> str:
        _check_recipient(to)
        request = {
            "FromEmailAddress": self.from_address,
            "Destination": {"ToAddresses": [to]},
            "Content": {
                "Simple": {
                    "Subject": {"Data": subject, "Charset": "UTF-8"},
                    "Body": {"Text": {"Data": text, "Charset": "UTF-8"}, "Html": {"Data": html, "Charset": "UTF-8"}},
                }
            },
        }
        if self.configuration_set:
            request["ConfigurationSetName"] = self.configuration_set
        try:
            answer = self.client.send_email(**request)
        except ClientError as e:
            raise classify_client_error(e) from None  # "from None": the botocore text may hold an address
        except ParamValidationError:
            raise PermanentEmailError("ParamValidationError") from None
        except BotoCoreError as e:  # network, timeout, credentials not yet available: try again later
            raise TransientEmailError(type(e).__name__) from None
        message_id = answer.get("MessageId")
        if not message_id:
            raise TransientEmailError("NoMessageId")
        return message_id


@lru_cache(maxsize=4)
def _build_sender(backend: str, from_address: str, region: str, configuration_set: str | None) -> EmailSender:
    if backend == "log":
        return LogSender()
    if backend == "ses":
        return SesSender(from_address, region, configuration_set)
    raise EmailConfigError(f"EMAIL_BACKEND must be 'log' or 'ses', not {backend!r}.")


def get_sender() -> EmailSender:
    """The sender the settings ask for. Raises EmailConfigError for settings that cannot work."""
    return _build_sender(config.EMAIL_BACKEND, config.EMAIL_FROM, config.AWS_REGION, config.SES_CONFIGURATION_SET)
