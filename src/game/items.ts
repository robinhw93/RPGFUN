import { STATUS_EFFECTS } from "./statusEffects";
import { getWeaponEquipType, isEquipmentSlotLocked } from "./gear";
import type { CharacterState, ConsumableEffect, ConsumableItem, GearItem, GearSlot, InventoryItem, MiscItem } from "./types";

const DEFAULT_GEAR_COSTS = { common: 12, uncommon: 28, rare: 65, epic: 140, legendary: 300 } as const;
const DEFAULT_CONSUMABLE_COSTS = { common: 8, uncommon: 15, rare: 30, epic: 60, legendary: 120 } as const;

export function isConsumableItem(item: InventoryItem): item is ConsumableItem {
  return item.kind === "consumable";
}

export function isGearItem(item: InventoryItem): item is GearItem {
  return item.kind === "gear" || item.kind === undefined;
}

export function isMiscItem(item: InventoryItem): item is MiscItem {
  return item.kind === "misc";
}

/** Returns a compatible empty slot without replacing any currently equipped gear. */
export function getAutomaticEquipSlot(character: CharacterState, item: InventoryItem): GearSlot | null {
  if (!isGearItem(item)) return null;
  const equipment = character.equipment;

  if (item.slot === "ring") {
    if (!equipment.ring1) return "ring1";
    if (!equipment.ring2) return "ring2";
    return null;
  }

  const weaponEquipType = getWeaponEquipType(item);
  if (weaponEquipType === "twoHand") {
    return !equipment.mainHand && !equipment.offHand ? "mainHand" : null;
  }
  if (weaponEquipType === "mainHand") return !equipment.mainHand ? "mainHand" : null;
  if (weaponEquipType === "offHand") {
    return !equipment.offHand && !isEquipmentSlotLocked("offHand", equipment) ? "offHand" : null;
  }
  if (weaponEquipType === "oneHand") {
    if (!equipment.mainHand) return "mainHand";
    if (!equipment.offHand && !isEquipmentSlotLocked("offHand", equipment)) return "offHand";
    return null;
  }

  const slot = item.slot as GearSlot;
  return equipment[slot] ? null : slot;
}

export interface ItemAcquisitionResult {
  character: CharacterState;
  equippedSlot: GearSlot | null;
}

/** Adds a newly acquired independent copy, equipping gear only when its compatible slot is empty. */
export function acquireItem(character: CharacterState, item: InventoryItem): ItemAcquisitionResult {
  const receivedItem = structuredClone(item);
  const equippedSlot = getAutomaticEquipSlot(character, receivedItem);
  if (equippedSlot) {
    return {
      equippedSlot,
      character: {
        ...character,
        equipment: { ...character.equipment, [equippedSlot]: receivedItem },
      },
    };
  }
  return {
    equippedSlot: null,
    character: { ...character, inventory: [...character.inventory, receivedItem] },
  };
}

export function acquireItems(character: CharacterState, items: InventoryItem[]): CharacterState {
  return items.reduce((current, item) => acquireItem(current, item).character, character);
}

export interface GroupedInventoryItem {
  item: InventoryItem;
  count: number;
}

/** Groups identical catalog items while preserving their first appearance order. */
export function groupInventoryItems(items: InventoryItem[]): GroupedInventoryItem[] {
  const grouped = new Map<string, GroupedInventoryItem>();
  items.forEach((item) => {
    const existing = grouped.get(item.id);
    if (existing) existing.count += 1;
    else grouped.set(item.id, { item, count: 1 });
  });
  return [...grouped.values()];
}

export function getItemGoldCost(item: InventoryItem): number {
  if (typeof item.goldCost === "number" && Number.isFinite(item.goldCost)) return Math.max(0, Math.round(item.goldCost));
  return isConsumableItem(item) ? DEFAULT_CONSUMABLE_COSTS[item.rarity] : isGearItem(item) ? DEFAULT_GEAR_COSTS[item.rarity] : 0;
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
    case "remove_status": {
      const status = STATUS_EFFECTS[effect.status];
      const target = effect.target === "self" ? "yourself" : effect.target === "target" ? "the selected enemy" : "all enemies";
      return `Remove ${status.name} from ${target}.`;
    }
  }
}
