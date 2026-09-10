import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/**
 * Interactive geometric wireframe core.
 * Rotates gently on its own axis, and tilts toward the cursor with damped
 * inertia. On touch devices it tilts toward a slow idle drift instead of
 * pointer tracking. Renders a low-poly icosahedron wireframe layered with a
 * thinner torus-knot ring for a "blueprint schematic" read rather than a
 * decorative orb.
 */
function WireframeCore({ color, isTouch }) {
  const groupRef = useRef();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isTouch) return; // no pointer tracking on touch devices
    const handleMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: ny * 0.4, y: nx * 0.6 };
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [isTouch]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Idle auto-rotation
    groupRef.current.rotation.y += delta * 0.09;

    // Damped approach toward cursor-derived tilt (or resting pose on touch)
    const damp = 1 - Math.pow(0.001, delta);
    groupRef.current.rotation.x += (target.current.x - groupRef.current.rotation.x) * damp;
    groupRef.current.rotation.z += (target.current.y * 0.2 - groupRef.current.rotation.z) * damp;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 5, 0]}>
        <torusKnotGeometry args={[1.05, 0.02, 180, 12, 2, 3]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.62, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/**
 * Detects touch/coarse-pointer devices (used to tune render quality and
 * disable pointer-tracking) and genuinely low-power hardware (very few CPU
 * cores) which falls back to a static SVG instead of WebGL entirely.
 */
function useDeviceProfile() {
  const [profile, setProfile] = useState({ isTouch: false, isVeryLowPower: false });

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 2;
    setProfile({ isTouch, isVeryLowPower: fewCores });
  }, []);

  return profile;
}

export default function ThreeCanvas({ isDark = true, className = '' }) {
  const { isTouch, isVeryLowPower } = useDeviceProfile();
  const color = useMemo(() => (isDark ? '#3b82f6' : '#0f172a'), [isDark]);

  if (isVeryLowPower) {
    // Static schematic fallback — only for genuinely low-end hardware,
    // keeps the layout without spending a GPU budget it can't afford.
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" className="w-2/3 h-2/3 opacity-40">
          <polygon
            points="100,10 190,70 160,180 40,180 10,70"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <circle cx="100" cy="100" r="60" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={isTouch ? [1, 1] : [1, 1.5]}
        gl={{ antialias: !isTouch, alpha: true, powerPreference: 'low-power' }}
      >
        <WireframeCore color={color} isTouch={isTouch} />
      </Canvas>
    </div>
  );
}