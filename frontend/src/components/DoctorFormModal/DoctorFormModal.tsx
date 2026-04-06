"use client";

import { useState, useEffect, useCallback } from "react";
import { useAvailableShifts } from "@/hooks/useAvailableShifts";
import type { DoctorService } from "@/domain/ports/DoctorService";
import type { FranjaHoraria } from "@/domain/Doctor";
import styles from "./DoctorFormModal.module.css";

const CONSULTORIOS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

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
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [consultorio, setConsultorio] = useState("");
  const [franjaHoraria, setFranjaHoraria] = useState("");
  const [nombreTouched, setNombreTouched] = useState(false);
  const [cedulaTouched, setCedulaTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { shifts, loading: shiftsLoading, fetchShifts } = useAvailableShifts(doctorService);

  const nombreError =
    nombreTouched && nombre.length > 0 && nombre.length < 3
      ? "El nombre debe tener mínimo 3 caracteres"
      : nombreTouched && nombre.length === 0
        ? "El nombre completo es obligatorio"
        : null;

  const cedulaError =
    cedulaTouched && cedula.length === 0
      ? "El número de cédula es obligatorio"
      : cedulaTouched && (cedula.length < 7 || cedula.length > 10)
        ? "La cédula debe tener entre 7 y 10 dígitos"
        : null;

  const isFormValid = nombre.length >= 3 && cedula.length >= 7 && cedula.length <= 10;

  const consultorioSelected = consultorio !== "";
  const noShiftsAvailable = consultorioSelected && !shiftsLoading && shifts.length === 0;
  const franjaDisabled = !consultorioSelected || shiftsLoading || noShiftsAvailable;

  const handleConsultorioChange = useCallback(
    (value: string) => {
      setConsultorio(value);
      setFranjaHoraria("");
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
        nombre,
        cedula,
        consultorio: consultorio || null,
        franjaHoraria: (franjaHoraria as FranjaHoraria) || null,
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={() => setNombreTouched(true)}
            placeholder="Nombre completo del médico"
          />
          {nombreError && <span className={styles.error}>{nombreError}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="doctor-cedula" className={styles.label}>
            Número de cédula
          </label>
          <input
            id="doctor-cedula"
            type="text"
            className={styles.input}
            value={cedula}
            onChange={(e) => setCedula(stripNonNumeric(e.target.value))}
            onBlur={() => setCedulaTouched(true)}
            placeholder="Número de cédula"
            maxLength={10}
          />
          {cedulaError && <span className={styles.error}>{cedulaError}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="doctor-consultorio" className={styles.label}>
            Consultorio
          </label>
          <select
            id="doctor-consultorio"
            className={styles.select}
            value={consultorio}
            onChange={(e) => handleConsultorioChange(e.target.value)}
          >
            <option value="">Seleccionar consultorio</option>
            {CONSULTORIOS.map((c) => (
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
            value={franjaHoraria}
            onChange={(e) => setFranjaHoraria(e.target.value)}
            disabled={franjaDisabled}
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
