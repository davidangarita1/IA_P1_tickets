import styles from "@/styles/page.module.css";

/**
 * ⚕️ HUMAN CHECK - Extracted from page.tsx and dashboard/page.tsx (FRONT-B6, FRONT-B8)
 * Receives only the props it needs to render (ISP), not the full Appointment object.
 */

export interface AppointmentCardProps {
    nombre: string;
    consultorio: string | null;
    timestamp?: number;
    variant: "called" | "waiting" | "attended";
    formatTime?: (timestamp: number) => string;
}

export default function AppointmentCard({
    nombre,
    consultorio,
    timestamp,
    variant,
    formatTime,
}: AppointmentCardProps) {
    const variantClass =
        variant === "called"
            ? styles.highlight
            : variant === "attended"
              ? styles.atendido
              : "";

    return (
        <li className={`${styles.item} ${variantClass}`}>
            <span className={styles.nombre}>{nombre}</span>

            {variant === "attended" && timestamp && formatTime && (
                <span className={styles.hora}>{formatTime(timestamp)}</span>
            )}

            <span>
                {consultorio ? `Consultorio ${consultorio}` : "Consultorio no asignado"}
            </span>
        </li>
    );
}
