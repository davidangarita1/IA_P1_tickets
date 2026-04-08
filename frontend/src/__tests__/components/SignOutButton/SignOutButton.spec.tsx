import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignOutButton from '@/components/SignOutButton/SignOutButton';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/providers/AuthProvider';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setupMocks(options: { signOut?: jest.Mock }) {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: options.signOut ?? jest.fn().mockResolvedValue(undefined),
    isAuthenticated: true,
    hasRole: jest.fn().mockReturnValue(false),
  });
}

describe('SignOutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it('renders a sign-out button', () => {
    render(<SignOutButton />);

    expect(
      screen.getByRole('button', { name: /cerrar sesión|sign out|logout/i }),
    ).toBeInTheDocument();
  });

  it('calls useAuth().signOut when clicked', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    setupMocks({ signOut });

    render(<SignOutButton />);

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión|sign out|logout/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('redirects to /signIn after sign out', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    setupMocks({ signOut });

    render(<SignOutButton />);

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión|sign out|logout/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('does not redirect before sign out completes', () => {
    let resolveSignOut: () => void;
    const signOut = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignOut = resolve;
        }),
    );
    setupMocks({ signOut });

    render(<SignOutButton />);

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión|sign out|logout/i }));

    expect(mockPush).not.toHaveBeenCalled();

    resolveSignOut!();
  });
});
