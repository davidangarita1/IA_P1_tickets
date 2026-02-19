import type { TicketWriter } from "@/domain/ports/TicketWriter";
import type { TicketReader } from "@/domain/ports/TicketReader";
import type { RealTimeProvider, RealTimeCallbacks } from "@/domain/ports/RealTimeProvider";
import type { AudioNotifier } from "@/domain/ports/AudioNotifier";
import type { InputSanitizer } from "@/domain/ports/InputSanitizer";
import type { Ticket } from "@/domain/Ticket";
import type { CreateTicketResponse } from "@/domain/CreateTicket";

let idCounter = 0;

export function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  idCounter++;
  return {
    id: `ticket-${idCounter}`,
    name: `Patient ${idCounter}`,
    documentId: 1000000 + idCounter,
    office: null,
    timestamp: Date.now(),
    status: "waiting",
    ...overrides,
  };
}

export function mockTicketWriter(
  response: CreateTicketResponse = { status: "accepted", message: "OK" }
): jest.Mocked<TicketWriter> {
  return {
    createTicket: jest.fn().mockResolvedValue(response),
  };
}

export function mockTicketReader(
  tickets: Ticket[] = []
): jest.Mocked<TicketReader> {
  return {
    getTickets: jest.fn().mockResolvedValue(tickets),
  };
}

export function mockRealTimeProvider(): jest.Mocked<RealTimeProvider> & {
  _callbacks: RealTimeCallbacks | null;
  _simulateSnapshot: (tickets: Ticket[]) => void;
  _simulateUpdate: (ticket: Ticket) => void;
  _simulateConnect: () => void;
  _simulateDisconnect: () => void;
  _simulateError: (msg: string) => void;
} {
  let callbacks: RealTimeCallbacks | null = null;

  const mock = {
    _callbacks: null as RealTimeCallbacks | null,

    connect: jest.fn((cbs: RealTimeCallbacks) => {
      callbacks = cbs;
      mock._callbacks = cbs;
    }),
    disconnect: jest.fn(),
    isConnected: jest.fn().mockReturnValue(false),

    _simulateSnapshot(tickets: Ticket[]) {
      callbacks?.onSnapshot(tickets);
    },
    _simulateUpdate(ticket: Ticket) {
      callbacks?.onTicketUpdate(ticket);
    },
    _simulateConnect() {
      callbacks?.onConnect();
    },
    _simulateDisconnect() {
      callbacks?.onDisconnect();
    },
    _simulateError(msg: string) {
      callbacks?.onError(msg);
    },
  };

  return mock;
}

export function mockAudioNotifier(): jest.Mocked<AudioNotifier> {
  return {
    init: jest.fn(),
    unlock: jest.fn().mockResolvedValue(undefined),
    play: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(false),
  };
}

export function mockSanitizer(): jest.Mocked<InputSanitizer> {
  return {
    sanitize: jest.fn((input: string) => input.trim()),
  };
}
