import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { CreateTurnoUseCase } from '../application/use-cases/create-turno.use-case';

@Controller()
export class ConsumerController {
    private readonly logger = new Logger(ConsumerController.name);

    // ⚕️ HUMAN CHECK - SRP: Controller solo maneja transporte RabbitMQ (ack/nack),
    // delega la lógica de negocio al Use Case
    constructor(
        private readonly createTurnoUseCase: CreateTurnoUseCase,
    ) { }

    @EventPattern('crear_turno')
    async handleCrearTurno(@Payload() data: CreateTurnoDto, @Ctx() context: RmqContext): Promise<void> {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        this.logger.log(`Recibido mensaje: ${JSON.stringify(data)}`);

        try {
            // ⚕️ HUMAN CHECK - La validación de cedula la maneja ValidationPipe + @IsNumber() en CreateTurnoDto
            await this.createTurnoUseCase.execute(data);

            // ⚕️ HUMAN CHECK - Confirmación Manual (Ack)
            channel.ack(originalMsg);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error procesando mensaje: ${message}`);

            // ⚕️ HUMAN CHECK - Manejo de errores con nack controlado
            if (error instanceof BadRequestException) {
                channel.nack(originalMsg, false, false);
            } else {
                channel.nack(originalMsg, false, true);
            }
        }
    }
}
