import { ScryptPasswordHasherAdapter } from '../../../src/infrastructure/adapters/scrypt-password-hasher.adapter';

describe('ScryptPasswordHasherAdapter (Infrastructure)', () => {
  let hasher: ScryptPasswordHasherAdapter;

  beforeEach(() => {
    hasher = new ScryptPasswordHasherAdapter();
  });

  describe('hash', () => {
    it('generates a hash with salt:digest format', async () => {
      const password = 'mySecurePassword123';

      const hashed = await hasher.hash(password);

      expect(hashed).toContain(':');
      expect(hashed.split(':')).toHaveLength(2);
    });

    it('generates different hashes for the same password (random salt)', async () => {
      const password = 'samePassword';

      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('returns true for correct password', async () => {
      const password = 'correctPassword';
      const hashed = await hasher.hash(password);

      const result = await hasher.compare(password, hashed);

      expect(result).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const password = 'correctPassword';
      const hashed = await hasher.hash(password);

      const result = await hasher.compare('wrongPassword', hashed);

      expect(result).toBe(false);
    });

    it('returns false when hash has invalid format', async () => {
      const invalidHash = 'no-colon-here';

      const result = await hasher.compare('anyPassword', invalidHash);

      expect(result).toBe(false);
    });
  });
});
