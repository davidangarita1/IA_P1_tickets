import { DoctorController } from '@/presentation/doctor.controller';
import { CreateDoctorUseCase } from '@/application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from '@/application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from '@/application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from '@/application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '@/application/use-cases/delete-doctor.use-case';
import { Doctor } from '@/domain/entities/doctor.entity';

describe('DoctorController (Presentation)', () => {
  const createDoctorUseCase: Pick<CreateDoctorUseCase, 'execute'> = { execute: jest.fn() };
  const getAllDoctorsUseCase: Pick<GetAllDoctorsUseCase, 'execute'> = { execute: jest.fn() };
  const getAvailableShiftsUseCase: Pick<GetAvailableShiftsUseCase, 'execute'> = {
    execute: jest.fn(),
  };
  const updateDoctorUseCase: Pick<UpdateDoctorUseCase, 'execute'> = { execute: jest.fn() };
  const deleteDoctorUseCase: Pick<DeleteDoctorUseCase, 'execute'> = { execute: jest.fn() };

  let controller: DoctorController;

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
    controller = new DoctorController(
      createDoctorUseCase as CreateDoctorUseCase,
      getAllDoctorsUseCase as GetAllDoctorsUseCase,
      getAvailableShiftsUseCase as GetAvailableShiftsUseCase,
      updateDoctorUseCase as UpdateDoctorUseCase,
      deleteDoctorUseCase as DeleteDoctorUseCase,
    );
  });

  it('creates a doctor and returns the created doctor', async () => {
    const doctor = makeDoctor();
    (createDoctorUseCase.execute as jest.Mock).mockResolvedValue(doctor);
    const dto = {
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00' as const,
    };

    const result = await controller.createDoctor(dto);

    expect(createDoctorUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(doctor);
  });

  it('returns paginated active doctors with default params', async () => {
    const doctors = [makeDoctor()];
    const paginatedResult = { data: doctors, total: 1, page: 1, limit: 25 };
    (getAllDoctorsUseCase.execute as jest.Mock).mockResolvedValue(paginatedResult);

    const result = await controller.getAllDoctors(undefined, undefined);

    expect(getAllDoctorsUseCase.execute).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
    });
    expect(result).toEqual(paginatedResult);
  });

  it('passes page and limit query params to use case', async () => {
    const paginatedResult = { data: [], total: 0, page: 2, limit: 10 };
    (getAllDoctorsUseCase.execute as jest.Mock).mockResolvedValue(paginatedResult);

    const result = await controller.getAllDoctors('2', '10');

    expect(getAllDoctorsUseCase.execute).toHaveBeenCalledWith({ page: 2, limit: 10 });
    expect(result).toEqual(paginatedResult);
  });

  it('returns available shifts for an office', async () => {
    const shiftsResult = {
      office: '3',
      availableShifts: ['14:00-22:00'],
      occupiedShifts: ['06:00-14:00'],
    };
    (getAvailableShiftsUseCase.execute as jest.Mock).mockResolvedValue(shiftsResult);

    const result = await controller.getAvailableShifts('3', undefined);

    expect(getAvailableShiftsUseCase.execute).toHaveBeenCalledWith({
      office: '3',
      excludeDoctorId: undefined,
    });
    expect(result).toEqual(shiftsResult);
  });

  it('passes excludeDoctorId query param to use case', async () => {
    const shiftsResult = {
      office: '1',
      availableShifts: ['06:00-14:00'],
      occupiedShifts: ['14:00-22:00'],
    };
    (getAvailableShiftsUseCase.execute as jest.Mock).mockResolvedValue(shiftsResult);

    const result = await controller.getAvailableShifts('1', 'doc-id-to-exclude');

    expect(getAvailableShiftsUseCase.execute).toHaveBeenCalledWith({
      office: '1',
      excludeDoctorId: 'doc-id-to-exclude',
    });
    expect(result).toEqual(shiftsResult);
  });
});
