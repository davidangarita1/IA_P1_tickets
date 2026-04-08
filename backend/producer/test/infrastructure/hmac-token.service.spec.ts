import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { HmacTokenService } from '../../src/infrastructure/adapters/hmac-token.service';

describe('HmacTokenService (Infrastructure)', () => {
  const TEST_SECRET = 'test-secret';
  const configService: Pick<ConfigService, 'get'> = {
    get: jest.fn().mockReturnValue(TEST_SECRET),
  };

  let service: HmacTokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HmacTokenService(configService as ConfigService);
  });

  const signData = (data: string): string => {
    return createHmac('sha256', TEST_SECRET).update(data).digest('base64url');
  };

  describe('generateToken', () => {
    it('generates a token with data.signature format', () => {
      const payload = { userId: '123', email: 'test@test.com' };

      const token = service.generateToken(payload);

      expect(token).toContain('.');
      expect(token.split('.')).toHaveLength(2);
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token and returns the payload', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = service.generateToken(payload);

      const result = service.verifyToken(token);

      expect(result).toEqual(payload);
    });

    it('returns null when token has invalid format', () => {
      const invalidToken = 'invalid-token-without-dot';

      const result = service.verifyToken(invalidToken);

      expect(result).toBeNull();
    });

    it('returns null when signature does not match', () => {
      const payload = { userId: '123' };
      const token = service.generateToken(payload);
      const [data] = token.split('.');
      const tamperedToken = `${data}.wrong-signature`;

      const result = service.verifyToken(tamperedToken);

      expect(result).toBeNull();
    });

    it('returns null when payload is not valid JSON', () => {
      const notJsonData = Buffer.from('not-valid-json', 'utf8').toString('base64url');
      const validSignature = signData(notJsonData);
      const tokenWithInvalidJson = `${notJsonData}.${validSignature}`;

      const result = service.verifyToken(tokenWithInvalidJson);

      expect(result).toBeNull();
    });
  });
});
