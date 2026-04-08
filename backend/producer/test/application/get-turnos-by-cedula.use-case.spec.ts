import { GetTurnosByCedulaUseCase } from '../../src/application/use-cases/get-turnos-by-cedula.use-case';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { Turno } from '../../src/domain/entities/turno.entity';

describe('GetTurnosByCedulaUseCase (Application)', () => {
  const turnoDelPaciente = new Turno({
    id: 't1',
    nombre: 'Paciente 123',
    cedula: 123,
    consultorio: '2',
    estado: 'llamado',
    priority: 'media',
    timestamp: 100,
    finAtencionAt: null,
  });

  const turnoRepository: jest.Mocked<ITurnoRepository> = {
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    findActiveByOffice: jest.fn(),
  };

  let useCase: GetTurnosByCedulaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTurnosByCedulaUseCase(turnoRepository);
  });

  it('returns turnos filtered by cedula', async () => {
    turnoRepository.findByCedula.mockResolvedValue([turnoDelPaciente]);

    const result = await useCase.execute(123);

    expect(turnoRepository.findByCedula).toHaveBeenCalledWith(123);
    expect(result).toEqual([turnoDelPaciente.toEventPayload()]);
  });

  it('returns empty array when no turnos exist for the cedula', async () => {
    turnoRepository.findByCedula.mockResolvedValue([]);

    const result = await useCase.execute(999);

    expect(result).toEqual([]);
  });
});
