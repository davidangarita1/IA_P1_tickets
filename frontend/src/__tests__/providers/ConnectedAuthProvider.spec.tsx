import React from "react";
import { render, screen } from "@testing-library/react";
import ConnectedAuthProvider from "@/providers/ConnectedAuthProvider";
import { mockAuthService, mockDoctorService } from "@/__tests__/mocks/factories";

jest.mock("@/providers/DependencyProvider", () => ({
  useDeps: jest.fn(),
}));

jest.mock("@/providers/AuthProvider", () => ({
  AuthProvider: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )),
}));

import { useDeps } from "@/providers/DependencyProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const mockUseDeps = useDeps as jest.MockedFunction<typeof useDeps>;
const MockAuthProvider = AuthProvider as jest.MockedFunction<typeof AuthProvider>;

describe("ConnectedAuthProvider", () => {
  const fakeAuthService = mockAuthService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeps.mockReturnValue({
      ticketWriter: { createTicket: jest.fn() },
      ticketReader: { getTickets: jest.fn() },
      realTime: { connect: jest.fn(), disconnect: jest.fn(), isConnected: jest.fn() },
      audio: { init: jest.fn(), unlock: jest.fn(), play: jest.fn(), isEnabled: jest.fn() },
      sanitizer: { sanitize: jest.fn((s: string) => s) },
      authService: fakeAuthService,
      doctorService: mockDoctorService(),
    });
  });

  it("renders children inside AuthProvider", () => {
    render(
      <ConnectedAuthProvider>
        <span data-testid="child">Hello</span>
      </ConnectedAuthProvider>
    );

    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("passes authService from DependencyProvider to AuthProvider", () => {
    render(
      <ConnectedAuthProvider>
        <span>child</span>
      </ConnectedAuthProvider>
    );

    expect(MockAuthProvider).toHaveBeenCalledWith(
      expect.objectContaining({ authService: fakeAuthService }),
      undefined
    );
  });
});
