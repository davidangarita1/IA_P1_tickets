"use client";

import { useState, useRef, useEffect } from "react";
import type { CreateTicketDTO } from "@/domain/CreateTicket";
import type { TicketWriter } from "@/domain/ports/TicketWriter";
import type { TicketReader } from "@/domain/ports/TicketReader";

const ERROR_MESSAGES: Record<string, string> = {
  TIMEOUT: "El servidor tardó demasiado. Intente nuevamente.",
  RATE_LIMIT: "Demasiadas solicitudes. Espere unos segundos.",
  HTTP_ERROR: "Error del servidor. Intente más tarde.",
  SERVER_ERROR: "Error del servidor. Intente más tarde.",
  CIRCUIT_OPEN: "Servidor temporalmente no disponible. Reintentando...",
};

export const DUPLICATE_ACTIVE_MSG =
  "Ya existe un turno activo para esta cédula.";

function mapError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  return ERROR_MESSAGES[message] ?? "No se pudo registrar el turno.";
}

export function useCreateTicket(writer: TicketWriter, reader: TicketReader) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSet = <T,>(setter: (v: T) => void, value: T) => {
    if (isMountedRef.current) setter(value);
  };

  const submit = async (data: CreateTicketDTO): Promise<boolean> => {
    if (inFlightRef.current) return false;
    inFlightRef.current = true;

    safeSet(setLoading, true);
    safeSet(setSuccess, null);
    safeSet(setError, null);

    try {
      const existingTickets = await reader.getTickets();
      const hasDuplicate = existingTickets.some(
        (t) =>
          t.documentId === data.documentId &&
          (t.status === "waiting" || t.status === "called"),
      );
      if (hasDuplicate) {
        safeSet(setError, DUPLICATE_ACTIVE_MSG);
        return false;
      }

      const res = await writer.createTicket(data);
      safeSet(setSuccess, res.message ?? "Turno registrado correctamente");
      return true;
    } catch (err: unknown) {
      safeSet(setError, mapError(err));
      return false;
    } finally {
      safeSet(setLoading, false);
      inFlightRef.current = false;
    }
  };

  return { submit, loading, success, error };
}
