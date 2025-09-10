import { AsyncLocalStorage } from "node:async_hooks";
import { TraceParent } from "./traceparent";

type TraceStore = {
  trace: TraceParent;
};

export const traceAsyncLocalStorage = new AsyncLocalStorage<TraceStore>();

export function runWithTrace<T>(trace: TraceParent, fn: () => T | Promise<T>): T | Promise<T> {
  return traceAsyncLocalStorage.run({ trace }, fn);
}

export function getCurrentTrace(): TraceParent | undefined {
  return traceAsyncLocalStorage.getStore()?.trace;
}


