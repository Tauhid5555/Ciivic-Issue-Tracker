# Code Generation Plan — Bolt 7, real email (U2 Notifications)

## Summary

- Builds: real email sending for citizen notifications through Amazon SES, with retry, a background sender and a local fallback
- Touches: backend/app/notifications.py, email_sender.py, email_templates.py (new); platform_services.py, case_workflow.py, models.py, config.py, main.py, public_api.py, staff_api.py, requirements.txt, README.md
- Tests: 26 new tests in backend/tests/test_email.py (templates, SES sender with moto and Stubber, retry, API flow), plus the existing suite

## Scope

This is the email part of Bolt 7 in `inception/delivery-planning/bolt-plan.md`. The malware scan and staff invitations, which are also in Bolt 7, are not in this plan.

In scope:

- Acknowledgement email when a report is opened with an email (FR2.3).
- Status-change emails (FR5, FR5.1, FR5.2); email is the only channel (FR5.3).
- Sending within the targets while the platform is up: acknowledgement within 60 seconds (NFR3), status change within 5 minutes (NFR4).
- Retry with growing pauses, at most 5 attempts, then recorded as failed (contract C7).
- An email outage never stops a report or status change from saving (ADR-006).
- The recipient address never appears in application logs (ADR-006, NFR14).

Out of scope, for later Bolts:

- Bounce and complaint handling through SNS. It needs the AWS account and a configuration set (Bolt 6). This plan stores the SES message ID so bounces can be matched later.
- The magic-link email (C5 `sendMagicLinkEmail`), Bolt 9. It will reuse the sender built here.
- Removing `recipient_email` with a closed report's personal data (FR17), Bolt 8.

## Inputs read

- `inception/requirements-analysis/requirements.md`: FR2.3, FR5 to FR5.3, NFR3, NFR4.
- `inception/domain-design/decisions.md`: ADR-006.
- `inception/contract-design/contract-summary.md`: C7 (`StatusChanged` event: `eventId`, `kind`, `trackingId`, `category`, `toStatus`, `changedAt`, `recipientEmail`, `trackingUrl`; 5 attempts with growing pauses).
- `inception/units-generation/unit-of-work.md`: U2 owns Notifications.
- `construction/u1-contracts/nfr-requirements/tech-stack-decisions.md`: Python 3.12, FastAPI; the email service is chosen in Infrastructure Design. No functional, NFR or infrastructure design exists for U2, so this plan works from requirements, ADR-006 and C7.
- Current code: `backend/app/platform_services.py` (`queue_notification`, `send_pending`), `models.py` (`NotificationRequest`), `case_workflow.py`, `public_api.py`, `staff_api.py`, `main.py`, `config.py`, `tests/conftest.py`.
- Library docs looked up through context7: botocore SESv2 `send_email` request shape (`Content.Simple`), `ClientError` handling and `Stubber.add_client_error`; moto `mock_aws` and the SES backend's `sent_messages`.

## Decisions in this plan (please check)

1. **Amazon SES (API v2) as the provider**, behind a sender interface. It is proposed because the design targets AWS. The choice stays open until you approve this plan (external dependency D2).
2. **Two senders, picked by `EMAIL_BACKEND`:** `log` (default: today's behaviour, nothing leaves the machine) and `ses`. Local runs and tests never need AWS.
3. **A background sender loop** runs every `EMAIL_SWEEP_SECONDS` (default 5) inside the backend process, plus the existing send right after a request. A process lock stops the two from sending the same email twice. One backend instance is assumed, as today (README "Rate limits and sessions").
4. **Retry schedule:** attempt 1 immediately, then after 30 s, 60 s, 120 s and 240 s (5 attempts in about 7.5 minutes). Throttling, temporary and network errors are retried. A rejected message or unverified sender fails at once and is not retried.
5. **Email kinds fixed:** opening a report sends `acknowledgement` (FR2.3). Every later status change, including to Acknowledged, sends `status-change` (FR5). Today a move to Acknowledged is labelled `acknowledgement`, which C7 reserves for the submission email.
6. **Database change without a migration tool:** two nullable columns are added to `notification_requests` (`next_attempt_at`, `provider_message_id`), plus `last_error_code`. Tables are made with `create_all`, which does not alter an existing table, so a small startup step adds missing columns on SQLite. A real migration tool comes with the PostgreSQL move in Bolt 6.
7. **Times in emails** are shown in Dhaka time (UTC+6, no daylight saving), matching the screens.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "brownfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:b24c961e4be03749ea7b57a644eb905d9a90ad063c32474517d348f17000a7f5",
  "contract_sha256": "sha256:b09f7a61630c8049159f50b50ca885948235f1869c05ad82e90fb8cc2fe88e2e"
}
```

Methodology is test-after: each layer is implemented, then its tests are written and run. The classic scope adds an 80% line-coverage floor on the new email modules. Frontend behaviour does not apply: the screens already show the right email notice (`emailNotice`) and nothing on screen changes.

## Steps

### Step 1 — Configuration and dependencies
- [x] Add to `backend/requirements.txt`, pinned to exact versions: `boto3`, `moto` (SES support) and `pytest-cov`.
- [x] Add to `backend/app/config.py`, all read from the environment with safe defaults: `EMAIL_BACKEND` (`log` | `ses`, default `log`), `EMAIL_FROM` (no default; required when `ses`), `AWS_REGION` (default `ap-south-1`), `SES_CONFIGURATION_SET` (optional), `EMAIL_SWEEP_SECONDS` (default 5; 0 turns the loop off), `EMAIL_MAX_ATTEMPTS` (5), `EMAIL_RETRY_BASE_SECONDS` (30).
- [x] No credentials in code or files: SES uses the standard AWS credential chain (environment, profile or the server's role).
- Traces to: NFR14, construction rule "never hardcode credentials".

### Step 2 — Verify the test runner
- [x] Install the new requirements into `backend/.venv`.
- [x] Run the existing suite (`cd backend && .venv\Scripts\python -m pytest -q`) and record that it passes before any change.
- [x] Confirm the unit-scoped command from `unit-test-instructions.md` runs (it reports "no tests" until Step 4).

### Step 3 — Data model: implement
- [x] `backend/app/models.py`, `NotificationRequest`: add `next_attempt_at` (UTC datetime, nullable: due now), `provider_message_id` (string, nullable), `last_error_code` (short string, nullable). Keep `status` values `pending | sent | failed`.
- [x] `backend/app/main.py` startup: after `create_all`, add any missing new columns to an existing SQLite `notification_requests` table (a small, idempotent `ALTER TABLE ... ADD COLUMN`). Other databases are left to the migration tool in Bolt 6, and this is stated in a comment.

### Step 4 — Data model: tests
- [x] In `backend/tests/test_email.py`: a fresh database has the new columns; the startup step adds them to an old-shaped table and is safe to run twice.

### Step 5 — Email content: implement
- [x] New `backend/app/email_templates.py` with `build(kind, payload) -> (subject, text, html)`:
  - `acknowledgement`: Tracking ID, category label, submission time (Dhaka), link to the tracking page (FR2.3).
  - `status-change`: Tracking ID, new status, time of change (Dhaka), link to the tracking page (FR5.2).
  - HTML-escape every value; a plain-text part is always sent.
  - Never include the citizen's description, photo or email address in the body.
- [x] `backend/app/notifications.py`, the new home of `queue_notification`: the payload gains `category` (label), `changedAt` (ISO time) and keeps `eventId`, `kind`, `trackingId`, `toStatus`, `trackingUrl`, matching C7. `platform_services.py` re-exports `queue_notification` and `send_pending` so callers do not change.
- [x] `backend/app/case_workflow.py`: pass the category and time when queuing. Opening a report queues `acknowledgement`; every status change, including to Acknowledged, queues `status-change` (decision 5).

### Step 6 — Email content: tests
- [x] Acknowledgement email holds the Tracking ID, category label, Dhaka time and tracking link.
- [x] Status-change email holds the Tracking ID, new status, Dhaka time and tracking link.
- [x] A value containing `<script>` is escaped in the HTML part.
- [x] Neither email contains the recipient address or the report description.
- [x] An unknown kind raises an error rather than sending an empty email.
- [x] A move to Acknowledged queues `status-change`; opening a report queues `acknowledgement`.

### Step 7 — Sender: implement
- [x] New `backend/app/email_sender.py`:
  - `EmailSender` interface: `send(to, subject, text, html, event_id) -> message_id`.
  - `LogSender`: logs only the event ID and kind, never the address, and returns a fake message ID.
  - `SesSender`: one `boto3` `sesv2` client; calls `send_email` with `FromEmailAddress`, `Destination.ToAddresses`, `Content.Simple` (subject, text and HTML body), and `ConfigurationSetName` when set; returns the `MessageId`.
  - Errors mapped to two types. `TransientEmailError`: throttling or limit errors, temporary pauses, 5xx answers, and network or timeout errors from botocore. `PermanentEmailError`: message rejected, sender not verified, bad request. The exact SESv2 error code names are checked against the installed botocore model during the build and listed in `code-summary.md`.
  - `get_sender()` picks the sender from `EMAIL_BACKEND`. With `ses` and no `EMAIL_FROM`, startup fails with a clear message (fail fast on misconfiguration).

### Step 8 — Sender: tests
- [x] With moto (`mock_aws`, sender identity verified): one email is sent with the right recipient and subject, and the returned message ID is stored.
- [x] With moto and an unverified sender: the error is a `PermanentEmailError`.
- [x] With botocore `Stubber`: a throttling error becomes a `TransientEmailError`.
- [x] With botocore `Stubber`: a rejected message becomes a `PermanentEmailError`.
- [x] A network error becomes a `TransientEmailError`.
- [x] `get_sender()` returns `LogSender` by default and refuses `ses` without `EMAIL_FROM`.
- [x] `LogSender` writes no email address to the log (checked with pytest `caplog`).

### Step 9 — Sending and retry: implement
- [x] `backend/app/notifications.py`, `send_pending(db)`:
  - Picks `pending` rows whose `next_attempt_at` is empty or due, oldest first.
  - Builds the email, sends it, and on success sets `sent` and `provider_message_id`.
  - On `TransientEmailError`, increases `attempts`, sets `next_attempt_at` to now + 30 s × 2^(attempts − 1), and marks `failed` after the 5th attempt.
  - On `PermanentEmailError`, marks `failed` at once.
  - Records `last_error_code`, never the message text if it could contain the address.
  - Commits each row on its own, so one bad row never stops the others.
  - Logs notification ID, kind, outcome and error code only.
- [x] A process-wide lock around `send_pending`, so the request-time send and the loop never send one email twice.
- [x] `backend/app/main.py` startup: start the sender loop when `EMAIL_SWEEP_SECONDS` > 0, running `send_pending` in a worker thread every N seconds, and stop it cleanly on shutdown. Errors in one pass are logged and the loop goes on.

### Step 10 — Sending and retry: tests
- [x] A due pending row is sent and marked `sent` with a message ID.
- [x] A transient failure leaves the row `pending` with `attempts` 1 and `next_attempt_at` about 30 s ahead; the row is skipped until then.
- [x] Five transient failures mark the row `failed` with the last error code.
- [x] A permanent failure marks the row `failed` after one attempt.
- [x] One failing row does not stop the next row from sending.
- [x] Two calls to `send_pending` at the same time send each row once.
- [x] The log output of a full send and retry cycle contains no email address.

### Step 11 — API flow: implement
- [x] `backend/app/public_api.py` and `staff_api.py`: keep the send right after a request (it lowers delay towards NFR3), now through the lock. A failure inside it is caught and logged and never changes the API answer.
- [x] No change to any API contract (C1, C2).

### Step 12 — API flow: tests
- [x] Submitting a report with an email creates one `acknowledgement` row, and with the log sender it ends `sent`.
- [x] Submitting without an email creates no row (FR5.1), and the answer says `no-email-no-notifications`.
- [x] With a sender that always fails, submitting still answers 201 and the report exists (ADR-006).
- [x] A staff status change creates one `status-change` row for a report with an email, and none for a report without.

### Step 13 — Environment and run configuration
- [x] `conftest.py` sets `EMAIL_BACKEND=log` and `EMAIL_SWEEP_SECONDS=0` before the app is imported, so tests never reach AWS and never race the loop.
- [x] The full suite stays green: `cd backend && .venv\Scripts\python -m pytest -q`.
- [x] Coverage of `app/notifications.py`, `app/email_sender.py` and `app/email_templates.py` is at least 80% lines (classic scope floor).
- [x] `cd frontend && npm run build` still passes (no frontend change expected).

### Step 14 — Documentation and traceability
- [x] `README.md`: replace the "Email" known gap with how to turn SES on (`EMAIL_BACKEND=ses`, `EMAIL_FROM`, `AWS_REGION`, credentials from the AWS chain, SES test mode only sends to verified addresses), and keep "nothing leaves the machine" as the default.
- [x] Inline docstrings on the new modules, naming FR2.3, FR5, NFR3, NFR4 and ADR-006.
- [x] Write `code-summary.md` and `traceability.json` in this folder.

## Requirement-to-step map

| ID | What | Steps |
|---|---|---|
| FR2.3 | Acknowledgement email with Tracking ID, category, time, link | 5, 6, 12 |
| FR5 | Notify on status change | 5, 9, 12 |
| FR5.1 | Only when an email exists | 5, 12 |
| FR5.2 | Email contents | 5, 6 |
| FR5.3 | Email is the only channel | 7 |
| NFR3 | 99% of acknowledgements within 60 s | 9, 11 (send after request, 5 s loop) |
| NFR4 | 95% of status emails within 5 min | 9 |
| NFR14 | Personal data not in logs | 7, 8, 9, 10 |
| ADR-006 | Email outage never blocks a save; retries; outcome recorded | 9, 10, 12 |
| C7 | Event fields, 5 attempts with growing pauses, repeated event ignored | 5, 9, 10 |

NFR3 and NFR4 are percentages over real traffic. The code is built to meet them, and the tests check the timing rules (immediate first attempt, a 5-second loop). Measuring the real percentages needs a deployed environment and a real inbox, so it moves to Build and Test after Bolt 6.

## Risks

- **SES test mode:** until AWS approves production access, SES sends only to verified addresses. The code is unaffected, but a demo needs a verified recipient.
- **No AWS account yet (D1):** `EMAIL_BACKEND=ses` cannot be tried against real SES until it exists. All tests use moto and Stubber, so the build does not wait for it.
- **Single instance:** the in-process lock covers one backend process. A second instance needs a database row lock or the queue from Bolt 6.
