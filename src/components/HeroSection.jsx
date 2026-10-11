import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download } from 'lucide-react';
import { identity } from '../data/portfolioData';
import MagneticButton from './MagneticButton';
import DecryptedText from './DecryptedText';

const HeroScene = lazy(() => import('./HeroScene'));

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection({ isDark }) {
  const [copied, setCopied] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // The 3D scene is decoration. Start it on the visitor's first interaction, or a few
  // seconds after load, so building it never competes with the page becoming usable.
  useEffect(() => {
    const events = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'];
    let timer;
    let idleId;
    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener('load', arm);
      clearTimeout(timer);
    }
    function start() {
      cleanup();
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(() => setShow3D(true), { timeout: 1000 });
      else setShow3D(true);
    }
    function arm() {
      events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
      timer = setTimeout(start, 4000);
    }
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      cleanup();
      if (idleId) window.cancelIdleCallback(idleId);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable - no-op */
    }
  };

  return (
    <section id="top" className="relative pt-28 md:pt-32 pb-20 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h1
            className="text-[2.6rem] leading-[1.05] sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance"
          >
            <DecryptedText text={identity.name} startDelay={300} speed={28} revealDelay={38} />
          </motion.h1>

          <motion.p
            className="mt-4 text-lg md:text-xl text-titanium-muted dark:text-obsidian-muted max-w-xl"
          >
            {identity.role}
          </motion.p>

          <motion.p
            className="mt-5 text-sm md:text-base leading-relaxed text-titanium-muted dark:text-obsidian-muted max-w-xl"
          >
            {identity.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton onClick={copyEmail} primary>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Email Copied' : 'Copy Email'}
            </MagneticButton>

            <MagneticButton href="/Muhamad_Dimas_Pratama_CV.pdf" download>
              Download CV
              <Download size={15} />
            </MagneticButton>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 grid grid-cols-3 gap-6 max-w-xl border-t border-titanium-border dark:border-obsidian-border pt-6"
          >
            {identity.telemetry.map((t) => (
              <div key={t.label}>
                <div className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                  {t.value}
                </div>
                <div className="mt-1 text-sm leading-snug text-titanium-muted dark:text-obsidian-muted">{t.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative h-[320px] md:h-[420px]"
        >
          {show3D && (
            <Suspense fallback={null}>
              <HeroScene isDark={isDark} className="w-full h-full" />
            </Suspense>
          )}
        </motion.div>
      </div>
    </section>
  );
}
