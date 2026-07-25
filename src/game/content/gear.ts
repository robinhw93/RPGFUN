import type { GearSetBonusDefinition, GearSetDefinition, InventoryItem } from "../types";

export const ITEMS: InventoryItem[] = [
  {
    "id": "ironCleaver",
    "name": "Notched Iron Cleaver",
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "axe",
    "rarity": "uncommon",
    "description": "Still sharp enough to draw blood.",
    "stats": {
      "strength": 2
    },
    "physicalPower": 3,
    "set": "ashborn",
    "setName": "Ashborn Warplate",
    "kind": "gear"
  },
  {
    "id": "embershard",
    "name": "Embershard Focus",
    "slot": "offHand",
    "weaponEquipType": "offHand",
    "weaponKind": "tome",
    "rarity": "rare",
    "description": "Warm whispers curl around the crystal.",
    "stats": {
      "intelligence": 3
    },
    "magicalPower": 2,
    "kind": "gear"
  },
  {
    "id": "wandererHood",
    "name": "Wanderer's Hood",
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "A little anonymity goes a long way.",
    "stats": {
      "agility": 1
    },
    "armor": 1,
    "kind": "gear"
  },
  {
    "id": "ashCuirass",
    "name": "Ashborn Cuirass",
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "Forged in a fire that never cooled.",
    "stats": {
      "strength": 2,
      "vitality": 2
    },
    "armor": 5,
    "set": "ashborn",
    "setName": "Ashborn Warplate",
    "kind": "gear"
  },
  {
    "id": "veilTrousers",
    "name": "Veilwalker Trousers",
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "They leave no footprint in soot.",
    "stats": {
      "agility": 2
    },
    "armor": 2,
    "set": "veilwalker",
    "setName": "Veilwalker's Guile",
    "kind": "gear"
  },
  {
    "id": "roadBoots",
    "name": "Dustworn Boots",
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "Made for roads best left unnamed.",
    "stats": {
      "vitality": 1
    },
    "armor": 1,
    "kind": "gear"
  },
  {
    "id": "garnetBand",
    "name": "Garnet Signet",
    "slot": "ring",
    "rarity": "rare",
    "description": "A noble crest has been scratched away.",
    "stats": {
      "strength": 1,
      "luck": 2
    },
    "kind": "gear"
  },
  {
    "id": "moonRing",
    "name": "Moonlit Coil",
    "slot": "ring",
    "rarity": "epic",
    "description": "Its silver surface reflects an unfamiliar sky.",
    "stats": {
      "intelligence": 2,
      "agility": 1,
      "luck": 1
    },
    "kind": "gear"
  },
  {
    "id": "wardenHelm",
    "name": "Warden's Broken Crown",
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "The last ember still burns within.",
    "stats": {
      "vitality": 3,
      "strength": 2
    },
    "armor": 4,
    "set": "ashborn",
    "setName": "Ashborn Warplate",
    "kind": "gear"
  },
  {
    "id": "greybackTusk",
    "name": "Forest Spirit Charm",
    "slot": "ring",
    "rarity": "epic",
    "description": "Green-gold light turns slowly inside the living wooden ring.",
    "stats": {
      "vitality": 3,
      "luck": 2
    },
    "armor": 2,
    "kind": "gear"
  },
  {
    "id": "seerCowl",
    "name": "Cowl of Quiet Sparks",
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "Tiny runes brighten whenever danger draws near.",
    "stats": {
      "intelligence": 2
    },
    "magicResistance": 2,
    "kind": "gear"
  },
  {
    "id": "nightstitchVest",
    "name": "Nightstitch Vest",
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "Supple leather sewn for swift, silent movement.",
    "stats": {
      "agility": 2,
      "vitality": 1
    },
    "armor": 3,
    "kind": "gear"
  },
  {
    "id": "emberweaveRobe",
    "name": "Emberweave Robe",
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "Warm threads carry old protective sigils.",
    "stats": {
      "intelligence": 3
    },
    "armor": 1,
    "magicResistance": 4,
    "kind": "gear"
  },
  {
    "id": "ashboundLegguards",
    "name": "Ashbound Legguards",
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "Blackened plates that still hold the Warden's heat.",
    "stats": {
      "strength": 1,
      "vitality": 2
    },
    "armor": 4,
    "set": "ashborn",
    "setName": "Ashborn Warplate",
    "kind": "gear"
  },
  {
    "id": "runeclothLegwraps",
    "name": "Runecloth Legwraps",
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "Loose-woven cloth marked with patient warding ink.",
    "stats": {
      "intelligence": 2,
      "luck": 1
    },
    "magicResistance": 2,
    "kind": "gear"
  },
  {
    "id": "ironmarchSabatons",
    "name": "Ironmarch Sabatons",
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "Every heavy step sounds like a closing gate.",
    "stats": {
      "strength": 1,
      "vitality": 2
    },
    "armor": 4,
    "kind": "gear"
  },
  {
    "id": "softstepSlippers",
    "name": "Softstep Slippers",
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "Enchanted soles soften even a hurried retreat.",
    "stats": {
      "agility": 2,
      "intelligence": 1
    },
    "magicResistance": 1,
    "kind": "gear"
  },
  {
    "id": "copperLoop",
    "name": "Wayfarer's Copper Loop",
    "slot": "ring",
    "rarity": "common",
    "description": "A plain ring polished smooth by years on the road.",
    "stats": {
      "vitality": 1,
      "luck": 1
    },
    "kind": "gear"
  },
  {
    "id": "wardenShortsword",
    "name": "Warden's Shortsword",
    "slot": "mainHand",
    "weaponEquipType": "mainHand",
    "weaponKind": "sword",
    "rarity": "uncommon",
    "description": "A disciplined blade balanced for the dominant hand.",
    "stats": {
      "strength": 2
    },
    "physicalPower": 4,
    "kind": "gear"
  },
  {
    "id": "pilgrimMace",
    "name": "Cinder Pilgrim's Mace",
    "slot": "mainHand",
    "weaponEquipType": "mainHand",
    "weaponKind": "mace",
    "rarity": "rare",
    "description": "Its scorched head rewards deliberate, crushing blows.",
    "stats": {
      "strength": 3,
      "vitality": 1
    },
    "physicalPower": 5,
    "kind": "gear"
  },
  {
    "id": "veilDagger",
    "name": "Veilglass Dagger",
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "dagger",
    "rarity": "rare",
    "description": "A thin edge suited to either hand.",
    "stats": {
      "agility": 3
    },
    "physicalPower": 3,
    "kind": "gear"
  },
  {
    "id": "ashWand",
    "name": "Ashen Conduit",
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "wand",
    "rarity": "epic",
    "description": "A charred wand that focuses heat into precise sigils.",
    "stats": {
      "intelligence": 3,
      "luck": 1
    },
    "magicalPower": 5,
    "kind": "gear"
  },
  {
    "id": "gateShield",
    "name": "Black Gate Buckler",
    "slot": "offHand",
    "weaponEquipType": "offHand",
    "weaponKind": "shield",
    "rarity": "uncommon",
    "description": "A compact shield scarred by countless claws.",
    "stats": {
      "vitality": 2
    },
    "armor": 3,
    "kind": "gear"
  },
  {
    "id": "greatsword",
    "name": "Roadcleaver Greatsword",
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "sword",
    "rarity": "rare",
    "description": "A broad blade that leaves no hand free for defense.",
    "stats": {
      "strength": 4
    },
    "physicalPower": 7,
    "kind": "gear"
  },
  {
    "id": "greataxe",
    "name": "Ashfall Greataxe",
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "axe",
    "rarity": "epic",
    "description": "Its crescent edge falls with the weight of a burned oak.",
    "stats": {
      "strength": 5,
      "vitality": 1
    },
    "physicalPower": 8,
    "kind": "gear"
  },
  {
    "id": "greatmace",
    "name": "Gatebreaker Maul",
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "mace",
    "rarity": "rare",
    "description": "Built to turn armor, stone, and bone into rubble.",
    "stats": {
      "strength": 4,
      "vitality": 2
    },
    "physicalPower": 7,
    "kind": "gear"
  },
  {
    "id": "emberstaff",
    "name": "Embercaller's Staff",
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "rarity": "epic",
    "description": "A living coal glows between its forked branches.",
    "stats": {
      "intelligence": 5
    },
    "magicalPower": 8,
    "kind": "gear"
  },
  {
    "id": "cinderPolearm",
    "name": "Cinderwatch Polearm",
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "polearm",
    "rarity": "rare",
    "description": "Long reach keeps the ash-born at a cautious distance.",
    "stats": {
      "strength": 2,
      "agility": 3
    },
    "physicalPower": 7,
    "kind": "gear"
  },
  {
    "kind": "consumable",
    "id": "healingDraught",
    "name": "Healing Draught",
    "rarity": "common",
    "description": "A sharp herbal draught that restores 15 Health.",
    "effects": [
      {
        "type": "heal",
        "amount": 15
      }
    ]
  },
  {
    "kind": "consumable",
    "id": "energizingTonic",
    "name": "Energizing Tonic",
    "rarity": "uncommon",
    "description": "Crackling citrus and bitter root restore 3 Energy.",
    "effects": [
      {
        "type": "gain_energy",
        "amount": 3
      }
    ]
  },
  {
    "kind": "consumable",
    "id": "hexFlask",
    "name": "Hex Flask",
    "rarity": "rare",
    "description": "A thrown curse that applies Weaken to the selected enemy for 3 turns.",
    "effects": [
      {
        "type": "apply_status",
        "target": "target",
        "status": "weaken",
        "stacks": 1,
        "duration": 3
      }
    ]
  },
  {
    "kind": "consumable",
    "id": "volatileFlask",
    "name": "Volatile Flask",
    "rarity": "rare",
    "description": "An unstable mixture that deals 6 damage to every enemy.",
    "effects": [
      {
        "type": "damage",
        "target": "all_enemies",
        "amount": 6
      }
    ]
  }
];

export const GEAR_SETS: GearSetDefinition[] = [
  {
    "id": "ashborn",
    "name": "Ashborn Warplate",
    "pieceCount": 4,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+2 Strength.",
        "passive": {
          "stats": {
            "strength": 2
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "Bleed only deals half damage to you.",
        "passive": {
          "bleedDamageReduction": 0.5
        },
        "specialEffectNotes": "Bleed damage taken is reduced by 50%."
      },
      {
        "requiredPieces": 4,
        "description": "+3 Vitality.",
        "passive": {
          "stats": {
            "vitality": 3
          }
        }
      }
    ]
  },
  {
    "id": "veilwalker",
    "name": "Veilwalker's Guile",
    "pieceCount": 4,
    "bonuses": []
  }
];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = GEAR_SETS.flatMap((set) => set.bonuses.map((bonus) => ({
  ...bonus,
  setId: set.id,
  setName: set.name,
})));
