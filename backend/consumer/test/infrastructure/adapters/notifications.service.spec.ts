import { NotificationsService } from '../../../src/infrastructure/adapters/notifications.service';

describe('NotificationsService (Infrastructure)', () => {
    let service: NotificationsService;

    beforeEach(() => {
        service = new NotificationsService();
    });

    describe('sendNotification', () => {
        it('sends notification when office is assigned', async () => {
            // Arrange
            const cedula = '12345';
            const consultorio = '3';

            // Act & Assert (no debe lanzar error)
            await expect(service.sendNotification(cedula, consultorio)).resolves.toBeUndefined();
        });

        it('sends notification when turno is waiting (no office)', async () => {
            // Arrange
            const cedula = '67890';
            const consultorio = null;

            // Act & Assert
            await expect(service.sendNotification(cedula, consultorio)).resolves.toBeUndefined();
        });
    });
});
