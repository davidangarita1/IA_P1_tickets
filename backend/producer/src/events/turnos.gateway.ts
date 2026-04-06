import { Inject, Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ITurnoRepository } from '../domain/ports/ITurnoRepository';
import { TURNO_REPOSITORY_TOKEN } from '../domain/ports/tokens';
import { TurnoEventPayload } from '../domain/entities/turno.entity';

@WebSocketGateway({
    namespace: '/ws/turnos',
    cors: {
        origin: '*',
    },
})
export class TurnosGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(TurnosGateway.name);

    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
    ) { }

    async handleConnection(client: Socket): Promise<void> {
        this.logger.log(`Cliente conectado: ${client.id}`);

        try {
            const turnos = await this.turnoRepository.findAll();

            const snapshot: TurnoEventPayload[] = turnos.map(t => t.toEventPayload());

            client.emit('TURNOS_SNAPSHOT', {
                type: 'TURNOS_SNAPSHOT',
                data: snapshot,
            });

            this.logger.log(`Snapshot enviado a ${client.id} — ${snapshot.length} turnos`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error enviando snapshot a ${client.id}: ${message}`);
        }
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }

    broadcastTurnoActualizado(turno: TurnoEventPayload): void {
        this.server.emit('TURNO_ACTUALIZADO', {
            type: 'TURNO_ACTUALIZADO',
            data: turno,
        });

        this.logger.log(
            `Broadcast TURNO_ACTUALIZADO — ${turno.nombre} (estado: ${turno.estado}, consultorio: ${turno.consultorio ?? 'N/A'})`,
        );
    }
}
