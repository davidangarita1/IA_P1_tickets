import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorSchemaClass, DoctorDocument } from '../schemas/doctor.schema';
import {
  IDoctorRepository,
  CreateDoctorData,
  UpdateDoctorData,
  AvailableShiftsResult,
} from '../../domain/ports/doctor.repository';
import { Doctor, Shift, VALID_SHIFTS } from '../../domain/entities/doctor.entity';

@Injectable()
export class DoctorMongooseAdapter implements IDoctorRepository {
  constructor(
    @InjectModel(DoctorSchemaClass.name) private readonly doctorModel: Model<DoctorDocument>,
  ) {}

  async create(data: CreateDoctorData): Promise<Doctor> {
    const doc = await this.doctorModel.create(data);
    return this.toDomain(doc);
  }

  async findAll(): Promise<Doctor[]> {
    const docs = await this.doctorModel.find({ status: 'active' }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByDocumentId(documentId: string): Promise<Doctor | null> {
    const doc = await this.doctorModel.findOne({ documentId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOfficeAndShift(office: string, shift: Shift): Promise<Doctor | null> {
    const doc = await this.doctorModel.findOne({ office, shift, status: 'active' }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAvailableShifts(
    office: string,
    excludeDoctorId?: string,
  ): Promise<AvailableShiftsResult> {
    const query: Record<string, unknown> = {
      office,
      status: 'active',
      shift: { $ne: null },
    };

    if (excludeDoctorId) {
      query._id = { $ne: excludeDoctorId };
    }

    const docs = await this.doctorModel.find(query).exec();
    const occupiedShifts = docs.map((doc) => doc.shift as Shift);
    const availableShifts = VALID_SHIFTS.filter((s) => !occupiedShifts.includes(s));

    return { availableShifts, occupiedShifts };
  }

  async findById(id: string): Promise<Doctor | null> {
    const doc = await this.doctorModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(id: string, data: UpdateDoctorData): Promise<Doctor> {
    const doc = await this.doctorModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) {
      throw new NotFoundException('Médico no encontrado');
    }
    return this.toDomain(doc);
  }

  async softDelete(id: string): Promise<Doctor> {
    const doc = await this.doctorModel
      .findByIdAndUpdate(id, { status: 'inactive' }, { new: true })
      .exec();
    if (!doc) {
      throw new NotFoundException('Médico no encontrado');
    }
    return this.toDomain(doc);
  }

  private toDomain(doc: DoctorDocument): Doctor {
    return new Doctor({
      id: String(doc._id),
      name: doc.name,
      documentId: doc.documentId,
      office: doc.office,
      shift: doc.shift,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
