import { ReactNode, useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api, ApiError, getToken, setToken } from "./api";
import { Logo } from "./components";
import StaffDetail from "./pages/StaffDetail";
import StaffQueue from "./pages/StaffQueue";
import StaffSignIn from "./pages/StaffSignIn";
import Submit from "./pages/Submit";
import Track, { TrackLookup } from "./pages/Track";

function Shell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const signedIn = !!getToken();
  async function out() {
    try { await api.signOut(); } catch { /* the session may already be gone */ }
    setToken(null);
    nav("/staff");
  }
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="top-inner">
          <Link className="brand" to="/"><Logo /><span>Civic Issue Tracker</span></Link>
          <nav aria-label="Main">
            <Link to="/">Report a problem</Link>
            <Link to="/track">Check a report</Link>
            {signedIn ? (
              <>
                <Link to="/staff/queue">Staff queue</Link>
                <button className="secondary small" onClick={out}>Sign out</button>
              </>
            ) : (
              <Link to="/staff">Staff sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <div id="main" tabIndex={-1}>{children}</div>
      <footer className="foot">
        <div className="foot-inner">
          <div className="foot-brand">
            <span className="foot-name"><Logo size={22} /><strong>Civic Issue Tracker</strong></span>
            <span className="hint">A pilot service for reporting local problems in Dhaka.</span>
          </div>
          <nav aria-label="Footer">
            <Link to="/">Report a problem</Link>
            <Link to="/track">Check a report</Link>
            <Link to="/staff">Staff sign in</Link>
          </nav>
          <p className="foot-note">
            Maps and place search are provided by OpenStreetMap. Using them shares your IP address, the area you are viewing and
            what you type in the search box with OpenStreetMap. We do not record what you search for.
          </p>
        </div>
      </footer>
    </>
  );
}

/** Staff pages need a live session; the backend decides, the screen just follows. */
function RequireStaff({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (!getToken()) return setOk(false);
    api.me().then(() => setOk(true)).catch((e) => {
      if (e instanceof ApiError && e.status === 401) setToken(null);
      setOk(false);
    });
  }, []);
  if (ok === null) return <main><p role="status">Checking your session…</p></main>;
  return ok ? <>{children}</> : <Navigate to="/staff" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Submit />} />
          <Route path="/track" element={<TrackLookup />} />
          <Route path="/track/:id" element={<Track />} />
          <Route path="/staff" element={<StaffSignIn />} />
          <Route path="/staff/queue" element={<RequireStaff><StaffQueue /></RequireStaff>} />
          <Route path="/staff/reports/:id" element={<RequireStaff><StaffDetail /></RequireStaff>} />
          <Route path="*" element={<main><h1>Page not found</h1><Link to="/">Go to the start</Link></main>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
