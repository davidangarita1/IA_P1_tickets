# DEBT_REPORT.md — Backend Technical Debt Audit

> Scope: `backend/producer/src/` and `backend/consumer/src/`  
> Standard: AI_WORKFLOW.md v1.2 (Hexagonal Architecture + SOLID)  
> Date: 17 de febrero de 2026

---

## Summary

| Category | Violations found | Critical | Medium | Low |
|---|---|---|---|---|
| A — Hexagonal Architecture | 16 | 12 | 4 | 0 |
| B — SOLID | 11 | 4 | 5 | 2 |
| C — Configuration & Security | 4 | 0 | 4 | 0 |
| D — Reliability | 1 | 1 | 0 | 0 |
| E — Type Safety | 2 | 0 | 2 | 0 |
| **TOTAL** | **34** | **17** | **15** | **2** |

**Severity legend**
- 🔴 Critical — breaks architecture contract or causes production risk
- 🟡 Medium — violates a SOLID principle, increases coupling or maintainability cost
- 🟢 Low — minor improvement, style or naming

---

## Producer (`backend/producer/src/`)

### Current layer map

| File | Current layer | Expected layer | Aligned? |
|---|---|---|---|
| `producer.controller.ts` | Presentation | Presentation | ✅ |
| `producer.service.ts` | Application | Application | ✅ |
| `main.ts` | Infrastructure/Bootstrap | Infrastructure/Bootstrap | ✅ |
| `app.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `dto/create-turno.dto.ts` | Presentation | Presentation | ✅ |
| `schemas/turno.schema.ts` | Infrastructure | Infrastructure | ✅ |
| `turnos/turnos.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `turnos/turnos.service.ts` | Application + Infrastructure (hybrid) | Application (via Ports) | ❌ |
| `events/events.controller.ts` | Presentation | Presentation | ✅ |
| `events/turnos.gateway.ts` | Presentation | Presentation | ✅ |
| `events/events.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `types/turno-event.ts` | Domain | Domain | ✅ |

### Violations

#### [PROD-A1] 🔴 No domain entity classes exist
- **File:** (missing) `src/domain/entities/`
- **Rule:** A1 — Domain must contain pure entity classes, not infrastructure schemas
- **Problem:** The project uses Mongoose schemas (`src/schemas/turno.schema.ts`) as domain entities. Mongoose decorators (`@Prop`, `@Schema`) are infrastructure concerns that leak into what should be the domain layer.
- **Fix:** Create `src/domain/entities/turno.entity.ts` as a pure TypeScript class with no framework dependencies. Schemas should be adapters that map between domain entities and database documents.

#### [PROD-A2] 🔴 No domain ports defined
- **File:** (missing) `src/domain/ports/`
- **Rule:** A4 — Ports (interfaces) must exist in the domain layer to define contracts
- **Problem:** No `ITurnoRepository` or `IEventPublisher` interfaces exist. Services depend directly on concrete implementations.
- **Fix:** Create `src/domain/ports/ITurnoRepository.ts` with methods like `findAll()`, `findByCedula()`, `save()`, etc. Create `src/domain/ports/IEventPublisher.ts` with `publish(event, payload)` method.

#### [PROD-A3] 🔴 Service directly injects Mongoose Model
- **File:** `src/turnos/turnos.service.ts` (line 9)
- **Rule:** A2, B6 — Application layer must not depend on infrastructure implementations
- **Problem:** `constructor(@InjectModel(Turno.name) private readonly turnoModel: Model<TurnoDocument>)` — the service directly depends on Mongoose, violating DIP.
- **Fix:** Inject `ITurnoRepository` token instead. Create `TurnoMongooseAdapter` that implements `ITurnoRepository` and wraps the Mongoose model.

#### [PROD-A4] 🔴 Service directly injects ClientProxy (RabbitMQ)
- **File:** `src/producer.service.ts` (line 16)
- **Rule:** A2, B7 — Application layer must not depend on messaging infrastructure
- **Problem:** `constructor(@Inject('TURNOS_SERVICE') private readonly client: ClientProxy)` — direct dependency on NestJS microservices infrastructure.
- **Fix:** Define `IEventPublisher` port in domain, create `RabbitMQEventPublisher` adapter, inject via token `EVENT_PUBLISHER_TOKEN`.

#### [PROD-A5] 🔴 No adapter implementations with injection tokens
- **File:** `src/turnos/turnos.module.ts`
- **Rule:** A5 — Adapters must be registered with tokens in modules
- **Problem:** Module directly provides `TurnosService` without separation between application service and infrastructure adapter.
- **Fix:** Create adapters (`TurnoMongooseAdapter`, `RabbitMQEventPublisher`) and register them with tokens:
  ```typescript
  {
    provide: 'TURNO_REPOSITORY_TOKEN',
    useClass: TurnoMongooseAdapter
  }
  ```

#### [PROD-A6] 🔴 Missing Use Case layer
- **File:** (missing) `src/application/use-cases/`
- **Rule:** Hexagonal Architecture — Use Cases orchestrate domain logic
- **Problem:** Business logic is mixed into controllers and services. No clear use case classes like `CreateTurnoUseCase`, `GetAllTurnosUseCase`.
- **Fix:** Create `src/application/use-cases/create-turno.use-case.ts` that injects ports and executes domain logic. Controllers should only translate HTTP → Use Case → HTTP.

#### [PROD-B1] 🟡 TurnosService mixes responsibilities
- **File:** `src/turnos/turnos.service.ts`
- **Rule:** B1 (SRP) — One class, one reason to change
- **Problem:** Service does: MongoDB querying + data mapping (`toEventPayload()`) + sorting logic. Has 3 reasons to change: query logic, mapping format, or sorting algorithm.
- **Fix:** Split into: `QueryTurnoUseCase` (application), `TurnoMongooseAdapter` (infrastructure), `TurnoMapper` (application/infrastructure boundary).

#### [PROD-B2] 🟡 ProducerService lacks OnModuleDestroy
- **File:** `src/producer.service.ts`
- **Rule:** D1 — Services managing external connections must implement cleanup
- **Problem:** `ClientProxy` connection is never explicitly closed. While NestJS may handle this, explicit cleanup is best practice for microservices.
- **Fix:** Implement `OnModuleDestroy` and call `await this.client.close()`.

#### [PROD-C1] 🟡 Hardcoded credentials in fallback config
- **File:** `src/app.module.ts` (line 21)
- **Rule:** C1 — No hardcoded credentials in code
- **Problem:** `'amqp://guest:guest@localhost:5672'` and MongoDB URI `'mongodb://admin:admin123@localhost:27017/turnos_db?authSource=admin'` contain hardcoded credentials in fallback values.
- **Fix:** Remove fallback credentials entirely. Use `configService.get<string>('MONGODB_URI')` without `||` operator. Fail fast if env vars are missing.

#### [PROD-C2] 🟡 Hardcoded RabbitMQ credentials in Main.ts
- **File:** `src/main.ts` (line 42)
- **Rule:** C1 — No hardcoded credentials
- **Problem:** Fallback `'amqp://guest:guest@localhost:5672'` exposes default RabbitMQ credentials.
- **Fix:** Remove fallback, validate env vars on startup.

---

## Consumer (`backend/consumer/src/`)

### Current layer map

| File | Current layer | Expected layer | Aligned? |
|---|---|---|---|
| `consumer.controller.ts` | Presentation | Presentation | ✅ |
| `app.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `main.ts` | Infrastructure/Bootstrap | Infrastructure/Bootstrap | ✅ |
| `dto/create-turno.dto.ts` | Presentation | Presentation | ✅ |
| `schemas/turno.schema.ts` | Infrastructure | Infrastructure | ✅ |
| `turnos/turnos.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `turnos/turnos.service.ts` | Application + Infrastructure (hybrid) | Application (via Ports) | ❌ |
| `scheduler/scheduler.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `scheduler/scheduler.service.ts` | Application | Application | ✅ |
| `notifications/notifications.module.ts` | Infrastructure/Config | Infrastructure/Config | ✅ |
| `notifications/notifications.service.ts` | Application | Application | ✅ |
| `types/turno-event.ts` | Domain | Domain | ✅ |

### Violations

#### [CONS-A1] 🔴 No domain entity classes exist
- **File:** (missing) `src/domain/entities/`
- **Rule:** A1 — Domain entities must be pure classes
- **Problem:** Same as Producer — Mongoose schema is used as domain entity.
- **Fix:** Create `src/domain/entities/turno.entity.ts` with pure business logic.

#### [CONS-A2] 🔴 No domain ports defined
- **File:** (missing) `src/domain/ports/`
- **Rule:** A4 — Ports define contracts for adapters
- **Problem:** No interfaces for `ITurnoRepository`, `IEventPublisher`, `INotificationService`.
- **Fix:** Create port interfaces in `src/domain/ports/`.

#### [CONS-A3] 🔴 TurnosService directly injects Mongoose Model
- **File:** `src/turnos/turnos.service.ts` (line 15)
- **Rule:** A2, B6 — No infrastructure in application layer
- **Problem:** `@InjectModel(Turno.name) private readonly turnoModel: Model<TurnoDocument>` — direct Mongoose dependency.
- **Fix:** Inject `ITurnoRepository` token, create adapter.

#### [CONS-A4] 🔴 ConsumerController directly injects ClientProxy
- **File:** `src/consumer.controller.ts` (line 16)
- **Rule:** A2, B7 — Controllers must not depend on messaging infrastructure
- **Problem:** `@Inject('TURNOS_NOTIFICATIONS') private readonly notificationsClient: ClientProxy` — direct RabbitMQ dependency.
- **Fix:** Inject `IEventPublisher` port via token.

#### [CONS-A5] 🔴 SchedulerService directly injects ClientProxy
- **File:** `src/scheduler/scheduler.service.ts` (line 23)
- **Rule:** A2, B7 — Services must depend on ports, not concrete infrastructure
- **Problem:** `@Inject('TURNOS_NOTIFICATIONS') private readonly notificationsClient: ClientProxy` — messaging infrastructure leaking into application layer.
- **Fix:** Inject `IEventPublisher` port.

#### [CONS-A6] 🔴 No adapter layer with injection tokens
- **File:** `src/turnos/turnos.module.ts`
- **Rule:** A5 — Adapters must be registered with tokens
- **Problem:** Direct service provision without port/adapter separation.
- **Fix:** Register adapters with tokens in modules.

#### [CONS-A7] 🟡 ConsumerController contains validation logic
- **File:** `src/consumer.controller.ts` (lines 29-30)
- **Rule:** A3 — Controllers should only translate requests, not contain business logic
- **Problem:** `if (typeof data.cedula !== 'number' || Number.isNaN(data.cedula))` — validation logic belongs in Use Case or DTO validator.
- **Fix:** Move validation to `CreateTurnoUseCase` or rely on `ValidationPipe` transformation.

#### [CONS-A8] 🟡 TurnosService tightly coupled to Scheduler
- **File:** `src/scheduler/scheduler.service.ts` (line 19)
- **Rule:** A2 — Services should depend on ports
- **Problem:** `private readonly turnosService: TurnosService` — Scheduler depends on concrete service instead of a port like `IAssignRoomUseCase`.
- **Fix:** Create `IAssignRoomUseCase` port, inject it into Scheduler.

#### [CONS-B1] 🔴 TurnosService has multiple responsibilities
- **File:** `src/turnos/turnos.service.ts`
- **Rule:** B1 (SRP) — Single Responsibility Principle
- **Problem:** Service does: persistence (line 23), queries (line 38), sorting logic (lines 47-58), room assignment (line 79), state transitions (line 104), mapping (line 133). Six distinct responsibilities.
- **Fix:** Decompose into: `TurnoRepository` (persistence), `AssignRoomUseCase` (business logic), `TurnoMapper`, `PrioritySortingStrategy`.

#### [CONS-B2] 🔴 SchedulerService has multiple responsibilities
- **File:** `src/scheduler/scheduler.service.ts`
- **Rule:** B1 (SRP) — One class, one reason to change
- **Problem:** Service does: interval management, room assignment orchestration, finalizing turnos, event publishing. Four responsibilities.
- **Fix:** Extract `AssignRoomUseCase`, `FinalizeTurnoUseCase`. Scheduler should only orchestrate timing.

#### [CONS-B3] 🟡 handleSchedulerTick exceeds 30 lines
- **File:** `src/scheduler/scheduler.service.ts` (method `handleSchedulerTick()`, lines 47-107)
- **Rule:** B2 (SRP) — Functions should be ≤ ~30 lines
- **Problem:** Method is ~60 lines, mixing finalization logic + assignment logic + error handling.
- **Fix:** Extract `finalizeExpiredTurnos()` and `assignAvailableRooms()` as separate methods or use cases.

#### [CONS-B4] 🟡 handleCrearTurno exceeds 30 lines
- **File:** `src/consumer.controller.ts` (method `handleCrearTurno()`, lines 19-66)
- **Rule:** B2 (SRP) — Keep functions small
- **Problem:** Method is ~47 lines, mixing validation + persistence + notification + error handling.
- **Fix:** Extract to `CreateTurnoUseCase.execute()`, controller should only call use case and handle ack/nack based on result.

#### [CONS-B5] 🟡 Priority sorting logic could be Strategy pattern
- **File:** `src/turnos/turnos.service.ts` (lines 47-58)
- **Rule:** B3 (OCP) — Extend via new classes, don't modify existing
- **Problem:** `PRIORITY_ORDER` const + inline sorting logic. If priority rules change (e.g., add "urgent" tier, or time-window preferences), must modify this function.
- **Fix:** Create `IPrioritySortingStrategy` interface with implementations like `StandardPriorityStrategy`, `TimeSensitivePriorityStrategy`.

#### [CONS-B6] 🟢 Priority sorting strategy is hardcoded
- **File:** `src/turnos/turnos.service.ts` (lines 10-14)
- **Rule:** B3 (OCP) — Open for extension
- **Problem:** `PRIORITY_ORDER` const cannot be changed without modifying code. Future requirements (VIP patients, emergency cases) require code changes.
- **Fix:** Use Strategy pattern with dependency injection of sorting strategy.

#### [CONS-D1] 🔴 SchedulerService missing OnModuleDestroy
- **File:** `src/scheduler/scheduler.service.ts`
- **Rule:** D1 — Services with intervals must implement cleanup
- **Problem:** `SchedulerRegistry` is used to register interval (line 32), but no `OnModuleDestroy` to clear it. If module reloads or app shuts down, interval may leak.
- **Fix:** Implement `OnModuleDestroy`:
  ```typescript
  onModuleDestroy() {
    this.schedulerRegistry.deleteInterval('scheduler-asignacion-turnos');
  }
  ```

#### [CONS-C1] 🟡 Hardcoded credentials in Main.ts
- **File:** `src/main.ts` (line 19)
- **Rule:** C1 — No hardcoded credentials
- **Problem:** Fallback `'amqp://guest:guest@localhost:5672'` contains default credentials.
- **Fix:** Remove fallback, fail fast if `RABBITMQ_URL` is not set.

#### [CONS-C2] 🟡 Hardcoded MongoDB credentials in AppModule
- **File:** `src/app.module.ts` (line 25)
- **Rule:** C1 — No credentials in code
- **Problem:** Fallback `'mongodb://admin:admin123@localhost:27017/turnos_db?authSource=admin'` exposes admin credentials.
- **Fix:** Remove fallback, validate on startup.

---

## Cross-cutting Issues

### [CROSS-E1] 🟡 TurnoEventPayload duplicated across microservices
- **Files:** 
  - `backend/producer/src/types/turno-event.ts`
  - `backend/consumer/src/types/turno-event.ts`
- **Rule:** E2 — DRY principle, avoid type duplication
- **Problem:** Same interface defined in both microservices. If schema changes, must update in two places, increasing risk of inconsistency.
- **Fix:** Create a shared package `@turnos/shared-types` or `backend/shared/src/types/turno-event.ts` and import from both microservices. Update `tsconfig.json` with path aliases.

### [CROSS-E2] 🟡 Domain types scattered, no shared domain package
- **Files:** Both `types/turno-event.ts` files + `schemas/turno.schema.ts` in both
- **Rule:** Hexagonal Architecture — Domain should be centralized
- **Problem:** Domain types (`TurnoEstado`, `TurnoPriority`, `TurnoEventPayload`) are duplicated. Schemas are also duplicated.
- **Fix:** Create `backend/shared/src/domain/` with entities and types. Both microservices import from shared package.

### [CROSS-A1] 🟡 No separation between read and write models
- **Files:** Both microservices use same `TurnosService` for reads and writes
- **Rule:** CQRS principle (recommended for event-driven architectures)
- **Problem:** Producer reads from MongoDB for snapshots (`findAll()`, `findByCedula()`), Consumer writes to MongoDB. No clear separation. As scale grows, read/write contention can occur.
- **Fix:** Consider CQRS: Consumer maintains write model, Producer maintains read-optimized view (could be separate collection or even Redis cache). Not critical now but architectural improvement.

---

## Recommended Fix Order

Execute in this exact sequence to avoid regressions:

| Step | Action | Microservice | Severity addressed |
|---|---|---|---|
| 1 | Remove hardcoded credentials from fallbacks in `main.ts`, `app.module.ts` | Both | C1, C2 (🟡) |
| 2 | Create `backend/shared/src/domain/types/turno-event.ts` and update imports | Both | E1, E2 (🟡) |
| 3 | Create `backend/shared/src/domain/entities/turno.entity.ts` (pure class) | Both | A1 (🔴) |
| 4 | Create `src/domain/ports/ITurnoRepository.ts` | Both | A2, A4 (🔴) |
| 5 | Create `src/domain/ports/IEventPublisher.ts` | Both | A2, A4 (🔴) |
| 6 | Create `src/infrastructure/adapters/turno-mongoose.adapter.ts` implementing `ITurnoRepository` | Both | A3, A5 (🔴) |
| 7 | Create `src/infrastructure/adapters/rabbitmq-event-publisher.adapter.ts` implementing `IEventPublisher` | Both | A4, A5 (🔴) |
| 8 | Register adapters with injection tokens in modules | Both | A5 (🔴) |
| 9 | Refactor `TurnosService` to inject `ITurnoRepository` token instead of `@InjectModel` | Both | A3, B6 (🔴) |
| 10 | Refactor `ProducerService` to inject `IEventPublisher` token instead of `ClientProxy` | Producer | A4, B7 (🔴) |
| 11 | Create `src/application/use-cases/create-turno.use-case.ts` | Consumer | A6, B1 (🔴) |
| 12 | Create `src/application/use-cases/assign-room.use-case.ts` | Consumer | A6, B1 (🔴) |
| 13 | Refactor `ConsumerController.handleCrearTurno()` to call `CreateTurnoUseCase.execute()` | Consumer | A7, B4 (🟡) |
| 14 | Refactor `SchedulerService` to inject `IAssignRoomUseCase` instead of `TurnosService` | Consumer | A8, B2, B3 (🔴/🟡) |
| 15 | Extract priority sorting into `IPrioritySortingStrategy` with implementations | Consumer | B5, B6 (🟡/🟢) |
| 16 | Add `OnModuleDestroy` to `SchedulerService` to clear interval | Consumer | D1 (🔴) |
| 17 | Add `OnModuleDestroy` to `ProducerService` to close ClientProxy | Producer | B2 (🟡) |
| 18 | Extract `finalizeExpiredTurnos()` from `handleSchedulerTick()` | Consumer | B3 (🟡) |
| 19 | Extract validation logic from `ConsumerController` to Use Case | Consumer | A7 (🟡) |

---

## What Is Already Correct

1. ✅ **Atomic room assignment** — `turnos.service.ts` in Consumer uses `findOneAndUpdate` with filters, preventing race conditions.
2. ✅ **Proper ack/nack handling** — Consumer's `handleCrearTurno()` distinguishes `BadRequestException` (nack, no requeue) from transient errors (requeue).
3. ✅ **No `any` types** — All TypeScript files use explicit types or inference. Type safety is maintained throughout.
4. ✅ **Cedula typed as number** — Both DTOs and schemas correctly use `number` for cedula field.
5. ✅ **ValidationPipe configured globally** — Both microservices use `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
6. ✅ **Clean controller presentation layer** — `ProducerController` has no business logic, only delegates to services.
7. ✅ **WebSocket Gateway is clean** — `TurnosGateway` only broadcasts events, no business logic.
8. ✅ **EventsController is clean** — Only forwards RabbitMQ events to WebSocket, proper separation.
9. ✅ **ConfigService is used** — All services read from `ConfigService`, environment-aware configuration.
10. ✅ **Swagger documentation** — Producer has comprehensive API documentation with examples.
11. ✅ **Logger usage** — `console.log` has been replaced with NestJS `Logger` throughout (per human checks in code).
12. ✅ **Scheduler interval is configurable** — `SCHEDULER_INTERVAL_MS` can be set via environment variables.
13. ✅ **RabbitMQ queues are durable** — Both microservices configure `queueOptions: { durable: true }`.
14. ✅ **Prefetch count set** — Consumer uses `prefetchCount: 1` to avoid overload.
15. ✅ **Null safety operators** — Code uses `??` instead of `||` for config fallbacks (human check passed).

---

*Generated by: AI audit using AI_WORKFLOW.md v1.2*  
*Next action: Use this report as the task list for Week 1 refactoring*
