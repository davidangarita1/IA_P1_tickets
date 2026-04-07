# Plan de Pruebas — Módulo de Gestión de Médicos

**Proyecto:** Sistema de turnos EPS  
**Módulo:** Gestión de Médicos y Consultorios  
**Responsables:** David Angarita
**Fecha:** 2026-04-05  
**Versión:** 1.0

---

## 1. OBJETIVO

Validar que el módulo de Gestión de Médicos permite a usuarios autenticados (Empleado/Administrador) crear, editar y dar de baja médicos con sus consultorios y franjas horarias, garantizando la unicidad de la combinación consultorio/franja, las validaciones de formulario, la eliminación lógica y el control de acceso al módulo.

---

## 2. DESCRIPCIÓN

El módulo agrega una pantalla "Gestión de Médicos" accesible desde la barra de navegación para usuarios autenticados. Permite:

- **Crear** médicos con nombre completo y cédula única; opcionalmente asignar consultorio y franja horaria (6:00-14:00 o 14:00-22:00). El prefijo "Dr." se añade automáticamente solo en la UI.
- **Editar** datos de un médico existente mediante un modal prellenado, con validaciones en tiempo real.
- **Dar de baja** (eliminación lógica) a un médico que no tenga un turno en curso, previa confirmación.

El sistema garantiza que ninguna combinación consultorio/franja quede asignada a dos médicos a la vez.

---

## 3. ALCANCE DE LAS PRUEBAS

### 3.1 Procesos bajo prueba

| Proceso | Objetivo de validación |
| :--- | :--- |
| Acceso al módulo (HU-01) | Confirmar que el botón "Gestión Médicos" aparece solo para usuarios autenticados y que la pantalla muestra la tabla con encabezados correctos |
| Creación de médico (HU-02) | Confirmar que el modal de creación valida campos, gestiona la unicidad de cédula y la disponibilidad de consultorios/franjas, y persiste el médico correctamente |
| Edición de médico (HU-03) | Confirmar que el modal de edición carga datos existentes, aplica las mismas validaciones que la creación, y actualiza la tabla sin recargar la página |
| Baja de médico (HU-04) | Confirmar que la eliminación lógica funciona con modal de confirmación, libera la combinación consultorio/franja y bloquea la baja cuando hay turno en curso |

### 3.2 Fuera de alcance

- Gestión de especialidades médicas, agenda de citas y múltiples sedes.
- Franja horaria de descanso para médicos y consultorios.
- Creación y autenticación de pacientes (cubierto en TEST_PLAN.md principal).
- Asignación automática de turnos a médicos.
- Actualización en tiempo real de la pantalla pública del paciente con nombre del médico y consultorio.
- Almacenamiento del nombre del médico en el registro del turno.
- Pruebas de rendimiento, carga o estrés.
- Validación comparativa en múltiples navegadores o dispositivos reales.

---

## 4. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN

| Historia de Usuario | Criterios de Aceptación |
| :--- | :--- |
| **HU-01** — Acceso y visualización inicial del módulo | - Botón "Gestión Médicos" visible para usuarios autenticados<br>- Botón oculto para usuarios no autenticados<br>- Al hacer clic se muestra la pantalla con título centrado, tabla con encabezados y botón "Crear médico"<br>- Tabla vacía muestra mensaje "No hay médicos creados" |
| **HU-02** — Crear un nuevo médico | - Modal con campos: nombre completo, cédula, consultorio (opcional), franja horaria (opcional)<br>- Prefijo "Dr." agregado automáticamente solo en UI<br>- Validación de nombre (obligatorio, mín. 3 caracteres)<br>- Validación de cédula (solo números, 7-10 dígitos, obligatorio, único)<br>- Solo franjas libres por consultorio en el desplegable<br>- Consultorio con franjas llenas deshabilita el desplegable<br>- Mensaje de éxito flotante por 5 segundos |
| **HU-03** — Editar un médico creado | - Ícono de lápiz en cada fila de la tabla<br>- Modal prellenado con datos actuales del médico<br>- Mismas validaciones de nombre y cédula que en creación<br>- Validación de cédula duplicada en tiempo real<br>- Prevención de cierre accidental (clic fuera / Escape no cierra)<br>- Tabla se actualiza sin recargar la página<br>- Combinación anterior se libera al cambiar consultorio/franja |
| **HU-04** — Dar de baja a un médico | - Ícono de baja en cada fila, junto al de edición<br>- Modal de confirmación con botones "Cancelar" y "Aceptar"<br>- Eliminación lógica (estado "Inactivo"), médico desaparece de la tabla<br>- Bloqueo de baja si el médico tiene turno en curso<br>- Mensaje de éxito flotante al confirmar |

---

## 5. DISEÑO DE CASOS DE PRUEBA

### Suite 1 — Acceso y visualización del módulo (HU-01)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-GM-01 | Botón "Gestión Médicos" visible para usuario autenticado | Usuario Empleado/Administrador autenticado | Acceder a cualquier pantalla | El botón "Gestión Médicos" aparece en la barra de navegación |
| TC-GM-02 | Botón "Gestión Médicos" oculto para usuario no autenticado | Sin sesión activa | Visualizar la barra de navegación | El botón "Gestión Médicos" no es visible |
| TC-GM-03 | La pantalla del módulo muestra estructura correcta | Usuario autenticado | Hacer clic en "Gestión Médicos" | Se muestra el título "Gestión de Médicos", tabla con encabezados (Nombre completo, Consultorio, Franja Horaria, Acciones) y botón "Crear médico" |
| TC-GM-04 | Tabla vacía muestra mensaje informativo | Sin médicos registrados | Acceder al módulo | La tabla muestra "No hay médicos creados" en el centro |

### Suite 2 — Creación de médico (HU-02)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-CM-01 | Abrir modal de creación | Usuario en módulo de gestión | Clic en "Crear médico" | Modal con campos nombre, cédula, consultorio, franja y botones "Cerrar" / "Guardar" |
| TC-CM-02 | Cerrar modal sin guardar | Modal de creación abierto | Clic en "Cerrar" | Modal se cierra, tabla sin cambios |
| TC-CM-03 | Crear médico con consultorio y franja | Modal abierto, datos válidos | Completar nombre "Juan García", cédula "12345678", consultorio "2", franja "6:00 - 14:00", clic en "Guardar" | Modal se cierra, mensaje exitoso por 5s, médico "Dr. Juan García" aparece en la tabla con consultorio y franja |
| TC-CM-04 | Crear médico sin consultorio ni franja | Modal abierto, datos válidos | Completar nombre "Jose Martínez", cédula "87654321", dejar vacíos consultorio y franja, "Guardar" | Médico aparece con "Sin asignar" en consultorio y franja |
| TC-CM-05 | Prefijo "Dr." se agrega solo en la UI | Modal abierto | Ingresar "Juan García" en nombre y guardar | Tabla muestra "Dr. Juan García"; en BD se almacena "Juan García" |
| TC-CM-06 | Solo franjas libres en el desplegable | Consultorio "1" tiene franja "6:00 - 14:00" ocupada | Seleccionar consultorio "1" | Desplegable muestra solo "14:00 - 22:00" |
| TC-CM-07 | Consultorio con todas las franjas ocupadas | Consultorio "3" tiene ambas franjas asignadas | Seleccionar consultorio "3" | Desplegable deshabilitado, mensaje "No hay franjas disponibles para este consultorio", botón "Guardar" deshabilitado |
| TC-CM-08 | Cédula rechaza letras y valida longitud | Modal abierto | Escribir "ABC123" en cédula | Campo muestra solo "123"; mensaje "La cédula debe tener entre 7 y 10 números"; "Guardar" deshabilitado |
| TC-CM-09 | Cédula vacía impide guardar | Modal abierto | Hacer foco en cédula y salir sin escribir | Mensaje "El número de cédula es obligatorio"; "Guardar" deshabilitado |
| TC-CM-10 | Nombre vacío impide guardar | Modal abierto | Hacer foco en nombre y salir sin escribir | Mensaje "El nombre completo es obligatorio"; "Guardar" deshabilitado |
| TC-CM-11 | Nombre con menos de 3 caracteres impide guardar | Modal abierto | Escribir "Ju" en nombre | Mensaje "El nombre completo debe tener al menos 3 caracteres"; "Guardar" deshabilitado |
| TC-CM-12 | Cédula duplicada muestra alerta | Existe médico con cédula "12345678" | Escribir "12345678" en cédula, nombre "Pedro", clic en "Guardar" | Mensaje flotante "Ya existe un médico registrado con ese número de cédula"; modal permanece abierto |
| TC-CM-13 | Consultorio sin franja horaria impide guardar | Modal abierto | Seleccionar consultorio "2", dejar franja sin seleccionar | Mensaje "La franja horaria es obligatoria cuando se asigna un consultorio"; "Guardar" deshabilitado |

### Suite 3 — Edición de médico (HU-03)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-EM-01 | Ícono de lápiz visible en cada fila | Existen médicos creados | Consultar la tabla | Cada fila muestra ícono de lápiz en la columna "Acciones" |
| TC-EM-02 | Modal de edición carga datos del médico | Médico "Dr. Juan García" con consultorio "2", franja "6:00 - 14:00" | Clic en ícono de lápiz de la fila | Modal muestra nombre "Juan García", cédula "12345678", consultorio "2", franja "6:00 - 14:00" precargados |
| TC-EM-03 | Guardar cambios de consultorio y franja | Modal de edición abierto | Cambiar consultorio a "4", franja a "14:00 - 22:00", clic en "Guardar" | Modal se cierra, tabla refleja los nuevos valores, combinación anterior queda libre, mensaje exitoso por 3s |
| TC-EM-04 | Cerrar modal sin guardar conserva datos | Modal de edición con cambios | Clic en "Cerrar" o ícono "X" | Modal se cierra, datos del médico sin cambios en la tabla |
| TC-EM-05 | Clic fuera del modal no lo cierra | Modal de edición abierto | Clic fuera del área del modal | Modal permanece abierto |
| TC-EM-06 | Tecla Escape no cierra el modal | Modal de edición abierto | Presionar tecla Escape | Modal permanece abierto |
| TC-EM-07 | Nombre vacío o menor a 3 caracteres impide guardar | Modal con datos del médico | Borrar nombre o reducirlo a menos de 3 caracteres | "Guardar" deshabilitado, mensaje de validación en rojo |
| TC-EM-08 | Cédula vacía impide guardar | Modal con datos del médico | Borrar contenido de cédula | "Guardar" deshabilitado, mensaje "El número de cédula es obligatorio" en rojo |
| TC-EM-09 | Cédula duplicada en edición muestra alerta | Otro médico con cédula "99999999" | Cambiar cédula a "99999999" y perder foco o intentar guardar | "Guardar" deshabilitado, mensaje flotante rojo "Ya existe un médico registrado con ese número de cédula", modal abierto |
| TC-EM-10 | Franja horaria se precarga correctamente en modal de edición | Médico con consultorio "2" y franja "06:00-14:00" | Clic en ícono de lápiz | El desplegable de franja muestra "06:00-14:00" seleccionada y las franjas disponibles del consultorio |
| TC-EM-11 | Guardar edición envía el ID correcto del médico (regresión: CastError undefined) | Médico existente con _id válido | Abrir modal de edición, modificar nombre, clic en "Guardar" | PUT /api/v1/doctors/:id se ejecuta con el ID real del médico (no "undefined"), respuesta 200 |
| TC-EM-12 | La entidad Doctor incluye _id en serialización JSON (regresión) | Médico creado en BD | GET /api/v1/doctors | Cada objeto doctor en la respuesta contiene la propiedad `_id` con su ID.

### Suite 4 — Baja de médico (HU-04)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-BM-01 | Ícono de baja visible en cada fila | Existen médicos activos | Consultar la tabla | Cada fila muestra ícono de baja junto al ícono de edición |
| TC-BM-02 | Modal de confirmación al hacer clic en baja | Médico "Dr. Juan García" activo | Clic en ícono de baja | Modal muestra "¿Está seguro de que desea dar de baja al Dr. Juan García? Esta acción lo eliminará de la lista de médicos activos." con botones "Cancelar" y "Aceptar" |
| TC-BM-03 | Cancelar la baja cierra modal sin cambios | Modal de confirmación abierto | Clic en "Cancelar" | Modal se cierra, médico permanece en la tabla |
| TC-BM-04 | Confirmar baja lógica | Modal de confirmación abierto | Clic en "Aceptar" | Modal se cierra, médico desaparece de la tabla, estado cambia a "Inactivo" en BD, mensaje "Médico dado de baja exitosamente" |
| TC-BM-05 | Bloqueo de baja con turno en curso | Médico con turno en ejecución en este momento | Clic en ícono de baja | Mensaje flotante de alerta "No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento.", modal no se abre |

### Suite 5 — Escenarios de aceptación (Gherkin declarativo)

```gherkin
Feature: Gestión de Médicos

  # --- Acceso al módulo ---

  Scenario: Botón visible para usuario autenticado
    Given el usuario "Empleado/Administrador" está autenticado
    When accede a cualquier pantalla del sistema
    Then la barra de navegación muestra el botón "Gestión Médicos"

  Scenario: Botón oculto para usuario no autenticado
    Given no hay ningún usuario autenticado
    When se visualiza la barra de navegación
    Then el botón "Gestión Médicos" no es visible

  # --- Creación de médico ---

  Scenario: Crear médico con consultorio y franja horaria
    Given el usuario "Empleado/Administrador" abre el modal de creación
    And el campo "Nombre completo" contiene "Juan García"
    And el campo "Número de cédula" contiene "12345678"
    And selecciona Consultorio "2" y Franja horaria "6:00 - 14:00"
    When hace clic en "Guardar"
    Then el modal se cierra
    And aparece el mensaje flotante "Médico guardado exitosamente"
    And la tabla muestra "Dr. Juan García" con Consultorio "2" y Franja "6:00 - 14:00"
    And la combinación "Consultorio 2 / 6:00 - 14:00" deja de estar disponible

  Scenario: Crear médico sin consultorio ni franja
    Given el usuario "Empleado/Administrador" abre el modal de creación
    And ingresa nombre "Jose Martínez" y cédula "87654321"
    And deja vacíos Consultorio y Franja horaria
    When hace clic en "Guardar"
    Then la tabla muestra "Dr. Jose Martínez" con "Sin asignar" en consultorio y franja

  Scenario: Rechazar creación con cédula duplicada
    Given existe un médico con cédula "12345678"
    And el usuario abre el modal de creación
    When ingresa nombre "Pedro" y cédula "12345678" y hace clic en "Guardar"
    Then aparece alerta "Ya existe un médico registrado con ese número de cédula"
    And el modal permanece abierto

  Scenario: Rechazar creación con nombre inferior a 3 caracteres
    Given el usuario abre el modal de creación
    When ingresa "Ju" en el campo "Nombre completo"
    Then aparece el mensaje "El nombre completo debe tener al menos 3 caracteres"
    And el botón "Guardar" permanece deshabilitado

  Scenario: Solo franjas libres disponibles por consultorio
    Given la franja "6:00 - 14:00" del Consultorio "1" ya está asignada
    And el usuario abre el modal de creación
    When selecciona Consultorio "1"
    Then el desplegable de franjas muestra solo "14:00 - 22:00"

  Scenario: Consultorio seleccionado sin franja horaria impide guardar
    Given el usuario abre el modal de creación
    And el campo "Nombre completo" contiene "Juan García" y el campo "Número de cédula" contiene "12345678"
    When selecciona Consultorio "2" y no selecciona ninguna franja horaria
    Then el botón "Guardar" permanece deshabilitado
    And aparece el mensaje "La franja horaria es obligatoria cuando se asigna un consultorio"

  # --- Edición de médico ---

  Scenario: Editar consultorio y franja de un médico
    Given el "Dr. Juan García" tiene Consultorio "2" y Franja "6:00 - 14:00"
    And el usuario abre el modal de edición del "Dr. Juan García"
    When cambia Consultorio a "4" y Franja horaria a "14:00 - 22:00" y hace clic en "Guardar"
    Then la tabla muestra Consultorio "4" y Franja "14:00 - 22:00" para "Dr. Juan García"
    And la combinación "Consultorio 2 / 6:00 - 14:00" queda disponible

  Scenario: Prevención de cierre accidental del modal de edición
    Given el modal de edición está abierto
    When el usuario hace clic fuera del modal o presiona Escape
    Then el modal permanece abierto

  Scenario: Franja horaria se precarga en el modal de edición
    Given el "Dr. Juan García" tiene Consultorio "2" y Franja "6:00 - 14:00"
    And el usuario abre el modal de edición del "Dr. Juan García"
    Then el desplegable de franja muestra "6:00 - 14:00" seleccionada
    And las franjas disponibles del Consultorio "2" aparecen en el desplegable

  Scenario: Guardar edición envía el ID correcto del médico (regresión)
    Given el usuario abre el modal de edición del "Dr. Juan García"
    When modifica el nombre a "Juan Pedro García" y hace clic en "Guardar"
    Then la solicitud PUT se envía a /api/v1/doctors/:id con el ID real del médico
    And la tabla refleja el nombre actualizado

  # --- Baja de médico ---

  Scenario: Confirmar baja lógica de un médico
    Given el modal de confirmación está abierto para "Dr. Juan García"
    When el usuario hace clic en "Aceptar"
    Then el médico desaparece de la tabla de médicos activos
    And aparece el mensaje "Médico dado de baja exitosamente"

  Scenario: Bloquear baja de médico con turno en curso
    Given el "Dr. Juan García" tiene un turno en ejecución en este momento
    When el usuario hace clic en el ícono de dar de baja
    Then aparece alerta "No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento."
    And el modal de confirmación no se abre
```

---

## 6. ESTRATEGIA DE PRUEBAS

### 6.1 Niveles de prueba

**Pruebas funcionales de interfaz**  
Verifican el comportamiento visible para el usuario en la pantalla del módulo: apertura de modales, validaciones de formulario, mensajes flotantes, actualización de la tabla sin recarga y control de disponibilidad de franjas.

**Pruebas de integración funcional**  
Verifican que las solicitudes entre el frontend y el backend (crear, editar, dar de baja un médico) persistan correctamente en la base de datos y que la unicidad de combinación consultorio/franja se garantice a nivel de servicio.

**Pruebas de aceptación del negocio**  
Verifican escenarios completos en lenguaje Gherkin, enfocados en el resultado esperado desde la perspectiva del usuario.

### 6.2 Técnicas aplicadas

| Técnica | Aplicación en el módulo |
| :--- | :--- |
| Partición de equivalencia | Separar datos válidos e inválidos para nombre completo (vacío, <3 chars, válido) y cédula (no numérica, fuera de rango, válida, duplicada) |
| Análisis de valores límite | Validar nombre con 2 y 3 caracteres; cédula con 6, 7, 10 y 11 dígitos |
| Tabla de decisiones | Cubrir combinaciones de consultorio/franja: ambas libres, una ocupada, ambas ocupadas |
| Validación de consistencia | Comprobar que el prefijo "Dr." aparece solo en la UI y no se almacena en BD; que la combinación se libera al editar o dar de baja |
| Escenarios de negocio | Flujos completos de creación, edición y baja descritos en Gherkin |

### 6.3 Estrategia de datos de prueba

| Dato | Valores válidos | Valores inválidos |
| :--- | :--- | :--- |
| Nombre completo | "Juan García" (11 chars), "Ana" (3 chars) | "" (vacío), "Ju" (2 chars) |
| Número de cédula | "1234567" (7 dígitos), "1234567890" (10 dígitos) | "" (vacío), "123456" (6 dígitos), "12345678901" (11 dígitos), "ABC123" (letras), cédula duplicada |
| Consultorio | "1", "2", "3", "4" (selección del desplegable) | Consultorio con todas las franjas ocupadas |
| Franja horaria | "6:00 - 14:00", "14:00 - 22:00" | Franja ya asignada para el consultorio seleccionado |

### 6.4 Momentos de ejecución

1. **Durante el desarrollo de cada HU:** para detectar fallas tempranas.
2. **Al cierre de cada HU:** para confirmar cumplimiento de criterios de aceptación.
3. **Antes de una entrega o liberación:** para validar que los flujos principales siguen funcionando.
4. **En regresión funcional:** cuando haya cambios sobre el módulo de médicos, consultorios o franjas horarias.

---

## 7. MATRIZ DE RIESGOS

| Riesgo | Historia | Probabilidad | Impacto | Nivel (P×I) | Mitigación |
| :--- | :--- | :---: | :---: | :---: | :--- |
| Botón "Gestión Médicos" visible para usuarios no autenticados | HU-01 | 1 | 3 | **3** | Validar visibilidad del botón según estado de sesión en cada prueba de acceso |
| Cédula duplicada no detectada al crear médico | HU-02 | 2 | 3 | **6** | Probar creación con cédulas existentes y verificar unicidad a nivel de backend |
| Combinación consultorio/franja asignada a dos médicos | HU-02, HU-03 | 2 | 3 | **6** | Probar concurrencia de creación/edición con la misma combinación; verificar constraint en BD |
| Prefijo "Dr." almacenado en base de datos | HU-02 | 2 | 2 | **4** | Verificar que el valor en BD no incluya el prefijo tras cada creación/edición |
| Modal de edición no previene cierre accidental | HU-03 | 2 | 2 | **4** | Probar cierre por clic fuera, tecla Escape e ícono X |
| Validaciones del formulario inconsistentes entre creación y edición | HU-02, HU-03 | 2 | 2 | **4** | Ejecutar los mismos casos de validación en ambos modales |
| Baja de médico con turno en curso no bloqueada | HU-04 | 2 | 3 | **6** | Probar baja mientras el médico tiene un turno activo en franjas activas |
| Eliminación física en lugar de lógica | HU-04 | 1 | 3 | **3** | Verificar que el registro persista en BD con estado "Inactivo" tras la baja |
| Combinación consultorio/franja no liberada tras baja | HU-04 | 2 | 3 | **6** | Tras dar de baja, intentar asignar la misma combinación a otro médico |
| Serialización de _id ausente en respuesta JSON del backend | HU-03 | 2 | 3 | **6** | Test de regresión (TC-EM-12) verifica que `_id` esté presente y que no exista `id` duplicado en JSON.stringify de Doctor; usar propiedad de instancia única `_id`, no getters ni duplicados |
| Franja horaria no precargada en modal de edición por _id undefined | HU-03 | 2 | 2 | **4** | Test de regresión (TC-EM-10) verifica que el desplegable de franja muestre la selección actual al abrir el modal |

*(Escala: 1 Bajo, 2 Medio, 3 Alto)*

**Riesgo de negocio:** una falla en la unicidad de consultorio/franja puede provocar solapamientos de médicos en la atención. Una baja no bloqueada durante un turno activo puede dejar un turno sin médico asignado.

---

## 8. PREREQUISITOS Y REQUERIMIENTOS

1. Ambiente de pruebas disponible y estable con backend y frontend desplegados.
2. Base de datos con esquema de médicos, consultorios y franjas horarias migrado.
3. Al menos un usuario con rol Empleado y uno con rol Administrador creados en el ambiente de pruebas.
4. Datos de prueba: médicos precargados con distintas combinaciones de consultorio/franja para validar disponibilidad.
5. Acceso al servicio de autenticación (Firebase) configurado para el ambiente de pruebas.
6. Casos y escenarios documentados antes de ejecutar la validación.
7. Acceso a evidencias de prueba para registrar resultados, hallazgos y correcciones.

---

## 9. CRONOGRAMA Y ACUERDOS

- Las pruebas de cada HU se ejecutan conforme se entregue la implementación correspondiente.
- Los defectos encontrados se reportan inmediatamente al equipo de desarrollo con evidencia (captura, pasos de reproducción y resultado esperado vs. obtenido).
- La regresión del módulo completo se ejecuta antes de cada entrega o liberación.
- La suite Gherkin se mantiene actualizada con cada cambio de criterio de aceptación.

---

## 10. EQUIPO

| Nombre | Rol |
| :--- | :--- |
| David Angarita | Desarrollo y pruebas |