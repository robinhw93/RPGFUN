import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { finishCombatAttack, primeCombatAttack, resolveCombatEvent } from "../game/engine";
import { COMBAT_TIMING } from "../game/timing";
import type { CombatPendingEffect, GameState } from "../game/types";

export function useCombatEventSequencer(game: GameState, setGame: Dispatch<SetStateAction<GameState>>) {
  const gameRef = useRef(game);
  const impactTimers = useRef<number[]>([]);
  const scheduledEffects = useRef(new Set<string>());

  gameRef.current = game;
  useEffect(() => () => {
    impactTimers.current.forEach((timer) => window.clearTimeout(timer));
    scheduledEffects.current.clear();
  }, []);

  const revealEvent = useCallback((eventId: number, eventIndex: number) => {
    const visibleCombat = gameRef.current.adventure.combat;
    const attackEffect = visibleCombat?.pendingEffects.find((effect): effect is Extract<CombatPendingEffect, { damage: number }> => (
      effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId)
    ));

    if (visibleCombat?.eventId === eventId && attackEffect) {
      const scheduleKey = `${eventId}:${attackEffect.id}`;
      if (scheduledEffects.current.has(scheduleKey)) return;
      scheduledEffects.current.add(scheduleKey);
      const animationHitCount = Math.max(1, attackEffect.animationHitCount ?? 1);
      const animationDurationMultiplier = Math.max(0.1, attackEffect.animationDurationMultiplier ?? 1);
      const animationId = (visibleCombat.attackAnimationId ?? 0) + 1;
      setGame((current) => {
        const combat = current.adventure.combat;
        if (!combat) return current;
        const primed = primeCombatAttack(combat, eventId, eventIndex);
        if (primed === combat) return current;
        return { ...current, adventure: { ...current.adventure, combat: primed } };
      });

      let impactTimer = 0;
      impactTimer = window.setTimeout(() => {
        setGame((current) => {
          const combat = current.adventure.combat;
          if (!combat) return current;
          const resolved = resolveCombatEvent(combat, eventId, eventIndex);
          if (resolved === combat) return current;
          return { ...current, adventure: { ...current.adventure, combat: resolved } };
        });
        scheduledEffects.current.delete(scheduleKey);
        impactTimers.current = impactTimers.current.filter((timer) => timer !== impactTimer);
      }, COMBAT_TIMING.attackImpactMs * animationDurationMultiplier / animationHitCount);
      impactTimers.current.push(impactTimer);

      let finishTimer = 0;
      finishTimer = window.setTimeout(() => {
        setGame((current) => {
          const combat = current.adventure.combat;
          if (!combat) return current;
          const finished = finishCombatAttack(combat, eventId, animationId);
          if (finished === combat) return current;
          return { ...current, adventure: { ...current.adventure, combat: finished } };
        });
        impactTimers.current = impactTimers.current.filter((timer) => timer !== finishTimer);
      }, COMBAT_TIMING.attackDurationMs * animationDurationMultiplier / animationHitCount);
      impactTimers.current.push(finishTimer);
      return;
    }

    setGame((current) => {
      const combat = current.adventure.combat;
      if (!combat) return current;
      const resolved = resolveCombatEvent(combat, eventId, eventIndex);
      if (resolved === combat) return current;
      return { ...current, adventure: { ...current.adventure, combat: resolved } };
    });
  }, [setGame]);

  const completeSequence = useCallback((eventId: number) => {
    setGame((current) => {
      const combat = current.adventure.combat;
      if (!combat || combat.eventId !== eventId || combat.completedSequenceEventId >= eventId) return current;
      return {
        ...current,
        adventure: {
          ...current.adventure,
          combat: { ...combat, completedSequenceEventId: eventId },
        },
      };
    });
  }, [setGame]);

  return { revealEvent, completeSequence };
}
