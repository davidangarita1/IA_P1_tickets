"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/domain/User";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/signIn");
      return;
    }

    if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
      router.push("/");
    }
  }, [isAuthenticated, loading, allowedRoles, hasRole, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) return null;

  return <>{children}</>;
}
