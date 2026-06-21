import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  xp: number;
  completedAchievementsCount: number;
}

// Coordinate paths for 5 simplified Earth landmasses (normalized to 512x256)
const CONTINENTS = [
  // North America
  [[90, 45], [130, 35], [165, 45], [200, 50], [210, 75], [175, 85], [155, 115], [135, 125], [125, 105], [95, 75]],
  // South America
  [[145, 125], [170, 130], [185, 155], [165, 195], [150, 225], [140, 195], [130, 155], [135, 135]],
  // Eurasia & Africa
  [[245, 75], [285, 45], [365, 35], [445, 40], [465, 65], [425, 105], [385, 105], [395, 135], [370, 145], [345, 125], [325, 115], [325, 135], [345, 155], [345, 185], [320, 215], [295, 195], [275, 155], [295, 115], [275, 105], [255, 105]],
  // Australia
  [[405, 165], [445, 160], [455, 180], [435, 200], [400, 190]],
  // Greenland
  [[175, 25], [195, 30], [185, 50], [165, 45]]
];

// Mathematical Ray-Casting algorithm (Jordan curve theorem)
function isPointInPolygon(point: [number, number], polygon: number[][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isLand(u: number, v: number) {
  const px = u * 512;
  const py = v * 256;
  for (const polygon of CONTINENTS) {
    if (isPointInPolygon([px, py], polygon)) {
      return true;
    }
  }
  return false;
}

// Plant model aligned perpendicularly to the sphere surface
function InteractivePlant({ position, scale, xp, color }: { position: [number, number, number]; scale: number; xp: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (groupRef.current) {
      const pos = new THREE.Vector3(...position);
      const target = pos.clone().normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), target);
      groupRef.current.setRotationFromQuaternion(quaternion);
    }
  }, [position]);

  const isArid = xp < 100;

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {isArid ? (
        // Cactus / Desert Shrub
        <>
          {/* Main Stem */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 5]} />
            <meshStandardMaterial color="#4d7c0f" flatShading />
          </mesh>
          {/* Left Arm */}
          <mesh position={[-0.15, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.05, 0.35, 5]} />
            <meshStandardMaterial color="#4d7c0f" flatShading />
          </mesh>
          {/* Right Arm */}
          <mesh position={[0.15, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.05, 0.35, 5]} />
            <meshStandardMaterial color="#4d7c0f" flatShading />
          </mesh>
        </>
      ) : (
        // Reforested Tree
        <>
          {/* Trunk */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 0.6, 5]} />
            <meshStandardMaterial color="#78350f" flatShading />
          </mesh>
          {/* Leaf Canopy */}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.32, 5, 5]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
}

// Spawns plants only on landmasses
function PlanetAssets({ completedAchievementsCount, xp }: { completedAchievementsCount: number; xp: number }) {
  const assetsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (assetsRef.current) {
      assetsRef.current.rotation.y += 0.002;
    }
  });

  // Calculate target plants based on user quests
  const plantCount = Math.min(40, completedAchievementsCount * 5 + 3);

  // Generate plant coordinates once
  const plants = useMemo(() => {
    const list = [];
    let attempts = 0;
    
    while (list.length < plantCount && attempts < 1000) {
      attempts++;
      const u = Math.random();
      const v = Math.random();

      // Only spawn on non-polar land areas
      if (v > 0.22 && v < 0.78) {
        if (isLand(u, v)) {
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 1.99; // slightly embedded into the sphere

          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);

          // Alternating colors
          const plantColor = list.length % 3 === 0 
            ? '#047857' // Pine green
            : list.length % 3 === 1 
            ? '#10b981' // Emerald
            : '#15803d'; // Forest green

          list.push({
            position: [x, y, z] as [number, number, number],
            scale: 0.07 + Math.random() * 0.05,
            color: plantColor
          });
        }
      }
    }
    return list;
  }, [plantCount, xp]);

  return (
    <group ref={assetsRef}>
      {plants.map((p, idx) => (
        <InteractivePlant 
          key={idx} 
          position={p.position} 
          scale={p.scale} 
          xp={xp} 
          color={p.color} 
        />
      ))}
    </group>
  );
}

// Orbiting clouds
function CloudLayer() {
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0012;
      cloudsRef.current.rotation.x += 0.0004;
    }
  });

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 256);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      
      // Draw procedural cloud bands and swirls
      for (let i = 0; i < 20; i++) {
        const cx = Math.random() * 512;
        const cy = 60 + Math.random() * 136;
        const rx = 30 + Math.random() * 50;
        const ry = 10 + Math.random() * 20;

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft secondary blobs
        ctx.beginPath();
        ctx.arc(cx + rx * 0.3, cy - ry * 0.2, rx * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[2.06, 24, 24]} />
      <meshStandardMaterial 
        alphaMap={cloudTexture} 
        transparent 
        color="#ffffff" 
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Atmospheric halo envelope
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.03, 24, 24]} />
      <meshBasicMaterial 
        color="#0ea5e9" 
        transparent 
        opacity={0.16} 
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Interactive cloud layer or orbiting rings
function OrbitingRing({ completedAchievementsCount }: { completedAchievementsCount: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      ringRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  // Only render ring if user has completed quests
  if (completedAchievementsCount === 0) return null;

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[2.45, 0.02, 8, 48]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} transparent opacity={0.5} />
    </mesh>
  );
}

// Main planet with procedural Earth continent texture
function BasePlanet({ xp }: { xp: number }) {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.0007;
    }
  });

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Ocean: deep blue with soft lighting gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, '#020617'); // Dark slate polar water
    oceanGrad.addColorStop(0.5, '#1e3a8a'); // Bright royal blue ocean
    oceanGrad.addColorStop(1, '#020617');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Dynamic land coloring based on XP state
    let landColor = '#78350f'; // Arid/Dry grey-brown base
    let shelfColor = 'rgba(6, 182, 212, 0.35)'; // Turquoise reef shelf

    if (xp >= 1000) {
      landColor = '#10b981'; // Lush deep emerald
    } else if (xp >= 500) {
      landColor = '#059669'; // Forest green
    } else if (xp >= 250) {
      landColor = '#047857'; // Sage green
    } else if (xp >= 100) {
      landColor = '#84cc16'; // Mint green / Germination
    }

    // 1. Draw Continental Shelf Reefs (cyan glow border)
    ctx.strokeStyle = shelfColor;
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    CONTINENTS.forEach(polygon => {
      ctx.beginPath();
      polygon.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();
      ctx.stroke();
    });

    // 2. Draw Land masses
    ctx.fillStyle = landColor;
    CONTINENTS.forEach(polygon => {
      ctx.beginPath();
      polygon.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();
      ctx.fill();
    });

    // 3. Polar Ice Caps
    // North Cap
    const northCap = ctx.createRadialGradient(256, 0, 0, 256, 0, 48);
    northCap.addColorStop(0, '#f8fafc');
    northCap.addColorStop(0.75, '#f1f5f9');
    northCap.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = northCap;
    ctx.fillRect(0, 0, 512, 50);

    // South Cap (Antarctica)
    const southCap = ctx.createRadialGradient(256, 256, 0, 256, 256, 56);
    southCap.addColorStop(0, '#f8fafc');
    southCap.addColorStop(0.75, '#f1f5f9');
    southCap.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = southCap;
    ctx.fillRect(0, 204, 512, 52);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [xp]);

  return (
    <mesh ref={planetRef}>
      <sphereGeometry args={[2.0, 32, 32]} />
      <meshStandardMaterial 
        map={earthTexture} 
        roughness={0.45} 
        metalness={0.1}
      />
    </mesh>
  );
}

export default function ThreeDPlanet({ xp, completedAchievementsCount }: PlanetProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '260px' }}>
      <Canvas 
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} />
        <pointLight position={[-6, -6, -6]} intensity={0.4} />
        
        <BasePlanet xp={xp} />
        <Atmosphere />
        <CloudLayer />
        <PlanetAssets completedAchievementsCount={completedAchievementsCount} xp={xp} />
        <OrbitingRing completedAchievementsCount={completedAchievementsCount} />
        <Stars radius={100} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.3}
        />
      </Canvas>

      {/* Embedded visual feedback tag */}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 select-none pointer-events-none">
        {xp >= 1000 ? '🍀 Biosphere Fully Restored' : xp >= 500 ? '🌱 Flora Spreading' : xp >= 100 ? '🍂 Germination Phase' : '🏜️ Arid Baseline'}
      </div>
    </div>
  );
}
