# HU-AUTH-05: Cierre de sesión

**ID:** HU-AUTH-05  
**Módulo:** Autenticación  
**Prioridad:** Media  
**Versión:** 1.0

---

## Descripción

Como **usuario autenticado**, quiero poder cerrar mi sesión desde el menú de navegación, para garantizar que mi acceso quede desactivado cuando ya no estoy usando la aplicación.

---

## Criterios de aceptación

- El menú de navegación superior muestra una opción visible para cerrar sesión cuando el usuario está autenticado.
- Al presionar la opción de cierre de sesión, el sistema desactiva la sesión activa del usuario de forma inmediata.
- Tras cerrar la sesión, el usuario es llevado automáticamente a la pantalla de inicio de sesión.
- Una vez cerrada la sesión, el usuario no puede regresar a secciones protegidas usando el botón "atrás" del navegador; el sistema lo redirige nuevamente al inicio de sesión.
- El menú de navegación desaparece después del cierre de sesión.

---

## Reglas de negocio

- El cierre de sesión es irreversible; para volver a ingresar el usuario debe autenticarse nuevamente.
- La opción de cerrar sesión solo está disponible para usuarios con sesión activa.

---

## Flujo principal

1. El usuario autenticado presiona la opción de cierre de sesión en el menú.
2. El sistema desactiva la sesión del usuario.
3. El sistema lleva al usuario a la pantalla de inicio de sesión.

---

## Flujos alternos

| Situación | Respuesta del sistema |
| :--- | :--- |
| El usuario intenta volver atrás tras cerrar sesión | El sistema redirige nuevamente a la pantalla de inicio de sesión |

---

## Escenarios de validación

| ID | Escenario | Resultado esperado |
| :--- | :--- | :--- |
| CA-AUTH-05-01 | Cierre de sesión exitoso | Sesión desactivada y redirección a inicio de sesión |
| CA-AUTH-05-02 | Intento de acceso tras cerrar sesión | El sistema redirige a la pantalla de inicio de sesión |
| CA-AUTH-05-03 | Menú de navegación tras cierre de sesión | El menú no aparece |
