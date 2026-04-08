import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CreateDoctorUseCase } from '@/doctors/application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from '@/doctors/application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from '@/doctors/application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from '@/doctors/application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '@/doctors/application/use-cases/delete-doctor.use-case';
import { DoctorController } from '@/doctors/presentation/controllers/doctor.controller';
import { AuthGuard } from '@/presentation/auth.guard';
import { DoctorRoleGuard } from '@/doctors/presentation/guards/doctor-role.guard';
import {
  DOCTOR_REPOSITORY_TOKEN,
  TURNO_REPOSITORY_TOKEN,
  ACCESS_TOKEN_VERIFIER_TOKEN,
} from '@/domain/ports/tokens';
import { IDoctorRepository } from '@/doctors/domain/ports/doctor.repository';
import { ITurnoRepository } from '@/domain/ports/ITurnoRepository';
import { Doctor } from '@/doctors/domain/entities/doctor.entity';

describe('DoctorsModule Integration', () => {
  let app: INestApplication;

  const mockDoctorRepository: jest.Mocked<IDoctorRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    findById: jest.fn(),
    findByDocumentId: jest.fn(),
    findActiveByDocumentId: jest.fn(),
    findByOfficeAndShift: jest.fn(),
    findAvailableShifts: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockTurnoRepository: jest.Mocked<ITurnoRepository> = {
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    findActiveByOffice: jest.fn(),
  };

  const mockTokenVerifier = {
    verifyToken: jest.fn(),
  };

  const makeDoctor = (overrides: Partial<ConstructorParameters<typeof Doctor>[0]> = {}): Doctor =>
    new Doctor({
      id: 'doc-1',
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      ...overrides,
    });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [
        { provide: DOCTOR_REPOSITORY_TOKEN, useValue: mockDoctorRepository },
        { provide: TURNO_REPOSITORY_TOKEN, useValue: mockTurnoRepository },
        { provide: ACCESS_TOKEN_VERIFIER_TOKEN, useValue: mockTokenVerifier },
        CreateDoctorUseCase,
        GetAllDoctorsUseCase,
        GetAvailableShiftsUseCase,
        UpdateDoctorUseCase,
        DeleteDoctorUseCase,
        AuthGuard,
        DoctorRoleGuard,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenVerifier.verifyToken.mockReturnValue({ uid: 'user-1', rol: 'empleado' });
  });

  it('returns 401 when no Authorization header is provided', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .send({ name: 'Juan García', documentId: '12345678' })
      .expect(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockTokenVerifier.verifyToken.mockReturnValue(null);

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer invalid-token')
      .send({ name: 'Juan García', documentId: '12345678' })
      .expect(401);
  });

  it('returns 403 when user role is not Empleado or Administrador', async () => {
    mockTokenVerifier.verifyToken.mockReturnValue({ uid: 'user-1', rol: 'paciente' });

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '12345678' })
      .expect(403);
  });

  it('returns 400 when name is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ documentId: '12345678' })
      .expect(400);
  });

  it('returns 400 when name is shorter than 3 characters', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'AB', documentId: '12345678' })
      .expect(400);
  });

  it('returns 400 when documentId is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García' })
      .expect(400);
  });

  it('returns 400 when documentId contains letters', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '123abc' })
      .expect(400);
  });

  it('returns 400 when documentId has fewer than 7 digits', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '123456' })
      .expect(400);
  });

  it('returns 400 when documentId has more than 10 digits', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '12345678901' })
      .expect(400);
  });

  it('returns 400 when shift value is not one of the two valid options', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '12345678', shift: '10:00-18:00' })
      .expect(400);
  });

  it('returns 400 when office is not a valid value (1-10)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '12345678', office: '99' })
      .expect(400);
  });

  it('strips unknown properties from request body (whitelist)', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(null);
    const created = makeDoctor();
    mockDoctorRepository.create.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Juan García',
        documentId: '12345678',
        maliciousField: 'should be stripped',
      })
      .expect(400);
  });

  it('returns 201 when creating a doctor with valid data', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(null);
    const created = makeDoctor();
    mockDoctorRepository.create.mockResolvedValue(created);

    const response = await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Juan García', documentId: '12345678' })
      .expect(201);

    expect(response.body._id).toBe('doc-1');
    expect(response.body.name).toBe('Juan García');
  });

  it('returns 201 when creating a doctor with office and shift', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(null);
    mockDoctorRepository.findByOfficeAndShift.mockResolvedValue(null);
    const created = makeDoctor();
    mockDoctorRepository.create.mockResolvedValue(created);

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Juan García',
        documentId: '12345678',
        office: '2',
        shift: '06:00-14:00',
      })
      .expect(201);
  });

  it('returns 409 when cedula already belongs to an active doctor', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(makeDoctor());

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Otro Médico', documentId: '12345678' })
      .expect(409);
  });

  it('returns 409 when office+shift combination is already taken', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(null);
    mockDoctorRepository.findByOfficeAndShift.mockResolvedValue(makeDoctor());

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Otro Médico',
        documentId: '99887766',
        office: '2',
        shift: '06:00-14:00',
      })
      .expect(409);
  });

  it('returns 400 when office is provided without shift (business rule)', async () => {
    mockDoctorRepository.findActiveByDocumentId.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Juan García',
        documentId: '12345678',
        office: '2',
      })
      .expect(400);
  });

  it('returns 200 with paginated active doctors', async () => {
    mockDoctorRepository.findAllPaginated.mockResolvedValue({
      data: [makeDoctor()],
      total: 1,
      page: 1,
      limit: 25,
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it('returns 200 when updating a doctor with valid data', async () => {
    const existing = makeDoctor();
    const updated = makeDoctor({ name: 'Pedro López' });
    mockDoctorRepository.findById.mockResolvedValue(existing);
    mockDoctorRepository.update.mockResolvedValue(updated);

    const response = await request(app.getHttpServer())
      .put('/api/v1/doctors/doc-1')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Pedro López' })
      .expect(200);

    expect(response.body.name).toBe('Pedro López');
  });

  it('returns 404 when updating a non-existent doctor', async () => {
    mockDoctorRepository.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .put('/api/v1/doctors/non-existent')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Pedro López' })
      .expect(404);
  });

  it('returns 400 when update DTO has invalid name', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/doctors/doc-1')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'AB' })
      .expect(400);
  });

  it('returns 204 when soft-deleting a doctor without active turnos', async () => {
    const doctor = makeDoctor();
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([]);
    mockDoctorRepository.softDelete.mockResolvedValue(
      makeDoctor({ status: 'inactive' }),
    );

    await request(app.getHttpServer())
      .delete('/api/v1/doctors/doc-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(204);
  });

  it('returns 409 when deleting a doctor with active turno in office', async () => {
    const doctor = makeDoctor();
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([
      { cedula: 123, consultorio: '2', estado: 'llamado' } as any,
    ]);

    await request(app.getHttpServer())
      .delete('/api/v1/doctors/doc-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(409);
  });

  it('returns 404 when deleting a non-existent doctor', async () => {
    mockDoctorRepository.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .delete('/api/v1/doctors/non-existent')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);
  });

  it('returns 200 with available shifts for an office', async () => {
    mockDoctorRepository.findAvailableShifts.mockResolvedValue({
      availableShifts: ['14:00-22:00'],
      occupiedShifts: ['06:00-14:00'],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/doctors/available-shifts?office=2')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.availableShifts).toContain('14:00-22:00');
    expect(response.body.occupiedShifts).toContain('06:00-14:00');
  });

  it('allows access with Administrador role', async () => {
    mockTokenVerifier.verifyToken.mockReturnValue({ uid: 'admin-1', rol: 'Administrador' });
    mockDoctorRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 25,
    });

    await request(app.getHttpServer())
      .get('/api/v1/doctors')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
  });
});
