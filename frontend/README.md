# Frontend — Ticket Management System

Frontend built with **Next.js 16 (App Router)** for real-time visualization and registration of medical tickets.

## Stack

| Technology | Usage |
|---|---|
| Next.js 16 | Framework (App Router) |
| React 19 | UI |
| TypeScript 5 | Static typing |
| Socket.IO Client | Real-time WebSocket |
| CSS Modules | Scoped styles |

## Architecture

The project follows **Hexagonal Architecture (Ports & Adapters)** with Dependency Injection via React Context.

```
src/
├── domain/                  ← Entities and ports (interfaces)
│   ├── Ticket.ts
│   ├── CreateTicket.ts
│   └── ports/
│       ├── TicketWriter.ts
│       ├── TicketReader.ts
│       ├── RealTimeProvider.ts
│       ├── AudioNotifier.ts
│       └── InputSanitizer.ts
│
├── infrastructure/          ← Adapters (concrete implementations)
│   ├── adapters/
│   │   ├── HttpTicketAdapter.ts
│   │   ├── SocketIOAdapter.ts
│   │   ├── BrowserAudioAdapter.ts
│   │   └── HtmlSanitizer.ts
│   ├── http/
│   │   ├── CircuitBreaker.ts
│   │   └── httpClient.ts
│   └── mappers/
│       └── ticketMapper.ts
│
├── providers/               ← Dependency injection
│   └── DependencyProvider.tsx
│
├── hooks/                   ← Use cases
│   ├── useCreateTicket.ts
│   ├── useTicketsWebSocket.ts
│   └── useAudioNotification.ts
│
├── components/              ← UI components
│   ├── CreateTicketForm/
│   └── Navbar/
│
├── app/                     ← Pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx             ← Tickets screen
│   ├── dashboard/page.tsx   ← Served history
│   └── register/page.tsx    ← Registration form
│
├── config/env.ts            ← Environment variables
├── proxy.ts                 ← Security headers middleware
└── styles/                  ← CSS Modules
```

## SOLID Principles

- **SRP:** Each hook, adapter, and component has a single responsibility
- **OCP:** New transports (SSE, polling) are added by creating adapters without modifying hooks
- **LSP:** All adapters fulfill their port contracts
- **ISP:** `TicketWriter` and `TicketReader` segregated instead of a monolithic interface
- **DIP:** Hooks depend on ports (abstractions), not concrete implementations

## HTTP Resilience

The `httpClient` includes:
- **Circuit Breaker** — Fail-fast when backend is down
- **Retry with exponential backoff** — Intelligent retries
- **Timeout with AbortController** — Protection against hanging requests

## Anti-Corruption Layer

The `infrastructure/mappers/ticketMapper.ts` translates between the Spanish backend API contract (`nombre`, `cedula`, `estado`) and the English domain model (`name`, `documentId`, `status`). This keeps the domain clean while maintaining backend compatibility.

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Run

```bash
npm install
npm run dev
```

## Testing

Comprehensive test suite with **100 tests** across 14 suites using Jest + React Testing Library.

### Test Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

- **10 Unit Suites:** CircuitBreaker, ticketMapper, HtmlSanitizer, httpClient, BrowserAudioAdapter, HttpTicketAdapter, SocketIOAdapter, useCreateTicket, useTicketsWebSocket, useAudioNotification
- **4 Integration Suites:** DependencyProvider, CreateTicketForm, TicketsScreen, ServedDashboard
- **Mock Factories:** Zero external dependencies (HTTP, WebSocket, File System, Audio APIs)

All tests use fully isolated mock objects via `src/__tests__/mocks/factories.ts` — no real network calls, no real server required.

See [TEST_STRATEGY.md](./TEST_STRATEGY.md) for detailed testing documentation.

## Additional Documentation

See [docs/EXPLAIN_FRONT.md](../docs/EXPLAIN_FRONT.md) for detailed design pattern documentation.
