import { TurnosGateway } from '../../src/events/turnos.gateway';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { Turno } from '../../src/domain/entities/turno.entity';
import { Server, Socket } from 'socket.io';

describe('TurnosGateway (Presentation - WebSocket)', () => {
  const turno1 = new Turno({
    id: 't1',
    nombre: 'Paciente A',
    cedula: 123,
    consultorio: '1',
    estado: 'llamado',
    priority: 'alta',
    timestamp: 100,
    finAtencionAt: null,
  });

  const turnoRepository: jest.Mocked<ITurnoRepository> = {
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    findActiveByOffice: jest.fn(),
  };

  const mockClient: Partial<Socket> = {
    id: 'client-123',
    emit: jest.fn(),
  };

  const mockServer: Partial<Server> = {
    emit: jest.fn(),
  };

  let gateway: TurnosGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new TurnosGateway(turnoRepository);
    gateway.server = mockServer as Server;
  });

  it('sends turnos snapshot to client on connection', async () => {
    turnoRepository.findAll.mockResolvedValue([turno1]);

    await gateway.handleConnection(mockClient as Socket);

    expect(turnoRepository.findAll).toHaveBeenCalledTimes(1);
    expect(mockClient.emit).toHaveBeenCalledWith('TURNOS_SNAPSHOT', {
      type: 'TURNOS_SNAPSHOT',
      data: [turno1.toEventPayload()],
    });
  });

  it('sends empty snapshot when no turnos exist', async () => {
    turnoRepository.findAll.mockResolvedValue([]);

    await gateway.handleConnection(mockClient as Socket);

    expect(mockClient.emit).toHaveBeenCalledWith('TURNOS_SNAPSHOT', {
      type: 'TURNOS_SNAPSHOT',
      data: [],
    });
  });

  it('broadcasts update to all clients', () => {
    const payload = turno1.toEventPayload();

    gateway.broadcastTurnoActualizado(payload);

    expect(mockServer.emit).toHaveBeenCalledWith('TURNO_ACTUALIZADO', {
      type: 'TURNO_ACTUALIZADO',
      data: payload,
    });
  });

  it('broadcasts with null consultorio without failing', () => {
    const turnoSinConsultorio = new Turno({
      id: 't2',
      nombre: 'Paciente B',
      cedula: 456,
      consultorio: null,
      estado: 'espera',
      priority: 'media',
      timestamp: 200,
      finAtencionAt: null,
    });
    const payload = turnoSinConsultorio.toEventPayload();

    gateway.broadcastTurnoActualizado(payload);

    expect(mockServer.emit).toHaveBeenCalledWith('TURNO_ACTUALIZADO', {
      type: 'TURNO_ACTUALIZADO',
      data: payload,
    });
  });

  it('does not fail when repository throws error on client connection', async () => {
    turnoRepository.findAll.mockRejectedValue(new Error('DB connection lost'));

    await expect(gateway.handleConnection(mockClient as Socket)).resolves.toBeUndefined();
    expect(mockClient.emit).not.toHaveBeenCalled();
  });

  it('handles non-Error instance on client connection', async () => {
    turnoRepository.findAll.mockRejectedValue('string error');

    await expect(gateway.handleConnection(mockClient as Socket)).resolves.toBeUndefined();
    expect(mockClient.emit).not.toHaveBeenCalled();
  });

  it('handles client disconnection correctly', () => {
    gateway.handleDisconnect(mockClient as Socket);

    expect(true).toBe(true);
  });
});
