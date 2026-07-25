import { getDerivedStats } from "./character";
import { ITEMS } from "./data";
import { getItemGoldCost, isConsumableItem, isGearItem } from "./items";
import type { ArkenfallVendorId, GameState, InventoryItem, ItemCraftingRecipe } from "./types";

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

export function getTownVendorStock(vendor: ArkenfallVendorId): InventoryItem[] {
  return ITEMS.filter((item) => getArkenfallVendor(item) === vendor);
}

export function getTownCraftingCatalog(station: ArkenfallVendorId): InventoryItem[] {
  return ITEMS.filter((item) => getItemCraftingRecipe(item)?.station === station);
}

export function getInventoryItemCount(inventory: InventoryItem[], itemId: string): number {
  return inventory.reduce((count, item) => count + (item.id === itemId ? 1 : 0), 0);
}

export function canCraftTownItem(inventory: InventoryItem[], item: InventoryItem, station: ArkenfallVendorId): boolean {
  const recipe = getItemCraftingRecipe(item);
  return Boolean(recipe && recipe.station === station && recipe.ingredients.every((ingredient) => getInventoryItemCount(inventory, ingredient.itemId) >= ingredient.quantity));
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
  if (!item || getArkenfallVendor(item) !== vendor) return { state, success: false, message: "That item is not sold here." };
  const cost = getItemGoldCost(item);
  if (state.character.gold < cost) return { state, success: false, message: `You need ${cost - state.character.gold} more Gold.` };
  return {
    state: {
      ...state,
      character: {
        ...state.character,
        gold: state.character.gold - cost,
        inventory: [...state.character.inventory, structuredClone(item)],
      },
    },
    success: true,
    message: `${item.name} added to your Inventory.`,
    item,
  };
}

export function craftTownItem(state: GameState, station: ArkenfallVendorId, itemId: string): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "Finish your current adventure before crafting." };
  const item = ITEMS.find((candidate) => candidate.id === itemId);
  const recipe = item ? getItemCraftingRecipe(item) : null;
  if (!item || !recipe || recipe.station !== station) return { state, success: false, message: "That item cannot be made here." };
  if (!canCraftTownItem(state.character.inventory, item, station)) return { state, success: false, message: "You do not have all the required materials." };
  return {
    state: {
      ...state,
      character: {
        ...state.character,
        inventory: [...removeCraftingIngredients(state.character.inventory, recipe), structuredClone(item)],
      },
    },
    success: true,
    message: station === "alchemist" ? `${item.name} brewed successfully.` : `${item.name} crafted successfully.`,
    item,
  };
}

export function restAtArkenfallTavern(state: GameState): TownActionResult {
  if (state.adventure.active) return { state, success: false, message: "You cannot rest while an adventure is in progress." };
  const maxHp = getDerivedStats(state.character).maxHp;
  const currentHp = Math.min(maxHp, state.adventure.carryHp ?? maxHp);
  if (currentHp >= maxHp) return { state, success: false, message: "You are already fully rested." };
  return {
    state: { ...state, adventure: { ...state.adventure, carryHp: maxHp } },
    success: true,
    message: `You rest by the hearth and recover ${maxHp - currentHp} Health.`,
  };
}
