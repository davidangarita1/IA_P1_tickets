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
      const event = 'turno_creado';
      const payload = { cedula: 123, nombre: 'Test' };

      publisher.publish(event, payload);

      expect(mockClient.emit).toHaveBeenCalledWith(event, payload);
    });
  });

  describe('onModuleDestroy', () => {
    it('closes the ClientProxy connection', async () => {
      await publisher.onModuleDestroy();

      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});
