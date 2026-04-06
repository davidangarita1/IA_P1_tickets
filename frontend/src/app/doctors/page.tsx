"use client";

import AuthGuard from "@/components/AuthGuard/AuthGuard";
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
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Gestión de Médicos</h1>
      <div className={styles.toolbar}>
        <button className={styles.createButton} disabled>
          Crear médico
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className={styles.emptyRow}>
            <td colSpan={TABLE_HEADERS.length}>No hay médicos creados</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
