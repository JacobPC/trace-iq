"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTracingFlavor = withTracingFlavor;
exports.getCurrentTracingFlavor = getCurrentTracingFlavor;
const node_async_hooks_1 = require("node:async_hooks");
const flavorAls = new node_async_hooks_1.AsyncLocalStorage();
function withTracingFlavor(flavor, fn) {
    return flavorAls.run({ flavor }, fn);
}
function getCurrentTracingFlavor() {
    return flavorAls.getStore()?.flavor;
}
