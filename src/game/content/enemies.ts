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
    "behaviorNotes": "Saves Energy for Snipe, then uses Bow Shot while rebuilding.",
    "behavior": "goblin_longseer",
    "maxActionsPerTurn": 1,
    "accent": "#7f9453",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms1fezxg-6sfj6",
          "all": [
            {
              "type": "energy_at_least",
              "amount": 5
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms1ekpk5-l5ft7"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Enters Stealth before using Shiv, then keeps stabbing while the escape route recovers.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#687b43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms1fkbg6-tw10h",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms1fjpq2-x44en",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms1fkbg6-tw10h"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Heals a wounded ally first and maintains Slowed with Hex when healing is unnecessary.",
    "behavior": "goblin_woundfixer",
    "maxActionsPerTurn": 1,
    "accent": "#846b9e",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms1fpoku-tvscy",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.72
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms1fqn1u-55k6q",
          "all": [
            {
              "type": "player_missing_status",
              "status": "slowed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms1fqn1u-55k6q"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Protects companions without repeatedly wasting Guard, then uses Heavy Cleave.",
    "behavior": "goblin_biggrown",
    "maxActionsPerTurn": 1,
    "accent": "#8d6945",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms1fwaul-zcws5",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms1fv25a-ukf1s"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Rallies a group, opens Bleed with Skewer, then prepares Impale; Spear Poke fills recovery turns.",
    "behavior": "goblin_chieftain",
    "maxActionsPerTurn": 4,
    "accent": "#aa633f",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms1g3m9s-n12oq",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms1gpjhe-m9ky3",
          "all": [
            {
              "type": "player_has_status",
              "status": "bleed"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms1g1ysa-6452h",
          "all": [
            {
              "type": "player_missing_status",
              "status": "bleed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms1gucm0-0n5ec"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Naps while gathering Energy, then charges Club Smash at full Energy.",
    "behavior": "hill_troll",
    "maxActionsPerTurn": 1,
    "accent": "#6f735f",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2vx10q-s3qsn",
          "all": [
            {
              "type": "energy_at_least",
              "amount": 10
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2vylq4-ubwfz"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Uses Heavy Fists whenever fueled, Roars to regain Fierce, and Naps only while rebuilding.",
    "behavior": "mountain_troll",
    "maxActionsPerTurn": 1,
    "accent": "#5f6657",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2w38yw-vp9bu",
          "all": [
            {
              "type": "energy_at_least",
              "amount": 5
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2w4zyb-7c0ge",
          "all": [
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2w7zva-lxkg8"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Emergency-heals first, maintains Regenerate in groups, applies Greater Hex, then Naps while support tools recover.",
    "behavior": "troll_shaman",
    "maxActionsPerTurn": 1,
    "accent": "#75658b",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2wayvo-rnti2",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.55
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2wbr2c-66kcn",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "regenerate"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2wcm61-4wsw3",
          "all": [
            {
              "type": "player_missing_status",
              "status": "weaken"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2we50g-kzi7f"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Steals whenever possible, enters Stealth before Poisoned Stab, and uses direct pressure while repositioning.",
    "behavior": "bandit_enforcer",
    "maxActionsPerTurn": 2,
    "accent": "#6e5b50",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2wloah-2gx3k"
        },
        {
          "abilityId": "enemy-ability-ms2wng0f-y2n2z",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2wmdjd-22til",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2wng0f-y2n2z"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Builds to full Energy, then flees with every stolen trinket intact.",
    "behavior": "loot_goblin",
    "maxActionsPerTurn": 1,
    "accent": "#8c7944",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2wsv8u-j9a24",
          "all": [
            {
              "type": "energy_at_least",
              "amount": 10
            }
          ]
        }
      ],
      "fallbackAbilityIds": [],
      "fallback": "ordered"
    }
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
        "description": "Deals 200% Physical Power as Physical damage. Deals 35% more damage while you are Burning.",
        "energyCost": 2,
        "cooldownTurns": 6,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "physical",
        "physicalPowerScaling": 2,
        "vfx": "enemy_snipe",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.35
        }
      }
    ],
    "behaviorNotes": "Sets Fire Trap, exploits Burn with Snipe, and uses Bow Shot while the combination recovers.",
    "behavior": "bandit_trapper",
    "maxActionsPerTurn": 1,
    "accent": "#596873",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2wyie9-iisii",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2wxm3t-nrfbj",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2wwtu0-ustxf"
      ],
      "fallback": "ordered"
    }
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
    "behaviorNotes": "Builds Guard with Patience, unleashes No Patience at full Energy, then permanently switches to Toying.",
    "behavior": "troll_bandit_king",
    "maxActionsPerTurn": 1,
    "accent": "#8a4d3f",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-ms2xgcxa-lier7",
          "all": [
            {
              "type": "phase_is",
              "phase": "toying"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2xe0t2-q41xk",
          "all": [
            {
              "type": "phase_is_not",
              "phase": "toying"
            },
            {
              "type": "energy_at_least",
              "amount": 10
            }
          ]
        },
        {
          "abilityId": "enemy-ability-ms2xd4iz-c5j5z",
          "all": [
            {
              "type": "phase_is_not",
              "phase": "toying"
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-ms2xgcxa-lier7"
      ],
      "fallback": "ordered"
    }
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
        "name": "Reedknife",
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-reed-stalker-pressure",
        "name": "Sink Beneath the Reeds",
        "description": "Gains Stealth for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a4-reed-stalker-ambush",
        "name": "Ambush from Stillwater",
        "description": "A high-damage ambush prepared through Sink Beneath the Reeds.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.35,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Enters Stealth with Sink Beneath the Reeds, immediately looks for Ambush from Stillwater, then falls back to Reedknife.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-reed-stalker-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-reed-stalker-pressure",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-reed-stalker-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Clinging Bite",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-bog-leech-setup",
        "name": "Open the Vein",
        "description": "Deals a lighter hit and applies Bleed for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Blood-Swollen Lunge",
        "description": "A heavy attack that deals 32% more damage while you have Bleed.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "bleed",
          "multiplier": 1.32
        }
      }
    ],
    "behaviorNotes": "Sets up Bleed with Open the Vein, converts it into burst damage with Blood-Swollen Lunge, and uses Clinging Bite while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-bog-leech-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "bleed"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-bog-leech-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "bleed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-bog-leech-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Bog Spittle",
        "description": "Deals reliable Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a4-mirefen-spitter-setup",
        "name": "Venom Saturation",
        "description": "Deals a lighter hit and applies Poison for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Septic Burst",
        "description": "A heavy attack that deals 32% more damage while you have Poison.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "poison",
          "multiplier": 1.32
        }
      }
    ],
    "behaviorNotes": "Sets up Poison with Venom Saturation, converts it into burst damage with Septic Burst, and uses Bog Spittle while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-mirefen-spitter-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "poison"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-mirefen-spitter-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "poison"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-mirefen-spitter-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Waterlogged Cleave",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Drowned Bulwark",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 12,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a4-drowned-warden-payoff",
        "name": "Undertow Crush",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.25,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Drowned Bulwark once pressured, answers with Undertow Crush while protected, and otherwise holds threat with Waterlogged Cleave.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-drowned-warden-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-drowned-warden-pressure",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-drowned-warden-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Crooked Hex",
        "description": "Deals 100% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Fenward Covenant",
        "description": "Grants Barrier to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "barrier",
            "stacks": 14,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a4-fen-witch-aid",
        "name": "Mire Mending",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.01
      }
    ],
    "behaviorNotes": "Prioritizes Mire Mending for badly wounded allies, maintains Barrier with Fenward Covenant in groups, and attacks with Crooked Hex when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-fen-witch-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-fen-witch-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-fen-witch-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Carapace Bash",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a4-brood-guard-stance",
        "name": "Guard the Brood",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 12,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a4-brood-guard-payoff",
        "name": "Mandible Lock",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.25,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Guard the Brood once pressured, answers with Mandible Lock while protected, and otherwise holds threat with Carapace Bash.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-brood-guard-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-brood-guard-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-brood-guard-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a4-vespara-broodmother": {
    "id": "enemy-a4-vespara-broodmother",
    "name": "Vespara, Broodmother",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a4-vespara-broodmother.webp",
    "portraitUrl": "/assets/enemies/portraits/a4-vespara-broodmother.webp",
    "maxHp": 255,
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
        "description": "Charges for one turn, then deals 260% Physical Power as Physical damage. Deals 45% more damage while you have Poison.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Vespara, Broodmother begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale",
        "targetStatusDamageBonus": {
          "status": "poison",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a4-vespara-broodmother-phase",
        "name": "Matriarch's Fury",
        "description": "Below 40% Health, gains Fierce for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a4-vespara-broodmother-basic",
        "name": "Broodfang",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.56,
        "vfx": "enemy_impale"
      }
    ],
    "behaviorNotes": "Opens with Brood Call, converts Poison into Venom Deluge, protects itself with Sovereign Recovery under pressure, and enters Matriarch's Fury below 40% Health. Broodfang prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#5f8a58",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a4-vespara-broodmother-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-vespara-broodmother-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-vespara-broodmother-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "poison"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a4-vespara-broodmother-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "poison"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a4-vespara-broodmother-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Cinder Fang",
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "fire",
        "physicalPowerScaling": 1.08,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a5-ash-hound-setup",
        "name": "Searing Scent",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Furnace Pounce",
        "description": "A heavy attack that deals 35% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.345
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Searing Scent, converts it into burst damage with Furnace Pounce, and uses Cinder Fang while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-ash-hound-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-ash-hound-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-ash-hound-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Hammer Spark",
        "description": "Deals 108% Physical Power as Fire damage and applies Charred.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Temper the Line",
        "description": "Grants Fierce to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a5-cinder-smith-aid",
        "name": "Emergency Quench",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "vfx": "enemy_heavy_cleave",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.05
      }
    ],
    "behaviorNotes": "Prioritizes Emergency Quench for badly wounded allies, maintains Fierce with Temper the Line in groups, and attacks with Hammer Spark when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-cinder-smith-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-cinder-smith-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "fierce"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-cinder-smith-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Molten Knuckle",
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.08,
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a5-slag-elemental-setup",
        "name": "Slag Coating",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Crucible Rupture",
        "description": "A heavy attack that deals 35% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.345
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Slag Coating, converts it into burst damage with Crucible Rupture, and uses Molten Knuckle while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-slag-elemental-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-slag-elemental-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-slag-elemental-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Ember Scripture",
        "description": "Deals 108% Spell Power as Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.08,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a5-furnace-acolyte-stance",
        "name": "Furnace Litany",
        "description": "Grants Enlightened to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_protect",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a5-furnace-acolyte-aid",
        "name": "Cauterizing Prayer",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.05
      }
    ],
    "behaviorNotes": "Prioritizes Cauterizing Prayer for badly wounded allies, maintains Enlightened with Furnace Litany in groups, and attacks with Ember Scripture when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-furnace-acolyte-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-furnace-acolyte-stance",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "enlightened"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-furnace-acolyte-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Chain Command",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.08,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a5-ironbound-overseer-stance",
        "name": "Overseer's Wall",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 14,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a5-ironbound-overseer-payoff",
        "name": "Punitive Slam",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.35,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Overseer's Wall once pressured, answers with Punitive Slam while protected, and otherwise holds threat with Chain Command.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-ironbound-overseer-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-ironbound-overseer-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-ironbound-overseer-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Spark Kiss",
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.08,
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a5-spark-swarm-setup",
        "name": "Static Kindling",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Flashover",
        "description": "A heavy attack that deals 35% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.345
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Static Kindling, converts it into burst damage with Flashover, and uses Spark Kiss while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-spark-swarm-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-spark-swarm-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-spark-swarm-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a5-furnace-tyrant": {
    "id": "enemy-a5-furnace-tyrant",
    "name": "The Furnace Tyrant",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a5-furnace-tyrant.webp",
    "portraitUrl": "/assets/enemies/portraits/a5-furnace-tyrant.webp",
    "maxHp": 356,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Fire damage. Deals 45% more damage while you have Burn.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "The Furnace Tyrant begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "firestorm",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a5-furnace-tyrant-phase",
        "name": "Unsealed Core",
        "description": "Below 40% Health, gains Fierce for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a5-furnace-tyrant-basic",
        "name": "Tyrant's Hammer",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.56,
        "vfx": "firestorm"
      }
    ],
    "behaviorNotes": "Opens with Stoke the Furnace, converts Burn into Core Meltdown, protects itself with Sovereign Recovery under pressure, and enters Unsealed Core below 40% Health. Tyrant's Hammer prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#a75835",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a5-furnace-tyrant-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-furnace-tyrant-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-furnace-tyrant-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a5-furnace-tyrant-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a5-furnace-tyrant-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Brine Claw",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.16,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a6-brine-crawler-setup",
        "name": "Drenching Grasp",
        "description": "Deals a lighter hit and applies Wet for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Pressure-Shell Crush",
        "description": "A heavy attack that deals 37% more damage while you have Wet.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "wet",
          "multiplier": 1.37
        }
      }
    ],
    "behaviorNotes": "Sets up Wet with Drenching Grasp, converts it into burst damage with Pressure-Shell Crush, and uses Brine Claw while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-brine-crawler-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "wet"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-brine-crawler-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "wet"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-brine-crawler-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Saltwater Curse",
        "description": "Deals 116% Spell Power as Spell damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Reliquary Hymn",
        "description": "Grants Barrier to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "barrier",
            "stacks": 18,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a6-drowned-acolyte-aid",
        "name": "Tidal Restoration",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.0899999999999999
      }
    ],
    "behaviorNotes": "Prioritizes Tidal Restoration for badly wounded allies, maintains Barrier with Reliquary Hymn in groups, and attacks with Saltwater Curse when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-drowned-acolyte-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-drowned-acolyte-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-drowned-acolyte-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Relic Pulse",
        "description": "Deals steady Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.16,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a6-relic-sentinel-stance",
        "name": "Ancient Aegis",
        "description": "Gains Barrier and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "barrier",
            "stacks": 16,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a6-relic-sentinel-payoff",
        "name": "Vaultbreaker",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.45,
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Uses Ancient Aegis once pressured, answers with Vaultbreaker while protected, and otherwise holds threat with Relic Pulse.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-relic-sentinel-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "barrier"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-relic-sentinel-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-relic-sentinel-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Galvanic Bite",
        "description": "Deals reliable Lightning damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.16,
        "vfx": "lightning_strike"
      },
      {
        "id": "enemy-ability-a6-shock-eel-setup",
        "name": "Conductive Flood",
        "description": "Deals a lighter hit and applies Electrified for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Chain Discharge",
        "description": "A heavy attack that deals 37% more damage while you have Electrified.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "electrified",
          "multiplier": 1.37
        }
      }
    ],
    "behaviorNotes": "Sets up Electrified with Conductive Flood, converts it into burst damage with Chain Discharge, and uses Galvanic Bite while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-shock-eel-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "electrified"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-shock-eel-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "electrified"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-shock-eel-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Corroded Thrust",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Tidewall Stance",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 16,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a6-tidebound-knight-payoff",
        "name": "Armor-Rending Surge",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.45,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Tidewall Stance once pressured, answers with Armor-Rending Surge while protected, and otherwise holds threat with Corroded Thrust.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-tidebound-knight-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-tidebound-knight-pressure",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-tidebound-knight-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Siren's Rebuke",
        "description": "Deals 116% Spell Power as Spell damage and applies Wet.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Choir of the Deep",
        "description": "Grants Regenerate to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "regenerate",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a6-siren-oracle-aid",
        "name": "Restorative Verse",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.0899999999999999
      }
    ],
    "behaviorNotes": "Prioritizes Restorative Verse for badly wounded allies, maintains Regenerate with Choir of the Deep in groups, and attacks with Siren's Rebuke when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-siren-oracle-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-siren-oracle-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "regenerate"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-siren-oracle-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a6-nhalos-drowned-seer": {
    "id": "enemy-a6-nhalos-drowned-seer",
    "name": "Nhalos, the Drowned Seer",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a6-nhalos-drowned-seer.webp",
    "portraitUrl": "/assets/enemies/portraits/a6-nhalos-drowned-seer.webp",
    "maxHp": 525,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Lightning damage. Deals 45% more damage while you have Wet.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Nhalos, the Drowned Seer begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "thunderstorm",
        "targetStatusDamageBonus": {
          "status": "wet",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a6-nhalos-drowned-seer-phase",
        "name": "The Tide Remembers",
        "description": "Below 40% Health, gains Enlightened for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a6-nhalos-drowned-seer-basic",
        "name": "Drowned Scepter",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.56,
        "vfx": "thunderstorm"
      }
    ],
    "behaviorNotes": "Opens with Drown the Future, converts Wet into Foretold Tempest, protects itself with Sovereign Recovery under pressure, and enters The Tide Remembers below 40% Health. Drowned Scepter prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#397f91",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a6-nhalos-drowned-seer-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "enlightened"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-nhalos-drowned-seer-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-nhalos-drowned-seer-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "wet"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a6-nhalos-drowned-seer-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "wet"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a6-nhalos-drowned-seer-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Silvered Claw",
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-mirror-stalker-stance",
        "name": "Step Through Glass",
        "description": "Gains Stealth for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      },
      {
        "id": "enemy-ability-a7-mirror-stalker-ambush",
        "name": "Reflected Ambush",
        "description": "A high-damage ambush prepared through Step Through Glass.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6740000000000002,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Enters Stealth with Step Through Glass, immediately looks for Reflected Ambush, then falls back to Silvered Claw.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-mirror-stalker-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-mirror-stalker-stance",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-mirror-stalker-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Gloam Arrow",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-gloom-archer-setup",
        "name": "Blackglass Glare",
        "description": "Deals a lighter hit and applies Blind for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Sightless Volley",
        "description": "A heavy attack that deals 40% more damage while you have Blind.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "blind",
          "multiplier": 1.395
        }
      }
    ],
    "behaviorNotes": "Sets up Blind with Blackglass Glare, converts it into burst damage with Sightless Volley, and uses Gloam Arrow while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-gloom-archer-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "blind"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-gloom-archer-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "blind"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-gloom-archer-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Bloodletter",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-bloodbound-knight-setup",
        "name": "Crimson Oath",
        "description": "Deals a lighter hit and applies Bleed for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Sanguine Reaping",
        "description": "A heavy attack that deals 40% more damage while you have Bleed.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "bleed",
          "multiplier": 1.395
        }
      }
    ],
    "behaviorNotes": "Sets up Bleed with Crimson Oath, converts it into burst damage with Sanguine Reaping, and uses Bloodletter while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-bloodbound-knight-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "bleed"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-bloodbound-knight-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "bleed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-bloodbound-knight-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Shard Lance",
        "description": "Deals 124% Spell Power as Spell damage and applies Shatter.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Prismatic Ward",
        "description": "Grants Barrier to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "barrier",
            "stacks": 20,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a7-shard-magus-aid",
        "name": "Glassweave Mend",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.13
      }
    ],
    "behaviorNotes": "Prioritizes Glassweave Mend for badly wounded allies, maintains Barrier with Prismatic Ward in groups, and attacks with Shard Lance when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-shard-magus-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-shard-magus-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-shard-magus-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Veil Cut",
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.24,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a7-veil-dancer-stance",
        "name": "Impossible Step",
        "description": "Gains Evasion for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "evasion",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "evasion"
      },
      {
        "id": "enemy-ability-a7-veil-dancer-ambush",
        "name": "Dance Behind the Blade",
        "description": "A high-damage ambush prepared through Impossible Step.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6740000000000002,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Enters Evasion with Impossible Step, immediately looks for Dance Behind the Blade, then falls back to Veil Cut.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-veil-dancer-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "evasion"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-veil-dancer-stance",
          "all": [
            {
              "type": "self_missing_status",
              "status": "evasion"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-veil-dancer-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Echoing Touch",
        "description": "Deals reliable Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.24,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a7-reflection-wraith-setup",
        "name": "Fracture Resolve",
        "description": "Deals a lighter hit and applies Weaken for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Reverberating Ruin",
        "description": "A heavy attack that deals 40% more damage while you have Weaken.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "weaken",
          "multiplier": 1.395
        }
      }
    ],
    "behaviorNotes": "Sets up Weaken with Fracture Resolve, converts it into burst damage with Reverberating Ruin, and uses Echoing Touch while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-reflection-wraith-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "weaken"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-reflection-wraith-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "weaken"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-reflection-wraith-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a7-lady-noctra": {
    "id": "enemy-a7-lady-noctra",
    "name": "Lady Noctra, the Last Reflection",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a7-lady-noctra.webp",
    "portraitUrl": "/assets/enemies/portraits/a7-lady-noctra.webp",
    "maxHp": 762,
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
        "description": "Charges for one turn, then deals 260% Physical Power as Physical damage. Deals 45% more damage while you have Blind.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Lady Noctra, the Last Reflection begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale",
        "targetStatusDamageBonus": {
          "status": "blind",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a7-lady-noctra-phase",
        "name": "Perfect Reflection",
        "description": "Below 40% Health, gains Evasion for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "evasion",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a7-lady-noctra-basic",
        "name": "Noctra's Shard",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.56,
        "vfx": "enemy_impale"
      }
    ],
    "behaviorNotes": "Opens with Hall of Mirrors, converts Blind into Shatter the Self, protects itself with Sovereign Recovery under pressure, and enters Perfect Reflection below 40% Health. Noctra's Shard prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#65518c",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a7-lady-noctra-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "evasion"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-lady-noctra-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-lady-noctra-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "blind"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a7-lady-noctra-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "blind"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a7-lady-noctra-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Rime Fang",
        "description": "Deals reliable Frost damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "frost",
        "physicalPowerScaling": 1.32,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-rime-wolf-setup",
        "name": "Winter's Scent",
        "description": "Deals a lighter hit and applies Cold for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "White-Fang Rend",
        "description": "A heavy attack that deals 42% more damage while you have Cold.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "cold",
          "multiplier": 1.42
        }
      }
    ],
    "behaviorNotes": "Sets up Cold with Winter's Scent, converts it into burst damage with White-Fang Rend, and uses Rime Fang while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-rime-wolf-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "cold"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-rime-wolf-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "cold"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-rime-wolf-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Ice-Axe Chop",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-icebound-raider-setup",
        "name": "Crack the Guard",
        "description": "Deals a lighter hit and applies Shatter for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Glacial Execution",
        "description": "A heavy attack that deals 42% more damage while you have Shatter.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "shatter",
          "multiplier": 1.42
        }
      }
    ],
    "behaviorNotes": "Sets up Shatter with Crack the Guard, converts it into burst damage with Glacial Execution, and uses Ice-Axe Chop while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-icebound-raider-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "shatter"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-icebound-raider-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "shatter"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-icebound-raider-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Aurora Ray",
        "description": "Deals 132% Spell Power as Frost damage and applies Cold.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Boreal Mantle",
        "description": "Grants Barrier to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "barrier",
            "stacks": 22,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a8-aurora-wisp-aid",
        "name": "Warmth of the Lights",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "frostbolt",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.17
      }
    ],
    "behaviorNotes": "Prioritizes Warmth of the Lights for badly wounded allies, maintains Barrier with Boreal Mantle in groups, and attacks with Aurora Ray when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-aurora-wisp-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-aurora-wisp-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-aurora-wisp-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Hermit's Frost",
        "description": "Deals reliable Frost damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 1.32,
        "vfx": "frostbolt"
      },
      {
        "id": "enemy-ability-a8-frost-hermit-setup",
        "name": "Still the Blood",
        "description": "Deals a lighter hit and applies Frozen for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Shatter the Frozen",
        "description": "A heavy attack that deals 42% more damage while you have Frozen.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "frozen",
          "multiplier": 1.42
        }
      }
    ],
    "behaviorNotes": "Sets up Frozen with Still the Blood, converts it into burst damage with Shatter the Frozen, and uses Hermit's Frost while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-frost-hermit-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "frozen"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-frost-hermit-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "frozen"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-frost-hermit-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Glacier Fist",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-glacier-golem-stance",
        "name": "Permafrost Shell",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 20,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a8-glacier-golem-payoff",
        "name": "Calving Blow",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6500000000000001,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Permafrost Shell once pressured, answers with Calving Blow while protected, and otherwise holds threat with Glacier Fist.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-glacier-golem-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-glacier-golem-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-glacier-golem-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Snowknife",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.32,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a8-snowblind-harrier-setup",
        "name": "Whiteout Feint",
        "description": "Deals a lighter hit and applies Blind for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Blindside Barrage",
        "description": "A heavy attack that deals 42% more damage while you have Blind.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "blind",
          "multiplier": 1.42
        }
      }
    ],
    "behaviorNotes": "Sets up Blind with Whiteout Feint, converts it into burst damage with Blindside Barrage, and uses Snowknife while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-snowblind-harrier-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "blind"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-snowblind-harrier-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "blind"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-snowblind-harrier-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a8-skara-white-maw": {
    "id": "enemy-a8-skara-white-maw",
    "name": "Skara, the White Maw",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a8-skara-white-maw.webp",
    "portraitUrl": "/assets/enemies/portraits/a8-skara-white-maw.webp",
    "maxHp": 1066,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Frost damage. Deals 45% more damage while you have Cold.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Skara, the White Maw begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "absolute_zero",
        "targetStatusDamageBonus": {
          "status": "cold",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a8-skara-white-maw-phase",
        "name": "Starving Winter",
        "description": "Below 40% Health, gains Fierce for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a8-skara-white-maw-basic",
        "name": "Rimeclaw",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "frost",
        "spellPowerScaling": 1.56,
        "vfx": "absolute_zero"
      }
    ],
    "behaviorNotes": "Opens with Absolute Winter, converts Cold into Whiteout Devour, protects itself with Sovereign Recovery under pressure, and enters Starving Winter below 40% Health. Rimeclaw prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#71a8c8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a8-skara-white-maw-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-skara-white-maw-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-skara-white-maw-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "cold"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a8-skara-white-maw-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "cold"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a8-skara-white-maw-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Thunderclaw",
        "description": "Deals reliable Lightning damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "lightning",
        "physicalPowerScaling": 1.4,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a9-thunder-talon-setup",
        "name": "Mark with Lightning",
        "description": "Deals a lighter hit and applies Electrified for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Sky-Splitter Dive",
        "description": "A heavy attack that deals 45% more damage while you have Electrified.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "electrified",
          "multiplier": 1.445
        }
      }
    ],
    "behaviorNotes": "Sets up Electrified with Mark with Lightning, converts it into burst damage with Sky-Splitter Dive, and uses Thunderclaw while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-thunder-talon-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "electrified"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-thunder-talon-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "electrified"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-thunder-talon-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Zealot's Brand",
        "description": "Deals 140% Physical Power as Lightning damage and applies Electrified.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Tempest Sermon",
        "description": "Grants Fierce to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a9-spire-zealot-aid",
        "name": "Stormborne Renewal",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "vfx": "enemy_heavy_cleave",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.21
      }
    ],
    "behaviorNotes": "Prioritizes Stormborne Renewal for badly wounded allies, maintains Fierce with Tempest Sermon in groups, and attacks with Zealot's Brand when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-spire-zealot-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-spire-zealot-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "fierce"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-spire-zealot-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Forked Spark",
        "description": "Deals reliable Lightning damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.4,
        "vfx": "lightning_strike"
      },
      {
        "id": "enemy-ability-a9-storm-channeler-setup",
        "name": "Build the Charge",
        "description": "Deals a lighter hit and applies Electrified for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Grounding Cataclysm",
        "description": "A heavy attack that deals 45% more damage while you have Electrified.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "electrified",
          "multiplier": 1.445
        }
      }
    ],
    "behaviorNotes": "Sets up Electrified with Build the Charge, converts it into burst damage with Grounding Cataclysm, and uses Forked Spark while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-storm-channeler-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "electrified"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-storm-channeler-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "electrified"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-storm-channeler-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Cloudlash",
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.4,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a9-cloud-djinn-stance",
        "name": "Become the Gale",
        "description": "Gains Evasion for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "evasion",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "evasion"
      },
      {
        "id": "enemy-ability-a9-cloud-djinn-ambush",
        "name": "Eye-of-the-Storm Strike",
        "description": "A high-damage ambush prepared through Become the Gale.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.89,
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Enters Evasion with Become the Gale, immediately looks for Eye-of-the-Storm Strike, then falls back to Cloudlash.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-cloud-djinn-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "evasion"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-cloud-djinn-stance",
          "all": [
            {
              "type": "self_missing_status",
              "status": "evasion"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-cloud-djinn-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Thunderhead Fist",
        "description": "Deals steady Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.4,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a9-thunderhead-colossus-stance",
        "name": "Stormfront Bulwark",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 22,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a9-thunderhead-colossus-payoff",
        "name": "Pressure Collapse",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.75,
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Uses Stormfront Bulwark once pressured, answers with Pressure Collapse while protected, and otherwise holds threat with Thunderhead Fist.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-thunderhead-colossus-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-thunderhead-colossus-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-thunderhead-colossus-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Chainwing Rake",
        "description": "Deals reliable Lightning damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "lightning",
        "physicalPowerScaling": 1.4,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a9-chainwing-matron-setup",
        "name": "Lock the Nerves",
        "description": "Deals a lighter hit and applies Stunned for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Matron's Thunderfall",
        "description": "A heavy attack that deals 45% more damage while you have Stunned.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "stunned",
          "multiplier": 1.445
        }
      }
    ],
    "behaviorNotes": "Sets up Stunned with Lock the Nerves, converts it into burst damage with Matron's Thunderfall, and uses Chainwing Rake while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-chainwing-matron-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "stunned"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-chainwing-matron-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "stunned"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-chainwing-matron-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a9-vaelith-tempest-roc": {
    "id": "enemy-a9-vaelith-tempest-roc",
    "name": "Vaelith, the Tempest Roc",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a9-vaelith-tempest-roc.webp",
    "portraitUrl": "/assets/enemies/portraits/a9-vaelith-tempest-roc.webp",
    "maxHp": 1438,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Lightning damage. Deals 45% more damage while you have Electrified.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Vaelith, the Tempest Roc begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "thunderstorm",
        "targetStatusDamageBonus": {
          "status": "electrified",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a9-vaelith-tempest-roc-phase",
        "name": "Eye of the Tempest",
        "description": "Below 40% Health, gains Charged Up for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "chargedUp",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a9-vaelith-tempest-roc-basic",
        "name": "Stormbeak",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "lightning",
        "spellPowerScaling": 1.56,
        "vfx": "thunderstorm"
      }
    ],
    "behaviorNotes": "Opens with Storm Chains, converts Electrified into Heavenfall, protects itself with Sovereign Recovery under pressure, and enters Eye of the Tempest below 40% Health. Stormbeak prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#547cb8",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a9-vaelith-tempest-roc-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "chargedUp"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-vaelith-tempest-roc-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-vaelith-tempest-roc-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "electrified"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a9-vaelith-tempest-roc-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "electrified"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a9-vaelith-tempest-roc-basic"
      ],
      "fallback": "ordered"
    }
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
        "name": "Oathless Slash",
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-crownless-guard-stance",
        "name": "Broken Formation",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 24,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a10-crownless-guard-payoff",
        "name": "Crowncrusher",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.85,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Broken Formation once pressured, answers with Crowncrusher while protected, and otherwise holds threat with Oathless Slash.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-crownless-guard-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-crownless-guard-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-crownless-guard-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Cinder Confession",
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.48,
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a10-ashen-confessor-setup",
        "name": "Name the Sin",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Pyre Absolution",
        "description": "A heavy attack that deals 47% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.47
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Name the Sin, converts it into burst damage with Pyre Absolution, and uses Cinder Confession while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-ashen-confessor-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-ashen-confessor-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-ashen-confessor-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Headsman's Cut",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-veilbound-executioner-setup",
        "name": "Mark for Death",
        "description": "Deals a lighter hit and applies Bleed for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Veiled Guillotine",
        "description": "A heavy attack that deals 47% more damage while you have Bleed.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "bleed",
          "multiplier": 1.47
        }
      }
    ],
    "behaviorNotes": "Sets up Bleed with Mark for Death, converts it into burst damage with Veiled Guillotine, and uses Headsman's Cut while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-veilbound-executioner-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "bleed"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-veilbound-executioner-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "bleed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-veilbound-executioner-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Courtly Malice",
        "description": "Deals 148% Spell Power as Spell damage and applies Weaken.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Hollow Etiquette",
        "description": "Grants Enlightened to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a10-hollow-courtier-aid",
        "name": "Royal Reprieve",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.25
      }
    ],
    "behaviorNotes": "Prioritizes Royal Reprieve for badly wounded allies, maintains Enlightened with Hollow Etiquette in groups, and attacks with Courtly Malice when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-hollow-courtier-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-hollow-courtier-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "enlightened"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-hollow-courtier-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Fallen Radiance",
        "description": "Deals reliable Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.48,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a10-crown-seraph-setup",
        "name": "Strip the Halo",
        "description": "Deals a lighter hit and applies Vulnerable for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Judgment Without Mercy",
        "description": "A heavy attack that deals 47% more damage while you have Vulnerable.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "vulnerable",
          "multiplier": 1.47
        }
      }
    ],
    "behaviorNotes": "Sets up Vulnerable with Strip the Halo, converts it into burst damage with Judgment Without Mercy, and uses Fallen Radiance while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-crown-seraph-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "vulnerable"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-crown-seraph-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "vulnerable"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-crown-seraph-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Royal Knife",
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.48,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a10-royal-shadow-stance",
        "name": "Disappear Between Heartbeats",
        "description": "Gains Stealth for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      },
      {
        "id": "enemy-ability-a10-royal-shadow-ambush",
        "name": "The King's Blind Spot",
        "description": "A high-damage ambush prepared through Disappear Between Heartbeats.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.998,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Enters Stealth with Disappear Between Heartbeats, immediately looks for The King's Blind Spot, then falls back to Royal Knife.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-royal-shadow-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-royal-shadow-stance",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-royal-shadow-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a10-aldren-hollow-king": {
    "id": "enemy-a10-aldren-hollow-king",
    "name": "Aldren, the Hollow King",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a10-aldren-hollow-king.webp",
    "portraitUrl": "/assets/enemies/portraits/a10-aldren-hollow-king.webp",
    "maxHp": 1877,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Shadow damage. Deals 45% more damage while you have Vulnerable.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Aldren, the Hollow King begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_impale",
        "targetStatusDamageBonus": {
          "status": "vulnerable",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a10-aldren-hollow-king-phase",
        "name": "The Empty Throne",
        "description": "Below 40% Health, gains Fierce for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a10-aldren-hollow-king-basic",
        "name": "Royal Severance",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 1.56,
        "vfx": "enemy_impale"
      }
    ],
    "behaviorNotes": "Opens with Royal Decree, converts Vulnerable into The Last Night, protects itself with Sovereign Recovery under pressure, and enters The Empty Throne below 40% Health. Royal Severance prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#8e714a",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a10-aldren-hollow-king-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-aldren-hollow-king-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-aldren-hollow-king-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "vulnerable"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a10-aldren-hollow-king-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "vulnerable"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a10-aldren-hollow-king-basic"
      ],
      "fallback": "ordered"
    }
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
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.56,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a11-starved-pilgrim-setup",
        "name": "Pilgrim's Burden",
        "description": "Deals a lighter hit and applies Vulnerable for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "description": "A heavy attack that deals 50% more damage while you have Vulnerable.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "vulnerable",
          "multiplier": 1.495
        }
      }
    ],
    "behaviorNotes": "Sets up Vulnerable with Pilgrim's Burden, converts it into burst damage with Orbiting Ruin, and uses Gravitic Cut while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-starved-pilgrim-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "vulnerable"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-starved-pilgrim-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "vulnerable"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-starved-pilgrim-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Glasswing Flit",
        "description": "Deals reliable Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.56,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-glasswing-moth-setup",
        "name": "Prismatic Dust",
        "description": "Deals a lighter hit and applies Blind for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Thousand-Facet Flurry",
        "description": "A heavy attack that deals 50% more damage while you have Blind.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "blind",
          "multiplier": 1.495
        }
      }
    ],
    "behaviorNotes": "Sets up Blind with Prismatic Dust, converts it into burst damage with Thousand-Facet Flurry, and uses Glasswing Flit while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-glasswing-moth-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "blind"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-glasswing-moth-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "blind"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-glasswing-moth-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Starless Ray",
        "description": "Deals reliable Arcane damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 1.56,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a11-fallen-astrologer-setup",
        "name": "Forbidden Constellation",
        "description": "Deals a lighter hit and applies Arcane Wound for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "description": "A heavy attack that deals 50% more damage while you have Arcane Wound.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "arcaneWound",
          "multiplier": 1.495
        }
      }
    ],
    "behaviorNotes": "Sets up Arcane Wound with Forbidden Constellation, converts it into burst damage with Orrery Barrage, and uses Starless Ray while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-fallen-astrologer-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "arcaneWound"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-fallen-astrologer-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "arcaneWound"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-fallen-astrologer-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Comet Fang",
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "fire",
        "physicalPowerScaling": 1.56,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a11-comet-hound-setup",
        "name": "Meteor Scent",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Perihelion Rush",
        "description": "A heavy attack that deals 50% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.495
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Meteor Scent, converts it into burst damage with Perihelion Rush, and uses Comet Fang while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-comet-hound-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-comet-hound-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-comet-hound-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Horizon Maul",
        "description": "Deals steady Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
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
        "name": "Event-Horizon Guard",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "vfx": "enemy_bite_claw",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 26,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a11-gravity-warden-payoff",
        "name": "Singularity Press",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.9500000000000002,
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Uses Event-Horizon Guard once pressured, answers with Singularity Press while protected, and otherwise holds threat with Horizon Maul.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-gravity-warden-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-gravity-warden-pressure",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-gravity-warden-strike"
      ],
      "fallback": "ordered"
    }
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
        "cooldownTurns": 0,
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
        "name": "Starless Communion",
        "description": "Grants Barrier to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "barrier",
            "stacks": 28,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a11-astral-devourer-aid",
        "name": "Devourer's Renewal",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.29
      }
    ],
    "behaviorNotes": "Prioritizes Devourer's Renewal for badly wounded allies, maintains Barrier with Starless Communion in groups, and attacks with Consume Light when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-astral-devourer-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-astral-devourer-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "barrier"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-astral-devourer-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a11-seraphel-fallen-star": {
    "id": "enemy-a11-seraphel-fallen-star",
    "name": "Seraphel, the Fallen Star",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a11-seraphel-fallen-star.webp",
    "portraitUrl": "/assets/enemies/portraits/a11-seraphel-fallen-star.webp",
    "maxHp": 2384,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Arcane damage. Deals 45% more damage while you have Arcane Wound.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Seraphel, the Fallen Star begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "elemental_fury",
        "targetStatusDamageBonus": {
          "status": "arcaneWound",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a11-seraphel-fallen-star-phase",
        "name": "Supernova Heart",
        "description": "Below 40% Health, gains Enlightened for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a11-seraphel-fallen-star-basic",
        "name": "Falling-Star Spear",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "arcane",
        "spellPowerScaling": 1.56,
        "vfx": "elemental_fury"
      }
    ],
    "behaviorNotes": "Opens with Collapse the Heavens, converts Arcane Wound into Starfall Extinction, protects itself with Sovereign Recovery under pressure, and enters Supernova Heart below 40% Health. Falling-Star Spear prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#8c69c7",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a11-seraphel-fallen-star-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "enlightened"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-seraphel-fallen-star-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-seraphel-fallen-star-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "arcaneWound"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a11-seraphel-fallen-star-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "arcaneWound"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a11-seraphel-fallen-star-basic"
      ],
      "fallback": "ordered"
    }
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
        "description": "Deals steady Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-rootless-titan-stance",
        "name": "Continental Stance",
        "description": "Gains Guard and prepares to punish an exposed target.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "guard",
            "stacks": 28,
            "duration": 3
          }
        ],
        "vfx": "enemy_protect"
      },
      {
        "id": "enemy-ability-a12-rootless-titan-payoff",
        "name": "Faultline Verdict",
        "description": "A punishing blow used after taking a defensive stance.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.0500000000000003,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Uses Continental Stance once pressured, answers with Faultline Verdict while protected, and otherwise holds threat with Worldstone Blow.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-rootless-titan-payoff",
          "all": [
            {
              "type": "self_has_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-rootless-titan-stance",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.78
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-rootless-titan-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Pale Claw",
        "description": "Deals reliable Physical damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-pale-burrower-setup",
        "name": "Heartseeker Wound",
        "description": "Deals a lighter hit and applies Bleed for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "description": "A heavy attack that deals 52% more damage while you have Bleed.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "bleed",
          "multiplier": 1.52
        }
      }
    ],
    "behaviorNotes": "Sets up Bleed with Heartseeker Wound, converts it into burst damage with Burrowing Frenzy, and uses Pale Claw while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-pale-burrower-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "bleed"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-pale-burrower-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "bleed"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-pale-burrower-strike"
      ],
      "fallback": "ordered"
    }
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
        "name": "Sightless Word",
        "description": "Deals reliable Spell damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 1.6400000000000001,
        "vfx": "enemy_hex"
      },
      {
        "id": "enemy-ability-a12-deep-oracle-setup",
        "name": "Buried Revelation",
        "description": "Deals a lighter hit and applies Blind for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "description": "A heavy attack that deals 52% more damage while you have Blind.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "spell",
        "spellPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_natures_beam",
        "targetStatusDamageBonus": {
          "status": "blind",
          "multiplier": 1.52
        }
      }
    ],
    "behaviorNotes": "Sets up Blind with Buried Revelation, converts it into burst damage with Prophetic Chorus, and uses Sightless Word while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-deep-oracle-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "blind"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-deep-oracle-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "blind"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-deep-oracle-strike"
      ],
      "fallback": "ordered"
    }
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
        "description": "Deals reliable Fire damage.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "fire",
        "spellPowerScaling": 1.6400000000000001,
        "vfx": "fireball"
      },
      {
        "id": "enemy-ability-a12-worldvein-elemental-setup",
        "name": "Magma in the Blood",
        "description": "Deals a lighter hit and applies Burn for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 3,
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
        "name": "Mantle-Rift Pulse",
        "description": "A heavy attack that deals 52% more damage while you have Burn.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 0.65,
        "hits": 2,
        "vfx": "enemy_bite_claw",
        "targetStatusDamageBonus": {
          "status": "burn",
          "multiplier": 1.52
        }
      }
    ],
    "behaviorNotes": "Sets up Burn with Magma in the Blood, converts it into burst damage with Mantle-Rift Pulse, and uses Worldvein Fist while either tool is unavailable.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-worldvein-elemental-pressure",
          "all": [
            {
              "type": "player_has_status",
              "status": "burn"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-worldvein-elemental-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "burn"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-worldvein-elemental-strike"
      ],
      "fallback": "ordered"
    }
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
        "description": "A quick attack used while repositioning.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 1.6400000000000001,
        "vfx": "enemy_heavy_cleave"
      },
      {
        "id": "enemy-ability-a12-firstborn-shade-stance",
        "name": "Return to Nothing",
        "description": "Gains Stealth for 3 turns before attempting a decisive ambush.",
        "energyCost": 2,
        "cooldownTurns": 4,
        "range": "melee",
        "selfStatusApplications": [
          {
            "status": "stealth",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_quickstabber_stealth"
      },
      {
        "id": "enemy-ability-a12-firstborn-shade-ambush",
        "name": "First Murder",
        "description": "A high-damage ambush prepared through Return to Nothing.",
        "energyCost": 4,
        "cooldownTurns": 3,
        "range": "melee",
        "damageType": "physical",
        "physicalPowerScaling": 2.2140000000000004,
        "vfx": "enemy_heavy_cleave"
      }
    ],
    "behaviorNotes": "Enters Stealth with Return to Nothing, immediately looks for First Murder, then falls back to Before Memory.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-firstborn-shade-ambush",
          "all": [
            {
              "type": "self_has_status",
              "status": "stealth"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-firstborn-shade-stance",
          "all": [
            {
              "type": "self_missing_status",
              "status": "stealth"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-firstborn-shade-strike"
      ],
      "fallback": "ordered"
    }
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
        "cooldownTurns": 0,
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
        "name": "Choir Without End",
        "description": "Grants Enlightened to every living enemy for 3 turns.",
        "energyCost": 3,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_natures_beam",
        "friendlyTarget": "all_enemies",
        "friendlyStatusApplications": [
          {
            "status": "enlightened",
            "stacks": 1,
            "duration": 3
          }
        ]
      },
      {
        "id": "enemy-ability-a12-abyssal-choir-aid",
        "name": "Deep Refrain",
        "description": "Restores Health to the most wounded living enemy.",
        "energyCost": 4,
        "cooldownTurns": 4,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "vfx": "enemy_hex",
        "friendlyTarget": "lowest_health",
        "friendlyHealSpellPowerScaling": 1.33
      }
    ],
    "behaviorNotes": "Prioritizes Deep Refrain for badly wounded allies, maintains Enlightened with Choir Without End in groups, and attacks with Unraveling Hymn when support is unnecessary.",
    "behavior": "priority",
    "maxActionsPerTurn": 1,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-abyssal-choir-aid",
          "all": [
            {
              "type": "any_ally_hp_below",
              "ratio": 0.58
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-abyssal-choir-pressure",
          "all": [
            {
              "type": "living_allies_at_least",
              "count": 2
            },
            {
              "type": "any_ally_missing_status",
              "status": "enlightened"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-abyssal-choir-strike"
      ],
      "fallback": "ordered"
    }
  },
  "enemy-a12-eidolon-first-hunger": {
    "id": "enemy-a12-eidolon-first-hunger",
    "name": "Eidolon, the First Hunger",
    "title": "Adventure Boss",
    "imageUrl": "/assets/enemies/full/a12-eidolon-first-hunger.webp",
    "portraitUrl": "/assets/enemies/portraits/a12-eidolon-first-hunger.webp",
    "maxHp": 2959,
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
        "description": "Charges for one turn, then deals 260% Spell Power as Shadow damage. Deals 45% more damage while you have Vulnerable.",
        "energyCost": 7,
        "cooldownTurns": 5,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 2.6,
        "chargeTurns": 1,
        "chargeText": "Eidolon, the First Hunger begins preparing a devastating attack.",
        "chargeVfx": "enemy_impale_charge",
        "vfx": "enemy_hex",
        "targetStatusDamageBonus": {
          "status": "vulnerable",
          "multiplier": 1.45
        }
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
      },
      {
        "id": "enemy-ability-a12-eidolon-first-hunger-phase",
        "name": "Hunger Without End",
        "description": "Below 40% Health, gains Fierce for 3 turns and accelerates the final sequence.",
        "energyCost": 2,
        "cooldownTurns": 8,
        "range": "melee",
        "selfHealMaxHpRatio": 0.1,
        "selfStatusApplications": [
          {
            "status": "fierce",
            "stacks": 1,
            "duration": 3
          }
        ],
        "vfx": "enemy_spirit_heal"
      },
      {
        "id": "enemy-ability-a12-eidolon-first-hunger-basic",
        "name": "First Bite",
        "description": "A reliable attack used while the boss rebuilds its tactical sequence.",
        "energyCost": 2,
        "cooldownTurns": 0,
        "range": "ranged",
        "rangedPresentation": "projectile",
        "damageType": "shadow",
        "spellPowerScaling": 1.56,
        "vfx": "enemy_hex"
      }
    ],
    "behaviorNotes": "Opens with Unmake the Living, converts Vulnerable into The World Devours, protects itself with Sovereign Recovery under pressure, and enters Hunger Without End below 40% Health. First Bite prevents dead turns while key abilities recover.",
    "behavior": "priority",
    "maxActionsPerTurn": 2,
    "accent": "#b17a43",
    "ai": {
      "rules": [
        {
          "abilityId": "enemy-ability-a12-eidolon-first-hunger-phase",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.4
            },
            {
              "type": "self_missing_status",
              "status": "fierce"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-eidolon-first-hunger-recover",
          "all": [
            {
              "type": "self_hp_below",
              "ratio": 0.62
            },
            {
              "type": "self_missing_status",
              "status": "guard"
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-eidolon-first-hunger-execution",
          "all": [
            {
              "type": "player_has_status",
              "status": "vulnerable"
            },
            {
              "type": "energy_at_least",
              "amount": 7
            }
          ]
        },
        {
          "abilityId": "enemy-ability-a12-eidolon-first-hunger-setup",
          "all": [
            {
              "type": "player_missing_status",
              "status": "vulnerable"
            }
          ]
        }
      ],
      "fallbackAbilityIds": [
        "enemy-ability-a12-eidolon-first-hunger-basic"
      ],
      "fallback": "ordered"
    }
  }
};
