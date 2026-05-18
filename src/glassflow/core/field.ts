import { GlassflowShardKind } from './shard';

export type FieldFalloff = "none" | "linear" | "exponential" | "inverse_square" | "custom";

export type GlassflowFieldKind =
  | "semantic"
  | "structural"
  | "resonance"
  | "temporal"
  | "motion"
  | "attention"
  | "execution"
  | "render";

export interface GlassflowField {
  id: string;
  kind: GlassflowFieldKind;
  sourceShardId?: string;
  strength: number;
  radius?: number;
  falloff: FieldFalloff;
  affects: GlassflowShardKind[];
  data: Record<string, unknown>;
}
