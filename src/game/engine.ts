import { ABILITIES, ADVENTURE, ENEMIES, ITEMS, TALENTS } from "./data";
import type { CharacterState, CombatLogEntry, CombatPendingEffect, CombatState, EnemyState, GameState, GearItem, GearSlot, InspectableInfo, Stats, StatusEffect, TurnOrderEntry } from "./types";

export const INITIAL_CHARACTER: CharacterState = {
  name: "The Wayfarer",
  level: 1,
  xp: 0,
  gold: 18,
  baseStats: { strength: 5, agility: 5, intelligence: 5, vitality: 6, luck: 3 },
  talentPoints: 3,
  unlockedTalents: ["origin"],
  equippedAbilities: ["strike", "guard"],
  inventory: [ITEMS[1], ITEMS[2], ITEMS[4], ITEMS[6]],
  equipment: {
    mainHand: ITEMS[0],
    chest: ITEMS[3],
    boots: ITEMS[5],
  },
};

export const INITIAL_GAME: GameState = {
  character: INITIAL_CHARACTER,
  adventure: { active: false, nodeIndex: 0, carryHp: null, combat: null, eventResolved: false, latestLoot: null, completed: false },
};

export function getDerivedStats(character: CharacterState): Stats & { armor: number; power: number; maxHp: number; maxEnergy: number; energyRegen: number; critChance: number; initiativeBonus: number } {
  const stats = { ...character.baseStats };
  let armor = 0;
  let power = 0;
  const setCounts: Record<string, number> = {};
  Object.values(character.equipment).forEach((item) => {
    if (!item) return;
    armor += item.armor ?? 0;
    power += item.power ?? 0;
    Object.entries(item.stats).forEach(([key, value]) => {
      stats[key as keyof Stats] += value ?? 0;
    });
    if (item.set) setCounts[item.set] = (setCounts[item.set] ?? 0) + 1;
  });
  if ((setCounts.ashborn ?? 0) >= 2) stats.strength += 2;
  let bonusHp = 0;
  let maxEnergy = 10;
  let energyRegen = 1;
  let critChance = 0.05 + stats.luck * 0.01;
  TALENTS.filter((talent) => character.unlockedTalents.includes(talent.id)).forEach((talent) => {
    const passive = talent.passive;
    if (!passive) return;
    if (passive.stat && passive.amount) stats[passive.stat] += passive.amount;
    bonusHp += passive.maxHp ?? 0;
    maxEnergy += passive.maxEnergy ?? 0;
    energyRegen += passive.energyRegen ?? 0;
    critChance += passive.critChance ?? 0;
  });
  return { ...stats, armor, power, maxHp: 42 + stats.vitality * 6 + bonusHp, maxEnergy, energyRegen, critChance, initiativeBonus: stats.agility + Math.floor(stats.intelligence / 2) };
}

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
  const firstActor = turnOrder[0];
  return {
    turn: 1,
    turnOrder,
    activeTurnIndex: 0,
    playerActed: false,
    eventId: 1,
    floatingEvents: [firstActor.kind === "player" ? "You act first." : `${firstActor.name} acts first.`],
    pendingEffects: [],
    damagedTargets: [],
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

function queueDamage(events: string[], pendingEffects: CombatPendingEffect[], text: string, targetId: string, damage: number): void {
  const eventIndex = events.length;
  events.push(text);
  combatEffectSequence += 1;
  pendingEffects.push({ id: `combat-effect-${Date.now()}-${combatEffectSequence}`, eventIndex, targetId, damage });
}

function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function rollTurnOrder(character: CharacterState, enemies: EnemyState[]): TurnOrderEntry[] {
  const derived = getDerivedStats(character);
  return [
    {
      actorId: "player",
      kind: "player" as const,
      name: character.name,
      initiative: rollD100() + derived.initiativeBonus,
    },
    ...enemies.map((enemy) => ({
      actorId: enemy.instanceId,
      kind: "enemy" as const,
      name: enemy.name,
      initiative: rollD100(),
    })),
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
      selectedEnemyId,
      activeTurnIndex: Math.min(combat.activeTurnIndex ?? 0, combat.turnOrder.length - 1),
      playerActed: combat.playerActed ?? false,
      damagedTargets: combat.damagedTargets ?? [],
      pendingEffects: combat.pendingEffects ?? [],
    };
  }
  const turnOrder = rollTurnOrder(character, enemies);
  const firstActor = turnOrder[0];
  return {
    ...combat,
    enemies,
    turnOrder,
    activeTurnIndex: 0,
    playerActed: false,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: [firstActor.kind === "player" ? "You act first." : `${firstActor.name} acts first.`],
    pendingEffects: [],
    damagedTargets: [],
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
      events.push(`Bleed triggers on ${enemy.name}.`);
      queueDamage(events, pendingEffects, `It deals ${damage} damage.`, enemy.instanceId, damage);
    }
    if (status.id === "poison") {
      const damage = 2 * status.stacks;
      hp -= damage;
      logs.push(makeLog(`Poison burns ${enemy.name} for ${damage}.`, statusInfo(status)));
      events.push(`Poison triggers on ${enemy.name}.`);
      queueDamage(events, pendingEffects, `It deals ${damage} damage.`, enemy.instanceId, damage);
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
      events.push("Your Bleed triggers.");
      queueDamage(events, pendingEffects, `It deals ${damage} damage.`, "player", damage);
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
  let next: CombatState = {
    ...combat,
    activeTurnIndex: nextIndex,
    turn: nextIndex <= combat.activeTurnIndex ? combat.turn + 1 : combat.turn,
  };

  if (nextActor.kind === "player") {
    const derived = getDerivedStats(character);
    const playerTick = tickPlayerStatuses(next.playerHp, next.playerStatuses, logs, events, pendingEffects);
    next = {
      ...next,
      playerHp: playerTick.playerHp,
      playerStatuses: playerTick.playerStatuses,
      energy: Math.min(next.maxEnergy, next.energy + derived.energyRegen),
      playerActed: false,
    };
    if (next.playerHp <= 0) {
      events.push("You have fallen.");
      logs.push(makeLog("Your strength fails. The ash claims another name."));
      return { ...next, outcome: "defeat" };
    }
    events.push("Your turn.");
  } else {
    events.push(`${nextActor.name}'s turn.`);
  }
  return next;
}

export function useAbility(combat: CombatState, character: CharacterState, abilityId: string): CombatState {
  combat = ensureCombatState(combat, character);
  const ability = ABILITIES[abilityId];
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  if (!ability || combat.outcome !== "active" || activeActor?.kind !== "player" || combat.playerActed || ability.energyCost > combat.energy) return combat;
  const derived = getDerivedStats(character);
  let enemies = normalizeEnemies(combat.enemies);
  const displayedEnemyHp = new Map(enemies.map((enemy) => [enemy.instanceId, enemy.hp]));
  let playerStatuses = [...combat.playerStatuses];
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  let energy = combat.energy - ability.energyCost;
  const abilityInfo: InspectableInfo = { title: ability.name, description: `${ability.description} Costs ${ability.energyCost} Energy.`, category: "ability" };
  logs.push(makeLog(`You use ${ability.name}.`, abilityInfo));
  events.push(`You use ${ability.name}.`);
  const targets = ability.target === "all_enemies"
    ? enemies.filter((enemy) => enemy.hp > 0)
    : enemies.filter((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0);

  if (ability.target === "self") {
    if (ability.effect === "guard") {
      playerStatuses = addStatus(playerStatuses, { id: "guard", name: "Guard", kind: "buff", duration: 1, stacks: 6, description: "Absorbs incoming damage." });
      const guardStatus = playerStatuses.find((status) => status.id === "guard")!;
      logs.push(makeLog("You gain 6 Guard.", statusInfo(guardStatus)));
      events.push("You gain 6 Guard.");
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
      queueDamage(events, pendingEffects, `${critical ? "Critical hit! " : ""}It deals ${damage} damage to ${target.name}.`, target.instanceId, damage);
      if (ability.effect === "bleed") {
        const bleed: StatusEffect = { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 3 damage per stack when its turn begins. Lasts 3 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, bleed) } : enemy);
        logs.push(makeLog(`${target.name} gains Bleed.`, statusInfo(bleed)));
        events.push(`${target.name} is Bleeding.`);
      }
      if (ability.effect === "poison") {
        const poison: StatusEffect = { id: "poison", name: "Poison", kind: "debuff", duration: 4, stacks: 1, description: "Takes 2 damage per stack when its turn begins. Lasts 4 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, poison) } : enemy);
        logs.push(makeLog(`${target.name} gains Poison.`, statusInfo(poison)));
        events.push(`${target.name} is Poisoned.`);
      }
      if (ability.effect === "vulnerable") {
        const vulnerableStatus: StatusEffect = { id: "vulnerable", name: "Vulnerable", kind: "debuff", duration: 2, stacks: 1, description: "Takes 25% increased damage for 2 turns." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, vulnerableStatus) } : enemy);
        logs.push(makeLog(`${target.name} becomes Vulnerable.`, statusInfo(vulnerableStatus)));
        events.push(`${target.name} becomes Vulnerable.`);
      }
      if (ability.effect === "stun" && Math.random() < 0.45) {
        const stunned: StatusEffect = { id: "stunned", name: "Stunned", kind: "debuff", duration: 1, stacks: 1, description: "Cannot act on its next turn." };
        enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, stunned: true, statuses: addStatus(enemy.statuses, stunned) } : enemy);
        logs.push(makeLog(`${target.name} is Stunned.`, statusInfo(stunned)));
        events.push(`${target.name} is Stunned.`);
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
    const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp }));
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, pendingEffects, damagedTargets, enemies: displayedEnemies, playerStatuses, energy, playerActed: true, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "active" };
  }

  const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId ?? "";
  const displayedEnemies = enemies.map((enemy) => ({ ...enemy, hp: displayedEnemyHp.get(enemy.instanceId) ?? enemy.hp }));
  return {
    ...combat,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    enemies: displayedEnemies,
    playerStatuses,
    energy,
    playerActed: true,
    selectedEnemyId: nextSelected,
    log: [...logs, ...combat.log].slice(0, 24),
  };
}

export function endPlayerTurn(combat: CombatState, character: CharacterState): CombatState {
  combat = ensureCombatState(combat, character);
  const activeActor = combat.turnOrder[combat.activeTurnIndex];
  if (combat.outcome !== "active" || activeActor?.kind !== "player") return combat;
  const logs: CombatLogEntry[] = [makeLog("You end your turn.")];
  const events = ["You end your turn."];
  const damagedTargets: string[] = [];
  const pendingEffects: CombatPendingEffect[] = [];
  const next = moveToNextActor(combat, character, logs, events, pendingEffects);
  return {
    ...next,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
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
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
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
    queueDamage(events, pendingEffects, `It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`, "player", damage);
    if (damage > 0 && enemy.onHitEffect === "bleed") {
      const bleed: StatusEffect = { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 2 damage per stack when your turn begins. Lasts 3 turns." };
      playerStatuses = addStatus(playerStatuses, bleed);
      logs.push(makeLog("You gain Bleed.", statusInfo(bleed)));
      events.push("You are Bleeding.");
    }
    enemies[enemyIndex] = { ...enemy, energy: enemy.energy - enemy.energyCost };
    nextBase = { ...nextBase, enemies, playerHp, playerStatuses };
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
    playerHp: displayedPlayerHp,
    enemies: displayedEnemies,
    eventId: (combat.eventId ?? 0) + 1,
    floatingEvents: events,
    pendingEffects,
    damagedTargets,
    log: [...logs, ...combat.log].slice(0, 24),
  };
}

export function resolveCombatEvent(combat: CombatState, eventId: number, eventIndex: number): CombatState {
  if (combat.eventId !== eventId) return combat;
  const matchingEffects = (combat.pendingEffects ?? []).filter((effect) => effect.eventIndex === eventIndex);
  if (matchingEffects.length === 0) return combat;

  let playerHp = combat.playerHp;
  let enemies = combat.enemies;
  const damagedTargets: string[] = [];
  matchingEffects.forEach((effect) => {
    if (effect.targetId === "player") {
      playerHp = Math.max(0, playerHp - effect.damage);
      if (effect.damage > 0) damagedTargets.push("player");
      return;
    }
    enemies = enemies.map((enemy) => enemy.instanceId === effect.targetId ? { ...enemy, hp: Math.max(0, enemy.hp - effect.damage) } : enemy);
    if (effect.damage > 0) damagedTargets.push(effect.targetId);
  });

  const consumedIds = new Set(matchingEffects.map((effect) => effect.id));
  const pendingEffects = (combat.pendingEffects ?? []).filter((effect) => !consumedIds.has(effect.id));
  const outcome = playerHp <= 0 ? "defeat" : enemies.every((enemy) => enemy.hp <= 0) ? "victory" : combat.outcome;
  const selectedEnemyId = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId
    ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId
    ?? "";
  return { ...combat, playerHp, enemies, pendingEffects, damagedTargets, selectedEnemyId, outcome };
}

export function getLoot(nodeIndex: number): GearItem {
  if (nodeIndex >= ADVENTURE.length - 1) return ITEMS[8];
  const pool = ITEMS.slice(1, 8);
  return pool[(nodeIndex * 3 + 1) % pool.length];
}

export function slotForItem(item: GearItem, equipment: CharacterState["equipment"]): GearSlot {
  if (item.slot !== "ring") return item.slot;
  return !equipment.ring1 ? "ring1" : !equipment.ring2 ? "ring2" : "ring1";
}
