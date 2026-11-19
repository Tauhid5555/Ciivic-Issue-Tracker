import { useEffect, useState } from "react";
import { api, ApiError, ApiErrorBody, mapLink, Status } from "./api";

/** The logo mark: a map pin with a check inside. Decorative where the name sits beside it. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F6F4E" />
          <stop offset="1" stopColor="#1F7A8C" />
        </linearGradient>
      </defs>
      <path d="M32 61C17 43 8 33 8 23a24 24 0 0 1 48 0c0 10-9 20-24 38z" fill="url(#logo-g)" />
      <circle cx="32" cy="23" r="14" fill="#fff" />
      <path className="logo-tick" d="M24.5 23.5l5.5 5.5 10-11" fill="none" stroke="#2F6F4E" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

let categoryCache: Promise<{ categoryCode: string; label: string }[]> | null = null;

/** Turns a category code ("pothole") into its label ("Pothole"). Falls back to the code until the list has loaded. */
export function useCategoryLabel(): (code: string) => string {
  const [labels, setLabels] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!categoryCache) categoryCache = api.categories();
    categoryCache
      .then((cs) => setLabels(Object.fromEntries(cs.map((c) => [c.categoryCode, c.label]))))
      .catch(() => { categoryCache = null; });
  }, []);
  return (code) => labels[code] ?? code.charAt(0).toUpperCase() + code.slice(1);
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`badge p-${priority.toLowerCase()}`}>{priority}</span>;
}

export function MapLink({ lat, lng, label = "View on map" }: { lat: number; lng: number; label?: string }) {
  return (
    <a className="maplink" href={mapLink(lat, lng)} target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 22c-5-6-8-9.5-8-13a8 8 0 0 1 16 0c0 3.500-3 7-8 13z" fill="currentColor" /><circle cx="12" cy="9" r="3" fill="#fff" /></svg>
      {label}<span className="sr"> (opens a map in a new tab)</span>
    </a>
  );
}

const NEXT = [
  { title: "We receive it", text: "You get a Tracking ID straight away. Keep it: it is how you check on your report.", icon: <path d="M4 13l5 5L20 6" /> },
  { title: "Staff look at it", text: "A member of staff reviews your report, sets a priority and acknowledges it.", icon: (<><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.500-4.500" /></>) },
  { title: "You can follow it", text: "Use your Tracking ID any time to see each step, from received to resolved. If it is not fixed, you can tell us.", icon: <path d="M3 12h4l2-6 4 12 2-6h6" /> },
];

/**
 * "What happens next": a slim bar under the report form. On wide screens it stays at the bottom of the window while
 * the page scrolls and comes to rest just above the footer; on small screens it is an ordinary block (it would cover
 * too much of a phone screen).
 */
export function NextSteps() {
  return (
    <section className="next" aria-labelledby="next-h">
      <h2 id="next-h">What happens after you send a report</h2>
      <ol className="next-grid">
        {NEXT.map((n) => (
          <li key={n.title} className="next-card">
            <span className="next-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{n.icon}</svg>
            </span>
            <span className="next-copy">
              <strong>{n.title}</strong>
              <span>{n.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A friendly empty state with a small drawing. */
export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 96 80" width="96" height="80" aria-hidden="true">
        <rect x="14" y="14" width="68" height="54" rx="10" fill="var(--accent-sky-soft)" />
        <path d="M14 44h20l4 8h20l4-8h20" fill="none" stroke="var(--accent-teal)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="72" cy="20" r="11" fill="var(--color-brand)" />
        <path d="M67 20l3.500 3.500L77 16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <strong>{title}</strong>
      <span className="hint">{text}</span>
    </div>
  );
}

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
