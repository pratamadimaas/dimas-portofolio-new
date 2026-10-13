import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useInView, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { supportsWebGL } from '../lib/webgl';

/*
 * Hero scene: a developer-analyst at a desk. The code editor and dashboard on the
 * screens turn into floating charts and a small app window above them. Everything
 * is built from primitives (no model downloads). Local y = 0 is the plinth top;
 * the person faces -z, the camera looks from +z so we see them from behind.
 */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const damp = THREE.MathUtils.damp;

const ACCENT = { blue: '#3b82c4', teal: '#2dd4bf', green: '#34d399' };

const PALETTE = {
  dark: { plinth: '#0f1724', plinthEdge: '#1b2638', desk: '#2b2521', deskLeg: '#161c27' },
  light: { plinth: '#1c2433', plinthEdge: '#2a3548', desk: '#6b5a4b', deskLeg: '#2a3242' },
};

/* ---------- Screen textures (drawn with canvas 2D) ---------- */

const SYN = {
  fg: '#c9d4e3',
  kw: '#c792ea',
  str: '#a5e075',
  num: '#f2b36b',
  fn: '#6cb6ff',
  comment: '#5c6b82',
  punct: '#8b9bb4',
};

const CODE = [
  '# ledger_audit.py',
  'import pandas as pd',
  'from ledger_audit import reconcile',
  '',
  'def load_ledger(path):',
  '    df = pd.read_csv(path)',
  '    df["date"] = pd.to_datetime(df.date)',
  '    return df.dropna()',
  '',
  'def flag_outliers(df, z=3.0):',
  '    mu, sd = df.amount.mean(), df.amount.std()',
  '    df["z"] = (df.amount - mu) / sd',
  '    return df[df.z.abs() > z]',
  '',
  'report = reconcile(load_ledger("tkd.csv"))',
  'print(flag_outliers(report).head())',
  '',
  '// dashboard.ts',
  'export const total = (rows: Row[]) =>',
  '  rows.reduce((sum, r) => sum + r.amount, 0);',
  '',
  'async function loadKpis(): Promise<Kpi[]> {',
  '  const res = await fetch("/api/kpis");',
  '  return res.json();',
  '}',
  '',
];

const KEYWORDS = /^(import|from|def|return|async|await|function|const|export|as|for|in|print|Promise)\b/;

function tokenize(line) {
  if (/^\s*(#|\/\/)/.test(line)) return [[line, SYN.comment]];
  const out = [];
  let rest = line;
  while (rest.length) {
    let m;
    if ((m = rest.match(/^\s+/))) out.push([m[0], SYN.fg]);
    else if ((m = rest.match(/^"[^"]*"/))) out.push([m[0], SYN.str]);
    else if ((m = rest.match(KEYWORDS))) out.push([m[0], SYN.kw]);
    else if ((m = rest.match(/^\d+(\.\d+)?/))) out.push([m[0], SYN.num]);
    else if ((m = rest.match(/^[A-Za-z_]\w*(?=\()/))) out.push([m[0], SYN.fn]);
    else if ((m = rest.match(/^[A-Za-z_]\w*/))) out.push([m[0], SYN.fg]);
    else {
      m = [rest[0]];
      out.push([m[0], SYN.punct]);
    }
    rest = rest.slice(m[0].length);
  }
  return out;
}

let codeTokens;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const MONO = '14px ui-monospace, Menlo, Consolas, "Courier New", monospace';
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function drawCode(ctx, t) {
  codeTokens ||= CODE.map(tokenize);
  const W = 640;
  const H = 400;
  const ROW = 22;
  const TOP = 36;
  const ACTIVE = 11;
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, W, H);

  // Tab bar
  ctx.fillStyle = '#0e141e';
  ctx.fillRect(0, 0, W, 28);
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(10, 4, 130, 24);
  ctx.fillStyle = ACCENT.teal;
  ctx.fillRect(10, 4, 130, 2);
  ctx.font = `12px ${SANS}`;
  ctx.fillStyle = '#c9d4e3';
  ctx.fillText('ledger_audit.py', 22, 20);
  ctx.fillStyle = '#5c6b82';
  ctx.fillText('dashboard.ts', 160, 20);

  // Scroll one line every ~1.7s, eased.
  const step = t / 1.7;
  const base = Math.floor(step);
  const frac = easeOut((step - base) / 0.3);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 28, W, H - 28 - 18);
  ctx.clip();
  ctx.fillStyle = '#0d131d';
  ctx.fillRect(0, 28, 46, H);
  ctx.fillStyle = '#111a28';
  ctx.fillRect(46, TOP + (ACTIVE - frac) * ROW - 15, W, ROW);
  ctx.font = MONO;
  for (let i = 0; i < 17; i++) {
    const idx = (base + i) % CODE.length;
    const y = TOP + (i - frac) * ROW;
    ctx.fillStyle = i === ACTIVE ? '#8b9bb4' : '#3b4658';
    ctx.textAlign = 'right';
    ctx.fillText(String(idx + 1), 34, y);
    ctx.textAlign = 'left';
    let x = 58;
    for (const [text, color] of codeTokens[idx]) {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
    if (i === ACTIVE && Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = ACCENT.teal;
      ctx.fillRect(x + 1, y - 12, 2, 16);
    }
  }
  ctx.restore();

  // Status bar
  ctx.fillStyle = '#0f3d3a';
  ctx.fillRect(0, H - 18, W, 18);
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = '#b9efe6';
  ctx.fillText('Python 3.12   UTF-8   Ln 12, Col 34', 12, H - 5);
}

const SERIES = Array.from({ length: 22 }, (_, i) => 0.42 + 0.22 * Math.sin(i * 0.5) + i * 0.011 + 0.06 * Math.sin(i * 1.9));
const BAR_VALUES = [0.4, 0.62, 0.5, 0.8, 0.58, 0.92, 0.7];
const BAR_COLORS = ['#3a4a63', '#3b6fa0', '#2f8fa0', '#2dd4bf', '#34d399', '#34d399', '#2dd4bf'];
const KPIS = [
  ['Records', 12480, (v) => Math.round(v).toLocaleString('en-US'), '#e6edf5'],
  ['Matched', 94.6, (v) => `${v.toFixed(1)}%`, ACCENT.green],
  ['Flagged', 137, (v) => String(Math.round(v)), '#f2b36b'],
];
const TABLE = [
  ['KAS-0142', '2024-Q3', '-1.2%', 'OK', ACCENT.green],
  ['KAS-0877', '2024-Q3', '+8.4%', 'Review', '#f2b36b'],
];

function drawDash(ctx, t) {
  const W = 640;
  const H = 400;
  const p = easeOut(((t % 10) / 3));
  ctx.fillStyle = '#0a0e15';
  ctx.fillRect(0, 0, W, H);

  ctx.font = `600 15px ${SANS}`;
  ctx.fillStyle = '#e6edf5';
  ctx.fillText('Ledger overview', 16, 28);
  ctx.fillStyle = '#12202b';
  rr(ctx, 506, 10, 118, 24, 12);
  ctx.fill();
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = '#7d93a8';
  ctx.fillText('Last 30 days', 530, 26);

  KPIS.forEach(([label, target, fmt, color], i) => {
    const x = 14 + i * 206;
    ctx.fillStyle = '#0f1822';
    rr(ctx, x, 46, 196, 62, 8);
    ctx.fill();
    ctx.strokeStyle = '#1b2a38';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = `11px ${SANS}`;
    ctx.fillStyle = '#6f8196';
    ctx.fillText(label, x + 14, 66);
    ctx.font = `600 24px ${SANS}`;
    ctx.fillStyle = color;
    ctx.fillText(fmt(target * p), x + 14, 96);
  });

  // Line chart
  ctx.fillStyle = '#0f1822';
  rr(ctx, 14, 118, 352, 186, 8);
  ctx.fill();
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = '#6f8196';
  ctx.fillText('Monthly variance', 28, 138);
  const cx = 30;
  const cy = 150;
  const cw = 320;
  const ch = 138;
  ctx.strokeStyle = '#17232f';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 3; g++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + (ch * g) / 3);
    ctx.lineTo(cx + cw, cy + (ch * g) / 3);
    ctx.stroke();
  }
  const n = SERIES.length;
  const end = p * (n - 1);
  const pts = [];
  for (let i = 0; i <= Math.floor(end); i++) pts.push([i, SERIES[i]]);
  if (end % 1 > 0 && Math.floor(end) + 1 < n) {
    const i = Math.floor(end);
    pts.push([end, SERIES[i] + (SERIES[i + 1] - SERIES[i]) * (end % 1)]);
  }
  const px = (i) => cx + (i / (n - 1)) * cw;
  const py = (v) => cy + ch - v * ch;
  if (pts.length > 1) {
    ctx.beginPath();
    pts.forEach(([i, v], k) => (k ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
    ctx.lineTo(px(pts[pts.length - 1][0]), cy + ch);
    ctx.lineTo(px(0), cy + ch);
    ctx.closePath();
    ctx.fillStyle = 'rgba(45,212,191,0.12)';
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([i, v], k) => (k ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
    ctx.strokeStyle = ACCENT.teal;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    const [li, lv] = pts[pts.length - 1];
    ctx.fillStyle = '#e6fffa';
    ctx.beginPath();
    ctx.arc(px(li), py(lv), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bar chart
  ctx.fillStyle = '#0f1822';
  rr(ctx, 378, 118, 248, 186, 8);
  ctx.fill();
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = '#6f8196';
  ctx.fillText('By department', 392, 138);
  BAR_VALUES.forEach((v, i) => {
    const h = 120 * v * easeOut(p * 1.25 - i * 0.07);
    ctx.fillStyle = BAR_COLORS[i];
    rr(ctx, 394 + i * 31, 288 - h, 20, Math.max(h, 1), 3);
    ctx.fill();
  });

  // Table
  ctx.fillStyle = '#0f1822';
  rr(ctx, 14, 314, 612, 74, 8);
  ctx.fill();
  const cols = [30, 190, 330, 470];
  ctx.font = `10px ${SANS}`;
  ctx.fillStyle = '#5c7186';
  ['Account', 'Period', 'Variance', 'Status'].forEach((h, i) => ctx.fillText(h.toUpperCase(), cols[i], 332));
  ctx.font = `12px ${SANS}`;
  TABLE.forEach((row, r) => {
    ctx.globalAlpha = clamp01(p * 3 - r * 0.6);
    row.slice(0, 4).forEach((cell, i) => {
      ctx.fillStyle = i === 3 ? '#c9d4e3' : '#9fb0c4';
      ctx.fillText(cell, cols[i] + (i === 3 ? 14 : 0), 352 + r * 18);
    });
    ctx.fillStyle = row[4];
    ctx.beginPath();
    ctx.arc(cols[3] + 4, 348 + r * 18, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function makeScreen(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  draw(ctx, 0);
  return { tex, ctx, draw };
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/* ---------- Shared geometries / materials ---------- */

const Ctx = createContext(null);

function makeGeometries() {
  return {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 20),
    sph: new THREE.SphereGeometry(1, 20, 14),
    plane: new THREE.PlaneGeometry(1, 1),
    circ: new THREE.CircleGeometry(1, 16),
    oct: new THREE.OctahedronGeometry(1),
  };
}

function makeMaterials(c, lite) {
  const Base = lite ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;
  const mk = (color, rough = 0.6, extra = {}) => {
    const { metalness, ...rest } = extra;
    return new Base({ color, ...rest, ...(lite ? {} : { roughness: rough, metalness: metalness ?? 0 }) });
  };
  const holo = (color, opacity = 0.85) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return {
    plinth: mk(c.plinth, 0.85),
    edge: new THREE.MeshBasicMaterial({ color: ACCENT.teal, transparent: true, opacity: 0.55 }),
    desk: mk(c.desk, 0.55),
    deskLeg: mk(c.deskLeg, 0.7),
    blazer: mk('#1b2230', 0.7),
    pants: mk('#11151d', 0.75),
    shirt: mk('#e9eef4', 0.6),
    skin: mk('#c49a82', 0.6),
    hair: mk('#15110e', 0.7),
    shoe: mk('#0b0d12', 0.5),
    phones: mk('#222833', 0.5),
    cups: mk('#2b6f73', 0.4, { emissive: ACCENT.teal, emissiveIntensity: 0.25 }),
    chair: mk('#202733', 0.7),
    metal: mk('#7e8a9c', 0.35, { metalness: 0.7 }),
    frame: mk('#10141b', 0.45),
    keyboard: mk('#171c26', 0.6),
    key: mk('#2a3240', 0.6),
    mug: mk('#e8edf3', 0.5),
    coffee: mk('#3a2619', 0.6),
    pot: mk('#c9bba8', 0.8),
    leaf: mk('#2f9a6b', 0.7),
    lamp: mk('#1d232e', 0.4, { metalness: 0.4 }),
    lampGlow: new THREE.MeshBasicMaterial({ color: '#ffd9a0' }),
    holoBlue: holo(ACCENT.blue),
    holoTeal: holo(ACCENT.teal),
    holoGreen: holo(ACCENT.green),
    holoGrey: holo('#8aa0b8', 0.45),
    holoPanel: holo('#0d1722', 0.9),
    holoGlass: holo(ACCENT.teal, 0.22),
    particle: new THREE.MeshBasicMaterial({ color: '#7ff5d8' }),
  };
}

function P({ geo = 'box', mat, p, s = [1, 1, 1], r, ...rest }) {
  const { g, m } = useContext(Ctx);
  return <mesh geometry={g[geo]} material={m[mat]} position={p} scale={s} rotation={r} {...rest} />;
}

function Cap({ mat, radius, length, p, r, s }) {
  const { m } = useContext(Ctx);
  return (
    <mesh material={m[mat]} position={p} rotation={r} scale={s}>
      <capsuleGeometry args={[radius, length, 6, 14]} />
    </mesh>
  );
}

function Lines({ pts, color, opacity = 0.6, segments = false, dashed = false }) {
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map((q) => new THREE.Vector3(...q)));
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.035, gapSize: 0.05 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const line = segments ? new THREE.LineSegments(geo, mat) : new THREE.Line(geo, mat);
    if (dashed) line.computeLineDistances();
    return line;
  }, [pts, color, opacity, segments, dashed]);
  useEffect(
    () => () => {
      obj.geometry.dispose();
      obj.material.dispose();
    },
    [obj]
  );
  return <primitive object={obj} />;
}

/* ---------- Person ---------- */

const FORE = 1.15; // elbow bend; the forearm ends up nearly horizontal

function Person({ animate }) {
  const torso = useRef();
  const head = useRef();
  const elbows = useRef([]);
  const turn = useRef(0);

  useFrame(({ clock }, dt) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    const b = Math.sin(t * 1.6);
    torso.current.scale.set(1 + b * 0.012, 1 + b * 0.008, 1 + b * 0.016);
    // Look at the laptop, then the side monitor, then the code screen.
    turn.current = damp(turn.current, [0, -0.4, 0.32][Math.floor(t / 3.2) % 3], 3, dt);
    head.current.rotation.y = turn.current;
    head.current.rotation.x = -0.04 + b * 0.008;
    const amp = 0.5 + 0.5 * Math.sin(t * 0.7);
    elbows.current.forEach((el, i) => {
      if (el) el.rotation.x = FORE + Math.sin(t * 10 + i * 1.7) * 0.035 * amp;
    });
  });

  const arm = (side, i) => (
    <group key={side} position={[side * 0.27, 1.04, 0]} rotation={[0.3, 0, side * 0.1]}>
      <P geo="sph" mat="blazer" s={[0.09, 0.09, 0.09]} />
      <Cap mat="blazer" radius={0.055} length={0.17} p={[0, -0.14, 0]} />
      <group position={[0, -0.28, 0]} rotation={[FORE, 0, 0]} ref={(el) => (elbows.current[i] = el)}>
        <P geo="sph" mat="blazer" s={[0.055, 0.055, 0.055]} />
        <Cap mat="blazer" radius={0.047} length={0.17} p={[0, -0.13, 0]} />
        <P geo="cyl" mat="shirt" p={[0, -0.235, 0]} s={[0.05, 0.02, 0.05]} />
        <P geo="sph" mat="skin" p={[0, -0.29, 0]} s={[0.05, 0.055, 0.05]} />
      </group>
    </group>
  );

  return (
    <group position={[0.1, 0, 0.62]}>
      {/* Chair */}
      <P mat="chair" p={[0, 0.41, -0.04]} s={[0.56, 0.07, 0.52]} />
      <P mat="chair" p={[0, 0.66, 0.24]} s={[0.5, 0.26, 0.05]} r={[-0.08, 0, 0]} />
      <P mat="metal" p={[0, 0.5, 0.2]} s={[0.04, 0.2, 0.03]} />
      <P geo="cyl" mat="metal" p={[0, 0.24, 0]} s={[0.035, 0.34, 0.035]} />
      {[0, 1, 2, 3, 4].map((k) => {
        const a = (k / 5) * Math.PI * 2 + 0.3;
        return (
          <group key={k} rotation={[0, a, 0]}>
            <P mat="chair" p={[0.15, 0.05, 0]} s={[0.3, 0.03, 0.04]} />
            <P geo="sph" mat="shoe" p={[0.3, 0.025, 0]} s={[0.03, 0.03, 0.03]} />
          </group>
        );
      })}

      {/* Legs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Cap mat="pants" radius={0.085} length={0.3} p={[side * 0.11, 0.5, -0.22]} r={[Math.PI / 2, 0, 0]} />
          <Cap mat="pants" radius={0.07} length={0.28} p={[side * 0.11, 0.26, -0.43]} />
          <P mat="shoe" p={[side * 0.11, 0.045, -0.5]} s={[0.1, 0.07, 0.22]} />
        </group>
      ))}
      <P geo="sph" mat="pants" p={[0, 0.5, 0]} s={[0.22, 0.12, 0.17]} />

      {/* Torso, neck, head */}
      <group ref={torso} position={[0, 0.8, 0]}>
        <Cap mat="blazer" radius={0.17} length={0.3} s={[1.3, 1, 0.85]} />
        <P mat="blazer" p={[0, -0.05, 0.145]} s={[0.012, 0.42, 0.012]} />
      </group>
      <P geo="sph" mat="blazer" p={[0, 0.98, 0]} s={[0.26, 0.1, 0.15]} />
      <P geo="cyl" mat="skin" p={[0, 1.14, 0]} s={[0.052, 0.07, 0.052]} />
      <P geo="cyl" mat="shirt" p={[0, 1.1, 0]} s={[0.078, 0.03, 0.078]} />
      <mesh position={[0, 1.07, -0.02]} rotation={[Math.PI / 2, 0, 0]} material={useContext(Ctx).m.phones}>
        <torusGeometry args={[0.125, 0.02, 10, 28]} />
      </mesh>
      {[-1, 1].map((side) => (
        <P key={side} geo="cyl" mat="cups" p={[side * 0.13, 1.0, -0.075]} s={[0.055, 0.02, 0.055]} r={[0, 0, Math.PI / 2 - side * 0.2]} />
      ))}
      <group ref={head} position={[0, 1.2, 0]}>
        <P geo="sph" mat="skin" p={[0, 0.12, 0]} s={[0.115, 0.135, 0.125]} />
        <P geo="sph" mat="hair" p={[0, 0.14, 0.012]} s={[0.125, 0.14, 0.138]} />
        {[-1, 1].map((side) => (
          <P key={side} geo="sph" mat="skin" p={[side * 0.118, 0.1, -0.005]} s={[0.02, 0.035, 0.025]} />
        ))}
      </group>

      {arm(-1, 0)}
      {arm(1, 1)}
    </group>
  );
}

/* ---------- Workstation ---------- */

function Monitor({ p, rotY, w, h, tex }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <P mat="frame" s={[w, h, 0.04]} />
      <mesh position={[0, 0, 0.0215]}>
        <planeGeometry args={[w - 0.05, h - 0.05]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <P mat="metal" p={[0, -h / 2 - 0.06, -0.04]} s={[0.07, 0.14, 0.025]} />
      <P geo="cyl" mat="frame" p={[0, -h / 2 - 0.125, -0.02]} s={[0.15, 0.012, 0.15]} />
    </group>
  );
}

function Laptop({ tex }) {
  return (
    <group position={[-0.95, 0.74, 0.34]} rotation={[0, 0.45, 0]}>
      <P mat="metal" p={[0, 0.008, 0]} s={[0.46, 0.016, 0.31]} />
      <group position={[0, 0.016, -0.155]} rotation={[-0.3, 0, 0]}>
        <P mat="frame" p={[0, 0.15, 0]} s={[0.46, 0.3, 0.012]} />
        <mesh position={[0, 0.15, 0.0068]}>
          <planeGeometry args={[0.43, 0.27]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Workstation({ codeTex, dashTex, c }) {
  const leaves = [-0.5, 0.1, 0.7, 1.3, 1.9];
  return (
    <group>
      {/* Desk */}
      <P mat="desk" p={[0, 0.71, 0]} s={[3.2, 0.06, 1.05]} />
      <P mat="deskLeg" p={[-1.5, 0.34, 0]} s={[0.06, 0.68, 0.95]} />
      <P mat="deskLeg" p={[1.5, 0.34, 0]} s={[0.06, 0.68, 0.95]} />
      <P mat="deskLeg" p={[0, 0.5, -0.46]} s={[2.9, 0.34, 0.03]} />

      <Monitor p={[-0.95, 1.2, -0.36]} rotY={0.28} w={1.25} h={0.78} tex={codeTex} />
      <Monitor p={[1.0, 1.1, -0.36]} rotY={-0.28} w={1.0} h={0.625} tex={dashTex} />
      <Laptop tex={dashTex} />

      {/* Keyboard and mouse */}
      <P mat="keyboard" p={[0.1, 0.75, 0.2]} s={[0.56, 0.02, 0.18]} />
      {[0.14, 0.2, 0.26].map((z) => (
        <P key={z} mat="key" p={[0.1, 0.762, z - 0.0]} s={[0.5, 0.006, 0.035]} />
      ))}
      <P geo="sph" mat="keyboard" p={[0.52, 0.755, 0.22]} s={[0.04, 0.02, 0.06]} />

      {/* Lamp */}
      <group position={[-1.5, 0.74, -0.3]}>
        <P geo="cyl" mat="lamp" s={[0.09, 0.02, 0.09]} p={[0, 0.01, 0]} />
        <P geo="cyl" mat="lamp" s={[0.012, 0.3, 0.012]} p={[0, 0.17, 0]} r={[0, 0, -0.18]} />
        <P geo="cyl" mat="lamp" s={[0.012, 0.28, 0.012]} p={[0.08, 0.4, 0]} r={[0, 0, 0.9]} />
        <P geo="cyl" mat="lamp" s={[0.07, 0.07, 0.07]} p={[0.2, 0.46, 0]} r={[0, 0, 0.3]} />
        <P geo="sph" mat="lampGlow" s={[0.04, 0.04, 0.04]} p={[0.22, 0.43, 0]} />
        <pointLight position={[0.2, 0.4, 0.05]} color="#ffb15c" intensity={1.1} distance={2.2} decay={2} />
      </group>

      {/* Mug */}
      <group position={[1.4, 0.74, 0.28]}>
        <P geo="cyl" mat="mug" s={[0.05, 0.1, 0.05]} p={[0, 0.05, 0]} />
        <P geo="cyl" mat="coffee" s={[0.042, 0.004, 0.042]} p={[0, 0.098, 0]} />
        <mesh position={[0.055, 0.05, 0]} material={useContext(Ctx).m.mug}>
          <torusGeometry args={[0.027, 0.008, 6, 12]} />
        </mesh>
      </group>

      {/* Plant */}
      <group position={[1.45, 0.74, -0.3]}>
        <P geo="cyl" mat="pot" s={[0.07, 0.11, 0.07]} p={[0, 0.055, 0]} />
        {leaves.map((a, k) => (
          <P
            key={k}
            geo="sph"
            mat="leaf"
            s={[0.025, 0.1, 0.045]}
            p={[Math.cos(a * 3) * 0.05, 0.19, Math.sin(a * 3) * 0.05]}
            r={[Math.sin(a * 3) * 0.5, 0, -Math.cos(a * 3) * 0.5]}
          />
        ))}
      </group>
    </group>
  );
}

/* ---------- Holographic charts ---------- */

function Bob({ p, phase = 0, spin = 0, animate, children }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!animate || !ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = p[1] + Math.sin(t * 0.9 + phase) * 0.04;
    if (spin) ref.current.rotation.y = t * spin;
  });
  return (
    <group ref={ref} position={p}>
      {children}
    </group>
  );
}

const GRID = (() => {
  const pts = [];
  for (let i = 0; i <= 4; i++) {
    const v = -0.4 + (i / 4) * 1.0;
    pts.push([-0.4, 0, v], [0.4, 0, v], [v, 0, -0.4], [v, 0, 0.4]);
  }
  return pts;
})();

const BAR_BASE = [0.35, 0.55, 0.42, 0.75, 0.6, 0.95];

function barGrow(i, p) {
  const a = easeOut((p * 1.5 - i * 0.07) / 0.5);
  const fade = p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
  return Math.max(0.001, a * fade);
}

function HoloBars({ animate }) {
  const { g, m } = useContext(Ctx);
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(
    () => ['#3a4a63', '#3b6fa0', '#2f8fa0', '#2dd4bf', '#34d399', '#6ee7b7'].map((x) => new THREE.Color(x)),
    []
  );

  const place = (p) => {
    BAR_BASE.forEach((base, i) => {
      const h = base * 0.6 * barGrow(i, p);
      dummy.position.set(-0.3 + i * 0.12, h / 2, 0);
      dummy.scale.set(0.085, h, 0.085);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    colors.forEach((col, i) => ref.current.setColorAt(i, col));
    ref.current.instanceColor.needsUpdate = true;
    place(0.8);
  }, [colors]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    if (animate) place((clock.elapsedTime / 5) % 1);
  });

  return (
    <group scale={0.95}>
      <instancedMesh ref={ref} args={[g.box, m.holoGreen, BAR_BASE.length]} frustumCulled={false} />
      <Lines pts={GRID} color={ACCENT.teal} opacity={0.3} segments />
    </group>
  );
}

function mulberry(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLUSTERS = [
  { c: [-0.2, -0.05, 0.08], col: ACCENT.blue },
  { c: [0.18, 0.12, -0.1], col: ACCENT.teal },
  { c: [0.0, 0.26, 0.14], col: ACCENT.green },
];
const AXES = [
  [-0.38, -0.3, -0.3], [0.38, -0.3, -0.3],
  [-0.38, -0.3, -0.3], [-0.38, 0.38, -0.3],
  [-0.38, -0.3, -0.3], [-0.38, -0.3, 0.38],
];

function HoloScatter() {
  const { g, m } = useContext(Ctx);
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const rnd = mulberry(7);
    let k = 0;
    CLUSTERS.forEach(({ c, col }) => {
      const color = new THREE.Color(col);
      for (let i = 0; i < 12; i++) {
        dummy.position.set(c[0] + (rnd() - 0.5) * 0.24, c[1] + (rnd() - 0.5) * 0.24, c[2] + (rnd() - 0.5) * 0.24);
        dummy.scale.setScalar(0.028 + rnd() * 0.01);
        dummy.updateMatrix();
        ref.current.setMatrixAt(k, dummy.matrix);
        ref.current.setColorAt(k, color);
        k++;
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [dummy]);

  return (
    <group>
      <instancedMesh ref={ref} args={[g.sph, m.holoGreen, 36]} frustumCulled={false} />
      {CLUSTERS.map(({ c, col }) => (
        <mesh key={col} geometry={g.oct} position={c} scale={0.04}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      ))}
      <Lines pts={AXES} color="#8aa0b8" opacity={0.45} segments />
    </group>
  );
}

const RIBBON_W = 0.95;
const RIBBON_PTS = Array.from({ length: 25 }, (_, i) => {
  const x = i / 24;
  return [x * RIBBON_W, (0.1 + 0.12 * Math.sin(x * 6) + 0.3 * x + 0.04 * Math.sin(x * 17)) * 0.9, 0];
});
const RIBBON_BASE = [[0, 0, 0], [RIBBON_W, 0, 0], [0, 0, 0], [0, 0.5, 0]];

function HoloRibbon({ animate }) {
  const ref = useRef();
  const { m } = useContext(Ctx);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    RIBBON_PTS.forEach(([x, y]) => s.lineTo(x, y));
    s.lineTo(RIBBON_W, 0);
    s.closePath();
    return s;
  }, []);

  useFrame(({ clock }) => {
    if (!animate) return;
    const p = (clock.elapsedTime / 6) % 1;
    const s = p < 0.55 ? easeOut(p / 0.55) : p < 0.85 ? 1 : 1 - easeOut((p - 0.85) / 0.15);
    ref.current.scale.x = Math.max(s, 0.001);
  });

  return (
    <group>
      <group ref={ref}>
        <mesh material={m.holoGlass}>
          <shapeGeometry args={[shape]} />
        </mesh>
        <Lines pts={RIBBON_PTS} color={ACCENT.green} opacity={0.95} />
      </group>
      <Lines pts={RIBBON_BASE} color="#8aa0b8" opacity={0.45} segments />
    </group>
  );
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const CARD = { w: 0.8, h: 0.6 };
const CARD_SHAPE = roundedRect(CARD.w, CARD.h, 0.04);
const CARD_OUTLINE = [...CARD_SHAPE.getPoints(6), CARD_SHAPE.getPoints(6)[0]].map((q) => [q.x, q.y, 0.002]);

function AppCard() {
  const { m } = useContext(Ctx);
  const bars = [0.3, 0.5, 0.4, 0.7, 0.55];
  return (
    <group>
      <mesh material={m.holoPanel}>
        <shapeGeometry args={[CARD_SHAPE]} />
      </mesh>
      <Lines pts={CARD_OUTLINE} color={ACCENT.teal} opacity={0.85} />
      {[0, 1, 2].map((k) => (
        <P key={k} geo="circ" mat={['holoGrey', 'holoBlue', 'holoGreen'][k]} p={[-0.34 + k * 0.045, 0.255, 0.004]} s={[0.014, 0.014, 1]} />
      ))}
      <P geo="plane" mat="holoGrey" p={[0.18, 0.255, 0.004]} s={[0.3, 0.02, 1]} />
      <P geo="plane" mat="holoGreen" p={[-0.2, 0.14, 0.004]} s={[0.26, 0.055, 1]} />
      <P geo="plane" mat="holoGrey" p={[-0.24, 0.07, 0.004]} s={[0.18, 0.022, 1]} />
      {bars.map((v, k) => (
        <P key={k} geo="plane" mat={k > 2 ? 'holoGreen' : 'holoBlue'} p={[-0.3 + k * 0.07, -0.1 - (0.2 - v * 0.2) / 2 - 0.0, 0.004]} s={[0.05, v * 0.2, 1]} />
      ))}
      {[0.15, 0.08, 0.01].map((y, k) => (
        <P key={y} geo="plane" mat="holoGrey" p={[0.2, y, 0.004]} s={[0.32 - k * 0.06, 0.026, 1]} />
      ))}
      <P geo="plane" mat="holoTeal" p={[0.2, -0.2, 0.004]} s={[0.26, 0.06, 1]} />
    </group>
  );
}

/* ---------- Data flow: dotted connectors and a few particles ---------- */

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const FLOWS = [
  new THREE.QuadraticBezierCurve3(V(-0.95, 1.6, -0.4), V(-1.1, 1.85, -0.4), V(-1.15, 1.95, -0.35)),
  new THREE.QuadraticBezierCurve3(V(-0.7, 1.6, -0.4), V(-0.45, 2.0, -0.5), V(-0.1, 2.28, -0.5)),
  new THREE.QuadraticBezierCurve3(V(1.0, 1.45, -0.4), V(0.85, 1.7, -0.4), V(0.8, 1.9, -0.35)),
  new THREE.QuadraticBezierCurve3(V(1.2, 1.4, -0.4), V(1.5, 1.55, -0.2), V(1.65, 1.55, 0)),
];
const FLOW_LINES = FLOWS.map((curve) => curve.getPoints(24).map((q) => [q.x, q.y, q.z]));
const PER_FLOW = 14;

function Particles({ animate }) {
  const { g, m } = useContext(Ctx);
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!animate || !ref.current) return;
    const t = clock.elapsedTime;
    FLOWS.forEach((curve, f) => {
      for (let k = 0; k < PER_FLOW; k++) {
        const u = (t * 0.16 + k / PER_FLOW + f * 0.13) % 1;
        dummy.position.copy(curve.getPoint(u));
        dummy.scale.setScalar(0.014 * Math.sin(Math.PI * u) + 0.002);
        dummy.updateMatrix();
        ref.current.setMatrixAt(f * PER_FLOW + k, dummy.matrix);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[g.sph, m.particle, FLOWS.length * PER_FLOW]} frustumCulled={false} />;
}

/* ---------- Scene ---------- */

function Scene({ isDark, animate, interactive, lite }) {
  const c = isDark ? PALETTE.dark : PALETTE.light;
  const group = useRef();
  const { camera, size } = useThree();

  const g = useMemo(makeGeometries, []);
  const m = useMemo(() => makeMaterials(c, lite), [c, lite]);
  useEffect(() => () => Object.values(g).forEach((x) => x.dispose()), [g]);
  useEffect(() => () => Object.values(m).forEach((x) => x.dispose()), [m]);

  const screens = useMemo(() => ({ code: makeScreen(drawCode), dash: makeScreen(drawDash) }), []);
  const shadow = useMemo(makeShadowTexture, []);
  useEffect(
    () => () => {
      screens.code.tex.dispose();
      screens.dash.tex.dispose();
      shadow.dispose();
    },
    [screens, shadow]
  );

  useEffect(() => {
    camera.lookAt(0, 1.05, 0);
    camera.zoom = Math.min(1, size.width / size.height / 1.25) * 1.0;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  const lastDraw = useRef(0);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (animate && t - lastDraw.current > 0.08) {
      lastDraw.current = t;
      screens.code.draw(screens.code.ctx, t);
      screens.dash.draw(screens.dash.ctx, t);
      screens.code.tex.needsUpdate = true;
      screens.dash.tex.needsUpdate = true;
    }
    // Gentle parallax towards the cursor (desktop only).
    const ty = interactive ? state.pointer.x * 0.2 : 0;
    const tx = interactive ? -state.pointer.y * 0.04 : 0;
    group.current.rotation.y = damp(group.current.rotation.y, ty, 3, delta);
    group.current.rotation.x = damp(group.current.rotation.x, tx, 3, delta);
  });

  return (
    <Ctx.Provider value={{ g, m }}>
      <mesh position={[0, -0.012, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 3.5]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={group}>
        <P mat="plinth" s={[3.8, 0.2, 2.5]} />
        {[
          [[0, 0.101, 1.25], [3.8, 0.012, 0.012]],
          [[0, 0.101, -1.25], [3.8, 0.012, 0.012]],
          [[1.9, 0.101, 0], [0.012, 0.012, 2.5]],
          [[-1.9, 0.101, 0], [0.012, 0.012, 2.5]],
        ].map(([p, s], i) => (
          <P key={i} mat="edge" p={p} s={s} />
        ))}

        <group position={[0, 0.1, 0]}>
          <Workstation codeTex={screens.code.tex} dashTex={screens.dash.tex} c={c} />
          <Person animate={animate} />

          <Bob p={[-1.15, 1.95, -0.35]} phase={0} animate={animate}>
            <HoloBars animate={animate} />
          </Bob>
          <Bob p={[0, 2.3, -0.5]} phase={1.6} spin={0.25} animate={animate}>
            <HoloScatter />
          </Bob>
          <Bob p={[0.5, 1.95, -0.35]} phase={3.1} animate={animate}>
            <HoloRibbon animate={animate} />
          </Bob>
          <Bob p={[1.8, 1.55, 0]} phase={4.5} animate={animate}>
            <group rotation={[0, -0.45, 0]}>
              <AppCard />
            </group>
          </Bob>

          {!lite && FLOW_LINES.map((pts, i) => <Lines key={i} pts={pts} color={ACCENT.teal} opacity={0.35} dashed />)}
          {animate && <Particles animate />}
        </group>
      </group>
    </Ctx.Provider>
  );
}

export default function HeroScene({ isDark = true, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [env, setEnv] = useState({ webgl: false, fine: false, lowPower: false, small: false });
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const read = () =>
      setEnv({
        webgl: supportsWebGL(),
        fine: window.matchMedia('(pointer: fine)').matches,
        lowPower: (navigator.hardwareConcurrency || 8) <= 2,
        small: mq.matches,
      });
    const onVisibility = () => setTabVisible(!document.hidden);
    read();
    onVisibility();
    mq.addEventListener('change', read);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mq.removeEventListener('change', read);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Small screens and weak devices get a static pose with simpler materials.
  const lite = env.small || env.lowPower;
  const animate = !reduceMotion && !lite;

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label="3D illustration of a developer at a desk with a code editor and data dashboard, with charts and an app window rising from the screens"
    >
      {env.webgl && (
        <Canvas
          frameloop={animate && inView && tabVisible ? 'always' : 'demand'}
          dpr={env.fine && !lite ? [1, 1.75] : [1, 1.25]}
          camera={{ position: [2.4, 3.9, 6.2], fov: 34 }}
          gl={{ antialias: !lite, alpha: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={isDark ? 0.5 : 0.9} />
          <directionalLight position={[4, 6, 3]} intensity={isDark ? 1.7 : 1.5} />
          <directionalLight position={[-4, 3, -2]} intensity={0.8} color="#4fa3d9" />
          <Scene isDark={isDark} animate={animate} interactive={env.fine && !reduceMotion && !lite} lite={lite} />
        </Canvas>
      )}
    </div>
  );
}
