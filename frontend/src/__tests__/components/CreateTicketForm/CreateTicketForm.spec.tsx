import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTicketForm from "@/components/CreateTicketForm/CreateTicketForm";
import { mockSanitizer, mockTicketWriter } from "@/__tests__/mocks/factories";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

describe("CreateTicketForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it("renders name and documentId inputs", () => {
    render(<CreateTicketForm />);

    expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Cédula")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<CreateTicketForm />);

    expect(
      screen.getByRole("button", { name: "Registrar turno" })
    ).toBeInTheDocument();
  });

  it("does not call submit when name is empty", async () => {
    const submit = jest.fn().mockResolvedValue(false);
    setupMocks({ submit });

    render(<CreateTicketForm />);

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submit).not.toHaveBeenCalled();
    });
  });

  it("does not call submit when documentId is not a valid number", async () => {
    const submit = jest.fn().mockResolvedValue(false);
    setupMocks({ submit });

    render(<CreateTicketForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre completo"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "abc" },
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

    render(<CreateTicketForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre completo"), {
      target: { value: "  Maria  " },
    });
    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "98765432" },
    });

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        name: "Maria",
        documentId: 98765432,
      });
    });
  });

  it("clears the form on successful submission", async () => {
    const submit = jest.fn().mockResolvedValue(true);
    setupMocks({ submit });

    render(<CreateTicketForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre completo"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "12345678" },
    });

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Nombre completo")).toHaveValue("");
      expect(screen.getByPlaceholderText("Cédula")).toHaveValue("");
    });
  });

  it("does not clear the form when submission fails", async () => {
    const submit = jest.fn().mockResolvedValue(false);
    setupMocks({ submit });

    render(<CreateTicketForm />);

    fireEvent.change(screen.getByPlaceholderText("Nombre completo"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "12345678" },
    });

    const form = screen.getByRole("button").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Nombre completo")).toHaveValue("Maria");
      expect(screen.getByPlaceholderText("Cédula")).toHaveValue("12345678");
    });
  });

  it("shows inline error when documentId is not purely numeric", async () => {
    setupMocks({});
    render(<CreateTicketForm />);

    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "abc" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("La cédula solo puede contener números")
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Cédula"), {
      target: { value: "12ab34" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("La cédula solo puede contener números")
      ).toBeInTheDocument();
    });
  });

  it("submit button is disabled when form is incomplete", () => {
    setupMocks({});
    render(<CreateTicketForm />);

    const button = screen.getByRole("button", { name: "Registrar turno" });
    expect(button).toBeDisabled();
  });

  it("shows loading text on button when loading", () => {
    setupMocks({ loading: true });

    render(<CreateTicketForm />);

    expect(screen.getByRole("button")).toHaveTextContent("Enviando...");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows success message", () => {
    setupMocks({ success: "Turno registrado correctamente" });

    render(<CreateTicketForm />);

    expect(
      screen.getByText("Turno registrado correctamente")
    ).toBeInTheDocument();
  });

  it("shows error message", () => {
    setupMocks({ error: "No se pudo registrar el turno." });

    render(<CreateTicketForm />);

    expect(
      screen.getByText("No se pudo registrar el turno.")
    ).toBeInTheDocument();
  });
});
