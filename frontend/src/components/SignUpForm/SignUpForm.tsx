"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useDeps } from "@/providers/DependencyProvider";
import styles from "@/styles/SignUpForm.module.css";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, loading, error } = useAuth();
  const { sanitizer } = useDeps();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedName = sanitizer.sanitize(name);
    const sanitizedEmail = sanitizer.sanitize(email);
    const trimmedPassword = password.trim();
    if (!sanitizedName || !sanitizedEmail || !trimmedPassword) return;

    const success = await signUp({ name: sanitizedName, email: sanitizedEmail, password: trimmedPassword, role: "employee" });
    if (success) {
      router.push("/signin");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Crear cuenta</h2>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p className={styles.footer}>
          ¿Ya tienes cuenta? <Link href="/signin">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
