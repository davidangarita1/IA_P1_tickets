import { Injectable } from '@nestjs/common';
import { Turno, TurnoPriority } from '../../domain/entities/turno.entity';
import { IPrioritySortingStrategy } from '../../domain/ports/IPrioritySortingStrategy';

/**
 * Estrategia estándar de ordenamiento por prioridad.
 * Ordena: alta (0) > media (1) > baja (2), desempate por timestamp (FIFO).
 *
 * ⚕️ HUMAN CHECK - OCP: para agregar prioridad "urgente" o reglas por franja horaria,
 * crear una nueva clase que implemente IPrioritySortingStrategy e inyectarla con el token.
 */
const PRIORITY_ORDER: Record<TurnoPriority, number> = {
    alta: 0,
    media: 1,
    baja: 2,
};

@Injectable()
export class StandardPrioritySortingStrategy implements IPrioritySortingStrategy {
    sort(turnos: Turno[]): Turno[] {
        return [...turnos].sort((a, b) => {
            const pA = PRIORITY_ORDER[a.priority] ?? PRIORITY_ORDER.media;
            const pB = PRIORITY_ORDER[b.priority] ?? PRIORITY_ORDER.media;
            if (pA !== pB) return pA - pB;
            return a.timestamp - b.timestamp;
        });
    }
}
