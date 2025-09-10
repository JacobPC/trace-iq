"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTraceLogContext = getTraceLogContext;
exports.enrichWithTrace = enrichWithTrace;
exports.emitStructuredLog = emitStructuredLog;
exports.createWinstonTraceFormat = createWinstonTraceFormat;
exports.getPinoBaseBindings = getPinoBaseBindings;
exports.pinoChildWithTrace = pinoChildWithTrace;
exports.bunyanChildWithTrace = bunyanChildWithTrace;
exports.attachTraceToLogger = attachTraceToLogger;
exports.createConsoleJsonLogger = createConsoleJsonLogger;
const context_1 = require("../core/context");
function getTraceLogContext() {
    const tp = (0, context_1.getCurrentTrace)();
    if (!tp)
        return undefined;
    return { traceId: tp.traceId, spanId: tp.spanId };
}
function isoTimestamp() {
    return new Date().toISOString();
}
function enrichWithTrace(payload) {
    const ctx = getTraceLogContext();
    return ctx ? ({ ...payload, ...ctx }) : payload;
}
function emitStructuredLog(logger, level, message, extra = {}) {
    const base = enrichWithTrace({ ...extra, level, message, timestamp: isoTimestamp() });
    if (logger && typeof logger[level] === "function") {
        try {
            logger[level](base);
            return;
        }
        catch { }
    }
    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleMethod](JSON.stringify(base));
}
function createWinstonTraceFormat() {
    let winstonFormat;
    try {
        winstonFormat = require("winston").format;
    }
    catch (e) {
        throw new Error("createWinstonTraceFormat requires 'winston' to be installed as a dependency");
    }
    return winstonFormat((info) => {
        const ctx = getTraceLogContext();
        if (ctx)
            Object.assign(info, ctx);
        if (!info.timestamp)
            info.timestamp = isoTimestamp();
        return info;
    })();
}
function getPinoBaseBindings() {
    const ctx = getTraceLogContext();
    return ctx ? { ...ctx } : {};
}
function pinoChildWithTrace(pinoLogger) {
    const bindings = getPinoBaseBindings();
    return typeof pinoLogger?.child === "function" ? pinoLogger.child(bindings) : pinoLogger;
}
function bunyanChildWithTrace(bunyanLogger) {
    const bindings = getPinoBaseBindings();
    return typeof bunyanLogger?.child === "function" ? bunyanLogger.child(bindings) : bunyanLogger;
}
function attachTraceToLogger(logger) {
    const levels = ["fatal", "error", "warn", "info", "debug", "trace"];
    const wrapper = Object.create(Object.getPrototypeOf(logger));
    Object.assign(wrapper, logger);
    for (const lvl of levels) {
        if (typeof logger[lvl] === "function") {
            wrapper[lvl] = (obj, maybeMsg) => {
                const payload = enrichWithTrace({ timestamp: isoTimestamp(), ...(obj || {}) });
                try {
                    return logger[lvl](payload, maybeMsg);
                }
                catch {
                    return logger[lvl](payload);
                }
            };
        }
    }
    return wrapper;
}
function createConsoleJsonLogger() {
    return {
        error: (obj) => console.error(JSON.stringify({ timestamp: isoTimestamp(), level: "error", ...enrichWithTrace(obj || {}) })),
        warn: (obj) => console.warn(JSON.stringify({ timestamp: isoTimestamp(), level: "warn", ...enrichWithTrace(obj || {}) })),
        info: (obj) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "info", ...enrichWithTrace(obj || {}) })),
        debug: (obj) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "debug", ...enrichWithTrace(obj || {}) })),
        trace: (obj) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "trace", ...enrichWithTrace(obj || {}) })),
    };
}
