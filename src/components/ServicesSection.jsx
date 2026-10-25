import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { identity, services, serviceSteps } from '../data/portfolioData';
import SectionHeading from './SectionHeading';

export default function ServicesSection() {
  const reduceMotion = useReducedMotion();
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] },
        };

  return (
    <section id="services" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
        {/* Offer and the way to order it stay in view while the list scrolls. */}
        <div className="lg:col-span-4 lg:self-start lg:sticky lg:top-28">
          <SectionHeading eyebrow="Work with me">Freelance work</SectionHeading>
          <p className="mt-6 text-base leading-relaxed text-titanium-muted dark:text-obsidian-muted">
            I build tools for small teams and businesses. These are the kinds of work I take on.
          </p>

          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-titanium-border dark:border-obsidian-border px-3.5 py-1.5 text-sm">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-engine/60 motion-safe:animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-700 dark:bg-engine" />
            </span>
            {identity.status}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={identity.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-titanium-text px-6 py-3 text-sm font-medium text-titanium-bg transition-opacity duration-200 hover:opacity-85 dark:bg-obsidian-text dark:text-obsidian-bg"
            >
              Start a project
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">(opens LinkedIn in a new tab)</span>
            </a>
          </div>
        </div>

        <ol className="lg:col-span-8 border-t border-titanium-border dark:border-obsidian-border">
          {services.map((svc, i) => (
            <motion.li
              key={svc.title}
              {...rise(i * 0.06)}
              className="grid gap-x-6 gap-y-3 border-b border-titanium-border dark:border-obsidian-border py-8 sm:grid-cols-[3rem_1fr]"
            >
              <span className="font-mono text-sm text-accent sm:pt-1">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-xl font-semibold leading-snug">{svc.title}</h3>
                <p className="mt-2 max-w-prose text-sm md:text-base leading-relaxed text-titanium-muted dark:text-obsidian-muted">
                  {svc.text}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {svc.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-titanium-border dark:border-obsidian-border px-3 py-1 text-xs"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* How an order works */}
      <div className="mt-20 md:mt-28">
        <p className="eyebrow">How it works</p>
        <ol className="relative mt-8 grid gap-10 md:grid-cols-4 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute left-[10px] right-[10px] top-[10px] hidden h-px bg-titanium-border dark:bg-obsidian-border md:block"
          />
          {serviceSteps.map((step, i) => (
            <motion.li key={step.title} {...rise(i * 0.06)} className="relative">
              <span
                aria-hidden="true"
                className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-700 bg-titanium-bg font-mono text-[10px] text-accent dark:border-engine dark:bg-obsidian-bg"
              >
                {i + 1}
              </span>
              <h3 className="mt-5 font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
