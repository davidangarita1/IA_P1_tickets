# 🚀 Testing Guide - Producer Service

> API REST + WebSocket para gestión de turnos médicos

---

## Documentación

| Archivo | Descripción |
|---------|-------------|
| [TESTING_SUMMARY.md](../TESTING_SUMMARY.md) | Listado de todas las suites y tests |
| [COVERAGE.md](COVERAGE.md) | Métricas de cobertura y evidencias |

---

## Quick Start

```bash
# Ejecutar tests
npm test -- --runInBand

# Con cobertura
npm run test:cov -- --runInBand --forceExit
```

---

## Patrones Aplicados

- **AAA** (Arrange, Act, Assert) en cada caso
- **Test Doubles** sobre puertos hexagonales (`ITurnoRepository`, `IEventPublisher`)
- **Mocking** de RabbitMQ, MongoDB, WebSocket

---

## Arquitectura de Tests

```
test/
├── application/    → Use cases (turnos + auth)
├── domain/         → Entidades
├── infrastructure/ → Adapters (DB, MQ, Auth)
├── presentation/   → Controllers + Gateway
└── assets/         → Evidencias (screenshots)
```
