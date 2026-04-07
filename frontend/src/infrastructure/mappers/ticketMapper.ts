import type { Ticket, TicketStatus } from '@/domain/Ticket';
import type { CreateTicketDTO } from '@/domain/CreateTicket';

interface BackendTicket {
  id: string;
  nombre: string;
  cedula: number;
  consultorio: string | null;
  timestamp: number;
  estado: string;
}

const STATUS_MAP: Record<string, TicketStatus> = {
  espera: 'waiting',
  llamado: 'called',
  atendido: 'served',
};

export function toDomainTicket(raw: BackendTicket): Ticket {
  return {
    id: raw.id,
    name: raw.nombre,
    documentId: raw.cedula,
    office: raw.consultorio,
    timestamp: raw.timestamp,
    status: STATUS_MAP[raw.estado] ?? 'waiting',
  };
}

export function toBackendCreateDTO(dto: CreateTicketDTO) {
  return {
    nombre: dto.name,
    cedula: dto.documentId,
  };
}
