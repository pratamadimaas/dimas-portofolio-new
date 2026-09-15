import { motion } from 'framer-motion';
import { identity } from '../data/portfolioData';
import SplitText from './SplitText';

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function AboutSection() {
  return (
    <section id="about" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 max-w-2xl">
        <SplitText text="Where treasury operations meet software architecture" />
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={reveal}
          className="md:col-span-2 surface rounded-2xl p-7"
        >
          <p className="label-mono mb-3">DOMAIN DOSSIER</p>
          <p className="text-base md:text-lg leading-relaxed">{identity.summary}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={reveal}
          className="surface rounded-2xl p-7 flex flex-col justify-between"
        >
          <div>
            <p className="label-mono mb-3">CREDENTIAL</p>
            <p className="text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">
              {identity.credential}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={reveal}
          className="surface rounded-2xl p-7"
        >
          <p className="label-mono mb-3">SECTOR</p>
          <p className="text-2xl font-display font-semibold">State Treasury</p>
          <p className="text-sm text-titanium-muted dark:text-obsidian-muted mt-1">
            Kementerian Keuangan RI / Ditjen Perbendaharaan
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={reveal}
          className="md:col-span-2 surface rounded-2xl p-7"
        >
          <p className="label-mono mb-3">ENGINEERING PHILOSOPHY</p>
          <p className="text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">
            Critical transaction systems leave no room for inconsistent data. Every system I build
            starts with strict data isolation and a clear audit trail, then automation that
            replaces the manual process entirely rather than just speeding it up. Years inside
            government treasury operations taught me that understanding a problem deeply matters
            just as much as knowing how to build the solution.
          </p>
        </motion.div>
      </div>
    </section>
  );
}