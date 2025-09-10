"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGlobalSampler = setGlobalSampler;
exports.getGlobalSampler = getGlobalSampler;
exports.shouldSample = shouldSample;
let globalSampling = { type: "always" };
function setGlobalSampler(strategy) {
    if (strategy.type === "ratio") {
        const r = strategy.ratio;
        if (!(typeof r === "number" && r >= 0 && r <= 1)) {
            throw new Error("ratio must be a number between 0 and 1");
        }
    }
    globalSampling = strategy;
}
function getGlobalSampler() {
    return globalSampling;
}
function shouldSample() {
    const s = globalSampling;
    if (s.type === "always")
        return true;
    if (s.type === "none")
        return false;
    return Math.random() < s.ratio;
}
