export type TracingFlavor = "traceparent" | "traceid";
export declare function withTracingFlavor<T>(flavor: TracingFlavor, fn: () => T | Promise<T>): T | Promise<T>;
export declare function getCurrentTracingFlavor(): TracingFlavor | undefined;
