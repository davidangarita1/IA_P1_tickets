"use client";

import { useState, useRef, useEffect } from "react";
import { CreateAppointmentDTO } from "@/domain/CreateAppointment";
import { HttpAppointmentRepository } from "@/repositories/HttpAppointmentRepository";
import { getUserErrorMessage } from "@/utils/error-guard";

/**
 * Hook for registering appointments.
 *
 * ⚕️ HUMAN CHECK - Refactored: error mapping extracted to error-guard.ts (FRONT-B2)
 *
 * Features:
 * - Prevents double submit
 * - Prevents setState after unmount
 * - Typed error handling (zero `any`)
 * - Repository singleton (no recreation)
 * - Circuit Breaker compatible
 */
export function useAppointmentRegistration() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isMountedRef = useRef(true);
    const inFlightRef = useRef(false);
    const repositoryRef = useRef<HttpAppointmentRepository | null>(null);

    if (!repositoryRef.current) {
        repositoryRef.current = new HttpAppointmentRepository();
    }

    useEffect(() => {
        return () => { isMountedRef.current = false; };
    }, []);

    const safeSet = <T,>(setter: (v: T) => void, value: T) => {
        if (isMountedRef.current) setter(value);
    };

    const register = async (data: CreateAppointmentDTO) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        safeSet(setLoading, true);
        safeSet(setSuccess, null);
        safeSet(setError, null);

        try {
            const res = await repositoryRef.current!.createAppointment(data);
            safeSet(setSuccess, res.message ?? "Appointment registered successfully");
        } catch (err: unknown) {
            safeSet(setError, getUserErrorMessage(err));
        } finally {
            safeSet(setLoading, false);
            inFlightRef.current = false;
        }
    };

    return { register, loading, success, error };
}
