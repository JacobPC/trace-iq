"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koaTracingMiddleware = koaTracingMiddleware;
const http_1 = require("./http");
const context_1 = require("../core/context");
function koaTracingMiddleware() {
    return async function middleware(ctx, next) {
        const req = ctx.req;
        const trace = (0, http_1.getOrCreateTraceForRequest)(req);
        ctx.set("traceparent", trace.toString());
        if (trace.traceState)
            ctx.set("tracestate", trace.traceState);
        return (0, context_1.runWithTrace)(trace, () => next());
    };
}
