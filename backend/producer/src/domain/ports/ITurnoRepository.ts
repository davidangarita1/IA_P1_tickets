import { Turno } from '../entities/turno.entity';

export interface ITurnoRepository {
    findAll(): Promise<Turno[]>;
    findByCedula(cedula: number): Promise<Turno[]>;
}
