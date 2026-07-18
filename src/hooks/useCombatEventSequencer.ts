import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { primeCombatAttack, resolveCombatEvent } from "../game/engine";
import { COMBAT_TIMING } from "../game/timing";
import type { GameState } from "../game/types";

export function useCombatEventSequencer(game: GameState, setGame: Dispatch<SetStateAction<GameState>>) {
  const gameRef = useRef(game);
  const impactTimers = useRef<number[]>([]);
  const scheduledEffects = useRef(new Set<string>());

  gameRef.current = game;
  useEffect(() => () => {
    impactTimers.current.forEach((timer) => window.clearTimeout(timer));
    scheduledEffects.current.clear();
  }, []);

  return useCallback((eventId: number, eventIndex: number) => {
    const visibleCombat = gameRef.current.adventure.combat;
    const attackEffect = visibleCombat?.pendingEffects.find((effect) => effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId));

    if (visibleCombat?.eventId === eventId && attackEffect) {
      const scheduleKey = `${eventId}:${attackEffect.id}`;
      if (scheduledEffects.current.has(scheduleKey)) return;
      scheduledEffects.current.add(scheduleKey);
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
      }, COMBAT_TIMING.attackImpactMs);
      impactTimers.current.push(impactTimer);
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
}
