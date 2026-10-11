import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { experience, offices } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';

const TreasuryMap = lazy(() => import('./TreasuryMap'));

const officeKeys = experience.map((job) => job.location);

function useViewport3D() {
  const [state, setState] = useState({ webgl: false, desktop: false });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setState({ webgl: supportsWebGL(), desktop: mq.matches });
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return state;
}

export default function ExperienceSection({ isDark }) {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const { webgl, desktop } = useViewport3D();
  const inView = useInView(sectionRef, { margin: '200px' });

  // Fires on every scroll frame while the list is on screen.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start end', 'end start'] });
  // 0..1 along the 3D path: 0 when the first role's centre sits on the reading
  // line, 1 when the last one does, interpolated between actual item positions.
  const pathProgress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const items = listRef.current?.children;
    if (!items?.length) return;
    const line = window.innerHeight * 0.5;
    const centers = Array.from(items, (el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });

    let f = 0;
    if (line >= centers[centers.length - 1]) {
      f = centers.length - 1;
    } else if (line > centers[0]) {
      const i = centers.findIndex((c, k) => line >= c && line < centers[k + 1]);
      f = i + (line - centers[i]) / (centers[i + 1] - centers[i]);
    }

    pathProgress.set(centers.length > 1 ? f / (centers.length - 1) : 0);
    const idx = Math.round(f);
    setActive((prev) => (prev === idx ? prev : idx));
  });

  const showMap = webgl && inView;
  // Scroll-driven camera only on desktop with motion allowed; otherwise a static overview.
  const flyCamera = desktop && !reduceMotion;
  const current = experience[active];
  const office = offices[current.location];

  return (
    <section ref={sectionRef} id="experience" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-14">
        Experience
      </h2>

      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-16">
        <div>
          <div className="relative h-[260px] sm:h-[360px] lg:sticky lg:top-28 lg:h-[min(68vh,560px)] rounded-2xl border border-titanium-border dark:border-obsidian-border overflow-hidden bg-gradient-to-b from-slate-100 to-white dark:from-[#0a1322] dark:to-[#06080d]">
            {showMap && (
              <Suspense fallback={null}>
                <TreasuryMap
                  items={officeKeys}
                  activeIndex={active}
                  progress={flyCamera ? pathProgress : null}
                  animate={!reduceMotion}
                  isDark={isDark}
                />
              </Suspense>
            )}
            <div className="absolute top-5 left-5 right-5 pointer-events-none">
              <p className="label-mono">Treasury offices, 2019 - today</p>
            </div>
            {flyCamera && (
              <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                <p className="label-mono">{current.period}</p>
                <p className="mt-1 font-display font-semibold">
                  {office.city}, {office.region}
                </p>
              </div>
            )}
          </div>
        </div>

        <ol ref={listRef} className="space-y-14 lg:py-[12vh]">
          {experience.map((job, i) => {
            const isCurrent = job.period.includes('Present');
            return (
              <motion.li
                key={`${job.period}-${job.role}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Inner wrapper owns the focus dim so it doesn't fight the reveal animation. */}
                <div className={`transition-opacity duration-500 ${i === active ? 'lg:opacity-100' : 'lg:opacity-40'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="label-mono">{job.period}</p>
                    {isCurrent && <span className="label-mono text-engine">Current</span>}
                  </div>
                  <h3 className="mt-1.5 text-lg md:text-xl font-semibold leading-snug">{job.role}</h3>
                  <p className="text-sm text-engine mt-0.5">{job.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted max-w-prose">
                    {job.detail}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
