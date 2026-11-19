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
