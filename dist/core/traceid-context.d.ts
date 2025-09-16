import { AsyncLocalStorage } from "node:async_hooks";
type TraceIdStore = {
    traceId: string;
};
export declare const traceIdAsyncLocalStorage: AsyncLocalStorage<TraceIdStore>;
export declare function runWithTraceId<T>(traceId: string | undefined, fn: () => T | Promise<T>): T | Promise<T>;
export declare function getCurrentTraceId(): string | undefined;
export {};
