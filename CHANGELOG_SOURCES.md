# Contraste crítico de fuentes: IA vs. Humano | Módulo Médicos

## Propuestas de la IA para nueva funcionalidad

* Primera propuesta: Implementar un sistema de tickets físicos dispensados y gestionados integralmente por la plataforma.
* Segunda propuesta: Incorporar la asignación directa de médicos a consultorios específicos dentro del flujo de trabajo.

## Decisión humana

Al analizar las propuestas, decidí tomar la segunda solución mejorándola según el contexto de negocio real. Identifiqué una limitante en la IA inicial y complementé la solución con un enfoque más preciso. En este momento cuando un paciente es llamado a ser atendido, solo ve el número del consultorio al que debe dirigirse, sin saber quién lo va a atender. Los empleados y administradores tampoco tienen una forma de registrar qué médico trabaja en cada sala ni en qué horario lo hace. Esta nueva funcionalidad introduce un módulo de gestión de médicos con funciones de creación, edición, eliminación y consulta. Los empleados y administradores registran a cada médico indicando su nombre, número de cédula, el consultorio específico donde atenderá y la franja horaria que le corresponde en ese consultorio (dos franjas fijas de 8 horas: 6:00–14:00 y 14:00–22:00). El módulo implementará dos selectores dependientes en el formulario, al seleccionar un consultorio solo aparecen las franjas disponibles para ese consultorio, impidiendo que dos médicos compartan la misma sala en el mismo horario. A partir de ese registro, el sistema identifica automáticamente qué médico tiene su franja horaria activa en el momento en que se procesa un turno, asigna el consultorio pre-configurado de ese médico, y lo muestra junto al número de consultorio en la pantalla del paciente.

