import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurnosGateway } from './turnos.gateway';
import { EventsController } from './events.controller';
import { Turno, TurnoSchema } from '../infrastructure/schemas/turno.schema';
import { TurnoMongooseAdapter } from '../infrastructure/adapters/turno-mongoose.adapter';
import { TURNO_REPOSITORY_TOKEN } from '../domain/ports/tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }])],
  controllers: [EventsController],
  providers: [
    { provide: TURNO_REPOSITORY_TOKEN, useClass: TurnoMongooseAdapter },
    TurnosGateway,
  ],
  exports: [TurnosGateway, TURNO_REPOSITORY_TOKEN],
})
export class EventsModule {}
