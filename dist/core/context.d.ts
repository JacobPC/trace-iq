import { AsyncLocalStorage } from "node:async_hooks";
import { TraceParent } from "./traceparent";
type TraceStore = {
    trace: TraceParent;
};
export declare const traceAsyncLocalStorage: AsyncLocalStorage<TraceStore>;
export declare function runWithTrace<T>(trace: TraceParent, fn: () => T | Promise<T>): T | Promise<T>;
export declare function getCurrentTrace(): TraceParent | undefined;
export {};
