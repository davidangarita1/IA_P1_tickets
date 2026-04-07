import {
  LoginCredentials,
  LoginUseCase,
  LoginDependencies,
  LoginResult,
  ITokenService,
} from '@/application/use-cases/login.use-case';
import { IUserRecord, IUserRepository } from '@/domain/ports/IUserRepository';
import { IPasswordHasher } from '@/application/ports/IPasswordHasher';

// Valida que LoginUseCase retorna token + usuario completo para la respuesta del front.
describe('LoginUseCase — aligned with frontend contract', () => {
  const credentials: LoginCredentials = { email: 'luis@example.com', password: 'secret' };
  const storedUser: IUserRecord = {
    id: 'user-1',
    email: credentials.email,
    passwordHash: '$argon2id$secret',
    nombre: 'Luis',
    rol: 'empleado',
    isActive: true,
  };

  let repository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<ITokenService>;
  let dependencies: LoginDependencies;

  beforeEach(() => {
    repository = { findByEmail: jest.fn(), create: jest.fn() } as jest.Mocked<IUserRepository>;
    passwordHasher = { hash: jest.fn(), compare: jest.fn() } as jest.Mocked<IPasswordHasher>;
    tokenService = { generateToken: jest.fn() } as jest.Mocked<ITokenService>;
    dependencies = { userRepository: repository, passwordHasher, tokenService };
  });

  it('should fail when the user is missing', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUseCase(dependencies);

    // Act & Assert
    await expect(useCase.execute(credentials)).rejects.toThrow('User not found');
    expect(repository.findByEmail).toHaveBeenCalledWith(credentials.email);
  });

  it('should fail when the password does not match', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(storedUser);
    passwordHasher.compare.mockResolvedValue(false);
    const useCase = new LoginUseCase(dependencies);

    // Act & Assert
    await expect(useCase.execute(credentials)).rejects.toThrow('Invalid credentials');
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      credentials.password,
      storedUser.passwordHash,
    );
  });

  it('should return token AND usuario when credentials are valid', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(storedUser);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.generateToken.mockReturnValue('valid-token');
    const useCase = new LoginUseCase(dependencies);

    // Act
    const result: LoginResult = await useCase.execute(credentials);

    // Assert — frontend needs token + full user data
    expect(result).toEqual({
      token: 'valid-token',
      usuario: {
        id: storedUser.id,
        email: storedUser.email,
        nombre: storedUser.nombre,
        rol: storedUser.rol,
      },
    });
    expect(tokenService.generateToken).toHaveBeenCalledWith({
      sub: storedUser.id,
      email: storedUser.email,
      nombre: storedUser.nombre,
      rol: storedUser.rol,
    });
  });
});
