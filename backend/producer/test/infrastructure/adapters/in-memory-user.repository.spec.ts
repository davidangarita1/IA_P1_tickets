import { InMemoryUserRepository } from '../../../src/infrastructure/adapters/in-memory-user.repository';

describe('InMemoryUserRepository (Infrastructure)', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe('findByEmail', () => {
    it('returns null when user does not exist', async () => {
      const email = 'nonexistent@test.com';

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
    });

    it('returns the user when it exists', async () => {
      const userData = {
        email: 'test@test.com',
        passwordHash: 'hash123',
        nombre: 'Test User',
        rol: 'employee',
      };
      await repository.create(userData);

      const result = await repository.findByEmail(userData.email);

      expect(result).not.toBeNull();
      expect(result?.email).toBe(userData.email);
      expect(result?.nombre).toBe(userData.nombre);
    });
  });

  describe('create', () => {
    it('creates a user with sequential ID', async () => {
      const userData = {
        email: 'new@test.com',
        passwordHash: 'hash',
        nombre: 'New User',
        rol: 'admin',
      };

      const user = await repository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.isActive).toBe(true);
    });

    it('assigns unique IDs to consecutive users', async () => {
      const userData1 = { email: 'user1@test.com', passwordHash: 'h1', nombre: 'U1', rol: 'r' };
      const userData2 = { email: 'user2@test.com', passwordHash: 'h2', nombre: 'U2', rol: 'r' };

      const user1 = await repository.create(userData1);
      const user2 = await repository.create(userData2);

      expect(user1.id).not.toBe(user2.id);
    });
  });
});
