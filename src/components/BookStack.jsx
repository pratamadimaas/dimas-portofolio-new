import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * A shelf with one upright book per education stage, spines facing the viewer. Entries arrive
 * newest first (the data order); the shelf reads oldest to newest, left to right, so the
 * current study is the last book. Hover lifts a book, selecting pulls it out and tilts it.
 */

const GAP = 0.07;
const DEPTH = 1.8;
const PAGES = '#e9e1cf';
const SHELF = { w: 13, t: 0.2, d: 2.0 };
const PX = 280; // spine texture pixels per world unit

// Thickness and height per shelf slot (oldest first): slight variation, nothing dramatic.
const SCALE = 1.2;
const DIMS = [
  { t: 0.95, h: 2.55 },
  { t: 1.1, h: 2.8 },
  { t: 0.85, h: 2.45 },
  { t: 1.05, h: 2.9 },
  { t: 1.2, h: 2.7 },
].map(({ t, h }) => ({ t: t * SCALE, h: h * SCALE }));
// Tonal covers from the site palette (slate, charcoal, muted blue, deep green); the last slot is
// reserved for the current study and carries the single accent.
const COVERS = [
  { cover: '#334155', ink: '#e5e7eb' },
  { cover: '#2b2f36', ink: '#e5e7eb' },
  { cover: '#2f4a6b', ink: '#e5e7eb' },
  { cover: '#1f4d3a', ink: '#e5e7eb' },
  { cover: '#34d399', ink: '#052e22' },
];
const TILT = [0.01, -0.012, 0.014, -0.01, 0.008];
const SANS = '"Geist Sans", sans-serif';
const MONO = '"Geist Mono", monospace';

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  });
  lines.push(line);
  return lines;
}

// Spine artwork: institution, programme and years, set along the spine (read top to bottom).
function makeSpine({ title, program, period }, { cover, ink }, { t, h }) {
  const cw = Math.round(t * PX);
  const ch = Math.round(h * PX);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = cover;
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  [26, 34, ch - 36, ch - 28].forEach((y) => ctx.fillRect(0, y, cw, 3));

  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate(Math.PI / 2);
  const L = ch;
  const maxW = L - 150 - 200;
  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  let size = 40;
  let lines;
  do {
    ctx.font = `700 ${size}px ${SANS}`;
    lines = wrap(ctx, title, maxW);
    size -= 2;
  } while (lines.length > 2 && size > 24);
  const startX = -L / 2 + 70;
  const lineH = size + 8;
  const blockTop = -((lines.length - 1) * lineH) / 2 - 30;
  lines.forEach((ln, i) => ctx.fillText(ln, startX, blockTop + i * lineH));
  ctx.globalAlpha = 0.8;
  let psize = 26;
  ctx.font = `500 ${psize}px ${SANS}`;
  while (ctx.measureText(program).width > maxW && psize > 18) {
    psize -= 2;
    ctx.font = `500 ${psize}px ${SANS}`;
  }
  ctx.fillText(program, startX, blockTop + lines.length * lineH + 4);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'right';
  ctx.font = `500 28px ${MONO}`;
  ctx.fillText(period, L / 2 - 70, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Book({ entry, slot, x, selected, focused, onSelect, invalidate }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const palette = COVERS[slot];
  const dims = DIMS[slot];
  const spine = useMemo(() => makeSpine(entry, palette, dims), [entry, palette, dims]);
  useEffect(() => () => spine.dispose(), [spine]);
  useEffect(() => invalidate(), [selected, focused, invalidate]);

  const restY = dims.h / 2;

  useFrame((_, delta) => {
    const g = ref.current;
    const lift = selected ? 0.1 : hovered || focused ? 0.14 : 0;
    const pullZ = selected ? 1.15 : 0;
    const tiltX = selected ? 0.2 : 0;
    const turnY = selected ? -0.22 : TILT[slot];
    g.position.y = THREE.MathUtils.damp(g.position.y, restY + lift, 8, delta);
    g.position.z = THREE.MathUtils.damp(g.position.z, pullZ, 7, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tiltX, 7, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, turnY, 7, delta);
    if (
      Math.abs(g.position.y - restY - lift) > 0.001 ||
      Math.abs(g.position.z - pullZ) > 0.001 ||
      Math.abs(g.rotation.x - tiltX) > 0.001 ||
      Math.abs(g.rotation.y - turnY) > 0.001
    ) {
      invalidate();
    }
  });

  return (
    <group ref={ref} position={[x, restY, 0]} rotation={[0, TILT[slot], 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
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
        <boxGeometry args={[dims.t, dims.h, DEPTH]} />
        {/* Face order: +x, -x (cover boards), +y, -y (page block), +z (spine, facing camera), -z (fore-edge) */}
        <meshStandardMaterial attach="material-0" color={palette.cover} roughness={0.7} />
        <meshStandardMaterial attach="material-1" color={palette.cover} roughness={0.7} />
        <meshStandardMaterial attach="material-2" color={PAGES} roughness={0.9} />
        <meshStandardMaterial attach="material-3" color={PAGES} roughness={0.9} />
        <meshStandardMaterial attach="material-4" map={spine} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={PAGES} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Shelf({ entries, selected, focused, onSelect, interactive }) {
  const group = useRef();
  const { gl, invalidate } = useThree();
  const count = entries.length;

  // Positions along the shelf, centred; slot 0 is the oldest book (last entry in the data).
  const xs = useMemo(() => {
    const widths = Array.from({ length: count }, (_, s) => DIMS[s].t);
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (count - 1);
    let cursor = -total / 2;
    return widths.map((w) => {
      const c = cursor + w / 2;
      cursor += w + GAP;
      return c;
    });
  }, [count]);

  useEffect(() => {
    if (!interactive) return undefined;
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

  useFrame((state, delta) => {
    const targetY = interactive ? state.pointer.x * 0.06 : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 5, delta);
    if (Math.abs(group.current.rotation.y - targetY) > 0.0005) invalidate();
  });

  return (
    <group ref={group}>
      <mesh position={[0, -SHELF.t / 2, 0]}>
        <boxGeometry args={[SHELF.w, SHELF.t, SHELF.d]} />
        <meshStandardMaterial color="#2d3340" roughness={0.8} />
      </mesh>
      <mesh position={[0, -SHELF.t - 0.02, SHELF.d / 2 - 0.01]}>
        <boxGeometry args={[SHELF.w, 0.04, 0.03]} />
        <meshStandardMaterial color="#3d4554" roughness={0.7} />
      </mesh>
      {entries.map((entry, i) => {
        const slot = count - 1 - i;
        return (
          <Book
            key={`${entry.period}-${entry.title}`}
            entry={entry}
            slot={slot}
            x={xs[slot]}
            selected={selected === i}
            focused={focused === i}
            onSelect={() => onSelect(selected === i ? -1 : i)}
            invalidate={invalidate}
          />
        );
      })}
    </group>
  );
}

// Keeps the whole shelf in frame at any canvas aspect.
function Framing() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const dist = Math.max(9.2, 4.4 / (Math.tan(THREE.MathUtils.degToRad(15)) * aspect));
    camera.position.set(0, 2.1, dist);
    camera.lookAt(0, 1.45, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

/**
 * Bookshelf, one book per education stage. `selected` is the index into `entries` (-1 for none);
 * `focused` marks the book the keyboard cursor is on.
 */
export default function BookStack({ entries, selected, onSelect, interactive = true, focused = -1 }) {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    Promise.all([document.fonts.load(`700 40px ${SANS}`), document.fonts.load(`500 28px ${MONO}`)])
      .catch(() => {})
      .finally(() => setFontReady(true));
  }, []);

  if (!fontReady) return null;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.1, 9.2], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 5]} intensity={2.1} />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} />
      <Framing />
      <Shelf entries={entries} selected={selected} focused={focused} onSelect={onSelect} interactive={interactive} />
    </Canvas>
  );
}
