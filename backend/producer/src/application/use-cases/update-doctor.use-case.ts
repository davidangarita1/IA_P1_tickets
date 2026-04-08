import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDoctorRepository, UpdateDoctorData } from '../../domain/ports/doctor.repository';
import { DOCTOR_REPOSITORY_TOKEN } from '../../domain/ports/tokens';
import { Doctor, Shift } from '../../domain/entities/doctor.entity';

export interface UpdateDoctorInput {
  name?: string;
  documentId?: string;
  office?: string | null;
  shift?: Shift | null;
}

@Injectable()
export class UpdateDoctorUseCase {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN) private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(id: string, data: UpdateDoctorInput): Promise<Doctor> {
    const existing = await this.doctorRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Médico no encontrado');
    }

    const finalOffice = data.office !== undefined ? data.office : existing.office;
    const finalShift = data.shift !== undefined ? data.shift : existing.shift;

    if (finalOffice && !finalShift) {
      throw new BadRequestException(
        'La franja horaria es obligatoria cuando se asigna un consultorio',
      );
    }

    if (data.documentId && data.documentId !== existing.documentId) {
      const duplicate = await this.doctorRepository.findActiveByDocumentId(data.documentId);
      if (duplicate) {
        throw new ConflictException('Ya existe un médico registrado con ese número de cédula');
      }
    }

    const officeChanged = data.office !== undefined && data.office !== existing.office;
    const shiftChanged = data.shift !== undefined && data.shift !== existing.shift;

    if ((officeChanged || shiftChanged) && finalOffice && finalShift) {
      const conflict = await this.doctorRepository.findByOfficeAndShift(finalOffice, finalShift);
      if (conflict && conflict._id !== id) {
        throw new ConflictException('La franja horaria del consultorio ya está ocupada');
      }
    }

    const updateData: UpdateDoctorData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.documentId !== undefined) updateData.documentId = data.documentId;
    if (data.office !== undefined) updateData.office = data.office;
    if (data.shift !== undefined) updateData.shift = data.shift;

    return this.doctorRepository.update(id, updateData);
  }
}
