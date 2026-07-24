import {
  absorbIncomingDamage
} from "../statusEffects";
import type { Ability, AbilityAttackPresentation, AbilityRange, CombatAbilityVfxKind, CombatLogEntry, CombatPendingEffect, DamageType, InspectableInfo, StatusEffect } from "../types";

let combatLogSequence = 0;
let combatEffectSequence = 0;

export function makeLog(text: string, info?: InspectableInfo): CombatLogEntry {
  combatLogSequence += 1;
  return { id: `combat-log-${Date.now()}-${combatLogSequence}`, text, info };
}

export function statusInfo(status: StatusEffect): InspectableInfo {
  return { title: status.name, description: status.description, category: "status" };
}

export interface QueueDamageOptions {
  attackerId?: "player" | string;
  attackRange?: AbilityRange;
  attackPresentation?: AbilityAttackPresentation;
  projectileVfx?: CombatAbilityVfxKind;
  projectileDamageType?: DamageType;
  animationHitCount?: number;
  animationDurationMultiplier?: number;
  missed?: boolean;
  sourceLabel?: string;
  attachedEventIndex?: number;
}

export function queueDamage(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, damage: number, options: QueueDamageOptions = {}): number {
  const eventIndex = options.attachedEventIndex ?? events.length;
  if (options.attachedEventIndex === undefined) events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({
    id: `combat-effect-${Date.now()}-${combatEffectSequence}`,
    eventIndex,
    type: "damage",
    targetId,
    damage,
    attackerId: options.attackerId,
    attackRange: options.attackRange,
    attackPresentation: options.attackPresentation,
    projectileVfx: options.projectileVfx,
    projectileDamageType: options.projectileDamageType,
    animationHitCount: Math.max(1, Math.round(options.animationHitCount ?? 1)),
    animationDurationMultiplier: Math.max(0.1, options.animationDurationMultiplier ?? 1),
    missed: options.missed,
    sourceLabel: options.sourceLabel,
  });
  return eventIndex;
}

export function getAbilityAttackPresentation(ability: Ability): Pick<QueueDamageOptions, "attackRange" | "attackPresentation" | "projectileVfx" | "projectileDamageType"> {
  return {
    attackRange: ability.range,
    attackPresentation: ability.range === "melee" ? "melee" : ability.rangedPresentation ?? "projectile",
    projectileVfx: ability.vfx,
    projectileDamageType: ability.damageType ?? ability.damageComponents?.[0]?.damageType ?? ability.consumeTargetStatusForDamage?.damageType,
  };
}

export function queueDamageAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, damage: number, sourceLabel?: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "damage", targetId, damage, sourceLabel });
}

export function queueHeal(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, amount: number): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
  return eventIndex;
}

export function queueHealAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, amount: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
}

export function queueNextTurnEnergyRegeneration(pendingEffects: CombatPendingEffect[], eventIndex: number, amount: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "energy_regen_bonus", amount });
}

export function queuePassiveAnimation(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: "player" | string, text: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "passive_text", targetId, text, lane: combatEffectSequence % 3 });
}

export function queueAbilityVfx(pendingEffects: CombatPendingEffect[], eventIndex: number, kind: CombatAbilityVfxKind, targetId?: "player" | string, sourceTargetId?: "player" | string, shakeSource = false): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "ability_vfx", kind, targetId, sourceTargetId, shakeSource });
}

export function queueStatus(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, status: StatusEffect, stunned = false, attachedEventIndex?: number, sourceTargetId?: string): void {
  const eventIndex = attachedEventIndex ?? events.length;
  if (attachedEventIndex === undefined) events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "status", targetId, status: { ...status }, stunned, sourceTargetId });
}

export function queueStatusRemoval(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, statusId: StatusEffect["id"]): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "remove_status", targetId, statusId });
}

export function queueStatusSet(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, status: StatusEffect): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "set_status", targetId, status: { ...status } });
}

export function queueStatusReconciliation(
  pendingEffects: CombatPendingEffect[],
  eventIndex: number,
  targetId: string,
  displayedStatuses: StatusEffect[],
  resolvedStatuses: StatusEffect[],
): void {
  displayedStatuses.forEach((displayedStatus) => {
    const resolvedStatus = resolvedStatuses.find((status) => status.id === displayedStatus.id);
    if (!resolvedStatus) {
      queueStatusRemoval(pendingEffects, eventIndex, targetId, displayedStatus.id);
      return;
    }
    if (JSON.stringify(displayedStatus) !== JSON.stringify(resolvedStatus)) {
      queueStatusSet(pendingEffects, eventIndex, targetId, resolvedStatus);
    }
  });
  resolvedStatuses.filter((resolvedStatus) => !displayedStatuses.some((status) => status.id === resolvedStatus.id)).forEach((resolvedStatus) => {
    const wasAppliedEarlierInSequence = pendingEffects.some((effect) => (
      effect.type === "status"
      && effect.targetId === targetId
      && effect.status.id === resolvedStatus.id
    ));
    if (wasAppliedEarlierInSequence) {
      queueStatusSet(pendingEffects, eventIndex, targetId, resolvedStatus);
      return;
    }
    combatEffectSequence += 1;
    pendingEffects.push({
      id: `combat-effect-${Date.now()}-${combatEffectSequence}`,
      eventIndex,
      type: "status",
      targetId,
      status: { ...resolvedStatus },
    });
  });
}

export function queueAbsorptionChanges(
  pendingEffects: CombatPendingEffect[],
  eventIndex: number,
  targetId: "player" | string,
  result: ReturnType<typeof absorbIncomingDamage>,
): void {
  (["guard", "barrier"] as const).forEach((statusId) => {
    if (!result.absorbedBy[statusId]) return;
    const remainingStatus = result.statuses.find((status) => status.id === statusId);
    if (remainingStatus) queueStatusSet(pendingEffects, eventIndex, targetId, remainingStatus);
    else queueStatusRemoval(pendingEffects, eventIndex, targetId, statusId);
  });
  if ((result.absorbedBy.barrier ?? 0) > 0) queueAbilityVfx(pendingEffects, eventIndex, "barrier_absorb", targetId, targetId);
}

export function absorptionSuffix(absorbed: number): string {
  return absorbed > 0 ? ` (${absorbed} absorbed)` : "";
}

export function preserveBarrierUntilDamageEvent(
  nextStatuses: StatusEffect[],
  previousStatuses: StatusEffect[],
  pendingEffects: CombatPendingEffect[],
  targetId: "player" | string,
): StatusEffect[] {
  const barrierChangesLater = pendingEffects.some((effect) => (
    (effect.type === "set_status" && effect.targetId === targetId && effect.status.id === "barrier")
    || (effect.type === "remove_status" && effect.targetId === targetId && effect.statusId === "barrier")
  ));
  if (!barrierChangesLater) return nextStatuses;
  const previousBarrier = previousStatuses.find((status) => status.id === "barrier");
  return [
    ...nextStatuses.filter((status) => status.id !== "barrier"),
    ...(previousBarrier ? [previousBarrier] : []),
  ];
}

export function queueTurnAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number, abilityCooldowns?: Record<string, number>, activeActorId?: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "turn", activeTurnIndex, activeActorId, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus, abilityCooldowns });
}

export function queueTurn(events: string[], pendingEffects: CombatPendingEffect[], text: string, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number, abilityCooldowns?: Record<string, number>, activeActorId?: string): void {
  const eventIndex = events.length;
  events.push(text);
  queueTurnAtEvent(pendingEffects, eventIndex, activeTurnIndex, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus, abilityCooldowns, activeActorId);
}
