import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ProducerController } from '../src/presentation/producer.controller';
import { CreateTurnoUseCase } from '../src/application/use-cases/create-turno.use-case';
import { GetAllTurnosUseCase } from '../src/application/use-cases/get-all-turnos.use-case';
import { GetTurnosByCedulaUseCase } from '../src/application/use-cases/get-turnos-by-cedula.use-case';
import * as request from 'supertest';

describe('ProducerController (Integration Tests)', () => {
    let app: INestApplication;
    let createTurnoUseCase: jest.Mocked<CreateTurnoUseCase>;
    let getAllTurnosUseCase: jest.Mocked<GetAllTurnosUseCase>;
    let getTurnosByCedulaUseCase: jest.Mocked<GetTurnosByCedulaUseCase>;

    beforeEach(async () => {
        /**
         * Mock de los Use Cases
         * ⚕️ HUMAN CHECK - Los tests mockean Use Cases, no servicios de infraestructura
         */
        const mockCreateTurnoUseCase = {
            execute: jest.fn(),
        };

        const mockGetAllTurnosUseCase = {
            execute: jest.fn(),
        };

        const mockGetTurnosByCedulaUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProducerController],
            providers: [
                {
                    provide: CreateTurnoUseCase,
                    useValue: mockCreateTurnoUseCase,
                },
                {
                    provide: GetAllTurnosUseCase,
                    useValue: mockGetAllTurnosUseCase,
                },
                {
                    provide: GetTurnosByCedulaUseCase,
                    useValue: mockGetTurnosByCedulaUseCase,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        
        // Aplicar los mismos pipes de validación que en main.ts
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        createTurnoUseCase = module.get(CreateTurnoUseCase) as jest.Mocked<CreateTurnoUseCase>;
        getAllTurnosUseCase = module.get(GetAllTurnosUseCase) as jest.Mocked<GetAllTurnosUseCase>;
        getTurnosByCedulaUseCase = module.get(GetTurnosByCedulaUseCase) as jest.Mocked<GetTurnosByCedulaUseCase>;

        await app.init();
    });

    afterEach(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    describe('POST /turnos - Crear turno', () => {
        /**
         * PRUEBA 1: Crear turno exitosamente
         * Verifica que la API retorna 202 Accepted
         */
        it('Debe crear un turno y retornar 202 Accepted', async () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            createTurnoUseCase.execute.mockReturnValue({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });

            const response = await request(app.getHttpServer())
                .post('/turnos')
                .send(createTurnoDto)
                .expect(202);

            expect(response.body).toEqual({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });
            expect(createTurnoUseCase.execute).toHaveBeenCalledWith(createTurnoDto);
        });

        /**
         * PRUEBA 2: Fallar si falta cedula
         * Verifica validación de payload - retorna 400
         */
        it('Debe retornar 400 si falta la cedula', async () => {
            const invalidPayload = {
                nombre: 'Juan Pérez',
            };

            const response = await request(app.getHttpServer())
                .post('/turnos')
                .send(invalidPayload)
                .expect(400);

            expect(response.body.message).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('cedula'),
                ]),
            );
            expect(response.body.error).toBe('Bad Request');
        });

        /**
         * PRUEBA 3: Fallar si falta nombre
         * Verifica validación de payload
         */
        it('Debe retornar 400 si falta el nombre', async () => {
            const invalidPayload = {
                cedula: 123456789,
            };

            const response = await request(app.getHttpServer())
                .post('/turnos')
                .send(invalidPayload)
                .expect(400);

            expect(response.body.message).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('nombre'),
                ]),
            );
        });

        /**
         * PRUEBA 4: Fallar si cedula no es número
         * Verifica tipado de datos
         */
        it('Debe retornar 400 si cedula no es un número', async () => {
            const invalidPayload = {
                cedula: 'texto-invalido',
                nombre: 'Juan Pérez',
            };

            const response = await request(app.getHttpServer())
                .post('/turnos')
                .send(invalidPayload)
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
        });

        /**
         * PRUEBA 5: Rechazar propiedades adicionales
         * Verifica que whitelist está activo
         */
        it('Debe rechazar propiedades adicionales (whitelist)', async () => {
            const payloadWithExtra = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                telefono: '3001234567',
                extra: 'no permitida',
            };

            const response = await request(app.getHttpServer())
                .post('/turnos')
                .send(payloadWithExtra)
                .expect(400);

            expect(response.body.message).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('email'),
                    expect.stringContaining('telefono'),
                    expect.stringContaining('extra'),
                ]),
            );
        });

        /**
         * PRUEBA 6: Contenido sin bodyparser
         * Verifica que sin body retorna error
         */
        it('Debe retornar 400 si no se envía body', async () => {
            const response = await request(app.getHttpServer())
                .post('/turnos')
                .expect(400);

            expect(response.status).toBe(400);
        });

        /**
         * PRUEBA 7: Múltiples turnos en secuencia
         * Verifica que pueda procesar varios turnos seguidos
         */
        it('Debe procesar múltiples solicitudes de turnos', async () => {
            const turno1 = { cedula: 111111111, nombre: 'Ana García' };
            const turno2 = { cedula: 222222222, nombre: 'Carlos López' };

            createTurnoUseCase.execute.mockReturnValue({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });

            await request(app.getHttpServer())
                .post('/turnos')
                .send(turno1)
                .expect(202);

            await request(app.getHttpServer())
                .post('/turnos')
                .send(turno2)
                .expect(202);

            expect(createTurnoUseCase.execute).toHaveBeenCalledTimes(2);
        });

        /**
         * PRUEBA 8: Nombre con caracteres especiales
         * Verifica aceptación de acentos y caracteres especiales
         */
        it('Debe aceptar nombres con acentos y caracteres especiales', async () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'María José O\'Connor-García',
            };

            createTurnoUseCase.execute.mockReturnValue({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });

            await request(app.getHttpServer())
                .post('/turnos')
                .send(createTurnoDto)
                .expect(202);

            expect(createTurnoUseCase.execute).toHaveBeenCalledWith(createTurnoDto);
        });

        /**
         * PRUEBA 9: Cédula en formato string
         * Verifica que rechaza string cuando no hay transform habilitado
         */
        it('Debe rechazar cedula como string (no admite transform automático)', async () => {
            const createTurnoDto = {
                cedula: '123456789',
                nombre: 'Juan Pérez',
            };

            // ClassValidator debería rechazar la cédula en string cuando no hay transform
            await request(app.getHttpServer())
                .post('/turnos')
                .send(createTurnoDto)
                .expect(400);
        });

        /**
         * PRUEBA 10: Content-Type correcto
         * Verifica que maneja application/json
         */
        it('Debe procesar Content-Type application/json correctamente', async () => {
            const createTurnoDto = {
                cedula: 123456789,
                nombre: 'Juan Pérez',
            };

            createTurnoUseCase.execute.mockReturnValue({
                status: 'accepted',
                message: 'Turno en proceso de asignación',
            });

            await request(app.getHttpServer())
                .post('/turnos')
                .set('Content-Type', 'application/json')
                .send(createTurnoDto)
                .expect(202);
        });
    });

    describe('GET /turnos/:cedula - Consultar turnos', () => {
        /**
         * PRUEBA 11: Obtener turnos por cédula
         * Verifica que retorna lista de turnos
         */
        it('Debe retornar turnos para una cédula válida', async () => {
            const cedula = 123456789;
            const expectedTurnos = [
                {
                    cedula: 123456789,
                    nombre: 'Juan Pérez',
                    consultorio: '3',
                    estado: 'asignado',
                    timestamp: 1710000000,
                },
            ];

            getTurnosByCedulaUseCase.execute.mockResolvedValue(expectedTurnos as any);

            const response = await request(app.getHttpServer())
                .get(`/turnos/${cedula}`)
                .expect(200);

            expect(response.body).toEqual(expectedTurnos);
            expect(getTurnosByCedulaUseCase.execute).toHaveBeenCalledWith(cedula);
        });

        /**
         * PRUEBA 12: No encontrar turnos
         * Verifica que retorna 500 si el use case lanza error
         */
        it('Debe retornar 500 si el use case lanza error', async () => {
            const cedula = 999999999;

            getTurnosByCedulaUseCase.execute.mockRejectedValue(
                new Error('No se encontraron turnos para la cédula 999999999'),
            );

            await request(app.getHttpServer())
                .get(`/turnos/${cedula}`)
                .expect(500);

            expect(getTurnosByCedulaUseCase.execute).toHaveBeenCalledWith(cedula);
        });

        /**
         * PRUEBA 13: Cédula inválida (string no numérico)
         * Verifica ParseIntPipe
         */
        it('Debe retornar 400 si cedula no es un número válido', async () => {
            const response = await request(app.getHttpServer())
                .get('/turnos/texto-invalido')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
        });

        /**
         * PRUEBA 14: Cédula con valor 0
         * ParseIntPipe acepta 0 (validación de rango es responsabilidad del use case)
         */
        it('Debe retornar 200 si la cédula es 0 (ParseIntPipe permite)', async () => {
            const cedula = 0;
            const expectedTurnos: unknown[] = [];

            getTurnosByCedulaUseCase.execute.mockResolvedValue(expectedTurnos as any);

            const response = await request(app.getHttpServer())
                .get(`/turnos/${cedula}`)
                .expect(200);

            expect(response.body).toEqual(expectedTurnos);
        });

        /**
         * PRUEBA 15: Cédula negativa
         * ParseIntPipe acepta negativos (validación de rango es responsabilidad del use case)
         */
        it('Debe retornar 200 si la cédula es negativa (ParseIntPipe permite)', async () => {
            const cedula = -123456789;
            const expectedTurnos: unknown[] = [];

            getTurnosByCedulaUseCase.execute.mockResolvedValue(expectedTurnos as any);

            const response = await request(app.getHttpServer())
                .get(`/turnos/${cedula}`)
                .expect(200);

            expect(getTurnosByCedulaUseCase.execute).toHaveBeenCalledWith(cedula);
        });

        /**
         * PRUEBA 16: Múltiples turnos por cédula
         * Verifica que retorna array con múltiples elementos
         */
        it('Debe retornar múltiples turnos para la misma cédula', async () => {
            const cedula = 123456789;
            const expectedTurnos = [
                {
                    cedula: 123456789,
                    nombre: 'Juan Pérez',
                    consultorio: '3',
                    estado: 'asignado',
                    timestamp: 1710000000,
                },
                {
                    cedula: 123456789,
                    nombre: 'Juan Pérez',
                    consultorio: '5',
                    estado: 'atendido',
                    timestamp: 1709900000,
                },
            ];

            getTurnosByCedulaUseCase.execute.mockResolvedValue(expectedTurnos as any);

            const response = await request(app.getHttpServer())
                .get(`/turnos/${cedula}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body).toEqual(expectedTurnos);
        });
    });
});
