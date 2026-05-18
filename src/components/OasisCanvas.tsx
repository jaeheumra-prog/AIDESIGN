"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function StudyRoom() {
  return (
    <>
      <color attach="background" args={["#120f0d"]} />

      <ambientLight intensity={0.55} color="#ffe8c7" />

      <directionalLight
        position={[5, 6, 3]}
        intensity={1.2}
        color="#ffd29a"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <spotLight
        position={[1.8, 4.5, 1.2]}
        angle={0.45}
        penumbra={0.7}
        intensity={45}
        color="#ffbf7a"
        castShadow
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.2, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#6a5442" />
      </mesh>

      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.55, 0.45, 24]} />
        <meshStandardMaterial color="#8f674a" roughness={0.65} />
      </mesh>

      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.3, 0.45]} />
        <meshStandardMaterial color="#c99f74" roughness={0.35} metalness={0.05} />
      </mesh>

      <OrbitControls
        enableDamping
        minDistance={4}
        maxDistance={11}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.65, 0]}
      />
    </>
  );
}

export default function OasisCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [4.8, 3.8, 5.4], fov: 48 }}
    >
      <StudyRoom />
    </Canvas>
  );
}
