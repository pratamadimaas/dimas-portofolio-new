import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, Linkedin, FlaskConical } from 'lucide-react';
import { identity } from '../data/portfolioData';

const sizeClasses = {
  lg: 'md:col-span-2 md:row-span-2',
  md: 'md:col-span-1 md:row-span-2',
  sm: 'md:col-span-1 md:row-span-1',
};

export default function ProjectCard({ project }) {
  if (!project) return null;

  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  const isHosted = Boolean(project.url);
  const isLinkedIn = isHosted && project.url?.includes('linkedin.com');
  const isColab = isHosted && project.url?.includes('colab.research.google.com');

  const mailtoHref = `mailto:${identity?.email || ''}?subject=${encodeURIComponent(
    `File Request: ${project.name || 'Project'}`
  )}`;

  const primaryHref = isHosted ? project.url : mailtoHref;
  const primaryTarget = isHosted ? '_blank' : '_self';

  const linkLabel =
    project.linkLabel || (isHosted ? 'Visit System' : 'Request via Email');

  const LinkIcon = isLinkedIn
    ? Linkedin
    : isColab
    ? FlaskConical
    : isHosted
    ? ArrowUpRight
    : Mail;

  const handleCardClick = () => {
    if (primaryHref) {
      window.open(primaryHref, primaryTarget, 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      ref={ref}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl p-[1px] ${
        sizeClasses[project.size] || 'md:col-span-1 md:row-span-1'
      }`}
      style={{
        background: spot.active
          ? `radial-gradient(220px circle at ${spot.x}% ${spot.y}%, rgba(59,130,246,0.55), rgba(255,255,255,0.06) 60%, transparent 80%)`
          : 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="surface relative flex h-full w-full flex-col justify-between rounded-[15px] p-6">
        <div>
          {/* Tag List */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="label-mono border-titanium-border dark:border-obsidian-border rounded-full border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-lg font-semibold leading-snug">{project.name}</h3>
          <p className="label-mono mt-1">{project.subtitle}</p>

          {/* Description */}
          <p className="text-titanium-muted dark:text-obsidian-muted mt-3 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Footer Content */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-engine text-xs font-medium">
              {project.metric}
            </span>
            <span className="text-titanium-muted dark:text-obsidian-muted group-hover:text-titanium-text dark:group-hover:text-obsidian-text ease-industrial flex items-center gap-1.5 transition-colors duration-300">
              <span className="label-mono normal-case">{linkLabel}</span>
              {LinkIcon === ArrowUpRight ? (
                <ArrowUpRight
                  size={16}
                  className="ease-industrial transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              ) : (
                <LinkIcon size={15} />
              )}
            </span>
          </div>

          {/* Secondary Link (Misal untuk Google Colab Notebook) */}
          {project.secondaryUrl && (
            <a
              href={project.secondaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-titanium-muted dark:text-obsidian-muted hover:text-blue-500 dark:hover:text-blue-400 relative z-10 mb-3 flex w-fit items-center gap-1.5 text-xs transition-colors duration-200"
            >
              <FlaskConical size={12} />
              <span className="label-mono normal-case underline underline-offset-2 decoration-dotted">
                {project.secondaryLabel || 'View Notebook'}
              </span>
            </a>
          )}

          {/* Tech Stack List */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack?.map((s, index) => (
              <span key={s} className="label-mono">
                {s}
                {index !== project.stack.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}