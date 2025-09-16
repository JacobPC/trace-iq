"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTraceIdFetch = withTraceIdFetch;
exports.withTraceIdAxios = withTraceIdAxios;
const traceid_context_1 = require("../core/traceid-context");
const traceid_1 = require("../core/traceid");
const TRACE_ID_HEADER = "trace-id";
function withTraceIdFetch(baseFetch) {
    return async function tracedFetch(input, init) {
        const current = (0, traceid_context_1.getCurrentTraceId)();
        const id = current ?? (0, traceid_1.generateTraceIdHex32)();
        const nextInit = { ...(init || {}) };
        nextInit.headers = { ...(init?.headers || {}) };
        nextInit.headers[TRACE_ID_HEADER] = id;
        return (0, traceid_context_1.runWithTraceId)(id, () => baseFetch(input, nextInit));
    };
}
function withTraceIdAxios(axiosInstance) {
    if (!axiosInstance || typeof axiosInstance.interceptors?.request?.use !== "function")
        return axiosInstance;
    axiosInstance.interceptors.request.use((config) => {
        const id = (0, traceid_context_1.getCurrentTraceId)() ?? (0, traceid_1.generateTraceIdHex32)();
        config.headers = config.headers || {};
        config.headers[TRACE_ID_HEADER] = id;
        return config;
    });
    return axiosInstance;
}
