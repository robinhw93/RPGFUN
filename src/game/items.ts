import { STATUS_EFFECTS } from "./statusEffects";
import type { ConsumableEffect, ConsumableItem, GearItem, InventoryItem } from "./types";

const DEFAULT_GEAR_COSTS = { common: 12, uncommon: 28, rare: 65, epic: 140 } as const;
const DEFAULT_CONSUMABLE_COSTS = { common: 8, uncommon: 15, rare: 30, epic: 60 } as const;

export function isConsumableItem(item: InventoryItem): item is ConsumableItem {
  return item.kind === "consumable";
}

export function isGearItem(item: InventoryItem): item is GearItem {
  return !isConsumableItem(item);
}

export function getItemGoldCost(item: InventoryItem): number {
  if (typeof item.goldCost === "number" && Number.isFinite(item.goldCost)) return Math.max(0, Math.round(item.goldCost));
  return isConsumableItem(item) ? DEFAULT_CONSUMABLE_COSTS[item.rarity] : DEFAULT_GEAR_COSTS[item.rarity];
}

export function getItemSellValue(item: InventoryItem): number {
  const goldCost = getItemGoldCost(item);
  return goldCost > 0 ? Math.max(1, Math.floor(goldCost * 0.25)) : 0;
}

export function consumableCount(inventory: InventoryItem[], itemId: string): number {
  return inventory.filter((item) => isConsumableItem(item) && item.id === itemId).length;
}

export function removeOneConsumable(inventory: InventoryItem[], itemId: string): InventoryItem[] {
  const index = inventory.findIndex((item) => isConsumableItem(item) && item.id === itemId);
  return index < 0 ? inventory : inventory.filter((_, itemIndex) => itemIndex !== index);
}

export function consumableNeedsTarget(item: ConsumableItem): boolean {
  return item.effects.some((effect) => "target" in effect && effect.target === "target");
}

export function describeConsumableEffect(effect: ConsumableEffect): string {
  switch (effect.type) {
    case "heal": return `Restore ${effect.amount} Health.`;
    case "gain_energy": return `Restore ${effect.amount} Energy.`;
    case "change_energy": return effect.amount >= 0 ? `Gain ${effect.amount} Energy.` : `Lose ${Math.abs(effect.amount)} Energy.`;
    case "change_next_turn_energy_regen": return effect.amount >= 0
      ? `Gain +${effect.amount} Energy regeneration next turn.`
      : `Suffer ${effect.amount} Energy regeneration next turn.`;
    case "damage": return `Deal ${effect.amount} damage to ${effect.target === "self" ? "yourself" : effect.target === "target" ? "the selected enemy" : "all enemies"}.`;
    case "apply_status": {
      const status = STATUS_EFFECTS[effect.status];
      const target = effect.target === "self" ? "yourself" : effect.target === "target" ? "the selected enemy" : "all enemies";
      return `Apply ${effect.stacks} ${status.name} for ${effect.duration} turn${effect.duration === 1 ? "" : "s"} to ${target}.`;
    }
  }
}
