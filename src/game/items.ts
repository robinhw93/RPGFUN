import { STATUS_EFFECTS } from "./statusEffects";
import type { ConsumableEffect, ConsumableItem, GearItem, InventoryItem } from "./types";

export function isConsumableItem(item: InventoryItem): item is ConsumableItem {
  return item.kind === "consumable";
}

export function isGearItem(item: InventoryItem): item is GearItem {
  return !isConsumableItem(item);
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
