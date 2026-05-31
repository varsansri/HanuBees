"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function HoneySphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <Icosahedron ref={meshRef} args={[1.6, 4]}>
        <MeshDistortMaterial
          color="#f5a623"
          distort={0.35}
          speed={2.5}
          roughness={0.05}
          metalness={0.9}
          envMapIntensity={2}
        />
      </Icosahedron>
    </Float>
  );
}

function RingOrbit() {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const angle = (i / 120) * Math.PI * 2;
      const r = 2.8 + Math.random() * 0.4;
      return new THREE.Vector3(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 0.5,
        Math.sin(angle) * r,
      );
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos.toArray()}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#ffd166" : "#f5a623"} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ffd166" />
        <pointLight position={[-5, -3, -5]} intensity={1} color="#ff6b35" />
        <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.5} />
        <HoneySphere />
        <RingOrbit />
      </Canvas>
    </div>
  );
}
