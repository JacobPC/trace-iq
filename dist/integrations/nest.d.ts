import { TraceParent } from "../core/traceparent";
export declare class TraceInterceptor {
    intercept(context: any, next: any): any;
}
export declare class TraceService {
    getCurrentTrace(): TraceParent | undefined;
}
