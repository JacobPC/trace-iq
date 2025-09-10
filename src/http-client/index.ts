import { TraceParent } from "../core/traceparent";
import { getCurrentTrace } from "../core/context";

const TRACEPARENT_HEADER = "traceparent";
const TRACESTATE_HEADER = "tracestate";

export type FetchLike = (input: any, init?: any) => Promise<any>;

export function withTracingFetch(baseFetch: FetchLike): FetchLike {
  return async function tracedFetch(input: any, init?: any) {
    const current = getCurrentTrace();
    const child = current ? current.child() : TraceParent.generate();
    const nextInit = { ...(init || {}) };
    nextInit.headers = { ...(init?.headers || {}) };
    nextInit.headers[TRACEPARENT_HEADER] = child.toString();
    if (child.traceState) nextInit.headers[TRACESTATE_HEADER] = child.traceState;
    return baseFetch(input, nextInit);
  };
}

export function withTracingAxios(axiosInstance: any) {
  if (!axiosInstance || typeof axiosInstance.interceptors?.request?.use !== "function") return axiosInstance;
  axiosInstance.interceptors.request.use((config: any) => {
    const current = getCurrentTrace();
    const child = current ? current.child() : TraceParent.generate();
    config.headers = config.headers || {};
    config.headers[TRACEPARENT_HEADER] = child.toString();
    if (child.traceState) config.headers[TRACESTATE_HEADER] = child.traceState;
    return config;
  });
  return axiosInstance;
}


