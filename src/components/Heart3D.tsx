import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface HeartGeometryProps {
  scrollProgress: number;
}

const HeartGeometry: React.FC<HeartGeometryProps> = ({ scrollProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create heart shape using parametric equations
  const createHeartShape = () => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const [geometry] = useState(() => createHeartShape());

  // Rotate based on scroll progress
  useFrame(() => {
    if (meshRef.current) {
      // Continuous gentle rotation
      meshRef.current.rotation.y += 0.005;

      // Add scroll-based rotation
      meshRef.current.rotation.x = scrollProgress * Math.PI * 0.5;
      meshRef.current.rotation.z = Math.sin(scrollProgress * Math.PI) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -0.5, 0]} scale={1.2}>
      <MeshDistortMaterial
        color="#ff1744"
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};

interface Heart3DProps {
  className?: string;
}

const Heart3D: React.FC<Heart3DProps> = ({ className = '' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1) for the first viewport height
      const scrolled = window.scrollY;
      const maxScroll = window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff1744" />
        <HeartGeometry scrollProgress={scrollProgress} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Heart3D;
