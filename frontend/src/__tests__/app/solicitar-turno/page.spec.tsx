import SolicitarTurnoPage from '@/app/solicitar-turno/page';
import { render, screen } from '@testing-library/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/providers/DependencyProvider', () => ({
  useDeps: jest.fn(),
}));

jest.mock('@/hooks/useCreateTicket', () => ({
  useCreateTicket: jest.fn(),
}));

import { useCreateTicket } from '@/hooks/useCreateTicket';
import { useDeps } from '@/providers/DependencyProvider';
import { mockDoctorService } from '@/__tests__/mocks/factories';

const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseCreateTicket = useCreateTicket as jest.MockedFunction<typeof useCreateTicket>;

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
    authService: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    doctorService: mockDoctorService(),
  });

  mockUseCreateTicket.mockReturnValue({
    submit: jest.fn(),
    loading: false,
    success: null,
    error: null,
  });
});

describe('SolicitarTurnoPage', () => {
  it('[HU-01][Validate] is publicly accessible — renders without requiring authentication', () => {
    render(<SolicitarTurnoPage />);

    expect(screen.getByText('Registro de Paciente')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('[HU-01] renders CreateTicketForm at /solicitar-turno route', () => {
    render(<SolicitarTurnoPage />);

    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Cédula')).toBeInTheDocument();
  });

  it('[HU-01] renders the same form content as the previous /register page', () => {
    render(<SolicitarTurnoPage />);

    expect(screen.getByText('Registro de Paciente')).toBeInTheDocument();
  });
});
