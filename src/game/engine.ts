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
    initiativeRevealed: false,
    playerActed: false,
    abilityCooldowns: {},
    eventId: 1,
    completedSequenceEventId: 1,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    damagedTargets: [],
    attackingActorId: null,
    attackAnimationId: 0,
    attackEffectId: null,
    playerHp: Math.min(carryHp ?? derived.maxHp, derived.maxHp),
    playerMaxHp: derived.maxHp,
    energy: derived.maxEnergy,
    maxEnergy: derived.maxEnergy,
    selectedEnemyId: enemies[0].instanceId,
    enemies,
    playerStatuses: features.passive.startingStatuses.map((status) => ({ ...status })),
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

function queueDamage(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, damage: number, attackerId?: "player" | string): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "damage", targetId, damage, attackerId });
  return eventIndex;
}

function queueHeal(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, amount: number): number {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "heal", targetId, amount });
  return eventIndex;
}

function queueStatus(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, status: StatusEffect, stunned = false, attachedEventIndex?: number): void {
  const eventIndex = attachedEventIndex ?? events.length;
  if (attachedEventIndex === undefined) events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "status", targetId, status: { ...status }, stunned });
}

function queueStatusRemoval(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, statusId: StatusEffect["id"]): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "remove_status", targetId, statusId });
}

function queueStatusSet(pendingEffects: CombatPendingEffect[], eventIndex: number, targetId: string, status: StatusEffect): void {
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "set_status", targetId, status: { ...status } });
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
    effect.type !== "turn"
    && effect.targetId === targetId
    && ((effect.type === "set_status" && effect.status.id === "barrier") || (effect.type === "remove_status" && effect.statusId === "barrier"))
  ));
  if (!barrierChangesLater) return nextStatuses;
  const previousBarrier = previousStatuses.find((status) => status.id === "barrier");
  return [
    ...nextStatuses.filter((status) => status.id !== "barrier"),
    ...(previousBarrier ? [previousBarrier] : []),
  ];
}

function queueTurn(events: string[], pendingEffects: CombatPendingEffect[], text: string, activeTurnIndex: number, turn: number, playerActed?: boolean, playerStatuses?: StatusEffect[], energy?: number): void {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "turn", activeTurnIndex, turn, playerActed, playerStatuses, energy });
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
      initiativeRevealed: combat.initiativeRevealed ?? true,
      playerActed: combat.playerActed ?? false,
      abilityCooldowns: combat.abilityCooldowns ?? {},
      completedSequenceEventId: combat.completedSequenceEventId
        ?? ((combat.floatingEvents?.length ?? 0) > 0 && (combat.pendingEffects?.length ?? 0) > 0 ? (combat.eventId ?? 1) - 1 : combat.eventId ?? 1),
      damagedTargets: combat.damagedTargets ?? [],
      attackingActorId: combat.attackingActorId ?? null,
      attackAnimationId: combat.attackAnimationId ?? 0,
      attackEffectId: combat.attackEffectId ?? null,
      pendingEffects: combat.pendingEffects ?? [],
      procUsage: combat.procUsage ?? {},
    };
  }
  const turnOrder = rollTurnOrder(character, enemies);
  return {
    ...combat,
    enemies,
    turnOrder,
    activeTurnIndex: 0,
    initiativeRevealed: false,
    playerActed: false,
    abilityCooldowns: {},
    eventId: (combat.eventId ?? 0) + 1,
    completedSequenceEventId: combat.eventId ?? 0,
    floatingEvents: [],
    pendingEffects: [],
    procUsage: {},
    damagedTargets: [],
    attackingActorId: null,
    attackAnimationId: combat.attackAnimationId ?? 0,
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

function createPlayerAppliedStatus(
  statusId: StatusEffect["id"],
  derived: ReturnType<typeof getDerivedStats>,
  options: Partial<Pick<StatusEffect, "duration" | "stacks" | "magnitude" | "expiresAtTurnStart">> = {},
): StatusEffect {
  const sourcePower = statusId === "bleed" ? derived.physicalPower
    : statusId === "poison" || statusId === "burn" || statusId === "regenerate" ? derived.magicalPower
      : undefined;
  return createStatusEffect(statusId, { sourcePower, sourceId: "player", ...options });
}

function wakeFromDamage(statuses: StatusEffect[], damage: number): StatusEffect[] {
  return damage > 0 ? statuses.filter((status) => status.id !== "sleep") : statuses;
}

function getActorStatuses(combat: CombatState, actor: TurnOrderEntry): StatusEffect[] {
  return actor.kind === "player"
    ? combat.playerStatuses
    : combat.enemies.find((enemy) => enemy.instanceId === actor.actorId)?.statuses ?? [];
}

function orderTurnEntries(combat: CombatState): TurnOrderEntry[] {
  return [...combat.turnOrder].sort((left, right) => {
    const slowDifference = Number(hasStatus(getActorStatuses(combat, left), "slowed")) - Number(hasStatus(getActorStatuses(combat, right), "slowed"));
    if (slowDifference !== 0) return slowDifference;
    const initiativeDifference = right.initiative - left.initiative;
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
): StatusTurnResult {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  // One-round defensive effects protect the owner until their next turn begins.
  nextStatuses = nextStatuses.filter((status) => status.expiresAtTurnStart !== true && (status.id !== "stealth" || status.expiresAtTurnStart === false) && status.id !== "guard");
  const burn = nextStatuses.find((status) => status.id === "burn");
  if (burn) {
    const absorption = absorbIncomingDamage(nextStatuses, getAfflictionDamage(burn, nextStatuses));
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
): { hp: number; statuses: StatusEffect[] } {
  let nextHp = hp;
  let nextStatuses = [...statuses];
  const poison = nextStatuses.find((status) => status.id === "poison");
  if (poison) {
    const sourceMultiplier = poison.sourceId === "player" ? playerPoisonDamageMultiplier : 1;
    const absorption = absorbIncomingDamage(nextStatuses, getAfflictionDamage(poison, nextStatuses, sourceMultiplier));
    const damage = absorption.damage;
    nextHp = Math.max(0, nextHp - damage);
    nextStatuses = wakeFromDamage(absorption.statuses, damage);
    const text = targetId === "player" ? `You take ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Poison${absorptionSuffix(absorption.absorbed)}.`;
    logs.push(makeLog(text, statusInfo(poison)));
    const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage);
    queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  }
  return { hp: nextHp, statuses: decrementStatusDurations(nextStatuses) };
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

function moveToNextActor(combat: CombatState, character: CharacterState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): CombatState {
  combat = reorderCombat(combat);
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

  let nextIndex = combat.activeTurnIndex;
  for (let offset = 1; offset <= combat.turnOrder.length; offset += 1) {
    const candidateIndex = (combat.activeTurnIndex + offset) % combat.turnOrder.length;
    if (isActorAlive(combat, combat.turnOrder[candidateIndex])) {
      nextIndex = candidateIndex;
      break;
    }
  }
  const nextActor = combat.turnOrder[nextIndex];
  const nextTurn = nextIndex <= combat.activeTurnIndex ? combat.turn + 1 : combat.turn;
  let next: CombatState = {
    ...combat,
    activeTurnIndex: nextIndex,
    turn: nextTurn,
  };

  if (nextActor.kind === "player") {
    const derived = getDerivedStats(character);
    const playerStatusesBeforeStart = next.playerStatuses;
    const playerTurnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", nextIndex, nextTurn, false, next.playerStatuses, next.energy);
    const playerStart = processTurnStart(next.playerHp, next.playerMaxHp, next.playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier);
    const regeneratedEnergy = Math.min(next.maxEnergy, next.energy + getEnergyRegeneration(derived.energyRegen, playerStart.statuses));
    next = {
      ...next,
      playerHp: playerStart.hp,
      playerStatuses: playerStart.statuses,
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
      playerTurnEffect.playerStatuses = preserveBarrierUntilDamageEvent(next.playerStatuses, playerStatusesBeforeStart, pendingEffects, "player");
      playerTurnEffect.energy = regeneratedEnergy;
    }
    if (playerStart.skipTurn) {
      const skipped = moveToNextActor({ ...next, activeTurnIndex: nextIndex, turn: nextTurn, playerStatuses: decrementStatusDurations(next.playerStatuses) }, character, logs, events, pendingEffects);
      return { ...skipped, activeTurnIndex: combat.activeTurnIndex, turn: combat.turn };
    }
  } else {
    queueTurn(events, pendingEffects, `${nextActor.name}'s turn.`, nextIndex, nextTurn, undefined, next.playerStatuses);
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
      const targetMode = effect.target ?? (effect.type === "heal" || effect.type === "gain_energy" || effect.type === "gain_guard" ? "self" : "target");
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
          const incoming = baseDamage <= 0 ? 0 : Math.max(1, Math.round(baseDamage * getIncomingDamageMultiplier(playerStatuses, effect.damageType)));
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
              const recoil = Math.max(1, Math.round(damage * 0.5));
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
        const status = { ...effect.status, sourcePower, sourceId: effect.status.sourceId ?? ("player" as const) };
        if (targetMode === "self") {
          playerStatuses = addOrRefreshStatus(playerStatuses, status);
          logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
          queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status);
        } else {
          enemyTargets.forEach((target) => {
            enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, status) } : enemy);
            logs.push(makeLog(`${target.name} gains ${status.name}.`, statusInfo(status)));
            queueStatus(events, pendingEffects, `${target.name} gains ${status.name}.`, target.instanceId, status);
          });
        }
      }

      if (effect.type === "heal") {
        const amount = Math.max(0, Math.round(effect.amount * derived.healingReceivedMultiplier));
        playerHp = Math.min(combat.playerMaxHp, playerHp + amount);
        logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
        events.push(`You recover ${amount} Health.`);
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
  if (!ability || combat.outcome !== "active" || activeActor?.kind !== "player" || remainingCooldown > 0 || ability.energyCost > combat.energy) return combat;
  const derived = getDerivedStats(character);
  const abilityModifiers = getCharacterAbilityModifiers(character, ability.id);
  let enemies = normalizeEnemies(combat.enemies);
  const displayedEnemyHp = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.hp]));
  const displayedEnemyStatuses = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.statuses]));
  const displayedPlayerHp = combat.playerHp;
  const displayedPlayerStatuses = combat.playerStatuses;
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
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
  let energy = combat.energy - ability.energyCost;
  let abilityCooldowns = ability.cooldownTurns
    ? { ...(combat.abilityCooldowns ?? {}), [ability.id]: ability.cooldownTurns }
    : (combat.abilityCooldowns ?? {});
  const abilityInfo: InspectableInfo = { title: ability.name, description: `${ability.description} Costs ${ability.energyCost} Energy.`, category: "ability" };
  logs.push(makeLog(`You use ${ability.name}.`, abilityInfo));
  events.push(`You use ${ability.name}.`);
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
    } else if (ability.effect && isStatusEffectId(ability.effect)) {
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
        queueStatus(events, pendingEffects, `You spread ${statusLabel} to ${destination.name}.`, destination.instanceId, copiedStatus);
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
        continue;
      }
      if (ability.dealsDamage === false) {
        const statusId = ability.effect === "stun" ? "stunned" : ability.effect;
        if (statusId && isStatusEffectId(statusId) && statusId !== "guard") {
          const status = createPlayerAppliedStatus(statusId, derived, { duration: effectiveStatusDuration, stacks: ability.statusStacks, magnitude: effectiveStatusMagnitude, expiresAtTurnStart: effectiveStatusExpiresAtTurnStart });
          const stunned = status.id === "stunned";
          const consumedStatusId = ability.consumeTargetStatus;
          const followUp = abilityModifiers.find((modifier) => modifier.applyStatusAfterConsume)?.applyStatusAfterConsume;
          const followUpStatus = followUp ? createPlayerAppliedStatus(followUp.status, derived, { stacks: followUp.stacks, duration: followUp.duration }) : null;
          enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? {
            ...enemy,
            stunned: stunned || enemy.stunned,
            statuses: addOrRefreshStatus(
              consumedStatusId ? enemy.statuses.filter((existing) => existing.id !== consumedStatusId) : enemy.statuses,
              status,
            ).concat(followUpStatus ? [followUpStatus] : []),
          } : enemy);
          logs.push(makeLog(`${target.name} gains ${status.name}.`, statusInfo(status)));
          const statusText = followUpStatus
            ? `${target.name} is ${status.name} and gains ${followUpStatus.stacks} ${followUpStatus.name}.`
            : `${target.name} gains ${status.name}.`;
          const statusEventIndex = events.length;
          events.push(statusText);
          queueStatus(events, pendingEffects, statusText, target.instanceId, status, stunned, statusEventIndex);
          if (consumedStatusId) queueStatusRemoval(pendingEffects, statusEventIndex, target.instanceId, consumedStatusId);
          if (followUpStatus) queueStatus(events, pendingEffects, statusText, target.instanceId, followUpStatus, false, statusEventIndex);
        }
        continue;
      }
      if (!rollHit(derived.hitChance, target.dodgeChance)) {
        logs.push(makeLog(`${ability.name} misses ${target.name}.`, abilityInfo));
        queueDamage(events, pendingEffects, `It misses ${target.name}.`, target.instanceId, 0, "player");
        continue;
      }
      const critical = Math.random() < derived.critChance + getCriticalChanceBonus(playerStatuses) + (ability.critChanceBonus ?? 0);
      const damageComponents = ability.damageComponents ?? [{ damageType: ability.damageType ?? "physical", power: ability.power, powerScaling: effectivePowerScaling }];
      const incomingDamage = damageComponents.reduce((total, component) => {
        const offensivePower = getOffensivePower(derived, component.damageType);
        const defense = getDefense(target.armor, target.magicResistance, target.statuses, component.damageType);
        const raw = (component.power ?? 0) + offensivePower * (component.powerScaling ?? 1);
        const talentDamageMultiplier = getCharacterDamageMultiplier(character, playerStatuses, target.statuses, component.damageType);
        const abilityDamageMultiplier = getDamageModifierMultiplier(ability.damageModifiers ?? [], playerStatuses, target.statuses, component.damageType);
        return total + getModifiedDamage(Math.max(1, Math.round((raw - defense) * (critical ? 1.6 : 1) * talentDamageMultiplier * abilityDamageMultiplier)), playerStatuses, target.statuses, component.damageType);
      }, 0);
      const absorption = absorbIncomingDamage(target.statuses, incomingDamage);
      const damage = absorption.damage;
      const targetHpBeforePercent = target.hp / target.maxHp;
      enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage), statuses: wakeFromDamage(absorption.statuses, damage) } : enemy);
      const damagedTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
      logs.push(makeLog(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`, abilityInfo));
      const strikeLabel = totalHits > 1 ? `Strike ${hitIndex + 1} deals` : "It deals";
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage to ${target.name}${absorptionSuffix(absorption.absorbed)}.`, target.instanceId, damage, "player");
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
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, status) } : enemy);
        logs.push(makeLog(`${target.name} gains ${status.name}.`, statusInfo(status)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}${strikeLabel} ${damage} damage${absorptionSuffix(absorption.absorbed)} and applies ${status.name}.`;
        queueStatus(events, pendingEffects, `${target.name} gains ${status.name}.`, target.instanceId, status, false, damageEventIndex);
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
      }
      if (hasStatus(playerStatuses, "reckless") && damage > 0) {
        const recoil = Math.max(1, Math.round(damage * 0.5));
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

  const bleedResult = applyBleedAfterAbility(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.bleedDamageTakenMultiplier);
  playerHp = bleedResult.hp;
  playerStatuses = bleedResult.statuses;

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    events.push("Victory.");
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, pendingEffects, damagedTargets, enemies: displayedEnemies, playerHp: ability.consumeStatusForHealing ? displayedPlayerHp : Math.max(displayedPlayerHp, playerHp), playerStatuses: displayedPlayerStatuses, energy, procUsage, abilityCooldowns, playerActed: true, attackingActorId: null, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "active" };
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
    playerHp: ability.consumeStatusForHealing ? displayedPlayerHp : Math.max(displayedPlayerHp, playerHp),
    playerStatuses: displayedPlayerStatuses,
    energy,
    procUsage,
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
  const turnEnd = processTurnEnd(combat.playerHp, combat.playerStatuses, "player", "You", logs, events, pendingEffects);
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
  const displayedPlayerHp = combat.playerHp;
  const displayedPlayerStatuses = combat.playerStatuses;
  let visiblePlayerHealing = 0;
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  let procUsage = { ...(combat.procUsage ?? {}) };
  const enemyIndex = enemies.findIndex((enemy) => enemy.instanceId === activeActor.actorId);
  if (enemyIndex < 0) return moveToNextActor(combat, character, logs, events, pendingEffects);

  const originalEnemy = enemies[enemyIndex];
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
      const incoming = getModifiedDamage(baseIncoming, enemy.statuses, playerStatuses, enemy.damageType);
      const absorption = absorbIncomingDamage(playerStatuses, incoming);
      const blocked = absorption.absorbed;
      const damage = absorption.damage;
      playerHp = Math.max(0, playerHp - damage);
      playerStatuses = wakeFromDamage(absorption.statuses, damage);
      logs.push(makeLog(`${enemy.name} uses ${attackName} for ${damage}${critical ? " critical" : ""}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage, enemy.instanceId);
      queueAbsorptionChanges(pendingEffects, damageEventIndex, "player", absorption);
      if (damage > 0 && enemy.onHitEffect === "bleed") {
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
        visiblePlayerHealing += Math.max(0, result.state.playerHp - playerHp);
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
    const enemyEnd = processTurnEnd(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, derived.statusDamageMultipliers.poison ?? 1);
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, hp: enemyEnd.hp, statuses: enemyEnd.statuses } : candidate);
  } else {
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, statuses: decrementStatusDurations(candidate.statuses) } : candidate);
  }
  nextBase = { ...nextBase, enemies, playerHp, playerStatuses, procUsage };

  const selectedEnemyId = enemies.find((candidate) => candidate.instanceId === nextBase.selectedEnemyId && isEnemyTargetable(enemies, candidate))?.instanceId
    ?? enemies.find((candidate) => isEnemyTargetable(enemies, candidate))?.instanceId
    ?? "";
  nextBase = { ...nextBase, selectedEnemyId };
  const next = moveToNextActor(nextBase, character, logs, events, pendingEffects);
  const displayedEnemies = next.enemies.map((candidate) => ({ ...candidate, hp: displayedEnemyHp.get(candidate.instanceId) ?? candidate.hp }));
  return {
    ...next,
    outcome: pendingEffects.length > 0 ? "active" : next.outcome,
    playerHp: Math.min(combat.playerMaxHp, displayedPlayerHp + visiblePlayerHealing),
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
  let attackingActorId = combat.attackingActorId;
  let attackAnimationId = combat.attackAnimationId ?? 0;
  let attackEffectId = combat.attackEffectId ?? null;
  const damagedTargets: string[] = [];
  matchingEffects.forEach((effect) => {
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
      attackingActorId = null;
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
  const outcome = playerHp <= 0 ? "defeat" : enemies.every((enemy) => enemy.hp <= 0) ? "victory" : combat.outcome;
  const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && isEnemyTargetable(enemies, enemy))?.instanceId
    ?? enemies.find((enemy) => isEnemyTargetable(enemies, enemy))?.instanceId
    ?? "";
  return reorderCombat({ ...combat, playerHp, playerStatuses, enemies, activeTurnIndex, turn, playerActed, energy, attackingActorId, attackAnimationId, attackEffectId, pendingEffects, damagedTargets, selectedEnemyId, outcome });
}

export function primeCombatAttack(combat: CombatState, eventId: number, eventIndex: number): CombatState {
  if (combat.eventId !== eventId) return combat;
  const attackEffect = (combat.pendingEffects ?? []).find((effect): effect is Extract<CombatPendingEffect, { damage: number }> => effect.eventIndex === eventIndex && "damage" in effect && Boolean(effect.attackerId));
  if (!attackEffect || combat.attackEffectId === attackEffect.id) return combat;
  return {
    ...combat,
    attackingActorId: attackEffect.attackerId ?? null,
    attackAnimationId: (combat.attackAnimationId ?? 0) + 1,
    attackEffectId: attackEffect.id,
    damagedTargets: [],
  };
}
