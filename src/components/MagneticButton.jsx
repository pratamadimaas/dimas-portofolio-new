import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const spring = { stiffness: 150, damping: 12, mass: 0.4 };

export default function MagneticButton({ children, onClick, href, className = '', primary = false, ...rest }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  // Motion values update outside React's render cycle, so tracking the cursor
  // doesn't re-render the button on every mousemove.
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  const handleMove = (e) => {
    if (reduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = href ? 'a' : 'button';

  const base = primary
    ? 'bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg'
    : 'surface text-titanium-text dark:text-obsidian-text';

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ x, y }} className="inline-block">
      <Tag
        href={href}
        onClick={onClick}
        type={href ? undefined : 'button'}
        {...rest}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ease-industrial ${base} ${className}`}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
