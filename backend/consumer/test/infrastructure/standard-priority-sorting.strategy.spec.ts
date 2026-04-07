import { StandardPrioritySortingStrategy } from '../../src/infrastructure/adapters/standard-priority-sorting.strategy';
import { Turno } from '../../src/domain/entities/turno.entity';

describe('StandardPrioritySortingStrategy (Infrastructure)', () => {
    it('ordena por prioridad y luego por timestamp (FIFO)', () => {
        // Arrange: misma cola con prioridades mezcladas y diferentes timestamps.
        const turnos: Turno[] = [
            new Turno({
                id: '1',
                nombre: 'A',
                cedula: 1,
                consultorio: null,
                estado: 'espera',
                priority: 'media',
                timestamp: 30,
                finAtencionAt: null,
            }),
            new Turno({
                id: '2',
                nombre: 'B',
                cedula: 2,
                consultorio: null,
                estado: 'espera',
                priority: 'alta',
                timestamp: 20,
                finAtencionAt: null,
            }),
            new Turno({
                id: '3',
                nombre: 'C',
                cedula: 3,
                consultorio: null,
                estado: 'espera',
                priority: 'alta',
                timestamp: 10,
                finAtencionAt: null,
            }),
            new Turno({
                id: '4',
                nombre: 'D',
                cedula: 4,
                consultorio: null,
                estado: 'espera',
                priority: 'baja',
                timestamp: 5,
                finAtencionAt: null,
            }),
        ];

        const strategy = new StandardPrioritySortingStrategy();

        // Act: ordenar según la política definida por negocio.
        const sorted = strategy.sort(turnos);

        // Assert: alta primero (FIFO), luego media, luego baja.
        expect(sorted.map(turno => turno.id)).toEqual(['3', '2', '1', '4']);
    });

    it('usa prioridad media como fallback para prioridades desconocidas', () => {
        const turnos: Turno[] = [
            new Turno({
                id: '1',
                nombre: 'A',
                cedula: 1,
                consultorio: null,
                estado: 'espera',
                priority: 'desconocida' as any,
                timestamp: 10,
                finAtencionAt: null,
            }),
            new Turno({
                id: '2',
                nombre: 'B',
                cedula: 2,
                consultorio: null,
                estado: 'espera',
                priority: 'otra' as any,
                timestamp: 20,
                finAtencionAt: null,
            }),
            new Turno({
                id: '3',
                nombre: 'C',
                cedula: 3,
                consultorio: null,
                estado: 'espera',
                priority: 'alta',
                timestamp: 5,
                finAtencionAt: null,
            }),
        ];

        const strategy = new StandardPrioritySortingStrategy();

        const sorted = strategy.sort(turnos);

        expect(sorted.map(t => t.id)).toEqual(['3', '1', '2']);
    });
});
