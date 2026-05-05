import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  useProgress, 
  Environment, 
  PerspectiveCamera, 
  MeshReflectorMaterial,
  Text,
  Center,
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import gsap from 'gsap';

// Configuration
const MIN_SPEED_SECONDS = 15;
const LOGO_PATH = '/assets/logo7/logo7.glb';

function Logo({ progress, isEntering, logoRef }: { progress: number; isEntering: boolean; logoRef: React.RefObject<THREE.Group> }) {
  const [error, setError] = useState(false);
  const gltf = useGLTF(LOGO_PATH, undefined, (err) => {
    console.warn("Logo GLB not found, using fallback. Error:", err);
    setError(true);
  }) as any;
  const { viewport } = useThree();

  // Normalize and scale logo
  useEffect(() => {
    if (logoRef.current && (gltf || error)) {
      const box = new THREE.Box3().setFromObject(logoRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      const targetWidth = viewport.width * 0.8; 
      const scale = targetWidth / (size.x || 1);
      logoRef.current.scale.setScalar(scale);
    }
  }, [viewport, gltf, logoRef, error]);

  useFrame((state) => {
    if (logoRef.current) {
      if (!isEntering) {
        logoRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
        logoRef.current.rotation.y += 0.005;
      } else {
        logoRef.current.rotation.y += 0.002;
      }
    }
  });

  return (
    <Center top>
      <group ref={logoRef} dispose={null}>
        {(!error && gltf) ? (
          Object.keys(gltf.nodes).map((key) => {
            const node = gltf.nodes[key];
            if (node.isMesh) {
              return (
                <mesh
                  key={key}
                  geometry={node.geometry}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial 
                    color="#ffffff" 
                    metalness={1} 
                    roughness={0.1} 
                    emissive="#0070f3" 
                    emissiveIntensity={0.2}
                  />
                </mesh>
              );
            }
            return null;
          })
        ) : (
          /* Fallback Logo: A Sleek Geometric Primitive */
          <mesh castShadow receiveShadow>
            <torusKnotGeometry args={[1, 0.4, 128, 32]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={1} 
              roughness={0.1} 
              emissive="#0070f3" 
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </Center>
  );
}

function ProgressIndicator({ progress, visible }: { progress: number; visible: boolean }) {
  const textRef = useRef<any>(null!);
  
  useFrame(() => {
    if (textRef.current) {
      textRef.current.text = `${Math.floor(progress)}%`;
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, -2.5, 0]}>
      <Text
        ref={textRef}
        fontSize={0.4}
        color="white"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
        anchorX="center"
        anchorY="middle"
      >
        0%
      </Text>
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <mesh>
          <ringGeometry args={[2.8, 2.85, 64]} />
          <meshBasicMaterial color="#111" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <ringGeometry args={[2.8, 2.85, 64, 1, 0, (progress / 100) * Math.PI * 2]} />
          <meshBasicMaterial color="#0070f3" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function ForgeChamber({ isEntering }: { isEntering: boolean }) {
  const chamberRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (isEntering && chamberRef.current) {
      chamberRef.current.position.y += 0.005;
      chamberRef.current.scale.multiplyScalar(1.0005);
    }
  });

  return (
    <group ref={chamberRef}>
      {/* Brutalist Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={10}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#030303"
          metalness={0.9}
          mirror={0}
        />
      </mesh>

      {/* Atmospheric Particles/Dust */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group>
          {Array.from({ length: 50 }).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.1} />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Monolithic Geometry */}
      <mesh position={[-12, 0, -15]}>
        <boxGeometry args={[6, 30, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={1} />
      </mesh>
      <mesh position={[12, 0, -15]}>
        <boxGeometry args={[6, 30, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={1} />
      </mesh>
      
      {/* Luminous Circuit Lines on Walls (Simplified) */}
      <mesh position={[0, 0, -20]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#000" emissive="#0070f3" emissiveIntensity={0.05} />
      </mesh>

      {/* Hero Lights */}
      <spotLight position={[15, 25, 15]} angle={0.2} penumbra={1} intensity={10} castShadow color="#ffffff" shadow-bias={-0.0001} />
      <spotLight position={[-15, 25, 15]} angle={0.2} penumbra={1} intensity={5} castShadow color="#0070f3" shadow-bias={-0.0001} />
      
      <pointLight position={[0, 10, -5]} intensity={2} color="#fff" />
      
      <Environment preset="city" />
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
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const logoGroupRef = useRef<THREE.Group>(null!);
  const logoMeshRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const timeProgress = (elapsed / MIN_SPEED_SECONDS) * 100;
      const newProgress = Math.min(actualLoadProgress, timeProgress);
      
      setDisplayedProgress(newProgress);

      if (newProgress >= 100 && actualLoadProgress >= 100) {
        setIsLoaded(true);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [actualLoadProgress]);

  useFrame((state) => {
    if (!camera) return;

    if (!isEntering) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (elapsed < 3) {
        camera.position.z = 18 - (elapsed / 3) * 3;
      } else if (elapsed < 13) {
        camera.position.z = 15 - Math.sin((elapsed - 3) * 0.1) * 2;
        camera.position.x = Math.sin(elapsed * 0.2) * 0.5;
        camera.lookAt(0, 0, 0);
      } else {
        // Hero frame
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10, 0.05);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
      }
    }
  });

  const handleInitialize = () => {
    setIsEntering(true);
    
    // Calculate top-left target in 3D world space
    // We want it to be small like a UI logo
    const targetX = -viewport.width / 2 + 1.2;
    const targetY = viewport.height / 2 - 1.2;
    const targetZ = -5; // Move back in depth to shrink naturally

    gsap.to(logoGroupRef.current.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 2,
      ease: 'power4.inOut',
      onStart: () => {
        // Fade out environment elements if needed or camera moves
      },
      onComplete: () => {
        onComplete();
      }
    });

    gsap.to(logoGroupRef.current.scale, {
      x: 0.15,
      y: 0.15,
      z: 0.15,
      duration: 2,
      ease: 'power4.inOut'
    });
  };

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ForgeChamber isEntering={isEntering} />
      
      <group ref={logoGroupRef}>
        <Logo progress={displayedProgress} isEntering={isEntering} logoRef={logoMeshRef} />
        <ProgressIndicator progress={displayedProgress} visible={!isEntering} />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.001, 0.001)} />
        <DepthOfField focusDistance={0.01} focalLength={0.2} bokehScale={2} />
      </EffectComposer>

      {/* Initialize UI */}
      {isLoaded && !isEntering && (
        <HtmlPortal>
          <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none">
            <button
              onClick={handleInitialize}
              className="initialize-button cinematic-text pointer-events-auto px-12 py-5 text-white text-xs tracking-[0.5em] transition-all hover:scale-105 active:scale-95"
            >
              Initialize Savant
            </button>
          </div>
        </HtmlPortal>
      )}

      {!isLoaded && (
        <HtmlPortal>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 cinematic-text text-[10px] text-white/30 tracking-[1em] animate-pulse">
            Establishing Core Neural Link
          </div>
        </HtmlPortal>
      )}
    </>
  );
}

// Simple portal to render HTML outside canvas easily if needed, 
// but we'll just handle it in the main component for simplicity
const HtmlPortal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {children}
    </div>
  );
};

export default function SavantPreloader({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 z-50 w-full h-full">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <SceneManager onComplete={onComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(LOGO_PATH);

// Preload the logo
useGLTF.preload(LOGO_PATH);
