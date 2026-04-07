import type { Ticket } from '@/domain/Ticket';

export interface TicketReader {
  getTickets(): Promise<Ticket[]>;
}
