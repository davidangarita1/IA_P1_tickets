import { AuthController } from '../../src/presentation/auth.controller';
import { LoginUseCase } from '../../src/application/use-cases/login.use-case';
import { SignupUseCase } from '../../src/application/use-cases/signup.use-case';
import { GetAllTurnosUseCase } from '../../src/application/use-cases/get-all-turnos.use-case';

describe('AuthController (Presentation)', () => {
  const signupUseCase: Pick<SignupUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  const loginUseCase: Pick<LoginUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  const getAllTurnosUseCase: Pick<GetAllTurnosUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      signupUseCase as SignupUseCase,
      loginUseCase as LoginUseCase,
      getAllTurnosUseCase as GetAllTurnosUseCase,
    );
  });

  it('delegates signUp and returns success with usuario', async () => {
    const signupResult = {
      token: 'new-token',
      usuario: { id: 'user-1', email: 'admin@eps.com', nombre: 'Admin', rol: 'admin' },
    };
    (signupUseCase.execute as jest.Mock).mockResolvedValue(signupResult);
    const request = { email: 'admin@eps.com', password: 'secret', nombre: 'Admin', rol: 'admin' };

    const result = await controller.signUp(request);

    expect(signupUseCase.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual({
      success: true,
      message: 'Registro exitoso',
      token: 'new-token',
      usuario: signupResult.usuario,
    });
  });

  it('delegates signIn and returns success with token + usuario', async () => {
    const loginResult = {
      token: 'signed-token',
      usuario: { id: 'user-1', email: 'admin@eps.com', nombre: 'Admin', rol: 'admin' },
    };
    (loginUseCase.execute as jest.Mock).mockResolvedValue(loginResult);
    const request = { email: 'admin@eps.com', password: 'secret' };

    const result = await controller.signIn(request);

    expect(loginUseCase.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual({
      success: true,
      message: 'Login exitoso',
      token: 'signed-token',
      usuario: loginResult.usuario,
    });
  });

  it('returns dashboard history from use case when already authenticated', async () => {
    const history = [
      {
        id: 't1',
        nombre: 'Paciente',
        cedula: 1,
        consultorio: null,
        estado: 'espera',
        priority: 'media',
        timestamp: 1,
      },
    ];
    (getAllTurnosUseCase.execute as jest.Mock).mockResolvedValue(history);

    const result = await controller.getDashboardHistory();

    expect(getAllTurnosUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(history);
  });

  it('signUp returns error message when use case throws Error', async () => {
    (signupUseCase.execute as jest.Mock).mockRejectedValue(new Error('Email ya registrado'));

    const result = await controller.signUp({
      email: 'test@test.com',
      password: 'pass',
      nombre: 'Test',
      rol: 'employee',
    });

    expect(result).toEqual({ success: false, message: 'Email ya registrado' });
  });

  it('signUp returns generic message when use case throws non-Error', async () => {
    (signupUseCase.execute as jest.Mock).mockRejectedValue('string error');

    const result = await controller.signUp({
      email: 'test@test.com',
      password: 'pass',
      nombre: 'Test',
      rol: 'employee',
    });

    expect(result).toEqual({ success: false, message: 'Error en registro' });
  });

  it('signIn returns error message when use case throws Error', async () => {
    (loginUseCase.execute as jest.Mock).mockRejectedValue(new Error('Credenciales inválidas'));

    const result = await controller.signIn({ email: 'test@test.com', password: 'wrong' });

    expect(result).toEqual({ success: false, message: 'Credenciales inválidas' });
  });

  it('signIn returns generic message when use case throws non-Error', async () => {
    (loginUseCase.execute as jest.Mock).mockRejectedValue('string error');

    const result = await controller.signIn({ email: 'test@test.com', password: 'wrong' });

    expect(result).toEqual({ success: false, message: 'Error en login' });
  });

  it('signOut returns success message', async () => {
    const result = await controller.signOut();

    expect(result).toEqual({ success: true, message: 'Sesión cerrada' });
  });
});
