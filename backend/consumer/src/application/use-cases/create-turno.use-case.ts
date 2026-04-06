import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Turno, TurnoEventPayload } from '../../domain/entities/turno.entity';
import { ITurnoRepository, CreateTurnoData } from '../../domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { INotificationGateway } from '../../domain/ports/INotificationGateway';
import { AssignRoomUseCase } from './assign-room.use-case';
import {
    TURNO_REPOSITORY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    NOTIFICATION_GATEWAY_TOKEN,
} from '../../domain/ports/tokens';

export interface CreateTurnoResult {
    turno: Turno;
    eventPayload: TurnoEventPayload;
}

@Injectable()
export class CreateTurnoUseCase {
    private readonly logger = new Logger(CreateTurnoUseCase.name);
    private readonly totalConsultorios: number;

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
        @Inject(NOTIFICATION_GATEWAY_TOKEN) private readonly notificationGateway: INotificationGateway,
        private readonly assignRoomUseCase: AssignRoomUseCase,
        private readonly configService: ConfigService,
    ) {
        this.totalConsultorios = Number(this.configService.get('CONSULTORIOS_TOTAL')) || 5;
    }

    async execute(data: CreateTurnoData): Promise<CreateTurnoResult> {
        const activo = await this.turnoRepository.findActivoPorCedula(data.cedula);
        if (activo) {
            throw new BadRequestException('El paciente ya tiene un turno en espera o en atención');
        }

        const turno = await this.turnoRepository.save(data);
        this.logger.log(`Turno creado en espera — paciente ${turno.cedula}, ID: ${turno.id}`);

        await this.notificationGateway.sendNotification(
            String(turno.cedula),
            turno.consultorio,
        );

        const eventPayload = turno.toEventPayload();
        this.eventPublisher.publish('turno_creado', eventPayload);

        try {
            await this.assignRoomUseCase.executeAll(this.totalConsultorios);
        } catch (error) {
            this.logger.error(
                `Error al asignar consultorios después de crear el turno ${turno.id}`,
                (error as Error).stack,
            );
        }

        return { turno, eventPayload };
    }
}
