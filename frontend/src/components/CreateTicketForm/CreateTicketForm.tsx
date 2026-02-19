"use client";

import { useState } from "react";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useDeps } from "@/providers/DependencyProvider";
import styles from "@/styles/CreateTicketForm.module.css";

export default function CreateTicketForm() {
  const { ticketWriter, sanitizer } = useDeps();
  const { submit, loading, success, error } = useCreateTicket(ticketWriter);

  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedName = sanitizer.sanitize(name);
    const sanitizedDocId = sanitizer.sanitize(documentId);
    const validDocId = parseInt(sanitizedDocId, 10);

    if (!sanitizedName || isNaN(validDocId)) return;

    await submit({ name: sanitizedName, documentId: validDocId });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Registro de Paciente</h2>

      <input
        type="text"
        placeholder="Nombre completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />

      <input
        type="text"
        placeholder="Cédula"
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
        className={styles.input}
      />

      <button disabled={loading} className={styles.button}>
        {loading ? "Enviando..." : "Registrar turno"}
      </button>

      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
