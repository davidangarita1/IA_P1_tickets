import { GetAvailableShiftsUseCase } from '../../src/doctors/application/use-cases/get-available-shifts.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';

describe('GetAvailableShiftsUseCase (Application)', () => {
    const mockRepository: jest.Mocked<IDoctorRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByCedula: jest.fn(),
        findByConsultorioAndFranja: jest.fn(),
        findAvailableShifts: jest.fn(),
    };

    let useCase: GetAvailableShiftsUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetAvailableShiftsUseCase(mockRepository);
    });

    it('returns available and occupied shifts for a consultorio', async () => {
        mockRepository.findAvailableShifts.mockResolvedValue({
            availableShifts: ['14:00-22:00'],
            occupiedShifts: ['06:00-14:00'],
        });

        const result = await useCase.execute({ consultorio: '2' });

        expect(result).toEqual({
            consultorio: '2',
            available_shifts: ['14:00-22:00'],
            occupied_shifts: ['06:00-14:00'],
        });
        expect(mockRepository.findAvailableShifts).toHaveBeenCalledWith('2', undefined);
    });

    it('passes excludeDoctorId to repository when provided', async () => {
        mockRepository.findAvailableShifts.mockResolvedValue({
            availableShifts: ['06:00-14:00'],
            occupiedShifts: ['14:00-22:00'],
        });

        const result = await useCase.execute({ consultorio: '3', excludeDoctorId: 'doc-id' });

        expect(mockRepository.findAvailableShifts).toHaveBeenCalledWith('3', 'doc-id');
        expect(result).toEqual({
            consultorio: '3',
            available_shifts: ['06:00-14:00'],
            occupied_shifts: ['14:00-22:00'],
        });
    });

    it('returns all shifts as available when consultorio has no assigned doctors', async () => {
        mockRepository.findAvailableShifts.mockResolvedValue({
            availableShifts: ['06:00-14:00', '14:00-22:00'],
            occupiedShifts: [],
        });

        const result = await useCase.execute({ consultorio: '5' });

        expect(result.available_shifts).toHaveLength(2);
        expect(result.occupied_shifts).toHaveLength(0);
    });
});
