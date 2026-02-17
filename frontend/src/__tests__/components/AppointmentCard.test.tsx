/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import AppointmentCard from "@/components/AppointmentCard/AppointmentCard";

describe("AppointmentCard", () => {
    it("should render the patient name", () => {
        render(
            <AppointmentCard
                nombre="Juan Pérez"
                consultorio="101"
                variant="called"
            />
        );

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    it("should display consultorio when assigned", () => {
        render(
            <AppointmentCard
                nombre="María"
                consultorio="205"
                variant="called"
            />
        );

        expect(screen.getByText("Consultorio 205")).toBeInTheDocument();
    });

    it("should display 'no asignado' when consultorio is null", () => {
        render(
            <AppointmentCard
                nombre="Pedro"
                consultorio={null}
                variant="waiting"
            />
        );

        expect(screen.getByText("Consultorio no asignado")).toBeInTheDocument();
    });

    it("should show time for attended variant with formatTime", () => {
        const mockFormatTime = jest.fn().mockReturnValue("14:30:00");

        render(
            <AppointmentCard
                nombre="Ana"
                consultorio="101"
                timestamp={1700000000000}
                variant="attended"
                formatTime={mockFormatTime}
            />
        );

        expect(mockFormatTime).toHaveBeenCalledWith(1700000000000);
        expect(screen.getByText("14:30:00")).toBeInTheDocument();
    });

    it("should not show time for non-attended variants", () => {
        const mockFormatTime = jest.fn().mockReturnValue("14:30:00");

        render(
            <AppointmentCard
                nombre="Luis"
                consultorio="101"
                timestamp={1700000000000}
                variant="called"
                formatTime={mockFormatTime}
            />
        );

        expect(mockFormatTime).not.toHaveBeenCalled();
    });

    it("should render as a list item", () => {
        const { container } = render(
            <AppointmentCard
                nombre="Test"
                consultorio="101"
                variant="waiting"
            />
        );

        expect(container.querySelector("li")).toBeInTheDocument();
    });
});
