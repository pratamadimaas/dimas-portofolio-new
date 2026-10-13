import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import mapData from '../data/indonesiaMap.json';
import { offices } from '../data/portfolioData';

// Equirectangular projection centred on the archipelago. 1 unit = 10 degrees.
const K = 0.1;
const LON0 = 118;
const LAT0 = -2.5;
const LAND_DEPTH = 0.035;
const toXY = (lon, lat) => [(lon - LON0) * K, (lat - LAT0) * K];
const officePos = (key) => new THREE.Vector3(...toXY(offices[key].lon, offices[key].lat), LAND_DEPTH);

// Navy + gold: the Ministry of Finance's own identity colours.
const PALETTE = {
  dark: {
    land: '#2c4670',
    landSide: '#142238',
    neighbor: '#1b222d',
    neighborSide: '#10151c',
    gold: '#f5b83d',
    goldDim: '#7a5d24',
    label: '#f1f5f9',
    labelDim: '#64748b',
  },
  light: {
    land: '#8fa7c9',
    landSide: '#58739c',
    neighbor: '#dde3eb',
    neighborSide: '#bfc9d6',
    gold: '#b26b00',
    goldDim: '#d8b071',
    label: '#0f172a',
    labelDim: '#94a3b8',
  },
};

// Overview framing: centred on the three offices, pulled back just far enough that Serang and
// Masohi (and their labels) fit the canvas width, whatever its aspect ratio.
const OVERVIEW_TARGET = new THREE.Vector3(-0.05, -0.2, 0);
const OVERVIEW_DIR = new THREE.Vector3(0, -0.55, 0.84).normalize();
const HALF_SPAN = 2.5;
const overviewOffset = (aspect) =>
  OVERVIEW_DIR.clone().multiplyScalar(THREE.MathUtils.clamp(HALF_SPAN / (Math.tan(THREE.MathUtils.degToRad(16)) * aspect), 2.3, 6.6));
const CLOSE_OFFSET = new THREE.Vector3(0, -1.7, 1.6);
const BEAM = { active: 0.26, idle: 0.1 };

// Extruded islands, merged into one draw call. Caps and walls get different
// vertex colours so the land reads as raised tiles under a single light.
function buildLand(rings, top, side) {
  const topColor = new THREE.Color(top);
  const sideColor = new THREE.Color(side);
  const geos = rings.map((ring) => {
    const shape = new THREE.Shape(ring.map(([lon, lat]) => new THREE.Vector2(...toXY(lon, lat))));
    const extruded = new THREE.ExtrudeGeometry(shape, { depth: LAND_DEPTH, bevelEnabled: false });
    const geo = extruded.index ? extruded.toNonIndexed() : extruded;
    const normals = geo.getAttribute('normal');
    const colors = new Float32Array(normals.count * 3);
    for (let i = 0; i < normals.count; i++) {
      const c = Math.abs(normals.getZ(i)) > 0.5 ? topColor : sideColor;
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.deleteAttribute('uv');
    return geo;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  return merged;
}

function makeLabelTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 34px "Geist Sans", sans-serif';
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Land({ colors }) {
  const indonesia = useMemo(() => buildLand(mapData.indonesia, colors.land, colors.landSide), [colors]);
  const neighbors = useMemo(() => buildLand(mapData.neighbors, colors.neighbor, colors.neighborSide), [colors]);
  useEffect(() => () => (indonesia.dispose(), neighbors.dispose()), [indonesia, neighbors]);

  return (
    <>
      <mesh geometry={neighbors}>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <mesh geometry={indonesia}>
        <meshStandardMaterial vertexColors roughness={0.85} />
      </mesh>
    </>
  );
}

function Route({ stops, colors, animate, highlight }) {
  const curves = useMemo(
    () =>
      stops.slice(1).map((key, i) => {
        const a = officePos(stops[i]);
        const b = officePos(key);
        const mid = a.clone().lerp(b, 0.5);
        mid.z += 0.05 + a.distanceTo(b) * 0.1;
        return new THREE.QuadraticBezierCurve3(a, mid, b);
      }),
    [stops]
  );
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 64, 0.003, 6, false)), [curves]);
  useEffect(() => () => tubes.forEach((t) => t.dispose()), [tubes]);
  const packets = useRef([]);

  // Small packets running the route, like transfers between offices.
  useFrame(({ clock }) => {
    packets.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = animate ? (clock.elapsedTime * 0.22 + i * 0.37) % 1 : 0.5;
      mesh.position.copy(curves[i].getPoint(t));
    });
  });

  return curves.map((_, i) => (
    <group key={i}>
      <mesh geometry={tubes[i]}>
        <meshBasicMaterial
          color={colors.gold}
          transparent
          opacity={!highlight ? 0.55 : stops[i + 1] === highlight ? 1 : 0.3}
        />
      </mesh>
      <mesh ref={(el) => (packets.current[i] = el)}>
        <sphereGeometry args={[0.011, 12, 12]} />
        <meshBasicMaterial color={colors.gold} />
      </mesh>
    </group>
  ));
}

function Office({ id, active, colors, fontReady, labelScale }) {
  const beam = useRef();
  const ring = useRef();
  const label = useRef();
  const pos = useMemo(() => officePos(id), [id]);
  const { city, labelSide } = offices[id];
  const texture = useMemo(
    () => (fontReady ? makeLabelTexture(city, colors.label) : null),
    [city, colors.label, fontReady]
  );
  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(({ clock }, delta) => {
    const h = THREE.MathUtils.damp(beam.current.scale.y, active ? BEAM.active : BEAM.idle, 6, delta);
    beam.current.scale.y = h;
    beam.current.position.z = LAND_DEPTH + h / 2;
    beam.current.material.color.set(active ? colors.gold : colors.goldDim);
    const pulse = active ? 1 + ((clock.elapsedTime * 0.8) % 1) * 1.6 : 1;
    ring.current.scale.setScalar(pulse);
    ring.current.material.opacity = active ? 1 - ((clock.elapsedTime * 0.8) % 1) : 0.5;
    if (label.current) {
      label.current.position.z = LAND_DEPTH + h + 0.05;
      label.current.material.opacity = THREE.MathUtils.damp(label.current.material.opacity, active ? 1 : 0.45, 6, delta);
    }
  });

  return (
    <group position={[pos.x, pos.y, 0]}>
      <mesh ref={beam} rotation={[Math.PI / 2, 0, 0]} scale={[1, BEAM.idle, 1]}>
        <cylinderGeometry args={[0.006, 0.006, 1, 8]} />
        <meshBasicMaterial color={colors.goldDim} />
      </mesh>
      <mesh ref={ring} position={[0, 0, LAND_DEPTH + 0.002]}>
        <ringGeometry args={[0.022, 0.03, 40]} />
        <meshBasicMaterial color={colors.gold} transparent />
      </mesh>
      {texture && (
        <sprite ref={label} position={[(labelSide === 'left' ? -0.17 : 0.17) * labelScale, 0, 0.2]}
          scale={[0.36 * labelScale, 0.09 * labelScale, 1]}>
          <spriteMaterial map={texture} transparent depthWrite={false} opacity={0.45} />
        </sprite>
      )}
    </group>
  );
}

function Rig({ items, progress }) {
  const { camera, size } = useThree();
  const target = useRef(OVERVIEW_TARGET.clone());
  const desiredTarget = useRef(new THREE.Vector3());
  const desiredCam = useRef(new THREE.Vector3());
  const positions = useMemo(() => items.map(officePos), [items]);

  useFrame((_, delta) => {
    if (progress) {
      // Fly to the active role's office; the damping below makes it a glide.
      const i = Math.round(THREE.MathUtils.clamp(progress.get(), 0, 1) * (positions.length - 1));
      desiredTarget.current.copy(positions[i]);
      desiredCam.current.copy(desiredTarget.current).add(CLOSE_OFFSET);
    } else {
      desiredTarget.current.copy(OVERVIEW_TARGET);
      desiredCam.current.copy(OVERVIEW_TARGET).add(overviewOffset(size.width / size.height));
    }
    const k = 1 - Math.pow(0.02, delta);
    camera.position.lerp(desiredCam.current, k);
    target.current.lerp(desiredTarget.current, k);
    camera.lookAt(target.current);
  });

  return null;
}

/**
 * 3D map of the treasury offices the career moved through. With `progress`
 * (a 0..1 MotionValue) the camera flies to the active role's office; without
 * it the map stays on a static overview (mobile, reduced motion).
 */
export default function TreasuryMap({ items, activeIndex, progress, isDark, animate = true }) {
  const colors = isDark ? PALETTE.dark : PALETTE.light;
  const [fontReady, setFontReady] = useState(false);
  // Chronological unique stops (data is newest-first).
  const stops = useMemo(() => [...items].reverse().filter((k, i, arr) => arr[i - 1] !== k), [items]);
  const activeOffice = progress ? items[activeIndex] : null;

  useEffect(() => {
    document.fonts
      .load('600 34px "Geist Sans"')
      .catch(() => {})
      .finally(() => setFontReady(true));
  }, []);

  return (
    <Canvas
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      camera={{ position: OVERVIEW_TARGET.clone().add(overviewOffset(2.3)).toArray(), fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <ambientLight intensity={isDark ? 0.9 : 1.4} />
      <directionalLight position={[-2, -3, 5]} intensity={isDark ? 1.8 : 1.2} />
      <Land colors={colors} />
      <Route stops={stops} colors={colors} animate={animate} highlight={activeOffice} />
      {Object.keys(offices).map((id) => (
        <Office
          key={id}
          id={id}
          active={!activeOffice || activeOffice === id}
          colors={colors}
          fontReady={fontReady}
          labelScale={progress ? 1 : 1}
        />
      ))}
      <Rig items={items} progress={progress} />
    </Canvas>
  );
}
