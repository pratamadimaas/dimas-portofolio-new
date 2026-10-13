import { useCallback, useEffect, useState } from 'react';
import { supportsWebGL } from '../lib/webgl';

// Thresholds for phones. Safari does not expose deviceMemory, so undefined counts as a pass.
const MIN_PHONE_CORES = 4;
const MIN_PHONE_MEMORY_GB = 4;
const PHONE_MAX_SHORT_SIDE = 768;

// Once a WebGL context is lost, the vertical timeline is used for the rest of the session.
let contextLost = false;

function evaluate() {
  if (contextLost || !supportsWebGL()) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;

  const isPhone = Math.min(window.screen.width, window.screen.height) < PHONE_MAX_SHORT_SIDE;
  if (isPhone) {
    const { hardwareConcurrency: cores, deviceMemory: memory } = navigator;
    if (cores !== undefined && cores < MIN_PHONE_CORES) return false;
    if (memory !== undefined && memory < MIN_PHONE_MEMORY_GB) return false;
  }
  return true;
}

// ok is false until the check has run (the server and first render use the vertical timeline).
export function useCanRender3D() {
  const [state, setState] = useState({ ready: false, ok: false });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setState({ ready: true, ok: evaluate() });
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);

  const onContextLost = useCallback(() => {
    contextLost = true;
    setState({ ready: true, ok: false });
  }, []);

  return { ...state, onContextLost };
}
