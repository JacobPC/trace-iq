export type FetchLike = (input: any, init?: any) => Promise<any>;
export declare function withTraceIdFetch(baseFetch: FetchLike): FetchLike;
export declare function withTraceIdAxios(axiosInstance: any): any;
