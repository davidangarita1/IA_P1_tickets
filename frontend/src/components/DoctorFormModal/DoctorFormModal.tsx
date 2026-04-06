"use client";

import { useState, useEffect, useCallback } from "react";
import { useAvailableShifts } from "@/hooks/useAvailableShifts";
import type { DoctorService } from "@/domain/ports/DoctorService";
import type { Shift } from "@/domain/Doctor";
import styles from "./DoctorFormModal.module.css";

const OFFICES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface DoctorFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  doctorService: DoctorService;
  showToast: (message: string, type: "success" | "error") => void;
}

function stripNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

export default function DoctorFormModal({
  onClose,
  onSuccess,
  doctorService,
  showToast,
}: DoctorFormModalProps) {
  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [office, setOffice] = useState("");
  const [shift, setShift] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [documentIdTouched, setDocumentIdTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { shifts, loading: shiftsLoading, fetchShifts } = useAvailableShifts(doctorService);

  const nameError =
    nameTouched && name.length > 0 && name.length < 3
      ? "El nombre debe tener mínimo 3 caracteres"
      : nameTouched && name.length === 0
        ? "El nombre completo es obligatorio"
        : null;

  const documentIdError =
    documentIdTouched && documentId.length === 0
      ? "El número de cédula es obligatorio"
      : documentIdTouched && (documentId.length < 7 || documentId.length > 10)
        ? "La cédula debe tener entre 7 y 10 dígitos"
        : null;

  const officeSelected = office !== "";
  const noShiftsAvailable = officeSelected && !shiftsLoading && shifts.length === 0;
  const shiftDisabled = !officeSelected || shiftsLoading || noShiftsAvailable;
  const shiftRequiredError = officeSelected && !shiftDisabled && shift === "";

  const isFormValid =
    name.length >= 3 &&
    documentId.length >= 7 &&
    documentId.length <= 10 &&
    !(officeSelected && shift === "");

  const handleOfficeChange = useCallback(
    (value: string) => {
      setOffice(value);
      setShift("");
      if (value) {
        fetchShifts(value);
      }
    },
    [fetchShifts]
  );

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      await doctorService.create({
        name,
        documentId,
        office: office || null,
        shift: (shift as Shift) || null,
      });
      showToast("Médico creado exitosamente", "success");
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear médico";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.overlay} data-testid="modal-backdrop">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Crear Médico</h2>

        <div className={styles.field}>
          <label htmlFor="doctor-nombre" className={styles.label}>
            Nombre completo
          </label>
          <input
            id="doctor-nombre"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="Nombre completo del médico"
          />
          {nameError && <span className={styles.error}>{nameError}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="doctor-cedula" className={styles.label}>
            Número de cédula
          </label>
          <input
            id="doctor-cedula"
            type="text"
            className={styles.input}
            value={documentId}
            onChange={(e) => setDocumentId(stripNonNumeric(e.target.value))}
            onBlur={() => setDocumentIdTouched(true)}
            placeholder="Número de cédula"
            maxLength={10}
          />
          {documentIdError && <span className={styles.error}>{documentIdError}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="doctor-consultorio" className={styles.label}>
            Consultorio
          </label>
          <select
            id="doctor-consultorio"
            className={styles.select}
            value={office}
            onChange={(e) => handleOfficeChange(e.target.value)}
          >
            <option value="">Seleccionar consultorio</option>
            {OFFICES.map((c) => (
              <option key={c} value={c}>
                Consultorio {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="doctor-franja" className={styles.label}>
            Franja horaria
          </label>
          <select
            id="doctor-franja"
            className={styles.select}
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            disabled={shiftDisabled}
          >
            <option value="">Seleccionar franja</option>
            {shifts.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {noShiftsAvailable && (
            <span className={styles.error}>
              No hay franjas disponibles para este consultorio
            </span>
          )}
          {shiftRequiredError && (
            <span className={styles.error}>
              La franja horaria es obligatoria cuando se asigna un consultorio
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
