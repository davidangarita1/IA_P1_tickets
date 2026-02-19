export type TicketStatus = "waiting" | "called" | "served";

export interface Ticket {
  id: string;
  name: string;
  documentId: number;
  office: string | null;
  timestamp: number;
  status: TicketStatus;
}
