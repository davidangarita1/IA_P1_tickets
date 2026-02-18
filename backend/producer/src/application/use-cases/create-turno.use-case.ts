import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { EVENT_PUBLISHER_TOKEN } from '../../domain/ports/tokens';

/**
 * Datos de entrada para crear un turno (dominio puro, sin decoradores de NestJS)
 */
export interface CreateTurnoData {
    cedula: number;
    nombre: string;
    priority?: 'alta' | 'media' | 'baja';
}

/**
 * Respuesta del caso de uso
 */
export interface CreateTurnoResult {
    status: 'accepted';
    message: string;
}

/**
 * Use Case: Publicar la solicitud de creación de turno a la cola de mensajes.
 *
 * ⚕️ HUMAN CHECK - SRP: una sola responsabilidad — encolar el turno para procesamiento asíncrono.
 * El Producer no persiste, solo publica el evento al Consumer vía RabbitMQ.
 */
@Injectable()
export class CreateTurnoUseCase {
    private readonly logger = new Logger(CreateTurnoUseCase.name);

    constructor(
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
    ) {}

    execute(data: CreateTurnoData): CreateTurnoResult {
        try {
            this.eventPublisher.publish('crear_turno', data);
            this.logger.log(`Turno encolado — paciente ${data.cedula}`);
            return { status: 'accepted', message: 'Turno en proceso de asignación' };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error publicando mensaje: ${message}`);
            throw error;
        }
    }
}
