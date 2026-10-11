import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BOOK = { w: 2.1, h: 0.3, d: 1.45, gap: 0.012 };
const PAGES = '#efe6d2';
// Cover / spine-text pairs, newest book first (matches the education data order).
const COVERS = [
  { cover: '#9f1239', ink: '#fff1f2' },
  { cover: '#1e3a8a', ink: '#facc15' },
  { cover: '#115e59', ink: '#fde68a' },
  { cover: '#3f6212', ink: '#ecfccb' },
  { cover: '#7c2d12', ink: '#ffedd5' },
];
const TILT = [0.05, -0.04, 0.035, -0.06, 0.02];
const NUDGE = [0.04, -0.03, 0.02, -0.05, 0.01];

function fitFont(ctx, text, weight, size, family, maxWidth) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > 20) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
}

// Spine artwork drawn on a canvas: institution, programme, years.
function makeSpine({ title, program, period }, { cover, ink }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 146;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = cover;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Hardcover head/tail bands.
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(0, 12, canvas.width, 3);
  ctx.fillRect(0, canvas.height - 15, canvas.width, 3);

  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  fitFont(ctx, title, 700, 46, '"Geist Sans", sans-serif', 680);
  ctx.fillText(title, 44, 58);
  ctx.globalAlpha = 0.72;
  fitFont(ctx, program, 500, 28, '"Geist Sans", sans-serif', 680);
  ctx.fillText(program, 44, 100);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'right';
  ctx.font = '500 30px "Geist Mono", monospace';
  ctx.fillText(period, canvas.width - 44, 74);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Book({ entry, index, count, selected, onSelect, invalidate }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const palette = COVERS[index % COVERS.length];
  const spine = useMemo(() => makeSpine(entry, palette), [entry, palette]);
  useEffect(() => () => spine.dispose(), [spine]);

  // Newest book on top of the stack.
  const restY = (count - 1 - index) * (BOOK.h + BOOK.gap) + BOOK.h / 2;

  useFrame((_, delta) => {
    const g = ref.current;
    // Selected book slides forward and rises so the spines below stay readable.
    const pullZ = selected ? 0.4 : hovered ? 0.12 : 0;
    const liftY = selected ? 0.2 : 0;
    g.position.z = THREE.MathUtils.damp(g.position.z, pullZ, 7, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, restY + liftY, 7, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, selected ? 0 : TILT[index % TILT.length], 7, delta);
    if (Math.abs(g.position.z - pullZ) > 0.001 || Math.abs(g.position.y - restY - liftY) > 0.001) invalidate();
  });

  return (
    <group ref={ref} position={[NUDGE[index % NUDGE.length], restY, 0]} rotation={[0, TILT[index % TILT.length], 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(selected ? -1 : index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          invalidate();
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
          invalidate();
        }}
      >
        <boxGeometry args={[BOOK.w, BOOK.h, BOOK.d]} />
        {/* Face order: +x, -x, +y, -y, +z (spine, facing camera), -z */}
        <meshStandardMaterial attach="material-0" color={PAGES} roughness={0.9} />
        <meshStandardMaterial attach="material-1" color={PAGES} roughness={0.9} />
        <meshStandardMaterial attach="material-2" color={palette.cover} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color={palette.cover} roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={spine} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={PAGES} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Stack({ entries, selected, onSelect, interactive }) {
  const group = useRef();
  const { gl, invalidate } = useThree();
  const stackHeight = entries.length * (BOOK.h + BOOK.gap);

  // Demand rendering: wake the loop on pointer movement for the parallax tilt.
  useEffect(() => {
    if (!interactive) return;
    const el = gl.domElement;
    const wake = () => invalidate();
    el.addEventListener('pointermove', wake);
    el.addEventListener('pointerleave', wake);
    return () => {
      el.removeEventListener('pointermove', wake);
      el.removeEventListener('pointerleave', wake);
      document.body.style.cursor = '';
    };
  }, [gl, invalidate, interactive]);

  useEffect(() => invalidate(), [selected, invalidate]);

  useFrame((state, delta) => {
    const targetY = interactive ? state.pointer.x * 0.18 : 0;
    const targetX = interactive ? -state.pointer.y * 0.06 : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 5, delta);
    if (Math.abs(group.current.rotation.y - targetY) > 0.0005) invalidate();
  });

  return (
    <group ref={group} position={[0, -stackHeight / 2, 0]}>
      {entries.map((entry, i) => (
        <Book
          key={`${entry.period}-${entry.title}`}
          entry={entry}
          index={i}
          count={entries.length}
          selected={selected === i}
          onSelect={onSelect}
          invalidate={invalidate}
        />
      ))}
    </group>
  );
}

/**
 * Stack of hardcover books, one per education stage. Clicking a book (or its
 * row in the list) pulls it out of the stack.
 */
export default function BookStack({ entries, selected, onSelect, interactive = true }) {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    Promise.all([
      document.fonts.load('700 46px "Geist Sans"'),
      document.fonts.load('500 30px "Geist Mono"'),
    ])
      .catch(() => {})
      .finally(() => setFontReady(true));
  }, []);

  if (!fontReady) return null;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [3.0, 1.7, 4.3], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} />
      <Stack entries={entries} selected={selected} onSelect={onSelect} interactive={interactive} />
    </Canvas>
  );
}
