import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducerController } from './presentation/producer.controller';
import { TurnosModule } from './turnos/turnos.module';
import { EventsModule } from './events/events.module';
import { RabbitMQEventPublisher } from './infrastructure/adapters/rabbitmq-event-publisher.adapter';
import { EVENT_PUBLISHER_TOKEN } from './domain/ports/tokens';
import { CreateTurnoUseCase } from './application/use-cases/create-turno.use-case';
import { GetAllTurnosUseCase } from './application/use-cases/get-all-turnos.use-case';
import { GetTurnosByCedulaUseCase } from './application/use-cases/get-turnos-by-cedula.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // ⚕️ HUMAN CHECK - use ConfigService instead of hardcoded string
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                if (!uri) throw new Error('MONGODB_URI environment variable is required');
                return { uri };
            },
            inject: [ConfigService],
        }),
        ClientsModule.registerAsync([
            {
                name: 'TURNOS_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => {
                    const rabbitUrl = configService.get<string>('RABBITMQ_URL');
                    if (!rabbitUrl) throw new Error('RABBITMQ_URL environment variable is required');
                    return {
                    transport: Transport.RMQ,
                    options: {
                        // ⚕️ HUMAN CHECK - use ConfigService instead of hardcoded string
                        urls: [rabbitUrl],
                        queue: configService.get<string>('RABBITMQ_QUEUE', 'turnos_queue'),
                        queueOptions: {
                            durable: true,
                        },
                    },
                };
                },
                inject: [ConfigService],
            },
        ]),
        TurnosModule,
        // ⚕️ HUMAN CHECK - Módulo de Eventos (WebSocket + RabbitMQ listener)
        EventsModule,
    ],
    controllers: [ProducerController],
    // ⚕️ HUMAN CHECK - DIP: Use Cases inyectan puertos, registrados con tokens
    providers: [
        CreateTurnoUseCase,
        GetAllTurnosUseCase,
        GetTurnosByCedulaUseCase,
        {
            provide: EVENT_PUBLISHER_TOKEN,
            useClass: RabbitMQEventPublisher,
        },
    ],
})
export class AppModule { }
