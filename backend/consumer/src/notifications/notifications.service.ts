import { Injectable, Logger } from '@nestjs/common';
import { INotificationGateway } from '../domain/ports/INotificationGateway';

@Injectable()
export class NotificationsService implements INotificationGateway {
    private readonly logger = new Logger(NotificationsService.name);

    // ⚕️ HUMAN CHECK - Servicio de Notificaciones
    // Reemplazar esta simulación con una integración real:
    // - Firebase Cloud Messaging (FCM) para notificaciones push
    // - SendGrid / Nodemailer para notificaciones por correo
    // - Twilio para notificaciones por SMS
    async sendNotification(cedula: string, consultorio: string | null): Promise<void> {
        const message = consultorio
            ? `Su turno ha sido asignado al consultorio ${consultorio}`
            : 'Su turno ha sido registrado. Está en espera de asignación.';
        this.logger.log(`📩 Notificación enviada al paciente ${cedula}: ${message}`);
    }
}
