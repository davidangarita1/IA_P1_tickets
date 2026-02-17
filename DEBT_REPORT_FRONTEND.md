# DEBT_REPORT_FRONTEND.md — Frontend Technical Debt Audit

> Scope: `frontend/src/`  
> Standard: AI_WORKFLOW.md v1.2 (Hexagonal Architecture + SOLID)  
> Date: 17 de febrero de 2026  
> **Last updated: 17 de febrero de 2026 — All 18 violations resolved**

---

## Summary

| Category | Original violations | Resolved | Pending |
|---|---|---|---|
| A — Architecture & Folder Structure | 5 | **5** | 0 |
| B — SOLID | 8 | **8** | 0 |
| C — Styles | 0 | 0 | 0 |
| D — Configuration & Security | 2 | **2** | 0 |
| E — Type Safety | 3 | **3** | 0 |
| F — Next.js App Router Compliance | 0 | 0 | 0 |
| **TOTAL** | **18** | **18** | **0** |

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
9. ✅ Sanitización de inputs en `sanitize.ts`
10. ✅ `AudioService` encapsulado como singleton
11. ✅ Middleware con rate limiting, CSP, y headers de seguridad
12. ✅ Error boundaries con `isMountedRef`
13. ✅ Loading states manejados en formularios y hooks

---

*Generated by: AI audit using AI_WORKFLOW.md v1.2*  
*Companion report: `DEBT_REPORT.md` (backend audit)*  
*Status: **All 18 violations resolved** — frontend debt cleared for Week 1*
