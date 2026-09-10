import { motion } from 'framer-motion';
import { experience, education } from '../data/portfolioData';

function TimelineColumn({ heading, entries }) {
  return (
    <div>
      <p className="label-mono mb-6">{heading}</p>

      <div className="relative pl-8 md:pl-10">
        <div className="absolute left-[5px] md:left-[7px] top-2 bottom-2 w-px bg-titanium-border dark:bg-obsidian-border" />

        <div className="space-y-10">
          {entries.map((t, i) => (
            <motion.div
              key={`${t.period}-${t.title}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-8 md:-left-10 top-1.5 w-[11px] h-[11px] rounded-full bg-titanium-bg dark:bg-obsidian-bg border-2 border-engine" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="label-mono">{t.period}</p>
                {t.badge && (
                  <span className="label-mono px-2 py-0.5 rounded-full border border-titanium-border dark:border-obsidian-border">
                    {t.badge}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-base md:text-lg">{t.title}</h3>
              {t.role && (
                <p className="text-sm text-engine mt-0.5">{t.role}</p>
              )}
              <p className="mt-1 text-sm text-titanium-muted dark:text-obsidian-muted max-w-md">
                {t.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section id="timeline" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl md:text-4xl font-semibold tracking-tight mb-14 max-w-2xl"
      >
        Trajectory
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-14 md:gap-10">
        <TimelineColumn heading="Pengalaman Kerja" entries={experience} />
        <TimelineColumn heading="Pendidikan" entries={education} />
      </div>
    </section>
  );
}