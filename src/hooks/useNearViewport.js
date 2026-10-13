import { useEffect, useId, useState } from 'react';
import { useInView } from 'framer-motion';

// Page-wide budget: at most this many sections hold a live WebGL canvas at once. A section that
// wants one while the budget is spent waits, and is granted it as soon as another lets go.
const MAX_CANVASES = 2;
const held = new Set();
const waiting = new Set();

function useCanvasSlot(want) {
  const id = useId();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!want) return undefined;
    const tryAcquire = () => {
      if (held.has(id) || held.size >= MAX_CANVASES) return;
      held.add(id);
      setGranted(true);
    };
    waiting.add(tryAcquire);
    tryAcquire();
    return () => {
      waiting.delete(tryAcquire);
      if (held.delete(id)) {
        setGranted(false);
        [...waiting].forEach((retry) => retry());
      }
    };
  }, [want, id]);

  return want && granted;
}

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

  return useCanvasSlot(near);
}
