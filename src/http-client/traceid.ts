import { getCurrentTraceId, runWithTraceId } from "../core/traceid-context";
import { generateTraceIdHex32 } from "../core/traceid";

const TRACE_ID_HEADER = "trace-id";

export type FetchLike = (input: any, init?: any) => Promise<any>;

export function withTraceIdFetch(baseFetch: FetchLike): FetchLike {
  return async function tracedFetch(input: any, init?: any) {
    const current = getCurrentTraceId();
    const id = current ?? generateTraceIdHex32();
    const nextInit = { ...(init || {}) };
    nextInit.headers = { ...(init?.headers || {}) };
    nextInit.headers[TRACE_ID_HEADER] = id;
    return runWithTraceId(id, () => baseFetch(input, nextInit));
  };
}

export function withTraceIdAxios(axiosInstance: any) {
  if (!axiosInstance || typeof axiosInstance.interceptors?.request?.use !== "function") return axiosInstance;
  axiosInstance.interceptors.request.use((config: any) => {
    const id = getCurrentTraceId() ?? generateTraceIdHex32();
    config.headers = config.headers || {};
    config.headers[TRACE_ID_HEADER] = id;
    return config;
  });
  return axiosInstance;
}


