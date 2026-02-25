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
│   ├── AppointmentRegistrationForm/
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

Comprehensive test suite with **136 tests** across 17 suites using Jest + React Testing Library.

**Coverage:** 99.18% statements · 99.42% lines · 95.83% branches

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

Tests mirror the hexagonal architecture of `src/` exactly:

```
src/__tests__/
├── infrastructure/
│   ├── adapters/    ← BrowserAudioAdapter, HtmlSanitizer, HttpTicketAdapter, SocketIOAdapter
│   ├── http/        ← CircuitBreaker, httpClient
│   └── mappers/     ← ticketMapper
├── hooks/           ← useCreateTicket, useTicketsWebSocket, useAudioNotification
├── providers/       ← DependencyProvider
├── components/      ← AppointmentRegistrationForm, CreateTicketForm, Navbar
├── app/             ← page (TicketsScreen), dashboard/page (ServedDashboard), register/page
└── mocks/           ← factories.ts (shared mock builders)
```

All tests use fully isolated mock objects via `src/__tests__/mocks/factories.ts` — no real network calls, no real server required.

