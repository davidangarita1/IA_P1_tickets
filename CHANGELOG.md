# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-03-05

### Added
- **Authentication feature** for frontend module with Sign Up, Sign In, and Route Protection flows.
- `AuthProvider` component for global authentication state management using React Context.
- `ConnectedAuthProvider` wrapper for dependency injection and service wiring.
- `SignUpForm` component with password validation rules and input sanitization.
- `SignInForm` component with credentials validation and session management.
- `AuthGuard` component for protecting routes based on authentication status and user roles.
- `HttpAuthAdapter` for HTTP communication with authentication endpoints (`POST /auth/signUp`, `POST /auth/signIn`).
- `authMapper` utility to transform backend authentication responses into domain models.
- Comprehensive test plan (`TEST_PLAN_FRONT.md`) covering White-Box and Black-Box testing strategies.
- Integration of authentication security practices: input sanitization, JWT storage in cookies, session validation.

### Changed
- Updated CI/CD pipeline to include multilevel testing jobs (component tests, integration tests, build validation).
- Dockerfile configurations updated to comply with security best practices (non-root user execution, multi-stage builds).

### Security
- All user inputs are sanitized before sending to backend endpoints.
- JWT tokens are stored in secure HTTP-only cookies.
- Route protection enforces authentication and role-based access control.

---

## [1.0.1] — 2026-02-20

### Added
- MVP foundation with basic project structure for frontend, producer (backend), and consumer (backend) services.
- Docker Compose configuration for local development environment with MongoDB, RabbitMQ, and service orchestration.
- Initial CI/CD pipeline with GitHub Actions for linting, type checking, and basic test execution.
- Jest and React Testing Library setup for unit and integration testing.
- TypeScript strict mode configuration across all services.
- Basic API skeleton for appointment scheduling system.

### Fixed
- Docker network configuration to isolate services properly.

---

[1.1.0]: https://github.com/Duver0/IA_P1/releases/tag/v1.1.0
[1.0.1]: https://github.com/Duver0/IA_P1/releases/tag/v1.0.1
