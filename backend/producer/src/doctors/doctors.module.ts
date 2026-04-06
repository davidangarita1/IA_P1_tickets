import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchemaClass, DoctorSchema } from './infrastructure/schemas/doctor.schema';
import { DoctorMongooseAdapter } from './infrastructure/adapters/doctor-mongoose.adapter';
import { DOCTOR_REPOSITORY_TOKEN } from '../domain/ports/tokens';
import { CreateDoctorUseCase } from './application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from './application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from './application/use-cases/get-available-shifts.use-case';
import { DoctorController } from './presentation/controllers/doctor.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DoctorSchemaClass.name, schema: DoctorSchema }]),
    ],
    controllers: [DoctorController],
    providers: [
        {
            provide: DOCTOR_REPOSITORY_TOKEN,
            useClass: DoctorMongooseAdapter,
        },
        CreateDoctorUseCase,
        GetAllDoctorsUseCase,
        GetAvailableShiftsUseCase,
    ],
    exports: [DOCTOR_REPOSITORY_TOKEN],
})
export class DoctorsModule {}
