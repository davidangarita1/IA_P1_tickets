# HU-AUTH-01: Registro de usuario

**ID:** HU-AUTH-01  
**Módulo:** Autenticación  
**Prioridad:** Alta  
**Versión:** 1.0

---

## Descripción

Como **usuario nuevo**, quiero registrarme en el sistema ingresando mi nombre, correo electrónico, contraseña y perfil, para poder acceder a las secciones internas de la plataforma.

---

## Criterios de aceptación

- El formulario de registro solicita los siguientes datos: nombre completo, correo electrónico, contraseña y perfil (administrador o empleado).
- El sistema no permite continuar si alguno de los campos está vacío; en ese caso muestra un aviso indicando qué campo falta por completar.
- La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una letra minúscula, un número y un carácter especial. Si no cumple alguno de estos requisitos, el sistema informa al usuario qué regla no se ha cumplido.
- Si el correo ingresado ya pertenece a una cuenta existente, el sistema informa que ese correo ya está registrado y no crea una cuenta duplicada.
- Al completar el registro correctamente, el sistema muestra un mensaje confirmando que la cuenta fue creada y lleva al usuario a la pantalla de inicio de sesión.
- Toda la información ingresada es verificada y saneada por el sistema antes de ser procesada.

---

## Reglas de negocio

- El correo electrónico debe ser único dentro del sistema; no se permiten cuentas con el mismo correo.
- Los perfiles disponibles al momento del registro son: **administrador** y **empleado**.
- La pantalla de registro es pública; cualquier persona puede acceder a ella sin haber iniciado sesión.
- Tras un registro exitoso, el usuario debe iniciar sesión manualmente; el sistema no inicia la sesión de forma automática.

---

## Flujo principal

1. La persona accede a la pantalla de registro.
2. Completa el formulario con nombre, correo, contraseña y perfil.
3. Envía el formulario.
4. El sistema valida los datos ingresados.
5. Si todo es correcto, el sistema crea la cuenta y muestra confirmación.
6. El sistema lleva al usuario a la pantalla de inicio de sesión.

---

## Flujos alternos

| Situación | Respuesta del sistema |
| :--- | :--- |
| Algún campo está vacío | Muestra aviso indicando el campo faltante y no envía el formulario |
| La contraseña no cumple las reglas | Informa qué requisito no se cumplió |
| El correo ya existe | Informa que el correo ya está registrado y no crea la cuenta |

---

## Escenarios de validación

| ID | Escenario | Resultado esperado |
| :--- | :--- | :--- |
| CA-AUTH-01-01 | Registro con todos los datos válidos | Cuenta creada; se confirma y se dirige al inicio de sesión |
| CA-AUTH-01-02 | Envío con campos vacíos | El sistema no procesa el registro |
| CA-AUTH-01-03 | Contraseña sin mayúscula | Se informa el requisito incumplido |
| CA-AUTH-01-04 | Contraseña de menos de 8 caracteres | Se informa el requisito de longitud mínima |
| CA-AUTH-01-05 | Correo ya registrado en el sistema | Se informa que el correo ya existe |
| CA-AUTH-01-06 | Registro exitoso redirige al ingreso | El usuario es llevado a la pantalla de inicio de sesión |
