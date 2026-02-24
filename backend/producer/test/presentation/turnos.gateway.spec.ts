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

    it('envía snapshot de turnos al cliente al conectarse', async () => {
        // Arrange: repositorio tiene turnos disponibles.
        turnoRepository.findAll.mockResolvedValue([turno1]);

        // Act: simular conexión de cliente.
        await gateway.handleConnection(mockClient as Socket);

        // Assert: debe enviar snapshot con todos los turnos.
        expect(turnoRepository.findAll).toHaveBeenCalledTimes(1);
        expect(mockClient.emit).toHaveBeenCalledWith('TURNOS_SNAPSHOT', {
            type: 'TURNOS_SNAPSHOT',
            data: [turno1.toEventPayload()],
        });
    });

    it('envía snapshot vacío si no hay turnos', async () => {
        // Arrange: repositorio sin turnos.
        turnoRepository.findAll.mockResolvedValue([]);

        // Act: conexión de cliente.
        await gateway.handleConnection(mockClient as Socket);

        // Assert: debe enviar array vacío.
        expect(mockClient.emit).toHaveBeenCalledWith('TURNOS_SNAPSHOT', {
            type: 'TURNOS_SNAPSHOT',
            data: [],
        });
    });

    it('hace broadcast de actualización a todos los clientes', () => {
        // Arrange: payload de turno actualizado.
        const payload = turno1.toEventPayload();

        // Act: emitir actualización desde EventsController.
        gateway.broadcastTurnoActualizado(payload);

        // Assert: debe hacer broadcast sin filtros.
        expect(mockServer.emit).toHaveBeenCalledWith('TURNO_ACTUALIZADO', {
            type: 'TURNO_ACTUALIZADO',
            data: payload,
        });
    });

    it('no falla si el repositorio lanza error al conectar cliente', async () => {
        // Arrange: simular falla de base de datos.
        turnoRepository.findAll.mockRejectedValue(new Error('DB connection lost'));

        // Act + Assert: no debe propagar error (loguea internamente).
        await expect(gateway.handleConnection(mockClient as Socket)).resolves.toBeUndefined();
        expect(mockClient.emit).not.toHaveBeenCalled();
    });
});
