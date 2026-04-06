export type FranjaHoraria = "06:00-14:00" | "14:00-22:00";
export type DoctorStatus = "Activo" | "Inactivo";

export interface Doctor {
  _id: string;
  nombre: string;
  cedula: string;
  consultorio: string | null;
  franjaHoraria: FranjaHoraria | null;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  nombre: string;
  cedula: string;
  consultorio?: string | null;
  franjaHoraria?: FranjaHoraria | null;
}

export interface AvailableShiftsResponse {
  consultorio: string;
  available_shifts: FranjaHoraria[];
  occupied_shifts: FranjaHoraria[];
}
