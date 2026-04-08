import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { FinalizeTurnosUseCase } from '../../application/use-cases/finalize-turnos.use-case';
import { AssignRoomUseCase } from '../../application/use-cases/assign-room.use-case';

const DEFAULT_CONSULTORIOS = 5;
const SCHEDULER_INTERVAL_NAME = 'scheduler-asignacion-turnos';

@Injectable()
export class SchedulerService implements OnModuleDestroy {
    private readonly logger = new Logger(SchedulerService.name);
    private readonly totalConsultorios: number;
    private readonly intervalMs: number;

    constructor(
        private readonly finalizeTurnosUseCase: FinalizeTurnosUseCase,
        private readonly assignRoomUseCase: AssignRoomUseCase,
        private readonly configService: ConfigService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        this.intervalMs = Number(this.configService.get('SCHEDULER_INTERVAL_MS')) || 15000;
        this.totalConsultorios = Number(this.configService.get('CONSULTORIOS_TOTAL')) || DEFAULT_CONSULTORIOS;
        this.logger.log(
            `Scheduler iniciado — ${this.totalConsultorios} consultorios, intervalo: ${this.intervalMs}ms`,
        );

        const interval = setInterval(() => {
            void this.handleSchedulerTick();
        }, this.intervalMs);
        this.schedulerRegistry.addInterval(SCHEDULER_INTERVAL_NAME, interval);
    }

    onModuleDestroy(): void {
        this.schedulerRegistry.deleteInterval(SCHEDULER_INTERVAL_NAME);
        this.logger.log('Scheduler interval limpiado correctamente');
    }

    async handleSchedulerTick(): Promise<void> {
        try {
            await this.finalizeTurnosUseCase.execute();
            await this.assignRoomUseCase.executeAll(this.totalConsultorios);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error en scheduler de asignación: ${message}`);
        }
    }
}
