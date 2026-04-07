import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/ports/tokens';
import { Shift } from '../../domain/entities/doctor.entity';

export interface GetAvailableShiftsData {
    office: string;
    excludeDoctorId?: string;
}

export interface AvailableShiftsResponse {
    office: string;
    availableShifts: Shift[];
    occupiedShifts: Shift[];
}

@Injectable()
export class GetAvailableShiftsUseCase {
    constructor(
        @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
    ) {}

    async execute(data: GetAvailableShiftsData): Promise<AvailableShiftsResponse> {
        const result = await this.doctorRepository.findAvailableShifts(
            data.office,
            data.excludeDoctorId,
        );

        return {
            office: data.office,
            availableShifts: result.availableShifts,
            occupiedShifts: result.occupiedShifts,
        };
    }
}
