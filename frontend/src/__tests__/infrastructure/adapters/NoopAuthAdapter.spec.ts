import { NoopAuthAdapter } from '@/infrastructure/adapters/NoopAuthAdapter';

describe('NoopAuthAdapter', () => {
  let adapter: NoopAuthAdapter;

  beforeEach(() => {
    adapter = new NoopAuthAdapter();
  });

  describe('signIn', () => {
    it("returns success: false with 'Auth not configured' message", async () => {
      const result = await adapter.signIn({ email: 'user@example.com', password: 'pass' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Auth not configured');
    });
  });

  describe('signUp', () => {
    it("returns success: false with 'Auth not configured' message", async () => {
      const result = await adapter.signUp({
        email: 'user@example.com',
        password: 'pass',
        name: 'User',
        role: 'employee',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Auth not configured');
    });
  });

  describe('signOut', () => {
    it('resolves without error', async () => {
      await expect(adapter.signOut()).resolves.toBeUndefined();
    });
  });

  describe('getSession', () => {
    it('returns null (no session configured)', async () => {
      const session = await adapter.getSession();

      expect(session).toBeNull();
    });
  });
});
