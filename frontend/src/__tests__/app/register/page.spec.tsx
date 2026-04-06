import RegisterPage from "@/app/register/page";
import { render, screen } from "@testing-library/react";

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

import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useDeps } from "@/providers/DependencyProvider";
import { mockDoctorService } from "@/__tests__/mocks/factories";

const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseCreateTicket = useCreateTicket as jest.MockedFunction<
  typeof useCreateTicket
>;

beforeEach(() => {
  jest.clearAllMocks();

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
    authService: { signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn(), getSession: jest.fn() },
    doctorService: mockDoctorService(),
  });

  mockUseCreateTicket.mockReturnValue({
    submit: jest.fn(),
    loading: false,
    success: null,
    error: null,
  });
});

describe("RegisterPage", () => {
  it("[Validate] is publicly accessible — renders without requiring authentication", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Registro de Paciente")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
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
