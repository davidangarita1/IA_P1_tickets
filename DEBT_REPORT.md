# ☠️ Reporte de Deuda Técnica

**Autor:** Arquitecto Senior Hostil  
**Fecha:** 2026-02-18  
**Veredicto General:** 🔴 **ESTADO TERMINAL** — Este sistema tiene la arquitectura de un prototipo de hackathon que alguien desplegó en producción y luego abandonó.

> *"La diferencia entre un prototipo y un sistema producción es que al prototipo nadie le exige que sobreviva al contacto con la realidad."*  
> Este proyecto no sobreviviría.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Scorecard del Proyecto](#scorecard-del-proyecto)
3. [Sección I — Acoplamiento Promiscuo (DIP)](#sección-i--acoplamiento-promiscuo-dip)
4. [Sección II — God Objects y Servicios Obesos (SRP)](#sección-ii--god-objects-y-servicios-obesos-srp)
5. [Sección III — Cero Tests donde más Importan](#sección-iii--cero-tests-donde-más-importan)
6. [Sección IV — Copy-Paste Driven Development (DRY)](#sección-iv--copy-paste-driven-development-dry)
7. [Sección V — Arquitectura Hexagonal de Cartón (Ports & Adapters)](#sección-v--arquitectura-hexagonal-de-cartón-ports--adapters)
8. [Sección VI — Seguridad Inexistente](#sección-vi--seguridad-inexistente)
9. [Sección VII — OCP, LSP e ISP Ignorados](#sección-vii--ocp-lsp-e-isp-ignorados)
10. [Autopsia por Componente](#autopsia-por-componente)
11. [Mapa Visual de la Catástrofe](#mapa-visual-de-la-catástrofe)
12. [Plan de Resurrección (Roadmap de Refactorización)](#plan-de-resurrección-roadmap-de-refactorización)
13. [Veredicto Final](#veredicto-final)

---

## Resumen Ejecutivo

Este sistema de gestión de turnos médicos está compuesto por tres componentes: un **Producer** (NestJS, REST + WebSocket), un **Consumer** (NestJS, RabbitMQ Worker), y un **Frontend** (Next.js). Los tres están enfermos.

### Las cifras del horror:

| Métrica | Valor | Veredicto |
|---|---|---|
| Violaciones SOLID totales | **47+** | 🔴 Crítico |
| Tests en Consumer | **0** (zero, cero, null) | 🔴 Crítico |
| Tests en Frontend | **0** (ni siquiera tiene test runner) | 🔴 Crítico |
| Tests en Producer | 36 (cubren partes triviales) | 🟡 Engañoso |
| Interfaces/Ports de dominio en backend | **0** | 🔴 Crítico |
| Código muerto identificado | **4 archivos** | 🟡 Deuda |
| Credenciales hardcodeadas en código fuente | **4+ ubicaciones** | 🔴 Seguridad |
| Archivos con `CORS: origin '*'` | **3** | 🔴 Seguridad |
| Middleware de seguridad activo en producción | **0** (archivo mal nombrado) | 🔴 Seguridad |

### La metáfora:

Imagina una clínica médica que gestiona turnos de pacientes. Ahora imagina que la clínica fue construida por arquitectos que:
- Pusieron las puertas de emergencia **pintadas en la pared** (interfaces que nadie implementa).
- Conectaron la electricidad **directo al poste de luz** sin fusibles (no hay abstracciones entre dominio e infraestructura).
- Copiaron el plano del primer piso y lo pegaron en el segundo **a mano** (copy-paste entre `page.tsx` y `dashboard/page.tsx`).
- Nunca probaron si los extintores funcionan (zero tests en Consumer y Frontend).
- Dejaron la puerta principal abierta con un letrero: `origin: '*'` — **bienvenidos todos**.

---

## Scorecard del Proyecto

### Por Componente

| Componente | SRP | DIP | OCP | LSP | ISP | DRY | Hex | Tests | Seguridad | **Nota Final** |
|---|---|---|---|---|---|---|---|---|---|---|
| **Consumer** | 🔴 | 🔴 | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | 🔴 | 🟡 | **2/10** |
| **Producer** | 🔴 | 🔴 | 🟡 | 🔴 | 🟢 | 🔴 | 🔴 | 🟡 | 🟡 | **4/10** |
| **Frontend** | 🔴 | 🔴 | 🟡 | 🟡 | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | **2/10** |
| **Infraestructura** | — | — | — | — | — | 🔴 | — | — | 🔴 | **3/10** |

### Por Principio (Global)

| Principio | Violaciones | Severidad Media | Ejemplos Clave |
|---|---|---|---|
| **SRP** | 14 | 🔴 Crítico | SchedulerService, ConsumerController, page.tsx |
| **DIP** | 12 | 🔴 Crítico | Mongoose directo, ClientProxy concreto, `io()` directo |
| **OCP** | 3 | 🟡 Medio | Estrategia de asignación cerrada, sanitizer no extensible |
| **LSP** | 2 | 🟡 Medio | `toEventPayload()` divergente entre Producer y Consumer |
| **ISP** | 2 | 🟡 Medio | `TurnoRepository` interface demasiado amplia, `TurnosService` fat |
| **DRY** | 8 | 🔴 Crítico | Tipos duplicados cross-service, pages copy-paste, URIs repetidas |
| **Hexagonal** | 6 | 🔴 Crítico | Zero ports, zero adapters, dominio anémico |
| **Clean Code** | 10+ | 🟡 Medio | Magic numbers, `any`, console.log en producción |

---

## Sección I — Acoplamiento Promiscuo (DIP)

> *Todo depende de todo. Nada depende de abstracciones. El sistema es una orgía de acoplamientos concretos.*

### I.1. 🔴 CRÍTICO — Mongoose Directo en Servicios de "Dominio"

**Afectados:**
- `backend/consumer/src/turnos/turnos.service.ts` — L3-4, L20
- `backend/producer/src/turnos/turnos.service.ts` — L9

```typescript
// Esto está en AMBOS servicios de "dominio":
@InjectModel(Turno.name) private readonly turnoModel: Model<TurnoDocument>
```

**El crimen:** Cada método del servicio contiene queries/operaciones Mongoose raw: `.find()`, `.exec()`, `.sort()`, `.findOneAndUpdate()`, `.updateMany()`, `new this.turnoModel({...}).save()`. El servicio de dominio ES la base de datos.

**Consecuencias:**
- **Testing:** Mockear `Model<TurnoDocument>` requiere replicar toda la API chainable de Mongoose. Por esto el Consumer tiene 0 tests y el `TurnosService` del Producer también tiene 0.
- **Portabilidad:** Migrar de MongoDB a PostgreSQL = reescribir el 100% de ambos servicios, incluyendo las reglas de negocio que están dentro.
- **No existe `ITurnoRepository`** en ningún lugar del backend. Ni siquiera la abstracción. El concepto no existe.

---

### I.2. 🔴 CRÍTICO — ClientProxy Concreto de RabbitMQ en 3 Archivos

**Afectados:**
- `backend/consumer/src/consumer.controller.ts` — L14
- `backend/consumer/src/scheduler/scheduler.service.ts` — L23
- `backend/producer/src/producer.service.ts` — L16

```typescript
@Inject('TURNOS_SERVICE') private readonly client: ClientProxy
@Inject('TURNOS_NOTIFICATIONS') private readonly notificationsClient: ClientProxy
```

**El crimen:** `ClientProxy` es una **clase concreta** de `@nestjs/microservices`, no una abstracción. El token string mágico `'TURNOS_NOTIFICATIONS'` se repite en 3 archivos sin type-safety. Si lo cambias en uno y olvidas otro: runtime error silencioso.

**No hay interfaz `EventPublisher` o `TurnoEventBus`.** Si cambias RabbitMQ por Kafka, editas 3+ archivos y rezas.

---

### I.3. 🔴 CRÍTICO — Socket.IO Hardcodeado en el Frontend

**Afectado:** `frontend/src/hooks/useTurnosWebSocket.ts` — L4, L47-53

```typescript
const socket = io(`${env.WS_URL}/ws/turnos`, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
});
```

**El crimen:** No hay interfaz `RealTimeProvider` o `TurnoEventSource`. La configuración de reconexión está hardcodeada. El namespace `/ws/turnos` es un string mágico. Si migras a SSE, WebSocket nativo, o Firebase Realtime: reescribes el hook entero.

---

### I.4. 🔴 CRÍTICO — `useRegistroTurno` IGNORA la Interfaz que Existe

**Afectado:** `frontend/src/hooks/useRegistroTurno.ts` — L5, L37, L40

```typescript
import { HttpTurnoRepository } from "@/repositories/HttpTurnoRepository";
// ...
repositoryRef.current = new HttpTurnoRepository();
```

**La ironía suprema:** ¡Existe una interfaz `TurnoRepository` en `src/repositories/TurnoRepository.ts`! Alguien la escribió. Luego este hook **la ignora olímpicamente** e instancia la clase concreta con `new`. Es como comprar un casco de moto y llevarlo colgado del brazo.

Lo mismo ocurre en `useTurnosRealtime.ts` (L4, L41, L44) — que además es código muerto.

---

### I.5. 🟡 MEDIO — `process.env` Directo en SchedulerService

**Afectado:** `backend/consumer/src/scheduler/scheduler.service.ts` — L28

```typescript
this.totalConsultorios = Number(process.env.CONSULTORIOS_TOTAL) || DEFAULT_CONSULTORIOS;
```

El proyecto usa `@nestjs/config` con `ConfigService` global. Pero el Scheduler decidió leer `process.env` directo "porque el valor solo se necesita en el constructor". Excusa, no justificación. Bypasea validación, crea fuente de verdad paralela, y rompe testabilidad.

---

### I.6. 🟡 MEDIO — AudioService como Singleton Global Importado

**Afectados:** `frontend/src/services/AudioService.ts` — L80, `page.tsx` — L5, `dashboard/page.tsx` — L5

```typescript
export const audioService = new AudioService(); // singleton global
import { audioService } from "@/services/AudioService"; // importación concreta
```

No hay interfaz `NotificationSoundPort`. Imposible testear componentes con un mock de audio sin monkey-patching de módulos. El singleton global sobrevive entre navegaciones con estado potencialmente corrupto.

---

### I.7. 🟡 MEDIO — TurnosGateway y ProducerController → TurnosService Concreto

**Afectados:**
- `backend/producer/src/events/turnos.gateway.ts` — L27
- `backend/producer/src/producer.controller.ts` — L13

No hay interfaz `TurnoQueryPort` o `TurnoReader`. Si quisieras un cache layer o leer de Redis en vez de Mongo para el Gateway, tendrías que modificar los consumidores directamente.

---

### I.8. 🟡 MEDIO — Inconsistencia `||` vs `??` para Defaults de Configuración

| Archivo | Operador | Riesgo |
|---|---|---|
| `consumer/src/app.module.ts` L28 | `\|\|` | Trata string vacío como falsy |
| `consumer/src/main.ts` L15 | `??` | Null-safe correcto |
| `producer/src/app.module.ts` L24 | `\|\|` | Trata string vacío como falsy |
| `producer/src/main.ts` L41 | `??` | Null-safe correcto |

Si un env var se establece como string vacío, el comportamiento es **distinto** entre archivos del mismo microservicio. Bug latente.

---

## Sección II — God Objects y Servicios Obesos (SRP)

> *Cada archivo hace 5 cosas. Ninguno hace una sola cosa bien.*

### II.1. 🔴 CRÍTICO — `consumer/scheduler.service.ts`: La Lógica Core Secuestrada en un @Interval

**Archivo:** `backend/consumer/src/scheduler/scheduler.service.ts` — 103 líneas

El método `handleSchedulerTick()` (L39-101) contiene la **lógica de negocio COMPLETA** de asignación de consultorios:

| Paso | Línea | Operación |
|---|---|---|
| 1 | L44 | Finalizar turnos expirados |
| 2 | L45-50 | Emitir eventos por turnos finalizados |
| 3 | L53 | Obtener consultorios ocupados |
| 4 | L57-61 | Calcular consultorios disponibles |
| 5 | L69 | Obtener pacientes en espera |
| 6 | L77-78 | Seleccionar primer paciente + primer consultorio |
| 7 | L81-84 | Asignar consultorio |
| 8 | L92-95 | Emitir evento de actualización |

**Lo que debería ser:** Un caso de uso `AsignarConsultorioUseCase` invocable desde cualquier trigger (scheduler, endpoint REST, admin panel). En vez de eso, está **atrapado** dentro de `@Interval(1000)`.

**Bonus:** La generación del array `Array.from({ length: N }, (_, i) => String(i + 1))` se ejecuta **en cada tick** (cada segundo). Debería calcularse una vez.

**Bonus 2:** El comentario en L42 dice *"Se ejecuta cada 5 segundos"*. La constante en L10 dice `SCHEDULER_INTERVAL_MS = 1000` (1 segundo). **Comentario mentiroso.**

---

### II.2. 🔴 CRÍTICO — `consumer/turnos.service.ts`: El "Dios" del Dominio — 145 Líneas, 6 Responsabilidades

**Archivo:** `backend/consumer/src/turnos/turnos.service.ts` — 145 líneas

| # | Responsabilidad | Métodos | Capa Real |
|---|---|---|---|
| 1 | Crear turnos (persistencia) | `crearTurno()` L25-38 | Repository |
| 2 | Consultar pacientes en espera (query + sort en memoria) | `findPacientesEnEspera()` L43-58 | Repository + Dominio |
| 3 | Consultar consultorios ocupados | `getConsultoriosOcupados()` L62-72 | Repository |
| 4 | Asignar consultorio (update + duración aleatoria) | `asignarConsultorio()` L78-99 | Repository + Dominio + Negocio |
| 5 | Finalizar turnos (query + batch update + mutación en memoria) | `finalizarTurnosLlamados()` L103-127 | Repository + Dominio |
| 6 | Mapear a DTO de evento | `toEventPayload()` L132-143 | Mapper |

**Atrocidades destacadas:**

**a)** `PRIORITY_ORDER` (L10-14) es una **regla de dominio pura** — el orden de atención de pacientes. Vive al lado de operaciones MongoDB. Cambiar prioridades = editar un archivo de persistencia.

**b)** `Math.floor(Math.random() * (15 - 8 + 1)) + 8` (L81) — genera duración aleatoria de atención. Magic numbers `15` y `8` sin constantes. No determinístico → imposible testear unitariamente. Vive dentro de un `findOneAndUpdate`.

**c)** Mutación in-place de documentos (L123-126):
```typescript
return expirados.map(t => {
    t.estado = 'atendido'; // ← MENTIRA: no vino de la DB, se forzó en memoria
    return t;
});
```
Los documentos retornados NO fueron re-fetched de la DB. Si Mongoose tiene hooks o middleware, estos no se ejecutaron. Es una **mentira programática**.

**d)** Race condition TOCTOU en `finalizarTurnosLlamados()` (L103-127): Hace `find()` y luego `updateMany()` como operaciones separadas. Entre ambas, nuevos turnos pueden expirar. El array retornado y los documentos realmente actualizados pueden divergir.

---

### II.3. 🔴 CRÍTICO — `consumer/consumer.controller.ts`: Controlador con 5 Pasos de Negocio

**Archivo:** `backend/consumer/src/consumer.controller.ts` — 56 líneas

El método `handleCrearTurno` (L18-54) ejecuta 5 operaciones secuenciales:

| Paso | Operación | Capa Lógica |
|---|---|---|
| 1 | `JSON.stringify(data)` + log | Infraestructura |
| 2 | `turnosService.crearTurno(data)` | Dominio |
| 3 | `notificationsService.sendNotification(...)` | Infraestructura |
| 4 | `notificationsClient.emit('turno_creado', ...)` | Infraestructura |
| 5 | `channel.ack(originalMsg)` | Infraestructura |

Un controlador NestJS debería ser un **adaptador delgado**: recibir → delegar a use case → responder. Este orquesta persistencia, notificaciones, eventos y acknowledgement. El constructor tiene 3 dependencias (señal de alerta).

**Dato extra:** `notificationsService.sendNotification()` solo hace `Logger.log()`. Es un **no-op stub**. La notificación real se hace via `ClientProxy` en el siguiente paso. El servicio existe para nada.

---

### II.4. 🔴 CRÍTICO — `producer/producer.controller.ts`: Command + Query en un Solo Controlador

**Archivo:** `backend/producer/src/producer.controller.ts` — 106 líneas

| Método | Tipo | Dependencia |
|---|---|---|
| `createTurno()` POST /turnos | **Command** (enqueue a RMQ) | `ProducerService` |
| `getAllTurnos()` GET /turnos | **Query** (leer de MongoDB) | `TurnosService` |
| `getTurnosByCedula()` GET /turnos/:cedula | **Query** (leer de MongoDB) | `TurnosService` |

CQRS violado: Commands y Queries en el mismo controlador. Si solo necesitas queries, cargas RabbitMQ. Si solo necesitas commands, cargas Mongo. 30+ líneas de decoradores Swagger poluciona un archivo ya pesado.

El controlador hace inline mapping (L75-77):
```typescript
return turnos.map(t => this.turnosService.toEventPayload(t));
```
Si agrego un campo al payload, edito un archivo que también toca cola de mensajería.

---

### II.5. 🔴 CRÍTICO — `producer/turnos.gateway.ts`: Gateway que Consulta la DB

**Archivo:** `backend/producer/src/events/turnos.gateway.ts` — 73 líneas

```typescript
// Un WebSocket Gateway consultando MongoDB directamente:
const turnos = await this.turnosService.findAll();
const snapshot = turnos.map(t => this.turnosService.toEventPayload(t));
client.emit('TURNOS_SNAPSHOT', { type: 'TURNOS_SNAPSHOT', data: snapshot });
```

Un Gateway debería ser un **adaptador puro de transporte**: recibe datos y los emite. Este importa `TurnosService`, consulta MongoDB, mapea DTOs. Si cambio cómo se obtienen los turnos (cache, Redis, event store), edito el Gateway.

---

### II.6. 🔴 CRÍTICO — `frontend/page.tsx` y `dashboard/page.tsx`: 4 Responsabilidades por Página

**Archivos:** `frontend/src/app/page.tsx` (132 líneas), `frontend/src/app/dashboard/page.tsx` (126 líneas)

Cada página es responsable de:
1. Renderizar UI de turnos
2. Gestionar audio del navegador (init, unlock, play)
3. Gestionar notificaciones toast
4. Filtrar/transformar datos de turnos por estado

Y son **~80% idénticas** entre sí (pero eso se detalla en la Sección IV).

---

### II.7. 🟡 MEDIO — `frontend/proxi.ts`: Rate Limit + Security Headers + Method Blocking

**Archivo:** `frontend/src/proxi.ts` — 93 líneas, 3 responsabilidades incompatibles en un solo archivo.

| Responsabilidad | Líneas | ¿Debería estar aquí? |
|---|---|---|
| Rate Limiting (in-memory) | 17-47 | ❌ Servicio propio |
| Bloqueo de métodos HTTP | 52-58 | ❌ Middleware de validación |
| Headers de seguridad (CSP, XSS, etc.) | 65-85 | ❌ Middleware de seguridad |

Si quiero cambiar la política de rate-limit, edito un archivo que también toca el CSP.

---

### II.8. 🟡 MEDIO — `frontend/httpClient.ts`: Circuit Breaker + Retry + Timeout en 175 Líneas

**Archivo:** `frontend/src/lib/httpClient.ts` — 175 líneas

Tres patrones de resiliencia independientes cocinados en un solo sartén:
1. **Circuit Breaker** (clase + estado global `circuits` Map)
2. **Retry con Exponential Backoff** (loop con `sleep`)
3. **Timeout con AbortController**

Cada uno debería ser aislable y testeable por separado. Si quiero testear solo el Circuit Breaker, tengo que mockear `fetch`. Bonus: `catch (err: any)` en L109 — en un archivo que se vende como "nivel producción".

---

### II.9. 🟡 MEDIO — Bootstrap Monolíticos

| Archivo | Líneas | Responsabilidades Mezcladas |
|---|---|---|
| `producer/main.ts` | 70 | CORS, ValidationPipe, Swagger (14 líneas de strings), RMQ, HTTP |
| `consumer/main.ts` | 43 | Doble inicialización de AppModule para leer 2 strings de ConfigService |

El `consumer/main.ts` crea un `ApplicationContext` completo solo para leer `ConfigService`, lo destruye, y luego crea el microservicio real. **Doble inicialización de todos los módulos.**

---

### II.10. 🟡 MEDIO — `NotificationsModule` Exporta `ClientsModule` Desnudo

**Archivo:** `backend/consumer/src/notifications/notifications.module.ts` — L27

```typescript
exports: [NotificationsService, ClientsModule], // ← ClientsModule entero expuesto
```

Cualquier módulo que importe `NotificationsModule` obtiene acceso directo al `ClientProxy` de RabbitMQ. `NotificationsService` debería ser la **única puerta**, pero `ClientsModule` se exporta desnudo. El scheduler y el controller inyectan `ClientProxy` directamente — `NotificationsService` es decorativo.

---

### II.11. 🟢 BAJO — `CreateTurnoResponse` en `producer.service.ts`

```typescript
export interface CreateTurnoResponse { // ← Tipo HTTP en un servicio de negocio
    status: 'accepted';
    message: string;
}
```

Un detalle de la capa HTTP que se filtró a la capa de servicio.

---

## Sección III — Cero Tests donde más Importan

> *Las únicas partes con tests son las que no necesitan tests. Las partes peligrosas están completamente desnudas.*

### III.1. 🔴 CRÍTICO — Consumer: ZERO Tests, ZERO Infraestructura de Tests

| Métrica | Valor |
|---|---|
| Directorio `test/` | **No existe** |
| Tests unitarios | 0 |
| Tests de integración | 0 |
| Script `test` en `package.json` | **No existe** |
| `jest.config.js` | **No existe** |
| `devDependencies` de testing | Jest, @nestjs/testing, Supertest → **todos instalados, ninguno usado** |

El servicio más crítico del sistema — el que maneja turnos, scheduler, base de datos y RabbitMQ — tiene **cero tests**. Las violaciones de DIP y SRP hacen que agregar tests ahora sea extremadamente difícil (todo está fusionado con Mongoose y ClientProxy).

Alguien instaló las dependencias de testing y luego se fue a almorzar. Permanentemente.

---

### III.2. 🔴 CRÍTICO — Frontend: ZERO Tests, ZERO Infraestructura de Tests

| Métrica | Valor |
|---|---|
| Framework de testing | **Ninguno** (ni Jest, ni Vitest, ni Testing Library) |
| Script `test` en `package.json` | **No existe** |
| Archivos de test | **0** |
| `devDependencies` de testing | **Ninguna** |

El Consumer al menos tiene las dependencias de testing instaladas (aunque sin usar). El Frontend **ni siquiera tiene un test runner instalado**. Es imposible escribir un test sin primero instalar y configurar toda la infraestructura de testing.

---

### III.3. 🟡 ENGAÑOSO — Producer: 36 Tests que Cubren lo Trivial

Los 36 tests suenan impresionantes. La realidad es patética:

| Archivo Testeado | Tests | Complejidad Real |
|---|---|---|
| `CreateTurnoDto` | 10 | Validación de DTO (trivial) |
| `ProducerService` | 10 | Un solo método `createTurno()` |
| `ProducerController` | 16 | Solo POST + GET/:cedula |
| **`TurnosService`** | **0** | 3 métodos, 0 tests |
| **`TurnosGateway`** | **0** | 3 métodos, 0 tests |
| **`EventsController`** | **0** | 2 handlers, 0 tests |

**Las 3 clases más complejas del Producer no tienen tests.** Las 36 pruebas cubren las partes simples y dejan descubiertas las partes peligrosas.

**Atrocidades en los tests existentes:**

- `producer.controller.spec.ts` L295: `turnosService.findByCedula.mockResolvedValue(expectedTurnos as unknown as any)` — triple cast `as unknown as any`. Esto no es un test, es un autoengaño tipado.
- El mock de `TurnosService` solo tiene `findByCedula`, pero el controlador también llama a `findAll()` y `toEventPayload()`. `GET /turnos` ni siquiera se testea.
- L318: El test espera HTTP 500 cuando el servicio lanza `Error`, pero el servicio real lanza `NotFoundException` (HTTP 404). **El test no refleja la realidad.**

---

### III.4. 🔴 CRÍTICO — Zero Tests de Integración Cross-Service

El flujo `crear_turno` → Consumer → `turno_creado` → Producer → WebSocket → Frontend tiene **cero** tests end-to-end o de integración. Un mismatch de serialización en `TurnoEventPayload` solo se descubrirá en producción.

---

## Sección IV — Copy-Paste Driven Development (DRY)

> *¿Para qué abstraer si puedo copiar y pegar? Total, solo hay que mantenerlo en... espera, ¿cuántos lugares?*

### IV.1. 🔴 CRÍTICO — `page.tsx` y `dashboard/page.tsx`: ~80% Idénticos

**Archivos:** `frontend/src/app/page.tsx` (132 líneas) y `frontend/src/app/dashboard/page.tsx` (126 líneas)

Alguien hizo Ctrl+C → Ctrl+V y cambió dos strings. Ambos archivos:

1. Declaran `lastCountRef`, `audioEnabled`, `showToast` → **estado duplicado**
2. Implementan el **mismo** `useEffect` de inicialización de audio — **carácter por carácter idéntico**
3. Implementan el **mismo** `useEffect` de detección de cambio para reproducir sonido — **lógica gemela**
4. Renderizan el **mismo** indicador de conexión WebSocket, hint de audio, error y toast — **JSX gemelo**

**Solución obvia:** Un hook `useAudioNotification(turnos, filterFn)` + un layout component compartido. Pero nadie se molestó.

**Consecuencia directa:** Si cambias la lógica de audio mañana, lo haces en dos lugares. Si olvidas uno: bug silencioso.

---

### IV.2. 🔴 CRÍTICO — Tipos/Schemas/DTOs Duplicados entre Consumer y Producer

| Archivo Consumer | Archivo Producer | Idéntico? |
|---|---|---|
| `src/types/turno-event.ts` | `src/types/turno-event.ts` | ✅ 100% |
| `src/schemas/turno.schema.ts` | `src/schemas/turno.schema.ts` | ≈ 95% (consumer tiene `finAtencionAt`) |
| `src/dto/create-turno.dto.ts` | `src/dto/create-turno.dto.ts` | ≈ 80% (producer tiene Swagger decorators) |

Cualquier cambio en el schema requiere editar **ambos** microservicios. No hay shared library ni monorepo structure. Si cambio un campo en uno y olvido el otro, los eventos de RabbitMQ se rompen **silenciosamente** sin type safety cross-service.

---

### IV.3. 🟡 MEDIO — `toEventPayload()` Duplicado y DIVERGENTE

**Archivos:**
- `backend/consumer/src/turnos/turnos.service.ts` — L132-143
- `backend/producer/src/turnos/turnos.service.ts` — L39-48

Ambos tienen un método `toEventPayload()` que convierte documentos Mongoose a `TurnoEventPayload`. Pero **no son idénticos**: el Consumer incluye `finAtencionAt` y el Producer lo omite. Es DRY violado Y LSP violado al mismo tiempo.

---

### IV.4. 🟡 MEDIO — URIs de Fallback Repetidas en 4+ Ubicaciones

| URI | Repeticiones | Archivos |
|---|---|---|
| `amqp://guest:guest@localhost:5672` | 4 | consumer/app.module, consumer/main, producer/app.module, consumer/notifications.module |
| `mongodb://admin:admin123@localhost:27017/...` | 2 | consumer/app.module, producer/app.module |

Credenciales hardcodeadas como fallback defaults repetidas en múltiples archivos. Además de DRY, esto es un problema de seguridad (ver Sección VI).

---

### IV.5. 🟢 BAJO — Magic Numbers Duplicados

| Valor | Significado | Ubicaciones |
|---|---|---|
| `2600` | Duración del toast (ms) | `page.tsx` L58, `dashboard/page.tsx` L63 |
| `300` | Base backoff (ms) | `httpClient.ts` L153 |
| `15`, `8` | Min/max duración atención (min) | `consumer/turnos.service.ts` L81 |
| `3` | Multiplicador de cleanup | `proxi.ts` L24 |

Ninguno tiene nombre. Ninguno es configurable.

---

## Sección V — Arquitectura Hexagonal de Cartón (Ports & Adapters)

> *Hay carpetas llamadas `domain/`, `repositories/`, `services/`. Hay una interfaz `TurnoRepository`. Todo es fachada. Nada funciona como hexagonal.*

### V.1. 🔴 CRÍTICO — Zero Ports, Zero Adapters en el Backend

**Verificación:**

| Concepto Hexagonal | ¿Existe en Consumer? | ¿Existe en Producer? |
|---|---|---|
| Port de Repositorio (`ITurnoRepository`) | ❌ No | ❌ No |
| Port de Eventos (`IEventPublisher`) | ❌ No | ❌ No |
| Port de Notificaciones (`INotificationPort`) | ❌ No | ❌ No |
| Port de Configuración (`IConfigPort`) | ❌ No | ❌ No |
| Adapter de MongoDB | ❌ (Mongoose directo) | ❌ (Mongoose directo) |
| Adapter de RabbitMQ | ❌ (ClientProxy directo) | ❌ (ClientProxy directo) |
| Use Case explícito | ❌ No | ❌ No |
| Dominio puro (sin dependencias de infra) | ❌ No | ❌ No |

**Cero de cero.** No hay ni un solo artefacto de arquitectura hexagonal en el backend. Todo es NestJS puro acoplado a Mongoose y ClientProxy. El "dominio" es un `TurnosService` con queries MongoDB incrustadas.

---

### V.2. 🔴 CRÍTICO — Frontend: Arquitectura Hexagonal que se Traiciona Sola

El frontend **sí** tiene la estructura de carpetas:

```
domain/       → Turno.ts, CrearTurno.ts
repositories/ → TurnoRepository.ts (interfaz), HttpTurnoRepository.ts (implementación)
services/     → AudioService.ts
hooks/        → useRegistroTurno.ts, useTurnosWebSocket.ts
```

Pero la ejecución se traiciona:

- **`domain/`**: Solo interfaces vacías. Cero comportamiento, cero validaciones, cero invariantes. Es un **modelo anémico disfrazado de dominio**. `Turno.ts` y `CrearTurno.ts` son DTOs con carpeta elegante.
- **`TurnoRepository` interface**: Existe, pero **nadie la usa como tipo**. Los hooks importan `HttpTurnoRepository` concreto.
- **`AudioService`**: Singleton global importado directamente. No hay port `NotificationSoundPort`.

Es como construir una casa con planos hexagonales, pero luego pasar los cables por fuera de las paredes porque "es más rápido".

---

### V.3. 🟡 MEDIO — Schemas Importan de Event Types (Dependencia Invertida al Revés)

**Archivo:** `backend/consumer/src/schemas/turno.schema.ts` — L3

```typescript
import { TurnoEstado, TurnoPriority } from '../types/turno-event';
```

El schema de persistencia (adapter) depende de los tipos de evento de transporte. En hexagonal, el adapter debería depender de **tipos de dominio**. Aquí los tipos de dominio **no existen** — se reemplazan por tipos de evento.

---

### V.4. 🟡 MEDIO — `TurnoRepository` Interface (Frontend) es Cosmética

**Archivo:** `frontend/src/repositories/TurnoRepository.ts` — 10 líneas

```typescript
export interface TurnoRepository {
    crearTurno(turno: CrearTurno): Promise<void>;
    obtenerTurnos(): Promise<Turno[]>;
}
```

Nadie depende de esta interfaz como tipo. Los hooks importan `HttpTurnoRepository` directamente. La interfaz es **código decorativo** — existe para aparentar.

---

## Sección VI — Seguridad Inexistente

> *El sistema de seguridad es un letrero de "Cuidado con el perro" en una casa sin perro y sin puerta.*

### VI.1. 🔴 CRÍTICO — `proxi.ts` NO ES Middleware Activo (Nombre Incorrecto)

**Archivo:** `frontend/src/proxi.ts`

Next.js requiere que el middleware se llame exactamente `middleware.ts` en `/src/`. Este archivo se llama `proxi.ts`. A menos que exista un `middleware.ts` que lo re-exporte (no existe), **NADA de lo que este archivo contiene se ejecuta:**

- ❌ Rate limiting → **NO ACTIVO**
- ❌ Bloqueo de métodos HTTP → **NO ACTIVO**
- ❌ Headers de seguridad (CSP, XSS, etc.) → **NO ACTIVOS**

**Resultado:** El frontend se despliega SIN rate limiting, SIN headers de seguridad, SIN bloqueo de métodos. Todo el código de seguridad es **decorativo**.

---

### VI.2. 🔴 CRÍTICO — CSP Bloquearía WebSocket (Si Estuviera Activo)

**Archivo:** `frontend/src/proxi.ts` — L77

```
connect-src 'self'
```

El CSP permite conexiones solo a `'self'`. Pero `useTurnosWebSocket` conecta a `env.WS_URL` que es `http://localhost:3000` — un **origen diferente** al frontend en `:3001`. Si el middleware estuviera activo, **bloquearía la conexión WebSocket**.

Es un middleware que si no se activa, no protege. Y si se activa, **rompe la app**.

---

### VI.3. 🔴 CRÍTICO — CORS `origin: '*'` en 3 Ubicaciones Sin Control de Entorno

| Archivo | Línea |
|---|---|
| `producer/main.ts` | L15-17 |
| `producer/turnos.gateway.ts` | L17-19 |
| El default general | Sin restricción |

```typescript
app.enableCors({ origin: '*' });
cors: { origin: '*' }
```

Ambos con comentarios que dicen *"en producción, restringir"*. Pero no hay mecanismo para diferenciar entornos. `origin: '*'` se desplegará en **todos** los entornos.

---

### VI.4. 🔴 CRÍTICO — Credenciales Hardcodeadas como Fallback Silencioso

```typescript
// Si el env var no existe, el sistema se conecta con credenciales de dev:
'amqp://guest:guest@localhost:5672'      // ← 4 archivos
'mongodb://admin:admin123@localhost:27017' // ← 2 archivos
```

Si las variables de entorno faltan en producción, el sistema **silenciosamente** intenta conectarse con credenciales de desarrollo. Debería **fail-fast** (throw), no silenciosamente caer a defaults inseguros.

---

### VI.5. 🟡 MEDIO — `sanitize.ts`: Falsa Sensación de Seguridad

```typescript
return input
    .replace(/[<>]/g, "")        // No protege contra javascript: URIs
    .replace(/script/gi, "")     // Bypasseable con "scrscriptipt"
    .trim();
```

7 líneas. No protege contra `on*` event handlers, inyección via atributos HTML, ni double-encoding. El directorio `security/` sugiere que el equipo **confía** en esto. Si lo hace, el sistema es vulnerable.

---

### VI.6. 🟡 MEDIO — Sin Rate Limiting en el Backend Producer

El Producer (`main.ts`) no tiene rate limiting. El middleware del frontend puede no estar activo (ver VI.1). El backend está directamente expuesto via `CORS: '*'` con zero throttling. Un atacante puede **floodear la cola de RabbitMQ** sin restricción.

---

### VI.7. 🟡 MEDIO — Sin Validación de Longitud en Inputs del Frontend

**Archivo:** `frontend/src/components/RegistroTurnoForm/RegistroTurnoForm.tsx` — L40-50

No hay `maxLength` en los inputs. Un usuario puede enviar megabytes de texto por el campo `nombre`. El sanitizer solo quita `<>` y `script` — no limita tamaño. El Consumer DTO tampoco tiene `@MaxLength()`.

---

### VI.8. 🟡 MEDIO — Mock API Accesible en Producción

**Archivo:** `frontend/src/app/api/mock/turnos/route.ts`

Retorna datos falsos con `status: "queued"` (no coincide con respuestas reales). No hay guard de `NODE_ENV`. Este endpoint es deployable y reachable en `/api/mock/turnos` en producción. Un atacante podría usarlo para confundir herramientas de monitoreo.

---

## Sección VII — OCP, LSP e ISP Ignorados

> *Los otros tres principios SOLID que todo el mundo olvida. Este proyecto no es la excepción.*

### VII.1. 🟡 MEDIO — OCP: Estrategia de Asignación Sellada

**Archivo:** `backend/consumer/src/scheduler/scheduler.service.ts` — L77-78

```typescript
const paciente = enEspera[0];
const consultorio = libres[0];
```

Solo asigna **un** paciente por tick, incluso cuando hay múltiples consultorios libres. Si 5 oficinas están libres y 10 pacientes esperan, toma **5 segundos** llenar todas las oficinas. La estrategia de asignación está sellada dentro de `handleSchedulerTick()` — agregar round-robin, batch assignment, o weighted allocation requiere **modificar** este método, no extenderlo.

---

### VII.2. 🟡 MEDIO — OCP: `PRIORITY_ORDER` sin Strategy Pattern

**Archivo:** `backend/consumer/src/turnos/turnos.service.ts` — L10-14

```typescript
const PRIORITY_ORDER: Record<string, number> = {
    preferencial: 1, mayor: 2, general: 3
};
```

Agregar una nueva prioridad (ej: `urgente`) requiere modificar la constante **y** la lógica de sort. No hay strategy pattern ni priority resolver configurable.

---

### VII.3. 🟡 MEDIO — LSP: `toEventPayload()` Divergente entre Producer y Consumer

**Archivos:**
- `consumer/turnos.service.ts` L132-143 — **incluye** `finAtencionAt: turno.finAtencionAt ?? undefined`
- `producer/turnos.service.ts` L39-48 — **omite** `finAtencionAt`

Ambos retornan `TurnoEventPayload` (que declara `finAtencionAt?: number`), pero **no son sustituibles**. Un downstream consumer esperando `finAtencionAt` del Producer recibirá `undefined` silenciosamente. Violación de Liskov.

---

### VII.4. 🟡 MEDIO — LSP: `Turno` del Frontend Incompleto vs Backend

**Archivo:** `frontend/src/domain/Turno.ts`

No incluye `finAtencionAt`. El backend `TurnoEventPayload` sí. El frontend silenciosamente descarta este campo. Si un feature futuro necesita countdowns, el modelo de dominio está incompleto.

---

### VII.5. 🟡 MEDIO — ISP: `TurnoRepository` Interface Demasiado Amplia

**Archivo:** `frontend/src/repositories/TurnoRepository.ts`

```typescript
export interface TurnoRepository {
    crearTurno(turno: CrearTurno): Promise<void>;
    obtenerTurnos(): Promise<Turno[]>;
}
```

`useTurnosRealtime` solo necesita `obtenerTurnos()`. `useRegistroTurno` solo necesita `crearTurno()`. Ambos dependen de la interfaz completa. Deberían existir interfaces segregadas: `TurnoCommandPort` y `TurnoQueryPort`.

---

### VII.6. 🟡 MEDIO — ISP: `TurnosService` del Consumer es Fat Interface para Scheduler

`SchedulerService` depende de `TurnosService` para 5 métodos (`finalizarTurnosLlamados`, `findPacientesEnEspera`, `getConsultoriosOcupados`, `asignarConsultorio`, `toEventPayload`), pero no necesita `crearTurno()`. Si alguien accidentalmente invoca `crearTurno()` desde el scheduler, no hay guardia en tiempo de compilación.

---

## Autopsia por Componente

### Consumer — "El Más Enfermo" (2/10)

| Archivo | Líneas | Violaciones |
|---|---|---|
| `consumer.controller.ts` | 56 | SRP (5 pasos en 1 método), DIP (ClientProxy concreto) |
| `turnos/turnos.service.ts` | 145 | SRP (6 responsabilidades), DIP (Mongoose directo), OCP (priority cerrado), Race condition |
| `scheduler/scheduler.service.ts` | 103 | SRP (lógica core en @Interval), DIP (ClientProxy + process.env), OCP (1-per-tick sellado), Comentario mentiroso |
| `notifications/notifications.service.ts` | ~20 | Código muerto funcional (solo hace Logger.log) |
| `notifications/notifications.module.ts` | 30 | SRP (exporta ClientsModule desnudo) |
| `main.ts` | 43 | SRP (doble inicialización), DRY (URI duplicada) |
| `schemas/turno.schema.ts` | ~35 | Hex (importa de event types, no de domain) |
| `types/turno-event.ts` | ~20 | DRY (duplicado con Producer) |
| `dto/create-turno.dto.ts` | ~15 | DRY (duplicado con Producer), Sin @MaxLength |
| `test/` | **NO EXISTE** | **ZERO TESTS** |

---

### Producer — "El que Aparenta" (4/10)

| Archivo | Líneas | Violaciones |
|---|---|---|
| `producer.controller.ts` | 106 | SRP (Command + Query), DIP (TurnosService concreto) |
| `producer.service.ts` | 33 | DIP (ClientProxy concreto), SRP (CreateTurnoResponse) |
| `turnos/turnos.service.ts` | 50 | DIP (Mongoose directo), SRP (query + mapper + NotFoundException HTTP) |
| `events/turnos.gateway.ts` | 73 | SRP (Gateway consulta DB), DIP (TurnosService concreto) |
| `events/events.controller.ts` | ~20 | ✅ Ok (delgado) |
| `main.ts` | 70 | SRP (5 responsabilidades) |
| `app.module.ts` | 53 | DIP (RMQ config inline), DRY (MongoDB URI duplicada) |
| Tests: 36 | — | **Engañosos**: cubren lo trivial, dejan lo crítico al descubierto |

---

### Frontend — "La Fachada Hexagonal" (2/10)

| Archivo | Líneas | Violaciones |
|---|---|---|
| `app/page.tsx` | 132 | SRP (4 responsabilidades), DRY (80% duplicado con dashboard) |
| `app/dashboard/page.tsx` | 126 | SRP (4 responsabilidades), DRY (80% duplicado con page) |
| `hooks/useRegistroTurno.ts` | 110 | DIP (ignora interfaz), SRP (5 responsabilidades en 1 hook) |
| `hooks/useTurnosWebSocket.ts` | 93 | DIP (Socket.IO directo), Clean (6x console.log sin NODE_ENV guard) |
| `hooks/useTurnosRealtime.ts` | 95 | **CÓDIGO MUERTO** + DIP (nadie lo importa) |
| `lib/httpClient.ts` | 175 | SRP (CB + Retry + Timeout), Clean (`err: any`) |
| `proxi.ts` | 93 | SRP (3 responsabilidades), **NOMBRE INCORRECTO** → middleware inactivo |
| `repositories/TurnoRepository.ts` | 10 | **NADIE LA USA** como tipo — interfaz cosmética |
| `domain/Turno.ts` | 15 | Hex (anémica — solo interface, zero comportamiento) |
| `domain/CrearTurno.ts` | 15 | Hex (anémica — solo interface, zero comportamiento) |
| `services/AudioService.ts` | 80 | DIP (singleton global) |
| `security/sanitize.ts` | 7 | Seguridad (bypasseable, naïve) |
| `api/mock/turnos/route.ts` | ~20 | **CÓDIGO MUERTO** expuesto en producción |
| `config/env.ts` | 29 | DIP menor (process.env directo, no inyectable) |
| `app/layout.tsx` | ~20 | Clean ("Generated by create next app" en metadata) |
| Tests | — | **ZERO** (ni test runner instalado) |

---

### Infraestructura — "Cables por Fuera" (3/10)

| Archivo | Violaciones |
|---|---|
| `docker-compose.yml` | Sin health checks (depends_on básico), Consumer depende de Producer innecesariamente |
| CORS global | `origin: '*'` en 3 ubicaciones sin control de entorno |
| Credenciales | `guest:guest` y `admin:admin123` en 4+ archivos como fallback silencioso |

---

## Mapa Visual de la Catástrofe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        🏥 SISTEMA DE TURNOS MÉDICOS                             │
│                     "Arquitectura Hexagonal" (Autoproclamada)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─── FRONTEND (Next.js) ─── TESTS: 0 ─── TEST RUNNER: NO INSTALADO ────┐    │
│   │                                                                        │    │
│   │  page.tsx ──────┐ 80% COPY-PASTE   proxi.ts ── ¡NOMBRE MAL!          │    │
│   │  dashboard/ ────┘ (4 responsab.)    ↓ Rate Limit + CSP + Methods      │    │
│   │                                     ↓ NADA SE EJECUTA EN PRODUCCIÓN   │    │
│   │  hooks/                                                                │    │
│   │   useRegistroTurno ── new HttpTurnoRepo() ←── IGNORA LA INTERFAZ     │    │
│   │   useTurnosWebSocket ── io() directo ←── SIN ABSTRACCIÓN             │    │
│   │   useTurnosRealtime ── 🧟 CÓDIGO MUERTO (95 líneas)                  │    │
│   │                                                                        │    │
│   │  domain/Turno.ts ── interface vacía ←── MODELO ANÉMICO               │    │
│   │  repositories/TurnoRepository.ts ── NADIE LA USA                      │    │
│   │  api/mock/turnos/ ── 🧟 CÓDIGO MUERTO EXPUESTO EN PROD               │    │
│   │  httpClient.ts ── CB+Retry+Timeout en 175 líneas ←── SRP             │    │
│   │                                                                        │    │
│   └── CORS *, origin '*' ── SIN RATE LIMITING ACTIVO ─────────────────────┘    │
│              │                                                                  │
│              │ WebSocket (Socket.IO directo, hardcoded)                         │
│              ▼                                                                  │
│   ┌─── PRODUCER (NestJS) ─── TESTS: 36 (engañosos) ──────────────────────┐    │
│   │                                                                        │    │
│   │  ProducerController ── Command + Query JUNTOS ←── SRP/CQRS violado   │    │
│   │   ├─ POST /turnos → ProducerService → ClientProxy concreto ←── DIP   │    │
│   │   ├─ GET  /turnos → TurnosService → Mongoose directo ←── DIP         │    │
│   │   └─ GET  /turnos/:cedula → TurnosService                             │    │
│   │                                                                        │    │
│   │  TurnosGateway ── CONSULTA DB DESDE WEBSOCKET ←── SRP+DIP            │    │
│   │  TurnosService ── Mongoose + NotFoundException HTTP ←── SRP+DIP       │    │
│   │     └─ toEventPayload() ── OMITE finAtencionAt ←── LSP               │    │
│   │                                                                        │    │
│   │  main.ts ── 5 responsabilidades ── CORS origin:'*'                    │    │
│   │  app.module.ts ── RMQ config inline ── mongodb://admin:admin123@...   │    │
│   │                                                                        │    │
│   └── ClientProxy concreto ──────── RabbitMQ ──────────────────────────────┘    │
│                                         │                                       │
│         amqp://guest:guest@... (×4)     │                                       │
│                                         ▼                                       │
│   ┌─── CONSUMER (NestJS) ─── TESTS: 0 ─── TEST DIR: NO EXISTE ───────────┐    │
│   │                                                                        │    │
│   │  ConsumerController ── 5 pasos de negocio en 1 método ←── SRP        │    │
│   │   ├─ TurnosService (dominio fusionado con Mongoose) ←── DIP          │    │
│   │   ├─ NotificationsService (solo hace Logger.log) ←── 🧟 NO-OP       │    │
│   │   └─ ClientProxy concreto ←── DIP                                     │    │
│   │                                                                        │    │
│   │  TurnosService ── 145 líneas, 6 responsabilidades ←── SRP            │    │
│   │   ├─ PRIORITY_ORDER (regla de dominio en persistencia) ←── Hex       │    │
│   │   ├─ Math.random() para duración ←── No determinístico                │    │
│   │   ├─ Mutación in-place de documentos ←── MENTIRA                      │    │
│   │   ├─ toEventPayload() INCLUYE finAtencionAt ←── LSP divergente       │    │
│   │   └─ Race condition find→updateMany ←── TOCTOU                        │    │
│   │                                                                        │    │
│   │  SchedulerService ── LÓGICA CORE EN @Interval(1000) ←── SRP          │    │
│   │   ├─ 1 paciente por tick (5s para 5 oficinas) ←── OCP                │    │
│   │   ├─ process.env directo ←── DIP                                      │    │
│   │   ├─ ClientProxy concreto ←── DIP                                     │    │
│   │   └─ Comentario: "cada 5s", Realidad: cada 1s ←── MENTIRA            │    │
│   │                                                                        │    │
│   │  NotificationsModule ── exporta ClientsModule desnudo                  │    │
│   │                                                                        │    │
│   │  main.ts ── DOBLE INICIALIZACIÓN de AppModule ←── SRP                 │    │
│   │                                                                        │    │
│   └── Mongoose directo ── MongoDB ── mongodb://admin:admin123@... ────────┘    │
│                                                                                 │
│   ┌─── DOCKER-COMPOSE ───────────────────────────────────────────────────┐     │
│   │  ❌ Sin health checks (depends_on básico)                             │     │
│   │  ❌ Consumer depends_on Producer (innecesario)                        │     │
│   │  ❌ Credenciales en plain text                                        │     │
│   └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                 │
│  ┌── CÓDIGO MUERTO ──────────────────────────────────────────────────────────┐  │
│  │ 🧟 useTurnosRealtime.ts (95 líneas, 0 importers)                         │  │
│  │ 🧟 api/mock/turnos/route.ts (expuesto en producción)                     │  │
│  │ 🧟 NotificationsService.sendNotification() (solo Logger.log)             │  │
│  │ 🧟 TurnoRepository interface (nadie la usa como tipo)                    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌── DRY VIOLATIONS ─────────────────────────────────────────────────────────┐  │
│  │ 🔄 types/turno-event.ts ─── duplicado Consumer↔Producer (100% idéntico)  │  │
│  │ 🔄 schemas/turno.schema.ts ── duplicado Consumer↔Producer (95%)          │  │
│  │ 🔄 dto/create-turno.dto.ts ── duplicado Consumer↔Producer (80%)         │  │
│  │ 🔄 page.tsx↔dashboard/page.tsx ── duplicado (80%)                        │  │
│  │ 🔄 toEventPayload() ── duplicado Y DIVERGENTE                           │  │
│  │ 🔄 amqp://guest:guest@... ── repetido en 4 archivos                     │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Plan de Resurrección (Roadmap de Refactorización)

### FASE 0 — TRIAGE DE EMERGENCIA (Sprint 1, ~40h)

> *Antes de curar la enfermedad, detener la hemorragia.*

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| 0.1 | **Renombrar `proxi.ts` → `middleware.ts`** y validar que Next.js lo detecte. Corregir CSP `connect-src` para incluir el WS_URL. | 🔴 Seguridad activa | 1h |
| 0.2 | **Eliminar fallback de credenciales**: reemplazar `\|\| 'amqp://guest:guest@...'` por throw si env var falta. | 🔴 Seguridad | 2h |
| 0.3 | **CORS condicional**: `origin: process.env.CORS_ORIGIN \|\| '*'` como mínimo. | 🔴 Seguridad | 1h |
| 0.4 | **Eliminar código muerto**: `useTurnosRealtime.ts`, `api/mock/turnos/route.ts`. | 🟡 Limpieza | 1h |
| 0.5 | **Instalar test runner en Frontend** (Vitest + Testing Library). | 🔴 Fundacional | 4h |
| 0.6 | **Crear `jest.config.js` y script `test` en Consumer**. | 🔴 Fundacional | 2h |
| 0.7 | **Agregar health checks en `docker-compose.yml`** y eliminar `consumer depends_on producer`. | 🟡 Infra | 2h |
| 0.8 | **Corregir metadata** de `layout.tsx` (quitar "Generated by create next app"). | 🟢 Clean | 5min |

---

### FASE 1 — MONOREPO & TIPOS COMPARTIDOS (Sprint 2, ~30h)

> *Matar la duplicación de raíz.*

| # | Acción | Impacto |
|---|---|---|
| 1.1 | Crear paquete `@turnos/shared` con tipos, DTOs, schemas y constantes compartidas. | 🔴 DRY |
| 1.2 | Configurar workspaces (npm/yarn/pnpm) o Nx para monorepo. | 🟡 Estructura |
| 1.3 | Reemplazar tipos duplicados en Consumer, Producer y Frontend por imports del shared. | 🔴 DRY |
| 1.4 | Unificar `toEventPayload()` en el shared (resolviendo la divergencia de `finAtencionAt`). | 🔴 LSP + DRY |
| 1.5 | Centralizar URIs de fallback y credenciales en variables de entorno validadas. | 🟡 DRY + Seguridad |

---

### FASE 2 — PUERTOS Y ADAPTADORES DEL BACKEND (Sprint 3-4, ~80h)

> *Introducir hexagonal real. De verdad esta vez.*

| # | Acción | Impacto |
|---|---|---|
| 2.1 | **Crear interfaz `ITurnoRepository`** en capa de dominio (Consumer + Producer). | 🔴 DIP |
| 2.2 | **Crear `MongoTurnoRepository`** como adapter que implementa `ITurnoRepository`. | 🔴 DIP |
| 2.3 | **Crear interfaz `IEventPublisher`** (reemplaza ClientProxy en Consumer y Producer). | 🔴 DIP |
| 2.4 | **Crear `RabbitMQEventPublisher`** como adapter. | 🔴 DIP |
| 2.5 | **Crear interfaz `IConfigPort`** (reemplaza `process.env` y `ConfigService` directo). | 🟡 DIP |
| 2.6 | **Crear interfaz `INotificationPort`** (reemplaza `NotificationsService` + `ClientProxy` directo). | 🟡 DIP |
| 2.7 | Inyectar todas las interfaces via tokens de NestJS con `useClass`. | 🔴 DIP |
| 2.8 | Escribir tests unitarios para los servicios usando mocks de las nuevas interfaces. | 🔴 Testing |

**Estructura objetivo del Consumer:**
```
backend/consumer/src/
├── domain/
│   ├── ports/
│   │   ├── ITurnoRepository.ts
│   │   ├── IEventPublisher.ts
│   │   ├── INotificationPort.ts
│   │   └── IConfigPort.ts
│   ├── models/
│   │   └── Turno.ts (entidad con comportamiento)
│   ├── services/
│   │   ├── AsignarConsultorioUseCase.ts
│   │   ├── FinalizarTurnosUseCase.ts
│   │   └── CrearTurnoUseCase.ts
│   └── value-objects/
│       ├── TurnoPriority.ts
│       └── DuracionAtencion.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── MongoTurnoRepository.ts
│   │   └── turno.schema.ts
│   ├── messaging/
│   │   └── RabbitMQEventPublisher.ts
│   ├── notifications/
│   │   └── RMQNotificationAdapter.ts
│   └── config/
│       └── NestConfigAdapter.ts
├── application/
│   ├── handlers/
│   │   └── CrearTurnoHandler.ts (orquesta el use case)
│   └── mappers/
│       └── TurnoEventMapper.ts
└── scheduler/
    └── scheduler.service.ts (solo invoca use cases, no contiene lógica)
```

---

### FASE 3 — DESCOMPONER SERVICIOS OBESOS (Sprint 4-5, ~60h)

> *Del God Object al Single Responsibility.*

| # | Acción | Responsabilidades Extraídas |
|---|---|---|
| 3.1 | **Descomponer `consumer/TurnosService`** en: `CrearTurnoUseCase`, `AsignarConsultorioUseCase`, `FinalizarTurnosUseCase`, `TurnoQueryService`. | SRP |
| 3.2 | **Descomponer `consumer/SchedulerService`** → solo invoca use cases. Lógica core extraída a use cases. | SRP |
| 3.3 | **Extraer `ConsumerController`** → Adelgazar a: recibir msg → delegar a handler → ack. | SRP |
| 3.4 | **Separar `producer/ProducerController`** en `TurnoCommandController` (POST) y `TurnoQueryController` (GET). | SRP/CQRS |
| 3.5 | **Extraer Gateway** → solo adaptador de transporte, sin queries a DB. | SRP |
| 3.6 | **Descomponer `frontend/httpClient.ts`** en `CircuitBreakerService`, `RetryService`, `TimeoutService`. | SRP |
| 3.7 | **Extraer `useAudioNotification` hook** del frontend para eliminar duplicación page↔dashboard. | SRP + DRY |
| 3.8 | **Extraer error mapper** de `useRegistroTurno` a `errorMessageMapper.ts`. | SRP |

---

### FASE 4 — FRONTEND HEXAGONAL REAL (Sprint 5-6, ~50h)

> *Hacerle honor a las carpetas que ya existen.*

| # | Acción | Impacto |
|---|---|---|
| 4.1 | **Enriquecer modelos de dominio** (`Turno.ts`, `CrearTurno.ts`) con validaciones y comportamiento (no solo interfaces vacías). | Hex |
| 4.2 | **Segregar `TurnoRepository`** en `TurnoCommandPort` y `TurnoQueryPort`. | ISP |
| 4.3 | **Crear `IRealTimePort`** para abstraer WebSocket/SSE/Polling. | DIP |
| 4.4 | **Crear `IAudioPort`** para abstraer AudioService. | DIP |
| 4.5 | **Inyectar todas las abstracciones** en hooks via React Context o factory. | DIP |
| 4.6 | **Hooks dependen solo de interfaces**, nunca de clases concretas. | DIP |
| 4.7 | **Reescribir `sanitize.ts`** con DOMPurify o equivalente serio. | Seguridad |
| 4.8 | Escribir tests para hooks y componentes usando mocks de los ports. | Testing |

---

### FASE 5 — CONFIGURACIÓN, LOGGING Y BOOTSTRAP (Sprint 6-7, ~30h)

| # | Acción | Impacto |
|---|---|---|
| 5.1 | **Abstraer logging** con interfaz `ILogger` inyectable — eliminar `console.log` en producción. | DIP + Clean |
| 5.2 | **Extraer bootstrap** en clases de configuración: `SwaggerConfig`, `CorsConfig`, `MicroserviceConfig`. | SRP |
| 5.3 | **Eliminar doble inicialización** en `consumer/main.ts`. | SRP |
| 5.4 | **Extraer constantes mágicas** a archivos de configuración nombrados. | Clean |
| 5.5 | **Agregar `@MaxLength` y validaciones** a DTOs del backend. | Seguridad |
| 5.6 | **Rate limiting** en Producer API (NestJS `@nestjs/throttler`). | Seguridad |

---

### FASE 6 — COBERTURA DE TESTS REAL (Sprint 7-8, ~60h)

| # | Acción | Objetivo |
|---|---|---|
| 6.1 | Tests unitarios para **todos los use cases** del Consumer (con mocks de ports). | >90% coverage |
| 6.2 | Tests unitarios para `TurnosService`, `TurnosGateway`, `EventsController` del Producer. | >80% coverage |
| 6.3 | Tests unitarios para **todos los hooks** del Frontend (con mocks de ports). | >80% coverage |
| 6.4 | Tests de integración para el flujo `crear_turno → Consumer → turno_creado → Producer → WS`. | E2E |
| 6.5 | Configurar CI/CD con coverage gates (no merge si coverage <80%). | Quality gate |

---

## Veredicto Final

### Métricas Antes/Después del Refactoring

| Métrica | Antes | Después (Objetivo) |
|---|---|---|
| Acoplamiento a infraestructura | 🔴 95% | 🟢 15% |
| Cobertura de tests | 🔴 ~5% (solo Producer trivial) | 🟢 85%+ |
| Mantenibilidad (SRP compliance) | 🔴 15% | 🟢 90% |
| Duplicación de código | 🔴 75% (cross-service + pages) | 🟢 5% |
| Seguridad activa | 🔴 0% (middleware inactivo) | 🟢 85% |
| Arquitectura hexagonal real | 🔴 0% backend, 10% frontend | 🟢 85% |
| Portabilidad de infraestructura | 🔴 0% (Mongoose + ClientProxy directo) | 🟢 90% |

### Estimación Total

| Fase | Esfuerzo | Sprint |
|---|---|---|
| Fase 0: Triage de Emergencia | ~40h | Sprint 1 |
| Fase 1: Monorepo & Tipos Compartidos | ~30h | Sprint 2 |
| Fase 2: Puertos y Adaptadores | ~80h | Sprint 3-4 |
| Fase 3: Descomponer Servicios | ~60h | Sprint 4-5 |
| Fase 4: Frontend Hexagonal Real | ~50h | Sprint 5-6 |
| Fase 5: Config, Logging, Bootstrap | ~30h | Sprint 6-7 |
| Fase 6: Cobertura de Tests | ~60h | Sprint 7-8 |
| **TOTAL** | **~350h** | **~8 sprints** |

### Prioridades de Ejecución

```
🚨 PRIORIDAD 0 (URGENTE - Semana 1):
   → Renombrar proxi.ts → middleware.ts
   → Eliminar credenciales hardcodeadas como fallback
   → CORS condicional
   → Eliminar código muerto expuesto en producción

🔴 PRIORIDAD 1 (CRÍTICA - Sprint 1-2):
   → Monorepo + shared types (matar duplicación)
   → Instalar test runners en Consumer y Frontend

🔴 PRIORIDAD 2 (CRÍTICA - Sprint 3-4):
   → Interfaces de repository y event publisher (DIP)
   → Descomponer TurnosService y SchedulerService (SRP)

🟡 PRIORIDAD 3 (ALTA - Sprint 4-6):
   → Separar Command/Query controllers (CQRS)
   → Frontend hexagonal real (honrar las abstracciones)
   → Descomponer httpClient

🟢 PRIORIDAD 4 (MEDIA - Sprint 6-8):
   → Abstraer logging y configuración
   → Bootstrap modular
   → Coverage gates en CI/CD
```

---

### Conclusión Hostil

Este proyecto es un **monumento a las buenas intenciones abandonadas**. Hay carpetas `domain/` y `repositories/`. Hay una interfaz `TurnoRepository`. Hay `devDependencies` de testing. Hay un archivo de seguridad. Todo decorativo, nada funcional.

Es como un hospital que tiene las señales de emergencia pintadas en la pared, los extintores de cartón, y las puertas de salida selladas con pegamento. Desde afuera parece una clínica. Desde el código, es un prototipo de 3 horas que alguien dockerizó y llamó "arquitectura de microservicios".

**47+ violaciones SOLID. 0 tests en el 66% del sistema. 0 ports. 0 adapters. 0 middleware activo. 0 abstracciones en el backend. Credenciales hardcodeadas en 4 archivos. Un `sanitize.ts` de 7 líneas bypasseable con `scrscriptipt`.**

La buena noticia: el sistema SÍ funciona (probablemente). La mala noticia: funciona como un castillo de naipes — mientras nadie lo toque, no cambie nada, ni sople viento.

**Recomendación final:** Comenzar por la Fase 0 inmediatamente. Cada día que pasa con `proxi.ts` mal nombrado es un día sin seguridad activa en producción. Cada hora sin shared types es una hora donde un cambio de schema puede romper silenciosamente la comunicación entre servicios.

El reloj de la deuda técnica ya está corriendo. Y no tiene snooze.

---

*Informe generado por el Arquitecto Senior Hostil.*  
*Fuentes: `docs/DEBT_REPORT_CONSUMER.MD`, `docs/DEBT_REPORT_PRODUCER.MD`, `docs/DEBT_REPORT_FRONT.MD`, y análisis de código fuente directo.*  
*Fecha de última actualización: 2026-02-18*
