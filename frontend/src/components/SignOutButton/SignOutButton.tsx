"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleClick = async () => {
    await signOut();
    router.push("/signIn");
  };

  return (
    <button type="button" onClick={handleClick}>
      Cerrar sesión
    </button>
  );
}
