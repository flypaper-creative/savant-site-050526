import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Center,
  Environment,
  Html,
  MeshReflectorMaterial,
  Text,
  useGLTF,
  useProgress
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

const MIN_SPEED_SECONDS = 15;
const LOGO_PATH = '/assets/logo7/logo7.glb';

type LogoProps = {
  progress: number;
  isEntering: boolean;
  logoRef: React.RefObject<THREE.Group>;
};

function SavantFallbackGlyph() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <octahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial color="#f7fbff" metalness={0.96} roughness={0.16} emissive="#7dd3ff" emissiveIntensity={0.16} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.9, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.55, 1.55, 0.22]} />
        <meshStandardMaterial color="#eaf7ff" metalness={1} roughness={0.12} emissive="#0ea5e9" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.22, 0.02]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[1.48, 1.53, 4]} />
        <meshBasicMaterial color="#9be8ff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Logo({ progress, isEntering, logoRef }: LogoProps) {
  const [error, setError] = useState(false);
  const gltf = useGLTF(LOGO_PATH, undefined, (err) => {
    console.warn('Logo GLB not found, using fallback. Error:', err);
    setError(true);
  }) as any;

  const { viewport } = useThree();

  useEffect(() => {
    if (!logoRef.current || (!gltf && !error)) return;

    const box = new THREE.Box3().setFromObject(logoRef.current);
    const size = new THREE.Vector3();
    box.getSize(size);

    const targetWidth = Math.max(3.2, viewport.width * 0.58);
    const scale = targetWidth / Math.max(size.x, size.y, 1);
    logoRef.current.scale.setScalar(scale);
  }, [viewport, gltf, logoRef, error]);

  useFrame((state) => {
    if (!logoRef.current) return;

    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 1.6) * 0.035 + Math.sin(t * 0.47) * 0.015;

    if (!isEntering) {
      logoRef.current.rotation.x = Math.sin(t * 0.28) * 0.045;
      logoRef.current.rotation.y += 0.009 + progress * 0.000015;
      logoRef.current.rotation.z = Math.sin(t * 0.22) * 0.025;
      logoRef.current.position.y = pulse;
    } else {
      logoRef.current.rotation.y += 0.004;
      logoRef.current.rotation.x = THREE.MathUtils.lerp(logoRef.current.rotation.x, 0, 0.08);
      logoRef.current.rotation.z = THREE.MathUtils.lerp(logoRef.current.rotation.z, 0, 0.08);
    }
  });

  return (
    <Center>
      <group ref={logoRef} dispose={null}>
        {!error && gltf ? (
          Object.keys(gltf.nodes).map((key) => {
            const node = gltf.nodes[key];
            if (!node.isMesh) return null;

            return (
              <mesh key={key} geometry={node.geometry} castShadow receiveShadow>
                <meshStandardMaterial
                  color="#f8fbff"
                  metalness={1}
                  roughness={0.075}
                  emissive="#38bdf8"
                  emissiveIntensity={0.16 + progress / 650}
                  envMapIntensity={2.4}
                />
              </mesh>
            );
          })
        ) : (
          <SavantFallbackGlyph />
        )}
      </group>
    </Center>
  );
}

function ReactorProgress({ progress, visible }: { progress: number; visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const textRef = useRef<any>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.z = -t * 0.06;
      groupRef.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.012);
    }

    if (textRef.current) {
      textRef.current.text = `${Math.floor(progress)}%`;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, -3.05, 0]}>
      <Text
        ref={textRef}
        fontSize={0.34}
        color="#f8fbff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        0%
      </Text>

      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.18]}>
        <mesh>
          <ringGeometry args={[2.58, 2.61, 160]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <ringGeometry args={[2.58, 2.64, 160, 1, 0, (progress / 100) * Math.PI * 2]} />
          <meshBasicMaterial color="#8be9ff" transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <ringGeometry args={[2.9, 2.92, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.16} />
        </mesh>
      </group>
    </group>
  );
}

function AtmosphericShardField({ isEntering }: { isEntering: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  const shards = useMemo(
    () =>
      Array.from({ length: 84 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 14,
          -8 - Math.random() * 26
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        scale: 0.025 + Math.random() * 0.085
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.018;
    groupRef.current.position.z = isEntering ? THREE.MathUtils.lerp(groupRef.current.position.z, -6, 0.02) : 0;
  });

  return (
    <group ref={groupRef}>
      {shards.map((shard) => (
        <mesh key={shard.id} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#dff7ff" emissive="#38bdf8" emissiveIntensity={0.35} metalness={0.8} roughness={0.22} transparent opacity={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function ForgeChamber({ isEntering }: { isEntering: boolean }) {
  const chamberRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!chamberRef.current) return;

    const t = state.clock.getElapsedTime();
    chamberRef.current.position.y = isEntering
      ? THREE.MathUtils.lerp(chamberRef.current.position.y, 1.2, 0.018)
      : Math.sin(t * 0.18) * 0.08;
  });

  return (
    <group ref={chamberRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.2, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[600, 160]}
          resolution={1536}
          mixBlur={1.25}
          mixStrength={11}
          roughness={0.72}
          depthScale={1.2}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.7}
          color="#020304"
          metalness={0.94}
          mirror={0.08}
        />
      </mesh>

      <mesh position={[0, 0, -18]}>
        <planeGeometry args={[46, 28]} />
        <meshStandardMaterial color="#030507" emissive="#082235" emissiveIntensity={0.38} roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[-11, 1, -13]} rotation={[0, 0.16, 0]}>
        <boxGeometry args={[2.4, 20, 2.2]} />
        <meshStandardMaterial color="#050607" roughness={0.18} metalness={1} emissive="#03131d" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[11, 1, -13]} rotation={[0, -0.16, 0]}>
        <boxGeometry args={[2.4, 20, 2.2]} />
        <meshStandardMaterial color="#050607" roughness={0.18} metalness={1} emissive="#03131d" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, -4.78, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.6, 3.72, 128]} />
        <meshBasicMaterial color="#8be9ff" transparent opacity={0.34} />
      </mesh>

      <AtmosphericShardField isEntering={isEntering} />

      <spotLight position={[0, 15, 8]} angle={0.28} penumbra={0.9} intensity={24} castShadow color="#ffffff" shadow-bias={-0.0001} />
      <spotLight position={[-12, 8, 6]} angle={0.42} penumbra={1} intensity={8} color="#38bdf8" />
      <spotLight position={[12, 5, 2]} angle={0.5} penumbra={1} intensity={5} color="#b9f2ff" />
      <pointLight position={[0, 3.5, 2.5]} intensity={3.6} color="#8be9ff" />
      <pointLight position={[0, -2, -5]} intensity={2.2} color="#0ea5e9" />

      <Environment preset="night" />
    </group>
  );
}

function SceneManager({ onComplete }: { onComplete: () => void }) {
  const { progress: actualLoadProgress } = useProgress();
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const startTime = useRef(Date.now());

  const { camera, viewport } = useThree();
  const logoGroupRef = useRef<THREE.Group>(null!);
  const logoMeshRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const timeProgress = (elapsed / MIN_SPEED_SECONDS) * 100;
      const newProgress = Math.min(100, Math.min(actualLoadProgress, timeProgress));

      setDisplayedProgress(newProgress);

      if (newProgress >= 100 && actualLoadProgress >= 100) {
        setIsLoaded(true);
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [actualLoadProgress]);

  useFrame(() => {
    if (!camera || isEntering) return;

    const elapsed = (Date.now() - startTime.current) / 1000;

    if (elapsed < 4) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 18, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.55, 0.025);
    } else if (elapsed < 12.5) {
      camera.position.z = 14.5 + Math.sin(elapsed * 0.32) * 0.9;
      camera.position.x = Math.sin(elapsed * 0.21) * 0.55;
      camera.position.y = 0.42 + Math.sin(elapsed * 0.17) * 0.22;
    } else {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9.8, 0.035);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.18, 0.04);
    }

    camera.lookAt(0, 0, 0);
  });

  const handleInitialize = () => {
    if (!logoGroupRef.current) return;

    setIsEntering(true);

    const targetX = -viewport.width / 2 + 1.05;
    const targetY = viewport.height / 2 - 1.05;
    const targetZ = -5.2;

    gsap.to(camera.position, {
      x: 0,
      y: 0.45,
      z: 8.8,
      duration: 1.85,
      ease: 'power4.inOut'
    });

    gsap.to(logoGroupRef.current.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 2.1,
      ease: 'power4.inOut',
      onComplete
    });

    gsap.to(logoGroupRef.current.scale, {
      x: 0.15,
      y: 0.15,
      z: 0.15,
      duration: 2.1,
      ease: 'power4.inOut'
    });
  };

  return (
    <>
      <color attach="background" args={['#030405']} />
      <fog attach="fog" args={['#030405', 10, 36]} />

      <ForgeChamber isEntering={isEntering} />

      <group ref={logoGroupRef}>
        <Logo progress={displayedProgress} isEntering={isEntering} logoRef={logoMeshRef} />
        <ReactorProgress progress={displayedProgress} visible={!isEntering} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.55} mipmapBlur intensity={1.25} radius={0.55} />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.12} darkness={1.05} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0008, 0.0008)} />
        <DepthOfField focusDistance={0.018} focalLength={0.22} bokehScale={1.7} />
      </EffectComposer>

      {isLoaded && !isEntering && (
        <Html fullscreen>
          <div className="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center">
            <button
              onClick={handleInitialize}
              className="initialize-button cinematic-text pointer-events-auto px-12 py-5 text-white text-xs tracking-[0.5em] transition-all hover:scale-105 active:scale-95"
            >
              Initialize Savant
            </button>
          </div>
        </Html>
      )}

      {!isLoaded && (
        <Html fullscreen>
          <div className="cinematic-text pointer-events-none fixed left-1/2 top-12 -translate-x-1/2 animate-pulse text-[10px] tracking-[1em] text-white/30">
            Constructing Logo Reactor
          </div>
        </Html>
      )}
    </>
  );
}

export default function SavantPreloader({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 z-50 h-full w-full">
      <Canvas shadows gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0.45, 18]} fov={38} near={0.1} far={90} />
        <Suspense fallback={null}>
          <SceneManager onComplete={onComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(LOGO_PATH);
