import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turno as TurnoSchema, TurnoDocument } from '../../schemas/turno.schema';
import { ITurnoRepository } from '../../domain/ports/ITurnoRepository';
import { Turno } from '../../domain/entities/turno.entity';

/**
 * Adapter: implementa ITurnoRepository usando Mongoose/MongoDB.
 * Solo operaciones de lectura (el Producer no escribe).
 *
 * ⚕️ HUMAN CHECK - replace direct model injection with ITurnoRepository token
 * El @InjectModel queda aislado en esta capa de infraestructura,
 * nunca se expone a Application ni Domain.
 */
@Injectable()
export class TurnoMongooseAdapter implements ITurnoRepository {
    constructor(
        @InjectModel(TurnoSchema.name) private readonly turnoModel: Model<TurnoDocument>,
    ) {}

    async findAll(): Promise<Turno[]> {
        const docs = await this.turnoModel
            .find()
            .sort({ timestamp: 1 })
            .exec();

        return docs.map(doc => this.toDomain(doc));
    }

    async findByCedula(cedula: number): Promise<Turno[]> {
        const docs = await this.turnoModel
            .find({ cedula })
            .sort({ createdAt: -1 })
            .exec();

        if (docs.length === 0) {
            throw new NotFoundException(`No se encontraron turnos para la cédula ${cedula}`);
        }

        return docs.map(doc => this.toDomain(doc));
    }

    /**
     * Mapea un documento de Mongoose a la entidad de dominio pura.
     */
    private toDomain(doc: TurnoDocument): Turno {
        return new Turno({
            id: String(doc._id),
            nombre: doc.nombre,
            cedula: doc.cedula,
            consultorio: doc.consultorio,
            estado: doc.estado,
            priority: doc.priority,
            timestamp: doc.timestamp,
            finAtencionAt: doc.finAtencionAt,
        });
    }
}
