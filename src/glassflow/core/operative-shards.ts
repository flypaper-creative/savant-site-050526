import { GlassflowShard } from './shard';

export interface OperativeShard extends GlassflowShard {
  kind: 'operative';
  operation: {
    type: 'cinematic' | 'audio' | 'ui_sync';
    progress: number;
    status: 'idle' | 'executing' | 'complete';
    params: Record<string, any>;
  };
}

export function createCinematicShard(id: string): OperativeShard {
  return {
    id,
    kind: 'operative',
    level: 'engine',
    name: 'Cinematic Sequence Shard',
    version: '1.0.0',
    lineage: { createdBy: 'system', parentIds: [], ancestorIds: [], source: 'system' },
    geometry: {},
    state: { phase: 'active', active: true, stable: true, dirty: false, data: {} },
    ports: { input: [], output: [] },
    lifecycle: { createdAt: Date.now(), updatedAt: Date.now(), phase: 'running' },
    validation: { invariants: [], errors: [], warnings: [] },
    operation: {
      type: 'cinematic',
      progress: 0,
      status: 'idle',
      params: { duration: 25000, startZoom: 25000, endZoom: 450 }
    }
  };
}
