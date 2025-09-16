import type { IncomingMessageLike } from "./types";
import { getOrCreateTraceIdForRequest } from "./traceid-http";
import { runWithTraceId } from "../core/traceid-context";

const TRACE_ID_HEADER = "trace-id";

export function fastifyTraceIdPlugin(fastify: any, _opts: any, done: any) {
  fastify.addHook("onRequest", (req: any, reply: any, next: any) => {
    const raw: IncomingMessageLike = (req.raw ?? req);
    const traceId = getOrCreateTraceIdForRequest(raw);
    reply.header(TRACE_ID_HEADER, traceId);
    (req as any).traceId = traceId;
    runWithTraceId(traceId, () => next());
  });
  done();
}


