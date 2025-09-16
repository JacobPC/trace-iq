"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koaTraceIdMiddleware = koaTraceIdMiddleware;
const traceid_http_1 = require("./traceid-http");
const traceid_context_1 = require("../core/traceid-context");
function koaTraceIdMiddleware() {
    return async function middleware(ctx, next) {
        const req = ctx.req;
        const traceId = (0, traceid_http_1.getOrCreateTraceIdForRequest)(req);
        ctx.set("trace-id", traceId);
        return (0, traceid_context_1.runWithTraceId)(traceId, () => next());
    };
}
