import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: (staggerDelay) => ({
    transition: { staggerChildren: staggerDelay, delayChildren: 0 },
  }),
};

const wordVariant = {
  hidden: { opacity: 0, y: '110%' },
  show: { opacity: 1, y: '0%', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function SplitText({ text, className = '', staggerDelay = 0.045 }) {
  const words = text.split(' ');

  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      custom={staggerDelay}
      variants={container}
      className={`inline ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top mr-[0.28em] last:mr-0">
          <motion.span variants={wordVariant} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}