import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/ports/tokens';
import { FranjaHoraria } from '../../domain/entities/doctor.entity';

export interface GetAvailableShiftsData {
    consultorio: string;
    excludeDoctorId?: string;
}

export interface AvailableShiftsResponse {
    consultorio: string;
    available_shifts: FranjaHoraria[];
    occupied_shifts: FranjaHoraria[];
}

@Injectable()
export class GetAvailableShiftsUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
    ) {}

    async execute(data: GetAvailableShiftsData): Promise<AvailableShiftsResponse> {
        const result = await this.doctorRepository.findAvailableShifts(
            data.consultorio,
            data.excludeDoctorId,
        );

        return {
            consultorio: data.consultorio,
            available_shifts: result.availableShifts,
            occupied_shifts: result.occupiedShifts,
        };
    }
}
