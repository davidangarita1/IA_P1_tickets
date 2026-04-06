import { GetAllDoctorsUseCase } from '../../src/doctors/application/use-cases/get-all-doctors.use-case';
import { IDoctorRepository } from '../../src/doctors/domain/ports/doctor.repository';
import { Doctor } from '../../src/doctors/domain/entities/doctor.entity';

describe('GetAllDoctorsUseCase (Application)', () => {
    const mockRepository: jest.Mocked<IDoctorRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByCedula: jest.fn(),
        findByConsultorioAndFranja: jest.fn(),
        findAvailableShifts: jest.fn(),
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
                nombre: 'Juan García',
                cedula: '1234567',
                consultorio: '1',
                franjaHoraria: '06:00-14:00',
                status: 'Activo',
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            new Doctor({
                id: '2',
                nombre: 'Ana Torres',
                cedula: '7654321',
                consultorio: null,
                franjaHoraria: null,
                status: 'Activo',
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
