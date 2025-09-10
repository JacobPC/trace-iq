"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogExecution = LogExecution;
exports.logFunction = logFunction;
const logging_1 = require("../logging");
function LogExecution(options = {}) {
    const { includeArgs = false, level = "info", logger } = options;
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            const className = target?.constructor?.name || target?.name || "UnknownClass";
            const methodName = String(propertyKey);
            const start = Date.now();
            const startPayload = {
                event: "function.start",
                class: className,
                method: methodName,
            };
            if (includeArgs)
                startPayload.args = args;
            (0, logging_1.emitStructuredLog)(logger, level, `${className}.${methodName} start`, startPayload);
            try {
                const result = original.apply(this, args);
                if (result && typeof result.then === "function") {
                    return result
                        .then((val) => {
                        const endPayload = {
                            event: "function.end",
                            class: className,
                            method: methodName,
                            durationMs: Date.now() - start,
                        };
                        (0, logging_1.emitStructuredLog)(logger, level, `${className}.${methodName} end`, endPayload);
                        return val;
                    })
                        .catch((err) => {
                        const errorPayload = {
                            event: "function.error",
                            class: className,
                            method: methodName,
                            durationMs: Date.now() - start,
                            error: { message: String(err?.message || err), stack: err?.stack },
                        };
                        (0, logging_1.emitStructuredLog)(logger, "error", `${className}.${methodName} error`, errorPayload);
                        throw err;
                    });
                }
                const endPayload = {
                    event: "function.end",
                    class: className,
                    method: methodName,
                    durationMs: Date.now() - start,
                };
                (0, logging_1.emitStructuredLog)(logger, level, `${className}.${methodName} end`, endPayload);
                return result;
            }
            catch (err) {
                const errorPayload = {
                    event: "function.error",
                    class: className,
                    method: methodName,
                    durationMs: Date.now() - start,
                    error: { message: String(err?.message || err), stack: err?.stack },
                };
                (0, logging_1.emitStructuredLog)(logger, "error", `${className}.${methodName} error`, errorPayload);
                throw err;
            }
        };
        return descriptor;
    };
}
function logFunction(fn, options = {}) {
    const { includeArgs = false, level = "info", logger } = options;
    const name = fn.name || "anonymous";
    const wrapped = function (...args) {
        const start = Date.now();
        const startPayload = { event: "function.start", function: name };
        if (includeArgs)
            startPayload.args = args;
        (0, logging_1.emitStructuredLog)(logger, level, `${name} start`, startPayload);
        try {
            const result = fn.apply(this, args);
            if (result && typeof result.then === "function") {
                return result
                    .then((val) => {
                    (0, logging_1.emitStructuredLog)(logger, level, `${name} end`, { event: "function.end", function: name, durationMs: Date.now() - start });
                    return val;
                })
                    .catch((err) => {
                    (0, logging_1.emitStructuredLog)(logger, "error", `${name} error`, { event: "function.error", function: name, durationMs: Date.now() - start, error: { message: String(err?.message || err), stack: err?.stack } });
                    throw err;
                });
            }
            (0, logging_1.emitStructuredLog)(logger, level, `${name} end`, { event: "function.end", function: name, durationMs: Date.now() - start });
            return result;
        }
        catch (err) {
            (0, logging_1.emitStructuredLog)(logger, "error", `${name} error`, { event: "function.error", function: name, durationMs: Date.now() - start, error: { message: String(err?.message || err), stack: err?.stack } });
            throw err;
        }
    };
    Object.defineProperty(wrapped, "name", { value: name, writable: false });
    return wrapped;
}
