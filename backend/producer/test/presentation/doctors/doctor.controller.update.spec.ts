import { DoctorController } from '../../../src/doctors/presentation/controllers/doctor.controller';
import { CreateDoctorUseCase } from '../../../src/doctors/application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from '../../../src/doctors/application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from '../../../src/doctors/application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from '../../../src/doctors/application/use-cases/update-doctor.use-case';
import { Doctor } from '../../../src/doctors/domain/entities/doctor.entity';

describe('DoctorController - updateDoctor (Presentation)', () => {
    const createDoctorUseCase: Pick<CreateDoctorUseCase, 'execute'> = { execute: jest.fn() };
    const getAllDoctorsUseCase: Pick<GetAllDoctorsUseCase, 'execute'> = { execute: jest.fn() };
    const getAvailableShiftsUseCase: Pick<GetAvailableShiftsUseCase, 'execute'> = { execute: jest.fn() };
    const updateDoctorUseCase: Pick<UpdateDoctorUseCase, 'execute'> = { execute: jest.fn() };

    let controller: DoctorController;

    const makeDoctor = (overrides: Partial<ConstructorParameters<typeof Doctor>[0]> = {}): Doctor =>
        new Doctor({
            id: 'doc-1',
            name: 'Juan García',
            documentId: '12345678',
            office: '2',
            shift: '06:00-14:00',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        });

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new DoctorController(
            createDoctorUseCase as CreateDoctorUseCase,
            getAllDoctorsUseCase as GetAllDoctorsUseCase,
            getAvailableShiftsUseCase as GetAvailableShiftsUseCase,
            updateDoctorUseCase as UpdateDoctorUseCase,
        );
    });

    it('updates a doctor and returns the updated doctor', async () => {
        const updated = makeDoctor({ name: 'Pedro López', office: '4', shift: '14:00-22:00' });
        (updateDoctorUseCase.execute as jest.Mock).mockResolvedValue(updated);
        const dto = { name: 'Pedro López', office: '4', shift: '14:00-22:00' as const };

        const result = await controller.updateDoctor('doc-1', dto);

        expect(updateDoctorUseCase.execute).toHaveBeenCalledWith('doc-1', dto);
        expect(result).toEqual(updated);
    });

    it('updates only the name without office and shift', async () => {
        const updated = makeDoctor({ name: 'Nuevo Nombre' });
        (updateDoctorUseCase.execute as jest.Mock).mockResolvedValue(updated);
        const dto = { name: 'Nuevo Nombre' };

        const result = await controller.updateDoctor('doc-1', dto);

        expect(updateDoctorUseCase.execute).toHaveBeenCalledWith('doc-1', dto);
        expect(result.name).toBe('Nuevo Nombre');
    });
});
