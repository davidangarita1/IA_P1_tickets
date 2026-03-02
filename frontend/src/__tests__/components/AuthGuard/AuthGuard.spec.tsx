import React from "react";
import { render, screen } from "@testing-library/react";
import AuthGuard from "@/components/AuthGuard/AuthGuard";
import { buildUser } from "@/__tests__/mocks/factories";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/providers/AuthProvider";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setupAuth(options: {
  isAuthenticated?: boolean;
  loading?: boolean;
  role?: "admin" | "employee";
}) {
  const user = options.isAuthenticated
    ? buildUser({ role: options.role ?? "employee" })
    : null;

  mockUseAuth.mockReturnValue({
    user,
    loading: options.loading ?? false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated: options.isAuthenticated ?? false,
    hasRole: jest.fn((role) => user?.role === role),
  });
}

describe("AuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when user is authenticated", () => {
    setupAuth({ isAuthenticated: true });

    render(
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("[Validate] redirects to /signin when user is not authenticated", () => {
    setupAuth({ isAuthenticated: false });

    render(
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith("/signin");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("shows a loading indicator while authentication is resolving", () => {
    setupAuth({ loading: true });

    render(
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when user has an allowed role", () => {
    setupAuth({ isAuthenticated: true, role: "admin" });

    render(
      <AuthGuard allowedRoles={["admin"]}>
        <p>Admin section</p>
      </AuthGuard>
    );

    expect(screen.getByText("Admin section")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("[Validate] redirects to / when authenticated user lacks the required role", () => {
    setupAuth({ isAuthenticated: true, role: "employee" });

    render(
      <AuthGuard allowedRoles={["admin"]}>
        <p>Admin only</p>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Admin only")).not.toBeInTheDocument();
  });

  it("renders children when user has one of multiple allowed roles", () => {
    setupAuth({ isAuthenticated: true, role: "employee" });

    render(
      <AuthGuard allowedRoles={["admin", "employee"]}>
        <p>Shared section</p>
      </AuthGuard>
    );

    expect(screen.getByText("Shared section")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not redirect when allowedRoles is not specified and user is authenticated", () => {
    setupAuth({ isAuthenticated: true });

    render(
      <AuthGuard>
        <p>Any authenticated user</p>
      </AuthGuard>
    );

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText("Any authenticated user")).toBeInTheDocument();
  });
});
