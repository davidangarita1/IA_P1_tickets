# ⚕️ HUMAN CHECK - Feature de Caja Negra: Registro de usuario vía API
# Patrón Estado-Acción-Estado (Given=Estado, When=Acción, Then=Estado)
# Lenguaje declarativo: describe comportamiento de negocio, no implementación

Feature: Registro de usuario interno vía API
  Como administrador del sistema de turnos EPS
  Quiero registrar usuarios internos vía API
  Para gestionar el acceso al dashboard operativo

  Background:
    Given el sistema de autenticación está disponible

  # ── Escenario principal: registro exitoso ─────────────────────────────────
  Scenario: Registrar un usuario nuevo con datos válidos
    Given no existe un usuario registrado con correo "nuevo@eps.com"
    When se registra un usuario con nombre "Carlos Medina", correo "nuevo@eps.com", contraseña "SecurePass1!" y rol "empleado"
    Then el registro es exitoso
    And se obtiene un token de acceso válido
    And los datos del usuario contienen nombre "Carlos Medina" y rol "empleado"

  # ── Escenario: correo duplicado ───────────────────────────────────────────
  Scenario: Rechazar registro con correo ya existente
    Given existe un usuario registrado con correo "existente@eps.com"
    When se intenta registrar otro usuario con correo "existente@eps.com"
    Then el registro es rechazado
    And el mensaje de error indica "Email already in use"

  # ── Escenario: login tras registro ────────────────────────────────────────
  Scenario: Iniciar sesión después de un registro exitoso
    Given existe un usuario registrado con correo "login@eps.com" y contraseña "SecurePass1!"
    When el usuario inicia sesión con correo "login@eps.com" y contraseña "SecurePass1!"
    Then la autenticación es exitosa
    And se obtiene un token de acceso válido
