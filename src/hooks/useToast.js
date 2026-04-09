import { useState, useCallback } from "react";

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "default", duration = 2500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    show:    (msg) => addToast(msg, "default"),
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
  };

  return { toasts, toast };
}
