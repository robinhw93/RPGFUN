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
  }
];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = GEAR_SETS.flatMap((set) => set.bonuses.map((bonus) => ({
  ...bonus,
  setId: set.id,
  setName: set.name,
})));
