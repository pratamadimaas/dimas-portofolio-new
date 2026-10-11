import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { certificates } from '../data/portfolioData';

export default function CertificatesSection() {
  return (
    <section id="certificates" className="px-6 md:px-10 max-w-6xl mx-auto py-20 md:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Certificates
        </h2>
        <p className="label-mono">{certificates.length} completed courses</p>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
        {certificates.map((cert, i) => {
          const href = cert.pdfUrl || cert.imageUrl;
          return (
            <motion.li
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-titanium-border dark:border-obsidian-border bg-titanium-bg2 dark:bg-obsidian-surface">
                  <img
                    src={cert.imageUrl}
                    alt={`${cert.title} certificate`}
                    width="720"
                    height="540"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-industrial group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
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
              </a>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
