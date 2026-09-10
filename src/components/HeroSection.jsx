import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowDownRight } from 'lucide-react';
import { identity } from '../data/portfolioData';
import ThreeCanvas from './ThreeCanvas';
import TerminalHUD from './TerminalHUD';
import MagneticButton from './MagneticButton';

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

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <section id="top" className="relative pt-36 pb-20 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <TerminalHUD />
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-[2.6rem] leading-[1.05] sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance"
          >
            {identity.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 text-lg md:text-xl text-titanium-muted dark:text-obsidian-muted max-w-xl"
          >
            {identity.role}
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 text-sm md:text-base leading-relaxed text-titanium-muted dark:text-obsidian-muted max-w-xl"
          >
            {identity.summary}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton onClick={copyEmail} primary>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Email Copied' : 'Initialize Communication'}
            </MagneticButton>
            <MagneticButton href="#projects">
              Explore Systems
              <ArrowDownRight size={15} />
            </MagneticButton>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 grid grid-cols-3 gap-4 max-w-md border-t border-titanium-border dark:border-obsidian-border pt-6"
          >
            {identity.telemetry.map((t) => (
              <div key={t.label}>
                <div className="font-display text-xl md:text-2xl font-semibold">{t.value}</div>
                <div className="label-mono mt-1">{t.label}</div>
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
          <ThreeCanvas isDark={isDark} className="w-full h-full" />
        </motion.div>
      </div>
    </section>
  );
}
