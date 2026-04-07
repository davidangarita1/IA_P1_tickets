// ⚕️ HUMAN CHECK - Step Definitions: Creación de turno (Caja Negra)
// Usa NestJS Testing Module + Supertest para validar la API como consumidor externo.
// Las dependencias externas (RabbitMQ, MongoDB) se sustituyen por stubs in-memory.

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProducerController } from '@/presentation/producer.controller';
import { CreateTurnoUseCase } from '@/application/use-cases/create-turno.use-case';
import { GetAllTurnosUseCase } from '@/application/use-cases/get-all-turnos.use-case';
import { GetTurnosByCedulaUseCase } from '@/application/use-cases/get-turnos-by-cedula.use-case';
import { EVENT_PUBLISHER_TOKEN, TURNO_REPOSITORY_TOKEN } from '@/domain/ports/tokens';
import { IEventPublisher } from '@/domain/ports/IEventPublisher';

// ⚕️ HUMAN CHECK - Timeout de 30s para levantar el módulo NestJS en CI
setDefaultTimeout(30_000);

// ── Stubs in-memory para aislar la prueba de Caja Negra ────────────────────
const stubEventPublisher: IEventPublisher = {
    publish: () => { /* no-op: stub para desacoplar de RabbitMQ */ },
};

const stubTurnoRepository = {
    findAll: async () => [],
    findByCedula: async () => [],
};

// ── World state compartido entre steps ─────────────────────────────────────
let app: INestApplication;
let response: request.Response;

Before(async function () {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [ProducerController],
        providers: [
            CreateTurnoUseCase,
            GetAllTurnosUseCase,
            GetTurnosByCedulaUseCase,
            { provide: EVENT_PUBLISHER_TOKEN, useValue: stubEventPublisher },
            { provide: TURNO_REPOSITORY_TOKEN, useValue: stubTurnoRepository },
        ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // ⚕️ HUMAN CHECK - Habilitar ValidationPipe igual que en producción
    // para que class-validator rechace payloads inválidos (prueba de Caja Negra real).
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.init();
});

After(async function () {
    if (app) await app.close();
});

// ── Given ──────────────────────────────────────────────────────────────────

Given('el sistema de turnos está disponible', function () {
    // Estado inicial: la app NestJS está inicializada (Before hook)
    if (!app) throw new Error('La aplicación no se inicializó correctamente');
});

Given('no existe un turno previo para el paciente con cédula {int}', function (_cedula: number) {
    // Estado inicial: repositorio in-memory vacío (stub retorna [])
    // No se requiere acción — el stub ya garantiza este estado
});

// ── When ───────────────────────────────────────────────────────────────────

When(
    'el paciente {string} con cédula {int} solicita un turno con prioridad {string}',
    async function (nombre: string, cedula: number, priority: string) {
        response = await request(app.getHttpServer())
            .post('/turnos')
            .send({ nombre, cedula, priority })
            .set('Content-Type', 'application/json');
    },
);

When(
    'el paciente {string} con cédula {int} solicita un turno sin prioridad',
    async function (nombre: string, cedula: number) {
        response = await request(app.getHttpServer())
            .post('/turnos')
            .send({ nombre, cedula })
            .set('Content-Type', 'application/json');
    },
);

When('se envía una solicitud de turno sin nombre ni cédula', async function () {
    response = await request(app.getHttpServer())
        .post('/turnos')
        .send({})
        .set('Content-Type', 'application/json');
});

// ── Then ───────────────────────────────────────────────────────────────────

Then('el sistema acepta el turno para procesamiento asíncrono', function () {
    if (response.status !== 202) {
        throw new Error(`Esperaba HTTP 202, recibió ${response.status}: ${JSON.stringify(response.body)}`);
    }
});

Then('la respuesta contiene estado {string}', function (expectedStatus: string) {
    if (response.body.status !== expectedStatus) {
        throw new Error(`Esperaba status "${expectedStatus}", recibió "${response.body.status}"`);
    }
});

Then('la respuesta contiene mensaje {string}', function (expectedMessage: string) {
    if (response.body.message !== expectedMessage) {
        throw new Error(`Esperaba message "${expectedMessage}", recibió "${response.body.message}"`);
    }
});

Then('el sistema rechaza la solicitud con error de validación', function () {
    if (response.status < 400 || response.status >= 500) {
        throw new Error(`Esperaba error 4xx de validación, recibió ${response.status}`);
    }
});

Then('el código de respuesta HTTP es {int}', function (expectedCode: number) {
    if (response.status !== expectedCode) {
        throw new Error(`Esperaba HTTP ${expectedCode}, recibió ${response.status}`);
    }
});
