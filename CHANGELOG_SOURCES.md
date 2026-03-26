# Contraste crítico de fuentes: IA vs. Humano | Módulo Médicos

## Propuestas de la IA para nueva funcionalidad

* Primera propuesta: Implementar un sistema de tickets físicos dispensados y gestionados integralmente por la plataforma.
* Segunda propuesta: Incorporar la asignación directa de médicos a consultorios específicos dentro del flujo de trabajo.

**Decisión humana**

Al analizar las propuestas, decidí tomar la segunda solución mejorándola según el contexto de negocio real. Identifiqué una limitante en la IA inicial y complementé la solución con un enfoque más preciso. En este momento cuando un paciente es llamado a ser atendido, solo ve el número del consultorio al que debe dirigirse, sin saber quién lo va a atender. Los empleados y administradores tampoco tienen una forma de registrar qué médico trabaja en cada sala ni en qué horario lo hace. Esta nueva funcionalidad introduce un módulo de gestión de médicos con funciones de creación, edición, eliminación y consulta. Los empleados y administradores registran a cada médico indicando su nombre, número de cédula, el consultorio específico donde atenderá y la franja horaria que le corresponde en ese consultorio (dos franjas fijas de 8 horas: 6:00–14:00 y 14:00–22:00). El módulo implementará dos selectores dependientes en el formulario, al seleccionar un consultorio solo aparecen las franjas disponibles para ese consultorio, impidiendo que dos médicos compartan la misma sala en el mismo horario. A partir de ese registro, el sistema identifica automáticamente qué médico tiene su franja horaria activa en el momento en que se procesa un turno, asigna el consultorio pre-configurado de ese médico, y lo muestra junto al número de consultorio en la pantalla del paciente.

## Generación de historias de usuario

Usando los principios de INVEST, generé historias de usuario para la nueva funcionalidad, basado en el articulo de referencia en medium https://medium.com/somos-codeicus/m%C3%A9todo-invest-f8491c1422e7

Para refinar las ideas con las historias de usuario, utilicé la herramienta [SKAI](https://ai.sofka.com.co/chat) con la instrucción de "diagnosticar historias de  usuario" y generar posibles criterios de aceptación, sin embargo la herramienta no logró generar criterios de aceptación relevantes para las historias de usuario, por lo que decidí escribirlos manualmente basándome en el contexto del negocio y las necesidades de los usuarios.

**Estructura de criterios de aceptación**

Para generar los criterios de aceptación, me basé en el artículo de referencia en media publicado por Thiga https://www.media.thiga.co/es/gherkin

**Validación de campos en el formulario**

Para asegurar una buena experiencia de usuario, implementé validaciones en los criterios de aceptación para el formulario de creación de médicos basandome en esta fuente de referencia:

* Guía de Mejores Prácticas para Campos Obligatorios en Formularios Web de teacup lab: https://www.teacuplab.com/es/blog/campos-obligatorios-mejores-practicas/

**Microinteracciones para mejorar la experiencia de usuario**

Para desarrollar la edición y eliminación de médicos y que fuera intuitiva, me basé en el artículo de referencia de Nielsen Norman Group sobre microinteracciones: https://www.nngroup.com/articles/microinteractions/

También me basé en el artículo de Justinmind sobre microinteracciones: https://www.justinmind.com/es/diseno-web/microinteracciones

**Refinamiento de historias de usuario**

Para mejorar la redacción de las historias de usuario, me basé en el artículo de referencia
de Pradeep Kadarla sobre mejores prácticas para el refinamiento de historias de usuario:
https://medium.com/@kadarla.pradeep4/user-story-refinement-best-practices-1156548879e4

**Definición de historias de usuario con BDD**

Para definir las historias de usuario con BDD, me basé en el artículo de referencia de Cucumber sobre BDD: https://cucumber.io/docs/bdd/ enfocando la creación y mejora de historias de usuario al comportamiento esperado del sistema y la experiencia del usuario, sin necesidad de dividir las historias en tareas técnicas, sino enfocándome en el valor que cada historia aporta al usuario final y al negocio. Esto me permitió mantener un enfoque centrado en el usuario y asegurar que cada historia de usuario esté alineada con los objetivos del negocio y las necesidades de los usuarios.