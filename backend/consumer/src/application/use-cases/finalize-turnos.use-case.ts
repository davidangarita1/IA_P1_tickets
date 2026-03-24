import { Inject, Injectable, Logger } from '@nestjs/common';
import { Turno } from '../../domain/entities/turno.entity';
import { ITurnoRepository } from '../../domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { TURNO_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN } from '../../domain/ports/tokens';

/**
 * Use Case: Finalizar turnos cuyo tiempo de atención ha expirado.
 *
 * ⚕️ HUMAN CHECK - SRP: una sola responsabilidad — transicionar turnos 'llamado' → 'atendido'
 * cuando su finAtencionAt ha vencido, y publicar los eventos correspondientes.
 */
@Injectable()
export class FinalizeTurnosUseCase {
    private readonly logger = new Logger(FinalizeTurnosUseCase.name);

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
    ) {}

    async execute(): Promise<Turno[]> {
        const finalizados = await this.turnoRepository.finalizarTurnosLlamados();

        for (const turno of finalizados) {
            this.eventPublisher.publish('turno_actualizado', turno.toEventPayload());
        }

        if (finalizados.length > 0) {
            this.logger.log(`Finalizados ${finalizados.length} turnos expirados`);
        }

        return finalizados;
    }
}
