import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useNearViewport } from '../hooks/useNearViewport';
import { experience, offices } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';
import SectionHeading from './SectionHeading';

const TreasuryMap = lazy(() => import('./TreasuryMap'));

const officeKeys = experience.map((job) => job.location);
const LAST = experience.length - 1;

function RoleCard({ job, index, selected, onHover, onSelect, className = '', glass = false }) {
  const isCurrent = job.period.includes('Present');
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 2) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(index)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHover(null)}
      className={`relative rounded-2xl border p-5 md:p-6 ${
        glass
          ? 'bg-white/75 dark:bg-obsidian-surface/70 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/50'
          : 'bg-white dark:bg-obsidian-surface'
      } ${
        selected
          ? 'border-emerald-700 dark:border-engine'
          : 'border-titanium-border dark:border-obsidian-border'
      } ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="label-mono">{job.period}</p>
        {isCurrent && <span className="eyebrow">Current</span>}
      </div>
      <h3 className="mt-2 text-lg md:text-xl font-semibold leading-snug">{job.role}</h3>
      <p className="mt-0.5 text-sm font-medium text-accent">{job.title}</p>
      <p className="mt-3 text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">{job.detail}</p>
      {/* The whole card is one target: pick a role to fly the map to its office. */}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Show ${job.role}, ${job.title} on the map`}
        onClick={() => onSelect(index)}
        onFocus={() => onHover(index)}
        onBlur={() => onHover(null)}
        className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </motion.li>
  );
}

export default function ExperienceSection({ isDark }) {
  const sectionRef = useRef(null);
  const inView = useNearViewport(sectionRef);
  const reduceMotion = useReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const progress = useMotionValue(0);

  useEffect(() => setWebgl(supportsWebGL()), []);

  // Hover (or keyboard focus) previews a role; a click keeps it. No focus means the overview.
  const focusIdx = hovered ?? selected;
  useEffect(() => {
    if (focusIdx !== null) progress.set(focusIdx / LAST);
  }, [focusIdx, progress]);

  const toggle = (i) => setSelected((prev) => (prev === i ? null : i));
  const flying = focusIdx !== null && !reduceMotion;
  const focused = focusIdx !== null ? experience[focusIdx] : null;
  const office = focused ? offices[focused.location] : null;

  return (
    <section ref={sectionRef} id="experience" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <SectionHeading eyebrow="03 / Experience">Experience</SectionHeading>

      {/* Map on the left, roles on the right. Pointing at a role flies the map to its office. */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-titanium-border dark:border-obsidian-border bg-gradient-to-b from-slate-100 to-white dark:from-[#0a1322] dark:to-[#06080d]">
            {webgl && inView && (
              <Suspense fallback={null}>
                <TreasuryMap
                  items={officeKeys}
                  activeIndex={focusIdx ?? 0}
                  progress={flying ? progress : null}
                  animate={!reduceMotion}
                  isDark={isDark}
                />
              </Suspense>
            )}
            <p className="label-mono pointer-events-none absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1.5 backdrop-blur dark:bg-obsidian-surface/70">Treasury offices, 2019 - today</p>
            {focused && (
              <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl bg-white/70 px-4 py-2.5 text-right backdrop-blur dark:bg-obsidian-surface/70">
                <p className="label-mono">{focused.period}</p>
                <p className="mt-1 font-display font-semibold">
                  {office.city}, {office.region}
                </p>
              </div>
            )}
          </div>
        </div>

        <ol className="grid gap-3 md:gap-4">
          {experience.map((job, i) => (
            <RoleCard
              key={`${job.period}-${job.role}`}
              job={job}
              index={i}
              selected={focusIdx === i}
              onHover={setHovered}
              onSelect={toggle}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
