"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceAsyncLocalStorage = void 0;
exports.runWithTrace = runWithTrace;
exports.getCurrentTrace = getCurrentTrace;
const node_async_hooks_1 = require("node:async_hooks");
exports.traceAsyncLocalStorage = new node_async_hooks_1.AsyncLocalStorage();
function runWithTrace(trace, fn) {
    return exports.traceAsyncLocalStorage.run({ trace }, fn);
}
function getCurrentTrace() {
    return exports.traceAsyncLocalStorage.getStore()?.trace;
}
