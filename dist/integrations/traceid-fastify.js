"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastifyTraceIdPlugin = fastifyTraceIdPlugin;
const traceid_http_1 = require("./traceid-http");
const traceid_context_1 = require("../core/traceid-context");
const TRACE_ID_HEADER = "trace-id";
function fastifyTraceIdPlugin(fastify, _opts, done) {
    fastify.addHook("onRequest", (req, reply, next) => {
        const raw = (req.raw ?? req);
        const traceId = (0, traceid_http_1.getOrCreateTraceIdForRequest)(raw);
        reply.header(TRACE_ID_HEADER, traceId);
        req.traceId = traceId;
        (0, traceid_context_1.runWithTraceId)(traceId, () => next());
    });
    done();
}
