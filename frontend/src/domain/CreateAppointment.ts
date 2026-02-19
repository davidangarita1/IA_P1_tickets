export interface CreateAppointmentDTO {
  nombre: string;
  cedula: number;
}

export interface CreateAppointmentResponse {
  status: "accepted" | "error";
  message: string;
}
