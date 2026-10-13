import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNearViewport } from '../hooks/useNearViewport';
import { Plus } from 'lucide-react';
import { education } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';
import SectionHeading from './SectionHeading';

const BookStack = lazy(() => import('./BookStack'));

const COUNT = education.length;
// The shelf reads oldest to newest, so slot s holds education[COUNT - 1 - s].
const slotOf = (i) => COUNT - 1 - i;
const indexOf = (slot) => COUNT - 1 - slot;

function DetailPanel({ open, reduceMotion }) {
  const edu = open >= 0 ? education[open] : null;
  return (
    <div aria-live="polite" className="min-h-[200px] lg:pl-8">
      <AnimatePresence mode="wait" initial={false}>
        {edu ? (
          <motion.div
            key={edu.title + edu.period}
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl border-l-2 border-emerald-700 dark:border-engine pl-6"
          >
            <p className="label-mono">{edu.period}</p>
            <h3 className="mt-2 text-xl md:text-2xl font-semibold leading-snug">{edu.title}</h3>
            <p className="mt-1 text-sm font-medium text-accent">{edu.role}</p>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-titanium-muted dark:text-obsidian-muted">
              {edu.detail}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={false}
            animate={{ opacity: 1 }}
            className="label-mono pl-6 pt-2"
          >
            Select a book to read more.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Accordion({ open, setOpen }) {
  return (
    <ul className="divide-y divide-titanium-border dark:divide-obsidian-border">
      {education.map((edu, i) => {
        const isOpen = open === i;
        const panelId = `education-panel-${i}`;
        return (
          <li key={`${edu.period}-${edu.title}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="group w-full flex items-start gap-6 py-6 text-left"
            >
              <div className="flex-1 grid md:grid-cols-[7.5rem_1fr] gap-x-6 gap-y-1">
                <span className="label-mono pt-1">{edu.period}</span>
                <span>
                  <span className="block text-base md:text-lg font-semibold leading-snug group-hover:text-accent transition-colors duration-200">
                    {edu.title}
                  </span>
                  <span className="block mt-0.5 text-sm text-titanium-muted dark:text-obsidian-muted">{edu.role}</span>
                </span>
              </div>
              <Plus
                size={18}
                aria-hidden="true"
                className={`mt-1 shrink-0 text-titanium-muted dark:text-obsidian-muted transition-transform duration-300 ease-industrial ${
                  isOpen ? 'rotate-45' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 md:pl-[9rem] pr-10 max-w-3xl text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">
                    {edu.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export default function EducationSection() {
  const [open, setOpen] = useState(0);
  const [focus, setFocus] = useState(-1); // keyboard cursor, as an index into education
  const [env, setEnv] = useState({ webgl: false, wide: false, fine: false });
  const sectionRef = useRef(null);
  const inView = useNearViewport(sectionRef);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const read = () =>
      setEnv({ webgl: supportsWebGL(), wide: mq.matches, fine: window.matchMedia('(pointer: fine)').matches });
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);

  const shelf = env.webgl && env.wide;

  const onKeyDown = (e) => {
    const cur = slotOf(focus >= 0 ? focus : open >= 0 ? open : 0);
    let next = null;
    if (e.key === 'ArrowRight') next = Math.min(COUNT - 1, cur + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, cur - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = COUNT - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const i = focus >= 0 ? focus : indexOf(cur);
      setFocus(i);
      setOpen(open === i ? -1 : i);
      return;
    } else if (e.key === 'Escape') {
      setOpen(-1);
      return;
    } else return;
    e.preventDefault();
    setFocus(indexOf(next));
  };

  return (
    <section ref={sectionRef} id="education" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      {shelf ? (
        <>
          <div className="grid grid-cols-12 items-start gap-x-6 gap-y-8">
            <SectionHeading eyebrow="04 / Education" className="col-span-12 lg:col-span-5">
              Education
            </SectionHeading>
            <div className="col-span-12 lg:col-span-7">
              <DetailPanel open={open} reduceMotion={reduceMotion} />
            </div>
          </div>

          <div
            role="listbox"
            tabIndex={0}
            aria-label="Education, five books on a shelf. Use the arrow keys to move between books and Enter to open one."
            aria-activedescendant={focus >= 0 ? `edu-book-${focus}` : undefined}
            onKeyDown={onKeyDown}
            onBlur={() => setFocus(-1)}
            className="relative mt-6 h-[320px] md:h-[380px] lg:h-[440px] rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {inView && (
              <Suspense fallback={null}>
                <BookStack
                  entries={education}
                  selected={open}
                  onSelect={setOpen}
                  interactive={env.fine && !reduceMotion}
                  focused={focus}
                />
              </Suspense>
            )}
            {education.map((edu, i) => (
              <span
                key={edu.title + edu.period}
                id={`edu-book-${i}`}
                role="option"
                aria-selected={open === i}
                className="sr-only"
              >
                {edu.title}, {edu.period}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeading eyebrow="04 / Education" className="mb-10">
            Education
          </SectionHeading>
          <Accordion open={open} setOpen={setOpen} />
        </>
      )}
    </section>
  );
}
