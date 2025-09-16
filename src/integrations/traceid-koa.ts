import type { IncomingMessageLike } from "./types";
import { getOrCreateTraceIdForRequest } from "./traceid-http";
import { runWithTraceId } from "../core/traceid-context";

export function koaTraceIdMiddleware() {
  return async function middleware(ctx: any, next: () => Promise<void>) {
    const req = (ctx.req as IncomingMessageLike);
    const traceId = getOrCreateTraceIdForRequest(req);
    ctx.set("trace-id", traceId);
    return runWithTraceId(traceId, () => next());
  };
}


