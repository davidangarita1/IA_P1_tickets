import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '@/domain/ports/tokens';
import { Doctor } from '../../domain/entities/doctor.entity';

@Injectable()
export class GetAllDoctorsUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
    ) {}

    async execute(): Promise<Doctor[]> {
        return this.doctorRepository.findAll();
    }
}
