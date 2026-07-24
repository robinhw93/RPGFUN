import { getDerivedStats } from "../character";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers, getCharacterDamageMultiplier, getCharacterStatusDamageMultiplier, getDamageModifierMultiplier } from "../combatFeatures";
import { getEffectiveDodgeChance, rollHit } from "../combatMath";
import { ABILITIES } from "../data";
import {
  absorbIncomingDamage,
  addOrRefreshStatus,
  canApplyStatusEffect,
  createStatusEffect,
  DEFAULT_STATUS_DURATION,
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getEnergyRegeneration,
  getHitChanceMultiplier,
  grantDiminishingReturnsAfterStun,
  hasStatus,
  isStatusEffectId
} from "../statusEffects";
import type { Ability, CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, CombatTriggerEvent, InspectableInfo, StatusEffect, StatusEffectId } from "../types";
import { applyAbilityPowerScalingTotals, createPlayerAppliedStatus, createPlayerCompanionStatuses, getAfflictionDamage, getDefense, getEnergyDefenseMultiplier, getModifiedDamage, getOffensivePower, wakeFromDamage } from "./damage";
import { absorptionSuffix, getAbilityAttackPresentation, makeLog, preserveBarrierUntilDamageEvent, queueAbilityVfx, queueAbsorptionChanges, queueDamage, queueDamageAtEvent, queueHeal, queueHealAtEvent, queueNextTurnEnergyRegeneration, queueStatus, queueStatusReconciliation, queueStatusRemoval, queueStatusSet, queueTurn, statusInfo } from "./eventQueue";
import { applyBleedAfterAbility, applyPlayerDeathPrevention, moveToNextActor, processTurnEnd, processTurnStart, runDeathPreventionHealingTriggers, runPlayerTriggerEvent, runPlayerTriggerEvents } from "./flow";
import { ensureCombatState, isEnemyStealthed, isEnemyTargetable, normalizeEnemies, orderTurnEntries } from "./state";

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
  const baseEffectivePowerScaling = selfRequirementMissing
    ? abilityModifiers.find((modifier) => modifier.powerScalingWhenRequirementMissing !== undefined)?.powerScalingWhenRequirementMissing ?? ability.powerScaling
    : ability.powerScaling;
  const powerScalingBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.powerScalingBonus ?? 0), 0);
  const primaryArmorScalingBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.armorScalingBonus ?? 0), 0);
  const primaryPowerSourceOverride = [...abilityModifiers].reverse().find((modifier) => modifier.powerSourceOverride)?.powerSourceOverride;
  const abilityCriticalChanceBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.critChanceBonus ?? 0), 0);
  const effectiveStatusDuration = abilityModifiers.find((modifier) => modifier.statusDuration !== undefined)?.statusDuration ?? ability.statusDuration;
  const effectiveStatusMagnitude = abilityModifiers.find((modifier) => modifier.statusMagnitude !== undefined)?.statusMagnitude ?? ability.statusMagnitude;
  const effectiveStatusExpiresAtTurnStart = abilityModifiers.find((modifier) => modifier.statusExpiresAtTurnStart !== undefined)?.statusExpiresAtTurnStart ?? ability.statusExpiresAtTurnStart;
  const effectiveStatusStackPowerScaling = [...abilityModifiers].reverse().find((modifier) => modifier.statusStackPowerScaling)?.statusStackPowerScaling ?? ability.statusStackPowerScaling;
  const staticStatusStacksOverride = [...abilityModifiers].reverse().find((modifier) => modifier.statusStacks !== undefined)?.statusStacks;
  const effectiveStatusStacks = effectiveStatusStackPowerScaling
    ? Math.max(1, Math.round((effectiveStatusStackPowerScaling.power === "magical" ? derived.magicalPower : derived.physicalPower) * effectiveStatusStackPowerScaling.scaling))
    : staticStatusStacksOverride ?? ability.statusStacks;
  const effectiveStatusApplications = [
    ...(ability.statusApplications ?? []),
    ...abilityModifiers.flatMap((modifier) => modifier.additionalStatusApplications ?? []),
  ].map((application, index) => index === 0 && staticStatusStacksOverride !== undefined
    ? { ...application, stacks: staticStatusStacksOverride }
    : application);
  const statusApplicationReplacements = abilityModifiers.flatMap((modifier) => modifier.replaceStatusApplication ? [modifier.replaceStatusApplication] : []);
  const effectiveRandomTargetPerHit = [...abilityModifiers].reverse().find((modifier) => modifier.randomTargetPerHit !== undefined)?.randomTargetPerHit ?? ability.randomTargetPerHit;
  const targetStatusStackMultiplierBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.damagePerTargetStatusStackMultiplierDelta ?? 0), 0);
  const targetStatusStackPowerScalingBonus = abilityModifiers.reduce((total, modifier) => total + (modifier.damagePerTargetStatusStackPowerScalingDelta ?? 0), 0);
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
      if (ability.transferSelfStatusToTargetForHealing) {
        const transfer = ability.transferSelfStatusToTargetForHealing;
        const consumedStatus = playerStatuses.find((status) => status.id === transfer.status);
        if (!consumedStatus) continue;
        const statusMultiplier = derived.statusDamageMultipliers[consumedStatus.id] ?? 1;
        const potentialHealing = getAfflictionDamage(consumedStatus, playerStatuses, statusMultiplier, derived.armor, derived.magicResistance) * Math.max(1, consumedStatus.duration);
        const healing = Math.min(combat.playerMaxHp - playerHp, Math.max(0, Math.round(potentialHealing * derived.healingReceivedMultiplier)));
        const transferred = { ...consumedStatus, sourceId: "player" as const };
        const transferredStatuses = [transferred, ...createPlayerCompanionStatuses(transferred.id, derived)]
          .filter((status) => canApplyStatusEffect(target.statuses, status.id));
        playerStatuses = playerStatuses.filter((status) => status.id !== consumedStatus.id);
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? {
          ...enemy,
          statuses: transferredStatuses.reduce(addOrRefreshStatus, enemy.statuses),
        } : enemy);
        if (healing > 0) playerHp += healing;
        const eventIndex = events.length;
        const transferLabel = `${consumedStatus.stacks} ${consumedStatus.name}`;
        events.push(`You consume ${transferLabel}, recover ${healing} Health, and transfer it to ${target.name}.`);
        logs.push(makeLog(`${ability.name} consumes ${transferLabel}, restores ${healing} Health, and transfers it to ${target.name}.`, abilityInfo));
        queueStatusRemoval(pendingEffects, eventIndex, "player", consumedStatus.id);
        if (healing > 0) queueHealAtEvent(pendingEffects, eventIndex, "player", healing);
        transferredStatuses.forEach((status) => queueStatus(events, pendingEffects, `${target.name} gains ${status.name}.`, target.instanceId, status, false, eventIndex, "player"));
        if (transfer.selfVfx) queueAbilityVfx(pendingEffects, eventIndex, transfer.selfVfx, "player", "player");
        if (transfer.transferVfx) queueAbilityVfx(pendingEffects, eventIndex, transfer.transferVfx, target.instanceId, "player");
        const transferTriggers = runPlayerTriggerEvents(
          ["status_removed", ...(transferredStatuses.length > 0 ? ["status_applied" as const] : []), ...(healing > 0 ? ["health_restored" as const] : [])],
          {
            abilityId: ability.id,
            abilityBranch: ability.branch,
            damage: healing,
            healthRestored: healing,
            removedStatusIds: [consumedStatus.id],
            removalReason: "consumed",
            appliedStatusIds: transferredStatuses.map((status) => status.id),
            targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [],
            selfStatusIds: playerStatuses.map((status) => status.id),
          },
          target.instanceId,
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
        procUsage = transferTriggers.procUsage;
        ({ enemies, playerStatuses, playerHp, energy } = transferTriggers.state);
        abilityCooldowns = transferTriggers.state.abilityCooldowns ?? abilityCooldowns;
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
          if (ability.vfx) {
            if (groupedAreaApplication && ability.areaVfxPerTarget) affectedTargets.forEach((affectedTarget) => queueAbilityVfx(pendingEffects, statusEventIndex, ability.vfx!, affectedTarget.instanceId, "player"));
            else queueAbilityVfx(pendingEffects, statusEventIndex, ability.vfx, groupedAreaApplication ? undefined : target.instanceId, "player");
          }
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
      const critical = forceCritical || Math.random() < derived.critChance + getCriticalChanceBonus(playerStatuses) + (ability.critChanceBonus ?? 0) + abilityCriticalChanceBonus + conditionalCritBonus;
      const consumedStatusForDamage = ability.consumeTargetStatusForDamage
        ? target.statuses.find((status) => status.id === ability.consumeTargetStatusForDamage!.status)
        : undefined;
      const statusBasedDamage: NonNullable<Ability["damageComponents"]> | undefined = ability.damageFromSelfStatusStacks
        ? [{
          damageType: ability.damageFromSelfStatusStacks.damageType,
          power: (playerStatuses.find((status) => status.id === ability.damageFromSelfStatusStacks!.status)?.stacks ?? 0) * ability.damageFromSelfStatusStacks.multiplier,
        }]
        : undefined;
      const usesDynamicDamageScaling = Boolean(ability.consumeTargetStatusForDamage && consumedStatusForDamage) || Boolean(statusBasedDamage);
      const baseDamageComponents = ability.consumeTargetStatusForDamage && consumedStatusForDamage
        ? [{
          damageType: ability.consumeTargetStatusForDamage.damageType,
          powerScaling: ability.consumeTargetStatusForDamage.powerScalingPerStack * consumedStatusForDamage.stacks,
        }]
        : statusBasedDamage ?? ability.damageComponents ?? [{ damageType: ability.damageType ?? "physical", power: ability.power, powerScaling: baseEffectivePowerScaling }];
      const editorScaledDamageComponents = usesDynamicDamageScaling || (selfRequirementMissing && baseEffectivePowerScaling !== ability.powerScaling)
        ? baseDamageComponents
        : applyAbilityPowerScalingTotals(ability, baseDamageComponents);
      const targetStatusStackCount = ability.damagePerTargetStatusStack
        ? target.statuses.find((status) => status.id === ability.damagePerTargetStatusStack!.status)?.stacks ?? 0
        : 0;
      const targetStatusStackPowerScaling = ability.damagePerTargetStatusStack
        ? targetStatusStackCount * ((ability.damagePerTargetStatusStack.powerScaling ?? 0) + targetStatusStackPowerScalingBonus)
        : 0;
      const damageComponents = editorScaledDamageComponents.map((component, componentIndex) => componentIndex === 0 ? {
        ...component,
        powerScaling: (powerScalingBonus !== 0 && !usesDynamicDamageScaling) || targetStatusStackPowerScaling !== 0
          ? (component.powerScaling ?? 1) + (usesDynamicDamageScaling ? 0 : powerScalingBonus) + targetStatusStackPowerScaling
          : component.powerScaling,
        armorScaling: (component.armorScaling ?? 0) + primaryArmorScalingBonus,
        powerSource: primaryPowerSourceOverride ?? component.powerSource,
      } : component);
      const targetStatusStackMultiplier = ability.damagePerTargetStatusStack
        ? 1 + targetStatusStackCount * ((ability.damagePerTargetStatusStack.multiplier ?? 0) + targetStatusStackMultiplierBonus)
        : 1;
      const baseIncomingDamage = damageComponents.reduce((total, component) => {
        const offensivePower = component.powerSource === "magical" ? derived.magicalPower
          : component.powerSource === "physical" ? derived.physicalPower
            : getOffensivePower(derived, component.damageType);
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
            const statusDamageTriggers = runPlayerTriggerEvents(
              ["status_damage", "damage_dealt"],
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
      const targetStatusHealing = ability.selfHealPerTargetStatusStack
        ? (target.statuses.find((status) => status.id === ability.selfHealPerTargetStatusStack!.status)?.stacks ?? 0) * ability.selfHealPerTargetStatusStack.multiplier
        : 0;
      if (effectiveSelfHealPercentMaxHp > 0 || targetStatusHealing > 0) {
        const requestedHealing = combat.playerMaxHp * effectiveSelfHealPercentMaxHp + targetStatusHealing;
        restoredHealth = Math.min(combat.playerMaxHp - playerHp, Math.max(1, Math.round(requestedHealing * derived.healingReceivedMultiplier)));
        if (restoredHealth > 0) {
          playerHp += restoredHealth;
          logs.push(makeLog(`${ability.name} restores ${restoredHealth} Health.`, abilityInfo));
          queueHealAtEvent(pendingEffects, damageEventIndex, "player", restoredHealth);
          if (ability.selfHealPerTargetStatusStack?.vfx) queueAbilityVfx(pendingEffects, damageEventIndex, ability.selfHealPerTargetStatusStack.vfx, "player", target.instanceId);
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

      if (ability.consumeTargetStatusForOtherEnemiesDamage) {
        const area = ability.consumeTargetStatusForOtherEnemiesDamage;
        const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
        const consumed = currentTarget?.statuses.find((status) => status.id === area.status);
        if (consumed) {
          enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId
            ? { ...enemy, statuses: enemy.statuses.filter((status) => status.id !== consumed.id) }
            : enemy);
          queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, consumed.id);
          const statusDamageMultiplier = consumed.sourceId === "player"
            ? (derived.statusDamageMultipliers[consumed.id] ?? 1) * getCharacterStatusDamageMultiplier(character, consumed.id, playerStatuses)
            : 1;
          enemies.filter((enemy) => enemy.hp > 0 && enemy.instanceId !== target.instanceId).forEach((destination) => {
            const rawDamage = getAfflictionDamage(consumed, destination.statuses, statusDamageMultiplier, destination.armor, destination.magicResistance)
              * Math.max(1, consumed.duration);
            const areaAbsorption = absorbIncomingDamage(destination.statuses, rawDamage);
            const areaDamage = areaAbsorption.damage;
            enemies = enemies.map((enemy) => enemy.instanceId === destination.instanceId ? {
              ...enemy,
              hp: Math.max(0, enemy.hp - areaDamage),
              statuses: wakeFromDamage(areaAbsorption.statuses, areaDamage),
            } : enemy);
            logs.push(makeLog(`${ability.name} detonates ${consumed.name} for ${areaDamage} damage against ${destination.name}${absorptionSuffix(areaAbsorption.absorbed)}.`, abilityInfo));
            queueDamageAtEvent(pendingEffects, damageEventIndex, destination.instanceId, areaDamage, consumed.name);
            queueAbsorptionChanges(pendingEffects, damageEventIndex, destination.instanceId, areaAbsorption);
            if (area.vfx) queueAbilityVfx(pendingEffects, damageEventIndex, area.vfx, destination.instanceId, target.instanceId);
            if (areaDamage > 0) {
              const damageTriggers = runPlayerTriggerEvent(
                "damage_dealt",
                { abilityId: ability.id, abilityBranch: ability.branch, damage: areaDamage, damageType: area.damageType, sourceStatusId: consumed.id, sourceKind: "player", targetStatusIds: destination.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
                destination.instanceId,
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
              procUsage = damageTriggers.procUsage;
              ({ enemies, playerStatuses, playerHp, energy } = damageTriggers.state);
              abilityCooldowns = damageTriggers.state.abilityCooldowns ?? abilityCooldowns;
            }
          });
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

      if (ability.removeAllTargetBuffs) {
        const currentTarget = enemies.find((enemy) => enemy.instanceId === target.instanceId);
        const removedBuffs = currentTarget?.statuses.filter((status) => status.kind === "buff") ?? [];
        if (removedBuffs.length > 0) {
          enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId
            ? { ...enemy, statuses: enemy.statuses.filter((status) => status.kind !== "buff") }
            : enemy);
          removedBuffs.forEach((status) => queueStatusRemoval(pendingEffects, damageEventIndex, target.instanceId, status.id));
          const removedTriggers = runPlayerTriggerEvent(
            "status_removed",
            { removedStatusIds: removedBuffs.map((status) => status.id), removalReason: "consumed", targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [], selfStatusIds: playerStatuses.map((status) => status.id) },
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
        "damage_dealt",
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

  const playerHpBeforeBleed = playerHp;
  const bleedResult = applyBleedAfterAbility(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.bleedDamageTakenMultiplier * getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor);
  playerHp = bleedResult.hp;
  playerStatuses = bleedResult.statuses;
  if (bleedResult.damage > 0 && bleedResult.eventIndex !== null) {
    const bleedTakenTriggers = runPlayerTriggerEvent(
      "damage_taken",
      { damage: bleedResult.damage, damageType: "physical", sourceStatusId: "bleed", sourceKind: bleedResult.sourceId === "player" ? "player" : "enemy", targetStatusIds: playerStatuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id), targetHpBeforePercent: playerHpBeforeBleed / combat.playerMaxHp, targetHpAfterPercent: playerHp / combat.playerMaxHp },
      bleedResult.sourceId ?? "player",
      character,
      combat,
      derived,
      { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
      procUsage,
      logs,
      events,
      pendingEffects,
      bleedResult.eventIndex,
    );
    procUsage = bleedTakenTriggers.procUsage;
    ({ enemies, playerStatuses, playerHp, energy } = bleedTakenTriggers.state);
    abilityCooldowns = bleedTakenTriggers.state.abilityCooldowns ?? abilityCooldowns;
  }
  const saved = applyPlayerDeathPrevention(playerHp, playerStatuses, combat.deathPreventionUsed, combat.playerMaxHp, derived, logs, events, pendingEffects, ability.grantsImmediateTurn ? 1 : Math.max(1, derived.deathPreventionStealthDuration));
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
    const hpBeforePoison = playerHp;
    const poisonSource = playerStatuses.find((status) => status.id === "poison")?.sourceId;
    const poisonEventIndex = events.length;
    const turnEnd = processTurnEnd(playerHp, playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor, derived.magicResistance);
    playerHp = turnEnd.hp;
    playerStatuses = turnEnd.statuses;
    if (turnEnd.poisonDamage > 0) {
      const poisonTakenTriggers = runPlayerTriggerEvent(
        "damage_taken",
        { damage: turnEnd.poisonDamage, damageType: "spell", sourceStatusId: "poison", sourceKind: poisonSource === "player" ? "player" : "enemy", targetStatusIds: playerStatuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id), targetHpBeforePercent: hpBeforePoison / combat.playerMaxHp, targetHpAfterPercent: playerHp / combat.playerMaxHp },
        poisonSource ?? "player",
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy, abilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        poisonEventIndex,
      );
      procUsage = poisonTakenTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = poisonTakenTriggers.state);
      abilityCooldowns = poisonTakenTriggers.state.abilityCooldowns ?? abilityCooldowns;
    }
    const refreshedCooldowns = Object.fromEntries(
      Object.entries(abilityCooldowns)
        .map(([id, turns]) => [id, Math.max(0, turns - 1)] as const)
        .filter(([, turns]) => turns > 0),
    );
    const turnEventIndex = events.length;
    queueTurn(events, pendingEffects, "Your turn.", combat.activeTurnIndex, combat.turn + 1, false, playerStatuses, energy, 0, refreshedCooldowns, "player");
    abilityCooldowns = refreshedCooldowns;
    if (ability.immediateTurnVfx) queueAbilityVfx(pendingEffects, turnEventIndex, ability.immediateTurnVfx, "player", "player");
    const statusesBeforeStart = playerStatuses;
    const playerStart = processTurnStart(playerHp, combat.playerMaxHp, playerStatuses, "player", "You", logs, events, pendingEffects, derived.healingReceivedMultiplier, getEnergyDefenseMultiplier(derived, energy, playerStatuses), derived.armor, derived.magicResistance, derived.statusDamageMultipliers.burn ?? 1);
    if (playerStart.burnDamage > 0 && playerStart.burnEventIndex !== null) {
      const burnTriggers = runPlayerTriggerEvent(
        "damage_taken",
        { damage: playerStart.burnDamage, damageType: "fire", sourceStatusId: "burn", targetStatusIds: playerStart.statuses.map((status) => status.id), selfStatusIds: playerStart.statuses.map((status) => status.id), targetHpBeforePercent: playerHp / combat.playerMaxHp, targetHpAfterPercent: playerStart.hp / combat.playerMaxHp },
        "player",
        character,
        combat,
        derived,
        { enemies, playerStatuses: playerStart.statuses, playerHp: playerStart.hp, energy, abilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        playerStart.burnEventIndex,
      );
      procUsage = burnTriggers.procUsage;
      ({ enemies, playerStatuses, playerHp, energy } = burnTriggers.state);
      abilityCooldowns = burnTriggers.state.abilityCooldowns ?? abilityCooldowns;
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
  const poisonEventIndex = events.length;
  const turnEnd = processTurnEnd(combat.playerHp, combat.playerStatuses, "player", "You", logs, events, pendingEffects, 1, getEnergyDefenseMultiplier(derived, combat.energy, combat.playerStatuses), derived.armor, derived.magicResistance);
  let playerHp = turnEnd.hp;
  let playerStatuses = turnEnd.statuses;
  let energy = combat.energy;
  let abilityCooldowns = combat.abilityCooldowns;
  let procUsage = { ...(combat.procUsage ?? {}) };
  if (turnEnd.poisonDamage > 0) {
    const poisonTakenTriggers = runPlayerTriggerEvent(
      "damage_taken",
      { damage: turnEnd.poisonDamage, damageType: "spell", sourceStatusId: "poison", sourceKind: combat.playerStatuses.find((status) => status.id === "poison")?.sourceId === "player" ? "player" : "enemy", targetStatusIds: playerStatuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id), targetHpBeforePercent: combat.playerHp / combat.playerMaxHp, targetHpAfterPercent: playerHp / combat.playerMaxHp },
      "player",
      character,
      combat,
      derived,
      { enemies: combat.enemies, playerStatuses, playerHp, energy, abilityCooldowns },
      procUsage,
      logs,
      events,
      pendingEffects,
      poisonEventIndex,
    );
    procUsage = poisonTakenTriggers.procUsage;
    playerHp = poisonTakenTriggers.state.playerHp;
    playerStatuses = poisonTakenTriggers.state.playerStatuses;
    energy = poisonTakenTriggers.state.energy;
    abilityCooldowns = poisonTakenTriggers.state.abilityCooldowns ?? abilityCooldowns;
  }
  if (events.length > 0) {
    queueStatusReconciliation(pendingEffects, events.length - 1, "player", combat.playerStatuses, playerStatuses);
  }
  const next = moveToNextActor({ ...combat, playerHp, playerStatuses, energy, abilityCooldowns, procUsage }, character, logs, events, pendingEffects);
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
