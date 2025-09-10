export type IncomingMessageLike = {
    headers: Record<string, string | string[] | undefined>;
};
export type ServerResponseLike = {
    setHeader(name: string, value: string): void;
};
