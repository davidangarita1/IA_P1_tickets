import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConsumerController } from './presentation/consumer.controller';
import { TurnosModule } from './turnos/turnos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { RabbitMQEventPublisher } from './infrastructure/adapters/rabbitmq-event-publisher.adapter';
import { NotificationsService } from './notifications/notifications.service';
import { EVENT_PUBLISHER_TOKEN, NOTIFICATION_GATEWAY_TOKEN } from './domain/ports/tokens';
import { CreateTurnoUseCase } from './application/use-cases/create-turno.use-case';
import { AssignRoomUseCase } from './application/use-cases/assign-room.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        ScheduleModule.forRoot(),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                if (!uri) throw new Error('MONGODB_URI environment variable is required');
                return { uri };
            },
            inject: [ConfigService],
        }),
        NotificationsModule,
        SchedulerModule,
        TurnosModule,
    ],
    controllers: [ConsumerController],

    providers: [
        CreateTurnoUseCase,
        AssignRoomUseCase,
        {
            provide: EVENT_PUBLISHER_TOKEN,
            useClass: RabbitMQEventPublisher,
        },
        {
            provide: NOTIFICATION_GATEWAY_TOKEN,
            useExisting: NotificationsService,
        },
    ],
})
export class AppModule { }
