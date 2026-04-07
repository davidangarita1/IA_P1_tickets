import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DoctorsPage from "@/app/doctors/page";
import { buildDoctor, mockDoctorService } from "@/__tests__/mocks/factories";
import type { Doctor } from "@/domain/Doctor";

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

jest.mock("@/hooks/useDoctors", () => ({
  useDoctors: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/components/Toast/Toast", () => ({
  __esModule: true,
  default: function MockToast() {
    return null;
  },
}));

jest.mock("@/components/DoctorFormModal/DoctorFormModal", () => ({
  __esModule: true,
  default: function MockDoctorFormModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="doctor-form-modal">
        <button onClick={onClose}>close-modal</button>
      </div>
    );
  },
}));

jest.mock("@/components/DoctorEditModal/DoctorEditModal", () => ({
  __esModule: true,
  default: function MockDoctorEditModal({
    onClose,
    doctor,
  }: {
    onClose: () => void;
    doctor: Doctor;
  }) {
    return (
      <div data-testid="doctor-edit-modal">
        <span data-testid="edit-modal-doctor">{doctor.name}</span>
        <button onClick={onClose}>close-edit-modal</button>
      </div>
    );
  },
}));

import { useAuth } from "@/providers/AuthProvider";
import { useDeps } from "@/providers/DependencyProvider";
import { useDoctors } from "@/hooks/useDoctors";
import { useToast } from "@/hooks/useToast";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const mockUseDoctors = useDoctors as jest.MockedFunction<typeof useDoctors>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

function setupAuth(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated
      ? { id: "1", email: "u@u.com", name: "User", role: "employee" }
      : null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated,
    hasRole: jest.fn().mockReturnValue(true),
  });
}

function setupDoctors(
  doctors: Doctor[] = [],
  loading = false,
  error: string | null = null
) {
  mockUseDoctors.mockReturnValue({
    doctors,
    loading,
    error,
    create: jest.fn(),
    update: jest.fn(),
    refresh: jest.fn(),
  });
}

function setupDeps() {
  mockUseDeps.mockReturnValue({
    ticketWriter: { createTicket: jest.fn() },
    ticketReader: { getTickets: jest.fn() },
    realTime: { connect: jest.fn(), disconnect: jest.fn(), isConnected: jest.fn() },
    audio: { init: jest.fn(), unlock: jest.fn(), play: jest.fn(), isEnabled: jest.fn() },
    sanitizer: { sanitize: jest.fn((s: string) => s) },
    authService: { signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn(), getSession: jest.fn() },
    doctorService: mockDoctorService(),
  });
}

function setupToast() {
  mockUseToast.mockReturnValue({
    message: null,
    type: "success",
    visible: false,
    show: jest.fn(),
    hide: jest.fn(),
  });
}

describe("DoctorsPage - edit actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth(true);
    setupDeps();
    setupDoctors();
    setupToast();
  });

  it("renders edit icon button in each doctor row", () => {
    const doctor = buildDoctor({ name: "Juan García" });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getByLabelText(/editar.*juan garcía/i)).toBeInTheDocument();
  });

  it("opens edit modal when edit icon is clicked", () => {
    const doctor = buildDoctor({ name: "Juan García" });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    fireEvent.click(screen.getByLabelText(/editar.*juan garcía/i));

    expect(screen.getByTestId("doctor-edit-modal")).toBeInTheDocument();
    expect(screen.getByTestId("edit-modal-doctor")).toHaveTextContent("Juan García");
  });

  it("closes edit modal when onClose is triggered", () => {
    const doctor = buildDoctor({ name: "Juan García" });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    fireEvent.click(screen.getByLabelText(/editar.*juan garcía/i));
    expect(screen.getByTestId("doctor-edit-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-edit-modal"));
    expect(screen.queryByTestId("doctor-edit-modal")).not.toBeInTheDocument();
  });
});
