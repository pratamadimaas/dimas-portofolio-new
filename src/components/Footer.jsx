import { Instagram } from 'lucide-react';
import { identity } from '../data/portfolioData';

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

export default function Footer() {
  const year = new Date().getFullYear();
  const formattedName = identity?.name ? identity.name.toUpperCase().replace(/\s+/g, '_') : 'PORTFOLIO';

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-[#09090b]/40 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Identity & Build Status */}
        <p className="font-mono text-xs tracking-wider text-slate-500 dark:text-zinc-400">
          © {year} {formattedName} <span className="opacity-40">//</span> BUILD:STABLE
        </p>

        {/* Social Actions & Independent Tagline */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            {identity?.socials?.instagram && (
              <a
                href={identity.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors duration-200"
              >
                <Instagram size={17} strokeWidth={1.8} />
              </a>
            )}

            {identity?.socials?.tiktok && (
              <a
                href={identity.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors duration-200"
              >
                <TikTokIcon width={17} height={17} />
              </a>
            )}
          </div>

          <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />

          <p className="font-mono text-xs text-slate-400 dark:text-zinc-500">
            Architected, coded, and deployed by dims.
          </p>
        </div>

      </div>
    </footer>
  );
}