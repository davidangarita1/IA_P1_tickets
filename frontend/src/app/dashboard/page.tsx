"use client";

import { useEffect, useRef } from "react";
import { useTicketsWebSocket } from "@/hooks/useTicketsWebSocket";
import { useAudioNotification } from "@/hooks/useAudioNotification";
import { useDeps } from "@/providers/DependencyProvider";
import AuthGuard from "@/components/AuthGuard/AuthGuard";
import styles from "@/styles/page.module.css";

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function ServedDashboard() {
  return (
    <AuthGuard>
      <ServedDashboardContent />
    </AuthGuard>
  );
}

function ServedDashboardContent() {
  const { realTime, audio } = useDeps();
  const { tickets, error, connected } = useTicketsWebSocket(realTime);
  const { audioEnabled, showToast, toastMessage, notify } =
    useAudioNotification(audio);

  const lastCountRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const servedCount = tickets.filter((t) => t.status === "served").length;

    if (!initializedRef.current) {
      lastCountRef.current = servedCount;
      if (servedCount > 0) {
        initializedRef.current = true;
      }
      return;
    }

    if (servedCount > (lastCountRef.current ?? 0)) {
      notify("✅ Turno completado");
    }

    lastCountRef.current = servedCount;
  }, [tickets, notify]);

  const servedTickets = tickets
    .filter((t) => t.status === "served")
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Historial de Turnos Atendidos</h1>

      <p className={connected ? styles.connected : styles.disconnected}>
        {connected
          ? "🟢 Conectado en tiempo real"
          : "🔴 Desconectado — reconectando..."}
      </p>

      {!audioEnabled && (
        <p className={styles.audioHint}>
          Toca la pantalla para habilitar el sonido 🔔
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {servedTickets.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>
            ✅ Atendidos ({servedTickets.length})
          </h2>
          <ul className={styles.list}>
            {servedTickets.map((t) => (
              <li key={t.id} className={`${styles.item} ${styles.served}`}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.time}>{formatTime(t.timestamp)}</span>
                <span>Consultorio {t.office}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {servedTickets.length === 0 && !error && (
        <p className={styles.empty}>No hay turnos atendidos</p>
      )}

      {showToast && <div className={styles.toast}>{toastMessage}</div>}
    </main>
  );
}
