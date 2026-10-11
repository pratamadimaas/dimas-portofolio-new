import { Linkedin } from 'lucide-react';
import { SiInstagram, SiTiktok } from '@icons-pack/react-simple-icons';
import { identity } from '../data/portfolioData';

const socials = [
  { label: 'LinkedIn', href: identity.socials.linkedin, Icon: Linkedin },
  { label: 'TikTok', href: identity.socials.tiktok, Icon: SiTiktok },
  { label: 'Instagram', href: identity.socials.instagram, Icon: SiInstagram },
].filter((s) => s.href);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-titanium-border dark:border-obsidian-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-sm text-titanium-muted dark:text-obsidian-muted">
          © {year} {identity.name}. Designed and built by Dimas.
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-titanium-muted dark:text-obsidian-muted hover:text-titanium-text dark:hover:text-obsidian-text transition-colors duration-200"
            >
              <Icon size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
