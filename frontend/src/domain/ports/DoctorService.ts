import type {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  AvailableShiftsResponse,
  PaginationParams,
  PaginatedResult,
} from '@/domain/Doctor';

export interface DoctorService {
  getAll(params?: PaginationParams): Promise<PaginatedResult<Doctor>>;
  create(data: CreateDoctorData): Promise<Doctor>;
  update(id: string, data: UpdateDoctorData): Promise<Doctor>;
  remove(id: string): Promise<void>;
  getAvailableShifts(office: string, excludeDoctorId?: string): Promise<AvailableShiftsResponse>;
}
