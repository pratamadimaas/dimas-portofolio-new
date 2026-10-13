import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useNearViewport } from '../hooks/useNearViewport';
import { Building2, Cpu, Landmark, Laptop, Sigma, Terminal } from 'lucide-react';
import { identity } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';
import SectionHeading from './SectionHeading';

const EraStage = lazy(() => import('./EraStage'));

const path = identity.path;
const LAST = path.length - 1;
// One icon per timeline entry, same order as identity.path. Used by the vertical fallback.
const eraIcons = [Sigma, Terminal, Landmark, Laptop, Building2, Cpu];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function useEnv() {
  const [env, setEnv] = useState({ ready: false, webgl: false, wide: false });
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const read = () => setEnv({ ready: true, webgl: supportsWebGL(), wide: mq.matches });
    const onVisibility = () => setTabVisible(!document.hidden);
    read();
    onVisibility();
    mq.addEventListener('change', read);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mq.removeEventListener('change', read);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { env, tabVisible };
}

/* ---------- Immersive: sticky full-viewport stage, scroll moves the camera along the path ---------- */

function Immersive({ tabVisible }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const fillRef = useRef(null);
  const cardRefs = useRef([]);
  const shared = useRef({ f: 0, fs: 0, sx: [], sy: [] });
  const inView = useNearViewport(wrapRef);
  const [active, setActive] = useState(0);

  // Native scroll only: progress is read from where the tall container sits in the viewport.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = Math.max(1, r.height - window.innerHeight);
      const f = clamp01(-r.top / range) * LAST;
      shared.current.f = f;
      setActive(Math.round(f));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Cards follow their milestone's projected screen position and fade in as the camera approaches.
  useEffect(() => {
    if (!inView) return undefined;
    let raf = 0;
    const tick = () => {
      const s = shared.current;
      const width = stageRef.current?.clientWidth ?? 0;
      path.forEach((_, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const sx = s.sx[i];
        if (sx === undefined) return;
        const o = clamp01(1 - (Math.abs(i - s.fs) - 0.3) / 0.7);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(${((sx * 0.5 + 0.5) * width).toFixed(1)}px, ${(1 - o) * (i % 2 ? 12 : -12)}px, 0)`;
      });
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamp01(s.fs / LAST).toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const goTo = useCallback((i) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / LAST) * range, behavior: 'smooth' });
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[300vh]">
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
        {inView && (
          <div
            role="img"
            aria-label="A glowing path with six small illustrations, one per stage of the timeline: school maths, first code, the treasury detour, Laravel, office tools, and report automation. The camera follows the path as you scroll."
            className="pointer-events-none absolute inset-0"
          >
            <Suspense fallback={null}>
              <EraStage scrollRef={shared} animate frameloop={tabVisible ? 'always' : 'demand'} />
            </Suspense>
          </div>
        )}

        {/* Milestone cards: real text, anchored to each object, alternating above and below the path. */}
        <ol className="pointer-events-none absolute inset-0 list-none">
          {path.map((step, i) => {
            const top = i % 2 === 0;
            const turning = Boolean(step.turning);
            return (
              <li
                key={step.year}
                ref={(el) => (cardRefs.current[i] = el)}
                style={{ opacity: 0 }}
                className={`absolute left-0 w-0 ${top ? 'top-28 flex-col' : 'bottom-28 flex-col-reverse'} flex items-center`}
              >
                <div
                  className={`w-[min(320px,78vw)] shrink-0 rounded-xl border px-4 py-3 backdrop-blur-md ${
                    turning
                      ? 'border-amber-600/50 dark:border-amber-400/50 bg-amber-50/85 dark:bg-[#1a1408]/80'
                      : 'border-titanium-border dark:border-obsidian-border bg-white/80 dark:bg-obsidian-surface/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-sm ${
                        turning ? 'text-amber-700 dark:text-amber-400' : 'text-accent'
                      }`}
                    >
                      {step.year}
                    </span>
                    {turning && (
                      <span className="rounded-full border border-amber-600/50 dark:border-amber-400/50 px-2 py-0.5 font-mono text-[10px] tracking-wide text-amber-700 dark:text-amber-400">
                        Turning point
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-titanium-text dark:text-obsidian-text">{step.text}</p>
                </div>
                <span
                  aria-hidden="true"
                  className={`h-8 w-px ${
                    turning ? 'bg-amber-600/60 dark:bg-amber-400/60' : 'bg-emerald-700/50 dark:bg-engine/50'
                  }`}
                />
              </li>
            );
          })}
        </ol>

        {/* Year scrubber */}
        <nav aria-label="Timeline" className="absolute inset-x-0 bottom-4 z-20 mx-auto w-full max-w-6xl px-6 md:px-10">
          <div className="relative">
            <div aria-hidden="true" className="absolute left-[8.333%] right-[8.333%] top-[14px] h-px bg-titanium-border dark:bg-obsidian-border" />
            <div
              ref={fillRef}
              aria-hidden="true"
              style={{ transform: 'scaleX(0)' }}
              className="absolute left-[8.333%] right-[8.333%] top-[14px] h-px origin-left bg-emerald-700 dark:bg-engine"
            />
            <div className="grid grid-cols-6">
              {path.map((step, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={step.year}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`${step.year}${step.turning ? ', turning point' : ''}`}
                    className="group relative mx-auto h-[52px] min-w-[44px] w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-1/2 top-[10px] h-2 w-2 -translate-x-1/2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'scale-150 bg-emerald-700 dark:bg-engine'
                          : 'bg-titanium-muted dark:bg-obsidian-muted group-hover:bg-emerald-700 dark:group-hover:bg-engine'
                      }`}
                    />
                    <span
                      className={`absolute inset-x-0 bottom-1 text-center font-mono text-sm transition-colors duration-300 ${
                        isActive
                          ? 'font-semibold text-accent'
                          : 'text-titanium-muted dark:text-obsidian-muted group-hover:text-accent'
                      }`}
                    >
                      {step.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ---------- Fallback: vertical timeline (mobile, reduced motion, no WebGL) ---------- */

function VerticalTimeline() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const itemRefs = useRef([]);

  // The entry whose centre is closest to the middle of the viewport is the active one.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) {
          best = i;
          bestDist = d;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i) =>
    itemRefs.current[i]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 pb-24 md:pb-32">
      <ol className="max-w-xl border-l border-titanium-border dark:border-obsidian-border">
        {path.map((step, i) => {
          const isActive = i === active;
          const Icon = eraIcons[i];
          const turning = Boolean(step.turning);
          return (
            <li
              key={step.year}
              ref={(el) => (itemRefs.current[i] = el)}
              className="relative grid grid-cols-[3.5rem_1fr] gap-3 pl-5 pb-8 last:pb-0"
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[4.5px] top-[7px] h-2 w-2 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-emerald-700 dark:bg-engine' : 'bg-titanium-muted dark:bg-obsidian-muted'
                }`}
              >
                {isActive && <span className="absolute inset-0 rounded-full bg-engine/60 motion-safe:animate-ping" />}
              </span>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Jump to ${step.year}`}
                className={`min-h-[44px] self-start text-left font-mono text-sm pt-px transition-colors duration-300 hover:text-accent rounded-sm ${
                  isActive
                    ? turning
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-accent'
                    : 'text-titanium-muted dark:text-obsidian-muted'
                }`}
              >
                {step.year}
              </button>
              <div>
                {turning && (
                  <span className="mb-1.5 inline-block rounded-full border border-amber-600/50 dark:border-amber-400/50 px-2 py-0.5 font-mono text-[10px] tracking-wide text-amber-700 dark:text-amber-400">
                    Turning point
                  </span>
                )}
                <p
                  className={`text-sm md:text-base leading-relaxed ${
                    isActive ? 'text-titanium-text dark:text-obsidian-text' : 'text-titanium-muted dark:text-obsidian-muted'
                  }`}
                >
                  <Icon aria-hidden="true" size={15} className="mr-2 -mt-0.5 inline text-accent" />
                  {step.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function JourneySection() {
  const reduceMotion = useReducedMotion();
  const { env, tabVisible } = useEnv();
  const immersive = env.ready && env.webgl && env.wide && !reduceMotion;

  return (
    <section id="journey" className="relative">
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-24 md:pt-32 pb-12 md:pb-16">
        <SectionHeading eyebrow="02 / Journey">How I got here</SectionHeading>
        <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-titanium-muted dark:text-obsidian-muted">
          {identity.summary}
        </p>
      </div>
      {immersive ? <Immersive tabVisible={tabVisible} /> : <VerticalTimeline />}
    </section>
  );
}
