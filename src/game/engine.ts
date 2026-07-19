import { getDerivedStats } from "./character";
import { ABILITIES, ENEMIES } from "./data";
import { getCharacterCombatFeatures, resolveCharacterTriggers } from "./combatFeatures";
import type { CombatTriggerContext, ResolvedCombatTrigger } from "./combatFeatures";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, CombatTriggerEvent, EnemyState, InspectableInfo, StatusEffect, TurnOrderEntry } from "./types";

export function createCombat(character: CharacterState, enemyIds: string[], carryHp?: number): CombatState {
  const derived = getDerivedStats(character);
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
    playerStatuses: [],
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

function queueStatus(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, status: StatusEffect, stunned = false, attachedEventIndex?: number): void {
  const eventIndex = attachedEventIndex ?? events.length;
  if (attachedEventIndex === undefined) events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, type: "status", targetId, status: { ...status }, stunned });
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

function normalizeEnemies(enemies: EnemyState[]): EnemyState[] {
  return enemies.map((enemy) => ({
    ...ENEMIES[enemy.id],
    ...enemy,
    energy: enemy.energy ?? 10,
    maxEnergy: enemy.maxEnergy ?? 10,
    energyCost: enemy.energyCost ?? ENEMIES[enemy.id].energyCost,
    attackDescription: enemy.attackDescription ?? ENEMIES[enemy.id].attackDescription,
    onHitEffect: enemy.onHitEffect ?? ENEMIES[enemy.id].onHitEffect,
    statuses: [...(enemy.statuses ?? [])],
    stunned: enemy.stunned ?? false,
  }));
}

export function ensureCombatState(combat: CombatState, character: CharacterState): CombatState {
  const enemies = normalizeEnemies(combat.enemies);
  if (Array.isArray(combat.turnOrder) && combat.turnOrder.length > 0) {
    const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId
      ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId
      ?? "";
    return {
      ...combat,
      enemies,
      turnOrder: combat.turnOrder.map((entry) => ({ ...entry, roll: entry.roll ?? entry.initiative, bonus: entry.bonus ?? 0 })),
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

function addStatus(statuses: StatusEffect[], status: StatusEffect): StatusEffect[] {
  const existing = statuses.find((item) => item.id === status.id);
  if (!existing) return [...statuses, status];
  return statuses.map((item) => item.id === status.id ? { ...item, duration: Math.max(item.duration, status.duration), stacks: item.stacks + status.stacks } : item);
}

function tickEnemyStatuses(enemy: EnemyState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): EnemyState {
  let hp = enemy.hp;
  enemy.statuses.forEach((status) => {
    if (status.id === "bleed") {
      const damage = 3 * status.stacks;
      hp -= damage;
      logs.push(makeLog(`${enemy.name} bleeds for ${damage}.`, statusInfo(status)));
      queueDamage(events, pendingEffects, `${enemy.name} takes ${damage} damage from Bleed.`, enemy.instanceId, damage);
    }
    if (status.id === "poison") {
      const damage = 2 * status.stacks;
      hp -= damage;
      logs.push(makeLog(`Poison burns ${enemy.name} for ${damage}.`, statusInfo(status)));
      queueDamage(events, pendingEffects, `${enemy.name} takes ${damage} damage from Poison.`, enemy.instanceId, damage);
    }
  });
  return { ...enemy, hp: Math.max(0, hp), statuses: enemy.statuses.map((status) => ({ ...status, duration: status.duration - 1 })).filter((status) => status.duration > 0) };
}

function tickPlayerStatuses(playerHp: number, statuses: StatusEffect[], logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]) {
  let hp = playerHp;
  const nextStatuses: StatusEffect[] = [];
  statuses.forEach((status) => {
    if (status.id === "bleed") {
      const damage = 2 * status.stacks;
      hp = Math.max(0, hp - damage);
      logs.push(makeLog(`Bleed deals ${damage} damage to you.`, statusInfo(status)));
      queueDamage(events, pendingEffects, `You take ${damage} damage from Bleed.`, "player", damage);
    }
    const duration = status.duration - 1;
    if (duration > 0 && status.id !== "guard") nextStatuses.push({ ...status, duration });
  });
  return { playerHp: hp, playerStatuses: nextStatuses };
}

function isActorAlive(combat: CombatState, actor: TurnOrderEntry): boolean {
  if (actor.kind === "player") return combat.playerHp > 0;
  return Boolean(combat.enemies.find((enemy) => enemy.instanceId === actor.actorId && enemy.hp > 0));
}

function moveToNextActor(combat: CombatState, character: CharacterState, logs: CombatLogEntry[], events: string[], pendingEffects: CombatPendingEffect[]): CombatState {
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
    const playerTick = tickPlayerStatuses(next.playerHp, next.playerStatuses, logs, events, pendingEffects);
    const regeneratedEnergy = Math.min(next.maxEnergy, next.energy + derived.energyRegen);
    next = {
      ...next,
      playerHp: playerTick.playerHp,
      playerStatuses: playerTick.playerStatuses,
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
    queueTurn(events, pendingEffects, "Your turn.", nextIndex, nextTurn, false, next.playerStatuses, regeneratedEnergy);
  } else {
    queueTurn(events, pendingEffects, `${nextActor.name}'s turn.`, nextIndex, nextTurn);
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
        const damage = Math.max(0, Math.round(effect.amount + scaling));
        if (targetMode === "self") {
          playerHp = Math.max(0, playerHp - damage);
          queueDamage(events, pendingEffects, `It deals ${damage} damage to you.`, "player", damage);
        } else {
          enemyTargets.forEach((target) => {
            enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage) } : enemy);
            queueDamage(events, pendingEffects, `It deals ${damage} damage to ${target.name}.`, target.instanceId, damage, "player");
          });
        }
      }

      if (effect.type === "apply_status") {
        const status = { ...effect.status };
        if (targetMode === "self") {
          playerStatuses = addStatus(playerStatuses, status);
          logs.push(makeLog(`You gain ${status.name}.`, statusInfo(status)));
          queueStatus(events, pendingEffects, `You gain ${status.name}.`, "player", status);
        } else {
          enemyTargets.forEach((target) => {
            enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, status) } : enemy);
            logs.push(makeLog(`${target.name} gains ${status.name}.`, statusInfo(status)));
            queueStatus(events, pendingEffects, `${target.name} gains ${status.name}.`, target.instanceId, status);
          });
        }
      }

      if (effect.type === "heal") {
        const amount = Math.max(0, Math.round(effect.amount));
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
        const guard: StatusEffect = { id: "guard", name: "Guard", kind: "buff", duration: effect.duration ?? 1, stacks: effect.amount, description: `Absorbs ${effect.amount} incoming damage.` };
        playerStatuses = addStatus(playerStatuses, guard);
        logs.push(makeLog(`You gain ${effect.amount} Guard.`, statusInfo(guard)));
        queueStatus(events, pendingEffects, `You gain ${effect.amount} Guard.`, "player", guard);
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
  const resolved = resolveCharacterTriggers(character, combat, event, context, procUsage);
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
  let enemies = normalizeEnemies(combat.enemies);
  const displayedEnemyHp = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.hp]));
  const displayedEnemyStatuses = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.statuses]));
  const displayedPlayerHp = combat.playerHp;
  const displayedPlayerStatuses = combat.playerStatuses;
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  let procUsage = { ...(combat.procUsage ?? {}) };
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  let energy = combat.energy - ability.energyCost;
  const abilityCooldowns = ability.cooldownTurns
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
    ? enemies.filter((enemy) => enemy.hp > 0)
    : enemies.filter((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0);

  if (ability.target === "self") {
    if (ability.effect === "guard") {
      playerStatuses = addStatus(playerStatuses, { id: "guard", name: "Guard", kind: "buff", duration: 1, stacks: 6, description: "Absorbs incoming damage." });
      const guardStatus = playerStatuses.find((status) => status.id === "guard")!;
      logs.push(makeLog("You gain 6 Guard.", statusInfo(guardStatus)));
      queueStatus(events, pendingEffects, "You gain 6 Guard.", "player", guardStatus);
    }
  } else {
    targets.forEach((target) => {
      const scaling = ability.scalingStat ? derived[ability.scalingStat] : 0;
      const ignoresArmor = ability.damageType === "arcane" ? Math.floor(target.armor / 2) : 0;
      const vulnerable = target.statuses.some((status) => status.id === "vulnerable") ? 1.25 : 1;
      const critical = Math.random() < derived.critChance;
      const raw = (ability.power ?? 0) + scaling * 1.15 + derived.power;
      const damage = Math.max(1, Math.round((raw - Math.max(0, target.armor - ignoresArmor)) * vulnerable * (critical ? 1.6 : 1)));
      enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, hp: Math.max(0, enemy.hp - damage) } : enemy);
      logs.push(makeLog(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`, abilityInfo));
      const damageEventIndex = queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage to ${target.name}.`, target.instanceId, damage, "player");
      if (ability.effect === "bleed") {
        const bleed: StatusEffect = { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 3 damage per stack when its turn begins. Lasts 3 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, bleed) } : enemy);
        logs.push(makeLog(`${target.name} gains Bleed.`, statusInfo(bleed)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage and applies Bleed.`;
        queueStatus(events, pendingEffects, `${target.name} is Bleeding.`, target.instanceId, bleed, false, damageEventIndex);
      }
      if (ability.effect === "poison") {
        const poison: StatusEffect = { id: "poison", name: "Poison", kind: "debuff", duration: 4, stacks: 1, description: "Takes 2 damage per stack when its turn begins. Lasts 4 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, poison) } : enemy);
        logs.push(makeLog(`${target.name} gains Poison.`, statusInfo(poison)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage and applies Poison.`;
        queueStatus(events, pendingEffects, `${target.name} is Poisoned.`, target.instanceId, poison, false, damageEventIndex);
      }
      if (ability.effect === "vulnerable") {
        const vulnerableStatus: StatusEffect = { id: "vulnerable", name: "Vulnerable", kind: "debuff", duration: 2, stacks: 1, description: "Takes 25% increased damage for 2 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, vulnerableStatus) } : enemy);
        logs.push(makeLog(`${target.name} becomes Vulnerable.`, statusInfo(vulnerableStatus)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage and applies Vulnerable.`;
        queueStatus(events, pendingEffects, `${target.name} becomes Vulnerable.`, target.instanceId, vulnerableStatus, false, damageEventIndex);
      }
      if (ability.effect === "stun" && Math.random() < 0.45) {
        const stunned: StatusEffect = { id: "stunned", name: "Stunned", kind: "debuff", duration: 1, stacks: 1, description: "Cannot act on its next turn." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, stunned: true, statuses: addStatus(enemy.statuses, stunned) } : enemy);
        logs.push(makeLog(`${target.name} is Stunned.`, statusInfo(stunned)));
        events[damageEventIndex] = `${critical ? "Critical hit! " : ""}It deals ${damage} damage and applies Stun.`;
        queueStatus(events, pendingEffects, `${target.name} is Stunned.`, target.instanceId, stunned, true, damageEventIndex);
      }

      const triggerContext = {
        abilityId: ability.id,
        damageType: ability.damageType,
        critical,
        damage,
        targetStatusIds: enemies.find((enemy) => enemy.instanceId === target.instanceId)?.statuses.map((status) => status.id) ?? [],
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
    });
    if (ability.effect === "energy") {
      energy = Math.min(combat.maxEnergy, energy + 2);
      logs.push(makeLog("You reclaim 2 Energy.", abilityInfo));
      events.push("You reclaim 2 Energy.");
    }
  }

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    events.push("Victory.");
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, pendingEffects, damagedTargets, enemies: displayedEnemies, playerHp: Math.max(displayedPlayerHp, playerHp), playerStatuses: displayedPlayerStatuses, energy, procUsage, abilityCooldowns, playerActed: true, attackingActorId: null, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "active" };
  }

  const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId ?? "";
  const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp, statuses: displayedEnemyStatuses.get(enemy.instanceId) ?? enemy.statuses }));
  return {
    ...combat,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    enemies: displayedEnemies,
    playerHp: Math.max(displayedPlayerHp, playerHp),
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
  const next = moveToNextActor(combat, character, logs, events, pendingEffects);
  return {
    ...next,
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
  const stunnedStatus = originalEnemy.statuses.find((status) => status.id === "stunned");
  let enemy = tickEnemyStatuses(originalEnemy, logs, events, pendingEffects);
  const regeneratedEnergy = Math.min(enemy.maxEnergy, enemy.energy + 1);
  enemy = { ...enemy, energy: regeneratedEnergy };
  enemies[enemyIndex] = enemy;
  let nextBase: CombatState = { ...combat, enemies, playerHp, playerStatuses };

  if (enemy.hp <= 0) {
    logs.push(makeLog(`${enemy.name} falls.`));
    events.push(`${enemy.name} falls.`);
  } else if (enemy.stunned) {
    logs.push(makeLog(`${enemy.name} is stunned and cannot act.`, stunnedStatus ? statusInfo(stunnedStatus) : undefined));
    events.push(`${enemy.name} is Stunned.`);
    enemies[enemyIndex] = { ...enemy, stunned: false };
    nextBase = { ...nextBase, enemies };
  } else if (enemy.energy < enemy.energyCost) {
    logs.push(makeLog(`${enemy.name} gathers Energy.`));
    events.push(`${enemy.name} gathers Energy.`);
  } else {
    const guard = playerStatuses.find((status) => status.id === "guard")?.stacks ?? 0;
    const incoming = Math.max(1, enemy.power - Math.floor(derived.armor * 0.35));
    const blocked = Math.min(guard, incoming);
    const damage = incoming - blocked;
    playerHp = Math.max(0, playerHp - damage);
    const remainingGuard = guard - blocked;
    playerStatuses = playerStatuses.flatMap((status) => status.id !== "guard" ? [status] : remainingGuard > 0 ? [{ ...status, stacks: remainingGuard }] : []);
    const attackName = enemy.intentText.split(" · ")[0];
    const enemyAttackInfo: InspectableInfo = { title: attackName, description: enemy.attackDescription, category: "ability" };
    logs.push(makeLog(`${enemy.name} uses ${attackName} for ${damage}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
    events.push(`${enemy.name} uses ${attackName}.`);
    const damageEventIndex = queueDamage(events, pendingEffects, `It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage, enemy.instanceId);
    if (damage > 0 && enemy.onHitEffect === "bleed") {
      const bleed: StatusEffect = { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 2 damage per stack when your turn begins. Lasts 3 turns." };
      playerStatuses = addStatus(playerStatuses, bleed);
      logs.push(makeLog("You gain Bleed.", statusInfo(bleed)));
      events[damageEventIndex] = `It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""} and applies Bleed.`;
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
    enemies = enemies.map((candidate) => candidate.instanceId === enemy.instanceId
      ? { ...candidate, energy: enemy.energy - enemy.energyCost }
      : candidate);
    nextBase = { ...nextBase, enemies, playerHp, playerStatuses, procUsage };
  }

  const selectedEnemyId = enemies.find((candidate) => candidate.instanceId === nextBase.selectedEnemyId && candidate.hp > 0)?.instanceId
    ?? enemies.find((candidate) => candidate.hp > 0)?.instanceId
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
    if (effect.type === "status") {
      if (effect.targetId === "player") {
        playerStatuses = addStatus(playerStatuses, effect.status);
      } else {
        enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId
          ? { ...enemy, statuses: addStatus(enemy.statuses, effect.status), stunned: effect.stunned ? true : enemy.stunned }
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
    if (effect.targetId === "player") {
      playerHp = Math.max(0, playerHp - effect.damage);
      if (effect.damage > 0) damagedTargets.push("player");
      return;
    }
    enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, hp: Math.max(0, enemy.hp - effect.damage) } : enemy);
    if (effect.damage > 0) damagedTargets.push(effect.targetId);
  });

  const consumedIds = new Set(matchingEffects.map((effect) => effect.id));
  if (attackEffectId && consumedIds.has(attackEffectId)) attackEffectId = null;
  const pendingEffects = (combat.pendingEffects ?? []).filter((effect) => !consumedIds.has(effect.id));
  const outcome = playerHp <= 0 ? "defeat" : enemies.every((enemy) => enemy.hp <= 0) ? "victory" : combat.outcome;
  const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId
    ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId
    ?? "";
  return { ...combat, playerHp, playerStatuses, enemies, activeTurnIndex, turn, playerActed, energy, attackingActorId, attackAnimationId, attackEffectId, pendingEffects, damagedTargets, selectedEnemyId, outcome };
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
