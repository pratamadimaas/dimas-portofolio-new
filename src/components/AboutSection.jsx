import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNearViewport } from '../hooks/useNearViewport';
import { ArrowUpRight } from 'lucide-react';
import { identity, projects } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';
import SectionHeading from './SectionHeading';

const IdBadge = lazy(() => import('./IdBadge'));

// Internal systems, listed on the back of the badge.
const builtAtWork = projects.filter((p) => p.category === 'instansi').slice(0, 5).map((p) => p.name.split(' (')[0]);

const shares = (
  <a
    href={identity.socials.tiktok}
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-1 hover:text-accent transition-colors duration-200"
  >
    Build logs and tutorials as Code With Dims
    <ArrowUpRight
      size={15}
      aria-hidden="true"
      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  </a>
);

const facts = [
  { term: 'Works at', detail: 'Directorate General of Treasury, Ministry of Finance', side: 'left', y: 210 },
  { term: 'Based in', detail: 'Purworejo, Central Java', side: 'right', y: 320 },
  { term: 'Studying', detail: 'Information Systems, Universitas Siber Asia', side: 'left', y: 450 },
  { term: 'Shares', detail: shares, side: 'right', y: 560 },
];

// Half the card's on-screen width at the desktop stage height (760px): leaders end on its edge.
const CARD_HALF = 152;

function Callout({ fact, index, reduceMotion }) {
  const left = fact.side === 'left';
  const edge = left ? { right: `calc(50% + ${CARD_HALF}px)` } : { left: `calc(50% + ${CARD_HALF}px)` };
  const text = (
    <div className={`w-[58%] shrink-0 ${left ? 'text-right' : 'text-left'}`}>
      <p className="label-mono">{fact.term}</p>
      <p className="mt-1 text-sm md:text-base leading-snug">{fact.detail}</p>
    </div>
  );
  const leader = (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={`h-6 min-w-0 flex-1 overflow-visible text-accent ${left ? '' : '-scale-x-100'}`}
    >
      <path
        d="M0 12 H50 L72 4 H100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
  const dot = <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700 dark:bg-engine" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ top: fact.y, width: `min(380px, calc(50% - ${CARD_HALF + 16}px))`, ...edge }}
      className="absolute z-10 hidden lg:block"
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
        className={`flex items-center gap-2 ${left ? '' : 'flex-row-reverse'}`}
      >
        {text}
        {leader}
        {dot}
      </motion.div>
    </motion.div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef(null);
  const inView = useNearViewport(sectionRef);
  const reduceMotion = useReducedMotion();
  const [env, setEnv] = useState({ webgl: false, fine: false });

  useEffect(() => {
    setEnv({ webgl: supportsWebGL(), fine: window.matchMedia('(pointer: fine)').matches });
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative pb-24 md:pb-32">
      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading eyebrow="01 / About" className="pt-24 lg:absolute lg:left-10 lg:top-24 lg:z-10 lg:pt-0">
          About me
        </SectionHeading>

        {/* Stage: the badge hangs from the top edge of the section. */}
        <div className="relative mt-4 h-[460px] sm:h-[560px] lg:mt-0 lg:h-[760px]">
          {env.webgl && inView && (
            <div
              role="img"
              aria-label="Staff ID badge swinging on a lanyard. Drag it or click to flip it."
              className="absolute inset-y-0 left-1/2 w-[min(100%,640px)] -translate-x-1/2"
            >
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
            </div>
          )}
          {env.webgl &&
            facts.map((f, i) => <Callout key={f.term} fact={f} index={i} reduceMotion={reduceMotion} />)}
          {env.webgl && (
            <p className="label-mono pointer-events-none absolute bottom-2 inset-x-0 text-center">
              {env.fine ? 'Drag or click the card' : 'Tap the card to flip it'}
            </p>
          )}
        </div>

        {/* Below the desktop breakpoint the callouts become a plain list. */}
        <dl
          className={`mx-auto max-w-xl divide-y divide-titanium-border dark:divide-obsidian-border border-t border-titanium-border dark:border-obsidian-border ${
            env.webgl ? 'lg:hidden' : ''
          }`}
        >
          {facts.map((f) => (
            <div key={f.term} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
              <dt className="label-mono pt-0.5">{f.term}</dt>
              <dd className="text-sm md:text-base">{f.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
