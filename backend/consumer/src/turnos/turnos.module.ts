import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Turno, TurnoSchema } from '../infrastructure/schemas/turno.schema';
import { TurnoMongooseAdapter } from '../infrastructure/adapters/turno-mongoose.adapter';
import { StandardPrioritySortingStrategy } from '../infrastructure/adapters/standard-priority-sorting.strategy';
import { TURNO_REPOSITORY_TOKEN, PRIORITY_SORTING_STRATEGY_TOKEN } from '../domain/ports/tokens';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Turno.name, schema: TurnoSchema }]),
    ],
    providers: [
        {
            provide: TURNO_REPOSITORY_TOKEN,
            useClass: TurnoMongooseAdapter,
        },
        {
            provide: PRIORITY_SORTING_STRATEGY_TOKEN,
            useClass: StandardPrioritySortingStrategy,
        },
    ],
    exports: [TURNO_REPOSITORY_TOKEN, PRIORITY_SORTING_STRATEGY_TOKEN],
})
export class TurnosModule { }
