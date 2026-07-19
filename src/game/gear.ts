import { ADVENTURE, ITEMS } from "./data";
import type { CharacterState, GearItem, GearSlot } from "./types";

const BASE_RARITY_WEIGHTS: Record<GearItem["rarity"], number> = {
  common: 55,
  uncommon: 28,
  rare: 13,
  epic: 4,
};

const RARITY_TIERS: Record<GearItem["rarity"], number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
};

export function getLoot(nodeIndex: number, lootRarityBonus = 0): GearItem {
  if (nodeIndex >= ADVENTURE.length - 1) return ITEMS[8];
  const pool = ITEMS.slice(1, 8);
  const weights = pool.map((item) => BASE_RARITY_WEIGHTS[item.rarity] * (1 + Math.max(0, lootRarityBonus) * RARITY_TIERS[item.rarity]));
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let roll = Math.random() * totalWeight;
  const selectedIndex = weights.findIndex((weight) => {
    roll -= weight;
    return roll <= 0;
  });
  return pool[selectedIndex >= 0 ? selectedIndex : pool.length - 1];
}

export function slotForItem(item: GearItem, equipment: CharacterState["equipment"]): GearSlot {
  if (item.slot !== "ring") return item.slot;
  return !equipment.ring1 ? "ring1" : !equipment.ring2 ? "ring2" : "ring1";
}
