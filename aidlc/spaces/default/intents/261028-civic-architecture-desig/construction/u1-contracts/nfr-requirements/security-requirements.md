# Security Requirements — U1 Shared contracts (`u1-contracts`, spec)

U1 holds the written agreements (C1 to C7 in `contract-summary.md`). It has no runtime, so its security requirements are about what the contracts must say and forbid. The units that implement a contract carry the matching runtime requirements in their own documents. Detailed requirement IDs inherit the inception NFR ID and add a sub-number.

Some checks below cannot pass against `contract-summary.md` as approved in Contract Design. Each such check names a **contract change** (CC-1 to CC-5, listed in full under "Contract changes this unit needs"). The requirement states the target; the contract change is what brings the spec into line, and it needs your agreement.

## Requirements

| ID | Requirement | Pass / fail check | Contract |
|---|---|---|---|
| NFR5.1 | The staff contract (C2) must carry, for every status change, the time, the status moved from and to, the reason, and either the acting staff id or the actor type `system`. | The `StatusChange` schema in C2 lists `changedAt`, `fromStatus`, `toStatus`, `reason`, `actorType` and `actorStaffId`, and its `required` list includes `sequence`, `toStatus`, `changedAt` and `actorType` (CC-5 adds the `required` list). | C2 |
| NFR6.1 | No contract may require a citizen to sign in or hold an account. The citizen-identifying inputs are limited to a short, named list: the optional `email` on submission, the `email` on a history-link request, and the derived `clientKeyHash` on a dispute. | No operation in C1 has a security scheme. The only citizen-identifying input names anywhere in C1 and C4 are `email`, `contactEmail` and `clientKeyHash`. `clientKeyHash` is a one-way hash of the client address, is never returned to any caller, and is stored for abuse limiting only. | C1, C4 |
| NFR7.1 | The public tracking answer must carry the exact pin and must not carry the citizen photo, any photo link, or the contact email. | The `TrackingView` schema in C1 has `location` and no `photoUrl`, `afterPhotoUrl` or `contactEmail`. A separate build check, the **forbidden-name check**, fails if any of those names is added to any C1 response. | C1, C4 |
| NFR8.1 | Every staff operation in C2 must require a signed-in staff session, and C3 must require a password step and a second-factor step before it issues one. | C2 declares `security: staffSession` at the document level; C3 issues `accessToken` only from `/sign-in/second-factor`. | C2, C3 |
| NFR8.2 | Case workflow must be able to turn the bearer token on a C2 request into a staff identity, and must refuse an expired, signed-out or deactivated session on that same call, so deactivation takes effect at once (FR16). | C6 has an operation that takes an `accessToken` and returns `{ staffId, displayName, active }` or an invalid-session error (CC-2). | C2, C6 |
| NFR14.1 | The fields that may carry an email are exactly the ones in the **personal-data field list** below. The list lives in U1, next to the specs, and a build check fails when a contract adds an email-bearing field that is not in it. | The list below is complete against C1 to C7 as approved. | C1 to C7 |
| NFR14.2 | The status-changed event field `recipientEmail` must be optional and removable, so retention can strip it with the rest of a closed report's personal data. | `recipientEmail` is not in the C7 event's `required` list. | C7 |
| NFR14.3 | Values that act as a credential must stay out of logs, including the ones that travel in a web address. Access logs redact every path segment and query value named in the **token-carrier list** below. | The token-carrier list below is complete against C1 to C7 as approved, and the contract check fails when a contract adds a token-bearing field that is not in it. | C1, C3, C5 |
| NFR15.1 | The submission operation must carry an `Idempotency-Key`, and must declare `429` for rate limiting and `413`, `415` and `422` for photo problems. Screening for automated abuse is the runtime duty of U4; the contract's part is to declare the `429` and `422` answers. | `POST /reports` in C1 declares the header and those four responses. The behaviour "no report is created when the photo fails a check" is stated in the contract rules and is tested in U4, not read from the OpenAPI file. | C1 |
| NFR15.2 | The photo-store operation must state that it checks type and size, scans for malware and strips location metadata before storing, and must name an error for each failure. | C5 `storePhoto` lists `UnsupportedType`, `TooLarge`, `MalwareFound` and `StorageUnavailable`, and its note names the metadata stripping. | C5, C6 |
| NFR16.1 | A Tracking ID that is malformed and one that does not exist must give the same `404` answer on every operation that takes a Tracking ID in its path. | No Tracking ID path parameter in C1 or C2 sets a length or pattern rule that makes a short ID fail validation before the lookup (CC-4 removes `minLength: 8` from C1). | C1 |
| NFR16.2 | The magic-link token must not appear in a request address. The emailed link carries the token in the address fragment, which browsers do not send to a server; the Citizen Portal reads it from the fragment and sends it in a request body. | `GET /history?token=` is replaced by a `POST` that takes the token in its body (CC-1). The link URL in C5 `sendMagicLinkEmail` puts the token after `#`. | C1, C5 |
| NFR16.3 | The three C1 operations that take a Tracking ID (tracking view, dispute, and any future one) must share one rate limit and must each declare `429`. Existence of a report is revealed by the tracking view by design (it returns `200`); the protection is the length and alphabet of the ID (FR2.2) and this rate limit, not a different answer from the dispute operation. | `GET /reports/{trackingId}` and `POST /reports/{trackingId}/dispute` in C1 both declare `429`, and the contract rules state that they count against one limit per client. | C1 |

## Personal-data field list (NFR14.1)

| Contract | Field | Direction |
|---|---|---|
| C1 | `email` on `POST /reports` | in |
| C1 | `email` on `POST /history/links` | in |
| C2 | `contactEmail` in `ReportDetail` | out, staff only |
| C3 | `email` on `POST /sign-in` | in |
| C3 | `email` in the `/me` answer | out, staff only |
| C4 | `contactEmail` in `openReport` | in |
| C4 | `email` in `listReportsForEmail` | in |
| C5 | `recipientEmail` in `sendMagicLinkEmail` | in |
| C7 | `recipientEmail` in the status-changed event | optional |

Report descriptions are personal data too (they may name a person or a home) and are never written to logs (ADR-005). They are covered by the logging rule in the contract summary, not by the email list.

## Token-carrier list (NFR14.3)

| Contract | Carrier |
|---|---|
| C1 | the magic-link token in the request body of the replacement for `GET /history` (CC-1) |
| C3 | `accessToken` in the second-factor answer |
| C3 | `challengeId` in the sign-in answer and second-factor request |
| C3 | the `{token}` path segment of `POST /invitations/{token}/accept` |
| C5 | `linkUrl` in `sendMagicLinkEmail` (it contains the magic-link token after `#`) |

## Contract changes this unit needs

These are changes to `contract-summary.md`, found while writing the requirements above. Contract Design was approved with the first three noted by its own reviewer. None changes a decision you made; each makes a check above passable.

| # | Change | Needed by |
|---|---|---|
| CC-1 | Replace `GET /history?token=` with a `POST` that takes the token in its body, and have the emailed link carry the token after `#` | NFR16.2, NFR14.3 |
| CC-2 | Add a session-check operation to C6 that takes an `accessToken` and returns the staff identity or an invalid-session error | NFR8.2 |
| CC-3 | Add an operation that marks a stored photo as attached to a report, called inside `openReport`, so the 24-hour photo cleanup can tell attached from unattached photos | ADR-005 (from the Contract Design review) |
| CC-4 | Remove `minLength: 8` from the Tracking ID path parameters in C1 | NFR16.1 |
| CC-5 | Add a `required` list to the `StatusChange` schema in C2 | NFR5.1 |

## Threat considerations

- Anonymous submission is the largest abuse risk. The contract limits it with the one-time key, rate-limit answers and photo-check answers; the actual rate limits and bot screening are set in U4.
- Tracking ID guessing is limited by the ID's length and alphabet and by one shared rate limit (NFR16.3).
- A deactivated staff account must stop working at once. C6 already checks a staff id on every action; what is missing is the step that turns the C2 bearer token into a staff id (NFR8.2, CC-2).

## Sources

- `requirements.md` (NFR5, NFR6, NFR7, NFR8, NFR14, NFR15, NFR16; FR2.2, FR16) [requirements]
- `contract-summary.md` (C1 to C7, rules that apply to every contract) [contract-summary]
- `nfr-requirements-questions.md` (Q1 to Q5) [Q1]–[Q5]

## Assumptions & Open Questions

- Assumption: NFR14.3, NFR16.2 and NFR16.3 are added here from the contract reviewers' findings and are not stated in any source document; they need your confirmation. [assumption]
- Assumption: the fragment-based magic-link design in NFR16.2 is one workable option; the alternative is to keep the token in the address and accept that proxies may log it. Please choose.
- Open question: CC-1 to CC-5 must be made in `contract-summary.md` after you agree. Contract Design is already approved, so the change needs a decision from you on whether to reopen that stage or record the edits here.
