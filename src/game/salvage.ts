import { ADVENTURES, ENEMIES, ITEMS } from "./data";
import { acquireItem, getItemGoldCost, isGearItem } from "./items";
import type { CharacterState, GearItem, InventoryItem, ItemRarity } from "./types";

const SALVAGE_YIELD: Record<ItemRarity, number> = { common: 1, uncommon: 3, rare: 8, epic: 20, legendary: 50 };
const REFORGE_MULTIPLIER: Record<ItemRarity, number> = { common: 8, uncommon: 12, rare: 24, epic: 48, legendary: 100 };

export interface SalvageResult {
  character: CharacterState;
  success: boolean;
  message: string;
}

export function getSalvageYield(item: InventoryItem): number {
  return isGearItem(item) ? SALVAGE_YIELD[item.rarity] : 0;
}

export function getReforgeCost(item: GearItem): { essence: number; gold: number } {
  return { essence: REFORGE_MULTIPLIER[item.rarity], gold: Math.max(10, getItemGoldCost(item)) };
}

export function getItemSourceAdventureId(itemId: string): string | null {
  for (const adventure of ADVENTURES) {
    const stageDrop = adventure.stages.some((stage) => stage.dropTable?.some((drop) => drop.itemId === itemId));
    const enemyDrop = adventure.stages.some((stage) => stage.entries.some((entry) => (entry.enemyIds ?? []).some((enemyId) => (
      ENEMIES[enemyId]?.dropTable?.some((drop) => drop.itemId === itemId)
    ))));
    if (stageDrop || enemyDrop) return adventure.id;
  }
  return null;
}

export function getReforgeableSetItems(character: CharacterState): GearItem[] {
  return ITEMS.filter((item): item is GearItem => {
    if (!isGearItem(item) || !item.set) return false;
    const source = getItemSourceAdventureId(item.id);
    return Boolean(source && character.completedAdventureIds.includes(source));
  });
}

export function salvageInventoryItem(character: CharacterState, itemId: string): SalvageResult {
  const index = character.inventory.findIndex((item) => item.id === itemId && isGearItem(item));
  if (index < 0) return { character, success: false, message: "That item is not available to salvage." };
  const item = character.inventory[index];
  const essence = getSalvageYield(item);
  const inventory = [...character.inventory];
  inventory.splice(index, 1);
  return {
    success: true,
    message: `${item.name} became ${essence} Echo Essence.`,
    character: { ...character, inventory, salvageEssence: (character.salvageEssence ?? 0) + essence },
  };
}

export function reforgeSetItem(character: CharacterState, itemId: string): SalvageResult {
  const item = getReforgeableSetItems(character).find((candidate) => candidate.id === itemId);
  if (!item) return { character, success: false, message: "Complete the item's adventure before reforging it." };
  const cost = getReforgeCost(item);
  if ((character.salvageEssence ?? 0) < cost.essence || character.gold < cost.gold) {
    return { character, success: false, message: `You need ${cost.essence} Echo Essence and ${cost.gold} Gold.` };
  }
  const paid = { ...character, salvageEssence: character.salvageEssence - cost.essence, gold: character.gold - cost.gold };
  return {
    success: true,
    message: `${item.name} was reforged.`,
    character: acquireItem(paid, item).character,
  };
}
