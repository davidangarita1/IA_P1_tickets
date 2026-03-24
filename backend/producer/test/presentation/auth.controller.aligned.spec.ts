import { AuthController } from '../../src/presentation/auth.controller';
import { LoginUseCase, LoginResult } from '../../src/application/use-cases/login.use-case';
import { SignupUseCase, SignupResult } from '../../src/application/use-cases/signup.use-case';
import { GetAllTurnosUseCase } from '../../src/application/use-cases/get-all-turnos.use-case';

// Verifica que AuthController devuelve las respuestas que el frontend espera
// según el contrato definido en frontend/src/infrastructure/mappers/authMapper.ts:
//   BackendAuthResponse = { success, message, token?, usuario?: { id, email, nombre, rol } }
describe('AuthController — frontend-aligned contract', () => {
  const signupUseCase: Pick<SignupUseCase, 'execute'> = { execute: jest.fn() };
  const loginUseCase: Pick<LoginUseCase, 'execute'> = { execute: jest.fn() };
  const getAllTurnosUseCase: Pick<GetAllTurnosUseCase, 'execute'> = { execute: jest.fn() };

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      signupUseCase as SignupUseCase,
      loginUseCase as LoginUseCase,
      getAllTurnosUseCase as GetAllTurnosUseCase,
    );
  });

  // ─── POST /auth/signIn ──────────────────────────────────────────────
  describe('POST /auth/signIn', () => {
    it('returns { success, message, token, usuario } on valid credentials', async () => {
      // Arrange
      const loginResult: LoginResult = {
        token: 'signed-token',
        usuario: { id: 'user-1', email: 'admin@eps.com', nombre: 'Admin', rol: 'admin' },
      };
      (loginUseCase.execute as jest.Mock).mockResolvedValue(loginResult);

      // Act
      const result = await controller.signIn({ email: 'admin@eps.com', password: 'secret' });

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Login exitoso',
        token: 'signed-token',
        usuario: { id: 'user-1', email: 'admin@eps.com', nombre: 'Admin', rol: 'admin' },
      });
    });

    it('returns { success: false, message } when use case throws', async () => {
      // Arrange
      (loginUseCase.execute as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      // Act
      const result = await controller.signIn({ email: 'bad@eps.com', password: 'wrong' });

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });

  // ─── POST /auth/signUp ─────────────────────────────────────────────
  describe('POST /auth/signUp', () => {
    it('returns { success, message, token, usuario } on valid registration', async () => {
      // Arrange
      const signupResult: SignupResult = {
        token: 'new-token',
        usuario: { id: 'user-2', email: 'nurse@eps.com', nombre: 'Enfermera', rol: 'empleado' },
      };
      (signupUseCase.execute as jest.Mock).mockResolvedValue(signupResult);

      // Act
      const result = await controller.signUp({
        email: 'nurse@eps.com',
        password: 'secret',
        nombre: 'Enfermera',
        rol: 'empleado',
      });

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Registro exitoso',
        token: 'new-token',
        usuario: { id: 'user-2', email: 'nurse@eps.com', nombre: 'Enfermera', rol: 'empleado' },
      });
    });

    it('returns { success: false, message } when use case throws', async () => {
      // Arrange
      (signupUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email already in use'));

      // Act
      const result = await controller.signUp({
        email: 'dup@eps.com',
        password: 'secret',
        nombre: 'Dup',
        rol: 'empleado',
      });

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Email already in use',
      });
    });
  });

  // ─── POST /auth/signOut ─────────────────────────────────────────────
  describe('POST /auth/signOut', () => {
    it('returns success response', async () => {
      // Act
      const result = await controller.signOut();

      // Assert
      expect(result).toEqual({ success: true, message: 'Sesión cerrada' });
    });
  });

  // ─── GET /auth/me ────────────────────────────────────────────────────
  describe('GET /auth/me', () => {
    it('returns the current user from the token payload', async () => {
      // Arrange — the guard injects authUser into the request
      const req = { authUser: { sub: 'user-1', email: 'admin@eps.com', nombre: 'Admin', rol: 'admin' } };

      // Act
      const result = await controller.me(req as any);

      // Assert
      expect(result).toEqual({
        id: 'user-1',
        email: 'admin@eps.com',
        nombre: 'Admin',
        rol: 'admin',
      });
    });
  });
});
