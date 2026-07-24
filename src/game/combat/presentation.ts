import {
  addOrRefreshStatus,
  canApplyStatusEffect,
  grantDiminishingReturnsAfterStun,
  hasStatus
} from "../statusEffects";
import type { CombatPendingEffect, CombatState } from "../types";
import { wakeFromDamage } from "./damage";
import { isEnemyTargetable, reorderCombat } from "./state";

export function resolveCombatEvent(combat: CombatState, eventId: number, eventIndex: number): CombatState {
  if (combat.eventId !== eventId) return combat;
  const matchingEffects = (combat.pendingEffects ?? []).filter((effect) => effect.eventIndex === eventIndex);
  if (matchingEffects.length === 0) return combat;

  let playerHp = combat.playerHp;
  let enemies = combat.enemies;
  let playerStatuses = combat.playerStatuses;
  let activeTurnIndex = combat.activeTurnIndex;
  let turn = combat.turn;
  let playerActed = combat.playerActed;
  let energy = combat.energy;
  let abilityCooldowns = combat.abilityCooldowns;
  let nextTurnEnergyRegenBonus = combat.nextTurnEnergyRegenBonus ?? 0;
  let playerHasTakenDamage = combat.playerHasTakenDamage ?? false;
  let attackingActorId = combat.attackingActorId;
  let activeActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  let attackAnimationId = combat.attackAnimationId ?? 0;
  let attackEffectId = combat.attackEffectId ?? null;
  const resolvesAttackImpact = matchingEffects.some((effect) => "damage" in effect && Boolean(effect.attackerId));
  const damagedTargets: string[] = [];
  const missedTargets = matchingEffects.flatMap((effect) => "damage" in effect && effect.missed ? [effect.targetId] : []);
  const damageAmounts: Record<string, number> = {};
  const damageSourceLabels: Record<string, string> = {};
  matchingEffects.forEach((effect) => {
    if ("damage" in effect && effect.damage > 0) {
      damageAmounts[effect.targetId] = (damageAmounts[effect.targetId] ?? 0) + effect.damage;
      if (effect.sourceLabel) damageSourceLabels[effect.targetId] = effect.sourceLabel;
    }
  });
  const statusAnimations = matchingEffects.flatMap((effect) => effect.type === "status"
    ? [{ id: effect.id, statusId: effect.status.id, targetId: effect.targetId, sourceTargetId: effect.sourceTargetId }]
    : []);
  const abilityAnimations = matchingEffects.flatMap((effect) => effect.type === "ability_vfx"
    ? [{ id: effect.id, kind: effect.kind, targetId: effect.targetId, sourceTargetId: effect.sourceTargetId, shakeSource: effect.shakeSource }]
    : []);
  const passiveAnimations = matchingEffects.flatMap((effect) => effect.type === "passive_text"
    ? [{ id: effect.id, targetId: effect.targetId, text: effect.text, lane: effect.lane }]
    : []);
  matchingEffects.forEach((effect) => {
    if (effect.type === "passive_text" || effect.type === "ability_vfx") return;
    if (effect.type === "energy_regen_bonus") {
      nextTurnEnergyRegenBonus += effect.amount;
      return;
    }
    if (effect.type === "set_status") {
      if (effect.targetId === "player") {
        if (canApplyStatusEffect(playerStatuses, effect.status.id)) {
          playerStatuses = [...playerStatuses.filter((status) => status.id !== effect.status.id), effect.status];
        }
      } else {
        enemies = enemies.map((enemy) => {
          if (enemy.instanceId !== effect.targetId || !canApplyStatusEffect(enemy.statuses, effect.status.id)) return enemy;
          const nextStatuses = [...enemy.statuses.filter((status) => status.id !== effect.status.id), effect.status];
          return { ...enemy, statuses: nextStatuses, stunned: hasStatus(nextStatuses, "stunned") };
        });
      }
      return;
    }
    if (effect.type === "remove_status") {
      if (effect.targetId === "player") {
        const nextStatuses = playerStatuses.filter((status) => status.id !== effect.statusId);
        playerStatuses = grantDiminishingReturnsAfterStun(playerStatuses, nextStatuses);
      } else {
        enemies = enemies.map((enemy) => {
          if (enemy.instanceId !== effect.targetId) return enemy;
          const nextStatuses = grantDiminishingReturnsAfterStun(enemy.statuses, enemy.statuses.filter((status) => status.id !== effect.statusId));
          return { ...enemy, statuses: nextStatuses, stunned: hasStatus(nextStatuses, "stunned") };
        });
      }
      return;
    }
    if (effect.type === "status") {
      if (effect.targetId === "player") {
        playerStatuses = addOrRefreshStatus(playerStatuses, effect.status);
      } else {
        enemies = enemies.map((enemy) => {
          if (enemy.instanceId !== effect.targetId) return enemy;
          const nextStatuses = addOrRefreshStatus(enemy.statuses, effect.status);
          return { ...enemy, statuses: nextStatuses, stunned: hasStatus(nextStatuses, "stunned") };
        });
      }
      return;
    }
    if (effect.type === "turn") {
      activeTurnIndex = effect.activeTurnIndex;
      activeActorId = effect.activeActorId ?? combat.turnOrder[effect.activeTurnIndex]?.actorId ?? activeActorId;
      turn = effect.turn;
      playerActed = effect.playerActed ?? playerActed;
      playerStatuses = effect.playerStatuses ?? playerStatuses;
      energy = effect.energy ?? energy;
      abilityCooldowns = effect.abilityCooldowns ?? abilityCooldowns;
      nextTurnEnergyRegenBonus = effect.nextTurnEnergyRegenBonus ?? nextTurnEnergyRegenBonus;
      if (!resolvesAttackImpact) attackingActorId = null;
      return;
    }
    if (effect.type === "heal") {
      if (effect.targetId === "player") {
        playerHp = Math.min(combat.playerMaxHp, playerHp + effect.amount);
      } else {
        enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, hp: Math.min(enemy.maxHp, enemy.hp + effect.amount) } : enemy);
      }
      return;
    }
    if (effect.targetId === "player") {
      playerHp = Math.max(0, playerHp - effect.damage);
      playerStatuses = wakeFromDamage(playerStatuses, effect.damage);
      if (effect.damage > 0) {
        damagedTargets.push("player");
        playerHasTakenDamage = true;
      }
      return;
    }
    enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, hp: Math.max(0, enemy.hp - effect.damage), statuses: wakeFromDamage(enemy.statuses, effect.damage) } : enemy);
    if (effect.damage > 0) damagedTargets.push(effect.targetId);
  });

  const newlyDefeated = combat.enemies.filter((before) => before.hp > 0 && (enemies.find((enemy) => enemy.instanceId === before.instanceId)?.hp ?? 0) <= 0);
  newlyDefeated.forEach((defeated) => {
    enemies = enemies.map((enemy) => {
      const reaction = enemy.healOnAllyDeath;
      if (enemy.hp <= 0 || !reaction || reaction.allyId !== defeated.id) return enemy;
      const amount = Math.min(enemy.maxHp - enemy.hp, Math.max(1, Math.round(enemy.maxHp * reaction.maxHpRatio)));
      if (amount <= 0) return enemy;
      abilityAnimations.push({ id: `ally-death-vfx-${eventId}-${eventIndex}-${defeated.instanceId}`, kind: reaction.vfx, targetId: enemy.instanceId, sourceTargetId: defeated.instanceId, shakeSource: false });
      passiveAnimations.push({ id: `ally-death-heal-${eventId}-${eventIndex}-${defeated.instanceId}`, targetId: enemy.instanceId, text: `+${amount} Health`, lane: eventIndex % 3 });
      return { ...enemy, hp: enemy.hp + amount };
    });
  });

  enemies = enemies.map((enemy) => enemy.hp <= 0 && enemy.statuses.length > 0
    ? { ...enemy, statuses: [] }
    : enemy);
  const visibleStatusAnimations = statusAnimations.filter((animation) => (
    animation.targetId === "player"
    || enemies.some((enemy) => enemy.instanceId === animation.targetId && enemy.hp > 0)
  ));

  const consumedIds = new Set(matchingEffects.map((effect) => effect.id));
  if (attackEffectId && consumedIds.has(attackEffectId)) attackEffectId = null;
  const pendingEffects = (combat.pendingEffects ?? []).filter((effect) => !consumedIds.has(effect.id));
  const playerWillRecover = pendingEffects.some((effect) => effect.type === "heal" && effect.targetId === "player" && effect.amount > 0);
  const outcome = playerHp <= 0 && !playerWillRecover ? "defeat" : enemies.every((enemy) => enemy.hp <= 0) ? "victory" : combat.outcome;
  const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
    ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
    ?? "";
  const stableActiveTurnIndex = activeActorId
    ? Math.max(0, combat.turnOrder.findIndex((actor) => actor.actorId === activeActorId))
    : activeTurnIndex;
  return reorderCombat({ ...combat, playerHp, playerStatuses, enemies, activeTurnIndex: stableActiveTurnIndex, turn, playerActed, energy, abilityCooldowns, nextTurnEnergyRegenBonus, playerHasTakenDamage, attackingActorId, attackAnimationId, attackEffectId, pendingEffects, damagedTargets, missedTargets, damageAmounts, damageSourceLabels, statusAnimations: visibleStatusAnimations, abilityAnimations, passiveAnimations: [...(combat.passiveAnimations ?? []), ...passiveAnimations].slice(-16), selectedEnemyId, outcome });
}

export function finishCombatAttack(combat: CombatState, eventId: number, animationId: number): CombatState {
  if (combat.eventId !== eventId || combat.attackAnimationId !== animationId || (!combat.attackingActorId && (combat.projectileAnimations?.length ?? 0) === 0)) return combat;
  return { ...combat, attackingActorId: null, attackEffectId: null, projectileAnimations: [] };
}

export function primeCombatAttack(combat: CombatState, eventId: number, eventIndex: number): CombatState {
  if (combat.eventId !== eventId) return combat;
  const attackEffect = (combat.pendingEffects ?? []).find((effect): effect is Extract<CombatPendingEffect, { damage: number }> => effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId));
  if (!attackEffect || combat.attackEffectId === attackEffect.id) return combat;
  const animationHitCount = Math.max(1, attackEffect.animationHitCount ?? 1);
  const animationDurationMultiplier = Math.max(0.1, attackEffect.animationDurationMultiplier ?? 1);
  const attackPresentation = attackEffect.attackPresentation ?? (attackEffect.attackRange === "ranged" ? "projectile" : "melee");
  const usesProjectile = attackPresentation === "projectile" && attackEffect.attackerId !== attackEffect.targetId;
  const usesLunge = attackPresentation === "melee";
  return {
    ...combat,
    attackingActorId: usesLunge ? attackEffect.attackerId ?? null : null,
    attackAnimationId: (combat.attackAnimationId ?? 0) + 1,
    attackAnimationHitCount: animationHitCount,
    attackAnimationDurationMultiplier: animationDurationMultiplier,
    attackEffectId: attackEffect.id,
    damagedTargets: [],
    missedTargets: [],
    damageAmounts: {},
    damageSourceLabels: {},
    statusAnimations: [],
    abilityAnimations: [],
    projectileAnimations: usesProjectile ? [{
      id: `projectile-${attackEffect.id}`,
      targetId: attackEffect.targetId,
      sourceTargetId: attackEffect.attackerId ?? "player",
      vfx: attackEffect.projectileVfx,
      damageType: attackEffect.projectileDamageType,
      hitCount: animationHitCount,
      durationMultiplier: animationDurationMultiplier,
    }] : [],
  };
}
