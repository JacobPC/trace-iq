import { describe, it, expect } from 'vitest';
import { generateTraceIdHex32, isValidTraceIdHex32 } from '../src/core/traceid';
import { runWithTraceId, getCurrentTraceId } from '../src/core/traceid-context';

describe('trace-id', () => {
  it('generates valid 32-hex trace id', () => {
    const id = generateTraceIdHex32();
    expect(isValidTraceIdHex32(id)).toBe(true);
  });

  it('propagates via AsyncLocalStorage', async () => {
    await runWithTraceId(undefined, async () => {
      const id = getCurrentTraceId();
      expect(isValidTraceIdHex32(id!)).toBe(true);
    });
  });
});


