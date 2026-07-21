import type { CombatState } from "./types";
import { COMBAT_TIMING } from "./timing";

export function isCombatSequencePending(combat: CombatState): boolean {
  return combat.floatingEvents.length > 0 && combat.completedSequenceEventId < combat.eventId;
}

export function eventRevealsPlayerTurn(combat: CombatState, eventIndex: number): boolean {
  const effect = combat.pendingEffects.find((candidate) => candidate.eventIndex === eventIndex);
  return effect?.type === "turn" && combat.turnOrder[effect.activeTurnIndex]?.kind === "player";
}

export function getCombatEventDurationMs(combat: CombatState, eventIndex: number): number {
  const directAttack = combat.pendingEffects.find((effect) => (
    effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId)
  ));
  const hitCount = directAttack && "damage" in directAttack ? Math.max(1, directAttack.animationHitCount ?? 1) : 1;
  return hitCount > 1 ? COMBAT_TIMING.attackDurationMs / hitCount : COMBAT_TIMING.floatingMessageMs;
}
