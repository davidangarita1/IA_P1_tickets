"use client";

import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error";
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type, visible, onHide }: ToastProps) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`${styles.toast} ${type === "error" ? styles.error : styles.success}`}
    >
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={onHide}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
