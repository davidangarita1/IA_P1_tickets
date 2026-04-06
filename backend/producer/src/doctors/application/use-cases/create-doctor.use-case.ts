import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/ports/tokens';
import { Doctor, Shift } from '../../domain/entities/doctor.entity';

export interface CreateDoctorData {
    name: string;
    documentId: string;
    office?: string | null;
    shift?: Shift | null;
}

@Injectable()
export class CreateDoctorUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
    ) {}

    async execute(data: CreateDoctorData): Promise<Doctor> {
        const existing = await this.doctorRepository.findByDocumentId(data.documentId);
        if (existing) {
            throw new ConflictException('Ya existe un médico registrado con ese número de cédula');
        }

        if (data.office && data.shift) {
            const conflict = await this.doctorRepository.findByOfficeAndShift(
                data.office,
                data.shift,
            );
            if (conflict) {
                throw new ConflictException('La franja horaria del consultorio ya está ocupada');
            }
        }

        return this.doctorRepository.create({
            name: data.name,
            documentId: data.documentId,
            office: data.office ?? null,
            shift: data.shift ?? null,
            status: 'active',
        });
    }
}
