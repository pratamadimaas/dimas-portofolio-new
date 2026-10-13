import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

// True while the element is within about half a viewport of the screen, and for a moment after it
// leaves. The delay stops a canvas being mounted and torn down again before it finished starting.
export function useNearViewport(ref, { margin = '50% 0px', linger = 1500 } = {}) {
  const inView = useInView(ref, { margin });
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (inView) {
      setNear(true);
      return undefined;
    }
    const timer = setTimeout(() => setNear(false), linger);
    return () => clearTimeout(timer);
  }, [inView, linger]);

  return near;
}
