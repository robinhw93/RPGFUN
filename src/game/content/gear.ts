import type { GearSetBonusDefinition, GearSetDefinition, InventoryItem } from "../types";

export const ITEMS: InventoryItem[] = [
  {
    "kind": "consumable",
    "id": "consumable-ms0e3hjh-5bewd",
    "name": "Yumberries",
    "goldCost": 8,
    "rarity": "common",
    "description": "Applies Regenerate.",
    "effects": [
      {
        "type": "apply_status",
        "target": "self",
        "status": "regenerate",
        "stacks": 1,
        "duration": 3
      }
    ]
  },
  {
    "kind": "consumable",
    "id": "consumable-ms0e551z-v6qcf",
    "name": "Minor Healing Potion",
    "goldCost": 8,
    "rarity": "common",
    "description": "Restores 10 hit points.",
    "effects": [
      {
        "type": "heal",
        "amount": 10
      }
    ]
  }
];

export const GEAR_SETS: GearSetDefinition[] = [];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = GEAR_SETS.flatMap((set) => set.bonuses.map((bonus) => ({
  ...bonus,
  setId: set.id,
  setName: set.name,
})));
