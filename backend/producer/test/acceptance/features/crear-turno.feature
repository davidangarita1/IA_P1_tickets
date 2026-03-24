# ⚕️ HUMAN CHECK - Feature de Caja Negra: Creación de turno vía API
# Patrón Estado-Acción-Estado (Given=Estado, When=Acción, Then=Estado)
# Lenguaje declarativo: describe QUÉ debería pasar, no CÓMO (sin clics ni campos)

Feature: Creación de turno médico vía API
  Como paciente del sistema de turnos EPS
  Quiero registrar mi turno a través de la API pública
  Para ser atendido en orden de prioridad

  Background:
    Given el sistema de turnos está disponible

  # ── Escenario principal: flujo feliz ──────────────────────────────────────
  Scenario: Registrar turno con datos válidos y prioridad alta
    Given no existe un turno previo para el paciente con cédula 123456789
    When el paciente "Juan Pérez" con cédula 123456789 solicita un turno con prioridad "alta"
    Then el sistema acepta el turno para procesamiento asíncrono
    And la respuesta contiene estado "accepted"
    And la respuesta contiene mensaje "Turno en proceso de asignación"

  # ── Escenario: prioridad por defecto ──────────────────────────────────────
  Scenario: Registrar turno sin especificar prioridad asigna prioridad por defecto
    Given no existe un turno previo para el paciente con cédula 987654321
    When el paciente "María López" con cédula 987654321 solicita un turno sin prioridad
    Then el sistema acepta el turno para procesamiento asíncrono
    And la respuesta contiene estado "accepted"

  # ── Escenario: datos inválidos ────────────────────────────────────────────
  Scenario: Rechazar turno con datos incompletos
    When se envía una solicitud de turno sin nombre ni cédula
    Then el sistema rechaza la solicitud con error de validación
    And el código de respuesta HTTP es 400
