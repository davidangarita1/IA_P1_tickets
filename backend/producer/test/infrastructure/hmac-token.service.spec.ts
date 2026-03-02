import { ConfigService } from '@nestjs/config';
import { HmacTokenService } from '../../src/infrastructure/adapters/hmac-token.service';

describe('HmacTokenService (Infrastructure)', () => {
    const configService: Pick<ConfigService, 'get'> = {
        get: jest.fn().mockReturnValue('test-secret'),
    };

    let service: HmacTokenService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new HmacTokenService(configService as ConfigService);
    });

    describe('generateToken', () => {
        it('genera un token con formato data.signature', () => {
            // Arrange
            const payload = { userId: '123', email: 'test@test.com' };

            // Act
            const token = service.generateToken(payload);

            // Assert
            expect(token).toContain('.');
            expect(token.split('.')).toHaveLength(2);
        });
    });

    describe('verifyToken', () => {
        it('verifica un token válido y retorna el payload', () => {
            // Arrange
            const payload = { userId: '123', email: 'test@test.com' };
            const token = service.generateToken(payload);

            // Act
            const result = service.verifyToken(token);

            // Assert
            expect(result).toEqual(payload);
        });

        it('retorna null si el token tiene formato inválido', () => {
            // Arrange
            const invalidToken = 'invalid-token-without-dot';

            // Act
            const result = service.verifyToken(invalidToken);

            // Assert
            expect(result).toBeNull();
        });

        it('retorna null si la firma no coincide', () => {
            // Arrange
            const payload = { userId: '123' };
            const token = service.generateToken(payload);
            const [data] = token.split('.');
            const tamperedToken = `${data}.wrong-signature`;

            // Act
            const result = service.verifyToken(tamperedToken);

            // Assert
            expect(result).toBeNull();
        });

        it('retorna null si el payload no es JSON válido', () => {
            // Arrange: crear token con data corrupta
            const corruptData = Buffer.from('not-json', 'utf8').toString('base64url');
            const corruptToken = `${corruptData}.fake-signature`;

            // Act
            const result = service.verifyToken(corruptToken);

            // Assert
            expect(result).toBeNull();
        });
    });
});
