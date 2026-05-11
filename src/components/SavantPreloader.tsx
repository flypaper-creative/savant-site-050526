import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from './Scene';

export default function SavantPreloader({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ fov: 45, far: 4000 }}
      >
        <Suspense fallback={null}>
          <Scene onComplete={onComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}
