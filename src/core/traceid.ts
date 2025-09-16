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

export function generateTraceIdHex32(): string {
  return toHex(generateRandomBytes(16));
}

export function isValidTraceIdHex32(id: string): boolean {
  return /^[0-9a-f]{32}$/.test(id) && !/^0+$/.test(id);
}


