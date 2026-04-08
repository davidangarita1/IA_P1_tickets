import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteDoctorUseCase } from '../../src/application/use-cases/delete-doctor.use-case';
import { IDoctorRepository } from '../../src/domain/ports/doctor.repository';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { Doctor } from '../../src/domain/entities/doctor.entity';
import { Turno } from '../../src/domain/entities/turno.entity';

describe('DeleteDoctorUseCase (Application)', () => {
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

  let useCase: DeleteDoctorUseCase;

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

  const makeTurno = (overrides: Partial<ConstructorParameters<typeof Turno>[0]> = {}): Turno =>
    new Turno({
      id: 'turno-1',
      nombre: 'Paciente Uno',
      cedula: 11111111,
      consultorio: '2',
      estado: 'llamado',
      priority: 'media',
      timestamp: Date.now(),
      ...overrides,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteDoctorUseCase(mockDoctorRepository, mockTurnoRepository);
  });

  it('soft deletes a doctor when no active turnos exist in the office', async () => {
    const doctor = makeDoctor();
    const deletedDoctor = makeDoctor({ status: 'inactive' });
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([]);
    mockDoctorRepository.softDelete.mockResolvedValue(deletedDoctor);

    await useCase.execute('doc-1');

    expect(mockDoctorRepository.findById).toHaveBeenCalledWith('doc-1');
    expect(mockTurnoRepository.findActiveByOffice).toHaveBeenCalledWith('2');
    expect(mockDoctorRepository.softDelete).toHaveBeenCalledWith('doc-1');
  });

  it('uses DB-level filtering and does not call findAll', async () => {
    const doctor = makeDoctor();
    const deletedDoctor = makeDoctor({ status: 'inactive' });
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([]);
    mockDoctorRepository.softDelete.mockResolvedValue(deletedDoctor);

    await useCase.execute('doc-1');

    expect(mockTurnoRepository.findAll).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when doctor does not exist', async () => {
    mockDoctorRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when findActiveByOffice returns a turno in llamado state', async () => {
    const doctor = makeDoctor();
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([
      makeTurno({ estado: 'llamado' }),
    ]);

    await expect(useCase.execute('doc-1')).rejects.toThrow(ConflictException);
    await expect(useCase.execute('doc-1')).rejects.toThrow(
      'No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento',
    );
  });

  it('throws ConflictException when findActiveByOffice returns a turno in atendido state', async () => {
    const doctor = makeDoctor();
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockTurnoRepository.findActiveByOffice.mockResolvedValue([
      makeTurno({ estado: 'atendido' }),
    ]);

    await expect(useCase.execute('doc-1')).rejects.toThrow(ConflictException);
  });

  it('allows deletion when doctor has no office assigned', async () => {
    const doctor = makeDoctor({ office: null, shift: null });
    const deletedDoctor = makeDoctor({ status: 'inactive', office: null, shift: null });
    mockDoctorRepository.findById.mockResolvedValue(doctor);
    mockDoctorRepository.softDelete.mockResolvedValue(deletedDoctor);

    await useCase.execute('doc-1');

    expect(mockTurnoRepository.findActiveByOffice).not.toHaveBeenCalled();
    expect(mockDoctorRepository.softDelete).toHaveBeenCalledWith('doc-1');
  });
});

