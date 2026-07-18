import { ABILITIES, ADVENTURE, ENEMIES, ITEMS, TALENTS } from "./data";
import type { CharacterState, CombatState, EnemyState, GameState, GearItem, GearSlot, Stats, StatusEffect } from "./types";

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
  let energyRegen = 3;
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
    statuses: [],
    stunned: false,
  }));
  return {
    turn: 1,
    playerHp: Math.min(carryHp ?? derived.maxHp, derived.maxHp),
    playerMaxHp: derived.maxHp,
    energy: derived.maxEnergy,
    maxEnergy: derived.maxEnergy,
    selectedEnemyId: enemies[0].instanceId,
    enemies,
    playerStatuses: [],
    log: [`The ${enemies.map((enemy) => enemy.name).join(" and ")} bar your path.`],
    outcome: "active",
  };
}

function addStatus(statuses: StatusEffect[], status: StatusEffect): StatusEffect[] {
  const existing = statuses.find((item) => item.id === status.id);
  if (!existing) return [...statuses, status];
  return statuses.map((item) => item.id === status.id ? { ...item, duration: Math.max(item.duration, status.duration), stacks: item.stacks + status.stacks } : item);
}

function tickEnemyStatuses(enemy: EnemyState, logs: string[]): EnemyState {
  let hp = enemy.hp;
  enemy.statuses.forEach((status) => {
    if (status.id === "bleed") {
      const damage = 3 * status.stacks;
      hp -= damage;
      logs.push(`${enemy.name} bleeds for ${damage}.`);
    }
    if (status.id === "poison") {
      const damage = 2 * status.stacks;
      hp -= damage;
      logs.push(`Poison burns ${enemy.name} for ${damage}.`);
    }
  });
  return { ...enemy, hp: Math.max(0, hp), statuses: enemy.statuses.map((status) => ({ ...status, duration: status.duration - 1 })).filter((status) => status.duration > 0) };
}

export function useAbility(combat: CombatState, character: CharacterState, abilityId: string): CombatState {
  const ability = ABILITIES[abilityId];
  if (!ability || combat.outcome !== "active" || ability.energyCost > combat.energy) return combat;
  const derived = getDerivedStats(character);
  let enemies = combat.enemies.map((enemy) => ({ ...enemy, statuses: [...enemy.statuses] }));
  let playerHp = combat.playerHp;
  let playerStatuses = [...combat.playerStatuses];
  let energy = combat.energy - ability.energyCost;
  const logs: string[] = [`You use ${ability.name}.`];
  const targets = ability.target === "all_enemies"
    ? enemies.filter((enemy) => enemy.hp > 0)
    : enemies.filter((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0);

  if (ability.target === "self") {
    if (ability.effect === "guard") {
      playerStatuses = addStatus(playerStatuses, { id: "guard", name: "Guard", kind: "buff", duration: 1, stacks: 6, description: "Absorbs incoming damage." });
      logs.push("You brace behind 6 Guard.");
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
      logs.push(`${ability.name} hits ${target.name} for ${damage}${critical ? " critical" : ""} damage.`);
      if (ability.effect === "bleed") enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, { id: "bleed", name: "Bleed", kind: "debuff", duration: 3, stacks: 1, description: "Takes 3 damage at the end of each turn." }) } : enemy);
      if (ability.effect === "poison") enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, { id: "poison", name: "Poison", kind: "debuff", duration: 4, stacks: 1, description: "Takes increasing poison damage." }) } : enemy);
      if (ability.effect === "vulnerable") enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, statuses: addStatus(enemy.statuses, { id: "vulnerable", name: "Vulnerable", kind: "debuff", duration: 2, stacks: 1, description: "Takes 25% increased damage." }) } : enemy);
      if (ability.effect === "stun" && Math.random() < 0.45) enemies = enemies.map((enemy) => enemy.instanceId === target.instanceId ? { ...enemy, stunned: true, statuses: addStatus(enemy.statuses, { id: "stunned", name: "Stunned", kind: "debuff", duration: 1, stacks: 1, description: "Cannot act this turn." }) } : enemy);
    });
    if (ability.effect === "energy") {
      energy = Math.min(combat.maxEnergy, energy + 2);
      logs.push("You reclaim 2 Energy.");
    }
  }

  if (enemies.every((enemy) => enemy.hp <= 0)) {
    return { ...combat, enemies, playerHp, playerStatuses, energy, log: [...logs, "Victory. The path ahead is clear.", ...combat.log].slice(0, 16), outcome: "victory" };
  }

  let guard = playerStatuses.find((status) => status.id === "guard")?.stacks ?? 0;
  enemies = enemies.map((enemy) => {
    if (enemy.hp <= 0) return enemy;
    if (enemy.stunned) {
      logs.push(`${enemy.name} is stunned and cannot act.`);
      return { ...enemy, stunned: false };
    }
    const incoming = Math.max(1, enemy.power - Math.floor(derived.armor * 0.35));
    const blocked = Math.min(guard, incoming);
    guard -= blocked;
    const damage = incoming - blocked;
    playerHp = Math.max(0, playerHp - damage);
    logs.push(`${enemy.name} attacks for ${damage}${blocked ? ` (${blocked} blocked)` : ""}.`);
    return enemy;
  });

  enemies = enemies.map((enemy) => tickEnemyStatuses(enemy, logs));
  const allDeadAfterTicks = enemies.every((enemy) => enemy.hp <= 0);
  playerStatuses = playerStatuses.map((status) => ({ ...status, duration: status.duration - 1 })).filter((status) => status.duration > 0);
  const nextSelected = enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0)?.instanceId ?? enemies.find((enemy) => enemy.hp > 0)?.instanceId ?? "";
  const nextEnergy = Math.min(combat.maxEnergy, energy + derived.energyRegen);
  const outcome = playerHp <= 0 ? "defeat" : allDeadAfterTicks ? "victory" : "active";
  if (outcome === "victory") logs.push("Victory. The last enemy falls.");
  if (outcome === "defeat") logs.push("Your strength fails. The ash claims another name.");
  return { ...combat, turn: combat.turn + 1, enemies, playerHp, playerStatuses, energy: nextEnergy, selectedEnemyId: nextSelected, log: [...logs, ...combat.log].slice(0, 16), outcome };
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
