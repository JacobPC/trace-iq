"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTraceIdHex32 = generateTraceIdHex32;
exports.isValidTraceIdHex32 = isValidTraceIdHex32;
function generateRandomBytes(length) {
    const globalCrypto = globalThis.crypto;
    if (globalCrypto && typeof globalCrypto.getRandomValues === "function") {
        const arr = new Uint8Array(length);
        globalCrypto.getRandomValues(arr);
        return arr;
    }
    try {
        const req = (Function("return require"))();
        const nodeCrypto = req("node:crypto");
        return nodeCrypto.randomBytes(length);
    }
    catch { }
    const arr = new Uint8Array(length);
    for (let i = 0; i < length; i++)
        arr[i] = Math.floor(Math.random() * 256);
    return arr;
}
function toHex(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        out += bytes[i].toString(16).padStart(2, "0");
    }
    return out;
}
function generateTraceIdHex32() {
    return toHex(generateRandomBytes(16));
}
function isValidTraceIdHex32(id) {
    return /^[0-9a-f]{32}$/.test(id) && !/^0+$/.test(id);
}
