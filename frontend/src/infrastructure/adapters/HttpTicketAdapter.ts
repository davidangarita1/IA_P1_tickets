import type { Ticket } from "@/domain/Ticket";
import type { CreateTicketDTO, CreateTicketResponse } from "@/domain/CreateTicket";
import type { TicketWriter } from "@/domain/ports/TicketWriter";
import type { TicketReader } from "@/domain/ports/TicketReader";
import { env } from "@/config/env";
import { httpGet, httpPost } from "@/infrastructure/http/httpClient";
import { toDomainTicket, toBackendCreateDTO } from "@/infrastructure/mappers/ticketMapper";

export class HttpTicketAdapter implements TicketWriter, TicketReader {
  async getTickets(): Promise<Ticket[]> {
    const raw = await httpGet<unknown[]>(`${env.API_BASE_URL}/turnos`);
    return raw.map((item) => toDomainTicket(item as Parameters<typeof toDomainTicket>[0]));
  }

  async createTicket(data: CreateTicketDTO): Promise<CreateTicketResponse> {
    return httpPost<CreateTicketResponse>(
      `${env.API_BASE_URL}/turnos`,
      toBackendCreateDTO(data)
    );
  }
}
