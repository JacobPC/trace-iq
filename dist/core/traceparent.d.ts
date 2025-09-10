export type TraceParentInit = {
    version?: string;
    traceId?: string;
    spanId?: string;
    flags?: string;
    parentSpanId?: string;
    traceState?: string;
};
export declare class TraceParent {
    readonly version: string;
    readonly traceId: string;
    readonly spanId: string;
    readonly flags: string;
    readonly parentSpanId?: string;
    readonly traceState?: string;
    private constructor();
    static generate(init?: Partial<TraceParentInit>): TraceParent;
    static generateTraceId(): string;
    static generateSpanId(): string;
    static parse(header: string, traceState?: string): TraceParent;
    toString(): string;
    child(): TraceParent;
    withSampled(sampled: boolean): TraceParent;
    get sampled(): boolean;
    static validate(tp: TraceParent): boolean;
}
