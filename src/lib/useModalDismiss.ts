import { useEffect } from "react";

/**
 * Shared modal chrome: close on Escape and lock body scroll while open.
 * @param onClose  called when the user presses Escape.
 * @param active   whether the modal is currently open (default true).
 */
export function useModalDismiss(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, active]);
}
