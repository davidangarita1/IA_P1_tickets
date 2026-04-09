# Especificación de Requerimientos: Mejora Visual de la Pantalla de Turnos

## Iniciativa

**Nombre:** Rediseño Visual de la Pantalla Pública de Turnos Habilitados.
**Objetivo:** Mejorar la presentación visual de la pantalla pública de turnos para que los pacientes y visitantes puedan identificar rápidamente su turno, distinguir entre los estados de llamado y espera, y tener una experiencia de usuario moderna, clara y profesional en la sala de espera.

### Alcance de la funcionalidad

Rediseño visual de la pantalla pública de turnos habilitados: diferenciación visual entre tarjetas de turnos llamados y en espera, íconos y etiquetas descriptivas en los encabezados de sección, indicador de conexión en tiempo real discreto y moderno, estado vacío atractivo cuando no hay turnos, animaciones de entrada sutiles para nuevas tarjetas y diseño responsivo adaptado a televisores, computadores, tablets y móviles con soporte de modo oscuro.

### Fuera de alcance

Cambios en la lógica de negocio de turnos, modificaciones en la autenticación o autorización, cambios en el backend o en los servicios de WebSocket, modificaciones en la barra de navegación, rediseño completo del sistema de diseño (design system) del proyecto.

## Épica

**Título:** Rediseño Visual de la Pantalla de Turnos Habilitados.
**Descripción:** Este módulo agrupa los cambios de presentación visual de la pantalla pública de turnos: tarjetas diferenciadas por estado (llamado vs. en espera), encabezados con íconos descriptivos en español, indicador de conexión en tiempo real, estado vacío ilustrativo, animaciones de entrada suaves y layout responsivo con soporte de modo oscuro.

## Historias de Usuario

### HU-01: Mejora de la experiencia visual de la pantalla de turnos habilitados

**Estimación:** M (Medium)
**Como** usuario (paciente o visitante) que consulta la pantalla pública de turnos habilitados
**Quiero** que la visualización de los turnos sea más clara, moderna y visualmente atractiva
**Para** poder identificar rápidamente mi turno, distinguir los turnos llamados de los en espera y tener una experiencia de usuario agradable y profesional en la sala de espera.

**Criterios de aceptación**

- **Escenario:** Los turnos llamados se muestran en tarjetas destacadas con mayor jerarquía visual
  Dado que existen turnos con estado "called" en el sistema
  Cuando el usuario visualiza la pantalla de "Turnos Habilitados"
  Entonces cada turno llamado se presenta como una tarjeta individual con bordes redondeados, sombra sutil y fondo de color verde claro o acento distintivo
  Y el nombre del paciente se muestra en tipografía grande y prominente (tamaño mínimo 1.5rem)
  Y el número de consultorio se presenta con un ícono representativo y tipografía clara debajo del nombre
  Y las tarjetas de turnos llamados tienen mayor prominencia visual que las de turnos en espera

- **Escenario:** Los turnos en espera se muestran en tarjetas secundarias con estilo diferenciado
  Dado que existen turnos con estado "waiting" en el sistema
  Cuando el usuario visualiza la pantalla de "Turnos Habilitados"
  Entonces cada turno en espera se presenta como una tarjeta individual con fondo neutro (gris claro o blanco) y bordes redondeados
  Y el nombre del paciente se muestra en tipografía legible pero de menor tamaño que los turnos llamados
  Y la indicación "Sin consultorio" se muestra con un estilo atenuado
  Y las tarjetas se disponen en un grid responsivo que se adapta al tamaño de la pantalla

- **Escenario:** Los encabezados de sección utilizan íconos y etiquetas descriptivas en español
  Dado que existen turnos llamados y en espera
  Cuando el usuario visualiza la pantalla de "Turnos Habilitados"
  Entonces el encabezado de la sección de turnos llamados muestra un ícono de megáfono o altavoz junto al texto "Turnos Llamados" en español
  Y el encabezado de la sección de turnos en espera muestra un ícono de reloj junto al texto "En Espera" en español
  Y ambos encabezados usan tipografía en negrita con un tamaño coherente con la jerarquía visual de la página

- **Escenario:** El indicador de conexión en tiempo real se presenta de forma discreta y moderna
  Dado que el usuario accede a la pantalla de "Turnos Habilitados"
  Cuando el estado de la conexión WebSocket es "conectado"
  Entonces se muestra un indicador circular verde pequeño (dot) acompañado del texto "Conectado en tiempo real" en un tamaño de fuente reducido y color atenuado, ubicado debajo del título principal
  Y cuando la conexión se pierde, el indicador cambia a un dot rojo con el texto "Desconectado — reconectando..." en color de advertencia

- **Escenario:** La pantalla sin turnos muestra un estado vacío atractivo
  Dado que no existen turnos registrados en el sistema
  Y no hay errores de conexión
  Cuando el usuario visualiza la pantalla de "Turnos Habilitados"
  Entonces se muestra un ícono ilustrativo centrado (por ejemplo, un ícono de ticket o lista vacía) con tamaño grande
  Y debajo del ícono se muestra el mensaje "No hay turnos registrados" con tipografía en color gris suave y tamaño legible
  Y el conjunto (ícono + mensaje) se presenta centrado vertical y horizontalmente en el área de contenido

- **Escenario:** Las tarjetas de turnos tienen una animación de entrada sutil
  Dado que se agregan nuevos turnos a la pantalla en tiempo real
  Cuando un nuevo turno aparece en la lista (ya sea llamado o en espera)
  Entonces la tarjeta del turno se presenta con una animación de aparición suave (fade-in y deslizamiento desde abajo)
  Y la animación dura entre 300ms y 500ms
  Y no interrumpe la visualización de las tarjetas existentes

- **Escenario:** La pantalla es responsiva y se adapta a diferentes dispositivos
  Dado que la pantalla de turnos puede ser visualizada en televisores de sala de espera, computadores de escritorio, tablets y dispositivos móviles
  Cuando el usuario accede desde un dispositivo con pantalla mayor a 1024px
  Entonces las tarjetas de turnos se disponen en un grid de 2 o 3 columnas
  Y cuando el ancho es entre 768px y 1024px, las tarjetas se disponen en 2 columnas
  Y cuando el ancho es menor a 768px, las tarjetas se disponen en una sola columna
  Y en todos los casos los textos son legibles y las tarjetas mantienen un espaciado consistente

- **Escenario:** El diseño visual soporta modo oscuro correctamente
  Dado que el sistema soporta modo oscuro
  Cuando el usuario visualiza la pantalla de "Turnos Habilitados" con el modo oscuro activado
  Entonces las tarjetas de turnos llamados usan un fondo de acento oscuro que mantiene contraste legible
  Y las tarjetas de turnos en espera usan un fondo oscuro neutro con bordes sutiles
  Y todos los textos, íconos e indicadores mantienen un contraste mínimo de 4.5:1 según las pautas WCAG 2.1
  Y los colores de los indicadores de conexión (verde/rojo) son visibles sobre el fondo oscuro
