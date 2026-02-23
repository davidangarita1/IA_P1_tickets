import { Inject, Injectable, Logger } from '@nestjs/common';
import { Turno } from '../../domain/entities/turno.entity';
import { ITurnoRepository } from '../../domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { TURNO_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN } from '../../domain/ports/tokens';

/**
 * Use Case: Asignar un consultorio libre a un paciente en espera.
 *
 * ⚕️ HUMAN CHECK - SRP: una sola responsabilidad — encontrar un consultorio libre
 * y asignarlo atómicamente al primer paciente en espera (por prioridad + timestamp).
 */
@Injectable()
export class AssignRoomUseCase {
    private readonly logger = new Logger(AssignRoomUseCase.name);

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
    ) {}

    /**
     * @param totalConsultorios Número total de consultorios disponibles
     * @returns El turno actualizado si se asignó, null si no había pacientes o consultorios libres
     */
    async execute(totalConsultorios: number): Promise<Turno | null> {
        // 1. Obtener consultorios ocupados
        const ocupados = await this.turnoRepository.getConsultoriosOcupados();
        this.logger.debug(`Consultorios ocupados: [${ocupados.join(', ')}]`);

        // 2. Calcular consultorios libres
        const todosConsultorios = Array.from(
            { length: totalConsultorios },
            (_, i) => String(i + 1),
        );
        const libres = todosConsultorios.filter(c => !ocupados.includes(c));

        if (libres.length === 0) {
            this.logger.debug('No hay consultorios libres — esperando...');
            return null;
        }

        // 3. Obtener pacientes en espera (ordenados por prioridad + timestamp)
        const enEspera = await this.turnoRepository.findPacientesEnEspera();

        if (enEspera.length === 0) {
            this.logger.debug('No hay pacientes en espera');
            return null;
        }

        // 4. Asignación atómica del primer consultorio libre al primer paciente
        const paciente = enEspera[0];
        const consultorio = libres[0];

        const turnoActualizado = await this.turnoRepository.asignarConsultorio(
            paciente.id,
            consultorio,
        );

        if (turnoActualizado) {
            this.logger.log(
                `✅ Consultorio ${consultorio} asignado a ${turnoActualizado.nombre} (cédula: ${turnoActualizado.cedula})`,
            );
            this.eventPublisher.publish('turno_actualizado', turnoActualizado.toEventPayload());
        }

        return turnoActualizado;
    }

    /**
     * Asigna turnos hasta agotar consultorios libres o pacientes en espera.
     */
    async executeAll(totalConsultorios: number): Promise<Turno[]> {
        const asignados: Turno[] = [];

        if (!Number.isInteger(totalConsultorios) || totalConsultorios <= 0) {
            this.logger.warn(
                `executeAll llamado con totalConsultorios inválido: ${totalConsultorios}`,
            );
            return asignados;
        }

        for (let iteracion = 0; iteracion < totalConsultorios; iteracion++) {
            const turno = await this.execute(totalConsultorios);
            if (!turno) break;
            asignados.push(turno);
        }

        if (asignados.length > 0) {
            this.logger.log(`Asignación en lote completada: ${asignados.length} turnos`);
        }

        return asignados;
    }
}
