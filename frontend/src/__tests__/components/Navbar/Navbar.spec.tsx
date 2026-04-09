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
    expect(hrefs).toContain('/request-ticket');
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

  it('applies active class to Solicitar Turno link when on /request-ticket', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/request-ticket');

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

  it('shows Solicitar Turno button in public navbar for unauthenticated users', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/request-ticket');
  });

  it('Solicitar Turno is active when unauthenticated user is on /request-ticket', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/request-ticket');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link.className).toBe('linkActive');
  });

  it('[Validate] unauthenticated user can see Solicitar Turno without needing to know the URL', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Solicitar Turno' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/request-ticket');
  });

  it('public navbar does not show authenticated-only links', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Historial Turnos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /gestión médicos/i })).not.toBeInTheDocument();
  });

  it('[Validate] authenticated user does not see public-only navbar', () => {
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

  it('renders Turnos button in public navbar for unauthenticated users', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    expect(turnosLinks.some((l) => l.getAttribute('href') === '/')).toBe(true);
  });

  it('Turnos button in public navbar has href /', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/request-ticket');

    render(<Navbar />);

    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    expect(turnosLinks.some((l) => l.getAttribute('href') === '/')).toBe(true);
  });

  it('public navbar shows Turnos, Solicitar Turno and Iniciar Sesion for unauthenticated users', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.getAllByRole('link', { name: 'Turnos' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Solicitar Turno' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('applies active class to Turnos in public navbar when pathname is /', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    const navTurnosLink = turnosLinks.find((l) => l.getAttribute('href') === '/');
    expect(navTurnosLink?.className).toBe('linkActive');
  });

  it('Turnos in public navbar is inactive when on /request-ticket', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/request-ticket');

    render(<Navbar />);

    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    const navTurnosLink = turnosLinks.find((l) => l.getAttribute('href') === '/');
    expect(navTurnosLink?.className).toBe('link');
  });

  it('logo and Turnos button in public navbar are independent links to /', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const logoLink = screen.getByRole('link', { name: /sistema de turnos/i });
    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });

    expect(logoLink).toHaveAttribute('href', '/');
    expect(turnosLinks.some((l) => l.getAttribute('href') === '/')).toBe(true);
    expect(logoLink).not.toBe(turnosLinks[0]);
  });

  it('Turnos button remains visible for authenticated users', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Turnos' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('[Validate] unauthenticated user can navigate to turnos screen via navbar', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    const navTurnosLink = turnosLinks.find((l) => l.getAttribute('href') === '/');
    expect(navTurnosLink).toBeVisible();
    expect(navTurnosLink).toHaveAttribute('href', '/');
  });

  it('[Validate] Turnos button coexists with logo as independent navigation elements in public navbar', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const logoLink = screen.getByRole('link', { name: /sistema de turnos/i });
    const turnosLinks = screen.getAllByRole('link', { name: 'Turnos' });
    const navTurnosLink = turnosLinks.find((l) => l.getAttribute('href') === '/');

    expect(logoLink).toBeVisible();
    expect(navTurnosLink).toBeVisible();
    expect(logoLink).not.toBe(navTurnosLink);
  });

  it('renders Historial Turnos button instead of Dashboard for authenticated users', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Historial Turnos' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('Historial Turnos button has href /dashboard', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Historial Turnos' });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('applies active class to Historial Turnos when on /dashboard', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Historial Turnos' });
    expect(link.className).toBe('linkActive');
  });

  it('Historial Turnos is inactive when on a different route', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Historial Turnos' });
    expect(link.className).toBe('link');
  });

  it('the word Dashboard does not appear anywhere in the authenticated navbar', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    const allLinks = screen.getAllByRole('link');
    const labels = allLinks.map((l) => l.textContent);
    expect(labels.every((label) => !/dashboard/i.test(label ?? ''))).toBe(true);
  });

  it('Historial Turnos is not visible in the public navbar for unauthenticated users', () => {
    setupAuth(false);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Historial Turnos' })).not.toBeInTheDocument();
  });

  it('[Validate] authenticated user sees Historial Turnos and not Dashboard in navbar', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Navbar />);

    const link = screen.getByRole('link', { name: 'Historial Turnos' });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link.className).toBe('linkActive');
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('[Validate] Dashboard text is absent from navbar in all authenticated states', () => {
    setupAuth(true);
    mockUsePathname.mockReturnValue('/');

    render(<Navbar />);

    expect(screen.queryByText(/^dashboard$/i)).not.toBeInTheDocument();
  });
});
