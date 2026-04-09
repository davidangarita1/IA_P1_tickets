# Contexto de Negocio — Sistema de Turnos EPS

## 1. Descripción del Proyecto

- **Nombre del Proyecto:** Sistema de Turnos EPS
- **Objetivo del Proyecto:** Facilitar la gestión de turnos de atención en una EPS a través de una plataforma en línea. El sistema permite que cualquier persona pueda consultar y registrar turnos; crear una cuenta de usuario y consultar el historial de turnos asignados (**dashboard**) es exclusivo para el personal autorizado.

---

## 2. Flujos Críticos del Negocio

- **Principales Flujos de Trabajo:**
  - **Crear cuenta:** Un empleado nuevo completa un formulario con su nombre, correo y contraseña. Al finalizar correctamente, el sistema lo lleva a la pantalla de inicio de sesión y muestra el mensaje: "¡Cuenta creada exitosamente! Inicia sesión para continuar.".
  - **Ingresar al sistema:** Un usuario registrado escribe su correo y contraseña. Si los datos son correctos, el sistema lo lleva al **dashboard**, que muestra el historial de turnos asignados.
  - **Salir del sistema:** Desde el menú superior, el usuario puede cerrar su sesión en cualquier momento. El sistema lo regresa a la pantalla de inicio de sesión.
  - **Restricción de acceso:** Si alguien intenta ingresar directamente al panel principal o al módulo de turnos sin haber iniciado sesión, el sistema lo redirige automáticamente a la pantalla de inicio de sesión.
  - **Solicitud de turnos:** Los usuarios (visitantes) pueden registrar nuevas solicitudes de turno sin necesidad de iniciar sesión, las cuales el sistema recibe y procesa de forma ordenada.

- **Módulos o Funcionalidades Críticas:**
  - Gestión de acceso: creación de cuenta, inicio de sesión, cierre de sesión y recuperación de sesión activa.
  - Control de áreas restringidas: protección automática de las secciones internas para que solo el personal autorizado pueda acceder.
  - Menú de navegación condicional: la barra de navegación muestra contenido diferenciado según el estado de sesión. Para usuarios no autenticados muestra los botones "Turnos" (`/`), "Solicitar Turno" (`/request-ticket`) e "Iniciar Sesión". Para usuarios autenticados muestra "Turnos", "Historial Turnos" (`/dashboard`), "Gestión Médicos" y "Solicitar Turno", junto al botón de cerrar sesión.
  - Gestión de turnos: solicitud y visualización de turnos con actualización inmediata en pantalla. La pantalla publica de turnos habilitados presenta tarjetas diferenciadas por estado (turnos llamados con acento verde y tipografia prominente, turnos en espera con estilo neutro), encabezados de seccion en espanol con iconos descriptivos (megafono para "Turnos Llamados", reloj para "En Espera"), indicador de conexion WebSocket discreto con dot circular (verde/rojo) y texto descriptivo, estado vacio con icono ilustrativo centrado, animacion de entrada suave para nuevas tarjetas, grid responsivo adaptado a diferentes dispositivos y soporte de modo oscuro con contraste WCAG 2.1.
  - Gestión de médicos: acceso al módulo de administración de médicos desde la barra de navegación, con tabla de médicos activos y sus consultorios/franjas horarias asignadas. Creación de médicos con nombre completo, cédula única (7-10 dígitos), consultorio y franja horaria opcionales — si se asigna consultorio, la franja horaria pasa a ser obligatoria. Edición de médicos existentes mediante modal prellenado con datos actuales, mismas validaciones que creación, validación de cédula duplicada en tiempo real, y prevención de cierre accidental del modal (clic fuera y Escape no cierran). La tabla se actualiza sin recargar la página al guardar cambios y la combinación consultorio/franja anterior queda libre al cambiar. Dar de baja (eliminación lógica) de médicos mediante modal de confirmación, con bloqueo automático cuando el médico tiene un turno en curso (estado "llamado" o "atendido") en su consultorio. Al confirmar la baja, el médico se marca como "Inactivo", desaparece de la tabla y su combinación consultorio/franja queda disponible para otros médicos. El sistema agrega el prefijo "Dr." automáticamente en la UI. Garantiza unicidad de la combinación consultorio/franja horaria entre médicos activos. Validaciones en tiempo real de nombre (mín. 3 caracteres) y cédula (solo números, 7-10 dígitos, única). Notificaciones flotantes de éxito y error con auto-cierre. Acceso restringido por rol: solo usuarios con rol Empleado o Administrador pueden crear, editar o dar de baja médicos; la validación de rol se aplica en el backend mediante guard dedicado. Las franjas disponibles por consultorio se cachean en el cliente para evitar llamadas redundantes al servicio.

---

## 3. Reglas de Negocio y Restricciones

- **Reglas de Negocio Relevantes:**
  - El **dashboard** es exclusivo para personal autorizado (administradores y empleados) que hayan iniciado sesión. Cualquier intento de acceso sin sesión redirige a la pantalla de inicio de sesión.
  - La pantalla de turnos públicos, el registro de turnos, la creación de cuenta y el inicio de sesión son accesibles para cualquier persona sin necesidad de iniciar sesión.
  - El menú de navegación superior solo aparece para usuarios con sesión activa; en las pantallas públicas no se muestra.
  - Las credenciales de acceso se protegen mediante mecanismos seguros de almacenamiento; las contraseñas nunca quedan visibles ni almacenadas más allá del momento del ingreso.
  - Toda la información ingresada en los formularios se valida y limpia antes de ser procesada, para proteger el sistema de intentos maliciosos.
  - Las funcionalidades de inicio de sesión con redes sociales o renovación automática de sesión no están contempladas en esta versión del sistema.

- **Regulaciones o Normativas:**
  - Los datos personales y credenciales se transmiten de forma cifrada, cumpliendo con las buenas prácticas de protección de información.
  - La identidad del usuario se verifica mediante un mecanismo de sesión seguro generado por el servidor, que el sistema valida sin exponer información sensible.
  - El sistema aplica políticas de seguridad en todas las pantallas para evitar la ejecución de contenido no autorizado.

---

## 4. Perfiles de Usuario y Roles

- **Perfiles o Roles de Usuario en el Sistema:**
  - **Administrador:** Personal con responsabilidades de gestión. Puede ingresar al **dashboard** y a los demás módulos internos, ver el estado de la operación y administrar las solicitudes.
  - **Empleado:** Personal operativo de la EPS. Puede ingresar al **dashboard**, al módulo de gestión de médicos y a los demás módulos para registrar y consultar turnos.
  - **Visitante (sin sesión):** Cualquier persona que accede al sitio sin haber iniciado sesión. Solo puede ver la pantalla pública de turnos o registrar turnos.

- **Permisos y Limitaciones de Cada Perfil:**
  - En esta versión, el administrador y el empleado tienen acceso a las mismas secciones del sistema; la distinción de roles queda registrada para aplicar restricciones más detalladas en versiones futuras.
  - Ningún usuario, independientemente de su perfil, puede acceder a las secciones internas si no tiene una sesión válida activa.

---

## 5. Condiciones del Entorno Técnico

- **Plataformas Soportadas:** Aplicación web accesible desde cualquier navegador moderno en computador o dispositivo móvil. No cuenta con versión instalable en iOS o Android.

- **Tecnologías o Integraciones Clave:**
  - **Interfaz de usuario:** Plataforma web moderna con actualización inmediata de pantalla sin necesidad de recargar la página.
  - **Servicio de autenticación y turnos:** Componente del sistema encargado de validar el acceso de los usuarios y recibir las solicitudes de turno.
  - **Procesamiento de turnos:** Componente encargado de atender y gestionar las solicitudes de turno recibidas de forma ordenada y continua.
  - **Cola de mensajes:** Mecanismo interno que garantiza que ninguna solicitud de turno se pierda, aunque el volumen de peticiones sea alto.
  - **Almacenamiento de datos:** Base de datos donde se guardan de forma segura los usuarios registrados y el historial de turnos.
  - **Notificaciones en tiempo real:** El sistema actualiza automáticamente la pantalla de turnos sin que el usuario tenga que refrescar la página.
  - **Gestión de sesiones:** Las sesiones de usuario se protegen mediante credenciales seguras generadas por el servidor, sin almacenar información sensible en el navegador.
  - **Tolerancia a fallos:** El sistema cuenta con mecanismos que detectan cuando un servicio no responde y evitan que el fallo se propague al usuario final, mostrando un mensaje de error controlado.
  - **Entorno de operación:** Los tres componentes del sistema (interfaz, servicio principal y procesador de turnos) se ejecutan de forma aislada y coordinada en contenedores, facilitando su despliegue y mantenimiento.

---

## 6. Casos Especiales o Excepciones

- **Escenarios Alternos o Excepciones que Deben Considerarse:**
  - **Pantalla en blanco al cargar:** Mientras el sistema verifica si el usuario tiene una sesión activa, se muestra un indicador de carga para evitar que la pantalla parpadee o muestre contenido restringido antes de la verificación.
  - **Servicio de acceso no disponible:** Si el sistema de autenticación no responde, el formulario muestra un mensaje de error, sin exponer detalles del problema interno, y el usuario puede reintentar.
  - **Sesión vencida o inválida:** Si la sesión del usuario expira o es inválida, el sistema detecta esto automáticamente al intentar acceder a una sección protegida y solicita al usuario que inicie sesión nuevamente.
  - **Diferencia entre creación de cuenta y registro de turnos:** La opción para crear una cuenta de usuario y el módulo para registrar turnos de atención son funciones distintas con accesos separados, para evitar confusión entre ambos procesos.
  - **Alta concurrencia de solicitudes:** El sistema está diseñado para manejar múltiples solicitudes de turno de forma simultánea sin degradar la experiencia del usuario ni perder datos.
  - **Intento de acceso directo a secciones restringidas:** Si un usuario escribe directamente en el navegador la dirección de una sección protegida sin tener sesión activa, el sistema lo redirige automáticamente a la pantalla de inicio de sesión, tanto antes de cargar la página como durante la navegación interna.
