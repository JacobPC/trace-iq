import type { IncomingMessageLike, ServerResponseLike } from "./types";
import { generateTraceIdHex32, isValidTraceIdHex32 } from "../core/traceid";
import { runWithTraceId } from "../core/traceid-context";

const TRACE_ID_HEADER = "trace-id";

function readHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) return undefined;
  const value = (headers as any)[key];
  if (Array.isArray(value)) return value[0];
  return value as string | undefined;
}

export function getOrCreateTraceIdForRequest(req: IncomingMessageLike): string {
  const incoming = readHeaderValue(req.headers, TRACE_ID_HEADER);
  if (incoming && isValidTraceIdHex32(incoming)) return incoming;
  return generateTraceIdHex32();
}

export function withTraceIdHttp(
  handler: (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>
) {
  return function tracedHandler(req: IncomingMessageLike, res: ServerResponseLike) {
    const traceId = getOrCreateTraceIdForRequest(req);
    res.setHeader(TRACE_ID_HEADER, traceId);
    return runWithTraceId(traceId, () => handler(req, res));
  };
}

export function expressTraceIdMiddleware() {
  return function middleware(req: any, res: any, next: (err?: any) => void) {
    const traceId = getOrCreateTraceIdForRequest(req as IncomingMessageLike);
    res.setHeader(TRACE_ID_HEADER, traceId);
    runWithTraceId(traceId, () => next());
  };
}


