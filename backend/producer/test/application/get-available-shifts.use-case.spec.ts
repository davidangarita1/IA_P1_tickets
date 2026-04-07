import { GetAvailableShiftsUseCase } from '../../src/doctors/application/use-cases/get-available-shifts.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';

describe('GetAvailableShiftsUseCase (Application)', () => {
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

  let useCase: GetAvailableShiftsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAvailableShiftsUseCase(mockRepository);
  });

  it('returns available and occupied shifts for an office', async () => {
    mockRepository.findAvailableShifts.mockResolvedValue({
      availableShifts: ['14:00-22:00'],
      occupiedShifts: ['06:00-14:00'],
    });

    const result = await useCase.execute({ office: '2' });

    expect(result).toEqual({
      office: '2',
      availableShifts: ['14:00-22:00'],
      occupiedShifts: ['06:00-14:00'],
    });
    expect(mockRepository.findAvailableShifts).toHaveBeenCalledWith('2', undefined);
  });

  it('passes excludeDoctorId to repository when provided', async () => {
    mockRepository.findAvailableShifts.mockResolvedValue({
      availableShifts: ['06:00-14:00'],
      occupiedShifts: ['14:00-22:00'],
    });

    const result = await useCase.execute({ office: '3', excludeDoctorId: 'doc-id' });

    expect(mockRepository.findAvailableShifts).toHaveBeenCalledWith('3', 'doc-id');
    expect(result).toEqual({
      office: '3',
      availableShifts: ['06:00-14:00'],
      occupiedShifts: ['14:00-22:00'],
    });
  });

  it('returns all shifts as available when office has no assigned doctors', async () => {
    mockRepository.findAvailableShifts.mockResolvedValue({
      availableShifts: ['06:00-14:00', '14:00-22:00'],
      occupiedShifts: [],
    });

    const result = await useCase.execute({ office: '5' });

    expect(result.availableShifts).toHaveLength(2);
    expect(result.occupiedShifts).toHaveLength(0);
  });
});
