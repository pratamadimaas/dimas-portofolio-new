import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import TechIcon from './TechIcon';

/*
 * Mechanical keyboard: one keycap per skill, one row per skill group. The wide
 * key at the start of each row (where Tab / Caps / Shift sit) names the group
 * and filters the row when clicked.
 */

const U = 1; // key pitch
const CAP = { size: 0.9, h: 0.42 };
const CASE_H = 0.5;

const PALETTE = {
  dark: {
    case: '#161b24',
    plate: '#0e1219',
    cap: '#e7e9ee',
    capSide: '#c9ced8',
    ink: '#1e2633',
    mod: '#22324b',
    modSide: '#1a2539',
    modInk: '#e9b949',
    glow: '#34d399',
  },
  light: {
    case: '#c8d0dc',
    plate: '#aeb8c6',
    cap: '#f8f9fb',
    capSide: '#dde2e9',
    ink: '#1e2633',
    mod: '#22324b',
    modSide: '#1a2539',
    modInk: '#e9b949',
    glow: '#059669',
  },
};

function fitText(ctx, text, weight, size, maxWidth) {
  let s = size;
  ctx.font = `${weight} ${s}px "Geist Sans", sans-serif`;
  while (ctx.measureText(text).width > maxWidth && s > 14) {
    s -= 1;
    ctx.font = `${weight} ${s}px "Geist Sans", sans-serif`;
  }
}

function capTexture({ label, width, icon, isMod }, c) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((256 * width) / CAP.size);
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = isMod ? c.mod : c.cap;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = isMod ? c.modInk : c.ink;
  ctx.textBaseline = 'middle';

  if (isMod) {
    // Legend bottom-left, like printed modifier keys.
    fitText(ctx, label, 600, 46, canvas.width - 48);
    ctx.fillText(label, 26, 196);
  } else {
    if (icon) ctx.drawImage(icon, 128 - 52, 34, 104, 104);
    ctx.textAlign = 'center';
    fitText(ctx, label, 600, 40, 230);
    ctx.fillText(label, 128, 196);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Key({ k, c, icon, pressed, highlighted, dimmed, onHover, onSelect }) {
  const ref = useRef();
  const topMat = useRef();
  const geo = useMemo(() => new RoundedBoxGeometry(k.width, CAP.h, CAP.size, 3, 0.09), [k.width]);
  const tex = useMemo(() => capTexture({ ...k, icon }, c), [k, icon, c]);
  useEffect(() => () => (geo.dispose(), tex.dispose()), [geo, tex]);
  const restY = CASE_H / 2 + CAP.h / 2 - 0.06;
  const glow = useMemo(() => new THREE.Color(c.glow), [c.glow]);

  useFrame((_, delta) => {
    const target = restY - (pressed ? 0.13 : 0) + (highlighted ? 0.05 : 0);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, target, 18, delta);
    const m = topMat.current;
    m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, highlighted ? 0.35 : 0, 8, delta);
    // Darken the legend (map is multiplied by colour) for rows outside the filter.
    m.color.setScalar(THREE.MathUtils.damp(m.color.r, dimmed ? 0.4 : 1, 8, delta));
  });

  const side = k.isMod ? c.modSide : c.capSide;

  return (
    <mesh
      ref={ref}
      geometry={geo}
      position={[k.x, restY, k.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(k.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(k);
      }}
    >
      {/* BoxGeometry face groups: +x, -x, +y (legend), -y, +z, -z */}
      <meshStandardMaterial attach="material-0" color={side} roughness={0.7} />
      <meshStandardMaterial attach="material-1" color={side} roughness={0.7} />
      <meshStandardMaterial
        ref={topMat}
        attach="material-2"
        map={tex}
        roughness={0.55}
        emissive={glow}
        emissiveIntensity={0}
      />
      <meshStandardMaterial attach="material-3" color={side} roughness={0.7} />
      <meshStandardMaterial attach="material-4" color={side} roughness={0.7} />
      <meshStandardMaterial attach="material-5" color={side} roughness={0.7} />
    </mesh>
  );
}

// Keep the whole board in frame at any aspect ratio.
function FitCamera({ width, depth }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const dir = new THREE.Vector3(0, 0.78, 0.63).normalize();
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = size.width / size.height;
    const fitW = (width / 2 + 0.6) / (Math.tan(vFov / 2) * aspect);
    const fitH = (depth / 2 + 1.4) / Math.tan(vFov / 2);
    const dist = Math.max(fitW, fitH);
    camera.position.copy(dir.multiplyScalar(dist));
    camera.lookAt(0, 0, 0.2);
    camera.updateProjectionMatrix();
  }, [camera, size, width, depth]);
  return null;
}

function Board({ keys, width, depth, c, icons, hovered, setHovered, activeRow, setActiveRow, onPick, interactive }) {
  const group = useRef();
  const caseGeo = useMemo(() => new RoundedBoxGeometry(width + 0.7, CASE_H, depth + 0.7, 4, 0.22), [width, depth]);
  useEffect(() => () => caseGeo.dispose(), [caseGeo]);

  useFrame((state, delta) => {
    const ty = interactive ? state.pointer.x * 0.12 : 0;
    const tx = interactive ? -state.pointer.y * 0.05 : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, ty, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tx, 3, delta);
  });

  return (
    <group ref={group}>
      <mesh geometry={caseGeo}>
        <meshStandardMaterial color={c.case} roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, CASE_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.1, depth + 0.1]} />
        <meshStandardMaterial color={c.plate} roughness={0.9} />
      </mesh>
      {keys.map((k) => (
        <Key
          key={k.id}
          k={k}
          c={c}
          icon={icons[k.name]}
          pressed={hovered === k.id}
          highlighted={activeRow !== null && k.row === activeRow && !k.isMod}
          dimmed={activeRow !== null && k.row !== activeRow}
          onHover={setHovered}
          onSelect={(key) => {
            if (key.isMod) setActiveRow((r) => (r === key.row ? null : key.row));
            else onPick(key);
          }}
        />
      ))}
    </group>
  );
}

// Renders the TechIcon SVGs off-screen once, then turns them into images for the keycap textures.
function useIconImages(names, color) {
  const holder = useRef(null);
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const nodes = holder.current?.querySelectorAll('[data-skill]') ?? [];
    Promise.all(
      Array.from(nodes, async (node) => {
        const svg = node.querySelector('svg');
        if (!svg) return [node.dataset.skill, null];
        const markup = svg.outerHTML.replaceAll('currentColor', color);
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
        try {
          await img.decode();
          return [node.dataset.skill, img];
        } catch {
          return [node.dataset.skill, null];
        }
      })
    ).then((entries) => !cancelled && setIcons(Object.fromEntries(entries)));
    return () => {
      cancelled = true;
    };
  }, [names, color]);

  const renderer = (
    <div ref={holder} aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
      {names.map((n) => (
        <span key={n} data-skill={n}>
          <TechIcon name={n} size={96} />
        </span>
      ))}
    </div>
  );

  return [icons, renderer];
}

export default function SkillsKeyboard({ rows, isDark, interactive, hovered, setHovered, activeRow, setActiveRow, onPick }) {
  const c = isDark ? PALETTE.dark : PALETTE.light;
  const [fontReady, setFontReady] = useState(false);
  const names = useMemo(() => rows.flatMap((r) => r.items.map((i) => i.name)), [rows]);
  const [icons, iconRenderer] = useIconImages(names, c.ink);

  useEffect(() => {
    document.fonts
      .load('600 34px "Geist Sans"')
      .catch(() => {})
      .finally(() => setFontReady(true));
  }, []);

  // Lay rows out like a real board: a wide modifier key absorbs the leftover width.
  const { keys, width, depth } = useMemo(() => {
    const maxKeys = Math.max(...rows.map((r) => r.items.length));
    const w = maxKeys * U + 1.5;
    const d = rows.length * U;
    const out = [];
    rows.forEach((row, r) => {
      const z = (r - (rows.length - 1) / 2) * U;
      const modW = w - row.items.length * U;
      out.push({ id: `mod-${r}`, row: r, isMod: true, label: row.short, name: row.group, width: modW - 0.1, x: -w / 2 + modW / 2, z });
      row.items.forEach((item, i) => {
        out.push({
          id: `${r}-${item.name}`,
          row: r,
          isMod: false,
          label: item.label,
          name: item.name,
          width: CAP.size,
          x: -w / 2 + modW + U / 2 + i * U,
          z,
        });
      });
    });
    return { keys: out, width: w, depth: d };
  }, [rows]);

  return (
    <>
      {iconRenderer}
      {fontReady && icons && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 8, 6.5], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          onPointerMissed={() => setActiveRow(null)}
          aria-hidden="true"
        >
          <ambientLight intensity={isDark ? 0.8 : 1.1} />
          <directionalLight position={[-3, 8, 5]} intensity={isDark ? 1.8 : 1.5} />
          <directionalLight position={[5, 3, -4]} intensity={0.4} />
          <FitCamera width={width} depth={depth} />
          <Board
            keys={keys}
            width={width}
            depth={depth}
            c={c}
            icons={icons}
            hovered={hovered}
            setHovered={setHovered}
            activeRow={activeRow}
            setActiveRow={setActiveRow}
            onPick={onPick}
            interactive={interactive}
          />
        </Canvas>
      )}
    </>
  );
}
