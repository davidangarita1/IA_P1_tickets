# Plan de Implementación: Authentication (signUp, signIn, signOut)

## 1. Análisis de Requisitos

### Objetivos del sistema
- Incorporar autenticación con dos roles: **admin** y **empleado**.
- Proteger la ruta `/dashboard` y las demás secciones internas (Navbar, botones de acción) para que solo sean accesibles por usuarios autenticados con rol `admin` o `empleado`.
- Mantener las páginas `/` (pantalla de turnos) y `/signUp` como públicas.
- Proveer flujos completos de **signUp**, **signIn** y **signOut**.

### Funcionalidades principales
| Funcionalidad | Descripción |
|---|---|
| **signUp** | Registro de nuevos usuarios con `email`, `password`, `name` y `role` (`admin` \| `empleado`). Ruta pública `/signUp`. |
| **signIn** | Inicio de sesión por `email` y `password`. Ruta pública `/signIn`. Redirige a `/dashboard` tras éxito. |
| **signOut** | Cierre de sesión. Limpia el estado de autenticación y redirige a `/signIn`. Accesible desde la Navbar. |
| **Protección de rutas** | El middleware de Next.js 16 intercepta peticiones a rutas protegidas (`/dashboard`, `/register`) y redirige a `/signIn` si no hay sesión activa. |
| **Navbar condicional** | Solo se renderiza para usuarios autenticados (`admin` o `empleado`). En rutas públicas no se muestra. |
| **Control por rol** | Ambos roles ven el Dashboard y la Navbar. Se expone el rol desde el contexto para futuras restricciones granulares. |

### Requisitos no funcionales
- **Seguridad**: tokens JWT almacenados en cookies `httpOnly` con flags `Secure`, `SameSite=Strict`. Nunca en `localStorage`.
- **Rendimiento**: validación de sesión en middleware (edge runtime) sin llamadas extra al backend en cada navegación.
- **Accesibilidad**: formularios con labels semánticas, estados de error visibles y focus management.
- **Testabilidad**: 100 % de cobertura en lógica de dominio, hooks, adaptadores y componentes de autenticación.
- **Mantenibilidad**: seguir la arquitectura hexagonal existente — puerto → adaptador → hook → componente.

### Restricciones técnicas
- Next.js 16 con React 19 y React Compiler habilitado.
- No se dispone de un backend de autenticación propio aún; el adaptador debe ser agnóstico para conectar con cualquier proveedor (API REST propia, Firebase, Auth0, etc.).
- No se utiliza ninguna librería de manejo de estado global (solo Context API).
- Las rutas `/signUp`, `/signIn` y `/signOut` no deben colisionar con `/register` que ya existe para registro de turnos (funcionalidad distinta).

---

## 2. Arquitectura

### Descripción de la arquitectura propuesta
Se extiende la **arquitectura hexagonal** ya establecida en el proyecto. La capa de dominio define los tipos (`User`, `AuthCredentials`, `SignUpData`) y los puertos (`AuthProvider`). La capa de infraestructura implementa el adaptador concreto (`HttpAuthAdapter`). La capa de presentación consume los hooks (`useAuth`) que operan contra los puertos, y los componentes de UI delegan toda la lógica en esos hooks. Un `AuthProvider` (contexto React) centraliza el estado de sesión y lo inyecta vía `DependencyProvider` existente.

### Justificación
- **Inversión de dependencias (DIP)**: los hooks y componentes dependen del puerto `AuthProvider`, no de la implementación HTTP concreta. Esto permite cambiar el backend de autenticación sin tocar la UI.
- **Principio abierto/cerrado (OCP)**: se añaden nuevos puertos, adaptadores, hooks y páginas sin modificar el código existente.
- **Separación de responsabilidades (SRP)**: cada capa tiene una única razón de cambio — dominio (reglas de negocio), infraestructura (comunicación), presentación (UI).
- **Coherencia**: se reutilizan los mismos patrones ya presentes (`DependencyProvider`, `httpClient` con `CircuitBreaker`, `InputSanitizer`, factorías de mocks).

### Diagrama conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTACIÓN                             │
│                                                                 │
│  /signIn ──► SignInForm ──► useAuth().signIn()                  │
│  /signUp ──► SignUpForm ──► useAuth().signUp()                  │
│  Navbar  ──► SignOutButton ──► useAuth().signOut()               │
│                                                                 │
│  AuthGuard (wrapper) ── protege children si !authenticated      │
│  proxy.ts ── redirige en edge si no hay cookie de sesión          │
└────────────────────────┬────────────────────────────────────────┘
                         │ depende de
┌────────────────────────▼────────────────────────────────────────┐
│                         DOMINIO                                 │
│                                                                 │
│  User { id, email, name, role }                                 │
│  AuthCredentials { email, password }                            │
│  SignUpData { email, password, name, role }                     │
│  UserRole = "admin" | "empleado"                                │
│                                                                 │
│  Puerto: AuthService (interfaz)                                 │
│    signIn(credentials) → AuthResult                             │
│    signUp(data) → AuthResult                                    │
│    signOut() → void                                             │
│    getSession() → User | null                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ implementado por
┌────────────────────────▼────────────────────────────────────────┐
│                      INFRAESTRUCTURA                            │
│                                                                 │
│  HttpAuthAdapter implements AuthService                         │
│    usa httpPost / httpGet del httpClient existente               │
│    mapea respuestas del backend con authMapper                  │
│                                                                 │
│  authMapper: toUser(backendResponse) → User                     │
│  cookieUtils: set/get/remove token en cookies                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Componentes del Sistema

### 3.1 Capa de Dominio

#### 3.1.1 `User` (Entidad)
- **Propósito**: Representa al usuario autenticado en el sistema.
- **Interfaz**:
  ```typescript
  type UserRole = "admin" | "empleado";

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
  ```
- **Patrón**: Value Object (inmutable, sin identidad mutable).

#### 3.1.2 `AuthCredentials` y `SignUpData` (DTOs)
- **Propósito**: Contratos de entrada para signIn y signUp.
- **Interfaz**:
  ```typescript
  interface AuthCredentials {
    email: string;
    password: string;
  }

  interface SignUpData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }

  interface AuthResult {
    success: boolean;
    message: string;
    user?: User;
    token?: string;
  }
  ```

#### 3.1.3 Puerto `AuthService`
- **Propósito**: Contrato que la infraestructura debe implementar.
- **Interfaz**:
  ```typescript
  interface AuthService {
    signIn(credentials: AuthCredentials): Promise<AuthResult>;
    signUp(data: SignUpData): Promise<AuthResult>;
    signOut(): Promise<void>;
    getSession(): Promise<User | null>;
  }
  ```
- **Patrón**: Port (Hexagonal Architecture). Permite sustituir el proveedor de autenticación sin impacto en la UI.

### 3.2 Capa de Infraestructura

#### 3.2.1 `HttpAuthAdapter`
- **Propósito**: Implementación concreta del puerto `AuthService` usando el `httpClient` existente (con Circuit Breaker y reintentos).
- **Interfaz**: implementa `AuthService`.
- **Patrón**: Adapter (Hexagonal). Se conecta a los endpoints REST del backend.
- **Métodos**:
  - `signIn` → `httpPost<BackendAuthResponse>('/auth/signIn', body)` → mapea con `authMapper`.
  - `signUp` → `httpPost<BackendAuthResponse>('/auth/signUp', body)` → mapea con `authMapper`.
  - `signOut` → `httpPost('/auth/signOut')` + limpia cookie local.
  - `getSession` → `httpGet<BackendUser>('/auth/me')` → mapea con `authMapper`, retorna `null` si 401.

#### 3.2.2 `authMapper`
- **Propósito**: Anti-Corruption Layer para traducir la respuesta del backend al modelo de dominio.
- **Interfaz**:
  ```typescript
  function toUser(raw: BackendUser): User;
  function toAuthResult(raw: BackendAuthResponse): AuthResult;
  ```
- **Patrón**: ACL / Mapper (igual que `ticketMapper` existente).

#### 3.2.3 `cookieUtils`
- **Propósito**: Utilidades para manipular cookies de sesión en el cliente.
- **Interfaz**:
  ```typescript
  function setAuthCookie(token: string): void;
  function getAuthCookie(): string | null;
  function removeAuthCookie(): void;
  ```
- **Justificación**: Encapsula la lógica de persistencia del token. En producción se recomienda que el backend maneje cookies `httpOnly`; estas utilidades sirven como fallback o para tokens de frontend.

### 3.3 Capa de Presentación

#### 3.3.1 `AuthContext` / `AuthProvider` (Provider)
- **Propósito**: Mantiene el estado global de autenticación (`user`, `loading`, `error`) y expone las acciones (`signIn`, `signUp`, `signOut`).
- **Interfaz del contexto**:
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
- **Patrón**: Provider Pattern (como `DependencyProvider` existente).
- **Integración**: Se anida dentro del `DependencyProvider` existente, recibiendo `AuthService` por inyección de dependencias.

#### 3.3.2 Hook `useAuth`
- **Propósito**: Shortcut para consumir `AuthContext`.
- **Interfaz**:
  ```typescript
  function useAuth(): AuthContextValue;
  ```
- **Patrón**: Custom Hook con guarda de contexto (lanza error si se usa fuera del provider).

#### 3.3.3 `AuthGuard` (HOC / Wrapper)
- **Propósito**: Componente que envuelve páginas protegidas. Si el usuario no está autenticado, redirige a `/signIn`. Si no tiene el rol requerido, redirige a `/`.
- **Interfaz**:
  ```typescript
  interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
  }
  ```
- **Patrón**: Guard / Decorator.

#### 3.3.4 `SignInForm` (Componente)
- **Propósito**: Formulario de inicio de sesión con campos `email` y `password`.
- **Comportamiento**: Valida inputs con `InputSanitizer`, invoca `useAuth().signIn()`, muestra errores, redirige a `/dashboard` tras éxito.
- **Patrón**: Controlled Form + Hook delegation (mismo patrón que `CreateTicketForm`).

#### 3.3.5 `SignUpForm` (Componente)
- **Propósito**: Formulario de registro con campos `name`, `email`, `password` y selector de `role`.
- **Comportamiento**: Valida, sanitiza, invoca `useAuth().signUp()`, redirige a `/signIn` tras éxito.
- **Patrón**: Controlled Form + Hook delegation.

#### 3.3.6 `SignOutButton` (Componente)
- **Propósito**: Botón integrado en la Navbar para cerrar sesión.
- **Comportamiento**: Invoca `useAuth().signOut()`, redirige a `/signIn`.

#### 3.3.7 Proxy de Next.js (`proxy.ts`)
- **Propósito**: Proteger rutas en el edge runtime. Intercepta requests a `/dashboard`, `/register` y verifica la presencia de cookie de sesión.
- **Comportamiento**: Si no hay cookie válida, redirige a `/signIn`. Si la hay, deja pasar.
- **Nota**: Se integra con el `proxy.ts` existente (que ya aplica headers de seguridad) renombrándolo o componiendo su lógica dentro del nuevo middleware.

#### 3.3.8 Navbar condicional
- **Propósito**: Modificar el `Navbar` para que solo se renderice cuando `useAuth().isAuthenticated === true`.
- **Impacto mínimo**: Solo se envuelve el render del Navbar con una condición. El layout actual importa Navbar directamente; se envuelve con `AuthGuard` o con lógica condicional en `layout.tsx`.

### Bibliotecas/Paquetes recomendados
| Paquete | Justificación |
|---|---|
| `jose` | Decodificación y verificación de JWT en edge runtime (compatible con middleware de Next.js). Ligero, sin dependencias de Node.js crypto. |
| `js-cookie` (opcional) | Manejo simplificado de cookies en el cliente. Alternativa: usar document.cookie directamente. |
| Ninguna librería de estado adicional | Se mantiene Context API por coherencia con el proyecto existente. |

---

## 4. Estructura de Directorios

```
src/
├── app/
│   ├── layout.tsx                          # Modificar: Navbar condicional + AuthProvider
│   ├── page.tsx                            # Sin cambios (pública)
│   ├── signIn/
│   │   └── page.tsx                        # NUEVO: Página de inicio de sesión
│   ├── signUp/
│   │   └── page.tsx                        # NUEVO: Página de registro de usuario
│   ├── dashboard/
│   │   └── page.tsx                        # Modificar: envolver con AuthGuard
│   └── register/
│       └── page.tsx                        # Modificar: envolver con AuthGuard
│
├── components/
│   ├── SignInForm/
│   │   ├── SignInForm.tsx                  # NUEVO: Formulario de login
│   │   └── SignInForm.module.css           # NUEVO: Estilos del formulario
│   ├── SignUpForm/
│   │   ├── SignUpForm.tsx                  # NUEVO: Formulario de registro
│   │   └── SignUpForm.module.css           # NUEVO: Estilos del formulario
│   ├── AuthGuard/
│   │   └── AuthGuard.tsx                   # NUEVO: Wrapper de protección de rutas
│   ├── SignOutButton/
│   │   └── SignOutButton.tsx               # NUEVO: Botón de cierre de sesión
│   └── Navbar/
│       └── Navbar.tsx                      # Modificar: mostrar solo si autenticado + SignOutButton
│
├── domain/
│   ├── User.ts                             # NUEVO: Entidad User + UserRole
│   ├── AuthCredentials.ts                  # NUEVO: DTOs de autenticación
│   └── ports/
│       └── AuthService.ts                  # NUEVO: Puerto de autenticación
│
├── hooks/
│   └── useAuth.ts                          # NUEVO: Hook para consumir AuthContext
│
├── infrastructure/
│   ├── adapters/
│   │   └── HttpAuthAdapter.ts              # NUEVO: Adaptador HTTP de autenticación
│   ├── mappers/
│   │   └── authMapper.ts                   # NUEVO: Mapper backend → dominio para auth
│   └── cookies/
│       └── cookieUtils.ts                  # NUEVO: Utilidades de cookies
│
├── providers/
│   ├── DependencyProvider.tsx              # Modificar: agregar AuthService a Dependencies
│   └── AuthProvider.tsx                    # NUEVO: Contexto de autenticación
│
├── proxy.ts                                # NUEVO: Proxy de protección de rutas (edge)
│
├── styles/
│   ├── SignInForm.module.css               # NUEVO (alternativa: dentro de components/)
│   └── SignUpForm.module.css               # NUEVO (alternativa: dentro de components/)
│
└── __tests__/
    ├── mocks/
    │   └── factories.ts                    # Modificar: agregar mockAuthService
    ├── app/
    │   ├── signIn/
    │   │   └── page.spec.tsx               # NUEVO
    │   └── signUp/
    │       └── page.spec.tsx               # NUEVO
    ├── components/
    │   ├── SignInForm/
    │   │   └── SignInForm.spec.tsx          # NUEVO
    │   ├── SignUpForm/
    │   │   └── SignUpForm.spec.tsx          # NUEVO
    │   ├── AuthGuard/
    │   │   └── AuthGuard.spec.tsx           # NUEVO
    │   ├── SignOutButton/
    │   │   └── SignOutButton.spec.tsx       # NUEVO
    │   └── Navbar/
    │       └── Navbar.spec.tsx             # Modificar: agregar tests de visibilidad condicional
    ├── hooks/
    │   └── useAuth.spec.ts                 # NUEVO
    ├── infrastructure/
    │   ├── adapters/
    │   │   └── HttpAuthAdapter.spec.ts     # NUEVO
    │   ├── mappers/
    │   │   └── authMapper.spec.ts          # NUEVO
    │   └── cookies/
    │       └── cookieUtils.spec.ts         # NUEVO
    ├── providers/
    │   └── AuthProvider.spec.tsx           # NUEVO
    └── middleware/
        └── middleware.spec.ts              # NUEVO
```

**Explicación de directorios**:
- `domain/`: Nuevos tipos y el puerto `AuthService` mantienen la pureza del dominio sin dependencias externas.
- `infrastructure/adapters/`: `HttpAuthAdapter` sigue el mismo patrón que `HttpTicketAdapter`.
- `infrastructure/mappers/`: `authMapper` actúa como ACL, igual que `ticketMapper`.
- `infrastructure/cookies/`: Encapsula la lógica de persistencia del token.
- `providers/AuthProvider.tsx`: Contexto dedicado para autenticación, análogo a `DependencyProvider`.
- `components/AuthGuard/`: Componente reutilizable para proteger cualquier sección.
- `proxy.ts`: Archivo en la raíz de `src/` (convención de Next.js 16) para protección en edge.

---

## 5. Consideraciones de Rendimiento

### Puntos críticos identificados
| Punto | Riesgo | Mitigación |
|---|---|---|
| Validación de sesión en cada navegación | Latencia si se consulta al backend en cada request | Middleware valida solo la existencia y formato del JWT en edge (sin network call). Validación completa solo en `getSession()`. |
| Re-renders del AuthProvider | Cambios de estado (`user`, `loading`) pueden causar re-renders en cascada | Memorizar el valor del contexto con `useMemo`. Separar estado de autenticación del de UI. |
| Carga del layout con Navbar condicional | Flash de contenido no autenticado (FOUC) | `loading` state en `AuthProvider` muestra un skeleton/spinner hasta que se resuelve la sesión. |
| Llamadas al endpoint `/auth/me` | Cada recarga de página consulta la sesión | Cachear respuesta en memoria durante la vida del provider. Usar `stale-while-revalidate` si es necesario. |
| Bundle size con `jose` | Incremento del bundle | `jose` es tree-shakeable (~3KB gzipped para `jwtVerify`). Solo se importan las funciones necesarias. |

### Estrategias de optimización
- **Middleware ligero**: Solo verifica existencia de cookie y estructura básica del JWT (3 segmentos base64). No decodifica payload en edge.
- **Lazy loading**: Las páginas `/signIn` y `/signUp` se cargan con dynamic imports de Next.js (ya lo hace App Router por defecto).
- **Memoización**: `AuthContextValue` se envuelve en `useMemo` con dependencias mínimas.
- **Circuit Breaker**: El `httpClient` existente ya protege contra backends caídos; los endpoints de auth se benefician automáticamente.

### Métricas a monitorear
- Tiempo de respuesta de `/auth/signIn` y `/auth/signUp` (p95 < 500ms).
- Tasa de error en autenticación (4xx vs 5xx).
- Tiempo de First Contentful Paint en rutas protegidas.
- Cantidad de redirects innecesarios del middleware.

---

## 6. Secuencia de Implementación

La implementación sigue un orden bottom-up respetando TDD (test primero, implementación después).

### Fase 1: Dominio (sin dependencias externas)
1. **Crear `src/domain/User.ts`** — tipos `UserRole` y `User`.
2. **Crear `src/domain/AuthCredentials.ts`** — DTOs `AuthCredentials`, `SignUpData`, `AuthResult`.
3. **Crear `src/domain/ports/AuthService.ts`** — interfaz del puerto.
4. **Tests**: Validar que los tipos compilan correctamente (test de tipado).

### Fase 2: Infraestructura
5. **Crear `src/infrastructure/mappers/authMapper.ts`** + tests.
6. **Crear `src/infrastructure/cookies/cookieUtils.ts`** + tests.
7. **Crear `src/infrastructure/adapters/HttpAuthAdapter.ts`** + tests (mockeando `httpClient`).

### Fase 3: Providers y Hooks
8. **Crear `src/providers/AuthProvider.tsx`** + tests.
9. **Crear `src/hooks/useAuth.ts`** + tests.
10. **Modificar `src/providers/DependencyProvider.tsx`** — agregar `AuthService` a `Dependencies` + actualizar tests.
11. **Actualizar `src/__tests__/mocks/factories.ts`** — agregar `mockAuthService`.

### Fase 4: Componentes de UI
12. **Crear `src/components/SignInForm/SignInForm.tsx`** + estilos + tests.
13. **Crear `src/components/SignUpForm/SignUpForm.tsx`** + estilos + tests.
14. **Crear `src/components/AuthGuard/AuthGuard.tsx`** + tests.
15. **Crear `src/components/SignOutButton/SignOutButton.tsx`** + tests.

### Fase 5: Páginas y Rutas
16. **Crear `src/app/signIn/page.tsx`** + tests.
17. **Crear `src/app/signUp/page.tsx`** + tests.
18. **Modificar `src/app/dashboard/page.tsx`** — envolver con `AuthGuard`.
19. **Modificar `src/app/register/page.tsx`** — envolver con `AuthGuard`.

### Fase 6: Middleware y Navbar
20. **Crear `src/proxy.ts`** — protección de rutas en edge + tests.
21. **Modificar `src/components/Navbar/Navbar.tsx`** — renderizado condicional + `SignOutButton` + actualizar tests.
22. **Modificar `src/app/layout.tsx`** — integrar `AuthProvider`, Navbar condicional.

### Fase 7: Integración y QA
23. **Tests de integración** — flujos completos signUp → signIn → dashboard → signOut.
24. **Revisión de cobertura** — `jest --coverage`, verificar ≥ 90 %.
25. **Pruebas manuales** — navegación, redirects, roles.

---

## 7. Criterios de Revisión de Código

### Checklist por principio

#### SOLID
- [ ] **SRP**: Cada archivo tiene una única responsabilidad (dominio, adaptador, hook, componente).
- [ ] **OCP**: No se modifica lógica existente de turnos para agregar autenticación. Solo se extienden providers y layout.
- [ ] **LSP**: `HttpAuthAdapter` es sustituible por cualquier otra implementación de `AuthService` sin romper contratos.
- [ ] **ISP**: El puerto `AuthService` solo expone los métodos necesarios (signIn, signUp, signOut, getSession).
- [ ] **DIP**: Hooks y componentes dependen de abstracciones (`AuthService`), no de `HttpAuthAdapter`.

#### DRY
- [ ] No hay lógica de autenticación duplicada entre middleware, AuthProvider y AuthGuard.
- [ ] Los mensajes de error se centralizan en un record (como `ERROR_MESSAGES` en `useCreateTicket`).
- [ ] El factory de mocks se reutiliza en todos los tests.

#### KISS
- [ ] Los formularios siguen el patrón existente (controlled inputs + hook delegation).
- [ ] El middleware hace una sola cosa: verificar cookie y redirigir.
- [ ] No se introduce complejidad innecesaria (no Redux, no NextAuth, no middleware encadenado).

#### YAGNI
- [ ] No se implementa refresh token hasta que se necesite.
- [ ] No se implementa OAuth/social login hasta que se solicite.
- [ ] No se crea un panel de administración de usuarios.

#### Código limpio
- [ ] Nombres descriptivos en inglés para código, español para textos de UI.
- [ ] Sin comentarios innecesarios — el código se explica solo.
- [ ] Funciones cortas (< 20 líneas).
- [ ] Sin `any` — tipado estricto en todos los contratos.
- [ ] Imports organizados: React → Next → dominio → infraestructura → estilos.

#### Testing
- [ ] Cada componente/hook/adaptador tiene su archivo `.spec.ts(x)` correspondiente.
- [ ] Se usa TDD: test falla → implementación mínima → refactor.
- [ ] Mocks inyectados vía `DependencyProvider` con `overrides` (patrón existente).
- [ ] No hay tests frágiles (no se testea implementación interna, solo comportamiento).
- [ ] Cobertura ≥ 90 % en las nuevas líneas.

#### Seguridad
- [ ] Passwords nunca se loggean ni se almacenan en estado del cliente más allá del formulario.
- [ ] Tokens en cookies `httpOnly` (cuando el backend lo soporte).
- [ ] Inputs sanitizados con `InputSanitizer` existente antes de enviar al backend.
- [ ] El middleware no expone información sensible en redirects.
- [ ] CSP actualizado en `proxy.ts` si se agregan nuevos dominios de autenticación.

---

## 8. Prerrequisitos y Dependencias

### Antes de comenzar la implementación

#### Dependencias de paquetes
| Paquete | Versión sugerida | Propósito |
|---|---|---|
| `jose` | `^6.x` | Verificación/decodificación de JWT en edge runtime y cliente |

Instalación:
```bash
npm install jose
```

#### Dependencias de backend
- El backend debe exponer los siguientes endpoints (o se debe crear un mock server):
  - `POST /auth/signUp` — Body: `{ email, password, nombre, rol }` → Response: `{ token, usuario }`.
  - `POST /auth/signIn` — Body: `{ email, password }` → Response: `{ token, usuario }`.
  - `POST /auth/signOut` — Invalida el token server-side.
  - `GET /auth/me` — Header: `Authorization: Bearer <token>` → Response: `{ usuario }` o `401`.
- Se debe documentar el contrato exacto del backend para crear el `authMapper`.

#### Variables de entorno
Agregar en `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000  # ya existente
NEXT_PUBLIC_WS_URL=http://localhost:3000         # ya existente
AUTH_COOKIE_NAME=session_token                   # nombre de la cookie de autenticación
AUTH_COOKIE_MAX_AGE=86400                        # tiempo de vida en segundos (24h)
```

#### Configuración existente que se debe mantener
- `DependencyProvider` con su mecanismo de `overrides` para testing.
- `httpClient` con `CircuitBreaker` — los endpoints de auth usarán el mismo cliente.
- `InputSanitizer` (`HtmlSanitizer`) — para sanitizar inputs de formularios de auth.
- `proxy.ts` / `middleware` existente — componer la lógica de seguridad actual con la nueva protección de rutas.
- Estructura de tests (`__tests__/mocks/factories.ts`) — extender con fábricas de auth.

#### Checklist pre-implementación
- [ ] Backend de autenticación disponible (o mock server configurado).
- [ ] Contrato de API documentado (request/response de cada endpoint).
- [ ] Variable `AUTH_COOKIE_NAME` definida en `.env.local`.
- [ ] Paquete `jose` instalado.
- [ ] Branch de feature creada: `feature/authentication`.
- [ ] Tests existentes pasan (`npm test` sin fallos).
- [ ] Cobertura actual documentada como baseline.
