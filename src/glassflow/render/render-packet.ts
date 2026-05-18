export type RendererType = "dom" | "svg" | "three" | "webgl" | "translucent";

export interface ShardRenderPacket {
  shardId: string;
  renderer: RendererType;
  geometry?: any;
  material?: any;
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  opacity?: number;
  visible: boolean;
  zIndex?: number;
  uniforms?: Record<string, unknown>;
}
