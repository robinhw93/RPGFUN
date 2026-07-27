import type { AdventureDefinition, AdventureEventDefinition, AdventureNode } from "../types";

export const ADVENTURE_EVENTS: Record<string, AdventureEventDefinition> = {
  "brokenFootbridge": {
    "id": "brokenFootbridge",
    "name": "Stalked by Wolves",
    "eyebrow": "Event",
    "description": "You hear rustling in the bushes behind you and realize that two wolves are stalking you.",
    "choices": [
      {
        "id": "climb",
        "label": "Climb a tree",
        "description": "You climb a tree and wait for them to leave.",
        "stat": "agility",
        "threshold": 29,
        "success": {
          "text": "You make it up the tree and wait for them to leave. You study the wolves' behavior and gain 10 experience.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "You fail to reach the tree before the wolves pounce.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxj4o6o-o45ia",
              "count": 2,
              "experience": 71,
              "gold": 5
            }
          ]
        },
        "resolution": "check"
      },
      {
        "id": "ford",
        "label": "Scare them off",
        "description": "You attempt to scare the wolves away by making yourself appear large and threatening.",
        "stat": "strength",
        "threshold": 31,
        "success": {
          "text": "The wolves flee. Renewed confidence surges through you. Start the next combat with Fierce.",
          "effects": [
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The wolves are not intimidated and leap at you.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxj4o6o-o45ia",
              "count": 2,
              "experience": 71,
              "gold": 5
            }
          ]
        },
        "resolution": "check"
      },
      {
        "id": "repair",
        "label": "Keep walking",
        "description": "You keep moving and attempt to hide your tracks and scent from the wolves.",
        "stat": "intelligence",
        "threshold": 34,
        "success": {
          "text": "After a while, the rustling fades. You have successfully evaded the wolves and gain 10 experience.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "While trying to lose the wolves, you become lost in the forest. Exhausted by the detour, you start the next combat with Weaken.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "weaken",
              "stacks": 1
            }
          ]
        },
        "resolution": "check"
      }
    ]
  },
  "event-ms09wn6n-fc1el": {
    "id": "event-ms09wn6n-fc1el",
    "name": "The Bear",
    "eyebrow": "Event",
    "description": "A large bear blocks the path ahead, tearing apart an abandoned supply pack. It raises its head, catches your scent, and begins moving toward you.",
    "choices": [
      {
        "id": "choice-ms09wn6n-dhrt3",
        "label": "Stand your ground",
        "description": "You make yourself appear larger and attempt to intimidate the bear.",
        "stat": "strength",
        "threshold": 40,
        "success": {
          "text": "You hold your ground and roar at the approaching beast. After a tense moment, the bear retreats. You loot the abandoned supply pack and find 10 gold.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "The bear ignores your display and charges.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxkar5z-g9o5d",
              "count": 1,
              "experience": 60,
              "gold": 10
            }
          ]
        },
        "resolution": "check"
      },
      {
        "id": "choice-ms09wn6n-5g5q9",
        "label": "Back away slowly",
        "description": "You carefully retreat without making any sudden movements.",
        "stat": "agility",
        "threshold": 40,
        "success": {
          "text": "You quietly retreat into the forest before the bear decides to follow. ",
          "effects": []
        },
        "failure": {
          "text": "A branch snaps beneath your foot. Startled by the sound, the bear charges.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxkar5z-g9o5d",
              "count": 1,
              "experience": 60,
              "gold": 10
            }
          ]
        },
        "resolution": "check"
      },
      {
        "id": "choice-ms0a2ia7-xtn9h",
        "label": "Create a distraction",
        "description": "You search your surroundings for a way to draw the bear away from the path.",
        "stat": "intelligence",
        "threshold": 40,
        "success": {
          "text": "You throw a bundle of berries into the undergrowth. The bear follows the scent, allowing you to safely search the abandoned pack. Gain 10 gold.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "Your distraction only makes the bear more agitated. You escape, but the exhausting detour leaves you weakened. Start the next combat with Weaken.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "weaken",
              "stacks": 1
            }
          ]
        },
        "resolution": "check"
      }
    ]
  },
  "event-ms0a5n8e-edxqw": {
    "id": "event-ms0a5n8e-edxqw",
    "name": "Colorful Berries",
    "eyebrow": "Event",
    "description": "You come across a small field with several berry bushes, all holding different colored berries.",
    "choices": [
      {
        "id": "choice-ms0a5n8e-ez6ny",
        "label": "Pick som berries and save them for later",
        "description": "",
        "stat": "intelligence",
        "threshold": 10,
        "success": {
          "text": "You recognize the yellow berries as Yumberries. However, only one seem to be ripe. Gain one Yumberry.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e3hjh-5bewd"
            }
          ]
        },
        "failure": {
          "text": "You pick the berries. However, you only manage to pick unripe berries. You throw them away.",
          "effects": []
        },
        "resolution": "check"
      },
      {
        "id": "choice-ms0a5n8e-2o5a0",
        "label": "Pick som berries and eat them",
        "description": "",
        "stat": "intelligence",
        "threshold": 10,
        "success": {
          "text": "You recognize the red berries as Bloodberries, knowing they will heal your wounds you eat them. You heal for 10 hit points.",
          "effects": [
            {
              "type": "heal",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "You do not recognize that the blue berries are poisonous, and eat one. Start next combat with one stack of poison.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "poison",
              "stacks": 1
            }
          ]
        },
        "resolution": "check"
      }
    ]
  },
  "event-ms0fcwdx-59e9n": {
    "id": "event-ms0fcwdx-59e9n",
    "name": "Wandering Merchant",
    "eyebrow": "Encounter",
    "description": "A weathered merchant waits beside the road, their pack opened to reveal a collection of wares.",
    "choices": [
      {
        "id": "choice-ms0fcwdx-ks00n",
        "label": "Browse the wares",
        "description": "You step closer and inspect the merchant's goods.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "The merchant opens their pack and names a price for each item.",
          "effects": [
            {
              "type": "openMerchant",
              "itemIds": [
                "consumable-ms0e551z-v6qcf",
                "gear-ms0hgg09-w6afk",
                "gear-ms0hdxb1-bxamd",
                "gear-ms0hf0m3-j3pcx",
                "gear-ms0hb5cw-j14wj",
                "gear-ms0hfvkg-yni9w"
              ]
            }
          ]
        }
      },
      {
        "id": "choice-ms0fcwdx-gqv3k",
        "label": "Continue on your way",
        "description": "You politely decline and continue your journey.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "The merchant nods and wishes you safe travels.",
          "effects": []
        }
      }
    ]
  },
  "event-ms1y6yxt-vo5e7": {
    "id": "event-ms1y6yxt-vo5e7",
    "name": "Highlands Merchant",
    "eyebrow": "Roadside Encounter",
    "description": "A weathered merchant waits beside the road, their pack opened to reveal an unusual collection of wares.",
    "choices": [
      {
        "id": "choice-ms1y6yxt-q5hwn",
        "label": "Browse the wares",
        "description": "You step closer and inspect the merchant's goods.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "The merchant opens their pack and names a price for each item.",
          "effects": [
            {
              "type": "openMerchant",
              "itemIds": [
                "consumable-ms0e551z-v6qcf",
                "item-ms0ss0dt-z4bke",
                "gear-ms1i1671-yxsnp",
                "gear-ms1iccqm-4yu0n",
                "item-ms1if1q6-746wi"
              ]
            }
          ]
        }
      },
      {
        "id": "choice-ms1y6yxt-wvztr",
        "label": "Continue on your way",
        "description": "You politely decline and continue your journey.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "The merchant nods and wishes you safe travels.",
          "effects": []
        }
      }
    ]
  },
  "event-ms1ybqwt-acjc1": {
    "id": "event-ms1ybqwt-acjc1",
    "name": "Large Goblin Patrol",
    "eyebrow": "Event",
    "description": "You spot a large Goblin patrol in the distance. They appear to be carrying a whole lot of loot with them.",
    "choices": [
      {
        "id": "choice-ms1ybqwt-18k9h",
        "label": "Rush to attack them",
        "description": "You rush towards the Goblin patrol, aiming to steal their loot.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 75,
        "success": {
          "text": "The appear intimidated enough to drop their loot ant run away.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e3hjh-5bewd"
            },
            {
              "type": "gainItem",
              "itemId": "item-ms0ss0dt-z4bke"
            },
            {
              "type": "gainGold",
              "amount": 30
            },
            {
              "type": "gainItem",
              "itemId": "gear-ms1i5k37-1rg9d"
            }
          ]
        },
        "failure": {
          "text": "They hold their ground.",
          "effects": [
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-ms1ej4re-xskqn",
              "count": 3,
              "experience": 121,
              "gold": 40
            }
          ]
        }
      },
      {
        "id": "choice-ms1ybqwt-cofqe",
        "label": "Avoid them",
        "description": "You avoid them, taking no action.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "They disappear behind the hills. You take the opportunity to rest. Heal 15 hit points.",
          "effects": [
            {
              "type": "heal",
              "amount": 15
            }
          ]
        }
      },
      {
        "id": "choice-ms1ykz7y-06wto",
        "label": "Sneak up and steal their loot",
        "description": "You sneak up to steal their loot.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 60,
        "success": {
          "text": "You manage to sneak up and steal some loot without them noticing you.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 35
            },
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e3hjh-5bewd"
            },
            {
              "type": "gainItem",
              "itemId": "gear-ms1i5k37-1rg9d"
            },
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e551z-v6qcf"
            },
            {
              "type": "gainItem",
              "itemId": "item-ms0ss0dt-z4bke"
            }
          ]
        },
        "failure": {
          "text": "The party of Goblins spot you and immediately fire their arrows at you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 5
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-ms1ej4re-xskqn",
              "count": 3,
              "experience": 121,
              "gold": 40
            }
          ]
        }
      }
    ]
  },
  "event-ms1yon2h-jsp3u": {
    "id": "event-ms1yon2h-jsp3u",
    "name": "The Collapsed Watchtower",
    "eyebrow": "Event",
    "description": "An old stone watchtower has collapsed across the path. From beneath the rubble, you hear someone calling for help.",
    "choices": [
      {
        "id": "choice-ms1yon2h-uzfgf",
        "label": "Lift the rubble",
        "description": "You try your best to lift the rubble to free whoever is buried under it.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 50,
        "success": {
          "text": "You rescue a wounded scout. Gain  40 experience and start the next combat with Strengthened.",
          "effects": [
            {
              "type": "playerNextCombatBuff",
              "status": "strengthened",
              "stacks": 1
            },
            {
              "type": "gainExperience",
              "amount": 40
            }
          ]
        },
        "failure": {
          "text": "The stones shift and crush your leg. Lose 5 health and start the next combat with Slowed.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 5
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "slowed",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-ms1yon2h-o0mry",
        "label": "Try to find leverage to move the rubble",
        "description": "You try to find another way to move the rubble.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 40,
        "success": {
          "text": "Discover a narrow entrance and recover an old Highlands supply cache. Gain 20 gold and a Minor Healing Potion.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e551z-v6qcf"
            },
            {
              "type": "gainGold",
              "amount": 20
            }
          ]
        },
        "failure": {
          "text": "The unstable tower collapses further and crushed your wrist. Lose 5 health and start next combat Weakened.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 5
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "weaken",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-ms1z1d7w-5ax9w",
        "label": "Ignore the voice and move on",
        "description": "You continue around the watchtower.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "You hear the voice die down as you put some distance between you and the watchtower.",
          "effects": []
        }
      }
    ]
  },
  "event-ms1z44mq-1gm1y": {
    "id": "event-ms1z44mq-1gm1y",
    "name": "Goblin Toll Bridge",
    "eyebrow": "Event",
    "description": "A crude wooden bridge spans a deep ravine. Several Goblins block the way and demand payment. 25 gold should be enough.",
    "choices": [
      {
        "id": "choice-ms1z44mq-rpe1m",
        "label": "Pay the toll",
        "description": "You pay the toll.",
        "resolution": "direct",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "Success.",
          "effects": []
        },
        "failure": {
          "text": "Failure.",
          "effects": []
        },
        "outcome": {
          "text": "You lose 25 gold, and cross safely.",
          "effects": [
            {
              "type": "loseGold",
              "amount": 25
            }
          ]
        }
      },
      {
        "id": "choice-ms1z44mq-0fn2p",
        "label": "Threaten them",
        "description": "",
        "resolution": "check",
        "stat": "strength",
        "threshold": 50,
        "success": {
          "text": "The Goblins flee and leave behind some of their loot.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 25
            },
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e551z-v6qcf"
            }
          ]
        },
        "failure": {
          "text": "The Goblins attack you.",
          "effects": [
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-ms1ej4re-xskqn",
              "count": 3,
              "experience": 121,
              "gold": 30
            }
          ]
        }
      },
      {
        "id": "choice-ms1z7y0u-nze5l",
        "label": "Sneak beneath the bridge",
        "description": "You try to sneak beneath the bridge, climbing your way to the other side.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 60,
        "success": {
          "text": "You even find a Goblin supply bag that you manage to snag.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 20
            },
            {
              "type": "gainItem",
              "itemId": "consumable-ms0e3hjh-5bewd"
            }
          ]
        },
        "failure": {
          "text": "The Goblins spot you and fire arrows at you. You fall down the ravine, and take 25 damage. Start next combat with Exhausted, as you have to walk all the way up the ravine.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 25
            }
          ]
        }
      }
    ]
  },
  "event-highfall-sheltered-spring": {
    "id": "event-highfall-sheltered-spring",
    "name": "The Sheltered Spring",
    "eyebrow": "Mountain Refuge",
    "description": "Warm water bubbles from the rock beneath an abandoned climber's shelter. A weathered satchel hangs beside the spring.",
    "choices": [
      {
        "id": "choice-highfall-drink-spring",
        "label": "Rest beside the spring",
        "description": "Drink the warm water and let the shelter break the mountain wind.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": { "text": "You rest until warmth returns to your limbs.", "effects": [] },
        "failure": { "text": "You rest until warmth returns to your limbs.", "effects": [] },
        "outcome": {
          "text": "You rest until warmth returns to your limbs. Restore 30 Health.",
          "effects": [{ "type": "heal", "amount": 30 }]
        }
      },
      {
        "id": "choice-highfall-search-satchel",
        "label": "Search the satchel",
        "description": "Look through the abandoned climbing supplies for anything useful.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 30,
        "success": {
          "text": "A sealed Highfall Restorative remains tucked beneath a roll of bandages.",
          "effects": [{ "type": "gainItem", "itemId": "consumable-highfall-restorative" }]
        },
        "failure": {
          "text": "The satchel contains only ruined bandages, but the sheltered pause still restores 10 Health.",
          "effects": [{ "type": "heal", "amount": 10 }]
        }
      },
      {
        "id": "choice-highfall-harvest-frostroot",
        "label": "Gather frostroot",
        "description": "Carefully cut a pale root growing beside the warm stones.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 35,
        "success": {
          "text": "You recognize Highfall Frostroot and harvest it without damaging the valuable core.",
          "effects": [{ "type": "gainItem", "itemId": "item-highfall-frostroot" }, { "type": "gainExperience", "amount": 20 }]
        },
        "failure": {
          "text": "The brittle root crumbles in your hands, but the spring water restores 10 Health.",
          "effects": [{ "type": "heal", "amount": 10 }]
        }
      }
    ]
  },
  "event-highfall-stormbound-camp": {
    "id": "event-highfall-stormbound-camp",
    "name": "Stormbound Camp",
    "eyebrow": "Abandoned Camp",
    "description": "A sudden snow squall forces you into a deserted bandit camp. One tent still stands, and a medic's crate is wedged beneath its cot.",
    "choices": [
      {
        "id": "choice-highfall-sleep-camp",
        "label": "Wait out the storm",
        "description": "Secure the tent, wrap yourself in the dry blankets, and recover.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": { "text": "The storm passes while you recover.", "effects": [] },
        "failure": { "text": "The storm passes while you recover.", "effects": [] },
        "outcome": {
          "text": "The storm passes while you recover beneath the heavy blankets. Restore 25 Health.",
          "effects": [{ "type": "heal", "amount": 25 }]
        }
      },
      {
        "id": "choice-highfall-open-medics-crate",
        "label": "Open the medic's crate",
        "description": "Work the frozen latch without shattering the bottles inside.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 30,
        "success": {
          "text": "The latch yields. A Stonebloom Draught survived the camp's abandonment.",
          "effects": [{ "type": "gainItem", "itemId": "consumable-stonebloom-draught" }]
        },
        "failure": {
          "text": "The latch snaps and the bottles spill, but one Highfall Restorative remains intact.",
          "effects": [{ "type": "gainItem", "itemId": "consumable-highfall-restorative" }]
        }
      },
      {
        "id": "choice-highfall-light-stove",
        "label": "Light the iron stove",
        "description": "Repair the stove and brew the frostroot left beside it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 35,
        "success": {
          "text": "The bitter brew restores 20 Health and leaves you Strengthened for the next combat.",
          "effects": [{ "type": "heal", "amount": 20 }, { "type": "playerNextCombatBuff", "status": "strengthened", "stacks": 1 }]
        },
        "failure": {
          "text": "Smoke fills the tent before the stove catches. Restore 10 Health, but begin the next combat Exhausted.",
          "effects": [{ "type": "heal", "amount": 10 }, { "type": "playerNextCombatDebuff", "status": "exhausted", "stacks": 1 }]
        }
      }
    ]
  },
  "event-highfall-frozen-cairn": {
    "id": "event-highfall-frozen-cairn",
    "name": "The Frozen Cairn",
    "eyebrow": "Ancient Memorial",
    "description": "An old cairn rises above the snow. Silver runes circle a sealed niche while offerings lie frozen between the stones.",
    "choices": [
      {
        "id": "choice-highfall-read-cairn",
        "label": "Read the warding runes",
        "description": "Trace the old markings and attempt to open the sealed niche correctly.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 65,
        "success": {
          "text": "The wards fade without resistance. Inside rests the Cairnkeeper's Loop.",
          "effects": [{ "type": "gainItem", "itemId": "gear-cairnkeepers-loop" }, { "type": "gainExperience", "amount": 45 }]
        },
        "failure": {
          "text": "The runes flare with bitter cold. Lose 15 Health and begin the next combat Slowed.",
          "effects": [{ "type": "loseHealth", "amount": 15 }, { "type": "playerNextCombatDebuff", "status": "slowed", "stacks": 1 }]
        }
      },
      {
        "id": "choice-highfall-search-offerings",
        "label": "Search the offerings",
        "description": "Look for something useful without disturbing the sealed niche.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 50,
        "success": {
          "text": "You uncover a preserved bundle of Highfall Frostroot and 30 Gold.",
          "effects": [{ "type": "gainItem", "itemId": "item-highfall-frostroot" }, { "type": "gainGold", "amount": 30 }]
        },
        "failure": {
          "text": "Loose stones tumble onto your hands. Lose 10 Health.",
          "effects": [{ "type": "loseHealth", "amount": 10 }]
        }
      },
      {
        "id": "choice-highfall-honor-cairn",
        "label": "Honor the fallen",
        "description": "Leave the cairn untouched and take a moment to remember the dead.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": { "text": "You leave the cairn undisturbed.", "effects": [] },
        "failure": { "text": "You leave the cairn undisturbed.", "effects": [] },
        "outcome": {
          "text": "The quiet ritual steels your resolve. Begin the next combat with Fierce.",
          "effects": [{ "type": "playerNextCombatBuff", "status": "fierce", "stacks": 1 }]
        }
      }
    ]
  },
  "event-highfall-merchant": {
    "id": "event-highfall-merchant",
    "name": "Highfall Merchant",
    "eyebrow": "Last Trading Post",
    "description": "A fur-wrapped merchant has anchored a bright red tent beside the final ascent. Their shelves hold remedies, relics, and weapons claimed from the mountain clans.",
    "choices": [
      {
        "id": "choice-highfall-browse-merchant",
        "label": "Browse the wares",
        "description": "Inspect the merchant's carefully secured mountain stock.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": { "text": "The merchant opens the mountain stock.", "effects": [] },
        "failure": { "text": "The merchant opens the mountain stock.", "effects": [] },
        "outcome": {
          "text": "The Highfall Merchant names a price for each hard-won item.",
          "effects": [{
            "type": "openMerchant",
            "itemIds": [
              "consumable-highfall-restorative",
              "consumable-stonebloom-draught",
              "item-highfall-frostroot",
              "gear-cairnkeepers-loop",
              "gear-ms30095w-ci3mw",
              "gear-ms3054kn-cs3uu",
              "gear-ms307fr5-vebz0"
            ]
          }]
        }
      },
      {
        "id": "choice-highfall-leave-merchant",
        "label": "Continue to the summit",
        "description": "Save your Gold and begin the final climb.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": { "text": "You leave the trading post behind.", "effects": [] },
        "failure": { "text": "You leave the trading post behind.", "effects": [] },
        "outcome": { "text": "The merchant wishes you luck against the king above.", "effects": [] }
      }
    ]
  }
};

export const ADVENTURES: AdventureDefinition[] = [
  {
    "id": "windsong-forest",
    "name": "Windsong Forest",
    "description": "Sunlit paths wind beneath whispering boughs, but something has driven the forest's gentler creatures into a restless fury.",
    "recommendedLevel": 1,
    "theme": "windsong_forest",
    "travelText": "Walking beneath the Windsong canopy",
    "completionTitle": "The Forest Breathes Again",
    "completionDescription": "The Forest Spirit fades into green-gold light. Wind returns to the bright canopy, carrying birdsong deeper into Arkenfall.",
    "stages": [
      {
        "id": "forest-edge",
        "name": "Forest Edge",
        "entries": [
          {
            "id": "rat-pack",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Forest Encounter",
            "title": "Rustling in the Clover",
            "description": "Two rabid rats burst from the sunlit undergrowth and close around the path.",
            "enemyIds": [
              "enemy-mrxiut2a-k4kgv",
              "enemy-mrxiut2a-k4kgv"
            ],
            "reward": {
              "experience": 55,
              "gold": 3
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-ms0l8elz-4jlgf",
            "chance": 10
          }
        ]
      },
      {
        "id": "green-hollows",
        "name": "Wayfarer’s Trail",
        "entries": [
          {
            "id": "restless-grove",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Prowling Ambush",
            "description": "A wolf prowls beneath a hovering spark of green-gold light.",
            "enemyIds": [
              "enemy-mrxj4o6o-o45ia"
            ],
            "reward": {
              "experience": 61,
              "gold": 8
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "stage-ms0g6ytl-npsqz",
        "name": "Thick Forest",
        "entries": [
          {
            "id": "entry-ms0g7l0n-0wh3g",
            "type": "event",
            "chance": 40,
            "eyebrow": "Event",
            "title": "Stalked by Wolves",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "brokenFootbridge"
          },
          {
            "id": "entry-ms0g7ugd-62z5x",
            "type": "combat",
            "chance": 20,
            "eyebrow": "Encounter",
            "title": "New Encounter",
            "description": "",
            "enemyIds": [
              "enemy-mrxkar5z-g9o5d"
            ],
            "reward": {
              "experience": 78,
              "gold": 8
            }
          },
          {
            "id": "entry-ms0ga8eg-rh7it",
            "type": "event",
            "chance": 40,
            "eyebrow": "Event",
            "title": "The Bear",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms09wn6n-fc1el"
          }
        ],
        "dropTable": []
      },
      {
        "id": "grey-stones",
        "name": "Mossy Cliffs",
        "entries": [
          {
            "id": "skittering-rats",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Skittering Rats",
            "description": "The ground skitters with Rabid Rats.",
            "enemyIds": [
              "enemy-mrxiut2a-k4kgv",
              "enemy-mrxiut2a-k4kgv",
              "enemy-mrxiut2a-k4kgv"
            ],
            "reward": {
              "experience": 65,
              "gold": 6
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "stage-mrxmqkyi-ydjnl",
        "name": "Forest Trail",
        "entries": [
          {
            "id": "entry-ms0fhna2-oardr",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "Wandering Merchant",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms0fcwdx-59e9n"
          }
        ],
        "dropTable": []
      },
      {
        "id": "heartwood",
        "name": "Forest Depths",
        "entries": [
          {
            "id": "unwelcome-guest",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Unwelcome Guest",
            "description": "The spirits does not welcome you here.",
            "enemyIds": [
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 49,
              "gold": 5
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "stage-ms0gnkm4-owxuv",
        "name": "Dense Forest",
        "entries": [
          {
            "id": "entry-ms0gouar-8xska",
            "type": "event",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Berries",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms0a5n8e-edxqw"
          }
        ],
        "dropTable": []
      },
      {
        "id": "stage-ms0g414a-fb7aj",
        "name": "Dark Forest",
        "entries": [
          {
            "id": "entry-ms0g4qch-7ruaf",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Angry Spirits",
            "title": "Dark Forest",
            "description": "Several Wisps appears in the dark forest.",
            "enemyIds": [
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 63,
              "gold": 13
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "stage-mrxmt15g-yejb8",
        "name": "The Clearing",
        "entries": [
          {
            "id": "entry-mrxmt2e5-ktr16",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "The Forest Spirit",
            "description": "Before you, it rises, the thing that enrages the woodland animals; The Forest Spirit.",
            "enemyIds": [
              "enemy-mrxkjqs3-g7g5i",
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 168,
              "gold": 28
            }
          }
        ],
        "dropTable": []
      }
    ]
  },
  {
    "id": "adventure-ms1iq9ye-9ra1z",
    "name": "Arkenfall Highlands",
    "description": "The highlands streches for miles and miles, infested with Goblins ruled by the chieftain known as Striz.",
    "recommendedLevel": 4,
    "theme": "arkenfall_highlands",
    "travelText": "Crossing the windswept highlands",
    "stages": [
      {
        "id": "stage-ms1iq9ye-es158",
        "name": "Entering the Highlands",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1irz0u-trygd",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "You are spotted by a Goblin patrol.",
            "enemyIds": [
              "enemy-ms1ej4re-xskqn",
              "enemy-mrxj4o6o-o45ia"
            ],
            "reward": {
              "experience": 81,
              "gold": 8
            }
          }
        ]
      },
      {
        "id": "stage-ms1y476n-bw43b",
        "name": "Stage 2",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1y4ato-jjckb",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "New Encounter",
            "description": "Ambushed!",
            "enemyIds": [
              "enemy-ms1fgqar-mafv9"
            ],
            "reward": {
              "experience": 95,
              "gold": 8
            }
          }
        ]
      },
      {
        "id": "stage-ms1y5l68-i7cx5",
        "name": "Stage 3",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zgeqo-6zaef",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "Event",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms1yon2h-jsp3u"
          }
        ]
      },
      {
        "id": "stage-ms1zh2u8-uvw3a",
        "name": "Stage 4",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zh6zk-dl7ak",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "You encounter a Goblin patrol!",
            "enemyIds": [
              "enemy-ms1ej4re-xskqn",
              "enemy-ms1fnbla-fs4ul",
              "enemy-ms1fgqar-mafv9"
            ],
            "reward": {
              "experience": 121,
              "gold": 16
            }
          },
          {
            "id": "entry-ms1zj3e2-ocyoy",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "You encounter a Goblin patrol!",
            "enemyIds": [
              "enemy-ms1ftdlw-jz5lo",
              "enemy-ms1fnbla-fs4ul",
              "enemy-ms1fnbla-fs4ul"
            ],
            "reward": {
              "experience": 121,
              "gold": 16
            }
          }
        ]
      },
      {
        "id": "stage-ms1zkjvu-sm5ax",
        "name": "Stage 5",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zkm66-u4zio",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "Event",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms1y6yxt-vo5e7"
          }
        ]
      },
      {
        "id": "stage-ms1zl1tn-yos60",
        "name": "Stage 6",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zl3s8-p5lr7",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "The ground shake as two big Goblins rushes towards you.",
            "enemyIds": [
              "enemy-ms1ftdlw-jz5lo",
              "enemy-ms1ftdlw-jz5lo"
            ],
            "reward": {
              "experience": 88,
              "gold": 12
            }
          }
        ]
      },
      {
        "id": "stage-ms1zm790-xlryz",
        "name": "Stage 7",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zm95a-k579n",
            "type": "event",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "New Encounter",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms1z44mq-1gm1y"
          }
        ]
      },
      {
        "id": "stage-ms1zn6ne-h7evo",
        "name": "Stage 8",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zn94q-vhcxj",
            "type": "event",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "New Encounter",
            "description": "",
            "reward": {
              "experience": 50,
              "gold": 8
            },
            "eventId": "event-ms1ybqwt-acjc1"
          },
          {
            "id": "entry-ms1zniqr-s8tcl",
            "type": "combat",
            "chance": 25,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "You encounter a large Goblin patrol.",
            "enemyIds": [
              "enemy-ms1ej4re-xskqn",
              "enemy-ms1ej4re-xskqn",
              "enemy-ms1fnbla-fs4ul"
            ],
            "reward": {
              "experience": 111,
              "gold": 16
            }
          },
          {
            "id": "entry-ms1zolyk-hsl65",
            "type": "combat",
            "chance": 25,
            "eyebrow": "Encounter",
            "title": "Encounter",
            "description": "You encounter a large Goblin patrol.",
            "enemyIds": [
              "enemy-ms1fnbla-fs4ul",
              "enemy-ms1fnbla-fs4ul",
              "enemy-ms1fgqar-mafv9"
            ],
            "reward": {
              "experience": 111,
              "gold": 16
            }
          }
        ]
      },
      {
        "id": "stage-ms1zpl88-6zwg9",
        "name": "Stage 9",
        "dropTable": [],
        "entries": [
          {
            "id": "entry-ms1zps8u-mlw66",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss",
            "title": "Boss",
            "description": "",
            "enemyIds": [
              "enemy-ms1ftdlw-jz5lo",
              "enemy-ms1fykbj-rhb65",
              "enemy-ms1fnbla-fs4ul"
            ],
            "reward": {
              "experience": 215,
              "gold": 85
            }
          }
        ]
      }
    ],
    "completionTitle": "Adventure Complete",
    "completionDescription": "The Goblin Chieftain lie dead in the grass, the Highlands safe once more.",
    "prerequisiteAdventureId": "windsong-forest"
  },
  {
    "id": "highfall-mountains",
    "name": "Highfall Mountains",
    "description": "Climb a lawless mountain pass claimed by trolls and bandits, where every narrow ledge leads closer to the self-crowned king of Highfall.",
    "recommendedLevel": 8,
    "theme": "highfall_mountains",
    "travelText": "Climbing into the Highfall Mountains",
    "stages": [
      {
        "id": "highfall-stage-1-lower-pass",
        "name": "The Lower Pass",
        "dropTable": [{ "itemId": "item-highfall-frostroot", "chance": 15 }],
        "entries": [{
          "id": "highfall-entry-1-bandit-toll",
          "type": "combat",
          "chance": 100,
          "eyebrow": "Encounter",
          "title": "The Bandit's Toll",
          "description": "An enforcer blocks the narrow trail while a trapper takes position above the road.",
          "enemyIds": ["enemy-ms2wk1ul-6ol9b", "enemy-ms2wuk5j-1ddqa"],
          "reward": { "experience": 145, "gold": 22 }
        }]
      },
      {
        "id": "highfall-stage-2-sheltered-spring",
        "name": "The Sheltered Spring",
        "dropTable": [],
        "entries": [{
          "id": "highfall-entry-2-sheltered-spring",
          "type": "event",
          "chance": 100,
          "eyebrow": "Mountain Refuge",
          "title": "The Sheltered Spring",
          "description": "Warm water and an abandoned shelter offer a rare chance to recover.",
          "eventId": "event-highfall-sheltered-spring"
        }]
      },
      {
        "id": "highfall-stage-3-troll-country",
        "name": "Troll Country",
        "dropTable": [{ "itemId": "consumable-highfall-restorative", "chance": 8 }],
        "entries": [{
          "id": "highfall-entry-3-hill-troll",
          "type": "combat",
          "chance": 100,
          "eyebrow": "Encounter",
          "title": "Troll Country",
          "description": "A Hill Troll rises from a nest of broken carts and blocks the climb.",
          "enemyIds": ["enemy-ms2vrqbb-8r5ux"],
          "reward": { "experience": 135, "gold": 20 }
        }]
      },
      {
        "id": "highfall-stage-4-cliffside-ambush",
        "name": "Cliffside Ambush",
        "dropTable": [{ "itemId": "item-highfall-frostroot", "chance": 20 }],
        "entries": [
          {
            "id": "highfall-entry-4-crossfire",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Cliffside Crossfire",
            "description": "A bandit enforcer rushes you while an archer fires from a shelf of stone.",
            "enemyIds": ["enemy-ms2wk1ul-6ol9b", "enemy-ms2wuk5j-1ddqa"],
            "reward": { "experience": 155, "gold": 28 }
          },
          {
            "id": "highfall-entry-4-trappers",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Tripwire Alley",
            "description": "Two trappers spring their ambush from opposite sides of the ravine.",
            "enemyIds": ["enemy-ms2wuk5j-1ddqa", "enemy-ms2wuk5j-1ddqa"],
            "reward": { "experience": 165, "gold": 30 }
          }
        ]
      },
      {
        "id": "highfall-stage-5-broken-causeway",
        "name": "The Broken Causeway",
        "dropTable": [{ "itemId": "consumable-highfall-restorative", "chance": 10 }],
        "entries": [
          {
            "id": "highfall-entry-5-hill-troll",
            "type": "combat",
            "chance": 90,
            "eyebrow": "Encounter",
            "title": "The Broken Causeway",
            "description": "A hungry Hill Troll prowls between the shattered bridge pillars.",
            "enemyIds": ["enemy-ms2vrqbb-8r5ux"],
            "reward": { "experience": 140, "gold": 22 }
          },
          {
            "id": "highfall-entry-5-loot-goblin",
            "type": "combat",
            "chance": 10,
            "eyebrow": "Rare Encounter",
            "title": "A Goblin and Its Bodyguard",
            "description": "A loot-laden goblin scrambles behind a Hill Troll and urges the brute into your path.",
            "enemyIds": ["enemy-ms2vrqbb-8r5ux", "enemy-ms2wqzxv-srsgs"],
            "reward": { "experience": 190, "gold": 40 }
          }
        ]
      },
      {
        "id": "highfall-stage-6-stormbound-camp",
        "name": "Stormbound Camp",
        "dropTable": [],
        "entries": [{
          "id": "highfall-entry-6-stormbound-camp",
          "type": "event",
          "chance": 100,
          "eyebrow": "Abandoned Camp",
          "title": "Stormbound Camp",
          "description": "A snow squall drives you into a deserted camp stocked with old medical supplies.",
          "eventId": "event-highfall-stormbound-camp"
        }]
      },
      {
        "id": "highfall-stage-7-high-slopes",
        "name": "The High Slopes",
        "dropTable": [{ "itemId": "consumable-stonebloom-draught", "chance": 10 }],
        "entries": [
          {
            "id": "highfall-entry-7-mountain-troll",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "The Mountain Stirs",
            "description": "A Mountain Troll tears itself free from the snow-covered rocks.",
            "enemyIds": ["enemy-ms2w17p6-txpmq"],
            "reward": { "experience": 180, "gold": 32 }
          },
          {
            "id": "highfall-entry-7-troll-rites",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Encounter",
            "title": "Rites of the High Slopes",
            "description": "A Hill Troll Shaman chants behind a towering Mountain Troll.",
            "enemyIds": ["enemy-ms2w17p6-txpmq", "enemy-ms2w93yt-v817a"],
            "reward": { "experience": 260, "gold": 48 }
          }
        ]
      },
      {
        "id": "highfall-stage-8-frozen-cairn",
        "name": "The Frozen Cairn",
        "dropTable": [],
        "entries": [{
          "id": "highfall-entry-8-frozen-cairn",
          "type": "event",
          "chance": 100,
          "eyebrow": "Ancient Memorial",
          "title": "The Frozen Cairn",
          "description": "Old warding runes protect a memorial above the clouds.",
          "eventId": "event-highfall-frozen-cairn"
        }]
      },
      {
        "id": "highfall-stage-9-merchant",
        "name": "The Last Trading Post",
        "dropTable": [],
        "entries": [{
          "id": "highfall-entry-9-merchant",
          "type": "event",
          "chance": 100,
          "eyebrow": "Last Trading Post",
          "title": "Highfall Merchant",
          "description": "A stubborn merchant keeps one final trading post beneath the summit.",
          "eventId": "event-highfall-merchant"
        }]
      },
      {
        "id": "highfall-stage-10-kings-guard",
        "name": "The King's Guard",
        "dropTable": [{ "itemId": "gear-cairnkeepers-loop", "chance": 5 }],
        "entries": [
          {
            "id": "highfall-entry-10-troll-guard",
            "type": "combat",
            "chance": 60,
            "eyebrow": "Encounter",
            "title": "The King's Trolls",
            "description": "A Mountain Troll and its shaman guard the only path to the crown.",
            "enemyIds": ["enemy-ms2w17p6-txpmq", "enemy-ms2w93yt-v817a"],
            "reward": { "experience": 270, "gold": 55 }
          },
          {
            "id": "highfall-entry-10-bandit-guard",
            "type": "combat",
            "chance": 40,
            "eyebrow": "Encounter",
            "title": "The King's Cutthroats",
            "description": "Klaus's most loyal bandits close ranks across the summit trail.",
            "enemyIds": ["enemy-ms2wk1ul-6ol9b", "enemy-ms2wuk5j-1ddqa", "enemy-ms2wuk5j-1ddqa"],
            "reward": { "experience": 250, "gold": 60 }
          }
        ]
      },
      {
        "id": "highfall-stage-11-bandit-king",
        "name": "The Crown of Highfall",
        "dropTable": [
          { "itemId": "gear-cairnkeepers-loop", "chance": 20 },
          { "itemId": "consumable-stonebloom-draught", "chance": 35 }
        ],
        "entries": [{
          "id": "highfall-entry-11-klaus",
          "type": "boss",
          "chance": 100,
          "eyebrow": "Boss",
          "title": "Troll Bandit King, Klaus",
          "description": "At the mountain's crown, Klaus waits among stolen banners and broken thrones.",
          "enemyIds": ["enemy-ms2xaper-z7o3g"],
          "reward": { "experience": 420, "gold": 140 }
        }]
      }
    ],
    "completionTitle": "The Crown Falls",
    "completionDescription": "Klaus lies defeated and the stolen banners fall silent in the mountain wind. The Highfall pass is open once more.",
    "prerequisiteAdventureId": "adventure-ms1iq9ye-9ra1z"
  }
];

export const ENDLESS_ADVENTURE: AdventureNode = {
  id: "shadow-proving-grounds",
  type: "combat",
  eyebrow: "Endless Training",
  title: "Shadow Proving Grounds",
  description: "Test your Shadow build against an endless sequence of training constructs.",
  enemies: ["dummy", "dummy"],
};
