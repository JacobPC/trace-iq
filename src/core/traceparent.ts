function generateRandomBytes(length: number): Uint8Array {
  const globalCrypto: any = (globalThis as any).crypto;
  if (globalCrypto && typeof globalCrypto.getRandomValues === "function") {
    const arr = new Uint8Array(length);
    globalCrypto.getRandomValues(arr);
    return arr;
  }
  try {
    const req: any = (Function("return require"))();
    const nodeCrypto = req("node:crypto");
    return nodeCrypto.randomBytes(length);
  } catch {}
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  return arr;
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function isLowercaseHex(str: string, expectedLength: number): boolean {
  return str.length === expectedLength && /^[0-9a-f]+$/.test(str);
}

function isAllZeros(str: string): boolean {
  return /^0+$/.test(str);
}

export type TraceParentInit = {
  version?: string;
  traceId?: string;
  spanId?: string;
  flags?: string;
  parentSpanId?: string;
  traceState?: string; // W3C tracestate header value
};

export class TraceParent {
  readonly version: string;
  readonly traceId: string;
  readonly spanId: string;
  readonly flags: string;
  readonly parentSpanId?: string;
  readonly traceState?: string;

  private constructor(init: TraceParentInit) {
    this.version = (init.version ?? "00").toLowerCase();
    this.traceId = (init.traceId ?? TraceParent.generateTraceId()).toLowerCase();
    this.spanId = (init.spanId ?? TraceParent.generateSpanId()).toLowerCase();
    this.flags = (init.flags ?? "01").toLowerCase();
    this.parentSpanId = init.parentSpanId;
    this.traceState = init.traceState;

    if (!TraceParent.validate(this)) {
      throw new Error("Invalid traceparent fields");
    }
  }

  static generate(init: Partial<TraceParentInit> = {}): TraceParent {
    return new TraceParent(init);
  }

  static generateTraceId(): string {
    return toHex(generateRandomBytes(16));
  }

  static generateSpanId(): string {
    return toHex(generateRandomBytes(8));
  }

  static parse(header: string, traceState?: string): TraceParent {
    const value = header.trim().toLowerCase();
    const parts = value.split("-");
    if (parts.length !== 4) {
      throw new Error("traceparent must have 4 parts");
    }
    const [version, traceId, spanId, flags] = parts;
    if (!isLowercaseHex(version, 2) || version === "ff") {
      throw new Error("Invalid traceparent version");
    }
    if (!isLowercaseHex(traceId, 32) || isAllZeros(traceId)) {
      throw new Error("Invalid trace-id");
    }
    if (!isLowercaseHex(spanId, 16) || isAllZeros(spanId)) {
      throw new Error("Invalid span-id");
    }
    if (!isLowercaseHex(flags, 2)) {
      throw new Error("Invalid flags");
    }
    return new TraceParent({ version, traceId, spanId, flags, traceState });
  }

  toString(): string {
    return `${this.version}-${this.traceId}-${this.spanId}-${this.flags}`;
  }

  child(): TraceParent {
    return new TraceParent({
      version: this.version,
      traceId: this.traceId,
      spanId: TraceParent.generateSpanId(),
      flags: this.flags,
      parentSpanId: this.spanId,
      traceState: this.traceState,
    });
  }

  withSampled(sampled: boolean): TraceParent {
    const flagsByte = parseInt(this.flags, 16);
    const newFlags = sampled ? (flagsByte | 0x01) : (flagsByte & ~0x01);
    return new TraceParent({
      version: this.version,
      traceId: this.traceId,
      spanId: this.spanId,
      flags: newFlags.toString(16).padStart(2, "0"),
      parentSpanId: this.parentSpanId,
    });
  }

  get sampled(): boolean {
    return (parseInt(this.flags, 16) & 0x01) === 0x01;
  }

  static validate(tp: TraceParent): boolean {
    if (!isLowercaseHex(tp.version, 2) || tp.version === "ff") return false;
    if (!isLowercaseHex(tp.traceId, 32) || isAllZeros(tp.traceId)) return false;
    if (!isLowercaseHex(tp.spanId, 16) || isAllZeros(tp.spanId)) return false;
    if (!isLowercaseHex(tp.flags, 2)) return false;
    return true;
  }
}


