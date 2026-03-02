import { AssignRoomUseCase } from '../../src/application/use-cases/assign-room.use-case';
import { Turno } from '../../src/domain/entities/turno.entity';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../src/domain/ports/IEventPublisher';

const buildTurnoEnEspera = (id: string, cedula: number, timestamp: number): Turno =>
    new Turno({
        id,
        nombre: `Paciente ${cedula}`,
        cedula,
        consultorio: null,
        estado: 'espera',
        priority: 'media',
        timestamp,
        finAtencionAt: null,
    });

describe('AssignRoomUseCase', () => {
    it('asigna el primer consultorio libre al primer paciente en espera y publica evento', async () => {
        // Arrange: un paciente en espera y solo el consultorio "2" disponible.
        const paciente = buildTurnoEnEspera('t1', 101, 1);
        const turnoAsignado = new Turno({
            ...paciente,
            consultorio: '2',
            estado: 'llamado',
            finAtencionAt: Date.now() + 10000,
        });

        const repository: jest.Mocked<ITurnoRepository> = {
            findActivoPorCedula: jest.fn(),
            save: jest.fn(),
            findPacientesEnEspera: jest.fn(async () => [paciente]),
            getConsultoriosOcupados: jest.fn(async () => ['1', '3', '4', '5']),
            asignarConsultorio: jest.fn(
                async (_turnoId: string, _consultorio: string) => turnoAsignado,
            ),
            finalizarTurnosLlamados: jest.fn(),
        };

        const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
        const useCase = new AssignRoomUseCase(repository, eventPublisher);

        // Act: ejecutar una asignación.
        const resultado = await useCase.execute(5);

        // Assert: se asigna consultorio y se publica el evento de actualización.
        expect(repository.asignarConsultorio).toHaveBeenCalledWith('t1', '2');
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'turno_actualizado',
            turnoAsignado.toEventPayload(),
        );
        expect(resultado).toEqual(turnoAsignado);
    });

    it('no asigna turno cuando no hay consultorios libres', async () => {
        // Arrange: todos los consultorios ocupados.
        const enEspera: Turno[] = [buildTurnoEnEspera('t1', 201, 1)];
        const repository: jest.Mocked<ITurnoRepository> = {
            findActivoPorCedula: jest.fn(),
            save: jest.fn(),
            findPacientesEnEspera: jest.fn(async () => [...enEspera]),
            getConsultoriosOcupados: jest.fn(async () => ['1', '2', '3', '4', '5']),
            asignarConsultorio: jest.fn(),
            finalizarTurnosLlamados: jest.fn(),
        };
        const eventPublisher: jest.Mocked<IEventPublisher> = {
            publish: jest.fn(),
        };
        const useCase = new AssignRoomUseCase(repository, eventPublisher);

        // Act: intentar asignar con capacidad llena.
        const resultado = await useCase.execute(5);

        // Assert: no debe asignar ni publicar cambios.
        expect(resultado).toBeNull();
        expect(repository.asignarConsultorio).not.toHaveBeenCalled();
        expect(eventPublisher.publish).not.toHaveBeenCalled();
    });
});
