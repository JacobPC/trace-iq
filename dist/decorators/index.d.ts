export type LogExecutionOptions = {
    includeArgs?: boolean;
    level?: "info" | "debug";
    logger?: any;
};
export declare function LogExecution(options?: LogExecutionOptions): MethodDecorator;
export declare function logFunction<T extends (...args: any[]) => any>(fn: T, options?: LogExecutionOptions): T;
