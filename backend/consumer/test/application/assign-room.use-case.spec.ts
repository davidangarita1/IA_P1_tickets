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
    it('asigna inmediatamente 4 pacientes cuando hay 5 consultorios libres', async () => {
        // Arrange (Test Data Builder + Fake State)
        const enEspera: Turno[] = [
            buildTurnoEnEspera('t1', 101, 1),
            buildTurnoEnEspera('t2', 102, 2),
            buildTurnoEnEspera('t3', 103, 3),
            buildTurnoEnEspera('t4', 104, 4),
        ];
        const ocupados: string[] = [];

        const repository: jest.Mocked<ITurnoRepository> = {
            save: jest.fn(),
            findPacientesEnEspera: jest.fn(async () => [...enEspera]),
            getConsultoriosOcupados: jest.fn(async () => [...ocupados]),
            asignarConsultorio: jest.fn(async (turnoId: string, consultorio: string) => {
                const index = enEspera.findIndex(turno => turno.id === turnoId);
                if (index < 0) return null;

                const turnoOriginal = enEspera[index];
                enEspera.splice(index, 1);
                ocupados.push(consultorio);

                return new Turno({
                    id: turnoOriginal.id,
                    nombre: turnoOriginal.nombre,
                    cedula: turnoOriginal.cedula,
                    consultorio,
                    estado: 'llamado',
                    priority: turnoOriginal.priority,
                    timestamp: turnoOriginal.timestamp,
                    finAtencionAt: Date.now() + 10000,
                });
            }),
            finalizarTurnosLlamados: jest.fn(),
        };

        const eventPublisher: jest.Mocked<IEventPublisher> = {
            publish: jest.fn(),
        };

        const useCase = new AssignRoomUseCase(repository, eventPublisher);

        // Act
        const asignados = await useCase.executeAll(5);

        // Assert
        expect(asignados).toHaveLength(4);
        expect(asignados.map(turno => turno.consultorio)).toEqual(['1', '2', '3', '4']);
        expect(enEspera).toHaveLength(0);
        expect(repository.asignarConsultorio).toHaveBeenCalledTimes(4);
        expect(eventPublisher.publish).toHaveBeenCalledTimes(4);
    });

    it('deja pacientes en espera cuando no hay consultorios libres', async () => {
        // Arrange
        const enEspera: Turno[] = [buildTurnoEnEspera('t1', 201, 1)];
        const repository: jest.Mocked<ITurnoRepository> = {
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

        // Act
        const asignados = await useCase.executeAll(5);

        // Assert
        expect(asignados).toEqual([]);
        expect(repository.asignarConsultorio).not.toHaveBeenCalled();
        expect(eventPublisher.publish).not.toHaveBeenCalled();
    });
});
