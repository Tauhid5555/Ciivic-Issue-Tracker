import { ReactNode } from "react";
import type { Category } from "./api";

/** Line icons for the five categories (24x24). A code we do not know gets a neutral icon. */
const ICONS: Record<string, ReactNode> = {
  streetlight: (
    <>
      <path d="M6 9h12l-2.500-5h-7z" />
      <path d="M12 9v12M9 21h6" />
      <path d="M8 12l-2 2M16 12l2 2M12 12v2" />
    </>
  ),
  pothole: (
    <>
      <path d="M3 8h18M3 20h18" />
      <ellipse cx="12" cy="14" rx="6.500" ry="3" />
    </>
  ),
  garbage: (
    <>
      <path d="M5 7h14M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13M10 11v6M14 11v6" />
    </>
  ),
  drainage: (
    <>
      <path d="M12 3s6 6.500 6 10.500a6 6 0 0 1-12 0C6 9.500 12 3 12 3z" />
      <path d="M9.500 14.500a2.500 2.500 0 0 0 2.500 2.500" />
    </>
  ),
  noise: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11" />
    </>
  ),
};
const FALLBACK = (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5M12 16h.01" />
  </>
);

export function CategoryIcon({ code, size = 28 }: { code: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[code] ?? FALLBACK}
    </svg>
  );
}

/** Category choice as tappable tiles. Real radio buttons underneath, so the keyboard and screen readers work as usual. */
export default function CategoryPicker({ categories, loading, error }: { categories: Category[]; loading: boolean; error?: string }) {
  return (
    <fieldset className="cats">
      <legend className="label">What kind of problem is it?</legend>
      <div className="cat-grid">
        {loading && categories.length === 0 && [0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton cat-skel" aria-hidden="true" />)}
        {categories.map((c) => (
          <label key={c.categoryCode} className="cat">
            <input type="radio" name="category" value={c.categoryCode} required className="sr" />
            <span className="cat-tile">
              <CategoryIcon code={c.categoryCode} />
              <span>{c.label}</span>
            </span>
          </label>
        ))}
      </div>
      <span className="err">{error}</span>
    </fieldset>
  );
}
