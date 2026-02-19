import { Test, TestingModule } from '@nestjs/testing';
import { CreateTurnoUseCase } from '../src/application/use-cases/create-turno.use-case';
import { IEventPublisher } from '../src/domain/ports/IEventPublisher';
import { EVENT_PUBLISHER_TOKEN } from '../src/domain/ports/tokens';

describe('CreateTurnoUseCase', () => {
    let useCase: CreateTurnoUseCase;
    let mockEventPublisher: jest.Mocked<IEventPublisher>;

    beforeEach(async () => {
        /**
         * Mock de IEventPublisher (puerto de dominio)
         * ⚕️ HUMAN CHECK - DIP: el test mockea el puerto, no ClientProxy
         */
        mockEventPublisher = {
            publish: jest.fn(),
        } as jest.Mocked<IEventPublisher>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTurnoUseCase,
                {
                    provide: EVENT_PUBLISHER_TOKEN,
                    useValue: mockEventPublisher,
                },
            ],
        }).compile();

        useCase = module.get<CreateTurnoUseCase>(CreateTurnoUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute - Casos exitosos', () => {
        /**
         * PRUEBA 1: Crear turno válido
         * Verifica que se publique el evento y retorne confirmación
         */
        it('Debe publicar evento crear_turno y retornar status accepted', () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            const result = useCase.execute(createTurnoDto);

            expect(mockEventPublisher.publish).toHaveBeenCalledWith('crear_turno', createTurnoDto);
            expect(result).toEqual({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });
        });

        /**
         * PRUEBA 2: Múltiples turnos consecutivos
         * Verifica que cada turno se publique correctamente
         */
        it('Debe manejar múltiples turnos consecutivos', () => {
            const turno1 = { cedula: 111111111, nombre: 'Ana García' };
            const turno2 = { cedula: 222222222, nombre: 'Carlos López' };

            useCase.execute(turno1);
            useCase.execute(turno2);

            expect(mockEventPublisher.publish).toHaveBeenCalledTimes(2);
            expect(mockEventPublisher.publish).toHaveBeenNthCalledWith(1, 'crear_turno', turno1);
            expect(mockEventPublisher.publish).toHaveBeenNthCalledWith(2, 'crear_turno', turno2);
        });

        /**
         * PRUEBA 3: Datos con caracteres especiales
         * Verifica que maneje nombres con acentos y caracteres especiales
         */
        it('Debe manejar nombres con acentos y caracteres especiales', () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'María José O\'Connor-García',
            };

            const result = useCase.execute(createTurnoDto);

            expect(mockEventPublisher.publish).toHaveBeenCalledWith('crear_turno', createTurnoDto);
            expect(result.status).toBe('accepted');
        });
    });

    describe('execute - Manejo de errores', () => {
        /**
         * PRUEBA 4: Error en publish
         * Verifica que lance error si el publisher falla
         */
        it('Debe lanzar error si el publisher falla', () => {
            const publishError = new Error('AMQP connection failed');
            mockEventPublisher.publish.mockImplementationOnce(() => {
                throw publishError;
            });

            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            expect(() => useCase.execute(createTurnoDto)).toThrow('AMQP connection failed');
        });

        /**
         * PRUEBA 5: Error de timeout
         * Verifica comportamiento si el publisher tarda demasiado
         */
        it('Debe manejar timeout del publisher', () => {
            const timeoutError = new Error('Request timeout');
            mockEventPublisher.publish.mockImplementationOnce(() => {
                throw timeoutError;
            });

            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            expect(() => useCase.execute(createTurnoDto)).toThrow('Request timeout');
        });

        /**
         * PRUEBA 6: Error de conexión
         * Verifica que lance error si no hay conexión
         */
        it('Debe lanzar error si la conexión está cerrada', () => {
            const connectionError = new Error('Connection closed');
            mockEventPublisher.publish.mockImplementationOnce(() => {
                throw connectionError;
            });

            const createTurnoDto = {
                cedula: 987654321,
                nombre: 'María López',
            };

            expect(() => useCase.execute(createTurnoDto)).toThrow('Connection closed');
        });
    });

    describe('execute - Validación de datos enviados', () => {
        /**
         * PRUEBA 7: Verificar integridad del payload enviado
         * Verifica que los datos se publiquen exactamente como se recibieron
         */
        it('Debe enviar los datos exactos sin modificaciones', () => {
            const originalDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            useCase.execute(originalDto);

            const callArgument = mockEventPublisher.publish.mock.calls[0][1];
            expect(callArgument).toEqual(originalDto);
            expect(callArgument).toStrictEqual(originalDto);
        });

        /**
         * PRUEBA 8: Event name verification
         * Verifica que el nombre del evento sea exacto
         */
        it('Debe publicar el evento con nombre exacto "crear_turno"', () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            useCase.execute(createTurnoDto);

            const eventName = mockEventPublisher.publish.mock.calls[0][0];
            expect(eventName).toBe('crear_turno');
            expect(eventName).not.toBe('crearTurno');
            expect(eventName).not.toBe('crear-turno');
        });
    });

    describe('execute - Tipos de datos edge cases', () => {
        /**
         * PRUEBA 9: Cédula dentro de rango seguro
         * Verifica manejo de números en rango seguro
         */
        it('Debe manejar cédulas dentro del rango seguro de JavaScript', () => {
            const createTurnoDto = {
                cedula: Number.MAX_SAFE_INTEGER,
                nombre: 'Juan Pérez',
            };

            const result = useCase.execute(createTurnoDto);
            expect(result.status).toBe('accepted');
            expect(mockEventPublisher.publish).toHaveBeenCalled();
        });

        /**
         * PRUEBA 10: Nombre muy largo
         * Verifica que acepte nombres largos
         */
        it('Debe manejar nombres muy largos', () => {
            const longName = 'A'.repeat(1000);
            const createTurnoDto = {
                cedula: 123456789,
                nombre: longName,
            };

            const result = useCase.execute(createTurnoDto);
            expect(result.status).toBe('accepted');
        });
    });
});
