import { getDerivedStats } from "./character";
import { capDodgeChance, rollHit } from "./combatMath";
import { ABILITIES, ENEMIES } from "./data";
import {
  absorbIncomingDamage,
  addOrRefreshStatus,
  createStatusEffect,
  DEFAULT_STATUS_DURATION,
  decrementStatusDurations,
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getEffectiveArmor,
  getEnergyRegeneration,
  getIncomingDamageMultiplier,
  getOutgoingDamageMultiplier,
  getStatusDamage,
  getStatusHealing,
  hasStatus,
  isMagicalDamage,
  isStatusEffectId,
} from "./statusEffects";
import { getCharacterAbilityModifiers, getCharacterCombatFeatures, getCharacterDamageMultiplier, getDamageModifierMultiplier, resolveCharacterTriggers } from "./combatFeatures";
import type { CombatTriggerContext, ResolvedCombatTrigger } from "./combatFeatures";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, CombatTriggerEvent, DamageType, EnemyState, InspectableInfo, StatusEffect, TurnOrderEntry } from "./types";

export function createCombat(character: CharacterState, enemyIds: string[], carryHp?: number): CombatState {
  const derived = getDerivedStats(character);
  const features = getCharacterCombatFeatures(character);
  const enemies: EnemyState[] = enemyIds.map((id, index) => ({
    ...ENEMIES[id],
    instanceId: `${id}-${index}`,
    hp: ENEMIES[id].maxHp,
    energy: 10,
    maxEnergy: 10,
    statuses: [],
    stunned: false,
  }));
  const turnOrder = rollTurnOrder(character, enemies);
  return {
    turn: 1,
    turnOrder,
    activeTurnIndex: 0,
    actedActorIds: [],
    initiativeRevealed: false,
    playerActed: false,
    abilityCooldowns: {},
    eventId: 1,
    completedSequenceEventId: 1,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    deathPreventionUsed: false,
    nextTurnEnergyRegenBonus: 0,
    damagedTargets: [],
    statusAnimations: [],
    attackingActorId: null,
    attackAnimationId: 0,
    attackAnimationHitCount: 1,
    attackEffectId: null,
    playerHp: Math.min(carryHp ?? derived.maxHp, derived.maxHp),
    playerMaxHp: derived.maxHp,
    energy: derived.maxEnergy,
    maxEnergy: derived.maxEnergy,
    selectedEnemyId: enemies[0].instanceId,
    enemies,
    playerStatuses: features.passive.startingStatuses
      .filter((status) => !derived.statusImmunities.includes(status.id))
      .map((status) => ({ ...status })),
    log: [makeLog(`The ${enemies.map((enemy) => enemy.name).join(" and ")} bar your path.`)],
    outcome: "active",
  };
}

let combatLogSequence = 0;
let combatEffectSequence = 0;

function makeLog(text: string, info?: InspectableInfo): CombatLogEntry {
  combatLogSequence += 1;
  return { id: `combat-log-${Date.now()}-${combatLogSequence}`, text, info };
}

function statusInfo(status: StatusEffect): InspectableInfo {
  return { title: status.name, description: status.description, category: "status" };
}

function queueDamage(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, damage: number, attackerId?: "player" | string, animationHitCount = 1): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "damage", targetId, damage, attackerId, animationHitCount: Math.max(1, Math.round(animationHitCount)) });
  return eventIndex;
}

function queueHeal(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, amount: number): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
  return eventIndex;
}

function queueNextTurnEnergyRegeneration(pendingEffects: CombatPendingEffect[], eventIndex: number, amount: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "energy_regen_bonus", amount });
}

function queueStatus(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, status: StatusEffect, stunned = false, attachedEventIndex?: number, sourceTargetId?: string): void {
  const eventIndex = attachedEventIndex ?? events.length;
  if (attachedEventIndex === undefined) events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "status", targetId, status: { ...status }, stunned, sourceTargetId });
}

function queueStatusRemoval(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, statusId: StatusEffect["id"]): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "remove_status", targetId, statusId });
}

function queueStatusSet(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, status: StatusEffect): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "set_status", targetId, status: { ...status } });
}

function queueStatusReconciliation(
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
}

function queueAbsorptionChanges(
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
}

function absorptionSuffix(absorbed: number): string {
  return absorbed > 0 ? ` (${absorbed} absorbed)` : "";
}

function preserveBarrierUntilDamageEvent(
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

function queueTurnAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "turn", activeTurnIndex, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus });
}

function queueTurn(events: string[], pendingEffects: CombatPendingEffect[], text: string, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number): void {
  const eventIndex = events.length;
  events.push(text);
  queueTurnAtEvent(pendingEffects, eventIndex, activeTurnIndex, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus);
}

function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function rollTurnOrder(character: CharacterState, enemies: EnemyState[]): TurnOrderEntry[] {
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

function normalizeStatuses(statuses: StatusEffect[] = []): StatusEffect[] {
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

function normalizeEnemies(enemies: EnemyState[]): EnemyState[] {
  return enemies.map((enemy) => {
    let statuses = normalizeStatuses(enemy.statuses ?? []);
    if (enemy.stunned && !hasStatus(statuses, "stunned")) statuses = addOrRefreshStatus(statuses, createStatusEffect("stunned"));
    return {
      ...ENEMIES[enemy.id],
      ...enemy,
      energy: enemy.energy ?? 10,
      maxEnergy: enemy.maxEnergy ?? 10,
      energyCost: enemy.energyCost ?? ENEMIES[enemy.id].energyCost,
      attackDescription: enemy.attackDescription ?? ENEMIES[enemy.id].attackDescription,
      onHitEffect: enemy.onHitEffect ?? ENEMIES[enemy.id].onHitEffect,
      statuses,
      stunned: enemy.stunned ?? false,
    };
  });
}

export function ensureCombatState(combat: CombatState, character: CharacterState): CombatState {
  const enemies = normalizeEnemies(combat.enemies);
  if (Array.isArray(combat.turnOrder) && combat.turnOrder.length > 0) {
    const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
      ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
      ?? "";
    return {
      ...combat,
      enemies,
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
      abilityCooldowns: combat.abilityCooldowns ?? {},
      completedSequenceEventId: combat.completedSequenceEventId
        ?? ((combat.floatingEvents?.length ?? 0) > 0 && (combat.pendingEffects?.length ?? 0) > 0 ? (combat.eventId ?? 1) - 1 : combat.eventId ?? 1),
      damagedTargets: combat.damagedTargets ?? [],
      statusAnimations: combat.statusAnimations ?? [],
      attackingActorId: combat.attackingActorId ?? null,
      attackAnimationId: combat.attackAnimationId ?? 0,
      attackAnimationHitCount: combat.attackAnimationHitCount ?? 1,
      attackEffectId: combat.attackEffectId ?? null,
      pendingEffects: combat.pendingEffects ?? [],
      procUsage: combat.procUsage ?? {},
      deathPreventionUsed: combat.deathPreventionUsed ?? false,
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
    abilityCooldowns: {},
    eventId: (combat.eventId ?? 0) + 1,
    completedSequenceEventId: combat.eventId ?? 0,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    deathPreventionUsed: combat.deathPreventionUsed ?? false,
    nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0,
    damagedTargets: [],
    statusAnimations: [],
    attackingActorId: null,
    attackAnimationId: combat.attackAnimationId ?? 0,
    attackAnimationHitCount: 1,
    attackEffectId: null,
  };
}

function getOffensivePower(derived: ReturnType<typeof getDerivedStats>, damageType?: DamageType): number {
  return isMagicalDamage(damageType) ? derived.magicalPower : derived.physicalPower;
}

function getDefense(armor: number, magicResistance: number, statuses: StatusEffect[], damageType?: DamageType): number {
  return damageType === "physical" ? getEffectiveArmor(armor, statuses) : magicResistance;
}

function getModifiedDamage(baseDamage: number, attackerStatuses: StatusEffect[], targetStatuses: StatusEffect[], damageType?: DamageType): number {
  if (baseDamage <= 0) return 0;
  return Math.max(1, Math.round(baseDamage * getOutgoingDamageMultiplier(attackerStatuses, damageType) * getIncomingDamageMultiplier(targetStatuses, damageType)));
}

function getAfflictionDamage(status: StatusEffect, targetStatuses: StatusEffect[], extraMultiplier = 1): number {
  const damageType: DamageType = status.id === "burn" ? "fire" : status.id === "poison" ? "arcane" : "physical";
  return Math.max(1, Math.round(getStatusDamage(status) * getIncomingDamageMultiplier(targetStatuses, damageType) * extraMultiplier));
}

function getEnergyDefenseMultiplier(derived: ReturnType<typeof getDerivedStats>, energy: number): number {
  return Math.max(0, 1 - Math.max(0, energy) * derived.incomingDamageReductionPerEnergy);
}

function createPlayerAppliedStatus(
  statusId: StatusEffect["id"],
  derived: ReturnType<typeof getDerivedStats>,
  options: Partial<Pick<StatusEffect, "duration" | "stacks" | "magnitude" | "expiresAtTurnStart">> = {},
): StatusEffect {
  const sourcePower = statusId === "bleed" ? derived.physicalPower
    : statusId === "poison" || statusId === "burn" || statusId === "regenerate" ? derived.magicalPower
      : undefined;
  const stacks = (options.stacks ?? 1) + (derived.statusApplicationStacks[statusId] ?? 0);
  return createStatusEffect(statusId, { sourcePower, sourceId: "player", ...options, stacks });
}

function createPlayerCompanionStatuses(statusId: StatusEffect["id"], derived: ReturnType<typeof getDerivedStats>): StatusEffect[] {
  return (derived.statusApplicationCompanions[statusId] ?? []).map((companionId) => createPlayerAppliedStatus(companionId, derived));
}

function wakeFromDamage(statuses: StatusEffect[], damage: number): StatusEffect[] {
  return damage > 0 ? statuses.filter((status) => status.id !== "sleep") : statuses;
}

function getActorStatuses(combat: CombatState, actor: TurnOrderEntry): StatusEffect[] {
  return actor.kind === "player"
    ? combat.playerStatuses
    : combat.enemies.find((enemy) => enemy.instanceId === actor.actorId)?.statuses ?? [];
}

export function getCombatInitiative(combat: CombatState, actor: TurnOrderEntry): number {
  return hasStatus(getActorStatuses(combat, actor), "slowed") ? 0 : actor.initiative;
}

function orderTurnEntries(combat: CombatState): TurnOrderEntry[] {
  return [...combat.turnOrder].sort((left, right) => {
    const initiativeDifference = getCombatInitiative(combat, right) - getCombatInitiative(combat, left);
    if (initiativeDifference !== 0) return initiativeDifference;
    if (left.kind !== right.kind) return left.kind === "player" ? -1 : 1;
    return left.actorId.localeCompare(right.actorId);
  });
}

function reorderCombat(combat: CombatState): CombatState {
  const activeActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  const turnOrder = orderTurnEntries(combat);
  const activeTurnIndex = Math.max(0, turnOrder.findIndex((actor) => actor.actorId === activeActorId));
  return { ...combat, turnOrder, activeTurnIndex };
}

function isEnemyStealthed(enemy: EnemyState): boolean {
  return hasStatus(enemy.statuses, "stealth");
}

function getForcedTargetId(enemies: EnemyState[]): string | null {
  return enemies.find((enemy) => enemy.hp > 0 && !isEnemyStealthed(enemy) && hasStatus(enemy.statuses, "taunt"))?.instanceId ?? null;
}

function isEnemyTargetable(enemies: EnemyState[], enemy: EnemyState): boolean {
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

interface StatusTurnResult {
  hp: number;
  statuses: StatusEffect[];
  skipTurn: boolean;
}

function processTurnStart(
  hp: number,
  maxHp: number,
  statuses: StatusEffect[],
  targetId: "player" | string,
  targetName: string,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  healingReceivedMultiplier = 1,
  incomingDamageMultiplier = 1,
): StatusTurnResult {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  // One-round defensive effects protect the owner until their next turn begins.
  nextStatuses = nextStatuses.filter((status) => status.expiresAtTurnStart !== true && (status.id !== "stealth" || status.expiresAtTurnStart === false) && status.id !== "guard");
  const burn = nextStatuses.find((status) => status.id === "burn");
  if (burn) {
    const absorption = absorbIncomingDamage(nextStatuses, Math.round(getAfflictionDamage(burn, nextStatuses) * incomingDamageMultiplier));
    const damage = absorption.damage;
    nextHp = Math.max(0, nextHp - damage);
    nextStatuses = wakeFromDamage(absorption.statuses, damage);
    const text = targetId === "player" ? `You take ${damage} damage from Burn${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Burn${absorptionSuffix(absorption.absorbed)}.`;
    logs.push(makeLog(text, statusInfo(burn)));
    const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage);
    queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  }

  const regenerate = nextStatuses.find((status) => status.id === "regenerate");
  if (regenerate && nextHp > 0 && nextHp < maxHp) {
    const healing = Math.min(maxHp - nextHp, Math.max(1, Math.round(getStatusHealing(regenerate) * healingReceivedMultiplier)));
    nextHp += healing;
    const text = targetId === "player" ? `You recover ${healing} Health from Regenerate.` : `${targetName} recovers ${healing} Health from Regenerate.`;
    logs.push(makeLog(text, statusInfo(regenerate)));
    queueHeal(events, pendingEffects, text, targetId, healing);
  }

  const sleeping = nextStatuses.find((status) => status.id === "sleep");
  if (sleeping) {
    if (Math.random() < 0.2) {
      nextStatuses = nextStatuses.filter((status) => status.id !== "sleep");
      const text = targetId === "player" ? "You wake from Sleep." : `${targetName} wakes from Sleep.`;
      logs.push(makeLog(text, statusInfo(sleeping)));
      events.push(text);
    } else {
      const logText = targetId === "player" ? "You are asleep and cannot act." : `${targetName} is asleep and cannot act.`;
      const eventText = targetId === "player" ? "You are asleep and skip the turn." : `${targetName} is asleep and skips the turn.`;
      logs.push(makeLog(logText, statusInfo(sleeping)));
      events.push(eventText);
      return { hp: nextHp, statuses: nextStatuses, skipTurn: true };
    }
  }

  const stunned = nextStatuses.find((status) => status.id === "stunned");
  if (stunned) {
    const logText = targetId === "player" ? "You are Stunned and cannot act." : `${targetName} is Stunned and cannot act.`;
    const eventText = targetId === "player" ? "You are Stunned and skip the turn." : `${targetName} is Stunned and skips the turn.`;
    logs.push(makeLog(logText, statusInfo(stunned)));
    events.push(eventText);
    return { hp: nextHp, statuses: nextStatuses, skipTurn: true };
  }

  const electrified = nextStatuses.find((status) => status.id === "electrified");
  if (electrified && Math.random() < 0.1) {
    nextStatuses = addOrRefreshStatus(nextStatuses, createStatusEffect("stunned", { sourceId: electrified.sourceId }));
    const logText = targetId === "player" ? "You are Stunned by Electrified." : `${targetName} is Stunned by Electrified.`;
    const eventText = targetId === "player" ? "You are Stunned by Electrified and skip the turn." : `${targetName} is Stunned by Electrified and skips the turn.`;
    logs.push(makeLog(logText, statusInfo(electrified)));
    events.push(eventText);
    return { hp: nextHp, statuses: nextStatuses, skipTurn: true };
  }
  return { hp: nextHp, statuses: nextStatuses, skipTurn: false };
}

function processTurnEnd(
  hp: number,
  statuses: StatusEffect[],
  targetId: "player" | string,
  targetName: string,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  playerPoisonDamageMultiplier = 1,
  incomingDamageMultiplier = 1,
): { hp: number; statuses: StatusEffect[]; poisonDamage: number } {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  let poisonDamage = 0;
  const poison = nextStatuses.find((status) => status.id === "poison");
  if (poison) {
    const sourceMultiplier = poison.sourceId === "player" ? playerPoisonDamageMultiplier : 1;
    const absorption = absorbIncomingDamage(nextStatuses, Math.round(getAfflictionDamage(poison, nextStatuses, sourceMultiplier) * incomingDamageMultiplier));
    const damage = absorption.damage;
    poisonDamage = damage;
    nextHp = Math.max(0, nextHp - damage);
    nextStatuses = wakeFromDamage(absorption.statuses, damage);
    const text = targetId === "player" ? `You take ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.`;
    logs.push(makeLog(text, statusInfo(poison)));
    const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage);
    queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  }
  return { hp: nextHp, statuses: decrementStatusDurations(nextStatuses), poisonDamage };
}

function applyBleedAfterAbility(
  hp: number,
  statuses: StatusEffect[],
  targetId: "player" | string,
  targetName: string,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  extraMultiplier = 1,
): { hp: number; statuses: StatusEffect[] } {
  const bleed = statuses.find((status) => status.id === "bleed");
  if (!bleed) return { hp, statuses };
  const absorption = absorbIncomingDamage(statuses, getAfflictionDamage(bleed, statuses, extraMultiplier));
  const damage = absorption.damage;
  const text = targetId === "player" ? `You take ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.`;
  logs.push(makeLog(text, statusInfo(bleed)));
  const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage);
  queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  return { hp: Math.max(0, hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) };
}

function isActorAlive(combat: CombatState, actor: TurnOrderEntry): boolean {
  if (actor.kind === "player") return combat.playerHp > 0;
  return Boolean(combat.enemies.find((enemy) => enemy.instanceId === actor.actorId && enemy.hp > 0));
}

function applyPlayerDeathPrevention(
  hp: number,
  statuses: StatusEffect[],
  alreadyUsed: boolean,
  maxHp: number,
  derived: ReturnType<typeof getDerivedStats>,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
): { hp: number; statuses: StatusEffect[]; used: boolean } {
  if (hp > 0 || alreadyUsed || derived.deathPreventionHealRatio <= 0) return { hp, statuses, used: alreadyUsed };
  const healing = Math.max(1, Math.round(maxHp * derived.deathPreventionHealRatio));
  const stealth = createPlayerAppliedStatus("stealth", derived, {
    duration: Math.max(1, derived.deathPreventionStealthDuration),
    expiresAtTurnStart: false,
  });
  const text = `Panic saves you, restoring ${healing} Health and granting Stealth.`;
  logs.push(makeLog(text, { title: "Panic", description: "The first lethal hit each combat restores 20% of your maximum Health and grants Stealth for 2 turns.", category: "ability" }));
  const eventIndex = queueHeal(events, pendingEffects, text, "player", healing);
  queueStatus(events, pendingEffects, text, "player", stealth, false, eventIndex);
  return { hp: healing, statuses: addOrRefreshStatus(statuses, stealth), used: true };
}

function moveToNextActor(combat: CombatState, character: CharacterState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): CombatState {
  const completedActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  const actedActorIds = new Set(combat.actedActorIds ?? []);
  if (completedActorId) actedActorIds.add(completedActorId);
  combat = { ...combat, actedActorIds: [...actedActorIds] };
  combat = reorderCombat(combat);
  const derived = getDerivedStats(character);
  const saved = applyPlayerDeathPrevention(combat.playerHp, combat.playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
  combat = { ...combat, playerHp: saved.hp, playerStatuses: saved.statuses, deathPreventionUsed: saved.used };
  if (combat.playerHp <= 0) {
    events.push("You have fallen.");
    logs.push(makeLog("Your strength fails. The ash claims another name."));
    return { ...combat, outcome: "defeat" };
  }
  if (combat.enemies.every((enemy) => enemy.hp <= 0)) {
    events.push("Victory.");
    logs.push(makeLog("Victory. The last enemy falls."));
    return { ...combat, outcome: "victory" };
  }

  let nextActor = combat.turnOrder.find((actor) => isActorAlive(combat, actor) && !actedActorIds.has(actor.actorId));
  let nextTurn = combat.turn;
  let nextActedActorIds = [...actedActorIds];
  if (!nextActor) {
    nextTurn += 1;
    nextActedActorIds = [];
    nextActor = combat.turnOrder.find((actor) => isActorAlive(combat, actor));
  }
  if (!nextActor) return combat;
  const nextIndex = combat.turnOrder.findIndex((actor) => actor.actorId === nextActor.actorId);
  let next: CombatState = {
    ...combat,
    activeTurnIndex: nextIndex,
    turn: nextTurn,
    actedActorIds: nextActedActorIds,
  };

  if (nextActor.kind === "player") {
    const playerStatusesBeforeStart = next.playerStatuses;
    const playerTurnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", nextIndex, nextTurn, false, next.playerStatuses, next.energy, 0);
    const playerStart = processTurnStart(next.playerHp, next.playerMaxHp, next.playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier, getEnergyDefenseMultiplier(derived, next.energy));
    const regeneratedEnergy = Math.min(next.maxEnergy, next.energy + getEnergyRegeneration(derived.energyRegen + next.nextTurnEnergyRegenBonus, playerStart.statuses));
    const startSaved = applyPlayerDeathPrevention(playerStart.hp, playerStart.statuses, next.deathPreventionUsed, next.playerMaxHp, derived, logs, events, pendingEffects);
    next = {
      ...next,
      playerHp: startSaved.hp,
      playerStatuses: startSaved.statuses,
      deathPreventionUsed: startSaved.used,
      nextTurnEnergyRegenBonus: 0,
      playerActed: false,
      abilityCooldowns: Object.fromEntries(
        Object.entries(next.abilityCooldowns ?? {})
          .map(([abilityId, turns]) => [abilityId, Math.max(0, turns - 1)] as const)
          .filter(([, turns]) => turns > 0),
      ),
    };
    if (next.playerHp <= 0) {
      events.push("You have fallen.");
      logs.push(makeLog("Your strength fails. The ash claims another name."));
      return { ...next, activeTurnIndex: combat.activeTurnIndex, turn: combat.turn, outcome: "defeat" };
    }
    const playerTurnEffect = pendingEffects.find((effect) => effect.type === "turn" && effect.eventIndex === playerTurnEventIndex);
    if (playerTurnEffect?.type === "turn") {
      const statusesAtTurnAnnouncement = !combat.deathPreventionUsed && startSaved.used ? playerStart.statuses : next.playerStatuses;
      playerTurnEffect.playerStatuses = preserveBarrierUntilDamageEvent(statusesAtTurnAnnouncement, playerStatusesBeforeStart, pendingEffects, "player");
      playerTurnEffect.energy = regeneratedEnergy;
    }
    if (playerStart.skipTurn) {
      const skipped = moveToNextActor({ ...next, activeTurnIndex: nextIndex, turn: nextTurn, playerStatuses: decrementStatusDurations(next.playerStatuses) }, character, logs, events, pendingEffects);
      return { ...skipped, activeTurnIndex: combat.activeTurnIndex, turn: combat.turn };
    }
  } else if (events.length > 0) {
    // Enemy turns do not need their own floating message. Reveal the next actor
    // when the preceding action's final event resolves instead.
    queueTurnAtEvent(pendingEffects, events.length - 1, nextIndex, nextTurn, undefined, next.playerStatuses);
  } else {
    return next;
  }
  return { ...next, activeTurnIndex: combat.activeTurnIndex, turn: combat.turn };
}

interface ProcApplicationState {
  enemies: EnemyState[];
  playerStatuses: StatusEffect[];
  playerHp: number;
  energy: number;
}

function applyPlayerProcs(
  procs: ResolvedCombatTrigger[],
  primaryTargetId: string,
  derived: ReturnType<typeof getDerivedStats>,
  combat: CombatState,
  state: ProcApplicationState,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
): ProcApplicationState {
  let { enemies, playerStatuses, playerHp, energy } = state;
  procs.forEach((proc) => {
    const procInfo: InspectableInfo = { title: proc.name, description: proc.description, category: "ability" };
    logs.push(makeLog(`${proc.sourceName} triggers ${proc.name}.`, procInfo));
    events.push(`${proc.sourceName}: ${proc.name}.`);

    proc.effects.forEach((effect) => {
      const targetMode = effect.target ?? (effect.type === "heal" || effect.type === "heal_percent_max_hp" || effect.type === "gain_energy" || effect.type === "gain_guard" ? "self" : "target");
      const livingEnemies = enemies.filter((enemy) => enemy.hp > 0);
      const enemyTargets = targetMode === "all_enemies"
        ? livingEnemies
        : targetMode === "random_enemy"
          ? livingEnemies.length > 0 ? [livingEnemies[Math.floor(Math.random() * livingEnemies.length)]] : []
          : targetMode === "target"
            ? livingEnemies.filter((enemy) => enemy.instanceId === primaryTargetId)
            : [];

      if (effect.type === "damage") {
        const scaling = effect.scalingStat ? derived[effect.scalingStat] * (effect.scaling ?? 1) : 0;
        const baseDamage = Math.max(0, Math.round(effect.amount + scaling));
        if (targetMode === "self") {
          const incoming = baseDamage <= 0 ? 0 : Math.max(1, Math.round(baseDamage * getIncomingDamageMultiplier(playerStatuses, effect.damageType) * getEnergyDefenseMultiplier(derived, energy)));
          const absorption = absorbIncomingDamage(playerStatuses, incoming);
          const damage = absorption.damage;
          playerHp = Math.max(0, playerHp - damage);
          playerStatuses = wakeFromDamage(absorption.statuses, damage);
          const damageEventIndex = queueDamage(events, pendingEffects, `It deals ${damage} damage to you${absorptionSuffix(absorption.absorbed)}.`, "player", damage);
          queueAbsorptionChanges(pendingEffects, damageEventIndex, "player", absorption);
        } else {
          enemyTargets.forEach((target) => {
            const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId) ?? target;
            const absorption = absorbIncomingDamage(currentTarget.statuses, getModifiedDamage(baseDamage, playerStatuses, currentTarget.statuses, effect.damageType));
            const damage = absorption.damage;
            enemies = enemies.map((enemy) => enemy.instanceId === currentTarget.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) } : enemy);
            const damageEventIndex = queueDamage(events, pendingEffects, `It deals ${damage} damage to ${currentTarget.name}${absorptionSuffix(absorption.absorbed)}.`, currentTarget.instanceId, damage, "player");
            queueAbsorptionChanges(pendingEffects, damageEventIndex, currentTarget.instanceId, absorption);
            if (hasStatus(playerStatuses, "reckless") && damage > 0) {
              const recoil = Math.max(1, Math.round(damage * 0.5 * getEnergyDefenseMultiplier(derived, energy)));
              const recoilAbsorption = absorbIncomingDamage(playerStatuses, recoil);
              playerHp = Math.max(0, playerHp - recoilAbsorption.damage);
              playerStatuses = wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage);
              const recoilEventIndex = queueDamage(events, pendingEffects, `You take ${recoilAbsorption.damage} damage from Reckless${absorptionSuffix(recoilAbsorption.absorbed)}.`, "player", recoilAbsorption.damage);
              queueAbsorptionChanges(pendingEffects, recoilEventIndex, "player", recoilAbsorption);
            }
          });
        }
      }

      if (effect.type === "apply_status") {
        const sourcePower = effect.status.id === "bleed" ? derived.physicalPower
          : effect.status.id === "poison" || effect.status.id === "burn" || effect.status.id === "regenerate" ? derived.magicalPower
            : effect.status.sourcePower;
        const bonusStacks = targetMode === "self" ? 0 : derived.statusApplicationStacks[effect.status.id] ?? 0;
        const status = { ...effect.status, stacks: effect.status.stacks + bonusStacks, sourcePower, sourceId: effect.status.sourceId ?? ("player" as const) };
        const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived)];
        if (targetMode === "self") {
          if (derived.statusImmunities.includes(status.id)) return;
          appliedStatuses.filter((applied) => !derived.statusImmunities.includes(applied.id)).forEach((applied) => {
            playerStatuses = addOrRefreshStatus(playerStatuses, applied);
            logs.push(makeLog(`You gain ${applied.name}.`, statusInfo(applied)));
            queueStatus(events, pendingEffects, `You gain ${applied.name}.`, "player", applied);
          });
        } else {
          enemyTargets.forEach((target) => {
            appliedStatuses.forEach((applied) => {
              enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, applied) } : enemy);
              logs.push(makeLog(`${target.name} gains ${applied.name}.`, statusInfo(applied)));
              queueStatus(events, pendingEffects, `${target.name} gains ${applied.name}.`, target.instanceId, applied);
            });
          });
        }
      }

      if (effect.type === "heal") {
        const amount = Math.max(0, Math.round(effect.amount * derived.healingReceivedMultiplier));
        playerHp = Math.min(combat.playerMaxHp, playerHp + amount);
        logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
        queueHeal(events, pendingEffects, `You recover ${amount} Health.`, "player", amount);
      }

      if (effect.type === "heal_percent_max_hp") {
        const amount = Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(combat.playerMaxHp * effect.ratio * derived.healingReceivedMultiplier)));
        playerHp += amount;
        logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
        queueHeal(events, pendingEffects, `You recover ${amount} Health.`, "player", amount);
      }

      if (effect.type === "gain_energy") {
        energy = Math.min(combat.maxEnergy, energy + effect.amount);
        logs.push(makeLog(`${proc.name} restores ${effect.amount} Energy.`, procInfo));
        events.push(`You gain ${effect.amount} Energy.`);
      }

      if (effect.type === "gain_guard") {
        const amount = Math.max(1, Math.round(effect.amount * derived.guardMultiplier));
        const guard = createStatusEffect("guard", { duration: effect.duration ?? 1, stacks: amount, description: `Absorbs ${amount} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, guard);
        logs.push(makeLog(`You gain ${amount} Guard.`, statusInfo(guard)));
        queueStatus(events, pendingEffects, `You gain ${amount} Guard.`, "player", guard);
      }
    });
  });
  return { enemies, playerStatuses, playerHp, energy };
}

function runPlayerTriggerEvent(
  event: CombatTriggerEvent,
  context: CombatTriggerContext,
  primaryTargetId: string,
  character: CharacterState,
  combat: CombatState,
  derived: ReturnType<typeof getDerivedStats>,
  state: ProcApplicationState,
  procUsage: CombatState["procUsage"],
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
): { state: ProcApplicationState; procUsage: CombatState["procUsage"] } {
  const resolved = resolveCharacterTriggers(character, combat, event, context, procUsage, derived.chanceEffectBonus);
  return {
    state: applyPlayerProcs(resolved.triggered, primaryTargetId, derived, combat, state, logs, events, pendingEffects),
    procUsage: resolved.procUsage,
  };
}

export function useAbility(combat: CombatState, character: CharacterState, abilityId: string): CombatState {
  combat = ensureCombatState(combat, character);
  const ability = ABILITIES[abilityId];
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  const remainingCooldown = combat.abilityCooldowns?.[abilityId] ?? 0;
  if (!ability || combat.outcome !== "active" || activeActor?.kind !== "player" || remainingCooldown > 0) return combat;
  const abilityIsFree = hasStatus(combat.playerStatuses, "distraction");
  const effectiveEnergyCost = abilityIsFree ? 0 : ability.energyCost;
  if (effectiveEnergyCost > combat.energy) return combat;
  const derived = getDerivedStats(character);
  const abilityModifiers = getCharacterAbilityModifiers(character, ability.id);
  let enemies = normalizeEnemies(combat.enemies);
  const displayedEnemyHp = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.hp]));
  const displayedEnemyStatuses = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.statuses]));
  const displayedPlayerHp = combat.playerHp;
  const displayedPlayerStatuses = combat.playerStatuses;
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  const forceCritical = ability.dealsDamage !== false && ability.target !== "self" && hasStatus(playerStatuses, "pinpoint");
  const selfRequirementMissing = Boolean(ability.requiredSelfStatus && !hasStatus(playerStatuses, ability.requiredSelfStatus));
  if (selfRequirementMissing && !abilityModifiers.some((modifier) => modifier.allowWithoutRequiredSelfStatus)) return combat;
  const effectivePowerScaling = selfRequirementMissing
    ? abilityModifiers.find((modifier) => modifier.powerScalingWhenRequirementMissing !== undefined)?.powerScalingWhenRequirementMissing ?? ability.powerScaling
    : ability.powerScaling;
  const effectiveStatusDuration = abilityModifiers.find((modifier) => modifier.statusDuration !== undefined)?.statusDuration ?? ability.statusDuration;
  const effectiveStatusMagnitude = abilityModifiers.find((modifier) => modifier.statusMagnitude !== undefined)?.statusMagnitude ?? ability.statusMagnitude;
  const effectiveStatusExpiresAtTurnStart = abilityModifiers.find((modifier) => modifier.statusExpiresAtTurnStart !== undefined)?.statusExpiresAtTurnStart ?? ability.statusExpiresAtTurnStart;
  let procUsage = { ...(combat.procUsage ?? {}) };
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  let energy = combat.energy - effectiveEnergyCost;
  let nextTurnEnergyRegenBonus = combat.nextTurnEnergyRegenBonus ?? 0;
  let abilityCooldowns = ability.cooldownTurns
    ? { ...(combat.abilityCooldowns ?? {}), [ability.id]: ability.cooldownTurns }
    : (combat.abilityCooldowns ?? {});
  const abilityInfo: InspectableInfo = { title: ability.name, description: `${ability.description} Costs ${ability.energyCost} Energy.`, category: "ability" };
  logs.push(makeLog(`You use ${ability.name}.`, abilityInfo));
  const abilityUseEventIndex = events.length;
  events.push(`You use ${ability.name}.`);
  if (abilityIsFree) {
    playerStatuses = playerStatuses.filter((status) => status.id !== "distraction");
    queueStatusRemoval(pendingEffects, 0, "player", "distraction");
  }
  if (forceCritical) {
    playerStatuses = playerStatuses.filter((status) => status.id !== "pinpoint");
    queueStatusRemoval(pendingEffects, 0, "player", "pinpoint");
  }
  const beforeAbility = runPlayerTriggerEvent(
    "before_ability",
    { abilityId: ability.id, damageType: ability.damageType },
    combat.selectedEnemyId,
    character,
    combat,
    derived,
    { enemies, playerStatuses, playerHp, energy },
    procUsage,
    logs,
    events,
    pendingEffects,
  );
  procUsage = beforeAbility.procUsage;
  ({ enemies, playerStatuses, playerHp, energy } = beforeAbility.state);
  const targets = ability.target === "all_enemies"
    ? enemies.filter((enemy) => enemy.hp > 0 && !isEnemyStealthed(enemy))
    : enemies.filter((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy));
  if (ability.target === "enemy" && targets.length === 0) return combat;
  if (ability.requiredTargetStatus && targets.some((target) => !hasStatus(target.statuses, ability.requiredTargetStatus!))) return combat;
  if (ability.spreadTargetStatus && !enemies.some((enemy) => (
    enemy.hp > 0
    && !isEnemyStealthed(enemy)
    && targets.every((target) => target.instanceId !== enemy.instanceId)
  ))) return combat;

  if (ability.target === "self") {
    if (ability.effect === "reset_cooldowns") {
      abilityCooldowns = ability.cooldownTurns ? { [ability.id]: ability.cooldownTurns } : {};
      logs.push(makeLog("Your ability cooldowns are reset.", abilityInfo));
      events.push("Your ability cooldowns are reset.");
    } else if (ability.effect === "guard") {
      const guardAmount = Math.max(1, Math.round(6 * derived.guardMultiplier));
      playerStatuses = addOrRefreshStatus(playerStatuses, createStatusEffect("guard", { stacks: guardAmount, description: `Absorbs ${guardAmount} incoming damage.` }));
      const guardStatus = playerStatuses.find((status) => status.id === "guard")!;
      logs.push(makeLog(`You gain ${guardAmount} Guard.`, statusInfo(guardStatus)));
      queueStatus(events, pendingEffects, `You gain ${guardAmount} Guard.`, "player", guardStatus);
    } else if (ability.energyRestorePercentOfMax) {
      const restored = Math.min(combat.maxEnergy - energy, Math.max(1, Math.round(combat.maxEnergy * ability.energyRestorePercentOfMax)));
      energy += restored;
      const energyText = `You gain ${restored} Energy.`;
      logs.push(makeLog(energyText, abilityInfo));
      events[abilityUseEventIndex] = energyText;
    } else if (ability.effect && isStatusEffectId(ability.effect) && !derived.statusImmunities.includes(ability.effect)) {
      const status = createPlayerAppliedStatus(ability.effect, derived, { duration: effectiveStatusDuration, stacks: ability.statusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
      playerStatuses = addOrRefreshStatus(playerStatuses, status);
      logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
      queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status);
    }
  } else {
    targets.forEach((initialTarget) => {
      const totalHits = Math.max(1, Math.round(ability.hits ?? 1));
      for (let hitIndex = 0; hitIndex < totalHits; hitIndex += 1) {
      const randomTargets = ability.randomTargetPerHit ? enemies.filter((enemy) => isEnemyTargetable(enemies, enemy)) : [];
      const target = ability.randomTargetPerHit
        ? randomTargets[Math.floor(Math.random() * randomTargets.length)]
        : enemies.find((enemy) => enemy.instanceId === initialTarget.instanceId);
      if (!target || target.hp <= 0) break;
      if (ability.spreadAllTargetDebuffs) {
        const debuffs = target.statuses.filter((status) => status.kind === "debuff");
        const destinations = enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId && !isEnemyStealthed(enemy));
        destinations.forEach((destination) => {
          debuffs.forEach((status) => {
            const copiedStatus = { ...status };
            enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId
              ? { ...enemy, stunned: enemy.stunned || copiedStatus.id === "stunned", statuses: addOrRefreshStatus(enemy.statuses, copiedStatus) }
              : enemy);
            queueStatus(events, pendingEffects, `${destination.name} gains ${copiedStatus.name}.`, destination.instanceId, copiedStatus, copiedStatus.id === "stunned");
          });
        });
        const names = debuffs.map((status) => status.name).join(", ");
        logs.push(makeLog(`${ability.name} spreads ${names || "no debuffs"} from ${target.name}.`, abilityInfo));
        if (destinations.length === 0 || debuffs.length === 0) events.push(`${ability.name} finds nothing to spread.`);
        continue;
      }
      if (ability.spreadTargetStatus) {
        const sourceStatus = target.statuses.find((status) => status.id === ability.spreadTargetStatus);
        const destinations = enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId && !isEnemyStealthed(enemy));
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        if (!sourceStatus || !destination) continue;
        const copiedStatus = { ...sourceStatus };
        enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId
          ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, copiedStatus) }
          : enemy);
        const statusLabel = copiedStatus.stacks > 1 ? `${copiedStatus.stacks} ${copiedStatus.name}` : copiedStatus.name;
        logs.push(makeLog(`${ability.name} spreads ${statusLabel} from ${target.name} to ${destination.name}.`, abilityInfo));
        queueStatus(events, pendingEffects, `You spread ${statusLabel} to ${destination.name}.`, destination.instanceId, copiedStatus, false, undefined, target.instanceId);
        continue;
      }
      if (ability.consumeStatusForHealing) {
        const consumedStatus = target.statuses.find((status) => status.id === ability.consumeStatusForHealing);
        if (!consumedStatus) continue;
        const statusDamageMultiplier = consumedStatus.sourceId === "player" ? derived.statusDamageMultipliers[consumedStatus.id] ?? 1 : 1;
        const potentialHealing = getAfflictionDamage(consumedStatus, target.statuses, statusDamageMultiplier) * DEFAULT_STATUS_DURATION;
        const healing = Math.min(combat.playerMaxHp - playerHp, potentialHealing);
        playerHp += healing;
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== consumedStatus.id) } : enemy);
        logs.push(makeLog(`${ability.name} consumes ${consumedStatus.name} from ${target.name} and restores ${healing} Health.`, abilityInfo));
        const healEventIndex = queueHeal(events, pendingEffects, `You consume ${consumedStatus.name} and recover ${healing} Health.`, "player", healing);
        queueStatusRemoval(pendingEffects, healEventIndex, target.instanceId, consumedStatus.id);
        continue;
      }
      if (ability.detonateStatus) {
        const detonatedStatus = target.statuses.find((status) => status.id === ability.detonateStatus);
        if (!detonatedStatus) continue;
        const statusDamageMultiplier = detonatedStatus.sourceId === "player" ? derived.statusDamageMultipliers[detonatedStatus.id] ?? 1 : 1;
        const absorption = absorbIncomingDamage(target.statuses, getAfflictionDamage(detonatedStatus, target.statuses, statusDamageMultiplier) * DEFAULT_STATUS_DURATION);
        const damage = absorption.damage;
        const modifierRetention = abilityModifiers.reduce((ratio, modifier) => Math.max(ratio, modifier.detonationRetainedStackRatio ?? 0), 0);
        const retentionRatio = derived.preserveStatusOnDetonation.includes(detonatedStatus.id) ? 1 : modifierRetention;
        const retainedStacks = Math.ceil(detonatedStatus.stacks * Math.max(0, Math.min(1, retentionRatio)));
        const retainedStatus = retainedStacks > 0 ? { ...detonatedStatus, stacks: retainedStacks } : null;
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? {
          ...enemy,
          hp: Math.max(0, enemy.hp - damage),
          statuses: wakeFromDamage(absorption.statuses.flatMap((status) => status.id !== detonatedStatus.id ? [status] : retainedStatus ? [retainedStatus] : []), damage),
        } : enemy);
        logs.push(makeLog(`${ability.name} detonates ${detonatedStatus.name} on ${target.name} for ${damage} damage.`, abilityInfo));
        const damageEventIndex = queueDamage(events, pendingEffects, `${detonatedStatus.name} detonates for ${damage} damage${absorptionSuffix(absorption.absorbed)}.`, target.instanceId, damage, "player");
        queueAbsorptionChanges(pendingEffects, damageEventIndex, target.instanceId, absorption);
        if (retainedStatus) queueStatusSet(pendingEffects, damageEventIndex, target.instanceId, retainedStatus);
        else queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, detonatedStatus.id);
        const leechRatio = derived.statusDamageLeech[detonatedStatus.id] ?? 0;
        if (damage > 0 && leechRatio > 0) {
          const healing = Math.min(combat.playerMaxHp - playerHp, Math.ceil(damage * leechRatio));
          if (healing > 0) {
            playerHp += healing;
            logs.push(makeLog(`Leech restores ${healing} Health.`, { title: "Leech", description: "Restores Health from your Poison damage.", category: "ability" }));
            queueHeal(events, pendingEffects, `Leech restores ${healing} Health.`, "player", healing);
          }
        }
        continue;
      }
      if (ability.dealsDamage === false) {
        const statusId = ability.effect === "stun" ? "stunned" : ability.effect;
        if (statusId && isStatusEffectId(statusId) && statusId !== "guard") {
          const groupedAreaApplication = ability.target === "all_enemies";
          if (groupedAreaApplication && target.instanceId !== targets[0]?.instanceId) continue;
          const status = createPlayerAppliedStatus(statusId, derived, { duration: effectiveStatusDuration, stacks: ability.statusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
          const consumedStatusId = ability.consumeTargetStatus;
          const followUp = abilityModifiers.find((modifier) => modifier.applyStatusAfterConsume)?.applyStatusAfterConsume;
          const followUpStatus = followUp ? createPlayerAppliedStatus(followUp.status, derived, { stacks: followUp.stacks, duration: followUp.duration }) : null;
          const additionalStatuses = (ability.statusApplications ?? []).map((application) => createPlayerAppliedStatus(application.status, derived, { stacks: application.stacks, duration: application.duration }));
          const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived), ...(followUpStatus ? [followUpStatus] : []), ...additionalStatuses.flatMap((applied) => [applied, ...createPlayerCompanionStatuses(applied.id, derived)])];
          const affectedTargets = groupedAreaApplication ? targets : [target];
          enemies = enemies.map((enemy) => affectedTargets.some((affected) => affected.instanceId === enemy.instanceId) ? {
            ...enemy,
            stunned: enemy.stunned || appliedStatuses.some((applied) => applied.id === "stunned"),
            statuses: appliedStatuses.reduce(addOrRefreshStatus, consumedStatusId ? enemy.statuses.filter((existing) => existing.id !== consumedStatusId) : enemy.statuses),
          } : enemy);
          const statusNames = appliedStatuses.map((applied) => `${applied.stacks > 1 ? `${applied.stacks} ` : ""}${applied.name}`).join(" and ");
          const statusText = groupedAreaApplication ? `All enemies gain ${statusNames}.` : `${target.name} gains ${statusNames}.`;
          const statusEventIndex = events.length;
          events.push(statusText);
          logs.push(makeLog(statusText, statusInfo(status)));
          affectedTargets.forEach((affectedTarget) => appliedStatuses.forEach((applied) => {
            queueStatus(events, pendingEffects, statusText, affectedTarget.instanceId, applied, applied.id === "stunned", statusEventIndex);
          }));
          affectedTargets.forEach((affectedTarget) => {
            if (consumedStatusId) queueStatusRemoval(pendingEffects, statusEventIndex, affectedTarget.instanceId, consumedStatusId);
          });
        }
        continue;
      }
      if (!rollHit(derived.hitChance, target.dodgeChance)) {
        logs.push(makeLog(`${ability.name} misses ${target.name}.`, abilityInfo));
        queueDamage(events, pendingEffects, `It misses ${target.name}.`, target.instanceId, 0, "player", totalHits);
        continue;
      }
      const conditionalCritBonus = ability.critChanceBonusWithStatus && hasStatus(playerStatuses, ability.critChanceBonusWithStatus.status)
        ? ability.critChanceBonusWithStatus.bonus
        : 0;
      const critical = forceCritical || Math.random() < derived.critChance + getCriticalChanceBonus(playerStatuses) + (ability.critChanceBonus ?? 0) + conditionalCritBonus;
      const damageComponents = ability.damageComponents ?? [{ damageType: ability.damageType ?? "physical", power: ability.power, powerScaling: effectivePowerScaling }];
      const incomingDamage = damageComponents.reduce((total, component) => {
        const offensivePower = getOffensivePower(derived, component.damageType);
        const defense = getDefense(target.armor, target.magicResistance, target.statuses, component.damageType);
        const raw = (component.power ?? 0) + offensivePower * (component.powerScaling ?? 1);
        const talentDamageMultiplier = getCharacterDamageMultiplier(character, playerStatuses, target.statuses, component.damageType);
        const abilityDamageMultiplier = getDamageModifierMultiplier(ability.damageModifiers ?? [], playerStatuses, target.statuses, component.damageType);
        const uniqueDebuffs = new Set(target.statuses.filter((status) => status.kind === "debuff").map((status) => status.id)).size;
        const debuffMultiplier = 1 + uniqueDebuffs * (ability.damagePerTargetDebuff ?? 0);
        return total + getModifiedDamage(Math.max(1, Math.round((raw - defense) * (critical ? 1.6 : 1) * talentDamageMultiplier * abilityDamageMultiplier * debuffMultiplier)), playerStatuses, target.statuses, component.damageType);
      }, 0);
      const absorption = ability.ignoresAbsorption
        ? { damage: incomingDamage, statuses: target.statuses, absorbed: 0, absorbedBy: {} }
        : absorbIncomingDamage(target.statuses, incomingDamage);
      const damage = absorption.damage;
      const targetHpBeforePercent = target.hp / target.maxHp;
      enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) } : enemy);
      const damagedTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
      logs.push(makeLog(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`, abilityInfo));
      const strikeLabel = totalHits > 1 ? `Strike ${hitIndex + 1} deals` : "It deals";
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage to ${target.name}${absorptionSuffix(absorption.absorbed)}.`, target.instanceId, damage, "player", totalHits);
      queueAbsorptionChanges(pendingEffects, damageEventIndex, target.instanceId, absorption);
      if (ability.effect === "bleed") {
        const bleed = createPlayerAppliedStatus("bleed", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, bleed) } : enemy);
        logs.push(makeLog(`${target.name} gains Bleed.`, statusInfo(bleed)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Bleed.`;
        queueStatus(events, pendingEffects, `${target.name} is Bleeding.`, target.instanceId, bleed, false, damageEventIndex);
      }
      if (ability.effect === "poison") {
        const poison = createPlayerAppliedStatus("poison", derived, { duration: effectiveStatusDuration, stacks: ability.statusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
        const poisonLabel = poison.stacks > 1 ? `${poison.stacks} Poison` : "Poison";
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, poison) } : enemy);
        logs.push(makeLog(`${target.name} gains ${poisonLabel}.`, statusInfo(poison)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${poisonLabel}.`;
        queueStatus(events, pendingEffects, `${target.name} is Poisoned.`, target.instanceId, poison, false, damageEventIndex);
      }
      if (ability.effect === "vulnerable") {
        const vulnerableStatus = createPlayerAppliedStatus("vulnerable", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, vulnerableStatus) } : enemy);
        logs.push(makeLog(`${target.name} becomes Vulnerable.`, statusInfo(vulnerableStatus)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Vulnerable.`;
        queueStatus(events, pendingEffects, `${target.name} becomes Vulnerable.`, target.instanceId, vulnerableStatus, false, damageEventIndex);
      }
      if (ability.effect === "stun" && Math.random() < Math.min(1, 0.45 + derived.chanceEffectBonus)) {
        const stunned = createPlayerAppliedStatus("stunned", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, stunned: true, statuses: addOrRefreshStatus(enemy.statuses, stunned) } : enemy);
        logs.push(makeLog(`${target.name} is Stunned.`, statusInfo(stunned)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Stun.`;
        queueStatus(events, pendingEffects, `${target.name} is Stunned.`, target.instanceId, stunned, true, damageEventIndex);
      }
      const directStatusId = ability.effect === "stun" ? "stunned" : ability.effect;
      const speciallyHandled = directStatusId === "bleed" || directStatusId === "poison" || directStatusId === "vulnerable" || directStatusId === "stunned";
      if (directStatusId && isStatusEffectId(directStatusId) && !speciallyHandled && directStatusId !== "guard") {
        const status = createPlayerAppliedStatus(directStatusId, derived, { duration: effectiveStatusDuration, stacks: ability.statusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
        const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived)];
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: appliedStatuses.reduce(addOrRefreshStatus, enemy.statuses) } : enemy);
        appliedStatuses.forEach((applied) => {
          logs.push(makeLog(`${target.name} gains ${applied.name}.`, statusInfo(applied)));
          queueStatus(events, pendingEffects, `${target.name} gains ${applied.name}.`, target.instanceId, applied, false, damageEventIndex);
        });
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${appliedStatuses.map((applied) => applied.name).join(" and ")}.`;
      }

      const extraStatuses = (ability.statusApplications ?? []).filter((application) => !application.onlyOnCritical || critical);
      const appliedExtraStatuses: StatusEffect[] = [];
      extraStatuses.forEach((application) => {
        const status = createPlayerAppliedStatus(application.status, derived, { stacks: application.stacks, duration: application.duration });
        const statuses = [status, ...createPlayerCompanionStatuses(status.id, derived)];
        appliedExtraStatuses.push(...statuses);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? {
          ...enemy,
          stunned: enemy.stunned || statuses.some((applied) => applied.id === "stunned"),
          statuses: statuses.reduce(addOrRefreshStatus, enemy.statuses),
        } : enemy);
        statuses.forEach((applied) => {
          logs.push(makeLog(`${target.name} gains ${applied.name}.`, statusInfo(applied)));
          queueStatus(events, pendingEffects, `${target.name} gains ${applied.name}.`, target.instanceId, applied, applied.id === "stunned", damageEventIndex);
        });
      });
      if (appliedExtraStatuses.length > 0) {
        const labels = appliedExtraStatuses.map((applied) => `${applied.stacks > 1 ? `${applied.stacks} ` : ""}${applied.name}`);
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${labels.join(" and ")}.`;
      }

      (ability.conditionalSelfEffects ?? []).filter((effect) => hasStatus(target.statuses, effect.targetHasStatus)).forEach((effect) => {
        const healing = effect.healPercentMaxHp
          ? Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(combat.playerMaxHp * effect.healPercentMaxHp * derived.healingReceivedMultiplier)))
          : 0;
        const regeneration = Math.max(0, effect.nextTurnEnergyRegen ?? 0);
        nextTurnEnergyRegenBonus += regeneration;
        const benefits = [
          ...(healing > 0 ? [`restores ${healing} Health`] : []),
          ...(regeneration > 0 ? [`grants +${regeneration} Energy regeneration next turn`] : []),
        ];
        if (benefits.length === 0) return;
        const text = `${ability.name} ${benefits.join(" and ")}.`;
        logs.push(makeLog(text, abilityInfo));
        let eventIndex: number;
        if (healing > 0) {
          playerHp += healing;
          eventIndex = queueHeal(events, pendingEffects, text, "player", healing);
        } else {
          eventIndex = events.length;
          events.push(text);
        }
        if (regeneration > 0) queueNextTurnEnergyRegeneration(pendingEffects, eventIndex, regeneration);
      });

      if (ability.consumeTargetStatus) {
        const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
        const consumed = currentTarget?.statuses.find((status) => status.id === ability.consumeTargetStatus);
        if (consumed) {
          const modifierRatio = abilityModifiers.find((modifier) => modifier.statusConsumptionRatio !== undefined)?.statusConsumptionRatio;
          const ratio = Math.max(0, Math.min(1, modifierRatio ?? ability.consumeTargetStatusRatio ?? 1));
          const consumedStacks = Math.max(1, Math.ceil(consumed.stacks * ratio));
          const remainingStacks = Math.max(0, consumed.stacks - consumedStacks);
          enemies = enemies.map((enemy) => enemy.instanceId !== target.instanceId ? enemy : {
            ...enemy,
            statuses: enemy.statuses.flatMap((status) => status.id !== consumed.id ? [status] : remainingStacks > 0 ? [{ ...status, stacks: remainingStacks }] : []),
          });
          if (remainingStacks > 0) queueStatusSet(pendingEffects, damageEventIndex, target.instanceId, { ...consumed, stacks: remainingStacks });
          else queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, consumed.id);
          events[damageEventIndex] = `${events[damageEventIndex].replace(/\.$/, "")} and consumes ${consumedStacks} ${consumed.name}.`;
        }
      }

      if (ability.grantsNextCritical) {
        const pinpoint = createStatusEffect("pinpoint", { duration: 1, sourceId: "player" });
        playerStatuses = addOrRefreshStatus(playerStatuses, pinpoint);
        queueStatus(events, pendingEffects, "Your next damaging ability is guaranteed to critically strike.", "player", pinpoint, false, damageEventIndex);
      }

      const triggerContext = {
        abilityId: ability.id,
        damageType: ability.damageType ?? damageComponents[0]?.damageType,
        critical,
        damage,
        targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [],
        targetHpBeforePercent,
        targetHpAfterPercent: damagedTarget ? damagedTarget.hp / damagedTarget.maxHp : undefined,
      };
      const triggerEvents = critical ? ["on_hit", "on_crit"] as const : ["on_hit"] as const;
      triggerEvents.forEach((triggerEvent) => {
        const result = runPlayerTriggerEvent(triggerEvent, triggerContext, target.instanceId, character, combat, derived, { enemies, playerStatuses, playerHp, energy }, procUsage, logs, events, pendingEffects);
        procUsage = result.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = result.state);
      });
      if ((enemies.find((enemy) => enemy.instanceId === target.instanceId)?.hp ?? 1) <= 0) {
        const result = runPlayerTriggerEvent("on_kill", triggerContext, target.instanceId, character, combat, derived, { enemies, playerStatuses, playerHp, energy }, procUsage, logs, events, pendingEffects);
        procUsage = result.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = result.state);
        if (ability.refundEnergyOnKill && effectiveEnergyCost > 0) {
          const refunded = Math.min(combat.maxEnergy - energy, effectiveEnergyCost);
          energy += refunded;
          if (refunded > 0) events.push(`${ability.name} restores ${refunded} Energy.`);
        }
        if (ability.resetCooldownOnKill) {
          const { [ability.id]: _removedCooldown, ...remainingCooldowns } = abilityCooldowns;
          abilityCooldowns = remainingCooldowns;
          events.push(`${ability.name}'s cooldown is reset.`);
        }
      }
      if (hasStatus(playerStatuses, "reckless") && damage > 0) {
        const recoil = Math.max(1, Math.round(damage * 0.5 * getEnergyDefenseMultiplier(derived, energy)));
        const recoilAbsorption = absorbIncomingDamage(playerStatuses, recoil);
        playerHp = Math.max(0, playerHp - recoilAbsorption.damage);
        playerStatuses = wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage);
        logs.push(makeLog(`Reckless deals ${recoilAbsorption.damage} damage to you.`, statusInfo(playerStatuses.find((status) => status.id === "reckless") ?? createStatusEffect("reckless"))));
        const recoilEventIndex = queueDamage(events, pendingEffects, `You take ${recoilAbsorption.damage} damage from Reckless${absorptionSuffix(recoilAbsorption.absorbed)}.`, "player", recoilAbsorption.damage);
        queueAbsorptionChanges(pendingEffects, recoilEventIndex, "player", recoilAbsorption);
      }
      }
    });
    if (ability.effect === "energy") {
      energy = Math.min(combat.maxEnergy, energy + 2);
      logs.push(makeLog("You reclaim 2 Energy.", abilityInfo));
      events.push("You reclaim 2 Energy.");
    }
  }

  (ability.selfStatusApplications ?? []).forEach((application) => {
    if (derived.statusImmunities.includes(application.status)) return;
    const status = createPlayerAppliedStatus(application.status, derived, application);
    playerStatuses = addOrRefreshStatus(playerStatuses, status);
    logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
    queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status);
  });

  const bleedResult = applyBleedAfterAbility(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.bleedDamageTakenMultiplier * getEnergyDefenseMultiplier(derived, energy));
  playerHp = bleedResult.hp;
  playerStatuses = bleedResult.statuses;
  const saved = applyPlayerDeathPrevention(playerHp, playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
  playerHp = saved.hp;
  playerStatuses = saved.statuses;
  let deathPreventionUsed = saved.used;

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    events.push("Victory.");
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, pendingEffects, damagedTargets, enemies: displayedEnemies, playerHp: displayedPlayerHp, playerStatuses: displayedPlayerStatuses, energy, procUsage, deathPreventionUsed, nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0, abilityCooldowns, playerActed: true, attackingActorId: null, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "active" };
  }

  if (ability.grantsImmediateTurn) {
    const turnEnd = processTurnEnd(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, energy));
    playerHp = turnEnd.hp;
    playerStatuses = turnEnd.statuses;
    const turnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", combat.activeTurnIndex, combat.turn + 1, false, playerStatuses, energy, 0);
    const statusesBeforeStart = playerStatuses;
    const playerStart = processTurnStart(playerHp, combat.playerMaxHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier, getEnergyDefenseMultiplier(derived, energy));
    playerHp = playerStart.hp;
    playerStatuses = playerStart.statuses;
    energy = Math.min(combat.maxEnergy, energy + getEnergyRegeneration(derived.energyRegen + nextTurnEnergyRegenBonus, playerStatuses));
    nextTurnEnergyRegenBonus = 0;
    const immediateTurnSaved = applyPlayerDeathPrevention(playerHp, playerStatuses, deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
    playerHp = immediateTurnSaved.hp;
    playerStatuses = immediateTurnSaved.statuses;
    deathPreventionUsed = immediateTurnSaved.used;
    abilityCooldowns = Object.fromEntries(
      Object.entries(abilityCooldowns)
        .map(([id, turns]) => [id, Math.max(0, turns - 1)] as const)
        .filter(([, turns]) => turns > 0),
    );
    const turnEffect = pendingEffects.find((effect) => effect.type === "turn" && effect.eventIndex === turnEventIndex);
    if (turnEffect?.type === "turn") {
      const statusesAtTurnAnnouncement = !saved.used && immediateTurnSaved.used ? playerStart.statuses : playerStatuses;
      turnEffect.playerStatuses = preserveBarrierUntilDamageEvent(statusesAtTurnAnnouncement, statusesBeforeStart, pendingEffects, "player");
      turnEffect.energy = energy;
    }
    logs.push(makeLog(`${ability.name} grants you another turn.`, abilityInfo));
    const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
      ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
      ?? "";
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
    return {
      ...combat,
      eventId: (combat.eventId ?? 0) + 1,
      floatingEvents: events,
      pendingEffects,
      damagedTargets,
      enemies: displayedEnemies,
      playerHp: displayedPlayerHp,
      playerStatuses: displayedPlayerStatuses,
      energy: combat.energy - effectiveEnergyCost,
      procUsage,
      deathPreventionUsed,
      nextTurnEnergyRegenBonus,
      abilityCooldowns,
      playerActed: true,
      attackingActorId: null,
      selectedEnemyId: nextSelected,
      log: [...logs, ...combat.log].slice(0, 24),
    };
  }

  const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
    ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
    ?? "";
  const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
  return {
    ...combat,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    enemies: displayedEnemies,
    playerHp: displayedPlayerHp,
    playerStatuses: displayedPlayerStatuses,
    energy,
    procUsage,
    deathPreventionUsed,
    nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0,
    abilityCooldowns,
    playerActed: true,
    attackingActorId: null,
    selectedEnemyId: nextSelected,
    log: [...logs, ...combat.log].slice(0, 24),
  };
}

export function endPlayerTurn(combat: CombatState, character: CharacterState): CombatState {
  combat = ensureCombatState(combat, character);
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  if (combat.outcome !== "active" || activeActor?.kind !== "player") return combat;
  const logs: CombatLogEntry[] = [makeLog("You end your turn.")];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  const displayedPlayerHp = combat.playerHp;
  const derived = getDerivedStats(character);
  const turnEnd = processTurnEnd(combat.playerHp, combat.playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, combat.energy));
  const next = moveToNextActor({ ...combat, playerHp: turnEnd.hp, playerStatuses: turnEnd.statuses }, character, logs, events, pendingEffects);
  return {
    ...next,
    outcome: pendingEffects.length > 0 ? "active" : next.outcome,
    playerHp: displayedPlayerHp,
    playerStatuses: combat.playerStatuses,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    attackingActorId: null,
    log: [...logs, ...combat.log].slice(0, 24),
  };
}

export function takeEnemyTurn(combat: CombatState, character: CharacterState, expectedActorId?: string): CombatState {
  combat = ensureCombatState(combat, character);
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  if (combat.outcome !== "active" || activeActor?.kind !== "enemy" || (expectedActorId && activeActor.actorId !== expectedActorId)) return combat;

  const derived = getDerivedStats(character);
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  let enemies = normalizeEnemies(combat.enemies);
  const displayedEnemyHp = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.hp]));
  const displayedEnemyStatuses = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.statuses]));
  const displayedPlayerHp = combat.playerHp;
  const displayedPlayerStatuses = combat.playerStatuses;
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  let procUsage = { ...(combat.procUsage ?? {}) };
  const enemyIndex = enemies.findIndex((enemy) => enemy.instanceId === activeActor.actorId);
  if (enemyIndex < 0) return moveToNextActor(combat, character, logs, events, pendingEffects);

  const originalEnemy = enemies[enemyIndex];
  let statusResolutionEventIndex: number | null = null;
  const enemyStart = processTurnStart(originalEnemy.hp, originalEnemy.maxHp, originalEnemy.statuses, originalEnemy.instanceId, originalEnemy.name, logs, events, pendingEffects);
  const regeneratedEnergy = Math.min(originalEnemy.maxEnergy, originalEnemy.energy + getEnergyRegeneration(1, enemyStart.statuses));
  let enemy = { ...originalEnemy, hp: enemyStart.hp, statuses: enemyStart.statuses, energy: regeneratedEnergy, stunned: false };
  enemies[enemyIndex] = enemy;
  let nextBase: CombatState = { ...combat, enemies, playerHp, playerStatuses };

  if (enemy.hp <= 0) {
    logs.push(makeLog(`${enemy.name} falls.`));
    events.push(`${enemy.name} falls.`);
  } else if (enemyStart.skipTurn) {
    // The status event queued above explains why this actor cannot act.
  } else if (enemy.energy < enemy.energyCost) {
    logs.push(makeLog(`${enemy.name} gathers Energy.`));
    events.push(`${enemy.name} gathers Energy.`);
  } else if (hasStatus(playerStatuses, "stealth")) {
    const stealth = playerStatuses.find((status) => status.id === "stealth")!;
    logs.push(makeLog(`${enemy.name} cannot target you while you are in Stealth.`, statusInfo(stealth)));
    events.push(`${enemy.name} cannot find you through Stealth.`);
  } else {
    const attackName = enemy.intentText.split(" · ")[0];
    const enemyAttackInfo: InspectableInfo = { title: attackName, description: enemy.attackDescription, category: "ability" };
    events.push(`${enemy.name} uses ${attackName}.`);
    const playerDodgeChance = capDodgeChance(derived.dodgeChance + getDodgeChanceBonus(playerStatuses));
    if (!rollHit(enemy.hitChance, playerDodgeChance)) {
      logs.push(makeLog(`${enemy.name} misses you.`, enemyAttackInfo));
      queueDamage(events, pendingEffects, "You dodge the attack.", "player", 0, enemy.instanceId);
    } else {
      const defense = getDefense(derived.armor, derived.magicResistance, playerStatuses, enemy.damageType);
      const critical = Math.random() < getCriticalChanceBonus(enemy.statuses);
      const baseIncoming = Math.max(1, Math.round((enemy.power - Math.floor(defense * 0.35)) * (critical ? 1.6 : 1)));
      const incoming = Math.max(0, Math.round(getModifiedDamage(baseIncoming, enemy.statuses, playerStatuses, enemy.damageType) * getEnergyDefenseMultiplier(derived, combat.energy)));
      const absorption = absorbIncomingDamage(playerStatuses, incoming);
      const blocked = absorption.absorbed;
      const damage = absorption.damage;
      playerHp = Math.max(0, playerHp - damage);
      playerStatuses = wakeFromDamage(absorption.statuses, damage);
      logs.push(makeLog(`${enemy.name} uses ${attackName} for ${damage}${critical ? " critical" : ""}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage, enemy.instanceId);
      queueAbsorptionChanges(pendingEffects, damageEventIndex, "player", absorption);
      if (damage > 0 && enemy.onHitEffect === "bleed" && !derived.statusImmunities.includes("bleed")) {
        const bleed = createStatusEffect("bleed", { sourcePower: enemy.power, sourceId: enemy.instanceId });
        playerStatuses = addOrRefreshStatus(playerStatuses, bleed);
        logs.push(makeLog("You gain Bleed.", statusInfo(bleed)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""} and applies Bleed.`;
        queueStatus(events, pendingEffects, "You are Bleeding.", "player", bleed, false, damageEventIndex);
      }
      if (damage > 0) {
        const result = runPlayerTriggerEvent(
          "damage_taken",
          { damage, targetStatusIds: playerStatuses.map((status) => status.id) },
          enemy.instanceId,
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy: combat.energy },
          procUsage,
          logs,
          events,
          pendingEffects,
        );
        procUsage = result.procUsage;
        enemies = result.state.enemies;
        playerStatuses = result.state.playerStatuses;
        playerHp = result.state.playerHp;
      }
      if (hasStatus(enemy.statuses, "reckless") && damage > 0) {
        const reckless = enemy.statuses.find((status) => status.id === "reckless")!;
        const recoil = Math.max(1, Math.round(damage * 0.5));
        const recoilAbsorption = absorbIncomingDamage(enemy.statuses, recoil);
        enemy = { ...enemy, hp: Math.max(0, enemy.hp - recoilAbsorption.damage), statuses: wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage) };
        enemies[enemyIndex] = enemy;
        logs.push(makeLog(`${enemy.name} takes ${recoilAbsorption.damage} damage from Reckless.`, statusInfo(reckless)));
        const recoilEventIndex = queueDamage(events, pendingEffects, `${enemy.name} takes ${recoilAbsorption.damage} damage from Reckless${absorptionSuffix(recoilAbsorption.absorbed)}.`, enemy.instanceId, recoilAbsorption.damage);
        queueAbsorptionChanges(pendingEffects, recoilEventIndex, enemy.instanceId, recoilAbsorption);
      }
    }
    const bleedResult = applyBleedAfterAbility(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects);
    enemy = { ...enemy, hp: bleedResult.hp, statuses: bleedResult.statuses };
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId
      ? { ...candidate, ...enemy, energy: Math.max(0, enemy.energy - enemy.energyCost) }
      : candidate);
    nextBase = { ...nextBase, enemies, playerHp, playerStatuses, procUsage };
  }

  enemy = enemies.find((candidate) => candidate.instanceId === enemy.instanceId) ?? enemy;
  if (enemy.hp > 0) {
    const hpBeforePoison = enemy.hp;
    const poisonEventIndex = events.length;
    const enemyEnd = processTurnEnd(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, derived.statusDamageMultipliers.poison ?? 1);
    if (enemy.statuses.some((status) => status.id === "poison")) statusResolutionEventIndex = poisonEventIndex;
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, hp: enemyEnd.hp, statuses: enemyEnd.statuses } : candidate);
    const poison = enemy.statuses.find((status) => status.id === "poison");
    const leechRatio = poison?.sourceId === "player" ? derived.statusDamageLeech.poison ?? 0 : 0;
    if (enemyEnd.poisonDamage > 0 && leechRatio > 0) {
      const healing = Math.min(combat.playerMaxHp - playerHp, Math.ceil(enemyEnd.poisonDamage * leechRatio));
      if (healing > 0) {
        playerHp += healing;
        logs.push(makeLog(`Leech restores ${healing} Health.`, { title: "Leech", description: "Restores Health equal to 5% of your Poison damage.", category: "ability" }));
        queueHeal(events, pendingEffects, `Leech restores ${healing} Health.`, "player", healing);
      }
    }
    if (hpBeforePoison > 0 && enemyEnd.hp <= 0 && poison?.sourceId === "player") {
      const result = runPlayerTriggerEvent(
        "on_kill",
        { damage: enemyEnd.poisonDamage, damageType: "arcane", targetStatusIds: enemyEnd.statuses.map((status) => status.id), targetHpBeforePercent: hpBeforePoison / enemy.maxHp, targetHpAfterPercent: 0 },
        enemy.instanceId,
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy: combat.energy },
        procUsage,
        logs,
        events,
        pendingEffects,
      );
      procUsage = result.procUsage;
      enemies = result.state.enemies;
      playerStatuses = result.state.playerStatuses;
      playerHp = result.state.playerHp;
    }
  } else {
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, statuses: decrementStatusDurations(candidate.statuses) } : candidate);
  }
  nextBase = { ...nextBase, enemies, playerHp, playerStatuses, procUsage };

  const resolvedEnemyStatuses = enemies.find((candidate) => candidate.instanceId === originalEnemy.instanceId)?.statuses ?? [];
  const reconciliationEventIndex = statusResolutionEventIndex ?? events.length - 1;
  if (reconciliationEventIndex >= 0) {
    queueStatusReconciliation(pendingEffects, reconciliationEventIndex, originalEnemy.instanceId, originalEnemy.statuses, resolvedEnemyStatuses);
  }

  const selectedEnemyId = enemies.find((candidate) => candidate.instanceId === nextBase.selectedEnemyId && isEnemyTargetable(enemies, candidate))?.instanceId
    ?? enemies.find((candidate) => isEnemyTargetable(enemies, candidate))?.instanceId
    ?? "";
  nextBase = { ...nextBase, selectedEnemyId };
  const next = moveToNextActor(nextBase, character, logs, events, pendingEffects);
  const displayedEnemies = next.enemies.map((candidate) => ({
    ...candidate,
    hp: displayedEnemyHp.get(candidate.instanceId) ?? candidate.hp,
    statuses: displayedEnemyStatuses.get(candidate.instanceId) ?? candidate.statuses,
  }));
  return {
    ...next,
    outcome: pendingEffects.length > 0 ? "active" : next.outcome,
    playerHp: displayedPlayerHp,
    playerStatuses: displayedPlayerStatuses,
    enemies: displayedEnemies,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    attackingActorId: null,
    log: [...logs, ...combat.log].slice(0, 24),
  };
}

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
  let nextTurnEnergyRegenBonus = combat.nextTurnEnergyRegenBonus ?? 0;
  let attackingActorId = combat.attackingActorId;
  let attackAnimationId = combat.attackAnimationId ?? 0;
  let attackEffectId = combat.attackEffectId ?? null;
  const resolvesAttackImpact = matchingEffects.some((effect) => "damage" in effect && Boolean(effect.attackerId));
  const damagedTargets: string[] = [];
  const statusAnimations = matchingEffects.flatMap((effect) => effect.type === "status"
    ? [{ id: effect.id, statusId: effect.status.id, targetId: effect.targetId, sourceTargetId: effect.sourceTargetId }]
    : []);
  matchingEffects.forEach((effect) => {
    if (effect.type === "energy_regen_bonus") {
      nextTurnEnergyRegenBonus += effect.amount;
      return;
    }
    if (effect.type === "set_status") {
      if (effect.targetId === "player") {
        playerStatuses = [...playerStatuses.filter((status) => status.id !== effect.status.id), effect.status];
      } else {
        enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId
          ? { ...enemy, statuses: [...enemy.statuses.filter((status) => status.id !== effect.status.id), effect.status] }
          : enemy);
      }
      return;
    }
    if (effect.type === "remove_status") {
      if (effect.targetId === "player") {
        playerStatuses = playerStatuses.filter((status) => status.id !== effect.statusId);
      } else {
        enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== effect.statusId) } : enemy);
      }
      return;
    }
    if (effect.type === "status") {
      if (effect.targetId === "player") {
        playerStatuses = addOrRefreshStatus(playerStatuses, effect.status);
      } else {
        enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId
          ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, effect.status), stunned: effect.stunned ? true : enemy.stunned }
          : enemy);
      }
      return;
    }
    if (effect.type === "turn") {
      activeTurnIndex = effect.activeTurnIndex;
      turn = effect.turn;
      playerActed = effect.playerActed ?? playerActed;
      playerStatuses = effect.playerStatuses ?? playerStatuses;
      energy = effect.energy ?? energy;
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
      if (effect.damage > 0) damagedTargets.push("player");
      return;
    }
    enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, hp: Math.max(0, enemy.hp - effect.damage), statuses: wakeFromDamage(enemy.statuses, effect.damage) } : enemy);
    if (effect.damage > 0) damagedTargets.push(effect.targetId);
  });

  const consumedIds = new Set(matchingEffects.map((effect) => effect.id));
  if (attackEffectId && consumedIds.has(attackEffectId)) attackEffectId = null;
  const pendingEffects = (combat.pendingEffects ?? []).filter((effect) => !consumedIds.has(effect.id));
  const playerWillRecover = pendingEffects.some((effect) => effect.type === "heal" && effect.targetId === "player" && effect.amount > 0);
  const outcome = playerHp <= 0 && !playerWillRecover ? "defeat" : enemies.every((enemy) => enemy.hp <= 0) ? "victory" : combat.outcome;
  const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
    ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
    ?? "";
  return reorderCombat({ ...combat, playerHp, playerStatuses, enemies, activeTurnIndex, turn, playerActed, energy, nextTurnEnergyRegenBonus, attackingActorId, attackAnimationId, attackEffectId, pendingEffects, damagedTargets, statusAnimations, selectedEnemyId, outcome });
}

export function finishCombatAttack(combat: CombatState, eventId: number, animationId: number): CombatState {
  if (combat.eventId !== eventId || combat.attackAnimationId !== animationId || !combat.attackingActorId) return combat;
  return { ...combat, attackingActorId: null, attackEffectId: null };
}

export function primeCombatAttack(combat: CombatState, eventId: number, eventIndex: number): CombatState {
  if (combat.eventId !== eventId) return combat;
  const attackEffect = (combat.pendingEffects ?? []).find((effect): effect is Extract<CombatPendingEffect, { damage: number }> => effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId));
  if (!attackEffect || combat.attackEffectId === attackEffect.id) return combat;
  return {
    ...combat,
    attackingActorId: attackEffect.attackerId ?? null,
    attackAnimationId: (combat.attackAnimationId ?? 0) + 1,
    attackAnimationHitCount: Math.max(1, attackEffect.animationHitCount ?? 1),
    attackEffectId: attackEffect.id,
    damagedTargets: [],
    statusAnimations: [],
  };
}
