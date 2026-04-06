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
  default: function MockDoctorFormModal({
    onClose,
  }: {
    onClose: () => void;
  }) {
    return (
      <div data-testid="doctor-form-modal">
        <button onClick={onClose}>close-modal</button>
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

describe("DoctorsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth(true);
    setupDeps();
    setupDoctors();
    setupToast();
  });

  it("renders page title centered", () => {
    render(<DoctorsPage />);

    expect(
      screen.getByRole("heading", { name: /gestión de médicos/i })
    ).toBeInTheDocument();
  });

  it("renders table with correct column headers", () => {
    render(<DoctorsPage />);

    expect(screen.getByText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByText("Cédula")).toBeInTheDocument();
    expect(screen.getByText("Consultorio")).toBeInTheDocument();
    expect(screen.getByText("Franja Horaria")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("renders 'Crear médico' button", () => {
    render(<DoctorsPage />);

    const button = screen.getByRole("button", { name: /crear médico/i });
    expect(button).toBeInTheDocument();
  });

  it("'Crear médico' button is enabled", () => {
    render(<DoctorsPage />);

    const button = screen.getByRole("button", { name: /crear médico/i });
    expect(button).not.toBeDisabled();
  });

  it("shows empty state message when no doctors exist", () => {
    render(<DoctorsPage />);

    expect(screen.getByText("No hay médicos creados")).toBeInTheDocument();
  });

  it("wraps content with AuthGuard and redirects when unauthenticated", () => {
    setupAuth(false);

    render(<DoctorsPage />);

    expect(mockPush).toHaveBeenCalledWith("/signin");
    expect(
      screen.queryByRole("heading", { name: /gestión de médicos/i })
    ).not.toBeInTheDocument();
  });

  it("renders table element", () => {
    render(<DoctorsPage />);

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders five column headers", () => {
    render(<DoctorsPage />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(5);
  });

  it("shows doctor names with 'Dr.' prefix in table rows", () => {
    const doctor = buildDoctor({ nombre: "Juan García", cedula: "12345678" });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getByText("Dr. Juan García")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
  });

  it("shows consultorio value when it is not null", () => {
    const doctor = buildDoctor({ consultorio: "5" });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 'Sin asignar' when consultorio is null", () => {
    const doctor = buildDoctor({ consultorio: null });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getAllByText("Sin asignar").length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Sin asignar' when franjaHoraria is null", () => {
    const doctor = buildDoctor({ franjaHoraria: null });
    setupDoctors([doctor]);

    render(<DoctorsPage />);

    expect(screen.getAllByText("Sin asignar").length).toBeGreaterThanOrEqual(1);
  });

  it("opens the create doctor modal when button is clicked", () => {
    render(<DoctorsPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear médico/i }));

    expect(screen.getByTestId("doctor-form-modal")).toBeInTheDocument();
  });

  it("closes the modal when the modal triggers onClose", () => {
    render(<DoctorsPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear médico/i }));
    expect(screen.getByTestId("doctor-form-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-modal"));

    expect(screen.queryByTestId("doctor-form-modal")).not.toBeInTheDocument();
  });

  it("shows loading indicator when loading is true", () => {
    setupDoctors([], true);

    render(<DoctorsPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("shows error message when error is set", () => {
    setupDoctors([], false, "Error al cargar médicos.");

    render(<DoctorsPage />);

    expect(screen.getByText("Error al cargar médicos.")).toBeInTheDocument();
  });
});
