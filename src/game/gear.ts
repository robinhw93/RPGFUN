import { ADVENTURE, ITEMS } from "./data";
import type { ArmorMaterial, CharacterState, GearItem, GearSlot, WeaponEquipType, WeaponKind } from "./types";

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

export function getWeaponEquipType(item?: GearItem): WeaponEquipType | null {
  if (!item || (item.slot !== "mainHand" && item.slot !== "offHand")) return null;
  if (item.weaponEquipType) return item.weaponEquipType;
  if (item.weaponType === "twoHanded") return "twoHand";
  if (item.slot === "offHand") return "offHand";
  return item.weaponType === "oneHanded" ? "oneHand" : "mainHand";
}

export function getWeaponKind(item?: GearItem): WeaponKind | null {
  if (!item || (item.slot !== "mainHand" && item.slot !== "offHand")) return null;
  if (item.weaponKind) return item.weaponKind;
  return item.slot === "offHand" ? "shield" : "sword";
}

export function getArmorMaterial(item: GearItem | undefined, slot: GearSlot | GearItem["slot"]): ArmorMaterial {
  if (item?.armorMaterial) return item.armorMaterial;
  if (item?.id === "wandererHood" || item?.id === "veilTrousers" || item?.id === "roadBoots") return "leather";
  if (slot === "pants") return "cloth";
  if (slot === "boots") return "leather";
  return "plate";
}

export function isTwoHandWeapon(item?: GearItem): boolean {
  return getWeaponEquipType(item) === "twoHand";
}

export function isEquipmentSlotLocked(slot: GearSlot, equipment: CharacterState["equipment"]): boolean {
  return slot === "offHand" && isTwoHandWeapon(equipment.mainHand);
}

export function slotForItem(item: GearItem, equipment: CharacterState["equipment"], preferredSlot?: GearSlot): GearSlot {
  if (item.slot === "ring") {
    if (preferredSlot === "ring1" || preferredSlot === "ring2") return preferredSlot;
    return !equipment.ring1 ? "ring1" : !equipment.ring2 ? "ring2" : "ring1";
  }

  const equipType = getWeaponEquipType(item);
  if (!equipType) return item.slot;
  if (equipType === "offHand") return "offHand";
  if (equipType === "mainHand" || equipType === "twoHand") return "mainHand";
  if (preferredSlot === "mainHand" || preferredSlot === "offHand") return preferredSlot;
  if (!equipment.mainHand || isTwoHandWeapon(equipment.mainHand)) return "mainHand";
  return !equipment.offHand ? "offHand" : "mainHand";
}

export function equipGearItem(character: CharacterState, item: GearItem, preferredSlot?: GearSlot): CharacterState {
  const targetSlot = slotForItem(item, character.equipment, preferredSlot);
  if (isEquipmentSlotLocked(targetSlot, character.equipment)) return character;

  const equipment = { ...character.equipment };
  const inventory = [...character.inventory];
  const inventoryIndex = inventory.findIndex((candidate) => candidate.id === item.id);
  if (inventoryIndex >= 0) inventory.splice(inventoryIndex, 1);

  const moveEquippedToInventory = (slot: GearSlot) => {
    const equipped = equipment[slot];
    if (equipped && equipped.id !== item.id) inventory.push(equipped);
    delete equipment[slot];
  };

  if (getWeaponEquipType(item) === "twoHand") {
    moveEquippedToInventory("mainHand");
    moveEquippedToInventory("offHand");
  } else {
    moveEquippedToInventory(targetSlot);
  }

  equipment[targetSlot] = item;
  return { ...character, inventory, equipment };
}

export function unequipGearItem(character: CharacterState, slot: GearSlot): CharacterState {
  const item = character.equipment[slot];
  if (!item) return character;
  const equipment = { ...character.equipment };
  delete equipment[slot];
  return { ...character, equipment, inventory: [...character.inventory, item] };
}

export function getGearCategoryLabel(item: GearItem): string {
  const equipType = getWeaponEquipType(item);
  if (equipType) {
    const equipLabels: Record<WeaponEquipType, string> = {
      mainHand: "Main Hand",
      oneHand: "One-Hand",
      offHand: "Off Hand",
      twoHand: "Two-Hand",
    };
    const kind = getWeaponKind(item) ?? "sword";
    return `${equipLabels[equipType]} · ${kind[0].toUpperCase()}${kind.slice(1)}`;
  }
  if (item.slot === "ring") return "Ring";
  const material = getArmorMaterial(item, item.slot);
  const slot = `${item.slot[0].toUpperCase()}${item.slot.slice(1)}`;
  return `${material[0].toUpperCase()}${material.slice(1)} ${slot}`;
}
