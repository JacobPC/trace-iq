## @common-sense/trace-iq

Tiny, framework-agnostic tracing for Node.js with two simple modes:
- W3C `traceparent` (spec-compliant, distributed)
- Minimal `trace-id` (simple, local correlation)

Plug-and-play for Express, NestJS, Koa, and Fastify with async context propagation and structured logging helpers.

### Why
- Keep tracing simple and standardized (W3C `traceparent`).
- Zero vendor lock-in, no heavy dependencies.
- Copy/paste integration in minutes, great DX.

### How it works
- Choose ONE mode per service:
  - Traceparent mode: W3C-compatible tracing with `traceparent`/`tracestate` headers.
  - Trace-id mode: Lightweight hex `trace-id` header for simple correlation.
- Async context: Propagates the active trace across async/await, Promises, timers.
- HTTP: Middlewares read incoming headers, set outgoing headers, and open a new child span (traceparent) or reuse/generate an id (trace-id).
- Logging: Structured JSON enriched with the active mode’s context.

### Install
```bash
npm install @common-sense/trace-iq
```

Node 18+. Works without `@types/node`. For decorators, enable `"experimentalDecorators": true` in your tsconfig.

---

## Choose your mode (pick one)

### A) Traceparent (W3C)
Use the `traceparent` entrypoint for best separation and tree-shaking. Generate, parse, child spans
```ts
import { TraceParent } from '@common-sense/trace-iq/traceparent';

const root = TraceParent.generate();
const parsed = TraceParent.parse('00-<trace-id>-<span-id>-01');
const child = root.child();
```

Run code with trace context
```ts
import { runWithTrace, getCurrentTrace } from '@common-sense/trace-iq/traceparent';

const trace = TraceParent.generate();
await runWithTrace(trace, async () => {
  const current = getCurrentTrace(); // { traceId, spanId, ... }
});
```

---

HTTP integrations

Express
```ts
import express from 'express';
import { expressTracingMiddleware } from '@common-sense/trace-iq/traceparent';

const app = express();
app.use(expressTracingMiddleware());
```

NestJS
Register a global interceptor; optionally inject `TraceService` anywhere to access the current trace.
```ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TraceInterceptor, TraceService } from '@common-sense/trace-iq/traceparent';

@Module({
  providers: [
    TraceService,
    { provide: APP_INTERCEPTOR, useClass: TraceInterceptor },
  ],
})
export class AppModule {}
```

Koa
```ts
import Koa from 'koa';
import { koaTracingMiddleware } from '@common-sense/trace-iq/traceparent';

const app = new Koa();
app.use(koaTracingMiddleware());
```

Fastify
```ts
import Fastify from 'fastify';
import { fastifyTracingPlugin } from '@common-sense/trace-iq/traceparent';

const app = Fastify();
app.register(fastifyTracingPlugin);
```

Node http (no framework)
```ts
import http from 'node:http';
import { withHttpTracing } from '@common-sense/trace-iq/traceparent';

const server = http.createServer(
  withHttpTracing(async (req, res) => {
    // getCurrentTrace() works here
    res.end('ok');
  })
);
server.listen(3000);
```

---

Logging

Structured JSON (batteries-included)
```ts
import { createConsoleJsonLogger, emitStructuredLog } from '@common-sense/trace-iq';

const logger = createConsoleJsonLogger();
emitStructuredLog(logger, 'info', 'user.created', { userId: '123' });
// => { timestamp, level: 'info', message: 'user.created', traceId, spanId, userId }
```

Inject trace into existing loggers
Winston
```ts
import winston from 'winston';
import { createWinstonTraceFormat } from '@common-sense/trace-iq';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(createWinstonTraceFormat(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
```

Pino
```ts
import pino from 'pino';
import { getPinoBaseBindings, pinoChildWithTrace } from '@common-sense/trace-iq';

const logger = pino({ base: { ...getPinoBaseBindings() } });
const reqLogger = pinoChildWithTrace(logger);
```

Bunyan
```ts
import bunyan from 'bunyan';
import { bunyanChildWithTrace } from '@common-sense/trace-iq';

const logger = bunyan.createLogger({ name: 'app' });
const reqLogger = bunyanChildWithTrace(logger);
```

Decorators and function wrapper
```ts
import { LogExecution, logFunction } from '@common-sense/trace-iq';

class Service {
  @LogExecution({ includeArgs: true })
  async doWork(userId: string) {
    // ...
  }
}

const wrapped = logFunction(async () => { /* ... */ }, { includeArgs: true });
```

---

### B) Simple trace-id
Use the `traceid` entrypoint for a minimal setup. Generate and run with trace-id
```ts
import { runWithTraceId, getCurrentTraceId } from '@common-sense/trace-iq/traceid';

await runWithTraceId(undefined, async () => {
  console.log(getCurrentTraceId());
});
```

HTTP integrations (trace-id header)
```ts
// Express
import { expressTraceIdMiddleware } from '@common-sense/trace-iq/traceid';
app.use(expressTraceIdMiddleware());

// Koa
import { koaTraceIdMiddleware } from '@common-sense/trace-iq/traceid';
app.use(koaTraceIdMiddleware());

// Fastify
import { fastifyTraceIdPlugin } from '@common-sense/trace-iq/traceid';
fastify.register(fastifyTraceIdPlugin);

// NestJS
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TraceIdInterceptor } from '@common-sense/trace-iq/traceid';
providers: [{ provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor }]
```

HTTP clients
```ts
import { withTraceIdFetch, withTraceIdAxios } from '@common-sense/trace-iq/traceid';
```

Logging uses the active mode automatically; if `traceparent` is set, logs include `traceId`+`spanId`, else they include `traceId` only.

---

## API (quick reference)
- Traceparent mode: `TraceParent.generate()`, `TraceParent.parse()`, `TraceParent#child()`, `runWithTrace()`
- Trace-id mode: `generateTraceIdHex32()`, `runWithTraceId()`
- HTTP (traceparent): `expressTracingMiddleware()`, `koaTracingMiddleware()`, `fastifyTracingPlugin`, `withHttpTracing()`
- HTTP (trace-id): `expressTraceIdMiddleware()`, `koaTraceIdMiddleware()`, `fastifyTraceIdPlugin`, `withTraceIdHttp()`
- HTTP clients: `withTracingFetch()`, `withTracingAxios()`, `withTraceIdFetch()`, `withTraceIdAxios()`
- Logging: `createConsoleJsonLogger()`, `emitStructuredLog()`, `createWinstonTraceFormat()`, `getPinoBaseBindings()`, `pinoChildWithTrace()`, `bunyanChildWithTrace()`, `LogExecution()`

---

## Notes
- Pick one mode per service; do not register both sets of middlewares.
- W3C `traceparent` format: `version-traceId-spanId-flags` (lowercase hex). Non-zero IDs, version not `ff`.
- If you use decorators, enable `"experimentalDecorators": true` in your tsconfig.


