"use client";

import { useState, useRef, useEffect } from "react";
import type { CreateAppointmentDTO } from "@/domain/CreateAppointment";
import type { AppointmentRepository } from "@/repositories/AppointmentRepository";
import { HttpAppointmentRepository } from "@/repositories/HttpAppointmentRepository";

const ERROR_MESSAGES: Record<string, string> = {
  TIMEOUT: "El servidor tardó demasiado. Intente nuevamente.",
  RATE_LIMIT: "Demasiadas solicitudes. Espere unos segundos.",
  HTTP_ERROR: "Error del servidor. Intente más tarde.",
  SERVER_ERROR: "Error del servidor. Intente más tarde.",
  CIRCUIT_OPEN: "Servidor temporalmente no disponible. Reintentando...",
};

function mapError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  return ERROR_MESSAGES[message] ?? "No se pudo registrar el turno.";
}

export function useAppointmentRegistration() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const repositoryRef = useRef<AppointmentRepository | null>(null);

  useEffect(() => {
    repositoryRef.current = new HttpAppointmentRepository();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const register = async (data: CreateAppointmentDTO) => {
    if (inFlightRef.current || !repositoryRef.current) return;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await repositoryRef.current.createAppointment(data);
      if (isMountedRef.current) {
        setSuccess("Turno registrado correctamente");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(mapError(err));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        inFlightRef.current = false;
      }
    }
  };

  return { register, loading, success, error };
}
