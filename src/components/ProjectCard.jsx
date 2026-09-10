import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, Linkedin } from 'lucide-react';
import { identity } from '../data/portfolioData';

const sizeClasses = {
  lg: 'md:col-span-2 md:row-span-2',
  md: 'md:col-span-1 md:row-span-2',
  sm: 'md:col-span-1 md:row-span-1',
};

export default function ProjectCard({ project }) {
  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  const isHosted = Boolean(project.url);
  const isLinkedIn = isHosted && project.url.includes('linkedin.com');

  const mailtoHref = `mailto:${identity.email}?subject=${encodeURIComponent(
    `File Request: ${project.name}`
  )}`;

  const linkProps = isHosted
    ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: mailtoHref };

  const linkLabel =
    project.linkLabel || (isHosted ? 'Visit System' : 'Request via Email');

  const LinkIcon = isLinkedIn ? Linkedin : isHosted ? ArrowUpRight : Mail;

  return (
    <motion.a
      ref={ref}
      {...linkProps}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-2xl p-[1px] overflow-hidden ${sizeClasses[project.size] || 'md:col-span-1 md:row-span-1'}`}
      style={{
        background: spot.active
          ? `radial-gradient(220px circle at ${spot.x}% ${spot.y}%, rgba(59,130,246,0.55), rgba(255,255,255,0.06) 60%, transparent 80%)`
          : 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="relative h-full w-full rounded-[15px] surface p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="label-mono px-2 py-0.5 rounded-full border border-titanium-border dark:border-obsidian-border"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-semibold leading-snug">{project.name}</h3>
          <p className="label-mono mt-1">{project.subtitle}</p>

          <p className="mt-3 text-sm text-titanium-muted dark:text-obsidian-muted leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-engine">{project.metric}</span>
            <span className="flex items-center gap-1.5 text-titanium-muted dark:text-obsidian-muted group-hover:text-titanium-text dark:group-hover:text-obsidian-text transition-colors duration-300 ease-industrial">
              <span className="label-mono normal-case">{linkLabel}</span>
              {LinkIcon === ArrowUpRight ? (
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ease-industrial"
                />
              ) : (
                <LinkIcon size={15} />
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span key={s} className="label-mono">
                {s}
                {s !== project.stack[project.stack.length - 1] ? ' ·' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.a>
  );
}