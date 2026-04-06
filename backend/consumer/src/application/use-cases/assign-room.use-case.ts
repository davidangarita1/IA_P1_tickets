import { Inject, Injectable, Logger } from '@nestjs/common';
import { Turno } from '../../domain/entities/turno.entity';
import { ITurnoRepository } from '../../domain/ports/ITurnoRepository';
import { IEventPublisher } from '../../domain/ports/IEventPublisher';
import { TURNO_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN } from '../../domain/ports/tokens';

@Injectable()
export class AssignRoomUseCase {
    private readonly logger = new Logger(AssignRoomUseCase.name);

    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: IEventPublisher,
    ) {}


    async execute(totalConsultorios: number): Promise<Turno | null> {

        const ocupados = await this.turnoRepository.getConsultoriosOcupados();
        this.logger.debug(`Consultorios ocupados: [${ocupados.join(', ')}]`);

        const todosConsultorios = Array.from(
            { length: totalConsultorios },
            (_, i) => String(i + 1),
        );
        const libres = todosConsultorios.filter(c => !ocupados.includes(c));

        if (libres.length === 0) {
            this.logger.debug('No hay consultorios libres — esperando...');
            return null;
        }

        const enEspera = await this.turnoRepository.findPacientesEnEspera();

        if (enEspera.length === 0) {
            this.logger.debug('No hay pacientes en espera');
            return null;
        }

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
