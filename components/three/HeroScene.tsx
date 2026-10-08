"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  archFragment,
  archVertex,
  glowFragment,
  petalFragment,
  petalVertex,
  photoFragment,
  photoVertex,
  radialVertex,
  vignetteFragment,
} from "./heroShaders";

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const INK = "#0B0A10";
const SINDOOR = "#B3202A";
const RANI = "#E2367F";
const OLIVE = "#3E4A2C";
const CREAM = "#EFE4D8";
const SAFFRON = "#E8772E";

const FOG_NEAR = 7;
const FOG_FAR = 30;

const CAM_START_Z = 10;
const CAM_TRAVEL = 21; // ends at z = -11, past two arches

/* Shared fog uniforms (one object, referenced by every material) */
function fogUniforms() {
  return {
    uFogColor: { value: new THREE.Color(INK) },
    uFogNear: { value: FOG_NEAR },
    uFogFar: { value: FOG_FAR },
  };
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Piecewise-linear 3D curve, parametrised by arc length (keeps cusps sharp). */
class PolyCurve extends THREE.Curve<THREE.Vector3> {
  private readonly pts: THREE.Vector3[];
  private readonly cum: number[];
  private readonly total: number;

  constructor(points: THREE.Vector3[]) {
    super();
    this.pts = points;
    this.cum = [0];
    let acc = 0;
    for (let i = 1; i < points.length; i++) {
      acc += points[i].distanceTo(points[i - 1]);
      this.cum.push(acc);
    }
    this.total = acc;
  }

  override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const d = THREE.MathUtils.clamp(t, 0, 1) * this.total;
    // binary search for the segment
    let lo = 0;
    let hi = this.cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid] <= d) lo = mid;
      else hi = mid;
    }
    const segLen = this.cum[hi] - this.cum[lo];
    const f = segLen > 0 ? (d - this.cum[lo]) / segLen : 0;
    return target.copy(this.pts[lo]).lerp(this.pts[hi], f);
  }
}

/**
 * Builds the outline of a Mughal multifoil (cusped) arch as an ordered list of
 * points: left pillar → lobed crown → right pillar.
 */
function buildArchPoints(opts: {
  radius: number; // radius of the springing circle
  springY: number; // y where the arch starts curving
  baseY: number; // bottom of the pillars
  lobes: number;
  lobeDepth: number; // > 1 deepens the cusps
  stretchY: number; // vertical stretch of the crown (pointed look)
}): THREE.Vector3[] {
  const { radius: R, springY, baseY, lobes: n, lobeDepth: k, stretchY } = opts;
  const dTh = Math.PI / n;
  const half = dTh / 2;
  const r = k * R * Math.sin(half);
  const cuspDist = R * Math.cos(half) - R * Math.sin(half) * Math.sqrt(k * k - 1);
  const px = R * Math.cos(half) + r; // pillar x
  const pts: THREE.Vector3[] = [];
  const push = (x: number, y: number) => pts.push(new THREE.Vector3(x, y, 0));
  const crown = (x: number, y: number) => push(x, springY + (y - springY) * stretchY);

  const lobeCenter = (i: number) => {
    const th = Math.PI - (i + 0.5) * dTh;
    return { x: R * Math.cos(th), y: springY + R * Math.sin(th), th };
  };
  const cusp = (bisector: number) => ({
    x: cuspDist * Math.cos(bisector),
    y: springY + cuspDist * Math.sin(bisector),
  });

  // left pillar: the first lobe starts with a vertical tangent at (-px, y0),
  // so the pillar flows straight into the crown.
  push(-px, baseY);

  const samples = 36;
  for (let i = 0; i < n; i++) {
    const Lc = lobeCenter(i);
    let a0: number;
    let a1: number;
    if (i === 0) a0 = Math.PI;
    else {
      const c = cusp(Lc.th + half);
      a0 = Math.atan2(c.y - Lc.y, c.x - Lc.x);
    }
    if (i === n - 1) a1 = 0;
    else {
      const c = cusp(Lc.th - half);
      a1 = Math.atan2(c.y - Lc.y, c.x - Lc.x);
    }
    // sweep clockwise from a0 through the outward angle Lc.th down to a1
    while (a0 < Lc.th) a0 += Math.PI * 2;
    while (a1 > Lc.th) a1 -= Math.PI * 2;
    // s = 0 is the cusp already emitted by the previous lobe
    for (let s = i === 0 ? 0 : 1; s <= samples; s++) {
      const a = a0 + (a1 - a0) * (s / samples);
      crown(Lc.x + r * Math.cos(a), Lc.y + r * Math.sin(a));
    }
  }

  // right pillar
  push(px, baseY);
  return pts;
}

/* ------------------------------------------------------------------ */
/*  Arch                                                               */
/* ------------------------------------------------------------------ */

type ArchLayer = {
  radius: number;
  radial: number;
  intensity: number;
  falloff: number;
  hotness: number;
  scale: number;
};

const ARCH_LAYERS: ArchLayer[] = [
  // Toned down so the overlaid hero type stays legible (was 2.6 / 1.4 / 0.26 / 0.07).
  { radius: 0.022, radial: 6, intensity: 1.15, falloff: 1.2, hotness: 1, scale: 1 }, // core
  { radius: 0.01, radial: 5, intensity: 0.55, falloff: 1.0, hotness: 1, scale: 0.935 }, // inner line
  { radius: 0.16, radial: 10, intensity: 0.08, falloff: 2.8, hotness: 0, scale: 1 }, // halo
  { radius: 0.5, radial: 12, intensity: 0.018, falloff: 3.4, hotness: 0, scale: 1 }, // atmosphere
];

function useArchGeometries() {
  return React.useMemo(() => {
    const pts = buildArchPoints({
      radius: 1.75,
      springY: 0.9,
      baseY: -3.4,
      lobes: 9,
      lobeDepth: 1.06,
      stretchY: 1.14,
    });
    const curve = new PolyCurve(pts);
    const geos = ARCH_LAYERS.map(
      (l) => new THREE.TubeGeometry(curve, 900, l.radius, l.radial, false),
    );
    return geos;
  }, []);
}

function Arch({
  geometries,
  position,
  scale,
  intensity,
  timeUniform,
}: {
  geometries: THREE.TubeGeometry[];
  position: [number, number, number];
  scale: number;
  intensity: number;
  timeUniform: { value: number };
}) {
  const [, py] = position;
  const materials = React.useMemo(
    () =>
      ARCH_LAYERS.map(
        (l) =>
          new THREE.ShaderMaterial({
            vertexShader: archVertex,
            fragmentShader: archFragment,
            uniforms: {
              ...fogUniforms(),
              uColorLow: { value: new THREE.Color(SINDOOR) },
              uColorHigh: { value: new THREE.Color(RANI) },
              uHot: { value: new THREE.Color("#FFD2D8") },
              uIntensity: { value: l.intensity * intensity },
              uFalloff: { value: l.falloff },
              uHotness: { value: l.hotness },
              uGradLow: { value: py - 2.2 * scale },
              uGradHigh: { value: py + 2.6 * scale },
              uTime: timeUniform,
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
      ),
    [intensity, py, scale, timeUniform],
  );

  React.useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  return (
    <group position={position} scale={scale}>
      {ARCH_LAYERS.map((l, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          material={materials[i]}
          scale={l.scale}
          frustumCulled={false}
          renderOrder={10 + i}
        />
      ))}
    </group>
  );
}

function Arches({ timeUniform }: { timeUniform: { value: number } }) {
  const geometries = useArchGeometries();
  React.useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  return (
    <>
      <Arch geometries={geometries} position={[0, 0, 0]} scale={1} intensity={1} timeUniform={timeUniform} />
      <Arch geometries={geometries} position={[0, 0.1, -7]} scale={0.9} intensity={0.85} timeUniform={timeUniform} />
      <Arch geometries={geometries} position={[0, 0.2, -14]} scale={0.82} intensity={0.75} timeUniform={timeUniform} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Photos                                                             */
/* ------------------------------------------------------------------ */

type Slot = {
  x: number;
  y: number;
  z: number;
  height: number;
  rot: [number, number, number];
  bobSpeed: number;
  bobPhase: number;
};

function makeSlots(count: number): Slot[] {
  const slots: Slot[] = [];
  const n = Math.max(count, 1);
  for (let i = 0; i < n; i++) {
    const last = i === n - 1 && n > 3;
    const t = n > 1 ? i / (n - 1) : 0;
    const side = i % 2 === 0 ? -1 : 1;
    if (last) {
      // finale photo: centred, far behind the last arch
      slots.push({
        x: 0,
        y: 0.35,
        z: -18,
        height: 3.2,
        rot: [0, 0, 0],
        bobSpeed: 0.35,
        bobPhase: 2.1,
      });
      continue;
    }
    const z = 6 - t * 22; // from in front of the camera's first arch to deep in the corridor
    // widen deeper photos so perspective doesn't pull them into the centre (where the logo sits)
    const spread = (2.5 + rand(i * 7 + 1) * 1.5) * (1 + Math.max(0, -z) * 0.07);
    slots.push({
      x: side * spread,
      y: -0.9 + rand(i * 13 + 2) * 2.4,
      z,
      height: 1.5 + rand(i * 17 + 3) * 0.9,
      rot: [
        (rand(i * 19 + 4) - 0.5) * 0.18,
        -side * (0.35 + rand(i * 23 + 5) * 0.3),
        (rand(i * 29 + 6) - 0.5) * 0.14,
      ],
      bobSpeed: 0.3 + rand(i * 31 + 7) * 0.35,
      bobPhase: rand(i * 37 + 8) * Math.PI * 2,
    });
  }
  return slots;
}

function Photos({ images, timeUniform }: { images: string[]; timeUniform: { value: number } }) {
  const textures = useTexture(images);
  const { gl } = useThree();
  const slots = React.useMemo(() => makeSlots(images.length), [images.length]);
  const meshRefs = React.useRef<(THREE.Mesh | null)[]>([]);
  const geometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);

  const materials = React.useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    return textures.map((tex, i) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, maxAniso);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      const img = tex.image as { width?: number; height?: number } | undefined;
      const aspect = img && img.width && img.height ? img.width / img.height : 0.75;
      return new THREE.ShaderMaterial({
        vertexShader: photoVertex,
        fragmentShader: photoFragment,
        uniforms: {
          ...fogUniforms(),
          uMap: { value: tex },
          uAspect: { value: aspect },
          uTopRadius: { value: aspect < 1 ? aspect * 0.5 : 0.28 },
          uTime: timeUniform,
          uSeed: { value: rand(i + 101) },
          uOpacity: { value: 1 },
          uCream: { value: new THREE.Color(CREAM) },
        },
        transparent: true,
        // prints occlude petals / arches behind them (edges are discarded, not blended)
        depthWrite: true,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
    });
  }, [textures, gl, timeUniform]);

  React.useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      useTexture.clear(images);
    };
  }, [materials, textures, images]);
  React.useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const t = timeUniform.value;
    for (let i = 0; i < slots.length; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const s = slots[i];
      m.position.y = s.y + Math.sin(t * s.bobSpeed + s.bobPhase) * 0.12;
      m.position.x = s.x + Math.cos(t * s.bobSpeed * 0.7 + s.bobPhase) * 0.05;
      m.rotation.z = s.rot[2] + Math.sin(t * s.bobSpeed * 0.5 + s.bobPhase) * 0.02;
      m.rotation.y = s.rot[1] + Math.sin(t * s.bobSpeed * 0.4 + s.bobPhase * 1.3) * 0.03;
    }
  });

  return (
    <>
      {slots.map((s, i) => {
        const mat = materials[i % materials.length];
        const aspect = mat.uniforms.uAspect.value as number;
        return (
          <mesh
            key={i}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            geometry={geometry}
            material={mat}
            position={[s.x, s.y, s.z]}
            rotation={s.rot}
            scale={[s.height * aspect, s.height, 1]}
            renderOrder={20}
          />
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Petals                                                             */
/* ------------------------------------------------------------------ */

const PETAL_HALF = new THREE.Vector3(6.5, 5, 17);
const PETAL_CENTER = new THREE.Vector3(0, 0.5, -5);

function Petals({ count, timeUniform }: { count: number; timeUniform: { value: number } }) {
  const { geometry, material } = React.useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 4, 3);
    const seeds = new Float32Array(count * 4);
    const motion = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(SAFFRON),
      new THREE.Color(SAFFRON).offsetHSL(0, 0.05, -0.08),
      new THREE.Color(SINDOOR),
      new THREE.Color(RANI),
      new THREE.Color(RANI).offsetHSL(0.01, 0, -0.1),
      new THREE.Color(OLIVE),
    ];
    for (let i = 0; i < count; i++) {
      const r1 = rand(i * 3 + 11);
      const r2 = rand(i * 5 + 17);
      const r3 = rand(i * 7 + 23);
      const r4 = rand(i * 11 + 29);
      const r5 = rand(i * 13 + 31);
      const r6 = rand(i * 17 + 37);
      const r7 = rand(i * 19 + 41);
      seeds[i * 4 + 0] = (r1 - 0.5) * PETAL_HALF.x * 2;
      seeds[i * 4 + 1] = (r2 - 0.5) * PETAL_HALF.z * 2;
      seeds[i * 4 + 2] = r3 * Math.PI * 2;
      seeds[i * 4 + 3] = 0.07 + r4 * 0.11; // size
      motion[i * 4 + 0] = 0.25 + r5 * 0.45; // fall speed
      motion[i * 4 + 1] = (r6 - 0.5) * 3.2; // spin
      motion[i * 4 + 2] = 0.4 + r7 * 0.9; // sway
      motion[i * 4 + 3] = r1 * PETAL_HALF.y * 2 + r6 * 5.0; // y offset
      // mostly saffron + sindoor, some rani, a few olive leaves
      const pick = r5 < 0.42 ? 0 : r5 < 0.58 ? 1 : r5 < 0.78 ? 2 : r5 < 0.9 ? 3 : r5 < 0.94 ? 4 : 5;
      const c = palette[pick];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
    geo.setAttribute("aMotion", new THREE.InstancedBufferAttribute(motion, 4));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: petalVertex,
      fragmentShader: petalFragment,
      uniforms: {
        ...fogUniforms(),
        uTime: timeUniform,
        uHalf: { value: PETAL_HALF },
        uCenter: { value: PETAL_CENTER },
        uRim: { value: new THREE.Color(RANI) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    return { geometry: geo, material: mat };
  }, [count, timeUniform]);

  React.useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <instancedMesh
      args={[geometry, material, count]}
      frustumCulled={false}
      renderOrder={30}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Background glow + vignette                                         */
/* ------------------------------------------------------------------ */

function BackGlow() {
  const material = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: radialVertex,
        fragmentShader: glowFragment,
        uniforms: {
          uColorA: { value: new THREE.Color(RANI) },
          uColorB: { value: new THREE.Color(SINDOOR) },
          uIntensity: { value: 0.28 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  React.useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh position={[0, 0.6, -26]} scale={[22, 16, 1]} material={material} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function Vignette() {
  const ref = React.useRef<THREE.Mesh>(null);
  const material = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: radialVertex,
        fragmentShader: vignetteFragment,
        uniforms: {
          uColor: { value: new THREE.Color(INK) },
          uStrength: { value: 0.62 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
    [],
  );
  React.useEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera, size }) => {
    const m = ref.current;
    if (!m) return;
    const cam = camera as THREE.PerspectiveCamera;
    m.position.copy(cam.position);
    m.quaternion.copy(cam.quaternion);
    m.translateZ(-1);
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) * 0.5) * 1.04;
    m.scale.set(h * (size.width / size.height), h, 1);
  });

  return (
    <mesh ref={ref} material={material} renderOrder={100} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera rig: scroll dolly + pointer parallax + roll                 */
/* ------------------------------------------------------------------ */

function CameraRig({
  progress,
  timeUniform,
}: {
  progress: React.MutableRefObject<number>;
  timeUniform: { value: number };
}) {
  const pointer = React.useRef({ x: 0, y: 0 });
  const smooth = React.useRef({ x: 0, y: 0 });
  const target = React.useMemo(() => new THREE.Vector3(), []);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    timeUniform.value = clock.elapsedTime;

    const raw = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    const p = easeInOutCubic(raw);

    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 4.5);
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;
    const sx = smooth.current.x;
    const sy = smooth.current.y;

    const t = clock.elapsedTime;
    const z = CAM_START_Z - CAM_TRAVEL * p;
    const weave = Math.sin(p * Math.PI * 2) * 0.35;
    const breath = Math.sin(t * 0.5) * 0.04;

    camera.position.set(
      weave + sx * 0.55,
      0.45 + Math.sin(p * Math.PI) * 0.25 + sy * 0.32 + breath,
      z,
    );
    target.set(sx * 1.3 + weave * 0.3, 0.35 + sy * 0.7 - p * 0.2, z - 9);
    camera.lookAt(target);
    const roll = Math.sin(p * Math.PI) * 0.055 + sx * 0.025 + Math.sin(t * 0.3) * 0.004;
    camera.rotateZ(roll);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene root                                                         */
/* ------------------------------------------------------------------ */

function Scene({
  images,
  progress,
  petalCount,
}: {
  images: string[];
  progress: React.MutableRefObject<number>;
  petalCount: number;
}) {
  const timeUniform = React.useMemo(() => ({ value: 0 }), []);
  return (
    <>
      <color attach="background" args={[INK]} />
      <CameraRig progress={progress} timeUniform={timeUniform} />
      <BackGlow />
      <Arches timeUniform={timeUniform} />
      <React.Suspense fallback={null}>
        {images.length > 0 && <Photos images={images} timeUniform={timeUniform} />}
      </React.Suspense>
      <Petals count={petalCount} timeUniform={timeUniform} />
      <Vignette />
    </>
  );
}

export default function HeroScene(props: {
  images: string[];
  progress: React.MutableRefObject<number>;
}) {
  const { images, progress } = props;
  const [petalCount] = React.useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 500 : 1500,
  );

  return (
    <Canvas
      style={{ width: "100%", height: "100%", display: "block", background: INK }}
      dpr={[1, 1.75]}
      flat
      frameloop="always"
      camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0.45, CAM_START_Z] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <Scene images={images} progress={progress} petalCount={petalCount} />
    </Canvas>
  );
}
