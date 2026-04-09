'use client';

import { useEffect, useRef } from 'react';
import { useTicketsWebSocket } from '@/hooks/useTicketsWebSocket';
import { useAudioNotification } from '@/hooks/useAudioNotification';
import { useDeps } from '@/providers/DependencyProvider';
import styles from '@/styles/page.module.css';

export default function TicketsScreen() {
  const { realTime, audio } = useDeps();
  const { tickets, error, connected } = useTicketsWebSocket(realTime);
  const { audioEnabled, showToast, toastMessage, notify } = useAudioNotification(audio);

  const lastCountRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      lastCountRef.current = tickets.length;
      if (tickets.length > 0) {
        initializedRef.current = true;
      }
      return;
    }

    if (tickets.length > lastCountRef.current) {
      notify('🔔 Nuevo turno llamado');
    }

    lastCountRef.current = tickets.length;
  }, [tickets, notify]);

  const calledTickets = tickets.filter((t) => t.status === 'called');
  const waitingTickets = tickets.filter((t) => t.status === 'waiting');

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Turnos Habilitados</h1>

      <p
        data-testid="connection-indicator"
        className={connected ? styles.connected : styles.disconnected}
      >
        <span
          data-testid="connection-dot"
          className={connected ? styles.dotConnected : styles.dotDisconnected}
          aria-hidden="true"
        />
        {connected ? 'Conectado en tiempo real' : 'Desconectado — reconectando...'}
      </p>

      {!audioEnabled && (
        <p className={styles.audioHint}>Toca la pantalla para habilitar el sonido 🔔</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {calledTickets.length > 0 && (
        <>
          <h2 data-testid="called-section-header" className={styles.sectionTitle}>
            <svg
              data-testid="icon-megaphone"
              className={styles.sectionIcon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11l18-5v12L3 13v-2z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
            Turnos Llamados
          </h2>
          <ul className={styles.list}>
            {calledTickets.map((t) => (
              <li
                key={t.id}
                data-testid={`ticket-card-${t.id}`}
                className={`${styles.item} ${styles.highlight}`}
              >
                <span className={styles.calledName}>{t.name}</span>
                <span className={styles.office}>
                  <svg
                    data-testid="icon-office"
                    className={styles.officeIcon}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Consultorio {t.office}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {waitingTickets.length > 0 && (
        <>
          <h2 data-testid="waiting-section-header" className={styles.sectionTitle}>
            <svg
              data-testid="icon-clock"
              className={styles.sectionIcon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            En Espera
          </h2>
          <ul className={styles.list}>
            {waitingTickets.map((t) => (
              <li
                key={t.id}
                data-testid={`ticket-card-${t.id}`}
                className={`${styles.item} ${styles.waitingItem}`}
              >
                <span className={styles.name}>{t.name}</span>
                <span className={styles.muted}>Sin consultorio</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {tickets.length === 0 && !error && (
        <div data-testid="empty-state" className={styles.emptyState}>
          <svg
            data-testid="empty-icon"
            className={styles.emptyIcon}
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v16.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h10.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V7.5L15.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <p className={styles.emptyText}>No hay turnos registrados</p>
        </div>
      )}

      {showToast && <div className={styles.toast}>{toastMessage}</div>}
    </main>
  );
}
