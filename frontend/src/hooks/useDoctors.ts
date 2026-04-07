'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Doctor, CreateDoctorData, UpdateDoctorData } from '@/domain/Doctor';
import type { DoctorService } from '@/domain/ports/DoctorService';

function mapError(err: unknown): string {
  const message = err instanceof Error ? err.message : '';
  if (message.includes('401')) return 'No autorizado. Inicie sesión nuevamente.';
  if (message.includes('403')) return 'No tiene permisos para realizar esta acción.';
  if (message.includes('409')) return 'Conflicto con los datos existentes. Verifique la información.';
  if (message.includes('500')) return 'Error del servidor. Intente más tarde.';
  return 'Error al cargar médicos.';
}

export function useDoctors(doctorService: DoctorService) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await doctorService.getAll();
      setDoctors(result);
    } catch (err: unknown) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  }, [doctorService]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const create = useCallback(
    async (data: CreateDoctorData): Promise<Doctor> => {
      return doctorService.create(data);
    },
    [doctorService],
  );

  const update = useCallback(
    async (id: string, data: UpdateDoctorData): Promise<Doctor> => {
      return doctorService.update(id, data);
    },
    [doctorService],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      return doctorService.remove(id);
    },
    [doctorService],
  );

  const refresh = useCallback(async () => {
    await loadDoctors();
  }, [loadDoctors]);

  return { doctors, loading, error, create, update, remove, refresh };
}
