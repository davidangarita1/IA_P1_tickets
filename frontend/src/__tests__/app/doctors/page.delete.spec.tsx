import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoctorsPage from '@/app/doctors/page';
import { buildDoctor, mockDoctorService } from '@/__tests__/mocks/factories';
import type { Doctor } from '@/domain/Doctor';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/providers/DependencyProvider', () => ({
  useDeps: jest.fn(),
}));

jest.mock('@/hooks/useDoctors', () => ({
  useDoctors: jest.fn(),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/components/Toast/Toast', () => ({
  __esModule: true,
  default: function MockToast() {
    return null;
  },
}));

jest.mock('@/components/DoctorFormModal/DoctorFormModal', () => ({
  __esModule: true,
  default: function MockDoctorFormModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="doctor-form-modal">
        <button onClick={onClose}>close-modal</button>
      </div>
    );
  },
}));

jest.mock('@/components/DoctorEditModal/DoctorEditModal', () => ({
  __esModule: true,
  default: function MockDoctorEditModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="doctor-edit-modal">
        <button onClick={onClose}>close-edit-modal</button>
      </div>
    );
  },
}));

jest.mock('@/components/ConfirmDeleteModal/ConfirmDeleteModal', () => ({
  __esModule: true,
  default: function MockConfirmDeleteModal({
    doctorName,
    onCancel,
    onConfirm,
  }: {
    doctorName: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
  }) {
    return (
      <div data-testid="confirm-delete-modal">
        <span data-testid="delete-modal-doctor">{doctorName}</span>
        <button onClick={onCancel}>cancel-delete</button>
        <button onClick={onConfirm}>confirm-delete</button>
      </div>
    );
  },
}));

import { useAuth } from '@/providers/AuthProvider';
import { useDeps } from '@/providers/DependencyProvider';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/useToast';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseDoctors = useDoctors as jest.MockedFunction<typeof useDoctors>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockRemove = jest.fn();
const mockRefresh = jest.fn();
const mockShowToast = jest.fn();

function setupAuth(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated ? { id: '1', email: 'u@u.com', name: 'User', role: 'employee' } : null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated,
    hasRole: jest.fn().mockReturnValue(true),
  });
}

function setupDoctors(doctors: Doctor[] = [], loading = false, error: string | null = null) {
  mockUseDoctors.mockReturnValue({
    doctors,
    total: doctors.length,
    loading,
    error,
    create: jest.fn(),
    update: jest.fn(),
    remove: mockRemove,
    refresh: mockRefresh,
  });
}

function setupDeps() {
  mockUseDeps.mockReturnValue({
    ticketWriter: { createTicket: jest.fn() },
    ticketReader: { getTickets: jest.fn() },
    realTime: { connect: jest.fn(), disconnect: jest.fn(), isConnected: jest.fn() },
    audio: { init: jest.fn(), unlock: jest.fn(), play: jest.fn(), isEnabled: jest.fn() },
    sanitizer: { sanitize: jest.fn((s: string) => s) },
    authService: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    doctorService: mockDoctorService(),
  });
}

function setupToast() {
  mockUseToast.mockReturnValue({
    message: null,
    type: 'success',
    visible: false,
    show: mockShowToast,
    hide: jest.fn(),
  });
}

describe('DoctorsPage - delete actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth(true);
    setupDeps();
    setupDoctors();
    setupToast();
  });

  it('renders delete icon button for each doctor row', () => {
    const doctor = buildDoctor({ name: 'Juan García' });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getByLabelText(/dar de baja.*juan garcía/i)).toBeInTheDocument();
  });

  it('opens confirm delete modal when delete icon is clicked', () => {
    const doctor = buildDoctor({ name: 'Juan García' });
    setupDoctors([doctor]);

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*juan garcía/i));

    expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument();
    expect(screen.getByTestId('delete-modal-doctor')).toHaveTextContent('Juan García');
  });

  it('passes correct doctor name to confirm modal', () => {
    const doctor = buildDoctor({ name: 'Pedro López' });
    setupDoctors([doctor]);

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*pedro lópez/i));

    expect(screen.getByTestId('delete-modal-doctor')).toHaveTextContent('Pedro López');
  });

  it('closes confirm delete modal when cancel is triggered', () => {
    const doctor = buildDoctor({ name: 'Juan García' });
    setupDoctors([doctor]);

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*juan garcía/i));
    expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('cancel-delete'));

    expect(screen.queryByTestId('confirm-delete-modal')).not.toBeInTheDocument();
  });

  it('calls remove and shows success toast on confirm', async () => {
    const doctor = buildDoctor({ _id: 'doc-1', name: 'Juan García' });
    setupDoctors([doctor]);
    mockRemove.mockResolvedValue(undefined);

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*juan garcía/i));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith('doc-1');
    });
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Médico dado de baja exitosamente',
        'success',
        5000,
      );
    });
  });

  it('shows error toast when remove fails with Error', async () => {
    const doctor = buildDoctor({ name: 'Juan García' });
    setupDoctors([doctor]);
    mockRemove.mockRejectedValue(new Error('No se puede dar de baja'));

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*juan garcía/i));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('No se puede dar de baja', 'error', 5000);
    });
  });

  it('shows generic error toast when remove fails with non-Error', async () => {
    const doctor = buildDoctor({ name: 'Juan García' });
    setupDoctors([doctor]);
    mockRemove.mockRejectedValue('unexpected');

    render(<DoctorsPage />);
    fireEvent.click(screen.getByLabelText(/dar de baja.*juan garcía/i));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error al dar de baja', 'error', 5000);
    });
  });
});
