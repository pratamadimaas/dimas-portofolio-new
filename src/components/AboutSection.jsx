import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { identity, projects } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';

const IdBadge = lazy(() => import('./IdBadge'));

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Internal systems, listed on the back of the badge.
const builtAtWork = projects.filter((p) => p.category === 'instansi').slice(0, 5).map((p) => p.name.split(' (')[0]);

const facts = [
  { term: 'Works at', detail: 'Directorate General of Treasury, Ministry of Finance' },
  { term: 'Based in', detail: 'Purworejo, Central Java' },
  { term: 'Studying', detail: 'Information Systems, Universitas Siber Asia' },
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { margin: '200px' });
  const reduceMotion = useReducedMotion();
  const [env, setEnv] = useState({ webgl: false, fine: false });

  useEffect(() => {
    setEnv({ webgl: supportsWebGL(), fine: window.matchMedia('(pointer: fine)').matches });
  }, []);

  return (
    <section ref={sectionRef} id="about" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-16 items-center">
        <div className="relative h-[440px] sm:h-[520px] lg:h-[580px] order-last lg:order-first">
          {env.webgl && inView && (
            <Suspense fallback={null}>
              <IdBadge
                name={identity.name}
                role="Treasury Officer, KPPN Kolaka"
                built={builtAtWork}
                email={identity.email}
                photoSrc="/photo.webp"
                draggable={env.fine && !reduceMotion}
                animate={!reduceMotion}
              />
            </Suspense>
          )}
          {env.webgl && (
            <p className="label-mono absolute bottom-0 inset-x-0 text-center pointer-events-none">
              {env.fine ? 'Drag or click the card' : 'Tap the card to flip it'}
            </p>
          )}
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={reveal}>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How I got here
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-titanium-muted dark:text-obsidian-muted max-w-xl">
            {identity.summary}
          </p>

          <ol className="mt-8 max-w-xl border-l border-titanium-border dark:border-obsidian-border">
            {identity.path.map((step, i) => {
              const last = i === identity.path.length - 1;
              return (
                <li key={step.year} className="relative grid grid-cols-[3.5rem_1fr] gap-3 pl-5 pb-5 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[4.5px] top-[7px] h-2 w-2 rounded-full ${
                      last ? 'bg-engine' : 'bg-titanium-muted dark:bg-obsidian-muted'
                    }`}
                  />
                  <span className={`font-mono text-sm pt-px ${last ? 'text-engine' : 'text-titanium-muted dark:text-obsidian-muted'}`}>
                    {step.year}
                  </span>
                  <p className="text-sm md:text-base leading-relaxed">{step.text}</p>
                </li>
              );
            })}
          </ol>

          <dl className="mt-10 divide-y divide-titanium-border dark:divide-obsidian-border border-t border-titanium-border dark:border-obsidian-border max-w-xl">
            {facts.map((f) => (
              <div key={f.term} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                <dt className="label-mono pt-0.5">{f.term}</dt>
                <dd className="text-sm md:text-base">{f.detail}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
              <dt className="label-mono pt-0.5">Shares</dt>
              <dd className="text-sm md:text-base">
                <a
                  href={identity.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 hover:text-engine transition-colors duration-200"
                >
                  Build logs and tutorials as Code With Dims
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
