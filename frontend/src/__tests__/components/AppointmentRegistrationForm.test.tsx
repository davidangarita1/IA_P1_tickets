/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppointmentRegistrationForm from "@/components/AppointmentRegistrationForm/AppointmentRegistrationForm";

// Mock the registration hook
const mockRegister = jest.fn();
jest.mock("@/hooks/useAppointmentRegistration", () => ({
    useAppointmentRegistration: () => ({
        register: mockRegister,
        loading: false,
        success: null,
        error: null,
    }),
}));

// Mock sanitize
jest.mock("@/security/sanitize", () => ({
    sanitizeText: (input: string) => input.trim(),
}));

describe("AppointmentRegistrationForm", () => {
    beforeEach(() => {
        mockRegister.mockClear();
    });

    it("should render the form title", () => {
        render(<AppointmentRegistrationForm />);
        expect(screen.getByText("Registro de Turnos")).toBeInTheDocument();
    });

    it("should render name and ID card inputs", () => {
        render(<AppointmentRegistrationForm />);
        expect(screen.getByPlaceholderText("Nombre Completo")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("ID Card")).toBeInTheDocument();
    });

    it("should render submit button", () => {
        render(<AppointmentRegistrationForm />);
        expect(screen.getByText("Registrar Turno")).toBeInTheDocument();
    });

    it("should call register with sanitized data on submit", async () => {
        const user = userEvent.setup();
        render(<AppointmentRegistrationForm />);

        await user.type(screen.getByPlaceholderText("Nombre Completo"), "Juan");
        await user.type(screen.getByPlaceholderText("ID Card"), "12345");
        await user.click(screen.getByText("Registrar Turno"));

        expect(mockRegister).toHaveBeenCalledWith({
            nombre: "Juan",
            cedula: 12345,
        });
    });

    it("should not call register with empty name", async () => {
        const user = userEvent.setup();
        render(<AppointmentRegistrationForm />);

        await user.type(screen.getByPlaceholderText("ID Card"), "12345");
        await user.click(screen.getByText("Registrar Turno"));

        expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should not call register with invalid ID card", async () => {
        const user = userEvent.setup();
        render(<AppointmentRegistrationForm />);

        await user.type(screen.getByPlaceholderText("Nombre Completo"), "Juan");
        await user.type(screen.getByPlaceholderText("ID Card"), "abc");
        await user.click(screen.getByText("Registrar Turno"));

        expect(mockRegister).not.toHaveBeenCalled();
    });
});
