import { GlassflowShard, MotionShard } from './shard';
import { GlassflowGraph } from './graph';

export function createLogoShardGraph(shardCount: number = 100): GlassflowGraph {
  const shards: Record<string, GlassflowShard> = {};
  
  for (let i = 0; i < shardCount; i++) {
    const id = `logo-shard-${i}`;
    
    // Diamond distribution
    const u = Math.random() * 2 * Math.PI;
    const v = Math.random() * Math.PI;
    const r = Math.pow(Math.random(), 0.5);
    
    // Sharp diamonds (octahedral shell)
    const x = r * Math.sin(v) * Math.cos(u);
    const y = r * Math.sin(v) * Math.sin(u);
    const z = r * Math.cos(v);
    
    const sum = Math.abs(x) + Math.abs(y) + Math.abs(z) + 0.0001;
    const diamondX = (x / sum) * (Math.random() * 0.2 + 0.8);
    const diamondY = (y / sum) * (Math.random() * 0.2 + 0.8);
    const diamondZ = (z / sum) * (Math.random() * 0.2 + 0.8);
    
    const shard: MotionShard = {
      id,
      kind: 'motion',
      level: 'engine',
      name: `Shard ${i}`,
      version: '1.0.0',
      lineage: {
        createdBy: 'system',
        parentIds: [],
        ancestorIds: [],
        source: 'runtime'
      },
      geometry: {
        transform: {
          position: [diamondX, diamondY, diamondZ],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        }
      },
      state: {
        phase: 'stable',
        active: true,
        stable: true,
        dirty: false,
        data: {}
      },
      ports: { input: [], output: [] },
      lifecycle: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        phase: 'running'
      },
      validation: { invariants: [], errors: [], warnings: [] },
      motion: {
        origin: [diamondX, diamondY, diamondZ],
        position: [diamondX, diamondY, diamondZ],
        velocity: [0, 0, 0],
        angularVelocity: [0, 0, 0],
        instability: 0,
        dissolve: 0,
        cohesion: 1.0,
        glow: 0,
        fieldWeight: 1.0,
        topologyAffinity: 1.0,
        neighborInfluence: 1.0
      }
    };
    
    shards[id] = shard;
  }
  
  return {
    id: 'logo-graph-001',
    name: 'Logo Fractal Graph',
    version: '1.0.0',
    shards,
    edges: [],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  };
}
