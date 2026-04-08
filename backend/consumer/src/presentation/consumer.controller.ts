import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { CreateTurnoUseCase } from '../application/use-cases/create-turno.use-case';

@Controller()
export class ConsumerController {
    private readonly logger = new Logger(ConsumerController.name);

    constructor(
        private readonly createTurnoUseCase: CreateTurnoUseCase,
    ) { }

    @EventPattern('crear_turno')
    async handleCrearTurno(@Payload() data: CreateTurnoDto, @Ctx() context: RmqContext): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        this.logger.log(`Recibido mensaje: ${JSON.stringify(data)}`);

        try {

            await this.createTurnoUseCase.execute(data);

            channel.ack(originalMsg);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error procesando mensaje: ${message}`);

            if (error instanceof BadRequestException) {
                channel.nack(originalMsg, false, false);
            } else {
                channel.nack(originalMsg, false, true);
            }
        }
    }
}
