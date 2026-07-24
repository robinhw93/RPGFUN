import { getDerivedStats } from "../character";
import { getCharacterStatusDamageMultiplier } from "../combatFeatures";
import { getEffectiveDodgeChance, rollHit } from "../combatMath";
import {
  absorbIncomingDamage,
  addOrRefreshStatus,
  canApplyStatusEffect,
  createStatusEffect,
  decrementStatusDurations,
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getEnergyRegeneration,
  getHitChanceMultiplier,
  hasStatus
} from "../statusEffects";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, EnemyAbilityDefinition, EnemyState, InspectableInfo, StatusEffectId } from "../types";
import { getDefense, getEnergyDefenseMultiplier, getModifiedDamage, wakeFromDamage } from "./damage";
import { absorptionSuffix, makeLog, queueAbilityVfx, queueAbsorptionChanges, queueDamage, queueHeal, queueStatus, queueStatusReconciliation, statusInfo } from "./eventQueue";
import { applyBleedAfterAbility, moveToNextActor, processTurnEnd, processTurnStart, runPlayerTriggerEvent, runPlayerTriggerEvents } from "./flow";
import { ensureCombatState, isEnemyTargetable, normalizeEnemies } from "./state";

export function getReadyEnemyAbility(enemy: EnemyState): EnemyAbilityDefinition | undefined {
  const ready = (ability: EnemyAbilityDefinition) => enemy.energy >= ability.energyCost && (enemy.abilityCooldowns[ability.id] ?? 0) <= 0;
  const byName = (name: string) => enemy.abilities.find((ability) => ability.name === name && ready(ability));
  if (enemy.behavior === "rabid_rat") {
    if (!enemy.behaviorPhase) return byName("Bite") ?? byName("Scurry");
    if (enemy.behaviorPhase === "rabid") return byName("Rabid Bite") ?? byName("Scurry");
    return byName("Bite") ?? byName("Scurry");
  }
  if (enemy.behavior === "brown_bear") {
    if (!enemy.behaviorPhase) return byName("Roar") ?? byName("Maul") ?? byName("Hibernate");
    return byName("Maul") ?? (enemy.energy === 0 ? byName("Hibernate") : undefined) ?? byName("Roar");
  }
  if (enemy.behavior === "forest_spirit") {
    if (!hasStatus(enemy.statuses, "stealth")) {
      const fade = byName("Fade Out");
      if (fade) return fade;
    }
    return enemy.behaviorPhase === "nature"
      ? byName("Burning Glare") ?? byName("Nature's Beam") ?? byName("Shimmer")
      : byName("Nature's Beam") ?? byName("Burning Glare") ?? byName("Shimmer");
  }
  return enemy.abilities.find(ready);
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
  let playerAbilityCooldowns = combat.abilityCooldowns;
  let procUsage = { ...(combat.procUsage ?? {}) };
  const enemyIndex = enemies.findIndex((enemy) => enemy.instanceId === activeActor.actorId);
  if (enemyIndex < 0) return moveToNextActor(combat, character, logs, events, pendingEffects);

  const originalEnemy = enemies[enemyIndex];
  const continuingEnemyTurn = (combat.enemyActionsTaken ?? 0) > 0;
  let statusResolutionEventIndex: number | null = null;
  const enemyStart = continuingEnemyTurn
    ? { hp: originalEnemy.hp, statuses: originalEnemy.statuses, burnDamage: 0, burnEventIndex: null, skipTurn: false }
    : processTurnStart(
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
  const abilityCooldowns = continuingEnemyTurn
    ? originalEnemy.abilityCooldowns ?? {}
    : Object.fromEntries(Object.entries(originalEnemy.abilityCooldowns ?? {}).map(([id, turns]) => [id, Math.max(0, turns - 1)]));
  const regeneratedEnergy = continuingEnemyTurn
    ? originalEnemy.energy
    : Math.min(originalEnemy.maxEnergy, originalEnemy.energy + getEnergyRegeneration(originalEnemy.energyRegen + (originalEnemy.nextTurnEnergyRegenBonus ?? 0), enemyStart.statuses));
  let enemy = {
    ...originalEnemy,
    hp: enemyStart.hp,
    statuses: enemyStart.statuses,
    energy: regeneratedEnergy,
    stunned: false,
    abilityCooldowns,
    nextTurnEnergyRegenBonus: continuingEnemyTurn ? originalEnemy.nextTurnEnergyRegenBonus : 0,
  };
  enemies[enemyIndex] = enemy;
  const sourceBurn = originalEnemy.statuses.find((status) => status.id === "burn");
  if (enemyStart.burnDamage > 0 && enemyStart.burnEventIndex !== null && sourceBurn?.sourceId === "player") {
    const burnTriggers = runPlayerTriggerEvents(
      ["status_damage", "damage_dealt"],
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
      { enemies, playerStatuses, playerHp, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns },
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
    playerAbilityCooldowns = burnTriggers.state.abilityCooldowns ?? playerAbilityCooldowns;
    enemy = enemies.find((candidate) => candidate.instanceId === originalEnemy.instanceId) ?? enemy;
  }
  let nextBase: CombatState = { ...combat, enemies, playerHp, playerStatuses, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns };
  const enemyAbility = getReadyEnemyAbility(enemy);
  let usedAbility = false;

  if (enemy.hp <= 0) {
    logs.push(makeLog(`${enemy.name} falls.`));
    events.push(`${enemy.name} falls.`);
  } else if (enemyStart.skipTurn) {
    // The status event queued above explains why this actor cannot act.
  } else if (enemy.abilities.length === 0) {
    logs.push(makeLog(`${enemy.name} waits.`));
    events.push(`${enemy.name} waits.`);
  } else if (!enemyAbility) {
    logs.push(makeLog(`${enemy.name} gathers Energy.`));
    events.push(`${enemy.name} gathers Energy.`);
  } else if (hasStatus(playerStatuses, "stealth") && (enemyAbility.damageType || (enemyAbility.statusApplications?.length ?? 0) > 0)) {
    const stealth = playerStatuses.find((status) => status.id === "stealth")!;
    logs.push(makeLog(`${enemy.name} cannot target you while you are in Stealth.`, statusInfo(stealth)));
    events.push(`${enemy.name} cannot find you through Stealth.`);
  } else {
    usedAbility = true;
    const abilityHits = enemyAbility.hits ?? 1;
    const rolledPowerScaling = enemyAbility.powerScalingRange
      ? enemyAbility.powerScalingRange.min + Math.random() * (enemyAbility.powerScalingRange.max - enemyAbility.powerScalingRange.min)
      : 0;
    const rolledPower = enemyAbility.powerScalingRange?.power === "physical" ? enemy.physicalPower : enemy.spellPower;
    const enemyAbilityPower = (enemyAbility.baseDamage ?? 0)
      + enemy.physicalPower * (enemyAbility.physicalPowerScaling ?? 0)
      + enemy.spellPower * (enemyAbility.spellPowerScaling ?? 0)
      + rolledPower * rolledPowerScaling;
    const enemyAttackInfo: InspectableInfo = { title: enemyAbility.name, description: enemyAbility.description, category: "ability" };
    const abilityEventIndex = events.length;
    events.push(`${enemy.name} uses ${enemyAbility.name}.`);
    const playerDodgeChance = getEffectiveDodgeChance(derived.dodgeChance, getDodgeChanceBonus(playerStatuses));
    const successfulHits = enemyAbility.damageType
      ? Array.from({ length: abilityHits }, () => rollHit(enemy.hitChance * getHitChanceMultiplier(enemy.statuses), playerDodgeChance)).filter(Boolean).length
      : 0;
    if (!enemyAbility.damageType) {
      logs.push(makeLog(`${enemy.name} uses ${enemyAbility.name}.`, enemyAttackInfo));
      (enemyAbility.statusApplications ?? []).forEach((application) => {
        if (derived.statusImmunities.includes(application.status) || Math.random() >= (application.chance ?? 1)) return;
        const status = createStatusEffect(application.status, { stacks: application.stacks, duration: application.duration, sourcePower: enemy.physicalPower + enemy.spellPower, sourceId: enemy.instanceId });
        playerStatuses = addOrRefreshStatus(playerStatuses, status);
        logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
        queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status, application.status === "stunned", abilityEventIndex);
      });
      (enemyAbility.selfStatusApplications ?? []).forEach((application) => {
        const status = createStatusEffect(application.status, { stacks: application.stacks, duration: application.duration, sourcePower: enemy.physicalPower + enemy.spellPower, sourceId: enemy.instanceId });
        enemy.statuses = addOrRefreshStatus(enemy.statuses, status);
        queueStatus(events, pendingEffects, `${enemy.name} gains ${status.name}.`, enemy.instanceId, status, application.status === "stunned", abilityEventIndex);
      });
      const isSelfUtility = (enemyAbility.selfStatusApplications?.length ?? 0) > 0
        || (enemyAbility.nextTurnEnergyRegen ?? 0) > 0
        || enemyAbility.restoreFullEnergyNextTurn === true;
      queueAbilityVfx(pendingEffects, abilityEventIndex, enemyAbility.vfx, isSelfUtility ? enemy.instanceId : "player", enemy.instanceId, true);
    } else if (successfulHits === 0) {
      logs.push(makeLog(`${enemy.name} misses you.`, enemyAttackInfo));
      queueDamage(events, pendingEffects, "You dodge the attack.", "player", 0, { attackerId: enemy.instanceId, attackRange: enemyAbility.range, attackPresentation: enemyAbility.range === "ranged" ? enemyAbility.rangedPresentation ?? "projectile" : "melee", projectileVfx: enemyAbility.vfx, projectileDamageType: enemyAbility.damageType, animationHitCount: abilityHits, missed: true });
      const missedTriggers = runPlayerTriggerEvent(
        "enemy_missed",
        { abilityId: enemyAbility.id, damageType: enemyAbility.damageType, damage: 0, sourceKind: "enemy", targetStatusIds: enemy.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
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
      const defense = getDefense(derived.armor, derived.magicResistance, playerStatuses, enemyAbility.damageType);
      const criticalChance = enemy.critChance + getCriticalChanceBonus(enemy.statuses);
      let criticalHits = 0;
      let baseIncoming = 0;
      for (let hit = 0; hit < successfulHits; hit += 1) {
        const hitCritical = Math.random() < criticalChance;
        if (hitCritical) criticalHits += 1;
        baseIncoming += Math.max(1, Math.round((enemyAbilityPower - Math.floor(defense * 0.35)) * (hitCritical ? 1.6 : 1)));
      }
      const critical = criticalHits > 0;
      const incoming = Math.max(0, Math.round(getModifiedDamage(baseIncoming, enemy.statuses, playerStatuses, enemyAbility.damageType) * getEnergyDefenseMultiplier(derived, playerEnergy, playerStatuses)));
      const absorptionStatusSources = new Map(playerStatuses
        .filter((status) => status.id === "guard" || status.id === "barrier")
        .map((status) => [status.id, status.sourceId] as const));
      const absorption = absorbIncomingDamage(playerStatuses, incoming);
      const blocked = absorption.absorbed;
      const damage = absorption.damage;
      const hpBefore = playerHp;
      playerHp = Math.max(0, playerHp - damage);
      playerStatuses = wakeFromDamage(absorption.statuses, damage);
      logs.push(makeLog(`${enemy.name} uses ${enemyAbility.name} for ${damage}${critical ? " critical" : ""}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage, { attackerId: enemy.instanceId, attackRange: enemyAbility.range, attackPresentation: enemyAbility.range === "ranged" ? enemyAbility.rangedPresentation ?? "projectile" : "melee", projectileVfx: enemyAbility.vfx, projectileDamageType: enemyAbility.damageType, animationHitCount: abilityHits });
      queueAbilityVfx(pendingEffects, damageEventIndex, enemyAbility.vfx, "player", enemy.instanceId);
      queueAbsorptionChanges(pendingEffects, damageEventIndex, "player", absorption);
      const appliedStatusIds: StatusEffectId[] = [];
      if (damage > 0) (enemyAbility.statusApplications ?? []).forEach((application) => {
        if (derived.statusImmunities.includes(application.status)) return;
        let applications = 0;
        for (let hit = 0; hit < successfulHits; hit += 1) if (Math.random() < (application.chance ?? 1)) applications += application.stacks ?? 1;
        if (applications <= 0) return;
        const status = createStatusEffect(application.status, { stacks: applications, duration: application.duration, sourcePower: enemyAbilityPower, sourceId: enemy.instanceId });
        playerStatuses = addOrRefreshStatus(playerStatuses, status);
        appliedStatusIds.push(application.status);
        logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
        queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status, application.status === "stunned", damageEventIndex);
      });
      if (appliedStatusIds.length > 0) {
        const statusApplied = runPlayerTriggerEvent(
          "status_applied",
          { appliedStatusIds, sourceKind: "enemy", targetStatusIds: enemy.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
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
          { damage, critical, absorbedDamage: absorption.absorbed, absorbedByStatusIds, depletedStatusIds, depletedStatusSourceIds, absorbedDamageByStatus: absorption.absorbedBy, sourceKind: "enemy", targetStatusIds: playerStatuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id), targetHpBeforePercent: hpBefore / combat.playerMaxHp, targetHpAfterPercent: playerHp / combat.playerMaxHp },
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
    const energyAfterAbility = Math.max(0, enemy.energy - enemyAbility.energyCost);
    if (energyAfterAbility === 0) {
      (enemyAbility.selfStatusApplicationsWhenEnergyDepleted ?? []).forEach((application) => {
        if (!canApplyStatusEffect(enemy.statuses, application.status)) return;
        const status = createStatusEffect(application.status, { stacks: application.stacks, duration: application.duration, sourcePower: enemy.physicalPower + enemy.spellPower, sourceId: enemy.instanceId });
        enemy.statuses = addOrRefreshStatus(enemy.statuses, status);
        logs.push(makeLog(`${enemy.name} gains ${status.name}.`, statusInfo(status)));
      });
    }
    enemy.nextTurnEnergyRegenBonus = enemyAbility.restoreFullEnergyNextTurn ? enemy.maxEnergy : enemy.nextTurnEnergyRegenBonus + (enemyAbility.nextTurnEnergyRegen ?? 0);
    enemy.abilityCooldowns = { ...enemy.abilityCooldowns, [enemyAbility.id]: enemyAbility.cooldownTurns };
    if (enemy.behavior === "rabid_rat") {
      if (enemyAbility.name === "Bite") enemy.behaviorPhase = "rabid";
      if (enemyAbility.name === "Rabid Bite") enemy.behaviorPhase = "bite";
    } else if (enemy.behavior === "brown_bear") enemy.behaviorPhase = "active";
    else if (enemy.behavior === "forest_spirit") {
      if (enemyAbility.name === "Nature's Beam") enemy.behaviorPhase = "nature";
      if (enemyAbility.name === "Burning Glare") enemy.behaviorPhase = "burning";
    }
    const bleedResult = applyBleedAfterAbility(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, 1, enemy.armor);
    enemy = { ...enemy, hp: bleedResult.hp, statuses: bleedResult.statuses };
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId
      ? { ...candidate, ...enemy, energy: energyAfterAbility }
      : candidate);
    if (bleedResult.damage > 0 && bleedResult.eventIndex !== null && bleedResult.sourceId === "player") {
      const bleedTriggers = runPlayerTriggerEvents(
        ["status_damage", "damage_dealt"],
        { damage: bleedResult.damage, damageType: "physical", sourceStatusId: "bleed", sourceKind: "player", targetStatusIds: enemy.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
        enemy.instanceId,
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        bleedResult.eventIndex,
      );
      procUsage = bleedTriggers.procUsage;
      enemies = bleedTriggers.state.enemies;
      playerStatuses = bleedTriggers.state.playerStatuses;
      playerHp = bleedTriggers.state.playerHp;
      playerEnergy = bleedTriggers.state.energy;
      playerAbilityCooldowns = bleedTriggers.state.abilityCooldowns ?? playerAbilityCooldowns;
    }
    nextBase = { ...nextBase, enemies, playerHp, playerStatuses, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns, procUsage };
  }

  enemy = enemies.find((candidate) => candidate.instanceId === enemy.instanceId) ?? enemy;
  const enemyActionsTaken = usedAbility ? (combat.enemyActionsTaken ?? 0) + 1 : combat.enemyActionsTaken ?? 0;
  nextBase = { ...nextBase, enemies, playerHp, playerStatuses, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns, procUsage, enemyActionsTaken };
  const nextEnemyAbility = getReadyEnemyAbility(enemy);
  const nextAbilityBlockedByStealth = Boolean(
    nextEnemyAbility
    && hasStatus(playerStatuses, "stealth")
    && (nextEnemyAbility.damageType || (nextEnemyAbility.statusApplications?.length ?? 0) > 0),
  );
  const canUseAnotherAbility = usedAbility
    && enemy.hp > 0
    && playerHp > 0
    && enemyActionsTaken < enemy.maxActionsPerTurn
    && Boolean(nextEnemyAbility)
    && !nextAbilityBlockedByStealth;

  if (canUseAnotherAbility) {
    const reconciliationEventIndex = events.length - 1;
    if (reconciliationEventIndex >= 0) {
      queueStatusReconciliation(pendingEffects, reconciliationEventIndex, originalEnemy.instanceId, originalEnemy.statuses, enemy.statuses);
    }
    const selectedEnemyId = enemies.find((candidate) => candidate.instanceId === nextBase.selectedEnemyId && isEnemyTargetable(enemies, candidate))?.instanceId
      ?? enemies.find((candidate) => isEnemyTargetable(enemies, candidate))?.instanceId
      ?? "";
    const displayedEnemies = enemies.map((candidate) => ({
      ...candidate,
      hp: displayedEnemyHp.get(candidate.instanceId) ?? candidate.hp,
      statuses: displayedEnemyStatuses.get(candidate.instanceId) ?? candidate.statuses,
    }));
    return {
      ...nextBase,
      selectedEnemyId,
      outcome: pendingEffects.length > 0 ? "active" : nextBase.outcome,
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

  if (enemy.hp > 0) {
    const hpBeforePoison = enemy.hp;
    const poisonEventIndex = events.length;
    const enemyEnd = processTurnEnd(enemy.hp, enemy.statuses, enemy.instanceId, enemy.name, logs, events, pendingEffects, derived.statusDamageMultipliers.poison ?? 1, 1, enemy.armor, enemy.magicResistance);
    if (enemy.statuses.some((status) => status.id === "poison")) statusResolutionEventIndex = poisonEventIndex;
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId ? { ...candidate, hp: enemyEnd.hp, statuses: enemyEnd.statuses } : candidate);
    const poison = enemy.statuses.find((status) => status.id === "poison");
    if (enemyEnd.poisonDamage > 0 && poison?.sourceId === "player") {
      const poisonTriggers = runPlayerTriggerEvents(
        ["status_damage", "damage_dealt"],
        { damage: enemyEnd.poisonDamage, damageType: "spell", sourceStatusId: "poison", sourceKind: "player", targetStatusIds: enemyEnd.statuses.map((status) => status.id), selfStatusIds: playerStatuses.map((status) => status.id) },
        enemy.instanceId,
        character,
        combat,
        derived,
        { enemies, playerStatuses, playerHp, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns },
        procUsage,
        logs,
        events,
        pendingEffects,
        Math.max(0, events.length - 1),
      );
      procUsage = poisonTriggers.procUsage;
      enemies = poisonTriggers.state.enemies;
      playerStatuses = poisonTriggers.state.playerStatuses;
      playerHp = poisonTriggers.state.playerHp;
      playerEnergy = poisonTriggers.state.energy;
      playerAbilityCooldowns = poisonTriggers.state.abilityCooldowns ?? playerAbilityCooldowns;
    }
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
          { enemies, playerStatuses, playerHp, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns },
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
        playerAbilityCooldowns = healingTriggers.state.abilityCooldowns ?? playerAbilityCooldowns;
      }
    }
    if (hpBeforePoison > 0 && enemyEnd.hp <= 0 && poison?.sourceId === "player") {
      const result = runPlayerTriggerEvent(
        "on_kill",
        { damage: enemyEnd.poisonDamage, damageType: "spell", targetStatusIds: enemyEnd.statuses.map((status) => status.id), targetHpBeforePercent: hpBeforePoison / enemy.maxHp, targetHpAfterPercent: 0 },
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
  nextBase = { ...nextBase, enemies, playerHp, playerStatuses, energy: playerEnergy, abilityCooldowns: playerAbilityCooldowns, procUsage };

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
