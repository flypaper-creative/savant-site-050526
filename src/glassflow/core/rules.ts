import { GlassflowShard } from './shard';

export interface RuleShard extends GlassflowShard {
  kind: "rule";
  rule: {
    text: string;
    scope: string[];
    priority: number;
    enforcement: "hard" | "soft" | "advisory";
    source: string;
  };
}

export const GLASSFLOW_RULES: RuleShard[] = [
  {
    id: 'rule-identity-immutable',
    kind: 'rule',
    level: 'entity',
    name: 'Shard Identity Law',
    version: '1.0.0',
    lineage: { createdBy: 'system', parentIds: [], ancestorIds: [], source: 'system' },
    geometry: {},
    state: { phase: 'active', active: true, stable: true, dirty: false, data: {} },
    ports: { input: [], output: [] },
    lifecycle: { createdAt: Date.now(), updatedAt: Date.now(), phase: 'running' },
    validation: { invariants: [], errors: [], warnings: [] },
    rule: {
      text: 'A shard’s identity must be immutable.',
      scope: ['core', 'runtime'],
      priority: 1,
      enforcement: 'hard',
      source: 'Section 7'
    }
  }
];
