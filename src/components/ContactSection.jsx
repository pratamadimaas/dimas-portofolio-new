import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy, Download, Linkedin } from 'lucide-react';
import { SiInstagram, SiTiktok } from '@icons-pack/react-simple-icons';
import { identity } from '../data/portfolioData';

const channels = [
  { label: 'LinkedIn', href: identity.socials.linkedin, Icon: Linkedin },
  { label: 'TikTok', href: identity.socials.tiktok, Icon: SiTiktok },
  { label: 'Instagram', href: identity.socials.instagram, Icon: SiInstagram },
].filter((c) => c.href);

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the address is still a mailto link */
    }
  };

  return (
    <section id="contact" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border-t border-titanium-border dark:border-obsidian-border pt-12"
      >
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Contact</h2>
        <p className="mt-3 max-w-md text-titanium-muted dark:text-obsidian-muted">
          Freelance work, a collaboration, or a question about something I built. Email is the fastest way to reach me.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={`mailto:${identity.email}`}
            className="font-display font-semibold tracking-tight text-2xl sm:text-4xl md:text-5xl break-all hover:text-engine transition-colors duration-200"
          >
            {identity.email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-2 rounded-full border border-titanium-border dark:border-obsidian-border px-4 py-2 text-sm font-medium hover:border-engine transition-colors duration-200"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-titanium-border dark:border-obsidian-border bg-titanium-border dark:bg-obsidian-border">
          {channels.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center justify-between gap-3 bg-titanium-bg dark:bg-obsidian-bg px-5 py-5 hover:bg-titanium-bg2 dark:hover:bg-obsidian-surface transition-colors duration-200"
              >
                <span className="flex items-center gap-3 font-medium">
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="text-titanium-muted dark:text-obsidian-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-engine"
                />
              </a>
            </li>
          ))}
          <li>
            <a
              href="/Muhamad_Dimas_Pratama_CV.pdf"
              download
              className="group flex h-full items-center justify-between gap-3 bg-titanium-bg dark:bg-obsidian-bg px-5 py-5 hover:bg-titanium-bg2 dark:hover:bg-obsidian-surface transition-colors duration-200"
            >
              <span className="font-medium">Curriculum vitae</span>
              <Download
                size={16}
                aria-hidden="true"
                className="text-titanium-muted dark:text-obsidian-muted group-hover:text-engine transition-colors duration-200"
              />
            </a>
          </li>
        </ul>
      </motion.div>
    </section>
  );
}
