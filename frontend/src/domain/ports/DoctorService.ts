import type { Doctor, CreateDoctorData, AvailableShiftsResponse } from "@/domain/Doctor";

export interface DoctorService {
  getAll(): Promise<Doctor[]>;
  create(data: CreateDoctorData): Promise<Doctor>;
  getAvailableShifts(
    office: string,
    excludeDoctorId?: string
  ): Promise<AvailableShiftsResponse>;
}
