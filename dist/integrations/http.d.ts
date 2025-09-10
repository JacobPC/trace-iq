type IncomingHttpHeaders = Record<string, string | string[] | undefined>;
import type { IncomingMessageLike, ServerResponseLike } from "./types";
import { TraceParent } from "../core/traceparent";
export declare function extractOrCreateTraceFromHeaders(headers: IncomingHttpHeaders | Record<string, string | string[] | undefined>): TraceParent;
export declare function getOrCreateTraceForRequest(req: IncomingMessageLike): TraceParent;
export declare function withHttpTracing(handler: (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>): (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>;
export declare function expressTracingMiddleware(): (req: any, res: any, next: (err?: any) => void) => void;
export {};
