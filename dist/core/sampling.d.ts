export type SamplingStrategy = {
    type: "always";
} | {
    type: "none";
} | {
    type: "ratio";
    ratio: number;
};
export declare function setGlobalSampler(strategy: SamplingStrategy): void;
export declare function getGlobalSampler(): SamplingStrategy;
export declare function shouldSample(): boolean;
