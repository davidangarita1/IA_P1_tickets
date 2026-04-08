'use client';

import { useState, useCallback, useRef } from 'react';
import type { Shift } from '@/domain/Doctor';
import type { DoctorService } from '@/domain/ports/DoctorService';

export function useAvailableShifts(doctorService: DoctorService) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, Shift[]>());

  const fetchShifts = useCallback(
    async (office: string, excludeDoctorId?: string) => {
      const key = `${office}:${excludeDoctorId ?? ''}`;
      if (cache.current.has(key)) {
        setShifts(cache.current.get(key)!);
        return;
      }
      setLoading(true);
      try {
        const result = await doctorService.getAvailableShifts(office, excludeDoctorId);
        cache.current.set(key, result.availableShifts);
        setShifts(result.availableShifts);
      } catch {
        setShifts([]);
      } finally {
        setLoading(false);
      }
    },
    [doctorService],
  );

  return { shifts, loading, fetchShifts };
}
