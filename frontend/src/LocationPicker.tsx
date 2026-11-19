import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

/**
 * Map pin for the report form (FR1.3). The latitude and longitude fields stay on the form and stay in sync,
 * so a person can always type a position, and the form works if the map never loads.
 *
 * Tiles come from OpenStreetMap by default. That is fine for development; before real citizens use this,
 * set VITE_TILE_URL and VITE_TILE_ATTRIBUTION to a hosted tile provider (OpenStreetMap's tile policy
 * does not allow heavy production use, and every tile request tells the provider the visitor's IP address).
 */
const TILE_URL = import.meta.env.VITE_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = import.meta.env.VITE_TILE_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// The service area for now is Dhaka. The map cannot be panned or zoomed out beyond it, and a pin outside it is not accepted.
// Rough box around Dhaka city and its immediate surroundings: [south-west, north-east].
export const SERVICE_BOUNDS: L.LatLngBoundsLiteral = [[23.62, 90.28], [23.95, 90.55]];
const START_CENTER: [number, number] = [23.8103, 90.4125];
const START_ZOOM = 12;
const MIN_ZOOM = 11;
const PLACED_ZOOM = 16;
const SEARCH_PAUSE_MS = 600; // wait this long after the last keystroke before searching
const MIN_GAP_MS = 1100; // the public Nominatim service allows about one request a second

function clampToArea(p: { lat: number; lng: number }) {
  const [[s, w], [n, e]] = SERVICE_BOUNDS;
  return { lat: Math.min(n, Math.max(s, p.lat)), lng: Math.min(e, Math.max(w, p.lng)) };
}

export function inServiceArea(p: { lat: number; lng: number }): boolean {
  const [[s, w], [n, e]] = SERVICE_BOUNDS;
  return p.lat >= s && p.lat <= n && p.lng >= w && p.lng <= e;
}

// Address search. Nominatim is OpenStreetMap's free service: fine for a pilot, not for heavy use (about 1 request a second,
// no search-as-you-type). Set VITE_GEOCODER_URL to a hosted provider with the same response shape, or replace this, before launch.
const GEOCODER_URL = import.meta.env.VITE_GEOCODER_URL ?? "https://nominatim.openstreetmap.org/search";

type Place = { name: string; lat: number; lng: number };

async function searchPlaces(query: string, signal: AbortSignal): Promise<Place[]> {
  const [[s, w], [n, e]] = SERVICE_BOUNDS;
  const params = new URLSearchParams({
    format: "jsonv2", q: query, limit: "5", countrycodes: "bd", "accept-language": "en",
    viewbox: `${w},${n},${e},${s}`, bounded: "1",
  });
  const res = await fetch(`${GEOCODER_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  const rows = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return rows
    .map((r) => ({ name: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && inServiceArea(p));
}

const pinIcon = L.divIcon({
  className: "pin",
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  html: `<svg viewBox="0 0 36 44" width="36" height="44" aria-hidden="true"><path d="M18 43C8 30 2 23 2 16a16 16 0 0 1 32 0c0 7-6 14-16 27z" fill="#2F6F4E" stroke="#fff" stroke-width="2"/><circle cx="18" cy="16" r="6" fill="#fff"/></svg>`,
});

type Pos = { lat: number; lng: number };

/** Turns the text in the form fields into a position, or null when they are empty or not valid. */
export function parsePosition(lat: string, lng: string): Pos | null {
  if (!lat.trim() || !lng.trim()) return null;
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) > 90 || Math.abs(b) > 180) return null;
  return { lat: a, lng: b };
}

function Inner({ pos, onPick, onTileError }: { pos: Pos | null; onPick: (p: Pos) => void; onTileError: () => void }) {
  const map = useMap();

  useMapEvents({ click: (e) => inServiceArea(e.latlng) && onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });

  // Bring the pin into view when it was set from outside the map (current location, or typed fields).
  useEffect(() => {
    if (pos && !map.getBounds().contains([pos.lat, pos.lng])) map.flyTo([pos.lat, pos.lng], Math.max(map.getZoom(), PLACED_ZOOM));
  }, [pos, map]);

  // Keyboard: arrow keys move the pin about 40 screen pixels; Enter or Space places it at the centre of the map.
  useEffect(() => {
    map.keyboard.disable();
    const el = map.getContainer();
    const onKey = (e: KeyboardEvent) => {
      const step = 40;
      const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
      const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
      if (dx || dy) {
        e.preventDefault();
        const here = pos ?? { lat: map.getCenter().lat, lng: map.getCenter().lng };
        const p = map.latLngToContainerPoint([here.lat, here.lng]);
        const next = map.containerPointToLatLng([p.x + dx, p.y + dy]);
        if (inServiceArea(next)) onPick({ lat: next.lat, lng: next.lng });
      } else if ((e.key === "Enter" || e.key === " ") && !pos) {
        e.preventDefault();
        onPick({ lat: map.getCenter().lat, lng: map.getCenter().lng });
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [map, pos, onPick]);

  const handlers = useMemo(
    () => ({ dragend: (e: L.LeafletEvent) => { const ll = (e.target as L.Marker).getLatLng(); onPick(clampToArea(ll)); } }),
    [onPick],
  );

  return (
    <>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} eventHandlers={{ tileerror: onTileError }} />
      {pos && <Marker position={[pos.lat, pos.lng]} icon={pinIcon} draggable keyboard={false} eventHandlers={handlers} />}
    </>
  );
}

export default function LocationPicker({ lat, lng, onChange, actions }: { lat: string; lng: string; onChange: (lat: string, lng: string) => void; actions?: ReactNode }) {
  const typed = parsePosition(lat, lng);
  const outside = !!typed && !inServiceArea(typed);
  const pos = typed && !outside ? typed : null;
  const [tilesFailed, setTilesFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "waiting" | "busy" | "error">("idle");
  const abort = useRef<AbortController | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastStart = useRef(0);

  const cancel = () => { window.clearTimeout(timer.current); abort.current?.abort(); };
  useEffect(() => cancel, []); // stop any pending search when the form closes

  // Enter and the Search button call this at once; typing calls it after a short pause.
  async function runSearch(text: string) {
    const q = text.trim();
    if (q.length < 3) return;
    cancel();
    const ctl = (abort.current = new AbortController());
    lastStart.current = Date.now();
    setSearchState("busy");
    try {
      const found = await searchPlaces(q, ctl.signal);
      if (ctl.signal.aborted) return; // the person kept typing: this answer is for an old question
      setResults(found);
      setSearchState("idle");
    } catch {
      if (ctl.signal.aborted) return;
      setResults(null);
      setSearchState("error");
    }
  }

  function onQueryChange(text: string) {
    setQuery(text);
    cancel();
    setResults(null); // never keep showing the answers to an earlier question
    if (text.trim().length < 3) return setSearchState("idle");
    setSearchState("waiting");
    // Wait for a pause in typing, and never send requests closer together than the public service allows.
    const wait = Math.max(SEARCH_PAUSE_MS, lastStart.current + MIN_GAP_MS - Date.now());
    timer.current = window.setTimeout(() => void runSearch(text), wait);
  }

  const choose = (p: Place) => { cancel(); onChange(p.lat.toFixed(6), p.lng.toFixed(6)); setResults(null); setSearchState("idle"); };
  const center: [number, number] = pos ? [pos.lat, pos.lng] : START_CENTER;

  return (
    <div className="picker">
      <div className="picker-search">
        <label htmlFor="place-search" className="sr">Search for a street or area in Dhaka</label>
        {/* Not a <form>: this sits inside the report form, and Enter here must search, not send the report. */}
        <input
          id="place-search" type="search" placeholder="Search a street or area in Dhaka" value={query} autoComplete="off"
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); void runSearch(query); }
            else if (e.key === "Escape") { cancel(); setResults(null); setSearchState("idle"); }
          }}
        />
        <button type="button" className="secondary" onClick={() => void runSearch(query)} disabled={query.trim().length < 3}>
          {searchState === "busy" || searchState === "waiting" ? "Searching…" : "Search"}
        </button>
        {actions}
      </div>
      <div role="status" className="hint">
        {(searchState === "waiting" || searchState === "busy") && "Searching…"}
        {searchState === "error" && "Search is not available right now. Tap the map or type the latitude and longitude instead."}
        {searchState === "idle" && results && results.length === 0 && "Nothing found in Dhaka for that search. Try a nearby road or area name."}
      </div>
      {results && results.length > 0 && (
        <ul className="picker-results" aria-label="Search results">
          {results.map((p) => (
            <li key={`${p.lat},${p.lng},${p.name}`}><button type="button" className="secondary" onClick={() => choose(p)}>{p.name}</button></li>
          ))}
        </ul>
      )}
      <div className="picker-map" role="group" aria-label="Map. Press Enter to place the pin at the centre, then use the arrow keys to move it. You can also type the latitude and longitude below.">
        <MapContainer center={center} zoom={pos ? PLACED_ZOOM : START_ZOOM} minZoom={MIN_ZOOM} maxBounds={SERVICE_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <Inner pos={pos} onPick={(p) => onChange(p.lat.toFixed(6), p.lng.toFixed(6))} onTileError={() => setTilesFailed(true)} />
        </MapContainer>
      </div>
      <span className="hint">
        {outside
          ? "That position is outside Dhaka. For now we can only take reports inside the Dhaka area shown on the map."
          : pos ? "Drag the pin, or tap the map, to adjust it." : "Tap the map to drop a pin, or use your current location. We cover the Dhaka area for now."}
        {tilesFailed && " The map could not load. Please type the latitude and longitude instead."}
      </span>
    </div>
  );
}
