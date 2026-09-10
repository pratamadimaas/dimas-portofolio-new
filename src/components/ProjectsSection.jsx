import { motion } from 'framer-motion';
import { projects } from '../data/portfolioData';
import ProjectCard from './ProjectCard';

export default function ProjectsSection() {
  return (
    <section id="projects" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 max-w-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Production systems, not prototypes
        </h2>
       <p className="mt-3 text-titanium-muted dark:text-obsidian-muted">
  Seven systems, five of them live and publicly accessible right now. Two are desktop
  tools you can connect with me about directly.
</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(180px,auto)] gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}