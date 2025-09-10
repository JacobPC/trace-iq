import { describe, it, expect } from 'vitest';
import { TraceParent } from '../src/core/traceparent';
import { runWithTrace, getCurrentTrace } from '../src/core/context';

describe('Async context', () => {
  it('propagates across async/await and timers', async () => {
    const tp = TraceParent.generate();
    await runWithTrace(tp, async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 5));
      const current = getCurrentTrace();
      expect(current?.traceId).toBe(tp.traceId);
    });
  });
});


