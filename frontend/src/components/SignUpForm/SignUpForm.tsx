"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/domain/User";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const success = await signUp({ name, email, password, role });
    if (success) {
      router.push("/signIn");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>
      <button type="submit" disabled={loading}>
        Registrarse
      </button>
    </form>
  );
}
