import { Appointment, AppointmentStatus } from "@/domain/Appointment";
import AppointmentCard from "@/components/AppointmentCard/AppointmentCard";
import styles from "@/styles/page.module.css";

/**
 * ⚕️ HUMAN CHECK - Extracted reusable list component (FRONT-B5, FRONT-B8)
 * Handles filtering by status internally so pages become declarative.
 * New statuses can be added without modifying page components (OCP).
 */

export interface AppointmentListProps {
    appointments: Appointment[];
    status: AppointmentStatus;
    title: string;
    icon: string;
    variant: "called" | "waiting" | "attended";
    formatTime?: (timestamp: number) => string;
    sortDescending?: boolean;
}

export default function AppointmentList({
    appointments,
    status,
    title,
    icon,
    variant,
    formatTime,
    sortDescending = false,
}: AppointmentListProps) {
    let filtered = appointments.filter((t) => t.estado === status);

    if (sortDescending) {
        filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    }

    if (filtered.length === 0) return null;

    return (
        <>
            <h2 className={styles.sectionTitle}>
                {icon} {title} {variant === "attended" && `(${filtered.length})`}
            </h2>
            <ul className={styles.list}>
                {filtered.map((t) => (
                    <AppointmentCard
                        key={t.id}
                        nombre={t.nombre}
                        consultorio={t.consultorio}
                        timestamp={t.timestamp}
                        variant={variant}
                        formatTime={formatTime}
                    />
                ))}
            </ul>
        </>
    );
}
