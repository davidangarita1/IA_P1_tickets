# HUMAN_CHECK.md — feature/authentication

> Comprehensive audit and verification guide for the authentication feature branch.
> Intended for human reviewers to understand complex test logic, architecture decisions, and coverage rationale.

---

## 1. Architecture Overview

```
Domain Layer (pure TS, zero deps)
├── Ticket.ts, User.ts, CreateTicket.ts, AuthCredentials.ts
└── ports/ (interfaces only)
    ├── TicketWriter, TicketReader, RealTimeProvider
    ├── AudioNotifier, Sanitizer, AuthService

Infrastructure Layer (adapters implementing ports)
├── HttpTicketAdapter     → TicketWriter & TicketReader
├── SocketIOAdapter       → RealTimeProvider
├── BrowserAudioAdapter   → AudioNotifier
├── HtmlSanitizer         → Sanitizer
├── NoopAuthAdapter       → AuthService (fallback)
├── cookieUtils           → JWT cookie persistence
├── httpClient            → HTTP with retries + CircuitBreaker
└── mappers/              → Anti-Corruption Layer (ES ↔ EN)

Providers (dependency injection via React Context)
├── DependencyProvider    → wires all adapters
├── AuthProvider          → authentication state machine
└── ConnectedAuthProvider → bridges DI → Auth

Presentation (pages + components)
├── page.tsx (/)           → public ticket screen
├── dashboard/page.tsx     → AuthGuard-protected served history
├── register/page.tsx      → AuthGuard-protected ticket form
├── signin/page.tsx        → public sign-in
├── signup/page.tsx        → public sign-up
└── components/            → AuthGuard, Navbar, forms
```

### SOLID Compliance

| Principle | Implementation |
|-----------|---------------|
| **S** — Single Responsibility | Each adapter handles one concern; forms only render; hooks only manage state |
| **O** — Open/Closed | New auth strategies extend `AuthService` port without modifying consumers |
| **L** — Liskov Substitution | `NoopAuthAdapter` is substitutable for any `AuthService` implementation |
| **I** — Interface Segregation | Separate `TicketWriter` / `TicketReader` instead of a single CRUD port |
| **D** — Dependency Inversion | Components depend on port interfaces via `DependencyProvider`, never on concrete adapters |

---

## 2. Test Classification: Verificar vs Validar

### Verificar (Verify — Unit Mechanics)
Tests that check **structural correctness**: function calls, return types, state transitions, rendering.

**Examples:**
- `"connects on mount and disconnects on unmount"` — verifies lifecycle management
- `"returns initial state: not loading, no success, no error"` — verifies hook initialization
- `"calls httpGet with correct URL and maps results"` — verifies adapter wiring
- `"provides all overridden dependencies via context"` — verifies DI container

### Validar (Validate — Business Rules)
Tests that enforce **domain invariants and business requirements**: authorization, sanitization, error handling, user-facing behavior.

**Examples:**
- `"redirects to /signin when user is not authenticated"` — validates access control
- `"shows 'required' error when name is empty"` — validates form business rules
- `"removes angle brackets"` / `"removes 'script' keyword"` — validates XSS protection
- `"sets error message on TIMEOUT failure"` → `"El servidor tardó demasiado"` — validates user-facing error translation
- `"prevents duplicate in-flight requests"` — validates race condition guard
- `"maps rol 'empleado' to role 'employee'"` — validates ACL translation rule

---

## 3. Complex Test Explanations

### 3.1 Notification Logic (page.spec.tsx & dashboard/page.spec.tsx)

These tests verify a two-phase initialization pattern that prevents false notifications on the first data load:

```typescript
// Phase 1: First render — initialize without notifying
const { rerender } = render(<TicketsScreen />);
// At this point: initializedRef = false, lastCountRef = 0
// The component sets lastCountRef = tickets.length and returns early

// Phase 2: Rerender with MORE tickets — should notify
act(() => {
  mockUseTicketsWebSocket.mockReturnValue({
    tickets: [calledTicket, calledTicket2],  // count increased
    ...
  });
});
rerender(<TicketsScreen />);
// Now: initializedRef = true, tickets.length (2) > lastCountRef (1) → notify()

expect(mockNotify).toHaveBeenCalledWith("🔔 Nuevo turno llamado");
```

**Why this is complex:** The test must simulate the React lifecycle across multiple renders. The `lastCountRef` / `initializedRef` pattern avoids notifying on initial data load (which could contain many pre-existing tickets). Only subsequent _increases_ in count trigger audio.

**Dead branch removed:** The original code used `useRef<number | null>(null)` with `(lastCountRef.current ?? 0)`. Since `lastCountRef.current` is always assigned before the comparison, the `?? 0` fallback was dead code. Changed to `useRef(0)` to eliminate the uncoverable branch.

### 3.2 Cookie Environment Branches (cookieUtils.spec.ts)

The `cookieUtils.ts` module evaluates `process.env` at import time (lines 1–6):

```typescript
export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "auth_token";

const _parsedMaxAge = Number(process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE);
const AUTH_COOKIE_MAX_AGE =
  Number.isInteger(_parsedMaxAge) && _parsedMaxAge > 0 ? _parsedMaxAge : 86400;
```

To cover all branches, tests use `jest.resetModules()` + dynamic `await import()`:

```typescript
beforeEach(() => {
  jest.resetModules();  // flush module cache before each test
});

it("uses NEXT_PUBLIC_AUTH_COOKIE_NAME when defined", async () => {
  process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_NAME: "custom_session" };

  // Dynamic import forces module re-evaluation with new env
  const { AUTH_COOKIE_NAME: name } = await import("@/infrastructure/cookies/cookieUtils");

  expect(name).toBe("custom_session");
});
```

**Why this is complex:** Module-level constants are evaluated once at import time. Standard mocking (`jest.mock`) applies before the test file runs, but these tests need _different_ env values per test case. `jest.resetModules()` clears the module cache so each `await import()` re-executes the module-level code with the current `process.env`.

**Branches covered:**
- `NEXT_PUBLIC_AUTH_COOKIE_NAME` present → uses env value
- `NEXT_PUBLIC_AUTH_COOKIE_NAME` absent → falls back to `"auth_token"`
- `NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE` valid integer → uses env value
- `NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE` NaN / negative / float → falls back to `86400`
- `NODE_ENV === "production"` → appends `; Secure`
- `NODE_ENV !== "production"` → omits `; Secure`

### 3.3 Circuit Breaker State Machine (CircuitBreaker.spec.ts)

Tests cover the full state machine: `CLOSED → OPEN → HALF_OPEN → CLOSED/OPEN`

```
CLOSED ──[threshold failures]──→ OPEN ──[cooldown expires]──→ HALF_OPEN
  ↑                                                              │
  └──────────[success()]──────────────────────────────────────────┘
                                                              │
                                         [fail()]─→ OPEN ←───┘
```

Key test: `"transitions to HALF_OPEN after cooldown expires"` uses `jest.spyOn(Date, "now")` to simulate time passing without real delays.

### 3.4 httpClient Timeout Abort (httpClient.spec.ts)

```typescript
it("fires the abort callback when the timeout elapses before fetch resolves", async () => {
  jest.useFakeTimers();
  // Mock fetch to wait for abort signal
  mockFetch.mockImplementation((_url, opts) => {
    return new Promise((_resolve, reject) => {
      opts.signal?.addEventListener("abort", () => {
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    });
  });

  const promise = httpGet("http://localhost:3000/test", { timeout: 50, retries: 0 });
  jest.advanceTimersByTime(51);  // fires setTimeout(() => controller.abort(), 50)

  await expect(promise).rejects.toThrow("TIMEOUT");
  jest.useRealTimers();
});
```

**Why this is complex:** This test exercises the actual `setTimeout(() => controller.abort(), timeout)` callback that would otherwise never fire in tests (because mocked fetch resolves instantly). By using fake timers and making fetch wait for the abort signal, we verify the abort mechanism works end-to-end.

### 3.5 AuthProvider State Machine (AuthProvider.spec.tsx)

The `AuthProvider` manages a complex authentication state:

```
                  ┌─ signIn(success) → user set, isAuthenticated=true
Initial ─→ getSession() ─→ │
                  └─ signIn(failure) → error set, user=null
                  ┌─ signUp(success) → user set, isAuthenticated=true
                  └─ signUp(failure) → error set, isAuthenticated=false
signOut() ─→ user=null, isAuthenticated=false
```

**Exception handling tests:** Two tests verify that when `authService.signIn` throws a non-Error (e.g., `"unexpected"`), the provider catches it and displays a fallback message: `"Ocurrió un error inesperado. Intente nuevamente."`. This is a **validar** test — it validates the business rule that user-facing errors must always be human-readable.

### 3.6 Duplicate Request Prevention (useCreateTicket.spec.ts)

```typescript
it("prevents duplicate in-flight requests", async () => {
  let resolvePromise;
  writer.createTicket.mockImplementation(
    () => new Promise((resolve) => { resolvePromise = resolve; })
  );

  // Fire two submits without awaiting
  act(() => {
    result.current.submit(dto);  // starts request, sets loading=true
    result.current.submit(dto);  // loading is true → early return
  });

  await act(async () => {
    resolvePromise!({ status: "accepted", message: "OK" });
  });

  expect(writer.createTicket).toHaveBeenCalledTimes(1);  // only one call
});
```

**Why this is complex:** Uses a deferred promise to keep the first request "in flight" while attempting a second submit. The `loading` guard in the hook prevents the duplicate call.

### 3.7 Unmount Safety (useCreateTicket.spec.ts)

```typescript
it("does not update state after component unmounts during in-flight request", async () => {
  // Start a request
  act(() => { result.current.submit(dto); });

  // Unmount before it resolves
  unmount();

  // Resolve the deferred promise
  await act(async () => {
    resolvePromise({ status: "accepted", message: "OK" });
  });

  // State should NOT have updated (prevents React warnings)
  expect(result.current.success).toBeNull();
});
```

**Why this is complex:** Validates that the hook uses a `mountedRef` pattern to avoid setting state on unmounted components, which would cause React memory leak warnings.

---

## 4. AAA Pattern Compliance

All 248 tests follow the **Arrange–Act–Assert** pattern. Notable fix applied:

**Before (AAA violation):**
```typescript
it("sets Max-Age on the cookie string", () => {
  const desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  if (!desc) return;  // ← SILENT SKIP — test passes without asserting
  // ...
});
```

**After (proper AAA):**
```typescript
it("sets Max-Age on the cookie string", () => {
  const desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  expect(desc).toBeDefined();  // ← FAIL FAST — test fails if descriptor missing
  // ...
});
```

---

## 5. Coverage Summary

| Metric | Before | After |
|--------|--------|-------|
| Statements | 99.8% | 100% |
| Branches | 97.59% | 100% |
| Functions | 98.3% | 100% |
| Lines | 100% | 100% |
| Tests | 234 | 248 |
| Suites | 28 | 28 |

### What was added to reach 100%:

| File | Gap | Fix |
|------|-----|-----|
| `page.tsx` | Dead `?? 0` branch (96.29% branches) | Changed `useRef<number \| null>(null)` to `useRef(0)` |
| `dashboard/page.tsx` | Dead `?? 0` branch (96% branches) | Same refactor as above |
| `cookieUtils.ts` | Env branches untested (71.42% branches) | Added 7 `jest.resetModules()` + dynamic import tests |
| `BrowserAudioAdapter.ts` | Play rejection uncovered (85.71% funcs) | Added play-rejection + no-init safety tests |
| `httpClient.ts` | Abort callback + httpPost errors (80% funcs) | Added fake-timer abort test + httpPost error scenarios |
| `cookieUtils.spec.ts` | AAA violation (`if (!desc) return`) | Replaced with `expect(desc).toBeDefined()` |

### Jest Configuration

Coverage thresholds enforced at 100%:

```typescript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
},
```

Single command for full report: `npx jest --coverage`

---

## 6. TDD Cycle Evidence (Git History)

| Phase | Commit | Description |
|-------|--------|-------------|
| **RED** | `bc6cc58` | `test(auth): RED phase — failing tests for authentication feature` |
| **GREEN** | `2b9c6b2` | `feat(auth): GREEN phase — implement authentication feature (HU-001)` |
| **REFACTOR** | `d89aeac` | `fix(auth): wire AuthProvider into layout via ConnectedAuthProvider` |
| **REFACTOR** | `beb7439` | `feat(auth): lowercase auth routes and add login button to home page` |
| **REFACTOR** | `68603e6` | `feat(signup): remove role selector — employees always registered as employee` |
| **REFACTOR** | `0e217d6` | `fix(auth): set loading=true during getSession initialization` |
| **REFACTOR** | `ec4acdd` | `fix(cookies): add Secure flag, explicit Max-Age, env-configurable cookie` |

---

## 7. Files Excluded from Coverage (Rationale)

| File | Reason |
|------|--------|
| `layout.tsx` | Next.js root layout — only metadata + provider wrappers, no testable logic |
| `proxy.ts` | Edge middleware — runs in Next.js edge runtime, not in jsdom |
| `env.ts` | Runtime env config — mocked globally in `setup.ts` |
| `styles/**` | CSS modules — visual only, no logic |
| `*.d.ts` | Type declarations — no runtime behavior |
| `__tests__/**` | Test files themselves |

---

## 8. Mutation-Resilient Test Patterns

The test suite is designed to catch mutations (e.g., Stryker-style):

1. **Exact value assertions:** `expect(result.current.error).toBe("El servidor tardó demasiado.")` — not just `toBeTruthy()`
2. **Negative assertions paired with positive:** `expect(audio.play).not.toHaveBeenCalled()` alongside enabled-play test
3. **Call count verification:** `expect(writer.createTicket).toHaveBeenCalledTimes(1)` catches duplicate-call mutations
4. **State-after-error checks:** `expect(result.current.success).toBeNull()` after error — catches mutations that forget to clear
5. **Boundary conditions:** Circuit breaker tested at threshold-1, threshold, and threshold+1
6. **Non-Error throwables:** Tests for `mockRejectedValueOnce("plain string")` and `mockRejectedValueOnce(null)` catch `instanceof Error` mutations
