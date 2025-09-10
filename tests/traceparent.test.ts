import { describe, it, expect } from 'vitest';
import { TraceParent } from '../src/core/traceparent';

describe('TraceParent', () => {
  it('generates valid traceparent', () => {
    const tp = TraceParent.generate();
    expect(tp.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(tp.spanId).toMatch(/^[0-9a-f]{16}$/);
    expect(tp.toString()).toMatch(/^\w{2}-[0-9a-f]{32}-[0-9a-f]{16}-\w{2}$/);
  });

  it('parses and validates header', () => {
    const tp = TraceParent.generate();
    const parsed = TraceParent.parse(tp.toString());
    expect(parsed.traceId).toBe(tp.traceId);
    expect(parsed.spanId).toBe(tp.spanId);
  });

  it('creates child with same traceId and new spanId', () => {
    const tp = TraceParent.generate();
    const child = tp.child();
    expect(child.traceId).toBe(tp.traceId);
    expect(child.spanId).not.toBe(tp.spanId);
  });

  it('carries tracestate when present', () => {
    const tp = TraceParent.parse(TraceParent.generate().toString(), 'vendor=k1');
    const child = tp.child();
    expect(child.traceState).toBe('vendor=k1');
  });
});


