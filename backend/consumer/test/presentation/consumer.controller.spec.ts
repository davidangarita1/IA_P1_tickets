import { BadRequestException } from '@nestjs/common';
import { ConsumerController } from '../../src/presentation/consumer.controller';
import { CreateTurnoUseCase } from '../../src/application/use-cases/create-turno.use-case';

describe('ConsumerController (Presentation)', () => {
    const createTurnoUseCase: Pick<CreateTurnoUseCase, 'execute'> = {
        execute: jest.fn(),
    };

    const channel = {
        ack: jest.fn(),
        nack: jest.fn(),
    };

    const context = {
        getChannelRef: jest.fn(() => channel),
        getMessage: jest.fn(() => ({ id: 'msg-1' })),
    };

    let controller: ConsumerController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new ConsumerController(createTurnoUseCase as CreateTurnoUseCase);
    });

    it('delegates to use case and ACKs message on success', async () => {
        // Arrange: el caso de uso procesa el turno sin errores.
        (createTurnoUseCase.execute as jest.Mock).mockResolvedValue({});
        const data = { cedula: 123, nombre: 'Paciente', priority: 'media' as const };

        // Act: procesar el evento de RabbitMQ.
        await controller.handleCrearTurno(data, context as never);

        // Assert: delega al caso de uso y confirma el mensaje.
        expect(createTurnoUseCase.execute).toHaveBeenCalledWith(data);
        expect(channel.ack).toHaveBeenCalledWith({ id: 'msg-1' });
        expect(channel.nack).not.toHaveBeenCalled();
    });

    it('NACKs without requeue on BadRequestException', async () => {
        // Arrange: error de validación/negocio no recuperable.
        (createTurnoUseCase.execute as jest.Mock).mockRejectedValue(
            new BadRequestException('invalid payload'),
        );

        // Act: procesar evento con error controlado.
        await controller.handleCrearTurno({ cedula: 0, nombre: '' } as never, context as never);

        // Assert: no requeue para evitar loop infinito de mensaje inválido.
        expect(channel.nack).toHaveBeenCalledWith({ id: 'msg-1' }, false, false);
        expect(channel.ack).not.toHaveBeenCalled();
    });

    it('NACKs with requeue on transient error', async () => {
        // Arrange: simular falla temporal (ej. base de datos no disponible).
        (createTurnoUseCase.execute as jest.Mock).mockRejectedValue(new Error('db down'));

        // Act: procesar evento con error recuperable.
        await controller.handleCrearTurno({ cedula: 123, nombre: 'Paciente' } as never, context as never);

        // Assert: requeue habilitado para reintento posterior.
        expect(channel.nack).toHaveBeenCalledWith({ id: 'msg-1' }, false, true);
        expect(channel.ack).not.toHaveBeenCalled();
    });

    it('NACKs with requeue when error is not an Error instance', async () => {
        (createTurnoUseCase.execute as jest.Mock).mockRejectedValue('string error');

        await controller.handleCrearTurno({ cedula: 123, nombre: 'Paciente' } as never, context as never);

        expect(channel.nack).toHaveBeenCalledWith({ id: 'msg-1' }, false, true);
        expect(channel.ack).not.toHaveBeenCalled();
    });
});
