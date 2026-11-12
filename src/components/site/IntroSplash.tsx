import { useEffect, useRef, useState } from "react";
import { Ribbon, S_RIBBON_BOTTOM, S_RIBBON_TOP } from "@/components/site/Logo";

// Size of the intro mark in px; the fly-to-header scale is computed from it.
const MARK_PX = 112;

// Plays once per full page load; later in-app visits to the home page skip it.
let introPlayed = false;

/** True while the opening animation should play on this render of the home page. */
export function useIntroState() {
  const [playing, setPlaying] = useState(() => !introPlayed);
  return { playing, done: () => setPlaying(false) };
}

/**
 * Opening animation: the two ribbons of the SUNGROUP mark rise and lock together,
 * a light sweep passes over them, then the mark flies into the header logo spot.
 * Pure CSS so it starts before hydration; JS only measures the header target.
 */
export function IntroSplash({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    introPlayed = true;
    const el = ref.current;
    const target = document.querySelector<SVGElement>('[data-brand-mark="header"]');
    if (!el || !target) return;
    const r = target.getBoundingClientRect();
    el.style.setProperty("--fly-x", `${r.left + r.width / 2 - window.innerWidth / 2}px`);
    el.style.setProperty("--fly-y", `${r.top + r.height / 2 - window.innerHeight / 2}px`);
    el.style.setProperty("--fly-s", String(r.width / MARK_PX));
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="intro-overlay pointer-events-none fixed inset-0 z-[100] grid place-items-center"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "intro-out") onDone();
      }}
    >
      <div className="intro-bg absolute inset-0 bg-background" />
      <div className="intro-fly relative grid place-items-center">
        <span className="intro-ring absolute size-28 rounded-full border border-primary" />
        <span style={{ animationDelay: ".82s" }} className="intro-ring absolute size-28 rounded-full border border-primary" />
        <svg viewBox="0 0 960 990" className="intro-mark relative size-28 overflow-visible text-primary">
          <defs>
            <linearGradient id="intro-shine" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0" style={{ stopColor: "var(--primary-foreground)" }} stopOpacity="0" />
              <stop offset="0.5" style={{ stopColor: "var(--primary-foreground)" }} stopOpacity="0.75" />
              <stop offset="1" style={{ stopColor: "var(--primary-foreground)" }} stopOpacity="0" />
            </linearGradient>
            <clipPath id="intro-clip">
              <g transform="translate(0,990) scale(0.1,-0.1)">
                <path d={S_RIBBON_TOP} />
                <path d={S_RIBBON_BOTTOM} />
              </g>
            </clipPath>
          </defs>
          <Ribbon d={S_RIBBON_TOP} className="intro-ribbon-top" />
          <Ribbon d={S_RIBBON_BOTTOM} className="intro-ribbon-bottom" />
          <g clipPath="url(#intro-clip)">
            <rect className="intro-shine" x="-400" y="0" width="400" height="990" fill="url(#intro-shine)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
