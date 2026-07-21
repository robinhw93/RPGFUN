import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ABILITIES } from "../game/data";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityEnergyCostForTarget } from "../game/combatFeatures";
import { endPlayerTurn, selectEnemyTarget, useAbility } from "../game/engine";
import { isCombatSequencePending } from "../game/combatSequence";
import { isStatusEffectId } from "../game/statusEffects";
import type { CombatState, GameState, StatusEffectId } from "../game/types";

export type QueuedCombatAction =
  | { id: number; type: "ability"; abilityId: string; targetId: string }
  | { id: number; type: "end_turn" };

export interface CombatActionQueueProjection {
  energy: number;
  cooldownAbilityIds: Set<string>;
  targetStatusIds: Map<string, Set<StatusEffectId>>;
  nextAbilityIsFree: boolean;
  closed: boolean;
}

export function projectCombatActionQueue(combat: CombatState, character: GameState["character"], actions: QueuedCombatAction[]): CombatActionQueueProjection {
  let energy = combat.energy;
  let nextAbilityIsFree = combat.playerStatuses.some((status) => status.id === "distraction")
    && !combat.pendingEffects.some((effect) => effect.type === "remove_status" && effect.targetId === "player" && effect.statusId === "distraction");
  const cooldownAbilityIds = new Set(
    Object.entries(combat.abilityCooldowns ?? {}).filter(([, turns]) => turns > 0).map(([abilityId]) => abilityId),
  );
  const targetStatusIds = new Map(combat.enemies.map((enemy) => [enemy.instanceId, new Set(enemy.statuses.map((status) => status.id))]));
  let closed = false;

  actions.forEach((action) => {
    if (closed) return;
    if (action.type === "end_turn") {
      closed = true;
      return;
    }
    const ability = ABILITIES[action.abilityId];
    if (!ability) return;
    const targetStatuses = targetStatusIds.get(action.targetId) ?? new Set<StatusEffectId>();
    const cost = nextAbilityIsFree ? 0 : getCharacterAbilityEnergyCostForTarget(character, ability, targetStatuses);
    energy = Math.max(0, energy - cost);
    nextAbilityIsFree = false;
    if (ability.freeAgainstTargetStatus) targetStatuses.delete(ability.freeAgainstTargetStatus);
    const affectedTargetStatusSets = ability.target === "all_enemies" ? [...targetStatusIds.values()] : [targetStatuses];
    ability.statusApplications?.forEach((application) => affectedTargetStatusSets.forEach((statuses) => statuses.add(application.status)));
    if (ability.effect && ability.target !== "self" && isStatusEffectId(ability.effect)) {
      affectedTargetStatusSets.forEach((statuses) => statuses.add(ability.effect as StatusEffectId));
    }
    if (ability.consumeTargetStatus) targetStatuses.delete(ability.consumeTargetStatus);
    if (ability.detonateStatus) targetStatuses.delete(ability.detonateStatus);
    if (ability.energyRestorePercentOfMax) {
      energy = Math.min(combat.maxEnergy, energy + Math.max(1, Math.round(combat.maxEnergy * ability.energyRestorePercentOfMax)));
    } else if (ability.effect === "energy") {
      energy = Math.min(combat.maxEnergy, energy + 2);
    }
    if (ability.effect === "reset_cooldowns") cooldownAbilityIds.clear();
    if (getCharacterAbilityCooldownTurns(character, ability) > 0) cooldownAbilityIds.add(ability.id);
  });

  return { energy, cooldownAbilityIds, targetStatusIds, nextAbilityIsFree, closed };
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
      if (combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep")) return current;
      const projection = projectCombatActionQueue(combat, currentGame.character, current);
      const targetStatuses = projection.targetStatusIds.get(combat.selectedEnemyId) ?? [];
      const energyCost = projection.nextAbilityIsFree ? 0 : getCharacterAbilityEnergyCostForTarget(currentGame.character, ability, targetStatuses);
      if (projection.closed || projection.cooldownAbilityIds.has(abilityId) || energyCost > projection.energy) return current;
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
    if (activeActor?.kind !== "player" || combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep")) return;
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
