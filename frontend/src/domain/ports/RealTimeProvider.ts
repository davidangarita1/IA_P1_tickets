import type { Ticket } from "@/domain/Ticket";

export type RealTimeCallbacks = {
  onSnapshot: (tickets: Ticket[]) => void;
  onTicketUpdate: (ticket: Ticket) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (message: string) => void;
};

export interface RealTimeProvider {
  connect(callbacks: RealTimeCallbacks): void;
  disconnect(): void;
  isConnected(): boolean;
}
