import { GlassflowShard } from '../core/shard';

export interface SeguePhase {
  id: string;
  name: string;
  start: number;
  end: number;
  fieldChanges: Record<string, number>;
}

export interface SegueShard extends GlassflowShard {
  kind: "segue";
  fromShardId: string;
  toShardId: string;
  bridge: {
    continuity: number;
    tension: number;
    decay: number;
    interpolation: "linear" | "field" | "physics" | "semantic" | "temporal";
    preserve: Array<"identity" | "geometry" | "meaning" | "resonance" | "motion">;
  };
  phases: SeguePhase[];
}
