import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { projects, projectFilters } from '../data/portfolioData';
import DistortImage from './DistortImage';
import ProjectDialog from './ProjectDialog';

// Bento order and sizing. Row 1: the two flagship projects (one wide + one narrow), row 2: three equal.
const FEATURED = [
  { id: 'mahir-excel', span: 'md:col-span-4', height: 'md:h-[360px]' },
  { id: 'anagram-project', span: 'md:col-span-2', height: 'md:h-[360px]', label: 'Current focus' },
  { id: 'si-caput', span: 'md:col-span-2', height: 'md:h-[240px]', alignX: 0 },
  { id: 'football-player-clustering', span: 'md:col-span-2', height: 'md:h-[240px]' },
  { id: 'taksir-rumah', span: 'md:col-span-2', height: 'md:h-[240px]' },
];

const featuredIds = new Set(FEATURED.map((f) => f.id));
const featured = FEATURED.map((f) => ({ ...f, project: projects.find((p) => p.id === f.id) })).filter(
  (f) => f.project
);
const others = projects.filter((p) => !featuredIds.has(p.id));
const filterLabel = Object.fromEntries(projectFilters.map((f) => [f.key, f.label]));

const isOnRequest = (p) => !p.url || p.url.includes('linkedin.com');

function FeaturedCard({ project, span, height, label, alignX, index, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      // Whole card is clickable for the mouse; the title button is the keyboard and
      // screen-reader target. No overlay, so the image keeps its pointer distortion.
      onClick={() => onOpen(project.id)}
      className={`group flex flex-col cursor-pointer ${span}`}
    >
      <DistortImage
        src={project.image}
        alt={`Screenshot of ${project.name}`}
        alignX={alignX}
        className={`aspect-[16/10] md:aspect-auto ${height} rounded-2xl border border-titanium-border dark:border-obsidian-border bg-titanium-bg2 dark:bg-obsidian-surface`}
      />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {label && <p className="label-mono text-engine mb-1">{label}</p>}
          <h3 className="font-semibold leading-snug">
            <button
              type="button"
              aria-haspopup="dialog"
              className="text-left"
            >
              {project.name}
            </button>
          </h3>
          <p className="mt-0.5 text-sm text-titanium-muted dark:text-obsidian-muted line-clamp-1">
            {project.subtitle}
          </p>
        </div>
        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-titanium-muted dark:text-obsidian-muted transition-transform duration-300 ease-industrial group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-engine"
        />
      </div>
    </motion.div>
  );
}

function ProjectRow({ project, onOpen }) {
  const onRequest = isOnRequest(project);

  return (
    <li className="group relative flex items-start justify-between gap-4 rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-titanium-bg2 dark:hover:bg-obsidian-surface">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          aria-haspopup="dialog"
          className="text-left font-medium leading-snug after:absolute after:inset-0 after:rounded-xl"
        >
          {project.name}
        </button>
        <p className="mt-0.5 text-sm text-titanium-muted dark:text-obsidian-muted line-clamp-1">
          {project.subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 pt-0.5">
        {project.secondaryUrl && (
          <a
            href={project.secondaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} notebook`}
            title={project.secondaryLabel || 'View notebook'}
            className="relative z-10 text-titanium-muted dark:text-obsidian-muted hover:text-engine transition-colors duration-200"
          >
            <FlaskConical size={15} />
          </a>
        )}
        {onRequest ? (
          <span className="label-mono whitespace-nowrap">On request</span>
        ) : (
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="text-titanium-muted dark:text-obsidian-muted transition-transform duration-300 ease-industrial group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-engine"
          />
        )}
      </div>
    </li>
  );
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace(/^#project-/, '');
      setOpenId(projects.some((p) => p.id === id) ? id : null);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const open = useCallback((id) => {
    setOpenId(id);
    history.replaceState(null, '', `#project-${id}`);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
    if (window.location.hash.startsWith('#project-')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return others;
    return others.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="projects" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-engine">Selected Work</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Things I have built
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-10">
        {featured.map((f, i) => (
          <FeaturedCard key={f.id} index={i} onOpen={open} {...f} />
        ))}
      </div>

      <div className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">More projects</h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">
            {projectFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={activeFilter === f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`label-mono px-3.5 py-1.5 rounded-full border transition-colors duration-200 ${
                  activeFilter === f.key
                    ? 'bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg border-transparent'
                    : 'border-titanium-border dark:border-obsidian-border text-titanium-muted dark:text-obsidian-muted hover:text-titanium-text dark:hover:text-obsidian-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 -mx-4"
          >
            {filtered.map((p) => (
              <ProjectRow key={p.id} project={p} onOpen={open} />
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3.5 text-sm text-titanium-muted dark:text-obsidian-muted">
                Every {filterLabel[activeFilter]} project is already featured above.
              </li>
            )}
          </motion.ul>
        </AnimatePresence>

        <p className="mt-6 text-sm text-titanium-muted dark:text-obsidian-muted">
          Several client projects are private and not listed here. Happy to walk through them on a call.
        </p>
      </div>

      <ProjectDialog project={projects.find((p) => p.id === openId) ?? null} onClose={close} />
    </section>
  );
}
