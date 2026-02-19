/**
 * Puerto de dominio: contrato para el servicio de notificaciones.
 *
 * ⚕️ HUMAN CHECK - ISP: interfaz segregada del repositorio y del publisher
 */
export interface INotificationGateway {
    sendNotification(cedula: string, consultorio: string | null): Promise<void>;
}
