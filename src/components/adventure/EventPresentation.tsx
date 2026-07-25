import { useEffect, useMemo, useState } from "react";
import type { AdventureEventDefinition, AdventureEventRollResult } from "../../game/types";
import { ADVENTURE_EVENT_TIMING } from "../../game/timing";

type EventPresentationPhase = "title" | "description" | "choices" | "rolling" | "raw" | "bonus" | "outcome";

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
  onChoose,
  onContinue,
}: {
  definition?: AdventureEventDefinition;
  title: string;
  description: string;
  rollResult: AdventureEventRollResult | null;
  hasImmediateEncounter: boolean;
  onChoose: (choiceId: string) => void;
  onContinue: () => void;
}) {
  const [phase, setPhase] = useState<EventPresentationPhase>(() => rollResult ? "outcome" : "title");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(() => rollResult?.choiceId ?? null);
  const [displayedRoll, setDisplayedRoll] = useState(() => rollResult?.dieRoll ?? randomD100());
  const selectedChoice = useMemo(
    () => definition?.choices.find((choice) => choice.id === (selectedChoiceId ?? rollResult?.choiceId)),
    [definition, rollResult?.choiceId, selectedChoiceId],
  );

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
    setSelectedChoiceId(choiceId);
    setDisplayedRoll(randomD100());
    setPhase("rolling");
    onChoose(choiceId);
  };
  const introVisible = phase !== "title";
  const rollVisible = phase === "rolling" || phase === "raw" || phase === "bonus" || phase === "outcome";
  const counterPhase = phase === "rolling" ? "rolling" : phase === "raw" ? "landed" : "bonus";

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

        {rollVisible && selectedChoice && rollResult && (
          <div className="event-cinematic-resolution" aria-live="polite">
            <p className="event-choice-description">{selectedChoice.description}</p>
            <div className="event-roll-display">
              <div className={`initiative-counter ${counterPhase}`} aria-label={`D100 result ${displayedRoll}`}>
                <span>{displayedRoll}</span>
              </div>
              <small className="initiative-counter-label">
                {phase === "rolling" ? "Rolling D100" : phase === "raw" ? "Raw roll" : "Total"}
              </small>
              <div className="event-cinematic-math">
                {phase === "raw" && <span>D100 = {rollResult.dieRoll}</span>}
                {(phase === "bonus" || phase === "outcome") && (
                  <span>{rollResult.dieRoll} + {rollResult.statBonus} {capitalize(rollResult.stat)} = <strong>{rollResult.total}</strong></span>
                )}
              </div>
            </div>
            {phase === "outcome" && (
              <div className={`event-cinematic-outcome ${rollResult.success ? "success" : "failure"}`}>
                <strong>{rollResult.success ? "Success" : "Failure"}</strong>
                <p>{rollResult.outcomeText}</p>
                <small>Required total: {rollResult.threshold}</small>
                <button type="button" className="primary-button" onClick={onContinue}>
                  {hasImmediateEncounter ? "Face Encounter" : "Continue Journey"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
