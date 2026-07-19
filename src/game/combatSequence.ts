import type { CombatState } from "./types";

export function isCombatSequencePending(combat: CombatState): boolean {
  return combat.floatingEvents.length > 0 && combat.completedSequenceEventId < combat.eventId;
}

export function eventRevealsPlayerTurn(combat: CombatState, eventIndex: number): boolean {
  const effect = combat.pendingEffects.find((candidate) => candidate.eventIndex === eventIndex);
  return effect?.type === "turn" && combat.turnOrder[effect.activeTurnIndex]?.kind === "player";
}
