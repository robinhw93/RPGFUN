import { getDerivedStats } from "../character";
import { getCharacterCombatFeatures } from "../combatFeatures";
import { ENEMIES } from "../data";
import {
  addOrRefreshStatus,
  canApplyStatusEffect,
  createStatusEffect,
  getStatusInitiativeBonus,
  hasStatus,
  isStatusEffectId,
  STATUS_EFFECTS
} from "../statusEffects";
import type { AdventureCombatStartStatus, CharacterState, CombatState, EnemyState, StatusEffect, TurnOrderEntry } from "../types";

import { makeLog } from "./eventQueue";

export interface CombatStartEffects {
  playerStatuses?: AdventureCombatStartStatus[];
  enemyStatuses?: AdventureCombatStartStatus[];
}

export function createEventStartStatus(effect: AdventureCombatStartStatus): StatusEffect | null {
  if (!isStatusEffectId(effect.status)) return null;
  return createStatusEffect(effect.status, {
    stacks: Math.max(1, Math.round(effect.stacks)),
    sourcePower: 0,
    sourceId: "event",
  });
}

export function createCombat(character: CharacterState, enemyIds: string[], carryHp?: number, startEffects: CombatStartEffects = {}): CombatState {
  const derived = getDerivedStats(character);
  const features = getCharacterCombatFeatures(character);
  const enemies: EnemyState[] = enemyIds.map((id, index) => {
    const statuses = (startEffects.enemyStatuses ?? []).reduce<StatusEffect[]>((current, effect) => {
      const status = createEventStartStatus(effect);
      return status ? addOrRefreshStatus(current, status) : current;
    }, []);
    return {
      ...ENEMIES[id],
      instanceId: `${id}-${index}`,
      hp: ENEMIES[id].maxHp,
      energy: ENEMIES[id].maxEnergy,
      maxEnergy: ENEMIES[id].maxEnergy,
      statuses,
      stunned: statuses.some((status) => status.id === "stunned"),
      abilityCooldowns: {},
      nextTurnEnergyRegenBonus: 0,
    };
  });
  const turnOrder = rollTurnOrder(character, enemies);
  const enteringHp = Math.min(carryHp ?? derived.maxHp, derived.maxHp);
  const martyrdomRatio = enteringHp === derived.maxHp ? features.passive.fullHealthCombatStartSelfDamageMaxHpRatio : 0;
  const martyrdomDamage = Math.max(0, Math.round(derived.maxHp * martyrdomRatio));
  let startingStatuses = features.passive.startingStatuses
    .filter((status) => !derived.statusImmunities.includes(status.id))
    .map((status) => ({ ...status }));
  startingStatuses = (startEffects.playerStatuses ?? []).reduce((current, effect) => {
    const status = createEventStartStatus(effect);
    if (!status || derived.statusImmunities.includes(status.id) || STATUS_EFFECTS[status.id].kind !== status.kind) return current;
    return addOrRefreshStatus(current, status);
  }, startingStatuses);
  (["guard", "barrier"] as const).forEach((statusId) => {
    const ratio = features.passive.startingAbsorptionMaxHpRatios[statusId] ?? 0;
    if (ratio <= 0) return;
    const amount = Math.max(1, Math.round(derived.maxHp * ratio));
    startingStatuses = addOrRefreshStatus(startingStatuses, createStatusEffect(statusId, {
      stacks: amount,
      sourceId: "combat-start",
      description: `Absorbs ${amount} incoming damage.`,
    }));
  });
  return {
    turn: 1,
    turnOrder,
    activeTurnIndex: 0,
    actedActorIds: [],
    initiativeRevealed: false,
    playerActed: false,
    enemyActionsTaken: 0,
    abilityCooldowns: {},
    eventId: 1,
    completedSequenceEventId: 1,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    deathPreventionUsed: false,
    playerHasTakenDamage: martyrdomDamage > 0,
    playerHasMissed: false,
    nextTurnEnergyRegenBonus: 0,
    damagedTargets: [],
    missedTargets: [],
    damageAmounts: {},
    damageSourceLabels: {},
    statusAnimations: [],
    abilityAnimations: martyrdomDamage > 0 ? [{ id: `martyrdom-${Date.now()}`, kind: "martyrdom", targetId: "player", sourceTargetId: "player" }] : [],
    projectileAnimations: [],
    passiveAnimations: martyrdomDamage > 0 ? [{ id: `martyrdom-passive-${Date.now()}`, targetId: "player", text: "Martyrdom", lane: 0 }] : [],
    attackingActorId: null,
    attackAnimationId: 0,
    attackAnimationHitCount: 1,
    attackAnimationDurationMultiplier: 1,
    attackEffectId: null,
    playerHp: Math.max(0, enteringHp - martyrdomDamage),
    playerMaxHp: derived.maxHp,
    energy: derived.maxEnergy,
    maxEnergy: derived.maxEnergy,
    selectedEnemyId: enemies[0].instanceId,
    enemies,
    playerStatuses: startingStatuses,
    log: [
      ...(martyrdomDamage > 0 ? [makeLog(`Martyrdom deals ${martyrdomDamage} damage to you.`, { title: "Martyrdom", description: `Entering combat at full Health sacrifices ${Math.round(martyrdomRatio * 100)}% of maximum Health. Guard and Barrier cannot absorb this damage.`, category: "ability" })] : []),
      makeLog(`The ${enemies.map((enemy) => enemy.name).join(" and ")} bar your path.`),
    ],
    outcome: "active",
  };
}

export function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function rollTurnOrder(character: CharacterState, enemies: EnemyState[]): TurnOrderEntry[] {
  const derived = getDerivedStats(character);
  const playerRoll = rollD100();
  return [
    {
      actorId: "player",
      kind: "player" as const,
      name: character.name,
      roll: playerRoll,
      bonus: derived.initiativeBonus,
      initiative: playerRoll + derived.initiativeBonus,
    },
    ...enemies.map((enemy) => {
      const roll = rollD100();
      return { actorId: enemy.instanceId, kind: "enemy" as const, name: enemy.name, roll, bonus: 0, initiative: roll };
    }),
  ].sort((left, right) => {
    const initiativeDifference = right.initiative - left.initiative;
    if (initiativeDifference !== 0) return initiativeDifference;
    if (left.kind !== right.kind) return left.kind === "player" ? -1 : 1;
    return left.actorId.localeCompare(right.actorId);
  });
}

export function normalizeStatuses(statuses: StatusEffect[] = []): StatusEffect[] {
  return statuses.map((status) => {
    const normalized = createStatusEffect(status.id, {
      duration: status.duration,
      stacks: status.stacks,
      sourcePower: status.sourcePower,
      sourceId: status.sourceId,
      magnitude: status.magnitude,
      expiresAtTurnStart: status.expiresAtTurnStart,
      description: status.id === "guard" ? status.description : undefined,
    });
    return { ...status, ...normalized };
  });
}

export function normalizeEnemies(enemies: EnemyState[]): EnemyState[] {
  return enemies.map((enemy) => {
    const legacyEnemyIds: Record<string, string> = {
      ashHound: "enemy-mrxiut2a-k4kgv",
      cinderCultist: "enemy-mrxk609z-n04fq",
      emberWisp: "enemy-mrxk609z-n04fq",
      ashenWarden: "enemy-mrxkjqs3-g7g5i",
      windsongWolf: "enemy-mrxj4o6o-o45ia",
      groveSprite: "enemy-mrxk609z-n04fq",
      greybackBoar: "enemy-mrxkjqs3-g7g5i",
    };
    const template = ENEMIES[enemy.id] ?? ENEMIES[legacyEnemyIds[enemy.id]] ?? ENEMIES.dummy;
    let statuses = normalizeStatuses(enemy.statuses ?? []);
    if (enemy.stunned && !hasStatus(statuses, "stunned") && canApplyStatusEffect(statuses, "stunned")) statuses = addOrRefreshStatus(statuses, createStatusEffect("stunned"));
    return {
      ...template,
      ...enemy,
      id: template.id,
      // Migrate active training combats created while DUMMY incorrectly had 1000% Hit Chance.
      hitChance: enemy.id === "dummy" && enemy.hitChance === 10 ? template.hitChance : enemy.hitChance ?? template.hitChance,
      energy: enemy.energy ?? template.maxEnergy,
      maxEnergy: enemy.maxEnergy ?? template.maxEnergy,
      energyRegen: enemy.energyRegen ?? template.energyRegen,
      critChance: enemy.critChance ?? template.critChance,
      physicalPower: enemy.physicalPower ?? template.physicalPower,
      spellPower: enemy.spellPower ?? template.spellPower,
      abilities: template.abilities,
      abilityCooldowns: enemy.abilityCooldowns ?? {},
      nextTurnEnergyRegenBonus: enemy.nextTurnEnergyRegenBonus ?? 0,
      statuses,
      stunned: hasStatus(statuses, "stunned"),
    };
  });
}

export function ensureCombatState(combat: CombatState, character: CharacterState): CombatState {
  const enemies = normalizeEnemies(combat.enemies);
  const derived = getDerivedStats(character);
  if (Array.isArray(combat.turnOrder) && combat.turnOrder.length > 0) {
    const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
      ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
      ?? "";
    return {
      ...combat,
      enemies,
      energy: Math.min(combat.energy ?? derived.maxEnergy, derived.maxEnergy),
      maxEnergy: derived.maxEnergy,
      playerStatuses: normalizeStatuses(combat.playerStatuses ?? []),
      turnOrder: combat.turnOrder.map((entry) => {
        const roll = Math.round(entry.roll ?? entry.initiative);
        const bonus = Math.round(entry.bonus ?? 0);
        return { ...entry, roll, bonus, initiative: Math.round(entry.initiative ?? roll + bonus) };
      }),
      selectedEnemyId,
      activeTurnIndex: Math.min(combat.activeTurnIndex ?? 0, combat.turnOrder.length - 1),
      actedActorIds: combat.actedActorIds
        ?? combat.turnOrder.slice(0, combat.activeTurnIndex ?? 0).map((entry) => entry.actorId),
      initiativeRevealed: combat.initiativeRevealed ?? true,
      playerActed: combat.playerActed ?? false,
      enemyActionsTaken: combat.enemyActionsTaken ?? 0,
      abilityCooldowns: combat.abilityCooldowns ?? {},
      completedSequenceEventId: combat.completedSequenceEventId
        ?? ((combat.floatingEvents?.length ?? 0) > 0 && (combat.pendingEffects?.length ?? 0) > 0 ? (combat.eventId ?? 1) - 1 : combat.eventId ?? 1),
      damagedTargets: combat.damagedTargets ?? [],
      missedTargets: combat.missedTargets ?? [],
      damageAmounts: combat.damageAmounts ?? {},
      damageSourceLabels: combat.damageSourceLabels ?? {},
      statusAnimations: combat.statusAnimations ?? [],
      abilityAnimations: combat.abilityAnimations ?? [],
      projectileAnimations: combat.projectileAnimations ?? [],
      passiveAnimations: combat.passiveAnimations ?? [],
      attackingActorId: combat.attackingActorId ?? null,
      attackAnimationId: combat.attackAnimationId ?? 0,
      attackAnimationHitCount: combat.attackAnimationHitCount ?? 1,
      attackAnimationDurationMultiplier: combat.attackAnimationDurationMultiplier ?? 1,
      attackEffectId: combat.attackEffectId ?? null,
      pendingEffects: combat.pendingEffects ?? [],
      procUsage: combat.procUsage ?? {},
      deathPreventionUsed: combat.deathPreventionUsed ?? false,
      playerHasTakenDamage: combat.playerHasTakenDamage ?? false,
      playerHasMissed: combat.playerHasMissed ?? false,
      nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0,
    };
  }
  const turnOrder = rollTurnOrder(character, enemies);
  return {
    ...combat,
    enemies,
    turnOrder,
    activeTurnIndex: 0,
    actedActorIds: [],
    initiativeRevealed: false,
    playerActed: false,
    enemyActionsTaken: 0,
    abilityCooldowns: {},
    eventId: (combat.eventId ?? 0) + 1,
    completedSequenceEventId: combat.eventId ?? 0,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    deathPreventionUsed: combat.deathPreventionUsed ?? false,
    playerHasTakenDamage: combat.playerHasTakenDamage ?? false,
    playerHasMissed: combat.playerHasMissed ?? false,
    nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0,
    damagedTargets: [],
    missedTargets: [],
    damageAmounts: {},
    damageSourceLabels: {},
    statusAnimations: [],
    abilityAnimations: [],
    projectileAnimations: [],
    passiveAnimations: [],
    attackingActorId: null,
    attackAnimationId: combat.attackAnimationId ?? 0,
    attackAnimationHitCount: 1,
    attackAnimationDurationMultiplier: 1,
    attackEffectId: null,
  };
}

export function getActorStatuses(combat: CombatState, actor: TurnOrderEntry): StatusEffect[] {
  return actor.kind === "player"
    ? combat.playerStatuses
    : combat.enemies.find((enemy) => enemy.instanceId === actor.actorId)?.statuses ?? [];
}

export function getCombatInitiative(combat: CombatState, actor: TurnOrderEntry): number {
  const statuses = getActorStatuses(combat, actor);
  if (hasStatus(statuses, "slowed")) return 0;
  return actor.initiative + (actor.kind === "player" ? getStatusInitiativeBonus(statuses) : 0);
}

export function orderTurnEntries(combat: CombatState): TurnOrderEntry[] {
  return [...combat.turnOrder].sort((left, right) => {
    const initiativeDifference = getCombatInitiative(combat, right) - getCombatInitiative(combat, left);
    if (initiativeDifference !== 0) return initiativeDifference;
    if (left.kind !== right.kind) return left.kind === "player" ? -1 : 1;
    return left.actorId.localeCompare(right.actorId);
  });
}

export function reorderCombat(combat: CombatState): CombatState {
  const activeActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  const turnOrder = orderTurnEntries(combat);
  const activeTurnIndex = Math.max(0, turnOrder.findIndex((actor) => actor.actorId === activeActorId));
  return { ...combat, turnOrder, activeTurnIndex };
}

export function isEnemyStealthed(enemy: EnemyState): boolean {
  return hasStatus(enemy.statuses, "stealth");
}

export function getForcedTargetId(enemies: EnemyState[]): string | null {
  return enemies.find((enemy) => enemy.hp > 0 && !isEnemyStealthed(enemy) && hasStatus(enemy.statuses, "taunt"))?.instanceId ?? null;
}

export function isEnemyTargetable(enemies: EnemyState[], enemy: EnemyState): boolean {
  if (enemy.hp <= 0 || isEnemyStealthed(enemy)) return false;
  const forcedTargetId = getForcedTargetId(enemies);
  return !forcedTargetId || forcedTargetId === enemy.instanceId;
}

export function selectEnemyTarget(combat: CombatState, requestedEnemyId: string): CombatState {
  const enemies = normalizeEnemies(combat.enemies);
  const forcedTargetId = getForcedTargetId(enemies);
  if (forcedTargetId) return combat.selectedEnemyId === forcedTargetId ? combat : { ...combat, selectedEnemyId: forcedTargetId };
  const requested = enemies.find((enemy) => enemy.instanceId === requestedEnemyId);
  if (!requested || !isEnemyTargetable(enemies, requested)) return combat;
  return { ...combat, selectedEnemyId: requestedEnemyId };
}
