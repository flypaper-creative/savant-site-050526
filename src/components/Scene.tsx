import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  Environment,
  Html,
  Lightformer,
  ContactShadows,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch, DepthOfField, SMAA, Scanline } from '@react-three/postprocessing';
import { gsap } from 'gsap';

// Configuration
const LOGO_PATH = 'https://raw.githubusercontent.com/flypaper-creative/savant-site-050526/main/public/assets/logo7/logo7.glb';
const DEBUG_MODE = false; // Set to false for clean presentation

function LogoModel({ material, neonMaterial }: { material: THREE.Material, neonMaterial: THREE.Material }) {
  const { scene } = useGLTF(LOGO_PATH);
  
  useEffect(() => {
    if (scene) {
      // 1. Center and Level Geometry
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // 2. Refine Meshes and Normalize Scale
      const meshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshes.push(child as THREE.Mesh);
        }
      });

      // Normalize size so bounding box height/width fits in a unit cube approx
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      scene.scale.setScalar(1 / maxDim);

      meshes.forEach((mesh) => {
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.normalizeNormals();
      });
    }
  }, [scene, material, neonMaterial]);

  return <primitive object={scene} />;
}

export function Scene({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const logoRef = useRef<THREE.Group>(null);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);

  const logoMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#C5A059', // Changed to Gold for immediate visibility
    metalness: 1,
    roughness: 0.1,
    envMapIntensity: 5, 
    ior: 2.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
    transmission: 0,
    thickness: 0,
    emissive: '#C5A059',
    emissiveIntensity: 3.0, // High glow for visibility
    sheen: 1.2,
    sheenRoughness: 0.1,
    sheenColor: '#C5A059'
  }), []);

  const neonMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#C5A059',
    emissive: '#C5A059',
    emissiveIntensity: 10,
    transparent: true,
    opacity: 0.9,
    roughness: 0,
    metalness: 1,
  }), []);

  // Cinematic Choreography (25 Seconds)
  useEffect(() => {
    const tl = gsap.timeline({
      onUpdate: () => {
        setLoadingProgress(tl.progress() * 100);
      },
      onComplete: () => {
        setIsReady(true);
      }
    });

    // Reset environment - Logo at 0,0,0 and Camera at 0,0,100 (100 units away)
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);
    
    if (logoRef.current) {
      logoRef.current.position.set(0, 0, 0);
      logoRef.current.scale.set(0, 0, 0);
      logoRef.current.rotation.set(0, 0, 0);
    }

    // Phase 1: Reveal (0-5s) - Smooth fade in scale
    // We scale by target frames in useFrame, so we can just animate an internal value or just use progress
    
    tl.to({}, { duration: 25 }); // Main timer

    return () => { tl.kill(); };
  }, [camera]);

  useFrame((state) => {
    if (logoRef.current) {
      // 1. Perpetual X-axis Rotation (Counterclockwise)
      logoRef.current.rotation.x -= 0.015; 
      logoRef.current.rotation.y = 0;
      logoRef.current.rotation.z = 0;

      // 2. Strict Framing: Fixed Padding of 15 units
      const fov = (camera as THREE.PerspectiveCamera).fov || 50;
      const dist = 100; // Fixed distance as camera is at 100 and logo is at 0
      const vHeight = 2 * dist * Math.tan((fov * Math.PI) / 360);
      const aspect = state.viewport.aspect;
      const vWidth = vHeight * aspect;
      
      const horizontalPadding = 30; // 15 each side
      const verticalPadding = 30;
      
      const availableWidth = vWidth - horizontalPadding;
      const availableHeight = vHeight - verticalPadding;
      const targetScale = Math.min(availableWidth, availableHeight); 

      // Apply revealing scale: Scale up from 0 to 1 over the first 5 seconds (20% of 25s)
      const revealProgress = Math.min(1, loadingProgress / 20);
      const finalScale = targetScale * revealProgress; 
      
      logoRef.current.scale.set(finalScale, finalScale, finalScale);
      
      // Ensure camera stays locked
      camera.position.set(0, 0, 100);
      camera.lookAt(0, 0, 0);
    }
  });


  const handleInitialize = () => {
    if (!isReady || hasStartedTransition) return;
    setHasStartedTransition(true);
    
    // No camera movement - keeping the logo visible perpetually as requested
    // Just a clean transition fade for the UI
    setTimeout(onComplete, 1200);
  };

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <Environment preset="studio">
        <group rotation={[0, Math.PI / 3, 0]}>
          <Lightformer form="rect" color="#C5A059" intensity={30} scale={[50, 20, 1]} position={[-30, 20, -30]} target={[0, 0, 0]} />
          <Lightformer form="rect" color="#ffffff" intensity={20} scale={[100, 2, 1]} position={[0, 0, -50]} target={[0, 0, 0]} />
          <Lightformer form="circle" color="#C5A059" intensity={15} scale={[30, 30, 1]} position={[30, -20, -20]} target={[0, 0, 0]} />
        </group>
      </Environment>

      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 0, 100]} intensity={2.5} color="#C5A059" />
      
      {isReady && (
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={false} 
          makeDefault 
          target={[0, 0, 0]}
        />
      )}

      <ContactShadows 
        position={[0, -60, 0]} 
        opacity={0.4} 
        scale={150} 
        blur={2} 
        far={100} 
        resolution={512} 
        color="#C5A059" 
      />

      <group ref={logoRef} position={[0, 0, 0]}> 
        <Suspense fallback={null}>
           <LogoModel material={logoMaterial} neonMaterial={neonMaterial} />
        </Suspense>

        <spotLight 
          position={[0, 50, 80]} 
          angle={0.2} 
          penumbra={1} 
          intensity={25} 
          color="#C5A059" 
          castShadow
        />
        
        {/* Direct Fill Light from Camera Position */}
        <pointLight
          position={[0, 0, 40]}
          intensity={15}
          color="#ffffff"
        />
      </group>


      <EffectComposer multisampling={8}>
        <SMAA />
        <Bloom 
          intensity={1.2} 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.1} 
          mipmapBlur={true} 
        />
        <Vignette darkness={0.8} offset={0.2} />
      </EffectComposer>

      <Html fullscreen>
        <div id="ui-root" className="fixed inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none select-none z-50">
          <div id="preloader-container" className="flex flex-col items-center w-full max-w-5xl px-6 pb-2">
            <div id="status-group" className="flex flex-col items-center mb-6">
              <div id="status-header" className="flex items-center gap-4 mb-3">
                <div id="decor-line-left" className="h-[1px] w-8 sm:w-16 bg-savant-gold/30" />
                <div id="status-text" className="text-[10px] sm:text-[12px] font-display tracking-[0.5rem] sm:tracking-[0.8rem] text-savant-gold/80 border-x border-savant-gold/30 px-6 py-1.5 uppercase opacity-90 backdrop-blur-sm font-light">
                  {isReady ? 'Ready for Initialization' : 'Neural Core Synchronization'}
                </div>
                <div id="decor-line-right" className="h-[1px] w-8 sm:w-16 bg-savant-gold/30" />
              </div>

              <div id="progress-display" className="relative group flex items-center justify-center">
                <div id="progress-number" className="text-[5rem] sm:text-[7rem] font-display tracking-tight text-white font-black opacity-90 relative flex items-center leading-none">
                  {Math.floor(loadingProgress).toString().padStart(3, '0')}
                  <div id="data-link-box" className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 flex flex-col items-start gap-0.5">
                    <span id="data-link-label" className="text-[7px] sm:text-[8px] font-accent tracking-widest font-bold opacity-40 text-savant-gold">SYNC</span>
                    <div id="data-link-line" className="h-[1px] w-8 sm:w-12 bg-savant-gold/40" />
                  </div>
                </div>
              </div>
            </div>

            {isReady && !hasStartedTransition && (
              <div id="action-container" className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-1000">
                <button
                  id="initialize-button"
                  onClick={handleInitialize}
                  className="pointer-events-auto relative group px-24 py-6 bg-black border border-savant-gold/40 hover:border-white transition-all duration-700 shadow-2xl hover:shadow-savant-gold/5"
                  style={{ clipPath: 'polygon(0 20px, 20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))' }}
                >
                  <div className="absolute inset-0 bg-savant-gold/5 group-hover:bg-savant-gold/10 transition-colors" />
                  <span id="button-label" className="relative text-[14px] sm:text-[16px] font-display tracking-[1.5em] text-savant-gold group-hover:text-white uppercase transition-all duration-700 font-medium">
                    Initialize
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Html>
    </>
  );
}
