import { getCharacterCombatFeatures } from "./combatFeatures";
import { capDodgeChance } from "./combatMath";
import { ITEMS } from "./data";
import { DEFAULT_CHARACTER_AVATAR_ID } from "./avatars";
import type { CharacterState, GameState, Stats } from "./types";

export const INITIAL_CHARACTER: CharacterState = {
  name: "",
  avatarId: DEFAULT_CHARACTER_AVATAR_ID,
  level: 1,
  xp: 0,
  unspentStatPoints: 0,
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
  characterCreated: false,
  character: INITIAL_CHARACTER,
  adventure: { active: false, nodeIndex: 0, carryHp: null, combat: null, eventResolved: false, latestLoot: null, pendingReward: null, completed: false },
};

export interface DerivedStats extends Stats {
  armor: number;
  magicResistance: number;
  physicalPower: number;
  magicalPower: number;
  maxHp: number;
  maxEnergy: number;
  energyRegen: number;
  critChance: number;
  hitChance: number;
  dodgeChance: number;
  initiativeBonus: number;
  guardMultiplier: number;
  healingReceivedMultiplier: number;
  lootRarityBonus: number;
  chanceEffectBonus: number;
}

export function getDerivedStats(character: CharacterState): DerivedStats {
  const stats = { ...character.baseStats };
  let armor = 0;
  let magicResistance = 0;
  let gearPhysicalPower = 0;
  let gearMagicalPower = 0;
  Object.values(character.equipment).forEach((item) => {
    if (!item) return;
    armor += item.armor ?? 0;
    magicResistance += item.magicResistance ?? 0;
    gearPhysicalPower += item.physicalPower ?? (item.slot === "mainHand" ? item.power ?? 0 : 0);
    gearMagicalPower += item.magicalPower ?? (item.slot === "offHand" ? item.power ?? 0 : 0);
    Object.entries(item.stats).forEach(([key, value]) => {
      stats[key as keyof Stats] += value ?? 0;
    });
  });
  const features = getCharacterCombatFeatures(character);
  Object.entries(features.passive.stats).forEach(([stat, amount]) => {
    stats[stat as keyof Stats] += amount;
  });
  Object.keys(stats).forEach((stat) => {
    stats[stat as keyof Stats] = Math.round(stats[stat as keyof Stats]);
  });
  armor += features.passive.armor;
  magicResistance += features.passive.magicResistance;
  gearPhysicalPower += features.passive.physicalPower + features.passive.power;
  gearMagicalPower += features.passive.magicalPower + features.passive.power;
  const maxEnergy = 10 + features.passive.maxEnergy;
  const energyRegen = 1 + features.passive.energyRegen;
  const critChance = 0.05 + stats.luck * 0.0075 + features.passive.critChance;
  return {
    ...stats,
    armor: Math.round(armor),
    magicResistance: Math.round(magicResistance),
    physicalPower: Math.round(stats.strength + stats.agility * 0.3 + gearPhysicalPower),
    magicalPower: Math.round(stats.intelligence + gearMagicalPower),
    maxHp: Math.round(20 + stats.vitality * 10 + features.passive.maxHp),
    maxEnergy: Math.round(maxEnergy),
    energyRegen: Math.round(energyRegen),
    critChance,
    hitChance: 0.95 + stats.agility * 0.005 + features.passive.hitChance,
    dodgeChance: capDodgeChance(0.02 + stats.agility * 0.004 + features.passive.dodgeChance),
    initiativeBonus: Math.round(stats.agility + stats.intelligence * 0.5 + features.passive.initiative),
    guardMultiplier: 1 + stats.strength * 0.01 + features.passive.guardGeneration,
    healingReceivedMultiplier: 1 + stats.vitality * 0.005 + features.passive.healingReceived,
    lootRarityBonus: stats.luck * 0.01 + features.passive.lootRarity,
    chanceEffectBonus: stats.luck * 0.0025 + features.passive.chanceEffect,
  };
}
