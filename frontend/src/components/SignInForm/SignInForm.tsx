"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import styles from "@/styles/SignInForm.module.css";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await signIn({ email, password });
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Iniciar sesión</h2>
        {error && <p role="alert" className={styles.error}>{error}</p>}
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
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
        <p className={styles.footer}>
          ¿No tienes cuenta? <Link href="/signup">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
