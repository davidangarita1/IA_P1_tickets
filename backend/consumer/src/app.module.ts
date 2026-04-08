import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConsumerController } from './presentation/consumer.controller';
import { Turno, TurnoSchema } from './infrastructure/schemas/turno.schema';
import { TurnoMongooseAdapter } from './infrastructure/adapters/turno-mongoose.adapter';
import { StandardPrioritySortingStrategy } from './infrastructure/adapters/standard-priority-sorting.strategy';
import { RabbitMQEventPublisher } from './infrastructure/adapters/rabbitmq-event-publisher.adapter';
import { NotificationsService } from './infrastructure/adapters/notifications.service';
import { SchedulerService } from './infrastructure/adapters/scheduler.service';
import {
    TURNO_REPOSITORY_TOKEN,
    PRIORITY_SORTING_STRATEGY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    NOTIFICATION_GATEWAY_TOKEN,
} from './domain/ports/tokens';
import { CreateTurnoUseCase } from './application/use-cases/create-turno.use-case';
import { AssignRoomUseCase } from './application/use-cases/assign-room.use-case';
import { FinalizeTurnosUseCase } from './application/use-cases/finalize-turnos.use-case';

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
        MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),
        ClientsModule.registerAsync([
            {
                name: 'TURNOS_NOTIFICATIONS',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => {
                    const rabbitUrl = configService.get<string>('RABBITMQ_URL');
                    if (!rabbitUrl) throw new Error('RABBITMQ_URL environment variable is required');
                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [rabbitUrl],
                            queue: configService.get<string>('RABBITMQ_NOTIFICATIONS_QUEUE', 'turnos_notifications'),
                            queueOptions: {
                                durable: true,
                            },
                        },
                    };
                },
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [ConsumerController],

    providers: [
        {
            provide: TURNO_REPOSITORY_TOKEN,
            useClass: TurnoMongooseAdapter,
        },
        {
            provide: PRIORITY_SORTING_STRATEGY_TOKEN,
            useClass: StandardPrioritySortingStrategy,
        },
        {
            provide: EVENT_PUBLISHER_TOKEN,
            useClass: RabbitMQEventPublisher,
        },
        NotificationsService,
        {
            provide: NOTIFICATION_GATEWAY_TOKEN,
            useExisting: NotificationsService,
        },
        CreateTurnoUseCase,
        AssignRoomUseCase,
        FinalizeTurnosUseCase,
        SchedulerService,
    ],
})
export class AppModule { }
