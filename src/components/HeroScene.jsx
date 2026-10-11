import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useInView, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { supportsWebGL } from '../lib/webgl';

/*
 * Hero scene: the tagline as an object. Spreadsheets (manual reports) feed
 * through circuit traces into a processor (the automation), which drives a
 * rising bar chart (the dashboard). Board lies in the XZ plane, y is up.
 */

const BOARD = { w: 4.0, h: 0.08, d: 2.3 };
const TOP = BOARD.h / 2;
const CHIP = { size: 0.92, h: 0.16 };
const BARS = [0.28, 0.46, 0.38, 0.66, 0.92];

const PALETTE = {
  dark: {
    board: '#0f1724',
    boardEdge: '#1b2638',
    trace: '#2c3a52',
    chip: '#1a212d',
    die: '#262f3f',
    pin: '#c99a45',
    ink: '#7d8aa0',
    data: '#34d399',
    paper: '#e8edf3',
    paperLine: '#b5c0cf',
    bars: ['#3a4a63', '#3b5f7a', '#2f7d86', '#26a07b', '#34d399'],
  },
  light: {
    board: '#e3e9f1',
    boardEdge: '#cbd5e1',
    trace: '#b3c0d1',
    chip: '#2a3242',
    die: '#3a4558',
    pin: '#b58331',
    ink: '#9aa7ba',
    data: '#059669',
    paper: '#ffffff',
    paperLine: '#c7d0dc',
    bars: ['#94a3b8', '#6f8fae', '#3f8797', '#169c74', '#059669'],
  },
};

// PCB-style routing: straight runs with 45-degree jogs.
function tracePaths() {
  const y = TOP + 0.003;
  const half = CHIP.size / 2;
  const left = [-0.3, -0.1, 0.1, 0.3].map((z) => {
    const z2 = z * 1.9;
    return [
      [-1.05, y, z2],
      [-0.95, y, z2],
      [-0.75, y, z],
      [-half - 0.02, y, z],
    ];
  });
  const right = [-0.3, -0.1, 0.1, 0.3].map((z) => {
    const z2 = z * 1.5;
    return [
      [half + 0.02, y, z],
      [0.75, y, z],
      [0.92, y, z2],
      [0.98, y, z2],
    ];
  });
  return { left, right };
}

const toCurve = (pts) => {
  const path = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) {
    path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
  }
  return path;
};

function makeSheetTexture(c, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, 360, 260);
  // Header row + gridlines, like a worksheet export.
  ctx.fillStyle = c.paperLine;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 0, 360, 30);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.paperLine;
  ctx.lineWidth = 2;
  for (let y = 30; y < 260; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(360, y);
    ctx.stroke();
  }
  for (const x of [70, 160, 250]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 260);
    ctx.stroke();
  }
  // A few highlighted cells (flagged values).
  ctx.fillStyle = c.data;
  ctx.globalAlpha = 0.55;
  [
    [160, 56 + seed * 26],
    [250, 134 - seed * 26],
  ].forEach(([x, y]) => ctx.fillRect(x + 4, y + 4, 82, 18));
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeChipTexture(c) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = c.chip;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = c.die;
  ctx.fillRect(40, 40, 176, 176);
  // Core grid on the die.
  ctx.fillStyle = c.chip;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) ctx.fillRect(58 + i * 38, 58 + j * 38, 30, 30);
  }
  ctx.strokeStyle = c.data;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 176, 176);
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Board({ c }) {
  const { left, right } = useMemo(tracePaths, []);
  const tubes = useMemo(
    () => [...left, ...right].map((pts) => new THREE.TubeGeometry(toCurve(pts), 24, 0.009, 4, false)),
    [left, right]
  );
  useEffect(() => () => tubes.forEach((t) => t.dispose()), [tubes]);

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[BOARD.w, BOARD.h, BOARD.d]} />
        <meshStandardMaterial attach="material-0" color={c.boardEdge} roughness={0.8} />
        <meshStandardMaterial attach="material-1" color={c.boardEdge} roughness={0.8} />
        <meshStandardMaterial attach="material-2" color={c.board} roughness={0.9} />
        <meshStandardMaterial attach="material-3" color={c.boardEdge} roughness={0.8} />
        <meshStandardMaterial attach="material-4" color={c.boardEdge} roughness={0.8} />
        <meshStandardMaterial attach="material-5" color={c.boardEdge} roughness={0.8} />
      </mesh>
      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={c.trace} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Chip({ c, animate }) {
  const glow = useRef();
  const top = useMemo(() => makeChipTexture(c), [c]);
  useEffect(() => () => top.dispose(), [top]);
  const pins = useMemo(() => {
    const out = [];
    const half = CHIP.size / 2;
    for (let i = 0; i < 7; i++) {
      const o = -0.36 + i * 0.12;
      out.push([o, half + 0.035, 0], [o, -half - 0.035, 0], [half + 0.035, o, 1], [-half - 0.035, o, 1]);
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    if (!glow.current) return;
    glow.current.material.opacity = animate ? 0.25 + Math.sin(clock.elapsedTime * 2) * 0.12 : 0.3;
  });

  return (
    <group position={[0, TOP, 0]}>
      <mesh position={[0, CHIP.h / 2 + 0.01, 0]}>
        <boxGeometry args={[CHIP.size, CHIP.h, CHIP.size]} />
        <meshStandardMaterial attach="material-0" color={c.chip} roughness={0.5} />
        <meshStandardMaterial attach="material-1" color={c.chip} roughness={0.5} />
        <meshStandardMaterial attach="material-2" map={top} roughness={0.45} />
        <meshStandardMaterial attach="material-3" color={c.chip} roughness={0.5} />
        <meshStandardMaterial attach="material-4" color={c.chip} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color={c.chip} roughness={0.5} />
      </mesh>
      {/* Thin glow plate under the package: the processor is "on". */}
      <mesh ref={glow} position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CHIP.size + 0.24, CHIP.size + 0.24]} />
        <meshBasicMaterial color={c.data} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {pins.map(([a, b, axis], i) => (
        <mesh key={i} position={[a, 0.03, b]} rotation={[0, axis ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.05, 0.03, 0.09]} />
          <meshStandardMaterial color={c.pin} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Sheets({ c, animate }) {
  const group = useRef();
  const textures = useMemo(() => [0, 1, 2].map((s) => makeSheetTexture(c, s)), [c]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    group.current.children.forEach((sheet, i) => {
      sheet.position.y = 0.42 + i * 0.16 + Math.sin(clock.elapsedTime * 1.1 + i * 0.9) * 0.025;
    });
  });

  return (
    <group ref={group} position={[-1.45, 0, 0]}>
      {textures.map((tex, i) => (
        <mesh key={i} position={[i * 0.04, 0.42 + i * 0.16, -i * 0.03]} rotation={[-Math.PI / 2, 0, 0.12 - i * 0.1]}>
          <planeGeometry args={[1.05, 0.75]} />
          <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Chart({ c, animate }) {
  const bars = useRef([]);
  const start = useRef(null);

  useFrame(({ clock }, delta) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const t = animate ? Math.min((clock.elapsedTime - start.current - 0.3) / 1.2, 1) : 1;
    const grow = t <= 0 ? 0.001 : 1 - Math.pow(1 - t, 3);
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const h = Math.max(BARS[i] * grow, 0.001);
      bar.scale.y = THREE.MathUtils.damp(bar.scale.y, h, 10, delta);
      bar.position.y = TOP + 0.02 + bar.scale.y / 2;
    });
  });

  return (
    <group position={[1.45, 0, 0]}>
      <mesh position={[0, TOP + 0.01, 0]}>
        <boxGeometry args={[1.0, 0.02, 0.5]} />
        <meshStandardMaterial color={c.boardEdge} roughness={0.7} />
      </mesh>
      {BARS.map((_, i) => (
        <mesh key={i} ref={(el) => (bars.current[i] = el)} position={[-0.36 + i * 0.18, TOP, 0]} scale={[1, 0.001, 1]}>
          <boxGeometry args={[0.12, 1, 0.24]} />
          <meshStandardMaterial color={c.bars[i]} roughness={0.45} emissive={c.bars[i]} emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

// Signals: data enters from the sheets, leaves towards the chart.
function Signals({ c, animate }) {
  const { left, right } = useMemo(tracePaths, []);
  const curves = useMemo(() => [...left, ...right].map(toCurve), [left, right]);
  const refs = useRef([]);

  useFrame(({ clock }) => {
    curves.forEach((curve, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      if (!animate) {
        mesh.visible = false;
        return;
      }
      const t = (clock.elapsedTime * 0.45 + i * 0.29) % 1;
      mesh.position.copy(curve.getPointAt(t));
      mesh.position.y += 0.012;
      const tangent = curve.getTangentAt(t);
      mesh.rotation.y = Math.atan2(-tangent.z, tangent.x);
    });
  });

  return curves.map((_, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)}>
      <boxGeometry args={[0.07, 0.014, 0.02]} />
      <meshBasicMaterial color={c.data} />
    </mesh>
  ));
}

function Scene({ isDark, animate, interactive }) {
  const c = isDark ? PALETTE.dark : PALETTE.light;
  const group = useRef();
  const { camera } = useThree();

  useEffect(() => camera.lookAt(0, 0.25, 0), [camera]);

  // Gentle parallax towards the cursor (desktop only).
  useFrame((state, delta) => {
    const ty = interactive ? state.pointer.x * 0.22 : 0;
    const tx = interactive ? -state.pointer.y * 0.06 : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, ty, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tx, 3, delta);
  });

  return (
    <group ref={group}>
      <Board c={c} />
      <Chip c={c} animate={animate} />
      <Sheets c={c} animate={animate} />
      <Chart c={c} animate={animate} />
      <Signals c={c} animate={animate} />
    </group>
  );
}

export default function HeroScene({ isDark = true, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [env, setEnv] = useState({ webgl: false, fine: false, lowPower: false });

  useEffect(() => {
    setEnv({
      webgl: supportsWebGL(),
      fine: window.matchMedia('(pointer: fine)').matches,
      lowPower: (navigator.hardwareConcurrency || 8) <= 2,
    });
  }, []);

  const animate = !reduceMotion && !env.lowPower;

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {env.webgl && (
        <Canvas
          frameloop={animate && inView ? 'always' : 'demand'}
          dpr={env.fine ? [1, 1.75] : [1, 1.25]}
          camera={{ position: [1.5, 3.3, 5.8], fov: 37 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={isDark ? 0.75 : 1.2} />
          <directionalLight position={[3, 6, 2]} intensity={isDark ? 1.9 : 1.6} />
          <directionalLight position={[-4, 3, -3]} intensity={0.45} />
          <Scene isDark={isDark} animate={animate} interactive={env.fine && !reduceMotion} />
        </Canvas>
      )}
    </div>
  );
}
