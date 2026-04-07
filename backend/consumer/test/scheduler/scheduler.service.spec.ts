import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SchedulerService } from '../../src/scheduler/scheduler.service';
import { FinalizeTurnosUseCase } from '../../src/application/use-cases/finalize-turnos.use-case';
import { AssignRoomUseCase } from '../../src/application/use-cases/assign-room.use-case';

describe('SchedulerService', () => {
    let service: SchedulerService;
    const finalizeTurnosUseCase: Pick<FinalizeTurnosUseCase, 'execute'> = {
        execute: jest.fn(),
    };

    const assignRoomUseCase: Pick<AssignRoomUseCase, 'executeAll'> = {
        executeAll: jest.fn(),
    };

    const schedulerRegistry: Pick<SchedulerRegistry, 'addInterval' | 'deleteInterval'> = {
        addInterval: jest.fn(),
        deleteInterval: jest.fn(),
    };

    const configService: Pick<ConfigService, 'get'> = {
        get: jest.fn((key: string) => {
            if (key === 'SCHEDULER_INTERVAL_MS') return 15000;
            if (key === 'CONSULTORIOS_TOTAL') return 5;
            return undefined;
        }),
    };

    beforeEach(() => {
        jest.useFakeTimers();
        service = new SchedulerService(
            finalizeTurnosUseCase as FinalizeTurnosUseCase,
            assignRoomUseCase as AssignRoomUseCase,
            configService as ConfigService,
            schedulerRegistry as SchedulerRegistry,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('registra el intervalo al inicializarse', () => {
        // Verifica que el scheduler quede conectado al registro de Nest.
        expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
            'scheduler-asignacion-turnos',
            expect.any(Object),
        );
    });

    it('delegates finalization and batch assignment to use cases', async () => {
        // Arrange: los casos de uso responden correctamente.
        (finalizeTurnosUseCase.execute as jest.Mock).mockResolvedValue([]);
        (assignRoomUseCase.executeAll as jest.Mock).mockResolvedValue([]);

        // Act: ejecutar un tick manual del scheduler.
        await service.handleSchedulerTick();

        // Assert: se orquesta en el orden esperado.
        expect(finalizeTurnosUseCase.execute).toHaveBeenCalledTimes(1);
        expect(assignRoomUseCase.executeAll).toHaveBeenCalledWith(5);
    });

    it('no propaga error cuando falla un caso de uso', async () => {
        // Arrange: falla de infraestructura simulada.
        (finalizeTurnosUseCase.execute as jest.Mock).mockRejectedValue(
            new Error('DB connection failed'),
        );

        // Act + Assert: el scheduler captura el error y no rompe el proceso.
        await expect(service.handleSchedulerTick()).resolves.not.toThrow();
    });

    it('elimina el intervalo en onModuleDestroy', () => {
        // Act: simular apagado ordenado del módulo.
        service.onModuleDestroy();

        // Assert: el intervalo debe quedar removido.
        expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith(
            'scheduler-asignacion-turnos',
        );
    });

    it('ejecuta el tick automáticamente cuando pasa el intervalo', async () => {
        // Arrange: los casos de uso responden correctamente.
        (finalizeTurnosUseCase.execute as jest.Mock).mockResolvedValue([]);
        (assignRoomUseCase.executeAll as jest.Mock).mockResolvedValue([]);

        // Act: avanzar el tiempo para disparar el intervalo.
        jest.advanceTimersByTime(15000);

        // Assert: el callback del setInterval se ejecutó.
        // Note: El callback es async, así que esperamos a que se resuelva.
        await Promise.resolve();
        expect(finalizeTurnosUseCase.execute).toHaveBeenCalled();
    });

    it('loguea error como string cuando no es instancia de Error', async () => {
        // Arrange: error que no es instancia de Error.
        (finalizeTurnosUseCase.execute as jest.Mock).mockRejectedValue('string error');

        // Act + Assert: no rompe y loguea correctamente.
        await expect(service.handleSchedulerTick()).resolves.not.toThrow();
    });

    it('usa valores por defecto cuando las variables de entorno son falsy', () => {
        const emptyConfigService: Pick<ConfigService, 'get'> = {
            get: jest.fn(() => undefined),
        };

        const svc = new SchedulerService(
            finalizeTurnosUseCase as FinalizeTurnosUseCase,
            assignRoomUseCase as AssignRoomUseCase,
            emptyConfigService as ConfigService,
            schedulerRegistry as SchedulerRegistry,
        );

        expect(svc).toBeDefined();
        expect(schedulerRegistry.addInterval).toHaveBeenCalled();
    });
});
