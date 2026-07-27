import type { EnemyTemplate } from "../types";

export const ENEMIES: Record<string, EnemyTemplate> = {
  "dummy": {
    "id": "dummy",
    "name": "DUMMY",
    "title": "Training Construct",
    "imageUrl": "/assets/enemies/full/dummy.webp",
    "portraitUrl": "/assets/enemies/portraits/dummy.webp",
    "maxHp": 100,
    "physicalPower": 1,
    "spellPower": 0,
    "armor": 0,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0,
    "critChance": 0,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [],
    "abilities": [
      {
        "id": "trainingStrike",
        "name": "Training Strike",
        "description": "Deals 1 base Physical damage.",
        "energyCost": 1,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "baseDamage": 1,
        "vfx": "enemy_training_strike"
      }
    ],
    "behaviorNotes": "Uses Training Strike whenever it has enough Energy.",
    "behavior": "single",
    "maxActionsPerTurn": 1,
    "accent": "#a8a69d"
  },
  "enemy-mrxiut2a-k4kgv": {
    "id": "enemy-mrxiut2a-k4kgv",
    "name": "Rabid Rat",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/rabid-rat.webp",
    "portraitUrl": "/assets/enemies/portraits/rabid-rat.webp",
    "maxHp": 9,
    "physicalPower": 1,
    "spellPower": 0,
    "armor": 0,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.1,
    "energyRegen": 1,
    "maxEnergy": 3,
    "startingEnergy": 3,
    "dropTable": [
      {
        "itemId": "item-ms0jej41-7sii2",
        "chance": 80
      },
      {
        "itemId": "gear-windsong-galehide-striders",
        "chance": 1
      },
      {
        "itemId": "gear-windsong-wolfstep-loop",
        "chance": 1
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-mrxjymmz-fomw6",
        "name": "Bite",
        "description": "Deals 100% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_bite"
      },
      {
        "id": "enemy-ability-mrxk052s-zrgdh",
        "name": "Scurry",
        "description": "Recovers 1 extra Energy next turn.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "melee",
        "nextTurnEnergyRegen": 1,
        "vfx": "enemy_scurry"
      },
      {
        "id": "enemy-ability-mrxk0xn3-cg5w8",
        "name": "Rabid Bite",
        "description": "Deals 100% Physical Power as Physical damage and applies 1 Poison.",
        "energyCost": 3,
        "cooldownTurns": 2,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 1
          }
        ],
        "vfx": "enemy_rabid_bite"
      }
    ],
    "behaviorNotes": "Starts with Bite, then Scurries until Rabid Bite is available. Afterwards it Scurries until Bite is available and repeats.",
    "behavior": "rabid_rat",
    "maxActionsPerTurn": 1,
    "accent": "#79a86d"
  },
  "enemy-mrxj4o6o-o45ia": {
    "id": "enemy-mrxj4o6o-o45ia",
    "name": "Windsong Wolf",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/windsong-wolf.webp",
    "portraitUrl": "/assets/enemies/portraits/windsong-wolf.webp",
    "maxHp": 16,
    "physicalPower": 2,
    "spellPower": 0,
    "armor": 0,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0.1,
    "critChance": 0.1,
    "energyRegen": 1,
    "maxEnergy": 6,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-ms0jdzsp-pnyoa",
        "chance": 20
      },
      {
        "itemId": "item-ms0jd8ky-lu2zb",
        "chance": 60
      },
      {
        "itemId": "gear-windsong-galehide-jerkin",
        "chance": 4
      },
      {
        "itemId": "gear-windsong-bramblefang",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-mrxjymmz-6ubjd",
        "name": "Howl",
        "description": "Applies Vulnerable.",
        "energyCost": 0,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "vulnerable"
          }
        ],
        "vfx": "enemy_howl"
      },
      {
        "id": "enemy-ability-mrxk2rt1-qaobv",
        "name": "Bite and Claw",
        "description": "Strikes twice for 50% Physical Power as Physical damage per hit. Each hit has a 20% chance to apply Bleed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.5,
        "hits": 2,
        "statusApplications": [
          {
            "status": "bleed",
            "chance": 0.2
          }
        ],
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Always uses Howl when ready, then uses Bite and Claw when it has enough Energy.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#79a86d"
  },
  "enemy-mrxk609z-n04fq": {
    "id": "enemy-mrxk609z-n04fq",
    "name": "Forest Wisp",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/forest-wisp.webp",
    "portraitUrl": "/assets/enemies/portraits/forest-wisp.webp",
    "maxHp": 8,
    "physicalPower": 0,
    "spellPower": 2,
    "armor": 0,
    "magicResistance": 1,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 2,
    "startingEnergy": 2,
    "dropTable": [
      {
        "itemId": "item-ms0jf0sp-z8hcl",
        "chance": 50
      },
      {
        "itemId": "gear-windsong-wispwoven-leggings",
        "chance": 0.8
      },
      {
        "itemId": "gear-windsong-wispwoven-band",
        "chance": 0.8
      },
      {
        "itemId": "gear-windsong-moondrop-wand",
        "chance": 0.8
      },
      {
        "itemId": "consumable-windsong-whisperbloom-tonic",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-mrxk7ose-fc13q",
        "name": "Wisp Blast",
        "description": "Deals Arcane damage equal to a random 50–100% of Spell Power and has a 10% chance to apply Weaken. When its final blast spends all Energy, the Forest Wisp becomes Stunned for 1 turn.",
        "energyCost": 1,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "powerScalingRange": {
          "power": "spell",
          "min": 0.5,
          "max": 1
        },
        "statusApplications": [
          {
            "status": "weaken",
            "chance": 0.1
          }
        ],
        "selfStatusApplicationsWhenEnergyDepleted": [
          {
            "status": "stunned",
            "duration": 2
          }
        ],
        "vfx": "enemy_wisp_blast"
      }
    ],
    "behaviorNotes": "Uses Wisp Blast repeatedly until its Energy is empty, then becomes Stunned for its next turn.",
    "behavior": "wisp_barrage",
    "maxActionsPerTurn": 10,
    "accent": "#79a86d"
  },
  "enemy-mrxkar5z-g9o5d": {
    "id": "enemy-mrxkar5z-g9o5d",
    "name": "Brown Bear",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/brown-bear.webp",
    "portraitUrl": "/assets/enemies/portraits/brown-bear.webp",
    "maxHp": 30,
    "physicalPower": 3,
    "spellPower": 0,
    "armor": 5,
    "magicResistance": 0,
    "hitChance": 0.85,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 0,
    "maxEnergy": 6,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-ms0jgblm-ko16i",
        "chance": 50
      },
      {
        "itemId": "gear-windsong-thornbark-visor",
        "chance": 8
      },
      {
        "itemId": "gear-windsong-thornbark-buckler",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-mrxkdwnl-vont1",
        "name": "Maul",
        "description": "Deals 100% Physical Power as Physical damage and applies 1 Bleed.",
        "energyCost": 3,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1
          }
        ],
        "vfx": "enemy_maul"
      },
      {
        "id": "enemy-ability-mrxkeegm-8fny8",
        "name": "Hibernate",
        "description": "Gains Sleep and recovers 6 extra Energy next turn.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "sleep",
            "duration": 2
          }
        ],
        "nextTurnEnergyRegen": 6,
        "vfx": "enemy_hibernate"
      },
      {
        "id": "enemy-ability-mrxkfj6b-snlgn",
        "name": "Roar",
        "description": "Applies Weaken and Vulnerable.",
        "energyCost": 3,
        "cooldownTurns": 6,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "weaken"
          },
          {
            "status": "vulnerable"
          }
        ],
        "vfx": "enemy_roar"
      }
    ],
    "behaviorNotes": "Opens with Roar and Maul. Uses Hibernate when it has no Energy, and otherwise uses Maul while Roar is cooling down.",
    "behavior": "brown_bear",
    "maxActionsPerTurn": 1,
    "accent": "#79a86d"
  },
  "enemy-mrxkjqs3-g7g5i": {
    "id": "enemy-mrxkjqs3-g7g5i",
    "name": "The Forest Spirit",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/forest-spirit.webp",
    "portraitUrl": "/assets/enemies/portraits/forest-spirit.webp",
    "maxHp": 36,
    "physicalPower": 0,
    "spellPower": 5,
    "armor": 1,
    "magicResistance": 1,
    "hitChance": 0.95,
    "dodgeChance": 0.1,
    "critChance": 0.1,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "gear-ms0h89t2-sczql",
        "chance": 100
      },
      {
        "itemId": "gear-ms0h9jvh-cpg4y",
        "chance": 100
      },
      {
        "itemId": "gear-ms0haj6d-e8pmv",
        "chance": 100
      },
      {
        "itemId": "item-ms0jf0sp-z8hcl",
        "chance": 80
      },
      {
        "itemId": "gear-windsong-thornbark-visor",
        "chance": 2
      },
      {
        "itemId": "gear-windsong-thornbark-buckler",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-mrxkkzcu-tqzsj",
        "name": "Fade Out",
        "description": "Gains Stealth until the end of its next turn and recovers 2 extra Energy next turn.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "target",
        "selfStatusApplications": [
          {
            "status": "stealth"
          }
        ],
        "nextTurnEnergyRegen": 2,
        "vfx": "enemy_fade_out"
      },
      {
        "id": "enemy-ability-mrxkmol2-9006k",
        "name": "Burning Glare",
        "description": "Deals 75% Spell Power as Fire damage and applies 1 Burn.",
        "energyCost": 2,
        "cooldownTurns": 2,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 0.75,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1
          }
        ],
        "vfx": "enemy_burning_glare"
      },
      {
        "id": "enemy-ability-mrxknrod-80ona",
        "name": "Nature's Beam",
        "description": "Deals 100% Spell Power as Arcane damage and applies Weaken.",
        "energyCost": 3,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 1,
        "statusApplications": [
          {
            "status": "weaken"
          }
        ],
        "vfx": "enemy_natures_beam"
      },
      {
        "id": "enemy-ability-mrxkq0sr-q1e8h",
        "name": "Shimmer",
        "description": "Restores full Energy next turn.",
        "energyCost": 0,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "target",
        "restoreFullEnergyNextTurn": true,
        "vfx": "enemy_shimmer"
      }
    ],
    "behaviorNotes": "Fights with two Forest Wisps. Whenever one dies, the Forest Spirit restores 25% of its maximum Health.",
    "behavior": "forest_spirit",
    "maxActionsPerTurn": 1,
    "healOnAllyDeath": {
      "allyId": "enemy-mrxk609z-n04fq",
      "maxHpRatio": 0.25,
      "vfx": "enemy_spirit_heal"
    },
    "accent": "#79a86d"
  },
  "enemy-ms1ej4re-xskqn": {
    "id": "enemy-ms1ej4re-xskqn",
    "name": "Goblin Longseer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/goblin-longseer.webp",
    "portraitUrl": "/assets/enemies/portraits/goblin-longseer.webp",
    "maxHp": 32,
    "physicalPower": 5,
    "spellPower": 0,
    "armor": 1,
    "magicResistance": 1,
    "hitChance": 0.95,
    "dodgeChance": 0.08,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 5,
    "startingEnergy": 1,
    "dropTable": [
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 30
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "gear-ms1i1671-yxsnp",
        "chance": 10
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms1ekpk5-l5ft7",
        "name": "Bow Shot",
        "description": "Deals 100% Physical Power as Physical damage.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_bow_shot"
      },
      {
        "id": "enemy-ability-ms1fezxg-6sfj6",
        "name": "Snipe",
        "description": "Deals 200% Physical Power as Physical damage and applies Vulnerable.",
        "energyCost": 5,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "physical",
        "physicalPowerScaling": 2,
        "statusApplications": [
          {
            "status": "vulnerable"
          }
        ],
        "vfx": "enemy_snipe"
      }
    ],
    "behaviorNotes": "Uses Bow Shot once per turn, replacing it with Snipe whenever it reaches 5 Energy.",
    "behavior": "goblin_longseer",
    "maxActionsPerTurn": 1,
    "accent": "#7f9453"
  },
  "enemy-ms1fgqar-mafv9": {
    "id": "enemy-ms1fgqar-mafv9",
    "name": "Goblin Quickstabber",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/goblin-quickstabber.webp",
    "portraitUrl": "/assets/enemies/portraits/goblin-quickstabber.webp",
    "maxHp": 28,
    "physicalPower": 6,
    "spellPower": 0,
    "armor": 1,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0.1,
    "critChance": 0.1,
    "energyRegen": 1,
    "maxEnergy": 5,
    "startingEnergy": 5,
    "dropTable": [
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 30
      },
      {
        "itemId": "consumable-ms0e551z-v6qcf",
        "chance": 10
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 100
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 60
      },
      {
        "itemId": "gear-ms1i1671-yxsnp",
        "chance": 10
      },
      {
        "itemId": "gear-ms1i5k37-1rg9d",
        "chance": 10
      },
      {
        "itemId": "gear-ms1i77n7-j9o2s",
        "chance": 10
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms1fjpq2-x44en",
        "name": "Stealth",
        "description": "Gains Stealth until the end of its next turn.",
        "energyCost": 0,
        "cooldownTurns": 5,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth"
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      },
      {
        "id": "enemy-ability-ms1fkbg6-tw10h",
        "name": "Shiv",
        "description": "Deals 100% Physical Power as Physical damage and applies 1 Poison.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 1
          }
        ],
        "vfx": "enemy_shiv"
      }
    ],
    "behaviorNotes": "Uses every available ability each turn, beginning with Stealth when it is ready.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#687b43"
  },
  "enemy-ms1fnbla-fs4ul": {
    "id": "enemy-ms1fnbla-fs4ul",
    "name": "Goblin Woundfixer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/goblin-woundfixer.webp",
    "portraitUrl": "/assets/enemies/portraits/goblin-woundfixer.webp",
    "maxHp": 34,
    "physicalPower": 2,
    "spellPower": 6,
    "armor": 0,
    "magicResistance": 3,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 20
      },
      {
        "itemId": "consumable-ms0e3hjh-5bewd",
        "chance": 5
      },
      {
        "itemId": "gear-ms1id4sv-l0ihy",
        "chance": 18
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "gear-ms1iccqm-4yu0n",
        "chance": 10
      },
      {
        "itemId": "gear-ms1iadb1-2snx8",
        "chance": 10
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms1fpoku-tvscy",
        "name": "Heal",
        "description": "Restores Health to the most wounded friendly target equal to 100% of Spell Power.",
        "energyCost": 3,
        "cooldownTurns": 2,
        "range": "ranged",
        "rangedPresentation": "target",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1,
        "vfx": "enemy_woundfixer_heal"
      },
      {
        "id": "enemy-ability-ms1fqn1u-55k6q",
        "name": "Hex",
        "description": "Deals 50% Spell Power as Spell damage and applies Slowed.",
        "energyCost": 1,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "spell",
        "spellPowerScaling": 0.5,
        "statusApplications": [
          {
            "status": "slowed"
          }
        ],
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Prioritizes healing the most wounded living ally, including itself, then uses Hex.",
    "behavior": "goblin_woundfixer",
    "maxActionsPerTurn": 1,
    "accent": "#846b9e"
  },
  "enemy-ms1ftdlw-jz5lo": {
    "id": "enemy-ms1ftdlw-jz5lo",
    "name": "Goblin Biggrown",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/goblin-biggrown.webp",
    "portraitUrl": "/assets/enemies/portraits/goblin-biggrown.webp",
    "maxHp": 46,
    "physicalPower": 6,
    "spellPower": 0,
    "armor": 4,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 5,
    "startingEnergy": 3,
    "dropTable": [
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 100
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 80
      },
      {
        "itemId": "gear-ms1i1671-yxsnp",
        "chance": 10
      },
      {
        "itemId": "gear-ms1i5k37-1rg9d",
        "chance": 10
      },
      {
        "itemId": "gear-ms1i77n7-j9o2s",
        "chance": 20
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms1fv25a-ukf1s",
        "name": "Heavy Cleave",
        "description": "Deals 250% Physical Power as Physical damage and applies 1 Bleed.",
        "energyCost": 5,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.5,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-ms1fwaul-zcws5",
        "name": "Protect",
        "description": "Grants 5 Guard to every other living enemy.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "friendlyTarget": "all_other_enemies",
        "friendlyStatusApplications": [
          {
            "status": "guard",
            "stacks": 5
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses Protect whenever it is ready and Heavy Cleave whenever it reaches 5 Energy.",
    "behavior": "goblin_biggrown",
    "maxActionsPerTurn": 1,
    "accent": "#8d6945"
  },
  "enemy-ms1fykbj-rhb65": {
    "id": "enemy-ms1fykbj-rhb65",
    "name": "Striz, Goblin Chieftain",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/striz-goblin-chieftain.webp",
    "portraitUrl": "/assets/enemies/portraits/striz-goblin-chieftain.webp",
    "maxHp": 80,
    "physicalPower": 10,
    "spellPower": 6,
    "armor": 4,
    "magicResistance": 4,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "consumable-ms0e551z-v6qcf",
        "chance": 60
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 100
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 100
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 60
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 100
      },
      {
        "itemId": "gear-ms1i1671-yxsnp",
        "chance": 20
      },
      {
        "itemId": "gear-ms1i5k37-1rg9d",
        "chance": 20
      },
      {
        "itemId": "gear-ms1i77n7-j9o2s",
        "chance": 20
      },
      {
        "itemId": "gear-ms1id4sv-l0ihy",
        "chance": 10
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms1g1ysa-6452h",
        "name": "Skewer",
        "description": "Deals 100% Physical Power as Physical damage and applies 1 Bleed.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1
          }
        ],
        "vfx": "enemy_skewer"
      },
      {
        "id": "enemy-ability-ms1g3m9s-n12oq",
        "name": "Rally",
        "description": "Grants Fierce to every living enemy.",
        "energyCost": 1,
        "cooldownTurns": 5,
        "range": "melee",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "fierce"
          }
        ],
        "vfx": "enemy_rally"
      },
      {
        "id": "enemy-ability-ms1gpjhe-m9ky3",
        "name": "Impale",
        "description": "Charges for one turn, then deals 150% Physical Power as Physical damage and applies 2 Bleed.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.5,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 2
          }
        ],
        "chargeTurns": 1,
        "chargeText": "Striz, Goblin Chieftain begins charging an attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale"
      },
      {
        "id": "enemy-ability-ms1gucm0-0n5ec",
        "name": "Spear Poke",
        "description": "Deals 75% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.75,
        "vfx": "enemy_spear_poke"
      }
    ],
    "behaviorNotes": "Uses every available ability when possible, with Spear Poke as its fallback. Impale is prepared for one turn before release.",
    "behavior": "goblin_chieftain",
    "maxActionsPerTurn": 4,
    "accent": "#aa633f"
  },
  "enemy-ms2vrqbb-8r5ux": {
    "id": "enemy-ms2vrqbb-8r5ux",
    "name": "Hill Troll",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/hill-troll.webp",
    "portraitUrl": "/assets/enemies/portraits/hill-troll.webp",
    "maxHp": 98,
    "physicalPower": 10,
    "spellPower": 0,
    "armor": 2,
    "magicResistance": 2,
    "hitChance": 0.9,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-ms0jd8ky-lu2zb",
        "chance": 10
      },
      {
        "itemId": "gear-ms0sx064-zq3n5",
        "chance": 10
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 10
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 10
      },
      {
        "itemId": "gear-ms30095w-ci3mw",
        "chance": 4
      },
      {
        "itemId": "gear-trollforged-greathelm",
        "chance": 5
      },
      {
        "itemId": "gear-trollforged-warboots",
        "chance": 5
      },
      {
        "itemId": "item-highfall-frostroot",
        "chance": 18
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2vx10q-s3qsn",
        "name": "Club Smash",
        "description": "Charges for one turn, then deals 250% Physical Power as Physical damage.",
        "energyCost": 10,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.5,
        "chargeTurns": 1,
        "chargeText": "Hill Troll begins winding up a crushing blow.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-ms2vylq4-ubwfz",
        "name": "Nap",
        "description": "Restores 15% maximum Health, gains Sleep, and recovers 10 extra Energy next turn.",
        "energyCost": 1,
        "cooldownTurns": 1,
        "range": "melee",
        "selfHealMaxHpRatio": 0.15,
        "selfStatusApplications": [
          {
            "status": "sleep",
            "duration": 2
          }
        ],
        "nextTurnEnergyRegen": 10,
        "vfx": "enemy_hibernate"
      }
    ],
    "behaviorNotes": "Charges Club Smash, releases it on the next turn, then uses Nap before repeating.",
    "behavior": "hill_troll",
    "maxActionsPerTurn": 1,
    "accent": "#6f735f"
  },
  "enemy-ms2w17p6-txpmq": {
    "id": "enemy-ms2w17p6-txpmq",
    "name": "Mountain Troll",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/mountain-troll.webp",
    "portraitUrl": "/assets/enemies/portraits/mountain-troll.webp",
    "maxHp": 121,
    "physicalPower": 10,
    "spellPower": 0,
    "armor": 4,
    "magicResistance": 1,
    "hitChance": 0.8,
    "dodgeChance": 0,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "gear-ms0hfvkg-yni9w",
        "chance": 10
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 10
      },
      {
        "itemId": "consumable-ms2v69ag-xp79t",
        "chance": 5
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 20
      },
      {
        "itemId": "consumable-ms0ifcle-isww5",
        "chance": 50
      },
      {
        "itemId": "gear-ms30095w-ci3mw",
        "chance": 5
      },
      {
        "itemId": "gear-trollforged-breastplate",
        "chance": 5
      },
      {
        "itemId": "gear-trollforged-legguards",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2w38yw-vp9bu",
        "name": "Heavy Fists",
        "description": "Strikes four times for 80% Physical Power as Physical damage per hit.",
        "energyCost": 5,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.8,
        "hits": 4,
        "vfx": "enemy_bite_claw"
      },
      {
        "id": "enemy-ability-ms2w4zyb-7c0ge",
        "name": "Roar",
        "description": "Gains Fierce.",
        "energyCost": 2,
        "cooldownTurns": 2,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "fierce"
          }
        ],
        "vfx": "enemy_roar"
      },
      {
        "id": "enemy-ability-ms2w7zva-lxkg8",
        "name": "Nap",
        "description": "Restores 15% maximum Health, gains Sleep, and recovers 10 extra Energy next turn.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "melee",
        "selfHealMaxHpRatio": 0.15,
        "selfStatusApplications": [
          {
            "status": "sleep",
            "duration": 2
          }
        ],
        "nextTurnEnergyRegen": 10,
        "vfx": "enemy_hibernate"
      }
    ],
    "behaviorNotes": "Uses Heavy Fists and Roar when available, falling back to Nap when no other ability can be used.",
    "behavior": "mountain_troll",
    "maxActionsPerTurn": 1,
    "accent": "#5f6657"
  },
  "enemy-ms2w93yt-v817a": {
    "id": "enemy-ms2w93yt-v817a",
    "name": "Hill Troll Shaman",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/hill-troll-shaman.webp",
    "portraitUrl": "/assets/enemies/portraits/hill-troll-shaman.webp",
    "maxHp": 79,
    "physicalPower": 6,
    "spellPower": 10,
    "armor": 1,
    "magicResistance": 4,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "gear-ms1id4sv-l0ihy",
        "chance": 5
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 10
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 10
      },
      {
        "itemId": "consumable-ms2v69ag-xp79t",
        "chance": 10
      },
      {
        "itemId": "gear-ms30095w-ci3mw",
        "chance": 4
      },
      {
        "itemId": "gear-ms307fr5-vebz0",
        "chance": 8
      },
      {
        "itemId": "gear-runewoven-cowl",
        "chance": 5
      },
      {
        "itemId": "gear-runewoven-boots",
        "chance": 5
      },
      {
        "itemId": "item-highfall-frostroot",
        "chance": 30
      },
      {
        "itemId": "consumable-stonebloom-draught",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2wayvo-rnti2",
        "name": "Heal",
        "description": "Restores Health to the most wounded friendly target equal to 200% of Spell Power.",
        "energyCost": 2,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "target",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 2,
        "vfx": "enemy_woundfixer_heal"
      },
      {
        "id": "enemy-ability-ms2wbr2c-66kcn",
        "name": "Regeneration",
        "description": "Grants Regenerate to the most wounded other enemy.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "friendlyTarget": "lowest_health_other",
        "friendlyStatusApplications": [
          {
            "status": "regenerate"
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-ms2wcm61-4wsw3",
        "name": "Greater Hex",
        "description": "Deals 150% Spell Power as Spell damage and applies Weaken and Slowed.",
        "energyCost": 1,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.5,
        "statusApplications": [
          {
            "status": "weaken"
          },
          {
            "status": "slowed"
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-ms2we50g-kzi7f",
        "name": "Nap",
        "description": "Restores 15% maximum Health and gains Sleep.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "melee",
        "selfHealMaxHpRatio": 0.15,
        "selfStatusApplications": [
          {
            "status": "sleep",
            "duration": 2
          }
        ],
        "vfx": "enemy_hibernate"
      }
    ],
    "behaviorNotes": "Prioritizes healing wounded allies, then Regeneration and Greater Hex. Uses Nap when no other ability is available.",
    "behavior": "troll_shaman",
    "maxActionsPerTurn": 1,
    "accent": "#75658b"
  },
  "enemy-ms2wk1ul-6ol9b": {
    "id": "enemy-ms2wk1ul-6ol9b",
    "name": "Highfall Bandit Enforcer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/highfall-bandit-enforcer.webp",
    "portraitUrl": "/assets/enemies/portraits/highfall-bandit-enforcer.webp",
    "maxHp": 54,
    "physicalPower": 8,
    "spellPower": 0,
    "armor": 4,
    "magicResistance": 1,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 5,
    "dropTable": [
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 10
      },
      {
        "itemId": "item-ms0ss0dt-z4bke",
        "chance": 10
      },
      {
        "itemId": "gear-ms3054kn-cs3uu",
        "chance": 6
      },
      {
        "itemId": "gear-nightveil-cowl",
        "chance": 5
      },
      {
        "itemId": "gear-nightveil-jerkin",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2wloah-2gx3k",
        "name": "Steal",
        "description": "Deals 100% Physical Power as Physical damage and steals up to 10 Gold.",
        "energyCost": 1,
        "cooldownTurns": 2,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "stealGold": 10,
        "vfx": "enemy_shiv"
      },
      {
        "id": "enemy-ability-ms2wmdjd-22til",
        "name": "Stealth",
        "description": "Gains Stealth until the end of the next turn and restores 10 Energy.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth"
          }
        ],
        "selfEnergyGain": 10,
        "vfx": "enemy_quickstabber_stealth"
      },
      {
        "id": "enemy-ability-ms2wng0f-y2n2z",
        "name": "Poisoned Stab",
        "description": "Deals 50% Physical Power as Physical damage and applies 3 Poison.",
        "energyCost": 6,
        "cooldownTurns": 2,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.5,
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 3
          }
        ],
        "vfx": "enemy_rabid_bite"
      }
    ],
    "behaviorNotes": "Uses Steal whenever it is ready, enters Stealth, then follows with Poisoned Stab.",
    "behavior": "bandit_enforcer",
    "maxActionsPerTurn": 2,
    "accent": "#6e5b50"
  },
  "enemy-ms2wqzxv-srsgs": {
    "id": "enemy-ms2wqzxv-srsgs",
    "name": "Highfall Loot Goblin",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/highfall-loot-goblin.webp",
    "portraitUrl": "/assets/enemies/portraits/highfall-loot-goblin.webp",
    "maxHp": 40,
    "physicalPower": 0,
    "spellPower": 0,
    "armor": 0,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0.1,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 5,
    "dropTable": [
      {
        "itemId": "gear-ms1i1671-yxsnp",
        "chance": 20
      },
      {
        "itemId": "gear-ms1i5k37-1rg9d",
        "chance": 20
      },
      {
        "itemId": "gear-ms1i77n7-j9o2s",
        "chance": 20
      },
      {
        "itemId": "gear-ms1iadb1-2snx8",
        "chance": 20
      },
      {
        "itemId": "gear-ms1iccqm-4yu0n",
        "chance": 20
      },
      {
        "itemId": "gear-ms1id4sv-l0ihy",
        "chance": 10
      },
      {
        "itemId": "gear-ms27p0je-if2hq",
        "chance": 20
      },
      {
        "itemId": "gear-ms27lxuu-3o5xy",
        "chance": 20
      },
      {
        "itemId": "gear-ms27upmg-hxmuw",
        "chance": 20
      },
      {
        "itemId": "gear-ms307fr5-vebz0",
        "chance": 10
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2wsv8u-j9a24",
        "name": "Flee",
        "description": "Escapes combat with all of its loot.",
        "energyCost": 10,
        "cooldownTurns": 0,
        "range": "melee",
        "fleeCombat": true,
        "vfx": "enemy_flee"
      }
    ],
    "behaviorNotes": "Gathers Energy until it can flee. A successful escape removes all of its loot from the reward.",
    "behavior": "loot_goblin",
    "maxActionsPerTurn": 1,
    "accent": "#8c7944"
  },
  "enemy-ms2wuk5j-1ddqa": {
    "id": "enemy-ms2wuk5j-1ddqa",
    "name": "Highfall Bandit Trapper",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/highfall-bandit-trapper.webp",
    "portraitUrl": "/assets/enemies/portraits/highfall-bandit-trapper.webp",
    "maxHp": 46,
    "physicalPower": 10,
    "spellPower": 0,
    "armor": 2,
    "magicResistance": 1,
    "hitChance": 0.95,
    "dodgeChance": 0.05,
    "critChance": 0.05,
    "energyRegen": 1,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-ms0jd8ky-lu2zb",
        "chance": 10
      },
      {
        "itemId": "item-ms1if1q6-746wi",
        "chance": 10
      },
      {
        "itemId": "gear-ms3054kn-cs3uu",
        "chance": 5
      },
      {
        "itemId": "gear-nightveil-legwraps",
        "chance": 5
      },
      {
        "itemId": "gear-nightveil-treads",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2wwtu0-ustxf",
        "name": "Bow Shot",
        "description": "Deals 80% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "physical",
        "physicalPowerScaling": 0.8,
        "vfx": "enemy_bow_shot"
      },
      {
        "id": "enemy-ability-ms2wxm3t-nrfbj",
        "name": "Fire Trap",
        "description": "Applies 1 Burn.",
        "energyCost": 2,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1
          }
        ],
        "vfx": "enemy_burning_glare"
      },
      {
        "id": "enemy-ability-ms2wyie9-iisii",
        "name": "Snipe",
        "description": "Deals 200% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 6,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "physical",
        "physicalPowerScaling": 2,
        "vfx": "enemy_snipe"
      }
    ],
    "behaviorNotes": "Uses Fire Trap whenever it is ready, then Snipe, with Bow Shot as its fallback.",
    "behavior": "bandit_trapper",
    "maxActionsPerTurn": 1,
    "accent": "#596873"
  },
  "enemy-ms2xaper-z7o3g": {
    "id": "enemy-ms2xaper-z7o3g",
    "name": "Troll Bandit King, Klaus",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/troll-bandit-king-klaus.webp",
    "portraitUrl": "/assets/enemies/portraits/troll-bandit-king-klaus.webp",
    "maxHp": 198,
    "physicalPower": 15,
    "spellPower": 0,
    "armor": 0,
    "magicResistance": 0,
    "hitChance": 0.95,
    "dodgeChance": 0,
    "critChance": 0.05,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 0,
    "dropTable": [
      {
        "itemId": "gear-ms30095w-ci3mw",
        "chance": 7
      },
      {
        "itemId": "gear-ms3054kn-cs3uu",
        "chance": 7
      },
      {
        "itemId": "gear-runewoven-robes",
        "chance": 5
      },
      {
        "itemId": "gear-runewoven-leggings",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-ms2xd4iz-c5j5z",
        "name": "Patience",
        "description": "Gains 10 Guard while waiting.",
        "energyCost": 0,
        "cooldownTurns": 1,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 10
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-ms2xe0t2-q41xk",
        "name": "No Patience",
        "description": "Deals 150% Physical Power as Physical damage.",
        "energyCost": 10,
        "cooldownTurns": 5,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.5,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-ms2xgcxa-lier7",
        "name": "Toying",
        "description": "Deals 50% Physical Power as Physical damage and has a 20% chance to apply Vulnerable.",
        "energyCost": 1,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.5,
        "statusApplications": [
          {
            "status": "vulnerable",
            "chance": 0.2
          }
        ],
        "vfx": "enemy_spear_poke"
      }
    ],
    "behaviorNotes": "Uses Patience until reaching 10 Energy, then No Patience once before using Toying every turn.",
    "behavior": "troll_bandit_king",
    "maxActionsPerTurn": 1,
    "accent": "#8a4d3f"
  },
  "enemy-a4-reed-stalker": {
    "id": "enemy-a4-reed-stalker",
    "name": "Reed Stalker",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-reed-stalker.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-reed-stalker.webp",
    "maxHp": 83,
    "physicalPower": 14,
    "spellPower": 0,
    "armor": 1,
    "magicResistance": 2,
    "hitChance": 0.935,
    "dodgeChance": 0.045,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-fenwarden-head",
        "chance": 5
      },
      {
        "itemId": "gear-a4-fenwarden-chest",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-reed-stalker-strike",
        "name": "Savage Strike",
        "description": "Deals 100% Physical Power as Physical damage and applies Poison.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-reed-stalker-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-bog-leech": {
    "id": "enemy-a4-bog-leech",
    "name": "Bog Leech",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-bog-leech.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-bog-leech.webp",
    "maxHp": 92,
    "physicalPower": 15,
    "spellPower": 0,
    "armor": 2,
    "magicResistance": 3,
    "hitChance": 0.935,
    "dodgeChance": 0.07500000000000001,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-fenwarden-pants",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-bog-leech-strike",
        "name": "Savage Strike",
        "description": "Deals 100% Physical Power as Physical damage and applies Bleed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-bog-leech-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-mirefen-spitter": {
    "id": "enemy-a4-mirefen-spitter",
    "name": "Mirefen Spitter",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-mirefen-spitter.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-mirefen-spitter.webp",
    "maxHp": 101,
    "physicalPower": 7,
    "spellPower": 16,
    "armor": 3,
    "magicResistance": 1,
    "hitChance": 0.935,
    "dodgeChance": 0.10500000000000001,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-fenwarden-ring",
        "chance": 5
      },
      {
        "itemId": "gear-a4-mirestalker-head",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-mirefen-spitter-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 100% Spell Power as Spell damage and applies Poison.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1,
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a4-mirefen-spitter-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-drowned-warden": {
    "id": "enemy-a4-drowned-warden",
    "name": "Drowned Warden",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-drowned-warden.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-drowned-warden.webp",
    "maxHp": 110,
    "physicalPower": 17,
    "spellPower": 0,
    "armor": 1,
    "magicResistance": 2,
    "hitChance": 0.935,
    "dodgeChance": 0.045,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-mirestalker-chest",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-drowned-warden-strike",
        "name": "Savage Strike",
        "description": "Deals 100% Physical Power as Physical damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "statusApplications": [
          {
            "status": "wet",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-drowned-warden-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-fen-witch": {
    "id": "enemy-a4-fen-witch",
    "name": "Fen Witch",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-fen-witch.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-fen-witch.webp",
    "maxHp": 119,
    "physicalPower": 8,
    "spellPower": 18,
    "armor": 2,
    "magicResistance": 3,
    "hitChance": 0.935,
    "dodgeChance": 0.07500000000000001,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-mirestalker-boots",
        "chance": 5
      },
      {
        "itemId": "gear-a4-mirestalker-ring",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-fen-witch-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 100% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1,
        "statusApplications": [
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a4-fen-witch-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-brood-guard": {
    "id": "enemy-a4-brood-guard",
    "name": "Brood Guard",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a4-brood-guard.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-brood-guard.webp",
    "maxHp": 128,
    "physicalPower": 19,
    "spellPower": 0,
    "armor": 3,
    "magicResistance": 1,
    "hitChance": 0.935,
    "dodgeChance": 0.10500000000000001,
    "critChance": 0.065,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 30
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 18
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 25
      },
      {
        "itemId": "gear-a4-fenwarden-head",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-brood-guard-strike",
        "name": "Savage Strike",
        "description": "Deals 100% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-brood-guard-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 16,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58"
  },
  "enemy-a4-vespara-broodmother": {
    "id": "enemy-a4-vespara-broodmother",
    "name": "Vespara, Broodmother",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a4-vespara-broodmother.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-vespara-broodmother.webp",
    "maxHp": 196,
    "physicalPower": 20,
    "spellPower": 20,
    "armor": 1,
    "magicResistance": 2,
    "hitChance": 0.935,
    "dodgeChance": 0.045,
    "critChance": 0.065,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a4-bog-iron",
        "chance": 100
      },
      {
        "itemId": "item-a4-venom-sac",
        "chance": 80
      },
      {
        "itemId": "item-a4-mire-reed",
        "chance": 70
      },
      {
        "itemId": "gear-a4-fenwarden-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a4-fenwarden-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a4-bogcleaver",
        "chance": 12
      },
      {
        "itemId": "gear-a4-witchlight-wand",
        "chance": 12
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a4-vespara-broodmother-setup",
        "name": "Brood Call",
        "description": "Applies Poison and Wet.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "poison",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "wet",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a4-vespara-broodmother-execution",
        "name": "Venom Deluge",
        "description": "Charges for one turn, then deals 260% Physical Power as Physical damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Vespara, Broodmother begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale"
      },
      {
        "id": "enemy-ability-a4-vespara-broodmother-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 18,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#5f8a58"
  },
  "enemy-a5-ash-hound": {
    "id": "enemy-a5-ash-hound",
    "name": "Ash Hound",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-ash-hound.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-ash-hound.webp",
    "maxHp": 111,
    "physicalPower": 19,
    "spellPower": 0,
    "armor": 2,
    "magicResistance": 3,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.05,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-emberforged-head",
        "chance": 5
      },
      {
        "itemId": "gear-a5-emberforged-chest",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-ash-hound-strike",
        "name": "Savage Strike",
        "description": "Deals 108% Physical Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "fire",
        "physicalPowerScaling": 1.08,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a5-ash-hound-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-cinder-smith": {
    "id": "enemy-a5-cinder-smith",
    "name": "Cinder Smith",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-cinder-smith.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-cinder-smith.webp",
    "maxHp": 120,
    "physicalPower": 20,
    "spellPower": 0,
    "armor": 3,
    "magicResistance": 4,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.08,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-emberforged-pants",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-cinder-smith-strike",
        "name": "Savage Strike",
        "description": "Deals 108% Physical Power as Fire damage and applies Charred.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "fire",
        "physicalPowerScaling": 1.08,
        "statusApplications": [
          {
            "status": "charred",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a5-cinder-smith-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-slag-elemental": {
    "id": "enemy-a5-slag-elemental",
    "name": "Slag Elemental",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-slag-elemental.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-slag-elemental.webp",
    "maxHp": 129,
    "physicalPower": 9,
    "spellPower": 21,
    "armor": 4,
    "magicResistance": 2,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.11,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-emberforged-ring",
        "chance": 5
      },
      {
        "itemId": "gear-a5-cinderweave-head",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-slag-elemental-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 108% Spell Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.08,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a5-slag-elemental-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-furnace-acolyte": {
    "id": "enemy-a5-furnace-acolyte",
    "name": "Furnace Acolyte",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-furnace-acolyte.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-furnace-acolyte.webp",
    "maxHp": 138,
    "physicalPower": 9,
    "spellPower": 22,
    "armor": 2,
    "magicResistance": 3,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.05,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-cinderweave-chest",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-furnace-acolyte-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 108% Spell Power as Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.08,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a5-furnace-acolyte-stance",
        "name": "Dark Insight",
        "description": "Gains Enlightened.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-ironbound-overseer": {
    "id": "enemy-a5-ironbound-overseer",
    "name": "Ironbound Overseer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-ironbound-overseer.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-ironbound-overseer.webp",
    "maxHp": 147,
    "physicalPower": 23,
    "spellPower": 0,
    "armor": 3,
    "magicResistance": 4,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.08,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-cinderweave-boots",
        "chance": 5
      },
      {
        "itemId": "gear-a5-cinderweave-ring",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-ironbound-overseer-strike",
        "name": "Savage Strike",
        "description": "Deals 108% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.08,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a5-ironbound-overseer-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 18,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-spark-swarm": {
    "id": "enemy-a5-spark-swarm",
    "name": "Spark Swarm",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a5-spark-swarm.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-spark-swarm.webp",
    "maxHp": 156,
    "physicalPower": 10,
    "spellPower": 24,
    "armor": 4,
    "magicResistance": 2,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.11,
    "critChance": 0.08,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 30
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 18
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 25
      },
      {
        "itemId": "gear-a5-emberforged-head",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-spark-swarm-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 108% Spell Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.08,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a5-spark-swarm-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835"
  },
  "enemy-a5-furnace-tyrant": {
    "id": "enemy-a5-furnace-tyrant",
    "name": "The Furnace Tyrant",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a5-furnace-tyrant.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-furnace-tyrant.webp",
    "maxHp": 274,
    "physicalPower": 25,
    "spellPower": 25,
    "armor": 2,
    "magicResistance": 3,
    "hitChance": 0.9500000000000001,
    "dodgeChance": 0.05,
    "critChance": 0.08,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a5-cindersteel",
        "chance": 100
      },
      {
        "itemId": "item-a5-ember-fragment",
        "chance": 80
      },
      {
        "itemId": "item-a5-sootweave",
        "chance": 70
      },
      {
        "itemId": "gear-a5-emberforged-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a5-emberforged-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a5-foundry-maul",
        "chance": 12
      },
      {
        "itemId": "gear-a5-cinderbrand",
        "chance": 12
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a5-furnace-tyrant-setup",
        "name": "Stoke the Furnace",
        "description": "Applies Burn and Charred.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "charred",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_burning_glare"
      },
      {
        "id": "enemy-ability-a5-furnace-tyrant-execution",
        "name": "Core Meltdown",
        "description": "Charges for one turn, then deals 260% Spell Power as Fire damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "The Furnace Tyrant begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "firestorm"
      },
      {
        "id": "enemy-ability-a5-furnace-tyrant-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 20,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#a75835"
  },
  "enemy-a6-brine-crawler": {
    "id": "enemy-a6-brine-crawler",
    "name": "Brine Crawler",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-brine-crawler.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-brine-crawler.webp",
    "maxHp": 139,
    "physicalPower": 24,
    "spellPower": 0,
    "armor": 3,
    "magicResistance": 4,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.055,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-depthguard-head",
        "chance": 5
      },
      {
        "itemId": "gear-a6-depthguard-chest",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-brine-crawler-strike",
        "name": "Savage Strike",
        "description": "Deals 116% Physical Power as Physical damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.16,
        "statusApplications": [
          {
            "status": "wet",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a6-brine-crawler-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-drowned-acolyte": {
    "id": "enemy-a6-drowned-acolyte",
    "name": "Drowned Acolyte",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-drowned-acolyte.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-drowned-acolyte.webp",
    "maxHp": 148,
    "physicalPower": 11,
    "spellPower": 25,
    "armor": 4,
    "magicResistance": 5,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.085,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-depthguard-pants",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-drowned-acolyte-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 116% Spell Power as Spell damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.16,
        "statusApplications": [
          {
            "status": "wet",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a6-drowned-acolyte-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-relic-sentinel": {
    "id": "enemy-a6-relic-sentinel",
    "name": "Relic Sentinel",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-relic-sentinel.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-relic-sentinel.webp",
    "maxHp": 157,
    "physicalPower": 26,
    "spellPower": 26,
    "armor": 5,
    "magicResistance": 3,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.115,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-depthguard-ring",
        "chance": 5
      },
      {
        "itemId": "gear-a6-tidecaller-head",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-relic-sentinel-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 116% Spell Power as Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.16,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a6-relic-sentinel-stance",
        "name": "Hold the Line",
        "description": "Gains Barrier.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "barrier",
            "stacks": 20,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-shock-eel": {
    "id": "enemy-a6-shock-eel",
    "name": "Vault Shock Eel",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-shock-eel.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-shock-eel.webp",
    "maxHp": 166,
    "physicalPower": 12,
    "spellPower": 27,
    "armor": 3,
    "magicResistance": 4,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.055,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-tidecaller-chest",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-shock-eel-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 116% Spell Power as Lightning damage and applies Electrified.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.16,
        "statusApplications": [
          {
            "status": "electrified",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "lightning_strike"
      },
      {
        "id": "enemy-ability-a6-shock-eel-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-tidebound-knight": {
    "id": "enemy-a6-tidebound-knight",
    "name": "Tidebound Knight",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-tidebound-knight.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-tidebound-knight.webp",
    "maxHp": 175,
    "physicalPower": 28,
    "spellPower": 0,
    "armor": 4,
    "magicResistance": 5,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.085,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-tidecaller-boots",
        "chance": 5
      },
      {
        "itemId": "gear-a6-tidecaller-ring",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-tidebound-knight-strike",
        "name": "Savage Strike",
        "description": "Deals 116% Physical Power as Physical damage and applies Shatter.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.16,
        "statusApplications": [
          {
            "status": "shatter",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a6-tidebound-knight-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-siren-oracle": {
    "id": "enemy-a6-siren-oracle",
    "name": "Siren Oracle",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a6-siren-oracle.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-siren-oracle.webp",
    "maxHp": 184,
    "physicalPower": 13,
    "spellPower": 29,
    "armor": 5,
    "magicResistance": 3,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.115,
    "critChance": 0.095,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 30
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 18
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 25
      },
      {
        "itemId": "gear-a6-depthguard-head",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-siren-oracle-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 116% Spell Power as Spell damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.16,
        "statusApplications": [
          {
            "status": "wet",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a6-siren-oracle-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91"
  },
  "enemy-a6-nhalos-drowned-seer": {
    "id": "enemy-a6-nhalos-drowned-seer",
    "name": "Nhalos, the Drowned Seer",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a6-nhalos-drowned-seer.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-nhalos-drowned-seer.webp",
    "maxHp": 404,
    "physicalPower": 30,
    "spellPower": 30,
    "armor": 3,
    "magicResistance": 4,
    "hitChance": 0.9650000000000001,
    "dodgeChance": 0.055,
    "critChance": 0.095,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a6-abyssal-pearl",
        "chance": 100
      },
      {
        "itemId": "item-a6-relic-shard",
        "chance": 80
      },
      {
        "itemId": "item-a6-tideglass",
        "chance": 70
      },
      {
        "itemId": "gear-a6-depthguard-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a6-depthguard-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a6-tidebreaker",
        "chance": 12
      },
      {
        "itemId": "gear-a6-oracle-tome",
        "chance": 12
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a6-nhalos-drowned-seer-setup",
        "name": "Drown the Future",
        "description": "Applies Wet and Electrified.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "wet",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "electrified",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a6-nhalos-drowned-seer-execution",
        "name": "Foretold Tempest",
        "description": "Charges for one turn, then deals 260% Spell Power as Lightning damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Nhalos, the Drowned Seer begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "thunderstorm"
      },
      {
        "id": "enemy-ability-a6-nhalos-drowned-seer-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 22,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#397f91"
  },
  "enemy-a7-mirror-stalker": {
    "id": "enemy-a7-mirror-stalker",
    "name": "Mirror Stalker",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-mirror-stalker.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-mirror-stalker.webp",
    "maxHp": 167,
    "physicalPower": 29,
    "spellPower": 0,
    "armor": 4,
    "magicResistance": 5,
    "hitChance": 0.98,
    "dodgeChance": 0.06,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-nightglass-head",
        "chance": 5
      },
      {
        "itemId": "gear-a7-nightglass-chest",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-mirror-stalker-strike",
        "name": "Savage Strike",
        "description": "Deals 124% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-mirror-stalker-stance",
        "name": "Vanish",
        "description": "Gains Stealth.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-gloom-archer": {
    "id": "enemy-a7-gloom-archer",
    "name": "Gloom Archer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-gloom-archer.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-gloom-archer.webp",
    "maxHp": 176,
    "physicalPower": 30,
    "spellPower": 0,
    "armor": 5,
    "magicResistance": 6,
    "hitChance": 0.98,
    "dodgeChance": 0.09000000000000001,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-nightglass-pants",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-gloom-archer-strike",
        "name": "Savage Strike",
        "description": "Deals 124% Physical Power as Physical damage and applies Blind.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "statusApplications": [
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-gloom-archer-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-bloodbound-knight": {
    "id": "enemy-a7-bloodbound-knight",
    "name": "Bloodbound Knight",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-bloodbound-knight.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-bloodbound-knight.webp",
    "maxHp": 185,
    "physicalPower": 31,
    "spellPower": 0,
    "armor": 6,
    "magicResistance": 4,
    "hitChance": 0.98,
    "dodgeChance": 0.12000000000000001,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-nightglass-ring",
        "chance": 5
      },
      {
        "itemId": "gear-a7-bloodbound-head",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-bloodbound-knight-strike",
        "name": "Savage Strike",
        "description": "Deals 124% Physical Power as Physical damage and applies Bleed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-bloodbound-knight-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-shard-magus": {
    "id": "enemy-a7-shard-magus",
    "name": "Shard Magus",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-shard-magus.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-shard-magus.webp",
    "maxHp": 194,
    "physicalPower": 14,
    "spellPower": 32,
    "armor": 4,
    "magicResistance": 5,
    "hitChance": 0.98,
    "dodgeChance": 0.06,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-bloodbound-chest",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-shard-magus-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 124% Spell Power as Spell damage and applies Shatter.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.24,
        "statusApplications": [
          {
            "status": "shatter",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a7-shard-magus-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-veil-dancer": {
    "id": "enemy-a7-veil-dancer",
    "name": "Veil Dancer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-veil-dancer.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-veil-dancer.webp",
    "maxHp": 203,
    "physicalPower": 33,
    "spellPower": 0,
    "armor": 5,
    "magicResistance": 6,
    "hitChance": 0.98,
    "dodgeChance": 0.09000000000000001,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-bloodbound-boots",
        "chance": 5
      },
      {
        "itemId": "gear-a7-bloodbound-ring",
        "chance": 4
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-veil-dancer-strike",
        "name": "Savage Strike",
        "description": "Deals 124% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-veil-dancer-stance",
        "name": "Gale Step",
        "description": "Gains Evasion.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "evasion",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "evasion"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-reflection-wraith": {
    "id": "enemy-a7-reflection-wraith",
    "name": "Reflection Wraith",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a7-reflection-wraith.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-reflection-wraith.webp",
    "maxHp": 212,
    "physicalPower": 15,
    "spellPower": 34,
    "armor": 6,
    "magicResistance": 4,
    "hitChance": 0.98,
    "dodgeChance": 0.12000000000000001,
    "critChance": 0.11,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 30
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 18
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 25
      },
      {
        "itemId": "gear-a7-nightglass-head",
        "chance": 5
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-reflection-wraith-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 124% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.24,
        "statusApplications": [
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a7-reflection-wraith-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c"
  },
  "enemy-a7-lady-noctra": {
    "id": "enemy-a7-lady-noctra",
    "name": "Lady Noctra, the Last Reflection",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a7-lady-noctra.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-lady-noctra.webp",
    "maxHp": 586,
    "physicalPower": 35,
    "spellPower": 35,
    "armor": 4,
    "magicResistance": 5,
    "hitChance": 0.98,
    "dodgeChance": 0.06,
    "critChance": 0.11,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a7-nightglass",
        "chance": 100
      },
      {
        "itemId": "item-a7-umbral-silk",
        "chance": 80
      },
      {
        "itemId": "item-a7-bloodstone",
        "chance": 70
      },
      {
        "itemId": "gear-a7-nightglass-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a7-nightglass-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a7-mirrorfang",
        "chance": 12
      },
      {
        "itemId": "gear-a7-eclipse-staff",
        "chance": 12
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a7-lady-noctra-setup",
        "name": "Hall of Mirrors",
        "description": "Applies Stealth and Blind.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a7-lady-noctra-execution",
        "name": "Shatter the Self",
        "description": "Charges for one turn, then deals 260% Physical Power as Physical damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Lady Noctra, the Last Reflection begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale"
      },
      {
        "id": "enemy-ability-a7-lady-noctra-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 24,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#65518c"
  },
  "enemy-a8-rime-wolf": {
    "id": "enemy-a8-rime-wolf",
    "name": "Rime Wolf",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-rime-wolf.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-rime-wolf.webp",
    "maxHp": 195,
    "physicalPower": 34,
    "spellPower": 0,
    "armor": 6,
    "magicResistance": 6,
    "hitChance": 0.995,
    "dodgeChance": 0.065,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-rimeguard-head",
        "chance": 3
      },
      {
        "itemId": "gear-a8-rimeguard-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-rime-wolf-strike",
        "name": "Savage Strike",
        "description": "Deals 132% Physical Power as Frost damage and applies Cold.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "frost",
        "physicalPowerScaling": 1.32,
        "statusApplications": [
          {
            "status": "cold",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-rime-wolf-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-icebound-raider": {
    "id": "enemy-a8-icebound-raider",
    "name": "Icebound Raider",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-icebound-raider.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-icebound-raider.webp",
    "maxHp": 204,
    "physicalPower": 35,
    "spellPower": 0,
    "armor": 7,
    "magicResistance": 7,
    "hitChance": 0.995,
    "dodgeChance": 0.095,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-rimeguard-pants",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-icebound-raider-strike",
        "name": "Savage Strike",
        "description": "Deals 132% Physical Power as Physical damage and applies Shatter.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "statusApplications": [
          {
            "status": "shatter",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-icebound-raider-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-aurora-wisp": {
    "id": "enemy-a8-aurora-wisp",
    "name": "Aurora Wisp",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-aurora-wisp.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-aurora-wisp.webp",
    "maxHp": 213,
    "physicalPower": 16,
    "spellPower": 36,
    "armor": 8,
    "magicResistance": 5,
    "hitChance": 0.995,
    "dodgeChance": 0.125,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-rimeguard-ring",
        "chance": 3
      },
      {
        "itemId": "gear-a8-winterweave-head",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-aurora-wisp-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 132% Spell Power as Frost damage and applies Cold.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 1.32,
        "statusApplications": [
          {
            "status": "cold",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "frostbolt"
      },
      {
        "id": "enemy-ability-a8-aurora-wisp-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-frost-hermit": {
    "id": "enemy-a8-frost-hermit",
    "name": "Frost Hermit",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-frost-hermit.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-frost-hermit.webp",
    "maxHp": 222,
    "physicalPower": 16,
    "spellPower": 37,
    "armor": 6,
    "magicResistance": 6,
    "hitChance": 0.995,
    "dodgeChance": 0.065,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-winterweave-chest",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-frost-hermit-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 132% Spell Power as Frost damage and applies Frozen.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 1.32,
        "statusApplications": [
          {
            "status": "frozen",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "frostbolt"
      },
      {
        "id": "enemy-ability-a8-frost-hermit-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-glacier-golem": {
    "id": "enemy-a8-glacier-golem",
    "name": "Glacier Golem",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-glacier-golem.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-glacier-golem.webp",
    "maxHp": 231,
    "physicalPower": 38,
    "spellPower": 0,
    "armor": 7,
    "magicResistance": 7,
    "hitChance": 0.995,
    "dodgeChance": 0.095,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-winterweave-boots",
        "chance": 3
      },
      {
        "itemId": "gear-a8-winterweave-ring",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-glacier-golem-strike",
        "name": "Savage Strike",
        "description": "Deals 132% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-glacier-golem-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 24,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-snowblind-harrier": {
    "id": "enemy-a8-snowblind-harrier",
    "name": "Snowblind Harrier",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a8-snowblind-harrier.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-snowblind-harrier.webp",
    "maxHp": 240,
    "physicalPower": 39,
    "spellPower": 0,
    "armor": 8,
    "magicResistance": 5,
    "hitChance": 0.995,
    "dodgeChance": 0.125,
    "critChance": 0.125,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 30
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 18
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 25
      },
      {
        "itemId": "gear-a8-rimeguard-head",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-snowblind-harrier-strike",
        "name": "Savage Strike",
        "description": "Deals 132% Physical Power as Physical damage and applies Blind.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "statusApplications": [
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-snowblind-harrier-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8"
  },
  "enemy-a8-skara-white-maw": {
    "id": "enemy-a8-skara-white-maw",
    "name": "Skara, the White Maw",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a8-skara-white-maw.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-skara-white-maw.webp",
    "maxHp": 820,
    "physicalPower": 40,
    "spellPower": 40,
    "armor": 6,
    "magicResistance": 6,
    "hitChance": 0.995,
    "dodgeChance": 0.065,
    "critChance": 0.125,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a8-rimebone",
        "chance": 100
      },
      {
        "itemId": "item-a8-frostheart",
        "chance": 80
      },
      {
        "itemId": "item-a8-white-pelt",
        "chance": 70
      },
      {
        "itemId": "gear-a8-rimeguard-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a8-rimeguard-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a8-white-maw-axe",
        "chance": 8
      },
      {
        "itemId": "gear-a8-aurora-wand",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a8-skara-white-maw-setup",
        "name": "Absolute Winter",
        "description": "Applies Cold and Frozen.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "cold",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "frozen",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "deep_freeze"
      },
      {
        "id": "enemy-ability-a8-skara-white-maw-execution",
        "name": "Whiteout Devour",
        "description": "Charges for one turn, then deals 260% Spell Power as Frost damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Skara, the White Maw begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "absolute_zero"
      },
      {
        "id": "enemy-ability-a8-skara-white-maw-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 26,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#71a8c8"
  },
  "enemy-a9-thunder-talon": {
    "id": "enemy-a9-thunder-talon",
    "name": "Thunder Talon",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-thunder-talon.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-thunder-talon.webp",
    "maxHp": 223,
    "physicalPower": 39,
    "spellPower": 0,
    "armor": 7,
    "magicResistance": 7,
    "hitChance": 1.01,
    "dodgeChance": 0.07,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-stormrunner-head",
        "chance": 3
      },
      {
        "itemId": "gear-a9-stormrunner-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-thunder-talon-strike",
        "name": "Savage Strike",
        "description": "Deals 140% Physical Power as Lightning damage and applies Electrified.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "lightning",
        "physicalPowerScaling": 1.4,
        "statusApplications": [
          {
            "status": "electrified",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a9-thunder-talon-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-spire-zealot": {
    "id": "enemy-a9-spire-zealot",
    "name": "Spire Zealot",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-spire-zealot.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-spire-zealot.webp",
    "maxHp": 232,
    "physicalPower": 40,
    "spellPower": 0,
    "armor": 8,
    "magicResistance": 8,
    "hitChance": 1.01,
    "dodgeChance": 0.1,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-stormrunner-pants",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-spire-zealot-strike",
        "name": "Savage Strike",
        "description": "Deals 140% Physical Power as Lightning damage and applies Electrified.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "lightning",
        "physicalPowerScaling": 1.4,
        "statusApplications": [
          {
            "status": "electrified",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a9-spire-zealot-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-storm-channeler": {
    "id": "enemy-a9-storm-channeler",
    "name": "Storm Channeler",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-storm-channeler.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-storm-channeler.webp",
    "maxHp": 241,
    "physicalPower": 18,
    "spellPower": 41,
    "armor": 9,
    "magicResistance": 6,
    "hitChance": 1.01,
    "dodgeChance": 0.13,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-stormrunner-ring",
        "chance": 3
      },
      {
        "itemId": "gear-a9-tempest-sage-head",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-storm-channeler-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 140% Spell Power as Lightning damage and applies Electrified.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.4,
        "statusApplications": [
          {
            "status": "electrified",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "lightning_strike"
      },
      {
        "id": "enemy-ability-a9-storm-channeler-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-cloud-djinn": {
    "id": "enemy-a9-cloud-djinn",
    "name": "Cloud Djinn",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-cloud-djinn.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-cloud-djinn.webp",
    "maxHp": 250,
    "physicalPower": 18,
    "spellPower": 42,
    "armor": 7,
    "magicResistance": 7,
    "hitChance": 1.01,
    "dodgeChance": 0.07,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-tempest-sage-chest",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-cloud-djinn-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 140% Spell Power as Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.4,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a9-cloud-djinn-stance",
        "name": "Gale Step",
        "description": "Gains Evasion.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "evasion",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "evasion"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-thunderhead-colossus": {
    "id": "enemy-a9-thunderhead-colossus",
    "name": "Thunderhead Colossus",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-thunderhead-colossus.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-thunderhead-colossus.webp",
    "maxHp": 259,
    "physicalPower": 43,
    "spellPower": 43,
    "armor": 8,
    "magicResistance": 8,
    "hitChance": 1.01,
    "dodgeChance": 0.1,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-tempest-sage-boots",
        "chance": 3
      },
      {
        "itemId": "gear-a9-tempest-sage-ring",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-thunderhead-colossus-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 140% Spell Power as Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.4,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a9-thunderhead-colossus-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 26,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-chainwing-matron": {
    "id": "enemy-a9-chainwing-matron",
    "name": "Chainwing Matron",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a9-chainwing-matron.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-chainwing-matron.webp",
    "maxHp": 268,
    "physicalPower": 44,
    "spellPower": 0,
    "armor": 9,
    "magicResistance": 6,
    "hitChance": 1.01,
    "dodgeChance": 0.13,
    "critChance": 0.14,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 30
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 18
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 25
      },
      {
        "itemId": "gear-a9-stormrunner-head",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-chainwing-matron-strike",
        "name": "Savage Strike",
        "description": "Deals 140% Physical Power as Lightning damage and applies Stunned.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "lightning",
        "physicalPowerScaling": 1.4,
        "statusApplications": [
          {
            "status": "stunned",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a9-chainwing-matron-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8"
  },
  "enemy-a9-vaelith-tempest-roc": {
    "id": "enemy-a9-vaelith-tempest-roc",
    "name": "Vaelith, the Tempest Roc",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a9-vaelith-tempest-roc.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-vaelith-tempest-roc.webp",
    "maxHp": 1106,
    "physicalPower": 45,
    "spellPower": 45,
    "armor": 7,
    "magicResistance": 7,
    "hitChance": 1.01,
    "dodgeChance": 0.07,
    "critChance": 0.14,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a9-skyiron",
        "chance": 100
      },
      {
        "itemId": "item-a9-storm-core",
        "chance": 80
      },
      {
        "itemId": "item-a9-cloudfeather",
        "chance": 70
      },
      {
        "itemId": "gear-a9-stormrunner-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a9-stormrunner-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a9-skybreaker",
        "chance": 8
      },
      {
        "itemId": "gear-a9-stormcallers-tome",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a9-vaelith-tempest-roc-setup",
        "name": "Storm Chains",
        "description": "Applies Electrified and Stunned.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "electrified",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "stunned",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "thunderstorm"
      },
      {
        "id": "enemy-ability-a9-vaelith-tempest-roc-execution",
        "name": "Heavenfall",
        "description": "Charges for one turn, then deals 260% Spell Power as Lightning damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Vaelith, the Tempest Roc begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "thunderstorm"
      },
      {
        "id": "enemy-ability-a9-vaelith-tempest-roc-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 28,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#547cb8"
  },
  "enemy-a10-crownless-guard": {
    "id": "enemy-a10-crownless-guard",
    "name": "Crownless Guard",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-crownless-guard.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-crownless-guard.webp",
    "maxHp": 251,
    "physicalPower": 44,
    "spellPower": 0,
    "armor": 8,
    "magicResistance": 8,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.07500000000000001,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-crownless-head",
        "chance": 3
      },
      {
        "itemId": "gear-a10-crownless-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-crownless-guard-strike",
        "name": "Savage Strike",
        "description": "Deals 148% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-crownless-guard-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 28,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-ashen-confessor": {
    "id": "enemy-a10-ashen-confessor",
    "name": "Ashen Confessor",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-ashen-confessor.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-ashen-confessor.webp",
    "maxHp": 260,
    "physicalPower": 20,
    "spellPower": 45,
    "armor": 9,
    "magicResistance": 9,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.10500000000000001,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-crownless-pants",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-ashen-confessor-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 148% Spell Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.48,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a10-ashen-confessor-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-veilbound-executioner": {
    "id": "enemy-a10-veilbound-executioner",
    "name": "Veilbound Executioner",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-veilbound-executioner.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-veilbound-executioner.webp",
    "maxHp": 269,
    "physicalPower": 46,
    "spellPower": 0,
    "armor": 10,
    "magicResistance": 7,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.135,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-crownless-ring",
        "chance": 3
      },
      {
        "itemId": "gear-a10-veilborn-head",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-veilbound-executioner-strike",
        "name": "Savage Strike",
        "description": "Deals 148% Physical Power as Physical damage and applies Bleed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-veilbound-executioner-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-hollow-courtier": {
    "id": "enemy-a10-hollow-courtier",
    "name": "Hollow Courtier",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-hollow-courtier.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-hollow-courtier.webp",
    "maxHp": 278,
    "physicalPower": 21,
    "spellPower": 47,
    "armor": 8,
    "magicResistance": 8,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.07500000000000001,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-veilborn-chest",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-hollow-courtier-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 148% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.48,
        "statusApplications": [
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a10-hollow-courtier-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-crown-seraph": {
    "id": "enemy-a10-crown-seraph",
    "name": "Crown Seraph",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-crown-seraph.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-crown-seraph.webp",
    "maxHp": 287,
    "physicalPower": 48,
    "spellPower": 48,
    "armor": 9,
    "magicResistance": 9,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.10500000000000001,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-veilborn-boots",
        "chance": 3
      },
      {
        "itemId": "gear-a10-veilborn-ring",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-crown-seraph-strike",
        "name": "Ruinous Bolt",
        "description": "Deals 148% Spell Power as Spell damage and applies Vulnerable.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.48,
        "statusApplications": [
          {
            "status": "vulnerable",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a10-crown-seraph-pressure",
        "name": "Relentless Pressure",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-royal-shadow": {
    "id": "enemy-a10-royal-shadow",
    "name": "The Royal Shadow",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a10-royal-shadow.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-royal-shadow.webp",
    "maxHp": 296,
    "physicalPower": 49,
    "spellPower": 0,
    "armor": 10,
    "magicResistance": 7,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.135,
    "critChance": 0.155,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 30
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 18
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 25
      },
      {
        "itemId": "gear-a10-ashen-oracle-head",
        "chance": 3
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-royal-shadow-strike",
        "name": "Savage Strike",
        "description": "Deals 148% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-royal-shadow-stance",
        "name": "Vanish",
        "description": "Gains Stealth.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a"
  },
  "enemy-a10-aldren-hollow-king": {
    "id": "enemy-a10-aldren-hollow-king",
    "name": "Aldren, the Hollow King",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a10-aldren-hollow-king.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-aldren-hollow-king.webp",
    "maxHp": 1444,
    "physicalPower": 50,
    "spellPower": 50,
    "armor": 8,
    "magicResistance": 8,
    "hitChance": 1.0250000000000001,
    "dodgeChance": 0.07500000000000001,
    "critChance": 0.155,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a10-hollowsteel",
        "chance": 100
      },
      {
        "itemId": "item-a10-crown-shard",
        "chance": 80
      },
      {
        "itemId": "item-a10-soul-ash",
        "chance": 70
      },
      {
        "itemId": "gear-a10-ashen-oracle-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a10-ashen-oracle-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a10-crown-sunder",
        "chance": 8
      },
      {
        "itemId": "gear-a10-last-oracle-staff",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a10-aldren-hollow-king-setup",
        "name": "Royal Decree",
        "description": "Applies Vulnerable and ArcaneWound.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "vulnerable",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "arcaneWound",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a10-aldren-hollow-king-execution",
        "name": "The Last Night",
        "description": "Charges for one turn, then deals 260% Spell Power as Shadow damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Aldren, the Hollow King begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale"
      },
      {
        "id": "enemy-ability-a10-aldren-hollow-king-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 30,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#8e714a"
  },
  "enemy-a11-starved-pilgrim": {
    "id": "enemy-a11-starved-pilgrim",
    "name": "Starved Pilgrim",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-starved-pilgrim.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-starved-pilgrim.webp",
    "maxHp": 279,
    "physicalPower": 49,
    "spellPower": 0,
    "armor": 9,
    "magicResistance": 9,
    "hitChance": 1.04,
    "dodgeChance": 0.08,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-starforged-head",
        "chance": 3
      },
      {
        "itemId": "gear-a11-starforged-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-starved-pilgrim-strike",
        "name": "Gravitic Cut",
        "description": "Deals 156% Physical Power as Physical damage and applies Vulnerable.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "vulnerable",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a11-starved-pilgrim-pressure",
        "name": "Orbiting Ruin",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-glasswing-moth": {
    "id": "enemy-a11-glasswing-moth",
    "name": "Glasswing Moth",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-glasswing-moth.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-glasswing-moth.webp",
    "maxHp": 288,
    "physicalPower": 22,
    "spellPower": 50,
    "armor": 10,
    "magicResistance": 10,
    "hitChance": 1.04,
    "dodgeChance": 0.11000000000000001,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-starforged-pants",
        "chance": 3
      },
      {
        "itemId": "gear-a11-starforged-boots",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-glasswing-moth-strike",
        "name": "Prismatic Dust",
        "description": "Deals 156% Spell Power as Spell damage and applies Blind.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-glasswing-moth-pressure",
        "name": "Glasswing Flurry",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-fallen-astrologer": {
    "id": "enemy-a11-fallen-astrologer",
    "name": "Fallen Astrologer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-fallen-astrologer.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-fallen-astrologer.webp",
    "maxHp": 297,
    "physicalPower": 22,
    "spellPower": 51,
    "armor": 11,
    "magicResistance": 8,
    "hitChance": 1.04,
    "dodgeChance": 0.14,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-starforged-ring",
        "chance": 3
      },
      {
        "itemId": "gear-a11-voidstrider-head",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-fallen-astrologer-strike",
        "name": "Forbidden Constellation",
        "description": "Deals 156% Spell Power as Arcane damage and applies ArcaneWound.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "arcaneWound",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-fallen-astrologer-pressure",
        "name": "Orrery Barrage",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-comet-hound": {
    "id": "enemy-a11-comet-hound",
    "name": "Comet Hound",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-comet-hound.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-comet-hound.webp",
    "maxHp": 306,
    "physicalPower": 52,
    "spellPower": 0,
    "armor": 9,
    "magicResistance": 9,
    "hitChance": 1.04,
    "dodgeChance": 0.08,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-voidstrider-chest",
        "chance": 3
      },
      {
        "itemId": "gear-a11-voidstrider-pants",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-comet-hound-strike",
        "name": "Meteor Fang",
        "description": "Deals 156% Physical Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "fire",
        "physicalPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a11-comet-hound-pressure",
        "name": "Comet Rush",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-gravity-warden": {
    "id": "enemy-a11-gravity-warden",
    "name": "Gravity Warden",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-gravity-warden.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-gravity-warden.webp",
    "maxHp": 315,
    "physicalPower": 53,
    "spellPower": 53,
    "armor": 10,
    "magicResistance": 10,
    "hitChance": 1.04,
    "dodgeChance": 0.11000000000000001,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-voidstrider-boots",
        "chance": 3
      },
      {
        "itemId": "gear-a11-voidstrider-ring",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-gravity-warden-strike",
        "name": "Crushing Horizon",
        "description": "Deals 156% Spell Power as Spell damage and applies Slowed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "slowed",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-gravity-warden-pressure",
        "name": "Singularity Press",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-astral-devourer": {
    "id": "enemy-a11-astral-devourer",
    "name": "Astral Devourer",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a11-astral-devourer.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-astral-devourer.webp",
    "maxHp": 324,
    "physicalPower": 24,
    "spellPower": 54,
    "armor": 11,
    "magicResistance": 8,
    "hitChance": 1.04,
    "dodgeChance": 0.14,
    "critChance": 0.16999999999999998,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 30
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 18
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 25
      },
      {
        "itemId": "gear-a11-astral-savant-head",
        "chance": 3
      },
      {
        "itemId": "gear-a11-astral-savant-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-astral-devourer-strike",
        "name": "Consume Light",
        "description": "Deals 156% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.56,
        "statusApplications": [
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-astral-devourer-pressure",
        "name": "Many-Jawed Hunger",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7"
  },
  "enemy-a11-seraphel-fallen-star": {
    "id": "enemy-a11-seraphel-fallen-star",
    "name": "Seraphel, the Fallen Star",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a11-seraphel-fallen-star.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-seraphel-fallen-star.webp",
    "maxHp": 1834,
    "physicalPower": 55,
    "spellPower": 55,
    "armor": 9,
    "magicResistance": 9,
    "hitChance": 1.04,
    "dodgeChance": 0.08,
    "critChance": 0.16999999999999998,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a11-star-metal",
        "chance": 100
      },
      {
        "itemId": "item-a11-astral-glass",
        "chance": 80
      },
      {
        "itemId": "item-a11-comet-silk",
        "chance": 70
      },
      {
        "itemId": "gear-a11-astral-savant-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a11-astral-savant-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a11-cometfall",
        "chance": 8
      },
      {
        "itemId": "gear-a11-orrery-staff",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a11-seraphel-fallen-star-setup",
        "name": "Collapse the Heavens",
        "description": "Applies ArcaneWound and Blind.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "arcaneWound",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "arcane_overload"
      },
      {
        "id": "enemy-ability-a11-seraphel-fallen-star-execution",
        "name": "Starfall Extinction",
        "description": "Charges for one turn, then deals 260% Spell Power as Arcane damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Seraphel, the Fallen Star begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "elemental_fury"
      },
      {
        "id": "enemy-ability-a11-seraphel-fallen-star-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 32,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#8c69c7"
  },
  "enemy-a12-rootless-titan": {
    "id": "enemy-a12-rootless-titan",
    "name": "Rootless Titan",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-rootless-titan.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-rootless-titan.webp",
    "maxHp": 307,
    "physicalPower": 54,
    "spellPower": 0,
    "armor": 10,
    "magicResistance": 10,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.08499999999999999,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-worldroot-bastion-head",
        "chance": 3
      },
      {
        "itemId": "gear-a12-worldroot-bastion-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-rootless-titan-strike",
        "name": "Worldstone Blow",
        "description": "Deals 164% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-rootless-titan-stance",
        "name": "Hold the Line",
        "description": "Gains Guard.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 32,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-pale-burrower": {
    "id": "enemy-a12-pale-burrower",
    "name": "Pale Burrower",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-pale-burrower.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-pale-burrower.webp",
    "maxHp": 316,
    "physicalPower": 55,
    "spellPower": 0,
    "armor": 11,
    "magicResistance": 11,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.115,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-worldroot-bastion-pants",
        "chance": 3
      },
      {
        "itemId": "gear-a12-worldroot-bastion-boots",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-pale-burrower-strike",
        "name": "Heartseeker Claw",
        "description": "Deals 164% Physical Power as Physical damage and applies Bleed.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "statusApplications": [
          {
            "status": "bleed",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-pale-burrower-pressure",
        "name": "Burrowing Frenzy",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-deep-oracle": {
    "id": "enemy-a12-deep-oracle",
    "name": "Deep Oracle",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-deep-oracle.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-deep-oracle.webp",
    "maxHp": 325,
    "physicalPower": 25,
    "spellPower": 56,
    "armor": 12,
    "magicResistance": 9,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.14500000000000002,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-worldroot-bastion-ring",
        "chance": 3
      },
      {
        "itemId": "gear-a12-deepstalker-head",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-deep-oracle-strike",
        "name": "Buried Revelation",
        "description": "Deals 164% Spell Power as Spell damage and applies Blind.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.6400000000000001,
        "statusApplications": [
          {
            "status": "blind",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a12-deep-oracle-pressure",
        "name": "Prophetic Chorus",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-worldvein-elemental": {
    "id": "enemy-a12-worldvein-elemental",
    "name": "Worldvein Elemental",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-worldvein-elemental.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-worldvein-elemental.webp",
    "maxHp": 334,
    "physicalPower": 57,
    "spellPower": 57,
    "armor": 10,
    "magicResistance": 10,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.08499999999999999,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-deepstalker-chest",
        "chance": 3
      },
      {
        "itemId": "gear-a12-deepstalker-pants",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-worldvein-elemental-strike",
        "name": "Worldvein Fist",
        "description": "Deals 164% Spell Power as Fire damage and applies Burn.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.6400000000000001,
        "statusApplications": [
          {
            "status": "burn",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a12-worldvein-elemental-pressure",
        "name": "Magma Pulse",
        "description": "Strikes twice for 65% Physical Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-firstborn-shade": {
    "id": "enemy-a12-firstborn-shade",
    "name": "Firstborn Shade",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-firstborn-shade.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-firstborn-shade.webp",
    "maxHp": 343,
    "physicalPower": 58,
    "spellPower": 0,
    "armor": 11,
    "magicResistance": 11,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.115,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-deepstalker-boots",
        "chance": 3
      },
      {
        "itemId": "gear-a12-deepstalker-ring",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-firstborn-shade-strike",
        "name": "Before Memory",
        "description": "Deals 164% Physical Power as Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-firstborn-shade-stance",
        "name": "Vanish",
        "description": "Gains Stealth.",
        "energyCost": 1,
        "cooldownTurns": 3,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-abyssal-choir": {
    "id": "enemy-a12-abyssal-choir",
    "name": "Abyssal Choir",
    "title": "Creature",
    "imageUrl": "/assets/enemies/full/a12-abyssal-choir.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-abyssal-choir.webp",
    "maxHp": 352,
    "physicalPower": 26,
    "spellPower": 59,
    "armor": 12,
    "magicResistance": 9,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.14500000000000002,
    "critChance": 0.185,
    "energyRegen": 2,
    "maxEnergy": 10,
    "startingEnergy": 6,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 30
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 18
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 25
      },
      {
        "itemId": "gear-a12-first-tongue-head",
        "chance": 3
      },
      {
        "itemId": "gear-a12-first-tongue-chest",
        "chance": 2
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-abyssal-choir-strike",
        "name": "Unraveling Hymn",
        "description": "Deals 164% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 1,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.6400000000000001,
        "statusApplications": [
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a12-abyssal-choir-pressure",
        "name": "Fivefold Dirge",
        "description": "Strikes twice for 65% Spell Power per hit.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam"
      }
    ],
    "behaviorNotes": "Uses its first ready ability, prioritizing the listed order.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43"
  },
  "enemy-a12-eidolon-first-hunger": {
    "id": "enemy-a12-eidolon-first-hunger",
    "name": "Eidolon, the First Hunger",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a12-eidolon-first-hunger.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-eidolon-first-hunger.webp",
    "maxHp": 2276,
    "physicalPower": 60,
    "spellPower": 60,
    "armor": 10,
    "magicResistance": 10,
    "hitChance": 1.0550000000000002,
    "dodgeChance": 0.08499999999999999,
    "critChance": 0.185,
    "energyRegen": 3,
    "maxEnergy": 10,
    "startingEnergy": 10,
    "dropTable": [
      {
        "itemId": "item-a12-worldroot-heartwood",
        "chance": 100
      },
      {
        "itemId": "item-a12-first-echo",
        "chance": 80
      },
      {
        "itemId": "item-a12-abyssal-hide",
        "chance": 70
      },
      {
        "itemId": "gear-a12-first-tongue-pants",
        "chance": 14
      },
      {
        "itemId": "gear-a12-first-tongue-boots",
        "chance": 12
      },
      {
        "itemId": "gear-a12-worldsplitter",
        "chance": 8
      },
      {
        "itemId": "gear-a12-voice-below",
        "chance": 8
      }
    ],
    "abilities": [
      {
        "id": "enemy-ability-a12-eidolon-first-hunger-setup",
        "name": "Unmake the Living",
        "description": "Applies Vulnerable and Weaken.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "target",
        "statusApplications": [
          {
            "status": "vulnerable",
            "stacks": 2,
            "duration": 3
          },
          {
            "status": "weaken",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a12-eidolon-first-hunger-execution",
        "name": "The World Devours",
        "description": "Charges for one turn, then deals 260% Spell Power as Shadow damage.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Eidolon, the First Hunger begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a12-eidolon-first-hunger-recover",
        "name": "Sovereign Recovery",
        "description": "Restores 10% maximum Health and gains Guard.",
        "energyCost": 3,
        "cooldownTurns": 5,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 34,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      }
    ],
    "behaviorNotes": "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#b17a43"
  }
};
