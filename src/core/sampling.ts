export type SamplingStrategy =
  | { type: "always" }
  | { type: "none" }
  | { type: "ratio"; ratio: number }; // 0..1

let globalSampling: SamplingStrategy = { type: "always" };

export function setGlobalSampler(strategy: SamplingStrategy) {
  if (strategy.type === "ratio") {
    const r = strategy.ratio;
    if (!(typeof r === "number" && r >= 0 && r <= 1)) {
      throw new Error("ratio must be a number between 0 and 1");
    }
  }
  globalSampling = strategy;
}

export function getGlobalSampler(): SamplingStrategy {
  return globalSampling;
}

export function shouldSample(): boolean {
  const s = globalSampling;
  if (s.type === "always") return true;
  if (s.type === "none") return false;
  return Math.random() < s.ratio;
}


