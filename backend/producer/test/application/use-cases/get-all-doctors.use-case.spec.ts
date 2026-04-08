import { GetAllDoctorsUseCase } from '../../../src/application/use-cases/get-all-doctors.use-case';
import { IDoctorRepository } from '../../../src/domain/ports/doctor.repository';
import { Doctor } from '../../../src/domain/entities/doctor.entity';

describe('GetAllDoctorsUseCase (Application)', () => {
  const mockRepository: jest.Mocked<IDoctorRepository> = {
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

  let useCase: GetAllDoctorsUseCase;

  const makeDoctor = (id: string, name: string, documentId: string): Doctor =>
    new Doctor({
      id,
      name,
      documentId,
      office: null,
      shift: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAllDoctorsUseCase(mockRepository);
  });

  it('returns paginated doctors from repository with default params', async () => {
    const doctors = [
      makeDoctor('1', 'Juan García', '1234567'),
      makeDoctor('2', 'Ana Torres', '7654321'),
    ];
    mockRepository.findAllPaginated.mockResolvedValue({
      data: doctors,
      total: 2,
      page: 1,
      limit: 25,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual(doctors);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith({ page: 1, limit: 25 });
  });

  it('returns paginated doctors with custom page and limit', async () => {
    const doctors = [makeDoctor('3', 'Carlos Ruiz', '1112223')];
    mockRepository.findAllPaginated.mockResolvedValue({
      data: doctors,
      total: 50,
      page: 2,
      limit: 10,
    });

    const result = await useCase.execute({ page: 2, limit: 10 });

    expect(result.data).toEqual(doctors);
    expect(result.total).toBe(50);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });

  it('enforces maximum limit of 100', async () => {
    mockRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    });

    await useCase.execute({ page: 1, limit: 9999 });

    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith({ page: 1, limit: 100 });
  });

  it('enforces minimum page of 1', async () => {
    mockRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 25,
    });

    await useCase.execute({ page: -5, limit: 25 });

    expect(mockRepository.findAllPaginated).toHaveBeenCalledWith({ page: 1, limit: 25 });
  });

  it('returns empty data array when no active doctors exist', async () => {
    mockRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 25,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(mockRepository.findAllPaginated).toHaveBeenCalledTimes(1);
  });
});

