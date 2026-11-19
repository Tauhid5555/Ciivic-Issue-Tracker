import { ApiError, ApiErrorBody, Status } from "./api";

const statusClass = (s: string) => "s-" + s.toLowerCase().replace(/\s+/g, "-");

export function StatusBadge({ status, disputed }: { status: Status | string; disputed?: boolean }) {
  return (
    <>
      <span className={`badge ${statusClass(status)}`}>{status}</span>
      {disputed && <span className="badge disputed">Disputed</span>}
    </>
  );
}

const STEPS = ["Submitted", "Acknowledged", "In Progress", "Resolved"] as const;

/** A step tracker for a citizen's report. The line fills up to the current step when the page opens. */
export function ProgressTracker({ status }: { status: string }) {
  const current = STEPS.indexOf(status as (typeof STEPS)[number]);
  if (current < 0) return null; // Closed-Duplicate is not on this path; the badge says it.
  const fill = (current / (STEPS.length - 1)) * 100;
  return (
    <ol className="steps" aria-label={`Progress: step ${current + 1} of ${STEPS.length}, ${status}`} style={{ ["--fill" as string]: `${fill}%` }}>
      {STEPS.map((s, i) => (
        <li key={s} className={i < current ? "done" : i === current ? "now" : ""} style={{ ["--i" as string]: i }} aria-current={i === current ? "step" : undefined}>
          <span className="dot" aria-hidden="true">{i < current ? "✓" : ""}</span>
          <span className="step-label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** Errors are announced to assistive technology as they appear. */
export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return <div role="alert" aria-live="assertive" />;
  const message = error instanceof ApiError ? error.body.message : "Something went wrong. Please try again.";
  return (
    <div role="alert" aria-live="assertive" className="alert error">
      {message}
    </div>
  );
}

export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const body: ApiErrorBody = error.body;
  return body.fieldErrors.find((f) => f.field === field)?.message;
}
