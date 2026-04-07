import { CreateTurnoUseCase } from '../../src/application/use-cases/create-turno.use-case';
import { IEventPublisher } from '../../src/domain/ports/IEventPublisher';

describe('CreateTurnoUseCase (Application)', () => {
  const eventPublisher: jest.Mocked<IEventPublisher> = {
    publish: jest.fn(),
  };

  let useCase: CreateTurnoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateTurnoUseCase(eventPublisher);
  });

  it('publishes crear_turno event and returns accepted status', () => {
    const data = { cedula: 123, nombre: 'Paciente Test', priority: 'media' as const };

    const result = useCase.execute(data);

    expect(eventPublisher.publish).toHaveBeenCalledWith('crear_turno', data);
    expect(result).toEqual({
      status: 'accepted',
      message: 'Turno en proceso de asignación',
    });
  });

  it('propagates error when publisher fails', () => {
    const publishError = new Error('RabbitMQ connection lost');
    eventPublisher.publish.mockImplementationOnce(() => {
      throw publishError;
    });

    expect(() => useCase.execute({ cedula: 123, nombre: 'Test' })).toThrow(publishError);
  });

  it('propagates non-Error and logs it as string', () => {
    eventPublisher.publish.mockImplementationOnce(() => {
      throw 'connection timeout';
    });

    expect(() => useCase.execute({ cedula: 123, nombre: 'Test' })).toThrow('connection timeout');
  });
});
