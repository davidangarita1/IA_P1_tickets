# Test Plan: Mejora Visual de la Pantalla de Turnos — Sistema de Turnos EPS

## 1. Objetivo

Verificar que el rediseño visual de la pantalla pública de turnos habilitados del Sistema de Turnos EPS cumple con los criterios de aceptación definidos en HU-04, garantizando que los usuarios (pacientes y visitantes) puedan identificar rápidamente su turno, distinguir visualmente los estados de llamado y espera, y experimentar una interfaz moderna, responsiva y accesible en múltiples dispositivos y condiciones de visualización.

## 2. Descripción

Este plan de pruebas cubre la historia de usuario que compone la épica "Rediseño Visual de la Pantalla de Turnos Habilitados":

- **HU-04:** Mejora de la experiencia visual de la pantalla de turnos habilitados — diferenciación visual de tarjetas por estado (llamado vs. en espera), encabezados con íconos descriptivos en español, indicador de conexión en tiempo real discreto, estado vacío atractivo, animaciones de entrada sutiles y diseño responsivo con soporte de modo oscuro.

Todos los cambios son exclusivos de frontend (estilos, estructura visual y CSS). No hay cambios en lógica de negocio, autenticación, backend ni servicios de WebSocket.

## 3. Scope

### 3.1 In Scope

- Verificación del estilo visual diferenciado de tarjetas de turnos llamados (fondo de acento, sombra, tipografía prominente).
- Verificación del estilo visual diferenciado de tarjetas de turnos en espera (fondo neutro, tipografía secundaria).
- Verificación de que el nombre del paciente en turnos llamados usa tipografía con tamaño mínimo de 1.5rem.
- Verificación de ícono representativo junto al número de consultorio en turnos llamados.
- Verificación del texto "Sin consultorio" con estilo atenuado en turnos en espera.
- Verificación del encabezado "Turnos Llamados" con ícono de megáfono o altavoz.
- Verificación del encabezado "En Espera" con ícono de reloj.
- Verificación del indicador de conexión: dot verde + texto "Conectado en tiempo real" cuando está conectado.
- Verificación del indicador de conexión: dot rojo + texto "Desconectado — reconectando..." cuando está desconectado.
- Verificación del estado vacío: ícono centrado + mensaje "No hay turnos registrados" cuando no hay turnos.
- Verificación de la animación de entrada (fade-in + deslizamiento) con duración entre 300ms y 500ms.
- Verificación del layout responsivo: 2-3 columnas en >1024px, 2 columnas en 768px–1024px, 1 columna en <768px.
- Verificación del soporte de modo oscuro: fondos de acento oscuro, contraste mínimo 4.5:1 (WCAG 2.1), indicadores de conexión visibles.
- Funcionalidad en navegadores modernos (Chrome, Firefox, Edge, Safari).
- Visualización en distintos viewports representativos (TV de sala de espera, computador, tablet, móvil).

### 3.2 Out of Scope

- Lógica de negocio de turnos (creación, procesamiento, asignación de consultorio).
- Modificaciones en autenticación o autorización.
- Cambios en el backend o en los servicios de WebSocket.
- Modificaciones en la barra de navegación (cubierto en `navbar_improvement.feature.md`).
- Rediseño completo del sistema de diseño (design system) del proyecto.
- Pruebas de rendimiento o carga de la pantalla de turnos.
- Contenido de otras pantallas del sistema (login, dashboard, gestión de médicos).

## 4. User Stories & Acceptance Criteria

| User Story | Acceptance Criteria |
|------------|---------------------|
| HU-04: Mejora de la experiencia visual de la pantalla de turnos habilitados | - Tarjetas de turnos llamados con bordes redondeados, sombra sutil y fondo de acento verde<br>- Nombre del paciente en tipografía prominente (mínimo 1.5rem) en turnos llamados<br>- Ícono representativo junto al número de consultorio en turnos llamados<br>- Tarjetas de turnos en espera con fondo neutro y tipografía de menor jerarquía<br>- "Sin consultorio" mostrado con estilo atenuado en turnos en espera<br>- Grid responsivo que adapta columnas según el viewport<br>- Encabezado "Turnos Llamados" con ícono de megáfono o altavoz<br>- Encabezado "En Espera" con ícono de reloj<br>- Ambos encabezados en negrita con jerarquía tipográfica coherente<br>- Indicador dot verde + "Conectado en tiempo real" cuando WebSocket está conectado<br>- Indicador dot rojo + "Desconectado — reconectando..." cuando WebSocket está desconectado<br>- Estado vacío con ícono centrado + "No hay turnos registrados" cuando no hay turnos<br>- Animación fade-in + deslizamiento desde abajo al aparecer nuevas tarjetas (300ms–500ms)<br>- Animación no interrumpe tarjetas existentes<br>- Layout responsivo: 2-3 columnas >1024px, 2 columnas 768px–1024px, 1 columna <768px<br>- Modo oscuro: fondos de acento oscuro, contraste mínimo 4.5:1, indicadores visibles |

## 5. Test Scenarios

### 5.1 Positive Scenarios

**HU-04 — Diferenciación visual de tarjetas por estado**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-01 | Tarjeta de turno llamado con estilo de acento | Existen turnos con estado "called" | 1. Acceder a la pantalla de turnos habilitados | Cada tarjeta de turno llamado muestra fondo de color verde claro o acento distintivo, bordes redondeados y sombra sutil |
| TC-02 | Nombre del paciente en tipografía prominente en turno llamado | Existen turnos con estado "called" | 1. Observar las tarjetas de turnos llamados | El nombre del paciente se muestra en tipografía grande (mínimo 1.5rem) |
| TC-03 | Ícono de consultorio en tarjeta de turno llamado | Turno llamado con consultorio asignado | 1. Observar la tarjeta del turno | El número de consultorio aparece acompañado de un ícono representativo debajo del nombre del paciente |
| TC-04 | Tarjeta de turno en espera con estilo neutro | Existen turnos con estado "waiting" | 1. Acceder a la pantalla de turnos habilitados | Cada tarjeta de turno en espera muestra fondo neutro (gris claro o blanco) y bordes redondeados |
| TC-05 | Nombre del paciente con menor jerarquía en turno en espera | Existen turnos con estado "waiting" | 1. Comparar tipografía entre tarjetas | El nombre del paciente en espera usa tipografía legible pero de menor tamaño que en los turnos llamados |
| TC-06 | "Sin consultorio" con estilo atenuado | Turno en espera sin consultorio asignado | 1. Observar la tarjeta del turno en espera | El texto "Sin consultorio" se muestra con un estilo visual atenuado (color gris o menor opacidad) |
| TC-07 | Mayor prominencia visual de tarjetas llamadas sobre tarjetas en espera | Existen ambos tipos de turnos simultáneamente | 1. Observar la pantalla completa | Las tarjetas de turnos llamados tienen mayor peso visual que las de espera (tamaño, color, jerarquía) |

**HU-04 — Encabezados de sección con íconos descriptivos**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-08 | Encabezado "Turnos Llamados" con ícono de megáfono | Existen turnos con estado "called" | 1. Observar el encabezado de la sección de turnos llamados | El encabezado muestra un ícono de megáfono o altavoz junto al texto "Turnos Llamados" en negrita |
| TC-09 | Encabezado "En Espera" con ícono de reloj | Existen turnos con estado "waiting" | 1. Observar el encabezado de la sección en espera | El encabezado muestra un ícono de reloj junto al texto "En Espera" en negrita |
| TC-10 | Jerarquía tipográfica coherente en encabezados | Pantalla con ambas secciones visibles | 1. Comparar tamaños y pesos tipográficos de ambos encabezados | Ambos encabezados usan negrita con tamaño coherente y consistente con la jerarquía visual de la página |

**HU-04 — Indicador de conexión en tiempo real**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-11 | Indicador de conexión activa (dot verde) | WebSocket conectado | 1. Acceder a la pantalla de turnos | Se muestra un dot circular verde pequeño con el texto "Conectado en tiempo real" en fuente reducida y color atenuado, debajo del título principal |
| TC-12 | Indicador de desconexión (dot rojo) | WebSocket desconectado o inaccesible | 1. Simular pérdida de conexión WebSocket | El indicador cambia a un dot rojo con el texto "Desconectado — reconectando..." en color de advertencia |
| TC-13 | Transición del indicador al recuperar conexión | WebSocket se reconecta después de una pérdida | 1. Simular reconexión | El indicador vuelve al estado dot verde + "Conectado en tiempo real" |

**HU-04 — Estado vacío**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-14 | Estado vacío con ícono y mensaje centrados | No existen turnos registrados, conexión activa | 1. Acceder a la pantalla sin turnos en el sistema | Se muestra un ícono ilustrativo grande centrado y el mensaje "No hay turnos registrados" con tipografía en gris suave, ambos centrados horizontal y verticalmente |

**HU-04 — Animación de entrada**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-15 | Animación fade-in al aparecer nueva tarjeta | Pantalla con turnos existentes | 1. Agregar un nuevo turno al sistema en tiempo real y observar la pantalla | La nueva tarjeta aparece con una animación suave de fade-in y deslizamiento desde abajo |
| TC-16 | Duración de la animación entre 300ms y 500ms | Nueva tarjeta en proceso de aparición | 1. Medir visualmente o con DevTools la duración de la animación | La animación dura entre 300ms y 500ms |
| TC-17 | Animación no interrumpe tarjetas existentes | Existen tarjetas en la pantalla cuando llega una nueva | 1. Observar las tarjetas existentes durante la animación de la nueva | Las tarjetas existentes permanecen estáticas y sin desplazamientos involuntarios |

**HU-04 — Diseño responsivo**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-18 | Grid de 2–3 columnas en pantallas mayores a 1024px | Viewport > 1024px (computador o TV) | 1. Acceder a la pantalla desde un dispositivo con ancho > 1024px | Las tarjetas se disponen en 2 o 3 columnas con espaciado consistente |
| TC-19 | Grid de 2 columnas en pantallas entre 768px y 1024px | Viewport entre 768px y 1024px (tablet) | 1. Acceder desde viewport de ~768–1024px | Las tarjetas se disponen en 2 columnas con textos legibles |
| TC-20 | Grid de 1 columna en pantallas menores a 768px | Viewport < 768px (móvil) | 1. Acceder desde viewport menor a 768px | Las tarjetas se apilan en una sola columna con textos legibles y espaciado consistente |

**HU-04 — Modo oscuro**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-21 | Tarjetas llamadas en modo oscuro con contraste legible | Modo oscuro activado, turnos con estado "called" | 1. Activar modo oscuro y acceder a la pantalla | Las tarjetas de turnos llamados usan fondo de acento oscuro con contraste mínimo 4.5:1 |
| TC-22 | Tarjetas en espera en modo oscuro con fondo neutro oscuro | Modo oscuro activado, turnos con estado "waiting" | 1. Activar modo oscuro y observar tarjetas en espera | Las tarjetas muestran fondo oscuro neutro con bordes sutiles y textos legibles |
| TC-23 | Indicadores de conexión visibles en modo oscuro | Modo oscuro activado, WebSocket conectado | 1. Observar el indicador de conexión con modo oscuro | El dot verde y el texto "Conectado en tiempo real" son claramente visibles sobre el fondo oscuro |

### 5.2 Negative Scenarios

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-24 | Estado vacío no muestra tarjetas rotas ni errores visuales | No hay turnos y conexión activa | 1. Acceder a la pantalla sin turnos | No se muestran tarjetas vacías, espacios en blanco no justificados ni elementos rotos; solo ícono + mensaje de estado vacío |
| TC-25 | Pérdida de conexión no rompe el layout de la pantalla | WebSocket desconectado con turnos ya cargados | 1. Simular pérdida de conexión con turnos visibles | Las tarjetas existentes permanecen visibles y correctamente estilizadas; solo cambia el indicador de conexión |
| TC-26 | Animación no genera parpadeo ni superposición de tarjetas | Múltiples turnos llegando en rápida sucesión | 1. Agregar varios turnos en secuencia rápida | Cada tarjeta aparece con su animación sin solaparse, parpadear ni desplazar las existentes |
| TC-27 | Modo oscuro no produce textos o íconos invisibles | Modo oscuro activado | 1. Revisar todos los elementos de la pantalla con modo oscuro | Todos los textos, íconos e indicadores mantienen contraste mínimo de 4.5:1 según WCAG 2.1 |
| TC-28 | Viewport menor a 768px no genera scroll horizontal | Móvil con viewport < 768px | 1. Acceder desde un dispositivo móvil estrecho | La pantalla no genera scroll horizontal; todo el contenido cabe dentro del ancho disponible |
| TC-29 | Turno con nombre de paciente muy largo no rompe la tarjeta | Turno con nombre de más de 40 caracteres | 1. Registrar un turno con nombre largo y observar la tarjeta | El texto se trunca o ajusta correctamente sin desbordarse del contenedor de la tarjeta |
| TC-30 | La pantalla sin conexión no muestra contenido de otros módulos | WebSocket sin respuesta, sin turnos cargados | 1. Acceder a la pantalla con servicio caído | Se muestra el indicador de desconexión y el estado vacío; no hay elementos de otros módulos ni errores sin controlar |

## 6. Test Strategy

### 6.1 Execution

| Tipo | Enfoque | Herramienta/Método |
|------|---------|--------------------|
| **Pruebas Funcionales (Manual)** | Verificación visual de tarjetas, encabezados, indicador de conexión, estado vacío, animaciones y responsividad en Chrome, Firefox, Edge y Safari | Exploración manual con checklist basado en los TC definidos |
| **Pruebas de Regresión (Manual)** | Verificar que la funcionalidad existente de la pantalla de turnos (recepción en tiempo real, actualización automática) sigue operando correctamente tras los cambios visuales | Navegación por la pantalla con turnos activos en staging |
| **Pruebas Unitarias (Automatizadas)** | Validar que los componentes de tarjeta, encabezado, indicador de conexión y estado vacío renderizan correctamente las clases CSS, los textos y los íconos según el estado recibido como prop | Jest + React Testing Library |
| **Pruebas de Integración (Automatizadas)** | Validar el comportamiento visual completo de la pantalla ante los distintos estados: turnos llamados, turnos en espera, sin turnos y desconexión WebSocket | Jest con mocks de contexto y WebSocket |
| **Pruebas Cross-Browser** | Verificar consistencia visual de tarjetas, animaciones y modo oscuro en navegadores modernos | Chrome 120+, Firefox 120+, Edge 120+, Safari 17+ |
| **Pruebas Responsivas** | Verificar el layout en viewports representativos para TV, computador, tablet y móvil | DevTools (320px, 768px, 1024px, 1440px, 1920px) |
| **Pruebas de Accesibilidad** | Verificar contraste mínimo 4.5:1 en modo claro y oscuro según WCAG 2.1 | DevTools Accessibility, Lighthouse Accessibility audit |

### 6.2 Data Strategy

| Dato | Descripción |
|------|-------------|
| Turno con estado "called" | Turno con estado llamado, consultorio asignado y nombre de paciente estándar |
| Turno con estado "waiting" | Turno en espera sin consultorio asignado |
| Turno con nombre largo | Nombre de paciente de más de 40 caracteres para verificar desbordamiento |
| Lista vacía de turnos | Sin turnos registrados en el sistema para verificar estado vacío |
| WebSocket desconectado | Servicio WebSocket inaccesible o con error para verificar indicador de desconexión |
| Modo oscuro activo | Sistema operativo o navegador con preferencia de modo oscuro habilitada |

No se requiere generación de datos masivos. Los estados de prueba se reproducen manualmente en staging o mediante mocks en pruebas automatizadas.

#### Clasificación de casos de prueba

| ID | Tipo | Justificación |
|----|------|---------------|
| TC-01 | Verificación | Confirma el criterio de spec: tarjeta llamada con fondo de acento, bordes redondeados y sombra |
| TC-02 | Verificación | Confirma el criterio de spec: tipografía del nombre del paciente con tamaño mínimo 1.5rem en turnos llamados |
| TC-03 | Verificación | Confirma el criterio de spec: ícono representativo junto al consultorio en tarjeta llamada |
| TC-04 | Verificación | Confirma el criterio de spec: tarjeta en espera con fondo neutro y bordes redondeados |
| TC-05 | Verificación | Confirma el criterio de spec: tipografía del nombre de menor jerarquía en turnos en espera vs. llamados |
| TC-06 | Verificación | Confirma el criterio de spec: "Sin consultorio" con estilo atenuado |
| TC-07 | Validación | Valida que el usuario puede distinguir visualmente en un vistazo los turnos llamados de los en espera |
| TC-08 | Verificación | Confirma el criterio de spec: encabezado "Turnos Llamados" con ícono de megáfono o altavoz |
| TC-09 | Verificación | Confirma el criterio de spec: encabezado "En Espera" con ícono de reloj |
| TC-10 | Verificación | Confirma el criterio de spec: ambos encabezados en negrita con jerarquía tipográfica coherente |
| TC-11 | Verificación | Confirma el criterio de spec: dot verde + texto "Conectado en tiempo real" cuando WebSocket está activo |
| TC-12 | Verificación | Confirma el criterio de spec: dot rojo + texto "Desconectado — reconectando..." cuando WebSocket se pierde |
| TC-13 | Validación | Valida que el usuario percibe correctamente la recuperación de la conexión sin necesidad de recargar la página |
| TC-14 | Validación | Valida que el usuario entiende que no hay turnos disponibles mediante un estado vacío claro y atractivo |
| TC-15 | Validación | Valida que el usuario percibe la llegada de un nuevo turno de forma suave sin desorientación visual |
| TC-16 | Verificación | Confirma el criterio de spec: duración de la animación dentro del rango 300ms–500ms |
| TC-17 | Verificación | Confirma el criterio de spec: la animación no genera desplazamiento en tarjetas existentes |
| TC-18 | Verificación | Confirma el criterio de spec: grid de 2–3 columnas en viewports mayores a 1024px |
| TC-19 | Verificación | Confirma el criterio de spec: grid de 2 columnas en viewports de 768px–1024px |
| TC-20 | Verificación | Confirma el criterio de spec: grid de 1 columna en viewports menores a 768px |
| TC-21 | Verificación | Confirma el criterio de spec: tarjetas llamadas en modo oscuro con contraste mínimo 4.5:1 |
| TC-22 | Verificación | Confirma el criterio de spec: tarjetas en espera en modo oscuro con fondo neutro oscuro y bordes sutiles |
| TC-23 | Verificación | Confirma el criterio de spec: indicadores de conexión visibles sobre fondos oscuros |
| TC-24 | Validación | Valida que la ausencia de turnos no genera una pantalla rota o confusa para el usuario |
| TC-25 | Validación | Valida que la pérdida de conexión no degrada ni rompe la visualización de turnos ya cargados |
| TC-26 | Validación | Valida la estabilidad visual ante la llegada rápida de múltiples turnos simultáneos |
| TC-27 | Verificación | Confirma exhaustivamente el cumplimiento del contraste WCAG 2.1 mínimo de 4.5:1 en modo oscuro |
| TC-28 | Validación | Valida que la experiencia en móvil no genera scroll horizontal ni contenido cortado |
| TC-29 | Validación | Valida la robustez del layout de tarjetas ante datos extremos (nombres muy largos) |
| TC-30 | Validación | Valida que el sistema presenta un estado controlado y comprensible cuando el servicio no responde |

## 7. Risk Matrix

| Risk Description | Probability (1-5) | Impact (1-5) | Risk Level | Mitigation |
|------------------|-------------------|--------------|------------|------------|
| Animaciones CSS generan parpadeo o jank en dispositivos de bajo rendimiento (TV de sala de espera) | 3 | 4 | 12 — Alto | Usar `animation` con `will-change: transform, opacity` limitado; verificar en dispositivos reales o emulados de gama baja (TC-15, TC-26) |
| Modo oscuro rompe el contraste de algún elemento no cubierto explícitamente en los estilos | 3 | 4 | 12 — Alto | Auditoría de accesibilidad con Lighthouse y DevTools sobre todos los elementos en modo oscuro; verificar contraste 4.5:1 (TC-27) |
| Layout responsivo genera scroll horizontal en viewports de móvil por ancho de tarjeta mal definido | 3 | 3 | 9 — Medio | Verificar en viewports de 320px, 375px y 414px con DevTools (TC-28) |
| Estado vacío no aparece cuando hay un transitorio de carga antes de recibir la lista de turnos | 2 | 3 | 6 — Medio | Gestionar estado de carga explícito (loading vs. empty) en el componente; verificar con throttling de red (TC-14, TC-24) |
| Indicador de conexión no cambia de estado al perder y recuperar el WebSocket por condición de carrera | 2 | 4 | 8 — Medio | Verificar ciclo completo conexión → desconexión → reconexión con simulación controlada (TC-12, TC-13) |
| Tarjeta con nombre de paciente largo desborda el contenedor en grid de 1 columna (móvil) | 2 | 3 | 6 — Medio | Aplicar `overflow: hidden` con `text-overflow: ellipsis` o `word-break`; verificar con caso de prueba de nombre extenso (TC-29) |
| La diferenciación visual entre tarjetas llamadas y en espera no es suficiente en modo de alto contraste o daltonismo | 2 | 4 | 8 — Medio | Complementar diferenciación de color con indicadores adicionales (ícono, borde, tamaño); verificar con simulador de daltonismo en DevTools |

## 8. Prerequisites & Requirements

- Entorno de desarrollo o staging con el sistema desplegado (frontend + backend + base de datos).
- Al menos un turno con estado "called" y uno con estado "waiting" disponibles para pruebas manuales.
- Servicio WebSocket accesible y con capacidad de simular desconexión controlada.
- Navegadores instalados: Chrome 120+, Firefox 120+, Edge 120+, Safari 17+.
- Acceso a DevTools para simular viewports, throttling de red y preferencias de modo oscuro.
- Dispositivo o emulador con pantalla de resolución ≥ 1920px para simular TV de sala de espera.
- Herramienta de auditoría de accesibilidad (Lighthouse o extensión de axe) para verificar contraste WCAG 2.1.
- Verificación previa de que la pantalla de turnos habilitados funciona correctamente sin los cambios visuales (línea base de regresión).

## 9. Schedule & Agreements

| Fase | Duración Estimada | Responsable |
|------|-------------------|-------------|
| Preparación del entorno y datos de prueba | 0.5 día | QA |
| Ejecución de pruebas funcionales visuales manuales (TC-01 a TC-23) | 1 día | QA |
| Ejecución de pruebas negativas manuales (TC-24 a TC-30) | 0.5 día | QA |
| Ejecución de pruebas cross-browser y responsivas | 0.5 día | QA |
| Auditoría de accesibilidad (contraste WCAG 2.1, modo oscuro) | 0.5 día | QA |
| Revisión de pruebas unitarias/integración automatizadas | 0.5 día | QA + Dev |
| Reporte de defectos y retesting | Según hallazgos | QA |

**Acuerdos del equipo:**
- Los defectos se reportan en el sistema de seguimiento de issues con evidencia (screenshot o video), pasos de reproducción, viewport/navegador afectado y severidad.
- Los defectos bloqueantes se comunican inmediatamente al equipo de desarrollo.
- Criterio de salida: todos los TC positivos pasan exitosamente; todos los TC negativos confirman el comportamiento esperado; no existen defectos críticos o bloqueantes abiertos; cumplimiento WCAG 2.1 verificado en modo claro y oscuro.

## 10. Team

| Name | Role |
|------|------|
| QA Engineer | Diseño y ejecución de test plan, auditoría de accesibilidad, reporte de defectos |
| Frontend Developer | Implementación de HU-04, corrección de defectos, soporte en pruebas automatizadas |
| Tech Lead / Reviewer | Revisión del test plan, aprobación de criterios de salida |
