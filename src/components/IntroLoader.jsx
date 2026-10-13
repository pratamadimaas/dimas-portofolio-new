import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { markIntroSeen, setIntroPhase, useIntroPhase } from '../lib/intro';

// All times are measured from first paint. The overlay is fully gone by 2000 ms, so the exit
// (450 ms) has to start by 1450 ms. index.html runs a similar cut-off if the JS has not arrived.
const MIN_MS = 900;
const EXIT_MS = 450;
const MAX_MS = 2000 - EXIT_MS - 100;
const REDUCED_FADE_MS = 300;
const LABEL = 'DIMAS PRATAMA / PORTFOLIO';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

const panel = 'absolute inset-x-0 h-1/2 bg-titanium-bg dark:bg-obsidian-bg will-change-transform';

export default function IntroLoader() {
  const phase = useIntroPhase();
  const reduce = useReducedMotion();
  const labelRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    markIntroSeen();

    window.__introStarted = true;
    const t0 = performance.getEntriesByName('first-paint')[0]?.startTime ?? performance.now();
    let raf = 0;
    let last = performance.now();
    let shown = 0;
    let ready = false;
    let finished = false;

    // Ready = fonts loaded and the app has painted at least once underneath.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => requestAnimationFrame(() => requestAnimationFrame(() => (ready = true))));

    const paint = (p, el) => {
      const chars = reduce ? LABEL.length : Math.floor(Math.min(1, el / 650) * LABEL.length);
      if (labelRef.current && labelRef.current.textContent.length !== chars) labelRef.current.textContent = LABEL.slice(0, chars);
      if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const finish = () => {
      finished = true;
      paint(1, MAX_MS);
      setIntroPhase('exiting');
      setTimeout(() => setIntroPhase('done'), (reduce ? REDUCED_FADE_MS : EXIT_MS) + 20);
    };

    const tick = () => {
      if (finished) return;
      const now = performance.now();
      const el = now - t0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Progress follows real elapsed time, held at 90% until the assets are actually ready.
      const goal = el >= MAX_MS ? 1 : ready ? Math.min(1, el / MIN_MS) : 0.9;
      shown += (goal - shown) * (1 - Math.exp(-dt * 14));
      if (!reduce) paint(Math.min(shown, 1), el);

      if (el >= MAX_MS || (ready && el >= MIN_MS && shown > 0.985)) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    if (reduce) paint(1, MAX_MS);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduce]);

  if (phase === 'done') return null;

  const exiting = phase === 'exiting';
  const slide = exiting && !reduce;

  return (
    <div
      id="intro"
      suppressHydrationWarning
      role="status"
      aria-label="Loading portfolio"
      className={`fixed inset-0 z-[100] ${exiting ? 'pointer-events-none' : ''}`}
      style={reduce ? { opacity: exiting ? 0 : 1, transition: `opacity ${REDUCED_FADE_MS}ms linear` } : undefined}
    >
      <div
        aria-hidden="true"
        className={`${panel} top-0`}
        style={{ transform: `translate3d(0, ${slide ? '-100%' : '0'}, 0)`, transition: `transform ${EXIT_MS}ms ${EASE_OUT}` }}
      />
      <div
        aria-hidden="true"
        className={`${panel} bottom-0`}
        style={{ transform: `translate3d(0, ${slide ? '100%' : '0'}, 0)`, transition: `transform ${EXIT_MS}ms ${EASE_OUT}` }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-titanium-text dark:text-obsidian-text"
        style={{ opacity: exiting && !reduce ? 0 : 1, transition: 'opacity 160ms linear' }}
      >
        <svg viewBox="0 0 112 60" width="112" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="intro-stroke" pathLength="1" d="M6 6 V54 H26 C44 54 52 43 52 30 C52 17 44 6 26 6 Z" />
          <path className="intro-stroke" pathLength="1" style={{ animationDelay: '180ms' }} d="M66 54 V6 H84 C98 6 106 14 106 22 C106 30 98 38 84 38 H66" />
        </svg>

        <p ref={labelRef} suppressHydrationWarning className="mt-8 h-4 font-mono text-[11px] tracking-[0.28em] text-titanium-muted dark:text-obsidian-muted">
          {reduce ? LABEL : ''}
        </p>
        <p ref={countRef} suppressHydrationWarning className="mt-3 font-mono text-xs tabular-nums text-titanium-muted dark:text-obsidian-muted">
          {reduce ? '100' : '000'}
        </p>
        <div className="mt-4 h-px w-[min(240px,60vw)] bg-titanium-border dark:bg-obsidian-border">
          <div
            ref={barRef}
            suppressHydrationWarning
            className="h-px origin-left bg-emerald-700 dark:bg-engine will-change-transform"
            style={{ transform: `scaleX(${reduce ? 1 : 0})` }}
          />
        </div>
      </div>
    </div>
  );
}
