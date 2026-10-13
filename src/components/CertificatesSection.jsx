import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { certificates } from '../data/portfolioData';
import TiltedCard from './TiltedCard';

export default function CertificatesSection() {
  const [issuer, setIssuer] = useState('All');
  const issuers = useMemo(() => ['All', ...new Set(certificates.map((c) => c.issuer))], []);
  const visible = issuer === 'All' ? certificates : certificates.filter((c) => c.issuer === issuer);

  return (
    <section id="certificates" className="px-6 md:px-10 max-w-6xl mx-auto py-20 md:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Certificates</h2>
          <p className="label-mono mt-2">{certificates.length} completed courses</p>
        </div>

        <div role="group" aria-label="Filter certificates by issuer" className="flex gap-2">
          {issuers.map((name) => {
            const active = name === issuer;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => setIssuer(name)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors duration-200 ${
                  active
                    ? 'border-engine bg-engine/10 text-engine'
                    : 'border-titanium-border dark:border-obsidian-border text-titanium-muted dark:text-obsidian-muted hover:text-titanium-text dark:hover:text-obsidian-text'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9">
        {visible.map((cert, i) => (
          <motion.li
            key={cert.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltedCard
              imageSrc={cert.imageUrl}
              alt={`${cert.title} certificate`}
              href={cert.pdfUrl || cert.imageUrl}
            >
              <div className="mt-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="label-mono">{cert.issuer}</p>
                  <h3 className="mt-1 text-sm font-medium leading-snug line-clamp-2 group-hover:text-engine transition-colors duration-200">
                    {cert.title}
                  </h3>
                </div>
                <ArrowUpRight
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-titanium-muted dark:text-obsidian-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
            </TiltedCard>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
