"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type ToastType = "success" | "error";

const DEFAULT_DURATION = 3000;

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>("success");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    clearTimer();
  }, [clearTimer]);

  const show = useCallback(
    (msg: string, toastType: ToastType, duration?: number) => {
      clearTimer();
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, duration ?? DEFAULT_DURATION);
    },
    [clearTimer]
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { message, type, visible, show, hide };
}
