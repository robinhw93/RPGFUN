import { ABILITIES, ADVENTURE, ENEMIES, ITEMS, TALENTS } from "./data";
import type { CharacterState, CombatLogEntry, CombatState, EnemyState, GameState, GearItem, GearSlot, InspectableInfo, Stats, StatusEffect } from "./types";

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

export function getDerivedStats(character: CharacterState): Stats & { armor: number; power: number; maxHp: number; maxEnergy: number; energyRegen: number; critChance: number } {
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
  return { ...stats, armor, power, maxHp: 42 + stats.vitality * 6 + bonusHp, maxEnergy, energyRegen, critChance };
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
  return {
    turn: 1,
    eventId: 1,
    floatingEvents: ["Your turn."],
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

function makeLog(text: string, info?: InspectableInfo): CombatLogEntry {
  combatLogSequence += 1;
  return { id: `combat-log-${Date.now()}-${combatLogSequence}`, text, info };
}

function statusInfo(status: StatusEffect): InspectableInfo {
  return { title: status.name, description: status.description, category: "status" };
}

function addStatus(statuses: StatusEffect[], status: StatusEffect): StatusEffect[] {
  const existing = statuses.find((item) => item.id === status.id);
  if (!existing) return [...statuses, status];
  return statuses.map((item) => item.id === status.id ? { ...item, duration: Math.max(item.duration, status.duration), stacks: item.stacks + status.stacks } : item);
}

function tickEnemyStatuses(enemy: EnemyState, logs: CombatLogEntry[], events: string[], damagedTargets: string[]): EnemyState {
  let hp = enemy.hp;
  enemy.statuses.forEach((status) => {
    if (status.id === "bleed") {
      const damage = 3 * status.stacks;
      hp -= damage;
      logs.push(makeLog(`${enemy.name} bleeds for ${damage}.`, statusInfo(status)));
      events.push(`Bleed triggers on ${enemy.name}.`, `It deals ${damage} damage.`);
      damagedTargets.push(enemy.instanceId);
    }
    if (status.id === "poison") {
      const damage = 2 * status.stacks;
      hp -= damage;
      logs.push(makeLog(`Poison burns ${enemy.name} for ${damage}.`, statusInfo(status)));
      events.push(`Poison triggers on ${enemy.name}.`, `It deals ${damage} damage.`);
      damagedTargets.push(enemy.instanceId);
    }
  });
  return { ...enemy, hp: Math.max(0, hp), statuses: enemy.statuses.map((status) => ({ ...status, duration: status.duration - 1 })).filter((status) => status.duration > 0) };
}

function tickPlayerStatuses(playerHp: number, statuses: StatusEffect[], logs: CombatLogEntry[], events: string[], damagedTargets: string[]) {
  let hp = playerHp;
  const nextStatuses: StatusEffect[] = [];
  statuses.forEach((status) => {
    if (status.id === "bleed") {
      const damage = 2 * status.stacks;
      hp = Math.max(0, hp - damage);
      logs.push(makeLog(`Bleed deals ${damage} damage to you.`, statusInfo(status)));
      events.push("Your Bleed triggers.", `It deals ${damage} damage.`);
      damagedTargets.push("player");
    }
    const duration = status.duration - 1;
    if (duration > 0 && status.id !== "guard") nextStatuses.push({ ...status, duration });
  });
  return { playerHp: hp, playerStatuses: nextStatuses };
}

export function useAbility(combat: CombatState, character: CharacterState, abilityId: string): CombatState {
  const ability = ABILITIES[abilityId];
  if (!ability || combat.outcome !== "active" || ability.energyCost > combat.energy) return combat;
  const derived = getDerivedStats(character);
  let enemies: EnemyState[] = combat.enemies.map((enemy) => ({
    ...ENEMIES[enemy.id],
    ...enemy,
    energy: enemy.energy ?? 10,
    maxEnergy: enemy.maxEnergy ?? 10,
    energyCost: enemy.energyCost ?? ENEMIES[enemy.id].energyCost,
    attackDescription: enemy.attackDescription ?? ENEMIES[enemy.id].attackDescription,
    onHitEffect: enemy.onHitEffect ?? ENEMIES[enemy.id].onHitEffect,
    statuses: [...enemy.statuses],
  }));
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  const logs: CombatLogEntry[] = [];
  const events: string[] = [];
  const damagedTargets: string[] = [];
  const playerTick = tickPlayerStatuses(playerHp, playerStatuses, logs, events, damagedTargets);
  playerHp = playerTick.playerHp;
  playerStatuses = playerTick.playerStatuses;
  if (playerHp <= 0) {
    events.push("You have fallen.");
    return { ...combat, turn: combat.turn + 1, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, damagedTargets, playerHp, playerStatuses, log: [...logs, ...combat.log].slice(0, 24), outcome: "defeat" };
  }

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
      damagedTargets.push(target.instanceId);
      logs.push(makeLog(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`, abilityInfo));
      events.push(`${critical ? "Critical hit! " : ""}It deals ${damage} damage to ${target.name}.`);
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
    return { ...combat, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, damagedTargets, enemies, playerHp, playerStatuses, energy, log: [...logs, makeLog("Victory. The path ahead is clear."), ...combat.log].slice(0, 24), outcome: "victory" };
  }

  let guard = playerStatuses.find((status) => status.id === "guard")?.stacks ?? 0;
  enemies = enemies.map((enemy) => {
    if (enemy.hp <= 0) return enemy;
    const maxEnemyEnergy = enemy.maxEnergy ?? 10;
    const regeneratedEnergy = Math.min(maxEnemyEnergy, (enemy.energy ?? 10) + 1);
    if (enemy.stunned) {
      const stunned = enemy.statuses.find((status) => status.id === "stunned");
      logs.push(makeLog(`${enemy.name} is stunned and cannot act.`, stunned ? statusInfo(stunned) : undefined));
      events.push(`${enemy.name} is Stunned.`);
      return { ...enemy, energy: regeneratedEnergy, maxEnergy: maxEnemyEnergy, stunned: false };
    }
    if (regeneratedEnergy < enemy.energyCost) {
      logs.push(makeLog(`${enemy.name} gathers Energy.`));
      events.push(`${enemy.name} gathers Energy.`);
      return { ...enemy, energy: regeneratedEnergy, maxEnergy: maxEnemyEnergy };
    }
    const incoming = Math.max(1, enemy.power - Math.floor(derived.armor * 0.35));
    const blocked = Math.min(guard, incoming);
    guard -= blocked;
    const damage = incoming - blocked;
    playerHp = Math.max(0, playerHp - damage);
    const attackName = enemy.intentText.split(" · ")[0];
    const enemyAttackInfo: InspectableInfo = { title: attackName, description: enemy.attackDescription, category: "ability" };
    logs.push(makeLog(`${enemy.name} uses ${attackName} for ${damage}${blocked ? ` (${blocked} blocked)` : ""} damage.`, enemyAttackInfo));
    events.push(`${enemy.name} uses ${attackName}.`, `It deals ${damage} damage${blocked ? ` (${blocked} blocked)` : ""}.`);
    if (damage > 0) damagedTargets.push("player");
    if (damage > 0 && enemy.onHitEffect === "bleed") {
      const bleed: StatusEffect = { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 2 damage per stack when your turn begins. Lasts 3 turns." };
      playerStatuses = addStatus(playerStatuses, bleed);
      logs.push(makeLog("You gain Bleed.", statusInfo(bleed)));
      events.push("You are Bleeding.");
    }
    return { ...enemy, energy: regeneratedEnergy - enemy.energyCost, maxEnergy: maxEnemyEnergy };
  });

  enemies = enemies.map((enemy) => tickEnemyStatuses(enemy, logs, events, damagedTargets));
  const allDeadAfterTicks = enemies.every((enemy) => enemy.hp <= 0);
  playerStatuses = playerStatuses.filter((status) => status.id !== "guard");
  const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId ?? "";
  const nextEnergy = Math.min(combat.maxEnergy, energy + derived.energyRegen);
  const outcome = playerHp <= 0 ? "defeat" : allDeadAfterTicks ? "victory" : "active";
  if (outcome === "victory") logs.push(makeLog("Victory. The last enemy falls."));
  if (outcome === "defeat") logs.push(makeLog("Your strength fails. The ash claims another name."));
  events.push(outcome === "victory" ? "Victory." : outcome === "defeat" ? "You have fallen." : "Your turn.");
  return { ...combat, turn: combat.turn + 1, eventId: (combat.eventId ?? 0) + 1, floatingEvents: events, damagedTargets, enemies, playerHp, playerStatuses, energy: nextEnergy, selectedEnemyId: nextSelected, log: [...logs, ...combat.log].slice(0, 24), outcome };
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
