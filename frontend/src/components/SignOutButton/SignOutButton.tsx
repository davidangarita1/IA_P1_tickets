'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import styles from '@/styles/Navbar.module.css';

export default function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleClick = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <button type="button" onClick={handleClick} className={styles.signOutBtn}>
      Cerrar sesión
    </button>
  );
}
