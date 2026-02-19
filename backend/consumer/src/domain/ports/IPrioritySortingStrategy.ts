import { Turno } from '../entities/turno.entity';

/**
 * Puerto de dominio: estrategia de ordenamiento por prioridad.
 *
 * ⚕️ HUMAN CHECK - OCP: para cambiar las reglas de prioridad (e.g. agregar "urgente"),
 * se crea una nueva implementación de esta interfaz sin modificar código existente.
 */
export interface IPrioritySortingStrategy {
    sort(turnos: Turno[]): Turno[];
}
