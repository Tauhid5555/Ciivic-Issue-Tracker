# Code Summary — Bolt 7, real email (U2 Notifications)

Built from `code-generation-plan.md` (14 steps). Nothing is committed yet.

## Files

New:

- `backend/app/email_templates.py`: builds the acknowledgement and status-change emails (subject, plain text, HTML).
- `backend/app/email_sender.py`: `EmailSender` interface, `LogSender` (default), `SesSender` (Amazon SES API v2), `TransientEmailError` / `PermanentEmailError`, `get_sender()`.
- `backend/app/notifications.py`: `queue_notification`, `send_pending` with retry, the process lock, `send_due_safely`, and the background `EmailSweeper`.
- `backend/tests/test_email.py`: 26 tests.

Changed:

- `backend/requirements.txt`: `boto3==1.44.9`, `moto==5.2.5`, `pytest-cov==7.1.0`.
- `backend/app/config.py`: `EMAIL_BACKEND`, `EMAIL_FROM`, `AWS_REGION`, `SES_CONFIGURATION_SET`, `EMAIL_SWEEP_SECONDS`, `EMAIL_MAX_ATTEMPTS`, `EMAIL_RETRY_BASE_SECONDS`.
- `backend/app/models.py`: `NotificationRequest` gains `next_attempt_at`, `provider_message_id`, `last_error_code`.
- `backend/app/main.py`: adds missing columns on SQLite at startup, checks the sender configuration at startup, starts and stops the sweeper.
- `backend/app/platform_services.py`: re-exports `queue_notification` and `send_pending` from `notifications.py`.
- `backend/app/case_workflow.py`: passes the category and time when queuing; every status change (including to Acknowledged) queues `status-change`.
- `backend/app/public_api.py`, `backend/app/staff_api.py`: the send after a request goes through `send_due_safely`, which never raises.
- `backend/tests/conftest.py`: `EMAIL_BACKEND=log` and `EMAIL_SWEEP_SECONDS=0` for tests.
- `backend/tests/test_slice.py`: one existing test now expects `["acknowledgement", "status-change"]` (plan decision 5).
- `README.md`: how to turn on SES; "nothing leaves the machine" stays the default.

## Key decisions

- `EMAIL_BACKEND=log` is the default: nothing is sent until someone sets `ses` and `EMAIL_FROM`. With `ses` and no `EMAIL_FROM`, the backend refuses to start.
- Retry: attempt 1 at once, then after 30, 60, 120 and 240 seconds; marked `failed` after the 5th. A rejected message fails at once.
- No email address reaches a log: only notification ID, kind, outcome and an error code or exception type name are logged or stored. botocore errors are re-raised without their original text.
- SES client retries are limited to 2, with 5 s connect and 10 s read timeouts, because the outbox handles retries.
- One `threading.Lock` stops the after-request send and the sweeper from sending the same email twice (one backend instance assumed).
- Column additions run only on SQLite and only for missing columns; a migration tool comes with Bolt 6.

### SESv2 error codes (from the installed botocore 1.44.9 model)

| Code | Mapped to |
|---|---|
| `TooManyRequestsException`, `LimitExceededException`, `SendingPausedException` | Transient (retried) |
| `MessageRejected`, `MailFromDomainNotVerifiedException`, `AccountSuspendedException`, `NotFoundException`, `BadRequestException` | Permanent (failed at once) |

Also transient: generic throttling and timeout codes, any 5xx or 429 answer, and network or credential errors from botocore. Also permanent: parameter validation errors and any other 4xx code.

## Test results

Checked again after the build:

- `tests/test_email.py`: 26 passed.
- Coverage: `email_sender.py` 95%, `email_templates.py` 98%, `notifications.py` 92%; total 94% (floor 80%).
- Full backend suite: 75 passed (49 before this Bolt).
- Frontend `npm run build`: passes (reported by the build; no frontend change).

## Deviations from the plan

- One existing test in `test_slice.py` was updated to match plan decision 5 (status change to Acknowledged now sends `status-change`).
- The test settings in `conftest.py` were added before Step 10's tests, so the new sweeper could not race them.
- The after-request send uses a new helper, `send_due_safely`, instead of calling `send_pending` directly.
- `EmailSender.send` gained an optional `kind` argument so the log sender can log the kind.

## Not done here (as planned)

- Bounce and complaint handling (needs AWS, Bolt 6); the SES message ID is stored for it.
- Magic-link email (Bolt 9); it will reuse `get_sender()`.
- Removing `recipient_email` with a closed report's personal data (Bolt 8).
- Real sending is untested against live SES: there is no AWS account yet (external dependency D1).
