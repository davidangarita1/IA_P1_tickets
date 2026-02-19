"use client";

import { useState } from "react";
import { useCreateTicket } from "@/hooks/useCreateTicket";
import { useDeps } from "@/providers/DependencyProvider";
import styles from "@/styles/AppointmentRegistrationForm.module.css";

export default function AppointmentRegistrationForm() {
    const { ticketWriter, sanitizer } = useDeps();
    const { submit, loading, success, error } = useCreateTicket(ticketWriter);

    const [name, setName] = useState("");
    const [idCard, setIdCard] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const safeName = sanitizer.sanitize(name);
        const safeIdCard = sanitizer.sanitize(idCard);

        const validIdCard = parseInt(safeIdCard, 10);
        if (!safeName || isNaN(validIdCard)) return;

        await submit({ name: safeName, documentId: validIdCard });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Registro de Turnos</h2>

            <input
                type="text"
                placeholder="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
            />

            <input
                type="text"
                placeholder="ID Card"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                className={styles.input}
            />

            <button disabled={loading} className={styles.button}>
                {loading ? "Enviando..." : "Registrar Turno"}
            </button>

            {success && <p className={styles.success}>{success}</p>}
            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
}
