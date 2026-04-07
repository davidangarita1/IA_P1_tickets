import { DoctorController } from '@/doctors/presentation/controllers/doctor.controller';
import { CreateDoctorUseCase } from '@/doctors/application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from '@/doctors/application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from '@/doctors/application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from '@/doctors/application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '@/doctors/application/use-cases/delete-doctor.use-case';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DoctorController - deleteDoctor (Presentation)', () => {
  const createDoctorUseCase: Pick<CreateDoctorUseCase, 'execute'> = { execute: jest.fn() };
  const getAllDoctorsUseCase: Pick<GetAllDoctorsUseCase, 'execute'> = { execute: jest.fn() };
  const getAvailableShiftsUseCase: Pick<GetAvailableShiftsUseCase, 'execute'> = {
    execute: jest.fn(),
  };
  const updateDoctorUseCase: Pick<UpdateDoctorUseCase, 'execute'> = { execute: jest.fn() };
  const deleteDoctorUseCase: Pick<DeleteDoctorUseCase, 'execute'> = { execute: jest.fn() };

  let controller: DoctorController;

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

  it('deletes a doctor and returns void', async () => {
    (deleteDoctorUseCase.execute as jest.Mock).mockResolvedValue(undefined);

    await controller.deleteDoctor('doc-1');

    expect(deleteDoctorUseCase.execute).toHaveBeenCalledWith('doc-1');
  });

  it('propagates NotFoundException when doctor does not exist', async () => {
    (deleteDoctorUseCase.execute as jest.Mock).mockRejectedValue(
      new NotFoundException('Médico no encontrado'),
    );

    await expect(controller.deleteDoctor('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('propagates ConflictException when doctor has active turno', async () => {
    (deleteDoctorUseCase.execute as jest.Mock).mockRejectedValue(
      new ConflictException(
        'No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento',
      ),
    );

    await expect(controller.deleteDoctor('doc-1')).rejects.toThrow(ConflictException);
  });
});
