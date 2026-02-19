"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/Navbar.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Turnos" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/register", label: "Registro" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        Sistema de <span>Turnos</span>
      </div>
      <div className={styles.links}>
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.linkActive : styles.link}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
