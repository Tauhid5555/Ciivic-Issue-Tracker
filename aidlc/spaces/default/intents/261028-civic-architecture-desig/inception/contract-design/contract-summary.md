# Contract Summary — Civic Issue Tracker

Contracts at every seam in the unit dependency graph (`unit-of-work-dependency.md`). Your choices from `contract-design-questions.md`: only our own two web screens call the backend [Q1-A]; JSON over HTTPS from the screens, direct calls between backend modules, one queued status-changed event [Q2-A]; versioned addresses with add-freely, break-by-agreement [Q3-A]; the failure rules below [Q4-A]; each providing unit owns its contract and U1 holds the specs [Q5-A].

The contract is written as OpenAPI so it does not depend on a backend framework; the technology stack is not decided in this stage. Requirement IDs follow `requirements.md`; units follow `unit-of-work.md`.

## Contracts

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---|---|---|---|
| C1 | U4 Public-side backend | U5 Citizen Portal | REST, JSON over HTTPS (OpenAPI) | U4 |
| C2 | U3 Case workflow | U6 Authority Dashboard | REST, JSON over HTTPS (OpenAPI) | U3 |
| C3 | U2 Platform services (StaffAccess) | U6 Authority Dashboard | REST, JSON over HTTPS (OpenAPI) | U2 |
| C4 | U3 Case workflow | U4 Public-side backend | In-process interface inside the one backend service (shared schema) | U3 |
| C5 | U2 Platform services (EvidenceRetention, Notifications) | U4 Public-side backend | In-process interface (shared schema) | U2 |
| C6 | U2 Platform services (StaffAccess, EvidenceRetention) | U3 Case workflow | In-process interface (shared schema) | U2 |
| C7 | U3 Case workflow (publisher) | U2 Platform services (Notifications) | Queued event (AsyncAPI) | U3 |

No outside consumer exists in v1 [Q1-A], so there is no public API for partners. U7 Infrastructure uses names from these contracts but has no contract of its own. All specs are stored in U1 [Q5-A].

## Rules that apply to every contract

- **Failures:** a screen request that takes more than 10 seconds is treated as failed and the screen offers a retry. Reads are retried once automatically; actions that change data are not retried automatically. [Q4-A]
- **One-time key:** submitting a report carries an `Idempotency-Key` header, so a double tap or retry never creates two reports. [Q4-A]
- **Photo before report:** if the photo fails a check or cannot be stored, no report is created. [Q4-A]
- **Errors:** every error answer uses the same body: `code` (stable text), `message` (plain language for the person) and `fieldErrors` (a list, empty when none).
- **Privacy in answers:** answers never carry `contactEmail` back to the public, never carry the citizen photo to anyone but signed-in staff, and never reveal whether an email or Tracking ID exists (NFR6, NFR7, NFR16).
- **Logs:** no contract field holding an email, description or token is written to application logs (ADR-005, ADR-006).

## C1 — Citizen Portal to Public-side backend (U5 to U4)

Covers FR1 to FR4, FR13; NFR1, NFR15, NFR16.

```yaml
openapi: 3.0.3
info:
  title: Civic Issue Tracker public API
  version: 1.0.0
servers:
  - url: /v1
paths:
  /categories:
    get:
      summary: The fixed list of categories (FR15.1)
      responses:
        "200":
          description: Active categories
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Category" }
  /reports:
    post:
      summary: Submit a report without an account (FR1, FR2)
      parameters:
        - in: header
          name: Idempotency-Key
          required: true
          schema: { type: string, minLength: 16, maxLength: 64 }
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [category, description, latitude, longitude, photo]
              properties:
                category: { type: string }
                description: { type: string, minLength: 1, maxLength: 2000 }
                latitude: { type: number, minimum: -90, maximum: 90 }
                longitude: { type: number, minimum: -180, maximum: 180 }
                email: { type: string, format: email, description: Optional (FR1.5) }
                photo: { type: string, format: binary, description: JPEG, PNG or HEIC up to 10 MB (FR1.4) }
      responses:
        "201":
          description: Report opened
          content:
            application/json:
              schema: { $ref: "#/components/schemas/SubmissionResult" }
        "400": { $ref: "#/components/responses/Error" }
        "413": { $ref: "#/components/responses/Error" }
        "415": { $ref: "#/components/responses/Error" }
        "422": { $ref: "#/components/responses/Error" }
        "429": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}:
    get:
      summary: Public tracking view (FR3)
      parameters:
        - { in: path, name: trackingId, required: true, schema: { type: string, minLength: 8 } }
      responses:
        "200":
          description: The tracking view
          content:
            application/json:
              schema: { $ref: "#/components/schemas/TrackingView" }
        "404": { $ref: "#/components/responses/Error" }
        "429": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}/dispute:
    post:
      summary: Mark a Resolved report "Not Resolved" (FR13)
      parameters:
        - { in: path, name: trackingId, required: true, schema: { type: string } }
      responses:
        "204": { description: Dispute recorded and the report flagged for staff }
        "404": { $ref: "#/components/responses/Error" }
        "409": { description: The report is not Resolved, content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
        "429": { $ref: "#/components/responses/Error" }
  /history/links:
    post:
      summary: Ask for a magic link to see all reports for an email (FR4.1)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email: { type: string, format: email }
      responses:
        "202": { description: Always the same answer, whether or not the email has reports }
        "429": { $ref: "#/components/responses/Error" }
  /history:
    get:
      summary: Reports linked to the email behind a magic link (FR4)
      parameters:
        - { in: query, name: token, required: true, schema: { type: string } }
      responses:
        "200":
          description: Report summaries
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/ReportSummary" }
        "401": { $ref: "#/components/responses/Error" }
        "429": { $ref: "#/components/responses/Error" }
components:
  responses:
    Error:
      description: Error
      content:
        application/json:
          schema: { $ref: "#/components/schemas/Error" }
  schemas:
    Error:
      type: object
      required: [code, message, fieldErrors]
      properties:
        code: { type: string }
        message: { type: string }
        fieldErrors:
          type: array
          items:
            type: object
            properties:
              field: { type: string }
              message: { type: string }
    Category:
      type: object
      required: [categoryCode, label]
      properties:
        categoryCode: { type: string }
        label: { type: string }
    SubmissionResult:
      type: object
      required: [trackingId, submittedAt, confirmationText, emailNotice]
      properties:
        trackingId: { type: string, minLength: 8 }
        submittedAt: { type: string, format: date-time }
        confirmationText: { type: string }
        emailNotice:
          type: string
          enum: [acknowledgement-will-be-sent, no-email-no-notifications]
          description: Drives the no-email warning (FR2.4)
    StatusEntry:
      type: object
      required: [status, changedAt]
      properties:
        status: { type: string, enum: [Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate] }
        changedAt: { type: string, format: date-time }
    TrackingView:
      type: object
      required: [trackingId, category, submittedAt, status, history, description, location]
      properties:
        trackingId: { type: string }
        category: { type: string }
        submittedAt: { type: string, format: date-time }
        status: { type: string }
        disputed: { type: boolean }
        history: { type: array, items: { $ref: "#/components/schemas/StatusEntry" } }
        description: { type: string }
        location:
          type: object
          properties:
            latitude: { type: number }
            longitude: { type: number }
        resolutionNote: { type: string, nullable: true }
    ReportSummary:
      type: object
      properties:
        trackingId: { type: string }
        category: { type: string }
        status: { type: string }
        submittedAt: { type: string, format: date-time }
```

The tracking view carries no photo field and no email (FR3.4). Unknown and malformed Tracking IDs give the same `404` so lookups cannot be used to guess IDs (NFR16).

## C2 — Authority Dashboard to Case workflow (U6 to U3)

Covers FR6.2, FR7 to FR12, FR14; NFR2, NFR5. Every call needs a signed-in staff session from C3.

```yaml
openapi: 3.0.3
info:
  title: Civic Issue Tracker staff API (case workflow)
  version: 1.0.0
servers:
  - url: /v1/staff
security:
  - staffSession: []
paths:
  /reports:
    get:
      summary: Triage queue (FR7, FR8)
      parameters:
        - { in: query, name: status, schema: { type: array, items: { type: string } } }
        - { in: query, name: category, schema: { type: array, items: { type: string } } }
        - { in: query, name: zone, schema: { type: string } }
        - { in: query, name: text, schema: { type: string } }
        - { in: query, name: from, schema: { type: string, format: date } }
        - { in: query, name: to, schema: { type: string, format: date } }
        - { in: query, name: disputed, schema: { type: boolean } }
        - { in: query, name: sort, schema: { type: string, enum: [submittedAt, priority, category, updatedAt] } }
        - { in: query, name: page, schema: { type: integer, minimum: 1 } }
        - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100 } }
      responses:
        "200":
          description: One page of queue rows
          content:
            application/json:
              schema: { $ref: "#/components/schemas/QueuePage" }
        "401": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}:
    get:
      summary: Report detail, including the citizen photo through a short-lived link (FR3.4)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      responses:
        "200":
          description: The full report
          content:
            application/json:
              schema: { $ref: "#/components/schemas/ReportDetail" }
        "404": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}/acknowledge:
    post:
      summary: One-step Acknowledge with the default priority (FR9.1)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      responses:
        "200": { description: Updated report, content: { application/json: { schema: { $ref: "#/components/schemas/ReportDetail" } } } }
        "409": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}/priority:
    put:
      summary: Set priority (FR10)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [priority]
              properties:
                priority: { type: string, enum: [Low, Medium, High, Urgent] }
      responses:
        "200": { description: Updated report, content: { application/json: { schema: { $ref: "#/components/schemas/ReportDetail" } } } }
  /reports/{trackingId}/notes:
    post:
      summary: Add a staff-only internal note (FR9.2)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string, minLength: 1, maxLength: 2000 }
      responses:
        "201": { description: Note added }
  /reports/{trackingId}/status:
    post:
      summary: Move a report to another status (FR11, FR12, FR14)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [toStatus]
              properties:
                toStatus: { type: string, enum: [Submitted, Acknowledged, In Progress, Resolved, Closed-Duplicate] }
                reason: { type: string, description: Required for any backward move and for reopening (FR11.2, FR14.1) }
                resolutionNote: { type: string, description: Required when toStatus is Resolved (FR11.3) }
                duplicateOfTrackingId: { type: string, description: Required when toStatus is Closed-Duplicate (FR11.4) }
      responses:
        "200": { description: Updated report, content: { application/json: { schema: { $ref: "#/components/schemas/ReportDetail" } } } }
        "409": { description: Move not allowed by the status rules, content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
        "422": { $ref: "#/components/responses/Error" }
  /reports/{trackingId}/after-photo:
    post:
      summary: Attach the optional after photo (FR12.1)
      parameters: [ { $ref: "#/components/parameters/trackingId" } ]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [photo]
              properties:
                photo: { type: string, format: binary }
      responses:
        "204": { description: Stored }
        "415": { $ref: "#/components/responses/Error" }
  /zones:
    get:
      summary: Zones for the filter (FR8.1; list not yet defined, OQ-A7)
      responses:
        "200": { description: Zones, content: { application/json: { schema: { type: array, items: { type: object, properties: { zoneCode: { type: string }, label: { type: string } } } } } } }
components:
  securitySchemes:
    staffSession:
      type: http
      scheme: bearer
  parameters:
    trackingId:
      in: path
      name: trackingId
      required: true
      schema: { type: string }
  responses:
    Error:
      description: Error
      content:
        application/json:
          schema: { $ref: "#/components/schemas/Error" }
  schemas:
    Error:
      type: object
      required: [code, message, fieldErrors]
      properties:
        code: { type: string }
        message: { type: string }
        fieldErrors: { type: array, items: { type: object, properties: { field: { type: string }, message: { type: string } } } }
    QueueRow:
      type: object
      properties:
        trackingId: { type: string }
        category: { type: string }
        status: { type: string }
        priority: { type: string }
        disputed: { type: boolean }
        submittedAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
    QueuePage:
      type: object
      required: [items, page, pageSize, total]
      properties:
        items: { type: array, items: { $ref: "#/components/schemas/QueueRow" } }
        page: { type: integer }
        pageSize: { type: integer }
        total: { type: integer }
    StatusChange:
      type: object
      properties:
        sequence: { type: integer }
        fromStatus: { type: string, nullable: true }
        toStatus: { type: string }
        reason: { type: string, nullable: true }
        changedAt: { type: string, format: date-time }
        actorType: { type: string, enum: [staff, system] }
        actorStaffId: { type: string, nullable: true }
    ReportDetail:
      type: object
      properties:
        trackingId: { type: string }
        category: { type: string }
        description: { type: string }
        location: { type: object, properties: { latitude: { type: number }, longitude: { type: number } } }
        zone: { type: string, nullable: true }
        contactEmail: { type: string, nullable: true }
        status: { type: string }
        priority: { type: string }
        disputed: { type: boolean }
        resolutionNote: { type: string, nullable: true }
        duplicateOfTrackingId: { type: string, nullable: true }
        photoUrl: { type: string, nullable: true, description: Short-lived link, staff only }
        afterPhotoUrl: { type: string, nullable: true }
        history: { type: array, items: { $ref: "#/components/schemas/StatusChange" } }
        notes: { type: array, items: { type: object, properties: { noteId: { type: string }, text: { type: string }, createdAt: { type: string, format: date-time }, authorStaffId: { type: string } } } }
```

Status changes append their history entry in the same step (ADR-002); the call returns `409` for a move the rules do not allow, such as skipping a step forward.

## C3 — Authority Dashboard to Staff access (U6 to U2)

Covers FR16; NFR8.

```yaml
openapi: 3.0.3
info:
  title: Civic Issue Tracker staff API (sign-in)
  version: 1.0.0
servers:
  - url: /v1/staff
paths:
  /sign-in:
    post:
      summary: First step, password (FR16, NFR8)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string, format: password }
      responses:
        "200": { description: Second factor needed, content: { application/json: { schema: { type: object, required: [challengeId], properties: { challengeId: { type: string } } } } } }
        "401": { description: Same answer for wrong password and unknown or deactivated account }
        "429": { description: Too many attempts }
  /sign-in/second-factor:
    post:
      summary: Second step, code from the second factor
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [challengeId, code]
              properties:
                challengeId: { type: string }
                code: { type: string }
      responses:
        "200": { description: Signed in, content: { application/json: { schema: { type: object, required: [accessToken, expiresAt], properties: { accessToken: { type: string }, expiresAt: { type: string, format: date-time } } } } } }
        "401": { description: Code not accepted }
  /sign-out:
    post:
      summary: End the session
      responses:
        "204": { description: Signed out }
  /me:
    get:
      summary: Who is signed in (display name for the account menu)
      responses:
        "200": { description: The signed-in account, content: { application/json: { schema: { type: object, properties: { staffId: { type: string }, displayName: { type: string }, email: { type: string } } } } } }
        "401": { description: No valid session }
  /invitations/{token}/accept:
    post:
      summary: Accept an invitation, set a password and enrol the second factor
      parameters:
        - { in: path, name: token, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [password]
              properties:
                password: { type: string, format: password }
      responses:
        "200": { description: Account activated, second-factor enrolment details returned }
        "410": { description: Invitation expired or already used }
```

Deactivating an account makes its session fail at once with `401`; the account record stays so history still names the actor (FR16, ADR-002).

## C4 — Public-side backend to Case workflow (U4 to U3)

In-process interface inside the one backend service.

```yaml shared-schema
interface: CaseWorkflowForPublic
operations:
  - name: openReport
    input: { category, description, latitude, longitude, contactEmail?, photoId, idempotencyKey }
    output: { trackingId, submittedAt }
    errors: [UnknownCategory, DuplicateKeyReturnsOriginalResult]
    note: Creates the Report and its first StatusChange in one step; asks Notifications for the acknowledgement email through the C7 event.
  - name: getTrackingView
    input: { trackingId }
    output: { trackingId, category, submittedAt, status, disputed, history[], description, latitude, longitude, resolutionNote? }
    errors: [NotFound]
    note: Never returns contactEmail or photo references.
  - name: listReportsForEmail
    input: { email }
    output: [ { trackingId, category, status, submittedAt } ]
  - name: recordDispute
    input: { trackingId, clientKeyHash }
    output: { disputedAt }
    errors: [NotFound, NotResolved]
    note: Sets the dispute flag only; the status does not change (FR13.1, ADR-003).
  - name: listCategories
    input: {}
    output: [ { categoryCode, label } ]
```

## C5 — Public-side backend to Platform services (U4 to U2)

```yaml shared-schema
interface: PlatformServicesForPublic
operations:
  - name: storePhoto
    input: { bytes, declaredContentType, kind: citizen }
    output: { photoId }
    errors: [UnsupportedType, TooLarge, MalwareFound, StorageUnavailable]
    note: Checks type and size, scans for malware and strips location metadata before storing (FR1.4, NFR15). A photo not attached to a report within 24 hours is deleted (ADR-005).
  - name: sendMagicLinkEmail
    input: { recipientEmail, linkUrl, expiresAt }
    output: { notificationId }
    errors: [EmailServiceUnavailable]
    note: Called directly because the citizen is waiting (ADR-006). The magic-link token is created and stored hashed by CitizenAccess, never by Notifications.
```

## C6 — Case workflow to Platform services (U3 to U2)

```yaml shared-schema
interface: PlatformServicesForCaseWorkflow
operations:
  - name: assertActiveStaff
    input: { staffId }
    output: { active: boolean, displayName }
    errors: [UnknownStaff]
    note: Called on every staff action so a deactivated account stops at once (FR16).
  - name: storeAfterPhoto
    input: { bytes, declaredContentType }
    output: { photoId }
    errors: [UnsupportedType, TooLarge, MalwareFound, StorageUnavailable]
  - name: getStaffPhotoUrl
    input: { photoId, staffId }
    output: { url, expiresAt }
    note: Short-lived link; the public never receives one (FR3.4).
  - name: deletePhoto
    input: { photoId }
    output: { deleted: boolean }
    note: Used by the retention purge; deleting an already deleted photo succeeds (FR17.1).
```

## C7 — Status-changed event (U3 to U2)

```yaml
asyncapi: 2.6.0
info:
  title: Civic Issue Tracker events
  version: 1.0.0
channels:
  report.status-changed:
    publish:
      summary: Published by Case workflow when a report is opened or changes status
      message:
        name: StatusChanged
        payload:
          type: object
          required: [eventId, kind, trackingId, toStatus, changedAt, trackingUrl]
          properties:
            eventId: { type: string, description: Unique; the consumer ignores a second copy }
            kind: { type: string, enum: [acknowledgement, status-change] }
            trackingId: { type: string }
            category: { type: string }
            toStatus: { type: string }
            changedAt: { type: string, format: date-time }
            recipientEmail: { type: string, format: email, description: Absent when the citizen gave no email; then nothing is sent (FR5.1) }
            trackingUrl: { type: string }
```

The event is written in the same step as the status change, so a saved change can never lose its event (ADR-006). Delivery is at least once; the consumer ignores a repeated `eventId`. A failed send is retried with growing pauses, up to 5 attempts, then recorded as failed [Q4-A]. The `recipientEmail` field is personal data and is removed with the rest of a closed report's personal data (ADR-005).

## Contract ownership rules

- The providing unit owns its contract: U4 owns C1, U3 owns C2, C4 and C7, U2 owns C3, C5 and C6. U1 holds every spec so consumers read from one place. [Q5-A]
- Adding an optional field, a new operation or a new allowed value is always safe; consumers ignore fields they do not know. [Q3-A]
- Removing or renaming anything, making an optional field required, or narrowing a value list is a breaking change. It needs agreement from the owner and every consuming unit, and a new version (`/v2` for the screens; a renamed interface or event for the in-process and queued contracts). [Q3-A]
- A change is proposed by the owner and reviewed by its consumers before it is merged into U1.
- Web screens ship in step with the backend during the pilot, so two versions are never live at once; the version number still travels in the address so that rule can change later.

## Open questions

| Contract | Question | Blocks |
|---|---|---|
| C2 | The prototype in `wds-output` shows a bulk-acknowledge screen, but `requirements.md` (FR9.1) describes one Acknowledge per row. Is bulk acknowledge in v1? If yes, a bulk operation is added to C2. | U3, U6 |
| C3 | FR16 says staff are invited by an administrator, but no screen or role for that is in the requirements. How are invitations created in v1 (a deployment task, or an administrator screen)? | U2, U6 |
| C2 | The zone list is not defined (OQ-A7). `GET /zones` returns whatever is configured. | U3 |
| C1, C4 | Whether the after photo is public (OQ-A1). Today it is staff-only: no public photo field exists in C1. | U4, U5 |
| C1 | Whether the exact pin should be rounded for the public view (OQ-A2). Today the exact position is returned (FR3.3). | U4 |

## Sources

- `unit-of-work.md` (U1 to U7, kinds, components) [unit-of-work]
- `unit-of-work-dependency.md` (edges, integration points) [unit-of-work-dependency]
- `components.md` (components, entities, interactions) [components]
- `decisions.md` (ADR-001 to ADR-006) [components]
- `requirements.md` (FR1 to FR18, NFR1 to NFR16, OQ-A1 to OQ-A8) [requirements]
- `contract-design-questions.md` (Q1 to Q5) [Q1]–[Q5]
- `wds-output/P-prototype` (bulk-acknowledge screen) [assumption]

## Assumptions & Open Questions

- Assumptions: the exact paths, field lengths and the 10-second timeout are design choices made here from your answers and need your confirmation at the gate; the bulk-acknowledge screen in the prototype is treated as not required until you decide otherwise.
- Open questions: the five rows in the table above, and OQ-A1 to OQ-A8 from `requirements.md`, which carry forward.
