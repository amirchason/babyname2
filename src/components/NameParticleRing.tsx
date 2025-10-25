import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import nameService from "../services/nameService";

interface NamePoint {
  idx: number;
  position: [number, number, number];
  color: string;
  name: string;
}

const NameParticleRing: React.FC = () => {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    // Fetch top 1000 names from database
    const fetchNames = async () => {
      const allNames = await nameService.getAllNames();
      const top1000 = allNames.slice(0, 1000).map(n => n.name);
      setNames(top1000);
    };
    fetchNames();
  }, []);

  return (
    <div className="relative">
      <Canvas
        camera={{
          position: [10, -7.5, -5],
        }}
        style={{ height: "100vh" }}
        className="bg-slate-900"
      >
        <OrbitControls maxDistance={20} minDistance={10} />
        <directionalLight />
        <pointLight position={[-30, 0, -30]} power={10.0} />
        <NamePointCircle names={names} />
      </Canvas>

      <h1 className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-200 font-medium text-2xl md:text-5xl pointer-events-none">
        Drag & Zoom
      </h1>
      <p className="absolute bottom-10 left-[50%] -translate-x-[50%] text-slate-400 text-sm pointer-events-none">
        {names.length} names loaded
      </p>
    </div>
  );
};

interface NamePointCircleProps {
  names: string[];
}

const NamePointCircle: React.FC<NamePointCircleProps> = ({ names }) => {
  const ref = useRef<any>(null);

  useFrame(({ clock }) => {
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  // Generate points in two rings (inner and outer)
  const generateRingPoints = (): NamePoint[] => {
    const points: NamePoint[] = [];
    const colors = ['#ff1744', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688'];

    // Inner ring - 400 names
    const innerRadius = 3;
    const innerCount = Math.min(400, names.length);
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius;
      const z = (Math.random() - 0.5) * 1; // Slight z variation

      points.push({
        idx: i,
        position: [x, y, z],
        color: colors[i % colors.length],
        name: names[i] || `Name${i}`
      });
    }

    // Outer ring - 600 names
    const outerRadius = 5.5;
    const outerCount = Math.min(600, names.length - innerCount);
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const y = Math.sin(angle) * outerRadius;
      const z = (Math.random() - 0.5) * 1.5; // More z variation

      points.push({
        idx: innerCount + i,
        position: [x, y, z],
        color: colors[(innerCount + i) % colors.length],
        name: names[innerCount + i] || `Name${innerCount + i}`
      });
    }

    return points;
  };

  const points = names.length > 0 ? generateRingPoints() : [];

  return (
    <group ref={ref}>
      {points.map((point) => (
        <NamePoint
          key={point.idx}
          position={point.position}
          color={point.color}
          name={point.name}
        />
      ))}
    </group>
  );
};

interface NamePointProps {
  position: [number, number, number];
  color: string;
  name: string;
}

const NamePoint: React.FC<NamePointProps> = ({ position, color, name }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Text
      position={position}
      fontSize={hovered ? 0.15 : 0.08}
      color={color}
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {name}
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={hovered ? 1.0 : 0.5}
        roughness={0.5}
      />
    </Text>
  );
};

export default NameParticleRing;
