---
id: SPEC-001
status: IN_PROGRESS
feature: doctors-module
created: 2026-04-06
updated: 2026-04-06
author: spec-generator
version: "1.0"
related-specs: []
---

# Spec: Módulo de Gestión de Médicos y Consultorios

> **Estado:** `IN_PROGRESS` → implementación en curso.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
El módulo de Gestión de Médicos permite a usuarios administradores y empleados autenticados crear, editar y dar de baja médicos con sus consultorios y franjas horarias fijas (6:00-14:00 y 14:00-22:00), garantizando que ninguna combinación consultorio/franja sea asignada a dos médicos simultáneamente. El sistema añade automáticamente el prefijo "Dr." al nombre en la UI y bloquea la eliminación de médicos con atenciones en curso.

### Requerimiento de Negocio

**Iniciativa:** Optimización de la Atención y Asignación de Consultorios.

**Objetivo:** Eliminar la gestión manual de disponibilidad médica para reducir errores de asignación y mejorar la experiencia del paciente mediante información en tiempo real.

**Épica:** Gestión de Catálogo de Médicos y Asignación Automática de Turnos.

**Descripción Técnica:** Este módulo permite administrar los datos de los médicos, sus consultorios y franjas horarias (6:00-14:00 y 14:00-22:00). Incluye patrones arquitectónicos: Adapter, Observer, Memento, Template Method, Command, Facade.

**Alcance:**
- Crear médicos con nombre, cédula única, consultorio y franja horaria opcionales
- Editar disponibilidad y consultorio asignado
- Dar de baja (eliminación lógica) médicos sin atenciones en curso
- Garantizar unicidad de la combinación consultorio/franja
- Visualización en tabla con estados

**Fuera de Alcance:**
- Gestión de especialidades médicas
- Múltiples sedes
- Franja horaria de descanso
- Asignación automática de turnos (HU-05 y HU-06 quedan para fase siguiente)
- Almacenamiento del nombre del médico en el registro del turno

---

### Historias de Usuario

#### HU-01: Acceso al módulo de gestión de médicos

```
Como:        usuario administrador o empleado autenticado
Quiero:      ver un botón "Gestión Médicos" en la barra de navegación
Para:        acceder al panel de administración de médicos

Prioridad:   Alta
Estimación:  S (Small)
Dependencias: Ninguna
Capa:        Frontend
```

##### Criterios de Aceptación — HU-01

**Happy Path: Botón visible para usuario autenticado**
```gherkin
CRITERIO-1.1: El botón "Gestión Médicos" aparece en la barra de navegación para usuarios autenticados
  Dado que:   el usuario "Empleado/Administrador" está autenticado
  Cuando:     accede a cualquier pantalla del sistema
  Entonces:   la barra de navegación muestra el botón "Gestión Médicos"
```

**Happy Path: Acceso a la pantalla del módulo**
```gherkin
CRITERIO-1.2: Al hacer clic en "Gestión Médicos" se abre la pantalla del módulo
  Dado que:   el usuario "Empleado/Administrador" está autenticado y visualiza el botón "Gestión Médicos"
  Cuando:     hace clic en el botón
  Entonces:   se navega a la pantalla `/doctors`
  Y:          la pantalla muestra el título centrado "Gestión de Médicos"
  Y:          la pantalla muestra una tabla con encabezados: "Nombre completo", "Cédula", "Consultorio", "Franja Horaria", "Acciones"
  Y:          la pantalla muestra el botón "Crear médico" en la parte superior derecha de la tabla
```

**Error Path: Botón oculto para usuario no autenticado**
```gherkin
CRITERIO-1.3: El botón "Gestión Médicos" no es visible para usuarios no autenticados
  Dado que:   no hay ningún usuario autenticado
  Cuando:     se visualiza la barra de navegación
  Entonces:   el botón "Gestión Médicos" no es visible
```

**Edge Case: Tabla vacía con mensaje informativo**
```gherkin
CRITERIO-1.4: La tabla muestra mensaje cuando no hay médicos creados
  Dado que:   no existe ningún médico registrado en el sistema
  Cuando:     el administrador accede a la pantalla de gestión de médicos
  Entonces:   la tabla se muestra vacía
  Y:          aparece el mensaje "No hay médicos creados" en la parte central de la tabla
```

---

#### HU-02: Crear un nuevo médico

```
Como:        usuario administrador o empleado autenticado
Quiero:      registrar un médico con nombre, cédula, consultorio y franja horaria
Para:        integrarlo al flujo de atención del centro médico

Prioridad:   Alta
Estimación:  L (Large)
Dependencias: HU-01
Capa:        Frontend + Backend
```

##### Criterios de Aceptación — HU-02

**Happy Path: Crear médico con consultorio y franja**
```gherkin
CRITERIO-2.1: Registro exitoso con asignación completa
  Dado que:   el modal de creación está abierto
  Y:          el campo "Nombre completo" contiene "Juan García"
  Y:          el campo "Cédula" contiene "12345678"
  Y:          se selecciona el Consultorio "2" y la Franja "6:00 - 14:00"
  Cuando:     hace clic en "Guardar"
  Entonces:   el modal se cierra
  Y:          aparece un mensaje flotante "Médico guardado exitosamente" en la UI que desaparece tras 5 segundos
  Y:          el médico aparece en la tabla con:
              - Nombre: "Dr. Juan García" (prefijo agregado automáticamente)
              - Cédula: "12345678"
              - Consultorio: "2"
              - Franja: "6:00 - 14:00"
  Y:          la combinación "Consultorio 2 / 6:00 - 14:00" queda bloqueada para otros registros
```

**Happy Path: Crear médico sin consultorio ni franja**
```gherkin
CRITERIO-2.2: Registro sin asignación de disponibilidad
  Dado que:   el modal de creación está abierto
  Y:          el campo "Nombre completo" contiene "Jose Martínez"
  Y:          el campo "Cédula" contiene "87654321"
  Y:          los campos Consultorio y Franja horaria se dejan vacíos
  Cuando:     hace clic en "Guardar"
  Entonces:   el modal se cierra
  Y:          aparece el mensaje "Médico guardado exitosamente" flotante por 5 segundos
  Y:          el médico aparece en la tabla con:
              - Nombre: "Dr. Jose Martínez"
              - Cédula: "87654321"
              - Consultorio: "Sin asignar"
              - Franja: "Sin asignar"
```

**Error Path: Cédula duplicada**
```gherkin
CRITERIO-2.3: Rechazo de cédula duplicada
  Dado que:   existe un médico con cédula "12345678"
  Y:          el modal de creación está abierto
  Cuando:     ingresa nombre "Pedro López", cédula "12345678" e intenta guardar
  Entonces:   se muestra un mensaje de error: "Ya existe un médico registrado con ese número de cédula"
  Y:          el modal permanece abierto
  Y:          el botón "Guardar" permanece deshabilitado
```

**Error Path: Franja no disponible en consultorio**
```gherkin
CRITERIO-2.4: Rechazo cuando todas las franjas del consultorio están ocupadas
  Dado que:   el Consultorio "3" tiene ambas franjas (6:00-14:00 y 14:00-22:00) asignadas
  Y:          el modal de creación está abierto
  Cuando:     selecciona el Consultorio "3"
  Entonces:   el desplegable de "Franja Horaria" se desactiva
  Y:          se muestra el mensaje: "No hay franjas disponibles para este consultorio"
  Y:          el botón "Guardar" permanece deshabilitado
```

**Edge Case: Validación de nombre (longitud mínima)**
```gherkin
CRITERIO-2.5: Validación en tiempo real del nombre
  Dado que:   el modal de creación está abierto
  Cuando:     ingresa un nombre con menos de 3 caracteres (ej. "Ju")
  Entonces:   se muestra un mensaje de validación: "El nombre completo debe tener al menos 3 caracteres"
  Y:          el botón "Guardar" permanece deshabilitado
```

**Edge Case: Validación de cédula (formato)**
```gherkin
CRITERIO-2.6: Validación de cédula: solo números, rango 7-10 dígitos
  Dado que:   el modal de creación está abierto
  Cuando:     intenta escribir letras en el campo Cédula (ej. "ABC123")
  Entonces:   el campo rechaza las letras, aceptando solo números
  Y:          si ingresa menos de 7 o más de 10 dígitos, muestra: "La cédula debe tener entre 7 y 10 números"
  Y:          el botón "Guardar" permanece deshabilitado
```

**Edge Case: Cierre del modal sin guardar**
```gherkin
CRITERIO-2.7: Cierre de modal sin guardar
  Dado que:   el modal de creación está abierto con datos parciales
  Cuando:     hace clic en el botón "Cerrar"
  Entonces:   el modal se cierra sin guardar datos
  Y:          la tabla permanece sin cambios
```

---

#### HU-03: Editar un médico creado

```
Como:        usuario administrador o empleado autenticado
Quiero:      modificar los datos de un médico existente
Para:        actualizar su disponibilidad o consultorio asignado

Prioridad:   Alta
Estimación:  L (Large)
Dependencias: HU-02
Capa:        Frontend + Backend
```

##### Criterios de Aceptación — HU-03

**Happy Path: Modificación de consultorio y franja**
```gherkin
CRITERIO-3.1: Cambio de disponibilidad del médico
  Dado que:   el modal de edición del "Dr. Juan García" (Consultorio 2, Franja 6:00-14:00) está abierto
  Cuando:     cambia el Consultorio a "4" y la Franja a "14:00 - 22:00" y hace clic en "Guardar"
  Entonces:   el modal se cierra
  Y:          la tabla refleja los cambios de inmediato:
              - Consultorio: "4"
              - Franja: "14:00 - 22:00"
  Y:          un mensaje flotante "Médico actualizado exitosamente" aparece por 3-5 segundos
  Y:          la franja anterior (Consultorio 2 / 6:00-14:00) queda libre para otros médicos
```

**Happy Path: Precarga de datos en modal de edición**
```gherkin
CRITERIO-3.2: El modal muestra los datos actuales del médico
  Dado que:   existe un médico "Dr. Juan García" con cédula "12345678", Consultorio "2", Franja "6:00-14:00"
  Cuando:     el usuario hace clic en el ícono de edición (lápiz) en la fila del médico
  Entonces:   se abre el modal de edición con los campos precargados:
              - Nombre: "Juan García" (sin prefijo "Dr.")
              - Cédula: "12345678"
              - Consultorio: "2"
              - Franja: "6:00-14:00"
```

**Happy Path: Edición sin cambiar consultorio/franja**
```gherkin
CRITERIO-3.3: Edición solo del nombre sin afectar disponibilidad
  Dado que:   el modal de edición está abierto para "Dr. Juan García"
  Cuando:     solo modifica el nombre a "Juan Carlos García" manteniendo consultorio y franja
  Y:          hace clic en "Guardar"
  Entonces:   el médico se actualiza a "Dr. Juan Carlos García"
  Y:          la tabla refleja el nombre nuevo
  Y:          el consultorio y franja permanecen asignados al mismo médico
```

**Error Path: Cédula duplicada en edición**
```gherkin
CRITERIO-3.4: Validación de duplicidad de cédula durante edición
  Dado que:   existe "Dr. Juan García" (cédula "12345678") y "Dr. Pedro López" (cédula "87654321")
  Y:          el modal de edición de "Pedro López" está abierto
  Cuando:     intenta cambiar su cédula a "12345678" (ya existe) y guarda
  Entonces:   aparece el mensaje: "Ya existe un médico registrado con ese número de cédula"
  Y:          el modal permanece abierto sin actualizar
```

**Error Path: Franja no disponible durante cambio**
```gherkin
CRITERIO-3.5: Validación de disponibilidad de franja al cambiar consultorio
  Dado que:   el Consultorio "5" tiene la franja "14:00-22:00" ocupada
  Y:          el modal de edición de un médico está abierto
  Cuando:     selecciona Consultorio "5" e intenta seleccionar "14:00-22:00"
  Entonces:   esa opción no aparece en el desplegable (solo "6:00-14:00" está disponible)
```

**Edge Case: Cierre del modal sin guardar cambios**
```gherkin
CRITERIO-3.6: Cierre del modal sin guardar
  Dado que:   el modal de edición está abierto con cambios realizados
  Cuando:     hace clic en "Cerrar" o en el ícono "X"
  Entonces:   el modal se cierra sin guardar los cambios
  Y:          los datos del médico en la tabla permanecen sin modificación
  Y:          si hace clic fuera del modal, este NO se cierra (prevención de cierre accidental)
```

---

#### HU-04: Eliminar un médico creado

```
Como:        usuario administrador o empleado autenticado
Quiero:      eliminar a un médico del sistema
Para:        dar de baja registros de personal que ya no labora en el centro

Prioridad:   Alta
Estimación:  M (Medium)
Dependencias: HU-02
Capa:        Frontend + Backend
```

##### Criterios de Aceptación — HU-04

**Happy Path: Eliminación exitosa de médico sin atención activa**
```gherkin
CRITERIO-4.1: Baja de médico sin turno activo
  Dado que:   el "Dr. Juan García" NO tiene un turno en estado "llamado" o "atendido" en este momento
  Cuando:     el usuario hace clic en el ícono de eliminación (basura) en la fila del médico
  Entonces:   aparece un modal de confirmación con el mensaje: "¿Desea eliminar al médico Dr. Juan García?"
  Y:          el modal muestra dos botones: "Cancelar" y "Aceptar"
  Y:          al hacer clic en "Aceptar", el médico se da de baja (eliminación lógica: estado "Inactivo")
  Y:          el médico desaparece de la tabla visible
  Y:          aparece un mensaje flotante "Médico eliminado exitosamente"
  Y:          la combinación consultorio/franja (si estaba asignada) queda libre para otros médicos
```

**Error Path: Bloqueo de eliminación por atención activa**
```gherkin
CRITERIO-4.2: Restricción de eliminación cuando hay turno en curso
  Dado que:   el "Dr. Juan García" tiene un turno activo (estado "atendido" o "llamado") en este momento
  Cuando:     el usuario intenta hacer clic en el ícono de eliminación
  Entonces:   se muestra un mensaje de error: "No se puede eliminar un médico con una atención en curso"
  Y:          el ícono de eliminación permanece visible pero deshabilitado (gris)
  Y:          ningún modal de confirmación se abre
```

**Happy Path: Cancelación de eliminación**
```gherkin
CRITERIO-4.3: Cancelación del proceso de eliminación
  Dado que:   el modal de confirmación de eliminación está abierto
  Cuando:     el usuario hace clic en "Cancelar"
  Entonces:   el modal se cierra
  Y:          el médico permanece activo en la tabla sin cambios
```

---

#### HU-05: Asignación automática de médico al turno (Fase Siguiente)

```
Como:        sistema del centro médico
Quiero:      que el sistema detecte al médico activo según la hora actual
Para:        asignar el consultorio al paciente de forma automática

Prioridad:   Media
Estimación:  L (Large)
Dependencias: HU-02 (médicos creados con horarios)
Capa:        Backend (Scheduler/Orchestrador)
Status:      FUERA DE ALCANCE — Fase siguiente
```

> **Nota:** HU-05 y HU-06 impactan directamente en el flow de Turnos y requieren coordinación con el RabbitMQ scheduler. Se documentan para contexto pero **se implementarán en una fase posterior** una vez que HU-01 a HU-04 sean estables.

---

#### HU-06: Ver médico y consultorio asignados en pantalla pública (Fase Siguiente)

```
Como:        paciente en sala de espera
Quiero:      ver el nombre del médico y consultorio en la pantalla pública
Para:        saber a dónde dirigirme cuando sea llamado

Prioridad:   Media
Estimación:  M (Medium)
Dependencias: HU-05
Capa:        Frontend (WebSocket + Display Público)
Status:      FUERA DE ALCANCE — Fase siguiente
```

> **Nota:** Requiere integración con WebSocket y realtime updates del turno. Se implementará tras validar HU-05.

---

### Reglas de Negocio

1. **Unicidad de Cédula:** Cada médico debe tener un número de cédula único dentro del sistema. Dos médicos no pueden compartir la misma cédula.

2. **Unicidad de Consultorio/Franja:** A un médico se le asigna como máximo una combinación única de Consultorio + Franja Horaria. Dos médicos activos no pueden ocupar la misma combinación simultáneamente.

3. **Franjas Horarias Fijas:** Solo existen dos franjas horarias permitidas:
   - Franja Mañana: 6:00 - 14:00
   - Franja Tarde: 14:00 - 22:00

4. **Prefijo "Dr." en UI:** El sistema almacena solo el nombre sin prefijo en BD, pero lo agrega automáticamente en la presentación (Nombre almacenado: "Juan García" → Mostrado: "Dr. Juan García").

5. **Campos Obligatorios:** 
   - Nombre completo: obligatorio, mínimo 3 caracteres
   - Cédula: obligatoria, 7-10 dígitos, solo números

6. **Campos Opcionales:** 
   - Consultorio: se puede dejar vacío
   - Franja Horaria: se puede dejar vacío, **pero si se asigna Consultorio, la Franja Horaria pasa a ser obligatoria**. No se puede guardar un médico con consultorio asignado y sin franja horaria.

7. **Bloqueo de Eliminación:** Un médico no puede eliminarse si tiene un turno en estado "llamado" o "atendido" en el momento de la solicitud de baja.

8. **Eliminación Lógica:** Los médicos eliminados no se borran de la BD, se marcan como "Inactivo" (soft delete). No aparecen en la UI pero permanecen en registros históricos.

9. **Auditoría de Cambios:** Todo create, update y delete debe registrar `created_at`, `updated_at` y `status` en la entidad.

10. **Control de Acceso:** Solo usuarios autenticados con roles "Empleado" o "Administrador" pueden acceder al módulo y realizar acciones.

---

## 2. DISEÑO

### Modelos de Datos

#### Entidades Afectadas

| Entidad | Almacén | Cambios | Descripción |
|---------|---------|---------|-------------|
| `Doctor` | colección `doctors` | **nueva** | Catálogo de médicos con disponibilidad |
| `Turno` | colección `turnos` | **modificada** | Se añade referencia opcional a médico asignado |

---

#### Doctor — Campos del Modelo

| Campo | Tipo | Obligatorio | Validación | Descripción |
|-------|------|-------------|------------|-------------|
| `_id` | ObjectId | sí | auto-generado | Identificador único MongoDB |
| `nombre` | string | sí | min 3, max 100 chars | Nombre sin prefijo "Dr." |
| `cedula` | string | sí | unique, 7-10 dígitos | Identificador nacional único |
| `consultorio` | string \| null | no | ref a consultorio (1-10) | Consultorio asignado, null si no asignado |
| `franjaHoraria` | enum ("06:00-14:00" \| "14:00-22:00") \| null | no | uno de dos valores | Franja asignada, null si no asignada |
| `status` | enum ("Activo" \| "Inactivo") | sí | default: "Activo" | Soft delete flag |
| `created_at` | ISODate | sí | auto | Timestamp creación UTC |
| `updated_at` | ISODate | sí | auto | Timestamp última actualización UTC |
| `created_by` | string | no | uid Firebase | Usuario que creó el registro |
| `updated_by` | string | no | uid Firebase | Usuario que modificó por última vez |

#### Índices / Constraints

- **Índice único en `cedula`:** Para searches rápidas y validación de duplicidad.
- **Índice en `consultorio` + `franjaHoraria`:** Para evitar asignaciones duplicadas (compound unique index).
- **Índice en `status`:** Para filtrar médicos activos sin table scan.
- **Índice en `created_at`:** Para ordenamientos by timestamp.

---

#### Turno — Cambios Requeridos

Se modifica la entidad Turno existente para incluir referencia al médico asignado:

| Campo | Tipo | Obligatorio | Cambio | Descripción |
|-------|------|-------------|--------|-------------|
| `medico_id` | ObjectId \| null | no | **NUEVA** | Referencia FK a Doctor._id (poblada por HU-05) |
| `medico_nombre` | string \| null | no | **NUEVA** | Copia desnormalizada de doctor.nombre (incluyendo "Dr." por Facade) |

> **Nota:** Estos campos permanecen `null` hasta que HU-05 sea implementada. Actualmente los turnos se crean sin médico asignado.

---

### API Endpoints

#### POST /api/v1/doctors
- **Descripción**: Crea un nuevo médico
- **Auth requerida**: sí (Bearer token Firebase)
- **Roles permitidos**: Empleado, Administrador
- **Request Body**:
  ```json
  {
    "nombre": "Juan García",
    "cedula": "12345678",
    "consultorio": "2",
    "franjaHoraria": "06:00-14:00"
  }
  ```
  - `nombre`: string, 3-100 chars, obligatorio
  - `cedula`: string, 7-10 dígitos, unique, obligatorio
  - `consultorio`: string | null, opcional
  - `franjaHoraria`: "06:00-14:00" | "14:00-22:00" | null, opcional
  
- **Response 201**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan García",
    "cedula": "12345678",
    "consultorio": "2",
    "franjaHoraria": "06:00-14:00",
    "status": "Activo",
    "created_at": "2026-04-06T10:30:00Z",
    "updated_at": "2026-04-06T10:30:00Z"
  }
  ```
- **Response 400**: campo obligatorio faltante, validación fallida (nombre < 3 chars, cédula inválida)
- **Response 401**: token ausente o expirado
- **Response 409**: cédula duplicada O combinación consultorio/franja ocupada
- **Response 403**: usuario sin permisos (no es Empleado/Administrador)

---

#### GET /api/v1/doctors
- **Descripción**: Lista todos los médicos activos (sin filtro de status por defecto)
- **Auth requerida**: sí
- **Roles permitidos**: Empleado, Administrador
- **Query Params**:
  - `status`: "Activo" | "Inactivo" | undefined (retorna solo Activos)
  - `consultorio`: string (buscar por consultorio específico)
  - `page`: number, default 1
  - `limit`: number, default 25
  
- **Response 200**:
  ```json
  {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan García",
        "cedula": "12345678",
        "consultorio": "2",
        "franjaHoraria": "06:00-14:00",
        "status": "Activo",
        "created_at": "2026-04-06T10:30:00Z",
        "updated_at": "2026-04-06T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 25
  }
  ```
- **Response 401**: sin autenticación

---

#### GET /api/v1/doctors/{doctor_id}
- **Descripción**: Obtiene un médico por ID
- **Auth requerida**: sí
- **Response 200**: objeto doctor completo
- **Response 404**: médico no encontrado
- **Response 401**: sin autenticación

---

#### PUT /api/v1/doctors/{doctor_id}
- **Descripción**: Actualiza un médico existente
- **Auth requerida**: sí
- **Roles permitidos**: Empleado, Administrador
- **Request Body** (todos campos opcionales):
  ```json
  {
    "nombre": "Juan Carlos García",
    "consultorio": "4",
    "franjaHoraria": "14:00-22:00"
  }
  ```
  - Cédula **no se puede actualizar** (inmutable por diseño)
  
- **Response 200**: médico actualizado
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Carlos García",
    "cedula": "12345678",
    "consultorio": "4",
    "franjaHoraria": "14:00-22:00",
    "status": "Activo",
    "updated_at": "2026-04-06T11:45:00Z"
  }
  ```
- **Response 400**: validación fallida
- **Response 404**: médico no encontrado
- **Response 409**: combinación consultorio/franja ya ocupada
- **Response 401**: sin autenticación

---

#### DELETE /api/v1/doctors/{doctor_id}
- **Descripción**: Elimina un médico (soft delete, marca como Inactivo)
- **Auth requerida**: sí
- **Roles permitidos**: Empleado, Administrador
- **Pre-validación**: 
  - Verifica que el médico NO tenga turnos activos (estado "llamado" o "atendido")
  - Si hay turno activo → responde 409 Conflict
  
- **Response 204**: eliminación exitosa, no retorna body
- **Response 404**: médico no encontrado
- **Response 409**: médico tiene atención en curso
  ```json
  {
    "error": "No se puede eliminar un médico con una atención en curso"
  }
  ```
- **Response 401**: sin autenticación

---

#### GET /api/v1/doctors/available-shifts
- **Descripción**: Lista las franjas disponibles para un consultorio específico (para el modal de creación/edición)
- **Auth requerida**: sí
- **Query Params**:
  - `consultorio`: string (obligatorio)
  - `exclude_doctor_id`: string | null (opcional, para excluir la franja actual del médico en edición)
  
- **Response 200**:
  ```json
  {
    "consultorio": "2",
    "available_shifts": ["06:00-14:00"],
    "occupied_shifts": ["14:00-22:00"]
  }
  ```
- **Response 400**: consultorio no especificado
- **Response 401**: sin autenticación

---

### Diseño Frontend

#### Componentes Nuevos

| Componente | Archivo | Props principales | Descripción |
|------------|---------|------------------|-------------|
| `DoctorsPage` | `app/doctors/page.tsx` | N/A | Página principal del módulo |
| `DoctorTable` | `components/DoctorTable/DoctorTable.tsx` | `doctors[]`, `onEdit()`, `onDelete()`, `loading`, `error` | Tabla de médicos con acciones |
| `DoctorFormModal` | `components/DoctorFormModal/DoctorFormModal.tsx` | `isOpen`, `onSubmit()`, `onClose()`, `initialData?`, `availableShifts[]` | Modal de crear/editar |
| `ConfirmDeleteModal` | `components/ConfirmDeleteModal/ConfirmDeleteModal.tsx` | `isOpen`, `doctorName`, `onConfirm()`, `onCancel()`, `loading` | Modal de confirmación de eliminación |
| `Toast/Notification` | `components/Toast/Toast.tsx` | `message`, `type` ("success" \| "error" \| "info"), `duration` | Notificaciones flotantes |

---

#### Páginas Nuevas

| Página | Archivo | Ruta | Protegida | Descripción |
|--------|---------|------|-----------|-------------|
| `DoctorsPage` | `app/doctors/page.tsx` | `/doctors` | sí (ProtectedRoute) | CRUD completo de médicos |

---

#### Hooks Nuevos

| Hook | Archivo | Retorna | Descripción |
|------|---------|---------|-------------|
| `useDoctors()` | `hooks/useDoctors.ts` | `{ doctors[], loading, error, create(), update(), delete(), refresh() }` | CRUD completo con estado |
| `useAvailableShifts()` | `hooks/useAvailableShifts.ts` | `{ shifts[], loading, error, fetchShifts(consultorio) }` | Manejo de franjas disponibles |
| `useToast()` | `hooks/useToast.ts` | `{ show(message, type, duration), hide() }` | Manejo de notificaciones |

---

#### Services (Llamadas API)

| Función | Archivo | Endpoint | Descripción |
|---------|---------|----------|-------------|
| `getAllDoctors(token, page?, limit?)` | `services/doctorService.ts` | `GET /api/v1/doctors` | Lista de médicos con paginación |
| `createDoctor(data, token)` | `services/doctorService.ts` | `POST /api/v1/doctors` | Crea médico |
| `updateDoctor(doctorId, data, token)` | `services/doctorService.ts` | `PUT /api/v1/doctors/{id}` | Actualiza médico |
| `deleteDoctor(doctorId, token)` | `services/doctorService.ts` | `DELETE /api/v1/doctors/{id}` | Elimina médico (soft delete) |
| `getAvailableShifts(consultorio, excludeDoctorId?, token)` | `services/doctorService.ts` | `GET /api/v1/doctors/available-shifts` | Franjas disponibles |

---

#### Actualización de Componentes Existentes

| Componente | Cambio | Descripción |
|-----------|--------|-------------|
| `Navbar` | Agregar botón "Gestión Médicos" | Visible solo para roles Empleado/Administrador |
| `App.tsx` | Registrar ruta `/doctors` | Proteger con ProtectedRoute |

---

### Arquitectura y Dependencias Backend

**Stack Backend:** NestJS + TypeScript + MongoDB + Mongoose

**Patrones Arquitectónicos a Aplicar:**
- **Clean Architecture / Hexagonal:** Separar domain, application, infrastructure
- **Adapter Pattern:** DoctorMongooseAdapter implementa puerto IDoctorRepository
- **Repository Pattern:** IDoctorRepository con métodos CRUD y validaciones
- **Observer Pattern:** Emitir eventos cuando se asigna/libera consultorio (para fase siguiente HU-05)
- **Facade Pattern:** Servicio DoctorService expone métodos simples al controller
- **Template Method:** Validaciones reutilizables en Create/Update
- **Command Pattern:** Operaciones de create/update/delete como comandos para auditoria

**Estructura NestJS esperada:**
```
backend/producer/src/
  doctors/
    domain/
      entities/
        doctor.entity.ts        ← Clase Doctor con lógica core
        doctor-shift.value-object.ts  ← Value Object para Franja
      ports/
        doctor.repository.ts    ← IDoctorRepository (interfaz)
        tokens.ts              ← DOCTOR_REPOSITORY_TOKEN
      events/
        doctor-created.event.ts  ← Evento de dominio
        doctor-assigned.event.ts ← Evento asignación (para HU-05)
    application/
      use-cases/
        create-doctor.use-case.ts
        update-doctor.use-case.ts
        delete-doctor.use-case.ts
        get-all-doctors.use-case.ts
        get-available-shifts.use-case.ts
    infrastructure/
      adapters/
        doctor-mongoose.adapter.ts  ← Implementa IDoctorRepository
      schemas/
        doctor.schema.ts        ← Mongoose schema + document
    presentation/
      controllers/
        doctor.controller.ts    ← Endpoints REST
      dtos/
        create-doctor.dto.ts
        update-doctor.dto.ts
        doctor.response.dto.ts
    doctors.module.ts          ← Module NestJS con wiring
```

**Paquetes requeridos:** Ninguno nuevo (NestJS, Mongoose, Firebase ya están)

**Impacto en punto de entrada:**
- Registrar `DoctorsModule` en `app.module.ts`
- Agregar controlador `/doctors` a Swagger/OpenAPI

---

### Arquitectura y Dependencias Frontend

**Stack Frontend:** Next.js 16 + React 19 + TypeScript + CSS Modules + Axios

**Estructura React/Next.js esperada:**
```
frontend/src/
  app/
    doctors/
      page.tsx                 ← Página /doctors (ProtectedRoute)
  components/
    DoctorTable/
      DoctorTable.tsx
      DoctorTable.module.css
    DoctorFormModal/
      DoctorFormModal.tsx
      DoctorFormModal.module.css
    ConfirmDeleteModal/
      ConfirmDeleteModal.tsx
      ConfirmDeleteModal.module.css
    Toast/                     ← Si no existe aún
      Toast.tsx
      Toast.module.css
  hooks/
    useDoctors.ts             ← Custom hook con lógica CRUD
    useAvailableShifts.ts
    useToast.ts               ← Para notificaciones globales
  services/
    doctorService.ts          ← Axios calls
  domain/
    Doctor.ts                 ← Tipo/Interfaz TypeScript
```

**CSS Modules Obligatorio:** Cada componente tiene su `.module.css` (NUNCA Tailwind, NUNCA CSS global)

**Impacto en punto de entrada:**
- Registrar ruta `/doctors` en `app/(authenticated)/layout.tsx` o similar
- Actualizar `Navbar.tsx` para incluir botón "Gestión Médicos"

---

### Notas de Implementación

1. **Transiciones y Debounce:** 
   - Modal de edición: debounce en validación de cédula (200ms) para no saturar el backend con búsquedas
   - Botones: deshabilitados durante request para evitar double-clicks

2. **Manejo de Errores Backend:**
   - 409 Conflict para cédula duplicada y franja ocupada (el frontend mora estos y muestra mensajes amigables)
   - 400 Bad Request para validaciones de formato (el frontend previene esto con validaciones locales)
   - 403 Forbidden para falta de permisos (verificar roles en backend)

3. **Soft Delete:**
   - Los médicos eliminados se marcan con `status: "Inactivo"` en BD
   - Las queries por defecto filtran solo `status: "Activo"` (excepto en búsqueda histórica)
   - El endpoint DELETE no borra, solo cambia status

4. **Disponibilidad de Franjas:**
   - Tabla de referencia en app config: `FRANJAS_HORARIAS = ["06:00-14:00", "14:00-22:00"]`
   - Tabla de referencia: `CONSULTORIOS = ["1", "2", "3", ...]` (validar rango permitido)
   - Endpoint `GET /available-shifts` es call ante cada apertura de modal para accuracy

5. **Previsiones Futuras (HU-05, HU-06):**
   - Estructura de Doctor ya incluye `created_at`, `updated_at` para auditoría y eventos
   - Evento `DoctorAssigned` (cuando se asigna turno en HU-05) será emitido y escuchado por RabbitMQ Scheduler
   - WebSocket gateway ya existe (`turnos.gateway.ts`), se extenderá para doctors

6. **Testing:**
   - Usar Swagger/OpenAPI generados por NestJS para validar endpoints
   - Mock de `getDoctors()` en tests frontend con datos realistas
   - Considerar tests E2E con Cypress/Playwright para flujos críticos (crear → editar → eliminar)

---

## 3. LISTA DE TAREAS

> Checklist accionable para todos los agentes. Marcar cada ítem (`[x]`) al completarlo.
> El Orchestrator monitorea este checklist para determinar el progreso.

### Backend — Implementación

- [x] Crear entidad `Doctor` en `domain/entities/doctor.entity.ts` con propiedades y métodos core
- [ ] Crear Value Object `DoctorShift` para franjas horarias (`06:00-14:00`, `14:00-22:00`)
- [x] Crear interfaz `IDoctorRepository` en `domain/ports/doctor.repository.ts`
- [x] Crear token de inyección `DOCTOR_REPOSITORY_TOKEN` en `domain/ports/tokens.ts`
`DoctorUpdatedEvent`, `DoctorDeletedEvent`
- [x] Crear schema Mongoose `DoctorSchema` en `infrastructure/schemas/doctor.schema.ts` con índices (único en cedula, único en consultorio+franja, índice en status)
- [x] Crear adapter `DoctorMongooseAdapter` en `infrastructure/adapters/doctor-mongoose.adapter.ts` implementando `IDoctorRepository`
- [x] Crear DTOs en `presentation/dtos/`: `CreateDoctorDto`, `UpdateDoctorDto`, `DoctorResponseDto`
- [x] Crear use-cases:
  - [x] `CreateDoctorUseCase` — validar unicidad cedula / consultorio+franja, persistir
  - [x] `UpdateDoctorUseCase` — validar opciones, evitar cambios de cedula, liberar franja anterior
  - [x] `DeleteDoctorUseCase` — verificar sin turnos activos, soft delete
  - [x] `GetAllDoctorsUseCase` — listar activos con paginación
  - [x] `GetAvailableShiftsUseCase` — retornar franjas libres por consultorio
- [x] Crear controller REST `DoctorController` en `presentation/controllers/doctor.controller.ts` con endpoints:
  - [x] `POST /api/v1/doctors` — create
  - [x] `GET /api/v1/doctors` — list con paginación
  - [x] `GET /api/v1/doctors/{id}` — detail
  - [x] `PUT /api/v1/doctors/{id}` — update
  - [x] `DELETE /api/v1/doctors/{id}` — soft delete
  - [x] `GET /api/v1/doctors/available-shifts` — franjas libres
- [x] Crear módulo NestJS `DoctorsModule` en `doctors/doctors.module.ts` con wiring:
  - [x] Importar `MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }])`
  - [x] Registrar adapter con token de inyección
  - [x] Registrar use-cases
  - [x] Registrar controller
  - [x] Exportar `DOCTOR_REPOSITORY_TOKEN` para tests
- [x] Registrar `DoctorsModule` en `app.module.ts`
- [x] Agregar tag "Doctors" en Swagger de `main.ts`
- [x] Validar que todos los endpoints aparecen en OpenAPI

### Backend — Validaciones y Reglas

- [x] Validación de nombre: mínimo 3 caracteres, máximo 100, obligatorio
- [x] Validación de cédula: solo números, 7-10 dígitos, obligatoria, única
- [x] Validación de franjaHoraria: solo valores "06:00-14:00" o "14:00-22:00"
- [x] Validación de consultorio: puede ser null, pero si se asigna franja debe ser válida
- [x] Validación cruzada: si se asigna consultorio, la franja horaria es obligatoria (400 si consultorio presente y franja ausente)
- [x] Verificación de disponibilidad: consultorio + franja no está asignado a otro médico activo
- [x] Verificación de bloqueo de delete: médico sin turnos en estado "llamado" o "atendido"
- [x] Validación de rol de usuario: solo Empleado/Administrador pueden CRUD doctors
- [x] Auditoría: `created_at`, `updated_at`, `created_by`, `updated_by` se registran automáticamente

### Backend — Tests

- [x] `test_doctor_entity_creation_with_complete_data` — entity instancia correctamente
- [x] `test_doctor_entity_creation_with_minimal_data` — entity instancia sin consultorio/franja
- [x] `test_create_doctor_use_case_success` — happy path creación
- [x] `test_create_doctor_use_case_cedula_duplicate_throws_conflict` — cedula duplicada
- [x] `test_create_doctor_use_case_shift_occupied_throws_conflict` — franja ocupada
- [x] `test_create_doctor_use_case_invalid_name_throws_validation_error` — nombre < 3 chars
- [x] `test_create_doctor_use_case_invalid_cedula_throws_validation_error` — cedula inválida
- [x] `test_update_doctor_use_case_changes_shift` — libera franja anterior
- [x] `test_update_doctor_use_case_cedula_immutable` — no actualiza cedula
- [x] `test_delete_doctor_use_case_success_no_active_turnos` — soft delete exitoso
- [x] `test_delete_doctor_use_case_blocked_active_turno` — bloqueo por turno activo
- [x] `test_doctor_mongoose_adapter_insert_creates_document` — adapter persiste
- [x] `test_doctor_mongoose_adapter_find_by_cedula_returns_doctor` — búsqueda por cedula
- [x] `test_doctor_mongoose_adapter_find_available_shifts` — franjas libres
- [x] `test_doctor_controller_post_returns_201` — endpoint crea y retorna 201
- [x] `test_doctor_controller_post_returns_409_duplicate_cedula` — conflicto cedula
- [x] `test_doctor_controller_post_returns_401_no_token` — sin autenticación
- [x] `test_doctor_controller_get_returns_200` — listado retorna 200
- [x] `test_doctor_controller_delete_returns_204` — eliminación retorna 204
- [x] `test_doctor_controller_delete_returns_409_active_turno` — bloqueo activo

### Frontend — Página y Componentes

- [x] Crear `DoctorsPage` (app/doctors/page.tsx) con ProtectedRoute
- [x] Crear `DoctorTable` componente que:
  - [x] Renderiza tabla con columnas: Nombre (Dr. Nombre), Cédula, Consultorio, Franja, Acciones
  - [x] Muestra "No hay médicos creados" cuando lista vacía
  - [x] Tiene ícono de edición (lápiz) en cada fila
  - [x] Tiene ícono de eliminación (basura) en cada fila
  - [x] State loading/error con skeleton o spinner
  - [x] Botón "Crear médico" en superior derecha
- [x] Crear `DoctorFormModal` que:
  - [x] Modo create: campos vacíos, botones "Cerrar" y "Guardar"
  - [x] Modo edit: campos precargados con datos del médico, mismos botones
  - [x] Campo nombre: validación mín. 3 caracteres en tiempo real, mensaje de error
  - [x] Campo cédula: acepta solo números 7-10 dígitos, validación en tiempo real
  - [x] Desplegable consultorio: solo consultorios válidos
  - [x] Desplegable franja: solo franjas libres para el consultorio seleccionado (fetch en tiempo real)
  - [x] Si consultorio sin franjas libres: desactiva desplegable y muestra mensaje
  - [x] Botón "Guardar" deshabilitado hasta que datos sean válidos
  - [x] Manejo de loading durante request (spinner en botón)
  - [x] Cierre del modal con "Cerrar" sin guardar
  - [x] Prevención de cierre accidental (clic fuera NO cierra, Escape NO cierra)
- [x] Crear `ConfirmDeleteModal` que:
  - [x] Muestra nombre del médico: "¿Desea eliminar al médico Dr. {nombre}?"
  - [x] Botones "Cancelar" y "Aceptar"
  - [x] "Aceptar" dispara eliminación, muestra spinner
  - [x] "Cancelar" cierra modal sin eliminar
- [x] Crear/actualizar `Toast/Notification` componente para mensajes flotantes:
  - [x] Soporta tipos: success, error, info
  - [x] Auto-desaparece tras duración especificada (default 5s)
  - [x] Puede ser cerrado manualmente
- [x] Actualizar `Navbar.tsx`:
  - [x] Agregar botón "Gestión Médicos"
  - [x] Visible solo para usuarios autenticados
  - [x] Navega a `/doctors`
  - [x] Posicionado en barra de navegación principal
- [x] Actualizar `App.tsx` o router config:
  - [x] Registrar ruta `/doctors` → `<ProtectedRoute><DoctorsPage /></ProtectedRoute>`

### Frontend — Lógica (Hooks y Services)

- [x] Crear `services/doctorService.ts` con funciones:
  - [x] `getAllDoctors(token, page?, limit?)` — GET /api/v1/doctors
  - [x] `createDoctor(data, token)` — POST /api/v1/doctors
  - [x] `updateDoctor(doctorId, data, token)` — PUT /api/v1/doctors/{id}
  - [x] `deleteDoctor(doctorId, token)` — DELETE /api/v1/doctors/{id}
  - [x] `getAvailableShifts(consultorio, excludeDoctorId?, token)` — GET /api/v1/doctors/available-shifts
  - [x] Manejo de errores: lanzar excepciones descriptivas
  - [x] Headers: `Authorization: Bearer {token}`
- [x] Crear `hooks/useDoctors.ts` que:
  - [x] Estado: `doctors[]`, `loading`, `error`
  - [x] Métodos: `create()`, `update()`, `delete()`, `refresh()`
  - [x] useEffect en mount: carga doctors del backend
  - [x] Consume token desde `useAuth()`
  - [x] Manejo de errores: guarda en state, no lanza
  - [ ] Paginación opcional (page, limit)
- [x] Crear `hooks/useAvailableShifts.ts` que:
  - [x] Estado: `shifts[]`, `loading`, `error`
  - [x] Método: `fetchShifts(consultorio, excludeDoctorId?)`
  - [x] Cachés resultados si consultorio igual (prevé calls innecesarias)
  - [x] Retorna franjas disponibles como array
- [x] Crear `domain/Doctor.ts` (TypeScript interface/tipo):
  - [x] `_id: string`
  - [x] `nombre: string`
  - [x] `cedula: string`
  - [x] `consultorio: string | null`
  - [x] `franjaHoraria: "06:00-14:00" | "14:00-22:00" | null`
  - [x] `status: "Activo" | "Inactivo"`
  - [x] `created_at: string (ISO)`
  - [x] `updated_at: string (ISO)`

### Frontend — Tests

- [x] `test_DoctorTable_renders_list_correctly` — tabla renderiza médicos
- [x] `test_DoctorTable_shows_empty_message` — tabla vacía muestra "No hay..."
- [x] `test_DoctorTable_edit_icon_opens_modal` — ícono edición abre modal
- [x] `test_DoctorTable_delete_icon_opens_confirm_modal` — ícono eliminación abre confirm
- [x] `test_DoctorFormModal_mode_create_shows_empty_fields` — modal create campos vacíos
- [x] `test_DoctorFormModal_mode_edit_loads_data` — modal edit precarga datos
- [x] `test_DoctorFormModal_cedula_field_only_accepts_numbers` — validación cedula
- [x] `test_DoctorFormModal_nombre_field_min_3_chars` — validación nombre
- [x] `test_DoctorFormModal_submit_success_shows_toast` — submit exitoso muestra toast
- [x] `test_DoctorFormModal_submit_error_shows_error_message` — error muestra mensaje
- [x] `test_DoctorFormModal_close_without_save` — cerrar sin guardar
- [x] `test_ConfirmDeleteModal_confirm_deletes_doctor` — confirmar elimina
- [x] `test_ConfirmDeleteModal_cancel_closes_modal` — cancelar cierra
- [x] `test_Navbar_button_visible_when_authenticated` — botón visible autenticado
- [x] `test_Navbar_button_hidden_when_not_authenticated` — botón oculto no autenticado
- [x] `test_Navbar_button_navigates_to_doctors_page` — botón navega a /doctors
- [x] `test_useDoctors_hook_loads_data_on_mount` — hook carga doctors
- [x] `test_useDoctors_hook_create_sends_post_request` — hook crea
- [x] `test_useDoctors_hook_update_sends_put_request` — hook actualiza
- [x] `test_useDoctors_hook_delete_sends_delete_request` — hook elimina

### Documentación

- [ ] Actualizar `README.md` del proyecto:
  - [ ] Agregar sección "Módulo de Gestión de Médicos" con descripción
  - [ ] Listar endpoints en API
  - [ ] Indicar rutas frontend disponibles
- [ ] Comentarios JSDoc en código:
  - [ ] Entity Doctor
  - [ ] Use-cases
  - [ ] DTOs
  - [ ] Componentes React principales
- [ ] (Opcional) Crear ADR (Architecture Decision Record) si hay decisiones significativas
  - [ ] Soft delete vs hard delete decisión
  - [ ] Franja como Value Object vs simple string

### Orchestration & Status

- [ ] Revisar todos los checkboxes de implementación
- [ ] Confirmar que tests pasan (backend 100%, frontend 100%)
- [ ] Validar que Swagger/OpenAPI documenta todos los endpoints
- [ ] Ejecutar cobertura de código (target: >80%)
- [ ] **Actualizar `status` de spec a `APPROVED`** una vez completada la fase de implementación y verificación
- [ ] Coordinar con Backend Developer, Frontend Developer y QA para comenzar Fase 2 (Implementación paralela)
