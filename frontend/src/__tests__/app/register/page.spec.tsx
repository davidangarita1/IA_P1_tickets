import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/register/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
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

beforeEach(() => {
  mockUseDeps.mockReturnValue({
    ticketWriter: { createTicket: jest.fn() },
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
    sanitizer: { sanitize: jest.fn((s: string) => s) },
  });

  mockUseCreateTicket.mockReturnValue({
    submit: jest.fn(),
    loading: false,
    success: null,
    error: null,
  });
});

describe("RegisterPage", () => {
  it("renders the CreateTicketForm", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Registro de Paciente")).toBeInTheDocument();
  });

  it("renders the name input from CreateTicketForm", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument();
  });

  it("renders the documentId input from CreateTicketForm", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Cédula")).toBeInTheDocument();
  });
});
