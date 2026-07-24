import { getDerivedStats } from "../character";
import type { CombatTriggerContext, ResolvedCombatTrigger } from "../combatFeatures";
import { resolveCharacterTriggers } from "../combatFeatures";
import {
  absorbIncomingDamage,
  addOrRefreshStatus,
  canApplyStatusEffect,
  createStatusEffect,
  decrementStatusDurations,
  getEnergyRegeneration,
  getIncomingDamageMultiplier,
  getStatusHealing,
  hasStatus
} from "../statusEffects";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, CombatTriggerEvent, EnemyState, InspectableInfo, StatusEffect, TurnOrderEntry } from "../types";
import { createPlayerAppliedStatus, createPlayerCompanionStatuses, getAfflictionDamage, getDefense, getEnergyDefenseMultiplier, getModifiedDamage, wakeFromDamage } from "./damage";
import { absorptionSuffix, makeLog, preserveBarrierUntilDamageEvent, queueAbilityVfx, queueAbsorptionChanges, queueDamage, queueDamageAtEvent, queueHeal, queueHealAtEvent, queueNextTurnEnergyRegeneration, queuePassiveAnimation, queueStatus, queueStatusReconciliation, queueStatusRemoval, queueTurn, queueTurnAtEvent, statusInfo } from "./eventQueue";
import { reorderCombat } from "./state";

export interface StatusTurnResult {
  hp: number;
  statuses: StatusEffect[];
  skipTurn: boolean;
  burnDamage: number;
  burnEventIndex: number | null;
  healing: number;
  healingEventIndex: number | null;
}

export function processTurnStart(
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

export function processTurnEnd(
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

export function applyBleedAfterAbility(
  hp: number,
  statuses: StatusEffect[],
  targetId: "player" | string,
  targetName: string,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  extraMultiplier = 1,
  armor = 0,
): { hp: number; statuses: StatusEffect[]; damage: number; eventIndex: number | null; sourceId?: string } {
  const bleed = statuses.find((status) => status.id === "bleed");
  if (!bleed) return { hp, statuses, damage: 0, eventIndex: null };
  const absorption = absorbIncomingDamage(statuses, getAfflictionDamage(bleed, statuses, extraMultiplier, armor));
  const damage = absorption.damage;
  const text = targetId === "player" ? `You take ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.` : `${targetName} takes ${damage} damage from Bleed${absorptionSuffix(absorption.absorbed)}.`;
  logs.push(makeLog(text, statusInfo(bleed)));
  const damageEventIndex = queueDamage(events, pendingEffects, text, targetId, damage, { sourceLabel: bleed.name });
  queueAbsorptionChanges(pendingEffects, damageEventIndex, targetId, absorption);
  return { hp: Math.max(0, hp - damage), statuses: wakeFromDamage(absorption.statuses, damage), damage, eventIndex: damageEventIndex, sourceId: bleed.sourceId };
}

export function isActorAlive(combat: CombatState, actor: TurnOrderEntry): boolean {
  if (actor.kind === "player") return combat.playerHp > 0;
  return Boolean(combat.enemies.find((enemy) => enemy.instanceId === actor.actorId && enemy.hp > 0));
}

export function applyPlayerDeathPrevention(
  hp: number,
  statuses: StatusEffect[],
  alreadyUsed: boolean,
  maxHp: number,
  derived: ReturnType<typeof getDerivedStats>,
  logs: CombatLogEntry[],
  events: string[],
  pendingEffects: CombatPendingEffect[],
  stealthDuration = Math.max(1, derived.deathPreventionStealthDuration),
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
    duration: stealthDuration,
    expiresAtTurnStart: false,
  });
  const text = `Panic saves you, restoring ${healing} Health and granting Stealth.`;
  logs.push(makeLog(text, { title: "Panic", description: "The first lethal hit each combat restores 20% of your maximum Health and grants Stealth until the end of your next turn.", category: "ability" }));
  const eventIndex = queueHeal(events, pendingEffects, text, "player", healing);
  queueStatus(events, pendingEffects, text, "player", stealth, false, eventIndex);
  return { hp: healing, statuses: addOrRefreshStatus(statuses, stealth), used: true, healing, healingEventIndex: eventIndex };
}

export function moveToNextActor(combat: CombatState, character: CharacterState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): CombatState {
  const completedActorId = combat.turnOrder[combat.activeTurnIndex]?.actorId;
  const actedActorIds = new Set(combat.actedActorIds ?? []);
  if (completedActorId) actedActorIds.add(completedActorId);
  combat = { ...combat, actedActorIds: [...actedActorIds], enemyActionsTaken: 0 };
  combat = reorderCombat(combat);
  const derived = getDerivedStats(character);
  const saved = applyPlayerDeathPrevention(combat.playerHp, combat.playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects, 1);
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
        { damage: playerStart.burnDamage, damageType: "fire", sourceStatusId: "burn", targetStatusIds: playerStart.statuses.map((status) => status.id), selfStatusIds: playerStart.statuses.map((status) => status.id), targetHpBeforePercent: next.playerHp / next.playerMaxHp, targetHpAfterPercent: playerStart.hp / next.playerMaxHp },
        "player",
        character,
        next,
        derived,
        { enemies: next.enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy: next.energy, abilityCooldowns: refreshedCooldowns },
        next.procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.burnEventIndex,
      )
      : { state: { enemies: next.enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy: next.energy, abilityCooldowns: refreshedCooldowns }, procUsage: next.procUsage };
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
      abilityCooldowns: startSavedTriggers.state.abilityCooldowns ?? refreshedCooldowns,
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
      playerTurnEffect.abilityCooldowns = next.abilityCooldowns;
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

export interface ProcApplicationState {
  enemies: EnemyState[];
  playerStatuses: StatusEffect[];
  playerHp: number;
  energy: number;
  abilityCooldowns?: Record<string, number>;
}

export function applyPlayerProcs(
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
        const armorScaling = derived.armor * (effect.armorScaling ?? 0);
        const triggerSource = effect.triggerAbsorbedStatus
          ? context.absorbedDamageByStatus?.[effect.triggerAbsorbedStatus] ?? 0
          : context.absorbedDamage ?? context.damage ?? 0;
        const triggerScaling = triggerSource * (effect.triggerDamageRatio ?? 0);
        const baseDamage = Math.max(0, Math.round(effect.amount + attributeScaling + powerScaling + armorScaling + triggerScaling));
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
            if (effect.vfx) queueAbilityVfx(pendingEffects, passiveEventIndex, effect.vfx, currentTarget.instanceId, "player");
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
        const requested = Math.max(0, Math.round((effect.amount + (context.damage ?? 0) * (effect.triggerDamageRatio ?? 0)) * derived.healingReceivedMultiplier));
        const amount = Math.min(combat.playerMaxHp - playerHp, requested);
        if (amount > 0) {
          playerHp += amount;
          logs.push(makeLog(`${proc.name} restores ${amount} Health.`, procInfo));
          markPassive("player", proc.name);
          queueHealAtEvent(pendingEffects, passiveEventIndex, "player", amount);
        }
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
        const amount = Math.max(1, Math.round((effect.amount ?? 0) + power * (effect.scaling ?? 0) + (context.damage ?? 0) * (effect.triggerDamageRatio ?? 0)));
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

export function runPlayerTriggerEvent(
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

export function applySmiteRetribution(
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

export function runPlayerTriggerEvents(
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

export function runDeathPreventionHealingTriggers(
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
