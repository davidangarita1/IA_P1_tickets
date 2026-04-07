"use client";

import styles from "./ConfirmDeleteModal.module.css";

interface ConfirmDeleteModalProps {
  doctorName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmDeleteModal({
  doctorName,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className={styles.overlay}
      data-testid="confirm-delete-overlay"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>Confirmar baja</h2>
        <p className={styles.message}>
          ¿Está seguro de que desea dar de baja al Dr. {doctorName}? Esta acción
          lo eliminará de la lista de médicos activos.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
