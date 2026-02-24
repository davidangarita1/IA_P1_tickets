# TESTING_STRATEGY.md

Este documento resume la estrategia de QA y los ajustes de testing realizados hasta ahora.
Prioridad: verificar primero (correcto tecnico), validar despues (reglas de negocio).

---

## 1) Verificar vs validar (definicion breve)

- Verificar: pruebas unitarias que confirman contratos tecnicos y flujos esperados.
- Validar: pruebas que protegen reglas criticas de negocio y escenarios reales de uso.

---

## 2) Cambios actuales en testing (estado verificado)

Se revisaron y corrigieron las pruebas existentes en:
- Consumer
- Producer

Objetivo alcanzado: solo pruebas unitarias, minimas y con comentarios claros por capa.

---

## 3) Hallazgo de negocio (validacion pendiente)

Se identifico que el funcionamiento actual no cubre la necesidad del cliente:
- Falta una separacion publica vs privada.
- Se requiere login para que el historial sea privado para la empresa.

Esta necesidad define la siguiente etapa de validacion de negocio.

---

## 4) Proximos pasos (no ejecutados en este momento)

El siguiente paso sera iniciar TDD para la feature de login:
- Empezar en RED con casos que validen privacidad del historial.
- Luego GREEN y refactor.

No se implementa en esta version.

---

## 5) Nota de alcance de esta version

Esta version solo organiza y limpia la base de pruebas unitarias.
No agrega nuevas reglas de negocio ni cambia el flujo actual.
