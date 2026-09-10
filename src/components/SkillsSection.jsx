import { motion } from 'framer-motion';
import { stackMatrix } from '../data/portfolioData';

export default function SkillsSection() {
  return (
    <section id="skills" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 max-w-2xl"
      >
        Capability & stack matrix
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-4">
        {stackMatrix.map((group, gi) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: gi * 0.06 }}
            className="surface rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{group.group}</h3>
              <span className="label-mono">{String(group.items.length).padStart(2, '0')}</span>
            </div>
            <ul className="space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-titanium-muted dark:text-obsidian-muted"
                >
                  <span className="w-1 h-1 rounded-full bg-pulse shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
