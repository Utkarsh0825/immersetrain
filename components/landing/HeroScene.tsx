'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Float, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function VRHeadset() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const targetX = pointer.y * 0.26; // ~15° max
    const targetY = pointer.x * 0.26;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, delta * 3);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, delta * 3);
  });

  const bodyColor = '#1a1a2e';
  const lensColor = '#0a0a1e';

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Main body */}
        <RoundedBox args={[2.4, 1.2, 1.0]} radius={0.18} smoothness={6}>
          <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Left lens */}
        <mesh position={[-0.48, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.15, 48]} />
          <meshStandardMaterial
            color={lensColor}
            metalness={0.9}
            roughness={0.1}
            opacity={0.8}
            transparent
          />
        </mesh>

        {/* Right lens */}
        <mesh position={[0.48, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.15, 48]} />
          <meshStandardMaterial
            color={lensColor}
            metalness={0.9}
            roughness={0.1}
            opacity={0.8}
            transparent
          />
        </mesh>

        {/* Strap */}
        <mesh position={[0, 0, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.5, 0.05, 12, 64]} />
          <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <Environment preset="city" />

      {/* Indigo from above */}
      <pointLight position={[0, 4, 2]} color="#5B4CFF" intensity={12} distance={14} />
      {/* Cyan from below-left */}
      <pointLight position={[-3, -2, 3]} color="#00D4FF" intensity={8} distance={12} />
      {/* Subtle fill */}
      <ambientLight intensity={0.15} />

      <VRHeadset />

      <Sparkles count={80} size={1.5} color="#5B4CFF" scale={8} speed={0.6} opacity={0.7} />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
