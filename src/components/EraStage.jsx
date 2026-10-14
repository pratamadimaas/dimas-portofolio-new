import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * Era stage: seven small low-poly objects, one per timeline entry, spread along a glowing path.
 * The camera travels the path with scroll; the active era lights up, past eras settle dim,
 * future eras are ghosted but outlined. scrollRef.current.f is the scroll position as a float
 * index (0 to 6). The stage writes back the damped value (fs) and each milestone's screen
 * position (sx, sy in NDC) so the DOM cards can anchor to it.
 */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;

const TEAL = '#5eead4';
const GREEN = '#34d399';
const BLUE = '#3b82c4';
const AMBER = '#f2a93b';

/* ---------- Canvas textures ---------- */

const MONO = '16px ui-monospace, Menlo, Consolas, "Courier New", monospace';
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMath(ctx, w, h) {
  ctx.fillStyle = '#0e1a2b';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(94,234,212,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.fillStyle = TEAL;
  ctx.font = `italic 96px ${SERIF}`;
  ctx.fillText('π', 28, 120);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('Σ', 150, 120);
  ctx.fillStyle = GREEN;
  ctx.fillText('∫', 270, 120);
  ctx.fillStyle = '#cfe9f0';
  ctx.font = `italic 30px ${SERIF}`;
  ctx.fillText('a² + b² = c²', 28, 200);
  ctx.fillText('e^(iπ) + 1 = 0', 28, 250);
  ctx.fillText('lim sin x / x = 1', 28, 300);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 330; x <= 490; x += 4) {
    const y = 250 - Math.sin(((x - 330) / 160) * Math.PI * 2) * 40;
    if (x === 330) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawWindow(ctx, w, h, title, lines) {
  ctx.fillStyle = '#0b1017';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#131c29';
  ctx.fillRect(0, 0, w, 34);
  ['#3b4658', '#3b4658', '#3b4658'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(20 + i * 20, 17, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = `12px ${SANS}`;
  ctx.fillStyle = '#6f8196';
  ctx.fillText(title, w / 2 - 30, 22);
  ctx.font = MONO;
  lines.forEach((segs, i) => {
    let x = 20;
    segs.forEach(([text, color]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, 66 + i * 26);
      x += ctx.measureText(text).width;
    });
  });
}

const C = { c: '#5c6b82', k: '#c792ea', s: '#a5e075', f: '#6cb6ff', n: '#f2b36b', t: '#c9d4e3' };

function drawTerminal(ctx, w, h) {
  drawWindow(ctx, w, h, 'terminal', [
    [['// C', C.c]],
    [['int ', C.k], ['main', C.f], ['(void) { ', C.t], ['return ', C.k], ['0', C.n], ['; }', C.t]],
    [['// Java', C.c]],
    [['public static void ', C.k], ['main', C.f], ['(String[] a)', C.t]],
    [['# Python', C.c]],
    [['for ', C.k], ['n ', C.t], ['in ', C.k], ['range', C.f], ['(', C.t], ['10', C.n], ['): ', C.t], ['print', C.f], ['(n)', C.t]],
    [['$ ', TEAL], ['_', TEAL]],
  ]);
}

function drawLaptop(ctx, w, h) {
  drawWindow(ctx, w, h, 'routes/web.php', [
    [['<?php', C.k]],
    [['Route', C.f], ['::get(', C.t], ['"/users"', C.s], [', ', C.t], ['function', C.k], [' () {', C.t]],
    [['    return ', C.k], ['User', C.f], ['::all();', C.t]],
    [['});', C.t]],
    [['class ', C.k], ['Order ', C.f], ['extends ', C.k], ['Model', C.f], [' {}', C.t]],
    [['$order', C.n], ['->', C.t], ['save', C.f], ['();', C.t]],
  ]);
}

function drawSheet(ctx, w, h) {
  ctx.fillStyle = '#17130a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(242,169,59,0.28)';
  ctx.fillRect(0, 0, w, 34);
  ctx.strokeStyle = 'rgba(242,169,59,0.55)';
  ctx.lineWidth = 1.5;
  for (let y = 34; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (const x of [48, 108, 168]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(242,169,59,0.5)';
  [[108, 66], [168, 130], [48, 98]].forEach(([x, y]) => ctx.fillRect(x + 3, y + 3, 56, 26));
  ctx.fillStyle = '#f6d9a0';
  ctx.font = `11px ${SANS}`;
  ['A', 'B', 'C', 'D'].forEach((t, i) => ctx.fillText(t, 20 + i * 60, 22));
}

function drawOffice(ctx, w, h) {
  ctx.fillStyle = '#101a28';
  ctx.fillRect(0, 0, w, h);
  const rnd = (i) => (Math.sin(i * 91.7) * 43758.5) % 1;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 4; c++) {
      const lit = Math.abs(rnd(r * 4 + c)) > 0.55;
      ctx.fillStyle = lit ? TEAL : '#1d2b3f';
      ctx.globalAlpha = lit ? 0.85 : 1;
      ctx.fillRect(22 + c * 56, 24 + r * 38, 36, 22);
    }
  }
  ctx.globalAlpha = 1;
}

function drawDash(ctx, w, h) {
  ctx.fillStyle = '#0d1722';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e6edf5';
  ctx.font = `600 18px ${SANS}`;
  ctx.fillText('Office monitor', 18, 30);
  const cols = ['#3a4a63', '#3b6fa0', '#2f8fa0', TEAL, GREEN, GREEN];
  [0.25, 0.4, 0.35, 0.6, 0.78, 0.95].forEach((v, i) => {
    ctx.fillStyle = cols[i];
    rr(ctx, 22 + i * 42, 240 - v * 130, 28, v * 130, 4);
    ctx.fill();
  });
  ctx.strokeStyle = '#e6fffa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  [0.3, 0.38, 0.34, 0.55, 0.7, 0.9].forEach((v, i) => {
    const x = 36 + i * 42;
    const y = 232 - v * 130;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  });
  ctx.stroke();
}

function drawReport(ctx, w, h) {
  ctx.fillStyle = '#e8f3ef';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, w, 54);
  ctx.fillStyle = '#052e22';
  ctx.font = `700 22px ${SANS}`;
  ctx.fillText('TKD Report', 18, 36);
  ctx.fillStyle = '#052e22';
  rr(ctx, w - 62, 70, 44, 44, 10);
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.font = `700 28px ${SANS}`;
  ctx.fillText('Q', w - 49, 102);
  ctx.fillStyle = '#b6c8c1';
  [140, 170, 200, 230, 260].forEach((y, i) => ctx.fillRect(18, y, i % 2 ? 150 : 200, 10));
  ctx.fillStyle = GREEN;
  [0.4, 0.7, 0.55].forEach((v, i) => ctx.fillRect(20 + i * 26, 318 - v * 40, 18, v * 40));
}

/* ---------- Era data ---------- */

function makeTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// World space: the path runs left to right along x, camera on +z.
export const SPACING = 3.1;
const ex = (i) => (i - 2.5) * SPACING;
const ERAS = [
  { home: [ex(0), 0.25, 0], face: 0.25, accent: TEAL, body: '#1c2a3d', body2: '#2a3b52', screens: { board: [512, 360, drawMath] } },
  { home: [ex(1), -0.3, -0.2], face: -0.25, accent: BLUE, body: '#142033', body2: '#22324a', screens: { term: [512, 300, drawTerminal] } },
  { home: [ex(2), 0.2, 0], face: 0.2, accent: AMBER, body: '#3a3326', body2: '#4a4130', screens: { sheet: [256, 192, drawSheet] } },
  { home: [ex(3), -0.2, -0.1], face: -0.2, accent: BLUE, body: '#16263a', body2: '#243a55', screens: {} },
  { home: [ex(4), 0.25, 0], face: 0.25, accent: TEAL, body: '#1d2635', body2: '#2c384c', screens: { lap: [512, 300, drawLaptop] } },
  { home: [ex(5), -0.25, -0.2], face: -0.25, accent: TEAL, body: '#1a2638', body2: '#27364d', screens: { win: [256, 384, drawOffice], dash: [384, 280, drawDash] } },
  { home: [ex(6), 0.1, 0], face: 0.2, accent: GREEN, body: '#14261f', body2: '#1f3a30', screens: { rep: [256, 340, drawReport] } },
];

const Ctx = createContext(null);

function P({ geo = 'box', mat, p, s = [1, 1, 1], r }) {
  const { g, m } = useContext(Ctx);
  return <mesh geometry={g[geo]} material={m[mat]} position={p} scale={s} rotation={r} />;
}

function Screen({ mat, p, s, r }) {
  const { g, m } = useContext(Ctx);
  return <mesh geometry={g.plane} material={m[mat]} position={p} scale={s} rotation={r} />;
}

function Edge({ p, s, r }) {
  const { g, m } = useContext(Ctx);
  return <lineSegments geometry={g.edges} material={m.line} position={p} scale={s} rotation={r} />;
}

/* ---------- Era objects (about 0.8 units wide) ---------- */

function MathBoard() {
  return (
    <group>
      <P mat="body" s={[0.86, 0.6, 0.04]} />
      <Screen mat="board" p={[0, 0, 0.022]} s={[0.8, 0.56, 1]} />
      <Edge s={[0.86, 0.6, 0.04]} />
      <P mat="body2" p={[0, -0.34, 0.04]} s={[0.5, 0.03, 0.07]} />
      <P geo="cyl" mat="accent" p={[0.1, -0.315, 0.05]} s={[0.012, 0.03, 0.012]} r={[0, 0, Math.PI / 2]} />
    </group>
  );
}

function Terminal() {
  return (
    <group>
      <P mat="body" s={[0.86, 0.52, 0.03]} />
      <Screen mat="term" p={[0, 0, 0.017]} s={[0.82, 0.48, 1]} />
      <Edge s={[0.86, 0.52, 0.03]} />
      <P mat="accent" p={[0.3, -0.31, 0]} s={[0.1, 0.02, 0.02]} />
    </group>
  );
}

function Treasury() {
  const cols = [-0.33, -0.2, -0.07, 0.07, 0.2, 0.33];
  return (
    <group scale={0.85}>
      <group position={[-0.2, 0, 0]}>
        <P mat="body2" p={[0, -0.33, 0]} s={[0.9, 0.06, 0.5]} />
        <P mat="body2" p={[0, -0.28, 0]} s={[0.8, 0.05, 0.44]} />
        <P mat="body" p={[0, -0.04, -0.06]} s={[0.66, 0.4, 0.26]} />
        {cols.map((x) => (
          <P key={x} geo="cyl" mat="accent" p={[x, -0.03, 0.14]} s={[0.035, 0.4, 0.035]} />
        ))}
        <P mat="body2" p={[0, 0.2, 0.04]} s={[0.78, 0.06, 0.42]} />
        <P geo="tri" mat="accent" p={[0, 0.34, 0.04]} s={[0.46, 0.4, 0.2]} r={[-Math.PI / 2, 0, 0]} />
        <Edge p={[0, -0.04, 0.04]} s={[0.78, 0.5, 0.42]} />
      </group>
      <group position={[0.58, -0.12, 0.1]} rotation={[0, -0.5, 0]}>
        <P mat="body" s={[0.52, 0.4, 0.02]} />
        <Screen mat="sheet" p={[0, 0, 0.012]} s={[0.5, 0.38, 1]} />
        <Edge s={[0.52, 0.4, 0.02]} />
      </group>
    </group>
  );
}

function LaptopEra() {
  return (
    <group>
      <P mat="body2" p={[0, -0.2, 0.05]} s={[0.78, 0.03, 0.5]} />
      <P mat="body" p={[0, -0.18, 0.1]} s={[0.66, 0.012, 0.22]} />
      <group position={[0, -0.185, -0.2]} rotation={[-0.3, 0, 0]}>
        <P mat="body" p={[0, 0.25, 0]} s={[0.78, 0.5, 0.025]} />
        <Screen mat="lap" p={[0, 0.25, 0.014]} s={[0.74, 0.46, 1]} />
        <Edge p={[0, 0.25, 0]} s={[0.78, 0.5, 0.025]} />
      </group>
      <P mat="accent" p={[0, -0.18, 0.31]} s={[0.12, 0.012, 0.012]} />
    </group>
  );
}

function Office() {
  return (
    <group scale={0.85}>
      <group position={[-0.28, 0, 0]}>
        <P mat="body" p={[0, 0, 0]} s={[0.5, 0.95, 0.4]} />
        <Screen mat="win" p={[0, 0, 0.202]} s={[0.46, 0.9, 1]} />
        <P mat="body2" p={[0.38, -0.22, 0.02]} s={[0.3, 0.5, 0.34]} />
        <P mat="accent" p={[0, 0.48, 0]} s={[0.52, 0.015, 0.42]} />
        <Edge s={[0.5, 0.95, 0.4]} />
      </group>
      <group position={[0.5, 0.3, 0.2]} rotation={[0, -0.3, 0]}>
        <P mat="body" s={[0.6, 0.45, 0.02]} />
        <Screen mat="dash" p={[0, 0, 0.012]} s={[0.58, 0.43, 1]} />
        <Edge s={[0.6, 0.45, 0.02]} />
      </group>
    </group>
  );
}

const NODES = [
  [0, 0.2, 0], [-0.22, 0.1, 0.08], [0.22, 0.12, -0.06], [-0.12, 0.34, -0.1], [0.14, 0.36, 0.08], [0, 0.5, 0.0], [-0.3, 0.3, 0.0],
];
const NODE_LINKS = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [2, 4], [3, 5], [4, 5], [1, 6], [3, 6]];

function Chip() {
  const { m } = useContext(Ctx);
  const geo = useMemo(() => {
    const pts = [];
    NODE_LINKS.forEach(([a, b]) => pts.push(new THREE.Vector3(...NODES[a]), new THREE.Vector3(...NODES[b])));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const pins = [-0.18, -0.06, 0.06, 0.18];

  return (
    <group scale={0.9}>
      <group position={[-0.1, -0.25, 0]}>
        <P mat="body" s={[0.56, 0.07, 0.56]} />
        <P mat="body2" p={[0, 0.045, 0]} s={[0.36, 0.02, 0.36]} />
        <Edge s={[0.56, 0.07, 0.56]} />
        {pins.map((o) => (
          <group key={o}>
            <P mat="accent" p={[o, -0.01, 0.31]} s={[0.03, 0.02, 0.06]} />
            <P mat="accent" p={[o, -0.01, -0.31]} s={[0.03, 0.02, 0.06]} />
            <P mat="accent" p={[0.31, -0.01, o]} s={[0.06, 0.02, 0.03]} />
            <P mat="accent" p={[-0.31, -0.01, o]} s={[0.06, 0.02, 0.03]} />
          </group>
        ))}
        <group position={[0, 0.05, 0]}>
          <lineSegments geometry={geo} material={m.line} />
          {NODES.map((n, i) => (
            <P key={i} geo="sph" mat="accent" p={n} s={[0.028, 0.028, 0.028]} />
          ))}
          {/* Graduation cap */}
          <group position={[0, 0.66, 0]}>
            <P geo="cyl" mat="body2" p={[0, -0.03, 0]} s={[0.1, 0.06, 0.1]} />
            <P mat="body" p={[0, 0.01, 0]} s={[0.34, 0.018, 0.34]} r={[0, Math.PI / 4, 0]} />
            <P mat="accent" p={[0.2, -0.03, 0.0]} s={[0.008, 0.1, 0.008]} />
            <P geo="sph" mat="accent" p={[0.2, -0.09, 0]} s={[0.02, 0.02, 0.02]} />
          </group>
        </group>
      </group>
      <group position={[0.5, -0.05, 0.25]} rotation={[0, -0.4, 0]}>
        <P mat="body" s={[0.32, 0.42, 0.015]} />
        <Screen mat="rep" p={[0, 0, 0.009]} s={[0.3, 0.4, 1]} />
        <Edge s={[0.32, 0.42, 0.015]} />
      </group>
    </group>
  );
}

/* 2020: a repair desk (open PC, printer, floating spare parts) on the right, state property (archive boxes, gavel) on the left. No text. */

const DESK_X = ex(3);
const clampTo = (v, lim) => Math.max(-lim, Math.min(lim, v));

function RepairDesk() {
  const back = useRef();
  const front = useRef();
  const parts = useRef([]);

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    // Gentle parallax: far and near layers drift in opposite directions as the camera passes.
    const rel = clampTo(camera.position.x + 1.6 - DESK_X, 3.1) / 3.1;
    if (back.current) back.current.position.x = rel * 0.1;
    if (front.current) front.current.position.x = -rel * 0.14;
    // Spare parts hover slowly, as if mid-repair.
    parts.current.forEach((el, i) => {
      if (!el) return;
      el.position.y = PART_HOME[i][1] + Math.sin(t * 0.7 + i * 2.1) * 0.035;
      el.rotation.y = Math.sin(t * 0.4 + i) * 0.35;
    });
  });

  const boxes = [
    { p: [-0.62, -0.15, 0], s: [0.42, 0.26, 0.34], ry: 0.06 },
    { p: [-0.6, 0.1, 0.01], s: [0.38, 0.24, 0.32], ry: -0.1 },
    { p: [-0.63, 0.31, 0], s: [0.3, 0.18, 0.28], ry: 0.12 },
  ];

  return (
    <group scale={0.74}>
      {/* Desk */}
      <P mat="body2" p={[-0.1, -0.3, 0]} s={[2.2, 0.05, 0.7]} />
      <P mat="body" p={[-1.1, -0.48, 0]} s={[0.05, 0.3, 0.6]} />
      <P mat="body" p={[0.9, -0.48, 0]} s={[0.05, 0.3, 0.6]} />
      <Edge p={[-0.1, -0.3, 0]} s={[2.2, 0.05, 0.7]} />

      {/* Left, far layer: archive boxes and a gavel on its block (state property and auctions) */}
      <group ref={back}>
        {boxes.map((b, i) => (
          <group key={i} position={b.p} rotation={[0, b.ry, 0]}>
            <P mat="body" s={b.s} />
            <P mat="body2" p={[0, b.s[1] / 2 - 0.015, 0]} s={[b.s[0] + 0.02, 0.035, b.s[2] + 0.02]} />
            <P mat="accent" p={[0, 0.01, b.s[2] / 2 + 0.004]} s={[b.s[0] * 0.4, b.s[1] * 0.32, 0.008]} />
            <Edge s={b.s} />
          </group>
        ))}
        <group position={[-1.0, -0.275, 0.12]}>
          <P geo="cyl" mat="body2" s={[0.11, 0.035, 0.11]} />
          <group position={[0, 0.2, 0]} rotation={[0, 0, -0.55]}>
            <P geo="cyl" mat="accent" p={[0, 0.1, 0]} s={[0.065, 0.2, 0.065]} r={[0, 0, Math.PI / 2]} />
            <P geo="cyl" mat="body" p={[0, -0.04, 0]} s={[0.018, 0.34, 0.018]} />
          </group>
        </group>
      </group>

      {/* Right: open PC unit (front side left off) and a printer */}
      <group position={[0.62, 0.02, 0]}>
        <P mat="body" p={[0, 0, -0.2]} s={[0.46, 0.6, 0.03]} />
        <P mat="body" p={[0, 0.3, 0]} s={[0.46, 0.03, 0.42]} />
        <P mat="body" p={[0, -0.28, 0]} s={[0.46, 0.03, 0.42]} />
        <P mat="body" p={[-0.22, 0, 0]} s={[0.03, 0.6, 0.42]} />
        <P mat="body" p={[0.22, 0, 0]} s={[0.03, 0.6, 0.42]} />
        <P mat="body2" p={[0, 0, -0.18]} s={[0.36, 0.5, 0.012]} />
        <P geo="cyl" mat="accent" p={[0, 0.16, -0.165]} s={[0.1, 0.012, 0.1]} r={[Math.PI / 2, 0, 0]} />
        <P mat="body" p={[0, -0.02, -0.16]} s={[0.12, 0.12, 0.03]} />
        <P mat="accent" p={[0.1, -0.06, -0.16]} s={[0.025, 0.2, 0.02]} />
        <P mat="accent" p={[0.14, -0.06, -0.16]} s={[0.025, 0.2, 0.02]} />
        <P mat="accent" p={[-0.12, -0.2, -0.16]} s={[0.1, 0.03, 0.03]} />
        <Edge s={[0.46, 0.6, 0.42]} />
      </group>
      <group position={[0.1, -0.2, 0.02]}>
        <P mat="body2" s={[0.5, 0.2, 0.38]} />
        <P mat="body" p={[0, 0.115, -0.08]} s={[0.36, 0.01, 0.2]} />
        <P mat="accent" p={[0, 0.0, 0.195]} s={[0.34, 0.016, 0.006]} />
        <P mat="accent" p={[0, -0.02, 0.17]} s={[0.3, 0.008, 0.2]} r={[0.25, 0, 0]} />
        <Edge s={[0.5, 0.2, 0.38]} />
      </group>

      {/* Near layer: spare parts floating above the PC (RAM stick, screwdriver, a short cable) */}
      <group ref={front}>
        <group ref={(el) => (parts.current[0] = el)} position={PART_HOME[0]} rotation={[0, 0, 0.12]}>
          <P mat="body" s={[0.3, 0.07, 0.012]} />
          <P mat="accent" p={[0, -0.045, 0]} s={[0.26, 0.015, 0.012]} />
          <P mat="body2" p={[-0.05, 0.0, 0.008]} s={[0.05, 0.04, 0.006]} />
          <P mat="body2" p={[0.07, 0.0, 0.008]} s={[0.05, 0.04, 0.006]} />
        </group>
        <group ref={(el) => (parts.current[1] = el)} position={PART_HOME[1]} rotation={[0, 0, -0.9]}>
          <P geo="cyl" mat="accent" p={[0, 0.08, 0]} s={[0.032, 0.14, 0.032]} />
          <P geo="cyl" mat="body2" p={[0, -0.07, 0]} s={[0.01, 0.2, 0.01]} />
        </group>
        <group ref={(el) => (parts.current[2] = el)} position={PART_HOME[2]}>
          <P geo="cyl" mat="body2" p={[-0.12, 0, 0]} s={[0.012, 0.14, 0.012]} r={[0, 0, Math.PI / 2 - 0.5]} />
          <P geo="cyl" mat="body2" p={[0, 0.05, 0]} s={[0.012, 0.14, 0.012]} r={[0, 0, Math.PI / 2]} />
          <P geo="cyl" mat="body2" p={[0.12, 0, 0]} s={[0.012, 0.14, 0.012]} r={[0, 0, Math.PI / 2 + 0.5]} />
          <P mat="accent" p={[0.2, -0.03, 0]} s={[0.05, 0.03, 0.03]} />
          <P mat="accent" p={[-0.2, -0.03, 0]} s={[0.05, 0.03, 0.03]} />
        </group>
      </group>
    </group>
  );
}

const PART_HOME = [[0.35, 0.68, 0.22], [0.95, 0.55, 0.2], [0.65, 0.88, 0.1]];

const OBJECTS = [MathBoard, Terminal, Treasury, RepairDesk, LaptopEra, Office, Chip];

/* ---------- Materials: one set per era so each can fade and glow on its own ---------- */

function buildEra(spec) {
  const list = [];
  // Lambert, not Standard: the shader compiles in a fraction of the time (this is what stalled the
  // first frame on Windows) and costs less per pixel, and low-poly shapes do not need PBR.
  const std = (color, rough, emissive) => {
    const mat = new THREE.MeshLambertMaterial({ color, transparent: true, ...(emissive ? { emissive: color } : {}) });
    mat.userData = { base: new THREE.Color(color), glow: Boolean(emissive) };
    list.push(mat);
    return mat;
  };
  const basic = (opts, alpha = 1) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, ...opts });
    mat.userData = { base: new THREE.Color(opts.color ?? '#ffffff'), alpha };
    list.push(mat);
    return mat;
  };
  const m = { body: std(spec.body, 0.7), body2: std(spec.body2, 0.6), accent: std(spec.accent, 0.5, true) };
  const line = new THREE.LineBasicMaterial({ color: spec.accent, transparent: true });
  line.userData = { base: new THREE.Color(spec.accent), alpha: 1, line: true };
  list.push(line);
  m.line = line;
  const textures = [];
  Object.entries(spec.screens).forEach(([name, [w, h, draw]]) => {
    const tex = makeTexture(w, h, draw);
    textures.push(tex);
    m[name] = basic({ map: tex });
  });
  return { m, list, textures };
}

function applyState(era, op, bright, emis) {
  era.list.forEach((mat) => {
    const u = mat.userData;
    mat.opacity = op * (u.alpha ?? 1);
    // Outlines keep their full colour so ghosted eras stay readable on a dark background.
    mat.color.copy(u.base).multiplyScalar(u.line ? 1 : bright);
    if (u.glow) mat.emissiveIntensity = emis;
  });
}

/* ---------- Path ---------- */

const PATH_SEGS = 240;
const PATH_RADIAL = 6;
const PATH_CURVE = new THREE.CatmullRomCurve3(ERAS.map((e) => new THREE.Vector3(e.home[0], e.home[1] - 0.55, e.home[2] + 0.2)));
const RING = PATH_RADIAL + 1;

function makePath() {
  const colors = [];
  const a = new THREE.Color(BLUE);
  const b = new THREE.Color(TEAL);
  const c = new THREE.Color(GREEN);
  const tube = (radius) => new THREE.TubeGeometry(PATH_CURVE, PATH_SEGS, radius, PATH_RADIAL, false);
  const core = tube(0.022);
  for (let i = 0; i < core.attributes.position.count; i++) {
    const t = Math.floor(i / RING) / PATH_SEGS;
    const col = t < 0.5 ? a.clone().lerp(b, t * 2) : b.clone().lerp(c, (t - 0.5) * 2);
    colors.push(col.r, col.g, col.b);
  }
  core.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return {
    ghost: new THREE.Mesh(tube(0.012), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.4 })),
    core: new THREE.Mesh(core, new THREE.MeshBasicMaterial({ vertexColors: true })),
    halo: new THREE.Mesh(tube(0.07), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.14, depthWrite: false })),
  };
}

/* ---------- Stage ---------- */

const _v = new THREE.Vector3();

const FOV = 32;
const FIT_WIDTH = 3.6; // world units that must stay visible across the canvas in portrait

function Stage({ scrollRef, animate = true, compact = false }) {
  const { camera, size } = useThree();
  const groups = useRef([]);
  const state = useRef({ last: [] });
  const head = useRef();

  const g = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    return {
      box,
      edges: new THREE.EdgesGeometry(box),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
      sph: new THREE.SphereGeometry(1, 16, 12),
      plane: new THREE.PlaneGeometry(1, 1),
      tri: new THREE.CylinderGeometry(1, 1, 1, 3),
    };
  }, []);
  const eras = useMemo(() => ERAS.map(buildEra), []);
  const path = useMemo(makePath, []);
  const { gl, scene } = useThree();

  // Warm-up: compile shaders and upload textures now, while the canvas is still off screen, so the
  // first visible frame does not stall on them.
  useEffect(() => {
    eras.forEach((e) => e.textures.forEach((t) => gl.initTexture(t)));
    // Async where the browser supports parallel shader compilation, so it does not block the page.
    try {
      if (gl.compileAsync) gl.compileAsync(scene, camera).catch(() => {});
      else gl.compile(scene, camera);
    } catch {
      /* compile is only an optimisation */
    }
  }, [eras, gl, scene, camera]);

  useEffect(
    () => () => {
      Object.values(g).forEach((x) => x.dispose());
      eras.forEach((e) => {
        e.list.forEach((mat) => mat.dispose());
        e.textures.forEach((t) => t.dispose());
      });
      Object.values(path).forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
    },
    [g, eras, path]
  );

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const t = clock.elapsedTime;
    const shared = scrollRef.current;
    shared.fs = animate ? damp(shared.fs ?? shared.f, shared.f, 5, dt) : 0;
    const f = shared.fs;
    const last = ERAS.length - 1;

    ERAS.forEach((era, i) => {
      const grp = groups.current[i];
      if (!grp) return;
      const lit = animate ? easeOut(1 - Math.min(1, Math.abs(f - i))) : 0;
      const future = animate ? easeOut((i - f) / 0.7) : 0;
      // Future eras stay readable: ghosted to about 45% with their outlines.
      const op = animate ? lerp(1, 0.45, future) : 0.9;
      const bright = animate ? lerp(0.62, 1, lit) : 0.8;
      const emis = animate ? 0.12 + 0.75 * lit : 0.15;

      const key = op * 1000 + bright * 100 + emis * 10;
      if (Math.abs((state.current.last[i] ?? -1) - key) > 0.05) {
        state.current.last[i] = key;
        applyState(eras[i], op, bright, emis);
      }

      const [hx, hy, hz] = era.home;
      grp.position.set(hx, hy + (animate ? Math.sin(t * 0.8 + i) * 0.04 : 0), hz);
      grp.scale.setScalar(1.05 * (1 + 0.2 * lit));
      grp.rotation.y = era.face + (animate ? Math.sin(t * 0.5) * 0.3 * lit : 0);
    });

    // The path is always visible; the lit part draws with scroll and ends at the 2026 object.
    const frac = animate ? f / last : 1;
    const count = Math.max(1, Math.floor(PATH_SEGS * frac)) * PATH_RADIAL * 6;
    path.core.geometry.setDrawRange(0, count);
    path.halo.geometry.setDrawRange(0, count);
    if (head.current) {
      head.current.visible = animate && f > 0.02;
      if (head.current.visible) head.current.position.copy(PATH_CURVE.getPoint(frac));
    }

    // Camera travels along the path: eased by the damped f, with a slight yaw and dolly per era.
    const camX = ex(f);
    const dolly = animate ? 0.7 * (0.5 + 0.5 * Math.cos(2 * Math.PI * f)) : 0;
    const bob = animate ? Math.sin(f * 1.3) * 0.15 : 0;
    if (compact) {
      // Portrait: the object sits centred. Pull the camera in or back so FIT_WIDTH always fits the
      // canvas width (re-evaluated every frame, so resize and rotation are covered).
      const aspect = size.width / Math.max(1, size.height);
      const dist = THREE.MathUtils.clamp(FIT_WIDTH / aspect / (2 * Math.tan((FOV * Math.PI) / 360)), 5.5, 16);
      camera.position.set(camX, 0.8 + bob, dist - dolly * 0.3);
      camera.lookAt(camX, -0.05, 0);
    } else {
      camera.position.set(camX - 1.6, 1.0 + bob, 11.5 - dolly);
      camera.lookAt(camX + 0.8, -0.1, 0);
    }
    camera.updateMatrixWorld();

    // Publish where each milestone sits on screen so the DOM cards can anchor to it.
    shared.sx ||= [];
    shared.sy ||= [];
    ERAS.forEach((era, i) => {
      _v.set(era.home[0], era.home[1], era.home[2]).project(camera);
      shared.sx[i] = _v.x;
      shared.sy[i] = _v.y;
    });
  });

  return (
    <group>
      <primitive object={path.ghost} />
      <primitive object={path.halo} />
      <primitive object={path.core} />
      <mesh ref={head} geometry={g.sph} scale={0.09} visible={false}>
        <meshBasicMaterial color={GREEN} toneMapped={false} />
      </mesh>
      {OBJECTS.map((Obj, i) => (
        <group key={i} ref={(el) => (groups.current[i] = el)} position={ERAS[i].home} rotation={[0, ERAS[i].face, 0]}>
          <Ctx.Provider value={{ g, m: eras[i].m }}>
            <Obj />
          </Ctx.Provider>
        </group>
      ))}
    </group>
  );
}

export default function EraStageCanvas({ scrollRef, animate = true, frameloop = 'always', compact = false, onContextLost }) {
  // R3F releases the GL context on unmount, which also fires webglcontextlost. That is not a real
  // loss, so it must not push the timeline into its text fallback.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  return (
    <Canvas
      dpr={[1, compact ? 1.25 : 1.5]}
      frameloop={frameloop}
      camera={{ position: [ex(0) - 1.6, 1.0, 11.5], fov: FOV }}
      gl={{ antialias: !compact, alpha: true, powerPreference: compact ? 'low-power' : 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        // Losing the context is not recoverable here: hand over to the vertical timeline.
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          setTimeout(() => {
            if (alive.current && gl.domElement.isConnected) onContextLost?.();
          }, 0);
        });
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[2, 3, 5]} intensity={1.6} />
      <directionalLight position={[-3, 1, -4]} intensity={0.6} />
      <Stage scrollRef={scrollRef} animate={animate} compact={compact} />
    </Canvas>
  );
}
