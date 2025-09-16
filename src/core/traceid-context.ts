import { AsyncLocalStorage } from "node:async_hooks";
import { generateTraceIdHex32, isValidTraceIdHex32 } from "./traceid";
import { withTracingFlavor } from "./flavor";

type TraceIdStore = {
  traceId: string;
};

export const traceIdAsyncLocalStorage = new AsyncLocalStorage<TraceIdStore>();

export function runWithTraceId<T>(traceId: string | undefined, fn: () => T | Promise<T>): T | Promise<T> {
  const id = traceId && isValidTraceIdHex32(traceId) ? traceId : generateTraceIdHex32();
  return withTracingFlavor("traceid", () => traceIdAsyncLocalStorage.run({ traceId: id }, fn));
}

export function getCurrentTraceId(): string | undefined {
  return traceIdAsyncLocalStorage.getStore()?.traceId;
}


