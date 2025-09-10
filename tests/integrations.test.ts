import { describe, it, expect } from 'vitest';
import { getOrCreateTraceForRequest } from '../src/integrations/http';

describe('Integrations', () => {
  it('extracts or creates trace from headers', () => {
    const req: any = { headers: {} };
    const tp = getOrCreateTraceForRequest(req);
    expect(tp.traceId).toMatch(/^[0-9a-f]{32}$/);
  });

  it('parses existing traceparent and creates child', () => {
    const req: any = { headers: {} };
    const tp = getOrCreateTraceForRequest(req);
    const childReq: any = { headers: { traceparent: tp.toString() } };
    const child = getOrCreateTraceForRequest(childReq);
    expect(child.traceId).toBe(tp.traceId);
    expect(child.spanId).not.toBe(tp.spanId);
  });
});


