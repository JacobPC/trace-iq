type IncomingHttpHeaders = Record<string, string | string[] | undefined>;
import type { IncomingMessageLike, ServerResponseLike } from "./types";
import { TraceParent } from "../core/traceparent";
import { runWithTrace } from "../core/context";

const TRACEPARENT_HEADER = "traceparent";

function readHeaderValue(
  headers: IncomingHttpHeaders | Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) return undefined;
  const value = (headers as any)[key];
  if (Array.isArray(value)) return value[0];
  return value as string | undefined;
}

export function extractOrCreateTraceFromHeaders(
  headers: IncomingHttpHeaders | Record<string, string | string[] | undefined>
): TraceParent {
  const header = readHeaderValue(headers, TRACEPARENT_HEADER);
  if (!header) return TraceParent.generate();
  try {
    const parsed = TraceParent.parse(header);
    return parsed;
  } catch {
    return TraceParent.generate();
  }
}

export function getOrCreateTraceForRequest(req: IncomingMessageLike): TraceParent {
  const incoming = extractOrCreateTraceFromHeaders(req.headers);
  const hadHeader = !!readHeaderValue(req.headers, TRACEPARENT_HEADER);
  return hadHeader ? incoming.child() : incoming;
}

export function withHttpTracing(
  handler: (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>
) {
  return function tracedHandler(req: IncomingMessageLike, res: ServerResponseLike) {
    const trace = getOrCreateTraceForRequest(req);
    res.setHeader(TRACEPARENT_HEADER, trace.toString());
    return runWithTrace(trace, () => handler(req, res));
  };
}

export function expressTracingMiddleware() {
  return function middleware(req: any, res: any, next: (err?: any) => void) {
    const trace = getOrCreateTraceForRequest(req as IncomingMessageLike);
    res.setHeader(TRACEPARENT_HEADER, trace.toString());
    runWithTrace(trace, () => next());
  };
}


