import { useEffect, useId, useRef } from "react";

interface GameConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GameConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: GameConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);
  const cancelAction = useRef(onCancel);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => { cancelAction.current = onCancel; }, [onCancel]);
  useEffect(() => {
    cancelButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelAction.current();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="game-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="game-dialog danger" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <p className="eyebrow">Permanent Action</p>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="game-dialog-actions">
          <button ref={cancelButton} type="button" onClick={onCancel}>Keep Character</button>
          <button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
