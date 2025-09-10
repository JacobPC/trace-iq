import { describe, it, expect } from 'vitest';
import { TraceParent } from '../src/core/traceparent';
import { runWithTrace } from '../src/core/context';
import { createConsoleJsonLogger, emitStructuredLog, enrichWithTrace } from '../src/logging/index';

describe('Logging', () => {
  it('enriches payload with traceId/spanId', async () => {
    const tp = TraceParent.generate();
    await runWithTrace(tp, async () => {
      const enriched = enrichWithTrace({ foo: 'bar' });
      expect(enriched.traceId).toBe(tp.traceId);
      expect(enriched.spanId).toBe(tp.spanId);
    });
  });

  it('emits structured JSON via console logger', async () => {
    const tp = TraceParent.generate();
    const logger = createConsoleJsonLogger();
    let out = '';
    const orig = console.log;
    console.log = (msg?: any) => { out = String(msg); };
    try {
      await runWithTrace(tp, async () => {
        emitStructuredLog(logger, 'info', 'test', { a: 1 });
      });
      const obj = JSON.parse(out);
      expect(obj.level).toBe('info');
      expect(obj.message).toBe('test');
      expect(obj.traceId).toBe(tp.traceId);
      expect(obj.spanId).toBe(tp.spanId);
    } finally {
      console.log = orig;
    }
  });
});


