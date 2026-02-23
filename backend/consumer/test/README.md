# Testing Guide - Consumer Service

## Patrones de testing aplicados

- AAA (Arrange, Act, Assert) en cada caso de prueba.
- Test Doubles sobre puertos (`ITurnoRepository`, `IEventPublisher`) para respetar arquitectura hexagonal.
- Test Data Builder para crear turnos de prueba legibles y reutilizables.
- Enfoque de comportamiento: validar reglas de negocio (asignación inmediata + cola en espera).

## Estructura

```txt
test/
├── README.md
├── application/
│   └── assign-room.use-case.spec.ts
└── scheduler/
    └── scheduler.service.spec.ts
```

## Escenario clave cubierto

- Si hay 5 consultorios libres y entran 4 pacientes, se asignan inmediatamente los 4.
- Los pacientes nuevos pasan a espera cuando ya no hay consultorios libres.

## Ejecución

```bash
npm test -- --runInBand
```
