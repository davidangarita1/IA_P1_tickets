"use client";

import { useState, useCallback } from "react";
import type { Shift } from "@/domain/Doctor";
import type { DoctorService } from "@/domain/ports/DoctorService";

export function useAvailableShifts(doctorService: DoctorService) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShifts = useCallback(
    async (office: string, excludeDoctorId?: string) => {
      setLoading(true);
      try {
        const result = await doctorService.getAvailableShifts(
          office,
          excludeDoctorId
        );
        setShifts(result.availableShifts);
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
