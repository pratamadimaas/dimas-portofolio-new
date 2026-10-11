import { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Ripple + RGB split around the cursor, fading in with uHover.
// cover() mirrors CSS `object-fit: cover` (top-aligned, uAlignX horizontally) so the canvas
// lines up pixel-for-pixel with the <img> underneath it.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  uniform float uAlignX;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float rp = uPlane.x / uPlane.y;
    float ri = uImage.x / uImage.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    return vec2((uv.x - uAlignX) * s.x + uAlignX, (uv.y - 1.0) * s.y + 1.0);
  }

  void main() {
    vec2 aspect = vec2(uPlane.x / uPlane.y, 1.0);
    vec2 toMouse = (vUv - uMouse) * aspect;
    float dist = length(toMouse);
    vec2 dir = dist > 0.0001 ? toMouse / dist : vec2(0.0);
    float falloff = smoothstep(0.55, 0.0, dist) * uHover;

    float wave = sin(dist * 30.0 - uTime * 5.0) * 0.008 * falloff;
    vec2 uv = vUv + dir / aspect * wave;
    uv = (uv - vec2(0.5, 1.0)) * (1.0 - 0.04 * uHover) + vec2(0.5, 1.0);

    vec2 c = cover(uv);
    vec2 shift = dir / aspect * 0.006 * falloff;
    float r = texture2D(uTex, c + shift).r;
    float g = texture2D(uTex, c).g;
    float b = texture2D(uTex, c - shift).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function ImagePlane({ src, hovered, pointer, alignX }) {
  const texture = useLoader(THREE.TextureLoader, src);
  const { viewport, size } = useThree();
  const target = useMemo(() => new THREE.Vector2(), []);

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uImage: { value: new THREE.Vector2(texture.image.width, texture.image.height) },
      uAlignX: { value: alignX },
    }),
    [texture, alignX],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hovered.current ? 1 : 0, 6, delta);
    target.set(pointer.current.x, pointer.current.y);
    uniforms.uMouse.value.lerp(target, 1 - Math.pow(0.0005, delta));
    uniforms.uPlane.value.set(size.width, size.height);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}

// Lazy-loaded by DistortImage so three.js stays out of the main bundle.
export default function DistortCanvas({ src, alignX, hovered, pointer, active }) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <ImagePlane src={src} hovered={hovered} pointer={pointer} alignX={alignX} />
      </Suspense>
    </Canvas>
  );
}
