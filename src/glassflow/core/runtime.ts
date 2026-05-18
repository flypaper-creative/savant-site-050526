import { GlassflowGraph, GlassflowEdge } from './graph';
import { GlassflowShard, MotionShard, FieldShard } from './shard';
import { OperativeShard } from './operative-shards';

export interface RuntimeSnapshot {
  tick: number;
  time: number;
  shards: Record<string, GlassflowShard>;
}

export class GlassflowRuntime {
  private tick: number = 0;
  private time: number = 0;
  private graph: GlassflowGraph;
  private snapshots: RuntimeSnapshot[] = [];

  constructor(graph: GlassflowGraph) {
    this.graph = graph;
  }

  public step(delta: number): void {
    this.tick++;
    this.time += delta;

    // 1. Resolve field influences from FieldShards in the graph
    this.resolveFields(delta);

    // 2. Execute Operative Logic
    this.executeOperatives(delta);

    // 3. Execute physics
    this.executePhysics(delta);

    this.propagateState();
  }

  private executeOperatives(delta: number) {
    const operatives = Object.values(this.graph.shards).filter(s => s.kind === 'operative') as unknown as OperativeShard[];
    operatives.forEach(op => {
      if (op.operation.type === 'cinematic') {
        const { params } = op.operation;
        op.operation.status = 'executing';
        op.operation.progress = Math.min(1, op.operation.progress + (delta * 1000) / params.duration);
        if (op.operation.progress >= 1) op.operation.status = 'complete';
      }
    });
  }

  private resolveFields(delta: number) {
    const fieldShards = Object.values(this.graph.shards).filter(shard => shard.kind === 'motion' && 'field' in shard) as unknown as FieldShard[];
    
    Object.values(this.graph.shards).forEach(shard => {
      if (shard.kind === 'motion' && 'motion' in shard) {
        const ms = shard as MotionShard;
        fieldShards.forEach(fieldShard => {
          const field = fieldShard.field;
          if (fieldShard.kind === 'motion') {
            const xPos = ms.motion.position[0];
            const yPos = ms.motion.position[1];
            
            const edgeBonus = xPos > 0.4 ? 4.5 : 0.8;
            const yDrift = Math.sin(yPos * 10 + this.time) * 0.5;
            
            ms.motion.instability += field.strength * edgeBonus * delta;
            
            ms.motion.velocity[0] += (1.0 + yDrift) * ms.motion.instability * delta;
            ms.motion.velocity[1] += (Math.random() - 0.5) * ms.motion.instability * delta;
            ms.motion.velocity[2] += (Math.cos(xPos * 5) * 0.5) * ms.motion.instability * delta;
            
            ms.motion.cohesion = Math.max(0, ms.motion.cohesion - field.strength * edgeBonus * delta * 0.5);
            ms.motion.dissolve = 1.0 - ms.motion.cohesion;
          }
        });
      }
    });
  }

  private executePhysics(delta: number) {
    Object.values(this.graph.shards).forEach(shard => {
      if (shard.kind === 'motion' && 'motion' in shard) {
        const ms = shard as MotionShard;
        
        // Coherence collapse logic
        const { velocity, angularVelocity, position, origin, instability, cohesion } = ms.motion;
        
        // Update physics
        // velocity += instabilityField (simulated here)
        ms.motion.cohesion -= ms.motion.instability * delta;
        
        ms.motion.position[0] += ms.motion.velocity[0] * delta;
        ms.motion.position[1] += ms.motion.velocity[1] * delta;
        ms.motion.position[2] += ms.motion.velocity[2] * delta;
        
        // Ensure dirty state for re-rendering
        ms.state.dirty = true;
      }
    });
  }

  private propagateState() {
    // Snapshot or emit events
  }

  public getGraph(): GlassflowGraph {
    return this.graph;
  }

  public snapshot(): RuntimeSnapshot {
    return {
      tick: this.tick,
      time: this.time,
      shards: JSON.parse(JSON.stringify(this.graph.shards))
    };
  }
}
