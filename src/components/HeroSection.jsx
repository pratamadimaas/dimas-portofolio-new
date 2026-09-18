import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowDownRight, Linkedin } from 'lucide-react';
import { identity } from '../data/portfolioData';
import ThreeCanvas from './ThreeCanvas';
import TerminalHUD from './TerminalHUD';
import MagneticButton from './MagneticButton';
import DecryptedText from './DecryptedText';
import CountUp from './CountUp';

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

function TikTokIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 3.5c.6 2.2 2.1 3.6 4.3 3.9" />
      <path d="M19.8 7.8v3.3c-1.9 0-3.6-.6-5-1.6v6.7a5.2 5.2 0 1 1-4.5-5.16" />
    </svg>
  );
}

export default function HeroSection({ isDark }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
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
            <DecryptedText text={identity.name} startDelay={300} speed={28} revealDelay={38} />
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

            <a
              href="https://linkedin.com/in/pratamadimaas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-titanium-border dark:border-obsidian-border text-titanium-muted dark:text-obsidian-muted hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors duration-200"
            >
              <Linkedin size={16} strokeWidth={1.8} />
            </a>

            <a
              href={identity.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-titanium-border dark:border-obsidian-border text-titanium-muted dark:text-obsidian-muted hover:text-slate-900 dark:hover:text-zinc-100 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors duration-200"
            >
              <TikTokIcon width={16} height={16} />
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 grid grid-cols-3 gap-4 max-w-md border-t border-titanium-border dark:border-obsidian-border pt-6"
          >
            {identity.telemetry.map((t) => (
              <div key={t.label}>
                <div className="font-display text-xl md:text-2xl font-semibold">
                  <CountUp value={t.value} duration={1400} startDelay={600} />
                </div>
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