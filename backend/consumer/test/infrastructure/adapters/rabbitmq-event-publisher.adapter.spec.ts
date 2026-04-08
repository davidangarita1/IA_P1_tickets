import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQEventPublisher } from '../../../src/infrastructure/adapters/rabbitmq-event-publisher.adapter';

describe('RabbitMQEventPublisher (Infrastructure)', () => {
    const mockClient: jest.Mocked<ClientProxy> = {
        emit: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ClientProxy>;

    let publisher: RabbitMQEventPublisher;

    beforeEach(() => {
        jest.clearAllMocks();
        publisher = new RabbitMQEventPublisher(mockClient);
    });

    describe('publish', () => {
        it('emits the event to ClientProxy with the payload', () => {
            // Arrange
            const event = 'turno_actualizado';
            const payload = { id: 'turno-1', nombre: 'Test', estado: 'llamado' };

            // Act
            publisher.publish(event, payload);

            // Assert
            expect(mockClient.emit).toHaveBeenCalledWith(event, payload);
        });
    });

    describe('onModuleDestroy', () => {
        it('closes the ClientProxy connection', async () => {
            // Act
            await publisher.onModuleDestroy();

            // Assert
            expect(mockClient.close).toHaveBeenCalled();
        });
    });
});
