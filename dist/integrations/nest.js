"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceService = exports.TraceInterceptor = void 0;
const http_1 = require("./http");
const context_1 = require("../core/context");
function wrapObservableWithTrace(trace, source) {
    if (!source || typeof source.subscribe !== "function")
        return source;
    const originalSubscribe = source.subscribe.bind(source);
    source.subscribe = (...args) => (0, context_1.runWithTrace)(trace, () => originalSubscribe(...args));
    return source;
}
class TraceInterceptor {
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const trace = (0, http_1.getOrCreateTraceForRequest)(req);
        res.setHeader("traceparent", trace.toString());
        if (trace.traceState)
            res.setHeader("tracestate", trace.traceState);
        const result = next.handle();
        return wrapObservableWithTrace(trace, result);
    }
}
exports.TraceInterceptor = TraceInterceptor;
class TraceService {
    getCurrentTrace() {
        return (0, context_1.getCurrentTrace)();
    }
}
exports.TraceService = TraceService;
