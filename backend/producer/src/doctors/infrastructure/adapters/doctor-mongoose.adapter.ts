import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorSchemaClass, DoctorDocument } from '../schemas/doctor.schema';
import { IDoctorRepository, CreateDoctorData, AvailableShiftsResult } from '../../domain/ports/doctor.repository';
import { Doctor, FranjaHoraria } from '../../domain/entities/doctor.entity';

const ALL_SHIFTS: FranjaHoraria[] = ['06:00-14:00', '14:00-22:00'];

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
        const docs = await this.doctorModel.find({ status: 'Activo' }).exec();
        return docs.map(doc => this.toDomain(doc));
    }

    async findByCedula(cedula: string): Promise<Doctor | null> {
        const doc = await this.doctorModel.findOne({ cedula }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findByConsultorioAndFranja(consultorio: string, franjaHoraria: FranjaHoraria): Promise<Doctor | null> {
        const doc = await this.doctorModel
            .findOne({ consultorio, franjaHoraria, status: 'Activo' })
            .exec();
        return doc ? this.toDomain(doc) : null;
    }

    async findAvailableShifts(consultorio: string, excludeDoctorId?: string): Promise<AvailableShiftsResult> {
        const query: Record<string, unknown> = {
            consultorio,
            status: 'Activo',
            franjaHoraria: { $ne: null },
        };

        if (excludeDoctorId) {
            query._id = { $ne: excludeDoctorId };
        }

        const docs = await this.doctorModel.find(query).exec();
        const occupiedShifts = docs.map(doc => doc.franjaHoraria as FranjaHoraria);
        const availableShifts = ALL_SHIFTS.filter(shift => !occupiedShifts.includes(shift));

        return { availableShifts, occupiedShifts };
    }

    private toDomain(doc: DoctorDocument): Doctor {
        return new Doctor({
            id: String(doc._id),
            nombre: doc.nombre,
            cedula: doc.cedula,
            consultorio: doc.consultorio,
            franjaHoraria: doc.franjaHoraria,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}
