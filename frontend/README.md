# Frontend — Sistema de Gestión de Turnos

Frontend desarrollado con **Next.js (App Router)** para la visualización en tiempo real y registro de turnos.  
Este proyecto implementa una arquitectura limpia, resiliente y preparada para escalar hacia tiempo real (SSE / WebSocket).

## Objetivo

Proveer una interfaz ligera, segura y resiliente para:

- Visualizar turnos en pantalla en tiempo real (polling optimizado)
- Registrar nuevos turnos desde formulario
- Garantizar estabilidad ante fallos del backend
- Mantener arquitectura desacoplada y mantenible

## Stack Tecnológico

| Tecnología | Uso |
|----------|-----|
| Next.js 16 | Framework principal |
| React 19 | UI |
| TypeScript | Tipado estático |
| App Router | Arquitectura moderna |
| CSS Modules | Estilos encapsulados |
| Fetch API | Cliente HTTP |
| ESLint | Calidad de código |

## Características Técnicas

### Arquitectura

- Clean Architecture (capas desacopladas)
- Repository Pattern
- Separación dominio / infraestructura / UI
- Servicios desacoplados (AudioService)
- Hooks especializados

### Resiliencia

- Cliente HTTP centralizado
- Retry automático
- Timeout configurable
- Circuit Breaker
- Manejo de errores tipificado
- Protección contra doble submit
- Prevención de memory leaks

### Seguridad

- Sanitización de input
- Rate limit en middleware
- Security headers
- CSP compatible con Next.js
- Bloqueo de métodos no permitidos

### Tiempo real (Polling optimizado)

- Evita re-render innecesario
- Evita loops duplicados
- Evita fugas de memoria
- Preparado para migrar a SSE / WebSocket

### Audio desacoplado

- Servicio independiente
- No bloquea render
- Activación por interacción del usuario

## Estructura del Proyecto

El proyecto sigue una arquitectura desacoplada y organizada por responsabilidades:

```bash

- app/**          → Rutas y páginas del App Router
- components/**   → Componentes UI reutilizables
- domain/**       → Modelos y contratos del negocio
- repositories/** → Acceso a datos mediante Repository Pattern
- hooks/**        → Lógica de negocio encapsulada en hooks
- lib/**          → Infraestructura compartida
- services/**     → Servicios desacoplados
- config/**       → Variables y configuración de entorno
- security/**     → Sanitización y protecciones básicas
- styles/**       → Estilos globales
- proxi.ts**      → Middleware

```

Arquitectura preparada para escalar hacia tiempo real, backend productivo y mayor seguridad sin refactor mayor.

## Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/mock
NEXT_PUBLIC_POLLING_INTERVAL=3000
````

## Instalación

```bash
npm install
```

## Ejecución en Desarrollo

```bash
npm run dev
```

Aplicación disponible en:

```
http://localhost:3000
```

## Build Producción

```bash
npm run build
npm start
```

## API Mock Incluida

El proyecto incluye un endpoint mock:

```
GET  /api/mock/turnos
POST /api/mock/turnos
```

Esto permite ejecutar el frontend sin backend real.

## Decisiones Técnicas

* No se utiliza estado global (no necesario para el dominio actual)
* Polling en lugar de WebSocket para simplicidad del MVP, escalable a SSE / WebSocket
* CSS Modules para evitar colisiones de estilos
* Cliente HTTP centralizado para resiliencia
* Arquitectura preparada para escalar sin refactor complejo

## Preparado para Escalar

El proyecto está diseñado para evolucionar hacia:

* WebSocket / SSE
* Backend real con colas (RabbitMQ)
* Observabilidad (si se requiere)
* Testing automatizado
* Despliegue en contenedores
* Multi-pantalla en tiempo real

## Calidad de Código

* Sin memory leaks
* Sin loops duplicados
* Sin re-render innecesario
* Manejo de errores controlado
* Sanitización de inputs
* Código documentado
* Separación de responsabilidades

## Testing

El proyecto cuenta con **84 tests automatizados** distribuidos en **11 suites**, cubriendo todas las capas de la arquitectura frontend.

### Tipos de tests

| Tipo | Descripción | Suites |
|------|-------------|--------|
| **Unitarios (lógica pura)** | Funciones sin dependencias de framework — type guards, formateo, sanitización, circuit breaker | 5 |
| **Unitarios (componentes)** | Renderizado y comportamiento de componentes React con Testing Library | 3 |
| **Integración (repositorios)** | Verificación del adapter HTTP contra el puerto (interface) con mocks | 1 |
| **Configuración** | Validación de variables de entorno y fallos controlados al arranque | 1 |
| **Servicios** | Ciclo de vida del AudioService (singleton, unlock, autoplay policy) | 1 |

### Cobertura por módulo

| Módulo | Archivo de test | Tests |
|--------|----------------|-------|
| `utils/date-formatter` | `__tests__/utils/date-formatter.test.ts` | 4 |
| `utils/error-guard` | `__tests__/utils/error-guard.test.ts` | 11 |
| `lib/circuit-breaker` | `__tests__/lib/circuit-breaker.test.ts` | 11 |
| `security/sanitize` | `__tests__/security/sanitize.test.ts` | 8 |
| `config/env` | `__tests__/config/env.test.ts` | 4 |
| `services/AudioService` | `__tests__/services/AudioService.test.ts` | 6 |
| `domain/*` | `__tests__/domain/domain-types.test.ts` | 6 |
| `repositories/HttpAppointmentRepository` | `__tests__/repositories/HttpAppointmentRepository.test.ts` | 5 |
| `components/AppointmentCard` | `__tests__/components/AppointmentCard.test.tsx` | 6 |
| `components/AppointmentList` | `__tests__/components/AppointmentList.test.tsx` | 7 |
| `components/AppointmentRegistrationForm` | `__tests__/components/AppointmentRegistrationForm.test.tsx` | 6 |

### Herramientas

- **Jest** — Test runner
- **ts-jest** — Transformación TypeScript
- **@testing-library/react** — Renderizado y queries de componentes
- **@testing-library/jest-dom** — Matchers extendidos para DOM
- **@testing-library/user-event** — Simulación de interacciones de usuario

### Ejecutar tests

```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch (re-ejecuta al guardar)
npm run test:coverage # Ejecutar con reporte de cobertura
```

## Scripts

```bash
npm run dev            # Desarrollo
npm run build          # Build producción
npm start              # Ejecutar build
npm run lint           # Lint
npm test               # Tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Tests con cobertura
```

## Requisitos

* Node.js 20+
* NPM 9+

## Estado del Proyecto

**MVP funcional — estable — con tests automatizados — preparado para evolución.**
