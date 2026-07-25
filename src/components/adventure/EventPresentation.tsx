import { FlaskConical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GearSlotIcon } from "../GearSlotIcon";
import { ITEMS } from "../../game/data";
import { getItemGoldCost, isConsumableItem } from "../../game/items";
import type { AdventureEventDefinition, AdventureEventRollResult } from "../../game/types";
import { ADVENTURE_EVENT_TIMING } from "../../game/timing";
import { GoldIcon } from "../../ui/gameUi";

type EventPresentationPhase = "title" | "description" | "choices" | "direct" | "rolling" | "raw" | "bonus" | "outcome" | "merchant";

function randomD100() {
  return Math.floor(Math.random() * 100) + 1;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EventPresentation({
  definition,
  title,
  description,
  rollResult,
  hasImmediateEncounter,
  merchantItemIds,
  gold,
  onChoose,
  onPurchase,
  onContinue,
}: {
  definition?: AdventureEventDefinition;
  title: string;
  description: string;
  rollResult: AdventureEventRollResult | null;
  hasImmediateEncounter: boolean;
  merchantItemIds: string[];
  gold: number;
  onChoose: (choiceId: string) => void;
  onPurchase: (itemId: string) => void;
  onContinue: () => void;
}) {
  const [phase, setPhase] = useState<EventPresentationPhase>(() => rollResult ? "outcome" : "title");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(() => rollResult?.choiceId ?? null);
  const [displayedRoll, setDisplayedRoll] = useState(() => rollResult && rollResult.resolution !== "direct" ? rollResult.dieRoll : randomD100());
  const selectedChoice = useMemo(
    () => definition?.choices.find((choice) => choice.id === (selectedChoiceId ?? rollResult?.choiceId)),
    [definition, rollResult?.choiceId, selectedChoiceId],
  );
  const merchantItems = useMemo(() => merchantItemIds.flatMap((itemId) => {
    const item = ITEMS.find((candidate) => candidate.id === itemId);
    return item ? [item] : [];
  }), [merchantItemIds]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    if (rollResult) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setPhase("choices");
      return;
    }
    const descriptionTimer = window.setTimeout(() => setPhase("description"), ADVENTURE_EVENT_TIMING.descriptionMs);
    const choicesTimer = window.setTimeout(() => setPhase("choices"), ADVENTURE_EVENT_TIMING.choicesMs);
    return () => {
      window.clearTimeout(descriptionTimer);
      window.clearTimeout(choicesTimer);
    };
  }, [rollResult]);

  useEffect(() => {
    if (!rollResult || selectedChoiceId !== rollResult.choiceId || phase === "outcome") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rollResult.resolution === "direct") {
      if (reducedMotion) {
        setPhase("outcome");
        return;
      }
      const outcomeTimer = window.setTimeout(() => setPhase("outcome"), 650);
      return () => window.clearTimeout(outcomeTimer);
    }
    if (reducedMotion) {
      setDisplayedRoll(rollResult.total);
      setPhase("outcome");
      return;
    }
    const rollTimer = window.setInterval(() => setDisplayedRoll(randomD100()), ADVENTURE_EVENT_TIMING.rollTickMs);
    const rawTimer = window.setTimeout(() => {
      window.clearInterval(rollTimer);
      setDisplayedRoll(rollResult.dieRoll);
      setPhase("raw");
    }, ADVENTURE_EVENT_TIMING.rawRollMs);
    const bonusTimer = window.setTimeout(() => {
      setDisplayedRoll(rollResult.total);
      setPhase("bonus");
    }, ADVENTURE_EVENT_TIMING.bonusMs);
    const outcomeTimer = window.setTimeout(() => setPhase("outcome"), ADVENTURE_EVENT_TIMING.outcomeMs);
    return () => {
      window.clearInterval(rollTimer);
      window.clearTimeout(rawTimer);
      window.clearTimeout(bonusTimer);
      window.clearTimeout(outcomeTimer);
    };
  }, [rollResult, selectedChoiceId]);

  const choose = (choiceId: string) => {
    if (selectedChoiceId) return;
    const choice = definition?.choices.find((candidate) => candidate.id === choiceId);
    setSelectedChoiceId(choiceId);
    setDisplayedRoll(randomD100());
    setPhase(choice?.resolution === "direct" ? "direct" : "rolling");
    onChoose(choiceId);
  };
  const introVisible = phase !== "title";
  const rollVisible = phase === "rolling" || phase === "raw" || phase === "bonus" || phase === "outcome";
  const resolutionVisible = phase === "direct" || rollVisible;
  const counterPhase = phase === "rolling" ? "rolling" : phase === "raw" ? "landed" : "bonus";
  const checkedResult = rollResult?.resolution === "direct" ? null : rollResult;
  const directResult = rollResult?.resolution === "direct" ? rollResult : null;

  return (
    <section className={`event-cinematic phase-${phase}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="event-cinematic-stage">
        <h1 className="event-cinematic-title">{title}</h1>
        {introVisible && <p className="event-cinematic-description">{description}</p>}

        {phase === "choices" && (
          <div className="event-cinematic-choices" aria-label="Choose how to respond">
            {definition?.choices.map((choice, index) => (
              <button
                type="button"
                key={choice.id}
                style={{ "--event-choice-delay": `${index * 170}ms` } as React.CSSProperties}
                onClick={() => choose(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {resolutionVisible && selectedChoice && rollResult && (
          <div className="event-cinematic-resolution" aria-live="polite">
            <p className="event-choice-description">{selectedChoice.description}</p>
            {checkedResult && <div className="event-roll-display">
              <div className={`initiative-counter ${counterPhase}`} aria-label={`D100 result ${displayedRoll}`}>
                <span>{displayedRoll}</span>
              </div>
              <small className="initiative-counter-label">
                {phase === "rolling" ? "Rolling D100" : phase === "raw" ? "Raw roll" : "Total"}
              </small>
              <div className="event-cinematic-math">
                {phase === "raw" && <span>D100 = {checkedResult.dieRoll}</span>}
                {(phase === "bonus" || phase === "outcome") && (
                  <span>{checkedResult.dieRoll} + {checkedResult.statBonus} {capitalize(checkedResult.stat)} = <strong>{checkedResult.total}</strong></span>
                )}
              </div>
            </div>}
            {phase === "outcome" && (
              <div className={`event-cinematic-outcome ${directResult ? "direct" : checkedResult?.success ? "success" : "failure"}`}>
                <strong>{directResult ? "Outcome" : checkedResult?.success ? "Success" : "Failure"}</strong>
                <p>{rollResult.outcomeText}</p>
                {checkedResult && <small>Required total: {checkedResult.threshold}</small>}
                <button type="button" className="primary-button" onClick={() => merchantItems.length > 0 ? setPhase("merchant") : onContinue()}>
                  {merchantItems.length > 0 ? "Visit Merchant" : hasImmediateEncounter ? "Face Encounter" : "Continue Journey"}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "merchant" && (
          <div className="event-merchant" aria-live="polite">
            <div className="event-merchant-heading"><div><p className="eyebrow">Wandering Merchant</p><h2>Goods for the road</h2></div><span className="event-merchant-gold"><GoldIcon /> {gold}</span></div>
            <div className="event-merchant-grid">
              {merchantItems.map((item) => {
                const cost = getItemGoldCost(item);
                return <article className={`event-merchant-item ${item.rarity}`} key={item.id}>
                  <span className="event-merchant-icon">{isConsumableItem(item) ? <FlaskConical /> : <GearSlotIcon slot={item.slot} item={item} size={30} />}</span>
                  <small>{item.rarity}</small><strong>{item.name}</strong><p>{item.description}</p>
                  <button type="button" disabled={gold < cost} onClick={() => onPurchase(item.id)}><GoldIcon /> {cost} Gold</button>
                </article>;
              })}
            </div>
            <button type="button" className="secondary-button event-merchant-leave" onClick={onContinue}>Leave Merchant</button>
          </div>
        )}
      </div>
    </section>
  );
}
