"use client";

import { useAppointmentsWebSocket } from "@/hooks/useAppointmentsWebSocket";
import { useAudioNotification } from "@/hooks/useAudioNotification";
import { useNewAppointmentDetector } from "@/hooks/useNewAppointmentDetector";
import { formatTime } from "@/utils/date-formatter";
import AppointmentList from "@/components/AppointmentList/AppointmentList";
import styles from "@/styles/page.module.css";

/**
 * Dashboard for attended appointments — Full history via WebSocket
 * ⚕️ HUMAN CHECK - Refactored: extracted audio, detection, and list rendering
 * into reusable hooks and components (FRONT-B1, FRONT-B4)
 */
export default function AttendedHistoryDashboard() {
  const { appointments, error, connected } = useAppointmentsWebSocket();
  const { audioEnabled, play } = useAudioNotification();

  const attendedCount = appointments.filter(t => t.estado === "atendido").length;
  const { showToast } = useNewAppointmentDetector(attendedCount, play);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Historial de Turnos Atendidos</h1>

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
        status="atendido"
        title="Atendidos"
        icon="✅"
        variant="attended"
        formatTime={formatTime}
        sortDescending
      />

      {attendedCount === 0 && !error && (
        <p className={styles.empty}>No hay turnos atendidos</p>
      )}

      {showToast && (
        <div className={styles.toast}>
          ✅ Turno completado
        </div>
      )}
    </main>
  );
}
