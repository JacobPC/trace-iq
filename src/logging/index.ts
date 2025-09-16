import { getCurrentTrace } from "../core/context";
import { getCurrentTraceId } from "../core/traceid-context";
import { getCurrentTracingFlavor } from "../core/flavor";

export type TraceLogContext = {
  traceId?: string;
  spanId?: string;
};

export function getTraceLogContext(): TraceLogContext | undefined {
  const flavor = getCurrentTracingFlavor();
  if (flavor === "traceparent") {
    const tp = getCurrentTrace();
    if (tp) return { traceId: tp.traceId, spanId: tp.spanId };
  } else if (flavor === "traceid") {
    const id = getCurrentTraceId();
    if (id) return { traceId: id };
  } else {
    // if no flavor set, prefer traceparent if present, else traceid
    const tp = getCurrentTrace();
    if (tp) return { traceId: tp.traceId, spanId: tp.spanId };
    const id = getCurrentTraceId();
    if (id) return { traceId: id };
  }
  return undefined;
}

function isoTimestamp(): string {
  return new Date().toISOString();
}

export function enrichWithTrace<T extends Record<string, any>>(payload: T): T & TraceLogContext {
  const ctx = getTraceLogContext();
  return ctx ? ({ ...payload, ...ctx }) : payload;
}

export function emitStructuredLog(
  logger: any | undefined,
  level: "fatal" | "error" | "warn" | "info" | "debug" | "trace",
  message: string,
  extra: Record<string, any> = {}
): void {
  const base = enrichWithTrace({ ...extra, level, message, timestamp: isoTimestamp() });
  if (logger && typeof logger[level] === "function") {
    try {
      logger[level](base);
      return;
    } catch {}
  }
  const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  (console as any)[consoleMethod](JSON.stringify(base));
}

export function createWinstonTraceFormat(): any {
  let winstonFormat: any;
  try {
    winstonFormat = require("winston").format;
  } catch (e) {
    throw new Error("createWinstonTraceFormat requires 'winston' to be installed as a dependency");
  }
  return winstonFormat((info: any) => {
    const ctx = getTraceLogContext();
    if (ctx) Object.assign(info, ctx);
    if (!info.timestamp) info.timestamp = isoTimestamp();
    return info;
  })();
}

export function getPinoBaseBindings(): Record<string, any> {
  const ctx = getTraceLogContext();
  return ctx ? { ...ctx } : {};
}

export function pinoChildWithTrace(pinoLogger: any): any {
  const bindings = getPinoBaseBindings();
  return typeof pinoLogger?.child === "function" ? pinoLogger.child(bindings) : pinoLogger;
}

export function bunyanChildWithTrace(bunyanLogger: any): any {
  const bindings = getPinoBaseBindings();
  return typeof bunyanLogger?.child === "function" ? bunyanLogger.child(bindings) : bunyanLogger;
}

export function attachTraceToLogger<T extends Record<string, any>>(logger: T): T {
  const levels = ["fatal", "error", "warn", "info", "debug", "trace"] as const;
  const wrapper: any = Object.create(Object.getPrototypeOf(logger));
  Object.assign(wrapper, logger);
  for (const lvl of levels) {
    if (typeof (logger as any)[lvl] === "function") {
      wrapper[lvl] = (obj: any, maybeMsg?: any) => {
        const payload = enrichWithTrace({ timestamp: isoTimestamp(), ...(obj || {}) });
        try {
          return (logger as any)[lvl](payload, maybeMsg);
        } catch {
          return (logger as any)[lvl](payload);
        }
      };
    }
  }
  return wrapper as T;
}

export type SimpleLogger = {
  fatal?: (obj: any) => void;
  error: (obj: any) => void;
  warn: (obj: any) => void;
  info: (obj: any) => void;
  debug?: (obj: any) => void;
  trace?: (obj: any) => void;
};

export function createConsoleJsonLogger(): SimpleLogger {
  return {
    error: (obj: any) => console.error(JSON.stringify({ timestamp: isoTimestamp(), level: "error", ...enrichWithTrace(obj || {}) })),
    warn: (obj: any) => console.warn(JSON.stringify({ timestamp: isoTimestamp(), level: "warn", ...enrichWithTrace(obj || {}) })),
    info: (obj: any) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "info", ...enrichWithTrace(obj || {}) })),
    debug: (obj: any) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "debug", ...enrichWithTrace(obj || {}) })),
    trace: (obj: any) => console.log(JSON.stringify({ timestamp: isoTimestamp(), level: "trace", ...enrichWithTrace(obj || {}) })),
  };
}


