// ⚕️ HUMAN CHECK - DRY: fuente canónica en @turnos/shared
// Este archivo re-exporta para mantener los import paths existentes del servicio.
// Cualquier cambio en la entidad Turno debe hacerse en backend/shared/src/domain/entities/turno.entity.ts
export {
    Turno,
    TurnoEstado,
    TurnoPriority,
    TurnoEventPayload,
} from '@turnos/shared';
