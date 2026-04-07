'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useDeps } from '@/providers/DependencyProvider';

export default function ConnectedAuthProvider({ children }: { children: ReactNode }) {
  const { authService } = useDeps();
  return <AuthProvider authService={authService}>{children}</AuthProvider>;
}
