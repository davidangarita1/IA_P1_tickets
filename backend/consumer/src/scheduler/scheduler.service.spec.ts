import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { FinalizeTurnosUseCase } from '../application/use-cases/finalize-turnos.use-case';
import { AssignRoomUseCase } from '../application/use-cases/assign-room.use-case';

// 📂 LOCATED AT: backend/consumer/src/scheduler/scheduler.service.spec.ts
// ⚕️ HUMAN CHECK - Reescrito para reflejar la arquitectura hexagonal actual:
//   SchedulerService delega a FinalizeTurnosUseCase y AssignRoomUseCase (DIP).
//   No hay inyección directa de ClientProxy ni TurnosService (CONS-A5 resuelto).

describe('SchedulerService', () => {
    let service: SchedulerService;
    let finalizeTurnosUseCase: jest.Mocked<FinalizeTurnosUseCase>;
    let assignRoomUseCase: jest.Mocked<AssignRoomUseCase>;
    let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

    const mockFinalizeTurnosUseCase = {
        execute: jest.fn(),
    };

    const mockAssignRoomUseCase = {
        execute: jest.fn(),
    };

    const mockSchedulerRegistry = {
        addInterval: jest.fn(),
        deleteInterval: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'SCHEDULER_INTERVAL_MS') return 15000;
            if (key === 'CONSULTORIOS_TOTAL') return 5;
            return undefined;
        }),
    };

    beforeEach(async () => {
        jest.useFakeTimers();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SchedulerService,
                { provide: FinalizeTurnosUseCase, useValue: mockFinalizeTurnosUseCase },
                { provide: AssignRoomUseCase, useValue: mockAssignRoomUseCase },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
            ],
        }).compile();

        service = module.get<SchedulerService>(SchedulerService);
        finalizeTurnosUseCase = module.get(FinalizeTurnosUseCase);
        assignRoomUseCase = module.get(AssignRoomUseCase);
        schedulerRegistry = module.get(SchedulerRegistry);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register an interval on construction', () => {
        expect(mockSchedulerRegistry.addInterval).toHaveBeenCalledWith(
            'scheduler-asignacion-turnos',
            expect.any(Object),
        );
    });

    describe('handleSchedulerTick', () => {
        it('should delegate finalization and assignment to use cases', async () => {
            // ⚕️ HUMAN CHECK - SRP: el scheduler solo orquesta, los Use Cases hacen el trabajo
            mockFinalizeTurnosUseCase.execute.mockResolvedValue([]);
            mockAssignRoomUseCase.execute.mockResolvedValue(null);

            await service.handleSchedulerTick();

            expect(finalizeTurnosUseCase.execute).toHaveBeenCalledTimes(1);
            expect(assignRoomUseCase.execute).toHaveBeenCalledWith(5); // default CONSULTORIOS_TOTAL
        });

        it('should call AssignRoomUseCase with configured total consultorios', async () => {
            mockFinalizeTurnosUseCase.execute.mockResolvedValue([]);
            mockAssignRoomUseCase.execute.mockResolvedValue(null);

            await service.handleSchedulerTick();

            expect(assignRoomUseCase.execute).toHaveBeenCalledWith(5);
        });

        it('should not throw when use cases resolve normally', async () => {
            mockFinalizeTurnosUseCase.execute.mockResolvedValue([]);
            mockAssignRoomUseCase.execute.mockResolvedValue(null);

            await expect(service.handleSchedulerTick()).resolves.not.toThrow();
        });

        it('should catch and log errors without rethrowing', async () => {
            // ⚕️ HUMAN CHECK - el scheduler absorbe errores para no detener el intervalo
            mockFinalizeTurnosUseCase.execute.mockRejectedValue(new Error('DB connection failed'));

            await expect(service.handleSchedulerTick()).resolves.not.toThrow();
        });
    });

    describe('onModuleDestroy', () => {
        it('should delete the interval on destroy', () => {
            service.onModuleDestroy();

            expect(mockSchedulerRegistry.deleteInterval).toHaveBeenCalledWith(
                'scheduler-asignacion-turnos',
            );
        });
    });
});
