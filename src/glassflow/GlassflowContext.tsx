import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GlassflowRuntime } from './core/runtime';
import { createLogoShardGraph } from './core/logo-shard-factory';
import { GlassflowGraph } from './core/graph';
import { OverlayMode } from '../components/Scene';
import { createCinematicShard } from './core/operative-shards';

interface GlassflowContextValue {
  runtime: GlassflowRuntime;
  graph: GlassflowGraph;
  activeMode: OverlayMode;
  setActiveMode: (mode: OverlayMode) => void;
  progress: number;
  setProgress: (p: number) => void;
  cinematicDone: boolean;
  setCinematicDone: (d: boolean) => void;
}

const GlassflowContext = createContext<GlassflowContextValue | null>(null);

export function GlassflowProvider({ children }: { children: React.ReactNode }) {
  const [activeMode, setActiveMode] = useState<OverlayMode>('NONE');
  const [progress, setProgress] = useState(0);
  const [cinematicDone, setCinematicDone] = useState(false);
  
  const graph = useMemo(() => {
    const g = createLogoShardGraph(800); // Massive increase in detail
    const cinShard = createCinematicShard('sh-cinematic-core');
    g.shards[cinShard.id] = cinShard;
    return g;
  }, []);

  const runtime = useMemo(() => new GlassflowRuntime(graph), [graph]);

  useEffect(() => {
    const fieldId = 'global-entropy-field';
    if (!graph.shards[fieldId]) {
      graph.shards[fieldId] = {
        id: fieldId,
        kind: 'motion',
        level: 'engine',
        name: 'Entropy Field',
        version: '1.0.0',
        lineage: { createdBy: 'system', parentIds: [], ancestorIds: [], source: 'system' },
        geometry: {},
        state: { phase: 'active', active: true, stable: true, dirty: false, data: {} },
        ports: { input: [], output: [] },
        lifecycle: { createdAt: Date.now(), updatedAt: Date.now(), phase: 'running' },
        validation: { invariants: [], errors: [], warnings: [] },
        field: {
          strength: progress > 0.9 ? 2.5 : 0.08,
          falloff: 'linear',
          affects: ['motion']
        }
      } as any;
    } else {
      (graph.shards[fieldId] as any).field.strength = progress > 0.9 ? 2.5 : 0.08;
    }
  }, [graph, progress]);

  const value = useMemo(() => ({
    runtime,
    graph,
    activeMode,
    setActiveMode,
    progress,
    setProgress,
    cinematicDone,
    setCinematicDone
  }), [runtime, graph, activeMode, progress, cinematicDone]);

  return (
    <GlassflowContext.Provider value={value}>
      {children}
    </GlassflowContext.Provider>
  );
}

export function GlassflowHeartbeat() {
  const { runtime } = useGlassflow();
  useFrame((state, delta) => {
    runtime.step(delta);
  });
  return null;
}

export function useGlassflow() {
  const ctx = useContext(GlassflowContext);
  if (!ctx) throw new Error("useGlassflow must be used within GlassflowProvider");
  return ctx;
}
