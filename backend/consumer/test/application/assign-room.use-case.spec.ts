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
    it('assigns first free office to first waiting patient and publishes event', async () => {
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

    it('does not assign turno when no free offices available', async () => {
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

    it('does not assign turno when no patients are waiting', async () => {
        // Arrange: consultorios disponibles pero ningún paciente esperando.
        const repository: jest.Mocked<ITurnoRepository> = {
            findActivoPorCedula: jest.fn(),
            save: jest.fn(),
            findPacientesEnEspera: jest.fn(async () => []),
            getConsultoriosOcupados: jest.fn(async () => ['1']),
            asignarConsultorio: jest.fn(),
            finalizarTurnosLlamados: jest.fn(),
        };
        const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
        const useCase = new AssignRoomUseCase(repository, eventPublisher);

        // Act
        const resultado = await useCase.execute(5);

        // Assert
        expect(resultado).toBeNull();
        expect(repository.asignarConsultorio).not.toHaveBeenCalled();
    });

    describe('executeAll', () => {
        it('assigns multiple turnos until offices or patients are exhausted', async () => {
            // Arrange: 2 pacientes y 2 consultorios libres.
            const paciente1 = buildTurnoEnEspera('t1', 101, 1);
            const paciente2 = buildTurnoEnEspera('t2', 102, 2);
            const turno1 = new Turno({ ...paciente1, consultorio: '1', estado: 'llamado', finAtencionAt: Date.now() });
            const turno2 = new Turno({ ...paciente2, consultorio: '2', estado: 'llamado', finAtencionAt: Date.now() });

            let callCount = 0;
            const repository: jest.Mocked<ITurnoRepository> = {
                findActivoPorCedula: jest.fn(),
                save: jest.fn(),
                findPacientesEnEspera: jest.fn(async () => {
                    callCount++;
                    if (callCount === 1) return [paciente1, paciente2];
                    if (callCount === 2) return [paciente2];
                    return [];
                }),
                getConsultoriosOcupados: jest.fn(async () => {
                    if (callCount <= 1) return ['3', '4', '5'];
                    if (callCount === 2) return ['1', '3', '4', '5'];
                    return ['1', '2', '3', '4', '5'];
                }),
                asignarConsultorio: jest.fn()
                    .mockResolvedValueOnce(turno1)
                    .mockResolvedValueOnce(turno2)
                    .mockResolvedValue(null),
                finalizarTurnosLlamados: jest.fn(),
            };
            const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
            const useCase = new AssignRoomUseCase(repository, eventPublisher);

            // Act
            const asignados = await useCase.executeAll(5);

            // Assert
            expect(asignados).toHaveLength(2);
        });

        it('returns empty array with invalid totalConsultorios (negative)', async () => {
            // Arrange
            const repository: jest.Mocked<ITurnoRepository> = {
                findActivoPorCedula: jest.fn(),
                save: jest.fn(),
                findPacientesEnEspera: jest.fn(),
                getConsultoriosOcupados: jest.fn(),
                asignarConsultorio: jest.fn(),
                finalizarTurnosLlamados: jest.fn(),
            };
            const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
            const useCase = new AssignRoomUseCase(repository, eventPublisher);

            // Act
            const resultado = await useCase.executeAll(-1);

            // Assert
            expect(resultado).toEqual([]);
        });

        it('returns empty array with non-integer totalConsultorios', async () => {
            // Arrange
            const repository: jest.Mocked<ITurnoRepository> = {
                findActivoPorCedula: jest.fn(),
                save: jest.fn(),
                findPacientesEnEspera: jest.fn(),
                getConsultoriosOcupados: jest.fn(),
                asignarConsultorio: jest.fn(),
                finalizarTurnosLlamados: jest.fn(),
            };
            const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
            const useCase = new AssignRoomUseCase(repository, eventPublisher);

            // Act
            const resultado = await useCase.executeAll(2.5);

            // Assert
            expect(resultado).toEqual([]);
        });

        it('returns empty array with zero totalConsultorios', async () => {
            // Arrange
            const repository: jest.Mocked<ITurnoRepository> = {
                findActivoPorCedula: jest.fn(),
                save: jest.fn(),
                findPacientesEnEspera: jest.fn(),
                getConsultoriosOcupados: jest.fn(),
                asignarConsultorio: jest.fn(),
                finalizarTurnosLlamados: jest.fn(),
            };
            const eventPublisher: jest.Mocked<IEventPublisher> = { publish: jest.fn() };
            const useCase = new AssignRoomUseCase(repository, eventPublisher);

            // Act
            const resultado = await useCase.executeAll(0);

            // Assert
            expect(resultado).toEqual([]);
        });
    });
});
