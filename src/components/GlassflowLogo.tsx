import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { MotionShard } from '../glassflow/core/shard';
import { useGlassflow } from '../glassflow/GlassflowContext';

export function GlassflowLogoDisintegration() {
  const { graph } = useGlassflow();
  const glassMeshRef = useRef<THREE.InstancedMesh>(null);
  const coreMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const tempObject = new THREE.Object3D();
  const shards = useMemo(() => 
    Object.values(graph.shards).filter(s => s.kind === 'motion' && 'motion' in s) as MotionShard[]
  , [graph]);

  useFrame((state) => {
    if (glassMeshRef.current && coreMeshRef.current) {
      shards.forEach((shard, i) => {
        const motion = (shard as any).motion;
        if (!motion) return;

        const { position, dissolve } = motion;
        const time = state.clock.elapsedTime;
        
        // Complex fractal scale
        const s = (1.0 - dissolve * 0.98) * 5.5;
        const thicknessMod = 0.05 + Math.sin(time + i) * 0.02;
        
        // 1. Update Glass Shard
        tempObject.scale.set(s, s * thicknessMod, s);
        tempObject.position.set(
          position[0] * 380, 
          position[1] * 280, 
          position[2] * 280
        );
        tempObject.rotation.set(
          dissolve * 20 + Math.sin(time * 0.1 + i) * 0.5,
          dissolve * 12 + Math.cos(time * 0.1 + i) * 0.5,
          Math.sin(i * 0.5 + time) * 1.5
        );
        tempObject.updateMatrix();
        glassMeshRef.current!.setMatrixAt(i, tempObject.matrix);

        // 2. Update Internal Core (slightly smaller, more intense)
        const coreSize = s * 0.7;
        tempObject.scale.set(coreSize, coreSize * 0.2, coreSize);
        tempObject.updateMatrix();
        coreMeshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      
      glassMeshRef.current.instanceMatrix.needsUpdate = true;
      coreMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Outer Glass Shards: High Refraction */}
      <instancedMesh ref={glassMeshRef} args={[undefined, undefined, shards.length]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={1.0}
          thickness={2.5}
          roughness={0.05}
          metalness={0.1}
          ior={1.6}
          transparent={true}
          opacity={0.4}
          emissive="#ff00a2"
          emissiveIntensity={1.5}
        />
      </instancedMesh>

      {/* Inner Energy Core: High Intensity Pink */}
      <instancedMesh ref={coreMeshRef} args={[undefined, undefined, shards.length]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial 
          color="#ff00a2" 
          emissive="#ff00a2" 
          emissiveIntensity={200} 
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
