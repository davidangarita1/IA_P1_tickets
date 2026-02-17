"use client";

import { useAppointmentsWebSocket } from "@/hooks/useAppointmentsWebSocket";
import { useAudioNotification } from "@/hooks/useAudioNotification";
import { useNewAppointmentDetector } from "@/hooks/useNewAppointmentDetector";
import AppointmentList from "@/components/AppointmentList/AppointmentList";
import styles from "@/styles/page.module.css";

/**
 * Main Appointments Screen — Real-time via WebSocket
 * ⚕️ HUMAN CHECK - Refactored: extracted audio, detection, and list rendering
 * into reusable hooks and components (FRONT-B1, FRONT-B4)
 */
export default function AppointmentsScreen() {
  const { appointments, error, connected } = useAppointmentsWebSocket();
  const { audioEnabled, play } = useAudioNotification();
  const { showToast } = useNewAppointmentDetector(appointments.length, play);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Turnos Habilitados</h1>

      <p className={connected ? styles.connected : styles.disconnected}>
        {connected ? "🟢 Conectado en tiempo real" : "🔴 Desconectado — reconectando..."}
      </p>

      {!audioEnabled && (
        <p className={styles.audioHint}>
          Toca la pantalla para habilitar el sonido 🔔
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <AppointmentList
        appointments={appointments}
        status="llamado"
        title="Called"
        icon="📢"
        variant="called"
      />

      <AppointmentList
        appointments={appointments}
        status="espera"
        title="Waiting"
        icon="⏳"
        variant="waiting"
      />

      {appointments.length === 0 && !error && (
        <p className={styles.empty}>No hay turnos registrados</p>
      )}

      {showToast && (
        <div className={styles.toast}>
          🔔 Nuevo turno llamado
        </div>
      )}
    </main>
  );
}
