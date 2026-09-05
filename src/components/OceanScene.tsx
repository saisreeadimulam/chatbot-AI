import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface OceanSceneProps {
  isTyping?: boolean;
  isResponding?: boolean;
}

function Fish({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    const speed = isActive ? 0.05 : 0.02;
    const interval = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.position.x += speed;
        if (meshRef.current.position.x > 5) meshRef.current.position.x = -5;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <Float speed={isActive ? 3 : 1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#4dd0e1" emissive="#00acc1" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

function Turtle({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    const speed = isActive ? 0.03 : 0.015;
    const interval = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.position.z += speed;
        if (meshRef.current.position.z > 4) meshRef.current.position.z = -4;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <Float speed={isActive ? 2 : 1} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#26a69a" emissive="#00897b" emissiveIntensity={0.4} />
      </mesh>
    </Float>
  );
}

function Whale({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    const speed = isActive ? 0.025 : 0.01;
    const interval = setInterval(() => {
      if (meshRef.current) {
        meshRef.current.position.x -= speed;
        if (meshRef.current.position.x < -6) meshRef.current.position.x = 6;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <Float speed={isActive ? 1.5 : 0.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} scale={1.5}>
        <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
        <meshStandardMaterial color="#0277bd" emissive="#01579b" emissiveIntensity={0.3} />
      </mesh>
    </Float>
  );
}

function Jellyfish({ position, isResponding }: { position: [number, number, number]; isResponding: boolean }) {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={1}>
      <mesh position={position}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color="#80deea" 
          transparent 
          opacity={0.7} 
          emissive="#00e5ff" 
          emissiveIntensity={isResponding ? 1.2 : 0.6} 
        />
      </mesh>
    </Float>
  );
}

export default function OceanScene({ isTyping = false, isResponding = false }: OceanSceneProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={isResponding ? 1.5 : 0.8} color="#4dd0e1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0277bd" />
        
        {/* Ocean creatures */}
        <Fish position={[-3, 2, 0]} isActive={isTyping} />
        <Fish position={[2, -1, -2]} isActive={isTyping} />
        <Fish position={[-1, 0, 2]} isActive={isTyping} />
        
        <Turtle position={[3, 1, -1]} isActive={isTyping} />
        <Turtle position={[-2, -2, 1]} isActive={isTyping} />
        
        <Whale position={[4, 0, -3]} isActive={isTyping} />
        
        <Jellyfish position={[0, 3, -1]} isResponding={isResponding} />
        <Jellyfish position={[-3, -1, 1]} isResponding={isResponding} />
        <Jellyfish position={[2, 2, -2]} isResponding={isResponding} />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
