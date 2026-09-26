import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Lock } from 'lucide-react';
import { projects, projectFilters } from '../data/portfolioData';
import ProjectCard from './ProjectCard';
import SplitText from './SplitText';

const anagram = projects.find((p) => p.id === 'anagram-project');

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('personal');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="projects" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 max-w-2xl"
      >
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 dark:text-blue-400">
          Selected Work
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          <SplitText text="Production systems, not prototypes" />
        </h2>
        <p className="mt-3 text-titanium-muted dark:text-obsidian-muted">
          Thirteen projects spanning machine learning, government treasury operations, and
          freelance client work, including Anagram Project, the education platform currently
          in active development.
        </p>
      </motion.div>

      {/* Anagram spotlight — always visible regardless of filter, since it's the current focus */}
      <motion.a
        href={anagram.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-2xl p-6 md:p-8 mb-10 block border border-engine/30 bg-gradient-to-br from-engine/[0.07] via-transparent to-pulse/[0.06]"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-engine opacity-75 animate-ping-soft" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-engine" />
              </span>
              <span className="label-mono text-engine">CURRENT FOCUS</span>
            </div>
            <h3 className="text-xl md:text-2xl font-display font-semibold">{anagram.name}</h3>
            <p className="text-sm text-titanium-muted dark:text-obsidian-muted mt-1 max-w-lg">
              {anagram.subtitle} — {anagram.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {anagram.stack.map((s) => (
                <span key={s} className="label-mono px-2.5 py-1 rounded-full border border-titanium-border dark:border-obsidian-border">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <ArrowUpRight
            size={20}
            className="shrink-0 text-titanium-muted dark:text-obsidian-muted group-hover:text-engine group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
          />
        </div>
      </motion.a>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {projectFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`label-mono px-4 py-2 rounded-full border transition-colors duration-200 ${
              activeFilter === f.key
                ? 'bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg border-transparent'
                : 'border-titanium-border dark:border-obsidian-border text-titanium-muted dark:text-obsidian-muted hover:text-titanium-text dark:hover:text-obsidian-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Note about private client work — only shown on the Freelance tab */}
      <AnimatePresence>
        {activeFilter === 'freelance' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-xl border border-titanium-border dark:border-obsidian-border p-4 mb-8 text-sm text-titanium-muted dark:text-obsidian-muted">
              <Lock size={15} className="shrink-0 mt-0.5" />
              <p>
                Several freelance projects including custom web applications, landing pages,
                company profile and education websites were developed for clients and remain
                private. For confidentiality reasons, they aren't shown here, but I'm happy to
                discuss the relevant technical experience directly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch"
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}