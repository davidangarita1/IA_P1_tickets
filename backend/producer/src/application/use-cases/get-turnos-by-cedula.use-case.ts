import { Inject, Injectable } from '@nestjs/common';
import { Turno, TurnoEventPayload } from '../../domain/entities/turno.entity';
import { ITurnoRepository } from '../../domain/ports/ITurnoRepository';
import { TURNO_REPOSITORY_TOKEN } from '../../domain/ports/tokens';

/**
 * Use Case: Obtener turnos por número de cédula.
 *
 * ⚕️ HUMAN CHECK - SRP: una sola responsabilidad — buscar turnos de un paciente específico.
 */
@Injectable()
export class GetTurnosByCedulaUseCase {
    constructor(
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
    ) {}

    async execute(cedula: number): Promise<TurnoEventPayload[]> {
        const turnos: Turno[] = await this.turnoRepository.findByCedula(cedula);
        return turnos.map(t => t.toEventPayload());
    }
}
