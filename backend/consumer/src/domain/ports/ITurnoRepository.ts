import { Turno } from '../entities/turno.entity';

/**
 * DTO mínimo para crear un turno en el dominio.
 * No depende de class-validator ni de NestJS.
 */
export interface CreateTurnoData {
    cedula: number;
    nombre: string;
    priority?: 'alta' | 'media' | 'baja';
}

/**
 * Puerto de dominio: contrato para el repositorio de turnos.
 * El Consumer necesita operaciones de lectura y escritura.
 *
 * ⚕️ HUMAN CHECK - ISP: puerto enfocado en las operaciones que el Consumer consume
 */
export interface ITurnoRepository {
    findActivoPorCedula(cedula: number): Promise<Turno | null>;
    save(data: CreateTurnoData): Promise<Turno>;
    findPacientesEnEspera(): Promise<Turno[]>;
    getConsultoriosOcupados(): Promise<string[]>;
    asignarConsultorio(turnoId: string, consultorio: string): Promise<Turno | null>;
    finalizarTurnosLlamados(): Promise<Turno[]>;
}
