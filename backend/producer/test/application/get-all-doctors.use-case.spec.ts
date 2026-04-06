import { GetAllDoctorsUseCase } from '../../src/doctors/application/use-cases/get-all-doctors.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';
import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('GetAllDoctorsUseCase (Application)', () => {
    const mockRepository: jest.Mocked<IDoctorRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByDocumentId: jest.fn(),
        findByOfficeAndShift: jest.fn(),
        findAvailableShifts: jest.fn(),
        update: jest.fn(),
    };

    let useCase: GetAllDoctorsUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetAllDoctorsUseCase(mockRepository);
    });

    it('returns all active doctors from repository', async () => {
        const doctors = [
            new Doctor({
                id: '1',
                name: 'Juan García',
                documentId: '1234567',
                office: '1',
                shift: '06:00-14:00',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            new Doctor({
                id: '2',
                name: 'Ana Torres',
                documentId: '7654321',
                office: null,
                shift: null,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        ];
        mockRepository.findAll.mockResolvedValue(doctors);

        const result = await useCase.execute();

        expect(result).toEqual(doctors);
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no doctors exist', async () => {
        mockRepository.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
});
