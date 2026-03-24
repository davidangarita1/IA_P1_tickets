# HU-AUTH-02: Inicio de sesión

**ID:** HU-AUTH-02  
**Módulo:** Autenticación  
**Prioridad:** Alta  
**Versión:** 1.0

---

## Descripción

Como **usuario registrado**, quiero iniciar sesión con mi correo electrónico y contraseña, para acceder al panel principal y a las demás secciones internas de la plataforma.

---

## Criterios de aceptación

- El formulario de inicio de sesión solicita correo electrónico y contraseña.
- El sistema no permite continuar si alguno de los dos campos está vacío.
- Al ingresar credenciales correctas, el usuario accede al panel principal y su sesión queda activa.
- Si las credenciales son incorrectas, el sistema informa el error sin redirigir al usuario a otra pantalla.
- Si el usuario llega a esta pantalla inmediatamente después de haber creado su cuenta, ve un mensaje de bienvenida confirmando la creación exitosa de su cuenta.
- El mensaje de bienvenida desaparece automáticamente transcurridos 4 segundos y no vuelve a aparecer si el usuario recarga la página.
- La pantalla de inicio de sesión es pública y accesible sin necesidad de haber ingresado previamente.

---

## Reglas de negocio

- El sistema no indica si el error corresponde al correo o a la contraseña; muestra un mensaje genérico de credenciales incorrectas para proteger la información de los usuarios.
- Una sesión activa permite al usuario navegar por las secciones internas sin necesidad de autenticarse de nuevo hasta que la sesión expire o se cierre manualmente.

---

## Flujo principal

1. El usuario accede a la pantalla de inicio de sesión.
2. Ingresa su correo electrónico y contraseña.
3. Envía el formulario.
4. El sistema verifica las credenciales.
5. Si son correctas, el usuario es llevado al panel principal con su sesión activa.

---

## Flujos alternos

| Situación | Respuesta del sistema |
| :--- | :--- |
| Algún campo está vacío | No se procesa el ingreso |
| Credenciales incorrectas | Se muestra mensaje de error; el usuario permanece en la pantalla |
| Usuario viene de un registro exitoso | Se muestra mensaje de bienvenida que desaparece a los 4 segundos |

---

## Escenarios de validación

| ID | Escenario | Resultado esperado |
| :--- | :--- | :--- |
| CA-AUTH-02-01 | Credenciales correctas | El usuario accede al panel principal |
| CA-AUTH-02-02 | Credenciales incorrectas | Se muestra mensaje de error |
| CA-AUTH-02-03 | Campos vacíos al enviar | El sistema no procesa el ingreso |
| CA-AUTH-02-04 | Usuario viene de registro exitoso | Se muestra mensaje de bienvenida |
| CA-AUTH-02-05 | Mensaje de bienvenida tras 4 segundos | El mensaje desaparece automáticamente |
