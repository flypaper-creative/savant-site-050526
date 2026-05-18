import "dotenv/config";
const prompt = process.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.error("Usage: npm run opus:live -- <prompt>");
  process.exit(1);
}

const mod = await import("../src/gate_vi/exiles/opus/index.ts");

const result = await mod.runOpusLive({
  prompt,
  taskKind: "general",
  maxProviders: Number(process.env.OPUS_MAX_PROVIDERS ?? 3),
  timeoutMs: Number(process.env.OPUS_TIMEOUT_MS ?? 45000),
  maxTokens: Number(process.env.OPUS_MAX_TOKENS ?? 1800),
  owner: process.env.SAVANT_OWNER ?? "human-operator"
});

console.log(JSON.stringify(result, null, 2));

if (!result.accepted) process.exit(1);
