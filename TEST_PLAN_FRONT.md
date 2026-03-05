# Test Plan — Feature: Authentication (Frontend)

**Proyecto:** Sistema de turnos EPS  
**Módulo:** `frontend/` — feature/authentication  
**Responsable:** David Angarita  
**Fecha:** 2026-03-05  
**Versión:** 1.0

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

## 2. JUSTIFICACIÓN TEÓRICA: 7 PRINCIPIOS DEL TESTING

La estrategia de pruebas de esta feature se fundamenta en los 7 principios del testing. A continuación se describe cómo cada principio guía las decisiones tomadas:

**Principio 1 — Las pruebas muestran la presencia de defectos, no su ausencia.** Las suites de pruebas de `SignUpForm` y `AuthProvider` cubren los caminos conocidos de falla, pero no garantizan que el sistema esté libre de defectos. Por eso se combina cobertura de ramas con revisión humana de los casos límite.

**Principio 2 — Las pruebas exhaustivas son imposibles.** No se prueban todas las combinaciones posibles de email y contraseña. En cambio, se aplican técnicas de partición de equivalencia (entradas válidas, inválidas y vacías) para maximizar la cobertura con el menor número de casos.

**Principio 3 — Las pruebas tempranas ahorran tiempo y dinero (Shift-Left).** Los tests de componente e integración se ejecutan en el pipeline CI antes de que cualquier rama llegue a `develop`. Si una prueba del `AuthProvider` falla, el merge queda bloqueado automáticamente.

**Principio 4 — Agrupación de defectos.** La lógica crítica se concentra en `AuthProvider` (gestión de estado) y `HttpAuthAdapter` (comunicación con API). Por eso estas clases tienen la mayor densidad de casos de prueba y son las primeras en ejecutarse en el pipeline.

**Principio 5 — La paradoja del pesticida.** Los mocks del `mockAuthService` se renuevan conforme evolucionan los contratos del backend. Mantener mocks desactualizados crea una falsa sensación de seguridad. Se exige que los mocks reflejen exactamente la forma del `AuthService` port.

**Principio 6 — Las pruebas dependen del contexto.** Esta feature es de tipo SPA con renderizado del lado del cliente (`"use client"`). Por eso se utiliza `jsdom` como entorno Jest, se mockea `next/navigation` y `sessionStorage`, y las pruebas de infraestructura mockean `fetch` global en lugar de usar un servidor HTTP real.

**Principio 7 — La falacia de la ausencia de errores.** Un 100% de cobertura de líneas no significa que el sistema sea correcto. El `AuthGuard` puede pasar todos sus tests unitarios y aun así fallar si la cookie JWT no se setea correctamente en el flujo real. Por eso se diseñan pruebas de integración que validan el flujo completo sin mocks en las capas de dominio.

---

## 3. ESTRATEGIA DE PRUEBAS

### 3.1 Niveles de prueba

**Pruebas de Componente (Caja Blanca)**  
Validan la lógica interna de cada unidad de forma aislada. Se conoce la implementación y se prueba el flujo de ramas, estados y efectos secundarios. Se ejecutan con Jest + React Testing Library. Las dependencias externas (`authService`, `router`, `sessionStorage`) se sustituyen por mocks.

**Pruebas de Integración (Caja Negra)**  
Validan el comportamiento observable del `HttpAuthAdapter` contra los contratos del backend sin conocer detalles internos de la implementación del servidor. Se mocka únicamente `fetch` global para simular respuestas HTTP reales y se verifica que el adaptador mapee correctamente las respuestas, establezca cookies y propague errores tal como lo haría ante un backend real.

### 3.2 Técnicas aplicadas

| Técnica | Nivel | Aplicación |
| :--- | :--- | :--- |
| Partición de equivalencia | Componente | Entradas válidas/inválidas en `SignUpForm` y `SignInForm` |
| Análisis de valores límite | Componente | Contraseña de 7 caracteres (inválida) vs. 8 caracteres (válida) |
| Tabla de decisiones | Componente | Combinaciones de estado del usuario en `AuthGuard` (no autenticado, autenticado sin rol, autenticado con rol) |
| Prueba de estado | Componente | Transiciones de `loading → authenticated → unauthenticated` en `AuthProvider` |
| Prueba de contrato | Integración | `HttpAuthAdapter` verifica que los payloads enviados coincidan con la API del backend |

### 3.3 Ciclos de ejecución

1. **Unit / Component (CI — cada PR):** Ejecución automática de toda la suite Jest al abrir un Pull Request. Bloquea el merge si hay fallos.
2. **Integration (CI — cada PR hacia develop):** Job diferenciado en el pipeline que ejecuta únicamente los tests de `infrastructure/` con `testPathPattern=infrastructure`.
3. **Regresión manual (previo a release):** Verificación funcional del flujo completo en un entorno con el backend levantado vía `docker-compose`.

---

## 4. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN

### HU-AUTH-01: Registro de usuario

**Descripción:** Como usuario nuevo, quiero registrarme con nombre, correo y contraseña para acceder al sistema.

**Criterios de aceptación:**
- El formulario no se envía si nombre, correo o contraseña están vacíos.
- El sistema rechaza contraseñas que no cumplan: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
- Al registrarse con éxito, se almacena el mensaje `signup_success` en `sessionStorage` y se redirige a `/signin`.
- Si el correo ya existe, se muestra el mensaje traducido "El correo ya está registrado."
- Los campos de texto son sanitizados antes de enviarse al backend.

### HU-AUTH-02: Inicio de sesión

**Descripción:** Como usuario registrado, quiero iniciar sesión con correo y contraseña para acceder al dashboard.

**Criterios de aceptación:**
- El formulario no se envía si algún campo está vacío tras sanitización y trim.
- Al iniciar sesión correctamente, se almacena el JWT en cookie y se redirige a `/dashboard`.
- Si las credenciales son inválidas, se muestra el mensaje de error proveniente del backend.
- Al montar el componente, se lee `sessionStorage` por el mensaje de registro exitoso, se muestra como toast y se elimina del storage.
- El toast desaparece automáticamente a los 4 segundos.

### HU-AUTH-03: Protección de rutas por autenticación y rol

**Descripción:** Como sistema, quiero proteger las rutas que requieren autenticación o roles específicos para evitar accesos no autorizados.

**Criterios de aceptación:**
- Si el usuario no está autenticado, `AuthGuard` redirige a `/signin`.
- Si el usuario está autenticado pero no tiene el rol requerido, `AuthGuard` redirige a `/`.
- Si el usuario está autenticado y tiene el rol correcto, se renderiza el contenido protegido.
- Mientras `loading` es `true`, `AuthGuard` no renderiza nada (evita flash de contenido).

### HU-AUTH-04: Restauración de sesión (persistencia)

**Descripción:** Como usuario, quiero que mi sesión se restaure al recargar la página para no tener que autenticarme nuevamente.

**Criterios de aceptación:**
- `AuthProvider` llama a `getSession()` al montarse y establece el usuario si existe sesión activa.
- `HttpAuthAdapter.getSession()` lee la cookie JWT, llama a `GET /auth/me` con el header `Authorization: Bearer <token>` y devuelve el usuario mapeado.
- Si no hay cookie o la sesión es inválida, `getSession()` devuelve `null` y `isAuthenticated` queda en `false`.

---

## 5. DISEÑO DE CASOS DE PRUEBA

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

---

## 6. REQUERIMIENTOS

1. Node.js 20+ y dependencias instaladas (`npm install` en `frontend/`).
2. Acceso al repositorio con permisos de lectura/escritura para el pipeline CI.
3. Variables de entorno de prueba definidas (la URL del backend puede ser cualquier origen para pruebas de componente, ya que se mockea).
4. Set de datos de prueba: al menos un usuario mock con rol `admin` y uno con rol `employee`.
5. Acceso a GitHub Actions para verificar la ejecución del pipeline en verde.

---

## 7. MATRIZ DE RIESGOS

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

## 8. DISTINCIÓN TÉCNICA: CAJA BLANCA vs CAJA NEGRA

**Pruebas de Caja Blanca (Suites 1–4)**  
Se conoce la implementación interna. Los tests importan directamente los componentes y providers, inspeccionan el árbol del DOM resultante, verifican que se llamaron funciones específicas (ej. `router.push`, `sessionStorage.setItem`) y validan transiciones de estado interno. Las dependencias (`authService`, `useRouter`) son mocks controlados que permiten forzar cualquier escenario.

**Pruebas de Caja Negra (Suite 5 — HttpAuthAdapter)**  
Se valida el comportamiento observable del adaptador sin conocer cómo el servidor procesa la solicitud. El adaptador recibe una respuesta simulada del servidor (mock de `fetch`) y se verifica únicamente lo que produce hacia afuera: el `AuthResult` retornado, las cookies seteadas y los payloads enviados. No se accede a variables internas del adaptador ni se verifica su lógica de flujo de control; solo sus entradas y salidas.
