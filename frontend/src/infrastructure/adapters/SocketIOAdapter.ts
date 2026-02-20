import { io, Socket } from "socket.io-client";
import type { RealTimeProvider, RealTimeCallbacks } from "@/domain/ports/RealTimeProvider";
import { toDomainTicket } from "@/infrastructure/mappers/ticketMapper";

export class SocketIOAdapter implements RealTimeProvider {
  private socket: Socket | null = null;

  constructor(private readonly wsUrl: string) {}

  connect(callbacks: RealTimeCallbacks): void {
    this.socket = io(`${this.wsUrl}/ws/turnos`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on("connect", () => callbacks.onConnect());

    this.socket.on("disconnect", () => callbacks.onDisconnect());

    this.socket.on("connect_error", () => {
      callbacks.onError("Error de conexión con el servidor");
    });

    this.socket.on(
      "TURNOS_SNAPSHOT",
      (payload: { type: string; data: unknown[] }) => {
        callbacks.onSnapshot(payload.data.map((raw) => toDomainTicket(raw as Parameters<typeof toDomainTicket>[0])));
      }
    );

    this.socket.on(
      "TURNO_ACTUALIZADO",
      (payload: { type: string; data: unknown }) => {
        callbacks.onTicketUpdate(toDomainTicket(payload.data as Parameters<typeof toDomainTicket>[0]));
      }
    );
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
