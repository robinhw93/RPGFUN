import { getDerivedStats } from "./character";
import { getEffectiveDodgeChance, rollHit } from "./combatMath";
import { ABILITIES, ENEMIES } from "./data";
import {
  absorbIncomingDamage,
  addOrRefreshStatus,
  canApplyStatusEffect,
  createStatusEffect,
  DEFAULT_STATUS_DURATION,
  decrementStatusDurations,
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getEffectiveArmor,
  getEnergyRegeneration,
  getIncomingDamageMultiplier,
  getHitChanceMultiplier,
  getOutgoingDamageMultiplier,
  getStatusDamage,
  getStatusHealing,
  getStatusInitiativeBonus,
  grantDiminishingReturnsAfterStun,
  hasStatus,
  isMagicalDamage,
  isStatusEffectId,
} from "./statusEffects";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers, getCharacterCombatFeatures, getCharacterDamageMultiplier, getCharacterStatusDamageMultiplier, getDamageModifierMultiplier, resolveCharacterTriggers } from "./combatFeatures";
import type { CombatTriggerContext, ResolvedCombatTrigger } from "./combatFeatures";
import type { Ability, AbilityAttackPresentation, AbilityRange, CharacterState, CombatAbilityVfxKind, CombatLogEntry, CombatPendingEffect, CombatState, CombatTriggerEvent, DamageType, EnemyState, InspectableInfo, StatusEffect, StatusEffectId, TurnOrderEntry } from "./types";

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
    playerHasTakenDamage: false,
    playerHasMissed: false,
    nextTurnEnergyRegenBonus: 0,
    damagedTargets: [],
    missedTargets: [],
    damageSourceLabels: {},
    statusAnimations: [],
    abilityAnimations: [],
    projectileAnimations: [],
    passiveAnimations: [],
    attackingActorId: null,
    attackAnimationId: 0,
    attackAnimationHitCount: 1,
    attackAnimationDurationMultiplier: 1,
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

interface QueueDamageOptions {
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

function queueDamage(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, damage: number, options: QueueDamageOptions = {}): number {
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

function getAbilityAttackPresentation(ability: Ability): Pick<QueueDamageOptions, "attackRange" | "attackPresentation" | "projectileVfx" | "projectileDamageType"> {
  return {
    attackRange: ability.range,
    attackPresentation: ability.range === "melee" ? "melee" : ability.rangedPresentation ?? "projectile",
    projectileVfx: ability.vfx,
    projectileDamageType: ability.damageType ?? ability.damageComponents?.[0]?.damageType ?? ability.consumeTargetStatusForDamage?.damageType,
  };
}

function queueDamageAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, damage: number, sourceLabel?: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "damage", targetId, damage, sourceLabel });
}

function queueHeal(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, amount: number): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
  return eventIndex;
}

function queueHealAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, amount: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
}

function queueNextTurnEnergyRegeneration(pendingEffects: CombatPendingEffect[], eventIndex: number, amount: number): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "energy_regen_bonus", amount });
}

function queuePassiveAnimation(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: "player" | string, text: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "passive_text", targetId, text, lane: combatEffectSequence % 3 });
}

function queueAbilityVfx(pendingEffects: CombatPendingEffect[], eventIndex: number, kind: CombatAbilityVfxKind, targetId?: "player" | string, sourceTargetId?: "player" | string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "ability_vfx", kind, targetId, sourceTargetId });
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
  resolvedStatuses.filter((resolvedStatus) => !displayedStatuses.some((status) => status.id === resolvedStatus.id)).forEach((resolvedStatus) => {
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
  if ((result.absorbedBy.barrier ?? 0) > 0) queueAbilityVfx(pendingEffects, eventIndex, "barrier_absorb", targetId, targetId);
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

function queueTurnAtEvent(pendingEffects: CombatPendingEffect[], eventIndex: number, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number, abilityCooldowns?: Record<string, number>, activeActorId?: string): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "turn", activeTurnIndex, activeActorId, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus, abilityCooldowns });
}

function queueTurn(events: string[], pendingEffects: CombatPendingEffect[], text: string, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number, nextTurnEnergyRegenBonus?: number, abilityCooldowns?: Record<string, number>, activeActorId?: string): void {
  const eventIndex = events.length;
  events.push(text);
  queueTurnAtEvent(pendingEffects, eventIndex, activeTurnIndex, turn, playerActed, playerStatuses, energy, nextTurnEnergyRegenBonus, abilityCooldowns, activeActorId);
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
    const template = ENEMIES[enemy.id];
    let statuses = normalizeStatuses(enemy.statuses ?? []);
    if (enemy.stunned && !hasStatus(statuses, "stunned") && canApplyStatusEffect(statuses, "stunned")) statuses = addOrRefreshStatus(statuses, createStatusEffect("stunned"));
    return {
      ...template,
      ...enemy,
      // Migrate active training combats created while DUMMY incorrectly had 1000% Hit Chance.
      hitChance: enemy.id === "dummy" && enemy.hitChance === 10 ? template.hitChance : enemy.hitChance ?? template.hitChance,
      energy: enemy.energy ?? 10,
      maxEnergy: enemy.maxEnergy ?? 10,
      energyCost: enemy.energyCost ?? template.energyCost,
      attackDescription: enemy.attackDescription ?? template.attackDescription,
      onHitEffect: enemy.onHitEffect ?? template.onHitEffect,
      statuses,
      stunned: hasStatus(statuses, "stunned"),
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
      missedTargets: combat.missedTargets ?? [],
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

function getAfflictionDamage(
  status: StatusEffect,
  targetStatuses: StatusEffect[],
  extraMultiplier = 1,
  armor = 0,
  magicResistance = 0,
): number {
  const damageType: DamageType = status.id === "burn" ? "fire" : status.id === "poison" ? "arcane" : "physical";
  const relevantDefense = status.id === "bleed"
    ? getEffectiveArmor(armor, targetStatuses)
    : status.id === "poison" || status.id === "burn"
      ? Math.max(0, magicResistance)
      : 0;
  const damageAfterDefense = Math.max(1, getStatusDamage(status) - relevantDefense * 0.5);
  return Math.max(1, Math.round(damageAfterDefense * getIncomingDamageMultiplier(targetStatuses, damageType) * extraMultiplier));
}

function getEnergyDefenseMultiplier(derived: ReturnType<typeof getDerivedStats>, energy: number, statuses: StatusEffect[] = []): number {
  const energyMultiplier = Math.max(0, 1 - Math.max(0, energy) * derived.incomingDamageReductionPerEnergy);
  const stunnedMultiplier = hasStatus(statuses, "stunned") ? derived.incomingDamageMultiplierWhileStunned : 1;
  return energyMultiplier * stunnedMultiplier;
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
  const base = createStatusEffect(statusId);
  const duration = (options.duration ?? base.duration) + (derived.statusDurationBonuses[statusId] ?? 0);
  return createStatusEffect(statusId, { sourcePower, sourceId: "player", ...options, duration, stacks });
}

function createPlayerCompanionStatuses(statusId: StatusEffect["id"], derived: ReturnType<typeof getDerivedStats>): StatusEffect[] {
  return (derived.statusApplicationCompanions[statusId] ?? []).map((companionId) => createPlayerAppliedStatus(companionId, derived));
}

function wakeFromDamage(statuses: StatusEffect[], damage: number): StatusEffect[] {
  return damage > 0 ? statuses.filter((status) => status.id !== "sleep" && status.id !== "frozen") : statuses;
}

function getActorStatuses(combat: CombatState, actor: TurnOrderEntry): StatusEffect[] {
  return actor.kind === "player"
    ? combat.playerStatuses
    : combat.enemies.find((enemy) => enemy.instanceId === actor.actorId)?.statuses ?? [];
}

export function getCombatInitiative(combat: CombatState, actor: TurnOrderEntry): number {
  const statuses = getActorStatuses(combat, actor);
  if (hasStatus(statuses, "slowed")) return 0;
  return actor.initiative + (actor.kind === "player" ? getStatusInitiativeBonus(statuses) : 0);
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
  burnDamage: number;
  burnEventIndex: number | null;
  healing: number;
  healingEventIndex: number | null;
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
  armor = 0,
  magicResistance = 0,
  playerStatusDamageMultiplier = 1,
): StatusTurnResult {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  let burnDamage = 0;
  let burnEventIndex: number | null = null;
  let healing = 0;
  let healingEventIndex: number | null = null;
  // One-round defensive effects protect the owner until their next turn begins.
  nextStatuses = nextStatuses.filter((status) => status.expiresAtTurnStart !== true && (status.id !== "stealth" || status.expiresAtTurnStart === false) && status.id !== "guard");
  const burn = nextStatuses.find((status) => status.id === "burn");
  if (burn) {
    const sourceMultiplier = burn.sourceId === "player" ? playerStatusDamageMultiplier : 1;
    const absorption = absorbIncomingDamage(nextStatuses, Math.round(getAfflictionDamage(burn, nextStatuses, sourceMultiplier, armor, magicResistance) * incomingDamageMultiplier));
    const damage = absorption.damage;
    burnDamage = damage;
    nextHp = Math.max(0, nextHp - damage);
    nextStatuses = wakeFromDamage(absorption.statuses, damage);
    const text = targetId === "player" ? `You take ${damage} damage from Burn${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Burn${absorptionSuffix(absorption.absorbed)}.`;
    logs.push(makeLog(text, statusInfo(burn)));
    const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage, { sourceLabel: burn.name });
    burnEventIndex = damageEventIndex;
    queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  }

  const regenerate = nextStatuses.find((status) => status.id === "regenerate");
  if (regenerate && nextHp > 0 && nextHp < maxHp) {
    healing = Math.min(maxHp - nextHp, Math.max(1, Math.round(getStatusHealing(regenerate) * healingReceivedMultiplier)));
    nextHp += healing;
    const text = targetId === "player" ? `You recover ${healing} Health from Regenerate.` : `${targetName} recovers ${healing} Health from Regenerate.`;
    logs.push(makeLog(text, statusInfo(regenerate)));
    healingEventIndex = queueHeal(events, pendingEffects, text, targetId, healing);
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
      return { hp: nextHp, statuses: nextStatuses, skipTurn: true, burnDamage, burnEventIndex, healing, healingEventIndex };
    }
  }

  const stunned = nextStatuses.find((status) => status.id === "stunned");
  if (stunned) {
    const logText = targetId === "player" ? "You are Stunned and cannot act." : `${targetName} is Stunned and cannot act.`;
    const eventText = targetId === "player" ? "You are Stunned and skip the turn." : `${targetName} is Stunned and skips the turn.`;
    logs.push(makeLog(logText, statusInfo(stunned)));
    events.push(eventText);
    return { hp: nextHp, statuses: nextStatuses, skipTurn: true, burnDamage, burnEventIndex, healing, healingEventIndex };
  }

  const frozen = nextStatuses.find((status) => status.id === "frozen");
  if (frozen) {
    const logText = targetId === "player" ? "You are Frozen and cannot act." : `${targetName} is Frozen and cannot act.`;
    const eventText = targetId === "player" ? "You are Frozen and skip the turn." : `${targetName} is Frozen and skips the turn.`;
    logs.push(makeLog(logText, statusInfo(frozen)));
    events.push(eventText);
    return { hp: nextHp, statuses: nextStatuses, skipTurn: true, burnDamage, burnEventIndex, healing, healingEventIndex };
  }

  const electrified = nextStatuses.find((status) => status.id === "electrified");
  if (electrified && canApplyStatusEffect(nextStatuses, "stunned") && Math.random() < 0.1) {
    nextStatuses = addOrRefreshStatus(nextStatuses, createStatusEffect("stunned", { sourceId: electrified.sourceId }));
    const logText = targetId === "player" ? "You are Stunned by Electrified." : `${targetName} is Stunned by Electrified.`;
    const eventText = targetId === "player" ? "You are Stunned by Electrified and skip the turn." : `${targetName} is Stunned by Electrified and skips the turn.`;
    logs.push(makeLog(logText, statusInfo(electrified)));
    events.push(eventText);
    return { hp: nextHp, statuses: nextStatuses, skipTurn: true, burnDamage, burnEventIndex, healing, healingEventIndex };
  }
  return { hp: nextHp, statuses: nextStatuses, skipTurn: false, burnDamage, burnEventIndex, healing, healingEventIndex };
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
  armor = 0,
  magicResistance = 0,
): { hp: number; statuses: StatusEffect[]; poisonDamage: number } {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  let poisonDamage = 0;
  const poison = nextStatuses.find((status) => status.id === "poison");
  if (poison) {
    const sourceMultiplier = poison.sourceId === "player" ? playerPoisonDamageMultiplier : 1;
    const absorption = absorbIncomingDamage(nextStatuses, Math.round(getAfflictionDamage(poison, nextStatuses, sourceMultiplier, armor, magicResistance) * incomingDamageMultiplier));
    const damage = absorption.damage;
    poisonDamage = damage;
    nextHp = Math.max(0, nextHp - damage);
    nextStatuses = wakeFromDamage(absorption.statuses, damage);
    const text = targetId === "player" ? `You take ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.`;
    logs.push(makeLog(text, statusInfo(poison)));
    const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage, { sourceLabel: poison.name });
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
  armor = 0,
): { hp: number; statuses: StatusEffect[] } {
  const bleed = statuses.find((status) => status.id === "bleed");
  if (!bleed) return { hp, statuses };
  const absorption = absorbIncomingDamage(statuses, getAfflictionDamage(bleed, statuses, extraMultiplier, armor));
  const damage = absorption.damage;
  const text = targetId === "player" ? `You take ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.`;
  logs.push(makeLog(text, statusInfo(bleed)));
  const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage, { sourceLabel: bleed.name });
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
): { hp: number; statuses: StatusEffect[]; used: boolean; healing: number; healingEventIndex: number | null } {
  if (hp > 0 || alreadyUsed) return { hp, statuses, used: alreadyUsed, healing: 0, healingEventIndex: null };
  const consumedStatus = derived.deathPreventionConsumeStatusForHealing
    ? statuses.find((status) => status.id === derived.deathPreventionConsumeStatusForHealing)
    : undefined;
  if (consumedStatus) {
    const statusMultiplier = derived.statusDamageMultipliers[consumedStatus.id] ?? 1;
    const healing = Math.min(maxHp, Math.max(1, getAfflictionDamage(consumedStatus, statuses, statusMultiplier, derived.armor, derived.magicResistance) * Math.max(1, consumedStatus.duration)));
    const nextStatuses = statuses.filter((status) => status.id !== consumedStatus.id);
    const text = `Phoenix Heart consumes ${consumedStatus.name} and restores ${healing} Health.`;
    logs.push(makeLog(text, { title: "Phoenix Heart", description: "The first lethal hit each combat while Burning consumes Burn and restores Health equal to its remaining damage.", category: "ability" }));
    const eventIndex = events.length;
    events.push(text);
    queueStatusRemoval(pendingEffects, eventIndex, "player", consumedStatus.id);
    queueHealAtEvent(pendingEffects, eventIndex, "player", healing);
    queueAbilityVfx(pendingEffects, eventIndex, "phoenix_heart", "player", "player");
    return { hp: healing, statuses: nextStatuses, used: true, healing, healingEventIndex: eventIndex };
  }
  if (derived.deathPreventionHealRatio <= 0) return { hp, statuses, used: alreadyUsed, healing: 0, healingEventIndex: null };
  const healing = Math.max(1, Math.round(maxHp * derived.deathPreventionHealRatio));
  const stealth = createPlayerAppliedStatus("stealth", derived, {
    duration: Math.max(1, derived.deathPreventionStealthDuration),
    expiresAtTurnStart: false,
  });
  const text = `Panic saves you, restoring ${healing} Health and granting Stealth.`;
  logs.push(makeLog(text, { title: "Panic", description: "The first lethal hit each combat restores 20% of your maximum Health and grants Stealth for 2 turns.", category: "ability" }));
  const eventIndex = queueHeal(events, pendingEffects, text, "player", healing);
  queueStatus(events, pendingEffects, text, "player", stealth, false, eventIndex);
  return { hp: healing, statuses: addOrRefreshStatus(statuses, stealth), used: true, healing, healingEventIndex: eventIndex };
}

function moveToNextActor(combat: CombatState, character: CharacterState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): CombatState {
  const completedActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  const actedActorIds = new Set(combat.actedActorIds ?? []);
  if (completedActorId) actedActorIds.add(completedActorId);
  combat = { ...combat, actedActorIds: [...actedActorIds] };
  combat = reorderCombat(combat);
  const derived = getDerivedStats(character);
  const saved = applyPlayerDeathPrevention(combat.playerHp, combat.playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
  const savedTriggers = runDeathPreventionHealingTriggers(
    saved,
    character,
    combat,
    derived,
    { enemies: combat.enemies, playerStatuses: saved.statuses, playerHp: saved.hp, energy: combat.energy, abilityCooldowns: combat.abilityCooldowns },
    combat.procUsage,
    logs,
    events,
    pendingEffects,
  );
  combat = {
    ...combat,
    enemies: savedTriggers.state.enemies,
    playerHp: savedTriggers.state.playerHp,
    playerStatuses: savedTriggers.state.playerStatuses,
    energy: savedTriggers.state.energy,
    abilityCooldowns: savedTriggers.state.abilityCooldowns ?? combat.abilityCooldowns,
    procUsage: savedTriggers.procUsage,
    deathPreventionUsed: saved.used,
  };
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
    const refreshedCooldowns = Object.fromEntries(
      Object.entries(next.abilityCooldowns ?? {})
        .map(([abilityId, turns]) => [abilityId, Math.max(0, turns - 1)] as const)
        .filter(([, turns]) => turns > 0),
    );
    const playerTurnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", nextIndex, nextTurn, false, next.playerStatuses, next.energy, 0, refreshedCooldowns, nextActor.actorId);
    const playerStart = processTurnStart(next.playerHp, next.playerMaxHp, next.playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier, getEnergyDefenseMultiplier(derived, next.energy, next.playerStatuses), derived.armor, derived.magicResistance, derived.statusDamageMultipliers.burn ?? 1);
    const burnTriggers = playerStart.burnDamage > 0 && playerStart.burnEventIndex !== null
      ? runPlayerTriggerEvent(
        "damage_taken",
        { damage: playerStart.burnDamage, damageType: "fire", sourceStatusId: "burn", targetStatusIds: playerStart.statuses.map((status) => status.id) },
        "player",
        character,
        next,
        derived,
        { enemies: next.enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy: next.energy },
        next.procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.burnEventIndex,
      )
      : { state: { enemies: next.enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy: next.energy }, procUsage: next.procUsage };
    const healingTriggers = playerStart.healing > 0 && playerStart.healingEventIndex !== null
      ? runPlayerTriggerEvent(
        "health_restored",
        { damage: playerStart.healing, healthRestored: playerStart.healing, selfStatusIds: burnTriggers.state.playerStatuses.map((status) => status.id) },
        "player",
        character,
        next,
        derived,
        burnTriggers.state,
        burnTriggers.procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.healingEventIndex,
      )
      : burnTriggers;
    const startSaved = applyPlayerDeathPrevention(healingTriggers.state.playerHp, healingTriggers.state.playerStatuses, next.deathPreventionUsed, next.playerMaxHp, derived, logs, events, pendingEffects);
    const startSavedTriggers = runDeathPreventionHealingTriggers(
      startSaved,
      character,
      next,
      derived,
      { ...healingTriggers.state, playerHp: startSaved.hp, playerStatuses: startSaved.statuses },
      healingTriggers.procUsage,
      logs,
      events,
      pendingEffects,
    );
    const regeneratedEnergy = Math.min(next.maxEnergy, startSavedTriggers.state.energy + getEnergyRegeneration(derived.energyRegen + next.nextTurnEnergyRegenBonus, startSavedTriggers.state.playerStatuses));
    next = {
      ...next,
      enemies: startSavedTriggers.state.enemies,
      playerHp: startSavedTriggers.state.playerHp,
      playerStatuses: startSavedTriggers.state.playerStatuses,
      energy: startSavedTriggers.state.energy,
      procUsage: startSavedTriggers.procUsage,
      playerHasTakenDamage: next.playerHasTakenDamage || playerStart.burnDamage > 0,
      deathPreventionUsed: startSaved.used,
      nextTurnEnergyRegenBonus: 0,
      playerActed: false,
      abilityCooldowns: startSavedTriggers.state.abilityCooldowns ?? next.abilityCooldowns,
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
      const decrementedStatuses = decrementStatusDurations(next.playerStatuses);
      if (events.length > 0) queueStatusReconciliation(pendingEffects, events.length - 1, "player", next.playerStatuses, decrementedStatuses);
      const skipped = moveToNextActor({ ...next, activeTurnIndex: nextIndex, turn: nextTurn, playerStatuses: decrementedStatuses }, character, logs, events, pendingEffects);
      return { ...skipped, activeTurnIndex: combat.activeTurnIndex, turn: combat.turn };
    }
  } else if (events.length > 0) {
    // Enemy turns do not need their own floating message. Reveal the next actor
    // when the preceding action's final event resolves instead.
    queueTurnAtEvent(pendingEffects, events.length - 1, nextIndex, nextTurn, undefined, next.playerStatuses, undefined, undefined, undefined, nextActor.actorId);
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
  abilityCooldowns?: Record<string, number>;
}

function applyPlayerProcs(
  procs: ResolvedCombatTrigger[],
  context: CombatTriggerContext,
  primaryTargetId: string,
  derived: ReturnType<typeof getDerivedStats>,
  combat: CombatState,
  state: ProcApplicationState,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  eventIndexOverride?: number,
): ProcApplicationState {
  let { enemies, playerStatuses, playerHp, energy, abilityCooldowns } = state;
  if (procs.length === 0) return state;
  const passiveEventIndex = eventIndexOverride ?? events.length - 1;
  const passiveLabels = new Map<string, Set<string>>();
  const markPassive = (targetId: string, name: string) => {
    const labels = passiveLabels.get(targetId) ?? new Set<string>();
    labels.add(name);
    passiveLabels.set(targetId, labels);
  };

  procs.forEach((proc) => {
    const procInfo: InspectableInfo = { title: proc.name, description: proc.description, category: "ability" };
    logs.push(makeLog(`${proc.name} triggers.`, procInfo));

    proc.effects.forEach((effect) => {
      const targetMode = effect.target ?? (effect.type === "heal" || effect.type === "heal_percent_max_hp" || effect.type === "gain_energy" || effect.type === "gain_next_turn_energy_regen" || effect.type === "gain_guard" || effect.type === "gain_absorption" || effect.type === "reduce_random_cooldown" || effect.type === "build_status_charge" ? "self" : "target");
      const livingEnemies = enemies.filter((enemy) => enemy.hp > 0);
      const enemyTargets = targetMode === "all_enemies"
        ? livingEnemies
        : targetMode === "random_enemy"
          ? livingEnemies.filter((enemy) => enemy.instanceId !== primaryTargetId).length > 0
            ? [livingEnemies.filter((enemy) => enemy.instanceId !== primaryTargetId)[Math.floor(Math.random() * livingEnemies.filter((enemy) => enemy.instanceId !== primaryTargetId).length)]]
            : []
          : targetMode === "target"
            ? livingEnemies.filter((enemy) => enemy.instanceId === primaryTargetId)
            : [];

      if (effect.type === "damage") {
        const attributeScaling = effect.scalingStat ? derived[effect.scalingStat] * (effect.scaling ?? 1) : 0;
        const powerScaling = effect.scalingPower === "magical" ? derived.magicalPower * (effect.scaling ?? 1)
          : effect.scalingPower === "physical" ? derived.physicalPower * (effect.scaling ?? 1)
            : 0;
        const triggerSource = effect.triggerAbsorbedStatus
          ? context.absorbedDamageByStatus?.[effect.triggerAbsorbedStatus] ?? 0
          : context.absorbedDamage ?? context.damage ?? 0;
        const triggerScaling = triggerSource * (effect.triggerDamageRatio ?? 0);
        const baseDamage = Math.max(0, Math.round(effect.amount + attributeScaling + powerScaling + triggerScaling));
        if (targetMode === "self") {
          const incoming = baseDamage <= 0 ? 0 : Math.max(1, Math.round(baseDamage * getIncomingDamageMultiplier(playerStatuses, effect.damageType) * getEnergyDefenseMultiplier(derived, energy, playerStatuses)));
          const absorption = absorbIncomingDamage(playerStatuses, incoming);
          const damage = absorption.damage;
          playerHp = Math.max(0, playerHp - damage);
          playerStatuses = wakeFromDamage(absorption.statuses, damage);
          logs.push(makeLog(`${proc.name} deals ${damage} damage to you${absorptionSuffix(absorption.absorbed)}.`, procInfo));
          markPassive("player", proc.name);
          queueDamageAtEvent(pendingEffects, passiveEventIndex, "player", damage);
          queueAbsorptionChanges(pendingEffects, passiveEventIndex, "player", absorption);
        } else {
          enemyTargets.forEach((target) => {
            const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId) ?? target;
            const absorption = absorbIncomingDamage(currentTarget.statuses, getModifiedDamage(baseDamage, playerStatuses, currentTarget.statuses, effect.damageType));
            const damage = absorption.damage;
            enemies = enemies.map((enemy) => enemy.instanceId === currentTarget.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) } : enemy);
            logs.push(makeLog(`${proc.name} deals ${damage} damage to ${currentTarget.name}${absorptionSuffix(absorption.absorbed)}.`, procInfo));
            markPassive(currentTarget.instanceId, proc.name);
            queueDamageAtEvent(pendingEffects, passiveEventIndex, currentTarget.instanceId, damage);
            queueAbsorptionChanges(pendingEffects, passiveEventIndex, currentTarget.instanceId, absorption);
            if (hasStatus(playerStatuses, "reckless") && damage > 0) {
              const recoil = Math.max(1, Math.round(damage * 0.5 * getEnergyDefenseMultiplier(derived, energy, playerStatuses)));
              const recoilAbsorption = absorbIncomingDamage(playerStatuses, recoil);
              playerHp = Math.max(0, playerHp - recoilAbsorption.damage);
              playerStatuses = wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage);
              logs.push(makeLog(`Reckless deals ${recoilAbsorption.damage} damage to you${absorptionSuffix(recoilAbsorption.absorbed)}.`, statusInfo(playerStatuses.find((status) => status.id === "reckless") ?? createStatusEffect("reckless"))));
              markPassive("player", "Reckless");
              queueDamageAtEvent(pendingEffects, passiveEventIndex, "player", recoilAbsorption.damage);
              queueAbsorptionChanges(pendingEffects, passiveEventIndex, "player", recoilAbsorption);
            }
          });
        }
      }

      if (effect.type === "damage_percent_current_hp") {
        enemyTargets.forEach((target) => {
          const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId) ?? target;
          const baseDamage = Math.max(1, Math.round(currentTarget.hp * Math.max(0, effect.ratio)));
          const absorption = absorbIncomingDamage(currentTarget.statuses, getModifiedDamage(baseDamage, playerStatuses, currentTarget.statuses, effect.damageType));
          const damage = absorption.damage;
          enemies = enemies.map((enemy) => enemy.instanceId === currentTarget.instanceId ? {
            ...enemy,
            hp: Math.max(0, enemy.hp - damage),
            statuses: wakeFromDamage(absorption.statuses, damage),
          } : enemy);
          logs.push(makeLog(`${proc.name} deals ${damage} damage to ${currentTarget.name}${absorptionSuffix(absorption.absorbed)}.`, procInfo));
          markPassive(currentTarget.instanceId, proc.name);
          queueDamageAtEvent(pendingEffects, passiveEventIndex, currentTarget.instanceId, damage);
          queueAbsorptionChanges(pendingEffects, passiveEventIndex, currentTarget.instanceId, absorption);
        });
      }

      if (effect.type === "apply_status") {
        const sourcePower = effect.status.id === "bleed" ? derived.physicalPower
          : effect.status.id === "poison" || effect.status.id === "burn" || effect.status.id === "regenerate" ? derived.magicalPower
            : effect.status.sourcePower;
        const bonusStacks = targetMode === "self" ? 0 : derived.statusApplicationStacks[effect.status.id] ?? 0;
        const status = { ...effect.status, duration: effect.status.duration + (derived.statusDurationBonuses[effect.status.id] ?? 0), stacks: effect.status.stacks + bonusStacks, sourcePower, sourceId: effect.status.sourceId ?? ("player" as const) };
        const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived)];
        if (targetMode === "self") {
          if (derived.statusImmunities.includes(status.id)) return;
          appliedStatuses.filter((applied) => !derived.statusImmunities.includes(applied.id) && canApplyStatusEffect(playerStatuses, applied.id)).forEach((applied) => {
            playerStatuses = addOrRefreshStatus(playerStatuses, applied);
            logs.push(makeLog(`You gain ${applied.name}.`, statusInfo(applied)));
            markPassive("player", proc.name);
            queueStatus(events, pendingEffects, `You gain ${applied.name}.`, "player", applied, false, passiveEventIndex);
          });
        } else {
          enemyTargets.forEach((target) => {
            appliedStatuses.filter((applied) => canApplyStatusEffect(enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses ?? target.statuses, applied.id)).forEach((applied) => {
              enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, applied) } : enemy);
              logs.push(makeLog(`${target.name} gains ${applied.name}.`, statusInfo(applied)));
              markPassive(target.instanceId, proc.name);
              queueStatus(events, pendingEffects, `${target.name} gains ${applied.name}.`, target.instanceId, applied, applied.id === "stunned", passiveEventIndex);
            });
          });
        }
      }

      if (effect.type === "heal") {
        const amount = Math.max(0, Math.round(effect.amount * derived.healingReceivedMultiplier));
        playerHp = Math.min(combat.playerMaxHp, playerHp + amount);
        logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
        markPassive("player", proc.name);
        queueHealAtEvent(pendingEffects, passiveEventIndex, "player", amount);
      }

      if (effect.type === "heal_percent_max_hp") {
        const amount = Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(combat.playerMaxHp * effect.ratio * derived.healingReceivedMultiplier)));
        playerHp += amount;
        logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
        markPassive("player", proc.name);
        queueHealAtEvent(pendingEffects, passiveEventIndex, "player", amount);
      }

      if (effect.type === "gain_energy") {
        energy = Math.min(combat.maxEnergy, energy + effect.amount);
        logs.push(makeLog(`${proc.name} restores ${effect.amount} Energy.`, procInfo));
        markPassive("player", proc.name);
      }

      if (effect.type === "gain_next_turn_energy_regen") {
        const amount = Math.max(0, Math.round(effect.amount));
        if (amount > 0) {
          logs.push(makeLog(`${proc.name} grants +${amount} Energy regeneration next turn.`, procInfo));
          markPassive("player", proc.name);
          queueNextTurnEnergyRegeneration(pendingEffects, passiveEventIndex, amount);
        }
      }

      if (effect.type === "reduce_random_cooldown" && abilityCooldowns) {
        const cooling = Object.keys(abilityCooldowns).filter((abilityId) => (abilityCooldowns?.[abilityId] ?? 0) > 0);
        const chosen = cooling[Math.floor(Math.random() * cooling.length)];
        if (chosen) {
          const remaining = Math.max(0, abilityCooldowns[chosen] - effect.amount);
          abilityCooldowns = { ...abilityCooldowns, ...(remaining > 0 ? { [chosen]: remaining } : {}) };
          if (remaining === 0) delete abilityCooldowns[chosen];
          markPassive("player", proc.name);
        }
      }

      if (effect.type === "build_status_charge") {
        const existing = playerStatuses.find((status) => status.id === effect.status)?.stacks ?? 0;
        const next = existing + effect.amount;
        if (next >= effect.threshold) {
          playerStatuses = playerStatuses.filter((status) => status.id !== effect.status);
          energy = Math.min(combat.maxEnergy, energy + effect.thresholdEnergy);
          queueStatusRemoval(pendingEffects, passiveEventIndex, "player", effect.status);
        } else {
          const charge = createStatusEffect(effect.status, { stacks: effect.amount, sourceId: "player" });
          playerStatuses = addOrRefreshStatus(playerStatuses, charge);
          queueStatus(events, pendingEffects, `You gain ${charge.name}.`, "player", charge, false, passiveEventIndex);
        }
        markPassive("player", proc.name);
      }

      if (effect.type === "gain_guard") {
        const amount = Math.max(1, Math.round(effect.amount * derived.guardMultiplier));
        const guard = createStatusEffect("guard", { duration: effect.duration ?? 1, stacks: amount, description: `Absorbs ${amount} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, guard);
        logs.push(makeLog(`You gain ${amount} Guard.`, statusInfo(guard)));
        markPassive("player", proc.name);
        queueStatus(events, pendingEffects, `You gain ${amount} Guard.`, "player", guard, false, passiveEventIndex);
      }

      if (effect.type === "gain_absorption") {
        const power = effect.scalingPower === "magical" ? derived.magicalPower : effect.scalingPower === "physical" ? derived.physicalPower : 0;
        const amount = Math.max(1, Math.round((effect.amount ?? 0) + power * (effect.scaling ?? 0)));
        const absorption = createStatusEffect(effect.status, { duration: effect.duration, stacks: amount, description: `Absorbs ${amount} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, absorption);
        markPassive("player", proc.name);
        queueStatus(events, pendingEffects, `You gain ${amount} ${absorption.name}.`, "player", absorption, false, passiveEventIndex);
      }
    });
  });
  passiveLabels.forEach((labels, targetId) => {
    queuePassiveAnimation(pendingEffects, passiveEventIndex, targetId, [...labels].join(" · "));
  });
  return { enemies, playerStatuses, playerHp, energy, abilityCooldowns };
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
  eventIndexOverride?: number,
): { state: ProcApplicationState; procUsage: CombatState["procUsage"] } {
  return runPlayerTriggerEvents([event], context, primaryTargetId, character, combat, derived, state, procUsage, logs, events, pendingEffects, eventIndexOverride);
}

function applySmiteRetribution(
  state: ProcApplicationState,
  restoredHealth: number,
  eventIndex: number,
  logs: CombatLogEntry[],
  pendingEffects: CombatPendingEffect[],
): ProcApplicationState {
  if (restoredHealth <= 0) return state;
  let enemies = state.enemies;
  enemies.filter((enemy) => enemy.hp > 0 && hasStatus(enemy.statuses, "smite")).forEach((target) => {
    const rawDamage = Math.max(1, Math.round(restoredHealth * 0.5));
    const defense = getDefense(target.armor, target.magicResistance, target.statuses, "arcane");
    const incoming = getModifiedDamage(Math.max(1, rawDamage - defense), state.playerStatuses, target.statuses, "arcane");
    const absorption = absorbIncomingDamage(target.statuses, incoming);
    const damage = absorption.damage;
    enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? {
      ...enemy,
      hp: Math.max(0, enemy.hp - damage),
      statuses: wakeFromDamage(absorption.statuses, damage),
    } : enemy);
    logs.push(makeLog(`Smite deals ${damage} Magic Damage to ${target.name}${absorptionSuffix(absorption.absorbed)}.`, statusInfo(target.statuses.find((status) => status.id === "smite") ?? createStatusEffect("smite"))));
    queueDamageAtEvent(pendingEffects, eventIndex, target.instanceId, damage, "Smite");
    queueAbsorptionChanges(pendingEffects, eventIndex, target.instanceId, absorption);
    queueAbilityVfx(pendingEffects, eventIndex, "smite_retribution", target.instanceId, "player");
  });
  return { ...state, enemies };
}

function runPlayerTriggerEvents(
  triggerEvents: readonly CombatTriggerEvent[],
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
  eventIndexOverride?: number,
): { state: ProcApplicationState; procUsage: CombatState["procUsage"] } {
  let nextUsage = procUsage;
  const eventIndex = eventIndexOverride ?? Math.max(0, events.length - 1);
  const restoredHealth = triggerEvents.includes("health_restored") ? Math.max(0, context.healthRestored ?? context.damage ?? 0) : 0;
  let triggerState = applySmiteRetribution(state, restoredHealth, eventIndex, logs, pendingEffects);
  const triggered: ResolvedCombatTrigger[] = [];
  triggerEvents.forEach((event) => {
    const resolved = resolveCharacterTriggers(character, combat, event, context, nextUsage, derived.chanceEffectBonus);
    triggered.push(...resolved.triggered);
    nextUsage = resolved.procUsage;
  });
  let nextState = applyPlayerProcs(triggered, context, primaryTargetId, derived, combat, triggerState, logs, events, pendingEffects, eventIndexOverride);
  const followUpEvents: CombatTriggerEvent[] = [];
  if (!triggerEvents.includes("health_restored") && nextState.playerHp > triggerState.playerHp) followUpEvents.push("health_restored");
  const guardBefore = state.playerStatuses.find((status) => status.id === "guard")?.stacks ?? 0;
  const guardAfter = nextState.playerStatuses.find((status) => status.id === "guard")?.stacks ?? 0;
  if (!triggerEvents.includes("guard_gained") && guardAfter > guardBefore) followUpEvents.push("guard_gained");
  if (followUpEvents.length > 0) {
    const followUpHealing = nextState.playerHp - triggerState.playerHp;
    if (followUpEvents.includes("health_restored")) {
      nextState = applySmiteRetribution(nextState, followUpHealing, eventIndex, logs, pendingEffects);
    }
    const followUpTriggers: ResolvedCombatTrigger[] = [];
    followUpEvents.forEach((event) => {
      const resolved = resolveCharacterTriggers(character, combat, event, {
        ...context,
        damage: event === "health_restored" ? followUpHealing : guardAfter - guardBefore,
        healthRestored: event === "health_restored" ? followUpHealing : context.healthRestored,
        selfStatusIds: nextState.playerStatuses.map((status) => status.id),
      }, nextUsage, derived.chanceEffectBonus);
      followUpTriggers.push(...resolved.triggered);
      nextUsage = resolved.procUsage;
    });
    nextState = applyPlayerProcs(followUpTriggers, context, primaryTargetId, derived, combat, nextState, logs, events, pendingEffects, eventIndexOverride);
  }
  return { state: nextState, procUsage: nextUsage };
}

function runDeathPreventionHealingTriggers(
  saved: ReturnType<typeof applyPlayerDeathPrevention>,
  character: CharacterState,
  combat: CombatState,
  derived: ReturnType<typeof getDerivedStats>,
  state: ProcApplicationState,
  procUsage: CombatState["procUsage"],
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
): { state: ProcApplicationState; procUsage: CombatState["procUsage"] } {
  if (saved.healing <= 0 || saved.healingEventIndex === null) return { state, procUsage };
  return runPlayerTriggerEvent(
    "health_restored",
    { damage: saved.healing, healthRestored: saved.healing, selfStatusIds: state.playerStatuses.map((status) => status.id) },
    "player",
    character,
    combat,
    derived,
    state,
    procUsage,
    logs,
    events,
    pendingEffects,
    saved.healingEventIndex,
  );
}

export function useAbility(combat: CombatState, character: CharacterState, abilityId: string): CombatState {
  combat = ensureCombatState(combat, character);
  const ability = ABILITIES[abilityId];
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  const remainingCooldown = combat.abilityCooldowns?.[abilityId] ?? 0;
  if (!ability || combat.outcome !== "active" || activeActor?.kind !== "player" || remainingCooldown > 0) return combat;
  const abilityIsFree = hasStatus(combat.playerStatuses, "distraction");
  const selectedTargetStatuses = combat.enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId)?.statuses ?? [];
  const targetMakesAbilityFree = Boolean(ability.freeAgainstTargetStatus && hasStatus(selectedTargetStatuses, ability.freeAgainstTargetStatus));
  const modifiedEnergyCost = getCharacterAbilityEnergyCostForTarget(character, ability, selectedTargetStatuses.map((status) => status.id));
  const effectiveEnergyCost = abilityIsFree ? 0 : modifiedEnergyCost;
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
  let playerHasMissed = combat.playerHasMissed ?? false;
  const forceCritical = ability.dealsDamage !== false && ability.target !== "self" && hasStatus(playerStatuses, "pinpoint");
  const selfRequirementMissing = Boolean(ability.requiredSelfStatus && !hasStatus(playerStatuses, ability.requiredSelfStatus));
  if (selfRequirementMissing && !abilityModifiers.some((modifier) => modifier.allowWithoutRequiredSelfStatus)) return combat;
  const effectivePowerScaling = selfRequirementMissing
    ? abilityModifiers.find((modifier) => modifier.powerScalingWhenRequirementMissing !== undefined)?.powerScalingWhenRequirementMissing ?? ability.powerScaling
    : ability.powerScaling;
  const effectiveStatusDuration = abilityModifiers.find((modifier) => modifier.statusDuration !== undefined)?.statusDuration ?? ability.statusDuration;
  const effectiveStatusMagnitude = abilityModifiers.find((modifier) => modifier.statusMagnitude !== undefined)?.statusMagnitude ?? ability.statusMagnitude;
  const effectiveStatusExpiresAtTurnStart = abilityModifiers.find((modifier) => modifier.statusExpiresAtTurnStart !== undefined)?.statusExpiresAtTurnStart ?? ability.statusExpiresAtTurnStart;
  const effectiveStatusStackPowerScaling = [...abilityModifiers].reverse().find((modifier) => modifier.statusStackPowerScaling)?.statusStackPowerScaling ?? ability.statusStackPowerScaling;
  const effectiveStatusStacks = effectiveStatusStackPowerScaling
    ? Math.max(1, Math.round((effectiveStatusStackPowerScaling.power === "magical" ? derived.magicalPower : derived.physicalPower) * effectiveStatusStackPowerScaling.scaling))
    : ability.statusStacks;
  const effectiveStatusApplications = [
    ...(ability.statusApplications ?? []),
    ...abilityModifiers.flatMap((modifier) => modifier.additionalStatusApplications ?? []),
  ];
  const statusApplicationReplacements = abilityModifiers.flatMap((modifier) => modifier.replaceStatusApplication ? [modifier.replaceStatusApplication] : []);
  const effectiveRandomTargetPerHit = [...abilityModifiers].reverse().find((modifier) => modifier.randomTargetPerHit !== undefined)?.randomTargetPerHit ?? ability.randomTargetPerHit;
  const targetStatusStackMultiplierBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.damagePerTargetStatusStackMultiplierDelta ?? 0), 0);
  const preHealSelfStatusId = abilityModifiers.find((modifier) => modifier.preHealSelfStatusRemainingDamage)?.preHealSelfStatusRemainingDamage;
  const abilityNextTurnEnergyRegenBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.nextTurnEnergyRegenBonus ?? 0), 0);
  const nextTurnEnergyRegenOnHit = Math.max(0, (ability.nextTurnEnergyRegenOnHit ?? 0) + abilityModifiers.reduce((total, modifier) => total + (modifier.nextTurnEnergyRegenOnHitBonus ?? 0), 0));
  const effectiveSelfHealPercentMaxHp = [...abilityModifiers].reverse().find((modifier) => modifier.selfHealPercentMaxHp !== undefined)?.selfHealPercentMaxHp ?? ability.selfHealPercentMaxHp ?? 0;
  const statusStacksPerTargetStatusDivisor = [...abilityModifiers].reverse().find((modifier) => modifier.statusStacksPerTargetStatusDivisor !== undefined)?.statusStacksPerTargetStatusDivisor
    ?? ability.statusApplicationPerTargetStatusStacks?.divisor;
  const targetStatusDamageTrigger = [...abilityModifiers].reverse().find((modifier) => modifier.triggerTargetStatusDamageWhenAppliedStacksAtLeast)?.triggerTargetStatusDamageWhenAppliedStacksAtLeast;
  const effectiveRequiredTargetStacks = [...abilityModifiers].reverse().find((modifier) => modifier.requiredTargetStatusStacksMinimum !== undefined)?.requiredTargetStatusStacksMinimum
    ?? ability.requiredTargetStatusStacks?.minimum;
  const effectiveConsumeTargetStacks = [...abilityModifiers].reverse().find((modifier) => modifier.consumeTargetStatusStacksAmount !== undefined)?.consumeTargetStatusStacksAmount
    ?? ability.consumeTargetStatusStacks;
  const retainTargetStatusOnConsume = abilityModifiers.some((modifier) => modifier.retainTargetStatusOnConsume);
  const selfGuardMagicalPowerScalingBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.selfGuardMagicalPowerScalingBonus ?? 0), 0);
  const removeAllSelfDebuffs = abilityModifiers.some((modifier) => modifier.removeAllSelfDebuffs);
  let procUsage = { ...(combat.procUsage ?? {}) };
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  let energy = combat.energy - effectiveEnergyCost;
  let nextTurnEnergyRegenBonus = combat.nextTurnEnergyRegenBonus ?? 0;
  const effectiveCooldownTurns = getCharacterAbilityCooldownTurns(character, ability);
  let abilityCooldowns = effectiveCooldownTurns
    ? { ...(combat.abilityCooldowns ?? {}), [ability.id]: effectiveCooldownTurns }
    : (combat.abilityCooldowns ?? {});
  const abilityInfo: InspectableInfo = { title: ability.name, description: `${getCharacterAbilityDescription(character, ability)} Costs ${modifiedEnergyCost} Energy.`, category: "ability" };
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
    { abilityId: ability.id, abilityBranch: ability.branch, damageType: ability.damageType },
    combat.selectedEnemyId,
    character,
    combat,
    derived,
    { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
    procUsage,
    logs,
    events,
    pendingEffects,
  );
  procUsage = beforeAbility.procUsage;
  ({ enemies, playerStatuses, playerHp, energy } = beforeAbility.state);
  abilityCooldowns = beforeAbility.state.abilityCooldowns ?? abilityCooldowns;
  const targets = ability.target === "all_enemies"
    ? enemies.filter((enemy) => enemy.hp > 0 && !isEnemyStealthed(enemy))
    : enemies.filter((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy));
  if (ability.target === "enemy" && targets.length === 0) return combat;
  if (ability.requiredTargetStatus && targets.some((target) => !hasStatus(target.statuses, ability.requiredTargetStatus!))) return combat;
  if (ability.requiredTargetStatusStacks && targets.some((target) => (
    target.statuses.find((status) => status.id === ability.requiredTargetStatusStacks!.status)?.stacks ?? 0
  ) < (effectiveRequiredTargetStacks ?? ability.requiredTargetStatusStacks!.minimum))) return combat;
  if (ability.spreadTargetStatus && !enemies.some((enemy) => (
    enemy.hp > 0
    && !isEnemyStealthed(enemy)
    && targets.every((target) => target.instanceId !== enemy.instanceId)
  ))) return combat;
  const randomSingleStatusTargetId = ability.randomSingleStatusApplication
    ? targets[Math.floor(Math.random() * targets.length)]?.instanceId
    : undefined;
  const damageScalingEnemyStatusCounts = new Map<StatusEffectId, number>();
  abilityModifiers.forEach((modifier) => {
    const status = modifier.damageMultiplierPerLivingEnemyWithStatus?.status;
    if (status && !damageScalingEnemyStatusCounts.has(status)) {
      damageScalingEnemyStatusCounts.set(status, enemies.filter((enemy) => enemy.hp > 0 && hasStatus(enemy.statuses, status)).length);
    }
  });
  if (targetMakesAbilityFree && ability.freeAgainstTargetStatus) {
    enemies = enemies.map((enemy) => enemy.instanceId === combat.selectedEnemyId
      ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== ability.freeAgainstTargetStatus) }
      : enemy);
    queueStatusRemoval(pendingEffects, abilityUseEventIndex, combat.selectedEnemyId, ability.freeAgainstTargetStatus);
  }
  let consumedEnemyStatusCount = 0;
  if (ability.consumeStatusFromAllEnemies) {
    const consumedStatusId = ability.consumeStatusFromAllEnemies;
    const affected = enemies.filter((enemy) => enemy.hp > 0 && hasStatus(enemy.statuses, consumedStatusId));
    consumedEnemyStatusCount = affected.length;
    enemies = enemies.map((enemy) => hasStatus(enemy.statuses, consumedStatusId)
      ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== consumedStatusId) }
      : enemy);
    affected.forEach((enemy) => {
      queueStatusRemoval(pendingEffects, abilityUseEventIndex, enemy.instanceId, consumedStatusId);
      if (ability.consumeStatusFromAllEnemiesVfx) {
        queueAbilityVfx(pendingEffects, abilityUseEventIndex, ability.consumeStatusFromAllEnemiesVfx, "player", enemy.instanceId);
      }
    });
    energy = Math.min(combat.maxEnergy, energy + consumedEnemyStatusCount * (ability.energyPerConsumedEnemyStatus ?? 0));
    const cooldownReduction = consumedEnemyStatusCount * (ability.cooldownReductionPerConsumedEnemyStatus ?? 0);
    if (cooldownReduction > 0) {
      abilityCooldowns = Object.fromEntries(Object.entries(abilityCooldowns)
        .map(([id, turns]) => [id, Math.max(0, turns - cooldownReduction)] as const)
        .filter(([, turns]) => turns > 0));
    }
  }
  if (preHealSelfStatusId) {
    const application = ability.selfStatusApplications?.find((candidate) => candidate.status === preHealSelfStatusId);
    if (application) {
      const preview = createPlayerAppliedStatus(application.status, derived, application);
      const statusMultiplier = derived.statusDamageMultipliers[preview.id] ?? 1;
      const potentialHealing = getAfflictionDamage(preview, playerStatuses, statusMultiplier, derived.armor, derived.magicResistance) * Math.max(1, preview.duration);
      const healing = Math.min(combat.playerMaxHp - playerHp, potentialHealing);
      if (healing > 0) {
        playerHp += healing;
        logs.push(makeLog(`${ability.name} restores ${healing} Health before the flames take hold.`, abilityInfo));
        const healingEventIndex = queueHeal(events, pendingEffects, `You recover ${healing} Health.`, "player", healing);
        const healingTriggers = runPlayerTriggerEvent(
          "health_restored",
          { abilityId: ability.id, abilityBranch: ability.branch, damage: healing, healthRestored: healing, selfStatusIds: playerStatuses.map((status) => status.id) },
          "player",
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
          procUsage,
          logs,
          events,
          pendingEffects,
          healingEventIndex,
        );
        procUsage = healingTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = healingTriggers.state);
        abilityCooldowns = healingTriggers.state.abilityCooldowns ?? abilityCooldowns;
      }
    }
  }

  const effectiveSelfStatusApplications = [
    ...(ability.selfStatusApplications ?? []),
    ...abilityModifiers.flatMap((modifier) => modifier.additionalSelfStatusApplications ?? []),
  ];
  const sharedSelfStatusEvent: { current: { eventIndex: number; text: string; statusId: StatusEffectId } | null } = { current: null };
  let simultaneousAreaEventIndex: number | undefined;

  if (ability.target === "self") {
    if (ability.selfGuard || effectiveSelfHealPercentMaxHp > 0 || removeAllSelfDebuffs) {
      const healing = effectiveSelfHealPercentMaxHp > 0
        ? Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(combat.playerMaxHp * effectiveSelfHealPercentMaxHp * derived.healingReceivedMultiplier)))
        : 0;
      const guardAmount = ability.selfGuard ? Math.max(1, Math.round((
        derived.armor * (ability.selfGuard.armorScaling ?? 0)
        + derived.physicalPower * (ability.selfGuard.physicalPowerScaling ?? 0)
        + derived.magicalPower * ((ability.selfGuard.magicalPowerScaling ?? 0) + selfGuardMagicalPowerScalingBonus)
      ) * derived.guardMultiplier)) : 0;
      const statusesBeforeCleanse = playerStatuses;
      const cleansed = removeAllSelfDebuffs ? statusesBeforeCleanse.filter((status) => status.kind === "debuff") : [];
      const resultParts = [
        ...(healing > 0 ? [`restore ${healing} Health`] : []),
        ...(guardAmount > 0 ? [`gain ${guardAmount} Guard`] : []),
        ...(cleansed.length > 0 ? ["remove every debuff"] : []),
      ];
      const resultText = resultParts.length > 0 ? `You ${resultParts.join(", ")}.` : `${ability.name} has no effect.`;
      const resultEventIndex = events.length;
      events.push(resultText);
      logs.push(makeLog(resultText, abilityInfo));
      if (healing > 0) {
        playerHp += healing;
        queueHealAtEvent(pendingEffects, resultEventIndex, "player", healing);
      }
      if (guardAmount > 0) {
        const guard = createStatusEffect("guard", { duration: ability.selfGuard?.duration ?? 1, stacks: guardAmount, sourceId: ability.id, description: `Absorbs ${guardAmount} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, guard);
        queueStatus(events, pendingEffects, resultText, "player", guard, false, resultEventIndex);
      }
      if (healing > 0 && ability.barrierFromSelfHealingRatio) {
        const barrierAmount = Math.max(1, Math.round(healing * ability.barrierFromSelfHealingRatio));
        const barrier = createStatusEffect("barrier", { stacks: barrierAmount, sourceId: ability.id, description: `Absorbs ${barrierAmount} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, barrier);
        queueStatus(events, pendingEffects, resultText, "player", barrier, false, resultEventIndex);
      }
      cleansed.forEach((status) => queueStatusRemoval(pendingEffects, resultEventIndex, "player", status.id));
      if (cleansed.length > 0) {
        playerStatuses = grantDiminishingReturnsAfterStun(statusesBeforeCleanse, playerStatuses.filter((status) => status.kind !== "debuff"));
        const diminishingReturns = cleansed.some((status) => status.id === "stunned")
          ? playerStatuses.find((status) => status.id === "diminishingReturns")
          : undefined;
        if (diminishingReturns) queueStatus(events, pendingEffects, resultText, "player", diminishingReturns, false, resultEventIndex);
      }
      if (ability.vfx) queueAbilityVfx(pendingEffects, resultEventIndex, ability.vfx, "player", "player");
      const triggerEvents: CombatTriggerEvent[] = [
        ...(healing > 0 ? ["health_restored" as const] : []),
        ...(guardAmount > 0 ? ["guard_gained" as const] : []),
      ];
      if (triggerEvents.length > 0) {
        const resultTriggers = runPlayerTriggerEvents(
          triggerEvents,
          { abilityId: ability.id, abilityBranch: ability.branch, damage: healing || guardAmount, healthRestored: healing, selfStatusIds: playerStatuses.map((status) => status.id) },
          "player", character, combat, derived,
          { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, resultEventIndex,
        );
        procUsage = resultTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = resultTriggers.state);
        abilityCooldowns = resultTriggers.state.abilityCooldowns ?? abilityCooldowns;
      }
    } else if (ability.effect === "reset_cooldowns") {
      abilityCooldowns = effectiveCooldownTurns ? { [ability.id]: effectiveCooldownTurns } : {};
      logs.push(makeLog("Your ability cooldowns are reset.", abilityInfo));
      const resetEventIndex = events.length;
      events.push("Your ability cooldowns are reset.");
      if (ability.vfx) queueAbilityVfx(pendingEffects, resetEventIndex, ability.vfx, "player", "player");
    } else if (ability.effect === "guard") {
      const guardAmount = Math.max(1, Math.round(6 * derived.guardMultiplier));
      playerStatuses = addOrRefreshStatus(playerStatuses, createStatusEffect("guard", { stacks: guardAmount, description: `Absorbs ${guardAmount} incoming damage.` }));
      const guardStatus = playerStatuses.find((status) => status.id === "guard")!;
      logs.push(makeLog(`You gain ${guardAmount} Guard.`, statusInfo(guardStatus)));
      const guardEventIndex = events.length;
      queueStatus(events, pendingEffects, `You gain ${guardAmount} Guard.`, "player", guardStatus);
      if (ability.vfx) queueAbilityVfx(pendingEffects, guardEventIndex, ability.vfx, "player", "player");
      const guardTriggers = runPlayerTriggerEvent(
        "guard_gained",
        { damage: guardAmount, selfStatusIds: playerStatuses.map((status) => status.id) },
        "player",
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        guardEventIndex,
      );
      procUsage = guardTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = guardTriggers.state);
      abilityCooldowns = guardTriggers.state.abilityCooldowns ?? abilityCooldowns;
    } else if (ability.energyRestorePercentOfMax) {
      const restored = Math.min(combat.maxEnergy - energy, Math.max(1, Math.round(combat.maxEnergy * ability.energyRestorePercentOfMax)));
      energy += restored;
      const energyText = `You gain ${restored} Energy.`;
      logs.push(makeLog(energyText, abilityInfo));
      events[abilityUseEventIndex] = energyText;
      if (ability.vfx) queueAbilityVfx(pendingEffects, abilityUseEventIndex, ability.vfx, "player", "player");
    } else if (ability.effect && isStatusEffectId(ability.effect) && !derived.statusImmunities.includes(ability.effect) && canApplyStatusEffect(playerStatuses, ability.effect)) {
      const status = createPlayerAppliedStatus(ability.effect, derived, { duration: effectiveStatusDuration, stacks: effectiveStatusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
      playerStatuses = addOrRefreshStatus(playerStatuses, status);
      logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
      const statusEventIndex = events.length;
      queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status);
      if (ability.vfx) queueAbilityVfx(pendingEffects, statusEventIndex, ability.vfx, "player", "player");
    }
  } else {
    targets.forEach((initialTarget) => {
      const totalHits = Math.max(1, Math.round(ability.hitsWhenSelfHasStatus && hasStatus(playerStatuses, ability.hitsWhenSelfHasStatus.status)
        ? ability.hitsWhenSelfHasStatus.hits
        : ability.hits ?? 1));
      for (let hitIndex = 0; hitIndex < totalHits; hitIndex += 1) {
      const randomTargets = effectiveRandomTargetPerHit ? enemies.filter((enemy) => isEnemyTargetable(enemies, enemy)) : [];
      const target = effectiveRandomTargetPerHit
        ? randomTargets[Math.floor(Math.random() * randomTargets.length)]
        : enemies.find((enemy) => enemy.instanceId === initialTarget.instanceId);
      if (!target || target.hp <= 0) break;
      const targetWasStunned = hasStatus(target.statuses, "stunned");
      if (ability.spreadAllTargetDebuffs) {
        const debuffs = target.statuses.filter((status) => status.kind === "debuff");
        const destinations = enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId && !isEnemyStealthed(enemy));
        const spreadEventIndex = events.length;
        const names = debuffs.map((status) => status.name).join(", ");
        events.push(destinations.length > 0 && debuffs.length > 0 ? `${ability.name} spreads every debuff.` : `${ability.name} finds nothing to spread.`);
        let spreadCount = 0;
        destinations.forEach((destination) => {
          debuffs.forEach((status) => {
            const copiedStatus = { ...status };
            const currentDestination = enemies.find((enemy) => enemy.instanceId === destination.instanceId) ?? destination;
            if (!canApplyStatusEffect(currentDestination.statuses, copiedStatus.id)) return;
            enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId
              ? { ...enemy, stunned: enemy.stunned || copiedStatus.id === "stunned", statuses: addOrRefreshStatus(enemy.statuses, copiedStatus) }
              : enemy);
            spreadCount += 1;
            queueStatus(events, pendingEffects, `${destination.name} gains ${copiedStatus.name}.`, destination.instanceId, copiedStatus, copiedStatus.id === "stunned", spreadEventIndex, target.instanceId);
          });
        });
        logs.push(makeLog(spreadCount > 0 ? `${ability.name} spreads ${names || "no debuffs"} from ${target.name}.` : `${ability.name} finds no applicable debuffs to spread.`, abilityInfo));
        if (spreadCount > 0 && ability.vfx) queueAbilityVfx(pendingEffects, spreadEventIndex, ability.vfx, undefined, target.instanceId);
        continue;
      }
      if (ability.spreadTargetStatus) {
        const sourceStatus = target.statuses.find((status) => status.id === ability.spreadTargetStatus);
        const destinations = enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId && !isEnemyStealthed(enemy));
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        if (!sourceStatus || !destination || !canApplyStatusEffect(destination.statuses, sourceStatus.id)) continue;
        const copiedStatus = { ...sourceStatus };
        enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId
          ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, copiedStatus) }
          : enemy);
        const statusLabel = copiedStatus.stacks > 1 ? `${copiedStatus.stacks} ${copiedStatus.name}` : copiedStatus.name;
        logs.push(makeLog(`${ability.name} spreads ${statusLabel} from ${target.name} to ${destination.name}.`, abilityInfo));
        const spreadEventIndex = events.length;
        events.push(`You spread ${statusLabel} to ${destination.name}.`);
        queueStatus(events, pendingEffects, `You spread ${statusLabel} to ${destination.name}.`, destination.instanceId, copiedStatus, false, spreadEventIndex, target.instanceId);
        if (ability.vfx) queueAbilityVfx(pendingEffects, spreadEventIndex, ability.vfx, destination.instanceId, target.instanceId);
        continue;
      }
      if (ability.consumeStatusForHealing) {
        const consumedStatus = target.statuses.find((status) => status.id === ability.consumeStatusForHealing);
        if (!consumedStatus) continue;
        const statusDamageMultiplier = consumedStatus.sourceId === "player"
          ? (derived.statusDamageMultipliers[consumedStatus.id] ?? 1) * getCharacterStatusDamageMultiplier(character, consumedStatus.id, playerStatuses)
          : 1;
        const potentialHealing = getAfflictionDamage(consumedStatus, target.statuses, statusDamageMultiplier, target.armor, target.magicResistance) * DEFAULT_STATUS_DURATION;
        const healing = Math.min(combat.playerMaxHp - playerHp, potentialHealing);
        playerHp += healing;
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== consumedStatus.id) } : enemy);
        logs.push(makeLog(`${ability.name} consumes ${consumedStatus.name} from ${target.name} and restores ${healing} Health.`, abilityInfo));
        const healEventIndex = queueHeal(events, pendingEffects, `You consume ${consumedStatus.name} and recover ${healing} Health.`, "player", healing);
        queueStatusRemoval(pendingEffects, healEventIndex, target.instanceId, consumedStatus.id);
        if (ability.vfx) queueAbilityVfx(pendingEffects, healEventIndex, ability.vfx, "player", target.instanceId);
        if (healing > 0) {
          const healingTriggers = runPlayerTriggerEvent(
            "health_restored",
            { abilityId: ability.id, abilityBranch: ability.branch, damage: healing, healthRestored: healing, selfStatusIds: playerStatuses.map((status) => status.id) },
            "player", character, combat, derived,
            { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, healEventIndex,
          );
          procUsage = healingTriggers.procUsage;
          ({ enemies, playerStatuses, playerHp, energy } = healingTriggers.state);
          abilityCooldowns = healingTriggers.state.abilityCooldowns ?? abilityCooldowns;
        }
        continue;
      }
      if (ability.detonateStatus) {
        const detonatedStatus = target.statuses.find((status) => status.id === ability.detonateStatus);
        if (!detonatedStatus) continue;
        const statusDamageMultiplier = detonatedStatus.sourceId === "player"
          ? (derived.statusDamageMultipliers[detonatedStatus.id] ?? 1) * getCharacterStatusDamageMultiplier(character, detonatedStatus.id, playerStatuses)
          : 1;
        const absorption = absorbIncomingDamage(target.statuses, getAfflictionDamage(detonatedStatus, target.statuses, statusDamageMultiplier, target.armor, target.magicResistance) * Math.max(1, detonatedStatus.duration));
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
        const damageEventIndex = queueDamage(events, pendingEffects, `${detonatedStatus.name} detonates for ${damage} damage${absorptionSuffix(absorption.absorbed)}.`, target.instanceId, damage, { attackerId: "player", sourceLabel: detonatedStatus.name, ...getAbilityAttackPresentation(ability) });
        queueAbsorptionChanges(pendingEffects, damageEventIndex, target.instanceId, absorption);
        if (retainedStatus) queueStatusSet(pendingEffects, damageEventIndex, target.instanceId, retainedStatus);
        else queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, detonatedStatus.id);
        if (ability.vfx) queueAbilityVfx(pendingEffects, damageEventIndex, ability.vfx, target.instanceId, "player");
        const targetWasKilled = (enemies.find((enemy) => enemy.instanceId === target.instanceId)?.hp ?? 1) <= 0;
        if (targetWasKilled && ability.spreadDetonatedStatusOnKillRatio) {
          const spreadStacks = Math.max(1, Math.ceil(detonatedStatus.stacks * ability.spreadDetonatedStatusOnKillRatio));
          const destinations = enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId);
          destinations.forEach((destination) => {
            const spreadStatus = createPlayerAppliedStatus(detonatedStatus.id, derived, {
              stacks: spreadStacks,
              duration: detonatedStatus.duration,
              magnitude: detonatedStatus.magnitude,
              expiresAtTurnStart: detonatedStatus.expiresAtTurnStart,
            });
            enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId
              ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, spreadStatus) }
              : enemy);
            queueStatus(events, pendingEffects, `${destination.name} gains ${spreadStacks} ${spreadStatus.name}.`, destination.instanceId, spreadStatus, false, damageEventIndex, target.instanceId);
            if (ability.spreadOnKillVfx) queueAbilityVfx(pendingEffects, damageEventIndex, ability.spreadOnKillVfx, destination.instanceId, target.instanceId);
          });
          if (destinations.length > 0) logs.push(makeLog(`${ability.name} spreads ${spreadStacks} ${detonatedStatus.name} to every remaining enemy.`, abilityInfo));
        }
        const leechRatio = derived.statusDamageLeech[detonatedStatus.id] ?? 0;
        if (damage > 0 && leechRatio > 0) {
          const healing = Math.min(combat.playerMaxHp - playerHp, Math.ceil(damage * leechRatio));
          if (healing > 0) {
            playerHp += healing;
            logs.push(makeLog(`Leech restores ${healing} Health.`, { title: "Leech", description: "Restores Health from your Poison damage.", category: "ability" }));
            const healingEventIndex = queueHeal(events, pendingEffects, `Leech restores ${healing} Health.`, "player", healing);
            const healingTriggers = runPlayerTriggerEvent(
              "health_restored",
              { abilityId: ability.id, abilityBranch: ability.branch, damage: healing, healthRestored: healing, sourceStatusId: "poison", selfStatusIds: playerStatuses.map((status) => status.id) },
              "player", character, combat, derived,
              { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, healingEventIndex,
            );
            procUsage = healingTriggers.procUsage;
            ({ enemies, playerStatuses, playerHp, energy } = healingTriggers.state);
            abilityCooldowns = healingTriggers.state.abilityCooldowns ?? abilityCooldowns;
          }
        }
        continue;
      }
      if (ability.dealsDamage === false && ability.consumeTargetStatus && !ability.effect) {
        const consumed = target.statuses.find((status) => status.id === ability.consumeTargetStatus);
        if (!consumed) continue;
        const consumedStacks = Math.min(consumed.stacks, Math.max(1, effectiveConsumeTargetStacks ?? consumed.stacks));
        const remainingStacks = retainTargetStatusOnConsume ? consumed.stacks : consumed.stacks - consumedStacks;
        if (!retainTargetStatusOnConsume) enemies = enemies.map((enemy) => enemy.instanceId !== target.instanceId ? enemy : {
          ...enemy,
          statuses: enemy.statuses.flatMap((status) => status.id !== consumed.id ? [status] : remainingStacks > 0 ? [{ ...status, stacks: remainingStacks }] : []),
        });
        const eventIndex = events.length;
        events.push(retainTargetStatusOnConsume ? `${ability.name} draws on ${consumedStacks} ${consumed.name}.` : `${ability.name} consumes ${consumedStacks} ${consumed.name}.`);
        if (!retainTargetStatusOnConsume) {
          if (remainingStacks > 0) queueStatusSet(pendingEffects, eventIndex, target.instanceId, { ...consumed, stacks: remainingStacks });
          else queueStatusRemoval(pendingEffects, eventIndex, target.instanceId, consumed.id);
        }
        const gainedGuard = ability.guardPerConsumedTargetStatusStackMaxHpRatio
          ? Math.max(1, Math.round(combat.playerMaxHp * ability.guardPerConsumedTargetStatusStackMaxHpRatio * consumedStacks * derived.guardMultiplier))
          : 0;
        if (gainedGuard > 0) {
          const guard = createStatusEffect("guard", { duration: 1, stacks: gainedGuard, sourceId: ability.id, description: `Absorbs ${gainedGuard} incoming damage.` });
          playerStatuses = addOrRefreshStatus(playerStatuses, guard);
          queueStatus(events, pendingEffects, `You gain ${gainedGuard} Guard.`, "player", guard, false, eventIndex);
          logs.push(makeLog(`${ability.name} grants ${gainedGuard} Guard.`, statusInfo(guard)));
        }
        if (ability.energyPerConsumedTargetStatusStacks) {
          const restored = Math.floor(consumedStacks / Math.max(1, ability.energyPerConsumedTargetStatusStacks.stacksPerEnergy));
          energy = Math.min(combat.maxEnergy, energy + restored);
        }
        if (ability.vfx) {
          if (ability.vfxDirection === "to_player") queueAbilityVfx(pendingEffects, eventIndex, ability.vfx, "player", target.instanceId);
          else queueAbilityVfx(pendingEffects, eventIndex, ability.vfx, target.instanceId, "player");
        }
        const triggerEvents: CombatTriggerEvent[] = [
          ...(!retainTargetStatusOnConsume ? ["status_removed" as const] : []),
          ...(gainedGuard > 0 ? ["guard_gained" as const] : []),
        ];
        const removedTriggers = runPlayerTriggerEvents(
          triggerEvents,
          { removedStatusIds: retainTargetStatusOnConsume ? [] : [consumed.id], removalReason: retainTargetStatusOnConsume ? undefined : "consumed", damage: gainedGuard, targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [], selfStatusIds: playerStatuses.map((status) => status.id) },
          target.instanceId, character, combat, derived,
          { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, eventIndex,
        );
        procUsage = removedTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = removedTriggers.state);
        abilityCooldowns = removedTriggers.state.abilityCooldowns ?? abilityCooldowns;
        continue;
      }
      if (ability.dealsDamage === false && ability.consumeStatusFromAllEnemies) {
        if (ability.vfx) queueAbilityVfx(pendingEffects, abilityUseEventIndex, ability.vfx, undefined, "player");
        continue;
      }
      if (ability.dealsDamage === false) {
        const statusId = ability.effect === "stun" ? "stunned" : ability.effect;
        if (statusId && isStatusEffectId(statusId) && statusId !== "guard") {
          const groupedAreaApplication = ability.target === "all_enemies";
          if (groupedAreaApplication && target.instanceId !== targets[0]?.instanceId) continue;
          const status = createPlayerAppliedStatus(statusId, derived, { duration: effectiveStatusDuration, stacks: effectiveStatusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
          const consumedStatusId = ability.consumeTargetStatus;
          const followUp = abilityModifiers.find((modifier) => modifier.applyStatusAfterConsume)?.applyStatusAfterConsume;
          const followUpStatus = followUp ? createPlayerAppliedStatus(followUp.status, derived, { stacks: followUp.stacks, duration: followUp.duration }) : null;
          const additionalStatuses = effectiveStatusApplications
            .filter((application) => application.chance === undefined || Math.random() < Math.min(1, application.chance + derived.chanceEffectBonus))
            .map((application) => {
              const replacement = statusApplicationReplacements.find((candidate) => candidate.from === application.status);
              return createPlayerAppliedStatus(replacement?.to ?? application.status, derived, { stacks: application.stacks, duration: application.duration });
            });
          const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived), ...(followUpStatus ? [followUpStatus] : []), ...additionalStatuses.flatMap((applied) => [applied, ...createPlayerCompanionStatuses(applied.id, derived)])];
          const affectedTargets = groupedAreaApplication ? targets : [target];
          const applicableStatusesByTarget = new Map(affectedTargets.map((affectedTarget) => [
            affectedTarget.instanceId,
            appliedStatuses.filter((applied) => canApplyStatusEffect(affectedTarget.statuses, applied.id)),
          ]));
          const stunWasBlocked = affectedTargets.some((affectedTarget) => (
            appliedStatuses.some((applied) => applied.id === "stunned")
            && !applicableStatusesByTarget.get(affectedTarget.instanceId)?.some((applied) => applied.id === "stunned")
          ));
          const modifierRatio = abilityModifiers.find((modifier) => modifier.statusConsumptionRatio !== undefined)?.statusConsumptionRatio;
          const consumptionRatio = Math.max(0, Math.min(1, modifierRatio ?? 1));
          enemies = enemies.map((enemy) => affectedTargets.some((affected) => affected.instanceId === enemy.instanceId) ? {
            ...enemy,
            stunned: enemy.stunned || Boolean(applicableStatusesByTarget.get(enemy.instanceId)?.some((applied) => applied.id === "stunned")),
            statuses: (applicableStatusesByTarget.get(enemy.instanceId) ?? []).reduce(addOrRefreshStatus, consumedStatusId ? enemy.statuses.flatMap((existing) => {
              if (existing.id !== consumedStatusId) return [existing];
              const consumedStacks = Math.max(1, Math.ceil(existing.stacks * consumptionRatio));
              const remainingStacks = Math.max(0, existing.stacks - consumedStacks);
              return remainingStacks > 0 ? [{ ...existing, stacks: remainingStacks }] : [];
            }) : enemy.statuses),
          } : enemy);
          const targetApplicableStatuses = applicableStatusesByTarget.get(target.instanceId) ?? [];
          const statusNames = targetApplicableStatuses.map((applied) => `${applied.stacks > 1 ? `${applied.stacks} ` : ""}${applied.name}`).join(" and ");
          const combinesSelfAndTarget = Boolean(
            ability.combineSelfAndTargetStatusEvent
            && !groupedAreaApplication
            && effectiveSelfStatusApplications.some((application) => application.status === status.id),
          );
          const statusText = combinesSelfAndTarget
            ? `You and ${target.name} gain ${statusNames.toLocaleLowerCase()}.`
            : stunWasBlocked && groupedAreaApplication
              ? "Diminishing Returns prevents Stun on protected enemies."
              : stunWasBlocked && targetApplicableStatuses.length === 0
                ? `${target.name} is protected by Diminishing Returns.`
                : groupedAreaApplication
                  ? `All enemies gain ${appliedStatuses.map((applied) => applied.name).join(" and ")}.`
                  : `${target.name} gains ${statusNames}.`;
          const statusEventIndex = events.length;
          events.push(statusText);
          logs.push(makeLog(statusText, statusInfo(status)));
          if (combinesSelfAndTarget) sharedSelfStatusEvent.current = { eventIndex: statusEventIndex, text: statusText, statusId: status.id };
          // Consumption must resolve before a same-status follow-up such as Reapply's new Poison.
          affectedTargets.forEach((affectedTarget) => {
            if (!consumedStatusId) return;
            const consumedStatus = affectedTarget.statuses.find((existing) => existing.id === consumedStatusId);
            if (!consumedStatus) return;
            const consumedStacks = Math.max(1, Math.ceil(consumedStatus.stacks * consumptionRatio));
            const remainingStacks = Math.max(0, consumedStatus.stacks - consumedStacks);
            if (remainingStacks > 0) queueStatusSet(pendingEffects, statusEventIndex, affectedTarget.instanceId, { ...consumedStatus, stacks: remainingStacks });
            else queueStatusRemoval(pendingEffects, statusEventIndex, affectedTarget.instanceId, consumedStatusId);
          });
          affectedTargets.forEach((affectedTarget) => (applicableStatusesByTarget.get(affectedTarget.instanceId) ?? []).forEach((applied) => {
            queueStatus(events, pendingEffects, statusText, affectedTarget.instanceId, applied, applied.id === "stunned", statusEventIndex);
          }));
          if (ability.vfx) queueAbilityVfx(pendingEffects, statusEventIndex, ability.vfx, groupedAreaApplication ? undefined : target.instanceId, "player");
          affectedTargets.forEach((affectedTarget) => {
            const statusTriggers = runPlayerTriggerEvent(
              "status_applied",
              {
                abilityId: ability.id,
                abilityBranch: ability.branch,
                appliedStatusIds: (applicableStatusesByTarget.get(affectedTarget.instanceId) ?? []).map((applied) => applied.id),
                targetStatusIds: enemies.find((enemy) => enemy.instanceId === affectedTarget.instanceId)?.statuses.map((current) => current.id) ?? [],
                targetStatusIdsBefore: affectedTarget.statuses.map((current) => current.id),
                selfStatusIds: playerStatuses.map((current) => current.id),
              },
              affectedTarget.instanceId,
              character,
              combat,
              derived,
              { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
              procUsage,
              logs,
              events,
              pendingEffects,
            );
            procUsage = statusTriggers.procUsage;
            ({ enemies, playerStatuses, playerHp, energy } = statusTriggers.state);
            abilityCooldowns = statusTriggers.state.abilityCooldowns ?? abilityCooldowns;
          });
          if (appliedStatuses.some((applied) => applied.id === "stunned")) {
            affectedTargets.filter((affectedTarget) => !hasStatus(affectedTarget.statuses, "stunned") && applicableStatusesByTarget.get(affectedTarget.instanceId)?.some((applied) => applied.id === "stunned")).forEach((affectedTarget) => {
              const stunnedTriggers = runPlayerTriggerEvent(
                "enemy_stunned",
                { abilityId: ability.id, targetStatusIds: enemies.find((enemy) => enemy.instanceId === affectedTarget.instanceId)?.statuses.map((current) => current.id) ?? [] },
                affectedTarget.instanceId,
                character,
                combat,
                derived,
                { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
                procUsage,
                logs,
                events,
                pendingEffects,
              );
              procUsage = stunnedTriggers.procUsage;
              ({ enemies, playerStatuses, playerHp, energy } = stunnedTriggers.state);
              abilityCooldowns = stunnedTriggers.state.abilityCooldowns ?? abilityCooldowns;
              if ((enemies.find((enemy) => enemy.instanceId === affectedTarget.instanceId)?.hp ?? 1) <= 0) {
                const killTriggers = runPlayerTriggerEvent(
                  "on_kill",
                  { abilityId: ability.id, targetStatusIds: enemies.find((enemy) => enemy.instanceId === affectedTarget.instanceId)?.statuses.map((current) => current.id) ?? [], targetHpBeforePercent: affectedTarget.hp / affectedTarget.maxHp, targetHpAfterPercent: 0 },
                  affectedTarget.instanceId,
                  character,
                  combat,
                  derived,
                  { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
                  procUsage,
                  logs,
                  events,
                  pendingEffects,
                );
                procUsage = killTriggers.procUsage;
                ({ enemies, playerStatuses, playerHp, energy } = killTriggers.state);
                abilityCooldowns = killTriggers.state.abilityCooldowns ?? abilityCooldowns;
              }
            });
          }
        }
        continue;
      }
      const targetDodgeChance = getEffectiveDodgeChance(target.dodgeChance, getDodgeChanceBonus(target.statuses));
      const guaranteedHit = Object.entries(derived.guaranteedHitAgainstStatusStacks).some(([statusId, minimumStacks]) => (
        target.statuses.find((status) => status.id === statusId)?.stacks ?? 0
      ) >= (minimumStacks ?? Number.POSITIVE_INFINITY));
      if (!guaranteedHit && !rollHit(derived.hitChance * getHitChanceMultiplier(playerStatuses), targetDodgeChance)) {
        playerHasMissed = true;
        logs.push(makeLog(`${ability.name} misses ${target.name}.`, abilityInfo));
        const missEventIndex = queueDamage(events, pendingEffects, `It misses ${target.name}.`, target.instanceId, 0, {
          attackerId: "player",
          animationHitCount: totalHits,
          animationDurationMultiplier: ability.attackSequenceDurationMultiplier,
          missed: true,
          attachedEventIndex: ability.simultaneousAreaImpact ? simultaneousAreaEventIndex : undefined,
          ...getAbilityAttackPresentation(ability),
        });
        if (ability.simultaneousAreaImpact) simultaneousAreaEventIndex ??= missEventIndex;
        continue;
      }
      const conditionalCritBonus = ability.critChanceBonusWithStatus && hasStatus(playerStatuses, ability.critChanceBonusWithStatus.status)
        ? ability.critChanceBonusWithStatus.bonus
        : 0;
      const critical = forceCritical || Math.random() < derived.critChance + getCriticalChanceBonus(playerStatuses) + (ability.critChanceBonus ?? 0) + conditionalCritBonus;
      const consumedStatusForDamage = ability.consumeTargetStatusForDamage
        ? target.statuses.find((status) => status.id === ability.consumeTargetStatusForDamage!.status)
        : undefined;
      const statusBasedDamage: NonNullable<Ability["damageComponents"]> | undefined = ability.damageFromSelfStatusStacks
        ? [{
          damageType: ability.damageFromSelfStatusStacks.damageType,
          power: (playerStatuses.find((status) => status.id === ability.damageFromSelfStatusStacks!.status)?.stacks ?? 0) * ability.damageFromSelfStatusStacks.multiplier,
        }]
        : undefined;
      const damageComponents = ability.consumeTargetStatusForDamage && consumedStatusForDamage
        ? [{
          damageType: ability.consumeTargetStatusForDamage.damageType,
          powerScaling: ability.consumeTargetStatusForDamage.powerScalingPerStack * consumedStatusForDamage.stacks,
        }]
        : statusBasedDamage ?? ability.damageComponents ?? [{ damageType: ability.damageType ?? "physical", power: ability.power, powerScaling: effectivePowerScaling }];
      const targetStatusStackMultiplier = ability.damagePerTargetStatusStack
        ? 1 + (target.statuses.find((status) => status.id === ability.damagePerTargetStatusStack!.status)?.stacks ?? 0) * (ability.damagePerTargetStatusStack.multiplier + targetStatusStackMultiplierBonus)
        : 1;
      const baseIncomingDamage = damageComponents.reduce((total, component) => {
        const offensivePower = getOffensivePower(derived, component.damageType);
        const defense = getDefense(target.armor, target.magicResistance, target.statuses, component.damageType);
        const raw = (component.power ?? 0) + offensivePower * (component.powerScaling ?? 1) + derived.armor * (component.armorScaling ?? 0);
        const talentDamageMultiplier = getCharacterDamageMultiplier(character, playerStatuses, target.statuses, component.damageType, {
          playerHasTakenDamage: combat.playerHasTakenDamage ?? false,
          playerHasMissed,
          playerIsFirstInInitiative: orderTurnEntries(combat)[0]?.kind === "player",
        });
        const abilityDamageMultiplier = getDamageModifierMultiplier(ability.damageModifiers ?? [], playerStatuses, target.statuses, component.damageType)
          * abilityModifiers.reduce((multiplier, modifier) => {
            const scaling = modifier.damageMultiplierPerLivingEnemyWithStatus;
            if (!scaling) return multiplier;
            const matchingEnemies = damageScalingEnemyStatusCounts.get(scaling.status) ?? 0;
            return multiplier * (1 + matchingEnemies * scaling.multiplier);
          }, 1);
        const uniqueDebuffs = new Set(target.statuses.filter((status) => status.kind === "debuff").map((status) => status.id)).size;
        const debuffMultiplier = 1 + uniqueDebuffs * (ability.damagePerTargetDebuff ?? 0);
        return total + getModifiedDamage(Math.max(1, Math.round((raw - defense) * (critical ? 1.6 : 1) * talentDamageMultiplier * abilityDamageMultiplier * debuffMultiplier * targetStatusStackMultiplier)), playerStatuses, target.statuses, component.damageType);
      }, 0);
      const armorDamage = Math.ceil(derived.armor * derived.bonusDirectDamageFromArmorRatio);
      const incomingDamage = baseIncomingDamage + armorDamage;
      const absorption = ability.ignoresAbsorption
        ? { damage: incomingDamage, statuses: target.statuses, absorbed: 0, absorbedBy: {} }
        : absorbIncomingDamage(target.statuses, incomingDamage);
      const damage = absorption.damage;
      const targetHpBeforePercent = target.hp / target.maxHp;
      enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) } : enemy);
      logs.push(makeLog(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`, abilityInfo));
      const strikeLabel = totalHits > 1 ? `Strike ${hitIndex + 1} deals` : "It deals";
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage to ${target.name}${absorptionSuffix(absorption.absorbed)}.`, target.instanceId, damage, {
        attackerId: "player",
        animationHitCount: totalHits,
        animationDurationMultiplier: ability.attackSequenceDurationMultiplier,
        attachedEventIndex: ability.simultaneousAreaImpact ? simultaneousAreaEventIndex : undefined,
        ...getAbilityAttackPresentation(ability),
      });
      if (ability.simultaneousAreaImpact) simultaneousAreaEventIndex ??= damageEventIndex;
      queueAbsorptionChanges(pendingEffects, damageEventIndex, target.instanceId, absorption);
      if (ability.vfx) {
        if (ability.vfxDirection === "to_player") queueAbilityVfx(pendingEffects, damageEventIndex, ability.vfx, "player", target.instanceId);
        else queueAbilityVfx(pendingEffects, damageEventIndex, ability.vfx, target.instanceId, "player");
      }
      const appliedStatusIds: StatusEffectId[] = [];
      if (ability.effect === "bleed") {
        const bleed = createPlayerAppliedStatus("bleed", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, bleed) } : enemy);
        logs.push(makeLog(`${target.name} gains Bleed.`, statusInfo(bleed)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Bleed.`;
        queueStatus(events, pendingEffects, `${target.name} is Bleeding.`, target.instanceId, bleed, false, damageEventIndex);
        appliedStatusIds.push(bleed.id);
      }
      if (ability.effect === "poison") {
        const poison = createPlayerAppliedStatus("poison", derived, { duration: effectiveStatusDuration, stacks: effectiveStatusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
        const poisonLabel = poison.stacks > 1 ? `${poison.stacks} Poison` : "Poison";
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, poison) } : enemy);
        logs.push(makeLog(`${target.name} gains ${poisonLabel}.`, statusInfo(poison)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${poisonLabel}.`;
        queueStatus(events, pendingEffects, `${target.name} is Poisoned.`, target.instanceId, poison, false, damageEventIndex);
        appliedStatusIds.push(poison.id);
      }
      if (ability.effect === "vulnerable") {
        const vulnerableStatus = createPlayerAppliedStatus("vulnerable", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, vulnerableStatus) } : enemy);
        logs.push(makeLog(`${target.name} becomes Vulnerable.`, statusInfo(vulnerableStatus)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Vulnerable.`;
        queueStatus(events, pendingEffects, `${target.name} becomes Vulnerable.`, target.instanceId, vulnerableStatus, false, damageEventIndex);
        appliedStatusIds.push(vulnerableStatus.id);
      }
      if (ability.effect === "stun" && canApplyStatusEffect(target.statuses, "stunned") && Math.random() < Math.min(1, 0.45 + derived.chanceEffectBonus)) {
        const stunned = createPlayerAppliedStatus("stunned", derived);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, stunned: true, statuses: addOrRefreshStatus(enemy.statuses, stunned) } : enemy);
        logs.push(makeLog(`${target.name} is Stunned.`, statusInfo(stunned)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies Stun.`;
        queueStatus(events, pendingEffects, `${target.name} is Stunned.`, target.instanceId, stunned, true, damageEventIndex);
        appliedStatusIds.push(stunned.id);
      }
      const directStatusId = ability.effect === "stun" ? "stunned" : ability.effect;
      const speciallyHandled = directStatusId === "bleed" || directStatusId === "poison" || directStatusId === "vulnerable" || directStatusId === "stunned";
      if (directStatusId && isStatusEffectId(directStatusId) && !speciallyHandled && directStatusId !== "guard") {
        const status = createPlayerAppliedStatus(directStatusId, derived, { duration: effectiveStatusDuration, stacks: effectiveStatusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
        const appliedStatuses = [status, ...createPlayerCompanionStatuses(status.id, derived)];
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: appliedStatuses.reduce(addOrRefreshStatus, enemy.statuses) } : enemy);
        appliedStatuses.forEach((applied) => {
          appliedStatusIds.push(applied.id);
          logs.push(makeLog(`${target.name} gains ${applied.name}.`, statusInfo(applied)));
          queueStatus(events, pendingEffects, `${target.name} gains ${applied.name}.`, target.instanceId, applied, false, damageEventIndex);
        });
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${appliedStatuses.map((applied) => applied.name).join(" and ")}.`;
      }

      const configuredExtraStatuses: Array<NonNullable<Ability["statusApplications"]>[number]> = ability.conditionalStatusApplications && hasStatus(target.statuses, ability.conditionalStatusApplications.whenTargetHas)
        ? [...ability.conditionalStatusApplications.applications]
        : [...effectiveStatusApplications];
      if (ability.statusApplicationsWhenTargetHasNoDebuffs && !target.statuses.some((status) => status.kind === "debuff")) {
        configuredExtraStatuses.push(...ability.statusApplicationsWhenTargetHasNoDebuffs);
      }
      if (ability.statusApplicationsWhenSelfHas && hasStatus(playerStatuses, ability.statusApplicationsWhenSelfHas.selfStatus)) {
        configuredExtraStatuses.push(...ability.statusApplicationsWhenSelfHas.applications);
      }
      if (ability.randomSingleStatusApplication && target.instanceId === randomSingleStatusTargetId) {
        configuredExtraStatuses.push(ability.randomSingleStatusApplication);
      }
      if (ability.consumeTargetStatusForDamage?.applyStatus && consumedStatusForDamage) {
        configuredExtraStatuses.push({
          status: ability.consumeTargetStatusForDamage.applyStatus,
          stacks: Math.max(1, Math.round(consumedStatusForDamage.stacks * (ability.consumeTargetStatusForDamage.appliedStacksPerConsumedStack ?? 1))),
        });
      }
      abilityModifiers.forEach((modifier) => {
        const conditional = modifier.additionalStatusApplicationsWhenTargetHas;
        if (conditional && hasStatus(target.statuses, conditional.targetStatus)) {
          configuredExtraStatuses.push(...conditional.applications);
        }
      });
      if (ability.statusApplicationPerTargetStatusStacks && statusStacksPerTargetStatusDivisor && statusStacksPerTargetStatusDivisor > 0) {
        const targetStacks = target.statuses.find((status) => status.id === ability.statusApplicationPerTargetStatusStacks?.targetStatus)?.stacks ?? 0;
        const stacks = Math.floor(targetStacks / statusStacksPerTargetStatusDivisor);
        if (stacks > 0) configuredExtraStatuses.push({ status: ability.statusApplicationPerTargetStatusStacks.status, stacks });
      }
      const extraStatuses = configuredExtraStatuses.filter((application) => (
        (!application.onlyOnCritical || critical)
        && (application.chance === undefined && application.chancePerArmor === undefined
          || Math.random() < Math.min(1, (application.chance ?? 0) + derived.armor * (application.chancePerArmor ?? 0) + derived.chanceEffectBonus))
      ));
      const appliedExtraStatuses: StatusEffect[] = [];
      extraStatuses.forEach((application) => {
        const conditionalReplacement = ability.conditionalStatusReplacement;
        const modifierReplacement = statusApplicationReplacements.find((candidate) => candidate.from === application.status);
        const statusId = conditionalReplacement && application.status === conditionalReplacement.status && hasStatus(target.statuses, conditionalReplacement.whenTargetHas)
          ? conditionalReplacement.replacement
          : modifierReplacement?.to ?? application.status;
        const status = createPlayerAppliedStatus(statusId, derived, { stacks: application.stacks, duration: application.duration });
        const currentTargetStatuses = enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses ?? target.statuses;
        const statuses = [status, ...createPlayerCompanionStatuses(status.id, derived)]
          .filter((applied) => canApplyStatusEffect(currentTargetStatuses, applied.id));
        if (statuses.length === 0) return;
        appliedExtraStatuses.push(...statuses);
        appliedStatusIds.push(...statuses.map((applied) => applied.id));
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

      const immediateStatusDamageId = ability.triggerTargetStatusDamage ?? targetStatusDamageTrigger?.status;
      if (immediateStatusDamageId) {
        const appliedStacks = appliedExtraStatuses
          .filter((status) => status.id === immediateStatusDamageId)
          .reduce((total, status) => total + status.stacks, 0);
        const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
        const tickingStatus = currentTarget?.statuses.find((status) => status.id === immediateStatusDamageId);
        const thresholdMet = ability.triggerTargetStatusDamage !== undefined
          || Boolean(targetStatusDamageTrigger && appliedStacks >= targetStatusDamageTrigger.minimumAppliedStacks);
        if (currentTarget && tickingStatus && thresholdMet) {
          const statusMultiplier = derived.statusDamageMultipliers[tickingStatus.id] ?? 1;
          const tickAbsorption = absorbIncomingDamage(currentTarget.statuses, getAfflictionDamage(tickingStatus, currentTarget.statuses, statusMultiplier, currentTarget.armor, currentTarget.magicResistance));
          const tickDamage = tickAbsorption.damage;
          enemies = enemies.map((enemy) => enemy.instanceId === currentTarget.instanceId ? {
            ...enemy,
            hp: Math.max(0, enemy.hp - tickDamage),
            statuses: wakeFromDamage(tickAbsorption.statuses, tickDamage),
          } : enemy);
          logs.push(makeLog(`${tickingStatus.name} immediately deals ${tickDamage} damage to ${currentTarget.name}${absorptionSuffix(tickAbsorption.absorbed)}.`, statusInfo(tickingStatus)));
          queueDamageAtEvent(pendingEffects, damageEventIndex, currentTarget.instanceId, tickDamage, tickingStatus.name);
          queueAbsorptionChanges(pendingEffects, damageEventIndex, currentTarget.instanceId, tickAbsorption);
          if (tickDamage > 0 && tickingStatus.sourceId === "player") {
            const statusDamageTriggers = runPlayerTriggerEvent(
              "status_damage",
              { damage: tickDamage, damageType: tickingStatus.id === "bleed" ? "physical" : tickingStatus.id === "burn" ? "fire" : "arcane", sourceStatusId: tickingStatus.id, sourceKind: "player", targetStatusIds: currentTarget.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
              currentTarget.instanceId, character, combat, derived,
              { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, damageEventIndex,
            );
            procUsage = statusDamageTriggers.procUsage;
            ({ enemies, playerStatuses, playerHp, energy } = statusDamageTriggers.state);
            abilityCooldowns = statusDamageTriggers.state.abilityCooldowns ?? abilityCooldowns;
          }
        }
      }

      let restoredHealth = 0;
      let gainedGuard = 0;
      if (effectiveSelfHealPercentMaxHp > 0) {
        restoredHealth = Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(combat.playerMaxHp * effectiveSelfHealPercentMaxHp * derived.healingReceivedMultiplier)));
        if (restoredHealth > 0) {
          playerHp += restoredHealth;
          logs.push(makeLog(`${ability.name} restores ${restoredHealth} Health.`, abilityInfo));
          queueHealAtEvent(pendingEffects, damageEventIndex, "player", restoredHealth);
        }
      }
      if (ability.selfGuardFromArmorRatio && ability.selfGuardFromArmorRatio > 0) {
        gainedGuard = Math.max(1, Math.round(derived.armor * ability.selfGuardFromArmorRatio * derived.guardMultiplier));
        const guard = createStatusEffect("guard", { duration: 1, stacks: gainedGuard, sourceId: ability.id, description: `Absorbs ${gainedGuard} incoming damage.` });
        playerStatuses = addOrRefreshStatus(playerStatuses, guard);
        logs.push(makeLog(`${ability.name} grants ${gainedGuard} Guard.`, statusInfo(guard)));
        queueStatus(events, pendingEffects, `You gain ${gainedGuard} Guard.`, "player", guard, false, damageEventIndex);
      }
      if (nextTurnEnergyRegenOnHit > 0) {
        nextTurnEnergyRegenBonus += nextTurnEnergyRegenOnHit;
        queueNextTurnEnergyRegeneration(pendingEffects, damageEventIndex, nextTurnEnergyRegenOnHit);
        logs.push(makeLog(`${ability.name} grants +${nextTurnEnergyRegenOnHit} Energy regeneration next turn.`, abilityInfo));
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
        if (effect.vfx) queueAbilityVfx(pendingEffects, eventIndex, effect.vfx, "player", target.instanceId);
        if (healing > 0) {
          const healingTriggers = runPlayerTriggerEvent(
            "health_restored",
            { abilityId: ability.id, abilityBranch: ability.branch, damage: healing, healthRestored: healing, selfStatusIds: playerStatuses.map((status) => status.id) },
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
        }
      });

      if (ability.consumeTargetStatus) {
        const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
        const consumed = currentTarget?.statuses.find((status) => status.id === ability.consumeTargetStatus);
        if (consumed) {
          const modifierRatio = abilityModifiers.find((modifier) => modifier.statusConsumptionRatio !== undefined)?.statusConsumptionRatio;
          const ratio = Math.max(0, Math.min(1, modifierRatio ?? ability.consumeTargetStatusRatio ?? 1));
          const consumedStacks = Math.min(consumed.stacks, Math.max(1, effectiveConsumeTargetStacks ?? Math.ceil(consumed.stacks * ratio)));
          const remainingStacks = Math.max(0, consumed.stacks - consumedStacks);
          enemies = enemies.map((enemy) => enemy.instanceId !== target.instanceId ? enemy : {
            ...enemy,
            statuses: enemy.statuses.flatMap((status) => status.id !== consumed.id ? [status] : remainingStacks > 0 ? [{ ...status, stacks: remainingStacks }] : []),
          });
          if (remainingStacks > 0) queueStatusSet(pendingEffects, damageEventIndex, target.instanceId, { ...consumed, stacks: remainingStacks });
          else queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, consumed.id);
          events[damageEventIndex] = `${events[damageEventIndex].replace(/\.$/, "")} and consumes ${consumedStacks} ${consumed.name}.`;
          if (ability.energyPerConsumedTargetStatusStacks) {
            const restored = Math.floor(consumedStacks / Math.max(1, ability.energyPerConsumedTargetStatusStacks.stacksPerEnergy));
            energy = Math.min(combat.maxEnergy, energy + restored);
          }
          const removedTriggers = runPlayerTriggerEvent(
            "status_removed",
            { removedStatusIds: [consumed.id], removalReason: "consumed", targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [], selfStatusIds: playerStatuses.map((status) => status.id) },
            target.instanceId,
            character,
            combat,
            derived,
            { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
            procUsage,
            logs,
            events,
            pendingEffects,
            damageEventIndex,
          );
          procUsage = removedTriggers.procUsage;
          ({ enemies, playerStatuses, playerHp, energy } = removedTriggers.state);
          abilityCooldowns = removedTriggers.state.abilityCooldowns ?? abilityCooldowns;
        }
      }

      if (ability.grantsNextCritical) {
        const pinpoint = createStatusEffect("pinpoint", { duration: 1, sourceId: "player" });
        playerStatuses = addOrRefreshStatus(playerStatuses, pinpoint);
        queueStatus(events, pendingEffects, "Your next damaging ability is guaranteed to critically strike.", "player", pinpoint, false, damageEventIndex);
      }

      const triggerContext = {
        abilityId: ability.id,
        abilityBranch: ability.branch,
        damageType: ability.damageType ?? damageComponents[0]?.damageType,
        critical,
        damage,
        healthRestored: restoredHealth,
        targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [],
        targetStatusIdsBefore: target.statuses.map((status) => status.id),
        selfStatusIds: playerStatuses.map((status) => status.id),
        appliedStatusIds,
        targetHpBeforePercent,
        targetHpAfterPercent: (() => {
          const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
          return currentTarget ? currentTarget.hp / currentTarget.maxHp : undefined;
        })(),
      };
      const triggerEvents: CombatTriggerEvent[] = [
        "on_hit",
        ...(critical ? ["on_crit" as const] : []),
        ...(appliedStatusIds.length > 0 ? ["status_applied" as const] : []),
        ...(restoredHealth > 0 ? ["health_restored" as const] : []),
        ...(gainedGuard > 0 ? ["guard_gained" as const] : []),
      ];
      const hitTriggers = runPlayerTriggerEvents(triggerEvents, triggerContext, target.instanceId, character, combat, derived, { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects, damageEventIndex);
      procUsage = hitTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = hitTriggers.state);
      abilityCooldowns = hitTriggers.state.abilityCooldowns ?? abilityCooldowns;
      if (!targetWasStunned && hasStatus(enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses ?? [], "stunned")) {
        const stunnedTriggers = runPlayerTriggerEvent(
          "enemy_stunned",
          { ...triggerContext, targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [] },
          target.instanceId,
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
          procUsage,
          logs,
          events,
          pendingEffects,
        );
        procUsage = stunnedTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = stunnedTriggers.state);
        abilityCooldowns = stunnedTriggers.state.abilityCooldowns ?? abilityCooldowns;
      }
      if ((enemies.find((enemy) => enemy.instanceId === target.instanceId)?.hp ?? 1) <= 0) {
        const result = runPlayerTriggerEvent("on_kill", triggerContext, target.instanceId, character, combat, derived, { enemies, playerStatuses, playerHp, energy, abilityCooldowns }, procUsage, logs, events, pendingEffects);
        procUsage = result.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = result.state);
        abilityCooldowns = result.state.abilityCooldowns ?? abilityCooldowns;
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
        if (ability.killVfx) queueAbilityVfx(pendingEffects, damageEventIndex, ability.killVfx, target.instanceId, "player");
      }
      if (hasStatus(playerStatuses, "reckless") && damage > 0) {
        const recoil = Math.max(1, Math.round(damage * 0.5 * getEnergyDefenseMultiplier(derived, energy, playerStatuses)));
        const recoilAbsorption = absorbIncomingDamage(playerStatuses, recoil);
        playerHp = Math.max(0, playerHp - recoilAbsorption.damage);
        playerStatuses = wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage);
        logs.push(makeLog(`Reckless deals ${recoilAbsorption.damage} damage to you.`, statusInfo(playerStatuses.find((status) => status.id === "reckless") ?? createStatusEffect("reckless"))));
        const recoilEventIndex = queueDamage(events, pendingEffects, `You take ${recoilAbsorption.damage} damage from Reckless${absorptionSuffix(recoilAbsorption.absorbed)}.`, "player", recoilAbsorption.damage, { sourceLabel: "Reckless" });
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

  effectiveSelfStatusApplications.forEach((application) => {
    if (derived.statusImmunities.includes(application.status) || !canApplyStatusEffect(playerStatuses, application.status)) return;
    const status = createPlayerAppliedStatus(application.status, derived, application);
    playerStatuses = addOrRefreshStatus(playerStatuses, status);
    const sharedEvent = sharedSelfStatusEvent.current?.statusId === status.id ? sharedSelfStatusEvent.current : null;
    if (!sharedEvent) logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
    const statusEventIndex = sharedEvent?.eventIndex ?? events.length;
    queueStatus(events, pendingEffects, sharedEvent?.text ?? `You gain ${status.name}.`, "player", status, false, sharedEvent?.eventIndex);
    if (ability.selfStatusVfx) queueAbilityVfx(pendingEffects, statusEventIndex, ability.selfStatusVfx, "player", "player");
  });

  if (abilityNextTurnEnergyRegenBonus > 0) {
    nextTurnEnergyRegenBonus += abilityNextTurnEnergyRegenBonus;
    const eventIndex = Math.max(0, events.length - 1);
    queueNextTurnEnergyRegeneration(pendingEffects, eventIndex, abilityNextTurnEnergyRegenBonus);
    logs.push(makeLog(`${ability.name} grants +${abilityNextTurnEnergyRegenBonus} Energy regeneration next turn.`, abilityInfo));
  }

  const bleedResult = applyBleedAfterAbility(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.bleedDamageTakenMultiplier * getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor);
  playerHp = bleedResult.hp;
  playerStatuses = bleedResult.statuses;
  const saved = applyPlayerDeathPrevention(playerHp, playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
  const savedTriggers = runDeathPreventionHealingTriggers(
    saved,
    character,
    combat,
    derived,
    { enemies, playerStatuses: saved.statuses, playerHp: saved.hp, energy, abilityCooldowns },
    procUsage,
    logs,
    events,
    pendingEffects,
  );
  ({ enemies, playerStatuses, playerHp, energy } = savedTriggers.state);
  abilityCooldowns = savedTriggers.state.abilityCooldowns ?? abilityCooldowns;
  procUsage = savedTriggers.procUsage;
  let deathPreventionUsed = saved.used;

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    events.push("Victory.");
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, pendingEffects, damagedTargets, enemies: displayedEnemies, playerHp: displayedPlayerHp, playerStatuses: displayedPlayerStatuses, energy, procUsage, deathPreventionUsed, playerHasMissed, nextTurnEnergyRegenBonus: combat.nextTurnEnergyRegenBonus ?? 0, abilityCooldowns, playerActed: true, attackingActorId: null, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "active" };
  }

  if (ability.grantsImmediateTurn) {
    const turnEnd = processTurnEnd(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor, derived.magicResistance);
    playerHp = turnEnd.hp;
    playerStatuses = turnEnd.statuses;
    const refreshedCooldowns = Object.fromEntries(
      Object.entries(abilityCooldowns)
        .map(([id, turns]) => [id, Math.max(0, turns - 1)] as const)
        .filter(([, turns]) => turns > 0),
    );
    const turnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", combat.activeTurnIndex, combat.turn + 1, false, playerStatuses, energy, 0, refreshedCooldowns, "player");
    if (ability.immediateTurnVfx) queueAbilityVfx(pendingEffects, turnEventIndex, ability.immediateTurnVfx, "player", "player");
    const statusesBeforeStart = playerStatuses;
    const playerStart = processTurnStart(playerHp, combat.playerMaxHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier, getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor, derived.magicResistance, derived.statusDamageMultipliers.burn ?? 1);
    if (playerStart.burnDamage > 0 && playerStart.burnEventIndex !== null) {
      const burnTriggers = runPlayerTriggerEvent(
        "damage_taken",
        { damage: playerStart.burnDamage, damageType: "fire", sourceStatusId: "burn", targetStatusIds: playerStart.statuses.map((status) => status.id) },
        "player",
        character,
        combat,
        derived,
        { enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy },
        procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.burnEventIndex,
      );
      procUsage = burnTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = burnTriggers.state);
    } else {
      playerHp = playerStart.hp;
      playerStatuses = playerStart.statuses;
    }
    if (playerStart.healing > 0 && playerStart.healingEventIndex !== null) {
      const healingTriggers = runPlayerTriggerEvent(
        "health_restored",
        { damage: playerStart.healing, healthRestored: playerStart.healing, selfStatusIds: playerStatuses.map((status) => status.id) },
        "player",
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.healingEventIndex,
      );
      procUsage = healingTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = healingTriggers.state);
      abilityCooldowns = healingTriggers.state.abilityCooldowns ?? abilityCooldowns;
    }
    energy = Math.min(combat.maxEnergy, energy + getEnergyRegeneration(derived.energyRegen + nextTurnEnergyRegenBonus, playerStatuses));
    nextTurnEnergyRegenBonus = 0;
    const immediateTurnSaved = applyPlayerDeathPrevention(playerHp, playerStatuses, deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects);
    const immediateTurnSavedTriggers = runDeathPreventionHealingTriggers(
      immediateTurnSaved,
      character,
      combat,
      derived,
      { enemies, playerStatuses: immediateTurnSaved.statuses, playerHp: immediateTurnSaved.hp, energy, abilityCooldowns },
      procUsage,
      logs,
      events,
      pendingEffects,
    );
    ({ enemies, playerStatuses, playerHp, energy } = immediateTurnSavedTriggers.state);
    abilityCooldowns = immediateTurnSavedTriggers.state.abilityCooldowns ?? abilityCooldowns;
    procUsage = immediateTurnSavedTriggers.procUsage;
    deathPreventionUsed = immediateTurnSaved.used;
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
      playerHasTakenDamage: combat.playerHasTakenDamage || playerStart.burnDamage > 0,
      playerHasMissed,
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
    playerHasMissed,
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
  const turnEnd = processTurnEnd(combat.playerHp, combat.playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, combat.energy, combat.playerStatuses), derived.armor, derived.magicResistance);
  if (events.length > 0) {
    queueStatusReconciliation(pendingEffects, events.length - 1, "player", combat.playerStatuses, turnEnd.statuses);
  }
  const next = moveToNextActor({ ...combat, playerHp: turnEnd.hp, playerStatuses: turnEnd.statuses }, character, logs, events, pendingEffects);
  const sequencePending = events.length > 0;
  return {
    ...next,
    outcome: pendingEffects.length > 0 ? "active" : next.outcome,
    playerHp: displayedPlayerHp,
    playerStatuses: sequencePending ? combat.playerStatuses : next.playerStatuses,
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
  let playerEnergy = combat.energy;
  let procUsage = { ...(combat.procUsage ?? {}) };
  const enemyIndex = enemies.findIndex((enemy) => enemy.instanceId === activeActor.actorId);
  if (enemyIndex < 0) return moveToNextActor(combat, character, logs, events, pendingEffects);

  const originalEnemy = enemies[enemyIndex];
  let statusResolutionEventIndex: number | null = null;
  const enemyStart = processTurnStart(
    originalEnemy.hp,
    originalEnemy.maxHp,
    originalEnemy.statuses,
    originalEnemy.instanceId,
    originalEnemy.name,
    logs,
    events,
    pendingEffects,
    1,
    1,
    originalEnemy.armor,
    originalEnemy.magicResistance,
    (derived.statusDamageMultipliers.burn ?? 1) * getCharacterStatusDamageMultiplier(character, "burn", combat.playerStatuses),
  );
  const regeneratedEnergy = Math.min(originalEnemy.maxEnergy, originalEnemy.energy + getEnergyRegeneration(1, enemyStart.statuses));
  let enemy = { ...originalEnemy, hp: enemyStart.hp, statuses: enemyStart.statuses, energy: regeneratedEnergy, stunned: false };
  enemies[enemyIndex] = enemy;
  const sourceBurn = originalEnemy.statuses.find((status) => status.id === "burn");
  if (enemyStart.burnDamage > 0 && enemyStart.burnEventIndex !== null && sourceBurn?.sourceId === "player") {
    const burnTriggers = runPlayerTriggerEvent(
      "status_damage",
      {
        damage: enemyStart.burnDamage,
        damageType: "fire",
        sourceStatusId: "burn",
        sourceKind: "player",
        targetStatusIds: enemy.statuses.map((status) => status.id),
        selfStatusIds: playerStatuses.map((status) => status.id),
      },
      enemy.instanceId,
      character,
      combat,
      derived,
      { enemies, playerStatuses, playerHp, energy: playerEnergy },
      procUsage,
      logs,
      events,
      pendingEffects,
      enemyStart.burnEventIndex,
    );
    procUsage = burnTriggers.procUsage;
    enemies = burnTriggers.state.enemies;
    playerStatuses = burnTriggers.state.playerStatuses;
    playerHp = burnTriggers.state.playerHp;
    playerEnergy = burnTriggers.state.energy;
    enemy = enemies.find((candidate) => candidate.instanceId === originalEnemy.instanceId) ?? enemy;
  }
  let nextBase: CombatState = { ...combat, enemies, playerHp, playerStatuses, energy: playerEnergy };

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
    const playerDodgeChance = getEffectiveDodgeChance(derived.dodgeChance, getDodgeChanceBonus(playerStatuses));
    if (!rollHit(enemy.hitChance * getHitChanceMultiplier(enemy.statuses), playerDodgeChance)) {
      logs.push(makeLog(`${enemy.name} misses you.`, enemyAttackInfo));
      queueDamage(events, pendingEffects, "You dodge the attack.", "player", 0, { attackerId: enemy.instanceId, missed: true });
      const missedTriggers = runPlayerTriggerEvent(
        "enemy_missed",
        { abilityId: attackName, damageType: enemy.damageType, damage: 0, sourceKind: "enemy", targetStatusIds: enemy.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
        enemy.instanceId,
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy: playerEnergy },
        procUsage,
        logs,
        events,
        pendingEffects,
      );
      procUsage = missedTriggers.procUsage;
      enemies = missedTriggers.state.enemies;
      playerStatuses = missedTriggers.state.playerStatuses;
      playerHp = missedTriggers.state.playerHp;
      playerEnergy = missedTriggers.state.energy;
    } else {
      const defense = getDefense(derived.armor, derived.magicResistance, playerStatuses, enemy.damageType);
      const critical = Math.random() < getCriticalChanceBonus(enemy.statuses);
      const baseIncoming = Math.max(1, Math.round((enemy.power - Math.floor(defense * 0.35)) * (critical ? 1.6 : 1)));
      const incoming = Math.max(0, Math.round(getModifiedDamage(baseIncoming, enemy.statuses, playerStatuses, enemy.damageType) * getEnergyDefenseMultiplier(derived, playerEnergy, playerStatuses)));
      const absorptionStatusSources = new Map(playerStatuses
        .filter((status) => status.id === "guard" || status.id === "barrier")
        .map((status) => [status.id, status.sourceId] as const));
      const absorption = absorbIncomingDamage(playerStatuses, incoming);
      const blocked = absorption.absorbed;
      const damage = absorption.damage;
      playerHp = Math.max(0, playerHp - damage);
      playerStatuses = wakeFromDamage(absorption.statuses, damage);
      logs.push(makeLog(`${enemy.name} uses ${attackName} for ${damage}${critical ? " critical" : ""}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage, { attackerId: enemy.instanceId });
      queueAbsorptionChanges(pendingEffects, damageEventIndex, "player", absorption);
      let enemyAppliedBleed = false;
      if (damage > 0 && enemy.onHitEffect === "bleed" && !derived.statusImmunities.includes("bleed")) {
        const bleed = createStatusEffect("bleed", { sourcePower: enemy.power, sourceId: enemy.instanceId });
        playerStatuses = addOrRefreshStatus(playerStatuses, bleed);
        enemyAppliedBleed = true;
        logs.push(makeLog("You gain Bleed.", statusInfo(bleed)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""} and applies Bleed.`;
        queueStatus(events, pendingEffects, "You are Bleeding.", "player", bleed, false, damageEventIndex);
      }
      if (enemyAppliedBleed) {
        const statusApplied = runPlayerTriggerEvent(
          "status_applied",
          { appliedStatusIds: ["bleed"], sourceKind: "enemy", targetStatusIds: enemy.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
          enemy.instanceId, character, combat, derived,
          { enemies, playerStatuses, playerHp, energy: playerEnergy }, procUsage, logs, events, pendingEffects, damageEventIndex,
        );
        procUsage = statusApplied.procUsage;
        enemies = statusApplied.state.enemies;
        playerStatuses = statusApplied.state.playerStatuses;
        playerHp = statusApplied.state.playerHp;
        playerEnergy = statusApplied.state.energy;
      }
      const absorbedByStatusIds = (Object.keys(absorption.absorbedBy) as Array<"guard" | "barrier">)
        .filter((statusId) => (absorption.absorbedBy[statusId] ?? 0) > 0);
      const depletedStatusIds = absorbedByStatusIds.filter((statusId) => !hasStatus(playerStatuses, statusId));
      const depletedStatusSourceIds = depletedStatusIds.flatMap((statusId) => absorptionStatusSources.get(statusId) ? [absorptionStatusSources.get(statusId)!] : []);
      if (damage > 0 || absorption.absorbed > 0) {
        const result = runPlayerTriggerEvent(
          "damage_taken",
          { damage, absorbedDamage: absorption.absorbed, absorbedByStatusIds, depletedStatusIds, depletedStatusSourceIds, absorbedDamageByStatus: absorption.absorbedBy, sourceKind: "enemy", targetStatusIds: playerStatuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
          enemy.instanceId,
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy: playerEnergy },
          procUsage,
          logs,
          events,
          pendingEffects,
        );
        procUsage = result.procUsage;
        enemies = result.state.enemies;
        playerStatuses = result.state.playerStatuses;
        playerHp = result.state.playerHp;
        playerEnergy = result.state.energy;
      }
      if (hasStatus(enemy.statuses, "reckless") && damage > 0) {
        const reckless = enemy.statuses.find((status) => status.id === "reckless")!;
        const recoil = Math.max(1, Math.round(damage * 0.5));
        const recoilAbsorption = absorbIncomingDamage(enemy.statuses, recoil);
        enemy = { ...enemy, hp: Math.max(0, enemy.hp - recoilAbsorption.damage), statuses: wakeFromDamage(recoilAbsorption.statuses, recoilAbsorption.damage) };
        enemies[enemyIndex] = enemy;
        logs.push(makeLog(`${enemy.name} takes ${recoilAbsorption.damage} damage from Reckless.`, statusInfo(reckless)));
        const recoilEventIndex = queueDamage(events, pendingEffects, `${enemy.name} takes ${recoilAbsorption.damage} damage from Reckless${absorptionSuffix(recoilAbsorption.absorbed)}.`, enemy.instanceId, recoilAbsorption.damage, { sourceLabel: "Reckless" });
        queueAbsorptionChanges(pendingEffects, recoilEventIndex, enemy.instanceId, recoilAbsorption);
      }
    }
    const bleedResult = applyBleedAfterAbility(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, 1, enemy.armor);
    enemy = { ...enemy, hp: bleedResult.hp, statuses: bleedResult.statuses };
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId
      ? { ...candidate, ...enemy, energy: Math.max(0, enemy.energy - enemy.energyCost) }
      : candidate);
    nextBase = { ...nextBase, enemies, playerHp, playerStatuses, energy: playerEnergy, procUsage };
  }

  enemy = enemies.find((candidate) => candidate.instanceId === enemy.instanceId) ?? enemy;
  if (enemy.hp > 0) {
    const hpBeforePoison = enemy.hp;
    const poisonEventIndex = events.length;
    const enemyEnd = processTurnEnd(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, derived.statusDamageMultipliers.poison ?? 1, 1, enemy.armor, enemy.magicResistance);
    if (enemy.statuses.some((status) => status.id === "poison")) statusResolutionEventIndex = poisonEventIndex;
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, hp: enemyEnd.hp, statuses: enemyEnd.statuses } : candidate);
    const expiredArcaneWound = enemy.statuses.some((status) => status.id === "arcaneWound") && !enemyEnd.statuses.some((status) => status.id === "arcaneWound");
    if (expiredArcaneWound) {
      const expiredTriggers = runPlayerTriggerEvent(
        "status_removed",
        { removedStatusIds: ["arcaneWound"], removalReason: "expired", targetStatusIds: enemyEnd.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
        enemy.instanceId, character, combat, derived,
        { enemies, playerStatuses, playerHp, energy: playerEnergy }, procUsage, logs, events, pendingEffects, Math.max(0, events.length - 1),
      );
      procUsage = expiredTriggers.procUsage;
      enemies = expiredTriggers.state.enemies;
      playerStatuses = expiredTriggers.state.playerStatuses;
      playerHp = expiredTriggers.state.playerHp;
      playerEnergy = expiredTriggers.state.energy;
    }
    const poison = enemy.statuses.find((status) => status.id === "poison");
    const leechRatio = poison?.sourceId === "player" ? derived.statusDamageLeech.poison ?? 0 : 0;
    if (enemyEnd.poisonDamage > 0 && leechRatio > 0) {
      const healing = Math.min(combat.playerMaxHp - playerHp, Math.ceil(enemyEnd.poisonDamage * leechRatio));
      if (healing > 0) {
        playerHp += healing;
        logs.push(makeLog(`Leech restores ${healing} Health.`, { title: "Leech", description: "Restores Health equal to 5% of your Poison damage.", category: "ability" }));
        const healingEventIndex = queueHeal(events, pendingEffects, `Leech restores ${healing} Health.`, "player", healing);
        const healingTriggers = runPlayerTriggerEvent(
          "health_restored",
          { damage: healing, healthRestored: healing, sourceStatusId: "poison", selfStatusIds: playerStatuses.map((status) => status.id) },
          "player",
          character,
          combat,
          derived,
          { enemies, playerStatuses, playerHp, energy: playerEnergy },
          procUsage,
          logs,
          events,
          pendingEffects,
          healingEventIndex,
        );
        procUsage = healingTriggers.procUsage;
        enemies = healingTriggers.state.enemies;
        playerStatuses = healingTriggers.state.playerStatuses;
        playerHp = healingTriggers.state.playerHp;
        playerEnergy = healingTriggers.state.energy;
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
        { enemies, playerStatuses, playerHp, energy: playerEnergy },
        procUsage,
        logs,
        events,
        pendingEffects,
      );
      procUsage = result.procUsage;
      enemies = result.state.enemies;
      playerStatuses = result.state.playerStatuses;
      playerHp = result.state.playerHp;
      playerEnergy = result.state.energy;
    }
  } else {
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, statuses: decrementStatusDurations(candidate.statuses) } : candidate);
  }
  nextBase = { ...nextBase, enemies, playerHp, playerStatuses, energy: playerEnergy, procUsage };

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
  const damageSourceLabels: Record<string, string> = {};
  matchingEffects.forEach((effect) => {
    if ("damage" in effect && effect.damage > 0 && effect.sourceLabel) {
      damageSourceLabels[effect.targetId] = effect.sourceLabel;
    }
  });
  const statusAnimations = matchingEffects.flatMap((effect) => effect.type === "status"
    ? [{ id: effect.id, statusId: effect.status.id, targetId: effect.targetId, sourceTargetId: effect.sourceTargetId }]
    : []);
  const abilityAnimations = matchingEffects.flatMap((effect) => effect.type === "ability_vfx"
    ? [{ id: effect.id, kind: effect.kind, targetId: effect.targetId, sourceTargetId: effect.sourceTargetId }]
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
  return reorderCombat({ ...combat, playerHp, playerStatuses, enemies, activeTurnIndex: stableActiveTurnIndex, turn, playerActed, energy, abilityCooldowns, nextTurnEnergyRegenBonus, playerHasTakenDamage, attackingActorId, attackAnimationId, attackEffectId, pendingEffects, damagedTargets, missedTargets, damageSourceLabels, statusAnimations: visibleStatusAnimations, abilityAnimations, passiveAnimations: [...(combat.passiveAnimations ?? []), ...passiveAnimations].slice(-16), selectedEnemyId, outcome });
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
  const usesProjectile = attackPresentation === "projectile" && attackEffect.attackerId === "player" && attackEffect.targetId !== "player";
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
