import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { 
  useGLTF, 
  Environment,
  Float,
  Text,
  useTexture,
  Stars,
  Sparkles,
  Html,
  OrbitControls,
  PivotControls,
  Lightformer,
  Trail
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  EffectComposer, 
  Bloom, 
  Scanline,
  Vignette,
  Noise as NoiseEffect,
  Glitch,
  ChromaticAberration,
  DotScreen,
  SMAA,
  GodRays,
  DepthOfField
} from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import { gsap } from 'gsap';

// Main Scene Components

import { LayerMaterial, Depth, Noise as LaminaNoise, Color as LaminaColor } from 'lamina';

// Removed legacy background components to focus purely on the Hero object.

function SavantNeonStreaks() {
  const streakRefL = useRef<THREE.Group>(null);
  const streakRefR = useRef<THREE.Group>(null);
  const streakRefT = useRef<THREE.Group>(null);
  const streakRefB = useRef<THREE.Group>(null);

  const materialL = useRef<THREE.MeshStandardMaterial>(null);
  const materialR = useRef<THREE.MeshStandardMaterial>(null);
  const materialT = useRef<THREE.MeshStandardMaterial>(null);
  const materialB = useRef<THREE.MeshStandardMaterial>(null);

  // Logo Path Definition (Refined 3D Trefoil Knot with Organic Jitter)
  const getLogoPoint = (t: number, pulse = 1) => {
    const scale = 230 * pulse;
    // Base Trefoil
    const x = (Math.sin(t) + 2 * Math.sin(2 * t)) * (scale * 0.45);
    const y = -(Math.cos(t) - 2 * Math.cos(2 * t)) * (scale * 0.45);
    const z = Math.sin(3 * t) * (scale * 0.3) + 180;

    // Organic Jitter (Hyperrealistic instability)
    const jitter = Math.sin(t * 30) * 1.5;
    return new THREE.Vector3(x + jitter, y + jitter, z + jitter);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.7;
    const pulse = 1 + Math.sin(t * 12) * 0.04;
    const blink = (Math.sin(t * 22) > 0.88) ? 0.05 : 2.2;
    
    const updateStreak = (ref: React.RefObject<THREE.Group>, mat: React.RefObject<THREE.MeshStandardMaterial>, offset: number, intensity: number) => {
      if (ref.current) {
        const pos = getLogoPoint(t + offset, pulse);
        ref.current.position.lerp(pos, 0.18);
        if (mat.current) mat.current.emissiveIntensity = intensity * blink;
      }
    };

    updateStreak(streakRefL, materialL, 0, 1200);
    updateStreak(streakRefR, materialR, Math.PI, 1200);
    updateStreak(streakRefT, materialT, Math.PI / 2, 1000);
    updateStreak(streakRefB, materialB, -Math.PI / 2, 1000);
  });

  return (
    <group>
      {[streakRefL, streakRefR, streakRefT, streakRefB].map((ref, i) => (
        <group key={i} ref={ref}>
          {/* Internal Plasma Glow */}
          <Trail 
            width={i < 2 ? 15 : 8} 
            length={45} 
            color="#ff00a2" 
            attenuation={(t) => Math.pow(t, 2)}
          >
            <mesh>
              <sphereGeometry args={[i < 2 ? 3.5 : 1.8, 16, 16]} />
              <meshStandardMaterial 
                ref={[materialL, materialR, materialT, materialB][i]} 
                color="#ff00a2" 
                emissive="#ff00a2" 
                emissiveIntensity={1000} 
                toneMapped={false}
              />
            </mesh>
          </Trail>
          
          {/* Secondary Volumetric Halo */}
          <Trail 
            width={25} 
            length={30} 
            color="#ff4fb9" 
            attenuation={(t) => Math.pow(t, 3.5)}
          >
            <mesh>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#ff00a2" transparent opacity={0.15} />
            </mesh>
          </Trail>

          <pointLight intensity={1500} distance={250} color="#ff00a2" decay={1.8} />
          
          {/* Energy Embers / Scattering Sparks */}
          <Sparkles 
            count={20} 
            scale={10} 
            size={2} 
            speed={2} 
            color="#ff00a2" 
            opacity={0.8}
            noise={1}
          />
        </group>
      ))}
    </group>
  );
}

function SpaceshipControls({ isCinematicDone, isMapMode, moveSpeed = 1 }: { isCinematicDone: boolean, isMapMode: boolean, moveSpeed?: number }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // High-frequency hull vibration state
  const vibrationRef = useRef(0);
  const targetVibrationRef = useRef(0);
  
  // Ship "Breathing" movement
  const breatheRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const mouseRef = useRef({ x: 0, y: 0, down: false });
  useEffect(() => {
    const onMouseDown = () => { mouseRef.current.down = true; };
    const onMouseUp = () => { mouseRef.current.down = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (mouseRef.current.down) {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    timeRef.current += delta;
    
    // 1. Organic Breathing (Subtle idle bobbing)
    // Low frequency, multi-layered sine waves for a sophisticated "float"
    breatheRef.current = Math.sin(t * 0.4) * 0.05 + Math.cos(t * 0.73) * 0.02;
    camera.position.y += breatheRef.current * delta;
    camera.position.x += Math.sin(t * 0.31) * 0.03 * delta;

    // 2. Enhanced Camera Shake (Turbulence)
    // Structured vibration that scales with progress (if provided)
    const shakeAmount = !isCinematicDone 
      ? 0.5 + Math.sin(timeRef.current * 0.5) * 0.3 // Higher turbulence during approach
      : 0.1; // Settled vibe after approach
    
    const vibFreq = 80;
    const vibBase = (Math.sin(t * vibFreq) * 0.5 + Math.sin(t * vibFreq * 0.6) * 0.3 + Math.sin(t * vibFreq * 1.7) * 0.2);
    
    // Apply micro-shakes for "turbulence"
    camera.position.x += vibBase * shakeAmount * 0.02;
    camera.position.y += vibBase * shakeAmount * 0.015;
    camera.rotation.z += vibBase * shakeAmount * 0.0005;

    if (!isCinematicDone) return;
    const acceleration = 50;
    const friction = 0.95;
    const turnSpeed = 1.2;

    const currentKeys = { ...keys.current };

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    if (currentKeys['w']) velocity.current.add(forward.multiplyScalar(acceleration * delta));
    if (currentKeys['s']) velocity.current.add(forward.multiplyScalar(-acceleration * delta));
    if (currentKeys['a']) velocity.current.add(right.multiplyScalar(-acceleration * delta));
    if (currentKeys['d']) velocity.current.add(right.multiplyScalar(acceleration * delta));
    if (currentKeys['e']) velocity.current.add(up.multiplyScalar(acceleration * delta));
    if (currentKeys['q']) velocity.current.add(up.multiplyScalar(-acceleration * delta));

    // Slow attraction to origin
    const driftToOrigin = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize().multiplyScalar(2 * delta);
    velocity.current.add(driftToOrigin);

    velocity.current.multiplyScalar(friction);
    camera.position.add(velocity.current);

    // Robust focus on the hero object
    camera.lookAt(0, 0, 0);
  });

  return null;
}

const LOGO_PATH = '/assets/logo7/logo7.glb';

export type OverlayMode = 'NONE' | 'NEURAL_LATTICE' | 'GHOST_SIGNAL' | 'XENO_MIST' | 'VOID_RESONANCE' | 'VECTOR_COLLAPSE' | 'MAP_VIEW' | 'XRAY_INSPECTOR';


function CockpitHUD({ lensType }: { lensType: string }) {
  const { camera, viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const leftShutterRef = useRef<THREE.Mesh>(null);
  const rightShutterRef = useRef<THREE.Mesh>(null);
  
  // Responsive Scale factor to keep cockpit edges visible/fitting
  const scale = useMemo(() => {
    const aspect = viewport.aspect;
    // Base scale on aspect ratio - wider aspect needs more horizontal scaling
    return Math.min(1, aspect * 0.8);
  }, [viewport.aspect]);

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0).applyQuaternion(camera.quaternion).add(camera.position);
        groupRef.current.quaternion.copy(camera.quaternion);
        
        // Apply responsive scale
        groupRef.current.scale.setScalar(scale);
    }
  });

  useEffect(() => {
    if (leftShutterRef.current && rightShutterRef.current) {
        const tl = gsap.timeline();
        tl.to([leftShutterRef.current.position, rightShutterRef.current.position], {
            x: (i) => i === 0 ? -2 : 2,
            duration: 0.2,
            ease: "power4.in"
        });
        tl.to([leftShutterRef.current.position, rightShutterRef.current.position], {
            x: (i) => i === 0 ? -15 : 15,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.1
        });
    }
  }, [lensType]);

  const cockpitMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#010101", 
    metalness: 1, 
    roughness: 0.1,
    envMapIntensity: 1.0
  }), []);

  const detailMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#080808",
    metalness: 1,
    roughness: 0.02
  }), []);

  return (
    <group ref={groupRef}>
      {/* Cupola Structure Inspired by ISS Reference */}
      <group position={[0, 0, -3.8]}>
        {/* Secondary Inner Ring for depth */}
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[3.25, 0.05, 12, 64]} />
          <primitive object={detailMat} attach="material" />
        </mesh>
        
        {/* Main central circular ring */}
        <mesh>
          <torusGeometry args={[3.2, 0.2, 16, 128]} />
          <primitive object={cockpitMat} attach="material" />
        </mesh>

        {/* 6 Peripheral Windows with triple framing */}
        {[...Array(6)].map((_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
             {/* Outer Frame Segment */}
             <mesh position={[0, 5, 0]}>
                <boxGeometry args={[4.8, 0.5, 1.4]} />
                <primitive object={cockpitMat} attach="material" />
             </mesh>
             
             {/* Vertical struts connecting segments */}
             <mesh position={[2.4, 3.5, 0]} rotation={[0, 0, -0.6]}>
                <boxGeometry args={[0.5, 4.2, 1.4]} />
                <primitive object={cockpitMat} attach="material" />
             </mesh>

             {/* Reinforcement Ribs */}
             <mesh position={[0, 3.8, 0.2]}>
                <boxGeometry args={[0.1, 1.5, 0.8]} />
                <meshStandardMaterial color="#111" metalness={1} />
             </mesh>
             
             {/* Mechanical details like conduits/wires */}
             <mesh position={[2.1, 3, 0.5]} rotation={[0, 0, -0.6]}>
                <cylinderGeometry args={[0.03, 0.03, 3.8, 8]} />
                <meshStandardMaterial color="#222" metalness={0.5} />
             </mesh>

             {/* Realistic Bolts - denser pattern */}
             {[...Array(5)].map((_, j) => (
               <mesh key={j} position={[2.24, 2.2 + j * 0.7, 0.6]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[0.045, 0.045, 0.25, 16]} />
                 <meshStandardMaterial color="#080808" metalness={1} roughness={0.1} />
               </mesh>
             ))}

             {/* Inner Trim Details */}
             <mesh position={[2.4, 3.5, 0.2]} rotation={[0, 0, -0.6]}>
                <boxGeometry args={[0.1, 4.1, 1.1]} />
                <meshStandardMaterial color="#050505" />
             </mesh>
          </group>
        ))}

        {/* Structural Cables / Tie-downs for high quality look */}
        {[...Array(12)].map((_, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI/6) * 3.4, Math.sin(i * Math.PI/6) * 3.4, 0.2]} rotation={[0, 0, i * Math.PI/6]}>
            <cylinderGeometry args={[0.015, 0.015, 0.8, 6]} />
            <meshStandardMaterial color="#000" metalness={1} />
          </mesh>
        ))}
      </group>

      {/* Heavy Mechanical Shutters for Lens Transitions */}
      <mesh ref={leftShutterRef} position={[-25, 0, -2]}>
        <boxGeometry args={[15, 15, 0.4]} />
        <meshStandardMaterial color="#010101" metalness={1} roughness={0.02} />
      </mesh>
      <mesh ref={rightShutterRef} position={[25, 0, -2]}>
        <boxGeometry args={[15, 15, 0.4]} />
        <meshStandardMaterial color="#010101" metalness={1} roughness={0.02} />
      </mesh>

      {/* Enhanced Internal Glows - localized to frame edges */}
      {[...Array(6)].map((_, i) => (
        <pointLight 
          key={i} 
          position={[Math.cos(i * Math.PI/3) * 4, Math.sin(i * Math.PI/3) * 4, -1]} 
          intensity={5} 
          color={i % 2 === 0 ? "#00f2ff" : "#ff007f"} 
          distance={8} 
        />
      ))}
      <pointLight position={[0, 0, -1]} intensity={2} color="#ffffff" distance={10} />
    </group>
  );
}

import { GlassflowLogoDisintegration } from './GlassflowLogo';

import { useGlassflow } from '../glassflow/GlassflowContext';

export function Scene({ onTimelineProgress, onComplete, activeMode = 'NONE' }: { 
    onTimelineProgress?: (p: number) => void, 
    onComplete: () => void,
    activeMode?: OverlayMode
}) {
  const { progress, graph } = useGlassflow();
  const { camera } = useThree();
  const [isCinematicDone, setIsCinematicDone] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(1.5);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const [moveSpeed, setMoveSpeed] = useState(1);

  // Tactical Map Positions
  const [positions, setPositions] = useState({
    logo: new THREE.Vector3(0, 0, 0),
    spotlight: new THREE.Vector3(0, 500, 1500),
    pointlight: new THREE.Vector3(0, 0, 200),
    solar: new THREE.Vector3(-2000, 2000, 2000),
  });

  const activeOverlayByPriority = 'NONE';
  const shakeIntensity = useRef(0);

  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (sunMesh) {
      // @ts-ignore
      sunMeshRef.current = sunMesh;
    }
  }, [sunMesh]);

  useEffect(() => {
    // Shardified Temporal Control - Linking to 'sh-cinematic-core'
    let frameId: number;
    const animate = () => {
      const cinShard = graph.shards['sh-cinematic-core'] as any;
      if (cinShard) {
        const p = cinShard.operation.progress;
        if (onTimelineProgress) onTimelineProgress(p);
        
        // Fractal Camera Path via Shard Logic
        const zoom = 25000 - (p * 24550);
        camera.position.set(0, 0, zoom);
        camera.lookAt(0, 0, 0);
        
        (camera as THREE.PerspectiveCamera).fov = 25 + (p * 35);
        camera.updateProjectionMatrix();

        if (p < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          setIsCinematicDone(true);
          onComplete();
        }
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [camera, onTimelineProgress, onComplete, graph]);

  // Bloom intensity handled by runtime resonance
  useEffect(() => {
    setBloomIntensity(progress * 20 + 2.0);
  }, [progress]);

  const bloomIntensityProxy = useRef({ val: 0.8 }).current;

  useFrame((state) => {
    if (shakeIntensity.current > 0.01) {
        const s = shakeIntensity.current;
        camera.position.x += (Math.random() - 0.5) * s;
        camera.position.y += (Math.random() - 0.5) * s;
        camera.rotation.z += (Math.random() - 0.5) * s * 0.01;
    }
  });

  const chromeOff = useMemo(() => new THREE.Vector2(0.04, 0.04), []);
  const glitchDelay = useMemo(() => new THREE.Vector2(0.1, 0.5), []);
  const glitchDur = useMemo(() => new THREE.Vector2(0.3, 0.6), []);
  const glitchStr = useMemo(() => new THREE.Vector2(0.8, 0.8), []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <Environment preset="night" />
      
      <ambientLight intensity={0.1} />
      <SavantNeonStreaks />
      
      {/* Centered Pink Core Light */}
      <pointLight position={[0, 0, 0]} intensity={20000} color="#ff00a2" distance={800} decay={2.0} />
      
      <group 
        position={positions.logo} 
        scale={[250, 250, 250]}
        onUpdate={(self) => {
          // Manual Floating Effect (No Jitter)
          const t = performance.now() * 0.001;
          self.position.y = Math.sin(t * 0.5) * 5;
          self.rotation.z = Math.sin(t * 0.3) * 0.05;
        }}
      >
        <Suspense fallback={null}>
          <GlassflowLogoDisintegration />
        </Suspense>
      </group>


      <EffectComposer enableNormalPass={false} multisampling={8}>
        <SMAA />
        <Bloom 
          intensity={activeMode === 'XENO_MIST' ? bloomIntensity * 3.0 : bloomIntensity * 1.8} 
          luminanceThreshold={activeMode === 'NONE' ? 0.4 : 0.15} 
          mipmapBlur 
          levels={10}
          radius={0.85}
        />
        {activeMode === 'GHOST_SIGNAL' && (
          <Glitch 
            delay={glitchDelay} 
            duration={glitchDur} 
            strength={glitchStr} 
            mode={GlitchMode.SPORADIC} 
          />
        )}
        {activeMode === 'NEURAL_LATTICE' && (
          <>
            <DotScreen angle={Math.PI * 0.25} scale={1.0} />
            <Scanline opacity={0.2} density={1.5} />
          </>
        )}
        {(activeMode === 'VOID_RESONANCE' || activeMode === 'MAP_VIEW') && (
          <ChromaticAberration offset={new THREE.Vector2(0.02, 0.02)} />
        )}
        {sunMeshRef.current && (
            <GodRays 
                sun={sunMeshRef.current} 
                decay={0.98} 
                exposure={activeMode === 'VOID_RESONANCE' ? 1.5 : 0.8} 
                density={0.98} 
                clampMax={1.0} 
                weight={0.6} 
            />
        )}
        <DepthOfField
          focusDistance={activeMode === 'XRAY_INSPECTOR' ? 0.05 : 0.01}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
        <Vignette darkness={activeMode === 'VOID_RESONANCE' ? 0.95 : 0.8} offset={0.3} />
        <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} />
        {activeMode === 'MAP_VIEW' && (
          <NoiseEffect opacity={0.1} />
        )}
      </EffectComposer>

      <SpaceshipControls 
        isCinematicDone={isCinematicDone} 
        isMapMode={false} 
        moveSpeed={moveSpeed}
      />
    </>
  );
}


