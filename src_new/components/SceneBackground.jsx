import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

// ── Particles ─────────────────────────────────────────────────────────────────
function Particles({ count = 300, spread = 20 }) {
  const points = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * (spread * 0.5);
    }
    return pos;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.02;
    points.current.rotation.x = Math.sin(clock.elapsedTime * 0.012) * 0.06;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#3b82f6" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── Orb ───────────────────────────────────────────────────────────────────────
function Orb({ position, color, speed = 1, distort = 0.4, scale = 1 }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * speed * 0.25) * 0.25;
    mesh.current.rotation.y = clock.elapsedTime * speed * 0.15;
  });
  return (
    <Float speed={speed * 0.7} rotationIntensity={0.2} floatIntensity={0.9}>
      <Sphere ref={mesh} args={[1, 32, 32]} position={position} scale={scale}>
        <MeshDistortMaterial color={color} attach="material" distort={distort * 0.8}
          speed={1.2} roughness={0.15} metalness={0.7} transparent opacity={0.4} />
      </Sphere>
    </Float>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function GridPlane() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.position.z = ((clock.elapsedTime * 0.3) % 1) - 0.5;
  });
  return <gridHelper ref={mesh} args={[50, 40, '#1e3a5f', '#1e293b']} position={[0, -4, 0]} />;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ variant }) {
  const isHero  = variant === 'hero';
  const isLight = variant === 'light';

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]}  intensity={0.7} color="#3b82f6" />
      <pointLight position={[-10, -8, -5]} intensity={0.3} color="#8b5cf6" />

      <Stars radius={isHero ? 55 : 70} depth={25} count={isHero ? 400 : 200}
        factor={3} saturation={0} fade speed={0.3} />

      <Particles count={isHero ? 280 : 150} spread={isHero ? 20 : 25} />

      {isHero && (
        <>
          <GridPlane />
          <Orb position={[-5, 2, -4]}  color="#3b82f6" speed={0.6} distort={0.45} scale={1.7} />
          <Orb position={[5, -1, -5]}  color="#8b5cf6" speed={0.9} distort={0.28} scale={1.3} />
          <Orb position={[0, 3.5, -6]} color="#10b981" speed={0.5} distort={0.5}  scale={0.9} />
          <Orb position={[-6, -2, -7]} color="#6366f1" speed={0.8} distort={0.35} scale={0.7} />
        </>
      )}

      {isLight && (
        <>
          <Orb position={[-4, 1.5, -5]} color="#3b82f6" speed={0.5} distort={0.35} scale={1.2} />
          <Orb position={[4, -1, -6]}   color="#8b5cf6" speed={0.7} distort={0.25} scale={0.9} />
        </>
      )}
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export default function SceneBackground({ variant = 'hero' }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Only render the canvas when the section is in the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' }   // start loading 200px before entering view
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
      {visible && (
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{
            alpha: true,
            antialias: isHero,          // antialias only on hero
            powerPreference: 'low-power',
          }}
          dpr={isHero ? [1, 1.2] : 1}  // cap DPR — biggest single win
          frameloop={visible ? 'always' : 'never'}
        >
          <Suspense fallback={null}>
            <Scene variant={variant} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
