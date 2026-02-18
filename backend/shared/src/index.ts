// ⚕️ HUMAN CHECK - Barrel export: punto de entrada único para @turnos/shared
// Todos los tipos de dominio compartidos entre Producer y Consumer se exportan desde aquí.
export {
    Turno,
    TurnoEstado,
    TurnoPriority,
    TurnoEventPayload,
} from './domain/entities/turno.entity';
