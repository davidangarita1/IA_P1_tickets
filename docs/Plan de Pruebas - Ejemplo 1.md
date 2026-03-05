# [cite_start]Plan de Pruebas Proyecto - Biometría Quioscos [cite: 363]

---

## [cite_start]1. ALCANCE DE LAS PRUEBAS - SPRINT 1 [cite: 364]

### [cite_start]1.1 Descripción del Proceso SPR1 [cite: 365]
[cite_start]El proceso de atención a través de los Quioscos inicia cuando el afiliado se acerca al dispositivo en las oficinas de Protección y realiza los siguientes pasos[cite: 375]:
1.  [cite_start]**Escaneo**: El usuario escanea el código de barras de su cédula[cite: 375].
2.  [cite_start]**Validación**: El sistema valida la existencia del usuario y sus productos activos mediante el servicio **WS-SUIC**[cite: 370, 375].
3.  [cite_start]**Selección**: Se presentan en pantalla las opciones disponibles o mensajes de error según el perfil del afiliado[cite: 375].
4.  [cite_start]**Impresión**: El usuario selecciona y procede con la impresión de certificados de **Pensiones Obligatorias (OBL)** y **Cesantías (CES)**[cite: 375, 376].


### [cite_start]1.2 Historias de Usuario (HU) y Criterios de Aceptación [cite: 377, 378]

#### [cite_start]HU001: Ingreso al Kiosko [cite: 379]
* [cite_start]Verificar el diseño gráfico de la pantalla inicial[cite: 383].
* [cite_start]Validar la adaptación a diferentes tamaños de pantalla y recepción de TAGS HTML[cite: 384].
* [cite_start]Confirmar que se indique la lectura de cédula por código de barras y exista el botón "Ingresar Cédula Manualmente"[cite: 385, 386].
* [cite_start]Verificar la presencia de una "miga de pan" informativa en la parte inferior[cite: 387].

#### [cite_start]HU002: Leer información de cédula Lector Códigos [cite: 388]
* [cite_start]Verificar la captura de información a través del código de barras del documento[cite: 391].
* [cite_start]Mostrar un indicador de "Cargando" tras una lectura exitosa[cite: 393].

#### [cite_start]HU003: Procesar información de cédula [cite: 394]
* [cite_start]**Errores**: Mostrar mensajes parametrizables si el afiliado no existe o no tiene productos activos, registrando la operación en el log[cite: 397, 398].
* [cite_start]**Éxito**: Mostrar el nombre del afiliado y la opción de "Salir"[cite: 399, 400].
* **Reglas de Negocio**: 
    * [cite_start]Ocultar opción de Cesantías si el estado es vacío o TRS[cite: 403].
    * [cite_start]Ocultar opción de Obligatorias si el estado es distinto a ACT[cite: 404].

#### [cite_start]HU004 & HU005: Descargar certificado afiliación (CES / OBL) [cite: 405, 415]
* [cite_start]Permitir la selección del botón solo con cédula[cite: 407, 421].
* [cite_start]Mostrar pantalla de impresión y registrar la transacción en el log[cite: 408, 422].
* [cite_start]Gestionar errores de impresión con mensajes parametrizables[cite: 409, 423].
* [cite_start]Cierre automático de sesión tras X segundos de inactividad[cite: 413, 424].

### [cite_start]1.3 Fuera de Alcance [cite: 426]
* [cite_start]Pruebas sobre el hardware físico de los dispositivos provistos[cite: 427].
* [cite_start]Generación de certificados diferentes a OBL y CES[cite: 428].

## [cite_start]2. ESTRATEGIA DE PRUEBAS [cite: 429]
1.  [cite_start]**Smoke Test**: Verificación inicial de acceso a la URL y comunicación con servicios[cite: 430].
2.  [cite_start]**Ejecución**: Pruebas basadas en criterios de aceptación e historias priorizadas por riesgo[cite: 430, 431].
3.  [cite_start]**Ciclos**: Las pruebas iniciarán en PC (Ciclo 1, Ciclo 2 y Retest) y finalizarán con una **Regresión** en el dispositivo Kiosko real[cite: 432].
4.  [cite_start]**Gestión de Defectos**: Reporte de desviaciones (issues) en la herramienta TFS para su corrección y posterior validación[cite: 431, 437].

## [cite_start]3. REQUERIMIENTOS [cite: 435]
1.  [cite_start]Acceso a ambientes (BD, software, dispositivos, servicios)[cite: 436].
2.  [cite_start]Acceso a la herramienta **TFS** para diseño de casos y reporte de incidentes[cite: 437].
3.  [cite_start]Documentación actualizada y comunicación constante con el equipo[cite: 438, 440].
4.  [cite_start]**Set de datos**: Cédulas de prueba con diversas combinaciones de productos activos[cite: 439, 440].

## [cite_start]4. MATRIZ DE RIESGOS [cite: 441]
* [cite_start]**Riesgo de Entorno**: Realizar pruebas iniciales en navegadores de PC puede no detectar problemas específicos del hardware del Kiosko[cite: 442].

### [cite_start]Riesgos por Historia de Usuario [cite: 443]
| Historia de Usuario | Probabilidad | Impacto | Riesgo (P*I) |
| :--- | :---: | :---: | :---: |
| HU001: Ingreso al Kiosko | 3 | 3 | **9** |
| HU002: Leer información de cédula | 3 | 2 | **6** |
| HU003: Procesar información de cédula | 3 | 3 | **9** |
| HU004: Descargar certificado CES | 2 | 3 | **6** |
| HU005: Descargar certificado OBL | 2 | 2 | **4** |

[cite_start]*(Escala: 1 Bajo, 2 Medio, 3 Alto)* [cite: 444]