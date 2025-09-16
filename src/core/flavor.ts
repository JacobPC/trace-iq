import { AsyncLocalStorage } from "node:async_hooks";

export type TracingFlavor = "traceparent" | "traceid";

type FlavorStore = {
  flavor: TracingFlavor;
};

const flavorAls = new AsyncLocalStorage<FlavorStore>();

export function withTracingFlavor<T>(flavor: TracingFlavor, fn: () => T | Promise<T>): T | Promise<T> {
  return flavorAls.run({ flavor }, fn);
}

export function getCurrentTracingFlavor(): TracingFlavor | undefined {
  return flavorAls.getStore()?.flavor;
}


