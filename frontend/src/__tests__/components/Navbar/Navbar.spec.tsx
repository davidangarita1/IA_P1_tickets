import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/styles/Navbar.module.css', () => ({
  navbar: 'navbar',
  logo: 'logo',
  links: 'links',
  link: 'link',
  linkActive: 'linkActive',
}));

import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setupAuth(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated ? { id: '1', email: 'u@u.com', name: 'User', role: 'employee' } : null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated,
    hasRole: jest.fn().mockReturnValue(false),
  });
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth(true);
  });

  it('renders all navigation items for authenticated user', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Turnos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Historial Turnos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar Turno' })).toBeInTheDocument();
  });

  it('renders logo text', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.getByText(/Sistema de/i)).toBeInTheDocument();
  });

  it('logo is a link that navigates to /', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const logoLink = screen.getByRole('link', { name: /sistema de turnos/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders correct href for each nav item for authenticated user', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/solicitar-turno');
  });

  it('does not render /register href anywhere in the navbar', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).not.toContain('/register');
  });

  it('does not render the label "Registro" anywhere in the navbar', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Registro' })).not.toBeInTheDocument();
  });

  it('does not render the label "Dashboard" anywhere in the navbar', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('applies active class to the link matching current pathname', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const historialLink = screen.getByRole('link', { name: 'Historial Turnos' });
    expect(historialLink.className).toBe('linkActive');
  });

  it('applies inactive class to links not matching current pathname', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const turnosLink = screen.getByRole('link', { name: 'Turnos' });
    expect(turnosLink.className).toBe('link');
  });

  it('applies active class to Solicitar Turno link when on /solicitar-turno', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/solicitar-turno');

    render(<Navbar />);

    const solicitarLink = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(solicitarLink.className).toBe('linkActive');
  });

  it('does not render SignOutButton when user is not authenticated', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(
      screen.queryByRole('button', { name: /cerrar sesión|sign out|logout/i }),
    ).not.toBeInTheDocument();
  });

  it('renders SignOutButton when user is authenticated', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(
      screen.getByRole('button', { name: /cerrar sesión|sign out|logout/i }),
    ).toBeInTheDocument();
  });

  it('renders Iniciar sesión link when user is not authenticated', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: /iniciar sesión/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/signin');
  });

  it('does not render Iniciar sesión link when user is authenticated', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it("renders 'Gestión Médicos' link for authenticated users", () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: /gestión médicos/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/doctors');
  });

  it("does not render 'Gestión Médicos' link for unauthenticated users", () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: /gestión médicos/i })).not.toBeInTheDocument();
  });

  it("applies active class to 'Gestión Médicos' when on /doctors", () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/doctors');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: /gestión médicos/i });
    expect(link.className).toBe('linkActive');
  });

  it('[HU-01] shows Solicitar Turno button in public navbar for unauthenticated users', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/solicitar-turno');
  });

  it('[HU-01] Solicitar Turno is active when unauthenticated user is on /solicitar-turno', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/solicitar-turno');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link.className).toBe('linkActive');
  });

  it('[HU-01][Validate] unauthenticated user can see Solicitar Turno without needing to know the URL', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/solicitar-turno');
  });

  it('[HU-01] public navbar does not show authenticated-only links', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Historial Turnos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /gestión médicos/i })).not.toBeInTheDocument();
  });

  it('[HU-01][Validate] authenticated user does not see public-only navbar', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Historial Turnos' })).toBeInTheDocument();
  });

  it('renders navigation links when user is authenticated', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Turnos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Historial Turnos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar Turno' })).toBeInTheDocument();
  });
});
