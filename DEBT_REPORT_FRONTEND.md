# DEBT_REPORT_FRONTEND.md — Frontend Technical Debt Audit

> Scope: `frontend/src/`  
> Standard: AI_WORKFLOW.md v1.2 (Hexagonal Architecture + SOLID)  
> Date: 17 de febrero de 2026  
> **Last updated: 18 de febrero de 2026 — Architectural validation audit**

---

## Summary

| Category | Original violations | Resolved | New (Week 2 audit) | Pending |
|---|---|---|---|---|
| A — Architecture & Folder Structure | 5 | **5** | 0 | 0 |
| B — SOLID | 8 | **8** | **1** | **1** |
| C — Styles | 0 | 0 | 0 | 0 |
| D — Configuration & Security | 2 | **2** | **3** | **3** |
| E — Type Safety | 3 | **3** | **1** | **1** |
| F — Next.js App Router Compliance | 0 | 0 | 0 | 0 |
| G — Testing Gaps | 0 | 0 | **2** | **2** |
| **TOTAL** | **18** | **18** | **7** | **7** |

---

## Current File Map (Updated)

| File | What it does | Aligned? |
|---|---|---|
| `src/app/page.tsx` | Main real-time appointments screen (~67 lines) | ✅ |
| `src/app/dashboard/page.tsx` | Attended appointments dashboard (~60 lines) | ✅ |
| `src/app/registration/page.tsx` | Registration page wrapper | ✅ |
| `src/app/layout.tsx` | Root layout with metadata | ✅ |
| `src/app/api/mock/turnos/route.ts` | Mock API endpoint (documented) | ✅ |
| `src/components/AppointmentRegistrationForm/` | Registration form component + CSS Module | ✅ |
| `src/components/AppointmentList/AppointmentList.tsx` | Reusable list with filtering by status (new) | ✅ |
| `src/components/AppointmentCard/AppointmentCard.tsx` | Card with explicit props only (new) | ✅ |
| `src/hooks/useAppointmentRegistration.ts` | Registration logic hook (~62 lines) | ✅ |
| `src/hooks/useAppointmentsWebSocket.ts` | WebSocket connection hook (typed SocketError) | ✅ |
| `src/hooks/useAudioNotification.ts` | Audio init + unlock + play hook (new) | ✅ |
| `src/hooks/useNewAppointmentDetector.ts` | Detection + toast logic hook (new) | ✅ |
| `src/domain/Appointment.ts` | Domain interface (pure TS, zero deps) | ✅ |
| `src/domain/CreateAppointment.ts` | DTOs for appointment creation | ✅ |
| `src/repositories/AppointmentRepository.ts` | Repository port (interface) | ✅ |
| `src/repositories/HttpAppointmentRepository.ts` | HTTP repository adapter | ✅ |
| `src/lib/httpClient.ts` | HTTP client (~124 lines, CircuitBreaker extracted) | ✅ |
| `src/lib/circuit-breaker.ts` | CircuitBreaker class (new, extracted) | ✅ |
| `src/utils/error-guard.ts` | Type guards + error mapping (new) | ✅ |
| `src/utils/date-formatter.ts` | Centralized `formatTime()` (new) | ✅ |
| `src/services/AudioService.ts` | Audio playback singleton service | ✅ |
| `src/config/env.ts` | Env config with startup validation | ✅ |
| `src/middleware.ts` | Next.js middleware (rate limit + security headers) | ✅ |
| `src/security/sanitize.ts` | Input sanitization utility | ✅ |
| `src/styles/globals.css` | Global CSS reset and variables | ✅ |
| `src/styles/page.module.css` | Module CSS for pages | ✅ |

**Removed files:**
- ~~`src/proxi.ts`~~ — eliminated (was duplicate of `middleware.ts`)
- ~~`src/hooks/useAppointmentsRealtime.ts`~~ — eliminated (deprecated polling hook)

---

## Violations — Resolution Status

### Category A — Architecture & Folder Structure

- ✅ **[FRONT-A1]** `proxi.ts` eliminado. `middleware.ts` es el único archivo de middleware, correctamente nombrado.
- ✅ **[FRONT-A2]** `useAppointmentsRealtime.ts` eliminado. Solo queda `useAppointmentsWebSocket.ts`.
- ✅ **[FRONT-A3]** Lógica de audio extraída a `hooks/useAudioNotification.ts`. Pages solo llaman al hook.
- ✅ **[FRONT-A4]** Lógica de detección extraída a `hooks/useNewAppointmentDetector.ts`. Pages solo consumen `showToast`.
- ✅ **[FRONT-A5]** Mock endpoint documentado con comentario file-level en `route.ts`.

### Category B — SOLID

- ✅ **[FRONT-B1]** `page.tsx` reducido a ~67 líneas, `dashboard/page.tsx` a ~60 líneas (< 80 objetivo).
- ✅ **[FRONT-B2]** `useAppointmentRegistration.ts` reducido a ~62 líneas. Error mapping extraído a `error-guard.ts`.
- ✅ **[FRONT-B3]** `CircuitBreaker` extraído a `lib/circuit-breaker.ts`. `httpClient.ts` reducido a ~124 líneas.
- ✅ **[FRONT-B4]** Pages son contenedores de composición. Audio, detección, listas y cards en hooks/componentes dedicados.
- ✅ **[FRONT-B5]** `AppointmentList` maneja filtrado por status internamente. Pages usan composición declarativa.
- ✅ **[FRONT-B6]** `AppointmentCard` recibe solo props explícitas (`nombre`, `consultorio`, `priority`, `timestamp`, `variant`).
- ✅ **[FRONT-B7]** `formatTime()` centralizado en `utils/date-formatter.ts`.
- ✅ **[FRONT-B8]** Estructura de lista unificada en `AppointmentList` + `AppointmentCard`. Sin duplicación.

### Category C — Styles

- ✅ Sin violaciones (CSS Modules only, sin inline styles, sin frameworks externos).

### Category D — Configuration & Security

- ✅ **[FRONT-D1]** `NEXT_PUBLIC_WS_URL` agregado a `.env.example`. Nombre de `NEXT_PUBLIC_API_BASE_URL` alineado entre `.env.example` y `env.ts`.
- ✅ **[FRONT-D2]** Validación al arranque agregada en `env.ts` (`Object.values(env)` server-side).

### Category E — Type Safety

- ✅ **[FRONT-E1]** `SocketError` type definido en `error-guard.ts`. `useAppointmentsWebSocket.ts` usa tipo explícito.
- ✅ **[FRONT-E2]** `httpClient.ts` usa `catch (err: unknown)` con type guard `isError()`.
- ✅ **[FRONT-E3]** Patrón de error consistente en todo el frontend. Zero `any` en código (solo en comentarios legacy).

### Category F — Next.js App Router Compliance

- ✅ Sin violaciones.

---

## New Violations (Week 2 Audit — 18 de febrero de 2026)

### Category B — SOLID (nuevo)

#### [FRONT-B9] 🟡 `useAppointmentRegistration` viola DIP — depende de implementación concreta
- **File:** `src/hooks/useAppointmentRegistration.ts` (línea 5, 28-30)
- **Rule:** DIP — Dependency Inversion Principle
- **Problem:** El hook importa y instancia directamente `HttpAppointmentRepository` (clase concreta) en lugar de depender de la interfaz `AppointmentRepository`:
  ```typescript
  import { HttpAppointmentRepository } from "@/repositories/HttpAppointmentRepository";
  // ...
  const repositoryRef = useRef<HttpAppointmentRepository | null>(null);
  repositoryRef.current = new HttpAppointmentRepository();
  ```
  Esto acopla el hook a la implementación HTTP, haciendo imposible inyectar un mock o una implementación alternativa sin modificar el hook. Es la violación más significativa al patrón hexagonal del frontend.
- **Fix:** Aceptar `AppointmentRepository` como parámetro del hook o usar un factory pattern:
  ```typescript
  export function useAppointmentRegistration(repository: AppointmentRepository) {
      const repositoryRef = useRef<AppointmentRepository>(repository);
  ```

### Category D — Configuration & Security (nuevo)

#### [FRONT-D3] 🟡 `sanitize.ts` demasiado básico — cobertura XSS insuficiente
- **File:** `src/security/sanitize.ts`
- **Rule:** D — Seguridad
- **Problem:** La función `sanitizeText()` solo elimina `<>` y la palabra "script", pero no cubre: `javascript:` URIs, event handlers (`onerror=`, `onload=`), entidades HTML codificadas (`&#60;`), ni otros vectores XSS. Es una capa mínima, no una protección completa.
- **Fix:** Usar una librería probada como `DOMPurify` para sanitización, o al mínimo ampliar el regex para cubrir event handlers y URIs `javascript:`.

#### [FRONT-D4] 🟢 `env.ts` — validación server-side no relanza excepción
- **File:** `src/config/env.ts` (línea 31-33)
- **Rule:** D — Fail-fast configuration
- **Problem:** El bloque `try/catch` de validación al arranque captura la excepción y solo la loguea con `console.error`, pero **no la relanza**. La app puede continuar con configuración rota en el servidor.
  ```typescript
  try { Object.values(env); }
  catch (e) { console.error("[ENV] Startup validation failed:", e); }
  // ← debería re-throw para detener el arranque
  ```
- **Fix:** Relanzar la excepción: `catch (e) { console.error(...); throw e; }`

#### [FRONT-D5] 🟢 CSP permite `'unsafe-inline'` para scripts
- **File:** `src/middleware.ts` (línea 79)
- **Rule:** D — Content Security Policy
- **Problem:** La CSP incluye `script-src 'self' 'unsafe-inline'` lo cual debilita significativamente la protección contra XSS inyectado. Es necesario para el modo desarrollo de Next.js pero debe restringirse en producción.
- **Fix:** Usar nonces (`'nonce-xxx'`) en producción o al menos `'unsafe-inline'` solo condicionalmente vía `NODE_ENV`.

#### [FRONT-D6] 🟢 Mock API route presente en producción
- **File:** `src/app/api/mock/turnos/route.ts`
- **Rule:** D — Seguridad / Dead code
- **Problem:** El endpoint mock sigue presente y accesible. Aunque tiene un comentario indicando removerlo antes de deploy, no hay feature flag ni condicional que lo desactive en producción.
- **Fix:** Feature-flag con `NODE_ENV` o eliminar antes de desplegar.

### Category E — Type Safety (nuevo)

#### [FRONT-E4] 🟢 `AudioService.test.ts` usa tipo `Function` — pierde type safety
- **File:** `src/__tests__/services/AudioService.test.ts` (línea 2)
- **Rule:** E — Type Safety en tests
- **Problem:** El tipo `Function` es el equivalente TypeScript de `any` para funciones — pierde toda la verificación de parámetros y retorno:
  ```typescript
  let audioService: { init: Function; unlock: Function; play: Function; isEnabled: Function };
  ```
- **Fix:** Usar firmas explícitas: `{ init: (src: string, vol?: number) => void; ... }`

### Category G — Testing Gaps (nuevo)

#### [FRONT-G1] 🟡 Sin test para el hook `useAppointmentRegistration`
- **Rule:** G — Cobertura de testing hexagonal
- **Problem:** No existe test unitario para el hook que maneja la lógica de registro. El hook contiene lógica de: doble-submit prevention, lifecycle cleanup con `isMountedRef`, error mapping, y orquestación del repository. Todo esto debería estar probado independientemente del componente.
- **Fix:** Crear `__tests__/hooks/useAppointmentRegistration.test.ts` usando `renderHook()` de `@testing-library/react`. Mockear `AppointmentRepository` como interfaz.

#### [FRONT-G2] 🟢 `AppointmentRegistrationForm` test no verifica estado de error
- **File:** `src/__tests__/components/AppointmentRegistrationForm.test.tsx`
- **Rule:** G — Cobertura de paths
- **Problem:** El test mockea `useAppointmentRegistration` siempre con `error: null`. No hay test que renderice el componente cuando `error` tiene un valor, por lo que nunca se verifica que el mensaje de error se muestre al usuario.
- **Fix:** Agregar test case con `error: 'Error de conexión'` y verificar que aparezca en pantalla.

---

## Additional Fixes (Beyond Original Report)

- ✅ **Env var name mismatch** — `.env.example` usaba `NEXT_PUBLIC_API_URL` pero `env.ts` leía `NEXT_PUBLIC_API_BASE_URL`. Alineado a `NEXT_PUBLIC_API_BASE_URL` en ambos.
- ✅ **`POLLING_INTERVAL` residual** — Eliminado de `env.ts` ya que el hook de polling fue removido.

---

## What Is Already Correct (desde Week 0)

1. ✅ Domain layer limpio — interfaces puras sin dependencias de framework
2. ✅ CSS Modules only — sin Tailwind/Bootstrap/MUI, sin inline styles
3. ✅ Repository pattern — `AppointmentRepository` (port) + `HttpAppointmentRepository` (adapter)
4. ✅ Circuit Breaker production-grade en `httpClient.ts`
5. ✅ WebSocket hook enfocado solo en conexión y estado
6. ✅ URLs desde `env.ts`, sin hardcoded values
7. ✅ `cedula` tipado como `number` en todo el proyecto
8. ✅ `"use client"` solo donde es necesario
9. ✅ Sanitización de inputs en `sanitize.ts` (básica — ver FRONT-D3)
10. ✅ `AudioService` encapsulado como singleton
11. ✅ Middleware con rate limiting, CSP, y headers de seguridad
12. ✅ Error boundaries con `isMountedRef`
13. ✅ Loading states manejados en formularios y hooks
14. ✅ Zero `any` en código fuente (solo `Function` en test — ver FRONT-E4)
15. ✅ Components `AppointmentCard` y `AppointmentList` puramente presentacionales
16. ✅ `"use client"` correctamente aplicado solo donde hay hooks/interactividad

---

*Generated by: AI audit using AI_WORKFLOW.md v1.2*  
*Companion report: `DEBT_REPORT.md` (backend audit)*  
*Status: 18/18 original violations resolved. **7 new violations identified** (0 critical, 3 medium, 4 low) — debt pending for Week 2.*
