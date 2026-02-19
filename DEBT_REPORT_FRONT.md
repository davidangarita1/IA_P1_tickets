# Deuda Técnica — Frontend

**Fuente:** Opus 4.6

---

## Resumen Ejecutivo (Frontend)

- El **Frontend** (Next.js) está en estado crítico: sin tests, sin test runner, con arquitectura hexagonal solo de nombre.
- Copy-paste masivo entre `page.tsx` y `dashboard/page.tsx`.
- Hooks y servicios ignoran las interfaces y dependen de implementaciones concretas.
- Middleware de seguridad (`proxi.ts`) mal nombrado, no se ejecuta en producción.
- Sanitización de inputs insuficiente y endpoints mock expuestos en producción.

---

## Scorecard del Proyecto — Frontend

| Componente   | SRP | DIP | OCP | LSP | ISP | DRY | Hex | Tests | Seguridad | **Nota Final** |
|--------------|-----|-----|-----|-----|-----|-----|-----|-------|-----------|---------------|
| **Frontend** | 🔴  | 🔴  | 🟡  | 🟡  | 🟡  | 🔴  | 🔴  | 🔴    | 🔴        | **2/10**      |

---

## Violaciones y Problemas Específicos del Frontend

### Acoplamiento y Abstracción
- `useTurnosWebSocket.ts`: Socket.IO hardcodeado, sin interfaz de abstracción.
- `useRegistroTurno.ts` y `useTurnosRealtime.ts`: Instancian `HttpTurnoRepository` directamente, ignoran la interfaz `TurnoRepository`.
- `AudioService.ts`: Singleton global, sin port/interface para audio.
- `TurnoRepository` interface existe pero nadie la usa como tipo (cosmética).

### Single Responsibility y Duplicación
- `page.tsx` y `dashboard/page.tsx`: 80% idénticos, duplicación de lógica de audio, estado y renderizado.
- `proxi.ts`: Mezcla rate limiting, headers de seguridad y bloqueo de métodos en un solo archivo, además de estar mal nombrado (no se ejecuta).
- `httpClient.ts`: Circuit Breaker, Retry y Timeout mezclados en un solo archivo de 175 líneas.

### Seguridad
- Middleware de seguridad (`proxi.ts`) no activo por nombre incorrecto.
- CSP configurado para bloquear WebSocket si se activa.
- Inputs de formularios sin `maxLength`, sanitizer naïve y bypassable.
- Endpoint mock `/api/mock/turnos` accesible en producción.

### Arquitectura Hexagonal (Fachada)
- Estructura de carpetas simula hexagonal, pero los hooks y servicios dependen de implementaciones concretas.
- Modelos de dominio (`Turno.ts`, `CrearTurno.ts`) son solo interfaces vacías, sin lógica ni validaciones.
- No existen ports/adapters reales para WebSocket ni audio.

### Tests
- **Cero tests**: No hay archivos de test, ni test runner instalado, ni dependencias de testing.

---

## Plan de Resurrección — Frontend

### Fase 0 (Urgente)
- Renombrar `proxi.ts` a `proxy.ts` y corregir CSP para permitir WebSocket.
- Instalar test runner (Vitest o Jest + Testing Library).
- Eliminar código muerto: `useTurnosRealtime.ts`, `api/mock/turnos/route.ts`.

### Fase 1-4 (Refactorización)
- Enriquecer modelos de dominio con validaciones y lógica.
- Segregar `TurnoRepository` en `TurnoCommandPort` y `TurnoQueryPort`.
- Crear interfaces para WebSocket y Audio (ports) e inyectarlas en hooks.
- Reescribir sanitizer usando una librería robusta (DOMPurify).
- Extraer hook `useAudioNotification` para eliminar duplicación.
- Escribir tests unitarios para hooks y componentes usando solo mocks.

---

## Archivos y Problemas Detectados

| Archivo                                         | Problema principal                                      |
|-------------------------------------------------|---------------------------------------------------------|
| `app/page.tsx`, `app/dashboard/page.tsx`        | Duplicación, SRP, lógica de audio y UI mezcladas        |
| `hooks/useRegistroTurno.ts`                     | DIP, ignora interfaz, SRP                               |
| `hooks/useTurnosWebSocket.ts`                   | DIP, Socket.IO directo, sin abstracción                 |
| `hooks/useTurnosRealtime.ts`                    | Código muerto                                           |
| `lib/httpClient.ts`                             | SRP, mezcla CB, Retry, Timeout                          |
| `proxi.ts`                                      | Middleware inactivo, mezcla de responsabilidades        |
| `repositories/TurnoRepository.ts`               | Interfaz cosmética, nadie la usa                        |
| `domain/Turno.ts`, `domain/CrearTurno.ts`       | Modelos anémicos, solo interfaces                       |
| `services/AudioService.ts`                      | DIP, singleton global                                   |
| `security/sanitize.ts`                          | Seguridad insuficiente                                  |
| `api/mock/turnos/route.ts`                      | Endpoint mock expuesto en producción                    |
| `config/env.ts`                                 | DIP menor, process.env directo                          |
| `app/layout.tsx`                                | Metadata generada por defecto                           |

---

## Conclusión

El frontend aparenta una arquitectura hexagonal, pero en la práctica es una fachada: las interfaces existen pero no se usan, la lógica está duplicada y acoplada, y la seguridad es decorativa. No hay tests, ni infraestructura de testing. El primer paso es instalar un test runner, activar el middleware de seguridad y eliminar duplicación y código muerto. La deuda técnica es crítica y debe abordarse de inmediato.
