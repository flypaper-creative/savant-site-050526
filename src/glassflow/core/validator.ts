import { GlassflowGraph } from './graph';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class GlassflowValidator {
  public static validateGraph(graph: GlassflowGraph): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    const shardIds = new Set(Object.keys(graph.shards));

    // 1. All shard IDs unique (implicit by Record)
    
    // 2. All edge endpoints exist
    graph.edges.forEach(edge => {
      if (!shardIds.has(edge.from)) {
        result.valid = false;
        result.errors.push(`Edge ${edge.id} references non-existent source shard ${edge.from}`);
      }
      if (!shardIds.has(edge.to)) {
        result.valid = false;
        result.errors.push(`Edge ${edge.id} references non-existent target shard ${edge.to}`);
      }
    });

    // 3. No shard class transformation without lineage (runtime check typically)

    return result;
  }
}
