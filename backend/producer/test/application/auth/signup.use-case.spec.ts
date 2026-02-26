import { IUserRecord, IUserRepository } from '../../../src/domain/ports/IUserRepository';
import { IPasswordHasher } from '../../../src/application/ports/IPasswordHasher';
import { SignupCredentials, SignupDependencies, SignupUseCase } from '../../../src/application/use-cases/signup.use-case';

// Asegura que el contrato de signup lanza los errores esperados antes de implementarlo.
describe('SignupUseCase (red tests)', () => {
  const credentials: SignupCredentials = { email: 'luis@example.com', password: 'secret' };
  const hashedSecret = '$argon2id$hashed-secret';
  const createdUser: IUserRecord = {
    id: 'user-2',
    email: credentials.email,
    passwordHash: hashedSecret,
    isActive: true,
  };

  let repository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let dependencies: SignupDependencies;

  beforeEach(() => {
    repository = { findByEmail: jest.fn(), create: jest.fn() } as jest.Mocked<IUserRepository>;
    passwordHasher = { hash: jest.fn(), compare: jest.fn() } as jest.Mocked<IPasswordHasher>;
    dependencies = { userRepository: repository, passwordHasher };
  });

  it('should error when the email is already registered', async () => {
    repository.findByEmail.mockResolvedValue(createdUser);
    const useCase = new SignupUseCase(dependencies);

    await expect(useCase.execute(credentials)).rejects.toThrow('Email already in use');
    expect(repository.findByEmail).toHaveBeenCalledWith(credentials.email);
  });

  it('should return the new user id once signup data is valid', async () => {
    repository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue(hashedSecret);
    repository.create.mockResolvedValue(createdUser);
    const useCase = new SignupUseCase(dependencies);

    await expect(useCase.execute(credentials)).resolves.toBe(createdUser.id);
    expect(passwordHasher.hash).toHaveBeenCalledWith(credentials.password);
    expect(repository.create).toHaveBeenCalledWith({
      email: credentials.email,
      passwordHash: hashedSecret,
    });
  });
});