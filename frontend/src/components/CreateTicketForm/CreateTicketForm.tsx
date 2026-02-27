"use client";

import { useState } from "react";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useDeps } from "@/providers/DependencyProvider";
import styles from "@/styles/CreateTicketForm.module.css";

function isNumericOnly(value: string): boolean {
  return /^\d+$/.test(value);
}

export default function CreateTicketForm() {
  const { ticketWriter, sanitizer } = useDeps();
  const { submit, loading, success, error } = useCreateTicket(ticketWriter);

  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");

  const sanitizedName = sanitizer.sanitize(name);
  const sanitizedDocId = sanitizer.sanitize(documentId);

  const docIdTouched = documentId.length > 0;
  const docIdError = docIdTouched && !isNumericOnly(sanitizedDocId)
    ? "La cédula solo puede contener números"
    : null;

  const isFormValid = sanitizedName.length > 0 && sanitizedDocId.length > 0 && isNumericOnly(sanitizedDocId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const validDocId = parseInt(sanitizedDocId, 10);
    const result = await submit({ name: sanitizedName, documentId: validDocId });
    if (result) {
      setName("");
      setDocumentId("");
    }
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
        aria-describedby={docIdError ? "docId-error" : undefined}
      />
      {docIdError && (
        <p id="docId-error" className={styles.error} role="alert">
          {docIdError}
        </p>
      )}

      <button disabled={loading || !isFormValid} className={styles.button}>
        {loading ? "Enviando..." : "Registrar turno"}
      </button>

      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
