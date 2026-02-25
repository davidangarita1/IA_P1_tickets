import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentRegistrationForm from "@/components/AppointmentRegistrationForm/AppointmentRegistrationForm";
import { mockSanitizer, mockTicketWriter } from "@/__tests__/mocks/factories";

jest.mock("@/providers/DependencyProvider", () => ({
  useDeps: jest.fn(),
}));

jest.mock("@/hooks/useCreateTicket", () => ({
  useCreateTicket: jest.fn(),
}));

import { useDeps } from "@/providers/DependencyProvider";
import { useCreateTicket } from "@/hooks/useCreateTicket";

const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseCreateTicket = useCreateTicket as jest.MockedFunction<
  typeof useCreateTicket
>;

function setupMocks(overrides: {
  submit?: jest.Mock;
  loading?: boolean;
  success?: string | null;
  error?: string | null;
}) {
  const sanitizer = mockSanitizer();
  sanitizer.sanitize.mockImplementation((s: string) => s.trim());

  mockUseDeps.mockReturnValue({
    ticketWriter: mockTicketWriter(),
    ticketReader: { getTickets: jest.fn() },
    realTime: {
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(),
    },
    audio: {
      init: jest.fn(),
      unlock: jest.fn(),
      play: jest.fn(),
      isEnabled: jest.fn(),
    },
    sanitizer,
  });

  mockUseCreateTicket.mockReturnValue({
    submit: overrides.submit ?? jest.fn().mockResolvedValue(true),
    loading: overrides.loading ?? false,
    success: overrides.success ?? null,
    error: overrides.error ?? null,
  });
}

describe("AppointmentRegistrationForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it("renders name and ID inputs", () => {
    render(<AppointmentRegistrationForm />);

    expect(
      screen.getByPlaceholderText("Nombre Completo")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ID Card")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<AppointmentRegistrationForm />);

    expect(screen.getByRole("button", { name: "Registrar Turno" })).toBeInTheDocument();
  });

  it("does not call submit when name is empty", async () => {
    const submit = jest.fn().mockResolvedValue(false);
    setupMocks({ submit });

    render(<AppointmentRegistrationForm />);

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submit).not.toHaveBeenCalled();
    });
  });

  it("does not call submit when documentId is not a number", async () => {
    const submit = jest.fn().mockResolvedValue(false);
    setupMocks({ submit });

    render(<AppointmentRegistrationForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre Completo"), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText("ID Card"), {
      target: { value: "not-a-number" },
    });

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submit).not.toHaveBeenCalled();
    });
  });

  it("calls submit with sanitized values on valid input", async () => {
    const submit = jest.fn().mockResolvedValue(true);
    setupMocks({ submit });

    render(<AppointmentRegistrationForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre Completo"), {
      target: { value: "  Carlos  " },
    });
    fireEvent.change(screen.getByPlaceholderText("ID Card"), {
      target: { value: "12345678" },
    });

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        name: "Carlos",
        documentId: 12345678,
      });
    });
  });

  it("shows loading text on button when loading", () => {
    setupMocks({ loading: true });

    render(<AppointmentRegistrationForm />);

    expect(screen.getByRole("button")).toHaveTextContent("Enviando...");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows success message when submission succeeds", () => {
    setupMocks({ success: "Turno registrado correctamente" });

    render(<AppointmentRegistrationForm />);

    expect(
      screen.getByText("Turno registrado correctamente")
    ).toBeInTheDocument();
  });

  it("shows error message when submission fails", () => {
    setupMocks({ error: "No se pudo registrar el turno." });

    render(<AppointmentRegistrationForm />);

    expect(
      screen.getByText("No se pudo registrar el turno.")
    ).toBeInTheDocument();
  });
});
