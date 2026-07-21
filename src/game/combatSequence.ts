import type { CombatState } from "./types";
import { COMBAT_TIMING } from "./timing";

export function isCombatSequencePending(combat: CombatState): boolean {
  return combat.floatingEvents.length > 0 && combat.completedSequenceEventId < combat.eventId;
}

export function eventRevealsPlayerTurn(combat: CombatState, eventIndex: number): boolean {
  const effect = combat.pendingEffects.find((candidate) => candidate.eventIndex === eventIndex);
  return effect?.type === "turn" && combat.turnOrder[effect.activeTurnIndex]?.kind === "player";
}

export function isHiddenDamageEvent(combat: CombatState, eventIndex: number): boolean {
  return combat.pendingEffects.some((effect) => (
    effect.eventIndex === eventIndex && "damage" in effect
  ));
}

export function isHiddenPlayerAbilityEvent(combat: CombatState, eventIndex: number): boolean {
  return combat.floatingEvents[eventIndex]?.startsWith("You use ") ?? false;
}

export function getCombatEventDurationMs(combat: CombatState, eventIndex: number): number {
  const directAttack = combat.pendingEffects.find((effect) => (
    effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId)
  ));
  const hitCount = directAttack && "damage" in directAttack ? Math.max(1, directAttack.animationHitCount ?? 1) : 1;
  if (directAttack) return COMBAT_TIMING.attackDurationMs / hitCount;
  if (isHiddenDamageEvent(combat, eventIndex)) return COMBAT_TIMING.damageNumberMs;
  if (isHiddenPlayerAbilityEvent(combat, eventIndex)) return COMBAT_TIMING.silentEventMs;
  return COMBAT_TIMING.floatingMessageMs;
}
