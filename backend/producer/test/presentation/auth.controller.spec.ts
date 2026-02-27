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

  it('delegates signup and returns user id', async () => {
    // Arrange
    (signupUseCase.execute as jest.Mock).mockResolvedValue('user-1');
    const request = { email: 'admin@eps.com', password: 'secret' };

    // Act
    const result = await controller.signup(request);

    // Assert
    expect(signupUseCase.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual({ userId: 'user-1' });
  });

  it('delegates login and returns access token', async () => {
    // Arrange
    (loginUseCase.execute as jest.Mock).mockResolvedValue('signed-token');
    const request = { email: 'admin@eps.com', password: 'secret' };

    // Act
    const result = await controller.login(request);

    // Assert
    expect(loginUseCase.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual({ accessToken: 'signed-token' });
  });

  it('returns dashboard history from use case when already authenticated', async () => {
    // Arrange
    const history = [{ id: 't1', nombre: 'Paciente', cedula: 1, consultorio: null, estado: 'espera', priority: 'media', timestamp: 1 }];
    (getAllTurnosUseCase.execute as jest.Mock).mockResolvedValue(history);

    // Act
    const result = await controller.getDashboardHistory();

    // Assert
    expect(getAllTurnosUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(history);
  });
});