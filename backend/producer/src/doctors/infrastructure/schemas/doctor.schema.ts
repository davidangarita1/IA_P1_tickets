import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DoctorStatus, Shift } from '../../domain/entities/doctor.entity';

export type DoctorDocument = HydratedDocument<DoctorSchemaClass> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, collection: 'doctors' })
export class DoctorSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  documentId: string;

  @Prop({ default: null })
  office: string | null;

  @Prop({ default: null, enum: ['06:00-14:00', '14:00-22:00', null] })
  shift: Shift | null;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: DoctorStatus;
}

export const DoctorSchema = SchemaFactory.createForClass(DoctorSchemaClass);

DoctorSchema.index(
  { office: 1, shift: 1 },
  {
    unique: true,
    partialFilterExpression: {
      office: { $ne: null },
      shift: { $ne: null },
      status: 'active',
    },
  },
);
