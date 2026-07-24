import {
  Target
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getCombatInitiative } from "../../game/engine";
import { calculateInitiativeFlight, getInitiativeRowBounds } from "../../game/initiativeLayout";
import { COMBAT_TIMING, INITIATIVE_TIMING } from "../../game/timing";
import type { CombatState } from "../../game/types";

export function InitiativeRoll({ combat, onComplete }: { combat: CombatState; onComplete: () => void }) {
  const [phase, setPhase] = useState<"rolling" | "landed" | "bonus" | "order">("rolling");
  const [displayedRolls, setDisplayedRolls] = useState<Record<string, number>>(() => Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, Math.floor(Math.random() * 100) + 1])));
  const [landingRect, setLandingRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [flightGeometry, setFlightGeometry] = useState<Record<string, { x: number; y: number; scaleX: number; scaleY: number }>>({});
  const neutralOrder = useMemo(() => {
    const player = combat.turnOrder.find((actor) => actor.kind === "player");
    const enemies = combat.enemies
      .map((enemy) => combat.turnOrder.find((actor) => actor.actorId === enemy.instanceId))
      .filter((actor): actor is CombatState["turnOrder"][number] => Boolean(actor));
    return player ? [player, ...enemies] : enemies;
  }, [combat.enemies, combat.turnOrder]);
  const participants = phase === "order" ? combat.turnOrder : neutralOrder;

  useEffect(() => {
    const captureLandingRect = () => {
      const targetCards = [...document.querySelectorAll<HTMLElement>(".turn-order-bar > div > span")];
      const bounds = getInitiativeRowBounds(targetCards.map((card) => card.getBoundingClientRect()));
      if (bounds) setLandingRect(bounds);
    };
    captureLandingRect();
    window.addEventListener("resize", captureLandingRect);
    return () => window.removeEventListener("resize", captureLandingRect);
  }, []);

  useEffect(() => {
    const rollTimer = window.setInterval(() => {
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, Math.floor(Math.random() * 100) + 1])));
    }, INITIATIVE_TIMING.rollTickMs);
    const landedTimer = window.setTimeout(() => {
      window.clearInterval(rollTimer);
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, actor.roll])));
      setPhase("landed");
    }, INITIATIVE_TIMING.rawRollMs);
    const bonusTimer = window.setTimeout(() => {
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, actor.initiative])));
      setPhase("bonus");
    }, INITIATIVE_TIMING.bonusMs);
    let orderFrame = 0;
    const orderTimer = window.setTimeout(() => {
      const targetCards = [...document.querySelectorAll<HTMLElement>(".turn-order-bar > div > span")];
      const sourceCards = [...document.querySelectorAll<HTMLElement>(".initiative-overlay .initiative-contestant")];
      const nextGeometry: Record<string, { x: number; y: number; scaleX: number; scaleY: number }> = {};
      const bounds = getInitiativeRowBounds(targetCards.map((card) => card.getBoundingClientRect()));
      if (bounds) setLandingRect(bounds);
      sourceCards.forEach((sourceCard) => {
        const actorId = sourceCard.dataset.initiativeActor;
        const targetIndex = combat.turnOrder.findIndex((actor) => actor.actorId === actorId);
        const targetCard = targetCards[targetIndex];
        if (!actorId || !targetCard) return;
        const source = sourceCard.getBoundingClientRect();
        const target = targetCard.getBoundingClientRect();
        nextGeometry[actorId] = calculateInitiativeFlight(source, target);
      });
      setFlightGeometry(nextGeometry);
      orderFrame = window.requestAnimationFrame(() => setPhase("order"));
    }, INITIATIVE_TIMING.orderMs);
    const completeTimer = window.setTimeout(onComplete, INITIATIVE_TIMING.completeMs);
    return () => {
      window.clearInterval(rollTimer);
      window.clearTimeout(landedTimer);
      window.clearTimeout(bonusTimer);
      window.clearTimeout(orderTimer);
      window.clearTimeout(completeTimer);
      window.cancelAnimationFrame(orderFrame);
    };
  }, [combat.eventId]);

  return (
    <div
      className={`initiative-overlay ${phase}`}
      style={{ "--initiative-flight-duration": `${INITIATIVE_TIMING.flightMs}ms` } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Rolling initiative"
    >
      <div className="initiative-panel">
        <p className="eyebrow">Combat Begins</p>
        <h2>{phase === "rolling" ? "Rolling Initiative" : phase === "landed" ? "Rolls Locked" : phase === "bonus" ? "Applying Bonuses" : "Turn Order"}</h2>
        <p className="initiative-caption" aria-live="polite">{phase === "rolling" ? "The D100 counters are racing." : phase === "landed" ? "\u00A0" : phase === "bonus" ? "Initiative bonuses are now added." : "Highest initiative acts first."}</p>
        <div className="initiative-contestants" style={{
          "--initiative-count": participants.length,
          ...(landingRect ? {
            "--initiative-target-top": `${landingRect.top}px`,
            "--initiative-target-left": `${landingRect.left}px`,
            "--initiative-target-width": `${landingRect.width}px`,
            "--initiative-target-height": `${landingRect.height}px`,
          } : {}),
        } as React.CSSProperties}>
          {participants.map((actor, index) => {
            const geometry = flightGeometry[actor.actorId];
            return (
              <article
                className={`initiative-contestant ${actor.kind}`}
                data-initiative-actor={actor.actorId}
                key={actor.actorId}
                style={{
                  "--initiative-delay": `${index * 90}ms`,
                  "--initiative-from-x": `${geometry?.x ?? 0}px`,
                  "--initiative-from-y": `${geometry?.y ?? 0}px`,
                  "--initiative-from-scale-x": geometry?.scaleX ?? 1,
                  "--initiative-from-scale-y": geometry?.scaleY ?? 1,
                } as React.CSSProperties}
              >
                <strong className="initiative-name">{actor.kind === "player" ? "You" : actor.name}</strong>
                <div className={`initiative-counter ${phase}`} aria-label={`D100 result ${displayedRolls[actor.actorId]}`}>
                  <span>{displayedRolls[actor.actorId]}</span>
                </div>
                <small className="initiative-counter-label">{phase === "rolling" ? "Rolling D100" : phase === "landed" ? "Raw roll" : "Final initiative"}</small>
                <div className="initiative-math">
                  {phase === "landed" ? <span>D100 = {actor.roll}</span> : phase === "bonus" ? <span>{actor.roll}{actor.bonus > 0 ? ` + ${actor.bonus} bonus` : " + 0 bonus"}</span> : <span>&nbsp;</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TurnOrderBar({ combat }: { combat: CombatState }) {
  const rowElement = useRef<HTMLDivElement | null>(null);
  const cardElements = useRef(new Map<string, HTMLSpanElement>());
  const previousPositions = useRef(new Map<string, DOMRect>());
  const reorderAnimations = useRef(new Map<string, Animation>());
  const orderSignature = combat.turnOrder.map((actor) => actor.actorId).join("|");
  const lightSpeedTurn = (combat.abilityAnimations ?? []).some((animation) => animation.kind === "light_speed_turn");

  useLayoutEffect(() => {
    reorderAnimations.current.forEach((animation) => animation.cancel());
    reorderAnimations.current.clear();

    const nextPositions = new Map<string, DOMRect>();
    cardElements.current.forEach((element, actorId) => nextPositions.set(actorId, element.getBoundingClientRect()));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion && previousPositions.current.size > 0) {
      nextPositions.forEach((nextPosition, actorId) => {
        const previousPosition = previousPositions.current.get(actorId);
        const element = cardElements.current.get(actorId);
        if (!previousPosition || !element) return;
        const x = previousPosition.left - nextPosition.left;
        const y = previousPosition.top - nextPosition.top;
        if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
        const animation = element.animate(
          [{ transform: `translate3d(${x}px, ${y}px, 0)` }, { transform: "translate3d(0, 0, 0)" }],
          { duration: COMBAT_TIMING.turnOrderReorderMs, easing: "cubic-bezier(.2,.82,.2,1)" },
        );
        reorderAnimations.current.set(actorId, animation);
        animation.onfinish = () => reorderAnimations.current.delete(actorId);
        animation.oncancel = () => reorderAnimations.current.delete(actorId);
      });
    }

    previousPositions.current = nextPositions;
  }, [orderSignature]);

  useEffect(() => {
    const updatePositions = () => {
      if (reorderAnimations.current.size > 0) return;
      previousPositions.current = new Map(
        [...cardElements.current].map(([actorId, element]) => [actorId, element.getBoundingClientRect()]),
      );
    };
    const resizeObserver = new ResizeObserver(updatePositions);
    if (rowElement.current) resizeObserver.observe(rowElement.current);
    return () => {
      resizeObserver.disconnect();
      reorderAnimations.current.forEach((animation) => animation.cancel());
      reorderAnimations.current.clear();
    };
  }, []);

  return (
    <div className={`turn-order-bar ${lightSpeedTurn ? "light-speed-turn" : ""}`} aria-label={`Turn order, round ${combat.turn}`}>
      <span className="round-label">Round {combat.turn}</span>
      <div ref={rowElement}>
        {combat.turnOrder.map((actor, index) => {
          const enemy = actor.kind === "enemy" ? combat.enemies.find((candidate) => candidate.instanceId === actor.actorId) : null;
          const defeated = actor.kind === "player" ? combat.playerHp <= 0 : (enemy?.hp ?? 0) <= 0;
          const currentTarget = Boolean(enemy && enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth"));
          const initiative = getCombatInitiative(combat, actor);
          return (
            <span
              key={actor.actorId}
              ref={(element) => {
                if (element) cardElements.current.set(actor.actorId, element);
                else cardElements.current.delete(actor.actorId);
              }}
              data-turn-actor={actor.actorId}
              className={`${index === combat.activeTurnIndex ? "active" : ""} ${defeated ? "defeated" : ""} ${currentTarget ? "current-target" : ""} ${actor.kind}`}
              data-game-tooltip={`${actor.name}: ${initiative} Initiative${currentTarget ? " · Current target" : ""}`}
              data-tooltip-placement="bottom"
              aria-label={`${actor.kind === "player" ? "You" : actor.name}, ${initiative} Initiative${currentTarget ? ", current target" : ""}`}
            >
              <span className="turn-order-name">{currentTarget && <Target className="turn-order-target-icon" size={10} aria-hidden="true" />}<b>{actor.kind === "player" ? "You" : actor.name}</b></span>
              <small>{initiative}</small>
            </span>
          );
        })}
      </div>
    </div>
  );
}
