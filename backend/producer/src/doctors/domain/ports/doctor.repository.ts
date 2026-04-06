import { Doctor, DoctorStatus, FranjaHoraria } from '../entities/doctor.entity';

export interface CreateDoctorData {
    nombre: string;
    cedula: string;
    consultorio: string | null;
    franjaHoraria: FranjaHoraria | null;
    status: DoctorStatus;
}

export interface AvailableShiftsResult {
    availableShifts: FranjaHoraria[];
    occupiedShifts: FranjaHoraria[];
}

export interface IDoctorRepository {
    create(data: CreateDoctorData): Promise<Doctor>;
    findAll(): Promise<Doctor[]>;
    findByCedula(cedula: string): Promise<Doctor | null>;
    findByConsultorioAndFranja(consultorio: string, franjaHoraria: FranjaHoraria): Promise<Doctor | null>;
    findAvailableShifts(consultorio: string, excludeDoctorId?: string): Promise<AvailableShiftsResult>;
}
