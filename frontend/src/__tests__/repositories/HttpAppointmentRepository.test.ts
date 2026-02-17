import { HttpAppointmentRepository } from "@/repositories/HttpAppointmentRepository";
import { AppointmentRepository } from "@/repositories/AppointmentRepository";

// Mock httpClient module
jest.mock("@/lib/httpClient", () => ({
    httpGet: jest.fn(),
    httpPost: jest.fn(),
}));

// Mock env config
jest.mock("@/config/env", () => ({
    env: {
        API_BASE_URL: "http://localhost:3000",
        WS_URL: "http://localhost:3000",
    },
}));

import { httpGet, httpPost } from "@/lib/httpClient";

const mockHttpGet = httpGet as jest.MockedFunction<typeof httpGet>;
const mockHttpPost = httpPost as jest.MockedFunction<typeof httpPost>;

describe("HttpAppointmentRepository", () => {
    let repository: AppointmentRepository;

    beforeEach(() => {
        repository = new HttpAppointmentRepository();
        mockHttpGet.mockClear();
        mockHttpPost.mockClear();
    });

    describe("getAppointments", () => {
        it("should call httpGet with correct URL", async () => {
            const mockAppointments = [
                {
                    id: "1",
                    nombre: "Test",
                    cedula: 123,
                    consultorio: null,
                    timestamp: Date.now(),
                    estado: "espera" as const,
                },
            ];

            mockHttpGet.mockResolvedValue(mockAppointments);

            const result = await repository.getAppointments();

            expect(mockHttpGet).toHaveBeenCalledWith(
                "http://localhost:3000/turnos"
            );
            expect(result).toEqual(mockAppointments);
        });

        it("should propagate errors from httpGet", async () => {
            mockHttpGet.mockRejectedValue(new Error("TIMEOUT"));

            await expect(repository.getAppointments()).rejects.toThrow("TIMEOUT");
        });
    });

    describe("createAppointment", () => {
        it("should call httpPost with correct URL and data", async () => {
            const dto = { nombre: "Juan", cedula: 12345 };
            const mockResponse = {
                status: "accepted" as const,
                message: "Turno registrado",
            };

            mockHttpPost.mockResolvedValue(mockResponse);

            const result = await repository.createAppointment(dto);

            expect(mockHttpPost).toHaveBeenCalledWith(
                "http://localhost:3000/turnos",
                dto
            );
            expect(result).toEqual(mockResponse);
        });

        it("should propagate errors from httpPost", async () => {
            const dto = { nombre: "Test", cedula: 99999 };
            mockHttpPost.mockRejectedValue(new Error("SERVER_ERROR"));

            await expect(repository.createAppointment(dto)).rejects.toThrow(
                "SERVER_ERROR"
            );
        });
    });

    it("should implement AppointmentRepository interface", () => {
        expect(typeof repository.getAppointments).toBe("function");
        expect(typeof repository.createAppointment).toBe("function");
    });
});
