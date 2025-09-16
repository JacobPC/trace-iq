"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceAsyncLocalStorage = void 0;
exports.runWithTrace = runWithTrace;
exports.getCurrentTrace = getCurrentTrace;
const node_async_hooks_1 = require("node:async_hooks");
const flavor_1 = require("./flavor");
exports.traceAsyncLocalStorage = new node_async_hooks_1.AsyncLocalStorage();
function runWithTrace(trace, fn) {
    return (0, flavor_1.withTracingFlavor)("traceparent", () => exports.traceAsyncLocalStorage.run({ trace }, fn));
}
function getCurrentTrace() {
    return exports.traceAsyncLocalStorage.getStore()?.trace;
}
