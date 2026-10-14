import { useEffect, useId, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// Page-wide budget: at most this many sections hold a live WebGL canvas at once. A section that
// is closer to the screen takes a slot from one that is farther away (2 = on screen, 1 = about to
// be, 0 = only lingering), so the part the visitor is looking at never waits for a canvas that
// nobody can see.
const MAX_CANVASES = 2;
const holders = new Map(); // id -> { rank, drop }
const waiting = new Map(); // id -> tryAcquire

function retryWaiting() {
  [...waiting.values()].forEach((retry) => retry());
}

function useCanvasSlot(want, rank) {
  const id = useId();
  const [granted, setGranted] = useState(false);
  const rankRef = useRef(rank);
  rankRef.current = rank;

  useEffect(() => {
    if (!want) return undefined;
    const entry = { rank: () => rankRef.current, drop: () => setGranted(false) };
    const tryAcquire = () => {
      if (holders.has(id)) return;
      if (holders.size >= MAX_CANVASES) {
        let weakest = null;
        for (const [otherId, other] of holders) {
          if (!weakest || other.rank() < weakest[1].rank()) weakest = [otherId, other];
        }
        if (weakest && weakest[1].rank() < rankRef.current) {
          holders.delete(weakest[0]);
          weakest[1].drop();
        }
      }
      if (holders.size < MAX_CANVASES) {
        holders.set(id, entry);
        setGranted(true);
      }
    };
    waiting.set(id, tryAcquire);
    tryAcquire();
    return () => {
      waiting.delete(id);
      if (holders.delete(id)) {
        setGranted(false);
        retryWaiting();
      }
    };
  }, [want, id]);

  // Moving closer to the screen while waiting: try again, now allowed to take a slot from a farther section.
  useEffect(() => {
    if (want && rank > 0) waiting.get(id)?.();
  }, [want, rank, id]);

  return want && granted;
}

// True while the element is within `margin` of the screen, and for a moment after it leaves. The
// delay stops a canvas being mounted and torn down again before it finished starting.
export function useNearViewport(ref, { margin = '50% 0px', linger = 1500 } = {}) {
  const inView = useInView(ref, { margin });
  const onScreen = useInView(ref);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (inView) {
      setNear(true);
      return undefined;
    }
    const timer = setTimeout(() => setNear(false), linger);
    return () => clearTimeout(timer);
  }, [inView, linger]);

  return useCanvasSlot(near, onScreen ? 2 : inView ? 1 : 0);
}
