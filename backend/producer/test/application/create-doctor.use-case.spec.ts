import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateDoctorUseCase } from '../../src/doctors/application/use-cases/create-doctor.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';
import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('CreateDoctorUseCase (Application)', () => {
  const mockRepository: jest.Mocked<IDoctorRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDocumentId: jest.fn(),
    findActiveByDocumentId: jest.fn(),
    findByOfficeAndShift: jest.fn(),
    findAvailableShifts: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  let useCase: CreateDoctorUseCase;

  const makeDoctor = (): Doctor =>
    new Doctor({
      id: 'doc-1',
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateDoctorUseCase(mockRepository);
  });

  it('creates a doctor when no conflicts exist', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(null);
    mockRepository.findByOfficeAndShift.mockResolvedValue(null);
    const created = makeDoctor();
    mockRepository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
    });

    expect(result).toEqual(created);
    expect(mockRepository.findActiveByDocumentId).toHaveBeenCalledWith('12345678');
    expect(mockRepository.findByOfficeAndShift).toHaveBeenCalledWith('2', '06:00-14:00');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('creates a doctor without office and shift', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(null);
    const created = new Doctor({
      id: 'doc-2',
      name: 'Juan García',
      documentId: '12345678',
      office: null,
      shift: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      name: 'Juan García',
      documentId: '12345678',
      office: null,
      shift: null,
    });

    expect(result).toEqual(created);
    expect(mockRepository.findByOfficeAndShift).not.toHaveBeenCalled();
  });

  it('allows creating a doctor with the same cedula as an inactive doctor', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(null);
    const created = makeDoctor();
    mockRepository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      name: 'Juan García',
      documentId: '12345678',
      office: null,
      shift: null,
    });

    expect(result).toEqual(created);
    expect(mockRepository.findByDocumentId).not.toHaveBeenCalled();
  });

  it('throws ConflictException when documentId belongs to an active doctor', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(makeDoctor());

    await expect(useCase.execute({ name: 'Otro', documentId: '12345678' })).rejects.toThrow(
      ConflictException,
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('throws ConflictException when office+shift combination is taken', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(null);
    mockRepository.findByOfficeAndShift.mockResolvedValue(makeDoctor());

    await expect(
      useCase.execute({
        name: 'Otro',
        documentId: '99988877',
        office: '2',
        shift: '06:00-14:00',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when office is provided without shift', async () => {
    mockRepository.findActiveByDocumentId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: 'Ana Torres',
        documentId: '55566677',
        office: '3',
        shift: null,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
