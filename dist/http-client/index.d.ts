export type FetchLike = (input: any, init?: any) => Promise<any>;
export declare function withTracingFetch(baseFetch: FetchLike): FetchLike;
export declare function withTracingAxios(axiosInstance: any): any;
