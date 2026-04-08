'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Ticket } from '@/domain/Ticket';
import type { RealTimeProvider } from '@/domain/ports/RealTimeProvider';

export function useTicketsWebSocket(realTime: RealTimeProvider) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const updateTicket = useCallback((updatedTicket: Ticket) => {
    setTickets((prev) => {
      const index = prev.findIndex((t) => t.id === updatedTicket.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = updatedTicket;
        return next;
      }
      return [...prev, updatedTicket];
    });
  }, []);

  useEffect(() => {
    realTime.connect({
      onSnapshot: (data) => {
        setTickets(data);
        setError(null);
      },
      onTicketUpdate: updateTicket,
      onConnect: () => {
        setConnected(true);
        setError(null);
      },
      onDisconnect: () => setConnected(false),
      onError: (msg) => {
        setError(msg);
        setConnected(false);
      },
    });

    return () => realTime.disconnect();
  }, [realTime, updateTicket]);

  return { tickets, error, connected };
}
