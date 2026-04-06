import React from "react";
import { render, screen } from "@testing-library/react";
import DoctorsPage from "@/app/doctors/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/providers/AuthProvider";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

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

describe("DoctorsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth(true);
  });

  it("renders page title centered", () => {
    render(<DoctorsPage />);

    const title = screen.getByRole("heading", { name: /gestión de médicos/i });
    expect(title).toBeInTheDocument();
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

  it("shows empty state message when no doctors exist", () => {
    render(<DoctorsPage />);

    expect(screen.getByText("No hay médicos creados")).toBeInTheDocument();
  });

  it("'Crear médico' button is disabled until HU-02 is implemented", () => {
    render(<DoctorsPage />);

    const button = screen.getByRole("button", { name: /crear médico/i });
    expect(button).toBeDisabled();
  });

  it("wraps content with AuthGuard", () => {
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
});
