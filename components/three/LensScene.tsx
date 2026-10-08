"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, useTexture, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// A procedural cinema lens: knurled barrel rings + a refractive front element,
// with the founder's portrait seen through the glass. Rotation follows `progress` (0..1).
function Lens({ portrait, progress }: { portrait: string; progress: React.MutableRefObject<number> }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const tex = useTexture(portrait);
  tex.colorSpace = THREE.SRGBColorSpace;
  // cover-fit the portrait into the round "sensor" disc
  const img = tex.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 0.75;
  if (aspect > 1) {
    tex.repeat.set(1 / aspect, 1);
    tex.offset.set((1 - 1 / aspect) / 2, 0);
  } else {
    tex.repeat.set(1, aspect);
    tex.offset.set(0, (1 - aspect) / 2);
  }

  const knurl = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.32, 1.32, 0.3, 480, 1, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const r = 1.32 + Math.abs(Math.sin(a * 60)) * 0.03;
      pos.setXYZ(i, Math.cos(a) * r, pos.getY(i), Math.sin(a) * r);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((s, dt) => {
    const p = progress.current;
    // outer group: tilt toward the viewer + pointer; inner group: focus-ring spin about the lens axis
    if (tilt.current) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, Math.PI / 2 - 0.28 + p * 0.22 - s.pointer.y * 0.15, 4, dt);
      tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, -0.18 + p * 0.3 - s.pointer.x * 0.18, 4, dt);
    }
    if (spin.current) spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, p * Math.PI * 1.5, 4, dt);
  });

  const metal = { color: "#3a3446", metalness: 0.85, roughness: 0.32 } as const;

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.3}>
        <group ref={tilt} rotation={[Math.PI / 2 - 0.28, 0, -0.18]}>
        <group ref={spin}>
          {/* portrait on the "sensor", seen through the front glass */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.16, 96]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          {/* barrel */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[1.22, 1.15, 1.4, 96, 1, true]} />
            <meshStandardMaterial {...metal} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={knurl} position={[0, -0.3, 0]}>
            <meshStandardMaterial color="#4a4256" metalness={0.7} roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={knurl} position={[0, -0.95, 0]}>
            <meshStandardMaterial color="#4a4256" metalness={0.7} roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          {/* front rim + rani focus ring */}
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.28, 0.09, 24, 128]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.25, 0.018, 12, 128]} />
            <meshStandardMaterial color="#E2367F" emissive="#E2367F" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.12, 0.012, 12, 128]} />
            <meshStandardMaterial color="#E8772E" emissive="#E8772E" emissiveIntensity={1.4} />
          </mesh>
          {/* front glass element */}
          <mesh position={[0, 0.08, 0]} scale={[1, 0.28, 1]}>
            <sphereGeometry args={[1.18, 64, 32]} />
            <MeshTransmissionMaterial
              thickness={0.6}
              roughness={0.02}
              transmission={1}
              ior={1.45}
              chromaticAberration={0.12}
              anisotropicBlur={0.05}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.05}
              color="#f7e8f0"
              samples={6}
              resolution={512}
            />
          </mesh>
        </group>
        </group>
      </Float>
    </>
  );
}

export default function LensScene({ portrait, progress, active = true }: { portrait: string; progress: React.MutableRefObject<number>; active?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} frameloop={active ? "always" : "never"}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2} color="#efe4d8" />
      <pointLight position={[-3, -2, 2]} intensity={14} color="#E2367F" />
      <pointLight position={[3, -1, 1]} intensity={8} color="#E8772E" />
      <Suspense fallback={null}>
        <Lens portrait={portrait} progress={progress} />
      </Suspense>
    </Canvas>
  );
}
