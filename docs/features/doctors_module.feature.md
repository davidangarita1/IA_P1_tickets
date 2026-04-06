# Especificación de Requerimientos: Módulo de Gestión de Médicos

## Iniciativa

**Nombre:** Gestión de Médicos y Consultorios.
**Objetivo:** Centralizar y digitalizar el catálogo de médicos activos con sus consultorios y franjas horarias asignadas, permitiendo a Empleados y Administradores crear, editar y dar de baja médicos desde una pantalla dedicada.

### Alcance de la funcionalidad

El módulo cubre la pantalla “Gestión de Médicos” accesible únicamente para Empleados y Administradores autenticados, donde se puede crear un médico con su nombre completo y número de cédula único (el sistema añade el prefijo “Dr.” automáticamente), asignar opcionalmente un consultorio y una de las dos franjas horarias fijas de 8 horas disponibles que son 6:00-14:00 o 14:00-22:00, editarlo cuando cambia su disponibilidad y darlo de baja, siempre que no tenga una atención en curso en este momento. El sistema garantiza que ninguna combinación de consultorio y franja horaria quede asignada a dos médicos a la vez.

### Fuera de alcance

Gestión de especialidades médicas, agenda de citas, múltiples sedes, franja horaria de descanso para médicos y consultorios, creación y autenticación de pacientes, asignación automática de turnos a médicos, actualización en tiempo real de la pantalla pública del paciente con nombre del médico y consultorio asignado, almacenamiento del nombre del médico en el registro del turno.

## Épica

**Título:** Gestión de Catálogo de Médicos.
**Descripción:** Este módulo permite administrar el catálogo de médicos activos: crear, editar y dar de baja médicos con sus consultorios y franjas horarias (6:00-14:00 y 14:00-22:00), garantizando unicidad de la combinación consultorio/franja.

## Historias de Usuario

### HU-01 (Refinada): Acceso y Visualización Inicial del Módulo de Gestión de Gestión de Médicos

**Estimación:** S (Small)
**Como** usuario administrador o empleado autenticado
**Quiero** ver un botón “Gestión Médicos” en la barra de navegación
**Para** acceder al panel administración de médicos

**Criterios de aceptación**

- **Escenario:** El botón es visible “Gestión Médicos” aparece en la barra de navegación para usuarios autenticados
  Dado que el usuario “Empleado/Administrador” está autenticado
  Cuando accede a cualquier pantalla del sistema
  Entonces la barra de navegación muestra el botón “Gestión Médicos”

- **Escenario:** El botón se oculta para usuarios no autenticados
  Dado que no hay ningún usuario autenticado.
  Cuando se visualiza la barra de navegación
  Entonces el botón “Gestión Médicos” no es visible

- **Escenario:** Al hacer clic en “Gestión Médicos” se abre la pantalla del módulo
  Dado que el usuario “Empleado/Administrador” está autenticado y visualiza el botón “Gestión Médicos” en la barra de navegación
  Cuando hace clic en él
  Entonces se navega a la pantalla de gestión de médicos
  Y la pantalla muestra el título centrado de “Gestión de Médicos”
  Y la pantalla muestra una tabla vacía con los encabezados: “Nombre completo”, “Consultorio”, “Franja Horaria”, “Acciones”
  Y la pantalla muestra el botón “Crear médico” en la parte superior derecha de la tabla

- **Escenario:** La tabla aparece vacía cuando no hay médicos creados
  Dado que no existe ningún médico registrado en el sistema
  Cuando el administrador accede a la pantalla de gestión de médicos
  Entonces la tabla se muestra vacía
  Y aparece el mensaje “No hay médicos creados” en la parte central de la tabla

- **Escenario:** El botón “Crear médico” es visible pero su funcionalidad se define en HU-02
  Dado que el usuario “Empleado/Administrador” está en el módulo de gestión de médicos
  Entonces el botón “Crear médico” es visible en la pantalla
  Y permanece deshabilitado hasta que HU-02 (Crear un nuevo médico) sea implementada

### HU-02 (Refinada): Crear un nuevo médico

**Estimación:** L (Large)
**Como** usuario administrador o empleado autenticado y ubicado en el módulo de gestión de médicos
**Quiero** hacer clic en un botón “Crear médico” que abra un modal con el formulario para ingresar el nombre completo (sin prefijo “Dr.”), el número de cédula, y opcionalmente el consultorio y la franja horaria
**Para** que el sistema cree al médico con la información disponible en el momento, pudiendo completar el horario en una edición posterior.

**Criterios de aceptación**

- **Escenario:** Abrir el modal de creación
  Dado que el usuario “Empleado/Administrador” está en el módulo de gestión de médicos
  Cuando hace clic en el botón “Crear médico”
  Entonces se abre un modal con los campos “Nombre completo”, “Número de cédula”, “Consultorio” (opcional) y “Franja horaria” (opcional)
  Y el modal muestra los botones “Cerrar” y “Guardar”

- **Escenario:** Cerrar el modal manualmente sin guardar
  Dado que el modal de creación está abierto
  Cuando el usuario “Empleado/Administrador” hace clic en “Cerrar”
  Entonces el modal se cierra
  Y la tabla de médicos no muestra ningún registro nuevo

- **Escenario:** Crear un médico con consultorio y franja horaria
  Dado que el modal de creación está abierto
  Y el campo “Nombre completo” contiene “Juan García” y el campo “Número de cédula” contiene “12345678”
  Y el usuario “Empleado/Administrador” selecciona el Consultorio “2” y la Franja horaria “6:00 - 14:00”
  Cuando hace clic en “Guardar”
  Entonces el modal se cierra
  Y aparece el mensaje flotante “Médico guardado exitosamente” en la parte central superior, el cual desaparece automáticamente después de 5 segundos
  Y el médico aparece en la tabla principal mostrando las columnas: Nombre (“Dr. Juan García”), Cédula (“12345678”), Consultorio (“2”) y Franja horaria (“6:00 - 14:00”)
  Y la combinación “Consultorio 2 / 6:00 - 14:00” deja de estar disponible para otro médico

- **Escenario:** Crear un médico sin consultorio ni franja horaria
  Dado que el modal de creación está abierto
  Y el campo “Nombre completo” contiene “Jose Martínez” y el campo “Número de cédula” contiene “87654321”
  Y los campos Consultorio y Franja horaria se dejan vacíos
  Cuando el usuario “Empleado/Administrador” hace clic en “Guardar”
  Entonces el modal se cierra
  Y aparece el mensaje flotante “Médico guardado exitosamente” por 5 segundos
  Y aparece en la tabla el médico “Dr. Jose Martínez” con su respectiva cédula, pero indicando "Sin asignar" en las columnas de consultorio y franja horaria

- **Escenario:** El sistema agrega el prefijo “Dr.” automáticamente solo en la capa de presentación (UI)
  Dado que el modal de creación está abierto
  Y el usuario “Empleado/Administrador” ha ingresado “Juan García” en el campo “Nombre completo”
  Cuando hace clic en “Guardar”
  Entonces la tabla muestra al médico como “Dr. Juan García”
  Y en la base de datos se almacena estrictamente el valor “Juan García” sin el prefijo
  Y en ningún momento se le pidió al usuario escribir el prefijo manualmente

- **Escenario:** El segundo desplegable muestra solo las franjas horarias libres del consultorio seleccionado
  Dado que el modal de creación está abierto
  Y la Franja horaria “6:00 - 14:00” del Consultorio “1” ya tiene un médico asignado
  Cuando el usuario “Empleado/Administrador” selecciona el Consultorio “1” en el primer desplegable
  Entonces el segundo desplegable muestra únicamente la Franja horaria “14:00 - 22:00”
  Y la Franja horaria “6:00 - 14:00” no aparece como opción

- **Escenario:** No se pueden registrar médicos en un consultorio con todas sus franjas ocupadas
  Dado que el modal de creación está abierto
  Y las franjas horarias “6:00 - 14:00” y “14:00 - 22:00” del Consultorio “3” ya tienen médicos asignados
  Cuando el usuario “Empleado/Administrador” selecciona el Consultorio “3” en el primer desplegable
  Entonces el segundo desplegable queda deshabilitado
  Y aparece el mensaje “No hay franjas disponibles para este consultorio” debajo del campo
  Y el botón “Guardar” permanece deshabilitado

- **Escenario:** El campo número de cédula solo acepta números y valida longitud
  Dado que el modal de creación está abierto
  Cuando el usuario “Empleado/Administrador” escribe “ABC123” en el campo “Número de cédula”
  Entonces el campo rechaza las letras y muestra solo “123”
  Y si la longitud es menor a 7 o mayor a 10 dígitos, aparece el mensaje “La cédula debe tener entre 7 y 10 números” debajo del campo
  Y el botón “Guardar” permanece deshabilitado hasta cumplir la condición

- **Escenario:** El campo número de cédula no puede estar vacío
  Dado que el modal de creación está abierto
  Cuando el usuario “Empleado/Administrador” hace clic en el campo “Número de cédula” y sale de él sin escribir
  Entonces el botón “Guardar” permanece deshabilitado
  Y aparece el mensaje “El número de cédula es obligatorio” debajo del campo

- **Escenario:** El nombre completo del médico no puede estar vacío
  Dado que el modal de creación está abierto
  Cuando el usuario toca el campo “Nombre completo” y sale de él sin escribir
  Entonces el botón “Guardar” permanece deshabilitado
  Y aparece el mensaje “El nombre completo es obligatorio” debajo del campo

- **Escenario:** El nombre completo debe tener al menos 3 caracteres
  Dado que el modal de creación está abierto
  Cuando el usuario “Empleado/Administrador” escribe “Ju” en el campo “Nombre completo”
  Entonces aparece el mensaje “El nombre completo debe tener al menos 3 caracteres” debajo del campo
  Y el botón “Guardar” permanece deshabilitado

- **Escenario:** No se puede crear un médico con un número de cédula que ya existe
  Dado que el modal de creación está abierto
  Y ya existe un médico con el Número de cédula “12345678”
  Cuando el usuario “Empleado/Administrador” escribe “12345678” en el campo “Número de cédula” y el texto “Pedro” en el campo “Nombre completo”
  Y hace clic en el botón “Guardar”
  Entonces aparece el mensaje flotante de alerta ”Ya existe un médico registrado con ese número de cédula” por 5 segundos
  Y el modal permanece abierto

### HU-03 (Refinada): Editar un médico creado

**Estimación:** L (Large)
**Como** usuario administrador o empleado autenticado y ubicado en el módulo de gestión de médicos
**Quiero** que cada fila de la tabla de médicos muestre un ícono de lápiz y que al hacer clic en él se abra un modal con los datos del médico listos para editar
**Para** mantener la información del médico actualizada cuando cambia su disponibilidad o sus datos personales.

**Criterios de aceptación**

- **Escenario:** Cada fila de la tabla muestra el ícono de lápiz para editar
  Dado que existen médicos creados en el sistema
  Cuando el usuario “Empleado/Administrador” consulta la tabla de médicos
  Entonces cada fila muestra un ícono de lápiz al lado derecho de la tabla en una columna “Acciones” junto a los datos del médico

- **Escenario:** Edición de médico al hacer clic en el ícono de lápiz de la fila
  Dado que existen médicos creados en el sistema
  Cuando el usuario “Empleado/Administrador” consulta la tabla de médicos
  Y hace clic en el ícono de lápiz en la fila del “Dr. Juan García”
  Entonces se abre un modal con el Nombre completo “Juan García”, Número de cédula “12345678”, el Consultorio “2” y la franja “6:00 - 14:00” ya cargados
  Y el desplegable de franjas muestra la franja actual más todas las franjas horarias definidas para el consultorio seleccionado que no estén asignadas a otro médico
  Y el modal muestra los botones “Cerrar”, “Guardar” y un ícono "X" en la esquina superior derecha

- **Escenario:** Guardar los cambios desde el modal de edición
  Dado que el modal de edición del “Dr. Juan García” está abierto con Consultorio “2” y Franja horaria “6:00 - 14:00”
  Cuando el usuario “Empleado/Administrador” cambia el Consultorio a “4” y la Franja horaria a “14:00 - 22:00”
  Y hace clic en “Guardar”
  Entonces el modal se cierra
  Y aparece un mensaje flotante de éxito (color verde) con el texto “Médico guardado exitosamente” en la parte central superior, el cual desaparece automáticamente después de 3 segundos
  Y la tabla refleja el Consultorio “4” y la Franja horaria a “14:00 - 22:00” de inmediato asignadas al “Dr. Juan García” sin necesidad de recargar la página
  Y la combinación “Consultorio 2 / 6:00 - 14:00” queda disponible para otro médico

- **Escenario:** Cerrar el modal de edición sin guardar
  Dado que el modal de edición está abierto con cambios sin guardar
  Cuando el usuario “Empleado/Administrador” hace clic en el botón “Cerrar” o en el ícono "X" superior
  Entonces el modal se cierra
  Y los datos del médico permanecen igual en la tabla

- **Escenario:** Prevención de cierre accidental del modal
  Dado que el modal de edición está abierto
  Cuando el usuario “Empleado/Administrador” hace clic fuera del área del modal o presiona la tecla "Escape"
  Entonces el modal permanece abierto para evitar la pérdida accidental de datos no guardados

- **Escenario:** No se puede guardar una edición si el nombre completo queda vacío o con menos de 3 caracteres
  Dado que el modal de edición está abierto con los datos cargados del “Dr. Juan García”
  Cuando el usuario “Empleado/Administrador” borra el nombre o lo reduce a menos de 3 caracteres
  Entonces el botón de “Guardar” permanece deshabilitado
  Y aparece el mensaje de validación “El nombre completo es obligatorio” o “El nombre completo debe tener al menos 3 caracteres” en color rojo debajo del campo

- **Escenario:** No se puede guardar una edición si la cédula queda vacía
  Dado que el modal de edición está abierto con los datos cargados del “Dr. Juan García”
  Cuando el usuario “Empleado/Administrador” borra el contenido del campo Número de cédula
  Entonces el botón de “Guardar” permanece deshabilitado
  Y aparece el mensaje de validación “El número de cédula es obligatorio” en color rojo debajo del campo

- **Escenario:** Validación en tiempo real de cédula duplicada
  Dado que el modal de edición está abierto con los datos cargados del “Dr. Juan García”
  Y ya existe otro médico registrado en el sistema con la cédula "99999999"
  Cuando el usuario “Empleado/Administrador” cambia el campo Número de cédula a "99999999" y el campo pierde el foco o hace clic en “Guardar”
  Entonces el botón de "Guardar" se deshabilita
  Y aparece un mensaje flotante de alerta (color rojo) con el texto ”Ya existe un médico registrado con ese número de cédula”
  Y el modal permanece abierto

## HU-04 (Refinada): Dar de baja a un médico del sistema

**Estimación:** M (Medium)
**Como** usuario administrador o empleado autenticado y ubicado en el módulo de gestión de médicos
**Quiero** que cada fila de la tabla de médicos activos muestre un ícono de dar de baja (basura/bloqueo) y que al hacer clic en él aparezca un modal de confirmación antes de inactivarlo
**Para** retirar a un médico que deja de atender en el centro, manteniendo su historial de atenciones intacto (eliminación lógica) y sin riesgo de ejecutar la acción por error.

**Criterios de aceptación**

- **Escenario:** Cada fila de la tabla muestra el ícono para dar de baja
  Dado que existen médicos activos creados en el sistema
  Cuando el usuario “Empleado/Administrador” consulta la tabla de médicos
  Entonces cada fila muestra un ícono de dar de baja (basura o bloqueo) al lado derecho del ícono de edición en la columna “Acciones” junto a los datos del médico.

- **Escenario:** Al hacer clic en el ícono de dar de baja aparece un modal de confirmación
  Dado que existen médicos activos creados en el sistema
  Cuando el usuario “Empleado/Administrador” hace clic en el ícono de dar de baja en la fila del “Dr. Juan García” con Número de cédula “12345678”
  Entonces aparece un modal con el mensaje “¿Está seguro de que desea dar de baja al Dr. Juan García? Esta acción lo ocultará de la lista de médicos activos.”
  Y el modal muestra los botones “Cancelar” y “Aceptar”.

- **Escenario:** Cancelar la baja desde el modal
  Dado que el modal de confirmación está abierto para el “Dr. Juan García”
  Cuando el usuario “Empleado/Administrador” hace clic en el botón “Cancelar”
  Entonces el modal se cierra
  Y el médico permanece en la tabla de médicos activos sin ningún cambio.

- **Escenario:** Confirmar la baja lógica desde el modal
  Dado que el modal de confirmación está abierto para el “Dr. Juan García”
  Cuando el usuario "Empleado/Administrador" hace clic en el botón "Aceptar"
  Entonces el modal se cierra
  Y el estado del médico cambia a "Inactivo" en la base de datos (eliminación lógica)
  Y el médico desaparece de la tabla de médicos activos
  Y aparece el mensaje flotante "Médico dado de baja exitosamente".

- **Escenario:** Restricción al intentar dar de baja a un médico con un turno en curso
  Dado que el “Dr. Juan García” tiene un turno en ejecución en este preciso momento (la hora actual está dentro del rango de inicio y fin del turno)
  Cuando el usuario “Empleado/Administrador” hace clic en el ícono de dar de baja en la fila del “Dr. Juan García”
  Entonces aparece un mensaje flotante de alerta: “No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento.” en la parte superior central
  Y el modal de confirmación no se abre.


