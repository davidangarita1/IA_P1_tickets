import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInForm from "@/components/SignInForm/SignInForm";

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

import { useAuth } from "@/providers/AuthProvider";
import { useDeps } from "@/providers/DependencyProvider";
import { mockSanitizer } from "@/__tests__/mocks/factories";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;

function setupMocks(options: {
  signIn?: jest.Mock;
  loading?: boolean;
  error?: string | null;
}) {
  const sanitizer = mockSanitizer();

  mockUseDeps.mockReturnValue({
    ticketWriter: { createTicket: jest.fn() },
    ticketReader: { getTickets: jest.fn() },
    realTime: { connect: jest.fn(), disconnect: jest.fn(), isConnected: jest.fn() },
    audio: { init: jest.fn(), unlock: jest.fn(), play: jest.fn(), isEnabled: jest.fn() },
    sanitizer,
    authService: { signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn(), getSession: jest.fn() },
  });

  mockUseAuth.mockReturnValue({
    user: null,
    loading: options.loading ?? false,
    error: options.error ?? null,
    signIn: options.signIn ?? jest.fn().mockResolvedValue(true),
    signUp: jest.fn().mockResolvedValue(true),
    signOut: jest.fn(),
    isAuthenticated: false,
    hasRole: jest.fn().mockReturnValue(false),
  });
}

describe("SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it("renders email and password inputs", () => {
    render(<SignInForm />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña|password/i)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<SignInForm />);

    expect(screen.getByRole("button", { name: /iniciar sesión|sign in/i })).toBeInTheDocument();
  });

  it("does not call signIn when email is empty", async () => {
    const signIn = jest.fn().mockResolvedValue(false);
    setupMocks({ signIn });

    render(<SignInForm />);

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signIn).not.toHaveBeenCalled();
    });
  });

  it("does not call signIn when password is empty", async () => {
    const signIn = jest.fn().mockResolvedValue(false);
    setupMocks({ signIn });

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@test.com" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signIn).not.toHaveBeenCalled();
    });
  });

  it("calls signIn with email and password on valid submission", async () => {
    const signIn = jest.fn().mockResolvedValue(true);
    setupMocks({ signIn });

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "secret123" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "secret123",
      });
    });
  });

  it("redirects to /dashboard after successful signIn", async () => {
    const signIn = jest.fn().mockResolvedValue(true);
    setupMocks({ signIn });

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "secret123" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not redirect when signIn returns false", async () => {
    const signIn = jest.fn().mockResolvedValue(false);
    setupMocks({ signIn });

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "wrong" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("shows loading state on button while submitting", () => {
    setupMocks({ loading: true });

    render(<SignInForm />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows error message when signIn fails", () => {
    setupMocks({ error: "Credenciales inválidas" });

    render(<SignInForm />);

    expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("renders the form heading", () => {
    render(<SignInForm />);

    expect(screen.getByText("Iniciar sesión", { selector: "h2" })).toBeInTheDocument();
  });

  it("renders a registration link", () => {
    render(<SignInForm />);

    const link = screen.getByText("Regístrate");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("shows loading text on button while loading", () => {
    setupMocks({ loading: true });

    render(<SignInForm />);

    expect(screen.getByRole("button")).toHaveTextContent("Ingresando...");
  });
});
