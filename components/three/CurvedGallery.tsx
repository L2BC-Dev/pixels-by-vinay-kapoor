"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

// Shared drag state so a drag-release doesn't count as a click on a panel.
const drag = { moved: 0 };

export type GalleryItem = { src: string; href: string; title: string; w: number; h: number };

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// Cover-fit texture, arched top mask, hover colour lift, rani rim.
const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uRatio; // plane aspect / image aspect correction
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * uRatio + 0.5;
    uv.y += sin(uTime * 0.6 + vUv.x * 3.0) * 0.004;
    vec3 col = texture2D(uMap, uv).rgb;
    float g = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(g) * vec3(1.0, 0.92, 0.9), col, 0.45 + 0.55 * uHover);
    // arch: semicircular top on a 0.75-aspect plane (circle centre at v = 0.625)
    vec2 q = vec2(vUv.x - 0.5, (vUv.y - 0.625) / 0.75);
    if (vUv.y > 0.625 && length(q) > 0.5) discard;
    float edge = smoothstep(0.0, 0.02, min(vUv.x, 1.0 - vUv.x));
    col = mix(vec3(0.886, 0.212, 0.498), col, edge);
    float vig = smoothstep(1.2, 0.3, length(vUv - 0.5));
    gl_FragColor = vec4(col * (0.75 + 0.25 * vig) * (0.85 + 0.25 * uHover), 1.0);
  }
`;

function Panel({ item, angle, radius }: { item: GalleryItem; angle: number; radius: number }) {
  const tex = useTexture(item.src);
  tex.colorSpace = THREE.SRGBColorSpace;
  const router = useRouter();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [hover, setHover] = useState(false);
  const W = 1.5, H = 2.0;
  const uniforms = useMemo(() => {
    const imgAspect = item.w / item.h;
    const planeAspect = W / H;
    const ratio = imgAspect > planeAspect ? new THREE.Vector2(planeAspect / imgAspect, 1) : new THREE.Vector2(1, imgAspect / planeAspect);
    return { uMap: { value: tex }, uRatio: { value: ratio }, uHover: { value: 0 }, uTime: { value: 0 } };
  }, [tex, item.w, item.h]);

  useFrame((s, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uHover.value = THREE.MathUtils.damp(mat.current.uniforms.uHover.value, hover ? 1 : 0, 6, dt);
    mat.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  const x = Math.sin(angle) * radius;
  const z = -Math.cos(angle) * radius;
  return (
    <mesh
      position={[x, 0, z]}
      rotation={[0, -angle, 0]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
      onClick={() => {
        if (drag.moved > 6) return;
        router.push(item.href);
      }}
    >
      <planeGeometry args={[W, H, 1, 1]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Ring({ items, onFocus }: { items: GalleryItem[]; onFocus: (i: number) => void }) {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const state = useRef({ target: 0, current: 0, dragging: false, lastX: 0, last: -1 });
  const radius = Math.max(4.2, items.length * 0.42);
  const step = (Math.PI * 2) / items.length;

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      drag.moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      drag.moved += Math.abs(dx);
      s.target += dx * 0.005;
    };
    const up = () => {
      s.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) s.target += e.deltaX * 0.002;
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((st, dt) => {
    const s = state.current;
    if (!s.dragging) s.target += dt * 0.04;
    s.current = THREE.MathUtils.damp(s.current, s.target, 4, dt);
    if (group.current) group.current.rotation.y = s.current;
    const idx = ((Math.round(s.current / step) % items.length) + items.length) % items.length;
    if (idx !== s.last) {
      s.last = idx;
      onFocus(idx);
    }
    st.camera.position.x = THREE.MathUtils.damp(st.camera.position.x, st.pointer.x * 0.3, 3, dt);
    st.camera.position.y = THREE.MathUtils.damp(st.camera.position.y, st.pointer.y * 0.2, 3, dt);
    st.camera.lookAt(0, 0, -radius);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {items.map((it, i) => (
        <Panel key={it.src + i} item={it} angle={i * step} radius={radius} />
      ))}
      {/* floor reflection hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <ringGeometry args={[radius - 1, radius + 1, 96]} />
        <meshBasicMaterial color="#E2367F" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

export default function CurvedGallery({ items, onFocus, active = true }: { items: GalleryItem[]; onFocus: (i: number) => void; active?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 55, near: 0.1, far: 60 }} dpr={[1, 1.75]} gl={{ antialias: true }} frameloop={active ? "always" : "never"}>
      <color attach="background" args={["#0B0A10"]} />
      <fog attach="fog" args={["#0B0A10", 4, 14]} />
      <Suspense fallback={null}>
        <Ring items={items} onFocus={onFocus} />
      </Suspense>
    </Canvas>
  );
}
