// ⚕️ HUMAN CHECK - Entidad de dominio pura (sin dependencias de infraestructura)
// Esta clase representa el concepto de Turno en el dominio del negocio.
// No importa Mongoose, NestJS ni ningún framework.
// Fuente canónica: @turnos/shared — importada por Producer y Consumer.

export type TurnoEstado = 'espera' | 'llamado' | 'atendido';
export type TurnoPriority = 'alta' | 'media' | 'baja';

export class Turno {
    readonly id: string;
    readonly nombre: string;
    readonly cedula: number;
    readonly consultorio: string | null;
    readonly estado: TurnoEstado;
    readonly priority: TurnoPriority;
    readonly timestamp: number;
    readonly finAtencionAt: number | null;

    constructor(props: {
        id: string;
        nombre: string;
        cedula: number;
        consultorio: string | null;
        estado: TurnoEstado;
        priority: TurnoPriority;
        timestamp: number;
        finAtencionAt?: number | null;
    }) {
        this.id = props.id;
        this.nombre = props.nombre;
        this.cedula = props.cedula;
        this.consultorio = props.consultorio;
        this.estado = props.estado;
        this.priority = props.priority;
        this.timestamp = props.timestamp;
        this.finAtencionAt = props.finAtencionAt ?? null;
    }

    /**
     * Convierte la entidad a un payload plano para eventos RabbitMQ/WebSocket
     */
    toEventPayload(): TurnoEventPayload {
        return {
            id: this.id,
            nombre: this.nombre,
            cedula: this.cedula,
            consultorio: this.consultorio,
            estado: this.estado,
            priority: this.priority,
            timestamp: this.timestamp,
            ...(this.finAtencionAt != null && { finAtencionAt: this.finAtencionAt }),
        };
    }
}

/**
 * Payload estandarizado para eventos RabbitMQ y WebSocket.
 * Usado por: Consumer (emit), Producer (receive + broadcast), Frontend (receive).
 */
export interface TurnoEventPayload {
    id: string;
    nombre: string;
    cedula: number;
    consultorio: string | null;
    estado: TurnoEstado;
    priority: TurnoPriority;
    timestamp: number;
    finAtencionAt?: number;
}
