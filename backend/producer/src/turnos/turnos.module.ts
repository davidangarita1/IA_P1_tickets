import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Turno, TurnoSchema } from '../schemas/turno.schema';
import { TurnoMongooseAdapter } from '../infrastructure/adapters/turno-mongoose.adapter';
import { TURNO_REPOSITORY_TOKEN } from '../domain/ports/tokens';

// ⚕️ HUMAN CHECK - Adapter registrado con token de inyección (DIP)
// Para tests, reemplazar useClass por TurnoInMemoryAdapter
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),
    ],
    providers: [
        {
            provide: TURNO_REPOSITORY_TOKEN,
            useClass: TurnoMongooseAdapter,
        },
    ],
    exports: [TURNO_REPOSITORY_TOKEN],
})
export class TurnosModule { }
