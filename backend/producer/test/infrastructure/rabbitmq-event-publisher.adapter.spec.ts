import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQEventPublisher } from '../../src/infrastructure/adapters/rabbitmq-event-publisher.adapter';

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
    it('emite el evento al ClientProxy con el payload', () => {
      const event = 'turno_creado';
      const payload = { cedula: 123, nombre: 'Test' };

      publisher.publish(event, payload);

      expect(mockClient.emit).toHaveBeenCalledWith(event, payload);
    });
  });

  describe('onModuleDestroy', () => {
    it('cierra la conexión del ClientProxy', async () => {
      await publisher.onModuleDestroy();

      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
