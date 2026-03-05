# Guía de Evaluación: Semana 3 - DevOps, Testing Multinivel y Ecosistema (Mid Level)

---

## 1. OBJETIVO DE LA EVALUACIÓN
[cite_start]Validar la adopción de un **Mindset de QA y DevOps** por parte del estudiante, integrando la inmutabilidad de la infraestructura con una estrategia de pruebas madura[cite: 101]. [cite_start]Se evaluará la capacidad para orquestar a la IA en la generación de contenedores seguros y pipelines automatizados, aplicando los **7 Principios del Testing**, niveles de pruebas (Componente e Integración) y técnicas de **Caja Blanca y Caja Negra**[cite: 102].

## 2. EL RETO: "EL PIPELINE INQUEBRANTABLE Y MULTINIVEL"
* [cite_start]**Contenerización:** Empaquetar la aplicación en Docker saliendo de entornos locales[cite: 104].
* [cite_start]**Pipeline CI/CD:** Construir un flujo en GitHub Actions que diferencie visualmente pruebas de Componente y de Integración[cite: 105].
* [cite_start]**Prueba de Caja Negra:** Implementar al menos una prueba (ej. creación de usuario vía API) ejecutada dentro del contenedor[cite: 106].
* [cite_start]**Versionamiento:** Culminar con un release ordenado bajo la metodología **GitFlow**[cite: 107].

## 3. CONCEPTOS CLAVE (HUMAN CHECK DEVOPS)
* [cite_start]**Estrategia Multinivel:** Creación de un archivo `TEST_PLAN.md` estructurado como informe técnico para detallar Test Plan y Test Cases[cite: 110]. [cite_start]Debe incluir la justificación teórica de los 7 principios y la distinción práctica entre pruebas de componente e integración[cite: 111, 112].
* [cite_start]**Inmutabilidad y Seguridad:** Uso de imágenes Docker ligeras, ejecución **no-root** y escaneo de vulnerabilidades (ej. Docker scan)[cite: 116].
* [cite_start]**Shift-Left Quality:** Bloqueo de integraciones defectuosas en el pipeline antes de llegar a la rama principal[cite: 117].

## 4. ENTREGABLES OBLIGATORIOS
1.  [cite_start]**Infraestructura como Código:** Archivo `Dockerfile` optimizado y seguro[cite: 119].
2.  [cite_start]**Definición del Pipeline:** Archivo YAML en `.github/workflows/` con jobs visualmente distintos para niveles de prueba[cite: 120].
3.  [cite_start]**Plan de Pruebas (TEST_PLAN.md):** Informe profesional con diseño de casos y argumentación teórica[cite: 121, 122].
4.  [cite_start]**Evidencia de Ejecución:** Captura del pipeline exitoso (en verde) incluyendo linter, pruebas y escaneo de imagen[cite: 123].
5.  [cite_start]**Flujo GitFlow:** Uso estricto de ramas y Pull Requests documentados para Release de `develop` a `main`[cite: 124].

## 5. RÚBRICA DE EVALUACIÓN (RESUMEN)

| Criterio | Nivel Experto (5.0) | Nivel Competente (3.5) | Nivel Insuficiente (2.0) |
| :--- | :--- | :--- | :--- |
| **Infraestructura e Inmutabilidad** | Dockerfile multi-stage, no-root, escaneo efectivo. [cite_start]Pipeline modular con Jobs separados[cite: 127]. | Dockerfile funcional con imagen estándar. [cite_start]Pipeline se ejecuta en cada PR pero en un solo paso[cite: 127]. | Imagen pesada o corre como root. [cite_start]Pipeline inexistente o manual[cite: 127]. |
| **Testing Multinivel** | Evidencia clara de Caja Blanca y Caja Negra (API real). [cite_start]Diferencia técnica física entre niveles[cite: 127]. | Pruebas mezcladas en el CI. [cite_start]La Caja Negra conoce detalles internos de implementación[cite: 127]. | Carece de pruebas funcionales. [cite_start]Solo pruebas unitarias triviales o saltadas[cite: 127]. |
| **Plan de Pruebas y GitFlow** | Informe técnico impecable. [cite_start]Uso inmaculado de GitFlow con PRs formales y versionado (tag)[cite: 127, 128]. | Documento básico con Suites/Cases. Argumentación teórica sin profundidad. [cite_start]Sin formalidad de Release[cite: 127, 128]. | Sin archivo o notas desordenadas. [cite_start]Commits directos a main/develop sin estrategia de ramas[cite: 127, 128]. |
| **Human Check / IA** | Argumentación técnica profunda. [cite_start]Identifican "alucinaciones" de la IA y explican auditoría humana[cite: 128]. | [cite_start]Entienden principios básicos, pero dudan en diferenciar integración real de dependencias mockeadas[cite: 128]. | [cite_start]Copian/pegan código de la IA sin saber explicar principios ni el código entregado[cite: 128]. |

## 6. FORMATO DE PRESENTACIÓN (AUDITORÍA)
1.  [cite_start]**Defensa Teórica (10 min):** Proyectar `TEST_PLAN.md` y justificar decisiones bajo el **Principio 6 (Contexto)**[cite: 131, 134].
2.  [cite_start]**Prueba del Pipeline:** Mostrar el YAML y señalar la ejecución de Caja Negra explicando su naturaleza[cite: 135, 136].
3.  [cite_start]**Validación HITL:** Interrogatorio crítico línea a línea para asegurar el criterio humano sobre el código generado por IA[cite: 140].