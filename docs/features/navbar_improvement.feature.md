# Especificación de Requerimientos: Mejoras de Navegación

## Iniciativa

**Nombre:** Mejora de la Experiencia de Navegación para Usuarios Autenticados y No Autenticados.
**Objetivo:** Optimizar la accesibilidad de las funcionalidades públicas del sistema de turnos desde la barra de navegación, estandarizando la nomenclatura de los botones y garantizando que tanto usuarios autenticados como no autenticados tengan acceso claro y directo a las acciones disponibles para su perfil.

### Alcance de la funcionalidad

Las mejoras cubren tres áreas: (1) renombrar el botón existente "Registrar" a "Solicitar Turno", actualizar su ruta de `/register` a `/request-ticket` y habilitarlo en la barra de navegación pública para usuarios no autenticados, eliminando la necesidad de escribir la URL manualmente; (2) agregar el botón "Turnos" a la vista sin autenticación para que los usuarios puedan navegar a la pantalla pública de turnos sin depender exclusivamente del logo; y (3) renombrar el botón "Dashboard" a "Historial Turnos" para reflejar con mayor claridad el contenido de la pantalla.

### Fuera de alcance

Cambios en la lógica de negocio de turnos, modificaciones en la autenticación o autorización, creación de nuevas pantallas o funcionalidades, cambios en el backend o en los servicios de WebSocket, rediseño visual de pantallas, rediseño completo del sistema de diseño (design system) del proyecto. El renombramiento de la ruta `/register` a `/request-ticket` no constituye una ruta nueva: es la misma pantalla con una URL actualizada.

## Épica

**Título:** Optimización de la Barra de Navegación Pública y Autenticada.
**Descripción:** Este módulo agrupa las mejoras de la barra de navegación del sistema: renombrar el botón "Registrar" a "Solicitar Turno" (con actualización de ruta) y habilitarlo para usuarios no autenticados, agregar el botón "Turnos" sin necesidad de autenticación, y unificar la nomenclatura del botón "Dashboard" a "Historial Turnos" para alinearlo con el contenido real de la pantalla.

## Historias de Usuario

### HU-01 (Refinada): Renombramiento del botón "Registrar" y habilitación en la barra de navegación pública

**Estimación:** XS (Extra Small)
**Como** usuario no autenticado que accede al sistema de turnos
**Quiero** que el botón "Registrar" se llame "Solicitar Turno", que la ruta `/register` cambie a `/request-ticket`, y que este botón sea visible en la barra de navegación sin necesidad de iniciar sesión
**Para** poder acceder directamente al formulario de solicitud de turno desde la barra de navegación, con una etiqueta que refleje con claridad la acción que voy a realizar.

> **Nota de contexto:** El botón "Registrar" ya existe en el sistema pero actualmente **no es visible** en la barra de navegación para usuarios no autenticados — requiere conocer la URL directamente. Esta historia **no crea un nuevo botón ni una nueva pantalla**: únicamente renombra el botón existente, actualiza la ruta asociada y lo expone en la barra de navegación pública.

**Criterios de aceptación**

- **Escenario:** El botón "Registrar" es renombrado a "Solicitar Turno" en la barra de navegación
  Dado que el sistema tiene un botón llamado "Registrar" que apuntaba a la ruta `/register`
  Cuando se implementa el cambio
  Entonces el botón pasa a llamarse "Solicitar Turno" en todos los puntos donde aparece
  Y la ruta asociada cambia de `/register` a `/request-ticket`
  Y la pantalla de destino y su funcionalidad permanecen sin cambios.

- **Escenario:** La barra de navegación pública es visible para usuarios no autenticados con el botón renombrado
  Dado que un usuario visita cualquier página pública del sistema y no ha iniciado sesión
  Cuando observa la parte superior de la pantalla
  Entonces debe visualizar una barra de navegación que contiene el botón "Solicitar Turno" (antes "Registrar") y el botón "Iniciar Sesión".

- **Escenario:** Al hacer clic en "Solicitar Turno" se navega a la pantalla correspondiente
  Dado que el usuario no autenticado está en una página pública
  Y la barra de navegación pública es visible
  Cuando hace clic en el botón "Solicitar Turno"
  Entonces el sistema lo redirige a la ruta `/request-ticket`
  Y se muestra la pantalla para registrar una nueva solicitud de turno (misma pantalla que antes existía en `/register`).

- **Escenario:** La ruta anterior `/register` redirige correctamente a `/request-ticket`
  Dado que la ruta `/register` ha sido renombrada a `/request-ticket`
  Cuando un usuario accede directamente a la ruta `/register` (por ejemplo, mediante un enlace guardado)
  Entonces el sistema lo redirige automáticamente a `/request-ticket`
  Y se muestra la pantalla de solicitud de turno sin pérdida de funcionalidad.

- **Escenario:** El botón "Solicitar Turno" se resalta cuando el usuario está en la página de solicitud de turnos
  Dado que el usuario se encuentra en la ruta `/request-ticket`
  Cuando visualiza la barra de navegación pública
  Entonces el botón "Solicitar Turno" debe mostrar un estilo visual "activo" para indicar la ubicación actual.

- **Escenario:** La barra de navegación pública no es visible para usuarios autenticados
  Dado que un usuario "Empleado" o "Administrador" ha iniciado sesión correctamente en el sistema
  Cuando navega por las páginas del sistema
  Entonces la barra de navegación pública (con "Solicitar Turno" e "Iniciar Sesión") no debe ser visible
  Y en su lugar, se muestra la barra de navegación principal para usuarios autenticados (cuyo contenido será definido en otra historia de usuario).

---

### HU-02: Visibilidad del botón "Turnos" en la barra de navegación sin autenticación

**Estimación:** XS (Extra Small)
**Como** usuario no autenticado que accede al sistema de turnos
**Quiero** ver un botón "Turnos" en la barra de navegación sin necesidad de iniciar sesión
**Para** poder navegar a la pantalla pública de turnos habilitados sin depender exclusivamente del logo "Sistema de Turnos" como enlace de redirección.

**Criterios de aceptación**

- **Escenario:** El botón "Turnos" es visible en la barra de navegación para usuarios no autenticados
  Dado que el usuario no está autenticado en el sistema
  Cuando visualiza la barra de navegación en cualquier pantalla pública
  Entonces la barra de navegación muestra el botón "Turnos" como elemento de navegación explícito
  Y el botón aparece junto a los botones "Registro" e "Iniciar sesión"

- **Escenario:** Al hacer clic en "Turnos" se navega a la pantalla pública de turnos habilitados
  Dado que el usuario no está autenticado
  Y el botón "Turnos" es visible en la barra de navegación
  Cuando hace clic en el botón "Turnos"
  Entonces el sistema navega a la ruta raíz `/`
  Y se muestra la pantalla de "Turnos Habilitados"

- **Escenario:** El botón "Turnos" coexiste con el logo como elementos de navegación independientes
  Dado que el usuario no está autenticado
  Cuando visualiza la barra de navegación
  Entonces el logo "Sistema de Turnos" sigue siendo un enlace funcional a la ruta raíz `/`
  Y adicionalmente existe el botón "Turnos" como elemento de navegación explícito

- **Escenario:** El botón "Turnos" se resalta cuando el usuario está en la pantalla principal de turnos
  Dado que el usuario (autenticado o no) se encuentra en la ruta raíz `/`
  Cuando visualiza la barra de navegación
  Entonces el botón "Turnos" aparece con el estilo activo (resaltado) para indicar la página actual

- **Escenario:** El botón "Turnos" sigue visible cuando el usuario está autenticado
  Dado que el usuario "Empleado/Administrador" está autenticado en el sistema
  Cuando visualiza la barra de navegación
  Entonces el botón "Turnos" permanece visible en la barra de navegación
  Y mantiene su funcionalidad de navegación a la pantalla principal

---

### HU-03: Renombrar el botón "Dashboard" a "Historial Turnos"

**Estimación:** XS (Extra Small)
**Como** usuario autenticado del sistema de turnos
**Quiero** que el botón "Dashboard" en la barra de navegación se llame "Historial Turnos"
**Para** entender de forma inmediata y clara que la pantalla muestra el historial de turnos atendidos, sin confusión con un panel de métricas o indicadores generales.

**Criterios de aceptación**

- **Escenario:** El botón de la barra de navegación muestra el texto "Historial Turnos" en lugar de "Dashboard"
  Dado que el usuario "Empleado/Administrador" está autenticado en el sistema
  Cuando visualiza la barra de navegación
  Entonces el botón que antes mostraba el texto "Dashboard" ahora muestra "Historial Turnos"
  Y la ruta de destino sigue siendo `/dashboard`

- **Escenario:** Al hacer clic en "Historial Turnos" se navega a la pantalla de historial de turnos atendidos
  Dado que el usuario "Empleado/Administrador" está autenticado
  Y el botón "Historial Turnos" es visible en la barra de navegación
  Cuando hace clic en él
  Entonces el sistema navega a la ruta `/dashboard`
  Y se muestra la pantalla con el título "Historial de Turnos Atendidos"

- **Escenario:** El botón "Historial Turnos" se resalta cuando el usuario está en la pantalla de historial
  Dado que el usuario "Empleado/Administrador" se encuentra en la ruta `/dashboard`
  Cuando visualiza la barra de navegación
  Entonces el botón "Historial Turnos" aparece con el estilo activo (resaltado) para indicar la página actual

- **Escenario:** El texto "Dashboard" no aparece en ningún elemento de la barra de navegación
  Dado que el cambio ha sido implementado
  Cuando cualquier usuario autenticado accede al sistema
  Entonces en ningún punto de la barra de navegación aparece la palabra "Dashboard"
  Y en su lugar se utiliza exclusivamente "Historial Turnos"


