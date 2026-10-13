import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

const SPRING = { damping: 30, stiffness: 100, mass: 2 };

// Based on the React Bits "Tilted Card": 3D tilt that follows the cursor,
// plus a moving glare. The caption is passed in as children so it stays selectable.
export default function TiltedCard({
  imageSrc,
  alt,
  href,
  aspect = '4 / 3',
  rotateAmplitude = 12,
  scaleOnHover = 1.04,
  children,
}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, { damping: 30, stiffness: 120 });
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45), transparent 55%)`;

  function onMove(e) {
    if (!ref.current || e.pointerType === 'touch') return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 2 * rotateAmplitude);
    rotateY.set((px - 0.5) * 2 * rotateAmplitude);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function onEnter(e) {
    if (e.pointerType === 'touch') return;
    scale.set(scaleOnHover);
    glareOpacity.set(1);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    glareOpacity.set(0);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onBlur={onLeave}
    >
      <div ref={ref} style={{ perspective: 800 }}>
        <motion.div
          style={{ rotateX, rotateY, scale, aspectRatio: aspect, transformStyle: 'preserve-3d' }}
          className="relative overflow-hidden rounded-xl border border-titanium-border dark:border-obsidian-border bg-titanium-bg2 dark:bg-obsidian-surface shadow-sm transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-black/20 dark:group-hover:shadow-black/60"
        >
          <img
            src={imageSrc}
            alt={alt}
            width="720"
            height="540"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <motion.div
            aria-hidden="true"
            style={{ background: glare, opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"
          />
        </motion.div>
      </div>
      {children}
    </a>
  );
}
