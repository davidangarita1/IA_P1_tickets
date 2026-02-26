import {
  LoginCredentials,
  LoginUseCase,
  LoginDependencies,
  ITokenService,
} from '../../../src/application/use-cases/login.use-case';
import { IUserRecord, IUserRepository } from '../../../src/domain/ports/IUserRepository';
import { IPasswordHasher } from '../../../src/application/ports/IPasswordHasher';

// Valida el contrato esperado para el caso de uso de login antes de implementarlo.
describe('LoginUseCase (red tests)', () => {
  const credentials: LoginCredentials = { email: 'luis@example.com', password: 'secret' };
  const storedUser: IUserRecord = {
    id: 'user-1',
    email: credentials.email,
    passwordHash: '$argon2id$secret',
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
    repository.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUseCase(dependencies);

    await expect(useCase.execute(credentials)).rejects.toThrow('User not found');
    expect(repository.findByEmail).toHaveBeenCalledWith(credentials.email);
  });

  it('should fail when the password does not match', async () => {
    repository.findByEmail.mockResolvedValue(storedUser);
    passwordHasher.compare.mockResolvedValue(false);
    const useCase = new LoginUseCase(dependencies);

    await expect(useCase.execute(credentials)).rejects.toThrow('Invalid credentials');
    expect(passwordHasher.compare).toHaveBeenCalledWith(credentials.password, storedUser.passwordHash);
  });

  it('should return a token when credentials are valid', async () => {
    repository.findByEmail.mockResolvedValue(storedUser);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.generateToken.mockReturnValue('valid-token');
    const useCase = new LoginUseCase(dependencies);

    await expect(useCase.execute(credentials)).resolves.toBe('valid-token');
    expect(tokenService.generateToken).toHaveBeenCalled();
  });
});