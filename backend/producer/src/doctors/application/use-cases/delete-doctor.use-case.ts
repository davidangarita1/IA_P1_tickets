import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN, TURNO_REPOSITORY_TOKEN } from '@/domain/ports/tokens';
import { ITurnoRepository } from '@/domain/ports/ITurnoRepository';

@Injectable()
export class DeleteDoctorUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
        @Inject(TURNO_REPOSITORY_TOKEN) private readonly turnoRepository: ITurnoRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const doctor = await this.doctorRepository.findById(id);
        if (!doctor) {
            throw new NotFoundException('Médico no encontrado');
        }

        if (doctor.office) {
            const turnos = await this.turnoRepository.findAll();
            const hasActiveTurno = turnos.some(
                turno =>
                    turno.consultorio === doctor.office &&
                    (turno.estado === 'llamado' || turno.estado === 'atendido'),
            );

            if (hasActiveTurno) {
                throw new ConflictException(
                    'No se puede dar de baja a un médico que se encuentra atendiendo un turno en este momento',
                );
            }
        }

        await this.doctorRepository.softDelete(id);
    }
}
