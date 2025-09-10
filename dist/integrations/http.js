"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOrCreateTraceFromHeaders = extractOrCreateTraceFromHeaders;
exports.getOrCreateTraceForRequest = getOrCreateTraceForRequest;
exports.withHttpTracing = withHttpTracing;
exports.expressTracingMiddleware = expressTracingMiddleware;
const traceparent_1 = require("../core/traceparent");
const context_1 = require("../core/context");
const TRACEPARENT_HEADER = "traceparent";
const TRACESTATE_HEADER = "tracestate";
function readHeaderValue(headers, name) {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key)
        return undefined;
    const value = headers[key];
    if (Array.isArray(value))
        return value[0];
    return value;
}
function extractOrCreateTraceFromHeaders(headers) {
    const header = readHeaderValue(headers, TRACEPARENT_HEADER);
    const tracestate = readHeaderValue(headers, TRACESTATE_HEADER);
    if (!header)
        return traceparent_1.TraceParent.generate();
    try {
        const parsed = traceparent_1.TraceParent.parse(header, tracestate);
        return parsed;
    }
    catch {
        return traceparent_1.TraceParent.generate();
    }
}
function getOrCreateTraceForRequest(req) {
    const incoming = extractOrCreateTraceFromHeaders(req.headers);
    const hadHeader = !!readHeaderValue(req.headers, TRACEPARENT_HEADER);
    return hadHeader ? incoming.child() : incoming;
}
function withHttpTracing(handler) {
    return function tracedHandler(req, res) {
        const trace = getOrCreateTraceForRequest(req);
        res.setHeader(TRACEPARENT_HEADER, trace.toString());
        if (trace.traceState)
            res.setHeader(TRACESTATE_HEADER, trace.traceState);
        return (0, context_1.runWithTrace)(trace, () => handler(req, res));
    };
}
function expressTracingMiddleware() {
    return function middleware(req, res, next) {
        const trace = getOrCreateTraceForRequest(req);
        res.setHeader(TRACEPARENT_HEADER, trace.toString());
        if (trace.traceState)
            res.setHeader(TRACESTATE_HEADER, trace.traceState);
        (0, context_1.runWithTrace)(trace, () => next());
    };
}
