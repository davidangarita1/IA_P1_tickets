import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/ports/tokens';
import { Doctor, FranjaHoraria } from '../../domain/entities/doctor.entity';

export interface CreateDoctorData {
    nombre: string;
    cedula: string;
    consultorio?: string | null;
    franjaHoraria?: FranjaHoraria | null;
}

@Injectable()
export class CreateDoctorUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
    ) {}

    async execute(data: CreateDoctorData): Promise<Doctor> {
        const existing = await this.doctorRepository.findByCedula(data.cedula);
        if (existing) {
            throw new ConflictException('Ya existe un médico registrado con ese número de cédula');
        }

        if (data.consultorio && data.franjaHoraria) {
            const conflict = await this.doctorRepository.findByConsultorioAndFranja(
                data.consultorio,
                data.franjaHoraria,
            );
            if (conflict) {
                throw new ConflictException('La franja horaria del consultorio ya está ocupada');
            }
        }

        return this.doctorRepository.create({
            nombre: data.nombre,
            cedula: data.cedula,
            consultorio: data.consultorio ?? null,
            franjaHoraria: data.franjaHoraria ?? null,
            status: 'Activo',
        });
    }
}
