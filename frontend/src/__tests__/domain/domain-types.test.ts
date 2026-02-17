import { Appointment, AppointmentStatus } from "@/domain/Appointment";
import { CreateAppointmentDTO, CreateAppointmentResponse } from "@/domain/CreateAppointment";

describe("Domain types", () => {
    describe("Appointment", () => {
        it("should accept valid appointment data", () => {
            const appointment: Appointment = {
                id: "abc123",
                nombre: "Juan Pérez",
                cedula: 1234567890,
                consultorio: "101",
                timestamp: Date.now(),
                estado: "espera",
            };

            expect(appointment.id).toBe("abc123");
            expect(appointment.cedula).toBe(1234567890);
            expect(typeof appointment.cedula).toBe("number");
        });

        it("should accept null consultorio for waiting appointments", () => {
            const appointment: Appointment = {
                id: "abc123",
                nombre: "María López",
                cedula: 9876543210,
                consultorio: null,
                timestamp: Date.now(),
                estado: "espera",
            };

            expect(appointment.consultorio).toBeNull();
        });

        it("should enforce valid status values", () => {
            const validStatuses: AppointmentStatus[] = [
                "espera",
                "llamado",
                "atendido",
            ];

            validStatuses.forEach((status) => {
                const appointment: Appointment = {
                    id: "test",
                    nombre: "Test",
                    cedula: 123,
                    consultorio: null,
                    timestamp: Date.now(),
                    estado: status,
                };
                expect(appointment.estado).toBe(status);
            });
        });
    });

    describe("CreateAppointmentDTO", () => {
        it("should have nombre as string and cedula as number", () => {
            const dto: CreateAppointmentDTO = {
                nombre: "Test Patient",
                cedula: 1234567890,
            };

            expect(typeof dto.nombre).toBe("string");
            expect(typeof dto.cedula).toBe("number");
        });
    });

    describe("CreateAppointmentResponse", () => {
        it("should accept accepted status", () => {
            const response: CreateAppointmentResponse = {
                status: "accepted",
                message: "Turno registrado",
            };

            expect(response.status).toBe("accepted");
        });

        it("should accept error status", () => {
            const response: CreateAppointmentResponse = {
                status: "error",
                message: "Validation failed",
            };

            expect(response.status).toBe("error");
        });
    });
});
