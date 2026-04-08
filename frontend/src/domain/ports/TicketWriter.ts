import type { CreateTicketDTO, CreateTicketResponse } from '@/domain/CreateTicket';

export interface TicketWriter {
  createTicket(data: CreateTicketDTO): Promise<CreateTicketResponse>;
}
