import { EventsController } from '../../src/events/events.controller';
import { TurnosGateway } from '../../src/events/turnos.gateway';
import { TurnoEventPayload } from '../../src/domain/entities/turno.entity';

describe('EventsController (Presentation)', () => {
  const mockTurnosGateway: jest.Mocked<Pick<TurnosGateway, 'broadcastTurnoActualizado'>> = {
    broadcastTurnoActualizado: jest.fn(),
  };

  let controller: EventsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EventsController(mockTurnosGateway as unknown as TurnosGateway);
  });

  const samplePayload: TurnoEventPayload = {
    id: 'turno-123',
    nombre: 'Paciente Test',
    cedula: 12345,
    consultorio: '1',
    estado: 'espera',
    priority: 'media',
    timestamp: Date.now(),
    finAtencionAt: null,
  };

  describe('handleTurnoCreado', () => {
    it('reenvia el evento turno_creado al gateway WebSocket', async () => {
      // Arrange
      const payload = { ...samplePayload };

      // Act
      await controller.handleTurnoCreado(payload);

      // Assert
      expect(mockTurnosGateway.broadcastTurnoActualizado).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleTurnoActualizado', () => {
    it('reenvia el evento turno_actualizado al gateway WebSocket', async () => {
      // Arrange
      const payload: TurnoEventPayload = {
        ...samplePayload,
        estado: 'llamado',
        consultorio: '2',
      };

      // Act
      await controller.handleTurnoActualizado(payload);

      // Assert
      expect(mockTurnosGateway.broadcastTurnoActualizado).toHaveBeenCalledWith(payload);
    });
  });
});
