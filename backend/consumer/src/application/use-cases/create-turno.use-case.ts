import { Inject, Injectable, Logger } from '@nestjs/common';
import { Turno, TurnoEventPayload } from '../../domain/entities/turno.entity';
import { ITurnoRepository, CreateTurnoData } from '../../domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { INotificationGateway } from '../../domain/ports/INotificationGateway';
import {
    TURNO_REPOSITORY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    NOTIFICATION_GATEWAY_TOKEN,
} from '../../domain/ports/tokens';

/**
 * Resultado del caso de uso CreateTurno
 */
export interface CreateTurnoResult {
    turno: Turno;
    eventPayload: TurnoEventPayload;
}

/**
 * Use Case: Crear un nuevo turno.
 *
 * ⚕️ HUMAN CHECK - SRP: una sola responsabilidad — orquestar la creación de un turno.
 * Persiste en repositorio, envía notificación, y publica evento.
 * No conoce RabbitMQ, MongoDB ni ningún detalle de infraestructura.
 */
@Injectable()
export class CreateTurnoUseCase {
    private readonly logger = new Logger(CreateTurnoUseCase.name);

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
        @Inject(NOTIFICATION_GATEWAY_TOKEN) private readonly notificationGateway: INotificationGateway,
    ) {}

    async execute(data: CreateTurnoData): Promise<CreateTurnoResult> {
        // 1. Persistir turno en estado 'espera'
        const turno = await this.turnoRepository.save(data);
        this.logger.log(`Turno creado en espera — paciente ${turno.cedula}, ID: ${turno.id}`);

        // 2. Enviar notificación
        await this.notificationGateway.sendNotification(
            String(turno.cedula),
            turno.consultorio,
        );

        // 3. Publicar evento para broadcast WebSocket
        const eventPayload = turno.toEventPayload();
        this.eventPublisher.publish('turno_creado', eventPayload);

        return { turno, eventPayload };
    }
}
