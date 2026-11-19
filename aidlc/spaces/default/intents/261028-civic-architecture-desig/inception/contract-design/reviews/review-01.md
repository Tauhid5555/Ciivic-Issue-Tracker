## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-19T12:48:22Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C4 openReport, C5 storePhoto, C6 | The photo is stored first (C5 storePhoto returns photoId) and the report is opened later with that photoId (C4 openReport). Photos not attached within 24 hours are deleted (C5 note, ADR-005), and the Photo entity has an attachedAt field. No operation in C4, C5 or C6 marks a photo as attached to a report. The expiry sweep cannot tell attached from unattached photos, so it would delete live evidence, or never expire orphans. | Add an attach operation (for example attachPhoto { photoId }) to C6, called by Case workflow inside openReport. State what happens if the photo is already attached or expired, and that openReport fails without creating a report in that case. | New |
| R-02 | Major | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C2 (staffSession bearer) and C6 assertActiveStaff | Every C2 call needs a signed-in staff session, and C3 issues an accessToken. C6 assertActiveStaff takes a staffId, not a token. Nothing lets Case workflow turn the bearer token on a C2 request into a staffId, or confirm it is unexpired and not signed out. The rule "deactivation fails the session at once" cannot be implemented from the contracts as written. | Add a session-check operation to C6 (for example resolveSession { accessToken } returning { staffId, displayName, active }, with errors for invalid or expired). Say whether assertActiveStaff remains. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C2 paths, `/reports` category filter, and C1 `/categories` | The dashboard (U6) filters the queue by category (FR8), but the only category list is the public C1 `/categories`, served by U4. U6 has no contract with U4, and C2 has no categories operation. | Add `GET /categories` to C2 (backed by C4/C6 category data), or state that U6 may read C1 `/categories`. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C1 `/history` | The magic-link token is a query parameter. Tokens in URLs are recorded by proxies, CDN and browser history, which conflicts with the rule that no token reaches logs. | Send the token in a POST body or an Authorization header, or require redirecting the token out of the URL on first load. Record the choice. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C1 and C2 error responses vs C4/C5 errors | Provider errors StorageUnavailable, MalwareFound and EmailServiceUnavailable have no declared HTTP mapping, and neither spec declares a 5xx or 503 answer. The photo-failure rule ("no report is created") and the 10-second retry rule depend on this mapping. C2 priority, notes and after-photo also omit 404, and after-photo omits 413. | Add a table mapping interface errors to HTTP status and `code` values, and add 503 and the missing 404 and 413 responses. | New |
| R-06 | Minor | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C1 `/reports/{trackingId}` and `/history/links` | The summary says malformed and unknown Tracking IDs both give 404, but the path schema has `minLength: 8` and no 400 is declared, so a strict validator would reject short IDs differently. Separately, `/history/links` is always 202, but behaviour when sendMagicLinkEmail fails is not stated. | Drop the schema minLength on the path (or document 404 for it). State that email failure is still answered 202 and is logged without the address. | New |
| R-07 | Minor | aidlc/spaces/default/intents/261028-civic-architecture-desig/inception/contract-design/contract-summary.md > C4 openReport errors | `DuplicateKeyReturnsOriginalResult` is listed as an error but is a success replay. C1 declares only 201 and says nothing on key lifetime or a reused key with a different body. | State that a replay returns the original 201, how long keys are kept, and the answer for a reused key with different content (for example 422). | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Manual edge check | Every edge in unit-of-work-dependency.md maps to a contract: U5-U4 C1, U6-U3 C2, U6-U2 C3, U4-U3 C4, U4-U2 C5, U3-U2 C6 and C7. | Coverage is complete. U7 correctly has none. |
| Manual spec check | The three OpenAPI blocks, the AsyncAPI block and the shared-schema blocks parse as expected, and every `$ref` resolves (Error, Category, SubmissionResult, StatusEntry, TrackingView, ReportSummary, QueuePage, QueueRow, StatusChange, ReportDetail, parameters/trackingId, securitySchemes/staffSession). | Well-formed and internally consistent. |
| Privacy check | TrackingView and ReportSummary carry no email or photo. contactEmail and photoUrl appear only in the staff ReportDetail. /history/links gives the same 202 either way. | Consistent with NFR6, NFR7 and NFR16. |
| Ownership and Q&A check | Ownership matches the Q5-A answer. The timeout, read retry, idempotency key, five send attempts and photo-before-report rules match the Q4-A answer. | Consistent. |
| Open questions | The five questions name real gaps and each names the blocked unit. | Acceptable. |

### Summary

The contract set is complete against the dependency graph and the specs are well-formed and privacy-safe. Two seams are still unimplementable as written: nothing marks a stored photo as attached to a report, and Case workflow has no way to validate a staff bearer token. Both are small additions to C6 and are worth settling at the gate.
