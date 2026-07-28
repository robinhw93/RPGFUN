import { getDerivedStats } from "./character";
import { MAX_CONSUMABLES_PER_TURN, MAX_PLAYER_ACTIONS_PER_TURN } from "./combatLimits";
import { describeConsumableEffect, removeOneConsumable } from "./items";
import { STATUS_EFFECTS, absorbIncomingDamage, addOrRefreshStatus, canApplyStatusEffect, createStatusEffect } from "./statusEffects";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, ConsumableEffect, ConsumableItem, EnemyState, InspectableInfo } from "./types";
import { makeLog, queueAbilityVfx, queueAbsorptionChanges, queueDamageAtEvent, queueEnergyChange, queueHealAtEvent, queueNextTurnEnergyRegeneration, queuePassiveAnimation, queueStatus, queueStatusReconciliation } from "./combat/eventQueue";
import { runPlayerTriggerEvent } from "./combat/flow";
import { isEnemyStealthed, isEnemyTargetable } from "./combat/state";

const PLAYER_CONTROL_STATUS_IDS = new Set(["stunned", "sleep", "frozen"]);

export function consumableRemovesActiveControl(statusIds: Iterable<string>, item: ConsumableItem): boolean {
  const active = new Set([...statusIds].filter((statusId) => PLAYER_CONTROL_STATUS_IDS.has(statusId)));
  if (active.size === 0) return true;
  return item.effects.some((effect) => effect.type === "remove_status" && effect.target === "self" && active.has(effect.status));
}

function effectTargets(effect: ConsumableEffect, enemies: EnemyState[], selectedEnemyId: string): Array<"player" | string> {
  if (!("target" in effect) || effect.target === "self") return ["player"];
  if (effect.target === "all_enemies") return enemies.filter((enemy) => enemy.hp > 0 && !isEnemyStealthed(enemy)).map((enemy) => enemy.instanceId);
  const selected = enemies.find((enemy) => enemy.instanceId === selectedEnemyId);
  return selected && isEnemyTargetable(enemies, selected) ? [selected.instanceId] : [];
}

export function canUseConsumable(combat: CombatState, item: ConsumableItem, selectedEnemyId = combat.selectedEnemyId): boolean {
  const actor = combat.turnOrder[combat.activeTurnIndex];
  if (combat.outcome !== "active" || !combat.initiativeRevealed || actor?.kind !== "player") return false;
  if (combat.playerActionsThisTurn >= MAX_PLAYER_ACTIONS_PER_TURN || combat.consumablesUsedThisTurn >= MAX_CONSUMABLES_PER_TURN) return false;
  if (!consumableRemovesActiveControl(combat.playerStatuses.map((status) => status.id), item)) return false;
  return item.effects.every((effect) => effectTargets(effect, combat.enemies, selectedEnemyId).length > 0);
}

/** Resolves one inventory consumable as a normal queued player action without ending the turn. */
export function useConsumable(combat: CombatState, character: CharacterState, item: ConsumableItem, selectedEnemyId = combat.selectedEnemyId): { combat: CombatState; character: CharacterState } {
  if (!canUseConsumable(combat, item, selectedEnemyId)) return { combat, character };
  const inventory = removeOneConsumable(character.inventory, item.id);
  if (inventory === character.inventory) return { combat, character };

  const derived = getDerivedStats(character);
  const eventIndex = 0;
  const events = [`You use ${item.name}.`];
  const pendingEffects: CombatPendingEffect[] = [];
  const itemInfo: InspectableInfo = { title: item.name, description: item.description, category: "item" };
  const logs: CombatLogEntry[] = [makeLog(`You use ${item.name}.`, itemInfo)];
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  let energy = combat.energy;
  let abilityCooldowns = { ...combat.abilityCooldowns };
  let procUsage = { ...(combat.procUsage ?? {}) };
  let enemies = combat.enemies.map((enemy) => ({ ...enemy, statuses: [...enemy.statuses] }));
  const vfxTargets = new Set<"player" | string>();

  item.effects.forEach((effect) => {
    const targets = effectTargets(effect, enemies, selectedEnemyId);
    logs.push(makeLog(describeConsumableEffect(effect), itemInfo));
    if (effect.type === "heal") {
      const amount = Math.max(0, Math.round(effect.amount));
      const restored = Math.min(amount, combat.playerMaxHp - playerHp);
      playerHp += restored;
      if (restored > 0) {
        queueHealAtEvent(pendingEffects, eventIndex, "player", restored);
        queuePassiveAnimation(pendingEffects, eventIndex, "player", `+${restored} Health`);
        vfxTargets.add("player");
        const energyBeforeTriggers = energy;
        const healingTriggers = runPlayerTriggerEvent(
          "health_restored",
          { damage: restored, healthRestored: restored, sourceKind: "player", selfStatusIds: playerStatuses.map((status) => status.id) },
          "player",
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
          procUsage,
          logs,
          events,
          pendingEffects,
          eventIndex,
        );
        procUsage = healingTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = healingTriggers.state);
        abilityCooldowns = healingTriggers.state.abilityCooldowns ?? abilityCooldowns;
        const triggeredEnergy = energy - energyBeforeTriggers;
        if (triggeredEnergy !== 0) queueEnergyChange(pendingEffects, eventIndex, triggeredEnergy);
      }
      return;
    }
    if (effect.type === "gain_energy" || effect.type === "change_energy") {
      const requested = effect.type === "gain_energy" ? Math.abs(effect.amount) : effect.amount;
      const nextEnergy = Math.max(0, Math.min(combat.maxEnergy, energy + Math.round(requested)));
      const change = nextEnergy - energy;
      energy = nextEnergy;
      if (change !== 0) {
        queueEnergyChange(pendingEffects, eventIndex, change);
        queuePassiveAnimation(pendingEffects, eventIndex, "player", `${change > 0 ? "+" : ""}${change} Energy`);
        vfxTargets.add("player");
      }
      return;
    }
    if (effect.type === "change_next_turn_energy_regen") {
      const amount = Math.round(effect.amount);
      if (amount !== 0) {
        queueNextTurnEnergyRegeneration(pendingEffects, eventIndex, amount);
        queuePassiveAnimation(pendingEffects, eventIndex, "player", `${amount > 0 ? "+" : ""}${amount} Energy next turn`);
        vfxTargets.add("player");
      }
      return;
    }
    if (effect.type === "damage") {
      const incoming = Math.max(0, Math.round(effect.amount));
      targets.forEach((targetId) => {
        if (targetId === "player") {
          const absorbed = absorbIncomingDamage(playerStatuses, incoming);
          playerStatuses = absorbed.statuses;
          playerHp = Math.max(0, playerHp - absorbed.damage);
          queueDamageAtEvent(pendingEffects, eventIndex, "player", absorbed.damage, item.name);
          queueAbsorptionChanges(pendingEffects, eventIndex, "player", absorbed);
        } else {
          enemies = enemies.map((enemy) => {
            if (enemy.instanceId !== targetId) return enemy;
            const absorbed = absorbIncomingDamage(enemy.statuses, incoming);
            queueDamageAtEvent(pendingEffects, eventIndex, targetId, absorbed.damage, item.name);
            queueAbsorptionChanges(pendingEffects, eventIndex, targetId, absorbed);
            return { ...enemy, hp: Math.max(0, enemy.hp - absorbed.damage), statuses: absorbed.statuses };
          });
        }
        vfxTargets.add(targetId);
      });
      return;
    }

    if (effect.type === "remove_status") {
      targets.forEach((targetId) => {
        if (targetId === "player") {
          const previous = playerStatuses;
          playerStatuses = playerStatuses.filter((status) => status.id !== effect.status);
          if (playerStatuses.length !== previous.length) {
            queueStatusReconciliation(pendingEffects, eventIndex, "player", previous, playerStatuses);
            queuePassiveAnimation(pendingEffects, eventIndex, "player", `${STATUS_EFFECTS[effect.status].name} removed`);
            vfxTargets.add("player");
          }
          return;
        }
        enemies = enemies.map((enemy) => {
          if (enemy.instanceId !== targetId) return enemy;
          const statuses = enemy.statuses.filter((status) => status.id !== effect.status);
          if (statuses.length === enemy.statuses.length) return enemy;
          queueStatusReconciliation(pendingEffects, eventIndex, targetId, enemy.statuses, statuses);
          queuePassiveAnimation(pendingEffects, eventIndex, targetId, `${STATUS_EFFECTS[effect.status].name} removed`);
          vfxTargets.add(targetId);
          return { ...enemy, statuses };
        });
      });
      return;
    }

    targets.forEach((targetId) => {
      const sourcePower = effect.status === "bleed" ? derived.physicalPower : derived.magicalPower;
      const status = createStatusEffect(effect.status, { stacks: Math.max(1, Math.round(effect.stacks)), duration: Math.max(1, Math.round(effect.duration)), sourcePower, sourceId: "player" });
      if (targetId === "player") {
        if (!canApplyStatusEffect(playerStatuses, status.id)) return;
        playerStatuses = addOrRefreshStatus(playerStatuses, status);
      } else {
        const target = enemies.find((enemy) => enemy.instanceId === targetId);
        if (!target || !canApplyStatusEffect(target.statuses, status.id)) return;
        enemies = enemies.map((enemy) => enemy.instanceId === targetId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, status), stunned: status.id === "stunned" || enemy.stunned } : enemy);
      }
      queueStatus(events, pendingEffects, `${targetId === "player" ? "You gain" : `${enemies.find((enemy) => enemy.instanceId === targetId)?.name ?? "Enemy"} gains`} ${status.name}.`, targetId, status, status.id === "stunned", eventIndex, "player");
      vfxTargets.add(targetId);
    });
  });

  vfxTargets.forEach((targetId) => queueAbilityVfx(pendingEffects, eventIndex, "consumable_use", targetId, "player"));
  if (enemies.every((enemy) => enemy.hp <= 0)) events.push("Victory.");

  return {
    character: { ...character, inventory },
    combat: {
      ...combat,
      eventId: (combat.eventId ?? 0) + 1,
      floatingEvents: events,
      pendingEffects,
      procUsage,
      abilityCooldowns,
      playerActed: true,
      playerActionsThisTurn: combat.playerActionsThisTurn + 1,
      consumablesUsedThisTurn: combat.consumablesUsedThisTurn + 1,
      playerActionSurvivalPending: false,
      damagedTargets: [],
      missedTargets: [],
      damageAmounts: {},
      damageSourceLabels: {},
      statusAnimations: [],
      abilityAnimations: [],
      projectileAnimations: [],
      passiveAnimations: [],
      attackingActorId: null,
      log: [...logs, ...combat.log].slice(0, 24),
    },
  };
}
