import { createStatusEffect } from "../statusEffects";
import type { GearSetBonusDefinition, GearSetDefinition, InventoryItem } from "../types";

export const ITEMS: InventoryItem[] = [
  {
    "kind": "consumable",
    "id": "consumable-ms0e3hjh-5bewd",
    "name": "Yumberry",
    "rarity": "common",
    "description": "Gives Regenerate.",
    "effects": [
      {
        "type": "apply_status",
        "target": "self",
        "status": "regenerate",
        "stacks": 1,
        "duration": 3
      }
    ],
    "goldCost": 25,
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms0e551z-v6qcf",
    "name": "Minor Healing Potion",
    "rarity": "common",
    "description": "Restores health.",
    "effects": [
      {
        "type": "heal",
        "amount": 20
      }
    ],
    "goldCost": 20,
    "arkenfallVendor": "alchemist",
    "craftingRecipe": {
      "station": "alchemist",
      "ingredients": [
        {
          "itemId": "consumable-ms0ifcle-isww5",
          "quantity": 1
        },
        {
          "itemId": "item-ms0jej41-7sii2",
          "quantity": 1
        },
        {
          "itemId": "consumable-ms28u8bo-5u249",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0h89t2-sczql",
    "name": "Windsong Staff",
    "goldCost": 50,
    "slot": "mainHand",
    "rarity": "uncommon",
    "description": "The staff sings an eerie tune when it cuts the wind.",
    "iconUrl": "/assets/gear-icons/twohand-staff.webp",
    "stats": {
      "intelligence": 1,
      "vitality": 1
    },
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "magicalPower": 1,
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0h9jvh-cpg4y",
    "name": "Windsong Sword",
    "goldCost": 50,
    "slot": "mainHand",
    "rarity": "uncommon",
    "description": "The sword sings an eerie tune when it cuts the wind.",
    "iconUrl": "/assets/gear-icons/one-handed.webp",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "weaponEquipType": "mainHand",
    "weaponKind": "sword",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0haj6d-e8pmv",
    "name": "Windsong Dagger",
    "goldCost": 50,
    "slot": "mainHand",
    "rarity": "uncommon",
    "description": "The dagger sings an eerie tune when it cuts the wind.",
    "iconUrl": "/assets/gear-icons/main-dagger.webp",
    "stats": {
      "agility": 1,
      "vitality": 1
    },
    "weaponEquipType": "oneHand",
    "weaponKind": "dagger",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0hb5cw-j14wj",
    "name": "Dusty Cowl",
    "goldCost": 10,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/gear-icons/head-leather.webp",
    "stats": {
      "vitality": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0hdxb1-bxamd",
    "name": "Dusty Boots",
    "goldCost": 8,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/gear-icons/boots-plate.webp",
    "stats": {},
    "combat": {
      "passive": {
        "initiative": 3,
        "dodgeChance": 0.01
      }
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0hf0m3-j3pcx",
    "name": "Old Armor",
    "goldCost": 12,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/gear-icons/chest-leather.webp",
    "stats": {
      "strength": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0hfvkg-yni9w",
    "name": "Old Leather Pants",
    "goldCost": 8,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/gear-icons/pants-leather.webp",
    "stats": {
      "agility": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0hgg09-w6afk",
    "name": "Old Robes",
    "goldCost": 12,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/gear-icons/chest-cloth.webp",
    "stats": {
      "intelligence": 1
    },
    "arkenfallVendor": "tailor",
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms0ifcle-isww5",
    "name": "Small Bloodberry",
    "goldCost": 8,
    "rarity": "common",
    "description": "Restores 5 hit points.",
    "effects": [
      {
        "type": "heal",
        "amount": 5
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0jd8ky-lu2zb",
    "name": "Fur",
    "goldCost": 6,
    "rarity": "common",
    "description": "A patch of fur from an animal.",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0jdzsp-pnyoa",
    "name": "Wolf Fang",
    "goldCost": 4,
    "rarity": "common",
    "description": "The fang of a wolf.",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0jej41-7sii2",
    "name": "Rats Tail",
    "goldCost": 4,
    "rarity": "common",
    "description": "The tail of a rat,",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0jf0sp-z8hcl",
    "name": "Wisp Essence",
    "goldCost": 20,
    "rarity": "common",
    "description": "The magical essence that brings Wisps to life.",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0jgblm-ko16i",
    "name": "Bear Claw",
    "goldCost": 10,
    "rarity": "common",
    "description": "As big as your head.",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0l8elz-4jlgf",
    "name": "Mystical Ring",
    "goldCost": 50,
    "slot": "ring",
    "rarity": "uncommon",
    "description": "Nobody knows where its from or who has worn it before, but now it is yours.",
    "iconUrl": "/assets/gear-icons/ring.webp",
    "stats": {
      "agility": 1,
      "intelligence": 1,
      "strength": 1,
      "vitality": 1,
      "luck": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms0ss0dt-z4bke",
    "name": "Metal Scrap",
    "goldCost": 6,
    "rarity": "common",
    "description": "A piece of metal.",
    "iconUrl": "/assets/items/metal-scrap.webp",
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0svay5-evj17",
    "name": "Simple Plate Helmet",
    "goldCost": 18,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "common",
    "description": "",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "armor": 1,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0sx064-zq3n5",
    "name": "Simple Plate Harness",
    "goldCost": 32,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "common",
    "description": "",
    "stats": {
      "vitality": 1,
      "strength": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 5
        },
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/chest-01.webp",
    "armor": 1,
    "combat": {
      "passive": {
        "energyRegen": -1
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0syhpj-m13xr",
    "name": "Simple Plate Boots",
    "goldCost": 18,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "common",
    "description": "",
    "stats": {
      "vitality": 1,
      "strength": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/boots-01.webp",
    "combat": {
      "passive": {
        "initiative": -2
      }
    },
    "armor": 1,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms0t0crb-p4hdm",
    "name": "Simple Plate Pantaloons",
    "goldCost": 24,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "common",
    "description": "",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 5
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/pants-01.webp",
    "armor": 1,
    "combat": {
      "passive": {
        "dodgeChance": -0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms1i1671-yxsnp",
    "name": "Goblin Scavanger Hood",
    "goldCost": 100,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "vitality": 1,
      "agility": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "set": "set-ms1i2u94-7cirx",
    "setName": "Goblin Scavanger",
    "vendorPrerequisiteAdventureId": null,
    "iconUrl": "/assets/gear-icons/head-leather.webp",
    "armor": 1
  },
  {
    "kind": "gear",
    "id": "gear-ms1i5k37-1rg9d",
    "name": "Goblin Scavanger Boots",
    "goldCost": 60,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "agility": 1,
      "vitality": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/boots-02.webp",
    "set": "set-ms1i2u94-7cirx",
    "setName": "Goblin Scavanger",
    "combat": {
      "passive": {
        "initiative": 5,
        "dodgeChance": 0.02
      }
    },
    "vendorPrerequisiteAdventureId": null,
    "armor": 1
  },
  {
    "kind": "gear",
    "id": "gear-ms1i77n7-j9o2s",
    "name": "Goblin Scavanger Harness",
    "goldCost": 70,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "strength": 1,
      "vitality": 1,
      "agility": 1,
      "luck": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "set": "set-ms1i2u94-7cirx",
    "setName": "Goblin Scavanger",
    "vendorPrerequisiteAdventureId": null,
    "armor": 1
  },
  {
    "kind": "gear",
    "id": "gear-ms1iadb1-2snx8",
    "name": "Hexcaster Robes",
    "goldCost": 120,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "vitality": 1,
      "intelligence": 1
    },
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms1if1q6-746wi",
          "quantity": 6
        },
        {
          "itemId": "item-ms1igebd-dlhst",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": "windsong-forest"
    },
    "iconUrl": "/assets/gear-icons/chest-cloth.webp",
    "set": "set-ms1i8zro-gf9ze",
    "setName": "Hexcaster",
    "magicResistance": 1,
    "vendorPrerequisiteAdventureId": null,
    "magicalPower": 1
  },
  {
    "kind": "gear",
    "id": "gear-ms1iccqm-4yu0n",
    "name": "Hexcaster Hood",
    "goldCost": 80,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "intelligence": 2
    },
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms1if1q6-746wi",
          "quantity": 4
        },
        {
          "itemId": "item-ms1igebd-dlhst",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": "windsong-forest"
    },
    "iconUrl": "/assets/gear-icons/head-cloth.webp",
    "set": "set-ms1i8zro-gf9ze",
    "setName": "Hexcaster",
    "combat": {
      "passive": {
        "hitChance": 0.01
      }
    },
    "magicResistance": 1,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms1id4sv-l0ihy",
    "name": "Hexcaster Staff",
    "goldCost": 180,
    "slot": "mainHand",
    "rarity": "rare",
    "description": "",
    "stats": {
      "intelligence": 1,
      "vitality": 2
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/twohand-staff.webp",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "set": "set-ms1i8zro-gf9ze",
    "setName": "Hexcaster",
    "magicalPower": 2,
    "combat": {
      "passive": {
        "hitChance": 0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms1if1q6-746wi",
    "name": "Linen Scraps",
    "goldCost": 5,
    "rarity": "common",
    "description": "A scrap of cloth.",
    "iconUrl": "/assets/items/fine-cloth.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-ms1igebd-dlhst",
    "name": "Spider Silk Thread",
    "goldCost": 12,
    "rarity": "uncommon",
    "description": "",
    "iconUrl": "/assets/items/spider-silk.webp",
    "arkenfallVendor": "tailor",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms27lxuu-3o5xy",
    "name": "Platemonger Helmet",
    "goldCost": 75,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "vitality": 2,
      "strength": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 5
        },
        {
          "itemId": "item-ms1if1q6-746wi",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": "windsong-forest"
    },
    "iconUrl": "/assets/gear-icons/head.webp",
    "set": "set-ms27mp57-ibgeg",
    "setName": "Platemonger",
    "vendorPrerequisiteAdventureId": "windsong-forest",
    "armor": 2
  },
  {
    "kind": "gear",
    "id": "gear-ms27p0je-if2hq",
    "name": "Platemonger Chestplate",
    "goldCost": 115,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "strength": 2,
      "vitality": 2
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "gear-ms0sx064-zq3n5",
          "quantity": 1
        },
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 2
        },
        {
          "itemId": "item-ms1if1q6-746wi",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": "windsong-forest"
    },
    "iconUrl": "/assets/gear-icons/chest.webp",
    "set": "set-ms27mp57-ibgeg",
    "setName": "Platemonger",
    "armor": 2,
    "vendorPrerequisiteAdventureId": "windsong-forest"
  },
  {
    "kind": "gear",
    "id": "gear-ms27upmg-hxmuw",
    "name": "Platemonger Sabatons",
    "goldCost": 60,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms1igebd-dlhst",
          "quantity": 2
        },
        {
          "itemId": "item-ms1if1q6-746wi",
          "quantity": 1
        },
        {
          "itemId": "item-ms0ss0dt-z4bke",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "windsong-forest"
    },
    "iconUrl": "/assets/gear-icons/boots-plate.webp",
    "set": "set-ms27mp57-ibgeg",
    "setName": "Platemonger",
    "armor": 1,
    "combat": {
      "passive": {
        "initiative": 1,
        "hitChance": 0.01
      }
    },
    "vendorPrerequisiteAdventureId": "windsong-forest"
  },
  {
    "kind": "gear",
    "id": "gear-ms280r0n-f50t1",
    "name": "Simple Iron Sword",
    "goldCost": 12,
    "slot": "mainHand",
    "rarity": "common",
    "description": "",
    "stats": {},
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "weaponEquipType": "oneHand",
    "weaponKind": "sword",
    "physicalPower": 1,
    "combat": {
      "passive": {
        "hitChance": 0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms281ud7-6ch5q",
    "name": "Simple Iron Dagger",
    "goldCost": 12,
    "slot": "mainHand",
    "rarity": "common",
    "description": "",
    "stats": {
      "agility": 1
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/main-dagger.webp",
    "weaponEquipType": "oneHand",
    "weaponKind": "dagger",
    "combat": {
      "passive": {
        "hitChance": 0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms282mba-u9w1d",
    "name": "Simple Iron Shield",
    "goldCost": 12,
    "slot": "offHand",
    "rarity": "common",
    "description": "",
    "stats": {},
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null,
    "iconUrl": "/assets/gear-icons/shield-04.webp",
    "weaponEquipType": "offHand",
    "weaponKind": "shield",
    "armor": 2,
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    }
  },
  {
    "kind": "gear",
    "id": "gear-ms285m4c-ripkk",
    "name": "Simple Mago-Staff",
    "goldCost": 14,
    "slot": "mainHand",
    "rarity": "common",
    "description": "",
    "stats": {},
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/staff-01.webp",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "magicalPower": 2,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms287a86-1kp9c",
    "name": "Simple Greataxe",
    "goldCost": 14,
    "slot": "mainHand",
    "rarity": "common",
    "description": "",
    "stats": {
      "strength": 2
    },
    "arkenfallVendor": "blacksmith",
    "craftingRecipe": null,
    "weaponEquipType": "twoHand",
    "weaponKind": "axe",
    "combat": {
      "passive": {
        "hitChance": -0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms288urw-5g9j1",
    "name": "Rugged Leather Armor",
    "goldCost": 24,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "",
    "stats": {
      "agility": 1,
      "vitality": 1
    },
    "arkenfallVendor": "leatherworker",
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/chest-leather.webp",
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms28b6ae-at7dk",
    "name": "Rugged Hood",
    "goldCost": 12,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "",
    "stats": {
      "agility": 1
    },
    "arkenfallVendor": "leatherworker",
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 1
        },
        {
          "itemId": "item-ms1igebd-dlhst",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/head-leather.webp",
    "combat": {
      "passive": {
        "critChance": 0.01,
        "hitChance": 0.01
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms28cwtb-huihn",
    "name": "Rugged Leather Pants",
    "goldCost": 24,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "",
    "stats": {
      "agility": 1,
      "vitality": 1
    },
    "arkenfallVendor": "leatherworker",
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jej41-7sii2",
          "quantity": 1
        },
        {
          "itemId": "item-ms1igebd-dlhst",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms28fdzv-vc0os",
    "name": "Rugged Boots",
    "goldCost": 14,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "common",
    "description": "",
    "stats": {
      "agility": 1
    },
    "arkenfallVendor": "leatherworker",
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "combat": {
      "passive": {
        "initiative": 2
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms28qbji-u8z5k",
    "name": "Moonpetal",
    "goldCost": 14,
    "rarity": "uncommon",
    "description": "Consume to gain Strengthened.",
    "iconUrl": "/assets/items/moonpetal.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 10
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms28tk3f-40hgi",
    "name": "Glowcap",
    "goldCost": 12,
    "rarity": "uncommon",
    "description": "Consume to gain Fierce.",
    "iconUrl": "/assets/items/glowcap-mushrooms.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 10
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms28u8bo-5u249",
    "name": "Empty Vial",
    "goldCost": 5,
    "rarity": "common",
    "description": "An empty vial to brew potions in.",
    "iconUrl": "/assets/items/empty-alchemy-vial.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 10
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms28xiyy-mjgo3",
    "name": "Old Hood",
    "goldCost": 10,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "stats": {
      "intelligence": 1
    },
    "arkenfallVendor": "tailor",
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/head-leather.webp",
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms28zlur-cywng",
    "name": "Old Trousers",
    "goldCost": 12,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "common",
    "description": "",
    "stats": {
      "vitality": 1
    },
    "arkenfallVendor": "tailor",
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "iconUrl": "/assets/gear-icons/pants-leather.webp",
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms2v69ag-xp79t",
    "name": "Healing Potion",
    "goldCost": 35,
    "rarity": "common",
    "description": "Restores health.",
    "iconUrl": "/assets/items/potion-red-normal.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 50
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms2v7x2f-ahbvt",
    "name": "Potion of Strength",
    "goldCost": 20,
    "rarity": "common",
    "description": "Grants Strengthened for 3 turns.",
    "iconUrl": "/assets/items/potion-green-minor.webp",
    "effects": [
      {
        "type": "apply_status",
        "target": "self",
        "status": "strengthened",
        "stacks": 1,
        "duration": 3
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms2vc57w-fbqi2",
    "name": "Potion of Courage",
    "goldCost": 20,
    "rarity": "common",
    "description": "Gain Fierce for three turns.",
    "iconUrl": "/assets/items/potion-purple-minor.webp",
    "effects": [
      {
        "type": "apply_status",
        "target": "self",
        "status": "fierce",
        "stacks": 1,
        "duration": 3
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms2vf476-12fhj",
    "name": "New Consumable",
    "goldCost": 8,
    "rarity": "common",
    "description": "",
    "iconUrl": "/assets/items/minor-healing-potion.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 10
      }
    ],
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-ms2vgbcc-5hb8n",
    "name": "Potion of Invisibility",
    "goldCost": 45,
    "rarity": "uncommon",
    "description": "Gain invisibility.",
    "iconUrl": "/assets/items/potion-purple-greater.webp",
    "effects": [
      {
        "type": "apply_status",
        "target": "self",
        "status": "stealth",
        "stacks": 1,
        "duration": 1
      }
    ],
    "arkenfallVendor": "alchemist",
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-nightveil-cowl",
    "name": "Nightveil Cowl",
    "goldCost": 130,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "",
    "stats": {
      "agility": 3,
      "vitality": 1
    },
    "armor": 1,
    "combat": {
      "passive": {
        "critChance": 0.02
      }
    },
    "set": "set-nightveil",
    "setName": "Nightveil",
    "iconUrl": "/assets/gear-icons/head-03.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-nightveil-jerkin",
    "name": "Nightveil Jerkin",
    "goldCost": 190,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "",
    "stats": {
      "agility": 3,
      "vitality": 2,
      "luck": 1
    },
    "armor": 2,
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-nightveil",
    "setName": "Nightveil",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-nightveil-legwraps",
    "name": "Nightveil Legwraps",
    "goldCost": 165,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "",
    "stats": {
      "agility": 3,
      "vitality": 1,
      "luck": 1
    },
    "armor": 1,
    "set": "set-nightveil",
    "setName": "Nightveil",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-nightveil-treads",
    "name": "Nightveil Treads",
    "goldCost": 150,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "",
    "stats": {
      "agility": 3,
      "vitality": 1
    },
    "armor": 1,
    "combat": {
      "passive": {
        "initiative": 6,
        "dodgeChance": 0.02
      }
    },
    "set": "set-nightveil",
    "setName": "Nightveil",
    "iconUrl": "/assets/gear-icons/boots-03.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-trollforged-greathelm",
    "name": "Trollforged Greathelm",
    "goldCost": 160,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "",
    "stats": {
      "strength": 3,
      "vitality": 2
    },
    "armor": 4,
    "set": "set-trollforged",
    "setName": "Trollforged",
    "iconUrl": "/assets/gear-icons/head-04.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-trollforged-breastplate",
    "name": "Trollforged Breastplate",
    "goldCost": 230,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "",
    "stats": {
      "strength": 3,
      "vitality": 3
    },
    "armor": 4,
    "set": "set-trollforged",
    "setName": "Trollforged",
    "iconUrl": "/assets/gear-icons/chest-04.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-trollforged-legguards",
    "name": "Trollforged Legguards",
    "goldCost": 200,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "",
    "stats": {
      "strength": 2,
      "vitality": 2,
      "luck": 1
    },
    "armor": 3,
    "set": "set-trollforged",
    "setName": "Trollforged",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-trollforged-warboots",
    "name": "Trollforged Warboots",
    "goldCost": 175,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "",
    "stats": {
      "strength": 2,
      "vitality": 2
    },
    "armor": 3,
    "combat": {
      "passive": {
        "initiative": 1,
        "hitChance": 0.01
      }
    },
    "set": "set-trollforged",
    "setName": "Trollforged",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-runewoven-cowl",
    "name": "Runewoven Cowl",
    "goldCost": 145,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "",
    "stats": {
      "intelligence": 3,
      "vitality": 1
    },
    "magicResistance": 1,
    "magicalPower": 1,
    "set": "set-runewoven",
    "setName": "Runewoven",
    "iconUrl": "/assets/gear-icons/head-05.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-runewoven-robes",
    "name": "Runewoven Robes",
    "goldCost": 210,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "",
    "stats": {
      "intelligence": 3,
      "vitality": 2
    },
    "magicResistance": 1,
    "magicalPower": 1,
    "set": "set-runewoven",
    "setName": "Runewoven",
    "iconUrl": "/assets/gear-icons/chest-05.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-runewoven-leggings",
    "name": "Runewoven Leggings",
    "goldCost": 185,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "",
    "stats": {
      "intelligence": 3,
      "vitality": 1,
      "luck": 1
    },
    "magicResistance": 1,
    "magicalPower": 1,
    "set": "set-runewoven",
    "setName": "Runewoven",
    "iconUrl": "/assets/gear-icons/pants-05.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-runewoven-boots",
    "name": "Runewoven Boots",
    "goldCost": 170,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "",
    "stats": {
      "intelligence": 2,
      "vitality": 1,
      "luck": 1
    },
    "magicResistance": 1,
    "magicalPower": 1,
    "combat": {
      "passive": {
        "initiative": 2
      }
    },
    "set": "set-runewoven",
    "setName": "Runewoven",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms30095w-ci3mw",
    "name": "Trollbane",
    "goldCost": 120,
    "slot": "mainHand",
    "rarity": "rare",
    "description": "The bane of trolls.",
    "stats": {
      "strength": 4,
      "luck": 1,
      "vitality": 2
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/twohand-polearm.webp",
    "weaponEquipType": "twoHand",
    "weaponKind": "polearm",
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms3054kn-cs3uu",
    "name": "Bandits Kiss",
    "goldCost": 90,
    "slot": "mainHand",
    "rarity": "rare",
    "description": "",
    "stats": {
      "agility": 3,
      "vitality": 2
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/dagger-01.webp",
    "weaponEquipType": "oneHand",
    "weaponKind": "dagger",
    "combat": {
      "passive": {
        "critChance": 0.02
      }
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-ms307fr5-vebz0",
    "name": "Mountain Staff",
    "goldCost": 120,
    "slot": "mainHand",
    "rarity": "rare",
    "description": "",
    "stats": {
      "vitality": 5,
      "intelligence": 2
    },
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "iconUrl": "/assets/gear-icons/staff-01.webp",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-highfall-frostroot",
    "name": "Highfall Frostroot",
    "goldCost": 18,
    "rarity": "uncommon",
    "description": "A hardy mountain root prized for its restorative properties.",
    "iconUrl": "/assets/items/moonpetal.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-highfall-restorative",
    "name": "Highfall Restorative",
    "goldCost": 55,
    "rarity": "uncommon",
    "description": "Restores 65 Health.",
    "iconUrl": "/assets/items/potion-red-greater.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 65
      }
    ],
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-stonebloom-draught",
    "name": "Stonebloom Draught",
    "goldCost": 60,
    "rarity": "rare",
    "description": "Restores 30 Health and grants Regenerate for 3 turns.",
    "iconUrl": "/assets/items/potion-green-normal.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 30
      },
      {
        "type": "apply_status",
        "target": "self",
        "status": "regenerate",
        "stacks": 1,
        "duration": 3
      }
    ],
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-cairnkeepers-loop",
    "name": "Cairnkeeper's Loop",
    "goldCost": 145,
    "slot": "ring",
    "rarity": "rare",
    "description": "A silver ring etched with the old warding runes of Highfall.",
    "stats": {
      "intelligence": 2,
      "vitality": 1,
      "luck": 2
    },
    "magicResistance": 1,
    "combat": {
      "passive": {
        "initiative": 2
      }
    },
    "iconUrl": "/assets/gear-icons/ring-04.webp",
    "arkenfallVendor": null,
    "craftingRecipe": null,
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-thornbark-visor",
    "name": "Thornbark Visor",
    "goldCost": 38,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "Layered bark and bear claw turn aside glancing blows without weighing down the wearer.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "strength": 1
    },
    "armor": 1,
    "set": "set-windsong-thornbark",
    "setName": "Thornbark Bulwark",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0jgblm-ko16i",
          "quantity": 1
        },
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-thornbark-buckler",
    "name": "Thornbark Buckler",
    "goldCost": 42,
    "slot": "offHand",
    "rarity": "uncommon",
    "description": "A compact shield reinforced with iron-hard heartwood and a curved bear claw.",
    "iconUrl": "/assets/gear-icons/shield-02.webp",
    "stats": {
      "strength": 1
    },
    "armor": 1,
    "weaponEquipType": "offHand",
    "weaponKind": "shield",
    "set": "set-windsong-thornbark",
    "setName": "Thornbark Bulwark",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0jgblm-ko16i",
          "quantity": 1
        },
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-galehide-jerkin",
    "name": "Galehide Jerkin",
    "goldCost": 40,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "Supple forest hide cut to move with every sudden turn of the trail.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "agility": 1
    },
    "armor": 1,
    "set": "set-windsong-galehide",
    "setName": "Galehide",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 3
        },
        {
          "itemId": "item-ms0jdzsp-pnyoa",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-galehide-striders",
    "name": "Galehide Striders",
    "goldCost": 34,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "Light boots stitched for silent footing over root, stone, and leaf.",
    "iconUrl": "/assets/gear-icons/boots-03.webp",
    "stats": {
      "agility": 1
    },
    "combat": {
      "passive": {
        "initiative": 2
      }
    },
    "set": "set-windsong-galehide",
    "setName": "Galehide",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jej41-7sii2",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-wispwoven-leggings",
    "name": "Wispwoven Leggings",
    "goldCost": 44,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "uncommon",
    "description": "Pale threads shimmer whenever nearby magic stirs the air.",
    "iconUrl": "/assets/gear-icons/pants-02.webp",
    "stats": {
      "intelligence": 1
    },
    "magicResistance": 1,
    "set": "set-windsong-wispwoven",
    "setName": "Wispwoven",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-ms0jd8ky-lu2zb",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jf0sp-z8hcl",
          "quantity": 2
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-wispwoven-band",
    "name": "Wispwoven Band",
    "goldCost": 46,
    "slot": "ring",
    "rarity": "uncommon",
    "description": "Wisp essence glows beneath fine wire whenever a spell gathers strength.",
    "iconUrl": "/assets/gear-icons/ring-02.webp",
    "stats": {
      "intelligence": 1
    },
    "magicalPower": 1,
    "set": "set-windsong-wispwoven",
    "setName": "Wispwoven",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-ms0jf0sp-z8hcl",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jdzsp-pnyoa",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-bramblefang",
    "name": "Bramblefang",
    "goldCost": 48,
    "slot": "mainHand",
    "rarity": "uncommon",
    "description": "A narrow forest blade edged with fitted wolf fangs.",
    "iconUrl": "/assets/gear-icons/sword-02.webp",
    "stats": {
      "strength": 1
    },
    "physicalPower": 1,
    "weaponEquipType": "oneHand",
    "weaponKind": "sword",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-ms0jdzsp-pnyoa",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jgblm-ko16i",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-moondrop-wand",
    "name": "Moondrop Wand",
    "goldCost": 48,
    "slot": "mainHand",
    "rarity": "uncommon",
    "description": "A polished branch tipped with a bead of softly pulsing wisp essence.",
    "iconUrl": "/assets/gear-icons/wand-02.webp",
    "stats": {
      "intelligence": 1
    },
    "magicalPower": 1,
    "weaponEquipType": "oneHand",
    "weaponKind": "wand",
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-ms0jf0sp-z8hcl",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jdzsp-pnyoa",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "gear",
    "id": "gear-windsong-wolfstep-loop",
    "name": "Wolfstep Loop",
    "goldCost": 36,
    "slot": "ring",
    "rarity": "uncommon",
    "description": "Tiny fang marks circle this light ring like tracks around a moonlit clearing.",
    "iconUrl": "/assets/gear-icons/ring-03.webp",
    "stats": {
      "agility": 1
    },
    "combat": {
      "passive": {
        "initiative": 2
      }
    },
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-ms0jdzsp-pnyoa",
          "quantity": 2
        },
        {
          "itemId": "item-ms0jej41-7sii2",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "consumable",
    "id": "consumable-windsong-whisperbloom-tonic",
    "name": "Whisperbloom Tonic",
    "goldCost": 30,
    "rarity": "uncommon",
    "description": "Restores 12 Health and 2 Energy.",
    "iconUrl": "/assets/items/potion-blue-minor.webp",
    "effects": [
      {
        "type": "heal",
        "amount": 12
      },
      {
        "type": "gain_energy",
        "amount": 2
      }
    ],
    "arkenfallVendor": null,
    "craftingRecipe": {
      "station": "alchemist",
      "ingredients": [
        {
          "itemId": "item-ms0jej41-7sii2",
          "quantity": 1
        },
        {
          "itemId": "item-ms0jf0sp-z8hcl",
          "quantity": 1
        }
      ],
      "prerequisiteAdventureId": null
    },
    "vendorPrerequisiteAdventureId": null
  },
  {
    "kind": "misc",
    "id": "item-a4-bog-iron",
    "name": "Bog Iron",
    "goldCost": 24,
    "rarity": "uncommon",
    "description": "A crafting material recovered from Mirefen Marsh.",
    "iconUrl": "/assets/items/iron-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a4-venom-sac",
    "name": "Venom Sac",
    "goldCost": 27,
    "rarity": "uncommon",
    "description": "A crafting material recovered from Mirefen Marsh.",
    "iconUrl": "/assets/items/poison-gland.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a4-mire-reed",
    "name": "Mire Reed",
    "goldCost": 30,
    "rarity": "uncommon",
    "description": "A crafting material recovered from Mirefen Marsh.",
    "iconUrl": "/assets/items/moonpetal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-fenwarden-head",
    "name": "Fenwarden Helm",
    "goldCost": 220,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "A uncommon plate piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a4-fenwarden",
    "setName": "Fenwarden",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-fenwarden-chest",
    "name": "Fenwarden Cuirass",
    "goldCost": 228,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "A uncommon plate piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "strength": 2,
      "vitality": 1
    },
    "armor": 6,
    "set": "set-a4-fenwarden",
    "setName": "Fenwarden",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-fenwarden-pants",
    "name": "Fenwarden Greaves",
    "goldCost": 236,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "A uncommon plate piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a4-fenwarden",
    "setName": "Fenwarden",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-fenwarden-boots",
    "name": "Fenwarden Sabatons",
    "goldCost": 244,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "uncommon",
    "description": "A uncommon plate piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a4-fenwarden",
    "setName": "Fenwarden",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-fenwarden-ring",
    "name": "Fenwarden Signet",
    "goldCost": 252,
    "slot": "ring",
    "rarity": "uncommon",
    "description": "A uncommon ring piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "strength": 1,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a4-fenwarden",
    "setName": "Fenwarden",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a4-bog-iron",
          "quantity": 8
        },
        {
          "itemId": "item-a4-venom-sac",
          "quantity": 2
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "mirefen-marsh"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a4-mirestalker-head",
    "name": "Mirestalker Cowl",
    "goldCost": 220,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "A uncommon leather piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "agility": 1,
      "luck": 1
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-a4-mirestalker",
    "setName": "Mirestalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-mirestalker-chest",
    "name": "Mirestalker Jerkin",
    "goldCost": 228,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "A uncommon leather piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "agility": 2,
      "luck": 1
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-a4-mirestalker",
    "setName": "Mirestalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-mirestalker-pants",
    "name": "Mirestalker Legwraps",
    "goldCost": 236,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "A uncommon leather piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "agility": 1,
      "luck": 1
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-a4-mirestalker",
    "setName": "Mirestalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-mirestalker-boots",
    "name": "Mirestalker Treads",
    "goldCost": 244,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "uncommon",
    "description": "A uncommon leather piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "agility": 1,
      "luck": 1
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-a4-mirestalker",
    "setName": "Mirestalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a4-mirestalker-ring",
    "name": "Mirestalker Band",
    "goldCost": 252,
    "slot": "ring",
    "rarity": "uncommon",
    "description": "A uncommon ring piece shaped by the dangers of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "agility": 1,
      "luck": 1
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.01
      }
    },
    "set": "set-a4-mirestalker",
    "setName": "Mirestalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a4-bog-iron",
          "quantity": 8
        },
        {
          "itemId": "item-a4-venom-sac",
          "quantity": 3
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "mirefen-marsh"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a4-bogcleaver",
    "name": "Bogcleaver",
    "goldCost": 320,
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "axe",
    "rarity": "uncommon",
    "description": "Bogcleaver carries the hard-won power of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/axe-05.webp",
    "stats": {
      "strength": 1
    },
    "physicalPower": 8,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a4-bog-iron",
          "quantity": 11
        },
        {
          "itemId": "item-a4-venom-sac",
          "quantity": 4
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "mirefen-marsh"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a4-witchlight-wand",
    "name": "Witchlight Wand",
    "goldCost": 320,
    "slot": "mainHand",
    "weaponEquipType": "mainHand",
    "weaponKind": "wand",
    "rarity": "uncommon",
    "description": "Witchlight Wand carries the hard-won power of Mirefen Marsh.",
    "iconUrl": "/assets/gear-icons/wand-01.webp",
    "stats": {
      "intelligence": 1
    },
    "magicalPower": 8,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a4-bog-iron",
          "quantity": 11
        },
        {
          "itemId": "item-a4-venom-sac",
          "quantity": 4
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "mirefen-marsh"
    }
  },
  {
    "kind": "misc",
    "id": "item-a5-cindersteel",
    "name": "Cindersteel Ore",
    "goldCost": 28,
    "rarity": "rare",
    "description": "A crafting material recovered from Ashen Foundry.",
    "iconUrl": "/assets/items/copper-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a5-ember-fragment",
    "name": "Ember Core Fragment",
    "goldCost": 31,
    "rarity": "rare",
    "description": "A crafting material recovered from Ashen Foundry.",
    "iconUrl": "/assets/items/ember-core.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a5-sootweave",
    "name": "Sootweave",
    "goldCost": 34,
    "rarity": "rare",
    "description": "A crafting material recovered from Ashen Foundry.",
    "iconUrl": "/assets/items/fine-cloth.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-emberforged-head",
    "name": "Emberforged Helm",
    "goldCost": 255,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "strength": 2,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a5-emberforged",
    "setName": "Emberforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-emberforged-chest",
    "name": "Emberforged Cuirass",
    "goldCost": 263,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "strength": 3,
      "vitality": 1
    },
    "armor": 6,
    "set": "set-a5-emberforged",
    "setName": "Emberforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-emberforged-pants",
    "name": "Emberforged Greaves",
    "goldCost": 271,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "strength": 2,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a5-emberforged",
    "setName": "Emberforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-emberforged-boots",
    "name": "Emberforged Sabatons",
    "goldCost": 279,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "strength": 2,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a5-emberforged",
    "setName": "Emberforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-emberforged-ring",
    "name": "Emberforged Signet",
    "goldCost": 287,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "strength": 2,
      "vitality": 1
    },
    "armor": 4,
    "set": "set-a5-emberforged",
    "setName": "Emberforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a5-cindersteel",
          "quantity": 9
        },
        {
          "itemId": "item-a5-ember-fragment",
          "quantity": 2
        },
        {
          "itemId": "item-a5-sootweave",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "ashen-foundry"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderweave-head",
    "name": "Cinderweave Hood",
    "goldCost": 255,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "intelligence": 2,
      "vitality": 1
    },
    "magicResistance": 4,
    "set": "set-a5-cinderweave",
    "setName": "Cinderweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderweave-chest",
    "name": "Cinderweave Robes",
    "goldCost": 263,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "intelligence": 3,
      "vitality": 1
    },
    "magicResistance": 6,
    "set": "set-a5-cinderweave",
    "setName": "Cinderweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderweave-pants",
    "name": "Cinderweave Leggings",
    "goldCost": 271,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "intelligence": 2,
      "vitality": 1
    },
    "magicResistance": 4,
    "set": "set-a5-cinderweave",
    "setName": "Cinderweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderweave-boots",
    "name": "Cinderweave Slippers",
    "goldCost": 279,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "intelligence": 2,
      "vitality": 1
    },
    "magicResistance": 4,
    "set": "set-a5-cinderweave",
    "setName": "Cinderweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderweave-ring",
    "name": "Cinderweave Loop",
    "goldCost": 287,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "intelligence": 2,
      "vitality": 1
    },
    "magicResistance": 4,
    "set": "set-a5-cinderweave",
    "setName": "Cinderweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a5-cindersteel",
          "quantity": 9
        },
        {
          "itemId": "item-a5-ember-fragment",
          "quantity": 3
        },
        {
          "itemId": "item-a5-sootweave",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "ashen-foundry"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a5-foundry-maul",
    "name": "Foundry Maul",
    "goldCost": 365,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "mace",
    "rarity": "rare",
    "description": "Foundry Maul carries the hard-won power of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/mace-01.webp",
    "stats": {
      "strength": 2
    },
    "physicalPower": 12,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a5-cindersteel",
          "quantity": 12
        },
        {
          "itemId": "item-a5-ember-fragment",
          "quantity": 4
        },
        {
          "itemId": "item-a5-sootweave",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "ashen-foundry"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a5-cinderbrand",
    "name": "Cinderbrand",
    "goldCost": 365,
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "sword",
    "rarity": "rare",
    "description": "Cinderbrand carries the hard-won power of Ashen Foundry.",
    "iconUrl": "/assets/gear-icons/sword-02.webp",
    "stats": {
      "strength": 2
    },
    "physicalPower": 12,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a5-cindersteel",
          "quantity": 12
        },
        {
          "itemId": "item-a5-ember-fragment",
          "quantity": 4
        },
        {
          "itemId": "item-a5-sootweave",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "ashen-foundry"
    }
  },
  {
    "kind": "misc",
    "id": "item-a6-abyssal-pearl",
    "name": "Abyssal Pearl",
    "goldCost": 32,
    "rarity": "rare",
    "description": "A crafting material recovered from Sunken Reliquary.",
    "iconUrl": "/assets/items/arcane-crystal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a6-relic-shard",
    "name": "Drowned Relic Shard",
    "goldCost": 35,
    "rarity": "rare",
    "description": "A crafting material recovered from Sunken Reliquary.",
    "iconUrl": "/assets/items/bone-fragments.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a6-tideglass",
    "name": "Tideglass",
    "goldCost": 38,
    "rarity": "rare",
    "description": "A crafting material recovered from Sunken Reliquary.",
    "iconUrl": "/assets/items/frost-shard.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-depthguard-head",
    "name": "Depthguard Helm",
    "goldCost": 290,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a6-depthguard",
    "setName": "Depthguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-depthguard-chest",
    "name": "Depthguard Cuirass",
    "goldCost": 298,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "vitality": 2
    },
    "armor": 7,
    "set": "set-a6-depthguard",
    "setName": "Depthguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-depthguard-pants",
    "name": "Depthguard Greaves",
    "goldCost": 306,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a6-depthguard",
    "setName": "Depthguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-depthguard-boots",
    "name": "Depthguard Sabatons",
    "goldCost": 314,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a6-depthguard",
    "setName": "Depthguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-depthguard-ring",
    "name": "Depthguard Signet",
    "goldCost": 322,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a6-depthguard",
    "setName": "Depthguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a6-abyssal-pearl",
          "quantity": 10
        },
        {
          "itemId": "item-a6-relic-shard",
          "quantity": 2
        },
        {
          "itemId": "item-a6-tideglass",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "sunken-reliquary"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidecaller-head",
    "name": "Tidecaller Hood",
    "goldCost": 290,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "intelligence": 3,
      "vitality": 2
    },
    "magicResistance": 5,
    "set": "set-a6-tidecaller",
    "setName": "Tidecaller",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidecaller-chest",
    "name": "Tidecaller Robes",
    "goldCost": 298,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "intelligence": 4,
      "vitality": 2
    },
    "magicResistance": 7,
    "set": "set-a6-tidecaller",
    "setName": "Tidecaller",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidecaller-pants",
    "name": "Tidecaller Leggings",
    "goldCost": 306,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "intelligence": 3,
      "vitality": 2
    },
    "magicResistance": 5,
    "set": "set-a6-tidecaller",
    "setName": "Tidecaller",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidecaller-boots",
    "name": "Tidecaller Slippers",
    "goldCost": 314,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "rare",
    "description": "A rare cloth piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "intelligence": 3,
      "vitality": 2
    },
    "magicResistance": 5,
    "set": "set-a6-tidecaller",
    "setName": "Tidecaller",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidecaller-ring",
    "name": "Tidecaller Loop",
    "goldCost": 322,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "intelligence": 3,
      "vitality": 2
    },
    "magicResistance": 5,
    "set": "set-a6-tidecaller",
    "setName": "Tidecaller",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a6-abyssal-pearl",
          "quantity": 10
        },
        {
          "itemId": "item-a6-relic-shard",
          "quantity": 3
        },
        {
          "itemId": "item-a6-tideglass",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "sunken-reliquary"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a6-tidebreaker",
    "name": "Tidebreaker",
    "goldCost": 410,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "polearm",
    "rarity": "rare",
    "description": "Tidebreaker carries the hard-won power of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/polearm-02.webp",
    "stats": {
      "strength": 3
    },
    "physicalPower": 16,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a6-abyssal-pearl",
          "quantity": 13
        },
        {
          "itemId": "item-a6-relic-shard",
          "quantity": 4
        },
        {
          "itemId": "item-a6-tideglass",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "sunken-reliquary"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a6-oracle-tome",
    "name": "Oracle's Tide Tome",
    "goldCost": 410,
    "slot": "offHand",
    "weaponEquipType": "offHand",
    "weaponKind": "tome",
    "rarity": "rare",
    "description": "Oracle's Tide Tome carries the hard-won power of Sunken Reliquary.",
    "iconUrl": "/assets/gear-icons/tome-03.webp",
    "stats": {
      "intelligence": 3
    },
    "magicalPower": 16,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a6-abyssal-pearl",
          "quantity": 13
        },
        {
          "itemId": "item-a6-relic-shard",
          "quantity": 4
        },
        {
          "itemId": "item-a6-tideglass",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "sunken-reliquary"
    }
  },
  {
    "kind": "misc",
    "id": "item-a7-nightglass",
    "name": "Nightglass Shard",
    "goldCost": 36,
    "rarity": "rare",
    "description": "A crafting material recovered from Nightglass Citadel.",
    "iconUrl": "/assets/items/arcane-crystal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a7-umbral-silk",
    "name": "Umbral Silk",
    "goldCost": 39,
    "rarity": "rare",
    "description": "A crafting material recovered from Nightglass Citadel.",
    "iconUrl": "/assets/items/spider-silk.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a7-bloodstone",
    "name": "Bloodstone",
    "goldCost": 42,
    "rarity": "rare",
    "description": "A crafting material recovered from Nightglass Citadel.",
    "iconUrl": "/assets/items/gold-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-nightglass-head",
    "name": "Nightglass Cowl",
    "goldCost": 325,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "A rare leather piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "agility": 4,
      "luck": 2
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.02
      }
    },
    "set": "set-a7-nightglass",
    "setName": "Nightglass",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-nightglass-chest",
    "name": "Nightglass Jerkin",
    "goldCost": 333,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "A rare leather piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "agility": 5,
      "luck": 2
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.02
      }
    },
    "set": "set-a7-nightglass",
    "setName": "Nightglass",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-nightglass-pants",
    "name": "Nightglass Legwraps",
    "goldCost": 341,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "A rare leather piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "agility": 4,
      "luck": 2
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.02
      }
    },
    "set": "set-a7-nightglass",
    "setName": "Nightglass",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-nightglass-boots",
    "name": "Nightglass Treads",
    "goldCost": 349,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "rare",
    "description": "A rare leather piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "agility": 4,
      "luck": 2
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.02
      }
    },
    "set": "set-a7-nightglass",
    "setName": "Nightglass",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-nightglass-ring",
    "name": "Nightglass Band",
    "goldCost": 357,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "agility": 4,
      "luck": 2
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.02
      }
    },
    "set": "set-a7-nightglass",
    "setName": "Nightglass",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a7-nightglass",
          "quantity": 11
        },
        {
          "itemId": "item-a7-umbral-silk",
          "quantity": 2
        },
        {
          "itemId": "item-a7-bloodstone",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "nightglass-citadel"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a7-bloodbound-head",
    "name": "Bloodbound Helm",
    "goldCost": 325,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "strength": 4,
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a7-bloodbound",
    "setName": "Bloodbound",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-bloodbound-chest",
    "name": "Bloodbound Cuirass",
    "goldCost": 333,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "strength": 5,
      "vitality": 2
    },
    "armor": 7,
    "set": "set-a7-bloodbound",
    "setName": "Bloodbound",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-bloodbound-pants",
    "name": "Bloodbound Greaves",
    "goldCost": 341,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "strength": 4,
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a7-bloodbound",
    "setName": "Bloodbound",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-bloodbound-boots",
    "name": "Bloodbound Sabatons",
    "goldCost": 349,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "rare",
    "description": "A rare plate piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "strength": 4,
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a7-bloodbound",
    "setName": "Bloodbound",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a7-bloodbound-ring",
    "name": "Bloodbound Signet",
    "goldCost": 357,
    "slot": "ring",
    "rarity": "rare",
    "description": "A rare ring piece shaped by the dangers of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "strength": 4,
      "vitality": 2
    },
    "armor": 5,
    "set": "set-a7-bloodbound",
    "setName": "Bloodbound",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a7-nightglass",
          "quantity": 11
        },
        {
          "itemId": "item-a7-umbral-silk",
          "quantity": 3
        },
        {
          "itemId": "item-a7-bloodstone",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "nightglass-citadel"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a7-mirrorfang",
    "name": "Mirrorfang",
    "goldCost": 455,
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "dagger",
    "rarity": "rare",
    "description": "Mirrorfang carries the hard-won power of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/dagger-03.webp",
    "stats": {
      "strength": 4
    },
    "physicalPower": 20,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a7-nightglass",
          "quantity": 14
        },
        {
          "itemId": "item-a7-umbral-silk",
          "quantity": 4
        },
        {
          "itemId": "item-a7-bloodstone",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "nightglass-citadel"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a7-eclipse-staff",
    "name": "Eclipse Staff",
    "goldCost": 455,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "rarity": "rare",
    "description": "Eclipse Staff carries the hard-won power of Nightglass Citadel.",
    "iconUrl": "/assets/gear-icons/staff-04.webp",
    "stats": {
      "intelligence": 4
    },
    "magicalPower": 20,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a7-nightglass",
          "quantity": 14
        },
        {
          "itemId": "item-a7-umbral-silk",
          "quantity": 4
        },
        {
          "itemId": "item-a7-bloodstone",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "nightglass-citadel"
    }
  },
  {
    "kind": "misc",
    "id": "item-a8-rimebone",
    "name": "Rimebone",
    "goldCost": 40,
    "rarity": "epic",
    "description": "A crafting material recovered from Frostbound Expanse.",
    "iconUrl": "/assets/items/bone-fragments.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a8-frostheart",
    "name": "Frostheart Crystal",
    "goldCost": 43,
    "rarity": "epic",
    "description": "A crafting material recovered from Frostbound Expanse.",
    "iconUrl": "/assets/items/frost-shard.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a8-white-pelt",
    "name": "White Pelt",
    "goldCost": 46,
    "rarity": "epic",
    "description": "A crafting material recovered from Frostbound Expanse.",
    "iconUrl": "/assets/items/fur.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-rimeguard-head",
    "name": "Rimeguard Helm",
    "goldCost": 360,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "vitality": 3
    },
    "armor": 6,
    "set": "set-a8-rimeguard",
    "setName": "Rimeguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-rimeguard-chest",
    "name": "Rimeguard Cuirass",
    "goldCost": 368,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "vitality": 3
    },
    "armor": 8,
    "set": "set-a8-rimeguard",
    "setName": "Rimeguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-rimeguard-pants",
    "name": "Rimeguard Greaves",
    "goldCost": 376,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "vitality": 3
    },
    "armor": 6,
    "set": "set-a8-rimeguard",
    "setName": "Rimeguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-rimeguard-boots",
    "name": "Rimeguard Sabatons",
    "goldCost": 384,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "vitality": 3
    },
    "armor": 6,
    "set": "set-a8-rimeguard",
    "setName": "Rimeguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-rimeguard-ring",
    "name": "Rimeguard Signet",
    "goldCost": 392,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "vitality": 3
    },
    "armor": 6,
    "set": "set-a8-rimeguard",
    "setName": "Rimeguard",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a8-rimebone",
          "quantity": 12
        },
        {
          "itemId": "item-a8-frostheart",
          "quantity": 2
        },
        {
          "itemId": "item-a8-white-pelt",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "frostbound-expanse"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a8-winterweave-head",
    "name": "Winterweave Hood",
    "goldCost": 360,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "intelligence": 5,
      "vitality": 3
    },
    "magicResistance": 6,
    "set": "set-a8-winterweave",
    "setName": "Winterweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-winterweave-chest",
    "name": "Winterweave Robes",
    "goldCost": 368,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "intelligence": 6,
      "vitality": 3
    },
    "magicResistance": 8,
    "set": "set-a8-winterweave",
    "setName": "Winterweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-winterweave-pants",
    "name": "Winterweave Leggings",
    "goldCost": 376,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "intelligence": 5,
      "vitality": 3
    },
    "magicResistance": 6,
    "set": "set-a8-winterweave",
    "setName": "Winterweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-winterweave-boots",
    "name": "Winterweave Slippers",
    "goldCost": 384,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "intelligence": 5,
      "vitality": 3
    },
    "magicResistance": 6,
    "set": "set-a8-winterweave",
    "setName": "Winterweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a8-winterweave-ring",
    "name": "Winterweave Loop",
    "goldCost": 392,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "intelligence": 5,
      "vitality": 3
    },
    "magicResistance": 6,
    "set": "set-a8-winterweave",
    "setName": "Winterweave",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a8-rimebone",
          "quantity": 12
        },
        {
          "itemId": "item-a8-frostheart",
          "quantity": 3
        },
        {
          "itemId": "item-a8-white-pelt",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "frostbound-expanse"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a8-white-maw-axe",
    "name": "White Maw Greataxe",
    "goldCost": 500,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "axe",
    "rarity": "epic",
    "description": "White Maw Greataxe carries the hard-won power of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/axe-04.webp",
    "stats": {
      "strength": 5
    },
    "physicalPower": 24,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a8-rimebone",
          "quantity": 15
        },
        {
          "itemId": "item-a8-frostheart",
          "quantity": 4
        },
        {
          "itemId": "item-a8-white-pelt",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "frostbound-expanse"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a8-aurora-wand",
    "name": "Aurora Wand",
    "goldCost": 500,
    "slot": "mainHand",
    "weaponEquipType": "mainHand",
    "weaponKind": "wand",
    "rarity": "epic",
    "description": "Aurora Wand carries the hard-won power of Frostbound Expanse.",
    "iconUrl": "/assets/gear-icons/wand-05.webp",
    "stats": {
      "intelligence": 5
    },
    "magicalPower": 24,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a8-rimebone",
          "quantity": 15
        },
        {
          "itemId": "item-a8-frostheart",
          "quantity": 4
        },
        {
          "itemId": "item-a8-white-pelt",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "frostbound-expanse"
    }
  },
  {
    "kind": "misc",
    "id": "item-a9-skyiron",
    "name": "Skyiron",
    "goldCost": 44,
    "rarity": "epic",
    "description": "A crafting material recovered from Stormspire Aerie.",
    "iconUrl": "/assets/items/silver-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a9-storm-core",
    "name": "Condensed Storm Essence",
    "goldCost": 47,
    "rarity": "epic",
    "description": "A crafting material recovered from Stormspire Aerie.",
    "iconUrl": "/assets/items/storm-essence.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a9-cloudfeather",
    "name": "Cloudfeather",
    "goldCost": 50,
    "rarity": "epic",
    "description": "A crafting material recovered from Stormspire Aerie.",
    "iconUrl": "/assets/items/fine-cloth.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormrunner-head",
    "name": "Stormrunner Cowl",
    "goldCost": 395,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "agility": 6,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.03
      }
    },
    "set": "set-a9-stormrunner",
    "setName": "Stormrunner",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormrunner-chest",
    "name": "Stormrunner Jerkin",
    "goldCost": 403,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "agility": 7,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.03
      }
    },
    "set": "set-a9-stormrunner",
    "setName": "Stormrunner",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormrunner-pants",
    "name": "Stormrunner Legwraps",
    "goldCost": 411,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "agility": 6,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.03
      }
    },
    "set": "set-a9-stormrunner",
    "setName": "Stormrunner",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormrunner-boots",
    "name": "Stormrunner Treads",
    "goldCost": 419,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "agility": 6,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.03
      }
    },
    "set": "set-a9-stormrunner",
    "setName": "Stormrunner",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormrunner-ring",
    "name": "Stormrunner Band",
    "goldCost": 427,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "agility": 6,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.03
      }
    },
    "set": "set-a9-stormrunner",
    "setName": "Stormrunner",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a9-skyiron",
          "quantity": 13
        },
        {
          "itemId": "item-a9-storm-core",
          "quantity": 2
        },
        {
          "itemId": "item-a9-cloudfeather",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "stormspire-aerie"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a9-tempest-sage-head",
    "name": "Tempest Sage Hood",
    "goldCost": 395,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "intelligence": 6,
      "vitality": 4
    },
    "magicResistance": 6,
    "set": "set-a9-tempest-sage",
    "setName": "Tempest Sage",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-tempest-sage-chest",
    "name": "Tempest Sage Robes",
    "goldCost": 403,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "intelligence": 7,
      "vitality": 4
    },
    "magicResistance": 8,
    "set": "set-a9-tempest-sage",
    "setName": "Tempest Sage",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-tempest-sage-pants",
    "name": "Tempest Sage Leggings",
    "goldCost": 411,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "intelligence": 6,
      "vitality": 4
    },
    "magicResistance": 6,
    "set": "set-a9-tempest-sage",
    "setName": "Tempest Sage",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-tempest-sage-boots",
    "name": "Tempest Sage Slippers",
    "goldCost": 419,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "intelligence": 6,
      "vitality": 4
    },
    "magicResistance": 6,
    "set": "set-a9-tempest-sage",
    "setName": "Tempest Sage",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a9-tempest-sage-ring",
    "name": "Tempest Sage Loop",
    "goldCost": 427,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "intelligence": 6,
      "vitality": 4
    },
    "magicResistance": 6,
    "set": "set-a9-tempest-sage",
    "setName": "Tempest Sage",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a9-skyiron",
          "quantity": 13
        },
        {
          "itemId": "item-a9-storm-core",
          "quantity": 3
        },
        {
          "itemId": "item-a9-cloudfeather",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "stormspire-aerie"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a9-skybreaker",
    "name": "Skybreaker Spear",
    "goldCost": 545,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "polearm",
    "rarity": "epic",
    "description": "Skybreaker Spear carries the hard-won power of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/polearm-05.webp",
    "stats": {
      "strength": 6
    },
    "physicalPower": 28,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a9-skyiron",
          "quantity": 16
        },
        {
          "itemId": "item-a9-storm-core",
          "quantity": 4
        },
        {
          "itemId": "item-a9-cloudfeather",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "stormspire-aerie"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a9-stormcallers-tome",
    "name": "Stormcaller's Tome",
    "goldCost": 545,
    "slot": "offHand",
    "weaponEquipType": "offHand",
    "weaponKind": "tome",
    "rarity": "epic",
    "description": "Stormcaller's Tome carries the hard-won power of Stormspire Aerie.",
    "iconUrl": "/assets/gear-icons/tome-01.webp",
    "stats": {
      "intelligence": 6
    },
    "magicalPower": 28,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a9-skyiron",
          "quantity": 16
        },
        {
          "itemId": "item-a9-storm-core",
          "quantity": 4
        },
        {
          "itemId": "item-a9-cloudfeather",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "stormspire-aerie"
    }
  },
  {
    "kind": "misc",
    "id": "item-a10-hollowsteel",
    "name": "Hollowsteel",
    "goldCost": 48,
    "rarity": "epic",
    "description": "A crafting material recovered from The Hollow Crown.",
    "iconUrl": "/assets/items/gold-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a10-crown-shard",
    "name": "Crown Shard",
    "goldCost": 51,
    "rarity": "epic",
    "description": "A crafting material recovered from The Hollow Crown.",
    "iconUrl": "/assets/items/arcane-crystal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a10-soul-ash",
    "name": "Soul Ash",
    "goldCost": 54,
    "rarity": "epic",
    "description": "A crafting material recovered from The Hollow Crown.",
    "iconUrl": "/assets/items/coal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-crownless-head",
    "name": "Crownless Helm",
    "goldCost": 430,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "strength": 7,
      "vitality": 4
    },
    "armor": 7,
    "set": "set-a10-crownless",
    "setName": "Crownless",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-crownless-chest",
    "name": "Crownless Cuirass",
    "goldCost": 438,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "strength": 8,
      "vitality": 4
    },
    "armor": 9,
    "set": "set-a10-crownless",
    "setName": "Crownless",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-crownless-pants",
    "name": "Crownless Greaves",
    "goldCost": 446,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "strength": 7,
      "vitality": 4
    },
    "armor": 7,
    "set": "set-a10-crownless",
    "setName": "Crownless",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-crownless-boots",
    "name": "Crownless Sabatons",
    "goldCost": 454,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "epic",
    "description": "A epic plate piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "strength": 7,
      "vitality": 4
    },
    "armor": 7,
    "set": "set-a10-crownless",
    "setName": "Crownless",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-crownless-ring",
    "name": "Crownless Signet",
    "goldCost": 462,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "strength": 7,
      "vitality": 4
    },
    "armor": 7,
    "set": "set-a10-crownless",
    "setName": "Crownless",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a10-hollowsteel",
          "quantity": 14
        },
        {
          "itemId": "item-a10-crown-shard",
          "quantity": 2
        },
        {
          "itemId": "item-a10-soul-ash",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "hollow-crown"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a10-veilborn-head",
    "name": "Veilborn Cowl",
    "goldCost": 430,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "agility": 7,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a10-veilborn",
    "setName": "Veilborn",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-veilborn-chest",
    "name": "Veilborn Jerkin",
    "goldCost": 438,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "agility": 8,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a10-veilborn",
    "setName": "Veilborn",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-veilborn-pants",
    "name": "Veilborn Legwraps",
    "goldCost": 446,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "agility": 7,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a10-veilborn",
    "setName": "Veilborn",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-veilborn-boots",
    "name": "Veilborn Treads",
    "goldCost": 454,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "epic",
    "description": "A epic leather piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "agility": 7,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a10-veilborn",
    "setName": "Veilborn",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-veilborn-ring",
    "name": "Veilborn Band",
    "goldCost": 462,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "agility": 7,
      "luck": 4
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a10-veilborn",
    "setName": "Veilborn",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a10-hollowsteel",
          "quantity": 14
        },
        {
          "itemId": "item-a10-crown-shard",
          "quantity": 3
        },
        {
          "itemId": "item-a10-soul-ash",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "hollow-crown"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a10-ashen-oracle-head",
    "name": "Ashen Oracle Hood",
    "goldCost": 430,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/head-03.webp",
    "stats": {
      "intelligence": 7,
      "vitality": 4
    },
    "magicResistance": 7,
    "set": "set-a10-ashen-oracle",
    "setName": "Ashen Oracle",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-ashen-oracle-chest",
    "name": "Ashen Oracle Robes",
    "goldCost": 438,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/chest-04.webp",
    "stats": {
      "intelligence": 8,
      "vitality": 4
    },
    "magicResistance": 9,
    "set": "set-a10-ashen-oracle",
    "setName": "Ashen Oracle",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-ashen-oracle-pants",
    "name": "Ashen Oracle Leggings",
    "goldCost": 446,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/pants-05.webp",
    "stats": {
      "intelligence": 7,
      "vitality": 4
    },
    "magicResistance": 7,
    "set": "set-a10-ashen-oracle",
    "setName": "Ashen Oracle",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-ashen-oracle-boots",
    "name": "Ashen Oracle Slippers",
    "goldCost": 454,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "epic",
    "description": "A epic cloth piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/boots-01.webp",
    "stats": {
      "intelligence": 7,
      "vitality": 4
    },
    "magicResistance": 7,
    "set": "set-a10-ashen-oracle",
    "setName": "Ashen Oracle",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a10-ashen-oracle-ring",
    "name": "Ashen Oracle Loop",
    "goldCost": 462,
    "slot": "ring",
    "rarity": "epic",
    "description": "A epic ring piece shaped by the dangers of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/ring-02.webp",
    "stats": {
      "intelligence": 7,
      "vitality": 4
    },
    "magicResistance": 7,
    "set": "set-a10-ashen-oracle",
    "setName": "Ashen Oracle",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a10-hollowsteel",
          "quantity": 14
        },
        {
          "itemId": "item-a10-crown-shard",
          "quantity": 4
        },
        {
          "itemId": "item-a10-soul-ash",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "hollow-crown"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a10-crown-sunder",
    "name": "Crown-Sunder",
    "goldCost": 590,
    "slot": "mainHand",
    "weaponEquipType": "oneHand",
    "weaponKind": "sword",
    "rarity": "epic",
    "description": "Crown-Sunder carries the hard-won power of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/sword-01.webp",
    "stats": {
      "strength": 7
    },
    "physicalPower": 32,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a10-hollowsteel",
          "quantity": 17
        },
        {
          "itemId": "item-a10-crown-shard",
          "quantity": 4
        },
        {
          "itemId": "item-a10-soul-ash",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "hollow-crown"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a10-last-oracle-staff",
    "name": "Staff of the Last Oracle",
    "goldCost": 590,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "rarity": "epic",
    "description": "Staff of the Last Oracle carries the hard-won power of The Hollow Crown.",
    "iconUrl": "/assets/gear-icons/staff-02.webp",
    "stats": {
      "intelligence": 7
    },
    "magicalPower": 32,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a10-hollowsteel",
          "quantity": 17
        },
        {
          "itemId": "item-a10-crown-shard",
          "quantity": 4
        },
        {
          "itemId": "item-a10-soul-ash",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "hollow-crown"
    }
  },
  {
    "kind": "misc",
    "id": "item-a11-star-metal",
    "name": "Star Metal",
    "goldCost": 52,
    "rarity": "epic",
    "description": "A crafting material recovered from The Astral Scar.",
    "iconUrl": "/assets/items/silver-ore.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a11-astral-glass",
    "name": "Astral Glass",
    "goldCost": 55,
    "rarity": "epic",
    "description": "A crafting material recovered from The Astral Scar.",
    "iconUrl": "/assets/items/arcane-crystal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a11-comet-silk",
    "name": "Comet Silk",
    "goldCost": 58,
    "rarity": "epic",
    "description": "A crafting material recovered from The Astral Scar.",
    "iconUrl": "/assets/items/fine-cloth.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-starforged-head",
    "name": "Starforged Helm",
    "goldCost": 465,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "vitality": 5
    },
    "armor": 7,
    "set": "set-a11-starforged",
    "setName": "Starforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-starforged-chest",
    "name": "Starforged Cuirass",
    "goldCost": 473,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "vitality": 5
    },
    "armor": 9,
    "set": "set-a11-starforged",
    "setName": "Starforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-starforged-pants",
    "name": "Starforged Greaves",
    "goldCost": 481,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "vitality": 5
    },
    "armor": 7,
    "set": "set-a11-starforged",
    "setName": "Starforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-starforged-boots",
    "name": "Starforged Sabatons",
    "goldCost": 489,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "vitality": 5
    },
    "armor": 7,
    "set": "set-a11-starforged",
    "setName": "Starforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-starforged-ring",
    "name": "Starforged Signet",
    "goldCost": 497,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "vitality": 5
    },
    "armor": 7,
    "set": "set-a11-starforged",
    "setName": "Starforged",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a11-star-metal",
          "quantity": 15
        },
        {
          "itemId": "item-a11-astral-glass",
          "quantity": 2
        },
        {
          "itemId": "item-a11-comet-silk",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "astral-scar"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a11-voidstrider-head",
    "name": "Voidstrider Cowl",
    "goldCost": 465,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "agility": 8,
      "luck": 5
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a11-voidstrider",
    "setName": "Voidstrider",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-voidstrider-chest",
    "name": "Voidstrider Jerkin",
    "goldCost": 473,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "agility": 9,
      "luck": 5
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a11-voidstrider",
    "setName": "Voidstrider",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-voidstrider-pants",
    "name": "Voidstrider Legwraps",
    "goldCost": 481,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "agility": 8,
      "luck": 5
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a11-voidstrider",
    "setName": "Voidstrider",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-voidstrider-boots",
    "name": "Voidstrider Treads",
    "goldCost": 489,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "agility": 8,
      "luck": 5
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a11-voidstrider",
    "setName": "Voidstrider",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-voidstrider-ring",
    "name": "Voidstrider Band",
    "goldCost": 497,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "agility": 8,
      "luck": 5
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.04
      }
    },
    "set": "set-a11-voidstrider",
    "setName": "Voidstrider",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a11-star-metal",
          "quantity": 15
        },
        {
          "itemId": "item-a11-astral-glass",
          "quantity": 3
        },
        {
          "itemId": "item-a11-comet-silk",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "astral-scar"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a11-astral-savant-head",
    "name": "Astral Savant Hood",
    "goldCost": 465,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/head-03.webp",
    "stats": {
      "intelligence": 8,
      "vitality": 5
    },
    "magicResistance": 7,
    "set": "set-a11-astral-savant",
    "setName": "Astral Savant",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-astral-savant-chest",
    "name": "Astral Savant Robes",
    "goldCost": 473,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/chest-04.webp",
    "stats": {
      "intelligence": 9,
      "vitality": 5
    },
    "magicResistance": 9,
    "set": "set-a11-astral-savant",
    "setName": "Astral Savant",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-astral-savant-pants",
    "name": "Astral Savant Leggings",
    "goldCost": 481,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/pants-05.webp",
    "stats": {
      "intelligence": 8,
      "vitality": 5
    },
    "magicResistance": 7,
    "set": "set-a11-astral-savant",
    "setName": "Astral Savant",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-astral-savant-boots",
    "name": "Astral Savant Slippers",
    "goldCost": 489,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/boots-01.webp",
    "stats": {
      "intelligence": 8,
      "vitality": 5
    },
    "magicResistance": 7,
    "set": "set-a11-astral-savant",
    "setName": "Astral Savant",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a11-astral-savant-ring",
    "name": "Astral Savant Loop",
    "goldCost": 497,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/ring-02.webp",
    "stats": {
      "intelligence": 8,
      "vitality": 5
    },
    "magicResistance": 7,
    "set": "set-a11-astral-savant",
    "setName": "Astral Savant",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a11-star-metal",
          "quantity": 15
        },
        {
          "itemId": "item-a11-astral-glass",
          "quantity": 4
        },
        {
          "itemId": "item-a11-comet-silk",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "astral-scar"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a11-cometfall",
    "name": "Cometfall",
    "goldCost": 635,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "mace",
    "rarity": "legendary",
    "description": "Cometfall carries the hard-won power of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/mace-02.webp",
    "stats": {
      "strength": 8
    },
    "physicalPower": 36,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a11-star-metal",
          "quantity": 18
        },
        {
          "itemId": "item-a11-astral-glass",
          "quantity": 4
        },
        {
          "itemId": "item-a11-comet-silk",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "astral-scar"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a11-orrery-staff",
    "name": "Staff of the Last Orrery",
    "goldCost": 635,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "staff",
    "rarity": "legendary",
    "description": "Staff of the Last Orrery carries the hard-won power of The Astral Scar.",
    "iconUrl": "/assets/gear-icons/staff-03.webp",
    "stats": {
      "intelligence": 8
    },
    "magicalPower": 36,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a11-star-metal",
          "quantity": 18
        },
        {
          "itemId": "item-a11-astral-glass",
          "quantity": 4
        },
        {
          "itemId": "item-a11-comet-silk",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "astral-scar"
    }
  },
  {
    "kind": "misc",
    "id": "item-a12-worldroot-heartwood",
    "name": "Worldroot Heartwood",
    "goldCost": 56,
    "rarity": "epic",
    "description": "A crafting material recovered from The World Below.",
    "iconUrl": "/assets/items/hardwood.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a12-first-echo",
    "name": "First Echo",
    "goldCost": 59,
    "rarity": "epic",
    "description": "A crafting material recovered from The World Below.",
    "iconUrl": "/assets/items/arcane-crystal.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "misc",
    "id": "item-a12-abyssal-hide",
    "name": "Abyssal Hide",
    "goldCost": 62,
    "rarity": "epic",
    "description": "A crafting material recovered from The World Below.",
    "iconUrl": "/assets/items/monster-hide.webp",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldroot-bastion-head",
    "name": "Worldroot Bastion Helm",
    "goldCost": 500,
    "slot": "head",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/head-01.webp",
    "stats": {
      "strength": 9,
      "vitality": 6
    },
    "armor": 8,
    "set": "set-a12-worldroot-bastion",
    "setName": "Worldroot Bastion",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldroot-bastion-chest",
    "name": "Worldroot Bastion Cuirass",
    "goldCost": 508,
    "slot": "chest",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/chest-02.webp",
    "stats": {
      "strength": 10,
      "vitality": 6
    },
    "armor": 10,
    "set": "set-a12-worldroot-bastion",
    "setName": "Worldroot Bastion",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldroot-bastion-pants",
    "name": "Worldroot Bastion Greaves",
    "goldCost": 516,
    "slot": "pants",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/pants-03.webp",
    "stats": {
      "strength": 9,
      "vitality": 6
    },
    "armor": 8,
    "set": "set-a12-worldroot-bastion",
    "setName": "Worldroot Bastion",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldroot-bastion-boots",
    "name": "Worldroot Bastion Sabatons",
    "goldCost": 524,
    "slot": "boots",
    "armorMaterial": "plate",
    "rarity": "legendary",
    "description": "A legendary plate piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/boots-04.webp",
    "stats": {
      "strength": 9,
      "vitality": 6
    },
    "armor": 8,
    "set": "set-a12-worldroot-bastion",
    "setName": "Worldroot Bastion",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldroot-bastion-ring",
    "name": "Worldroot Bastion Signet",
    "goldCost": 532,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/ring-05.webp",
    "stats": {
      "strength": 9,
      "vitality": 6
    },
    "armor": 8,
    "set": "set-a12-worldroot-bastion",
    "setName": "Worldroot Bastion",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a12-worldroot-heartwood",
          "quantity": 16
        },
        {
          "itemId": "item-a12-first-echo",
          "quantity": 2
        },
        {
          "itemId": "item-a12-abyssal-hide",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "world-below"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a12-deepstalker-head",
    "name": "Deepstalker Cowl",
    "goldCost": 500,
    "slot": "head",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/head-02.webp",
    "stats": {
      "agility": 9,
      "luck": 6
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.05
      }
    },
    "set": "set-a12-deepstalker",
    "setName": "Deepstalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-deepstalker-chest",
    "name": "Deepstalker Jerkin",
    "goldCost": 508,
    "slot": "chest",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/chest-03.webp",
    "stats": {
      "agility": 10,
      "luck": 6
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.05
      }
    },
    "set": "set-a12-deepstalker",
    "setName": "Deepstalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-deepstalker-pants",
    "name": "Deepstalker Legwraps",
    "goldCost": 516,
    "slot": "pants",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/pants-04.webp",
    "stats": {
      "agility": 9,
      "luck": 6
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.05
      }
    },
    "set": "set-a12-deepstalker",
    "setName": "Deepstalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-deepstalker-boots",
    "name": "Deepstalker Treads",
    "goldCost": 524,
    "slot": "boots",
    "armorMaterial": "leather",
    "rarity": "legendary",
    "description": "A legendary leather piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/boots-05.webp",
    "stats": {
      "agility": 9,
      "luck": 6
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.05
      }
    },
    "set": "set-a12-deepstalker",
    "setName": "Deepstalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-deepstalker-ring",
    "name": "Deepstalker Band",
    "goldCost": 532,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/ring-01.webp",
    "stats": {
      "agility": 9,
      "luck": 6
    },
    "combat": {
      "passive": {
        "dodgeChance": 0.05
      }
    },
    "set": "set-a12-deepstalker",
    "setName": "Deepstalker",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "leatherworker",
      "ingredients": [
        {
          "itemId": "item-a12-worldroot-heartwood",
          "quantity": 16
        },
        {
          "itemId": "item-a12-first-echo",
          "quantity": 3
        },
        {
          "itemId": "item-a12-abyssal-hide",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "world-below"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a12-first-tongue-head",
    "name": "First Tongue Hood",
    "goldCost": 500,
    "slot": "head",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/head-03.webp",
    "stats": {
      "intelligence": 9,
      "vitality": 6
    },
    "magicResistance": 8,
    "set": "set-a12-first-tongue",
    "setName": "First Tongue",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-first-tongue-chest",
    "name": "First Tongue Robes",
    "goldCost": 508,
    "slot": "chest",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/chest-04.webp",
    "stats": {
      "intelligence": 10,
      "vitality": 6
    },
    "magicResistance": 10,
    "set": "set-a12-first-tongue",
    "setName": "First Tongue",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-first-tongue-pants",
    "name": "First Tongue Leggings",
    "goldCost": 516,
    "slot": "pants",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/pants-05.webp",
    "stats": {
      "intelligence": 9,
      "vitality": 6
    },
    "magicResistance": 8,
    "set": "set-a12-first-tongue",
    "setName": "First Tongue",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-first-tongue-boots",
    "name": "First Tongue Slippers",
    "goldCost": 524,
    "slot": "boots",
    "armorMaterial": "cloth",
    "rarity": "legendary",
    "description": "A legendary cloth piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/boots-01.webp",
    "stats": {
      "intelligence": 9,
      "vitality": 6
    },
    "magicResistance": 8,
    "set": "set-a12-first-tongue",
    "setName": "First Tongue",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": null
  },
  {
    "kind": "gear",
    "id": "gear-a12-first-tongue-ring",
    "name": "First Tongue Loop",
    "goldCost": 532,
    "slot": "ring",
    "rarity": "legendary",
    "description": "A legendary ring piece shaped by the dangers of The World Below.",
    "iconUrl": "/assets/gear-icons/ring-02.webp",
    "stats": {
      "intelligence": 9,
      "vitality": 6
    },
    "magicResistance": 8,
    "set": "set-a12-first-tongue",
    "setName": "First Tongue",
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "tailor",
      "ingredients": [
        {
          "itemId": "item-a12-worldroot-heartwood",
          "quantity": 16
        },
        {
          "itemId": "item-a12-first-echo",
          "quantity": 4
        },
        {
          "itemId": "item-a12-abyssal-hide",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "world-below"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a12-worldsplitter",
    "name": "Worldsplitter",
    "goldCost": 680,
    "slot": "mainHand",
    "weaponEquipType": "twoHand",
    "weaponKind": "axe",
    "rarity": "legendary",
    "description": "Worldsplitter carries the hard-won power of The World Below.",
    "iconUrl": "/assets/gear-icons/axe-03.webp",
    "stats": {
      "strength": 9
    },
    "physicalPower": 40,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "blacksmith",
      "ingredients": [
        {
          "itemId": "item-a12-worldroot-heartwood",
          "quantity": 19
        },
        {
          "itemId": "item-a12-first-echo",
          "quantity": 4
        },
        {
          "itemId": "item-a12-abyssal-hide",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "world-below"
    }
  },
  {
    "kind": "gear",
    "id": "gear-a12-voice-below",
    "name": "Voice of the World Below",
    "goldCost": 680,
    "slot": "offHand",
    "weaponEquipType": "offHand",
    "weaponKind": "tome",
    "rarity": "legendary",
    "description": "Voice of the World Below carries the hard-won power of The World Below.",
    "iconUrl": "/assets/gear-icons/tome-04.webp",
    "stats": {
      "intelligence": 9
    },
    "magicalPower": 40,
    "arkenfallVendor": null,
    "vendorPrerequisiteAdventureId": null,
    "craftingRecipe": {
      "station": "jeweler",
      "ingredients": [
        {
          "itemId": "item-a12-worldroot-heartwood",
          "quantity": 19
        },
        {
          "itemId": "item-a12-first-echo",
          "quantity": 4
        },
        {
          "itemId": "item-a12-abyssal-hide",
          "quantity": 4
        }
      ],
      "prerequisiteAdventureId": "world-below"
    }
  },
  {
    "kind": "consumable",
    "id": "consumable-a4-antivenom",
    "name": "Mirefen Antivenom",
    "goldCost": 45,
    "rarity": "uncommon",
    "description": "A sharp herbal antidote that removes Poison.",
    "iconUrl": "/assets/items/potion-green-normal.webp",
    "effects": [
      {
        "type": "remove_status",
        "target": "self",
        "status": "poison"
      }
    ],
    "arkenfallVendor": "alchemist",
    "vendorPrerequisiteAdventureId": "mirefen-marsh",
    "craftingRecipe": {
      "station": "alchemist",
      "ingredients": [
        {
          "itemId": "item-a4-venom-sac",
          "quantity": 2
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "mirefen-marsh"
    }
  },
  {
    "kind": "consumable",
    "id": "consumable-a5-cooling-salve",
    "name": "Cooling Salve",
    "goldCost": 60,
    "rarity": "rare",
    "description": "A frost-laced salve that removes Burn.",
    "iconUrl": "/assets/items/potion-blue-normal.webp",
    "effects": [
      {
        "type": "remove_status",
        "target": "self",
        "status": "burn"
      }
    ],
    "arkenfallVendor": "alchemist",
    "vendorPrerequisiteAdventureId": "ashen-foundry",
    "craftingRecipe": {
      "station": "alchemist",
      "ingredients": [
        {
          "itemId": "item-a5-ember-fragment",
          "quantity": 1
        },
        {
          "itemId": "item-a4-mire-reed",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "ashen-foundry"
    }
  },
  {
    "kind": "consumable",
    "id": "consumable-a6-coagulant",
    "name": "Coagulant Bandage",
    "goldCost": 75,
    "rarity": "rare",
    "description": "A treated field dressing that removes Bleed.",
    "iconUrl": "/assets/items/potion-red-normal.webp",
    "effects": [
      {
        "type": "remove_status",
        "target": "self",
        "status": "bleed"
      }
    ],
    "arkenfallVendor": "alchemist",
    "vendorPrerequisiteAdventureId": "sunken-reliquary",
    "craftingRecipe": {
      "station": "alchemist",
      "ingredients": [
        {
          "itemId": "item-a6-relic-shard",
          "quantity": 1
        },
        {
          "itemId": "item-a5-sootweave",
          "quantity": 3
        }
      ],
      "prerequisiteAdventureId": "sunken-reliquary"
    }
  }
];

export const GEAR_SETS: GearSetDefinition[] = [
  {
    "id": "set-ms1i2u94-7cirx",
    "name": "Goblin Scavanger",
    "pieceCount": 3,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+1 Agility.",
        "passive": {
          "stats": {
            "agility": 1
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+5% Critical Strike Chance.",
        "passive": {
          "critChance": 0.05
        }
      }
    ]
  },
  {
    "id": "set-ms1i8zro-gf9ze",
    "name": "Hexcaster",
    "pieceCount": 3,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+2 Spell Power.",
        "passive": {
          "stats": {},
          "magicalPower": 2
        }
      },
      {
        "requiredPieces": 3,
        "description": "+2 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 2
          }
        }
      }
    ]
  },
  {
    "id": "set-ms27mp57-ibgeg",
    "name": "Platemonger",
    "pieceCount": 3,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+1 Strength.",
        "passive": {
          "stats": {
            "strength": 2
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+2 Vitality, +1 Armor",
        "passive": {
          "stats": {
            "vitality": 2
          },
          "armor": 1
        }
      }
    ]
  },
  {
    "id": "set-nightveil",
    "name": "Nightveil",
    "pieceCount": 4,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+2 Agility.",
        "passive": {
          "stats": {
            "agility": 2
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+6% Critical Strike Chance.",
        "passive": {
          "critChance": 0.06
        }
      },
      {
        "requiredPieces": 4,
        "description": "Critical strikes grant +20% Dodge Chance until your next turn.",
        "triggers": [
          {
            "id": "nightveil-critical-evasion",
            "name": "Nightveil",
            "description": "Critical strikes grant +20% Dodge Chance until your next turn.",
            "event": "on_crit",
            "effects": [
              {
                "type": "apply_status",
                "target": "self",
                "status": {
                  "id": "evasion",
                  "name": "Evasion",
                  "kind": "buff",
                  "duration": 1,
                  "stacks": 1,
                  "description": "+20% Dodge Chance until your next turn. Dodge Chance cannot exceed 50%.",
                  "magnitude": 0.2
                }
              }
            ]
          }
        ],
        "passive": {}
      }
    ]
  },
  {
    "id": "set-trollforged",
    "name": "Trollforged",
    "pieceCount": 4,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+3 Strength.",
        "passive": {
          "stats": {
            "strength": 3
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+3 Vitality and +2 Armor.",
        "passive": {
          "stats": {
            "vitality": 3
          },
          "armor": 2
        }
      },
      {
        "requiredPieces": 4,
        "description": "Once per turn, taking Health damage grants 3 Guard.",
        "triggers": [
          {
            "id": "trollforged-retaliatory-guard",
            "name": "Trollforged",
            "description": "Once per turn, taking Health damage grants 3 Guard.",
            "event": "damage_taken",
            "conditions": {
              "minimumDamage": 1
            },
            "oncePerTurn": true,
            "effects": [
              {
                "type": "gain_guard",
                "target": "self",
                "amount": 3
              }
            ]
          }
        ],
        "passive": {}
      }
    ]
  },
  {
    "id": "set-runewoven",
    "name": "Runewoven",
    "pieceCount": 4,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+3 Spell Power.",
        "passive": {
          "magicalPower": 3
        }
      },
      {
        "requiredPieces": 3,
        "description": "+3 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 3
          }
        }
      },
      {
        "requiredPieces": 4,
        "description": "Once per turn, dealing Magic damage restores 1 Energy.",
        "triggers": [
          {
            "id": "runewoven-arcane-cycle",
            "name": "Runewoven",
            "description": "Once per turn, dealing Magic damage restores 1 Energy.",
            "event": "damage_dealt",
            "conditions": {
              "damageTypes": [
                "spell",
                "arcane",
                "fire",
                "frost",
                "lightning"
              ],
              "minimumDamage": 1
            },
            "oncePerTurn": true,
            "effects": [
              {
                "type": "gain_energy",
                "target": "self",
                "amount": 1
              }
            ]
          }
        ],
        "passive": {}
      }
    ]
  },
  {
    "id": "set-windsong-thornbark",
    "name": "Thornbark Bulwark",
    "pieceCount": 2,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+1 Vitality.",
        "passive": {
          "stats": {
            "vitality": 1
          }
        }
      }
    ]
  },
  {
    "id": "set-windsong-galehide",
    "name": "Galehide",
    "pieceCount": 2,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+1 Vitality.",
        "passive": {
          "stats": {
            "vitality": 1
          }
        }
      }
    ]
  },
  {
    "id": "set-windsong-wispwoven",
    "name": "Wispwoven",
    "pieceCount": 2,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+1 Vitality.",
        "passive": {
          "stats": {
            "vitality": 1
          }
        }
      }
    ]
  },
  {
    "id": "set-a4-fenwarden",
    "name": "Fenwarden",
    "pieceCount": 5,
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
        "description": "+4 Physical Power.",
        "passive": {
          "physicalPower": 4
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Poison deals 20% more damage.",
        "passive": {
          "statusDamage": {
            "poison": 0.2
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Venom cannot afflict you, and Bleed deals 20% less damage.",
        "passive": {
          "statusImmunities": [
            "poison"
          ],
          "bleedDamageReduction": 0.2
        }
      }
    ]
  },
  {
    "id": "set-a4-mirestalker",
    "name": "Mirestalker",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+2 Agility.",
        "passive": {
          "stats": {
            "agility": 2
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+4 Physical Power.",
        "passive": {
          "physicalPower": 4
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Poison deals 20% more damage.",
        "passive": {
          "statusDamage": {
            "poison": 0.2
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Whenever you apply Poison, apply 1 additional stack; your Poison deals 25% more damage.",
        "passive": {
          "statusApplicationStacks": {
            "poison": 1
          },
          "statusDamage": {
            "poison": 0.25
          }
        }
      }
    ]
  },
  {
    "id": "set-a5-emberforged",
    "name": "Emberforged",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+4 Strength.",
        "passive": {
          "stats": {
            "strength": 4
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+6 Physical Power.",
        "passive": {
          "physicalPower": 6
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Burn deals 22% more damage.",
        "passive": {
          "statusDamage": {
            "burn": 0.22
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Burn cannot afflict you, and begin each combat with Guard equal to 12% of maximum Health.",
        "passive": {
          "statusImmunities": [
            "burn"
          ],
          "startingAbsorptionMaxHpRatios": {
            "guard": 0.12
          }
        }
      }
    ]
  },
  {
    "id": "set-a5-cinderweave",
    "name": "Cinderweave",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+4 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 4
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+6 Spell Power.",
        "passive": {
          "magicalPower": 6
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Burn deals 22% more damage.",
        "passive": {
          "statusDamage": {
            "burn": 0.22
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Your Burn deals 35% more damage and restores Health equal to 10% of its damage.",
        "passive": {
          "statusDamage": {
            "burn": 0.35
          },
          "statusDamageLeech": {
            "burn": 0.1
          }
        }
      }
    ]
  },
  {
    "id": "set-a6-depthguard",
    "name": "Depthguard",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+6 Vitality.",
        "passive": {
          "stats": {
            "vitality": 6
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+8 Physical Power.",
        "passive": {
          "physicalPower": 8
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Wet lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "wet": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Wet cannot afflict you, and begin each combat with Barrier equal to 15% of maximum Health.",
        "passive": {
          "statusImmunities": [
            "wet"
          ],
          "startingAbsorptionMaxHpRatios": {
            "barrier": 0.15
          }
        }
      }
    ]
  },
  {
    "id": "set-a6-tidecaller",
    "name": "Tidecaller",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+6 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 6
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+8 Spell Power.",
        "passive": {
          "magicalPower": 8
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Electrified lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "electrified": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Applying Wet also applies Electrified, and your Electrified lasts 1 additional turn.",
        "passive": {
          "statusApplicationCompanions": {
            "wet": [
              "electrified"
            ]
          },
          "statusDurationBonuses": {
            "electrified": 1
          }
        }
      }
    ]
  },
  {
    "id": "set-a7-nightglass",
    "name": "Nightglass",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+8 Agility.",
        "passive": {
          "stats": {
            "agility": 8
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+10 Physical Power.",
        "passive": {
          "physicalPower": 10
        }
      },
      {
        "requiredPieces": 4,
        "description": "+6% Dodge Chance.",
        "passive": {
          "dodgeChance": 0.06
        }
      },
      {
        "requiredPieces": 5,
        "description": "Begin combat in Stealth and gain +8% Dodge Chance.",
        "passive": {
          "dodgeChance": 0.08,
          "startingStatuses": [
            {
              "id": "stealth",
              "name": "Stealth",
              "kind": "buff",
              "duration": 2,
              "stacks": 1,
              "description": "Cannot be targeted by enemies. Ends after attacking or taking damage."
            }
          ]
        }
      }
    ]
  },
  {
    "id": "set-a7-bloodbound",
    "name": "Bloodbound",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+8 Strength.",
        "passive": {
          "stats": {
            "strength": 8
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+10 Physical Power.",
        "passive": {
          "physicalPower": 10
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Bleed deals 26% more damage.",
        "passive": {
          "statusDamage": {
            "bleed": 0.26
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Your Bleed deals 35% more damage and restores Health equal to 15% of its damage.",
        "passive": {
          "statusDamage": {
            "bleed": 0.35
          },
          "statusDamageLeech": {
            "bleed": 0.15
          }
        }
      }
    ]
  },
  {
    "id": "set-a8-rimeguard",
    "name": "Rimeguard",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+10 Vitality.",
        "passive": {
          "stats": {
            "vitality": 10
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+12 Physical Power.",
        "passive": {
          "physicalPower": 12
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Frozen lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "frozen": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Cold and Frozen cannot afflict you, and you take 30% less damage while Stunned.",
        "passive": {
          "statusImmunities": [
            "cold",
            "frozen"
          ],
          "incomingDamageMultiplierWhileStunned": 0.7
        }
      }
    ]
  },
  {
    "id": "set-a8-winterweave",
    "name": "Winterweave",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+10 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 10
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+12 Spell Power.",
        "passive": {
          "magicalPower": 12
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Cold lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "cold": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Applying Cold has a 15% chance to also Freeze, and your Cold effects deal 25% more damage.",
        "passive": {
          "statusApplicationCompanionChances": {
            "cold": [
              {
                "status": "frozen",
                "chance": 0.15
              }
            ]
          },
          "statusDamage": {
            "cold": 0.25
          }
        }
      }
    ]
  },
  {
    "id": "set-a9-stormrunner",
    "name": "Stormrunner",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+12 Agility.",
        "passive": {
          "stats": {
            "agility": 12
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+14 Physical Power.",
        "passive": {
          "physicalPower": 14
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Electrified lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "electrified": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Your Electrified lasts 1 additional turn and you gain +10% Dodge Chance.",
        "passive": {
          "statusDurationBonuses": {
            "electrified": 1
          },
          "dodgeChance": 0.1
        }
      }
    ]
  },
  {
    "id": "set-a9-tempest-sage",
    "name": "Tempest Sage",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+12 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 12
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+14 Spell Power.",
        "passive": {
          "magicalPower": 14
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Electrified lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "electrified": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Whenever you apply Electrified, apply 1 additional stack; gain 12% more Spell Power.",
        "passive": {
          "statusApplicationStacks": {
            "electrified": 1
          },
          "magicalPowerMultiplier": 0.12
        }
      }
    ]
  },
  {
    "id": "set-a10-crownless",
    "name": "Crownless",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+14 Strength.",
        "passive": {
          "stats": {
            "strength": 14
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+16 Physical Power.",
        "passive": {
          "physicalPower": 16
        }
      },
      {
        "requiredPieces": 4,
        "description": "Generate 32% more Guard.",
        "passive": {
          "guardGeneration": 0.32
        }
      },
      {
        "requiredPieces": 5,
        "description": "Begin combat with Guard equal to 20% of maximum Health and generate 25% more Guard.",
        "passive": {
          "startingAbsorptionMaxHpRatios": {
            "guard": 0.2
          },
          "guardGeneration": 0.25
        }
      }
    ]
  },
  {
    "id": "set-a10-veilborn",
    "name": "Veilborn",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+14 Agility.",
        "passive": {
          "stats": {
            "agility": 14
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+16 Physical Power.",
        "passive": {
          "physicalPower": 16
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Poison deals 32% more damage.",
        "passive": {
          "statusDamage": {
            "poison": 0.32
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Whenever you apply Poison, apply 1 additional stack; Poison restores Health equal to 20% of its damage.",
        "passive": {
          "statusApplicationStacks": {
            "poison": 1
          },
          "statusDamageLeech": {
            "poison": 0.2
          }
        }
      }
    ]
  },
  {
    "id": "set-a10-ashen-oracle",
    "name": "Ashen Oracle",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+14 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 14
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+16 Spell Power.",
        "passive": {
          "magicalPower": 16
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Burn deals 32% more damage.",
        "passive": {
          "statusDamage": {
            "burn": 0.32
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Applying Burn also applies Arcane Wound, and your Burn deals 40% more damage.",
        "passive": {
          "statusApplicationCompanions": {
            "burn": [
              "arcaneWound"
            ]
          },
          "statusDamage": {
            "burn": 0.4
          }
        }
      }
    ]
  },
  {
    "id": "set-a11-starforged",
    "name": "Starforged",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+16 Vitality.",
        "passive": {
          "stats": {
            "vitality": 16
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+18 Physical Power.",
        "passive": {
          "physicalPower": 18
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Barrier lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "barrier": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Arcane Wound cannot afflict you, and begin combat with Barrier equal to 22% of maximum Health.",
        "passive": {
          "statusImmunities": [
            "arcaneWound"
          ],
          "startingAbsorptionMaxHpRatios": {
            "barrier": 0.22
          }
        }
      }
    ]
  },
  {
    "id": "set-a11-voidstrider",
    "name": "Voidstrider",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+16 Agility.",
        "passive": {
          "stats": {
            "agility": 16
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+18 Physical Power.",
        "passive": {
          "physicalPower": 18
        }
      },
      {
        "requiredPieces": 4,
        "description": "+6% Dodge Chance.",
        "passive": {
          "dodgeChance": 0.06
        }
      },
      {
        "requiredPieces": 5,
        "description": "Blind cannot afflict you, and gain +12% Dodge Chance.",
        "passive": {
          "statusImmunities": [
            "blind"
          ],
          "dodgeChance": 0.12
        }
      }
    ]
  },
  {
    "id": "set-a11-astral-savant",
    "name": "Astral Savant",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+16 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 16
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+18 Spell Power.",
        "passive": {
          "magicalPower": 18
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your ArcaneWound lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "arcaneWound": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Whenever you apply Arcane Wound, apply 1 additional stack; gain 16% more Spell Power.",
        "passive": {
          "statusApplicationStacks": {
            "arcaneWound": 1
          },
          "magicalPowerMultiplier": 0.16
        }
      }
    ]
  },
  {
    "id": "set-a12-worldroot-bastion",
    "name": "Worldroot Bastion",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+18 Strength.",
        "passive": {
          "stats": {
            "strength": 18
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+20 Physical Power.",
        "passive": {
          "physicalPower": 20
        }
      },
      {
        "requiredPieces": 4,
        "description": "Generate 36% more Guard.",
        "passive": {
          "guardGeneration": 0.36
        }
      },
      {
        "requiredPieces": 5,
        "description": "Begin combat with Guard equal to 25% of maximum Health and generate 35% more Guard.",
        "passive": {
          "startingAbsorptionMaxHpRatios": {
            "guard": 0.25
          },
          "guardGeneration": 0.35
        }
      }
    ]
  },
  {
    "id": "set-a12-deepstalker",
    "name": "Deepstalker",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+18 Agility.",
        "passive": {
          "stats": {
            "agility": 18
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+20 Physical Power.",
        "passive": {
          "physicalPower": 20
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Bleed deals 36% more damage.",
        "passive": {
          "statusDamage": {
            "bleed": 0.36
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Your Bleed deals 45% more damage and restores Health equal to 20% of its damage.",
        "passive": {
          "statusDamage": {
            "bleed": 0.45
          },
          "statusDamageLeech": {
            "bleed": 0.2
          }
        }
      }
    ]
  },
  {
    "id": "set-a12-first-tongue",
    "name": "First Tongue",
    "pieceCount": 5,
    "bonuses": [
      {
        "requiredPieces": 2,
        "description": "+18 Intelligence.",
        "passive": {
          "stats": {
            "intelligence": 18
          }
        }
      },
      {
        "requiredPieces": 3,
        "description": "+20 Spell Power.",
        "passive": {
          "magicalPower": 20
        }
      },
      {
        "requiredPieces": 4,
        "description": "Your Vulnerable lasts 1 additional turn.",
        "passive": {
          "statusDurationBonuses": {
            "vulnerable": 1
          }
        }
      },
      {
        "requiredPieces": 5,
        "description": "Your Vulnerable lasts 1 additional turn; gain 18% more Spell Power.",
        "passive": {
          "statusDurationBonuses": {
            "vulnerable": 1
          },
          "magicalPowerMultiplier": 0.18
        }
      }
    ]
  }
];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = GEAR_SETS.flatMap((set) => set.bonuses.map((bonus) => ({
  ...bonus,
  setId: set.id,
  setName: set.name,
})));
