import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";
import { Link } from "react-router-dom";
import { ErrorNote, Logo } from "../components";

export default function StaffSignIn() {
  const nav = useNavigate();
  const [challenge, setChallenge] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function step(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      if (!challenge) {
        const r = await api.signIn(String(f.get("email")), String(f.get("password")));
        setChallenge(r.challengeId);
      } else {
        const r = await api.secondFactor(challenge, String(f.get("code")).trim());
        setToken(r.accessToken);
        nav("/staff/queue");
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-head">
        <Logo size={48} />
        <h1>Staff sign in</h1>
        <p className="hint">For council staff only. If you are reporting a problem, you do not need to sign in.</p>
      </div>
      <ErrorNote error={error} />
      <form className="card" onSubmit={step}>
        {!challenge ? (
          <>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <button type="submit" disabled={busy}>Continue</button>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="code">6-digit code from your authenticator app</label>
              <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus />
            </div>
            <button type="submit" disabled={busy}>Sign in</button>
          </>
        )}
      </form>
      <p className="auth-foot"><Link to="/">Report a problem instead</Link></p>
    </main>
  );
}
