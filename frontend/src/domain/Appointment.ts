export type AppointmentStatus = "waiting" | "called" | "served";

export interface Appointment {
  id: string;
  nombre: string;
  cedula: number;
  room: string | null;
  timestamp: number;
  estado: AppointmentStatus;
}
