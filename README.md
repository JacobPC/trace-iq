## trace-iq

Tiny, framework-agnostic W3C Trace Context (traceparent) + async context propagation + structured logging helpers for Node.js. Plug-and-play for Express, NestJS, Koa, and Fastify.

### Why
- Keep tracing simple and standardized (W3C `traceparent`).
- Zero vendor lock-in, no heavy dependencies.
- Copy/paste integration in minutes, great DX.

### How it works
- Core: `TraceParent` handles generate/parse/validate/child per W3C spec.
- Context: `AsyncLocalStorage` stores the current `TraceParent` across async boundaries.
- HTTP: Middlewares read `traceparent` from requests, create child spans, and set the header on responses.
- Logging: Helpers inject `traceId` and `spanId` into structured JSON logs and common loggers.

### Install
```bash
npm install trace-iq
```

Node 18+. Works without `@types/node`. For decorators, enable `"experimentalDecorators": true` in your tsconfig.

---

## Quickstart

### Generate, parse, and create child spans
```ts
import { TraceParent } from 'trace-iq';

const root = TraceParent.generate();
const parsed = TraceParent.parse('00-<trace-id>-<span-id>-01');
const child = root.child();
```

### Run code with trace context
```ts
import { runWithTrace, getCurrentTrace } from 'trace-iq';

const trace = TraceParent.generate();
await runWithTrace(trace, async () => {
  const current = getCurrentTrace(); // { traceId, spanId, ... }
});
```

---

## HTTP integrations

### Express
```ts
import express from 'express';
import { expressTracingMiddleware } from 'trace-iq';

const app = express();
app.use(expressTracingMiddleware());
```

### NestJS
Register a global interceptor; optionally inject `TraceService` anywhere to access the current trace.
```ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TraceInterceptor, TraceService } from 'trace-iq';

@Module({
  providers: [
    TraceService,
    { provide: APP_INTERCEPTOR, useClass: TraceInterceptor },
  ],
})
export class AppModule {}
```

### Koa
```ts
import Koa from 'koa';
import { koaTracingMiddleware } from 'trace-iq';

const app = new Koa();
app.use(koaTracingMiddleware());
```

### Fastify
```ts
import Fastify from 'fastify';
import { fastifyTracingPlugin } from 'trace-iq';

const app = Fastify();
app.register(fastifyTracingPlugin);
```

### Node http (no framework)
```ts
import http from 'node:http';
import { withHttpTracing } from 'trace-iq';

const server = http.createServer(
  withHttpTracing(async (req, res) => {
    // getCurrentTrace() works here
    res.end('ok');
  })
);
server.listen(3000);
```

---

## Logging

### Structured JSON (batteries-included)
```ts
import { createConsoleJsonLogger, emitStructuredLog } from 'trace-iq';

const logger = createConsoleJsonLogger();
emitStructuredLog(logger, 'info', 'user.created', { userId: '123' });
// => { timestamp, level: 'info', message: 'user.created', traceId, spanId, userId }
```

### Inject trace into existing loggers
- Winston
```ts
import winston from 'winston';
import { createWinstonTraceFormat } from 'trace-iq';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(createWinstonTraceFormat(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
```

- Pino
```ts
import pino from 'pino';
import { getPinoBaseBindings, pinoChildWithTrace } from 'trace-iq';

const logger = pino({ base: { ...getPinoBaseBindings() } });
const reqLogger = pinoChildWithTrace(logger);
```

- Bunyan
```ts
import bunyan from 'bunyan';
import { bunyanChildWithTrace } from 'trace-iq';

const logger = bunyan.createLogger({ name: 'app' });
const reqLogger = bunyanChildWithTrace(logger);
```

### Decorators and function wrapper
```ts
import { LogExecution, logFunction } from 'trace-iq';

class Service {
  @LogExecution({ includeArgs: true })
  async doWork(userId: string) {
    // ...
  }
}

const wrapped = logFunction(async () => { /* ... */ }, { includeArgs: true });
```

---

## API (quick reference)
- Core: `TraceParent.generate()`, `TraceParent.parse()`, `TraceParent#child()`, `TraceParent#toString()`
- Context: `runWithTrace(trace, fn)`, `getCurrentTrace()`
- HTTP: `expressTracingMiddleware()`, `koaTracingMiddleware()`, `fastifyTracingPlugin`, `withHttpTracing(handler)`
- Logging: `createConsoleJsonLogger()`, `emitStructuredLog(logger, level, message, extra)`, `createWinstonTraceFormat()`
- Adapters: `getPinoBaseBindings()`, `pinoChildWithTrace(logger)`, `bunyanChildWithTrace(logger)`
- Extras: `LogExecution(options)`, `logFunction(fn, options)`

---

## Notes
- W3C `traceparent` format: `version-traceId-spanId-flags` (lowercase hex). Non-zero IDs, version not `ff`.
- We keep things unopinionated and light; integrate with your stack freely.
- If you use decorators, enable `"experimentalDecorators": true` in your tsconfig.


