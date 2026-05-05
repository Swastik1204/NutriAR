import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedRing = ({ isDetected }) => {
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      // Smoothly animate scale based on detection state
      const targetScale = isDetected ? 1.4 : 1.0;
      ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Rotate the ring
      ringRef.current.rotation.z += delta * (isDetected ? 2 : 0.5);
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.03, 16, 100]} />
        <meshStandardMaterial 
          color={isDetected ? "#00e676" : "#00e5ff"} 
          emissive={isDetected ? "#00e676" : "#00e5ff"} 
          emissiveIntensity={isDetected ? 1.5 : 0.8} 
          transparent 
          opacity={0.6}
          wireframe
        />
      </mesh>
    </Float>
  );
};

const OrbitingOrb = ({ position, color, speed, radius, yOffset, isDetected }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const currentSpeed = isDetected ? speed * 3 : speed;
      groupRef.current.position.x = Math.sin(time * currentSpeed) * radius;
      groupRef.current.position.z = Math.cos(time * currentSpeed) * radius;
      groupRef.current.position.y = Math.sin(time * currentSpeed * 0.5) * 0.5 + yOffset;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default function ScannerFX({ isDetected }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Central Scanner Ring */}
        <AnimatedRing isDetected={isDetected} />

        {/* Orbiting Data Particles */}
        <OrbitingOrb position={[0, 0, 0]} color="#b388ff" speed={0.5} radius={2.2} yOffset={0.5} isDetected={isDetected} />
        <OrbitingOrb position={[0, 0, 0]} color="#00e5ff" speed={-0.7} radius={1.8} yOffset={-0.5} isDetected={isDetected} />
        <OrbitingOrb position={[0, 0, 0]} color="#facc15" speed={0.9} radius={2.5} yOffset={0} isDetected={isDetected} />

      </Canvas>
    </div>
  );
}
