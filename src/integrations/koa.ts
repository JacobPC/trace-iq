import type { IncomingMessageLike } from "./types";
import { getOrCreateTraceForRequest } from "./http";
import { runWithTrace } from "../core/context";

export function koaTracingMiddleware() {
  return async function middleware(ctx: any, next: () => Promise<void>) {
    const req = (ctx.req as IncomingMessageLike);
    const trace = getOrCreateTraceForRequest(req);
    ctx.set("traceparent", trace.toString());
    return runWithTrace(trace, () => next());
  };
}


