import { emitStructuredLog } from "../logging";

export type LogExecutionOptions = {
  includeArgs?: boolean;
  level?: "info" | "debug";
  logger?: any;
};

export function LogExecution(options: LogExecutionOptions = {}): MethodDecorator {
  const { includeArgs = false, level = "info", logger } = options;
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const className = target?.constructor?.name || target?.name || "UnknownClass";
      const methodName = String(propertyKey);
      const start = Date.now();
      const startPayload: any = {
        event: "function.start",
        class: className,
        method: methodName,
      };
      if (includeArgs) startPayload.args = args;
      emitStructuredLog(logger, level, `${className}.${methodName} start`, startPayload);
      try {
        const result = original.apply(this, args);
        if (result && typeof result.then === "function") {
          return result
            .then((val: any) => {
              const endPayload = {
                event: "function.end",
                class: className,
                method: methodName,
                durationMs: Date.now() - start,
              };
              emitStructuredLog(logger, level, `${className}.${methodName} end`, endPayload);
              return val;
            })
            .catch((err: any) => {
              const errorPayload = {
                event: "function.error",
                class: className,
                method: methodName,
                durationMs: Date.now() - start,
                error: { message: String(err?.message || err), stack: err?.stack },
              };
              emitStructuredLog(logger, "error", `${className}.${methodName} error`, errorPayload);
              throw err;
            });
        }
        const endPayload = {
          event: "function.end",
          class: className,
          method: methodName,
          durationMs: Date.now() - start,
        };
        emitStructuredLog(logger, level, `${className}.${methodName} end`, endPayload);
        return result;
      } catch (err: any) {
        const errorPayload = {
          event: "function.error",
          class: className,
          method: methodName,
          durationMs: Date.now() - start,
          error: { message: String(err?.message || err), stack: err?.stack },
        };
        emitStructuredLog(logger, "error", `${className}.${methodName} error`, errorPayload);
        throw err;
      }
    };
    return descriptor;
  };
}

export function logFunction<T extends (...args: any[]) => any>(
  fn: T,
  options: LogExecutionOptions = {}
): T {
  const { includeArgs = false, level = "info", logger } = options;
  const name = fn.name || "anonymous";
  const wrapped = function (this: any, ...args: any[]) {
    const start = Date.now();
    const startPayload: any = { event: "function.start", function: name };
    if (includeArgs) startPayload.args = args;
    emitStructuredLog(logger, level, `${name} start`, startPayload);
    try {
      const result = fn.apply(this, args);
      if (result && typeof result.then === "function") {
        return result
          .then((val: any) => {
            emitStructuredLog(logger, level, `${name} end`, { event: "function.end", function: name, durationMs: Date.now() - start });
            return val;
          })
          .catch((err: any) => {
            emitStructuredLog(logger, "error", `${name} error`, { event: "function.error", function: name, durationMs: Date.now() - start, error: { message: String(err?.message || err), stack: err?.stack } });
            throw err;
          });
      }
      emitStructuredLog(logger, level, `${name} end`, { event: "function.end", function: name, durationMs: Date.now() - start });
      return result;
    } catch (err: any) {
      emitStructuredLog(logger, "error", `${name} error`, { event: "function.error", function: name, durationMs: Date.now() - start, error: { message: String(err?.message || err), stack: err?.stack } });
      throw err;
    }
  } as unknown as T;
  Object.defineProperty(wrapped, "name", { value: name, writable: false });
  return wrapped;
}


