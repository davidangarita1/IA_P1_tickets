# 📋 Testing Summary - Producer Service

> API REST + WebSocket para gestión de turnos médicos

---

## Test Suites

| Suite | Archivo | Tests |
|-------|---------|-------|
| **Application** | | |
| CreateTurnoUseCase | `application/create-turno.use-case.spec.ts` | 4 |
| GetTurnosByCedulaUseCase | `application/get-turnos-by-cedula.use-case.spec.ts` | 3 |
| GetAllTurnosUseCase | `application/get-all-turnos.use-case.spec.ts` | 2 |
| SignUpUseCase | `application/auth/signup.use-case.spec.ts` | 4 |
| LoginUseCase | `application/auth/login.use-case.spec.ts` | 4 |
| **Domain** | | |
| TurnoEntity | `domain/turno.entity.spec.ts` | 5 |
| **Infrastructure** | | |
| TurnoMongooseAdapter | `infrastructure/turno-mongoose.adapter.spec.ts` | 4 |
| RabbitMQEventPublisher | `infrastructure/rabbitmq-event-publisher.adapter.spec.ts` | 3 |
| ScryptPasswordHasher | `infrastructure/scrypt-password-hasher.adapter.spec.ts` | 3 |
| HmacTokenService | `infrastructure/hmac-token.service.spec.ts` | 4 |
| InMemoryUserRepository | `infrastructure/in-memory-user.repository.spec.ts` | 4 |
| **Presentation** | | |
| ProducerController | `presentation/producer.controller.spec.ts` | 5 |
| AuthController | `presentation/auth.controller.spec.ts` | 8 |
| EventsController | `presentation/events.controller.spec.ts` | 3 |
| TurnosGateway | `presentation/turnos.gateway.spec.ts` | 4 |
| AuthGuard | `presentation/auth.guard.spec.ts` | 6 |

**Total: 66 tests**

---

## Estructura de Tests

```
test/
├── README.md
├── COVERAGE.md
├── assets/
│   ├── tests-execution.png
│   └── coverage-report.png
├── application/
│   ├── create-turno.use-case.spec.ts
│   ├── get-turnos-by-cedula.use-case.spec.ts
│   ├── get-all-turnos.use-case.spec.ts
│   └── auth/
│       ├── signup.use-case.spec.ts
│       └── login.use-case.spec.ts
├── domain/
│   └── turno.entity.spec.ts
├── infrastructure/
│   ├── turno-mongoose.adapter.spec.ts
│   ├── rabbitmq-event-publisher.adapter.spec.ts
│   ├── scrypt-password-hasher.adapter.spec.ts
│   ├── hmac-token.service.spec.ts
│   └── in-memory-user.repository.spec.ts
└── presentation/
    ├── producer.controller.spec.ts
    ├── auth.controller.spec.ts
    ├── events.controller.spec.ts
    ├── turnos.gateway.spec.ts
    └── auth.guard.spec.ts
```

---

## Escenarios Clave

### Turnos
- ✅ Crear turno y publicar evento a RabbitMQ
- ✅ Consultar turnos por cédula
- ✅ Obtener todos los turnos vía WebSocket

### Autenticación
- ✅ SignUp con hash de password (scrypt)
- ✅ Login con generación de token HMAC
- ✅ Guard protege rutas autenticadas

### WebSocket
- ✅ Gateway emite actualizaciones en tiempo real
- ✅ Manejo de conexiones/desconexiones

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
