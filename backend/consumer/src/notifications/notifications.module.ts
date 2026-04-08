import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
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
    providers: [NotificationsService],
    exports: [NotificationsService, ClientsModule],
})
export class NotificationsModule { }
