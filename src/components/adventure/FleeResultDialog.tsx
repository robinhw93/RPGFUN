import { useEffect, useId, useRef } from "react";
import type { CombatFleeResult } from "../../game/flee";
import { getItemNameClass, GoldIcon } from "../../ui/gameUi";

export function FleeResultDialog({ result, onAcknowledge }: { result: CombatFleeResult; onAcknowledge: () => void }) {
  const acknowledgeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    acknowledgeButton.current?.focus();
    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="game-dialog-backdrop flee-result-backdrop" role="presentation">
      <section className="game-dialog flee-result-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <p className="eyebrow">Retreat</p>
        <h2 id={titleId}>You escaped</h2>
        <p id={descriptionId}>You made it out alive, but fleeing came at a cost.</p>
        <div className="flee-result-losses">
          <div className="flee-result-loss">
            <span>Gold lost</span>
            <strong><GoldIcon /> {result.goldLost} Gold</strong>
            <small>{result.goldLossPercent}% of your Gold</small>
          </div>
          <div className="flee-result-loss">
            <span>Equipped item</span>
            {result.lostItem ? (
              <strong className={getItemNameClass(result.lostItem)}>{result.lostItem.name}</strong>
            ) : (
              <strong>None lost</strong>
            )}
            <small>{result.lostItem ? "Lost while running away" : "You kept all equipped items"}</small>
          </div>
        </div>
        <div className="game-dialog-actions single-action">
          <button ref={acknowledgeButton} type="button" onClick={onAcknowledge}>Okay.</button>
        </div>
      </section>
    </div>
  );
}
