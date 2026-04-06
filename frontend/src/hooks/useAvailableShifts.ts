"use client";

import { useState, useCallback } from "react";
import type { FranjaHoraria } from "@/domain/Doctor";
import type { DoctorService } from "@/domain/ports/DoctorService";

export function useAvailableShifts(doctorService: DoctorService) {
  const [shifts, setShifts] = useState<FranjaHoraria[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShifts = useCallback(
    async (consultorio: string, excludeDoctorId?: string) => {
      setLoading(true);
      try {
        const result = await doctorService.getAvailableShifts(
          consultorio,
          excludeDoctorId
        );
        setShifts(result.available_shifts);
      } catch {
        setShifts([]);
      } finally {
        setLoading(false);
      }
    },
    [doctorService]
  );

  return { shifts, loading, fetchShifts };
}
