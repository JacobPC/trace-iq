import type { IncomingMessageLike, ServerResponseLike } from "./types";
export declare function getOrCreateTraceIdForRequest(req: IncomingMessageLike): string;
export declare function withTraceIdHttp(handler: (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>): (req: IncomingMessageLike, res: ServerResponseLike) => void | Promise<void>;
export declare function expressTraceIdMiddleware(): (req: any, res: any, next: (err?: any) => void) => void;
