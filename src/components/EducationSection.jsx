import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { education } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';

const BookStack = lazy(() => import('./BookStack'));

export default function EducationSection() {
  const [open, setOpen] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { margin: '200px' });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setWebgl(supportsWebGL());
    setFinePointer(window.matchMedia('(pointer: fine)').matches);
  }, []);

  return (
    <section ref={sectionRef} id="education" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12">
        Education
      </h2>

      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
        <div className="h-[300px] sm:h-[380px] lg:h-[460px]">
          {webgl && inView && (
            <Suspense fallback={null}>
              <BookStack
                entries={education}
                selected={open}
                onSelect={setOpen}
                interactive={finePointer && !reduceMotion}
              />
            </Suspense>
          )}
        </div>

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
                      <span className="block text-base md:text-lg font-semibold leading-snug group-hover:text-engine transition-colors duration-200">
                        {edu.title}
                      </span>
                      <span className="block mt-0.5 text-sm text-titanium-muted dark:text-obsidian-muted">
                        {edu.role}
                      </span>
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
      </div>
    </section>
  );
}
