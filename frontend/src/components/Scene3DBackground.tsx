import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = {
  violet: new THREE.Color('#8b5cf6'),
  cyan: new THREE.Color('#06b6d4'),
  amber: new THREE.Color('#f59e0b'),
  indigo: new THREE.Color('#6366f1'),
};

function FloatingParticles() {
  const count = 120;
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const c = [COLORS.violet, COLORS.cyan, COLORS.amber, COLORS.indigo][i % 4];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.05;
    ref.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GradientMesh() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 30, 32, 32);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / 15;
      const y = pos.getY(i) / 15;
      const t = (x * x + y * y) * 0.3;
      const v = COLORS.violet.clone().lerp(COLORS.cyan, t * 0.5);
      colors[i * 3] = v.r * 0.15;
      colors[i * 3 + 1] = v.g * 0.15;
      colors[i * 3 + 2] = v.b * 0.15;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.02;
  });

  return (
    <mesh ref={ref} position={[0, 0, -8]} rotation={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial vertexColors transparent opacity={0.4} depthWrite={false} />
    </mesh>
  );
}

function FloatingShapes() {
  const refs = useRef<THREE.Mesh[]>([]);
  const shapes = useMemo(() => {
    return [
      { color: COLORS.violet, pos: [3, 2, -3], scale: 0.4 },
      { color: COLORS.cyan, pos: [-4, -1, -4], scale: 0.3 },
      { color: COLORS.amber, pos: [2, -3, -5], scale: 0.25 },
      { color: COLORS.indigo, pos: [-2, 2, -2], scale: 0.35 },
    ];
  }, []);

  useFrame((_, delta) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.x += delta * (0.2 + i * 0.1);
      mesh.rotation.y += delta * (0.15 + i * 0.08);
    });
  });

  return (
    <>
      {shapes.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          position={s.pos as [number, number, number]}
          scale={s.scale}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.12} wireframe />
        </mesh>
      ))}
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <FloatingParticles />
      <GradientMesh />
      <FloatingShapes />
    </>
  );
}

export function Scene3DBackground() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!mounted || reducedMotion) return null;

  return (
    <div
      className="politifolio-3d-bg"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 1.5}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => { gl.setClearColor('transparent'); }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
