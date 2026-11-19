import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * A looping product showcase for the landing page: a phone that shows a report going from photo to resolved.
 * Purely decorative, so it is hidden from assistive technology. With reduced motion it shows one still frame.
 */

const STAGES = [
  { title: "Snap a photo", text: "Show us what is wrong." },
  { title: "Drop a pin", text: "Tell us exactly where." },
  { title: "Get a Tracking ID", text: "No account needed." },
  { title: "Watch it get fixed", text: "Follow every step to resolved." },
] as const;
const STAGE_MS = 2800;
const EXAMPLE_ID = "K7M2QX4TNB";
const STEPS = ["Submitted", "Acknowledged", "In Progress", "Resolved"];

function PhotoScreen() {
  return (
    <div className="scr scr-photo">
      <svg viewBox="0 0 220 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="260" fill="#cfd8d2" />
        <rect y="150" width="220" height="110" fill="#8c9490" />
        <rect y="150" width="220" height="4" fill="#767d79" />
        <motion.ellipse cx="110" cy="205" rx="46" ry="16" fill="#3d4440" initial={{ scaleX: 0.4, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
        <ellipse cx="110" cy="201" rx="36" ry="10" fill="#242a27" />
        <rect x="0" y="225" width="220" height="3" fill="#f4d35e" opacity=".8" />
      </svg>
      <motion.div className="flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.95, 0] }} transition={{ duration: 1.1, times: [0, 0.4, 0.5, 1] }} />
      <motion.div className="focus-box" initial={{ opacity: 0, scale: 1.4 }} animate={{ opacity: [0, 1, 1, 0], scale: 1 }} transition={{ duration: 1, times: [0, 0.2, 0.7, 1] }} />
    </div>
  );
}

function MapScreen() {
  return (
    <div className="scr scr-map">
      <svg viewBox="0 0 220 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="260" fill="#eef1e8" />
        {[40, 100, 160].map((y) => <rect key={y} x="-10" y={y} width="240" height="14" fill="#fff" />)}
        {[30, 110, 180].map((x) => <rect key={x} x={x} y="-10" width="14" height="280" fill="#fff" />)}
        <rect x="124" y="114" width="46" height="36" rx="4" fill="#d9e8e0" />
        <rect x="44" y="174" width="56" height="30" rx="4" fill="#d9e8e0" />
        {[0, 1, 2].map((i) => (
          <motion.circle key={i} cx="117" cy="128" r="8" fill="none" stroke="#2F6F4E" strokeWidth="2" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 3.4, opacity: [0, 0.6, 0] }} transition={{ delay: 0.7 + i * 0.35, duration: 1.4, repeat: Infinity, ease: "easeOut" }} style={{ transformOrigin: "117px 128px" }} />
        ))}
        <motion.g initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 11, delay: 0.2 }}>
          <path d="M117 128c-12-14-18-22-18-30a18 18 0 0 1 36 0c0 8-6 16-18 30z" fill="#2F6F4E" />
          <circle cx="117" cy="98" r="7" fill="#fff" />
        </motion.g>
      </svg>
    </div>
  );
}

function IdScreen() {
  return (
    <div className="scr scr-id">
      <motion.span className="scr-kicker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>Your Tracking ID</motion.span>
      <div className="scr-id-chars" aria-hidden="true">
        {EXAMPLE_ID.split("").map((c, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 380, damping: 18 }}>{c}</motion.span>
        ))}
      </div>
      <motion.span className="scr-chip" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}>Report received</motion.span>
    </div>
  );
}

function ProgressScreen() {
  return (
    <div className="scr scr-progress">
      {STEPS.map((s, i) => (
        <motion.div key={s} className="scr-step" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.45 }}>
          <motion.span className="scr-dot" initial={{ backgroundColor: "#e5e3dd" }} animate={{ backgroundColor: "#2F6F4E", scale: [1, 1.35, 1] }} transition={{ delay: i * 0.45 + 0.25, duration: 0.4 }}>
            {i === 3 && (
              <svg viewBox="0 0 20 20" width="12" height="12"><motion.path d="M4 10.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.45 + 0.5, duration: 0.4 }} /></svg>
            )}
          </motion.span>
          <span>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

const SCREENS = [PhotoScreen, MapScreen, IdScreen, ProgressScreen];

export default function HeroShowcase() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? STAGES.length - 1 : 0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Advance through the story; stop while the tab is hidden or when motion is reduced.
  useEffect(() => {
    if (reduce || !visible) return;
    const t = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), stage === STAGES.length - 1 ? STAGE_MS + 1200 : STAGE_MS);
    return () => clearTimeout(t);
  }, [stage, reduce, visible]);

  const Screen = SCREENS[reduce ? STAGES.length - 1 : stage];

  return (
    <aside className="hero" aria-hidden="true">
      <h2 className="hero-title">Spotted a problem?<br />We'll take it from here.</h2>
      <div className="hero-stage">
        <motion.div className="hero-glow" animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span className="float-badge fb1" animate={reduce ? undefined : { y: [0, -14, 0], x: [0, 6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>Acknowledged</motion.span>
        <motion.span className="float-badge fb2" animate={reduce ? undefined : { y: [0, 12, 0], x: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>In Progress</motion.span>
        <motion.span className="float-badge fb3" animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}>Resolved ✓</motion.span>

        <motion.div className="phone" animate={reduce ? undefined : { y: [0, -10, 0], rotateZ: [-1, 1, -1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <div className="phone-notch" />
          <div className="phone-screen">
            <AnimatePresence mode="wait">
              <motion.div key={reduce ? "still" : stage} className="phone-fill" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
                <Screen />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <div className="hero-caption">
        <AnimatePresence mode="wait">
          <motion.div key={reduce ? "still" : stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <strong>{STAGES[reduce ? STAGES.length - 1 : stage].title}</strong>
            <span>{STAGES[reduce ? STAGES.length - 1 : stage].text}</span>
          </motion.div>
        </AnimatePresence>
        <div className="hero-dots">
          {STAGES.map((_, i) => <span key={i} className={i === (reduce ? STAGES.length - 1 : stage) ? "on" : ""} />)}
        </div>
      </div>
    </aside>
  );
}
