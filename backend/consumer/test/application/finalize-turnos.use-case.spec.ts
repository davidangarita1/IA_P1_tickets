import { FinalizeTurnosUseCase } from '../../src/application/use-cases/finalize-turnos.use-case';
import { ITurnoRepository } from '../../src/domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../src/domain/ports/IEventPublisher';
import { Turno } from '../../src/domain/entities/turno.entity';

describe('FinalizeTurnosUseCase (Application)', () => {
    const turnoAtendido = new Turno({
        id: 't1',
        nombre: 'Paciente 1',
        cedula: 1,
        consultorio: '1',
        estado: 'atendido',
        priority: 'alta',
        timestamp: 100,
        finAtencionAt: 200,
    });

    const turnoRepository: jest.Mocked<ITurnoRepository> = {
        findActivoPorCedula: jest.fn(),
        save: jest.fn(),
        findPacientesEnEspera: jest.fn(),
        getConsultoriosOcupados: jest.fn(),
        asignarConsultorio: jest.fn(),
        finalizarTurnosLlamados: jest.fn(),
    };

    const eventPublisher: jest.Mocked<IEventPublisher> = {
        publish: jest.fn(),
    };

    let useCase: FinalizeTurnosUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new FinalizeTurnosUseCase(turnoRepository, eventPublisher);
    });

    it('publica evento por cada turno finalizado', async () => {
        // Arrange: repositorio retorna turnos que acaban de pasar a atendido.
        turnoRepository.finalizarTurnosLlamados.mockResolvedValue([turnoAtendido]);

        // Act: ejecutar finalización por expiración.
        const resultado = await useCase.execute();

        // Assert: publica un evento por cada transición aplicada.
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'turno_actualizado',
            turnoAtendido.toEventPayload(),
        );
        expect(resultado).toEqual([turnoAtendido]);
    });
});
