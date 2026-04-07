import { Inject, Injectable } from '@nestjs/common';
import {
  IDoctorRepository,
  PaginationParams,
  PaginatedResult,
} from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/ports/tokens';
import { Doctor } from '../../domain/entities/doctor.entity';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

@Injectable()
export class GetAllDoctorsUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(params?: Partial<PaginationParams>): Promise<PaginatedResult<Doctor>> {
    const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
    return this.doctorRepository.findAllPaginated({ page, limit });
  }
}
