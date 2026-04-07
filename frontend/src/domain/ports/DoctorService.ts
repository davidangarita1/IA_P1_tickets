import type { Doctor, CreateDoctorData, UpdateDoctorData, AvailableShiftsResponse } from "@/domain/Doctor";

export interface DoctorService {
  getAll(): Promise<Doctor[]>;
  create(data: CreateDoctorData): Promise<Doctor>;
  update(id: string, data: UpdateDoctorData): Promise<Doctor>;
  getAvailableShifts(
    office: string,
    excludeDoctorId?: string
  ): Promise<AvailableShiftsResponse>;
}
