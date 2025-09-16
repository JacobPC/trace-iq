"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceIdAsyncLocalStorage = void 0;
exports.runWithTraceId = runWithTraceId;
exports.getCurrentTraceId = getCurrentTraceId;
const node_async_hooks_1 = require("node:async_hooks");
const traceid_1 = require("./traceid");
const flavor_1 = require("./flavor");
exports.traceIdAsyncLocalStorage = new node_async_hooks_1.AsyncLocalStorage();
function runWithTraceId(traceId, fn) {
    const id = traceId && (0, traceid_1.isValidTraceIdHex32)(traceId) ? traceId : (0, traceid_1.generateTraceIdHex32)();
    return (0, flavor_1.withTracingFlavor)("traceid", () => exports.traceIdAsyncLocalStorage.run({ traceId: id }, fn));
}
function getCurrentTraceId() {
    return exports.traceIdAsyncLocalStorage.getStore()?.traceId;
}
