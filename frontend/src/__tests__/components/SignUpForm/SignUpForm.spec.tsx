import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpForm from "@/components/SignUpForm/SignUpForm";

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
  signUp?: jest.Mock;
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
    signIn: jest.fn().mockResolvedValue(false),
    signUp: options.signUp ?? jest.fn().mockResolvedValue(true),
    signOut: jest.fn(),
    isAuthenticated: false,
    hasRole: jest.fn().mockReturnValue(false),
  });
}

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it("renders name, email and password inputs", () => {
    render(<SignUpForm />);

    expect(screen.getByPlaceholderText(/nombre|name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña|password/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<SignUpForm />);

    expect(screen.getByRole("button", { name: /registrarse|sign up/i })).toBeInTheDocument();
  });

  it("does not call signUp when name is empty", async () => {
    const signUp = jest.fn().mockResolvedValue(false);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signUp).not.toHaveBeenCalled();
    });
  });

  it("does not call signUp when email is empty", async () => {
    const signUp = jest.fn().mockResolvedValue(false);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), {
      target: { value: "Ana" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signUp).not.toHaveBeenCalled();
    });
  });

  it("does not call signUp when password is empty", async () => {
    const signUp = jest.fn().mockResolvedValue(false);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "ana@test.com" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signUp).not.toHaveBeenCalled();
    });
  });

  it("calls signUp with all form values on valid submission", async () => {
    const signUp = jest.fn().mockResolvedValue(true);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), {
      target: { value: "Ana García" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "ana@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "pass1234" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        name: "Ana García",
        email: "ana@test.com",
        password: "pass1234",
        role: "employee",
      });
    });
  });

  it("redirects to /signIn after successful signUp", async () => {
    const signUp = jest.fn().mockResolvedValue(true);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "ana@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "pass1234" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
    });
  });

  it("does not redirect when signUp returns false", async () => {
    const signUp = jest.fn().mockResolvedValue(false);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "dup@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), {
      target: { value: "pass1234" },
    });

    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("shows error message when signUp fails", () => {
    setupMocks({ error: "El correo ya está registrado" });

    render(<SignUpForm />);

    expect(screen.getByText("El correo ya está registrado")).toBeInTheDocument();
  });

  it("shows loading state on button while submitting", () => {
    setupMocks({ loading: true });

    render(<SignUpForm />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders the form heading", () => {
    render(<SignUpForm />);

    expect(screen.getByText("Crear cuenta", { selector: "h2" })).toBeInTheDocument();
  });

  it("renders a sign-in link", () => {
    render(<SignUpForm />);

    const link = screen.getByText("Inicia sesión");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/signin");
  });

  it("shows loading text on button while loading", () => {
    setupMocks({ loading: true });

    render(<SignUpForm />);

    expect(screen.getByRole("button")).toHaveTextContent("Registrando...");
  });

  it("always sends role as employee", async () => {
    const signUp = jest.fn().mockResolvedValue(true);
    setupMocks({ signUp });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText(/nombre|name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña|password/i), { target: { value: "pass" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ role: "employee" }));
    });
  });
});
