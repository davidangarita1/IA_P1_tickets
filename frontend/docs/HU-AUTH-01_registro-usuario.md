# HU-AUTH-01: Registro de usuario

**ID:** HU-AUTH-01  
**Módulo:** Autenticación  
**Prioridad:** Alta  
**Versión:** 1.0

---

## Descripción

Como **empleado**, quiero registrar nuevas cuentas de empleados a través de un formulario públicamente disponible ingresando nombre, correo electrónico y contraseña, para permitir que el personal operativo acceda a la plataforma.

---

## Criterios de aceptación

- El formulario solicita: nombre completo, correo electrónico y contraseña. Todos los campos son obligatorios; si alguno está vacío, el sistema indica cuál falta y no envía el formulario. el perfil se asigna automáticamente como **empleado**.
- El correo debe tener formato válido (contener "@" y un dominio). El nombre solo puede contener letras, espacios y tildes; no se aceptan números ni símbolos especiales.
- La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una letra minúscula, un número y un carácter especial. Si no cumple algún requisito, el sistema indica cuál es el incumplido.
- Si el correo ya pertenece a una cuenta existente, el sistema informa que ese correo ya está registrado, ofrece un enlace directo a la pantalla de inicio de sesión y no crea una cuenta duplicada.
- Al completar el registro correctamente, el sistema muestra el mensaje: *"La cuenta de empleado ha sido creada exitosamente."* y lleva al empleado registrador a la pantalla anterior o panel de administración.
- El sistema rechaza el intento de registro si detecta un comportamiento automatizado (múltiples intentos en poco tiempo desde el mismo origen); en ese caso muestra un aviso y bloquea temporalmente nuevos intentos desde ese origen.
- Si el servicio de registro no está disponible en el momento del envío, el sistema informa que no fue posible completar el registro y le pide al usuario que intente nuevamente más tarde, sin perder los datos ya ingresados en el formulario.
- Toda la información ingresada es verificada y corregida por el sistema antes de ser procesada.

---

## Reglas de negocio

- El correo electrónico debe ser único dentro del sistema; no se permiten cuentas con el mismo correo.
- Los perfiles se asignan automáticamente: las cuentas creadas aquí son **empleados**. Las cuentas de **administrador** se crean exclusivamente en la base de datos por el equipo de operaciones, sin acceso a través de esta interfaz.
- El formulario de registro es **públicamente visible**. En versiones futuras se validará la identidad del registrador; en esta versión es responsabilidad del negocio controlar el acceso físico o lógico a esta pantalla.
- Tras un registro exitoso, la nueva cuenta de empleado está lista para que el nuevo usuario inicie sesión; el empleado registrador es redirigido al panel anterior o lista de usuarios.
- El sistema limita los intentos de registro para prevenir la creación masiva de cuentas de forma automatizada. Tras detectar un patrón inusual, bloquea temporalmente nuevas solicitudes desde ese origen y muestra un aviso al usuario.
- En caso de fallo del servicio durante el registro, el formulario conserva los datos ya ingresados para que el usuario no tenga que completarlos nuevamente.

---

## Flujo principal

1. El empleado accede a la pantalla de registro (públicamente disponible).
2. Completa el formulario con nombre, correo y contraseña del nuevo empleado.
3. Envía el formulario.
4. El sistema valida los datos ingresados (formato de correo, nombre, contraseña, unicidad de correo).
5. Si todo es correcto, el sistema crea la cuenta del nuevo empleado con perfil **empleado** y muestra confirmación.
6. El sistema lleva al empleado registrador a la pantalla anterior o panel de administración.

---

## Flujos alternos

| Situación | Respuesta del sistema |
| :--- | :--- |
| Algún campo está vacío | Muestra aviso indicando el campo faltante y no envía el formulario |
| Formato de correo inválido | Informa que el formato del correo no es correcto |
| Nombre con caracteres no permitidos | Informa que el nombre solo puede contener letras y espacios |
| La contraseña no cumple las reglas | Informa qué requisito específico no se cumplió |
| El correo ya existe | Informa que el correo ya está registrado y ofrece un enlace al inicio de sesión |
| Comportamiento automatizado detectado | Bloquea temporalmente el intento y muestra aviso al usuario |
| Servicio no disponible al enviar | Informa que no fue posible completar el registro; conserva los datos del formulario |

---

## Escenarios de validación

| ID | Escenario | Resultado esperado |
| :--- | :--- | :--- |
| CA-AUTH-01-01 | Registro con todos los datos válidos | Cuenta creada con perfil **empleado**; se muestra confirmación y se redirige al registrador |
| CA-AUTH-01-02 | Envío con campos vacíos | El sistema indica qué campo falta y no procesa el registro |
| CA-AUTH-01-03 | Correo con formato inválido | Se informa que el formato del correo no es correcto |
| CA-AUTH-01-04 | Nombre con caracteres no permitidos | Se informa que el nombre solo admite letras y espacios |
| CA-AUTH-01-05 | Contraseña sin mayúscula | Se informa el requisito incumplido |
| CA-AUTH-01-06 | Contraseña de menos de 8 caracteres | Se informa el requisito de longitud mínima |
| CA-AUTH-01-07 | Correo ya registrado en el sistema | Se informa que el correo ya existe y se muestra enlace al inicio de sesión |
| CA-AUTH-01-08 | Registro exitoso | El mensaje mostrado es: "La cuenta de empleado ha sido creada exitosamente." |
| CA-AUTH-01-09 | Múltiples intentos automatizados detectados | El sistema bloquea temporalmente y muestra aviso |
| CA-AUTH-01-10 | Servicio no disponible al enviar el formulario | Se informa el fallo y el formulario conserva los datos ingresados |

---
