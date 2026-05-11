import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  Environment,
  OrbitControls,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';

// Configuration
const LOGO_PATH = '/assets/logo7/logo7.glb';

function LogoModel({ material }: { material: THREE.Material }) {
  const { scene } = useGLTF(LOGO_PATH);
  
  useEffect(() => {
    if (scene) {
      // 1. Center and Normalize
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        scene.scale.setScalar(1 / maxDim);
      }

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = material;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene, material]);

  return scene ? <primitive object={scene} /> : null;
}

function FallbackLogo() {
  return (
    <mesh>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={2} />
    </mesh>
  );
}

export function Scene({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const logoRef = useRef<THREE.Group>(null);

  const logoMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C5A059',
    metalness: 1,
    roughness: 0.1,
    emissive: '#C5A059',
    emissiveIntensity: 0.2,
  }), []);

  useEffect(() => {
    camera.position.set(0, 0, 300);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#C5A059" />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#ffffff" />
      <spotLight position={[0, 0, 300]} intensity={30} angle={0.5} />

      <Environment preset="city" />

      <group ref={logoRef} scale={[2.5, 2.5, 2.5]} position={[0, 0, 0]}>
        <Suspense fallback={<FallbackLogo />}>
          <LogoModel material={logoMaterial} />
        </Suspense>
      </group>

      <EffectComposer multisampling={8}>
        <SMAA />
        <Bloom 
          intensity={0.5} 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.5} 
          mipmapBlur 
        />
      </EffectComposer>

      <OrbitControls enablePan={true} enableZoom={true} />
    </>
  );
}

