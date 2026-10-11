let webglSupport;

// Cached: creating throwaway contexts is not free.
export function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement('canvas');
      webglSupport = Boolean(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
