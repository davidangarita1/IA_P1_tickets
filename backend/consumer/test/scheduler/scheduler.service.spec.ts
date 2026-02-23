import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SchedulerService } from '../../src/scheduler/scheduler.service';
import { FinalizeTurnosUseCase } from '../../src/application/use-cases/finalize-turnos.use-case';
import { AssignRoomUseCase } from '../../src/application/use-cases/assign-room.use-case';

describe('SchedulerService', () => {
    let service: SchedulerService;
    let finalizeTurnosUseCase: jest.Mocked<FinalizeTurnosUseCase>;
    let assignRoomUseCase: jest.Mocked<AssignRoomUseCase>;

    const mockFinalizeTurnosUseCase = {
        execute: jest.fn(),
    };

    const mockAssignRoomUseCase = {
        executeAll: jest.fn(),
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

    it('should delegate finalization and batch assignment to use cases', async () => {
        mockFinalizeTurnosUseCase.execute.mockResolvedValue([]);
        mockAssignRoomUseCase.executeAll.mockResolvedValue([]);

        await service.handleSchedulerTick();

        expect(finalizeTurnosUseCase.execute).toHaveBeenCalledTimes(1);
        expect(assignRoomUseCase.executeAll).toHaveBeenCalledWith(5);
    });

    it('should not throw when use cases fail', async () => {
        mockFinalizeTurnosUseCase.execute.mockRejectedValue(new Error('DB connection failed'));

        await expect(service.handleSchedulerTick()).resolves.not.toThrow();
    });

    it('should delete the interval on destroy', () => {
        service.onModuleDestroy();

        expect(mockSchedulerRegistry.deleteInterval).toHaveBeenCalledWith(
            'scheduler-asignacion-turnos',
        );
    });
});
