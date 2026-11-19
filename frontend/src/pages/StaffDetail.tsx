import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatTime, PRIORITIES, ReportDetail, STATUSES } from "../api";
import { ErrorNote, fieldError, StatusBadge } from "../components";

export default function StaffDetail() {
  const { id = "" } = useParams();
  const [r, setR] = useState<ReportDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [toStatus, setToStatus] = useState("");

  useEffect(() => {
    api.detail(id).then(setR).catch(setError);
  }, [id]);

  useEffect(() => {
    if (!r?.photoUrl) return;
    let url: string | null = null;
    api.photoBlobUrl(r.photoUrl).then((u) => { url = u; setPhoto(u); }).catch(() => undefined);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [r?.photoUrl]);

  async function act(fn: () => Promise<ReportDetail | void>) {
    setError(null);
    try {
      const next = await fn();
      if (next) setR(next);
      else setR(await api.detail(id));
    } catch (e) {
      setError(e);
    }
  }

  function onStatus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      toStatus,
      reason: String(f.get("reason") || "") || undefined,
      resolutionNote: String(f.get("resolutionNote") || "") || undefined,
      duplicateOfTrackingId: String(f.get("dup") || "") || undefined,
    };
    act(() => api.changeStatus(id, body));
  }

  function onNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("text") || "").trim();
    if (!text) return;
    act(() => api.addNote(id, text)).then(() => form.reset());
  }

  if (!r) return <main className="wide"><ErrorNote error={error} /><p role="status">Loading…</p></main>;

  return (
    <main className="wide">
      <p><Link to="/staff/queue">← Back to the queue</Link></p>
      <h1>Report <span className="tid">{r.trackingId}</span></h1>
      <ErrorNote error={error} />
      <div className="grid2">
        <section>
          <p><StatusBadge status={r.status} disputed={r.disputed} /> · {r.category} · priority {r.priority}</p>
          <div className="card">
            <p>{r.description}</p>
            <p className="hint">Location: {r.location.latitude.toFixed(5)}, {r.location.longitude.toFixed(5)} · Reported {formatTime(r.submittedAt)}</p>
            <p className="hint">Contact: {r.contactEmail ?? "none given"}</p>
            {r.resolutionNote && <div className="alert ok"><strong>Resolution:</strong> {r.resolutionNote}</div>}
          </div>
          {photo ? <img className="photo" src={photo} alt="Photo supplied by the citizen" /> : r.photoUrl && <p className="hint">Loading photo…</p>}

          <h2>History</h2>
          <ol className="timeline">
            {r.history.map((h) => (
              <li key={h.sequence}>
                <StatusBadge status={h.toStatus} /> <span className="hint">{formatTime(h.changedAt)} · {h.actorType === "system" ? "system" : "staff"}</span>
                {h.reason && <div>{h.reason}</div>}
              </li>
            ))}
          </ol>
        </section>

        <aside>
          <h2 style={{ marginTop: 0 }}>Actions</h2>
          {r.status === "Submitted" && (
            <p><button onClick={() => act(() => api.acknowledge(id))}>Acknowledge</button></p>
          )}

          <div className="field">
            <label htmlFor="prio">Priority</label>
            <select id="prio" value={r.priority} onChange={(e) => act(() => api.setPriority(id, e.target.value))}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <form className="card" onSubmit={onStatus}>
            <div className="field">
              <label htmlFor="to">Move to</label>
              <select id="to" value={toStatus} onChange={(e) => setToStatus(e.target.value)} required>
                <option value="" disabled>Choose a status</option>
                {STATUSES.filter((s) => s !== r.status).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="reason">Reason (needed to move a report back)</label>
              <input id="reason" name="reason" />
              <span className="err">{fieldError(error, "reason")}</span>
            </div>
            {toStatus === "Resolved" && (
              <div className="field">
                <label htmlFor="rn">Resolution note (required)</label>
                <textarea id="rn" name="resolutionNote" required />
                <span className="err">{fieldError(error, "resolutionNote")}</span>
              </div>
            )}
            {toStatus === "Closed-Duplicate" && (
              <div className="field">
                <label htmlFor="dup">Tracking ID of the original report</label>
                <input id="dup" name="dup" required />
                <span className="err">{fieldError(error, "duplicateOfTrackingId")}</span>
              </div>
            )}
            <button type="submit" disabled={!toStatus}>Update status</button>
          </form>

          <h2>Internal notes</h2>
          <form onSubmit={onNote}>
            <div className="field">
              <label htmlFor="note">Add a note (staff only)</label>
              <textarea id="note" name="text" maxLength={2000} />
            </div>
            <button className="secondary" type="submit">Add note</button>
          </form>
          <ul>
            {r.notes.map((n) => <li key={n.noteId}>{n.text} <span className="hint">{formatTime(n.createdAt)}</span></li>)}
          </ul>
        </aside>
      </div>
    </main>
  );
}
