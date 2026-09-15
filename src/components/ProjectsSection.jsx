import { motion } from 'framer-motion';
import { projects } from '../data/portfolioData';
import ProjectCard from './ProjectCard';
import SplitText from './SplitText';

export default function ProjectsSection() {
  return (
    <section id="projects" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 md:mb-16 max-w-2xl"
      >
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 dark:text-blue-400">
          Selected Work
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          <SplitText text="Production systems, not prototypes" />
        </h2>
        <p className="mt-3 text-titanium-muted dark:text-obsidian-muted">
          Nine systems built across public treasury operations, automation, and full-stack
          products six live and publicly accessible right now, three desktop or client tools
          you can connect with me about directly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}