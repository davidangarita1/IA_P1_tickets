import { Doctor, DoctorStatus, Shift } from '../entities/doctor.entity';

export interface CreateDoctorData {
    name: string;
    documentId: string;
    office: string | null;
    shift: Shift | null;
    status: DoctorStatus;
}

export interface UpdateDoctorData {
    name?: string;
    documentId?: string;
    office?: string | null;
    shift?: Shift | null;
}

export interface AvailableShiftsResult {
    availableShifts: Shift[];
    occupiedShifts: Shift[];
}

export interface IDoctorRepository {
    create(data: CreateDoctorData): Promise<Doctor>;
    findAll(): Promise<Doctor[]>;
    findById(id: string): Promise<Doctor | null>;
    findByDocumentId(documentId: string): Promise<Doctor | null>;
    findByOfficeAndShift(office: string, shift: Shift): Promise<Doctor | null>;
    findAvailableShifts(office: string, excludeDoctorId?: string): Promise<AvailableShiftsResult>;
    update(id: string, data: UpdateDoctorData): Promise<Doctor>;
    softDelete(id: string): Promise<Doctor>;
}
