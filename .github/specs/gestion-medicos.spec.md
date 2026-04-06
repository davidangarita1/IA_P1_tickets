---
id: SPEC-002
status: DRAFT
feature: gestion-medicos
created: 2026-04-05
updated: 2026-04-05
author: spec-generator
version: "1.0"
related-specs: []
---

# Spec: Gestión de Médicos

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Módulo de administración del catálogo de médicos activos accesible desde la barra de navegación para Empleados y Administradores autenticados. Permite crear, editar y dar de baja médicos con nombre completo, cédula única, consultorio opcional y franja horaria opcional (6:00-14:00 o 14:00-22:00), garantizando unicidad de la combinación consultorio/franja.

### Requerimiento de Negocio
Centralizar y digitalizar el catálogo de médicos activos con sus consultorios y franjas horarias asignadas, permitiendo a Empleados y Administradores crear, editar y dar de baja médicos desde una pantalla dedicada ("Gestión de Médicos"). El sistema añade el prefijo "Dr." solo en la capa de presentación. La baja es lógica (estado "Inactivo") y está bloqueada si el médico tiene un turno en curso.

**Fuera de alcance:** gestión de especialidades, agenda de citas, múltiples sedes, franja de descanso, asignación automática de turnos a médicos, actualización de pantalla pública del paciente con nombre del médico, almacenamiento del nombre del médico en el registro del turno.

### Historias de Usuario

#### HU-01: Acceso y Visualización Inicial del Módulo

```
Como:        Usuario Empleado o Administrador autenticado
Quiero:      Ver un botón "Gestión Médicos" en la barra de navegación
Para:        Acceder al panel de administración de médicos

Prioridad:   Alta
Estimación:  S (Small)
Dependencias: Ninguna (requiere autenticación existente)
Capa:        Frontend
```

#### Criterios de Aceptación — HU-01

**Happy Path**
```gherkin
CRITERIO-1.1: Botón visible para usuario autenticado
  Dado que:  el usuario "Empleado/Administrador" está autenticado
  Cuando:    accede a cualquier pantalla del sistema
  Entonces:  la barra de navegación muestra el botón "Gestión Médicos"

CRITERIO-1.2: Navegación al módulo
  Dado que:  el usuario está autenticado y visualiza el botón "Gestión Médicos"
  Cuando:    hace clic en él
  Entonces:  se navega a la pantalla de gestión de médicos
    Y        la pantalla muestra el título centrado "Gestión de Médicos"
    Y        la pantalla muestra una tabla con los encabezados: "Nombre completo", "Consultorio", "Franja Horaria", "Acciones"
    Y        la pantalla muestra el botón "Crear médico" en la parte superior derecha de la tabla

CRITERIO-1.3: Tabla vacía sin médicos registrados
  Dado que:  no existe ningún médico registrado en el sistema
  Cuando:    el usuario accede a la pantalla de gestión de médicos
  Entonces:  la tabla se muestra vacía con el mensaje "No hay médicos creados" en la parte central
```

**Error Path**
```gherkin
CRITERIO-1.4: Botón oculto para usuarios no autenticados
  Dado que:  no hay ningún usuario autenticado
  Cuando:    se visualiza la barra de navegación
  Entonces:  el botón "Gestión Médicos" no es visible
```

---

#### HU-02: Crear un nuevo médico

```
Como:        Usuario Empleado o Administrador autenticado, ubicado en el módulo de gestión de médicos
Quiero:      Hacer clic en "Crear médico" para abrir un modal con formulario de nombre completo, cédula, consultorio (opcional) y franja horaria (opcional)
Para:        Registrar al médico con la información disponible, pudiendo completar el horario en una edición posterior

Prioridad:   Alta
Estimación:  L (Large)
Dependencias: HU-01
Capa:        Ambas
```

#### Criterios de Aceptación — HU-02

**Happy Path**
```gherkin
CRITERIO-2.1: Abrir modal de creación
  Dado que:  el usuario está en el módulo de gestión de médicos
  Cuando:    hace clic en "Crear médico"
  Entonces:  se abre un modal con campos "Nombre completo", "Número de cédula", "Consultorio" (opcional), "Franja horaria" (opcional) y botones "Cerrar" y "Guardar"

CRITERIO-2.2: Crear médico con consultorio y franja horaria
  Dado que:  el modal de creación está abierto con nombre "Juan García", cédula "12345678", consultorio "2" y franja "6:00 - 14:00"
  Cuando:    hace clic en "Guardar"
  Entonces:  el modal se cierra
    Y        aparece mensaje flotante "Médico guardado exitosamente" por 5 segundos
    Y        la tabla muestra "Dr. Juan García" con cédula "12345678", consultorio "2" y franja "6:00 - 14:00"
    Y        la combinación "Consultorio 2 / 6:00 - 14:00" deja de estar disponible
    Y        el backend responde HTTP 201

CRITERIO-2.3: Crear médico sin consultorio ni franja
  Dado que:  el modal tiene nombre "Jose Martínez", cédula "87654321" y consultorio/franja vacíos
  Cuando:    hace clic en "Guardar"
  Entonces:  la tabla muestra "Dr. Jose Martínez" con "Sin asignar" en consultorio y franja
    Y        el backend responde HTTP 201

CRITERIO-2.4: Prefijo "Dr." solo en capa de presentación
  Dado que:  el usuario ingresa "Juan García" en el campo "Nombre completo"
  Cuando:    guarda el médico
  Entonces:  la tabla muestra "Dr. Juan García"
    Y        en la base de datos se almacena "Juan García" sin prefijo

CRITERIO-2.5: Franjas libres filtradas por consultorio
  Dado que:  la franja "6:00 - 14:00" del consultorio "1" ya tiene un médico asignado
  Cuando:    el usuario selecciona consultorio "1"
  Entonces:  el desplegable de franjas muestra solo "14:00 - 22:00"
```

**Error Path**
```gherkin
CRITERIO-2.6: Consultorio con todas las franjas ocupadas
  Dado que:  ambas franjas del consultorio "3" están asignadas
  Cuando:    el usuario selecciona consultorio "3"
  Entonces:  el desplegable de franjas queda deshabilitado
    Y        aparece "No hay franjas disponibles para este consultorio"
    Y        "Guardar" permanece deshabilitado

CRITERIO-2.7: Nombre vacío impide guardar
  Dado que:  el modal de creación está abierto
  Cuando:    el campo "Nombre completo" pierde el foco sin texto
  Entonces:  aparece "El nombre completo es obligatorio" y "Guardar" se deshabilita

CRITERIO-2.8: Nombre menor a 3 caracteres
  Dado que:  el modal de creación está abierto
  Cuando:    el usuario escribe "Ju" en "Nombre completo"
  Entonces:  aparece "El nombre completo debe tener al menos 3 caracteres" y "Guardar" se deshabilita

CRITERIO-2.9: Cédula vacía impide guardar
  Dado que:  el modal de creación está abierto
  Cuando:    el campo "Número de cédula" pierde el foco sin texto
  Entonces:  aparece "El número de cédula es obligatorio" y "Guardar" se deshabilita

CRITERIO-2.10: Cédula solo acepta números y valida longitud
  Dado que:  el modal de creación está abierto
  Cuando:    el usuario escribe "ABC123" en cédula
  Entonces:  el campo muestra solo "123"
    Y        si la longitud es menor a 7 o mayor a 10, aparece "La cédula debe tener entre 7 y 10 números"
    Y        "Guardar" permanece deshabilitado

CRITERIO-2.11: Cédula duplicada rechazada
  Dado que:  existe un médico con cédula "12345678"
  Cuando:    el usuario ingresa cédula "12345678" y hace clic en "Guardar"
  Entonces:  aparece alerta "Ya existe un médico registrado con ese número de cédula" por 5 segundos
    Y        el modal permanece abierto
    Y        el backend responde HTTP 409

CRITERIO-2.12: Cerrar modal sin guardar
  Dado que:  el modal de creación está abierto
  Cuando:    el usuario hace clic en "Cerrar"
  Entonces:  el modal se cierra y la tabla no muestra ningún registro nuevo
```

---

#### HU-03: Editar un médico creado

```
Como:        Usuario Empleado o Administrador autenticado, ubicado en el módulo de gestión de médicos
Quiero:      Hacer clic en un ícono de lápiz en la fila del médico para abrir un modal con sus datos editables
Para:        Mantener la información del médico actualizada cuando cambia su disponibilidad o datos personales

Prioridad:   Alta
Estimación:  L (Large)
Dependencias: HU-02
Capa:        Ambas
```

#### Criterios de Aceptación — HU-03

**Happy Path**
```gherkin
CRITERIO-3.1: Ícono de lápiz en cada fila
  Dado que:  existen médicos creados en el sistema
  Cuando:    el usuario consulta la tabla
  Entonces:  cada fila muestra un ícono de lápiz en la columna "Acciones"

CRITERIO-3.2: Modal de edición con datos precargados
  Dado que:  el "Dr. Juan García" tiene consultorio "2" y franja "6:00 - 14:00"
  Cuando:    el usuario hace clic en el ícono de lápiz de su fila
  Entonces:  se abre un modal con nombre "Juan García", cédula "12345678", consultorio "2", franja "6:00 - 14:00" precargados
    Y        el desplegable de franjas muestra la franja actual más las franjas libres del consultorio
    Y        el modal muestra botones "Cerrar", "Guardar" y un ícono "X" superior

CRITERIO-3.3: Guardar cambios de consultorio y franja
  Dado que:  el modal de edición está abierto para "Dr. Juan García" con consultorio "2" y franja "6:00 - 14:00"
  Cuando:    cambia a consultorio "4" y franja "14:00 - 22:00" y hace clic en "Guardar"
  Entonces:  el modal se cierra
    Y        aparece mensaje flotante verde "Médico guardado exitosamente" por 3 segundos
    Y        la tabla refleja consultorio "4" y franja "14:00 - 22:00" sin recargar
    Y        la combinación "Consultorio 2 / 6:00 - 14:00" queda libre
    Y        el backend responde HTTP 200

CRITERIO-3.4: Cerrar modal sin guardar
  Dado que:  el modal de edición tiene cambios sin guardar
  Cuando:    el usuario hace clic en "Cerrar" o en el ícono "X"
  Entonces:  el modal se cierra y los datos no cambian en la tabla
```

**Edge Case**
```gherkin
CRITERIO-3.5: Prevención de cierre accidental
  Dado que:  el modal de edición está abierto
  Cuando:    el usuario hace clic fuera del modal o presiona Escape
  Entonces:  el modal permanece abierto
```

**Error Path**
```gherkin
CRITERIO-3.6: Nombre vacío o menor a 3 caracteres en edición
  Dado que:  el modal de edición tiene los datos del "Dr. Juan García"
  Cuando:    el usuario borra el nombre o lo reduce a menos de 3 caracteres
  Entonces:  "Guardar" se deshabilita y aparece mensaje de validación en rojo

CRITERIO-3.7: Cédula vacía en edición
  Dado que:  el modal de edición tiene los datos del "Dr. Juan García"
  Cuando:    el usuario borra la cédula
  Entonces:  "Guardar" se deshabilita y aparece "El número de cédula es obligatorio" en rojo

CRITERIO-3.8: Cédula duplicada en edición
  Dado que:  existe otro médico con cédula "99999999"
  Cuando:    el usuario cambia la cédula a "99999999" y pierde el foco o hace clic en "Guardar"
  Entonces:  "Guardar" se deshabilita
    Y        aparece alerta roja "Ya existe un médico registrado con ese número de cédula"
    Y        el modal permanece abierto
```

---

#### HU-04: Dar de baja a un médico del sistema

```
Como:        Usuario Empleado o Administrador autenticado, ubicado en el módulo de gestión de médicos
Quiero:      Hacer clic en un ícono de baja en la fila del médico para que aparezca un modal de confirmación antes de inactivarlo
Para:        Retirar a un médico que deja de atender, manteniendo su historial intacto (eliminación lógica)

Prioridad:   Alta
Estimación:  M (Medium)
Dependencias: HU-02
Capa:        Ambas
```

#### Criterios de Aceptación — HU-04

**Happy Path**
```gherkin
CRITERIO-4.1: Ícono de baja en cada fila
  Dado que:  existen médicos activos
  Cuando:    el usuario consulta la tabla
  Entonces:  cada fila muestra un ícono de baja junto al ícono de edición en "Acciones"

CRITERIO-4.2: Modal de confirmación
  Dado que:  el "Dr. Juan García" está activo
  Cuando:    el usuario hace clic en el ícono de baja
  Entonces:  aparece un modal con "¿Está seguro de que desea dar de baja al Dr. Juan García? Esta acción lo ocultará de la lista de médicos activos."
    Y        el modal muestra botones "Cancelar" y "Aceptar"

CRITERIO-4.3: Confirmar baja lógica
  Dado que:  el modal de confirmación está abierto para "Dr. Juan García"
  Cuando:    el usuario hace clic en "Aceptar"
  Entonces:  el modal se cierra
    Y        el estado del médico cambia a "Inactivo" en la base de datos
    Y        el médico desaparece de la tabla
    Y        aparece mensaje flotante "Médico dado de baja exitosamente"
    Y        la combinación consultorio/franja que tenía asignada queda libre
    Y        el backend responde HTTP 200

CRITERIO-4.4: Cancelar la baja
  Dado que:  el modal de confirmación está abierto
  Cuando:    el usuario hace clic en "Cancelar"
  Entonces:  el modal se cierra y el médico permanece en la tabla sin cambios
```

**Error Path**
```gherkin
CRITERIO-4.5: Bloqueo de baja con turno en curso
  Dado que:  el "Dr. Juan García" tiene un turno en ejecución en este momento
  Cuando:    el usuario hace clic en el ícono de baja
  Entonces:  aparece mensaje flotante de alerta "No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento."
    Y        el modal de confirmación no se abre
    Y        el backend responde HTTP 409
```

### Reglas de Negocio
1. **Unicidad de cédula:** no pueden existir dos médicos (activos o inactivos) con el mismo número de cédula.
2. **Unicidad consultorio/franja:** ninguna combinación consultorio + franja horaria puede estar asignada a dos médicos activos simultáneamente.
3. **Prefijo "Dr.":** se agrega solo en la capa de presentación (UI); en base de datos se almacena el nombre sin prefijo.
4. **Franjas horarias fijas:** solo existen dos franjas: "6:00 - 14:00" y "14:00 - 22:00" (8 horas cada una).
5. **Cédula numérica:** solo dígitos, entre 7 y 10 caracteres de longitud.
6. **Nombre mínimo:** al menos 3 caracteres.
7. **Consultorio y franja opcionales:** un médico puede crearse sin consultorio ni franja; ambos se muestran como "Sin asignar".
8. **Eliminación lógica:** la baja cambia el estado a "Inactivo"; el registro permanece en la base de datos.
9. **Bloqueo de baja con turno activo:** no se puede dar de baja a un médico que tenga un turno en ejecución en el momento actual.
10. **Acceso restringido:** solo usuarios autenticados con rol Empleado o Administrador pueden acceder al módulo.

---

## 2. DISEÑO

### Modelos de Datos

#### Entidades afectadas
| Entidad | Almacén | Cambios | Descripción |
|---------|---------|---------|-------------|
| `Doctor` | colección `doctors` | nueva | Médico con cédula, nombre, consultorio, franja y estado activo/inactivo |

#### Campos del modelo
| Campo | Tipo | Obligatorio | Validación | Descripción |
|-------|------|-------------|------------|-------------|
| `_id` | ObjectId | sí | auto-generado (Mongoose) | Identificador único del documento |
| `fullName` | string | sí | min 3 caracteres | Nombre completo del médico (sin prefijo "Dr.") |
| `cedula` | string | sí | solo dígitos, 7-10 chars, único | Número de cédula del médico |
| `office` | number \| null | no | debe existir en el catálogo de consultorios | Número de consultorio asignado |
| `timeSlot` | string \| null | no | enum: `"6:00 - 14:00"`, `"14:00 - 22:00"` | Franja horaria asignada |
| `isActive` | boolean | sí | default `true` | `true` = activo, `false` = dado de baja |
| `createdAt` | Date | sí | auto-generado (timestamps) | Timestamp de creación UTC |
| `updatedAt` | Date | sí | auto-generado (timestamps) | Timestamp de última actualización UTC |

#### Índices / Constraints
| Índice | Campos | Tipo | Justificación |
|--------|--------|------|---------------|
| `idx_cedula_unique` | `cedula` | unique | Unicidad de cédula — regla de negocio |
| `idx_office_timeslot_active` | `office`, `timeSlot`, `isActive` | unique (parcial, donde `isActive=true` y ambos no son `null`) | Garantiza unicidad de combinación consultorio/franja entre médicos activos |
| `idx_is_active` | `isActive` | regular | Filtrado eficiente de médicos activos en listados |

### API Endpoints

> Base path: `/doctors` — controlador NestJS registrado en `AppModule`.
> Todos los endpoints requieren autenticación (Bearer token via `AuthGuard`).

#### GET /doctors
- **Descripción**: Lista todos los médicos activos
- **Auth requerida**: sí (Bearer token)
- **Response 200**:
  ```json
  [
    {
      "id": "ObjectId string",
      "fullName": "Juan García",
      "cedula": "12345678",
      "office": 2,
      "timeSlot": "6:00 - 14:00",
      "isActive": true,
      "createdAt": "iso8601",
      "updatedAt": "iso8601"
    }
  ]
  ```
- **Response 401**: token ausente o expirado

#### GET /doctors/available-slots
- **Descripción**: Devuelve las combinaciones consultorio/franja disponibles (no asignadas a ningún médico activo)
- **Auth requerida**: sí
- **Query params**: `office` (opcional) — filtra por consultorio
- **Response 200**:
  ```json
  [
    { "office": 1, "timeSlot": "14:00 - 22:00" },
    { "office": 2, "timeSlot": "6:00 - 14:00" },
    { "office": 2, "timeSlot": "14:00 - 22:00" }
  ]
  ```
- **Response 401**: token ausente o expirado

#### POST /doctors
- **Descripción**: Crea un nuevo médico
- **Auth requerida**: sí
- **Request Body**:
  ```json
  {
    "fullName": "Juan García",
    "cedula": "12345678",
    "office": 2,
    "timeSlot": "6:00 - 14:00"
  }
  ```
  > `office` y `timeSlot` son opcionales. Si se envía uno, ambos deben estar presentes.
- **Response 201**: médico creado (mismo formato que GET individual)
- **Response 400**: campo obligatorio faltante, nombre < 3 chars, cédula inválida, o `office` sin `timeSlot`
- **Response 401**: token ausente o expirado
- **Response 409**: ya existe un médico con esa cédula, o la combinación consultorio/franja ya está asignada

#### PUT /doctors/:id
- **Descripción**: Actualiza un médico existente
- **Auth requerida**: sí
- **Request Body**:
  ```json
  {
    "fullName": "Juan García López",
    "cedula": "12345678",
    "office": 4,
    "timeSlot": "14:00 - 22:00"
  }
  ```
  > Todos los campos son opcionales. Si se envía `office`, debe incluir `timeSlot` y viceversa. Enviar `office: null` y `timeSlot: null` desasigna el consultorio.
- **Response 200**: médico actualizado
- **Response 400**: validación de nombre, cédula, o combinación office/timeSlot inválida
- **Response 401**: token ausente o expirado
- **Response 404**: médico no encontrado o inactivo
- **Response 409**: cédula duplicada o combinación consultorio/franja ya asignada a otro médico activo

#### PATCH /doctors/:id/deactivate
- **Descripción**: Baja lógica de un médico (cambia `isActive` a `false`)
- **Auth requerida**: sí
- **Response 200**: `{ "message": "Médico dado de baja exitosamente" }`
- **Response 401**: token ausente o expirado
- **Response 404**: médico no encontrado o ya inactivo
- **Response 409**: el médico tiene un turno en curso en este momento

### Diseño Frontend

#### Componentes nuevos
| Componente | Archivo | Props principales | Descripción |
|------------|---------|------------------|-------------|
| `DoctorsTable` | `components/DoctorsTable/DoctorsTable.tsx` | `doctors, onEdit, onDeactivate` | Tabla de médicos activos con columnas nombre, cédula, consultorio, franja y acciones |
| `DoctorFormModal` | `components/DoctorFormModal/DoctorFormModal.tsx` | `isOpen, onClose, onSubmit, doctor?, availableSlots` | Modal reutilizable para creación y edición de médico |
| `DoctorDeactivateModal` | `components/DoctorDeactivateModal/DoctorDeactivateModal.tsx` | `isOpen, onClose, onConfirm, doctorName` | Modal de confirmación de baja con botones "Cancelar" y "Aceptar" |
| `Toast` | `components/Toast/Toast.tsx` | `message, type, duration, onClose` | Mensaje flotante reutilizable (éxito verde / error rojo) con auto-dismiss |

#### Páginas nuevas
| Página | Archivo | Ruta | Protegida |
|--------|---------|------|-----------|
| `DoctorsPage` | `app/doctors/page.tsx` | `/doctors` | sí (usuario autenticado) |

#### Estilos nuevos (CSS Modules)
| Archivo |
|---------|
| `styles/DoctorsPage.module.css` |
| `styles/DoctorsTable.module.css` |
| `styles/DoctorFormModal.module.css` |
| `styles/DoctorDeactivateModal.module.css` |
| `styles/Toast.module.css` |

#### Hooks y State
| Hook | Archivo | Retorna | Descripción |
|------|---------|---------|-------------|
| `useDoctors` | `hooks/useDoctors.ts` | `{ doctors, loading, error, fetchDoctors, createDoctor, updateDoctor, deactivateDoctor }` | CRUD de médicos con estado local y llamadas al servicio |

#### Domain
| Tipo | Archivo | Descripción |
|------|---------|-------------|
| `Doctor` | `domain/Doctor.ts` | Interface del modelo Doctor para el frontend |
| `DoctorPort` | `domain/ports/DoctorService.ts` | Puerto (interface) para el servicio de médicos |

#### Infrastructure Adapters
| Adaptador | Archivo | Descripción |
|-----------|---------|-------------|
| `HttpDoctorAdapter` | `infrastructure/adapters/HttpDoctorAdapter.ts` | Implementación HTTP del puerto `DoctorService` usando `httpGet`, `httpPost`, `httpPut`, `httpPatch` |

#### Services (llamadas API)
| Función | Endpoint | Método HTTP |
|---------|----------|-------------|
| `getDoctors(token)` | `GET /doctors` | GET |
| `getAvailableSlots(token, office?)` | `GET /doctors/available-slots` | GET |
| `createDoctor(data, token)` | `POST /doctors` | POST |
| `updateDoctor(id, data, token)` | `PUT /doctors/:id` | PUT |
| `deactivateDoctor(id, token)` | `PATCH /doctors/:id/deactivate` | PATCH |

#### Cambios en componentes existentes
| Componente | Cambio |
|------------|--------|
| `Navbar.tsx` | Agregar entrada `{ href: "/doctors", label: "Gestión Médicos" }` en `NAV_ITEMS`, visible solo cuando `isAuthenticated === true` |

### Arquitectura y Dependencias

**Backend (NestJS — producer):**
- Paquetes nuevos requeridos: ninguno (Mongoose, class-validator y @nestjs/swagger ya están instalados)
- Nuevo módulo `DoctorsModule` registrado en `AppModule`
- Estructura de archivos (siguiendo el patrón existente del producer):
  ```
  src/
    doctors/
      doctors.module.ts
      domain/
        entities/doctor.entity.ts
        ports/IDoctorRepository.ts
      application/
        use-cases/
          create-doctor.use-case.ts
          update-doctor.use-case.ts
          deactivate-doctor.use-case.ts
          get-all-doctors.use-case.ts
          get-available-slots.use-case.ts
      infrastructure/
        schemas/doctor.schema.ts
        adapters/doctor-mongoose.adapter.ts
      presentation/
        doctors.controller.ts
        dto/
          create-doctor.dto.ts
          update-doctor.dto.ts
  ```

**Frontend (Next.js):**
- Paquetes nuevos: ninguno
- Integración con `AuthProvider` existente para obtener token y estado de autenticación

### Notas de Implementación
1. El backend usa NestJS con Mongoose (no FastAPI/Python). Seguir los patrones existentes de `turnos/` y `presentation/`.
2. La validación de unicidad de combinación consultorio/franja debe hacerse a nivel de use-case y reforzarse con índice parcial en MongoDB.
3. Para verificar si un médico tiene turno en curso al dar de baja, consultar la colección `turnos` donde `consultorio` coincida, `estado` sea `"llamado"` y el timestamp esté dentro de la franja horaria actual del médico.
4. El frontend sigue la arquitectura de puertos y adaptadores existente (`domain/ports/` + `infrastructure/adapters/`).
5. Los modales deben prevenir cierre por clic fuera o tecla Escape (solo cerrar con botones explícitos).
6. El componente `Toast` puede extraerse como reutilizable si no existe uno similar en el proyecto.

---

## 3. LISTA DE TAREAS

> Checklist accionable para todos los agentes. Marcar cada ítem (`[x]`) al completarlo.
> El Orchestrator monitorea este checklist para determinar el progreso.

### Backend

#### Implementación
- [ ] Crear entidad `Doctor` en `doctors/domain/entities/doctor.entity.ts`
- [ ] Crear puerto `IDoctorRepository` en `doctors/domain/ports/IDoctorRepository.ts`
- [ ] Crear schema Mongoose `DoctorSchema` en `doctors/infrastructure/schemas/doctor.schema.ts` con índices
- [ ] Implementar `DoctorMongooseAdapter` — métodos CRUD + búsqueda de slots disponibles
- [ ] Implementar `CreateDoctorUseCase` — validar nombre, cédula, unicidad de cédula y unicidad consultorio/franja
- [ ] Implementar `UpdateDoctorUseCase` — mismas validaciones + verificar que el médico exista y esté activo
- [ ] Implementar `DeactivateDoctorUseCase` — verificar que no tenga turno en curso, cambiar `isActive` a `false`
- [ ] Implementar `GetAllDoctorsUseCase` — filtrar por `isActive: true`
- [ ] Implementar `GetAvailableSlotsUseCase` — calcular combinaciones libres
- [ ] Crear DTOs: `CreateDoctorDto`, `UpdateDoctorDto` con class-validator
- [ ] Implementar `DoctorsController` — endpoints GET, POST, PUT, PATCH con `AuthGuard`
- [ ] Crear `DoctorsModule` y registrar en `AppModule`

#### Tests Backend
- [ ] `test_create_doctor_success` — happy path creación con consultorio/franja
- [ ] `test_create_doctor_without_office` — creación sin consultorio ni franja
- [ ] `test_create_doctor_duplicate_cedula_raises_409` — cédula duplicada
- [ ] `test_create_doctor_duplicate_slot_raises_409` — combinación consultorio/franja ocupada
- [ ] `test_create_doctor_invalid_name_raises_400` — nombre vacío o < 3 chars
- [ ] `test_create_doctor_invalid_cedula_raises_400` — cédula no numérica o fuera de rango
- [ ] `test_update_doctor_success` — actualización de consultorio/franja
- [ ] `test_update_doctor_frees_previous_slot` — la combinación anterior queda libre
- [ ] `test_update_doctor_duplicate_cedula_raises_409` — cédula de otro médico
- [ ] `test_deactivate_doctor_success` — baja lógica exitosa
- [ ] `test_deactivate_doctor_with_active_turno_raises_409` — bloqueo por turno en curso
- [ ] `test_get_all_doctors_returns_only_active` — filtro de inactivos
- [ ] `test_get_available_slots_excludes_occupied` — excluye slots asignados
- [ ] `test_endpoints_return_401_without_token` — sin autenticación

### Frontend

#### Implementación
- [ ] Crear interface `Doctor` en `domain/Doctor.ts`
- [ ] Crear puerto `DoctorService` en `domain/ports/DoctorService.ts`
- [ ] Crear adaptador `HttpDoctorAdapter` en `infrastructure/adapters/HttpDoctorAdapter.ts`
- [ ] Registrar adaptador en `DependencyProvider`
- [ ] Crear hook `useDoctors` en `hooks/useDoctors.ts`
- [ ] Implementar `DoctorsTable` + estilos CSS Module
- [ ] Implementar `DoctorFormModal` + estilos (creación y edición, validaciones en tiempo real)
- [ ] Implementar `DoctorDeactivateModal` + estilos
- [ ] Implementar `Toast` + estilos (mensaje flotante con auto-dismiss)
- [ ] Implementar `DoctorsPage` (`app/doctors/page.tsx`) + estilos
- [ ] Agregar entrada "Gestión Médicos" a `Navbar` (condicional a `isAuthenticated`)
- [ ] Registrar ruta `/doctors` como protegida

#### Tests Frontend
- [ ] `DoctorsTable renders doctor list with Dr. prefix`
- [ ] `DoctorsTable shows "No hay médicos creados" when empty`
- [ ] `DoctorFormModal opens with empty fields for creation`
- [ ] `DoctorFormModal opens with pre-filled data for editing`
- [ ] `DoctorFormModal validates required name (empty and < 3 chars)`
- [ ] `DoctorFormModal validates required cedula (empty, non-numeric, length)`
- [ ] `DoctorFormModal filters available time slots by selected office`
- [ ] `DoctorFormModal disables save when office has no available slots`
- [ ] `DoctorFormModal prevents close on backdrop click and Escape`
- [ ] `DoctorDeactivateModal shows confirmation message with doctor name`
- [ ] `DoctorDeactivateModal calls onConfirm on Aceptar click`
- [ ] `DoctorDeactivateModal calls onClose on Cancelar click`
- [ ] `useDoctors fetches doctors on mount`
- [ ] `useDoctors handles create/update/deactivate errors`
- [ ] `Navbar shows "Gestión Médicos" link when authenticated`
- [ ] `Navbar hides "Gestión Médicos" link when not authenticated`

### QA
- [ ] Ejecutar skill `/gherkin-case-generator` → criterios CRITERIO-1.1 a 4.5
- [ ] Ejecutar skill `/risk-identifier` → clasificación ASD de riesgos
- [ ] Revisar cobertura de tests contra criterios de aceptación
- [ ] Validar que todas las reglas de negocio están cubiertas
- [ ] Validar unicidad consultorio/franja con pruebas de concurrencia
- [ ] Verificar que el prefijo "Dr." no se almacena en BD
- [ ] Verificar eliminación lógica vs. física
- [ ] Actualizar estado spec: `status: IMPLEMENTED`
