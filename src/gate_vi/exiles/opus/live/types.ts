export type OpusLiveProviderResult = 
  | { ok: true; provider: string; text: string; latencyMs: number }
  | { ok: false; provider: string; error: string };

export interface OpusLiveFusion {
  text: string;
  confidence: number;
  agreement: "none" | "single" | "partial" | "strong";
  dissent: string[];
  selectedProvider: string | null;
}
