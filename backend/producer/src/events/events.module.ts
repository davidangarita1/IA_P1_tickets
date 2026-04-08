import { Module } from '@nestjs/common';
import { TurnosGateway } from './turnos.gateway';
import { EventsController } from './events.controller';
import { TurnosModule } from '../turnos/turnos.module';

@Module({
  imports: [TurnosModule],
  controllers: [EventsController],
  providers: [TurnosGateway],
  exports: [TurnosGateway],
})
export class EventsModule {}
