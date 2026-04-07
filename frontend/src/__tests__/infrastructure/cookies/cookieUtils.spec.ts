import {
  setAuthCookie,
  getAuthCookie,
  removeAuthCookie,
  AUTH_COOKIE_NAME,
} from '@/infrastructure/cookies/cookieUtils';

describe('cookieUtils', () => {
  beforeEach(() => {
    document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/`;
  });

  describe('setAuthCookie', () => {
    it('stores the token in document.cookie with the expected name', () => {
      setAuthCookie('my-jwt-token');

      expect(document.cookie).toContain(AUTH_COOKIE_NAME);
    });

    it('overwrites the existing cookie when called again', () => {
      setAuthCookie('token-one');
      setAuthCookie('token-two');

      expect(getAuthCookie()).toBe('token-two');
    });

    it('sets Max-Age on the cookie string', () => {
      const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      expect(cookieDescriptor).toBeDefined();
      const setSpy = jest.fn();
      Object.defineProperty(document, 'cookie', {
        set: setSpy,
        get: cookieDescriptor!.get,
        configurable: true,
      });

      setAuthCookie('token-with-expiry');

      expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('Max-Age='));

      Object.defineProperty(document, 'cookie', cookieDescriptor!);
    });
  });

  describe('getAuthCookie', () => {
    it('returns the token value after it has been set', () => {
      setAuthCookie('test-token-123');

      expect(getAuthCookie()).toBe('test-token-123');
    });

    it('returns null when the cookie has not been set', () => {
      expect(getAuthCookie()).toBeNull();
    });

    it('returns null when the cookie exists but has an empty value', () => {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/`;

      expect(getAuthCookie()).toBeNull();
    });

    it('returns null after the cookie has been removed', () => {
      setAuthCookie('token-to-remove');
      removeAuthCookie();

      expect(getAuthCookie()).toBeNull();
    });
  });

  describe('removeAuthCookie', () => {
    it('removes the auth cookie from document.cookie', () => {
      setAuthCookie('remove-me');

      removeAuthCookie();

      expect(document.cookie).not.toContain(AUTH_COOKIE_NAME);
    });

    it('does not throw when called without a cookie set', () => {
      expect(() => removeAuthCookie()).not.toThrow();
    });
  });
});

describe('cookieUtils — module-level env branches', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses NEXT_PUBLIC_AUTH_COOKIE_NAME when the env variable is defined', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_NAME: 'custom_session' };

    const { AUTH_COOKIE_NAME: name } = await import('@/infrastructure/cookies/cookieUtils');

    expect(name).toBe('custom_session');
  });

  it('uses NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE when it is a valid positive integer', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE: '7200' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('token');

    expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('Max-Age=7200'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });

  it('falls back to 86400 when NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE is not a number', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE: 'invalid' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('token');

    expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('Max-Age=86400'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });

  it('falls back to 86400 when NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE is negative', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE: '-500' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('token');

    expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('Max-Age=86400'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });

  it('falls back to 86400 when NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE is a float', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE: '3.14' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('token');

    expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('Max-Age=86400'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });

  it('appends Secure flag when NODE_ENV is production', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'production' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('secure-token');

    expect(setSpy).toHaveBeenCalledWith(expect.stringContaining('; Secure'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });

  it('omits Secure flag when NODE_ENV is not production', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'test' };
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    expect(cookieDescriptor).toBeDefined();
    const setSpy = jest.fn();
    Object.defineProperty(document, 'cookie', {
      set: setSpy,
      get: cookieDescriptor!.get,
      configurable: true,
    });

    const { setAuthCookie: setCookie } = await import('@/infrastructure/cookies/cookieUtils');
    setCookie('test-token');

    expect(setSpy).toHaveBeenCalledWith(expect.not.stringContaining('; Secure'));

    Object.defineProperty(document, 'cookie', cookieDescriptor!);
  });
});
