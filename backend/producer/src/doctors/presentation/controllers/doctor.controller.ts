import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDoctorDto } from '../dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../dtos/update-doctor.dto';
import { CreateDoctorUseCase } from '../../application/use-cases/create-doctor.use-case';
import { GetAllDoctorsUseCase } from '../../application/use-cases/get-all-doctors.use-case';
import {
  GetAvailableShiftsUseCase,
  AvailableShiftsResponse,
} from '../../application/use-cases/get-available-shifts.use-case';
import { UpdateDoctorUseCase } from '../../application/use-cases/update-doctor.use-case';
import { DeleteDoctorUseCase } from '../../application/use-cases/delete-doctor.use-case';
import { AuthGuard } from '../../../presentation/auth.guard';
import { DoctorRoleGuard } from '../guards/doctor-role.guard';
import { Doctor } from '../../domain/entities/doctor.entity';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('api/v1/doctors')
@UseGuards(AuthGuard, DoctorRoleGuard)
export class DoctorController {
  constructor(
    private readonly createDoctorUseCase: CreateDoctorUseCase,
    private readonly getAllDoctorsUseCase: GetAllDoctorsUseCase,
    private readonly getAvailableShiftsUseCase: GetAvailableShiftsUseCase,
    private readonly updateDoctorUseCase: UpdateDoctorUseCase,
    private readonly deleteDoctorUseCase: DeleteDoctorUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear nuevo médico' })
  @ApiResponse({ status: 201, description: 'Médico creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  @ApiResponse({
    status: 409,
    description: 'Cédula duplicada o combinación consultorio/franja ocupada',
  })
  async createDoctor(@Body() dto: CreateDoctorDto): Promise<Doctor> {
    return this.createDoctorUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar médicos activos' })
  @ApiResponse({ status: 200, description: 'Lista de médicos activos' })
  async getAllDoctors(): Promise<Doctor[]> {
    return this.getAllDoctorsUseCase.execute();
  }

  @Get('available-shifts')
  @ApiOperation({ summary: 'Get available shifts for an office' })
  @ApiQuery({ name: 'office', required: true, description: 'Office number' })
  @ApiQuery({ name: 'exclude_doctor_id', required: false, description: 'Doctor ID to exclude' })
  @ApiResponse({ status: 200, description: 'Available and occupied shifts' })
  async getAvailableShifts(
    @Query('office') office: string,
    @Query('exclude_doctor_id') excludeDoctorId?: string,
  ): Promise<AvailableShiftsResponse> {
    return this.getAvailableShiftsUseCase.execute({ office, excludeDoctorId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un médico existente' })
  @ApiParam({ name: 'id', description: 'ID del médico' })
  @ApiResponse({ status: 200, description: 'Médico actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Cédula duplicada o combinación consultorio/franja ocupada',
  })
  async updateDoctor(@Param('id') id: string, @Body() dto: UpdateDoctorDto): Promise<Doctor> {
    return this.updateDoctorUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Dar de baja un médico (eliminación lógica)' })
  @ApiParam({ name: 'id', description: 'ID del médico' })
  @ApiResponse({ status: 204, description: 'Médico dado de baja exitosamente' })
  @ApiResponse({ status: 401, description: 'Token no proporcionado o inválido' })
  @ApiResponse({ status: 404, description: 'Médico no encontrado' })
  @ApiResponse({ status: 409, description: 'Médico con atención en curso' })
  async deleteDoctor(@Param('id') id: string): Promise<void> {
    return this.deleteDoctorUseCase.execute(id);
  }
}
