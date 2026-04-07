import { ProducerController } from '../../src/presentation/producer.controller';
import { CreateTurnoUseCase } from '../../src/application/use-cases/create-turno.use-case';
import { GetAllTurnosUseCase } from '../../src/application/use-cases/get-all-turnos.use-case';
import { GetTurnosByCedulaUseCase } from '../../src/application/use-cases/get-turnos-by-cedula.use-case';

describe('ProducerController (Presentation)', () => {
  const createTurnoUseCase: Pick<CreateTurnoUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  const getAllTurnosUseCase: Pick<GetAllTurnosUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  const getTurnosByCedulaUseCase: Pick<GetTurnosByCedulaUseCase, 'execute'> = {
    execute: jest.fn(),
  };

  let controller: ProducerController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProducerController(
      createTurnoUseCase as CreateTurnoUseCase,
      getAllTurnosUseCase as GetAllTurnosUseCase,
      getTurnosByCedulaUseCase as GetTurnosByCedulaUseCase,
    );
  });

  it('delega creación de turno al use case', async () => {
    (createTurnoUseCase.execute as jest.Mock).mockReturnValue({
      status: 'accepted',
      message: 'Turno en proceso de asignación',
    });
    const dto = { cedula: 123, nombre: 'Paciente Test' };

    const result = await controller.createTurno(dto);

    expect(createTurnoUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      status: 'accepted',
      message: 'Turno en proceso de asignación',
    });
  });

  it('delega consulta de todos los turnos al use case', async () => {
    const mockPayloads = [
      {
        id: 't1',
        nombre: 'P1',
        cedula: 111,
        consultorio: '1',
        estado: 'llamado',
        priority: 'alta',
        timestamp: 100,
      },
    ];
    (getAllTurnosUseCase.execute as jest.Mock).mockResolvedValue(mockPayloads);

    const result = await controller.getAllTurnos();

    expect(getAllTurnosUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockPayloads);
  });

  it('delega consulta por cédula al use case', async () => {
    const mockPayloads = [
      {
        id: 't2',
        nombre: 'P2',
        cedula: 123,
        consultorio: null,
        estado: 'espera',
        priority: 'media',
        timestamp: 200,
      },
    ];
    (getTurnosByCedulaUseCase.execute as jest.Mock).mockResolvedValue(mockPayloads);

    const result = await controller.getTurnosByCedula(123);

    expect(getTurnosByCedulaUseCase.execute).toHaveBeenCalledWith(123);
    expect(result).toEqual(mockPayloads);
  });
});
