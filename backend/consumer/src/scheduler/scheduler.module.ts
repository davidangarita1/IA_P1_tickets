import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TurnosModule } from '../turnos/turnos.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RabbitMQEventPublisher } from '../infrastructure/adapters/rabbitmq-event-publisher.adapter';
import { EVENT_PUBLISHER_TOKEN } from '../domain/ports/tokens';
import { FinalizeTurnosUseCase } from '../application/use-cases/finalize-turnos.use-case';
import { AssignRoomUseCase } from '../application/use-cases/assign-room.use-case';

@Module({
    imports: [TurnosModule, NotificationsModule],
    providers: [
        SchedulerService,
        FinalizeTurnosUseCase,
        AssignRoomUseCase,

        {
            provide: EVENT_PUBLISHER_TOKEN,
            useClass: RabbitMQEventPublisher,
        },
    ],
    exports: [SchedulerService],
})
export class SchedulerModule { }
