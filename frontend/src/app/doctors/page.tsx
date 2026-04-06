"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard/AuthGuard";
import DoctorFormModal from "@/components/DoctorFormModal/DoctorFormModal";
import DoctorEditModal from "@/components/DoctorEditModal/DoctorEditModal";
import Toast from "@/components/Toast/Toast";
import { useDoctors } from "@/hooks/useDoctors";
import { useToast } from "@/hooks/useToast";
import { useDeps } from "@/providers/DependencyProvider";
import type { Doctor } from "@/domain/Doctor";
import styles from "@/styles/doctors.module.css";

const TABLE_HEADERS = [
  "Nombre completo",
  "Cédula",
  "Consultorio",
  "Franja Horaria",
  "Acciones",
];

export default function DoctorsPage() {
  return (
    <AuthGuard>
      <DoctorsContent />
    </AuthGuard>
  );
}

function DoctorsContent() {
  const { doctorService } = useDeps();
  const { doctors, loading, error, refresh } = useDoctors(doctorService);
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Gestión de Médicos</h1>

      <Toast
        message={toast.message ?? ""}
        type={toast.type}
        visible={toast.visible}
        onHide={toast.hide}
      />

      <div className={styles.toolbar}>
        <button
          className={styles.createButton}
          onClick={() => setShowModal(true)}
        >
          Crear médico
        </button>
      </div>

      {loading && <p className={styles.loadingText}>Cargando médicos...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {showModal && (
        <DoctorFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refresh();
          }}
          doctorService={doctorService}
          showToast={toast.show}
        />
      )}

      {editingDoctor && (
        <DoctorEditModal
          doctor={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSuccess={() => {
            setEditingDoctor(null);
            refresh();
          }}
          doctorService={doctorService}
          showToast={toast.show}
        />
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading && doctors.length === 0 && (
            <tr className={styles.emptyRow}>
              <td colSpan={TABLE_HEADERS.length}>No hay médicos creados</td>
            </tr>
          )}
          {doctors.map((doctor) => (
            <tr key={doctor._id}>
              <td>Dr. {doctor.name}</td>
              <td>{doctor.documentId}</td>
              <td>{doctor.office ?? "Sin asignar"}</td>
              <td>{doctor.shift ?? "Sin asignar"}</td>
              <td>
                <button
                  className={styles.editButton}
                  onClick={() => setEditingDoctor(doctor)}
                  aria-label={`Editar Dr. ${doctor.name}`}
                >
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
