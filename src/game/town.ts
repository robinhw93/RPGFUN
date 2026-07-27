import { getDerivedStats } from "./character";
import { ITEMS } from "./data";
import { acquireItem, getItemGoldCost, getItemSellValue, isConsumableItem, isGearItem } from "./items";
import type { ArkenfallVendorId, GameState, InventoryItem, ItemCraftingRecipe, StatusEffectId } from "./types";

export type TavernMealId = "ironpot-stew" | "peppercrust-boar" | "hartroot-broth";

export interface TavernMealDefinition {
  id: TavernMealId;
  name: string;
  description: string;
  cost: number;
  status: Extract<StatusEffectId, "strengthened" | "fierce" | "regenerate">;
}

export const TAVERN_MEALS: TavernMealDefinition[] = [
  {
    id: "ironpot-stew",
    name: "Ironpot Stew",
    description: "A thick stew of root vegetables and slow-cooked beef.",
    cost: 5,
    status: "strengthened",
  },
  {
    id: "peppercrust-boar",
    name: "Peppercrust Boar",
    description: "Fire-roasted boar with enough spice to sharpen every sense.",
    cost: 8,
    status: "fierce",
  },
  {
    id: "hartroot-broth",
    name: "Hartroot Broth",
    description: "A restorative broth simmered with woodland herbs.",
    cost: 10,
    status: "regenerate",
  },
];

const LEGACY_RECIPES: Record<string, ItemCraftingRecipe> = {
  "gear-ms0h89t2-sczql": {
    station: "blacksmith",
    ingredients: [{ itemId: "item-ms0jf0sp-z8hcl", quantity: 2 }, { itemId: "item-ms0jd8ky-lu2zb", quantity: 1 }],
  },
  "gear-ms0h9jvh-cpg4y": {
    station: "blacksmith",
    ingredients: [{ itemId: "item-ms0jgblm-ko16i", quantity: 2 }, { itemId: "item-ms0jd8ky-lu2zb", quantity: 1 }],
  },
  "gear-ms0haj6d-e8pmv": {
    station: "blacksmith",
    ingredients: [{ itemId: "item-ms0jdzsp-pnyoa", quantity: 2 }, { itemId: "item-ms0jd8ky-lu2zb", quantity: 1 }],
  },
  "consumable-ms0e551z-v6qcf": {
    station: "alchemist",
    ingredients: [{ itemId: "consumable-ms0ifcle-isww5", quantity: 2 }, { itemId: "consumable-ms0e3hjh-5bewd", quantity: 1 }],
  },
};

export interface TownActionResult {
  state: GameState;
  success: boolean;
  message: string;
  item?: InventoryItem;
}

/** Resolves explicit editor data while preserving sensible stock for catalogs created before town support. */
export function getArkenfallVendor(item: InventoryItem): ArkenfallVendorId | null {
  if (item.arkenfallVendor !== undefined) return item.arkenfallVendor;
  if (isGearItem(item)) return "blacksmith";
  if (isConsumableItem(item)) return "alchemist";
  return null;
}

export function getItemCraftingRecipe(item: InventoryItem): ItemCraftingRecipe | null {
  if (item.craftingRecipe !== undefined) return item.craftingRecipe;
  return LEGACY_RECIPES[item.id] ?? null;
}

function meetsAdventureRequirement(requiredAdventureId: string | null | undefined, completedAdventureIds: string[]): boolean {
  return !requiredAdventureId || completedAdventureIds.includes(requiredAdventureId);
}

export function isTownVendorItemUnlocked(item: InventoryItem, completedAdventureIds: string[]): boolean {
  return meetsAdventureRequirement(item.vendorPrerequisiteAdventureId, completedAdventureIds);
}

export function isTownCraftingRecipeUnlocked(item: InventoryItem, completedAdventureIds: string[]): boolean {
  return meetsAdventureRequirement(getItemCraftingRecipe(item)?.prerequisiteAdventureId, completedAdventureIds);
}

export function getTownVendorStock(vendor: ArkenfallVendorId, completedAdventureIds: string[] = []): InventoryItem[] {
  return ITEMS.filter((item) => getArkenfallVendor(item) === vendor && isTownVendorItemUnlocked(item, completedAdventureIds));
}

export function getTownCraftingCatalog(station: ArkenfallVendorId, completedAdventureIds: string[] = []): InventoryItem[] {
  return ITEMS.filter((item) => getItemCraftingRecipe(item)?.station === station && isTownCraftingRecipeUnlocked(item, completedAdventureIds));
}

export function getInventoryItemCount(inventory: InventoryItem[], itemId: string): number {
  return inventory.reduce((count, item) => count + (item.id === itemId ? 1 : 0), 0);
}

export function canCraftTownItem(inventory: InventoryItem[], item: InventoryItem, station: ArkenfallVendorId, completedAdventureIds: string[] = []): boolean {
  const recipe = getItemCraftingRecipe(item);
  return Boolean(recipe && recipe.station === station && isTownCraftingRecipeUnlocked(item, completedAdventureIds) && recipe.ingredients.every((ingredient) => getInventoryItemCount(inventory, ingredient.itemId) >= ingredient.quantity));
}

function removeCraftingIngredients(inventory: InventoryItem[], recipe: ItemCraftingRecipe): InventoryItem[] {
  const remaining = new Map(recipe.ingredients.map((ingredient) => [ingredient.itemId, ingredient.quantity]));
  return inventory.filter((item) => {
    const needed = remaining.get(item.id) ?? 0;
    if (needed <= 0) return true;
    remaining.set(item.id, needed - 1);
    return false;
  });
}

export function purchaseTownItem(state: GameState, vendor: ArkenfallVendorId, itemId: string): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "Finish your current adventure before visiting a vendor." };
  const item = ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || getArkenfallVendor(item) !== vendor || !isTownVendorItemUnlocked(item, state.character.completedAdventureIds)) return { state, success: false, message: "That item is not sold here." };
  const cost = getItemGoldCost(item);
  if (state.character.gold < cost) return { state, success: false, message: `You need ${cost - state.character.gold} more Gold.` };
  const acquisition = acquireItem({ ...state.character, gold: state.character.gold - cost }, item);
  return {
    state: {
      ...state,
      character: acquisition.character,
    },
    success: true,
    message: acquisition.equippedSlot ? `${item.name} equipped automatically.` : `${item.name} added to inventory.`,
    item,
  };
}

export function craftTownItem(state: GameState, station: ArkenfallVendorId, itemId: string): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "Finish your current adventure before crafting." };
  const item = ITEMS.find((candidate) => candidate.id === itemId);
  const recipe = item ? getItemCraftingRecipe(item) : null;
  if (!item || !recipe || recipe.station !== station || !isTownCraftingRecipeUnlocked(item, state.character.completedAdventureIds)) return { state, success: false, message: "That item cannot be made here." };
  if (!canCraftTownItem(state.character.inventory, item, station, state.character.completedAdventureIds)) return { state, success: false, message: "You do not have all the required materials." };
  const acquisition = acquireItem({ ...state.character, inventory: removeCraftingIngredients(state.character.inventory, recipe) }, item);
  return {
    state: {
      ...state,
      character: acquisition.character,
    },
    success: true,
    message: acquisition.equippedSlot
      ? `${item.name} crafted and equipped automatically.`
      : station === "alchemist" ? `${item.name} brewed successfully.` : `${item.name} crafted successfully.`,
    item,
  };
}

/** Sells exactly one inventory copy to any Arkenfall vendor. */
export function sellTownItem(state: GameState, _vendor: ArkenfallVendorId, itemId: string): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "Finish your current adventure before visiting a vendor." };
  const inventoryIndex = state.character.inventory.findIndex((item) => item.id === itemId);
  if (inventoryIndex < 0) return { state, success: false, message: "That item is not in your inventory." };
  const item = state.character.inventory[inventoryIndex];
  const sellValue = getItemSellValue(item);
  if (sellValue <= 0) return { state, success: false, message: "That item has no sell value." };
  return {
    state: {
      ...state,
      character: {
        ...state.character,
        gold: state.character.gold + sellValue,
        inventory: state.character.inventory.filter((_, index) => index !== inventoryIndex),
      },
    },
    success: true,
    message: `${item.name} sold for ${sellValue} Gold.`,
    item,
  };
}

export function restAtArkenfallTavern(state: GameState): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "You cannot rest while an adventure is in progress." };
  const maxHp = getDerivedStats(state.character).maxHp;
  const currentHp = Math.min(maxHp, state.adventure.carryHp ?? maxHp);
  if (currentHp >= maxHp) return { state, success: false, message: "You are already fully rested." };
  const offer = getTavernRestOffer(currentHp, maxHp, state.character.gold);
  if (offer.goldCost <= 0) return { state, success: false, message: "You need at least 1 Gold to rest." };
  return {
    state: {
      ...state,
      character: { ...state.character, gold: state.character.gold - offer.goldCost },
      adventure: { ...state.adventure, carryHp: currentHp + offer.healthRestored },
    },
    success: true,
    message: `You rest by the hearth and recover ${offer.healthRestored} Health for ${offer.goldCost} Gold.`,
  };
}

export function getTavernRestCost(currentHp: number, maxHp: number): number {
  return Math.ceil(Math.max(0, maxHp - currentHp) / 5);
}

export function getTavernRestOffer(currentHp: number, maxHp: number, gold: number): { goldCost: number; healthRestored: number; fullyRestores: boolean } {
  const missingHp = Math.max(0, maxHp - Math.max(0, Math.min(currentHp, maxHp)));
  const goldCost = Math.min(Math.max(0, Math.floor(gold)), Math.ceil(missingHp / 5));
  const healthRestored = Math.min(missingHp, goldCost * 5);
  return { goldCost, healthRestored, fullyRestores: healthRestored === missingHp };
}

export function hasPreparedTavernMeal(state: GameState, meal: TavernMealDefinition): boolean {
  return state.adventure.nextCombatPlayerStatuses.some((effect) => effect.status === meal.status);
}

export function purchaseTavernMeal(state: GameState, mealId: TavernMealId): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "You cannot order a meal while an adventure is in progress." };
  const meal = TAVERN_MEALS.find((candidate) => candidate.id === mealId);
  if (!meal) return { state, success: false, message: "That meal is not on the menu." };
  if (hasPreparedTavernMeal(state, meal)) return { state, success: false, message: `${meal.name} is already prepared for your next combat.` };
  if (state.character.gold < meal.cost) return { state, success: false, message: `You need ${meal.cost - state.character.gold} more Gold.` };
  return {
    state: {
      ...state,
      character: { ...state.character, gold: state.character.gold - meal.cost },
      adventure: {
        ...state.adventure,
        nextCombatPlayerStatuses: [...state.adventure.nextCombatPlayerStatuses, { status: meal.status, stacks: 1 }],
      },
    },
    success: true,
    message: `${meal.name} will grant ${meal.status === "strengthened" ? "Strengthened" : meal.status === "fierce" ? "Fierce" : "Regenerate"} in your next combat.`,
  };
}
