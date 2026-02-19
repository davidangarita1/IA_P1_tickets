# AI_WORKFLOW.md — Real-Time Medical Appointment System

> Mandatory context file. Every code generation request must attach this document.  
> Repository: https://github.com/Duver0/IA_P1  
> Guiding principles: **Hexagonal Architecture + SOLID**

---

## 1. WHAT THIS PROJECT IS

A medical appointment management system built on **Microservices**, **Event-Driven Architecture**, and **real-time WebSockets**.

The core flow:

1. The client creates an appointment via HTTP → the Producer publishes to RabbitMQ → responds `202 Accepted`
2. The Consumer persists the appointment in MongoDB with status `"waiting"`
3. A Scheduler (every 15 s, configurable via `SCHEDULER_INTERVAL_MS`) assigns a consultation room atomically
4. The `appointment_updated` event travels RabbitMQ → Producer → WebSocket → Frontend in real time

```
Client (Next.js)
  │  POST /turnos (HTTP)
  ▼
Producer (NestJS :3000)  ──► turnos_queue (RabbitMQ)
  ▲                                    │
  │ WebSocket (socket.io)         Consumer (NestJS)
  │                                    │
  └── turnos_notifications ◄───── MongoDB (turnos)
       (RabbitMQ)                  Scheduler every 15s
```

---

## 2. TECH STACK — NON-NEGOTIABLE

| Layer | Technology | Minimum version |
|---|---|---|
| Backend microservices | **NestJS** | v10 |
| Frontend | **Next.js** (App Router) | v14 |
| Database | **MongoDB** | v7 |
| Message broker | **RabbitMQ** | v3 |
| WebSockets | **socket.io** (via `@nestjs/websockets`) | — |
| Containers | **Docker + Docker Compose** | — |
| Frontend styles | **CSS Modules** (`page.module.css`) only | — |

### Forbidden without documented justification:
- ❌ Tailwind, Bootstrap, or any external CSS library
- ❌ Any ORM/ODM other than Mongoose
- ❌ Any other message broker (Kafka, Redis Pub/Sub, etc.)
- ❌ Any backend framework other than NestJS
- ❌ Relational databases (paradigm change)

---

## 3. PROJECT STRUCTURE

```
IA_P1/
├── backend/
│   ├── producer/               # API Gateway + WebSocket Server (port 3000)
│   │   └── src/
│   │       ├── turnos/         # HTTP Controllers, DTOs, business logic
│   │       └── events/         # RabbitMQ → WebSocket event handlers
│   └── consumer/               # Worker Service (no exposed port)
│       └── src/
│           ├── turnos/         # MongoDB persistence, Mongoose schemas
│           └── scheduler/      # Automatic assignment logic (cron)
├── frontend/                   # Next.js App Router (port 3001)
│   └── src/
│       ├── hooks/              # useTurnosWebSocket (custom hook)
│       └── domain/             # Shared models (TypeScript interfaces)
├── docker-compose.yml          # Full container orchestration
└── .env.example                # Required variables (never commit .env)
```

---

## 4. HEXAGONAL ARCHITECTURE — MANDATORY

This project uses **Hexagonal Architecture (Ports & Adapters)**. All AI-generated code must respect this structure.

```
Domain (Core)
  ├── Entities           → pure classes, zero infrastructure imports
  ├── Ports (interfaces) → ITurnoRepository, IEventPublisher
  └── Use Cases          → business logic, only consumes ports

Application
  └── Services / Handlers → orchestrate use cases, inject ports

Infrastructure (Adapters)
  ├── TurnoMongoDBAdapter   → implements ITurnoRepository
  └── RabbitMQPublisher     → implements IEventPublisher

Presentation
  ├── HTTP Controllers
  └── WebSocket Gateways
```

### Dependency rule (always point inward):
```
Presentation → Application → Domain
Infrastructure → Domain
```

**AI must NEVER inject `@InjectModel` or `ClientProxy` directly into a Service or Controller.**  
Always go through a port (interface) first.

---

## 5. SOLID PRINCIPLES — APPLIED TO THIS PROJECT

SOLID is not a theoretical checklist. Each principle has a concrete rule for this codebase and a violation signal the AI must detect before generating code.

---

### S — Single Responsibility Principle (SRP)
> **One class, one reason to change.**

**Application in this project:**

| Class | Single responsibility | Violation signal |
|---|---|---|
| `TurnosController` | Receive HTTP, delegate to Use Case | Contains business logic or DB access |
| `CreateAppointmentUseCase` | Orchestrate appointment creation | Calls Mongoose or RabbitMQ directly |
| `TurnoMongoDBAdapter` | Persist to MongoDB | Contains scheduler or business validation logic |
| `SchedulerService` | Fire assignment every N seconds | Contains the assignment logic itself |
| `useTurnosWebSocket` (hook) | Manage WebSocket connection | Contains render logic or HTTP calls |

```typescript
// ❌ Violates SRP — the Service does too much
@Injectable()
export class TurnosService {
  async create(dto: CreateTurnoDto) {
    const turno = await this.turnoModel.save(dto);      // persistence
    await this.client.emit('crear_turno', turno);        // messaging
    this.logger.log(`Appointment ${turno.id} created`);  // logging
    return { status: 'accepted' };                       // HTTP response
  }
}

// ✅ Respects SRP — each class does one thing
class CreateAppointmentUseCase {
  constructor(
    private readonly repo: ITurnoRepository,
    private readonly publisher: IEventPublisher,
  ) {}
  async execute(dto: CreateTurnoDto): Promise<void> {
    const turno = Turno.create(dto);
    await this.repo.save(turno);
    await this.publisher.publish('crear_turno', turno);
  }
}
```

---

### O — Open/Closed Principle (OCP)
> **Open for extension, closed for modification.**

**Application in this project:** add new functionality without touching code that already works.

```typescript
// Scenario: add VIP priority without modifying the existing scheduler

// ✅ Correct — the scheduler consumes an interchangeable strategy
export interface IAssignmentStrategy {
  selectRoom(turno: Turno): string;
}

@Injectable()
export class FIFOAssignmentStrategy implements IAssignmentStrategy {
  selectRoom(turno: Turno): string {
    return 'general-room';
  }
}

// For VIP: add a new class, never touch the scheduler:
@Injectable()
export class PriorityAssignmentStrategy implements IAssignmentStrategy {
  selectRoom(turno: Turno): string {
    return turno.priority === 'alta' ? 'vip-room' : 'general-room';
  }
}
```

**Violation signal:** adding `if (priority === 'vip')` inside `SchedulerService` instead of creating a new strategy.

---

### L — Liskov Substitution Principle (LSP)
> **Any port implementation must be interchangeable without breaking the system.**

**Application in this project:** MongoDB can be replaced by another DB without `CreateAppointmentUseCase` noticing.

```typescript
// The port defines the contract
export interface ITurnoRepository {
  save(turno: Turno): Promise<void>;
  findWaiting(): Promise<Turno[]>;
  assignRoom(id: string, room: string): Promise<Turno>;
}

// MongoDB implementation — substitutable
@Injectable()
export class TurnoMongoDBAdapter implements ITurnoRepository {
  async save(turno: Turno): Promise<void> { /* ... */ }
  async findWaiting(): Promise<Turno[]> { /* ... */ }
  async assignRoom(id: string, room: string): Promise<Turno> { /* ... */ }
}

// In-Memory implementation for tests — also substitutable
export class TurnoInMemoryAdapter implements ITurnoRepository {
  private turnos: Turno[] = [];
  async save(turno: Turno): Promise<void> { this.turnos.push(turno); }
  async findWaiting(): Promise<Turno[]> { return this.turnos.filter(t => t.estado === 'espera'); }
  async assignRoom(id: string, room: string): Promise<Turno> { /* ... */ }
}
```

**Violation signal:** an implementation throws exceptions the port does not declare, or returns `null` when the contract promises an object.

---

### I — Interface Segregation Principle (ISP)
> **A class should not depend on methods it does not use.**

**Application in this project:** do not create a single bloated `ITurnoService` interface.

```typescript
// ❌ Violates ISP — one port with too many responsibilities
export interface ITurnoService {
  create(dto: CreateTurnoDto): Promise<void>;
  list(): Promise<Turno[]>;
  findByCedula(cedula: number): Promise<Turno[]>;
  assignRoom(id: string): Promise<void>;
  sendNotification(turno: Turno): Promise<void>;  // ← unrelated to persistence
}

// ✅ Respects ISP — focused, granular ports
export interface ITurnoRepository {
  save(turno: Turno): Promise<void>;
  list(): Promise<Turno[]>;
  findByCedula(cedula: number): Promise<Turno[]>;
  assignRoom(id: string, room: string): Promise<Turno>;
}

export interface IEventPublisher {
  publish(event: string, payload: unknown): Promise<void>;
}

export interface INotificationGateway {
  emit(event: string, data: unknown): void;
}
```

**Practical rule:** if a class implements a port and leaves any method as `throw new Error('Not implemented')`, the port violates ISP — split it.

---

### D — Dependency Inversion Principle (DIP)
> **Depend on abstractions (ports), never on concrete implementations.**

**Application in this project:** this is the most critical rule and the one AI violates most frequently.

```typescript
// ❌ Violates DIP — the Use Case knows about MongoDB
@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @InjectModel(TurnoModel.name)
    private readonly turnoModel: Model<TurnoDocument>,  // concrete implementation
  ) {}
}

// ✅ Respects DIP — the Use Case only knows the port
@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY_TOKEN)
    private readonly repo: ITurnoRepository,            // abstraction

    @Inject(EVENT_PUBLISHER_TOKEN)
    private readonly publisher: IEventPublisher,        // abstraction
  ) {}
}
```

**Mandatory injection tokens for this project:**
```typescript
// src/domain/ports/tokens.ts
export const TURNO_REPOSITORY_TOKEN     = 'ITurnoRepository';
export const EVENT_PUBLISHER_TOKEN      = 'IEventPublisher';
export const NOTIFICATION_GATEWAY_TOKEN = 'INotificationGateway';
```

**Module registration in NestJS:**
```typescript
// turnos.module.ts
providers: [
  {
    provide: TURNO_REPOSITORY_TOKEN,
    useClass: TurnoMongoDBAdapter,   // ⚕️ HUMAN CHECK - swap for InMemory in tests
  },
  {
    provide: EVENT_PUBLISHER_TOKEN,
    useClass: RabbitMQPublisher,
  },
  CreateAppointmentUseCase,
],
```

---

## 6. SOLID ↔ HEXAGONAL ARCHITECTURE MAPPING

Each layer of the hexagonal architecture has a dominant SOLID principle:

```
Domain (Entities + Ports)
  └── ISP: focused, granular ports
  └── LSP: any adapter is interchangeable

Application (Use Cases)
  └── SRP: one use case, one business action
  └── DIP: depends only on ports, never on adapters

Infrastructure (Adapters)
  └── OCP: new adapters without modifying use cases
  └── LSP: faithfully implement the port contract

Presentation (Controllers + Gateways)
  └── SRP: only translates HTTP/WS to domain, holds no logic
  └── DIP: injects use cases, not infrastructure services
```

---

## 7. THE TWO RABBITMQ QUEUES

| Queue | Direction | What is published | Who consumes |
|---|---|---|---|
| `turnos_queue` | Producer → Consumer | `crear_turno` (appointment payload) | Consumer Worker |
| `turnos_notifications` | Consumer → Producer | `turno_actualizado` (appointment with room) | Producer → WS Gateway |

---

## 8. DATA MODEL — APPOINTMENT

```typescript
// src/domain/entities/turno.entity.ts
export class Turno {
  readonly nombre: string;
  readonly cedula: number;         // number, not string
  readonly priority: 'alta' | 'media' | 'baja';
  readonly estado: 'espera' | 'asignado' | 'atendido';
  readonly consultorio?: string;   // assigned by the Scheduler
  readonly creadoEn: Date;
}
```

```typescript
// src/turnos/dto/create-turno.dto.ts
import { IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateTurnoDto {
  @IsString() nombre: string;
  @IsNumber() cedula: number;
  @IsEnum(['alta', 'media', 'baja']) priority: string;
}
```

---

## 9. CODE GENERATION PRINCIPLES

### 9.1 Functionality from the first attempt
- ✅ Complete, compilable code — no `// TODO` or placeholders
- ✅ Verified imports (correct relative paths for NestJS)
- ✅ Complete NestJS decorators (`@Injectable`, `@Controller`, `@MessagePattern`, etc.)
- ❌ Never leave empty methods or unimplemented stubs

### 9.2 Always start with the Ports
```
1. Generate interface (Port) in src/domain/ports/
2. Generate implementation (Adapter) in src/infrastructure/adapters/
3. Register in the NestJS module with an injection token
```

**Correct prompt:** `"Generate the ITurnoRepository interface in src/domain/ports/"`  
**Incorrect prompt:** `"Generate TurnosService that persists to MongoDB"`

### 9.3 Configuration always via environment
```typescript
// ✅ Correct
import { ConfigService } from '@nestjs/config';
constructor(private config: ConfigService) {}
const uri = this.config.get<string>('MONGODB_URI');

// ❌ Incorrect
const uri = 'mongodb://localhost:27017/turnos'; // hardcoded
```

### 9.4 Single Responsibility
- Each class does **one single thing**
- Functions of at most ~30 lines
- If a Service handles HTTP + DB + RabbitMQ → it is wrong, split it

### 9.5 Mandatory lifecycle management
Any service with `setInterval`, `ClientProxy`, or external connections **must** implement `OnModuleDestroy`:

```typescript
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timer;

  onModuleInit() {
    const ms = this.config.get<number>('SCHEDULER_INTERVAL_MS') ?? 15000;
    this.intervalId = setInterval(() => this.assignRooms(), ms);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId); // ⚕️ HUMAN CHECK - critical cleanup
  }
}
```

### 9.6 Explicit Ack/Nack in RabbitMQ
```typescript
// ✅ Always confirm or reject messages manually
@MessagePattern('crear_turno')
async handleCreateAppointment(
  @Payload() data: CreateTurnoDto,
  @Ctx() context: RmqContext,
) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  try {
    await this.createUseCase.execute(data);
    channel.ack(message);                        // success
  } catch (e) {
    if (e instanceof ValidationError) {
      channel.nack(message, false, false);       // validation error → no requeue
    } else {
      channel.nack(message, false, true);        // transient error → requeue
    }
  }
}
```

### 9.7 Atomic room assignment (no race conditions)
```typescript
// ✅ findOneAndUpdate in a single atomic operation
const turno = await this.turnoModel.findOneAndUpdate(
  { estado: 'espera' },
  { $set: { estado: 'asignado', consultorio: this.getRoom() } },
  { new: true, sort: { creadoEn: 1 } }
);
```

---

## 10. DETECTED ANTI-PATTERNS — AI MUST NOT GENERATE THESE

Based on the project audit, these errors were identified as recurring in AI-generated code:

| Anti-pattern | SOLID principle violated | Why it is wrong | Solution |
|---|---|---|---|
| Injecting `@InjectModel` into a Service | **DIP** | Directly couples to infrastructure | Inject `ITurnoRepository` with token |
| Injecting `ClientProxy` into a Controller | **DIP** | Controller should not know RabbitMQ exists | Inject `IEventPublisher` |
| A Controller with 6+ responsibilities | **SRP** | Violates single reason to change | Split into Use Cases and Services |
| `SchedulerService` containing assignment logic | **SRP** | The Scheduler fires; it does not assign | Extract `AssignRoomUseCase` |
| Adding `if (priority === 'vip')` to Scheduler | **OCP** | Modifies existing code to extend behavior | Create `PriorityAssignmentStrategy` |
| Adapter throwing `Not implemented` | **LSP** | Breaks the port contract | Implement all port methods |
| Port `ITurnoService` with 10 methods | **ISP** | Forces unused dependencies | Split: `ITurnoRepository` + `IEventPublisher` |
| Hardcoded credentials | **N/A (12-factor)** | Insecure, not portable | `ConfigService` + `.env` |
| `setInterval` without `onModuleDestroy` | **N/A (lifecycle)** | Memory leak in production | Implement mandatory cleanup |
| `any` types in TypeScript | **N/A (type-safety)** | Loses compile-time contracts | Use specific interfaces (`TurnoEventPayload`) |
| Duplicated types in frontend and backend | **DRY** | Inconsistency when changing a type | Define once in `src/domain/` |
| Generic `nack` without distinguishing error | **N/A (reliability)** | Infinite message loop | Distinguish `ValidationError` from transient errors |

---

## 11. MANDATORY CORRECTION COMMENT FORMAT

Every time existing code is corrected, use this exact format:

```typescript
// ⚕️ HUMAN CHECK - <Description of the correction>
```

Real examples from the project:
```typescript
// ⚕️ HUMAN CHECK - cedula must be number, not string (aligned with DTO)
// ⚕️ HUMAN CHECK - use ConfigService instead of hardcoded string
// ⚕️ HUMAN CHECK - add interval cleanup in onModuleDestroy
// ⚕️ HUMAN CHECK - replace direct model injection with ITurnoRepository token
```

---

## 12. REQUIRED ENVIRONMENT VARIABLES

The `.env` file (never committed to Git) must contain these variables. Only commit `.env.example`:

```env
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/turnos_db

# Scheduler
SCHEDULER_INTERVAL_MS=15000

# WebSocket
WS_PORT=3000
```

**In docker-compose.yml**, always reference as variables, never as inline literals.

---

## 13. WEEK 0 — WHAT ALREADY EXISTS (DO NOT CHANGE WITHOUT JUSTIFICATION)

Week 0 delivered the base infrastructure. The current state of the project includes:

- `docker-compose.yml` with all services orchestrated
- Producer in NestJS with HTTP endpoints and functional WebSocket gateway
- Consumer in NestJS with configurable assignment scheduler
- Frontend in Next.js with `useTurnosWebSocket` hook
- MongoDB with appointment schema and atomic room assignment operation
- RabbitMQ with queues `turnos_queue` and `turnos_notifications`
- Global validation with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- Type-safety with shared interface `TurnoEventPayload`

---

## 14. WEEK 1 — WHAT MUST BE BUILT

The goal of Week 1 is to **refactor toward hexagonal architecture** while keeping the system fully functional at every step.

### Execution order (non-negotiable to avoid regressions):

**Phase 0 — Secure configuration:**
- Move all hardcoded credentials to `.env` / `ConfigService`
- Create documented `.env.example`

**Phase 1 — Domain ports:**
- Create `src/domain/ports/ITurnoRepository.ts`
- Create `src/domain/ports/IEventPublisher.ts`
- Create `src/domain/entities/turno.entity.ts`

**Phase 2 — Use Cases (if time allows):**
- `src/application/use-cases/CreateAppointmentUseCase.ts`
- `src/application/use-cases/AssignRoomUseCase.ts`

**Phases 3–5** are deferred to Weeks 2–6 per the defined plan.

### Week 1 acceptance criteria:
- [ ] `docker compose up -d --build` starts with no errors
- [ ] `POST /turnos` returns `202 Accepted` and the appointment appears in MongoDB
- [ ] The Scheduler assigns rooms every 15 s without race conditions
- [ ] The Frontend receives real-time updates via WebSocket
- [ ] All credentials live in `.env`, not in code
- [ ] `TurnoEventPayload` types are consistent between Producer and Consumer
- [ ] Interfaces `ITurnoRepository` and `IEventPublisher` exist in `src/domain/ports/`

---

## 15. PRE-DELIVERY CHECKLIST

**Compilation and types**
```
□ Does it compile without TypeScript errors?
□ Are all imports valid and resolvable?
□ Are there zero `any` types in TypeScript?
```

**Configuration and security**
```
□ Is ConfigService used instead of hardcoded strings?
□ Does docker-compose.yml have zero literal credentials?
□ Do all corrections use the ⚕️ HUMAN CHECK comment format?
```

**SOLID — verification per principle**
```
□ [SRP] Does each class have a single reason to change? (max ~30 lines per function)
□ [OCP] Was new behavior added via a new class instead of modifying an existing one?
□ [LSP] Does the adapter implement all port methods without throwing 'Not implemented'?
□ [ISP] Does every port contain only methods its consumer actually uses?
□ [DIP] Does the Use Case inject the port token, not the concrete adapter class?
```

**Hexagonal architecture**
```
□ Do dependencies point inward? (Domain ← Application ← Infrastructure)
□ Does the Domain layer have zero imports from NestJS, Mongoose, or RabbitMQ?
□ Do Use Cases import only ports (interfaces), never adapters?
```

**Runtime behavior**
```
□ Do services with external resources implement OnModuleDestroy?
□ Does ack/nack distinguish validation errors from transient errors?
□ Are there no inline styles or external CSS libraries in the frontend?
```

---

## 16. HOW TO USE THIS FILE IN EVERY PROMPT

**Always attach this file as context.** Then specify:

```
Context: [AI_WORKFLOW.md attached]

Task: [Specific description of the component to implement]

Architectural layer: [Domain / Application / Infrastructure / Presentation]

Service: [Producer / Consumer / Frontend]

Deliverables:
- Complete, functional code
- Exact file path within the project structure
- Record of any changes to the corresponding NestJS module
```

---

*Version: 1.2 — Week 1*  
*Last updated: February 2026*  
*v1.2 changes: SOLID principles integrated into architecture, anti-patterns, and checklist*  
*Next revision: Week 2 (Adapters, complete Use Cases)*
