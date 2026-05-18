import type { OpusLiveFusion, OpusLiveProviderResult } from "./types.js";

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s-]/gu, " ").split(/\s+/u).filter((word) => word.length > 4)
  );
}

function overlap(a: string, b: string): number {
  const aa = tokenize(a);
  const bb = tokenize(b);
  if (aa.size === 0 || bb.size === 0) return 0;

  let shared = 0;
  for (const word of aa) if (bb.has(word)) shared += 1;

  return shared / Math.max(aa.size, bb.size);
}

function appearsTruncated(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.endsWith(":") || trimmed.endsWith("-") || trimmed.endsWith(",") || trimmed.endsWith("(")) return true;

  const lower = trimmed.toLowerCase();
  if (lower.endsWith("ongoing") || lower.endsWith("duration: ongoing")) return true;

  return !/[.!?)]$/u.test(trimmed);
}

function qualityScore(result: Extract<OpusLiveProviderResult, { ok: true }>): number {
  const text = result.text.trim();
  const lengthScore = Math.min(0.35, text.length / 6000);
  const completionScore = appearsTruncated(text) ? -0.35 : 0.25;
  const structureScore = /phase|step|plan|objective|risk|verify|owner|output/iu.test(text) ? 0.2 : 0;
  const speedScore = Math.max(0, 0.2 - result.latencyMs / 120000);

  return lengthScore + completionScore + structureScore + speedScore;
}

export function fuseOpusLiveResults(results: readonly OpusLiveProviderResult[]): OpusLiveFusion {
  const successes = results.filter(
    (result): result is Extract<OpusLiveProviderResult, { ok: true }> => result.ok
  );

  const failures = results.filter(
    (result): result is Extract<OpusLiveProviderResult, { ok: false }> => !result.ok
  );

  if (successes.length === 0) {
    return {
      text: "",
      confidence: 0,
      agreement: "none",
      dissent: failures.map((failure) => `${failure.provider}: ${failure.error}`),
      selectedProvider: null
    };
  }

  const selected = successes.slice().sort((a, b) => qualityScore(b) - qualityScore(a))[0];

  if (!selected) {
    return {
      text: "",
      confidence: 0,
      agreement: "none",
      dissent: ["Fusion selection failed."],
      selectedProvider: null
    };
  }

  const pairScores: number[] = [];

  for (let i = 0; i < successes.length; i += 1) {
    for (let j = i + 1; j < successes.length; j += 1) {
      const left = successes[i];
      const right = successes[j];
      if (left && right) pairScores.push(overlap(left.text, right.text));
    }
  }

  const averageAgreement =
    pairScores.length === 0
      ? successes.length === 1
        ? 0.55
        : 0
      : pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length;

  const confidence = Math.max(
    0.15,
    Math.min(
      0.98,
      (successes.length / Math.max(1, results.length)) * 0.5 +
        averageAgreement * 0.35 +
        Math.max(0, qualityScore(selected)) * 0.15
    )
  );

  const agreement =
    successes.length === 1
      ? "single"
      : averageAgreement > 0.42
        ? "strong"
        : averageAgreement > 0.18
          ? "partial"
          : "none";

  const dissent = [
    ...successes
      .filter((success) => success.provider !== selected.provider && overlap(success.text, selected.text) < 0.18)
      .map((success) => `${success.provider}: low semantic agreement with selected provider.`),
    ...successes
      .filter((success) => success.provider !== selected.provider && appearsTruncated(success.text))
      .map((success) => `${success.provider}: response appears truncated.`),
    ...failures.map((failure) => `${failure.provider}: ${failure.error}`)
  ];

  return {
    text: selected.text,
    confidence,
    agreement,
    dissent,
    selectedProvider: selected.provider
  };
}
