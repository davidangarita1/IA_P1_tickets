/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import AppointmentList from "@/components/AppointmentList/AppointmentList";
import type { Appointment } from "@/domain/Appointment";

const mockAppointments: Appointment[] = [
    {
        id: "1",
        nombre: "Juan",
        cedula: 111,
        consultorio: "101",
        timestamp: 1000,
        estado: "llamado",
    },
    {
        id: "2",
        nombre: "María",
        cedula: 222,
        consultorio: null,
        timestamp: 2000,
        estado: "espera",
    },
    {
        id: "3",
        nombre: "Pedro",
        cedula: 333,
        consultorio: "102",
        timestamp: 3000,
        estado: "llamado",
    },
    {
        id: "4",
        nombre: "Ana",
        cedula: 444,
        consultorio: "103",
        timestamp: 4000,
        estado: "atendido",
    },
];

describe("AppointmentList", () => {
    it("should filter appointments by status", () => {
        render(
            <AppointmentList
                appointments={mockAppointments}
                status="llamado"
                title="Called"
                icon="📢"
                variant="called"
            />
        );

        expect(screen.getByText("Juan")).toBeInTheDocument();
        expect(screen.getByText("Pedro")).toBeInTheDocument();
        expect(screen.queryByText("María")).not.toBeInTheDocument();
        expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    });

    it("should display section title with icon", () => {
        render(
            <AppointmentList
                appointments={mockAppointments}
                status="espera"
                title="Waiting"
                icon="⏳"
                variant="waiting"
            />
        );

        expect(screen.getByText(/⏳/)).toBeInTheDocument();
        expect(screen.getByText(/Waiting/)).toBeInTheDocument();
    });

    it("should return null when no appointments match the status", () => {
        const { container } = render(
            <AppointmentList
                appointments={mockAppointments}
                status="atendido"
                title="Empty"
                icon="❌"
                variant="attended"
            />
        );

        // Ana matches, so it should render
        expect(screen.getByText("Ana")).toBeInTheDocument();
    });

    it("should return null for status with zero matches", () => {
        const noMatch: Appointment[] = [
            {
                id: "1",
                nombre: "Only Waiting",
                cedula: 111,
                consultorio: null,
                timestamp: 1000,
                estado: "espera",
            },
        ];

        const { container } = render(
            <AppointmentList
                appointments={noMatch}
                status="llamado"
                title="Called"
                icon="📢"
                variant="called"
            />
        );

        // Should render nothing
        expect(container.innerHTML).toBe("");
    });

    it("should show count for attended variant", () => {
        render(
            <AppointmentList
                appointments={mockAppointments}
                status="atendido"
                title="Atendidos"
                icon="✅"
                variant="attended"
            />
        );

        expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    });

    it("should sort descending when sortDescending is true", () => {
        const sorted: Appointment[] = [
            {
                id: "1",
                nombre: "First",
                cedula: 111,
                consultorio: "101",
                timestamp: 1000,
                estado: "atendido",
            },
            {
                id: "2",
                nombre: "Second",
                cedula: 222,
                consultorio: "102",
                timestamp: 5000,
                estado: "atendido",
            },
        ];

        render(
            <AppointmentList
                appointments={sorted}
                status="atendido"
                title="Attended"
                icon="✅"
                variant="attended"
                sortDescending
            />
        );

        const items = screen.getAllByRole("listitem");
        // Second (timestamp 5000) should come first when descending
        expect(items[0]).toHaveTextContent("Second");
        expect(items[1]).toHaveTextContent("First");
    });

    it("should pass formatTime to AppointmentCard for attended variant", () => {
        const mockFormatTime = jest.fn().mockReturnValue("12:00:00");

        render(
            <AppointmentList
                appointments={mockAppointments}
                status="atendido"
                title="Attended"
                icon="✅"
                variant="attended"
                formatTime={mockFormatTime}
            />
        );

        expect(mockFormatTime).toHaveBeenCalled();
    });
});
