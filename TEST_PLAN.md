# Test Plan — Sistema de Turnos EPS

**Proyecto:** Sistema de turnos EPS  
**Módulos:** `frontend/` — feature/authentication | `backend/producer/` — API y aceptación  
**Responsable:** David Angarita y Duver Betancur  
**Fecha:** 2026-03-09  
**Versión:** 3.0

---

## 1. ALCANCE DE LAS PRUEBAS

### 1.1 Descripción del Proceso

El flujo de autenticación del frontend cubre tres responsabilidades principales:

1. **Registro (Sign Up):** El usuario completa un formulario con nombre, correo y contraseña. El sistema valida las reglas de formato de contraseña, sanitiza las entradas y llama al endpoint `POST /auth/signUp` a través del `HttpAuthAdapter`. Al éxito, guarda un mensaje en `sessionStorage` y redirige a `/signin`.

2. **Inicio de sesión (Sign In):** El usuario ingresa correo y contraseña. El sistema sanitiza las entradas, llama al endpoint `POST /auth/signIn`. Al éxito, el backend devuelve un JWT que se almacena en cookie y el usuario es redirigido a `/dashboard`.

3. **Protección de rutas (AuthGuard):** Componente que envuelve rutas protegidas. Verifica sesión activa y, opcionalmente, roles permitidos. Si el usuario no está autenticado redirige a `/signin`; si no tiene el rol requerido redirige a `/`.

### 1.2 Componentes bajo prueba

| Componente | Ruta | Tipo |
| :--- | :--- | :--- |
| `AuthProvider` | `src/providers/AuthProvider.tsx` | Provider de estado global |
| `ConnectedAuthProvider` | `src/providers/ConnectedAuthProvider.tsx` | Wiring de dependencias |
| `SignInForm` | `src/components/SignInForm/SignInForm.tsx` | Componente UI |
| `SignUpForm` | `src/components/SignUpForm/SignUpForm.tsx` | Componente UI |
| `AuthGuard` | `src/components/AuthGuard/AuthGuard.tsx` | Componente de protección |
| `HttpAuthAdapter` | `src/infrastructure/adapters/HttpAuthAdapter.ts` | Adaptador HTTP |
| `authMapper` | `src/infrastructure/mappers/authMapper.ts` | Mapper de respuestas |
| `AuthService` (port) | `src/domain/ports/AuthService.ts` | Contrato de dominio |

### 1.3 Fuera de Alcance

- Pruebas de la UI sobre navegadores reales (pruebas cross-browser).
- Pruebas de rendimiento y carga sobre los endpoints del backend.
- Módulos de tickets, WebSocket y notificaciones de audio.
- Pruebas E2E con Playwright/Cypress (no configurado en este sprint).

---

## 2. ESTRATEGIA DE PRUEBAS

### 2.1 Niveles de prueba

**Pruebas de Componente (Caja Blanca)**  
Validan la lógica interna de cada unidad de forma aislada. Se conoce la implementación y se prueba el flujo de ramas, estados y efectos secundarios. Se ejecutan con Jest + React Testing Library. Las dependencias externas (`authService`, `router`, `sessionStorage`) se sustituyen por mocks.

**Pruebas de Integración (Caja Negra)**  
Validan el comportamiento observable del `HttpAuthAdapter` contra los contratos del backend sin conocer detalles internos de la implementación del servidor. Se mocka únicamente `fetch` global para simular respuestas HTTP reales y se verifica que el adaptador mapee correctamente las respuestas, establezca cookies y propague errores tal como lo haría ante un backend real.

**Pruebas de Aceptación — Gherkin (Caja Negra Declarativa)**  
Validan el comportamiento del sistema desde la perspectiva del negocio usando sintaxis **Given/When/Then** (patrón Estado-Acción-Estado). Se ejecutan con `cucumber-js` contra la API del Producer mediante `supertest`. Los escenarios son **declarativos**: describen QUÉ debería ocurrir en términos de negocio, sin mencionar clics, campos de formulario ni detalles de implementación. Las dependencias externas (RabbitMQ, MongoDB) se sustituyen por stubs in-memory para garantizar aislamiento y velocidad.

**Uso de Gherkin:**  
Los escenarios Gherkin se usan para expresar el comportamiento esperado del sistema en lenguaje de negocio. El **Given** define el estado inicial, el **When** ejecuta la acción y el **Then** valida el resultado esperado. Esto permite que el plan se mantenga enfocado en comportamiento funcional y no en detalles de implementación.

### 2.2 Técnicas aplicadas

| Técnica | Nivel | Aplicación |
| :--- | :--- | :--- |
| Partición de equivalencia | Componente | Entradas válidas/inválidas en `SignUpForm` y `SignInForm` |
| Análisis de valores límite | Componente | Contraseña de 7 caracteres (inválida) vs. 8 caracteres (válida) |
| Tabla de decisiones | Componente | Combinaciones de estado del usuario en `AuthGuard` (no autenticado, autenticado sin rol, autenticado con rol) |
| Prueba de estado | Componente | Transiciones de `loading → authenticated → unauthenticated` en `AuthProvider` |
| Prueba de contrato | Integración | `HttpAuthAdapter` verifica que los payloads enviados coincidan con la API del backend |
| BDD Gherkin (Estado-Acción-Estado) | Aceptación | Escenarios declarativos de creación de turno y registro de usuario vía API |

### 2.3 Ciclos de ejecución

1. **Unit / Component (CI — cada PR):** Ejecución automática de toda la suite Jest al abrir un Pull Request. Bloquea el merge si hay fallos.
2. **Integration (CI — cada PR hacia develop):** Job diferenciado en el pipeline que ejecuta únicamente los tests de `infrastructure/` con `testPathPattern=infrastructure`.
3. **Acceptance / Gherkin (CI — cada PR hacia develop):** Job de integración ejecuta `cucumber-js` en el Producer para validar escenarios de Caja Negra declarativa. Bloquea el merge si algún escenario falla.
4. **Regresión manual (previo a release):** Verificación funcional del flujo completo en un entorno con el backend levantado vía `docker-compose`.

---

## 3. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN

### HU-AUTH-01: Registro de usuario

**Descripción:** Como usuario nuevo, quiero registrarme con nombre, correo y contraseña para acceder al sistema.

**Criterios de aceptación:**
- El sistema no permite continuar si el usuario deja algún campo vacío.
- El sistema no permite registrarse con una contraseña que no tenga al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial; en ese caso muestra un mensaje explicando el requisito incumplido.
- Al crear la cuenta exitosamente, el usuario es redirigido a la pantalla de inicio de sesión y ve un mensaje confirmando que su cuenta fue creada.
- Si el correo ingresado ya pertenece a una cuenta existente, el usuario no es redirigido y se le informa que ese correo ya está registrado.
- El sistema limpia y valida las entradas del usuario antes de procesarlas.

### HU-AUTH-02: Inicio de sesión

**Descripción:** Como usuario registrado, quiero iniciar sesión con correo y contraseña para acceder al panel principal.

**Criterios de aceptación:**
- El sistema no permite continuar si el correo o la contraseña están en blanco.
- Al ingresar credenciales correctas, el usuario es llevado al panel principal y su sesión queda activa.
- Si las credenciales son incorrectas, el usuario ve un mensaje de error sin ser redirigido.
- Si el usuario llega desde un registro exitoso, ve un mensaje de bienvenida confirmando la creación de su cuenta; ese mensaje no vuelve a aparecer si recarga la página.
- El mensaje de bienvenida desaparece automáticamente a los 4 segundos.

### HU-AUTH-03: Protección de rutas por autenticación y rol

**Descripción:** Como sistema, quiero proteger las secciones que requieren autenticación o permisos específicos para evitar accesos no autorizados.

**Criterios de aceptación:**
- Un usuario que no ha iniciado sesión no puede acceder a secciones privadas; el sistema lo redirige automáticamente a la pantalla de login.
- Un usuario autenticado que no tiene el perfil requerido para una sección es enviado a la página de inicio sin ver el contenido restringido.
- Un usuario autenticado con el perfil correcto puede ver y usar la sección sin interrupciones.
- Mientras el sistema verifica la sesión del usuario, no se muestra ningún contenido para evitar accesos momentáneos no autorizados.

### HU-AUTH-04: Restauración de sesión (persistencia)

**Descripción:** Como usuario, quiero que mi sesión se restaure al recargar la página para no tener que autenticarme nuevamente.

**Criterios de aceptación:**
- Al recargar la página, el sistema verifica automáticamente si el usuario ya tiene una sesión activa.
- Si existe una sesión válida, el usuario permanece autenticado y puede continuar usando la aplicación sin interrupciones.
- Si no existe sesión activa o la sesión expiró, el usuario es tratado como no autenticado y debe iniciar sesión nuevamente.

---

## 4. DISEÑO DE CASOS DE PRUEBA

### Suite 1 — SignUpForm (Caja Blanca — Componente)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-SU-01 | Contraseña débil (sin mayúscula) muestra error | Formulario montado | Ingresar `test1234!` y enviar | Muestra mensaje de contraseña débil, no llama a `signUp` |
| TC-SU-02 | Contraseña débil (menos de 8 chars) muestra error | Formulario montado | Ingresar `Ab1!` y enviar | Muestra mensaje de contraseña débil |
| TC-SU-03 | Contraseña fuerte pasa validación | Formulario montado | Ingresar `Secure1!` y enviar | Llama a `signUp` con los datos sanitizados |
| TC-SU-04 | Campos vacíos no disparan llamada al servicio | Formulario montado | Enviar formulario vacío | No se llama a `signUp` |
| TC-SU-05 | Error de correo duplicado muestra mensaje traducido | `signUp` retorna error "Email already in use" | Completar formulario y enviar | Muestra "El correo ya está registrado." |
| TC-SU-06 | Registro exitoso redirige a `/signin` y guarda `sessionStorage` | `signUp` retorna `{ success: true }` | Completar formulario y enviar | `router.push('/signin')` y `sessionStorage.setItem(SIGNUP_SUCCESS_KEY, ...)` |

### Suite 2 — SignInForm (Caja Blanca — Componente)

| ID | Descripción | Precondición | Paso | Resultado esperado |
| :--- | :--- | :--- | :--- | :--- |
| TC-SI-01 | Toast de registro previo se muestra al montar | `sessionStorage` contiene `signup_success` | Montar componente | Se muestra el toast con el mensaje y se elimina del storage |
| TC-SI-02 | Toast desaparece tras 4 segundos | Toast visible | Esperar 4000ms | El toast ya no está en el DOM |
| TC-SI-03 | Error de autenticación se muestra con `role="alert"` | `signIn` retorna `{ success: false, message: "..." }` | Enviar formulario | Se renderiza el mensaje con `role="alert"` |
| TC-SI-04 | Login exitoso redirige a `/dashboard` | `signIn` retorna `{ success: true }` | Enviar formulario | `router.push('/dashboard')` |
| TC-SI-05 | Email o contraseña vacíos no disparan llamada | Formulario vacío | Enviar formulario | No se llama a `signIn` |

### Suite 3 — AuthGuard (Caja Blanca — Componente)

| ID | Descripción | Estado | Resultado esperado |
| :--- | :--- | :--- | :--- |
| TC-AG-01 | Usuario no autenticado redirige a `/signin` | `isAuthenticated: false`, `loading: false` | `router.push('/signin')` |
| TC-AG-02 | Durante carga no renderiza nada | `loading: true` | `null` |
| TC-AG-03 | Autenticado sin rol requerido redirige a `/` | `isAuthenticated: true`, rol `employee`, `allowedRoles: ['admin']` | `router.push('/')` |
| TC-AG-04 | Autenticado con rol correcto renderiza children | `isAuthenticated: true`, rol `admin`, `allowedRoles: ['admin']` | Se renderiza el contenido |
| TC-AG-05 | Sin `allowedRoles` definido, solo valida autenticación | `isAuthenticated: true`, sin `allowedRoles` | Se renderiza el contenido |

### Suite 4 — AuthProvider (Caja Blanca — Componente)

| ID | Descripción | Resultado esperado |
| :--- | :--- | :--- |
| TC-AP-01 | `useAuth` lanza error fuera del provider | `Error: "AuthProvider is required"` |
| TC-AP-02 | `loading` es `true` antes de que `getSession` resuelva | Estado inicial `loading: true` |
| TC-AP-03 | Sin sesión activa, `isAuthenticated` es `false` | `user: null`, `isAuthenticated: false` |
| TC-AP-04 | Con sesión activa, `user` se hidrata y `isAuthenticated` es `true` | `user` con datos del mock, `isAuthenticated: true` |
| TC-AP-05 | `signIn` exitoso actualiza `user` y retorna `true` | `user` actualizado, retorna `true` |
| TC-AP-06 | `signIn` fallido setea `error` y retorna `false` | `error` con mensaje, retorna `false` |
| TC-AP-07 | `signOut` limpia `user` y setea `isAuthenticated: false` | `user: null`, `isAuthenticated: false` |
| TC-AP-08 | `hasRole('admin')` retorna `true` para usuario con rol admin | `true` |
| TC-AP-09 | `hasRole('admin')` retorna `false` para usuario con rol employee | `false` |

### Suite 5 — HttpAuthAdapter (Caja Negra — Integración)

| ID | Descripción | Mock de red | Resultado esperado |
| :--- | :--- | :--- | :--- |
| TC-HA-01 | `signIn` exitoso almacena cookie y mapea usuario | `{ success: true, token: "jwt", usuario: {...} }` | Cookie seteada, retorna `AuthResult` con `user` mapeado |
| TC-HA-02 | `signIn` fallido no almacena cookie | `{ success: false, message: "Credenciales inválidas" }` | Cookie no seteada, `success: false` |
| TC-HA-03 | `signIn` con error de red retorna mensaje de error | `fetch` rechaza con `Error` | `{ success: false, message: "Error en login" }` |
| TC-HA-04 | `signUp` envía payload con campo `nombre` y `rol` en español | — | `httpPost` llamado con `{ nombre, rol: "empleado" }` |
| TC-HA-05 | `signUp` no setea cookie aunque la respuesta tenga token | `{ success: true, token: "jwt" }` | `setAuthCookie` no es llamado |
| TC-HA-06 | `getSession` llama a `/auth/me` con header `Authorization` | Cookie presente, respuesta válida | Retorna `User` mapeado desde `BackendUser` |
| TC-HA-07 | `getSession` sin cookie retorna `null` | Sin cookie | `null` sin llamar a red |
| TC-HA-08 | `signOut` llama a `/auth/signOut` y elimina la cookie | — | `removeAuthCookie` llamado |
| TC-HA-09 | Rol `empleado` del backend se mapea a `employee` en dominio | `{ rol: "empleado" }` | `user.role === "employee"` |
| TC-HA-10 | Rol `admin` del backend se mantiene como `admin` en dominio | `{ rol: "admin" }` | `user.role === "admin"` |

### Suite 6 — Creación de turno vía API (Gherkin — Caja Negra Declarativa)

Ubicación: `backend/producer/test/acceptance/features/crear-turno.feature`

Los escenarios siguen el **patrón Estado-Acción-Estado** exigido por la evaluación. Cada paso es declarativo y describe comportamiento de negocio, no implementación.

```gherkin
Feature: Creación de turno médico vía API

  Scenario: Registrar turno con datos válidos y prioridad alta
    Given el sistema de turnos está disponible
    And no existe un turno previo para el paciente con cédula 123456789
    When el paciente "Juan Pérez" con cédula 123456789 solicita un turno con prioridad "alta"
    Then el sistema acepta el turno para procesamiento asíncrono
    And la respuesta contiene estado "accepted"
    And la respuesta contiene mensaje "Turno en proceso de asignación"

  Scenario: Registrar turno sin especificar prioridad asigna prioridad por defecto
    Given no existe un turno previo para el paciente con cédula 987654321
    When el paciente "María López" con cédula 987654321 solicita un turno sin prioridad
    Then el sistema acepta el turno para procesamiento asíncrono

  Scenario: Rechazar turno con datos incompletos
    When se envía una solicitud de turno sin nombre ni cédula
    Then el sistema rechaza la solicitud con error de validación
    And el código de respuesta HTTP es 400
```

| ID | Escenario Gherkin | Estado inicial (Given) | Acción (When) | Estado final (Then) |
| :--- | :--- | :--- | :--- | :--- |
| TC-GT-01 | Turno válido con prioridad alta | Sistema disponible, sin turno previo | Solicitar turno con datos completos | HTTP 202, status `accepted` |
| TC-GT-02 | Turno sin prioridad | Sistema disponible, sin turno previo | Solicitar turno sin campo prioridad | HTTP 202, turno aceptado |
| TC-GT-03 | Turno con datos incompletos | Sistema disponible | Enviar payload vacío | HTTP 400, error de validación |

### Suite 7 — Registro de usuario vía API (Gherkin — Caja Negra Declarativa)

Ubicación: `backend/producer/test/acceptance/features/registro-usuario.feature`

```gherkin
Feature: Registro de usuario interno vía API

  Scenario: Registrar un usuario nuevo con datos válidos
    Given el sistema de autenticación está disponible
    And no existe un usuario registrado con correo "nuevo@eps.com"
    When se registra un usuario con nombre "Carlos Medina", correo "nuevo@eps.com",
         contraseña "SecurePass1!" y rol "empleado"
    Then el registro es exitoso
    And se obtiene un token de acceso válido
    And los datos del usuario contienen nombre "Carlos Medina" y rol "empleado"

  Scenario: Rechazar registro con correo ya existente
    Given existe un usuario registrado con correo "existente@eps.com"
    When se intenta registrar otro usuario con correo "existente@eps.com"
    Then el registro es rechazado
    And el mensaje de error indica "Email already in use"

  Scenario: Iniciar sesión después de un registro exitoso
    Given existe un usuario registrado con correo "login@eps.com" y contraseña "SecurePass1!"
    When el usuario inicia sesión con correo "login@eps.com" y contraseña "SecurePass1!"
    Then la autenticación es exitosa
    And se obtiene un token de acceso válido
```

| ID | Escenario Gherkin | Estado inicial (Given) | Acción (When) | Estado final (Then) |
| :--- | :--- | :--- | :--- | :--- |
| TC-GU-01 | Registro exitoso | Sistema listo, correo no existe | Registrar con datos válidos | Token válido, datos de usuario correctos |
| TC-GU-02 | Correo duplicado | Usuario ya registrado con ese correo | Registrar otro con mismo correo | Registro rechazado, error "Email already in use" |
| TC-GU-03 | Login post-registro | Usuario registrado previamente | Iniciar sesión con credenciales correctas | Autenticación exitosa, token válido |

## 5. REQUERIMIENTOS

1. Node.js 20+ y dependencias instaladas (`npm install` en `frontend/`).
2. Acceso al repositorio con permisos de lectura/escritura para el pipeline CI.
3. Variables de entorno de prueba definidas (la URL del backend puede ser cualquier origen para pruebas de componente, ya que se mockea).
4. Set de datos de prueba: al menos un usuario mock con rol `admin` y uno con rol `employee`.
5. Acceso a GitHub Actions para verificar la ejecución del pipeline en verde.

---

## 6. MATRIZ DE RIESGOS

| Historia de Usuario | Probabilidad | Impacto | Riesgo (P×I) | Mitigación |
| :--- | :---: | :---: | :---: | :--- |
| HU-AUTH-01: Registro de usuario | 2 | 3 | **6** | Validación exhaustiva de regex de contraseña en tests |
| HU-AUTH-02: Inicio de sesión | 2 | 3 | **6** | Tests de toast, error y redirección aislados |
| HU-AUTH-03: Protección de rutas | 3 | 3 | **9** | Tabla de decisiones cubre los 5 estados posibles |
| HU-AUTH-04: Restauración de sesión | 3 | 3 | **9** | Tests de `HttpAuthAdapter.getSession` con y sin cookie |
| Mapeo de roles backend↔dominio | 2 | 3 | **6** | TC-HA-09 y TC-HA-10 cubren ambas traducciones |

*(Escala: 1 Bajo, 2 Medio, 3 Alto)*

**Riesgo de entorno:** Las pruebas de componente usan `jsdom`, que no reproduce completamente el comportamiento del navegador (ej. cookies basadas en `document.cookie`). Los tests de `cookieUtils` deben ejecutarse con atención a las limitaciones de `jsdom` respecto al manejo de cookies `HttpOnly`.

---

## 8. DISTINCIÓN TÉCNICA: CAJA BLANCA vs CAJA NEGRA vs GHERKIN DECLARATIVO

**Pruebas de Caja Blanca (Suites 1–4)**  
Se conoce la implementación interna. Los tests importan directamente los componentes y providers, inspeccionan el árbol del DOM resultante, verifican que se llamaron funciones específicas (ej. `router.push`, `sessionStorage.setItem`) y validan transiciones de estado interno. Las dependencias (`authService`, `useRouter`) son mocks controlados que permiten forzar cualquier escenario.

**Pruebas de Caja Negra (Suite 5 — HttpAuthAdapter)**  
Se valida el comportamiento observable del adaptador sin conocer cómo el servidor procesa la solicitud. El adaptador recibe una respuesta simulada del servidor (mock de `fetch`) y se verifica únicamente lo que produce hacia afuera: el `AuthResult` retornado, las cookies seteadas y los payloads enviados. No se accede a variables internas del adaptador ni se verifica su lógica de flujo de control; solo sus entradas y salidas.

**Pruebas Gherkin Declarativas (Suites 6–7 — Aceptación)**  
Elevan la Caja Negra al nivel de negocio. Los escenarios están escritos en lenguaje natural siguiendo el **patrón Estado-Acción-Estado** (Given/When/Then). Se ejecutan contra la API real del Producer vía HTTP (`supertest`), sin conocimiento de la implementación interna. Las dependencias externas (RabbitMQ, MongoDB) se sustituyen por stubs para garantizar determinismo, pero la capa HTTP, validación de DTOs (class-validator) y lógica de use cases se ejecutan de forma real —exactamente como en producción—. Esto las convierte en pruebas de Caja Negra de alto nivel donde **el lenguaje del test es el lenguaje del negocio**, no el del código.
