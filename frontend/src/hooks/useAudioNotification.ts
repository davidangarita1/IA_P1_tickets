"use client";

import { useEffect, useState, useCallback } from "react";
import type { AudioNotifier } from "@/domain/ports/AudioNotifier";

const AUDIO_SRC = "/sounds/ding.mp3";
const TOAST_DURATION = 2600;

export function useAudioNotification(audio: AudioNotifier) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    audio.init(AUDIO_SRC, 0.6);

    const unlock = async () => {
      await audio.unlock();
      setAudioEnabled(audio.isEnabled());
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [audio]);

  const notify = useCallback(
    (message: string) => {
      if (audio.isEnabled()) {
        audio.play();
      }
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), TOAST_DURATION);
    },
    [audio]
  );

  return { audioEnabled, showToast, toastMessage, notify };
}
