import type { IncomingMessageLike } from "./types";
import { getOrCreateTraceForRequest } from "./http";
import { runWithTrace } from "../core/context";

const TRACEPARENT_HEADER = "traceparent";

export function fastifyTracingPlugin(fastify: any, _opts: any, done: any) {
  fastify.addHook("onRequest", (req: any, reply: any, next: any) => {
    const raw: IncomingMessageLike = (req.raw ?? req);
    const trace = getOrCreateTraceForRequest(raw);
    reply.header(TRACEPARENT_HEADER, trace.toString());
    (req as any).traceparent = trace;
    runWithTrace(trace, () => next());
  });
  done();
}


