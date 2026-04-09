# Test Plan: Mejoras de Navegación — Sistema de Turnos EPS

## 1. Objetivo

Verificar que las mejoras implementadas en la barra de navegación del Sistema de Turnos EPS funcionan correctamente para todos los perfiles de usuario (visitante no autenticado, Empleado y Administrador), garantizando que los renombramientos de botones, los cambios de ruta y la visibilidad condicional operan según los criterios de aceptación definidos en las historias de usuario HU-01, HU-02 y HU-03.

## 2. Descripción

Este plan de pruebas cubre las tres historias de usuario que componen la épica "Optimización de la Barra de Navegación Pública y Autenticada":

- **HU-01:** Renombramiento del botón "Registrar" a "Solicitar Turno", cambio de ruta `/register` → `/solicitar-turno`, habilitación del botón en la barra de navegación pública para usuarios no autenticados y redirección de la ruta anterior.
- **HU-02:** Adición del botón "Turnos" en la barra de navegación para usuarios no autenticados (y persistencia para usuarios autenticados), navegando a la ruta raíz `/`.
- **HU-03:** Renombramiento del botón "Dashboard" a "Historial Turnos" en la barra de navegación para usuarios autenticados, manteniendo la ruta `/dashboard`.

Todas las funcionalidades son cambios exclusivos de frontend (renombramiento de etiquetas, actualización de rutas y control de visibilidad). No hay cambios en lógica de negocio, autenticación ni backend.

## 3. Scope

### 3.1 In Scope

- Verificación de renombramiento de botón "Registrar" → "Solicitar Turno" en todos los puntos donde aparece.
- Verificación de cambio de ruta `/register` → `/solicitar-turno`.
- Verificación de redirección automática de `/register` a `/solicitar-turno`.
- Visibilidad de la barra de navegación pública (botones "Solicitar Turno", "Turnos", "Iniciar Sesión") para usuarios no autenticados.
- Ocultamiento de la barra de navegación pública para usuarios autenticados (Empleado/Administrador).
- Presencia y funcionalidad del botón "Turnos" para todos los perfiles de usuario.
- Coexistencia del botón "Turnos" con el logo "Sistema de Turnos" como elementos de navegación independientes.
- Renombramiento del botón "Dashboard" → "Historial Turnos" para usuarios autenticados.
- Estilo activo (resaltado) en cada botón según la ruta actual del usuario.
- Navegación correcta al hacer clic en cada botón de la barra.
- Funcionalidad en navegadores modernos (Chrome, Firefox, Edge, Safari).
- Responsividad de la barra de navegación en distintos viewports.

### 3.2 Out of Scope

- Lógica de negocio de turnos (creación, procesamiento, asignación de consultorio).
- Flujos de autenticación y autorización (login, logout, registro de cuenta).
- Cambios en el backend o servicios de WebSocket.
- Pantallas destino (contenido de `/solicitar-turno`, `/dashboard`, `/`): solo se verifica que la navegación llega al destino correcto, no la funcionalidad interna de cada pantalla.
- Rediseño visual de pantallas (cubierto en `ui_ux_improvements.feature.md`).
- Pruebas de rendimiento o carga.

## 4. User Stories & Acceptance Criteria

| User Story | Acceptance Criteria |
|------------|---------------------|
| HU-01: Renombramiento del botón "Registrar" y habilitación en la barra de navegación pública | - El botón "Registrar" se renombra a "Solicitar Turno" en todos los puntos donde aparece<br>- La ruta cambia de `/register` a `/solicitar-turno`<br>- La pantalla de destino permanece sin cambios<br>- La barra de navegación pública es visible para usuarios no autenticados con los botones "Solicitar Turno" e "Iniciar Sesión"<br>- Clic en "Solicitar Turno" navega a `/solicitar-turno`<br>- La ruta `/register` redirige automáticamente a `/solicitar-turno`<br>- El botón muestra estilo activo en `/solicitar-turno`<br>- La barra pública no es visible para usuarios autenticados |
| HU-02: Visibilidad del botón "Turnos" en la barra de navegación sin autenticación | - El botón "Turnos" es visible para usuarios no autenticados junto a "Solicitar Turno" e "Iniciar Sesión"<br>- Clic en "Turnos" navega a la ruta raíz `/`<br>- El logo y el botón "Turnos" coexisten como elementos de navegación independientes<br>- El botón muestra estilo activo en la ruta `/`<br>- El botón permanece visible para usuarios autenticados |
| HU-03: Renombrar el botón "Dashboard" a "Historial Turnos" | - El botón muestra "Historial Turnos" en lugar de "Dashboard"<br>- La ruta sigue siendo `/dashboard`<br>- Clic en "Historial Turnos" navega a `/dashboard` y muestra el título "Historial de Turnos Atendidos"<br>- El botón muestra estilo activo en `/dashboard`<br>- La palabra "Dashboard" no aparece en ningún punto de la barra de navegación |

## 5. Test Scenarios

### 5.1 Positive Scenarios

**HU-01 — Renombramiento y habilitación de "Solicitar Turno"**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-01 | Verificar renombramiento del botón | Usuario no autenticado | 1. Acceder a cualquier página pública | El botón muestra "Solicitar Turno" (no "Registrar") |
| TC-02 | Navbar pública visible sin autenticación | Usuario no autenticado | 1. Acceder a la ruta `/` | La barra muestra "Solicitar Turno", "Turnos" e "Iniciar Sesión" |
| TC-03 | Navegación al hacer clic en "Solicitar Turno" | Usuario no autenticado, navbar visible | 1. Clic en "Solicitar Turno" | La URL cambia a `/solicitar-turno` y se muestra la pantalla de solicitud de turno |
| TC-04 | Redirección de ruta antigua `/register` | Usuario accede directamente a `/register` | 1. Escribir `/register` en el navegador | El sistema redirige a `/solicitar-turno` con la funcionalidad intacta |
| TC-05 | Estilo activo en botón "Solicitar Turno" | Usuario en `/solicitar-turno` | 1. Observar la barra de navegación | El botón "Solicitar Turno" muestra estilo visual activo/resaltado |
| TC-06 | Navbar pública oculta para usuario autenticado | Usuario Empleado autenticado | 1. Navegar por páginas internas | La barra pública no es visible; se muestra la barra autenticada |

**HU-02 — Botón "Turnos" en la barra de navegación**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-07 | Botón "Turnos" visible sin autenticación | Usuario no autenticado | 1. Acceder a cualquier página pública | El botón "Turnos" aparece en la barra de navegación |
| TC-08 | Clic en "Turnos" navega a la ruta raíz | Usuario no autenticado | 1. Clic en "Turnos" | La URL cambia a `/` y se muestra la pantalla de "Turnos Habilitados" |
| TC-09 | Coexistencia del botón "Turnos" con el logo | Usuario no autenticado | 1. Observar la barra de navegación | Tanto el logo "Sistema de Turnos" como el botón "Turnos" están presentes y son enlaces funcionales a `/` |
| TC-10 | Estilo activo en botón "Turnos" en ruta raíz | Usuario en la ruta `/` | 1. Observar la barra de navegación | El botón "Turnos" muestra estilo visual activo/resaltado |
| TC-11 | Botón "Turnos" visible para usuario autenticado | Usuario Empleado autenticado | 1. Navegar por páginas internas | El botón "Turnos" permanece visible y funcional |
| TC-12 | Estilo activo en "Turnos" para usuario autenticado en ruta raíz | Usuario Administrador autenticado en `/` | 1. Observar la barra | El botón "Turnos" muestra estilo activo |

**HU-03 — Renombramiento de "Dashboard" a "Historial Turnos"**

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-13 | Botón muestra "Historial Turnos" | Usuario Empleado autenticado | 1. Observar la barra de navegación | El botón muestra "Historial Turnos" (no "Dashboard") |
| TC-14 | Clic en "Historial Turnos" navega a `/dashboard` | Usuario autenticado | 1. Clic en "Historial Turnos" | La URL cambia a `/dashboard` y se muestra la pantalla con título "Historial de Turnos Atendidos" |
| TC-15 | Estilo activo en "Historial Turnos" en `/dashboard` | Usuario autenticado en `/dashboard` | 1. Observar la barra | El botón "Historial Turnos" muestra estilo activo |
| TC-16 | Ausencia total de la palabra "Dashboard" en la navbar | Usuario autenticado | 1. Inspeccionar todos los elementos de la barra | La palabra "Dashboard" no aparece en ningún punto de la barra de navegación |

### 5.2 Negative Scenarios

| ID | Escenario | Precondición | Pasos | Resultado Esperado |
|----|-----------|-------------|-------|-------------------|
| TC-17 | Navbar pública no aparece tras autenticarse | Usuario no autenticado ve la barra pública | 1. Iniciar sesión con credenciales válidas | La barra pública desaparece y se muestra la barra autenticada |
| TC-18 | URL inválida `/registrar` no muestra pantalla incorrecta | Usuario accede a `/registrar` (variante errada) | 1. Escribir `/registrar` en el navegador | El sistema muestra página 404 o redirige a la ruta correcta; no muestra contenido roto |
| TC-19 | Botón "Solicitar Turno" no muestra estilo activo en otra ruta | Usuario en `/` (ruta raíz) | 1. Observar la barra | El botón "Solicitar Turno" NO muestra estilo activo (solo debe activarse en `/solicitar-turno`) |
| TC-20 | Botón "Turnos" no muestra estilo activo en ruta distinta a `/` | Usuario en `/solicitar-turno` | 1. Observar la barra | El botón "Turnos" NO muestra estilo activo |
| TC-21 | Botón "Historial Turnos" no visible sin autenticación | Usuario no autenticado | 1. Observar la barra pública | El botón "Historial Turnos" no aparece en la barra de navegación pública |
| TC-22 | Texto "Registrar" no aparece en ninguna navbar | Usuario autenticado o no | 1. Inspeccionar la barra en ambos estados | La palabra "Registrar" no aparece en ningún elemento de navegación |
| TC-23 | Navegación forzada a `/dashboard` sin autenticación | Usuario no autenticado | 1. Escribir `/dashboard` en la URL | El sistema redirige a la pantalla de inicio de sesión |
| TC-24 | Doble clic rápido en botón de navegación | Usuario no autenticado | 1. Clic doble rápido en "Solicitar Turno" | El sistema navega correctamente una sola vez, sin errores ni duplicación de navegación |

## 6. Test Strategy

### 6.1 Execution

| Tipo | Enfoque | Herramienta/Método |
|------|---------|--------------------|
| **Pruebas Funcionales (Manual)** | Verificación visual de etiquetas, rutas, estilos activos y visibilidad condicional en navegadores Chrome, Firefox, Edge y Safari | Exploración manual con checklist basado en los TC definidos |
| **Pruebas de Regresión (Manual)** | Verificar que las rutas existentes (`/`, `/login`, `/dashboard`, `/medicos`) siguen funcionando correctamente tras los cambios | Navegación completa por cada ruta del sistema |
| **Pruebas Unitarias (Automatizadas)** | Validar que el componente de navegación renderiza los botones correctos según el estado de autenticación | Jest + React Testing Library |
| **Pruebas de Integración (Automatizadas)** | Validar la redirección de `/register` → `/solicitar-turno` y la navegación entre rutas | Jest + Next.js Router mocking |
| **Pruebas Cross-Browser** | Verificar consistencia visual y funcional de la barra de navegación | Chrome 120+, Firefox 120+, Edge 120+, Safari 17+ |
| **Pruebas Responsivas** | Verificar que la barra de navegación se adapta correctamente a distintos viewports | DevTools (320px, 768px, 1024px, 1440px) |

### 6.2 Data Strategy

| Dato | Descripción |
|------|-------------|
| Usuario Empleado | Cuenta con rol `Empleado` y sesión activa válida |
| Usuario Administrador | Cuenta con rol `Administrador` y sesión activa válida |
| Visitante no autenticado | Acceso sin credenciales ni sesión almacenada |
| Sesión expirada | Token de sesión vencido para validar redirección |

No se requiere generación de datos masivos. Los perfiles de prueba se crean manualmente o reutilizan datos de staging existentes.

#### Clasificación de casos de prueba

| ID | Tipo | Justificación |
|----|------|---------------|
| TC-01 | Verificación | Confirma conformidad con el criterio de spec: el botón debe llamarse "Solicitar Turno" en todos los puntos |
| TC-02 | Validación | Valida que el usuario no autenticado puede identificar sus opciones de navegación disponibles |
| TC-03 | Validación | Valida el flujo real del usuario: navegar al formulario de solicitud de turno desde la barra |
| TC-04 | Verificación | Confirma que la redirección técnica de `/register` → `/solicitar-turno` está implementada correctamente |
| TC-05 | Verificación | Confirma el criterio de spec: el estilo activo se aplica sobre la ruta `/solicitar-turno` |
| TC-06 | Verificación | Confirma el criterio de spec: la barra pública no debe mostrarse a usuarios autenticados |
| TC-07 | Verificación | Confirma el criterio de spec: el botón "Turnos" es visible en la navbar sin autenticación |
| TC-08 | Validación | Valida el flujo real del usuario: navegar a la pantalla pública de turnos desde la navbar |
| TC-09 | Verificación | Confirma el criterio de spec: logo y botón "Turnos" coexisten como elementos independientes |
| TC-10 | Verificación | Confirma el criterio de spec: el botón "Turnos" muestra estilo activo en la ruta raíz `/` |
| TC-11 | Verificación | Confirma el criterio de spec: el botón "Turnos" permanece visible para usuarios autenticados |
| TC-12 | Validación | Valida que el usuario autenticado puede usar el botón "Turnos" sin fricción desde su sesión |
| TC-13 | Verificación | Confirma el criterio de spec: el botón debe mostrar el texto "Historial Turnos" |
| TC-14 | Validación | Valida el flujo real del usuario autenticado: acceder al historial de turnos desde la navbar |
| TC-15 | Verificación | Confirma el criterio de spec: el estilo activo se aplica sobre la ruta `/dashboard` |
| TC-16 | Verificación | Confirma exhaustivamente que la cadena "Dashboard" fue eliminada de todos los elementos de la navbar |
| TC-17 | Validación | Valida que la transición de no autenticado a autenticado actualiza la navbar correctamente sin dejar rastros de la barra pública |
| TC-18 | Validación | Valida que rutas inválidas similares no rompen ni degradan la experiencia del usuario |
| TC-19 | Verificación | Confirma la exclusividad del estilo activo: "Solicitar Turno" no se resalta en rutas distintas a `/solicitar-turno` |
| TC-20 | Verificación | Confirma la exclusividad del estilo activo: "Turnos" no se resalta en rutas distintas a `/` |
| TC-21 | Verificación | Confirma que "Historial Turnos" no se expone en la navbar pública para no autenticados |
| TC-22 | Verificación | Confirma exhaustivamente la ausencia del texto "Registrar" en la navbar en ambos estados de sesión |
| TC-23 | Validación | Valida que el sistema protege las rutas privadas y guía al usuario al login cuando corresponde |
| TC-24 | Validación | Valida la estabilidad de la experiencia de usuario ante interacciones rápidas o repetidas |

## 7. Risk Matrix

| Risk Description | Probability (1-5) | Impact (1-5) | Risk Level | Mitigation |
|------------------|-------------------|--------------|------------|------------|
| Usuarios con la ruta `/register` guardada en favoritos no llegan al destino | 3 | 4 | 12 — Alto | Implementar y verificar la redirección 301/302 de `/register` → `/solicitar-turno` (TC-04) |
| Botón "Solicitar Turno" no aparece en navegadores específicos (Safari, mobile) | 2 | 4 | 8 — Medio | Ejecutar pruebas cross-browser y responsivas (TC-02, TC-07) |
| Estilo activo aplicado simultáneamente a múltiples botones por error de lógica de ruta | 3 | 2 | 6 — Medio | Verificar exclusividad del estilo activo en cada ruta (TC-19, TC-20) |
| La palabra "Dashboard" persiste en algún componente no cubierto por los cambios | 2 | 3 | 6 — Medio | Búsqueda exhaustiva de la cadena "Dashboard" en el código y verificación visual (TC-16) |
| La barra pública se muestra brevemente antes de cargar el estado de autenticación (flash) | 3 | 3 | 9 — Medio | Verificar el comportamiento durante la carga inicial con throttling de red (TC-17) |
| Conflicto de ruta al coexistir `/register` (redirect) y `/solicitar-turno` (destino) | 2 | 4 | 8 — Medio | Validar que la redirección funciona sin loops y que la ruta original no renderiza contenido propio |

## 8. Prerequisites & Requirements

- Entorno de desarrollo o staging con el sistema desplegado (frontend + backend + base de datos).
- Al menos un usuario con rol `Empleado` y uno con rol `Administrador` registrados en el sistema.
- Navegadores instalados: Chrome 120+, Firefox 120+, Edge 120+, Safari 17+.
- Acceso a DevTools para simular distintos viewports y throttling de red.
- Código fuente de la feature branch con las tres HUs implementadas y desplegado en el entorno de pruebas.
- Verificación previa de que los flujos de login y logout funcionan correctamente (dependencia para TC-06, TC-11, TC-13, TC-17).

## 9. Schedule & Agreements

| Fase | Duración Estimada | Responsable |
|------|-------------------|-------------|
| Preparación del entorno y datos de prueba | 0.5 día | QA |
| Ejecución de pruebas funcionales manuales (TC-01 a TC-24) | 1 día | QA |
| Ejecución de pruebas cross-browser y responsivas | 0.5 día | QA |
| Revisión de pruebas unitarias/integración automatizadas | 0.5 día | QA + Dev |
| Reporte de defectos y retesting | Según hallazgos | QA |

**Acuerdos del equipo:**
- Los defectos se reportan en el sistema de seguimiento de issues con evidencia (screenshot o video), pasos de reproducción y severidad.
- Los defectos bloqueantes se comunican inmediatamente al equipo de desarrollo.
- Criterio de salida: todos los TC positivos pasan exitosamente; todos los TC negativos confirman el comportamiento esperado; no existen defectos críticos o bloqueantes abiertos.

## 10. Team

| Name | Role |
|------|------|
| QA Engineer | Diseño y ejecución de test plan, reporte de defectos |
| Frontend Developer | Implementación de las HUs, corrección de defectos, soporte en pruebas automatizadas |
| Tech Lead / Reviewer | Revisión del test plan, aprobación de criterios de salida |
