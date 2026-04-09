'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import SignOutButton from '@/components/SignOutButton/SignOutButton';
import styles from '@/styles/Navbar.module.css';

const AUTH_NAV_ITEMS = [
  { href: '/', label: 'Turnos' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/doctors', label: 'Gestión Médicos' },
  { href: '/request-turn', label: 'Request Turn' },
];

const PUBLIC_NAV_ITEMS = [
  { href: '/request-turn', label: 'Request Turn' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Sistema de <span>Turnos</span>
      </Link>
      {isAuthenticated ? (
        <div className={styles.links}>
          {AUTH_NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.linkActive : styles.link}
            >
              {label}
            </Link>
          ))}
          <SignOutButton />
        </div>
      ) : (
        <div className={styles.links}>
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.linkActive : styles.link}
            >
              {label}
            </Link>
          ))}
          <Link href="/signin" className={styles.link}>
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
