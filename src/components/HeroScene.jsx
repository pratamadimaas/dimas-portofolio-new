import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useInView, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { supportsWebGL } from '../lib/webgl';

/*
 * Hero scene: a clean desk with two monitors and a laptop. Only the code on the screens moves;
 * the small charts above are still. Everything is built from primitives (no model downloads).
 * Local y = 0 is the plinth top; the camera looks from +z, so the screens face the viewer.
 */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const damp = THREE.MathUtils.damp;

const ACCENT = { blue: '#3b82c4', teal: '#2dd4bf', green: '#34d399' };

const PALETTE = {
  dark: { plinth: '#111b2b', plinthEdge: '#1b2638', desk: '#4a3f36', deskLeg: '#222b3a' },
  light: { plinth: '#e3e9f1', plinthEdge: '#c5d0de', desk: '#c9b49c', deskLeg: '#8d99ab' },
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

const CODE_PY = [
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
  'def summarise(df):',
  '    by_unit = df.groupby("unit").amount.sum()',
  '    return by_unit.sort_values()',
  '',
  'report = reconcile(load_ledger("tkd.csv"))',
  'print(flag_outliers(report).head())',
  '',
];

const CODE_TS = [
  '// dashboard.ts',
  'export type Row = { unit: string; amount: number };',
  '',
  'export const total = (rows: Row[]) =>',
  '  rows.reduce((sum, r) => sum + r.amount, 0);',
  '',
  'export async function loadKpis(): Promise<Kpi[]> {',
  '  const res = await fetch("/api/kpis");',
  '  if (!res.ok) throw new Error("kpi request failed");',
  '  return res.json();',
  '}',
  '',
  'export function share(rows: Row[], unit: string) {',
  '  const all = total(rows);',
  '  const own = total(rows.filter((r) => r.unit === unit));',
  '  return all === 0 ? 0 : own / all;',
  '}',
  '',
];

const CODE_PHP = [
  '<?php',
  'use App\\Models\\Order;',
  '',
  'Route::get("/orders", function () {',
  '    return Order::latest()->paginate(20);',
  '});',
  '',
  'class Order extends Model {',
  '    protected $fillable = ["unit", "amount"];',
  '',
  '    public function scopeOpen($query) {',
  '        return $query->where("status", "open");',
  '    }',
  '}',
  '',
  '$order = Order::open()->first();',
  '$order->update(["status" => "paid"]);',
  '',
];

const SCREENS = {
  main: { tabs: ['ledger_audit.py', 'dashboard.ts'], lines: CODE_PY, status: 'Python 3.12   UTF-8   Ln 12, Col 34', bar: '#0f3d3a', barText: '#b9efe6', line: ACCENT.teal, offset: 0 },
  side: { tabs: ['dashboard.ts', 'api.ts'], lines: CODE_TS, status: 'TypeScript 5.5   UTF-8   Ln 8, Col 21', bar: '#10263d', barText: '#b8d8f5', line: ACCENT.blue, offset: 5.1 },
  laptop: { tabs: ['routes/web.php', 'Order.php'], lines: CODE_PHP, status: 'PHP 8.3   UTF-8   Ln 17, Col 18', bar: '#0f3a2a', barText: '#b6efd1', line: ACCENT.green, offset: 9.7 },
};

const KEYWORDS = /^(import|from|def|return|async|await|function|const|export|as|for|in|print|Promise|type|if|throw|new|class|extends|public|protected|use)\b/;

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

const MONO = '14px ui-monospace, Menlo, Consolas, "Courier New", monospace';
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function drawCode(ctx, t, spec) {
  spec.tokens ||= spec.lines.map(tokenize);
  const n = spec.lines.length;
  const W = 640;
  const H = 400;
  const ROW = 22;
  const TOP = 36;
  const ACTIVE = 11;
  const time = t + spec.offset;
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, W, H);

  // Tab bar
  ctx.fillStyle = '#0e141e';
  ctx.fillRect(0, 0, W, 28);
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(10, 4, 130, 24);
  ctx.fillStyle = spec.line;
  ctx.fillRect(10, 4, 130, 2);
  ctx.font = `12px ${SANS}`;
  ctx.fillStyle = '#c9d4e3';
  ctx.fillText(spec.tabs[0], 22, 20);
  ctx.fillStyle = '#5c6b82';
  ctx.fillText(spec.tabs[1], 160, 20);

  // Scroll one line every ~1.7s, eased.
  const step = time / 1.7;
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
    const idx = (base + i) % n;
    const y = TOP + (i - frac) * ROW;
    ctx.fillStyle = i === ACTIVE ? '#8b9bb4' : '#3b4658';
    ctx.textAlign = 'right';
    ctx.fillText(String(idx + 1), 34, y);
    ctx.textAlign = 'left';
    let x = 58;
    for (const [text, color] of spec.tokens[idx]) {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
    if (i === ACTIVE && Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = spec.line;
      ctx.fillRect(x + 1, y - 12, 2, 16);
    }
  }
  ctx.restore();

  // Status bar
  ctx.fillStyle = spec.bar;
  ctx.fillRect(0, H - 18, W, 18);
  ctx.font = `11px ${SANS}`;
  ctx.fillStyle = spec.barText;
  ctx.fillText(spec.status, 12, H - 5);
}

function makeScreen(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Redrawn ten times a second: skipping mipmaps saves regenerating them on every upload.
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  const draw = (t) => drawCode(ctx, t, spec);
  draw(0);
  return { tex, draw };
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.5)');
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
    cyl: new THREE.CylinderGeometry(1, 1, 1, 24),
    sph: new THREE.SphereGeometry(1, 20, 14),
    oct: new THREE.OctahedronGeometry(1),
  };
}

function makeMaterials(c, lite) {
  // Lambert everywhere: far cheaper to compile than the PBR material (that compile was the stall
  // when the scene first appeared) and plenty for a flat-lit desk.
  const mk = (color, rough = 0.6, extra = {}) => {
    const { metalness, ...rest } = extra; // eslint-disable-line no-unused-vars
    return new THREE.MeshLambertMaterial({ color, ...rest });
  };
  const holo = (color, opacity = 0.85) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return {
    plinth: mk(c.plinth, 0.85),
    edge: new THREE.MeshBasicMaterial({ color: ACCENT.teal, transparent: true, opacity: 0.55 }),
    desk: mk(c.desk, 0.5),
    deskLeg: mk(c.deskLeg, 0.7),
    metal: mk('#9aa6b8', 0.35, { metalness: 0.7 }),
    frame: mk('#10141b', 0.45),
    keyboard: mk('#1a202b', 0.6),
    key: mk('#2d3646', 0.6),
    mug: mk('#e8edf3', 0.5),
    coffee: mk('#3a2619', 0.6),
    pot: mk('#d8cdbd', 0.8),
    leaf: mk('#2f9a6b', 0.7),
    holoGreen: holo(ACCENT.green),
    holoGlass: holo(ACCENT.teal, 0.22),
  };
}

function P({ geo = 'box', mat, p, s = [1, 1, 1], r, ...rest }) {
  const { g, m } = useContext(Ctx);
  return <mesh geometry={g[geo]} material={m[mat]} position={p} scale={s} rotation={r} {...rest} />;
}

function Lines({ pts, color, opacity = 0.6, segments = false }) {
  const obj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map((q) => new THREE.Vector3(...q)));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return segments ? new THREE.LineSegments(geo, mat) : new THREE.Line(geo, mat);
  }, [pts, color, opacity, segments]);
  useEffect(
    () => () => {
      obj.geometry.dispose();
      obj.material.dispose();
    },
    [obj]
  );
  return <primitive object={obj} />;
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
      <P mat="metal" p={[0, -h / 2 - 0.07, -0.04]} s={[0.07, 0.16, 0.025]} />
      <P geo="cyl" mat="metal" p={[0, -h / 2 - 0.145, -0.02]} s={[0.17, 0.012, 0.13]} />
    </group>
  );
}

function Laptop({ tex }) {
  return (
    <group position={[0, 0.74, 0.34]} rotation={[0, 0, 0]} scale={1.35}>
      <P mat="metal" p={[0, 0.008, 0]} s={[0.46, 0.016, 0.31]} />
      <P mat="keyboard" p={[0, 0.0175, -0.02]} s={[0.4, 0.003, 0.15]} />
      {[-0.05, 0, 0.05].map((z) => (
        <P key={z} mat="key" p={[0, 0.0195, z - 0.03]} s={[0.38, 0.002, 0.03]} />
      ))}
      <P mat="key" p={[0, 0.0195, 0.1]} s={[0.14, 0.002, 0.07]} />
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

function Workstation({ screens }) {
  const leaves = [-0.5, 0.1, 0.7, 1.3, 1.9];
  return (
    <group>
      {/* Desk */}
      <P mat="desk" p={[0, 0.71, 0]} s={[3.4, 0.06, 1.25]} />
      <P mat="deskLeg" p={[-1.6, 0.34, 0]} s={[0.06, 0.68, 1.1]} />
      <P mat="deskLeg" p={[1.6, 0.34, 0]} s={[0.06, 0.68, 1.1]} />
      <P mat="deskLeg" p={[0, 0.5, -0.52]} s={[3.1, 0.34, 0.03]} />

      <Monitor p={[-0.88, 1.28, -0.32]} rotY={0.2} w={1.32} h={0.83} tex={screens.main.tex} />
      <Monitor p={[0.88, 1.28, -0.32]} rotY={-0.2} w={1.32} h={0.83} tex={screens.side.tex} />
      <Laptop tex={screens.laptop.tex} />

      {/* Mug */}
      <group position={[1.35, 0.74, 0.32]}>
        <P geo="cyl" mat="mug" s={[0.05, 0.1, 0.05]} p={[0, 0.05, 0]} />
        <P geo="cyl" mat="coffee" s={[0.042, 0.004, 0.042]} p={[0, 0.098, 0]} />
        <mesh position={[0.055, 0.05, 0]} material={useContext(Ctx).m.mug}>
          <torusGeometry args={[0.027, 0.008, 6, 12]} />
        </mesh>
      </group>

      {/* Plant */}
      <group position={[-1.4, 0.74, 0.3]}>
        <P geo="cyl" mat="pot" s={[0.075, 0.12, 0.075]} p={[0, 0.06, 0]} />
        {leaves.map((a, k) => (
          <P
            key={k}
            geo="sph"
            mat="leaf"
            s={[0.025, 0.1, 0.045]}
            p={[Math.cos(a * 3) * 0.05, 0.2, Math.sin(a * 3) * 0.05]}
            r={[Math.sin(a * 3) * 0.5, 0, -Math.cos(a * 3) * 0.5]}
          />
        ))}
      </group>
    </group>
  );
}

/* ---------- Charts above the screens (static) ---------- */

const GRID = (() => {
  const pts = [];
  for (let i = 0; i <= 4; i++) {
    const v = -0.4 + (i / 4) * 1.0;
    pts.push([-0.4, 0, v], [0.4, 0, v], [v, 0, -0.4], [v, 0, 0.4]);
  }
  return pts;
})();

const BAR_BASE = [0.35, 0.55, 0.42, 0.75, 0.6, 0.95];

function HoloBars() {
  const { g, m } = useContext(Ctx);
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(
    () => ['#3a4a63', '#3b6fa0', '#2f8fa0', '#2dd4bf', '#34d399', '#6ee7b7'].map((x) => new THREE.Color(x)),
    []
  );

  useLayoutEffect(() => {
    BAR_BASE.forEach((base, i) => {
      const h = base * 0.6;
      dummy.position.set(-0.3 + i * 0.12, h / 2, 0);
      dummy.scale.set(0.085, h, 0.085);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, colors[i]);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [colors, dummy]);

  return (
    <group scale={0.95}>
      {/* material goes in a prop, not args: a theme switch rebuilds the materials, and a changed args makes R3F recreate the mesh without its matrices */}
      <instancedMesh ref={ref} args={[g.box, undefined, BAR_BASE.length]} material={m.holoGreen} frustumCulled={false} />
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
      <instancedMesh ref={ref} args={[g.sph, undefined, 36]} material={m.holoGreen} frustumCulled={false} />
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

function HoloRibbon() {
  const { m } = useContext(Ctx);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    RIBBON_PTS.forEach(([x, y]) => s.lineTo(x, y));
    s.lineTo(RIBBON_W, 0);
    s.closePath();
    return s;
  }, []);

  return (
    <group>
      <mesh material={m.holoGlass}>
        <shapeGeometry args={[shape]} />
      </mesh>
      <Lines pts={RIBBON_PTS} color={ACCENT.green} opacity={0.95} />
      <Lines pts={RIBBON_BASE} color="#8aa0b8" opacity={0.45} segments />
    </group>
  );
}

/* ---------- Scene ---------- */

function Scene({ isDark, animate, interactive, lite }) {
  const c = isDark ? PALETTE.dark : PALETTE.light;
  const group = useRef();
  const { camera, size, gl } = useThree();

  const g = useMemo(makeGeometries, []);
  const m = useMemo(() => makeMaterials(c, lite), [c, lite]);
  useEffect(() => () => Object.values(g).forEach((x) => x.dispose()), [g]);
  useEffect(() => () => Object.values(m).forEach((x) => x.dispose()), [m]);

  const screens = useMemo(
    () => ({ main: makeScreen(SCREENS.main), side: makeScreen(SCREENS.side), laptop: makeScreen(SCREENS.laptop) }),
    []
  );
  const shadow = useMemo(makeShadowTexture, []);
  useEffect(
    () => () => {
      Object.values(screens).forEach((s) => s.tex.dispose());
      shadow.dispose();
    },
    [screens, shadow]
  );

  // Warm-up: upload the textures before the first visible frame. (Not gl.compile: on this scene it
  // fires before the instanced charts have their matrices and leaves them drawn at full size.)
  useEffect(() => {
    Object.values(screens).forEach((s) => gl.initTexture(s.tex));
    gl.initTexture(shadow);
  }, [screens, shadow, gl]);

  useEffect(() => {
    camera.lookAt(0, 1.15, 0);
    camera.zoom = Math.min(1, size.width / size.height / 1.25) * 0.92;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  const lastDraw = useRef(0);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Only the code moves.
    if (animate && t - lastDraw.current > 0.1) {
      lastDraw.current = t;
      Object.values(screens).forEach((s) => {
        s.draw(t);
        s.tex.needsUpdate = true;
      });
    }
    // Gentle parallax towards the cursor (desktop only).
    const ty = interactive ? state.pointer.x * 0.22 : 0;
    const tx = interactive ? -state.pointer.y * 0.05 : 0;
    group.current.rotation.y = damp(group.current.rotation.y, ty, 3, delta);
    group.current.rotation.x = damp(group.current.rotation.x, tx, 3, delta);
  });

  return (
    <Ctx.Provider value={{ g, m }}>
      <mesh position={[0, -0.012, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3.6]} />
        <meshBasicMaterial map={shadow} transparent opacity={isDark ? 1 : 0.55} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={group}>
        <P mat="plinth" s={[3.9, 0.2, 2.5]} />
        {[
          [[0, 0.101, 1.25], [3.9, 0.012, 0.012]],
          [[0, 0.101, -1.25], [3.9, 0.012, 0.012]],
          [[1.95, 0.101, 0], [0.012, 0.012, 2.5]],
          [[-1.95, 0.101, 0], [0.012, 0.012, 2.5]],
        ].map(([p, s], i) => (
          <P key={i} mat="edge" p={p} s={s} />
        ))}

        <group position={[0, 0.1, 0]}>
          <Workstation screens={screens} />

          <group position={[-0.88, 2.15, -0.32]}>
            <HoloBars />
          </group>
          <group position={[0, 2.45, -0.45]}>
            <HoloScatter />
          </group>
          <group position={[0.42, 2.05, -0.32]}>
            <HoloRibbon />
          </group>
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
      aria-label="3D illustration of a desk with two monitors and a laptop showing code, with simple data charts above"
    >
      {env.webgl && (
        <Canvas
          frameloop={animate && inView && tabVisible ? 'always' : 'demand'}
          dpr={env.fine && !lite ? [1, 1.75] : [1, 1.25]}
          camera={{ position: [2.7, 3.0, 5.2], fov: 34 }}
          gl={{ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' }}
        >
          <ambientLight intensity={isDark ? 0.55 : 1.0} />
          <directionalLight position={[4, 6, 3]} intensity={isDark ? 1.7 : 1.4} />
          <directionalLight position={[-4, 3, -2]} intensity={0.8} color="#4fa3d9" />
          <Scene isDark={isDark} animate={animate} interactive={env.fine && !reduceMotion && !lite} lite={lite} />
        </Canvas>
      )}
    </div>
  );
}
