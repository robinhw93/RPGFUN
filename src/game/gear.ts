import { ADVENTURE, ITEMS } from "./data";
import type { CharacterState, GearItem, GearSlot } from "./types";

export function getLoot(nodeIndex: number): GearItem {
  if (nodeIndex >= ADVENTURE.length - 1) return ITEMS[8];
  const pool = ITEMS.slice(1, 8);
  return pool[(nodeIndex * 3 + 1) % pool.length];
}

export function slotForItem(item: GearItem, equipment: CharacterState["equipment"]): GearSlot {
  if (item.slot !== "ring") return item.slot;
  return !equipment.ring1 ? "ring1" : !equipment.ring2 ? "ring2" : "ring1";
}
