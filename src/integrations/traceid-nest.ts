import { getOrCreateTraceIdForRequest } from "./traceid-http";
import { runWithTraceId, getCurrentTraceId } from "../core/traceid-context";

export class TraceIdInterceptor {
  intercept(context: any, next: any): any {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const traceId = getOrCreateTraceIdForRequest(req);
    res.setHeader("trace-id", traceId);
    const result = next.handle();
    // best-effort: wrap subscribe if present
    if (result && typeof result.subscribe === "function") {
      const originalSubscribe = result.subscribe.bind(result);
      result.subscribe = (...args: any[]) => runWithTraceId(traceId, () => originalSubscribe(...args));
      return result;
    }
    return result;
  }
}

export class TraceIdService {
  getCurrentTraceId(): string | undefined {
    return getCurrentTraceId();
  }
}


