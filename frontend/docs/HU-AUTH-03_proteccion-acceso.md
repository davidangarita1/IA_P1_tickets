# HU-AUTH-03: Protección de acceso por sesión y perfil

**ID:** HU-AUTH-03  
**Módulo:** Autenticación  
**Prioridad:** Alta  
**Versión:** 1.0

---

## Descripción

Como **sistema**, quiero proteger automáticamente las secciones internas para que solo puedan ser accedidas por personas que hayan iniciado sesión y cuenten con el perfil adecuado, evitando el ingreso de personas no autorizadas.

---

## Criterios de aceptación

- Una persona que no ha iniciado sesión y accede a una sección protegida es redirigida automáticamente a la pantalla de inicio de sesión, sin poder ver el contenido restringido.
- Mientras el sistema verifica si el usuario tiene una sesión activa, no se muestra ningún contenido restringido.
- Un usuario que ha iniciado sesión pero no tiene el perfil requerido para una sección específica es enviado a una zona que sí le corresponde, sin poder ver el contenido no autorizado.
- Un usuario con sesión activa y el perfil correcto accede sin interrupciones al contenido de la sección.
- El menú de navegación superior solo aparece cuando el usuario ha iniciado sesión; en las pantallas públicas no se muestra.

---

## Reglas de negocio

- Las secciones protegidas son: el **panel principal** (dashboard).
- Las secciones públicas son: la **pantalla de turnos en espera**, la **solicitud y consulta de turnos**, el **formulario de registro de cuenta** y el **inicio de sesión**.
- Ambos perfiles (administrador y empleado) tienen acceso a las mismas secciones protegidas en esta versión del sistema.
- La verificación de acceso ocurre tanto al intentar ingresar directamente por URL como al navegar dentro de la aplicación.

---

## Flujo principal

1. El usuario intenta acceder a una sección protegida.
2. El sistema verifica si existe una sesión activa.
3. Si la sesión es válida, verifica el perfil del usuario.
4. Si el perfil es el adecuado, permite el acceso al contenido.

---

## Flujos alternos

| Situación | Respuesta del sistema |
| :--- | :--- |
| Sin sesión activa | Redirige a la pantalla de inicio de sesión |
| Sesión en proceso de verificación | No muestra contenido restringido mientras valida |
| Sesión activa pero perfil no permitido | Redirige a una zona accesible para ese perfil |
| Sesión activa y perfil correcto | Permite el acceso sin interrupciones |

---

## Escenarios de validación

| ID | Escenario | Resultado esperado |
| :--- | :--- | :--- |
| CA-AUTH-03-01 | Acceso sin sesión a sección protegida | Redirección a pantalla de inicio de sesión |
| CA-AUTH-03-02 | Verificación de sesión en curso | No se muestra contenido restringido |
| CA-AUTH-03-03 | Sesión activa con perfil insuficiente | Redirección a zona permitida |
| CA-AUTH-03-04 | Sesión activa con perfil correcto | Contenido visible sin interrupciones |
| CA-AUTH-03-05 | Menú de navegación sin sesión | El menú no aparece en pantallas públicas |
