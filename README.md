# IA_P1 - Sistema de Turnos Médicos en Tiempo Real

Sistema para gestionar turnos médicos en tiempo real usando microservicios, mensajería asíncrona y WebSockets.

## Objetivo del proyecto

Permitir que un paciente registre su turno y reciba actualizaciones en tiempo real sobre su estado y asignación de consultorio.

## Alcance funcional (actual)

- Registrar turnos de pacientes por API.
- Procesar turnos de forma asíncrona.
- Asignar consultorios automáticamente.
- Notificar cambios de estado en tiempo real al frontend.
- Consultar turnos por lista general o por cédula.
- Gestionar usuarios: registro, inicio y cierre de sesión con autenticación HMAC.
- Gestión de médicos: crear y editar médicos con nombre, cédula, consultorio y franja horaria; visualizar el catálogo de médicos activos. La franja horaria disponible se consulta en tiempo real antes de guardar, garantizando que no dos médicos activos compartan consultorio y franja. Módulo accesible solo para usuarios autenticados.

## Próxima feature en ideación: Login + Dashboard privado

### Modelo de acceso

- Guest (como hoy): puede registrar turno y ver su llamado en tiempo real.
- Usuario autenticado: puede acceder al dashboard operativo (oculto para guest).

### Impacto en el negocio

- Mejora control de acceso a información operativa del sistema.
- Reduce exposición de datos y vistas internas para usuarios no autorizados.
- Permite diferenciar experiencia pública (paciente) y experiencia interna (staff).
- Habilita trazabilidad por usuario para futuras auditorías y métricas de uso.

### Impacto en alcance

- Se mantiene el flujo principal para pacientes sin fricción (registro y seguimiento).
- Se agrega autenticación/autorización para proteger el dashboard.
- La experiencia guest no se elimina: queda como canal público de autoservicio.

## Arquitectura (resumen)

Flujo principal:

1. Frontend envía `POST /turnos` al Producer.
2. Producer publica evento en RabbitMQ y responde `202 Accepted`.
3. Consumer consume el evento y guarda el turno en MongoDB (estado `espera`).
4. Scheduler del Consumer asigna consultorio periódicamente.
5. Consumer publica actualización en RabbitMQ.
6. Producer emite actualización al frontend vía WebSocket.

Servicios:

- **Producer** (`:3000`): API HTTP + WebSocket.
- **Consumer**: worker de procesamiento y scheduler.
- **Frontend** (`:3001`): interfaz de registro y visualización.
- **RabbitMQ**: broker de mensajería.
- **MongoDB**: persistencia de turnos.

## Stack tecnológico

- NestJS (backend)
- Next.js (frontend)
- MongoDB
- RabbitMQ
- Docker + Docker Compose

## Requisitos

- Docker Engine
- Docker Compose

## Ejecución local

1. Clonar repositorio:

   ```bash
   git clone https://github.com/Duver0/IA_P1.git
   cd IA_P1
   ```

2. Configurar entorno:

   ```bash
   cp .env.example .env
   ```

3. Levantar servicios:

   ```bash
   docker compose up -d --build
   ```

4. Accesos:

- Frontend: http://localhost:3001
- API Docs: http://localhost:3000/api/docs
- RabbitMQ Admin: http://localhost:15672

## Variables de entorno clave

Configurar en `.env` (basado en `.env.example`):

- `PRODUCER_PORT`
- `FRONTEND_PORT`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_URL`
- `RABBITMQ_PORT`
- `RABBITMQ_MGMT_PORT`
- `RABBITMQ_USER`
- `RABBITMQ_PASS`
- `RABBITMQ_QUEUE`
- `RABBITMQ_NOTIFICATIONS_QUEUE`
- `MONGODB_PORT`
- `MONGO_USER`
- `MONGO_PASS`
- `MONGODB_URI`
- `SCHEDULER_INTERVAL_MS` (default: 15000 ms)
- `CONSULTORIOS_TOTAL` (default: 5)
- `AUTH_TOKEN_SECRET` (clave HMAC para tokens de autenticación)

## API principal (Producer)

### Turnos

- `POST /turnos`: crear turno (respuesta asíncrona `202 Accepted`).
- `GET /turnos`: listar turnos.
- `GET /turnos/:cedula`: consultar turnos por cédula.

### Autenticación (`/auth`)

- `POST /auth/signUp`: registrar nuevo usuario (`{ email, password, nombre, rol }`).
- `POST /auth/signIn`: iniciar sesión (`{ email, password }`), devuelve token.
- `POST /auth/signOut`: cerrar sesión (stateless, limpieza server-side).
- `GET /auth/me`: obtener usuario actual a partir del Bearer token (protegido).
- `GET /auth/dashboard-history`: historial de turnos para el dashboard (protegido).

### Médicos (`/api/v1/doctors`)

Todos los endpoints requieren `Authorization: Bearer <token>`.

- `POST /api/v1/doctors`: crear médico (`{ nombre, cedula, consultorio?, franjaHoraria? }`). Responde `201` con el médico creado. Devuelve `409` si la cédula ya existe o si el consultorio+franja ya está asignado a otro médico activo.
- `GET /api/v1/doctors`: listar médicos activos.
- `PUT /api/v1/doctors/:id`: actualizar un médico existente (`{ nombre?, cedula?, consultorio?, franjaHoraria? }`). Devuelve `200` con el médico actualizado. Devuelve `404` si no existe, `409` si la cédula ya pertenece a otro médico o si el consultorio+franja ya está ocupado.
- `GET /api/v1/doctors/available-shifts?consultorio=<n>`: consultar franjas disponibles para un consultorio dado.

Ejemplo:

```bash
curl -X POST http://localhost:3000/turnos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Paciente Test","cedula":12345,"priority":"alta"}'
```

## Rutas del frontend

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Pantalla principal: registro de turno y seguimiento en tiempo real | Público |
| `/signin` | Inicio de sesión | Público |
| `/signup` | Registro de usuario | Público |
| `/register` | Registro de turno alternativo | Público |
| `/dashboard` | Dashboard operativo: turnos en tiempo real | Autenticado |
| `/doctors` | Gestión de médicos: listado y creación | Autenticado |

## Testing

Backend (producer):

```bash
cd backend/producer
bun run test
bun run test:cov
# Pruebas de aceptación (Cucumber/BDD)
bun run test:acceptance
```

Backend (consumer):

```bash
cd backend/consumer
bun run test
bun run test:cov
```

Frontend:

```bash
cd frontend
bun run test
bun run test:coverage
```

### Cobertura actual

| Módulo | Tests | Cobertura |
|--------|-------|-----------|
| Backend producer | 92 | >95% en todos los archivos de doctors |
| Frontend | 374 | >98% en componentes y hooks de doctors |

## 📋 Documentación de Calidad y Auditoría

Para entender el estado técnico del proyecto, disponible en [`docs/quality-audits/`](docs/quality-audits/):

| Documento | Propósito |
|-----------|----------|
| **AUDIT_REPORT.md** | Auditoría técnica completa: arquitectura, seguridad, transparencia de IA (🟠 Aceptable con Riesgos Críticos) |
| **DEBT_REPORT_BACKEND.md** | Análisis de deuda técnica: backend producer + consumer (13 items pendientes) |
| **DEBT_REPORT_FRONT.md** | Análisis de deuda técnica: frontend (🔴 Crítico — 0 tests) |
| **AI_WORKFLOW.md** | Flujo de trabajo AI-First: orquestación de agentes y generación de código |
| **CHANGELOG_SOURCES.md** | Decisiones humanas vs propuestas de IA en módulo de médicos |
| **TEST_PLAN.md** | Plan de pruebas v3.1: procesos validados (registro, login, turnos) |
| **TESTING_STRATEGY.md** | Estrategia de QA: verificar vs validar, roadmap de TDD |

**Hallazgos críticos resumidos:**
- ⚠️ Frontend sin framework de testing (0 tests instalados)
- ⚠️ Seguridad: middleware mal nombrado, no se ejecuta en producción
- ⚠️ Falta trazabilidad de prompts y correcciones de IA

## 💬 Feedback de Revisores

Disponible en [`docs/feedback/`](docs/feedback/):

| Archivo | Revisor | Área |
|---------|---------|------|
| **FEEDBACK_BACKEND_ALEXIS.MD** | Alexis | Backend |
| **FEEDBACK_ESTEBAN_RODRIGUEZ.md** | Esteban Rodríguez | General |
| **Feedback_German_QA.MD** | Germán | QA |

---

## Estado del proyecto

Sistema funcional en desarrollo continuo, con enfoque en robustecer arquitectura hexagonal y calidad para producción.
