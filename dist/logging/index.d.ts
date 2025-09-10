export type TraceLogContext = {
    traceId?: string;
    spanId?: string;
};
export declare function getTraceLogContext(): TraceLogContext | undefined;
export declare function enrichWithTrace<T extends Record<string, any>>(payload: T): T & TraceLogContext;
export declare function emitStructuredLog(logger: any | undefined, level: "fatal" | "error" | "warn" | "info" | "debug" | "trace", message: string, extra?: Record<string, any>): void;
export declare function createWinstonTraceFormat(): any;
export declare function getPinoBaseBindings(): Record<string, any>;
export declare function pinoChildWithTrace(pinoLogger: any): any;
export declare function bunyanChildWithTrace(bunyanLogger: any): any;
export declare function attachTraceToLogger<T extends Record<string, any>>(logger: T): T;
export type SimpleLogger = {
    fatal?: (obj: any) => void;
    error: (obj: any) => void;
    warn: (obj: any) => void;
    info: (obj: any) => void;
    debug?: (obj: any) => void;
    trace?: (obj: any) => void;
};
export declare function createConsoleJsonLogger(): SimpleLogger;
