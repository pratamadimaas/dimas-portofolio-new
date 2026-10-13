import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * Staff badge on a lanyard. Spring physics, no physics engine: the strap
 * swings around a pivot above the frame, the card spins on its clip and
 * settles face-front or face-back. Deliberately not a replica of an official
 * ID: no ministry seal, no NIP, no barcode.
 */

const CARD = { w: 1.6, h: 2.4, t: 0.024 };
const PIVOT_Y = 2.7;
const STRAP = 1.55;
const TEX = { w: 640, h: 960 };
const NAVY = '#16243a';
const GOLD = '#e9b949';
const FONT = '"Geist Sans", sans-serif';
const MONO = '"Geist Mono", monospace';

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cardCanvas(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = TEX.w;
  canvas.height = TEX.h;
  const ctx = canvas.getContext('2d');
  roundedRect(ctx, 0, 0, TEX.w, TEX.h, 44);
  ctx.clip();
  draw(ctx);
  // Lanyard slot punched through the top.
  ctx.globalCompositeOperation = 'destination-out';
  roundedRect(ctx, TEX.w / 2 - 64, 34, 128, 22, 11);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function frontTexture({ name, role, photo }) {
  return cardCanvas((ctx) => {
    ctx.fillStyle = '#f5f6f8';
    ctx.fillRect(0, 0, TEX.w, TEX.h);
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, TEX.w, 200);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 200, TEX.w, 6);

    ctx.textAlign = 'center';
    ctx.fillStyle = GOLD;
    ctx.font = `500 21px ${MONO}`;
    ctx.fillText('DIRECTORATE GENERAL OF TREASURY', TEX.w / 2, 112);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `500 26px ${FONT}`;
    ctx.fillText('Ministry of Finance, Indonesia', TEX.w / 2, 154);

    // Photo, cover-cropped into a 3:4 frame.
    const px = 170;
    const py = 248;
    const pw = 300;
    const ph = 400;
    ctx.save();
    roundedRect(ctx, px, py, pw, ph, 22);
    ctx.clip();
    ctx.fillStyle = '#d7dce4';
    ctx.fillRect(px, py, pw, ph);
    if (photo) {
      const s = Math.max(pw / photo.width, ph / photo.height);
      const w = photo.width * s;
      const h = photo.height * s;
      ctx.drawImage(photo, px + (pw - w) / 2, py, w, h);
    }
    ctx.restore();

    const [first, ...rest] = name.split(' ');
    const line1 = name.length > 16 ? `${first} ${rest[0] ?? ''}`.trim() : name;
    const line2 = name.length > 16 ? rest.slice(1).join(' ') : '';
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 50px ${FONT}`;
    ctx.fillText(line1, TEX.w / 2, 718);
    if (line2) ctx.fillText(line2, TEX.w / 2, 772);
    ctx.fillStyle = '#475569';
    ctx.font = `500 27px ${FONT}`;
    ctx.fillText(role, TEX.w / 2, line2 ? 826 : 780);

    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 876, TEX.w, 84);
    ctx.fillStyle = '#34d399';
    ctx.font = `500 24px ${MONO}`;
    ctx.fillText('TECH ENTHUSIAST', TEX.w / 2, 926);
  });
}

function backTexture({ built, email }) {
  return cardCanvas((ctx) => {
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, TEX.w, TEX.h);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 200, TEX.w, 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = GOLD;
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText('BUILT AT WORK', 64, 150);

    built.forEach((name, i) => {
      const y = 290 + i * 104;
      ctx.fillStyle = '#f8fafc';
      let size = 36;
      do {
        ctx.font = `600 ${size}px ${FONT}`;
        size -= 1;
      } while (ctx.measureText(name).width > TEX.w - 128 && size > 20);
      ctx.fillText(name, 64, y);
      if (i < built.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(64, y + 40, TEX.w - 128, 2);
      }
    });

    ctx.fillStyle = '#34d399';
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText(email, 64, 900);
  });
}

function strapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, 64, 512);
  ctx.fillStyle = GOLD;
  ctx.fillRect(4, 0, 3, 512);
  ctx.fillRect(57, 0, 3, 512);
  ctx.save();
  ctx.translate(40, 500);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText('DIMAS PRATAMA', 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  return tex;
}

function Badge({ data, photo, draggable, animate }) {
  const pivot = useRef();
  const spin = useRef();
  const { gl } = useThree();
  const front = useMemo(() => frontTexture({ ...data, photo }), [data, photo]);
  const back = useMemo(() => backTexture(data), [data]);
  const strap = useMemo(strapTexture, []);
  // Same corner radius as the printed texture (44px of 640), so no grey corners poke out past it.
  const body = useMemo(() => {
    const r = (44 / TEX.w) * CARD.w;
    const x = -CARD.w / 2;
    const y = -CARD.h / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + CARD.w - r, y);
    shape.quadraticCurveTo(x + CARD.w, y, x + CARD.w, y + r);
    shape.lineTo(x + CARD.w, y + CARD.h - r);
    shape.quadraticCurveTo(x + CARD.w, y + CARD.h, x + CARD.w - r, y + CARD.h);
    shape.lineTo(x + r, y + CARD.h);
    shape.quadraticCurveTo(x, y + CARD.h, x, y + CARD.h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: CARD.t, bevelEnabled: false, curveSegments: 8 });
    geo.translate(0, 0, -CARD.t / 2);
    return geo;
  }, []);
  useEffect(() => () => [front, back, strap, body].forEach((x) => x.dispose()), [front, back, strap, body]);

  // Spring state: swing (x/z around the pivot) and spin (y on the clip).
  const s = useRef({ ax: 0, az: 0.35, vx: 0, vz: 0, ry: -0.6, vy: 0, spinTarget: 0, drag: null });

  const flip = () => {
    const st = s.current;
    st.spinTarget += Math.PI;
    st.vz += 0.8;
  };

  const onPointerDown = (e) => {
    e.stopPropagation();
    if (!draggable) return;
    const st = s.current;
    st.drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, ry: st.ry, ax: st.ax, az: st.az, moved: false };
    gl.domElement.style.cursor = 'grabbing';

    const move = (ev) => {
      const d = st.drag;
      if (!d) return;
      const dx = ev.clientX - d.x;
      const dy = ev.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
      st.vy = (ev.clientX - d.lx) * 0.012;
      st.vz = -(ev.clientX - d.lx) * 0.004;
      d.lx = ev.clientX;
      d.ly = ev.clientY;
      st.ry = d.ry + dx * 0.012;
      st.az = THREE.MathUtils.clamp(d.az - dx * 0.002, -0.6, 0.6);
      st.ax = THREE.MathUtils.clamp(d.ax + dy * 0.003, -0.5, 0.5);
    };
    const up = () => {
      const d = st.drag;
      st.drag = null;
      gl.domElement.style.cursor = '';
      // Settle on whichever face the momentum carries it to.
      st.spinTarget = Math.round((st.ry + st.vy * 0.25) / Math.PI) * Math.PI;
      if (d && !d.moved) flip();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  useFrame(({ clock }, delta) => {
    const st = s.current;
    const dt = Math.min(delta, 1 / 30);
    if (!st.drag) {
      const sway = animate ? Math.sin(clock.elapsedTime * 0.7) * 0.035 : 0;
      st.vz += (-22 * (st.az - sway) - 2.4 * st.vz) * dt;
      st.vx += (-22 * st.ax - 2.4 * st.vx) * dt;
      st.vy += (-14 * (st.ry - st.spinTarget) - 3.2 * st.vy) * dt;
      st.az += st.vz * dt;
      st.ax += st.vx * dt;
      st.ry += st.vy * dt;
    }
    pivot.current.rotation.set(st.ax, 0, st.az);
    spin.current.rotation.y = st.ry;
  });

  return (
    <group ref={pivot} position={[0, PIVOT_Y, 0]}>
      <mesh position={[0, -STRAP / 2, -0.01]}>
        <planeGeometry args={[0.2, STRAP]} />
        <meshStandardMaterial map={strap} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <group ref={spin} position={[0, -STRAP, 0]}>
        {/* Metal clip */}
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.26, 0.16, 0.05]} />
          <meshStandardMaterial color="#c4cad3" metalness={0.9} roughness={0.25} />
        </mesh>
        <group
          position={[0, -0.08 - CARD.h / 2, 0]}
          onPointerDown={onPointerDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!draggable) flip();
          }}
          onPointerOver={() => (gl.domElement.style.cursor = draggable ? 'grab' : 'pointer')}
          onPointerOut={() => !s.current.drag && (gl.domElement.style.cursor = '')}
        >
          <mesh geometry={body}>
            <meshStandardMaterial color="#e9ecf1" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, CARD.t / 2 + 0.001]}>
            <planeGeometry args={[CARD.w, CARD.h]} />
            <meshStandardMaterial map={front} transparent alphaTest={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, -CARD.t / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[CARD.w, CARD.h]} />
            <meshStandardMaterial map={back} transparent alphaTest={0.5} roughness={0.45} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function IdBadge({ name, role, built, email, photoSrc, draggable, animate = true }) {
  const [assets, setAssets] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const photo = new Image();
    photo.src = photoSrc;
    Promise.all([
      photo.decode().then(() => photo, () => null),
      document.fonts.load(`700 50px ${FONT}`),
      document.fonts.load(`500 24px ${MONO}`),
    ])
      .catch(() => [null])
      .then(([img]) => !cancelled && setAssets({ photo: img }));
    return () => {
      cancelled = true;
    };
  }, [photoSrc]);

  const data = useMemo(() => ({ name, role, built, email }), [name, role, built, email]);

  if (!assets) return null;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 3, 5]} intensity={1.6} />
      <directionalLight position={[-3, 1, -4]} intensity={0.6} />
      <Badge data={data} photo={assets.photo} draggable={draggable} animate={animate} />
    </Canvas>
  );
}
