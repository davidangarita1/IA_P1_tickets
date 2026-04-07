import type { TicketWriter } from '@/domain/ports/TicketWriter';
import type { TicketReader } from '@/domain/ports/TicketReader';
import type { RealTimeProvider, RealTimeCallbacks } from '@/domain/ports/RealTimeProvider';
import type { AudioNotifier } from '@/domain/ports/AudioNotifier';
import type { InputSanitizer } from '@/domain/ports/InputSanitizer';
import type { Ticket } from '@/domain/Ticket';
import type { CreateTicketResponse } from '@/domain/CreateTicket';
import type { User, UserRole } from '@/domain/User';
import type { AuthResult } from '@/domain/AuthCredentials';
import type { AuthService } from '@/domain/ports/AuthService';
import type { Doctor } from '@/domain/Doctor';
import type { DoctorService } from '@/domain/ports/DoctorService';

let idCounter = 0;

export function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  idCounter++;
  return {
    id: `ticket-${idCounter}`,
    name: `Patient ${idCounter}`,
    documentId: 1000000 + idCounter,
    office: null,
    timestamp: Date.now(),
    status: 'waiting',
    ...overrides,
  };
}

export function mockTicketWriter(
  response: CreateTicketResponse = { status: 'accepted', message: 'OK' },
): jest.Mocked<TicketWriter> {
  return {
    createTicket: jest.fn().mockResolvedValue(response),
  };
}

export function mockTicketReader(tickets: Ticket[] = []): jest.Mocked<TicketReader> {
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
    // istanbul ignore next
    sanitize: jest.fn((input: string) => input.trim()),
  };
}

let userIdCounter = 0;

export function buildUser(overrides: Partial<User> = {}): User {
  userIdCounter++;
  return {
    id: `user-${userIdCounter}`,
    email: `user${userIdCounter}@example.com`,
    name: `User ${userIdCounter}`,
    role: 'employee' as UserRole,
    ...overrides,
  };
}

export function mockAuthService(
  signInResult: AuthResult = { success: true, message: 'OK', user: undefined, token: 'jwt-token' },
  signUpResult: AuthResult = {
    success: true,
    message: 'Created',
    user: undefined,
    token: 'jwt-token',
  },
): jest.Mocked<AuthService> {
  return {
    signIn: jest.fn().mockResolvedValue(signInResult),
    signUp: jest.fn().mockResolvedValue(signUpResult),
    signOut: jest.fn().mockResolvedValue(undefined),
    getSession: jest.fn().mockResolvedValue(null),
  };
}

export function buildDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    _id: 'doc-1',
    name: 'Juan García',
    documentId: '12345678',
    office: '2',
    shift: '06:00-14:00',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function mockDoctorService(doctors: Doctor[] = []): jest.Mocked<DoctorService> {
  return {
    getAll: jest.fn().mockResolvedValue(doctors),
    create: jest.fn().mockResolvedValue(doctors[0] ?? buildDoctor()),
    update: jest.fn().mockResolvedValue(doctors[0] ?? buildDoctor()),
    remove: jest.fn().mockResolvedValue(undefined),
    getAvailableShifts: jest.fn().mockResolvedValue({
      office: '1',
      availableShifts: ['06:00-14:00', '14:00-22:00'],
      occupiedShifts: [],
    }),
  };
}
