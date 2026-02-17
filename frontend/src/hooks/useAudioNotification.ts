"use client";

import { useEffect, useState } from "react";
import { audioService } from "@/services/AudioService";

/**
 * Hook that encapsulates audio initialization and unlock logic.
 *
 * ⚕️ HUMAN CHECK - Extracted from page.tsx and dashboard/page.tsx
 * to eliminate duplicated audio management code (FRONT-A3, FRONT-B4).
 *
 * Features:
 * - Initializes audio on mount
 * - Waits for user gesture to unlock (autoplay policy)
 * - Cleans up event listeners on unmount
 * - Exposes `audioEnabled` state and `play()` method
 */
export function useAudioNotification(src = "/sounds/ding.mp3", volume = 0.6) {
    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        audioService.init(src, volume);

        const unlock = async () => {
            await audioService.unlock();
            setAudioEnabled(audioService.isEnabled());
        };

        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });

        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
    }, [src, volume]);

    const play = () => {
        if (audioService.isEnabled()) {
            audioService.play();
        }
    };

    return { audioEnabled, play };
}
