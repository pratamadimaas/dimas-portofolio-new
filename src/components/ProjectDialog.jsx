import { useEffect, useRef } from 'react';
import { ArrowUpRight, FlaskConical, X } from 'lucide-react';

const isOnRequest = (p) => !p.url || p.url.includes('linkedin.com');

/**
 * Project detail panel on a native <dialog>: the browser handles focus trapping,
 * Esc and the inert background. Slides in from the right on desktop, up from the
 * bottom on phones.
 */
export default function ProjectDialog({ project, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  const onRequest = project && isOnRequest(project);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Click on the backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(e) => e.target === ref.current && ref.current.close()}
      aria-labelledby="project-dialog-title"
      className="project-dialog m-0 mt-auto sm:mt-0 sm:ml-auto h-[88dvh] sm:h-[100dvh] max-h-none w-full sm:max-w-xl p-0 rounded-t-2xl sm:rounded-none border-0 sm:border-l border-titanium-border dark:border-obsidian-border bg-titanium-bg dark:bg-obsidian-bg text-titanium-text dark:text-obsidian-text"
    >
      {project && (
        <article className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-titanium-border dark:border-obsidian-border">
            <p className="label-mono">{project.tags?.join(' / ')}</p>
            <button
              type="button"
              onClick={() => ref.current.close()}
              aria-label="Close project details"
              className="-mr-2 rounded-full p-2 text-titanium-muted dark:text-obsidian-muted hover:text-titanium-text dark:hover:text-obsidian-text transition-colors duration-200"
            >
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8">
            <h2 id="project-dialog-title" className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
              {project.name}
            </h2>
            <p className="mt-2 text-titanium-muted dark:text-obsidian-muted">{project.subtitle}</p>

            {project.image && (
              <img
                src={project.image}
                alt={`Screenshot of ${project.name}`}
                width="1200"
                height="750"
                decoding="async"
                className="mt-8 w-full h-auto rounded-xl border border-titanium-border dark:border-obsidian-border"
              />
            )}

            {project.metric && (
              <div className="mt-8 border-l-2 border-engine pl-4">
                <p className="label-mono">Highlight</p>
                <p className="mt-1 font-display text-lg font-semibold leading-snug">{project.metric}</p>
              </div>
            )}

            <div className="mt-8">
              <p className="label-mono">Overview</p>
              <p className="mt-2 leading-relaxed text-titanium-text/85 dark:text-obsidian-text/85">
                {project.description}
              </p>
            </div>

            {project.stack?.length > 0 && (
              <div className="mt-8">
                <p className="label-mono">Built with</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-titanium-border dark:border-obsidian-border px-3 py-1 text-sm"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <footer className="flex flex-wrap items-center gap-3 px-6 py-4 border-t border-titanium-border dark:border-obsidian-border">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg px-5 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
            >
              {onRequest ? 'Ask about it on LinkedIn' : 'Open project'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            {project.secondaryUrl && (
              <a
                href={project.secondaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-titanium-border dark:border-obsidian-border px-5 py-2.5 text-sm font-medium hover:border-engine transition-colors duration-200"
              >
                <FlaskConical size={15} aria-hidden="true" />
                Notebook
              </a>
            )}
          </footer>
        </article>
      )}
    </dialog>
  );
}
