import { GlassflowGraph } from './graph';

export class GlassflowSnapshotManager {
  public static createSnapshot(graph: GlassflowGraph, tick: number, time: number) {
    return {
      tick,
      time,
      graphState: JSON.parse(JSON.stringify(graph))
    };
  }
}
