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
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-t border-savant-gold rounded-full animate-spin mb-4" />
              <div className="text-[8px] font-mono tracking-[0.5em] text-savant-gold uppercase opacity-40">
                Syncing Neural Core
              </div>
            </div>
          </Html>
        }>
          <Scene onComplete={onComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}
