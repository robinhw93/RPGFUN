import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ABILITIES } from "../game/data";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers } from "../game/combatFeatures";
import { endPlayerTurn, selectEnemyTarget, useAbility } from "../game/engine";
import { isCombatSequencePending } from "../game/combatSequence";
import { isStatusEffectId, STATUS_EFFECTS } from "../game/statusEffects";
import type { CombatState, GameState, StatusEffectId } from "../game/types";

export type QueuedCombatAction =
  | { id: number; type: "ability"; abilityId: string; targetId: string }
  | { id: number; type: "end_turn" };

export interface CombatActionQueueProjection {
  energy: number;
  cooldownAbilityIds: Set<string>;
  targetStatusIds: Map<string, Set<StatusEffectId>>;
  targetStatusStacks: Map<string, Map<StatusEffectId, number>>;
  nextAbilityIsFree: boolean;
  closed: boolean;
}

export function projectCombatActionQueue(combat: CombatState, character: GameState["character"], actions: QueuedCombatAction[]): CombatActionQueueProjection {
  let energy = combat.energy;
  let nextAbilityIsFree = combat.playerStatuses.some((status) => status.id === "distraction")
    && !combat.pendingEffects.some((effect) => effect.type === "remove_status" && effect.targetId === "player" && effect.statusId === "distraction");
  const projectedCooldowns = new Map(Object.entries(combat.abilityCooldowns ?? {}).filter(([, turns]) => turns > 0));
  const targetStatusIds = new Map(combat.enemies.map((enemy) => [enemy.instanceId, new Set(enemy.statuses.map((status) => status.id))]));
  const targetStatusStacks = new Map(combat.enemies.map((enemy) => [enemy.instanceId, new Map(enemy.statuses.map((status) => [status.id, status.stacks]))]));
  let closed = false;

  actions.forEach((action) => {
    if (closed) return;
    if (action.type === "end_turn") {
      closed = true;
      return;
    }
    const ability = ABILITIES[action.abilityId];
    if (!ability) return;
    const modifiers = getCharacterAbilityModifiers(character, ability.id);
    const targetStatuses = targetStatusIds.get(action.targetId) ?? new Set<StatusEffectId>();
    const cost = nextAbilityIsFree ? 0 : getCharacterAbilityEnergyCostForTarget(character, ability, targetStatuses);
    energy = Math.max(0, energy - cost);
    const cooldownTurns = getCharacterAbilityCooldownTurns(character, ability);
    if (cooldownTurns > 0) projectedCooldowns.set(ability.id, cooldownTurns);
    nextAbilityIsFree = false;
    if (ability.freeAgainstTargetStatus) targetStatuses.delete(ability.freeAgainstTargetStatus);
    const affectedTargetEntries = ability.target === "all_enemies" ? [...targetStatusIds.entries()] : [[action.targetId, targetStatuses] as const];
    const affectedTargetStatusSets = affectedTargetEntries.map(([, statuses]) => statuses);
    const replacements = modifiers.flatMap((modifier) => modifier.replaceStatusApplication ? [modifier.replaceStatusApplication] : []);
    const applications = [...(ability.statusApplications ?? []), ...modifiers.flatMap((modifier) => modifier.additionalStatusApplications ?? [])];
    affectedTargetEntries.forEach(([targetId, statuses]) => {
      const targetHadNoDebuffs = ![...statuses].some((statusId) => STATUS_EFFECTS[statusId].kind === "debuff");
      const targetApplications = [
        ...applications,
        ...(targetHadNoDebuffs ? ability.statusApplicationsWhenTargetHasNoDebuffs ?? [] : []),
      ];
      targetApplications.forEach((application) => {
        const replacement = replacements.find((candidate) => candidate.from === application.status);
        const statusId = replacement?.to ?? application.status;
        statuses.add(statusId);
        const stacks = targetStatusStacks.get(targetId);
        if (stacks) stacks.set(statusId, (stacks.get(statusId) ?? 0) + (application.stacks ?? 1));
      });
    });
    if (ability.effect && ability.target !== "self" && isStatusEffectId(ability.effect)) {
      affectedTargetStatusSets.forEach((statuses) => statuses.add(ability.effect as StatusEffectId));
    }
    if (ability.consumeTargetStatus) {
      const statusId = ability.consumeTargetStatus;
      const stacks = targetStatusStacks.get(action.targetId);
      const existing = stacks?.get(statusId) ?? 0;
      const fixedAmount = modifiers.find((modifier) => modifier.consumeTargetStatusStacksAmount !== undefined)?.consumeTargetStatusStacksAmount ?? ability.consumeTargetStatusStacks;
      const consumed = Math.min(existing, fixedAmount ?? existing);
      const remaining = existing - consumed;
      if (!modifiers.some((modifier) => modifier.retainTargetStatusOnConsume)) {
        if (remaining > 0) stacks?.set(statusId, remaining);
        else {
          stacks?.delete(statusId);
          targetStatuses.delete(statusId);
        }
      }
      if (ability.energyPerConsumedTargetStatusStacks) energy = Math.min(combat.maxEnergy, energy + Math.floor(consumed / Math.max(1, ability.energyPerConsumedTargetStatusStacks.stacksPerEnergy)));
    }
    if (ability.detonateStatus) targetStatuses.delete(ability.detonateStatus);
    if (ability.consumeStatusFromAllEnemies) {
      const affectedCount = [...targetStatusIds.entries()].filter(([, statuses]) => statuses.has(ability.consumeStatusFromAllEnemies!)).length;
      targetStatusIds.forEach((statuses, targetId) => {
        statuses.delete(ability.consumeStatusFromAllEnemies!);
        targetStatusStacks.get(targetId)?.delete(ability.consumeStatusFromAllEnemies!);
      });
      energy = Math.min(combat.maxEnergy, energy + affectedCount * (ability.energyPerConsumedEnemyStatus ?? 0));
      const reduction = affectedCount * (ability.cooldownReductionPerConsumedEnemyStatus ?? 0);
      if (reduction > 0) [...projectedCooldowns].forEach(([id, turns]) => {
        const remaining = Math.max(0, turns - reduction);
        if (remaining > 0) projectedCooldowns.set(id, remaining);
        else projectedCooldowns.delete(id);
      });
    }
    if (ability.energyRestorePercentOfMax) {
      energy = Math.min(combat.maxEnergy, energy + Math.max(1, Math.round(combat.maxEnergy * ability.energyRestorePercentOfMax)));
    } else if (ability.effect === "energy") {
      energy = Math.min(combat.maxEnergy, energy + 2);
    }
    if (ability.effect === "reset_cooldowns") {
      projectedCooldowns.clear();
      if (cooldownTurns > 0) projectedCooldowns.set(ability.id, cooldownTurns);
    }
  });

  return { energy, cooldownAbilityIds: new Set(projectedCooldowns.keys()), targetStatusIds, targetStatusStacks, nextAbilityIsFree, closed };
}

export function useCombatActionQueue(
  game: GameState,
  setGame: Dispatch<SetStateAction<GameState>>,
  playerTurnReadyEventId: number | null,
) {
  const [actions, setActions] = useState<QueuedCombatAction[]>([]);
  const gameRef = useRef(game);
  const nextActionId = useRef(0);
  const processingActionId = useRef<number | null>(null);
  gameRef.current = game;

  const queueAbility = useCallback((abilityId: string) => {
    setActions((current) => {
      const currentGame = gameRef.current;
      const combat = currentGame.adventure.combat;
      const activeActor = combat?.turnOrder[combat.activeTurnIndex];
      const ability = ABILITIES[abilityId];
      if (!combat || !ability || combat.outcome !== "active" || !combat.initiativeRevealed || activeActor?.kind !== "player") return current;
      if (!currentGame.character.equippedAbilities.includes(abilityId)) return current;
      if (combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep" || status.id === "frozen")) return current;
      const projection = projectCombatActionQueue(combat, currentGame.character, current);
      const targetStatuses = projection.targetStatusIds.get(combat.selectedEnemyId) ?? [];
      const energyCost = projection.nextAbilityIsFree ? 0 : getCharacterAbilityEnergyCostForTarget(currentGame.character, ability, targetStatuses);
      const requiredMinimum = getCharacterAbilityModifiers(currentGame.character, ability.id).find((modifier) => modifier.requiredTargetStatusStacksMinimum !== undefined)?.requiredTargetStatusStacksMinimum ?? ability.requiredTargetStatusStacks?.minimum;
      const targetStackRequirementMet = !ability.requiredTargetStatusStacks || (projection.targetStatusStacks.get(combat.selectedEnemyId)?.get(ability.requiredTargetStatusStacks.status) ?? 0) >= (requiredMinimum ?? 0);
      if (projection.closed || projection.cooldownAbilityIds.has(abilityId) || energyCost > projection.energy || !targetStackRequirementMet) return current;
      nextActionId.current += 1;
      return [...current, { id: nextActionId.current, type: "ability", abilityId, targetId: combat.selectedEnemyId }];
    });
  }, []);

  const queueEndTurn = useCallback(() => {
    setActions((current) => {
      const combat = gameRef.current.adventure.combat;
      const activeActor = combat?.turnOrder[combat.activeTurnIndex];
      if (!combat || combat.outcome !== "active" || !combat.initiativeRevealed || activeActor?.kind !== "player") return current;
      if (current.some((action) => action.type === "end_turn")) return current;
      nextActionId.current += 1;
      return [...current, { id: nextActionId.current, type: "end_turn" }];
    });
  }, []);

  useEffect(() => {
    const action = actions[0];
    const combat = game.adventure.combat;
    if (!action || !combat || combat.outcome !== "active" || !combat.initiativeRevealed) return;
    const activeActor = combat.turnOrder[combat.activeTurnIndex];
    if (activeActor?.kind !== "player") return;
    if (action.type === "ability" && combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep" || status.id === "frozen")) return;
    const sequencePending = isCombatSequencePending(combat);
    const canInterruptTurnAnnouncement = sequencePending && playerTurnReadyEventId === combat.eventId;
    if ((sequencePending && !canInterruptTurnAnnouncement) || combat.attackingActorId) return;
    if (processingActionId.current === action.id) return;
    processingActionId.current = action.id;
    setActions((current) => current[0]?.id === action.id ? current.slice(1) : current);
    setGame((current) => {
      const currentCombat = current.adventure.combat;
      if (!currentCombat || currentCombat.outcome !== "active") return current;
      const currentActor = currentCombat.turnOrder[currentCombat.activeTurnIndex];
      if (currentActor?.kind !== "player") return current;
      let nextCombat = currentCombat;
      if (action.type === "ability") {
        const requestedTarget = selectEnemyTarget(nextCombat, action.targetId);
        nextCombat = useAbility(requestedTarget, current.character, action.abilityId);
      } else {
        nextCombat = endPlayerTurn(nextCombat, current.character);
      }
      if (nextCombat === currentCombat) return current;
      return { ...current, adventure: { ...current.adventure, combat: nextCombat } };
    });
  }, [actions, game, playerTurnReadyEventId, setGame]);

  useEffect(() => {
    processingActionId.current = null;
    setActions([]);
  }, [game.adventure.active, game.adventure.mode, game.adventure.nodeIndex]);

  useEffect(() => {
    if (game.adventure.combat?.outcome === "active") return;
    processingActionId.current = null;
    setActions([]);
  }, [game.adventure.combat?.outcome]);

  return { actions, queueAbility, queueEndTurn };
}
