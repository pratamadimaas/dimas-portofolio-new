import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { certificates } from '../data/portfolioData';
import SplitText from './SplitText';

export default function CertificatesSection() {
  return (
    <section id="certificates" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 max-w-2xl"
      >
        <span className="label-mono text-engine">CREDENTIALS</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          <SplitText text="Certificates & Continued Learning" />
        </h2>
        <p className="mt-3 text-titanium-muted dark:text-obsidian-muted">
          Ongoing formal training to back the practical skills built across projects above.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.map((cert, i) => {
          const viewHref = cert.pdfUrl || cert.imageUrl;
          const viewLabel = cert.pdfUrl ? 'View PDF' : 'View Image';

          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group surface rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden border-b border-titanium-border dark:border-obsidian-border bg-titanium-bg2 dark:bg-black/20">
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-industrial"
                />
              </div>

              <div className="p-6 flex flex-col flex-1 bg-transparent">
                <p className="label-mono">{cert.issuer}</p>
                <h3 className="mt-1.5 text-base font-semibold leading-snug">{cert.title}</h3>

                {viewHref && (
                  <a
                    href={viewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-titanium-muted dark:text-obsidian-muted hover:text-engine transition-colors duration-200 w-fit"
                  >
                    <Eye size={13} />
                    <span className="label-mono normal-case underline underline-offset-2 decoration-dotted">
                      {viewLabel}
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
