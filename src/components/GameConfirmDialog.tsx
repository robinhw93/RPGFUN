import { useEffect, useId, useRef } from "react";

interface GameConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  eyebrow?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss?: () => void;
}

export function GameConfirmDialog({ title, description, confirmLabel, cancelLabel = "Keep Character", eyebrow = "Permanent Action", variant = "danger", onConfirm, onCancel, onDismiss }: GameConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  const dismissAction = useRef(onDismiss ?? onCancel);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => { dismissAction.current = onDismiss ?? onCancel; }, [onCancel, onDismiss]);
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    cancelButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissAction.current();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="game-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) (onDismiss ?? onCancel)(); }}>
      <section className={`game-dialog ${variant}`} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="game-dialog-actions">
          <button ref={cancelButton} type="button" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={variant === "danger" ? "danger-button" : "confirm-button"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
