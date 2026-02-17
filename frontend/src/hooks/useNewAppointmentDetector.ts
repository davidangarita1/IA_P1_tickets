"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook that detects new items in a tracked list and triggers notifications.
 *
 * ⚕️ HUMAN CHECK - Extracted from page.tsx and dashboard/page.tsx
 * to eliminate duplicated detection + toast logic (FRONT-A4, FRONT-B4).
 *
 * Features:
 * - Compares current count with previous snapshot
 * - Fires `onNew` callback when count increases
 * - Manages toast visibility with auto-dismiss
 * - Skips first render (initial snapshot)
 */
export function useNewAppointmentDetector(
    count: number,
    onNew?: () => void,
    toastDuration = 2600,
) {
    const lastCountRef = useRef<number | null>(null);
    const [showToast, setShowToast] = useState(false);

    const stableOnNew = useCallback(() => {
        onNew?.();
    }, [onNew]);

    useEffect(() => {
        // First render → only save snapshot
        if (lastCountRef.current === null) {
            lastCountRef.current = count;
            return;
        }

        if (count > lastCountRef.current) {
            stableOnNew();

            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), toastDuration);
            return () => clearTimeout(timer);
        }

        lastCountRef.current = count;
    }, [count, stableOnNew, toastDuration]);

    return { showToast };
}
