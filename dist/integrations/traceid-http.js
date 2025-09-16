"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateTraceIdForRequest = getOrCreateTraceIdForRequest;
exports.withTraceIdHttp = withTraceIdHttp;
exports.expressTraceIdMiddleware = expressTraceIdMiddleware;
const traceid_1 = require("../core/traceid");
const traceid_context_1 = require("../core/traceid-context");
const TRACE_ID_HEADER = "trace-id";
function readHeaderValue(headers, name) {
    const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key)
        return undefined;
    const value = headers[key];
    if (Array.isArray(value))
        return value[0];
    return value;
}
function getOrCreateTraceIdForRequest(req) {
    const incoming = readHeaderValue(req.headers, TRACE_ID_HEADER);
    if (incoming && (0, traceid_1.isValidTraceIdHex32)(incoming))
        return incoming;
    return (0, traceid_1.generateTraceIdHex32)();
}
function withTraceIdHttp(handler) {
    return function tracedHandler(req, res) {
        const traceId = getOrCreateTraceIdForRequest(req);
        res.setHeader(TRACE_ID_HEADER, traceId);
        return (0, traceid_context_1.runWithTraceId)(traceId, () => handler(req, res));
    };
}
function expressTraceIdMiddleware() {
    return function middleware(req, res, next) {
        const traceId = getOrCreateTraceIdForRequest(req);
        res.setHeader(TRACE_ID_HEADER, traceId);
        (0, traceid_context_1.runWithTraceId)(traceId, () => next());
    };
}
