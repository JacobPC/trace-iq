import { getOrCreateTraceForRequest } from "./http";
import { TraceParent } from "../core/traceparent";
import { getCurrentTrace, runWithTrace } from "../core/context";
function wrapObservableWithTrace<T>(trace: TraceParent, source: any): any {
  if (!source || typeof source.subscribe !== "function") return source;
  const originalSubscribe = source.subscribe.bind(source);
  source.subscribe = (...args: any[]) => runWithTrace(trace, () => originalSubscribe(...args));
  return source;
}

export class TraceInterceptor {
  intercept(context: any, next: any): any {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const trace = getOrCreateTraceForRequest(req);
    res.setHeader("traceparent", trace.toString());
    if (trace.traceState) res.setHeader("tracestate", trace.traceState);
    const result = next.handle();
    return wrapObservableWithTrace(trace, result);
  }
}

export class TraceService {
  getCurrentTrace(): TraceParent | undefined {
    return getCurrentTrace();
  }
}


