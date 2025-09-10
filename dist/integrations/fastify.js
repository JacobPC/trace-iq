"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastifyTracingPlugin = fastifyTracingPlugin;
const http_1 = require("./http");
const context_1 = require("../core/context");
const TRACEPARENT_HEADER = "traceparent";
const TRACESTATE_HEADER = "tracestate";
function fastifyTracingPlugin(fastify, _opts, done) {
    fastify.addHook("onRequest", (req, reply, next) => {
        const raw = (req.raw ?? req);
        const trace = (0, http_1.getOrCreateTraceForRequest)(raw);
        reply.header(TRACEPARENT_HEADER, trace.toString());
        if (trace.traceState)
            reply.header(TRACESTATE_HEADER, trace.traceState);
        req.traceparent = trace;
        (0, context_1.runWithTrace)(trace, () => next());
    });
    done();
}
