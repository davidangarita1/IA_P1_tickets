import { GetAllTurnosUseCase } from '../../src/application/use-cases/get-all-turnos.use-case';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { Turno } from '../../src/domain/entities/turno.entity';

describe('GetAllTurnosUseCase (Application)', () => {
  const turno1 = new Turno({
    id: 't1',
    nombre: 'Paciente A',
    cedula: 111,
    consultorio: '1',
    estado: 'llamado',
    priority: 'alta',
    timestamp: 100,
    finAtencionAt: null,
  });

  const turno2 = new Turno({
    id: 't2',
    nombre: 'Paciente B',
    cedula: 222,
    consultorio: null,
    estado: 'espera',
    priority: 'media',
    timestamp: 200,
    finAtencionAt: null,
  });

  const turnoRepository: jest.Mocked<ITurnoRepository> = {
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    findActiveByOffice: jest.fn(),
  };

  let useCase: GetAllTurnosUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAllTurnosUseCase(turnoRepository);
  });

  it('retorna todos los turnos mapeados a payload', async () => {
    turnoRepository.findAll.mockResolvedValue([turno1, turno2]);

    const result = await useCase.execute();

    expect(turnoRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([turno1.toEventPayload(), turno2.toEventPayload()]);
  });

  it('retorna array vacío cuando no hay turnos', async () => {
    turnoRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
