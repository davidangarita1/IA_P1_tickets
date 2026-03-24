"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { TicketWriter } from "@/domain/ports/TicketWriter";
import type { TicketReader } from "@/domain/ports/TicketReader";
import type { RealTimeProvider } from "@/domain/ports/RealTimeProvider";
import type { AudioNotifier } from "@/domain/ports/AudioNotifier";
import type { InputSanitizer } from "@/domain/ports/InputSanitizer";
import type { AuthService } from "@/domain/ports/AuthService";
import { HttpTicketAdapter } from "@/infrastructure/adapters/HttpTicketAdapter";
import { SocketIOAdapter } from "@/infrastructure/adapters/SocketIOAdapter";
import { BrowserAudioAdapter } from "@/infrastructure/adapters/BrowserAudioAdapter";
import { HtmlSanitizer } from "@/infrastructure/adapters/HtmlSanitizer";
import { HttpAuthAdapter } from "@/infrastructure/adapters/HttpAuthAdapter";
import { env } from "@/config/env";

export interface Dependencies {
  ticketWriter: TicketWriter;
  ticketReader: TicketReader;
  realTime: RealTimeProvider;
  audio: AudioNotifier;
  sanitizer: InputSanitizer;
  authService: AuthService;
}

const DependencyContext = createContext<Dependencies | null>(null);

export function useDeps(): Dependencies {
  const deps = useContext(DependencyContext);
  if (!deps) throw new Error("DependencyProvider is required");
  return deps;
}

interface DependencyProviderProps {
  children: ReactNode;
  overrides?: Partial<Dependencies>;
}

export function DependencyProvider({ children, overrides }: DependencyProviderProps) {
  const deps = useMemo<Dependencies>(() => {
    const ticketAdapter = new HttpTicketAdapter(env.API_BASE_URL);
    return {
      ticketWriter: ticketAdapter,
      ticketReader: ticketAdapter,
      realTime: new SocketIOAdapter(env.WS_URL),
      audio: new BrowserAudioAdapter(),
      sanitizer: new HtmlSanitizer(),
      authService: new HttpAuthAdapter(env.API_BASE_URL),
      ...overrides,
    };
  }, [overrides]);

  return (
    <DependencyContext.Provider value={deps}>
      {children}
    </DependencyContext.Provider>
  );
}
