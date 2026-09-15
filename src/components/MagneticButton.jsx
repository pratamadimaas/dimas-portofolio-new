import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ClickSpark from './ClickSpark';

export default function MagneticButton({ children, onClick, href, className = '', primary = false }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    setPos({ x: relX * 0.28, y: relY * 0.4 });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const Tag = href ? 'a' : 'button';

  const base = primary
    ? 'bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg'
    : 'surface text-titanium-text dark:text-obsidian-text';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.4 }}
      className="inline-block"
    >
      <ClickSpark sparkColor={primary ? '#22c55e' : '#3b82f6'} className="inline-block rounded-full">
        <Tag
          href={href}
          onClick={onClick}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ease-industrial ${base} ${className}`}
        >
          {children}
        </Tag>
      </ClickSpark>
    </motion.div>
  );
}