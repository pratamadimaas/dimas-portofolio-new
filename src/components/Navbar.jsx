import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { identity } from '../data/portfolioData';

const links = [
  { label: 'Systems', href: '#projects' },
  { label: 'Capabilities', href: '#skills' },
  { label: 'Trajectory', href: '#timeline' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ isDark, toggleTheme }) {
  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl pointer-events-auto"
      >
        <div className="rounded-full px-4 py-2.5 flex items-center gap-3 backdrop-blur-md bg-white/70 dark:bg-zinc-950/75 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-300">
          {/* Status Ping Node */}
          <a href="#top" className="flex items-center shrink-0" aria-label="Back to top">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </a>

          {/* Status Telemetry Text */}
          <span
            title={identity.status}
            className="flex-1 min-w-0 text-center truncate font-mono text-xs tracking-wide text-slate-500 dark:text-zinc-400 hidden sm:block"
          >
            {identity.status}
          </span>

          {/* Navigation Items & Action */}
          <div className="flex items-center gap-5 shrink-0 ml-auto sm:ml-0">
            <nav className="hidden md:flex items-center gap-5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors duration-200"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="relative w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition-colors duration-200 text-slate-700 dark:text-zinc-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {isDark ? <Moon size={14} /> : <Sun size={14} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>
    </div>
  );
}