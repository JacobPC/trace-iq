"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceIdService = exports.TraceIdInterceptor = void 0;
const traceid_http_1 = require("./traceid-http");
const traceid_context_1 = require("../core/traceid-context");
class TraceIdInterceptor {
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const traceId = (0, traceid_http_1.getOrCreateTraceIdForRequest)(req);
        res.setHeader("trace-id", traceId);
        const result = next.handle();
        // best-effort: wrap subscribe if present
        if (result && typeof result.subscribe === "function") {
            const originalSubscribe = result.subscribe.bind(result);
            result.subscribe = (...args) => (0, traceid_context_1.runWithTraceId)(traceId, () => originalSubscribe(...args));
            return result;
        }
        return result;
    }
}
exports.TraceIdInterceptor = TraceIdInterceptor;
class TraceIdService {
    getCurrentTraceId() {
        return (0, traceid_context_1.getCurrentTraceId)();
    }
}
exports.TraceIdService = TraceIdService;
