import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, Category, SubmissionResult } from "../api";
import { ErrorNote, fieldError } from "../components";
import HeroShowcase from "../HeroShowcase";
import LocationPicker, { inServiceArea } from "../LocationPicker";

const MAX_BYTES = 10 * 1024 * 1024;

export default function Submit() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoNote, setGeoNote] = useState("");
  // One key per form fill, so a double tap or a retry never creates two reports.
  const key = useRef(crypto.randomUUID().replace(/-/g, ""));

  useEffect(() => {
    api.categories().then(setCategories).catch(setError);
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return setGeoNote("Your browser cannot share a location. Please type it below.");
    setGeoNote("Looking for your location…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (!inServiceArea({ lat: p.coords.latitude, lng: p.coords.longitude })) {
          setGeoNote("Your location is outside Dhaka. For now we can only take reports inside the Dhaka area. Tap the map to place the pin.");
          return;
        }
        setLat(p.coords.latitude.toFixed(6));
        setLng(p.coords.longitude.toFixed(6));
        setGeoNote("Location found.");
      },
      // A denied permission never blocks submission: the person can type the position instead.
      () => setGeoNote("We could not get your location. Please type the latitude and longitude below."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const photo = form.get("photo") as File | null;
    if (photo && photo.size > MAX_BYTES) {
      setError(
        new ApiError(413, {
          code: "photo_too_large",
          message: "The photo must be 10 MB or smaller.",
          fieldErrors: [{ field: "photo", message: "Too large" }],
        }),
      );
      return;
    }
    if (!form.get("email")) form.delete("email");
    setBusy(true);
    try {
      setResult(await api.submit(form, key.current));
      key.current = crypto.randomUUID().replace(/-/g, "");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (result) return <Confirmation result={result} />;

  return (
    <div className="landing">
    <HeroShowcase />
    <main>
      <h1>Report a local problem</h1>
      <p>Tell us what is wrong and where. You do not need an account.</p>
      <ErrorNote error={error} />
      <form className="card" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="category">What kind of problem is it?</label>
          <select id="category" name="category" required defaultValue="">
            <option value="" disabled>Choose a category</option>
            {categories.map((c) => (
              <option key={c.categoryCode} value={c.categoryCode}>{c.label}</option>
            ))}
          </select>
          <span className="err">{fieldError(error, "category")}</span>
        </div>

        <div className="field">
          <label htmlFor="description">Describe the problem</label>
          <textarea id="description" name="description" required maxLength={2000} />
          <span className="err">{fieldError(error, "description")}</span>
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label">Where is it?</legend>
          <button type="button" className="secondary" onClick={useMyLocation}>Use my current location</button>
          <span className="hint" role="status">{geoNote}</span>
          <LocationPicker lat={lat} lng={lng} onChange={(a, b) => { setLat(a); setLng(b); }} />
          <div className="row">
            <div className="field">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" inputMode="decimal" required value={lat} onChange={(e) => setLat(e.target.value)} />
              <span className="err">{fieldError(error, "latitude")}</span>
            </div>
            <div className="field">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" inputMode="decimal" required value={lng} onChange={(e) => setLng(e.target.value)} />
              <span className="err">{fieldError(error, "longitude")}</span>
            </div>
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="photo">Add a photo (JPEG, PNG or HEIC, up to 10 MB)</label>
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/heic" required />
          <span className="err">{fieldError(error, "photo")}</span>
        </div>

        <div className="field">
          <label htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" autoComplete="email" />
          <span className="hint">Give an email if you want updates. Without one we cannot send you any.</span>
          <span className="err">{fieldError(error, "email")}</span>
        </div>

        <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
      </form>
      <p><Link to="/track">Already have a Tracking ID?</Link></p>
    </main>
    </div>
  );
}

function Confirmation({ result }: { result: SubmissionResult }) {
  const nav = useNavigate();
  const noEmail = result.emailNotice === "no-email-no-notifications";
  return (
    <main>
      <svg className="check" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
        <circle className="check-ring" cx="26" cy="26" r="24" fill="none" />
        <path className="check-tick" d="M14 27l8 8 16-17" fill="none" />
      </svg>
      <h1>Report received</h1>
      <p>{result.confirmationText}</p>
      <p className="tid" aria-label={`Your Tracking ID is ${result.trackingId.split("").join(" ")}`}>{result.trackingId}</p>
      {noEmail ? (
        <div className="alert warn" role="status">
          You did not give an email, so we will not send you updates. Save this Tracking ID: it is the only way back to your report.
        </div>
      ) : (
        <div className="alert ok" role="status">We will email you a confirmation and every status change.</div>
      )}
      <p>
        <button onClick={() => nav(`/track/${result.trackingId}`)}>See my report</button>{" "}
        <Link className="btn secondary" to="/">Report another</Link>
      </p>
    </main>
  );
}
