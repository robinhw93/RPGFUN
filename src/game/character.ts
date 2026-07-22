import { getCharacterCombatFeatures } from "./combatFeatures";
import { getEffectiveDodgeChance } from "./combatMath";
import { ITEMS } from "./data";
import { DEFAULT_CHARACTER_AVATAR_ID } from "./avatars";
import type { CharacterState, GameState, Stats, StatusEffectId } from "./types";

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
  inventory: ITEMS.slice(8),
  equipment: {
    mainHand: ITEMS[0],
    offHand: ITEMS[1],
    head: ITEMS[2],
    chest: ITEMS[3],
    pants: ITEMS[4],
    boots: ITEMS[5],
    ring1: ITEMS[6],
    ring2: ITEMS[7],
  },
};

export const INITIAL_GAME: GameState = {
  characterCreated: false,
  character: INITIAL_CHARACTER,
  adventure: { mode: "story", active: false, nodeIndex: 0, carryHp: null, combat: null, eventResolved: false, latestLoot: null, pendingReward: null, completed: false },
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
  bonusDirectDamageFromArmorRatio: number;
  guardMultiplier: number;
  healingReceivedMultiplier: number;
  bleedDamageTakenMultiplier: number;
  lootRarityBonus: number;
  chanceEffectBonus: number;
  statusDamageMultipliers: Partial<Record<StatusEffectId, number>>;
  preserveStatusOnDetonation: StatusEffectId[];
  statusImmunities: StatusEffectId[];
  statusApplicationStacks: Partial<Record<StatusEffectId, number>>;
  statusDurationBonuses: Partial<Record<StatusEffectId, number>>;
  statusDamageLeech: Partial<Record<StatusEffectId, number>>;
  statusApplicationCompanions: Partial<Record<StatusEffectId, StatusEffectId[]>>;
  incomingDamageReductionPerEnergy: number;
  incomingDamageMultiplierWhileStunned: number;
  deathPreventionHealRatio: number;
  deathPreventionStealthDuration: number;
  deathPreventionConsumeStatusForHealing?: StatusEffectId;
  guaranteedHitAgainstStatusStacks: Partial<Record<StatusEffectId, number>>;
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
  const energyRegen = 2 + features.passive.energyRegen;
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
    dodgeChance: getEffectiveDodgeChance(0.02 + stats.agility * 0.004 + features.passive.dodgeChance),
    initiativeBonus: Math.round(stats.agility * 0.5 + stats.intelligence * 0.25 + features.passive.initiative),
    bonusDirectDamageFromArmorRatio: features.passive.bonusDirectDamageFromArmorRatio,
    guardMultiplier: 1 + stats.strength * 0.01 + features.passive.guardGeneration,
    healingReceivedMultiplier: 1 + stats.vitality * 0.005 + features.passive.healingReceived,
    bleedDamageTakenMultiplier: Math.max(0, 1 - features.passive.bleedDamageReduction),
    lootRarityBonus: stats.luck * 0.01 + features.passive.lootRarity,
    chanceEffectBonus: stats.luck * 0.0025 + features.passive.chanceEffect,
    statusDamageMultipliers: Object.fromEntries(Object.entries(features.passive.statusDamage).map(([id, bonus]) => [id, 1 + bonus])),
    preserveStatusOnDetonation: [...features.passive.preserveStatusOnDetonation],
    statusImmunities: [...features.passive.statusImmunities],
    statusApplicationStacks: { ...features.passive.statusApplicationStacks },
    statusDurationBonuses: { ...features.passive.statusDurationBonuses },
    statusDamageLeech: { ...features.passive.statusDamageLeech },
    statusApplicationCompanions: Object.fromEntries(Object.entries(features.passive.statusApplicationCompanions).map(([id, companions]) => [id, [...(companions ?? [])]])),
    incomingDamageReductionPerEnergy: features.passive.incomingDamageReductionPerEnergy,
    incomingDamageMultiplierWhileStunned: features.passive.incomingDamageMultiplierWhileStunned,
    deathPreventionHealRatio: features.passive.deathPreventionHealRatio,
    deathPreventionStealthDuration: features.passive.deathPreventionStealthDuration,
    deathPreventionConsumeStatusForHealing: features.passive.deathPreventionConsumeStatusForHealing,
    guaranteedHitAgainstStatusStacks: { ...features.passive.guaranteedHitAgainstStatusStacks },
  };
}
