# Informe de Arquitectura y Patrones de Diseño
# Sistema de Turnos Medicos — IA_P1_tickets

---

## 1. Vision General del Sistema

El sistema esta compuesto por tres modulos principales que se comunican de forma asincrona:

| Modulo | Tecnologia | Puerto | Rol |
|---|---|---|---|
| Backend Producer | NestJS + TypeScript | 3000 | API HTTP + WebSocket + autenticacion |
| Backend Consumer | NestJS + TypeScript | interno | Worker de mensajeria + scheduler |
| Frontend | Next.js 14 + TypeScript | 3001 | SPA con routing de archivos |
| RabbitMQ | AMQP | 5672 / 15672 | Broker de mensajeria asincrona |
| MongoDB | MongoDB + Mongoose | 27017 | Persistencia de datos |

El flujo principal de un turno es: `Frontend → POST /turnos → Producer → RabbitMQ → Consumer → MongoDB → RabbitMQ → Producer → WebSocket → Frontend`.

---

## 2. Arquitectura del Backend

### 2.1 Arquitectura Hexagonal con Capas Limpias

Ambos microservicios (Producer y Consumer) implementan **Arquitectura Hexagonal** (tambien llamada Ports and Adapters), combinada con los principios de **Clean Architecture**. La separacion es la siguiente:

```
backend/producer/src/
  domain/          <- nucleo puro: entidades, puertos (interfaces)
  application/     <- casos de uso: orquestacion de reglas de negocio
  infrastructure/  <- adaptadores secundarios: MongoDB, RabbitMQ, HMAC
  presentation/    <- adaptadores primarios: controladores HTTP, guards
```

Esta misma estructura se replica dentro del modulo especializado de medicos:

```
backend/producer/src/doctors/
  domain/
    entities/      <- Doctor.entity.ts (clase con logica propia)
    ports/         <- IDoctorRepository.ts (interfaz del puerto de salida)
  application/
    use-cases/     <- CreateDoctorUseCase, UpdateDoctorUseCase, etc.
  infrastructure/
    adapters/      <- DoctorMongooseAdapter (implementa IDoctorRepository)
    schemas/       <- DoctorSchema (definicion de Mongoose)
  presentation/
    controllers/   <- DoctorController
    dtos/          <- CreateDoctorDto, UpdateDoctorDto
    guards/        <- DoctorRoleGuard
```

La regla fundamental de la arquitectura hexagonal se respeta: **las capas internas no conocen las capas externas**. El dominio no importa nada de NestJS, Mongoose ni Express. Los casos de uso solo dependen de interfaces (puertos), no de implementaciones concretas.

### 2.2 Arquitectura de Microservicios Asincrona

El Producer y el Consumer son microservicios independientes que se comunican a traves de RabbitMQ. Esto desacopla el procesamiento del turno de su recepcion, permitiendo que el Producer responda `202 Accepted` de inmediato sin esperar que el Consumer procese el mensaje.

| Caracteristica | Producer | Consumer |
|---|---|---|
| Responsabilidad | Recibir peticiones HTTP, autenticar, publicar eventos, gestionar medicos | Consumir eventos, persistir turnos, asignar consultorios, notificar |
| Comunicacion entrada | HTTP REST + WebSocket | AMQP (RabbitMQ) |
| Comunicacion salida | AMQP + WebSocket | AMQP |

---

## 3. Patrones de Diseno en el Backend

### 3.1 Repository Pattern

**Donde:** `IDoctorRepository` en `domain/ports/doctor.repository.ts`, implementado por `DoctorMongooseAdapter`.

**Que hace:** Abstrae el acceso a datos detras de una interfaz. El caso de uso solo conoce el contrato `IDoctorRepository`; la implementacion concreta con Mongoose queda en la capa de infraestructura.

**Ventaja concreta en el proyecto:** Si en el futuro se cambia MongoDB por PostgreSQL, solo se crea un nuevo adaptador que implemente `IDoctorRepository`. Ningun caso de uso cambia.

| Metodo del repositorio | Logica encapsulada |
|---|---|
| `findByDocumentId` | Busca sin filtro de estado (necesario para validar cedulas de medicos dados de baja) |
| `findByOfficeAndShift` | Solo retorna medicos activos con esa combinacion |
| `findAvailableShifts` | Computa franjas libres desde el conjunto `['06:00-14:00', '14:00-22:00']` |
| `softDelete` | Actualiza `status: 'inactive'` sin eliminar el registro de la base de datos |

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | El repositorio solo se ocupa de persistencia; la logica de negocio esta en el caso de uso |
| O - Open/Closed | Para cambiar la base de datos se agrega un nuevo adaptador sin modificar los casos de uso |
| D - Dependency Inversion | Los casos de uso dependen de la interfaz `IDoctorRepository`, no de `DoctorMongooseAdapter` |

**Principios SOLID que puede violar:**

| Principio | Observacion |
|---|---|
| I - Interface Segregation | `IDoctorRepository` tiene 8 metodos. Si algun caso de uso solo necesita `findAll` e `create`, esta acoplado a metodos que no utiliza. Una separacion en interfaces mas pequenas (lectura/escritura) seria mas estricta. |

---

### 3.2 Use Case Pattern (Application Services)

**Donde:** `CreateDoctorUseCase`, `UpdateDoctorUseCase`, `DeleteDoctorUseCase`, `GetAvailableShiftsUseCase`, `GetAllDoctorsUseCase`.

**Que hace:** Cada caso de uso encapsula una unica operacion de negocio. El controlador HTTP delega toda la logica al caso de uso correspondiente. El controlador no contiene ninguna regla de negocio.

Ejemplo del flujo en `CreateDoctorUseCase.execute(data)`:

```
1. Validar que si hay office, debe haber shift
2. Buscar si ya existe la cedula (findByDocumentId)
3. Buscar si la combinacion office+shift ya esta ocupada (findByOfficeAndShift)
4. Crear el medico (doctorRepository.create)
```

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | Cada clase tiene una unica razon para cambiar (una sola operacion de negocio) |
| D - Dependency Inversion | Recibe `IDoctorRepository` por inyeccion, no instancia `DoctorMongooseAdapter` directamente |

**Principios SOLID que puede violar:**

| Principio | Observacion |
|---|---|
| O - Open/Closed | Las validaciones de negocio dentro de `execute` estan escritas en forma procedural. Si se agrega una nueva regla (por ejemplo, limite maximo de medicos por consultorio), se modifica el metodo existente en lugar de extenderlo. |

---

### 3.3 Adapter Pattern

**Donde:** `DoctorMongooseAdapter` implementa `IDoctorRepository`. En el Consumer existe `RabbitMQEventPublisherAdapter`, `TurnoMongooseAdapter`, `StandardPrioritySortingStrategy`.

**Que hace:** Convierte la interfaz de una clase (Mongoose, AMQP) en la interfaz que espera el dominio. El metodo privado `toDomain(doc)` en el adaptador realiza el mapeo de documento Mongoose a entidad de dominio `Doctor`.

```
DoctorDocument (Mongoose) --> toDomain() --> Doctor (dominio puro)
```

Esto garantiza que la entidad `Doctor` nunca esta contaminada con propiedades de Mongoose como `__v`, `_doc`, etc.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | El adaptador solo se ocupa de traduccion entre las dos interfaces |
| O - Open/Closed | El dominio esta cerrado a modificaciones cuando cambia Mongoose (closed), pero el adaptador puede extenderse (open) |
| D - Dependency Inversion | El dominio define el contrato; el adaptador se adapta a el |

---

### 3.4 Strategy Pattern

**Donde:** `IPrioritySortingStrategy` en el Consumer, implementado por `StandardPrioritySortingStrategy`.

**Que hace:** Encapsula el algoritmo de ordenamiento de turnos por prioridad en una clase intercambiable. El scheduler no conoce el algoritmo concreto; solo invoca `strategy.sort(turnos)`.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| O - Open/Closed | Para agregar una nueva estrategia de ordenamiento (por ejemplo, por urgencia medica) se crea una nueva clase sin modificar el scheduler |
| D - Dependency Inversion | El scheduler depende de la interfaz `IPrioritySortingStrategy`, no de la implementacion concreta |

---

### 3.5 Guard Pattern (NestJS)

**Donde:** `AuthGuard` y `DoctorRoleGuard` en la capa de presentacion.

**Que hace:** Intercepta cada peticion HTTP antes de llegar al controlador. `AuthGuard` verifica y decodifica el token HMAC; `DoctorRoleGuard` verifica que el rol del usuario sea `empleado` o `administrador`.

Los guards estan encadenados con `@UseGuards(AuthGuard, DoctorRoleGuard)` en el controlador de medicos, lo que garantiza que la autenticacion se ejecuta antes que la autorizacion.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | `AuthGuard` solo autentica; `DoctorRoleGuard` solo autoriza por rol |
| O - Open/Closed | Para agregar un guard de rate limiting o auditoria se agrega al decorador sin modificar los guards existentes |

---

### 3.6 Data Transfer Object (DTO)

**Donde:** `CreateDoctorDto`, `UpdateDoctorDto` en la capa de presentacion.

**Que hace:** Define y valida la forma exacta del cuerpo de cada peticion HTTP usando decoradores de `class-validator`. El DTO actua como barrera de validacion antes de que los datos lleguen al caso de uso.

Ejemplo: si el campo `documentId` llega con formato invalido, el DTO lanza un `400 Bad Request` antes de que el caso de uso sea invocado.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | El DTO solo se ocupa de validacion y forma del dato de entrada |

---

## 4. Arquitectura del Frontend

### 4.1 Arquitectura Hexagonal en el Frontend

El frontend replica la misma separacion en capas que el backend, adaptada al contexto de React/Next.js:

```
frontend/src/
  domain/          <- tipos puros y puertos (interfaces de servicios)
    ports/         <- DoctorService.ts, AuthService.ts, TicketWriter.ts, etc.
    Doctor.ts      <- tipo de dato de dominio
  infrastructure/
    adapters/      <- HttpDoctorAdapter, HttpAuthAdapter, SocketIOAdapter, etc.
    http/          <- CircuitBreaker, httpClient
    mappers/       <- authMapper, ticketMapper
  hooks/           <- useDoctors, useAvailableShifts, useToast (logica de estado)
  components/      <- DoctorFormModal, DoctorEditModal, ConfirmDeleteModal, Toast
  providers/       <- DependencyProvider (composicion raiz de dependencias)
  app/             <- paginas de Next.js (routing por archivos)
```

La regla es la misma: los hooks y componentes dependen de interfaces (`DoctorService`), no de `HttpDoctorAdapter` directamente.

---

## 5. Patrones de Diseno en el Frontend

### 5.1 Ports and Adapters (Hexagonal)

**Donde:** `DoctorService` (puerto) en `domain/ports/DoctorService.ts`, implementado por `HttpDoctorAdapter` en `infrastructure/adapters/HttpDoctorAdapter.ts`.

**Que hace:** El hook `useDoctors` recibe un `DoctorService` por parametro, no un `HttpDoctorAdapter`. En los tests, se puede inyectar un objeto mock que implemente `DoctorService` sin necesidad de un servidor HTTP real.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| D - Dependency Inversion | Los hooks dependen de la abstraccion `DoctorService`, no de la implementacion HTTP |
| O - Open/Closed | Para agregar cache o reintentos se crea un adaptador decorador sin modificar `HttpDoctorAdapter` |

---

### 5.2 Dependency Injection con Context API

**Donde:** `DependencyProvider.tsx` en `providers/`.

**Que hace:** Construye todas las dependencias concretas una sola vez en la raiz del arbol de componentes y las expone a traves de un contexto de React. Los componentes hijos consumen las dependencias via el hook `useDeps()`, sin saber que implementacion concreta esta detras.

```
DependencyProvider
  --> new HttpDoctorAdapter(env.API_BASE_URL) --> doctorService
  --> new HttpAuthAdapter(env.API_BASE_URL)   --> authService
  --> new SocketIOAdapter(env.WS_URL)         --> realTime
  --> ...
```

En los tests de los componentes, se pasan `overrides` al proveedor para inyectar mocks:

```typescript
<DependencyProvider overrides={{ doctorService: mockDoctorService }}>
```

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| D - Dependency Inversion | El grafo de dependencias se construye en un solo punto; el resto del codigo no sabe como se instancian |
| S - Single Responsibility | El proveedor solo se ocupa de la composicion de dependencias |

**Principios SOLID que puede violar:**

| Principio | Observacion |
|---|---|
| I - Interface Segregation | `DependencyProvider` expone todas las dependencias en un solo contexto. Un componente que solo necesita `doctorService` recibe tambien `audio`, `sanitizer`, etc. |

---

### 5.3 Custom Hooks como Application Services

**Donde:** `useDoctors`, `useAvailableShifts`, `useToast`, `useCreateTicket`, `useTicketsWebSocket`.

**Que hacen:** Los custom hooks encapsulan toda la logica de estado y efectos secundarios de una funcionalidad. El componente de pagina (`doctors/page.tsx`) solo orquesta la UI; toda la logica de carga, error y actualizacion esta dentro del hook.

Ejemplo en `useDoctors`:

| Funcion exportada | Responsabilidad |
|---|---|
| `doctors` | Lista de medicos activos |
| `loading` | Estado de carga |
| `error` | Mensaje de error mapeado |
| `create` | Llama a `doctorService.create` |
| `update` | Llama a `doctorService.update` |
| `remove` | Llama a `doctorService.remove` |
| `refresh` | Recarga la lista completa |

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | Cada hook tiene un unico dominio de responsabilidad |
| D - Dependency Inversion | El hook recibe `DoctorService` (interfaz) por parametro, no la implementacion HTTP |

---

### 5.4 Circuit Breaker Pattern

**Donde:** `CircuitBreaker.ts` en `infrastructure/http/`.

**Que hace:** Implementa el patron de resiliencia Circuit Breaker con tres estados:

| Estado | Descripcion |
|---|---|
| CLOSED | Funcionamiento normal; las peticiones pasan |
| OPEN | Umbral de fallos superado; las peticiones se rechazan inmediatamente sin llegar al servidor |
| HALF_OPEN | Cooldown expirado; se permite una peticion de prueba para evaluar si el servicio se recupero |

Si el servidor de la API falla mas de `failureThreshold` veces consecutivas, el circuit breaker se abre y evita saturar el servidor con peticiones adicionales durante `cooldownTime` milisegundos.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | La clase solo gestiona el estado del circuito; no conoce el tipo de peticion |
| O - Open/Closed | El umbral y el tiempo de cooldown son configurables por constructor sin modificar la clase |

---

### 5.5 Facade Pattern en los Componentes Modales

**Donde:** `DoctorFormModal`, `DoctorEditModal`, `ConfirmDeleteModal`.

**Que hacen:** Cada modal expone una interfaz simple al componente padre mediante props (`onClose`, `onSuccess`, `doctorService`, `showToast`). El componente padre no necesita conocer los detalles de validacion de formularios, estados internos de carga o llamadas a la API que ocurren dentro del modal.

**Principios SOLID que aplica:**

| Principio | Como se aplica |
|---|---|
| S - Single Responsibility | Cada modal es responsable de su propio flujo completo (abrir, validar, guardar, cerrar) |

**Principios SOLID que puede violar:**

| Principio | Observacion |
|---|---|
| S - Single Responsibility | Los modales combinan logica de UI (validaciones del formulario) con llamadas a servicios externos. Una separacion mas estricta usaria un hook interno (`useCreateDoctorForm`) que manejara el estado del formulario por separado de la renderizacion. |

---

## 6. Analisis Completo de Patrones en la Feature de Gestion de Medicos

Esta seccion analiza cada patron aplicado especificamente para implementar las HU-01 a HU-04 del modulo de medicos.

### 6.1 Resumen de Patrones por Capa

| Capa | Patron | Clase/Archivo | Proposito |
|---|---|---|---|
| Dominio BE | Entity | `Doctor.entity.ts` | Encapsula estado y tipo del medico |
| Dominio BE | Port / Interface | `IDoctorRepository` | Contrato que el dominio impone a la infraestructura |
| Aplicacion BE | Use Case | `CreateDoctorUseCase`, `UpdateDoctorUseCase`, `DeleteDoctorUseCase`, `GetAvailableShiftsUseCase` | Orquestan las reglas de negocio sin acoplarse a la infraestructura |
| Infraestructura BE | Repository + Adapter | `DoctorMongooseAdapter` | Implementa el repositorio usando Mongoose; mapea a entidad de dominio con `toDomain()` |
| Presentacion BE | Controller | `DoctorController` | Delega al caso de uso; no contiene logica de negocio |
| Presentacion BE | DTO | `CreateDoctorDto`, `UpdateDoctorDto` | Valida y tipifica la entrada HTTP |
| Presentacion BE | Guard | `AuthGuard`, `DoctorRoleGuard` | Autenticacion y autorizacion por capas separadas |
| Dominio FE | Port / Interface | `DoctorService.ts` | Contrato que el frontend impone a la infraestructura HTTP |
| Infraestructura FE | Adapter | `HttpDoctorAdapter` | Implementa `DoctorService` con llamadas fetch reales |
| Logica FE | Custom Hook | `useDoctors`, `useAvailableShifts` | Encapsulan estado, errores y operaciones CRUD |
| UI FE | Facade (Modal) | `DoctorFormModal`, `DoctorEditModal`, `ConfirmDeleteModal` | Encapsulan flujos completos detras de una interfaz simple de props |
| Composicion FE | Dependency Injection | `DependencyProvider` | Construye y provee todas las dependencias concretas desde la raiz |
| Resiliencia FE | Circuit Breaker | `CircuitBreaker` | Protege al servidor de cascadas de fallos |

---

### 6.2 Analisis SOLID por Patron en la Feature de Medicos

#### Entidad Doctor

La clase `Doctor` en el backend es inmutable por diseno: todos sus campos son `readonly`. El constructor recibe un objeto `props` y los asigna directamente. Esta decision evita mutaciones accidentales del estado del dominio desde capas externas.

| Principio | Aplica | Como |
|---|---|---|
| S | Si | La entidad solo representa el estado de un medico del dominio |
| O | Si | Para agregar comportamiento se extiende o se agregan metodos; el estado ya definido no cambia |
| L | N/A | No hay jerarquia de herencia en la entidad |
| I | Si | No implementa interfaces gigantes; es un valor de datos |
| D | Si | No depende de ninguna clase de infraestructura |

#### IDoctorRepository (Puerto de Dominio)

| Principio | Aplica | Como |
|---|---|---|
| S | Si | Solo define operaciones de persistencia de medicos |
| O | Si | Los casos de uso son abiertos a extension (nuevas implementaciones) sin modificarse |
| D | Si | Los casos de uso dependen de esta abstraccion, no de Mongoose |
| I | Parcial | El repositorio tiene 8 metodos; un caso de uso que solo lee podria usar una interfaz mas pequena |

#### CreateDoctorUseCase

| Principio | Aplica | Violacion |
|---|---|---|
| S | Si | Unica operacion de negocio |
| O | No del todo | Cada nueva regla de validacion (limite de medicos, validacion de nombre) implica modificar `execute` |
| D | Si | Depende de `IDoctorRepository` (interfaz) via `@Inject` |

#### DoctorMongooseAdapter

| Principio | Aplica | Violacion |
|---|---|---|
| S | Si | Solo traduce entre Mongoose y el dominio |
| O | Si | Para soportar otro ORM se escribe un nuevo adaptador |
| L | Si | Puede sustituir a cualquier implementacion de `IDoctorRepository` sin romper los casos de uso |
| D | Si | No impone dependencias al dominio |

#### DoctorController

| Principio | Aplica | Violacion |
|---|---|---|
| S | Si | Solo recibe HTTP y delega; no tiene logica de negocio |
| D | Si | Depende de los casos de uso por inyeccion |
| O | Parcial | Para agregar un nuevo endpoint se agrega un metodo al controlador, lo que modifica la clase existente |

#### HttpDoctorAdapter (Frontend)

| Principio | Aplica | Violacion |
|---|---|---|
| S | Si | Solo se ocupa de la comunicacion HTTP con el endpoint de medicos |
| O | Si | Para agregar cache o retry se puede crear un adaptador decorador |
| L | Si | Sustituye completamente a `DoctorService` sin romper los hooks |
| D | Si | Implementa `DoctorService` (interfaz de dominio), no al reves |

#### useDoctors (Hook)

| Principio | Aplica | Violacion |
|---|---|---|
| S | Parcial | El hook gestiona la lista, la carga, el error y todas las operaciones CRUD. Podria separarse en `useDoctorsList` y `useDoctorMutations` |
| D | Si | Recibe `DoctorService` por parametro; en tests se puede substituir por un mock |

#### DependencyProvider

| Principio | Aplica | Violacion |
|---|---|---|
| S | Si | Unico responsable de instanciar dependencias |
| I | No del todo | El contexto expone todas las dependencias; los componentes que solo necesitan `doctorService` reciben el objeto completo |
| D | Si | Los consumidores dependen de las interfaces del dominio, no de las implementaciones concretas |

---

## 7. Patrones de Resiliencia y Mensajeria

### 7.1 Mensajeria Asincrona con RabbitMQ

El Producer no espera a que el Consumer procese el turno. Publica el evento en RabbitMQ y responde `202 Accepted`. Esto implementa el patron **Fire and Forget** con garantia de entrega eventual a traves del broker.

### 7.2 Scheduler como Polling Pattern

El Consumer tiene un `SchedulerService` que se ejecuta periodicamente (configurable con `SCHEDULER_INTERVAL_MS`) para asignar consultorios a los turnos en estado `espera`. Es un Polling interno, no un evento reactivo.

**Implicacion:** Si el intervalo es muy largo, los turnos esperan mas de lo necesario. Si es muy corto, se generan cargas innecesarias en la base de datos.

### 7.3 Circuit Breaker en el Frontend

Implementado de forma manual en `CircuitBreaker.ts`. Protege al servidor de recibir peticiones cuando ya se sabe que esta fallando. El patron se ejecuta sobre el cliente HTTP general, no especificamente sobre el servicio de medicos.

---

## 8. Deuda Tecnica Resuelta

Las siguientes observaciones fueron identificadas y resueltas en la rama `fix/technical-debt-doctors`:

| Area | Observacion | Solucion aplicada |
|---|---|---|
| Validacion de cedula en `findByDocumentId` | No filtraba por `status: 'active'`. Un medico inactivo con cedula X bloqueaba la creacion de un nuevo medico activo. | Se agrego `findActiveByDocumentId` al puerto `IDoctorRepository` que filtra por `{ documentId, status: 'active' }`. Los casos de uso de creacion y edicion usan este metodo. La regla de negocio de unicidad aplica solo entre medicos activos. |
| `DeleteDoctorUseCase` con consulta de memoria | La validacion de turno activo cargaba todos los turnos del sistema con `findAll()` y filtraba en memoria. | Se agrego `findActiveByOffice(office: string)` al puerto `ITurnoRepository`, implementado con query de Mongoose `{ consultorio: office, estado: { $in: ['llamado', 'atendido'] } }`. El caso de uso solo recibe los turnos relevantes. |
| `useDoctors` hook con `mapError` incompleto | Los codigos 403 y 409 caian en el mensaje generico en lugar de mensajes descriptivos. | Se expandio `mapError` para cubrir 403 (`'No tiene permisos para realizar esta accion.'`) y 409 (`'Conflicto con los datos existentes. Verifique la informacion.'`). |
| Franjas horarias hardcodeadas en multiples archivos | Los literales `'06:00-14:00'` y `'14:00-22:00'` estaban duplicados en `doctor.entity.ts`, `doctor-mongoose.adapter.ts` y `doctor.schema.ts`. | Se exporto la constante `VALID_SHIFTS: readonly Shift[]` desde `doctor.entity.ts` (dominio). El adaptador y el schema la importan. El frontend replica la constante en `domain/Doctor.ts`. |
| Ausencia de paginacion en `GetAllDoctorsUseCase` | El use case retornaba todos los medicos activos sin limite, generando potenciales problemas de rendimiento. | Se agregaron `PaginationParams` y `PaginatedResult<T>` al dominio. El repositorio tiene `findAllPaginated(params)`. El use case acepta parametros opcionales con valores por defecto (page: 1, limit: 25, max: 100). El controlador expone `?page` y `?limit`. El frontend actualiza el puerto, adaptador y hook para manejar la respuesta paginada. |
