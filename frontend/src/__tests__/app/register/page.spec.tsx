import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/register/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/providers/DependencyProvider", () => ({
  useDeps: jest.fn(),
}));

jest.mock("@/hooks/useCreateTicket", () => ({
  useCreateTicket: jest.fn(),
}));

import { useDeps } from "@/providers/DependencyProvider";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useAuth } from "@/providers/AuthProvider";

const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseCreateTicket = useCreateTicket as jest.MockedFunction<
  typeof useCreateTicket
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

beforeEach(() => {
  jest.clearAllMocks();

  mockUseAuth.mockReturnValue({
    user: { id: "1", email: "a@a.com", name: "Test", role: "admin" },
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated: true,
    hasRole: jest.fn(() => true),
  });

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
  it("renders the CreateTicketForm when authenticated", () => {
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

  it("redirects to /signin when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false,
      hasRole: jest.fn(() => false),
    });

    render(<RegisterPage />);

    expect(mockPush).toHaveBeenCalledWith("/signin");
  });

  it("does not render content when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false,
      hasRole: jest.fn(() => false),
    });

    render(<RegisterPage />);

    expect(screen.queryByText("Registro de Paciente")).not.toBeInTheDocument();
  });
});
