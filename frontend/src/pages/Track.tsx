import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError, formatTime, TrackingView } from "../api";
import { ErrorNote, MapLink, ProgressTracker, StatusBadge, useCategoryLabel } from "../components";

export function TrackLookup() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  function go(e: FormEvent) {
    e.preventDefault();
    if (id.trim()) nav(`/track/${encodeURIComponent(id.trim().toUpperCase())}`);
  }
  return (
    <main>
      <h1>Check on a report</h1>
      <form className="card" onSubmit={go}>
        <div className="field">
          <label htmlFor="tid">Tracking ID</label>
          <input id="tid" value={id} onChange={(e) => setId(e.target.value)} autoCapitalize="characters" autoComplete="off" />
        </div>
        <button type="submit">Find my report</button>
      </form>
    </main>
  );
}

export default function Track() {
  const { id = "" } = useParams();
  const [view, setView] = useState<TrackingView | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [disputeMsg, setDisputeMsg] = useState("");
  const categoryLabel = useCategoryLabel();

  const load = () => {
    setError(null);
    api.track(id).then(setView).catch(setError);
  };
  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function dispute() {
    try {
      await api.dispute(id);
      setDisputeMsg("Thank you. We have flagged this report so staff will look at it again.");
      load();
    } catch (e) {
      setError(e);
    }
  }

  const notFound = error instanceof ApiError && error.status === 404;
  if (notFound)
    return (
      <main>
        <h1>We could not find that report</h1>
        <p>Check the Tracking ID and try again.</p>
        <TrackLookup />
      </main>
    );

  return (
    <main>
      <h1>Your report</h1>
      <ErrorNote error={error} />
      {!view && !error && (
        <div role="status" aria-label="Loading your report">
          <div className="skeleton" style={{ width: "40%", height: 44 }} />
          <div className="skeleton" style={{ width: "100%", height: 90, marginTop: 16 }} />
          <div className="skeleton" style={{ width: "100%", height: 140, marginTop: 16 }} />
        </div>
      )}
      {view && (
        <>
          <p className="tid">{view.trackingId}</p>
          <p>
            <StatusBadge status={view.status} disputed={view.disputed} />
          </p>
          <ProgressTracker status={view.status} />
          <div className="card">
            <p><strong>{categoryLabel(view.category)}</strong> · reported {formatTime(view.submittedAt)}</p>
            <p>{view.description}</p>
            <p className="hint"><MapLink lat={view.location.latitude} lng={view.location.longitude} /> · {view.location.latitude.toFixed(5)}, {view.location.longitude.toFixed(5)}</p>
            {view.resolutionNote && (
              <div className="alert ok"><strong>How it was resolved:</strong> {view.resolutionNote}</div>
            )}
          </div>
          <h2>What has happened so far</h2>
          <ol className="timeline">
            {view.history.map((h, i) => (
              <li key={i}>
                <StatusBadge status={h.status} /> <span className="hint">{formatTime(h.changedAt)}</span>
              </li>
            ))}
          </ol>
          {view.status === "Resolved" && !view.disputed && (
            <p>
              <button className="secondary" onClick={dispute}>This is not resolved</button>
            </p>
          )}
          <div role="status">{disputeMsg}</div>
        </>
      )}
    </main>
  );
}
