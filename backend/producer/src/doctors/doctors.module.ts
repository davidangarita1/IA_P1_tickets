import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchemaClass, DoctorSchema } from './infrastructure/schemas/doctor.schema';
import { DoctorMongooseAdapter } from './infrastructure/adapters/doctor-mongoose.adapter';
import {
  DOCTOR_REPOSITORY_TOKEN,
  TOKEN_SERVICE_TOKEN,
  ACCESS_TOKEN_VERIFIER_TOKEN,
} from '../domain/ports/tokens';
import { CreateDoctorUseCase } from './application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from './application/use-cases/get-all-doctors.use-case';
import { GetAvailableShiftsUseCase } from './application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from './application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from './application/use-cases/delete-doctor.use-case';
import { DoctorController } from './presentation/controllers/doctor.controller';
import { AuthGuard } from '../presentation/auth.guard';
import { DoctorRoleGuard } from './presentation/guards/doctor-role.guard';
import { HmacTokenService } from '../infrastructure/adapters/hmac-token.service';
import { TurnosModule } from '../turnos/turnos.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoctorSchemaClass.name, schema: DoctorSchema }]),
    TurnosModule,
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
    UpdateDoctorUseCase,
    DeleteDoctorUseCase,
    {
      provide: TOKEN_SERVICE_TOKEN,
      useClass: HmacTokenService,
    },
    {
      provide: ACCESS_TOKEN_VERIFIER_TOKEN,
      useExisting: TOKEN_SERVICE_TOKEN,
    },
    AuthGuard,
    DoctorRoleGuard,
  ],
  exports: [DOCTOR_REPOSITORY_TOKEN],
})
export class DoctorsModule {}
