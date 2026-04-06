import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DoctorStatus, FranjaHoraria } from '../../domain/entities/doctor.entity';

export type DoctorDocument = HydratedDocument<DoctorSchemaClass> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, collection: 'doctors' })
export class DoctorSchemaClass {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true, unique: true })
    cedula: string;

    @Prop({ default: null })
    consultorio: string | null;

    @Prop({ default: null, enum: ['06:00-14:00', '14:00-22:00', null] })
    franjaHoraria: FranjaHoraria | null;

    @Prop({ default: 'Activo', enum: ['Activo', 'Inactivo'] })
    status: DoctorStatus;
}

export const DoctorSchema = SchemaFactory.createForClass(DoctorSchemaClass);

DoctorSchema.index(
    { consultorio: 1, franjaHoraria: 1 },
    {
        unique: true,
        partialFilterExpression: {
            consultorio: { $ne: null },
            franjaHoraria: { $ne: null },
            status: 'Activo',
        },
    },
);
