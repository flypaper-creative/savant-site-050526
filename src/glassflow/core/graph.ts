import { GlassflowShard } from './shard';

export type GlassflowEdgeRelation =
  | "contains"
  | "depends_on"
  | "transforms_into"
  | "renders_as"
  | "routes_to"
  | "validates"
  | "animates"
  | "segues_to"
  | "resonates_with";

export interface GlassflowEdge {
  id: string;
  from: string;
  to: string;
  relation: GlassflowEdgeRelation;
  weight: number;
  directed: boolean;
}

export interface GlassflowGraph {
  id: string;
  name: string;
  version: string;
  shards: Record<string, GlassflowShard>;
  edges: GlassflowEdge[];
  metadata: {
    createdAt: number;
    updatedAt: number;
  };
}
