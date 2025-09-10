"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTracingFetch = withTracingFetch;
exports.withTracingAxios = withTracingAxios;
const traceparent_1 = require("../core/traceparent");
const context_1 = require("../core/context");
const TRACEPARENT_HEADER = "traceparent";
const TRACESTATE_HEADER = "tracestate";
function withTracingFetch(baseFetch) {
    return async function tracedFetch(input, init) {
        const current = (0, context_1.getCurrentTrace)();
        const child = current ? current.child() : traceparent_1.TraceParent.generate();
        const nextInit = { ...(init || {}) };
        nextInit.headers = { ...(init?.headers || {}) };
        nextInit.headers[TRACEPARENT_HEADER] = child.toString();
        if (child.traceState)
            nextInit.headers[TRACESTATE_HEADER] = child.traceState;
        return baseFetch(input, nextInit);
    };
}
function withTracingAxios(axiosInstance) {
    if (!axiosInstance || typeof axiosInstance.interceptors?.request?.use !== "function")
        return axiosInstance;
    axiosInstance.interceptors.request.use((config) => {
        const current = (0, context_1.getCurrentTrace)();
        const child = current ? current.child() : traceparent_1.TraceParent.generate();
        config.headers = config.headers || {};
        config.headers[TRACEPARENT_HEADER] = child.toString();
        if (child.traceState)
            config.headers[TRACESTATE_HEADER] = child.traceState;
        return config;
    });
    return axiosInstance;
}
