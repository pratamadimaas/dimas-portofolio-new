import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { identity } from '../data/portfolioData';

// Same order as the page. Certificates sit right under Education.
const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education', also: ['certificates'] },
];

// Highlights the link of the section crossing the upper third of the viewport.
function useActiveSection() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const ids = ['about', 'projects', 'experience', 'skills', 'education', 'certificates', 'contact'];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-30% 0px -65% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Navbar({ toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();
  const isActive = (l) => active === l.href.slice(1) || Boolean(l.also?.includes(active));

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl pointer-events-auto"
      >
        <div className="rounded-full px-5 py-2.5 flex items-center gap-4 backdrop-blur-md bg-white/70 dark:bg-zinc-950/75 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-300">
          {/* Wordmark. The dot is a real availability flag, explained on hover. */}
          <a href="#top" className="flex items-center gap-2.5 shrink-0" title={identity.status}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-display font-semibold text-sm tracking-tight">Dimas Pratama</span>
            <span className="sr-only">, {identity.status}. Back to top</span>
          </a>

          {/* Navigation Items & Action */}
          <div className="flex items-center gap-4 shrink-0 ml-auto">
            <nav className="hidden lg:flex items-center gap-6" aria-label="Sections">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l) ? 'true' : undefined}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(l)
                      ? 'text-slate-900 dark:text-zinc-100'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <a
              href="#contact"
              className="hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg hover:opacity-90 transition-opacity duration-200"
            >
              Contact
            </a>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="relative w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition-colors duration-200 text-slate-700 dark:text-zinc-300"
            >
              <Moon size={14} className="hidden dark:block" />
              <Sun size={14} className="block dark:hidden" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="lg:hidden relative w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition-colors duration-200 text-slate-700 dark:text-zinc-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {menuOpen ? <X size={16} /> : <Menu size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden mt-2 rounded-2xl overflow-hidden backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="flex flex-col py-2">
                {[...links, { label: 'Contact', href: '#contact' }].map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={closeMenu}
                    aria-current={isActive(l) ? 'true' : undefined}
                    className={`px-5 py-3 text-sm font-medium hover:bg-slate-100/60 dark:hover:bg-zinc-900/60 transition-colors duration-200 ${
                      isActive(l) ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}