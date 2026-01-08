import { useState, useCallback } from "react";
import { Toast } from "@/app/types";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const sizeId = () => Math.random().toString(36).substring(7);

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      const id = sizeId();
      // Smart duration based on type
      const duration =
        type === "success"
          ? 3000
          : type === "error" || type === "warning"
          ? 7000
          : 5000;
      const createdAt = Date.now();

      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, createdAt },
      ]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(
          () => setToasts((prev) => prev.filter((t) => t.id !== id)),
          duration
        );
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
