# Unit Test Instructions — Bolt 7, real email

## Framework and setup

- Runner: pytest (already in `backend/requirements.txt`), run from `backend/` with the project virtual environment.
- New test dependencies, added in plan Step 1: `moto` (fake AWS for SES), `pytest-cov` (coverage). `boto3` brings botocore's `Stubber`.
- Setup once:

      cd backend
      .venv\Scripts\python -m pip install -r requirements.txt

- `tests/conftest.py` sets `EMAIL_BACKEND=log` and `EMAIL_SWEEP_SECONDS=0` before the app is imported, so no test reaches AWS and the background loop never runs during tests. Tests that need SES turn it on themselves inside `mock_aws`.

## Run this unit's tests

Only the email tests:

    cd backend && .venv\Scripts\python -m pytest -q tests/test_email.py

With the coverage floor on the new modules:

    cd backend && .venv\Scripts\python -m pytest -q tests/test_email.py --cov=app.notifications --cov=app.email_sender --cov=app.email_templates --cov-report=term-missing --cov-fail-under=80

Before the first test is written (plan Step 2), the first command runs and reports that no tests were collected; that confirms the runner works.

## What is tested

26 tests in `backend/tests/test_email.py`, 5 to 8 per component (Standard strategy):

| Component | Tests | Plan step |
|---|---|---|
| Data model (new columns, startup column step) | 2 | 4 |
| Email content (`email_templates.py`, kinds) | 6 | 6 |
| Sender (`email_sender.py`) | 7 | 8 |
| Sending and retry (`notifications.send_pending`) | 7 | 10 |
| API flow (submit and status change, end to end in the app) | 4 | 12 |

Each component has a happy path and at least two error or edge cases, as the construction rules require.

## Coverage target

At least 80% line coverage of `app/notifications.py`, `app/email_sender.py` and `app/email_templates.py` (classic scope floor). The threshold is not lowered to make a run pass; a gap is reported instead.

## Mocking and stubbing

- **Real SES calls never happen in tests.**
- **moto** (`from moto import mock_aws`): for the SES happy path and the unverified-sender case. Start the mock before creating the client: create `SesSender` inside the `with mock_aws():` block, because moto hooks clients created after it starts. Verify the sender identity first (`verify_email_identity` on the `ses` client), then read sent mail from moto's SES backend `sent_messages`. That is moto's internal API and may change between versions, so assertions stay minimal: count, recipient, subject.
- **botocore `Stubber`**: for error codes moto does not produce, such as throttling or a rejected message. Use `stubber.add_client_error("send_email", service_error_code=..., http_status_code=...)` on the sender's own client.
- **Network error**: make the client raise `botocore.exceptions.EndpointConnectionError`.
- **Failing sender for API tests**: a small fake `EmailSender` that always raises `TransientEmailError`, swapped in with pytest `monkeypatch` on `get_sender`.
- **Time**: retry timing is tested by setting `next_attempt_at` directly or passing a fixed "now" into `send_pending`. No real sleeping.
- **Logs**: pytest `caplog` checks that no email address appears in any log record.

## Test data

- Recipient addresses use the reserved `example.org` domain, for example `citizen@example.org`. The sender identity in moto tests is `noreply@example.org`.
- Reports are created through the existing `submit` helper in `conftest.py` with `email="citizen@example.org"`. Staff actions use the existing `staff` fixture and `sign_in` helper.
- Each test gets a fresh database through the existing `client` fixture (`drop_all`, then app startup creates the tables).

## Whole suite (regression)

After this unit's tests pass, the whole backend suite must stay green:

    cd backend && .venv\Scripts\python -m pytest -q
