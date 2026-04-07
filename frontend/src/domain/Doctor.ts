export type Shift = '06:00-14:00' | '14:00-22:00';
export type DoctorStatus = 'active' | 'inactive';

export interface Doctor {
  _id: string;
  name: string;
  documentId: string;
  office: string | null;
  shift: Shift | null;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  name: string;
  documentId: string;
  office?: string | null;
  shift?: Shift | null;
}

export interface UpdateDoctorData {
  name?: string;
  documentId?: string;
  office?: string | null;
  shift?: Shift | null;
}

export interface AvailableShiftsResponse {
  office: string;
  availableShifts: Shift[];
  occupiedShifts: Shift[];
}
