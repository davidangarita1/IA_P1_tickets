# Frontend — Ticket Management System

Frontend built with **Next.js 16 (App Router)** for real-time visualization and registration of medical tickets, with full authentication (signUp / signIn / signOut) and role-based route protection.

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
│   ├── User.ts              ← User entity + UserRole type
│   ├── AuthCredentials.ts   ← AuthCredentials, SignUpData, AuthResult DTOs
│   └── ports/
│       ├── TicketWriter.ts
│       ├── TicketReader.ts
│       ├── RealTimeProvider.ts
│       ├── AudioNotifier.ts
│       ├── InputSanitizer.ts
│       └── AuthService.ts   ← Authentication port (interface)
│
├── infrastructure/          ← Adapters (concrete implementations)
│   ├── adapters/
│   │   ├── HttpTicketAdapter.ts
│   │   ├── SocketIOAdapter.ts
│   │   ├── BrowserAudioAdapter.ts
│   │   ├── HtmlSanitizer.ts
│   │   └── NoopAuthAdapter.ts   ← Stub adapter (no backend yet)
│   ├── http/
│   │   ├── CircuitBreaker.ts
│   │   └── httpClient.ts
│   ├── mappers/
│   │   ├── ticketMapper.ts
│   │   └── authMapper.ts        ← ACL: backend response → domain User/AuthResult
│   └── cookies/
│       └── cookieUtils.ts       ← set/get/remove auth token cookie
│
├── providers/               ← Dependency injection + auth context
│   ├── DependencyProvider.tsx       ← Includes AuthService in dependencies
│   ├── AuthProvider.tsx             ← Auth context (user, loading, error, actions)
│   └── ConnectedAuthProvider.tsx    ← Wires AuthService from DependencyProvider into AuthProvider
│
├── hooks/                   ← Use cases
│   ├── useCreateTicket.ts
│   ├── useTicketsWebSocket.ts
│   └── useAudioNotification.ts
│
├── components/              ← UI components
├── components/              ← UI components
│   ├── AppointmentRegistrationForm/
│   ├── CreateTicketForm/
│   ├── Navbar/              ← Conditionally rendered (authenticated users only)
│   ├── SignInForm/          ← Login form (email + password)
│   ├── SignUpForm/          ← Registration form (name + email + password)
│   ├── SignOutButton/       ← Logout button in Navbar
│   └── AuthGuard/           ← Route protection wrapper (redirects if not authenticated)
│
├── app/                     ← Pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx             ← Public: tickets screen
│   ├── signin/page.tsx      ← Public: login page
│   ├── signup/page.tsx      ← Public: registration page
│   ├── dashboard/page.tsx   ← Protected (AuthGuard): served history
│   └── register/page.tsx    ← Protected (AuthGuard): registration form
│
├── config/env.ts            ← Environment variables
├── proxy.ts                 ← Security headers + route protection middleware
└── styles/                  ← CSS Modules (including SignInForm, SignUpForm)
```

## Authentication

Authentication follows the same hexagonal pattern as the rest of the codebase — the UI depends on the `AuthService` port, never on a concrete adapter.

### Flow

```
/signup  →  SignUpForm  →  useAuth().signUp()  →  AuthProvider  →  AuthService port
/signin  →  SignInForm  →  useAuth().signIn()  →  AuthProvider  →  AuthService port
Navbar   →  SignOutButton  →  useAuth().signOut()
```

### Roles

| Role | How assigned | Access |
|---|---|---|
| `employee` | Default on signup (all new users) | Dashboard, Register |
| `admin` | Assigned directly in the database | Dashboard, Register |

New users created via `/signup` are always registered as `employee`. The `admin` role can only be granted at the database level.

> **Alcance de esta HU:** La ruta `/signup` permanece **pública** (sin autenticación requerida) para permitir el auto-registro de empleados. En un ciclo posterior se evaluará restringir el acceso al formulario de registro (por ejemplo, exigiendo un token de invitación o limitando el registro a administradores).

### Route Protection

- **`AuthGuard` component** — wraps `dashboard` and `register` pages; redirects to `/signin` if not authenticated.
- **`proxy.ts` middleware` (current)** — applies security headers and HTTP method filtering only; it does **not** yet perform auth cookie validation or redirects. Edge-level auth checks are planned for a future iteration.

### Current Adapter

`NoopAuthAdapter` is the active adapter (no auth backend yet). It always returns `{ success: false, message: "Auth not configured" }`. Replace it with `HttpAuthAdapter` once the backend exposes the auth endpoints.

### AuthContext Interface

```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: AuthCredentials) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}
```

## SOLID Principles

- **SRP:** Each hook, adapter, and component has a single responsibility
- **OCP:** New auth providers (Firebase, Auth0) are added by creating adapters without modifying hooks or components
- **LSP:** All adapters fulfill their port contracts (`NoopAuthAdapter` and future `HttpAuthAdapter` are interchangeable)
- **ISP:** `TicketWriter`/`TicketReader` segregated; `AuthService` only exposes the 4 needed methods
- **DIP:** Hooks and components depend on ports (abstractions), not concrete implementations

## HTTP Resilience

The `httpClient` includes:
- **Circuit Breaker** — Fail-fast when backend is down
- **Retry with exponential backoff** — Intelligent retries
- **Timeout with AbortController** — Protection against hanging requests

## Anti-Corruption Layer

Two mappers translate between the Spanish backend API contract and the English domain model:

- `ticketMapper.ts` — `nombre`, `cedula`, `estado` → `name`, `documentId`, `status`
- `authMapper.ts` — `nombre`, `rol`, `usuario` → `name`, `role`, `user` (also maps `"empleado"` → `"employee"`)

## Campo Cédula — Validación

El campo **Cédula** del formulario de registro de turno acepta **únicamente valores numéricos**, ya que está diseñado exclusivamente para la **cédula de ciudadanía colombiana**, que es un identificador numérico de 6 a 10 dígitos emitido por la Registraduría Nacional del Estado Civil.

- ✅ Válido: `12345678`, `1023456789`
- ❌ Inválido: `abc`, `PE123456`, `12-34` (caracteres no numéricos)

Si se ingresan caracteres no numéricos, el campo muestra el mensaje de error:
> **"La cédula solo puede contener números"**

El botón **Registrar turno** permanece deshabilitado hasta que el formulario sea válido (nombre no vacío y cédula con solo dígitos).

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
AUTH_COOKIE_NAME=auth_token          # name of the session cookie
AUTH_COOKIE_MAX_AGE=86400            # cookie lifetime in seconds (24h)
```

## Run

```bash
npm install
npm run dev
```

## Testing

Comprehensive test suite with **225 tests** across 28 suites using Jest + React Testing Library.

**Coverage:** ~99.8% statements · 100% lines · ~99% branches

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
│   ├── adapters/    ← BrowserAudioAdapter, HtmlSanitizer, HttpTicketAdapter,
│   │                  SocketIOAdapter, NoopAuthAdapter
│   ├── http/        ← CircuitBreaker, httpClient
│   ├── mappers/     ← ticketMapper, authMapper
│   └── cookies/     ← cookieUtils
├── hooks/           ← useCreateTicket, useTicketsWebSocket, useAudioNotification, useAuth
├── providers/       ← DependencyProvider, AuthProvider, ConnectedAuthProvider
├── components/      ← CreateTicketForm, Navbar, SignInForm, SignUpForm,
│                      SignOutButton, AuthGuard
├── app/             ← page, dashboard/page, register/page, signin/page, signup/page
└── mocks/           ← factories.ts (shared mock builders including mockAuthService, buildUser)
```

All tests use fully isolated mock objects via `src/__tests__/mocks/factories.ts` — no real network calls, no real server required.

