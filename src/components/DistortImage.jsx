import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { supportsWebGL } from '../lib/webgl';

const DistortCanvas = lazy(() => import('./DistortCanvas'));

/**
 * Project screenshot with a WebGL hover distortion. The plain <img> is always
 * rendered (layout, alt text, touch devices, reduced motion); the canvas is
 * layered on top only for fine pointers while the image is near the viewport.
 */
export default function DistortImage({ src, alt, alignX = 0.5, className = '' }) {
  const ref = useRef(null);
  const hovered = useRef(false);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const leaveTimer = useRef(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { margin: '200px' });

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches && supportsWebGL());
    return () => clearTimeout(leaveTimer.current);
  }, []);

  const showCanvas = enabled && !reduceMotion && inView;

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    pointer.current.x = (e.clientX - rect.left) / rect.width;
    pointer.current.y = 1 - (e.clientY - rect.top) / rect.height;
  };

  const handleEnter = (e) => {
    handleMove(e);
    clearTimeout(leaveTimer.current);
    hovered.current = true;
    setActive(true);
  };

  const handleLeave = () => {
    hovered.current = false;
    // Keep rendering long enough for the effect to ease back out, then idle.
    leaveTimer.current = setTimeout(() => setActive(false), 1200);
  };

  return (
    <div
      ref={ref}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover ${alignX === 0 ? 'object-left-top' : 'object-top'}`}
      />
      {showCanvas && (
        <Suspense fallback={null}>
          <DistortCanvas src={src} alignX={alignX} hovered={hovered} pointer={pointer} active={active} />
        </Suspense>
      )}
    </div>
  );
}
