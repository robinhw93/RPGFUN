import { getCharacterCombatFeatures } from "./combatFeatures";
import { ITEMS } from "./data";
import type { CharacterState, GameState, Stats } from "./types";

export const INITIAL_CHARACTER: CharacterState = {
  name: "",
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

export function getDerivedStats(character: CharacterState): Stats & { armor: number; power: number; maxHp: number; maxEnergy: number; energyRegen: number; critChance: number; initiativeBonus: number } {
  const stats = { ...character.baseStats };
  let armor = 0;
  let power = 0;
  Object.values(character.equipment).forEach((item) => {
    if (!item) return;
    armor += item.armor ?? 0;
    power += item.power ?? 0;
    Object.entries(item.stats).forEach(([key, value]) => {
      stats[key as keyof Stats] += value ?? 0;
    });
  });
  const features = getCharacterCombatFeatures(character);
  Object.entries(features.passive.stats).forEach(([stat, amount]) => {
    stats[stat as keyof Stats] += amount;
  });
  armor += features.passive.armor;
  power += features.passive.power;
  const maxEnergy = 10 + features.passive.maxEnergy;
  const energyRegen = 1 + features.passive.energyRegen;
  const critChance = 0.05 + stats.luck * 0.01 + features.passive.critChance;
  return {
    ...stats,
    armor,
    power,
    maxHp: 42 + stats.vitality * 6 + features.passive.maxHp,
    maxEnergy,
    energyRegen,
    critChance,
    initiativeBonus: stats.agility + Math.floor(stats.intelligence / 2) + features.passive.initiative,
  };
}
