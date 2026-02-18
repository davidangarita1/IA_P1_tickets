import { Appointment } from "./Appointment";
import { CreateAppointmentDTO, CreateAppointmentResponse } from "./CreateAppointment";

export interface AppointmentRepository {
    getAppointments(): Promise<Appointment[]>;
    createAppointment(data: CreateAppointmentDTO): Promise<CreateAppointmentResponse>;
}
