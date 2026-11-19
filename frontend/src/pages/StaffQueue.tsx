import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Category, formatTime, QueuePage, STATUSES } from "../api";
import { ErrorNote, StatusBadge } from "../components";

export default function StaffQueue() {
  const [data, setData] = useState<QueuePage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: "25", sort: "submittedAt" });
    if (status) p.append("status", status);
    if (category) p.append("category", category);
    api.queue(p).then((d) => { setData(d); setError(null); }).catch(setError);
  }, [page, status, category]);

  useEffect(load, [load]);
  useEffect(() => {
    api.categories().then(setCategories).catch(() => undefined);
  }, []);

  async function acknowledge(id: string) {
    setMessage("");
    try {
      await api.acknowledge(id);
      setMessage(`Report ${id} acknowledged.`);
      load();
    } catch (e) {
      setError(e);
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <main className="wide">
      <h1>Reports to triage</h1>
      <ErrorNote error={error} />
      <div role="status" className="hint">{message}</div>
      <div className="row" style={{ marginBottom: "var(--space-4)" }}>
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select id="f-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-cat">Category</label>
          <select id="f-cat" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.categoryCode} value={c.categoryCode}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {data && data.items.length === 0 ? (
        <p className="empty">No reports match. New reports will appear here.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr">Reports, oldest first</caption>
            <thead>
              <tr><th>Tracking ID</th><th>Category</th><th>Status</th><th>Priority</th><th>Submitted</th><th><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr key={r.trackingId}>
                  <td><Link to={`/staff/reports/${r.trackingId}`}>{r.trackingId}</Link></td>
                  <td>{r.category}</td>
                  <td><StatusBadge status={r.status} disputed={r.disputed} /></td>
                  <td>{r.priority}</td>
                  <td>{formatTime(r.submittedAt)}</td>
                  <td>
                    {r.status === "Submitted" && (
                      <button className="small" onClick={() => acknowledge(r.trackingId)} aria-label={`Acknowledge report ${r.trackingId}`}>Acknowledge</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <div className="pager">
          <button className="secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages} · {data.total} reports</span>
          <button className="secondary small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </main>
  );
}
