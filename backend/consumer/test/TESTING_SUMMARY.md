# 📋 Testing Summary - Consumer Service

> Worker de procesamiento de turnos con scheduler automático

---

## Test Suites

| Suite | Archivo | Tests |
|-------|---------|-------|
| **Application** | | |
| AssignRoomUseCase | `application/assign-room.use-case.spec.ts` | 6 |
| CreateTurnoUseCase | `application/create-turno.use-case.spec.ts` | 4 |
| FinalizeTurnosUseCase | `application/finalize-turnos.use-case.spec.ts` | 3 |
| **Domain** | | |
| TurnoEntity | `domain/turno.entity.spec.ts` | 5 |
| **Infrastructure** | | |
| TurnoMongooseAdapter | `infrastructure/turno-mongoose.adapter.spec.ts` | 4 |
| RabbitMQEventPublisher | `infrastructure/rabbitmq-event-publisher.adapter.spec.ts` | 3 |
| StandardPrioritySorting | `infrastructure/standard-priority-sorting.strategy.spec.ts` | 2 |
| **Presentation** | | |
| ConsumerController | `presentation/consumer.controller.spec.ts` | 3 |
| **Scheduler** | | |
| SchedulerService | `scheduler/scheduler.service.spec.ts` | 4 |
| **Notifications** | | |
| NotificationsService | `notifications/notifications.service.spec.ts` | 2 |

**Total: 36 tests**

---

## Estructura de Tests

```
test/
├── README.md
├── TESTING_SUMMARY.md
├── COVERAGE.md
├── assets/
│   ├── tests-execution.png
│   └── coverage-report.png
├── application/
│   ├── assign-room.use-case.spec.ts
│   ├── create-turno.use-case.spec.ts
│   └── finalize-turnos.use-case.spec.ts
├── domain/
│   └── turno.entity.spec.ts
├── infrastructure/
│   ├── turno-mongoose.adapter.spec.ts
│   ├── rabbitmq-event-publisher.adapter.spec.ts
│   └── standard-priority-sorting.strategy.spec.ts
├── presentation/
│   └── consumer.controller.spec.ts
├── scheduler/
│   └── scheduler.service.spec.ts
└── notifications/
    └── notifications.service.spec.ts
```

---

## Escenarios Clave

### Asignación de Consultorios
- ✅ 5 consultorios libres + 4 pacientes → asignación inmediata
- ✅ Sin consultorios libres → paciente a cola de espera
- ✅ Pacientes prioritarios se procesan primero

### Scheduler Automático
- ✅ Tick cada 15 segundos
- ✅ Finaliza turnos expirados
- ✅ Asigna consultorios disponibles

### Cola RabbitMQ
- ✅ Procesamiento de mensajes `crear_turno`
- ✅ Publicación de eventos de estado

---

## Comandos

```bash
# Ejecutar tests
npm test -- --runInBand

# Con cobertura
npm run test:cov -- --runInBand --forceExit

# Watch mode
npm run test:watch
```
