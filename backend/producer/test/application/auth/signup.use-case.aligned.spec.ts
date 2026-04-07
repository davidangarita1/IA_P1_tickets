import { IUserRecord, IUserRepository } from '@/domain/ports/IUserRepository';
import { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import {
  SignupCredentials,
  SignupDependencies,
  SignupUseCase,
  SignupResult,
} from '@/application/use-cases/signup.use-case';
import { ITokenService } from '@/application/use-cases/login.use-case';

// Valida que SignupUseCase retorna token + usuario para la respuesta del front.
describe('SignupUseCase — aligned with frontend contract', () => {
  const credentials: SignupCredentials = {
    email: 'luis@example.com',
    password: 'secret',
    nombre: 'Luis',
    rol: 'empleado',
  };
  const hashedSecret = '$argon2id$hashed-secret';
  const createdUser: IUserRecord = {
    id: 'user-2',
    email: credentials.email,
    passwordHash: hashedSecret,
    nombre: 'Luis',
    rol: 'empleado',
    isActive: true,
  };

  let repository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<ITokenService>;
  let dependencies: SignupDependencies;

  beforeEach(() => {
    repository = { findByEmail: jest.fn(), create: jest.fn() } as jest.Mocked<IUserRepository>;
    passwordHasher = { hash: jest.fn(), compare: jest.fn() } as jest.Mocked<IPasswordHasher>;
    tokenService = { generateToken: jest.fn() } as jest.Mocked<ITokenService>;
    dependencies = { userRepository: repository, passwordHasher, tokenService };
  });

  it('should error when the email is already registered', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(createdUser);
    const useCase = new SignupUseCase(dependencies);

    // Act & Assert
    await expect(useCase.execute(credentials)).rejects.toThrow('Email already in use');
    expect(repository.findByEmail).toHaveBeenCalledWith(credentials.email);
  });

  it('should return token + usuario on valid signup', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue(hashedSecret);
    repository.create.mockResolvedValue(createdUser);
    tokenService.generateToken.mockReturnValue('new-token');
    const useCase = new SignupUseCase(dependencies);

    // Act
    const result: SignupResult = await useCase.execute(credentials);

    // Assert — frontend needs token + full user data immediately after signup
    expect(result).toEqual({
      token: 'new-token',
      usuario: {
        id: createdUser.id,
        email: createdUser.email,
        nombre: createdUser.nombre,
        rol: createdUser.rol,
      },
    });
    expect(passwordHasher.hash).toHaveBeenCalledWith(credentials.password);
    expect(repository.create).toHaveBeenCalledWith({
      email: credentials.email,
      passwordHash: hashedSecret,
      nombre: 'Luis',
      rol: 'empleado',
    });
    expect(tokenService.generateToken).toHaveBeenCalledWith({
      sub: createdUser.id,
      email: createdUser.email,
      nombre: createdUser.nombre,
      rol: createdUser.rol,
    });
  });
});
