import * as THREE from 'three';

export type GlassflowLevel = "00" | "0" | "local" | "engine" | "entity" | "composition";

export type GlassflowShardKind =
  | "computational"
  | "structural"
  | "semantic"
  | "resonant"
  | "mythic"
  | "operative"
  | "temporal"
  | "segue"
  | "visual"
  | "motion"
  | "render"
  | "ai"
  | "rule"
  | "operative"
  | "ui";

export interface ShardLineage {
  createdBy: string;
  parentIds: string[];
  ancestorIds: string[];
  source: "user" | "system" | "import" | "generated" | "runtime";
}

export interface ShardGeometry {
  shape?: string;
  dimensions?: Record<string, number>;
  topology?: string[];
  symmetry?: string[];
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

export interface ShardState {
  phase: string;
  active: boolean;
  stable: boolean;
  dirty: boolean;
  data: Record<string, unknown>;
}

export interface ShardPort {
  id: string;
  type: string;
  direction: "in" | "out";
}

export interface GlassflowShard {
  id: string;
  kind: GlassflowShardKind;
  level: GlassflowLevel;
  name: string;
  version: string;
  lineage: ShardLineage;
  geometry: ShardGeometry;
  state: ShardState;
  ports: {
    input: ShardPort[];
    output: ShardPort[];
  };
  lifecycle: {
    createdAt: number;
    updatedAt: number;
    phase: "created" | "validated" | "mounted" | "running" | "paused" | "retired";
  };
  execution?: {
    deterministic: boolean;
    run?: string;
    constraints: string[];
  };
  rendering?: {
    renderer: "none" | "dom" | "svg" | "webgl" | "three" | "translucent";
    visible: boolean;
    material?: string;
  };
  validation: {
    invariants: string[];
    errors: string[];
    warnings: string[];
  };
}

export interface MotionShard extends GlassflowShard {
  kind: "motion";
  motion: {
    origin: [number, number, number];
    position: [number, number, number];
    velocity: [number, number, number];
    angularVelocity: [number, number, number];
    instability: number;
    dissolve: number;
    cohesion: number;
    glow: number;
    fieldWeight: number;
    topologyAffinity: number;
    neighborInfluence: number;
  };
}

export interface FieldShard extends GlassflowShard {
  kind: "motion" | "structural" | "resonant";
  field: {
    strength: number;
    radius?: number;
    falloff: "none" | "linear" | "exponential" | "inverse_square" | "custom";
    affects: GlassflowShardKind[];
  };
}
