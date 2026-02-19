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

// ⚕️ HUMAN CHECK - WebSocket Gateway
// cors: true permite conexiones de cualquier origen (solo para desarrollo)
// En producción, restringir a los dominios permitidos
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

    // ⚕️ HUMAN CHECK - DIP: inyecta ITurnoRepository (puerto), no TurnosService (concreto)
    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
    ) { }

    // ⚕️ HUMAN CHECK - Conexión de cliente
    // Al conectarse, envía un snapshot de todos los turnos actuales
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

    // ⚕️ HUMAN CHECK - Broadcast de actualización
    // Se llama desde el EventsController cuando llega un evento de RabbitMQ
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
