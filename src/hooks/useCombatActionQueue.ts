import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ABILITIES, ITEMS } from "../game/data";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers } from "../game/combatFeatures";
import { MAX_CONSUMABLES_PER_TURN, MAX_PLAYER_ACTIONS_PER_TURN } from "../game/combatLimits";
import { consumableRemovesActiveControl } from "../game/consumables";
import { endPlayerTurn, selectEnemyTarget, useAbility, useConsumable } from "../game/engine";
import { consumableCount, isConsumableItem } from "../game/items";
import { isCombatSequencePending } from "../game/combatSequence";
import { isStatusEffectId, STATUS_EFFECTS } from "../game/statusEffects";
import type { CombatState, GameState, StatusEffectId } from "../game/types";

export type QueuedCombatAction =
  | { id: number; type: "ability"; abilityId: string; targetId: string }
  | { id: number; type: "item"; itemId: string; targetId: string }
  | { id: number; type: "end_turn" };

export interface CombatActionQueueProjection {
  energy: number;
  cooldownAbilityIds: Set<string>;
  targetStatusIds: Map<string, Set<StatusEffectId>>;
  targetStatusStacks: Map<string, Map<StatusEffectId, number>>;
  playerStatusIds: Set<StatusEffectId>;
  playerStatusStacks: Map<StatusEffectId, number>;
  nextAbilityIsFree: boolean;
  consumableCounts: Map<string, number>;
  playerActionsUsed: number;
  consumablesUsed: number;
  closed: boolean;
}

export function projectCombatActionQueue(combat: CombatState, character: GameState["character"], actions: QueuedCombatAction[]): CombatActionQueueProjection {
  let energy = combat.energy;
  let nextAbilityIsFree = combat.playerStatuses.some((status) => status.id === "distraction")
    && !combat.pendingEffects.some((effect) => effect.type === "remove_status" && effect.targetId === "player" && effect.statusId === "distraction");
  const projectedCooldowns = new Map(Object.entries(combat.abilityCooldowns ?? {}).filter(([, turns]) => turns > 0));
  const targetStatusIds = new Map(combat.enemies.map((enemy) => [enemy.instanceId, new Set(enemy.statuses.map((status) => status.id))]));
  const targetStatusStacks = new Map(combat.enemies.map((enemy) => [enemy.instanceId, new Map(enemy.statuses.map((status) => [status.id, status.stacks]))]));
  const playerStatusIds = new Set(combat.playerStatuses.map((status) => status.id));
  const playerStatusStacks = new Map(combat.playerStatuses.map((status) => [status.id, status.stacks]));
  const consumableCounts = new Map(ITEMS.filter(isConsumableItem).map((item) => [item.id, consumableCount(character.inventory, item.id)]));
  let playerActionsUsed = combat.playerActionsThisTurn ?? 0;
  let consumablesUsed = combat.consumablesUsedThisTurn ?? 0;
  let closed = false;

  actions.forEach((action) => {
    if (closed) return;
    if (action.type === "end_turn") {
      closed = true;
      return;
    }
    if (action.type === "item") {
      const item = ITEMS.find((candidate) => candidate.id === action.itemId);
      if (!item || !isConsumableItem(item) || (consumableCounts.get(item.id) ?? 0) <= 0) return;
      consumableCounts.set(item.id, (consumableCounts.get(item.id) ?? 0) - 1);
      playerActionsUsed += 1;
      consumablesUsed += 1;
      item.effects.forEach((effect) => {
        if (effect.type === "gain_energy" || effect.type === "change_energy") {
          const change = effect.type === "gain_energy" ? Math.abs(effect.amount) : effect.amount;
          energy = Math.max(0, Math.min(combat.maxEnergy, energy + Math.round(change)));
          return;
        }
        if (effect.type === "remove_status") {
          const affectedTargetIds = effect.target === "self" ? ["player"] : effect.target === "all_enemies" ? [...targetStatusIds.keys()] : [action.targetId];
          affectedTargetIds.forEach((targetId) => {
            if (targetId === "player") {
              playerStatusIds.delete(effect.status);
              playerStatusStacks.delete(effect.status);
            } else {
              targetStatusIds.get(targetId)?.delete(effect.status);
              targetStatusStacks.get(targetId)?.delete(effect.status);
            }
          });
          return;
        }
        if (effect.type !== "apply_status") return;
        const affectedTargetIds = effect.target === "self"
          ? ["player"]
          : effect.target === "all_enemies"
            ? [...targetStatusIds.entries()]
              .filter(([, statuses]) => !statuses.has("stealth"))
              .map(([targetId]) => targetId)
            : [action.targetId];
        affectedTargetIds.forEach((targetId) => {
          if (targetId === "player") {
            if (effect.status === "stunned" && playerStatusIds.has("diminishingReturns")) return;
            playerStatusIds.add(effect.status);
            playerStatusStacks.set(effect.status, (playerStatusStacks.get(effect.status) ?? 0) + effect.stacks);
            return;
          }
          const statuses = targetStatusIds.get(targetId);
          if (!statuses || (effect.status === "stunned" && statuses.has("diminishingReturns"))) return;
          statuses.add(effect.status);
          const stacks = targetStatusStacks.get(targetId);
          stacks?.set(effect.status, (stacks.get(effect.status) ?? 0) + effect.stacks);
        });
      });
      return;
    }
    const ability = ABILITIES[action.abilityId];
    if (!ability) return;
    playerActionsUsed += 1;
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
        if (statusId === "stunned" && statuses.has("diminishingReturns")) return;
        statuses.add(statusId);
        const stacks = targetStatusStacks.get(targetId);
        if (stacks) stacks.set(statusId, (stacks.get(statusId) ?? 0) + (application.stacks ?? 1));
      });
    });
    if (ability.effect && ability.target !== "self" && isStatusEffectId(ability.effect)) {
      affectedTargetStatusSets.forEach((statuses) => {
        if (ability.effect === "stunned" && statuses.has("diminishingReturns")) return;
        statuses.add(ability.effect as StatusEffectId);
      });
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
          if (statusId === "stunned") targetStatuses.add("diminishingReturns");
        }
      }
      if (ability.energyPerConsumedTargetStatusStacks) energy = Math.min(combat.maxEnergy, energy + Math.floor(consumed / Math.max(1, ability.energyPerConsumedTargetStatusStacks.stacksPerEnergy)));
    }
    if (ability.consumeTargetStatusForOtherEnemiesDamage) {
      const statusId = ability.consumeTargetStatusForOtherEnemiesDamage.status;
      targetStatuses.delete(statusId);
      targetStatusStacks.get(action.targetId)?.delete(statusId);
      if (statusId === "stunned") targetStatuses.add("diminishingReturns");
    }
    if (ability.removeAllTargetBuffs) {
      [...targetStatuses].forEach((statusId) => {
        if (STATUS_EFFECTS[statusId].kind !== "buff") return;
        targetStatuses.delete(statusId);
        targetStatusStacks.get(action.targetId)?.delete(statusId);
      });
    }
    if (ability.transferSelfStatusToTargetForHealing) {
      const statusId = ability.transferSelfStatusToTargetForHealing.status;
      const transferredStacks = playerStatusStacks.get(statusId) ?? 0;
      playerStatusIds.delete(statusId);
      playerStatusStacks.delete(statusId);
      if (transferredStacks > 0) {
        targetStatuses.add(statusId);
        targetStatusStacks.get(action.targetId)?.set(statusId, (targetStatusStacks.get(action.targetId)?.get(statusId) ?? 0) + transferredStacks);
      }
    }
    (ability.selfStatusApplications ?? []).forEach((application) => {
      playerStatusIds.add(application.status);
      playerStatusStacks.set(application.status, (playerStatusStacks.get(application.status) ?? 0) + (application.stacks ?? 1));
    });
    if (ability.detonateStatus) {
      targetStatuses.delete(ability.detonateStatus);
      if (ability.detonateStatus === "stunned") targetStatuses.add("diminishingReturns");
    }
    if (ability.consumeStatusFromAllEnemies) {
      const affectedCount = [...targetStatusIds.entries()].filter(([, statuses]) => statuses.has(ability.consumeStatusFromAllEnemies!)).length;
      targetStatusIds.forEach((statuses, targetId) => {
        statuses.delete(ability.consumeStatusFromAllEnemies!);
        if (ability.consumeStatusFromAllEnemies === "stunned") statuses.add("diminishingReturns");
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

  return { energy, cooldownAbilityIds: new Set(projectedCooldowns.keys()), targetStatusIds, targetStatusStacks, playerStatusIds, playerStatusStacks, nextAbilityIsFree, consumableCounts, playerActionsUsed, consumablesUsed, closed };
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
      const selfRequirementMet = !ability.requiredSelfStatus
        || projection.playerStatusIds.has(ability.requiredSelfStatus)
        || getCharacterAbilityModifiers(currentGame.character, ability.id).some((modifier) => modifier.allowWithoutRequiredSelfStatus);
      const energyCost = projection.nextAbilityIsFree ? 0 : getCharacterAbilityEnergyCostForTarget(currentGame.character, ability, targetStatuses);
      const requiredMinimum = getCharacterAbilityModifiers(currentGame.character, ability.id).find((modifier) => modifier.requiredTargetStatusStacksMinimum !== undefined)?.requiredTargetStatusStacksMinimum ?? ability.requiredTargetStatusStacks?.minimum;
      const targetStackRequirementMet = !ability.requiredTargetStatusStacks || (projection.targetStatusStacks.get(combat.selectedEnemyId)?.get(ability.requiredTargetStatusStacks.status) ?? 0) >= (requiredMinimum ?? 0);
      if (projection.closed || projection.playerActionsUsed >= MAX_PLAYER_ACTIONS_PER_TURN || projection.cooldownAbilityIds.has(abilityId) || energyCost > projection.energy || !targetStackRequirementMet || !selfRequirementMet) return current;
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

  const queueConsumable = useCallback((itemId: string) => {
    setActions((current) => {
      const currentGame = gameRef.current;
      const combat = currentGame.adventure.combat;
      const activeActor = combat?.turnOrder[combat.activeTurnIndex];
      const item = ITEMS.find((candidate) => candidate.id === itemId);
      if (!combat || !item || !isConsumableItem(item) || combat.outcome !== "active" || !combat.initiativeRevealed || activeActor?.kind !== "player") return current;
      const projection = projectCombatActionQueue(combat, currentGame.character, current);
      if (projection.closed || projection.playerActionsUsed >= MAX_PLAYER_ACTIONS_PER_TURN || projection.consumablesUsed >= MAX_CONSUMABLES_PER_TURN || (projection.consumableCounts.get(item.id) ?? 0) <= 0) return current;
      if (!consumableRemovesActiveControl(projection.playerStatusIds, item)) return current;
      const needsSelectedTarget = item.effects.some((effect) => "target" in effect && effect.target === "target");
      const selectedStatuses = projection.targetStatusIds.get(combat.selectedEnemyId);
      if (needsSelectedTarget && (!selectedStatuses || selectedStatuses.has("stealth"))) return current;
      const needsVisibleEnemies = item.effects.some((effect) => "target" in effect && effect.target === "all_enemies");
      if (needsVisibleEnemies && !combat.enemies.some((enemy) => enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth"))) return current;
      nextActionId.current += 1;
      return [...current, { id: nextActionId.current, type: "item", itemId, targetId: combat.selectedEnemyId }];
    });
  }, []);

  useEffect(() => {
    const action = actions[0];
    const combat = game.adventure.combat;
    if (!action || !combat || combat.outcome !== "active" || !combat.initiativeRevealed) return;
    const activeActor = combat.turnOrder[combat.activeTurnIndex];
    if (activeActor?.kind !== "player") return;
    if (action.type === "ability" && combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep" || status.id === "frozen")) return;
    if (action.type === "item") {
      const item = ITEMS.find((candidate) => candidate.id === action.itemId);
      if (!item || !isConsumableItem(item) || !consumableRemovesActiveControl(combat.playerStatuses.map((status) => status.id), item)) return;
    }
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
      } else if (action.type === "item") {
        const item = ITEMS.find((candidate) => candidate.id === action.itemId);
        if (!item || !isConsumableItem(item)) return current;
        const result = useConsumable(nextCombat, current.character, item, action.targetId);
        if (result.combat === nextCombat || result.character === current.character) return current;
        return { ...current, character: result.character, adventure: { ...current.adventure, combat: result.combat } };
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

  return { actions, queueAbility, queueConsumable, queueEndTurn };
}
