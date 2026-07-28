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
        "success": {
          "text": "You rest until warmth returns to your limbs.",
          "effects": []
        },
        "failure": {
          "text": "You rest until warmth returns to your limbs.",
          "effects": []
        },
        "outcome": {
          "text": "You rest until warmth returns to your limbs. Restore 30 Health.",
          "effects": [
            {
              "type": "heal",
              "amount": 30
            }
          ]
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
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-highfall-restorative"
            }
          ]
        },
        "failure": {
          "text": "The satchel contains only ruined bandages, but the sheltered pause still restores 10 Health.",
          "effects": [
            {
              "type": "heal",
              "amount": 10
            }
          ]
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
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-highfall-frostroot"
            },
            {
              "type": "gainExperience",
              "amount": 20
            }
          ]
        },
        "failure": {
          "text": "The brittle root crumbles in your hands, but the spring water restores 10 Health.",
          "effects": [
            {
              "type": "heal",
              "amount": 10
            }
          ]
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
        "success": {
          "text": "The storm passes while you recover.",
          "effects": []
        },
        "failure": {
          "text": "The storm passes while you recover.",
          "effects": []
        },
        "outcome": {
          "text": "The storm passes while you recover beneath the heavy blankets. Restore 25 Health.",
          "effects": [
            {
              "type": "heal",
              "amount": 25
            }
          ]
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
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-stonebloom-draught"
            }
          ]
        },
        "failure": {
          "text": "The latch snaps and the bottles spill, but one Highfall Restorative remains intact.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "consumable-highfall-restorative"
            }
          ]
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
          "effects": [
            {
              "type": "heal",
              "amount": 20
            },
            {
              "type": "playerNextCombatBuff",
              "status": "strengthened",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "Smoke fills the tent before the stove catches. Restore 10 Health, but begin the next combat Exhausted.",
          "effects": [
            {
              "type": "heal",
              "amount": 10
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
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
          "effects": [
            {
              "type": "gainItem",
              "itemId": "gear-cairnkeepers-loop"
            },
            {
              "type": "gainExperience",
              "amount": 45
            }
          ]
        },
        "failure": {
          "text": "The runes flare with bitter cold. Lose 15 Health and begin the next combat Slowed.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 15
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
        "id": "choice-highfall-search-offerings",
        "label": "Search the offerings",
        "description": "Look for something useful without disturbing the sealed niche.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 50,
        "success": {
          "text": "You uncover a preserved bundle of Highfall Frostroot and 30 Gold.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-highfall-frostroot"
            },
            {
              "type": "gainGold",
              "amount": 30
            }
          ]
        },
        "failure": {
          "text": "Loose stones tumble onto your hands. Lose 10 Health.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 10
            }
          ]
        }
      },
      {
        "id": "choice-highfall-honor-cairn",
        "label": "Honor the fallen",
        "description": "Leave the cairn untouched and take a moment to remember the dead.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "You leave the cairn undisturbed.",
          "effects": []
        },
        "failure": {
          "text": "You leave the cairn undisturbed.",
          "effects": []
        },
        "outcome": {
          "text": "The quiet ritual steels your resolve. Begin the next combat with Fierce.",
          "effects": [
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
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
        "success": {
          "text": "The merchant opens the mountain stock.",
          "effects": []
        },
        "failure": {
          "text": "The merchant opens the mountain stock.",
          "effects": []
        },
        "outcome": {
          "text": "The Highfall Merchant names a price for each hard-won item.",
          "effects": [
            {
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
            }
          ]
        }
      },
      {
        "id": "choice-highfall-leave-merchant",
        "label": "Continue to the summit",
        "description": "Save your Gold and begin the final climb.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "You leave the trading post behind.",
          "effects": []
        },
        "failure": {
          "text": "You leave the trading post behind.",
          "effects": []
        },
        "outcome": {
          "text": "The merchant wishes you luck against the king above.",
          "effects": []
        }
      }
    ]
  },
  "event-a4-hazard": {
    "id": "event-a4-hazard",
    "name": "Mirefen Marsh Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Mirefen Marsh punishes careless steps.",
    "choices": [
      {
        "id": "choice-a4-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 56,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 170
            },
            {
              "type": "gainItem",
              "itemId": "item-a4-bog-iron"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 27
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "poison",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a4-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 59,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a4-mire-reed"
            },
            {
              "type": "gainGold",
              "amount": 22
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 18
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a4-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a4-relic": {
    "id": "event-a4-relic",
    "name": "Whispers of Mirefen Marsh",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a4-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 58,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 226
            },
            {
              "type": "gainItem",
              "itemId": "item-a4-venom-sac"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 24
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a4-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 61,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 40
            },
            {
              "type": "gainItem",
              "itemId": "item-a4-venom-sac"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a4-bog-leech",
              "count": 1,
              "experience": 110,
              "gold": 23
            }
          ]
        }
      },
      {
        "id": "choice-a4-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a4-refuge": {
    "id": "event-a4-refuge",
    "name": "Last Refuge of Mirefen Marsh",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a4-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 56,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 50
            },
            {
              "type": "gainItem",
              "itemId": "item-a4-mire-reed"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 30
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a4-bog-leech",
              "count": 1,
              "experience": 115,
              "gold": 24
            }
          ]
        }
      },
      {
        "id": "choice-a4-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 60,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 48
            },
            {
              "type": "gainItem",
              "itemId": "item-a4-bog-iron"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "poison",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 16
            }
          ]
        }
      },
      {
        "id": "choice-a4-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 24
            }
          ]
        }
      }
    ]
  },
  "event-a5-hazard": {
    "id": "event-a5-hazard",
    "name": "Ashen Foundry Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Ashen Foundry punishes careless steps.",
    "choices": [
      {
        "id": "choice-a5-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 57,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 190
            },
            {
              "type": "gainItem",
              "itemId": "item-a5-cindersteel"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 30
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "burn",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a5-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 60,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a5-sootweave"
            },
            {
              "type": "gainGold",
              "amount": 25
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 20
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a5-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a5-relic": {
    "id": "event-a5-relic",
    "name": "Whispers of Ashen Foundry",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a5-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 59,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 250
            },
            {
              "type": "gainItem",
              "itemId": "item-a5-ember-fragment"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 27
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a5-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 62,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 44
            },
            {
              "type": "gainItem",
              "itemId": "item-a5-ember-fragment"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a5-cinder-smith",
              "count": 1,
              "experience": 122,
              "gold": 25
            }
          ]
        }
      },
      {
        "id": "choice-a5-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a5-refuge": {
    "id": "event-a5-refuge",
    "name": "Last Refuge of Ashen Foundry",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a5-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 57,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 55
            },
            {
              "type": "gainItem",
              "itemId": "item-a5-sootweave"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 33
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a5-cinder-smith",
              "count": 1,
              "experience": 127,
              "gold": 26
            }
          ]
        }
      },
      {
        "id": "choice-a5-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 61,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 53
            },
            {
              "type": "gainItem",
              "itemId": "item-a5-cindersteel"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "burn",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 18
            }
          ]
        }
      },
      {
        "id": "choice-a5-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 27
            }
          ]
        }
      }
    ]
  },
  "event-a6-hazard": {
    "id": "event-a6-hazard",
    "name": "Sunken Reliquary Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Sunken Reliquary punishes careless steps.",
    "choices": [
      {
        "id": "choice-a6-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 58,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 210
            },
            {
              "type": "gainItem",
              "itemId": "item-a6-abyssal-pearl"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 33
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "wet",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a6-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 61,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a6-tideglass"
            },
            {
              "type": "gainGold",
              "amount": 28
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 22
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a6-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a6-relic": {
    "id": "event-a6-relic",
    "name": "Whispers of Sunken Reliquary",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a6-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 60,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 274
            },
            {
              "type": "gainItem",
              "itemId": "item-a6-relic-shard"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 30
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a6-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 63,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 48
            },
            {
              "type": "gainItem",
              "itemId": "item-a6-relic-shard"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a6-drowned-acolyte",
              "count": 1,
              "experience": 135,
              "gold": 27
            }
          ]
        }
      },
      {
        "id": "choice-a6-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a6-refuge": {
    "id": "event-a6-refuge",
    "name": "Last Refuge of Sunken Reliquary",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a6-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 58,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 60
            },
            {
              "type": "gainItem",
              "itemId": "item-a6-tideglass"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 36
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a6-drowned-acolyte",
              "count": 1,
              "experience": 140,
              "gold": 28
            }
          ]
        }
      },
      {
        "id": "choice-a6-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 62,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 58
            },
            {
              "type": "gainItem",
              "itemId": "item-a6-abyssal-pearl"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "wet",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 20
            }
          ]
        }
      },
      {
        "id": "choice-a6-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 30
            }
          ]
        }
      }
    ]
  },
  "event-a7-hazard": {
    "id": "event-a7-hazard",
    "name": "Nightglass Citadel Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Nightglass Citadel punishes careless steps.",
    "choices": [
      {
        "id": "choice-a7-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 59,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 230
            },
            {
              "type": "gainItem",
              "itemId": "item-a7-nightglass"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 36
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "blind",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a7-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 62,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a7-bloodstone"
            },
            {
              "type": "gainGold",
              "amount": 31
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 24
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a7-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a7-relic": {
    "id": "event-a7-relic",
    "name": "Whispers of Nightglass Citadel",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a7-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 61,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 298
            },
            {
              "type": "gainItem",
              "itemId": "item-a7-umbral-silk"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 33
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a7-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 64,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 52
            },
            {
              "type": "gainItem",
              "itemId": "item-a7-umbral-silk"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a7-gloom-archer",
              "count": 1,
              "experience": 147,
              "gold": 29
            }
          ]
        }
      },
      {
        "id": "choice-a7-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a7-refuge": {
    "id": "event-a7-refuge",
    "name": "Last Refuge of Nightglass Citadel",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a7-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 59,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 65
            },
            {
              "type": "gainItem",
              "itemId": "item-a7-bloodstone"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 39
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a7-gloom-archer",
              "count": 1,
              "experience": 152,
              "gold": 30
            }
          ]
        }
      },
      {
        "id": "choice-a7-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 63,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 63
            },
            {
              "type": "gainItem",
              "itemId": "item-a7-nightglass"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "blind",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 22
            }
          ]
        }
      },
      {
        "id": "choice-a7-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 33
            }
          ]
        }
      }
    ]
  },
  "event-a8-hazard": {
    "id": "event-a8-hazard",
    "name": "Frostbound Expanse Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Frostbound Expanse punishes careless steps.",
    "choices": [
      {
        "id": "choice-a8-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 60,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 250
            },
            {
              "type": "gainItem",
              "itemId": "item-a8-rimebone"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 39
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "cold",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a8-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 63,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a8-white-pelt"
            },
            {
              "type": "gainGold",
              "amount": 34
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 26
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a8-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a8-relic": {
    "id": "event-a8-relic",
    "name": "Whispers of Frostbound Expanse",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a8-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 62,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 322
            },
            {
              "type": "gainItem",
              "itemId": "item-a8-frostheart"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 36
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a8-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 65,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 56
            },
            {
              "type": "gainItem",
              "itemId": "item-a8-frostheart"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a8-icebound-raider",
              "count": 1,
              "experience": 160,
              "gold": 31
            }
          ]
        }
      },
      {
        "id": "choice-a8-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a8-refuge": {
    "id": "event-a8-refuge",
    "name": "Last Refuge of Frostbound Expanse",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a8-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 60,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 70
            },
            {
              "type": "gainItem",
              "itemId": "item-a8-white-pelt"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 42
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a8-icebound-raider",
              "count": 1,
              "experience": 165,
              "gold": 32
            }
          ]
        }
      },
      {
        "id": "choice-a8-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 64,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 68
            },
            {
              "type": "gainItem",
              "itemId": "item-a8-rimebone"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "cold",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 24
            }
          ]
        }
      },
      {
        "id": "choice-a8-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 36
            }
          ]
        }
      }
    ]
  },
  "event-a9-hazard": {
    "id": "event-a9-hazard",
    "name": "Stormspire Aerie Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but Stormspire Aerie punishes careless steps.",
    "choices": [
      {
        "id": "choice-a9-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 61,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 270
            },
            {
              "type": "gainItem",
              "itemId": "item-a9-skyiron"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 42
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "electrified",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a9-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 64,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a9-cloudfeather"
            },
            {
              "type": "gainGold",
              "amount": 37
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 28
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a9-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a9-relic": {
    "id": "event-a9-relic",
    "name": "Whispers of Stormspire Aerie",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a9-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 63,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 346
            },
            {
              "type": "gainItem",
              "itemId": "item-a9-storm-core"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 39
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a9-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 66,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 60
            },
            {
              "type": "gainItem",
              "itemId": "item-a9-storm-core"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a9-spire-zealot",
              "count": 1,
              "experience": 172,
              "gold": 33
            }
          ]
        }
      },
      {
        "id": "choice-a9-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a9-refuge": {
    "id": "event-a9-refuge",
    "name": "Last Refuge of Stormspire Aerie",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a9-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 61,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 75
            },
            {
              "type": "gainItem",
              "itemId": "item-a9-cloudfeather"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 45
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a9-spire-zealot",
              "count": 1,
              "experience": 177,
              "gold": 34
            }
          ]
        }
      },
      {
        "id": "choice-a9-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 65,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 73
            },
            {
              "type": "gainItem",
              "itemId": "item-a9-skyiron"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "electrified",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 26
            }
          ]
        }
      },
      {
        "id": "choice-a9-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 39
            }
          ]
        }
      }
    ]
  },
  "event-a10-hazard": {
    "id": "event-a10-hazard",
    "name": "The Hollow Crown Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but The Hollow Crown punishes careless steps.",
    "choices": [
      {
        "id": "choice-a10-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 62,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 290
            },
            {
              "type": "gainItem",
              "itemId": "item-a10-hollowsteel"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 45
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "vulnerable",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a10-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 65,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a10-soul-ash"
            },
            {
              "type": "gainGold",
              "amount": 40
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 30
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a10-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a10-relic": {
    "id": "event-a10-relic",
    "name": "Whispers of The Hollow Crown",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a10-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 64,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 370
            },
            {
              "type": "gainItem",
              "itemId": "item-a10-crown-shard"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 42
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a10-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 67,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 64
            },
            {
              "type": "gainItem",
              "itemId": "item-a10-crown-shard"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a10-ashen-confessor",
              "count": 1,
              "experience": 185,
              "gold": 35
            }
          ]
        }
      },
      {
        "id": "choice-a10-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a10-refuge": {
    "id": "event-a10-refuge",
    "name": "Last Refuge of The Hollow Crown",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a10-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 62,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 80
            },
            {
              "type": "gainItem",
              "itemId": "item-a10-soul-ash"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 48
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a10-ashen-confessor",
              "count": 1,
              "experience": 190,
              "gold": 36
            }
          ]
        }
      },
      {
        "id": "choice-a10-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 66,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 78
            },
            {
              "type": "gainItem",
              "itemId": "item-a10-hollowsteel"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "vulnerable",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 28
            }
          ]
        }
      },
      {
        "id": "choice-a10-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 42
            }
          ]
        }
      }
    ]
  },
  "event-a11-hazard": {
    "id": "event-a11-hazard",
    "name": "The Astral Scar Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but The Astral Scar punishes careless steps.",
    "choices": [
      {
        "id": "choice-a11-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 63,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 310
            },
            {
              "type": "gainItem",
              "itemId": "item-a11-star-metal"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 48
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "arcaneWound",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a11-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 66,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a11-comet-silk"
            },
            {
              "type": "gainGold",
              "amount": 43
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 32
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a11-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a11-relic": {
    "id": "event-a11-relic",
    "name": "Whispers of The Astral Scar",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a11-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 65,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 394
            },
            {
              "type": "gainItem",
              "itemId": "item-a11-astral-glass"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 45
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a11-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 68,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 68
            },
            {
              "type": "gainItem",
              "itemId": "item-a11-astral-glass"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a11-glasswing-moth",
              "count": 1,
              "experience": 197,
              "gold": 37
            }
          ]
        }
      },
      {
        "id": "choice-a11-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a11-refuge": {
    "id": "event-a11-refuge",
    "name": "Last Refuge of The Astral Scar",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a11-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 63,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 85
            },
            {
              "type": "gainItem",
              "itemId": "item-a11-comet-silk"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 51
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a11-glasswing-moth",
              "count": 1,
              "experience": 202,
              "gold": 38
            }
          ]
        }
      },
      {
        "id": "choice-a11-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 67,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 83
            },
            {
              "type": "gainItem",
              "itemId": "item-a11-star-metal"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "arcaneWound",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 30
            }
          ]
        }
      },
      {
        "id": "choice-a11-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 45
            }
          ]
        }
      }
    ]
  },
  "event-a12-hazard": {
    "id": "event-a12-hazard",
    "name": "The World Below Shortcut",
    "eyebrow": "Dangerous Route",
    "description": "A dangerous shortcut could save hours, but The World Below punishes careless steps.",
    "choices": [
      {
        "id": "choice-a12-hazard-agility",
        "label": "Take the narrow path",
        "description": "Trust your footing and move quickly.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 64,
        "success": {
          "text": "You cross cleanly and reach an untouched cache.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 330
            },
            {
              "type": "gainItem",
              "itemId": "item-a12-worldroot-heartwood"
            }
          ]
        },
        "failure": {
          "text": "The route gives way beneath you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 51
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "vulnerable",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a12-hazard-strength",
        "label": "Force a safer route",
        "description": "Break or move the obstacle instead.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 67,
        "success": {
          "text": "You carve a stable passage and salvage useful material.",
          "effects": [
            {
              "type": "gainItem",
              "itemId": "item-a12-abyssal-hide"
            },
            {
              "type": "gainGold",
              "amount": 46
            }
          ]
        },
        "failure": {
          "text": "The work exhausts you before the path is clear.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 34
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a12-hazard-leave",
        "label": "Stay on the road",
        "description": "Lose time, not blood.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You keep to the longer road.",
          "effects": []
        }
      }
    ]
  },
  "event-a12-relic": {
    "id": "event-a12-relic",
    "name": "Whispers of The World Below",
    "eyebrow": "Forgotten Relic",
    "description": "An old relic hums with a warning and a promise.",
    "choices": [
      {
        "id": "choice-a12-relic-intelligence",
        "label": "Study the relic",
        "description": "Read the pattern before touching it.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 66,
        "success": {
          "text": "The relic yields its secret without resistance.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 418
            },
            {
              "type": "gainItem",
              "itemId": "item-a12-first-echo"
            }
          ]
        },
        "failure": {
          "text": "The relic answers with a hostile pulse.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 48
            },
            {
              "type": "enemiesNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "choice-a12-relic-luck",
        "label": "Reach through the ward",
        "description": "Trust the relic to choose kindly.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 69,
        "success": {
          "text": "Fortune turns the ward aside.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 72
            },
            {
              "type": "gainItem",
              "itemId": "item-a12-first-echo"
            }
          ]
        },
        "failure": {
          "text": "The ward marks you for the guardians.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a12-pale-burrower",
              "count": 1,
              "experience": 210,
              "gold": 39
            }
          ]
        }
      },
      {
        "id": "choice-a12-relic-leave",
        "label": "Leave it untouched",
        "description": "Some warnings deserve respect.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "The relic's whisper fades behind you.",
          "effects": []
        }
      }
    ]
  },
  "event-a12-refuge": {
    "id": "event-a12-refuge",
    "name": "Last Refuge of The World Below",
    "eyebrow": "Abandoned Shelter",
    "description": "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
    "choices": [
      {
        "id": "choice-a12-refuge-vitality",
        "label": "Clear the shelter",
        "description": "Hold the entrance while searching every corner.",
        "resolution": "check",
        "stat": "vitality",
        "threshold": 64,
        "success": {
          "text": "You secure the refuge and recover in safety.",
          "effects": [
            {
              "type": "heal",
              "amount": 90
            },
            {
              "type": "gainItem",
              "itemId": "item-a12-abyssal-hide"
            }
          ]
        },
        "failure": {
          "text": "The shelter collapses into a frantic fight.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 54
            },
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-a12-pale-burrower",
              "count": 1,
              "experience": 215,
              "gold": 40
            }
          ]
        }
      },
      {
        "id": "choice-a12-refuge-luck",
        "label": "Search the loose stones",
        "description": "Look for the cache survivors would hide.",
        "resolution": "check",
        "stat": "luck",
        "threshold": 68,
        "success": {
          "text": "Your hand finds a sealed emergency cache.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 88
            },
            {
              "type": "gainItem",
              "itemId": "item-a12-worldroot-heartwood"
            }
          ]
        },
        "failure": {
          "text": "You disturb what was nesting in the wall.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "vulnerable",
              "stacks": 1
            },
            {
              "type": "loseHealth",
              "amount": 32
            }
          ]
        }
      },
      {
        "id": "choice-a12-refuge-rest",
        "label": "Rest by the entrance",
        "description": "Take only the safety you can confirm.",
        "resolution": "direct",
        "stat": "vitality",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "A short rest steadies you.",
          "effects": [
            {
              "type": "heal",
              "amount": 48
            }
          ]
        }
      }
    ]
  },
  "event-a13-broken-hour": {
    "id": "event-a13-broken-hour",
    "name": "The Broken Hour",
    "eyebrow": "Endgame Event",
    "description": "A dangerous remnant of The Sepulcher of Hours offers power at a price.",
    "choices": [
      {
        "id": "event-a13-broken-hour-master",
        "label": "Master the remnant",
        "description": "Force its power to obey.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 58,
        "success": {
          "text": "The remnant yields and strengthens you for the next battle.",
          "effects": [
            {
              "type": "heal",
              "amount": 120
            },
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The remnant turns your certainty against you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 85
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "nullify",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a13-broken-hour-steal",
        "label": "Steal a fragment",
        "description": "Take something valuable before the remnant notices.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 56,
        "success": {
          "text": "You escape with a fragment of impossible wealth.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 260
            }
          ]
        },
        "failure": {
          "text": "The trap closes around your limbs and breath.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 70
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a13-broken-hour-leave",
        "label": "Leave it untouched",
        "description": "Some bargains deserve no answer.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You pass without disturbing what waits there.",
          "effects": [
            {
              "type": "heal",
              "amount": 55
            }
          ]
        }
      }
    ]
  },
  "event-a14-living-reliquary": {
    "id": "event-a14-living-reliquary",
    "name": "The Living Reliquary",
    "eyebrow": "Endgame Event",
    "description": "A dangerous remnant of The Sanguine Basilica offers power at a price.",
    "choices": [
      {
        "id": "event-a14-living-reliquary-master",
        "label": "Master the remnant",
        "description": "Force its power to obey.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 62,
        "success": {
          "text": "The remnant yields and strengthens you for the next battle.",
          "effects": [
            {
              "type": "heal",
              "amount": 140
            },
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The remnant turns your certainty against you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 100
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "disarm",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a14-living-reliquary-steal",
        "label": "Steal a fragment",
        "description": "Take something valuable before the remnant notices.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 60,
        "success": {
          "text": "You escape with a fragment of impossible wealth.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 305
            }
          ]
        },
        "failure": {
          "text": "The trap closes around your limbs and breath.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 85
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a14-living-reliquary-leave",
        "label": "Leave it untouched",
        "description": "Some bargains deserve no answer.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You pass without disturbing what waits there.",
          "effects": [
            {
              "type": "heal",
              "amount": 65
            }
          ]
        }
      }
    ]
  },
  "event-a15-sleeping-moon": {
    "id": "event-a15-sleeping-moon",
    "name": "The Sleeping Moon",
    "eyebrow": "Endgame Event",
    "description": "A dangerous remnant of The Dreaming Wilds offers power at a price.",
    "choices": [
      {
        "id": "event-a15-sleeping-moon-master",
        "label": "Master the remnant",
        "description": "Force its power to obey.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 66,
        "success": {
          "text": "The remnant yields and strengthens you for the next battle.",
          "effects": [
            {
              "type": "heal",
              "amount": 160
            },
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The remnant turns your certainty against you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 115
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "nullify",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a15-sleeping-moon-steal",
        "label": "Steal a fragment",
        "description": "Take something valuable before the remnant notices.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 64,
        "success": {
          "text": "You escape with a fragment of impossible wealth.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 350
            }
          ]
        },
        "failure": {
          "text": "The trap closes around your limbs and breath.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 100
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a15-sleeping-moon-leave",
        "label": "Leave it untouched",
        "description": "Some bargains deserve no answer.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You pass without disturbing what waits there.",
          "effects": [
            {
              "type": "heal",
              "amount": 75
            }
          ]
        }
      }
    ]
  },
  "event-a16-zero-foundry": {
    "id": "event-a16-zero-foundry",
    "name": "The Zero Foundry",
    "eyebrow": "Endgame Event",
    "description": "A dangerous remnant of The Iron Eclipse offers power at a price.",
    "choices": [
      {
        "id": "event-a16-zero-foundry-master",
        "label": "Master the remnant",
        "description": "Force its power to obey.",
        "resolution": "check",
        "stat": "strength",
        "threshold": 70,
        "success": {
          "text": "The remnant yields and strengthens you for the next battle.",
          "effects": [
            {
              "type": "heal",
              "amount": 180
            },
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The remnant turns your certainty against you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 130
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "disarm",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a16-zero-foundry-steal",
        "label": "Steal a fragment",
        "description": "Take something valuable before the remnant notices.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 68,
        "success": {
          "text": "You escape with a fragment of impossible wealth.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 395
            }
          ]
        },
        "failure": {
          "text": "The trap closes around your limbs and breath.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 115
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a16-zero-foundry-leave",
        "label": "Leave it untouched",
        "description": "Some bargains deserve no answer.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You pass without disturbing what waits there.",
          "effects": [
            {
              "type": "heal",
              "amount": 85
            }
          ]
        }
      }
    ]
  },
  "event-a17-empty-coronation": {
    "id": "event-a17-empty-coronation",
    "name": "The Empty Coronation",
    "eyebrow": "Endgame Event",
    "description": "A dangerous remnant of The Throne Beyond Death offers power at a price.",
    "choices": [
      {
        "id": "event-a17-empty-coronation-master",
        "label": "Master the remnant",
        "description": "Force its power to obey.",
        "resolution": "check",
        "stat": "intelligence",
        "threshold": 74,
        "success": {
          "text": "The remnant yields and strengthens you for the next battle.",
          "effects": [
            {
              "type": "heal",
              "amount": 200
            },
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The remnant turns your certainty against you.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 145
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "nullify",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a17-empty-coronation-steal",
        "label": "Steal a fragment",
        "description": "Take something valuable before the remnant notices.",
        "resolution": "check",
        "stat": "agility",
        "threshold": 72,
        "success": {
          "text": "You escape with a fragment of impossible wealth.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 440
            }
          ]
        },
        "failure": {
          "text": "The trap closes around your limbs and breath.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 130
            },
            {
              "type": "playerNextCombatDebuff",
              "status": "exhausted",
              "stacks": 1
            }
          ]
        }
      },
      {
        "id": "event-a17-empty-coronation-leave",
        "label": "Leave it untouched",
        "description": "Some bargains deserve no answer.",
        "resolution": "direct",
        "stat": "luck",
        "threshold": 0,
        "success": {
          "text": "",
          "effects": []
        },
        "failure": {
          "text": "",
          "effects": []
        },
        "outcome": {
          "text": "You pass without disturbing what waits there.",
          "effects": [
            {
              "type": "heal",
              "amount": 95
            }
          ]
        }
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
            "description": "At the crest, Striz's hulking warband closes ranks around its chieftain, blades raised beneath a storm of tattered banners.",
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
        "dropTable": [
          {
            "itemId": "item-highfall-frostroot",
            "chance": 15
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-1-bandit-toll",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "The Bandit's Toll",
            "description": "An enforcer blocks the narrow trail while a trapper takes position above the road.",
            "enemyIds": [
              "enemy-ms2wk1ul-6ol9b",
              "enemy-ms2wuk5j-1ddqa"
            ],
            "reward": {
              "experience": 145,
              "gold": 22
            }
          }
        ]
      },
      {
        "id": "highfall-stage-2-sheltered-spring",
        "name": "The Sheltered Spring",
        "dropTable": [],
        "entries": [
          {
            "id": "highfall-entry-2-sheltered-spring",
            "type": "event",
            "chance": 100,
            "eyebrow": "Mountain Refuge",
            "title": "The Sheltered Spring",
            "description": "Warm water and an abandoned shelter offer a rare chance to recover.",
            "eventId": "event-highfall-sheltered-spring"
          }
        ]
      },
      {
        "id": "highfall-stage-3-troll-country",
        "name": "Troll Country",
        "dropTable": [
          {
            "itemId": "consumable-highfall-restorative",
            "chance": 8
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-3-hill-troll",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Troll Country",
            "description": "A Hill Troll rises from a nest of broken carts and blocks the climb.",
            "enemyIds": [
              "enemy-ms2vrqbb-8r5ux"
            ],
            "reward": {
              "experience": 135,
              "gold": 20
            }
          }
        ]
      },
      {
        "id": "highfall-stage-4-cliffside-ambush",
        "name": "Cliffside Ambush",
        "dropTable": [
          {
            "itemId": "item-highfall-frostroot",
            "chance": 20
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-4-crossfire",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Cliffside Crossfire",
            "description": "A bandit enforcer rushes you while an archer fires from a shelf of stone.",
            "enemyIds": [
              "enemy-ms2wk1ul-6ol9b",
              "enemy-ms2wuk5j-1ddqa"
            ],
            "reward": {
              "experience": 155,
              "gold": 28
            }
          },
          {
            "id": "highfall-entry-4-trappers",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Tripwire Alley",
            "description": "Two trappers spring their ambush from opposite sides of the ravine.",
            "enemyIds": [
              "enemy-ms2wuk5j-1ddqa",
              "enemy-ms2wuk5j-1ddqa"
            ],
            "reward": {
              "experience": 165,
              "gold": 30
            }
          }
        ]
      },
      {
        "id": "highfall-stage-5-broken-causeway",
        "name": "The Broken Causeway",
        "dropTable": [
          {
            "itemId": "consumable-highfall-restorative",
            "chance": 10
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-5-hill-troll",
            "type": "combat",
            "chance": 90,
            "eyebrow": "Encounter",
            "title": "The Broken Causeway",
            "description": "A hungry Hill Troll prowls between the shattered bridge pillars.",
            "enemyIds": [
              "enemy-ms2vrqbb-8r5ux"
            ],
            "reward": {
              "experience": 140,
              "gold": 22
            }
          },
          {
            "id": "highfall-entry-5-loot-goblin",
            "type": "combat",
            "chance": 10,
            "eyebrow": "Rare Encounter",
            "title": "A Goblin and Its Bodyguard",
            "description": "A loot-laden goblin scrambles behind a Hill Troll and urges the brute into your path.",
            "enemyIds": [
              "enemy-ms2vrqbb-8r5ux",
              "enemy-ms2wqzxv-srsgs"
            ],
            "reward": {
              "experience": 190,
              "gold": 40
            }
          }
        ]
      },
      {
        "id": "highfall-stage-6-stormbound-camp",
        "name": "Stormbound Camp",
        "dropTable": [],
        "entries": [
          {
            "id": "highfall-entry-6-stormbound-camp",
            "type": "event",
            "chance": 100,
            "eyebrow": "Abandoned Camp",
            "title": "Stormbound Camp",
            "description": "A snow squall drives you into a deserted camp stocked with old medical supplies.",
            "eventId": "event-highfall-stormbound-camp"
          }
        ]
      },
      {
        "id": "highfall-stage-7-high-slopes",
        "name": "The High Slopes",
        "dropTable": [
          {
            "itemId": "consumable-stonebloom-draught",
            "chance": 10
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-7-mountain-troll",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "The Mountain Stirs",
            "description": "A Mountain Troll tears itself free from the snow-covered rocks.",
            "enemyIds": [
              "enemy-ms2w17p6-txpmq"
            ],
            "reward": {
              "experience": 180,
              "gold": 32
            }
          },
          {
            "id": "highfall-entry-7-troll-rites",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Encounter",
            "title": "Rites of the High Slopes",
            "description": "A Hill Troll Shaman chants behind a towering Mountain Troll.",
            "enemyIds": [
              "enemy-ms2w17p6-txpmq",
              "enemy-ms2w93yt-v817a"
            ],
            "reward": {
              "experience": 260,
              "gold": 48
            }
          }
        ]
      },
      {
        "id": "highfall-stage-8-frozen-cairn",
        "name": "The Frozen Cairn",
        "dropTable": [],
        "entries": [
          {
            "id": "highfall-entry-8-frozen-cairn",
            "type": "event",
            "chance": 100,
            "eyebrow": "Ancient Memorial",
            "title": "The Frozen Cairn",
            "description": "Old warding runes protect a memorial above the clouds.",
            "eventId": "event-highfall-frozen-cairn"
          }
        ]
      },
      {
        "id": "highfall-stage-9-merchant",
        "name": "The Last Trading Post",
        "dropTable": [],
        "entries": [
          {
            "id": "highfall-entry-9-merchant",
            "type": "event",
            "chance": 100,
            "eyebrow": "Last Trading Post",
            "title": "Highfall Merchant",
            "description": "A stubborn merchant keeps one final trading post beneath the summit.",
            "eventId": "event-highfall-merchant"
          }
        ]
      },
      {
        "id": "highfall-stage-10-kings-guard",
        "name": "The King's Guard",
        "dropTable": [
          {
            "itemId": "gear-cairnkeepers-loop",
            "chance": 5
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-10-troll-guard",
            "type": "combat",
            "chance": 60,
            "eyebrow": "Encounter",
            "title": "The King's Trolls",
            "description": "A Mountain Troll and its shaman guard the only path to the crown.",
            "enemyIds": [
              "enemy-ms2w17p6-txpmq",
              "enemy-ms2w93yt-v817a"
            ],
            "reward": {
              "experience": 270,
              "gold": 55
            }
          },
          {
            "id": "highfall-entry-10-bandit-guard",
            "type": "combat",
            "chance": 40,
            "eyebrow": "Encounter",
            "title": "The King's Cutthroats",
            "description": "Klaus's most loyal bandits close ranks across the summit trail.",
            "enemyIds": [
              "enemy-ms2wk1ul-6ol9b",
              "enemy-ms2wuk5j-1ddqa",
              "enemy-ms2wuk5j-1ddqa"
            ],
            "reward": {
              "experience": 250,
              "gold": 60
            }
          }
        ]
      },
      {
        "id": "highfall-stage-11-bandit-king",
        "name": "The Crown of Highfall",
        "dropTable": [
          {
            "itemId": "gear-cairnkeepers-loop",
            "chance": 20
          },
          {
            "itemId": "consumable-stonebloom-draught",
            "chance": 35
          }
        ],
        "entries": [
          {
            "id": "highfall-entry-11-klaus",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss",
            "title": "Troll Bandit King, Klaus",
            "description": "At the mountain's crown, Klaus waits among stolen banners and broken thrones.",
            "enemyIds": [
              "enemy-ms2xaper-z7o3g"
            ],
            "reward": {
              "experience": 420,
              "gold": 140
            }
          }
        ]
      }
    ],
    "completionTitle": "The Crown Falls",
    "completionDescription": "Klaus lies defeated and the stolen banners fall silent in the mountain wind. The Highfall pass is open once more.",
    "prerequisiteAdventureId": "adventure-ms1iq9ye-9ra1z"
  },
  {
    "id": "mirefen-marsh",
    "name": "Mirefen Marsh",
    "description": "Black water, drowned causeways, and venomous nests choke the southern Mirefen. Every safe foothold has teeth.",
    "recommendedLevel": 13,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/mirefen-marsh-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/mirefen-marsh-edge.webp",
    "prerequisiteAdventureId": "highfall-mountains",
    "travelText": "Following the lantern road into Mirefen Marsh",
    "completionTitle": "The Brood Falls Silent",
    "completionDescription": "Vespara sinks beneath the black water. The reed paths clear, and Mirefen's lanterns burn safely again.",
    "stages": [
      {
        "id": "a4-stage-1",
        "name": "Mirefen Passage 1",
        "entries": [
          {
            "id": "a4-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Reed Stalker Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-reed-stalker"
            ],
            "reward": {
              "experience": 150,
              "gold": 20
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a4-bog-iron",
            "chance": 45
          }
        ]
      },
      {
        "id": "a4-stage-2",
        "name": "Mirefen Passage 2",
        "entries": [
          {
            "id": "a4-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Bog Leech Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-bog-leech"
            ],
            "reward": {
              "experience": 156,
              "gold": 20
            }
          },
          {
            "id": "a4-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Mirefen Marsh.",
            "enemyIds": [
              "enemy-a4-bog-leech",
              "enemy-a4-fen-witch",
              "enemy-a4-brood-guard"
            ],
            "reward": {
              "experience": 208,
              "gold": 28
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a4-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a4-hazard",
            "reward": {
              "experience": 105,
              "gold": 8
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-4",
        "name": "Mirefen Passage 4",
        "entries": [
          {
            "id": "a4-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Drowned Warden Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-drowned-warden",
              "enemy-a4-brood-guard"
            ],
            "reward": {
              "experience": 168,
              "gold": 21
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-5",
        "name": "Mirefen Passage 5",
        "entries": [
          {
            "id": "a4-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Fen Witch Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-fen-witch",
              "enemy-a4-reed-stalker"
            ],
            "reward": {
              "experience": 174,
              "gold": 22
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-6",
        "name": "Mirefen Passage 6",
        "entries": [
          {
            "id": "a4-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Brood Guard Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-brood-guard",
              "enemy-a4-bog-leech"
            ],
            "reward": {
              "experience": 180,
              "gold": 22
            }
          },
          {
            "id": "a4-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Mirefen Marsh.",
            "enemyIds": [
              "enemy-a4-brood-guard",
              "enemy-a4-mirefen-spitter",
              "enemy-a4-drowned-warden"
            ],
            "reward": {
              "experience": 232,
              "gold": 28
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a4-mire-reed",
            "chance": 45
          }
        ]
      },
      {
        "id": "a4-stage-7",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a4-event-7",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a4-relic",
            "reward": {
              "experience": 105,
              "gold": 8
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-8",
        "name": "Mirefen Passage 8",
        "entries": [
          {
            "id": "a4-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Bog Leech Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-bog-leech",
              "enemy-a4-drowned-warden",
              "enemy-a4-brood-guard"
            ],
            "reward": {
              "experience": 192,
              "gold": 23
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-9",
        "name": "Mirefen Passage 9",
        "entries": [
          {
            "id": "a4-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Mirefen Spitter Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-mirefen-spitter",
              "enemy-a4-fen-witch",
              "enemy-a4-reed-stalker"
            ],
            "reward": {
              "experience": 198,
              "gold": 24
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-10",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a4-event-10",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a4-refuge",
            "reward": {
              "experience": 105,
              "gold": 8
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a4-stage-11",
        "name": "Mirefen Passage 11",
        "entries": [
          {
            "id": "a4-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Fen Witch Ambush",
            "description": "The path through Mirefen Marsh closes behind you.",
            "enemyIds": [
              "enemy-a4-fen-witch",
              "enemy-a4-reed-stalker",
              "enemy-a4-mirefen-spitter"
            ],
            "reward": {
              "experience": 210,
              "gold": 25
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a4-venom-sac",
            "chance": 45
          }
        ]
      },
      {
        "id": "a4-stage-12",
        "name": "Heart of Mirefen Marsh",
        "entries": [
          {
            "id": "a4-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Vespara, Broodmother",
            "description": "The black water trembles as Vespara hauls her vast brood from the drowned nest, venom hissing from every fang.",
            "enemyIds": [
              "enemy-a4-vespara-broodmother",
              "enemy-a4-fen-witch",
              "enemy-a4-brood-guard"
            ],
            "reward": {
              "experience": 450,
              "gold": 80
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a4-bogcleaver",
            "chance": 8
          },
          {
            "itemId": "item-a4-venom-sac",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "ashen-foundry",
    "name": "Ashen Foundry",
    "description": "An abandoned dwarven foundry has awakened beneath the ash fields, feeding armor and souls into an endless furnace.",
    "recommendedLevel": 18,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/ashen-foundry-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/ashen-foundry-edge.webp",
    "prerequisiteAdventureId": "mirefen-marsh",
    "travelText": "Crossing the ash fields toward the old foundry",
    "completionTitle": "The Furnace Cools",
    "completionDescription": "The Furnace Tyrant cracks apart and the foundry's great bellows fall still. For the first time in an age, clean air enters the halls.",
    "stages": [
      {
        "id": "a5-stage-1",
        "name": "Ashen Passage 1",
        "entries": [
          {
            "id": "a5-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Ash Hound Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-ash-hound"
            ],
            "reward": {
              "experience": 185,
              "gold": 28
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a5-cindersteel",
            "chance": 45
          }
        ]
      },
      {
        "id": "a5-stage-2",
        "name": "Ashen Passage 2",
        "entries": [
          {
            "id": "a5-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Cinder Smith Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-cinder-smith"
            ],
            "reward": {
              "experience": 191,
              "gold": 28
            }
          },
          {
            "id": "a5-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Ashen Foundry.",
            "enemyIds": [
              "enemy-a5-cinder-smith",
              "enemy-a5-ironbound-overseer",
              "enemy-a5-spark-swarm"
            ],
            "reward": {
              "experience": 255,
              "gold": 39
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a5-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a5-hazard",
            "reward": {
              "experience": 129,
              "gold": 11
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-4",
        "name": "Ashen Passage 4",
        "entries": [
          {
            "id": "a5-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Furnace Acolyte Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-furnace-acolyte",
              "enemy-a5-spark-swarm"
            ],
            "reward": {
              "experience": 203,
              "gold": 29
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-5",
        "name": "Ashen Passage 5",
        "entries": [
          {
            "id": "a5-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Ironbound Overseer Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-ironbound-overseer",
              "enemy-a5-ash-hound"
            ],
            "reward": {
              "experience": 209,
              "gold": 30
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-6",
        "name": "Ashen Passage 6",
        "entries": [
          {
            "id": "a5-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Spark Swarm Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-spark-swarm",
              "enemy-a5-cinder-smith"
            ],
            "reward": {
              "experience": 215,
              "gold": 30
            }
          },
          {
            "id": "a5-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Ashen Foundry.",
            "enemyIds": [
              "enemy-a5-spark-swarm",
              "enemy-a5-slag-elemental",
              "enemy-a5-furnace-acolyte"
            ],
            "reward": {
              "experience": 279,
              "gold": 39
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a5-sootweave",
            "chance": 45
          }
        ]
      },
      {
        "id": "a5-stage-7",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a5-event-7",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a5-relic",
            "reward": {
              "experience": 129,
              "gold": 11
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-8",
        "name": "Ashen Passage 8",
        "entries": [
          {
            "id": "a5-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Cinder Smith Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-cinder-smith",
              "enemy-a5-furnace-acolyte",
              "enemy-a5-spark-swarm"
            ],
            "reward": {
              "experience": 227,
              "gold": 31
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-9",
        "name": "Ashen Passage 9",
        "entries": [
          {
            "id": "a5-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Slag Elemental Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-slag-elemental",
              "enemy-a5-ironbound-overseer",
              "enemy-a5-ash-hound"
            ],
            "reward": {
              "experience": 233,
              "gold": 32
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-10",
        "name": "Ashen Passage 10",
        "entries": [
          {
            "id": "a5-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Furnace Acolyte Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-furnace-acolyte",
              "enemy-a5-spark-swarm",
              "enemy-a5-cinder-smith"
            ],
            "reward": {
              "experience": 239,
              "gold": 32
            }
          },
          {
            "id": "a5-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Ashen Foundry.",
            "enemyIds": [
              "enemy-a5-furnace-acolyte",
              "enemy-a5-ash-hound",
              "enemy-a5-cinder-smith"
            ],
            "reward": {
              "experience": 303,
              "gold": 39
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-11",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a5-event-11",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a5-refuge",
            "reward": {
              "experience": 129,
              "gold": 11
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-12",
        "name": "Ashen Passage 12",
        "entries": [
          {
            "id": "a5-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Spark Swarm Ambush",
            "description": "The path through Ashen Foundry closes behind you.",
            "enemyIds": [
              "enemy-a5-spark-swarm",
              "enemy-a5-cinder-smith",
              "enemy-a5-furnace-acolyte"
            ],
            "reward": {
              "experience": 251,
              "gold": 33
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a5-stage-13",
        "name": "Heart of Ashen Foundry",
        "entries": [
          {
            "id": "a5-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "The Furnace Tyrant",
            "description": "The foundry doors glow white-hot as the Furnace Tyrant tears free of its chains, each footfall ringing like a hammer blow.",
            "enemyIds": [
              "enemy-a5-furnace-tyrant",
              "enemy-a5-ironbound-overseer",
              "enemy-a5-spark-swarm"
            ],
            "reward": {
              "experience": 555,
              "gold": 112
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a5-foundry-maul",
            "chance": 8
          },
          {
            "itemId": "item-a5-ember-fragment",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "sunken-reliquary",
    "name": "Sunken Reliquary",
    "description": "Tidal caverns expose a drowned temple where relic wards still hum beneath the surf and dead priests whisper through bronze masks.",
    "recommendedLevel": 23,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/sunken-reliquary-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/sunken-reliquary-edge.webp",
    "prerequisiteAdventureId": "ashen-foundry",
    "travelText": "Descending with the tide into the Sunken Reliquary",
    "completionTitle": "The Last Prophecy Drowned",
    "completionDescription": "Nhalos releases the relic and the temple wards dim. The tide retreats, leaving the ancient road open.",
    "stages": [
      {
        "id": "a6-stage-1",
        "name": "Sunken Passage 1",
        "entries": [
          {
            "id": "a6-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Brine Crawler Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-brine-crawler"
            ],
            "reward": {
              "experience": 220,
              "gold": 36
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a6-abyssal-pearl",
            "chance": 45
          }
        ]
      },
      {
        "id": "a6-stage-2",
        "name": "Sunken Passage 2",
        "entries": [
          {
            "id": "a6-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Drowned Acolyte Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-drowned-acolyte"
            ],
            "reward": {
              "experience": 226,
              "gold": 36
            }
          },
          {
            "id": "a6-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Sunken Reliquary.",
            "enemyIds": [
              "enemy-a6-drowned-acolyte",
              "enemy-a6-tidebound-knight",
              "enemy-a6-siren-oracle"
            ],
            "reward": {
              "experience": 303,
              "gold": 50
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a6-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a6-hazard",
            "reward": {
              "experience": 154,
              "gold": 14
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-4",
        "name": "Sunken Passage 4",
        "entries": [
          {
            "id": "a6-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Vault Shock Eel Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-shock-eel",
              "enemy-a6-siren-oracle"
            ],
            "reward": {
              "experience": 238,
              "gold": 37
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-5",
        "name": "Sunken Passage 5",
        "entries": [
          {
            "id": "a6-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Tidebound Knight Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-tidebound-knight",
              "enemy-a6-brine-crawler"
            ],
            "reward": {
              "experience": 244,
              "gold": 38
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-6",
        "name": "Sunken Passage 6",
        "entries": [
          {
            "id": "a6-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Siren Oracle Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-siren-oracle",
              "enemy-a6-drowned-acolyte"
            ],
            "reward": {
              "experience": 250,
              "gold": 38
            }
          },
          {
            "id": "a6-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Sunken Reliquary.",
            "enemyIds": [
              "enemy-a6-siren-oracle",
              "enemy-a6-relic-sentinel",
              "enemy-a6-shock-eel"
            ],
            "reward": {
              "experience": 327,
              "gold": 50
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a6-tideglass",
            "chance": 45
          }
        ]
      },
      {
        "id": "a6-stage-7",
        "name": "Sunken Passage 7",
        "entries": [
          {
            "id": "a6-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Brine Crawler Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-brine-crawler",
              "enemy-a6-relic-sentinel",
              "enemy-a6-tidebound-knight"
            ],
            "reward": {
              "experience": 256,
              "gold": 39
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-8",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a6-event-8",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a6-relic",
            "reward": {
              "experience": 154,
              "gold": 14
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-9",
        "name": "Sunken Passage 9",
        "entries": [
          {
            "id": "a6-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Relic Sentinel Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-relic-sentinel",
              "enemy-a6-tidebound-knight",
              "enemy-a6-brine-crawler"
            ],
            "reward": {
              "experience": 268,
              "gold": 40
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-10",
        "name": "Sunken Passage 10",
        "entries": [
          {
            "id": "a6-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Vault Shock Eel Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-shock-eel",
              "enemy-a6-siren-oracle",
              "enemy-a6-drowned-acolyte"
            ],
            "reward": {
              "experience": 274,
              "gold": 40
            }
          },
          {
            "id": "a6-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Sunken Reliquary.",
            "enemyIds": [
              "enemy-a6-shock-eel",
              "enemy-a6-brine-crawler",
              "enemy-a6-drowned-acolyte"
            ],
            "reward": {
              "experience": 351,
              "gold": 50
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-11",
        "name": "Sunken Passage 11",
        "entries": [
          {
            "id": "a6-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Tidebound Knight Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-tidebound-knight",
              "enemy-a6-brine-crawler",
              "enemy-a6-relic-sentinel"
            ],
            "reward": {
              "experience": 280,
              "gold": 41
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a6-relic-shard",
            "chance": 45
          }
        ]
      },
      {
        "id": "a6-stage-12",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a6-event-12",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a6-refuge",
            "reward": {
              "experience": 154,
              "gold": 14
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-13",
        "name": "Sunken Passage 13",
        "entries": [
          {
            "id": "a6-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Brine Crawler Ambush",
            "description": "The path through Sunken Reliquary closes behind you.",
            "enemyIds": [
              "enemy-a6-brine-crawler",
              "enemy-a6-relic-sentinel",
              "enemy-a6-tidebound-knight"
            ],
            "reward": {
              "experience": 292,
              "gold": 42
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a6-stage-14",
        "name": "Heart of Sunken Reliquary",
        "entries": [
          {
            "id": "a6-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Nhalos, the Drowned Seer",
            "description": "Nhalos rises above the storm-filled font, bronze masks chanting his final prophecy through mouths full of seawater.",
            "enemyIds": [
              "enemy-a6-nhalos-drowned-seer",
              "enemy-a6-tidebound-knight",
              "enemy-a6-siren-oracle"
            ],
            "reward": {
              "experience": 660,
              "gold": 144
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a6-tidebreaker",
            "chance": 8
          },
          {
            "itemId": "item-a6-relic-shard",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "nightglass-citadel",
    "name": "Nightglass Citadel",
    "description": "A fortress of black glass reflects paths that do not exist. Assassins and bloodbound knights hunt between its mirrored halls.",
    "recommendedLevel": 28,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/nightglass-citadel-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/nightglass-citadel-edge.webp",
    "prerequisiteAdventureId": "sunken-reliquary",
    "travelText": "Climbing the moonlit road to Nightglass Citadel",
    "completionTitle": "Every Mirror Broken",
    "completionDescription": "Lady Noctra's final reflection splinters. Dawn crosses the citadel walls and the hidden road beyond appears.",
    "stages": [
      {
        "id": "a7-stage-1",
        "name": "Nightglass Passage 1",
        "entries": [
          {
            "id": "a7-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Mirror Stalker Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-mirror-stalker"
            ],
            "reward": {
              "experience": 255,
              "gold": 44
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a7-nightglass",
            "chance": 45
          }
        ]
      },
      {
        "id": "a7-stage-2",
        "name": "Nightglass Passage 2",
        "entries": [
          {
            "id": "a7-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Gloom Archer Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-gloom-archer"
            ],
            "reward": {
              "experience": 261,
              "gold": 44
            }
          },
          {
            "id": "a7-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Nightglass Citadel.",
            "enemyIds": [
              "enemy-a7-gloom-archer",
              "enemy-a7-veil-dancer",
              "enemy-a7-reflection-wraith"
            ],
            "reward": {
              "experience": 350,
              "gold": 61
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a7-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a7-hazard",
            "reward": {
              "experience": 178,
              "gold": 17
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-4",
        "name": "Nightglass Passage 4",
        "entries": [
          {
            "id": "a7-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Shard Magus Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-shard-magus",
              "enemy-a7-reflection-wraith"
            ],
            "reward": {
              "experience": 273,
              "gold": 45
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-5",
        "name": "Nightglass Passage 5",
        "entries": [
          {
            "id": "a7-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Veil Dancer Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-veil-dancer",
              "enemy-a7-mirror-stalker"
            ],
            "reward": {
              "experience": 279,
              "gold": 46
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-6",
        "name": "Nightglass Passage 6",
        "entries": [
          {
            "id": "a7-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Reflection Wraith Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-reflection-wraith",
              "enemy-a7-gloom-archer"
            ],
            "reward": {
              "experience": 285,
              "gold": 46
            }
          },
          {
            "id": "a7-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Nightglass Citadel.",
            "enemyIds": [
              "enemy-a7-reflection-wraith",
              "enemy-a7-bloodbound-knight",
              "enemy-a7-shard-magus"
            ],
            "reward": {
              "experience": 374,
              "gold": 61
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a7-bloodstone",
            "chance": 45
          }
        ]
      },
      {
        "id": "a7-stage-7",
        "name": "Nightglass Passage 7",
        "entries": [
          {
            "id": "a7-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Mirror Stalker Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-mirror-stalker",
              "enemy-a7-bloodbound-knight",
              "enemy-a7-veil-dancer"
            ],
            "reward": {
              "experience": 291,
              "gold": 47
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-8",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a7-event-8",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a7-relic",
            "reward": {
              "experience": 178,
              "gold": 17
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-9",
        "name": "Nightglass Passage 9",
        "entries": [
          {
            "id": "a7-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Bloodbound Knight Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-bloodbound-knight",
              "enemy-a7-veil-dancer",
              "enemy-a7-mirror-stalker"
            ],
            "reward": {
              "experience": 303,
              "gold": 48
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-10",
        "name": "Nightglass Passage 10",
        "entries": [
          {
            "id": "a7-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Shard Magus Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-shard-magus",
              "enemy-a7-reflection-wraith",
              "enemy-a7-gloom-archer"
            ],
            "reward": {
              "experience": 309,
              "gold": 48
            }
          },
          {
            "id": "a7-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Nightglass Citadel.",
            "enemyIds": [
              "enemy-a7-shard-magus",
              "enemy-a7-mirror-stalker",
              "enemy-a7-gloom-archer"
            ],
            "reward": {
              "experience": 398,
              "gold": 61
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-11",
        "name": "Nightglass Passage 11",
        "entries": [
          {
            "id": "a7-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Veil Dancer Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-veil-dancer",
              "enemy-a7-mirror-stalker",
              "enemy-a7-bloodbound-knight"
            ],
            "reward": {
              "experience": 315,
              "gold": 49
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a7-umbral-silk",
            "chance": 45
          }
        ]
      },
      {
        "id": "a7-stage-12",
        "name": "Nightglass Passage 12",
        "entries": [
          {
            "id": "a7-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Reflection Wraith Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-reflection-wraith",
              "enemy-a7-gloom-archer",
              "enemy-a7-shard-magus"
            ],
            "reward": {
              "experience": 321,
              "gold": 49
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-13",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a7-event-13",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a7-refuge",
            "reward": {
              "experience": 178,
              "gold": 17
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-14",
        "name": "Nightglass Passage 14",
        "entries": [
          {
            "id": "a7-combat-14-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Gloom Archer Ambush",
            "description": "The path through Nightglass Citadel closes behind you.",
            "enemyIds": [
              "enemy-a7-gloom-archer",
              "enemy-a7-shard-magus",
              "enemy-a7-reflection-wraith"
            ],
            "reward": {
              "experience": 333,
              "gold": 50
            }
          },
          {
            "id": "a7-combat-14-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Nightglass Citadel.",
            "enemyIds": [
              "enemy-a7-gloom-archer",
              "enemy-a7-veil-dancer",
              "enemy-a7-reflection-wraith"
            ],
            "reward": {
              "experience": 422,
              "gold": 61
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a7-stage-15",
        "name": "Heart of Nightglass Citadel",
        "entries": [
          {
            "id": "a7-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Lady Noctra, the Last Reflection",
            "description": "Every mirror shows Lady Noctra smiling—then six reflections step through the glass and draw their blades as one.",
            "enemyIds": [
              "enemy-a7-lady-noctra",
              "enemy-a7-veil-dancer",
              "enemy-a7-reflection-wraith"
            ],
            "reward": {
              "experience": 765,
              "gold": 176
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a7-mirrorfang",
            "chance": 8
          },
          {
            "itemId": "item-a7-umbral-silk",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "frostbound-expanse",
    "name": "Frostbound Expanse",
    "description": "Beyond the citadel lies a white waste where the wind freezes thought itself and ancient beasts wake beneath blue ice.",
    "recommendedLevel": 34,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/frostbound-expanse-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/frostbound-expanse-edge.webp",
    "prerequisiteAdventureId": "nightglass-citadel",
    "travelText": "Following the aurora across the Frostbound Expanse",
    "completionTitle": "The White Maw Shattered",
    "completionDescription": "Skara's roar collapses into drifting snow. The aurora steadies and a safe passage opens through the ice.",
    "stages": [
      {
        "id": "a8-stage-1",
        "name": "Frostbound Passage 1",
        "entries": [
          {
            "id": "a8-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rime Wolf Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-rime-wolf"
            ],
            "reward": {
              "experience": 290,
              "gold": 52
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a8-rimebone",
            "chance": 45
          }
        ]
      },
      {
        "id": "a8-stage-2",
        "name": "Frostbound Passage 2",
        "entries": [
          {
            "id": "a8-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Icebound Raider Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-icebound-raider"
            ],
            "reward": {
              "experience": 296,
              "gold": 52
            }
          },
          {
            "id": "a8-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Frostbound Expanse.",
            "enemyIds": [
              "enemy-a8-icebound-raider",
              "enemy-a8-glacier-golem",
              "enemy-a8-snowblind-harrier"
            ],
            "reward": {
              "experience": 397,
              "gold": 72
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a8-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a8-hazard",
            "reward": {
              "experience": 203,
              "gold": 20
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-4",
        "name": "Frostbound Passage 4",
        "entries": [
          {
            "id": "a8-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Frost Hermit Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-frost-hermit"
            ],
            "reward": {
              "experience": 308,
              "gold": 53
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-5",
        "name": "Frostbound Passage 5",
        "entries": [
          {
            "id": "a8-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Glacier Golem Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-glacier-golem",
              "enemy-a8-rime-wolf"
            ],
            "reward": {
              "experience": 314,
              "gold": 54
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-6",
        "name": "Frostbound Passage 6",
        "entries": [
          {
            "id": "a8-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Snowblind Harrier Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-snowblind-harrier",
              "enemy-a8-icebound-raider"
            ],
            "reward": {
              "experience": 320,
              "gold": 54
            }
          },
          {
            "id": "a8-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Frostbound Expanse.",
            "enemyIds": [
              "enemy-a8-snowblind-harrier",
              "enemy-a8-aurora-wisp",
              "enemy-a8-frost-hermit"
            ],
            "reward": {
              "experience": 421,
              "gold": 72
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a8-white-pelt",
            "chance": 45
          }
        ]
      },
      {
        "id": "a8-stage-7",
        "name": "Frostbound Passage 7",
        "entries": [
          {
            "id": "a8-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rime Wolf Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-rime-wolf",
              "enemy-a8-aurora-wisp"
            ],
            "reward": {
              "experience": 326,
              "gold": 55
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-8",
        "name": "Frostbound Passage 8",
        "entries": [
          {
            "id": "a8-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Icebound Raider Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-icebound-raider",
              "enemy-a8-frost-hermit"
            ],
            "reward": {
              "experience": 332,
              "gold": 55
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-9",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a8-event-9",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a8-relic",
            "reward": {
              "experience": 203,
              "gold": 20
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-10",
        "name": "Frostbound Passage 10",
        "entries": [
          {
            "id": "a8-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Frost Hermit Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-frost-hermit",
              "enemy-a8-snowblind-harrier",
              "enemy-a8-icebound-raider"
            ],
            "reward": {
              "experience": 344,
              "gold": 56
            }
          },
          {
            "id": "a8-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Frostbound Expanse.",
            "enemyIds": [
              "enemy-a8-frost-hermit",
              "enemy-a8-rime-wolf",
              "enemy-a8-icebound-raider"
            ],
            "reward": {
              "experience": 445,
              "gold": 72
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-11",
        "name": "Frostbound Passage 11",
        "entries": [
          {
            "id": "a8-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Glacier Golem Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-glacier-golem",
              "enemy-a8-rime-wolf",
              "enemy-a8-aurora-wisp"
            ],
            "reward": {
              "experience": 350,
              "gold": 57
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a8-frostheart",
            "chance": 45
          }
        ]
      },
      {
        "id": "a8-stage-12",
        "name": "Frostbound Passage 12",
        "entries": [
          {
            "id": "a8-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Snowblind Harrier Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-snowblind-harrier",
              "enemy-a8-icebound-raider",
              "enemy-a8-frost-hermit"
            ],
            "reward": {
              "experience": 356,
              "gold": 57
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-13",
        "name": "Frostbound Passage 13",
        "entries": [
          {
            "id": "a8-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rime Wolf Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-rime-wolf",
              "enemy-a8-aurora-wisp",
              "enemy-a8-glacier-golem"
            ],
            "reward": {
              "experience": 362,
              "gold": 58
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-14",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a8-event-14",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a8-refuge",
            "reward": {
              "experience": 203,
              "gold": 20
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-15",
        "name": "Frostbound Passage 15",
        "entries": [
          {
            "id": "a8-combat-15-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Aurora Wisp Ambush",
            "description": "The path through Frostbound Expanse closes behind you.",
            "enemyIds": [
              "enemy-a8-aurora-wisp",
              "enemy-a8-glacier-golem",
              "enemy-a8-rime-wolf"
            ],
            "reward": {
              "experience": 374,
              "gold": 59
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a8-stage-16",
        "name": "Heart of Frostbound Expanse",
        "entries": [
          {
            "id": "a8-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Skara, the White Maw",
            "description": "The glacier splits beneath a roar, and Skara erupts from the ancient ice with winter burning in her jaws.",
            "enemyIds": [
              "enemy-a8-skara-white-maw",
              "enemy-a8-glacier-golem",
              "enemy-a8-snowblind-harrier"
            ],
            "reward": {
              "experience": 870,
              "gold": 208
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a8-white-maw-axe",
            "chance": 8
          },
          {
            "itemId": "item-a8-frostheart",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "stormspire-aerie",
    "name": "Stormspire Aerie",
    "description": "Stone bridges climb into a permanent storm where sky cults chain lightning to the peaks and thunderbirds guard the final ascent.",
    "recommendedLevel": 40,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/stormspire-aerie-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/stormspire-aerie-edge.webp",
    "prerequisiteAdventureId": "frostbound-expanse",
    "travelText": "Ascending the chain bridges of Stormspire",
    "completionTitle": "The Storm Unbound",
    "completionDescription": "Vaelith's chains break and the storm rolls away from the peak. The road to the Hollow Crown stands revealed.",
    "stages": [
      {
        "id": "a9-stage-1",
        "name": "Stormspire Passage 1",
        "entries": [
          {
            "id": "a9-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Thunder Talon Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-thunder-talon"
            ],
            "reward": {
              "experience": 325,
              "gold": 60
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a9-skyiron",
            "chance": 45
          }
        ]
      },
      {
        "id": "a9-stage-2",
        "name": "Stormspire Passage 2",
        "entries": [
          {
            "id": "a9-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Spire Zealot Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-spire-zealot"
            ],
            "reward": {
              "experience": 331,
              "gold": 60
            }
          },
          {
            "id": "a9-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Stormspire Aerie.",
            "enemyIds": [
              "enemy-a9-spire-zealot",
              "enemy-a9-thunderhead-colossus",
              "enemy-a9-chainwing-matron"
            ],
            "reward": {
              "experience": 444,
              "gold": 84
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a9-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a9-hazard",
            "reward": {
              "experience": 227,
              "gold": 24
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-4",
        "name": "Stormspire Passage 4",
        "entries": [
          {
            "id": "a9-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Cloud Djinn Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-cloud-djinn"
            ],
            "reward": {
              "experience": 343,
              "gold": 61
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-5",
        "name": "Stormspire Passage 5",
        "entries": [
          {
            "id": "a9-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Thunderhead Colossus Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-thunderhead-colossus",
              "enemy-a9-thunder-talon"
            ],
            "reward": {
              "experience": 349,
              "gold": 62
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-6",
        "name": "Stormspire Passage 6",
        "entries": [
          {
            "id": "a9-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Chainwing Matron Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-chainwing-matron",
              "enemy-a9-spire-zealot"
            ],
            "reward": {
              "experience": 355,
              "gold": 62
            }
          },
          {
            "id": "a9-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Stormspire Aerie.",
            "enemyIds": [
              "enemy-a9-chainwing-matron",
              "enemy-a9-storm-channeler",
              "enemy-a9-cloud-djinn"
            ],
            "reward": {
              "experience": 468,
              "gold": 84
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a9-cloudfeather",
            "chance": 45
          }
        ]
      },
      {
        "id": "a9-stage-7",
        "name": "Stormspire Passage 7",
        "entries": [
          {
            "id": "a9-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Thunder Talon Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-thunder-talon",
              "enemy-a9-storm-channeler"
            ],
            "reward": {
              "experience": 361,
              "gold": 63
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-8",
        "name": "Stormspire Passage 8",
        "entries": [
          {
            "id": "a9-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Spire Zealot Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-spire-zealot",
              "enemy-a9-cloud-djinn"
            ],
            "reward": {
              "experience": 367,
              "gold": 63
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-9",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a9-event-9",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a9-relic",
            "reward": {
              "experience": 227,
              "gold": 24
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-10",
        "name": "Stormspire Passage 10",
        "entries": [
          {
            "id": "a9-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Cloud Djinn Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-cloud-djinn",
              "enemy-a9-chainwing-matron",
              "enemy-a9-spire-zealot"
            ],
            "reward": {
              "experience": 379,
              "gold": 64
            }
          },
          {
            "id": "a9-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Stormspire Aerie.",
            "enemyIds": [
              "enemy-a9-cloud-djinn",
              "enemy-a9-thunder-talon",
              "enemy-a9-spire-zealot"
            ],
            "reward": {
              "experience": 492,
              "gold": 84
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-11",
        "name": "Stormspire Passage 11",
        "entries": [
          {
            "id": "a9-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Thunderhead Colossus Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-thunderhead-colossus",
              "enemy-a9-thunder-talon",
              "enemy-a9-storm-channeler"
            ],
            "reward": {
              "experience": 385,
              "gold": 65
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a9-storm-core",
            "chance": 45
          }
        ]
      },
      {
        "id": "a9-stage-12",
        "name": "Stormspire Passage 12",
        "entries": [
          {
            "id": "a9-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Chainwing Matron Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-chainwing-matron",
              "enemy-a9-spire-zealot",
              "enemy-a9-cloud-djinn"
            ],
            "reward": {
              "experience": 391,
              "gold": 65
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-13",
        "name": "Stormspire Passage 13",
        "entries": [
          {
            "id": "a9-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Thunder Talon Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-thunder-talon",
              "enemy-a9-storm-channeler",
              "enemy-a9-thunderhead-colossus"
            ],
            "reward": {
              "experience": 397,
              "gold": 66
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-14",
        "name": "Stormspire Passage 14",
        "entries": [
          {
            "id": "a9-combat-14-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Spire Zealot Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-spire-zealot",
              "enemy-a9-cloud-djinn",
              "enemy-a9-chainwing-matron"
            ],
            "reward": {
              "experience": 403,
              "gold": 66
            }
          },
          {
            "id": "a9-combat-14-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in Stormspire Aerie.",
            "enemyIds": [
              "enemy-a9-spire-zealot",
              "enemy-a9-thunderhead-colossus",
              "enemy-a9-chainwing-matron"
            ],
            "reward": {
              "experience": 516,
              "gold": 84
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-15",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a9-event-15",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a9-refuge",
            "reward": {
              "experience": 227,
              "gold": 24
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a9-stage-16",
        "name": "Stormspire Passage 16",
        "entries": [
          {
            "id": "a9-combat-16-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Cloud Djinn Ambush",
            "description": "The path through Stormspire Aerie closes behind you.",
            "enemyIds": [
              "enemy-a9-cloud-djinn",
              "enemy-a9-chainwing-matron",
              "enemy-a9-spire-zealot"
            ],
            "reward": {
              "experience": 415,
              "gold": 67
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a9-skyiron",
            "chance": 45
          }
        ]
      },
      {
        "id": "a9-stage-17",
        "name": "Heart of Stormspire Aerie",
        "entries": [
          {
            "id": "a9-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Vaelith, the Tempest Roc",
            "description": "Lightning crowns Vaelith as the chained colossus spreads its wings, turning the summit sky black from edge to edge.",
            "enemyIds": [
              "enemy-a9-vaelith-tempest-roc",
              "enemy-a9-thunderhead-colossus",
              "enemy-a9-chainwing-matron"
            ],
            "reward": {
              "experience": 975,
              "gold": 240
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a9-skybreaker",
            "chance": 8
          },
          {
            "itemId": "item-a9-storm-core",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "hollow-crown",
    "name": "The Hollow Crown",
    "description": "At the world's broken summit, a dead kingdom repeats its final night beneath an empty crown and a sun that never rises.",
    "recommendedLevel": 46,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/hollow-crown-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/hollow-crown-edge.webp",
    "prerequisiteAdventureId": "stormspire-aerie",
    "travelText": "Walking the silent causeway to the Hollow Crown",
    "completionTitle": "A Crown Without a King",
    "completionDescription": "Aldren's hollow crown strikes the floor and breaks. The false night lifts from Arkenfall, though deeper doors remain sealed.",
    "stages": [
      {
        "id": "a10-stage-1",
        "name": "The Passage 1",
        "entries": [
          {
            "id": "a10-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crownless Guard Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crownless-guard"
            ],
            "reward": {
              "experience": 360,
              "gold": 68
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a10-hollowsteel",
            "chance": 45
          }
        ]
      },
      {
        "id": "a10-stage-2",
        "name": "The Passage 2",
        "entries": [
          {
            "id": "a10-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Ashen Confessor Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-ashen-confessor"
            ],
            "reward": {
              "experience": 366,
              "gold": 68
            }
          },
          {
            "id": "a10-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Hollow Crown.",
            "enemyIds": [
              "enemy-a10-ashen-confessor",
              "enemy-a10-crown-seraph",
              "enemy-a10-royal-shadow"
            ],
            "reward": {
              "experience": 492,
              "gold": 95
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a10-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a10-hazard",
            "reward": {
              "experience": 251,
              "gold": 27
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-4",
        "name": "The Passage 4",
        "entries": [
          {
            "id": "a10-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Hollow Courtier Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-hollow-courtier"
            ],
            "reward": {
              "experience": 378,
              "gold": 69
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-5",
        "name": "The Passage 5",
        "entries": [
          {
            "id": "a10-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crown Seraph Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crown-seraph",
              "enemy-a10-crownless-guard"
            ],
            "reward": {
              "experience": 384,
              "gold": 70
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-6",
        "name": "The Passage 6",
        "entries": [
          {
            "id": "a10-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "The Royal Shadow Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-royal-shadow",
              "enemy-a10-ashen-confessor"
            ],
            "reward": {
              "experience": 390,
              "gold": 70
            }
          },
          {
            "id": "a10-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Hollow Crown.",
            "enemyIds": [
              "enemy-a10-royal-shadow",
              "enemy-a10-veilbound-executioner",
              "enemy-a10-hollow-courtier"
            ],
            "reward": {
              "experience": 516,
              "gold": 95
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a10-soul-ash",
            "chance": 45
          }
        ]
      },
      {
        "id": "a10-stage-7",
        "name": "The Passage 7",
        "entries": [
          {
            "id": "a10-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crownless Guard Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crownless-guard",
              "enemy-a10-veilbound-executioner"
            ],
            "reward": {
              "experience": 396,
              "gold": 71
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-8",
        "name": "The Passage 8",
        "entries": [
          {
            "id": "a10-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Ashen Confessor Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-ashen-confessor",
              "enemy-a10-hollow-courtier"
            ],
            "reward": {
              "experience": 402,
              "gold": 71
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-9",
        "name": "The Passage 9",
        "entries": [
          {
            "id": "a10-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Veilbound Executioner Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-veilbound-executioner",
              "enemy-a10-crown-seraph",
              "enemy-a10-crownless-guard"
            ],
            "reward": {
              "experience": 408,
              "gold": 72
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-10",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a10-event-10",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a10-relic",
            "reward": {
              "experience": 251,
              "gold": 27
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-11",
        "name": "The Passage 11",
        "entries": [
          {
            "id": "a10-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crown Seraph Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crown-seraph",
              "enemy-a10-crownless-guard",
              "enemy-a10-veilbound-executioner"
            ],
            "reward": {
              "experience": 420,
              "gold": 73
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a10-crown-shard",
            "chance": 45
          }
        ]
      },
      {
        "id": "a10-stage-12",
        "name": "The Passage 12",
        "entries": [
          {
            "id": "a10-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "The Royal Shadow Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-royal-shadow",
              "enemy-a10-ashen-confessor",
              "enemy-a10-hollow-courtier"
            ],
            "reward": {
              "experience": 426,
              "gold": 73
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-13",
        "name": "The Passage 13",
        "entries": [
          {
            "id": "a10-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crownless Guard Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crownless-guard",
              "enemy-a10-veilbound-executioner",
              "enemy-a10-crown-seraph"
            ],
            "reward": {
              "experience": 432,
              "gold": 74
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-14",
        "name": "The Passage 14",
        "entries": [
          {
            "id": "a10-combat-14-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Ashen Confessor Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-ashen-confessor",
              "enemy-a10-hollow-courtier",
              "enemy-a10-royal-shadow"
            ],
            "reward": {
              "experience": 438,
              "gold": 74
            }
          },
          {
            "id": "a10-combat-14-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Hollow Crown.",
            "enemyIds": [
              "enemy-a10-ashen-confessor",
              "enemy-a10-crown-seraph",
              "enemy-a10-royal-shadow"
            ],
            "reward": {
              "experience": 564,
              "gold": 95
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-15",
        "name": "The Passage 15",
        "entries": [
          {
            "id": "a10-combat-15-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Veilbound Executioner Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-veilbound-executioner",
              "enemy-a10-crown-seraph",
              "enemy-a10-crownless-guard"
            ],
            "reward": {
              "experience": 444,
              "gold": 75
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-16",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a10-event-16",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a10-refuge",
            "reward": {
              "experience": 251,
              "gold": 27
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-17",
        "name": "The Passage 17",
        "entries": [
          {
            "id": "a10-combat-17-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Crown Seraph Ambush",
            "description": "The path through The Hollow Crown closes behind you.",
            "enemyIds": [
              "enemy-a10-crown-seraph",
              "enemy-a10-crownless-guard",
              "enemy-a10-veilbound-executioner"
            ],
            "reward": {
              "experience": 456,
              "gold": 76
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a10-stage-18",
        "name": "Heart of The Hollow Crown",
        "entries": [
          {
            "id": "a10-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Aldren, the Hollow King",
            "description": "Aldren rises with the broken throne fused to his bones, and every dead courtier bows as the hollow crown ignites.",
            "enemyIds": [
              "enemy-a10-aldren-hollow-king",
              "enemy-a10-crown-seraph",
              "enemy-a10-royal-shadow"
            ],
            "reward": {
              "experience": 1080,
              "gold": 272
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a10-crown-sunder",
            "chance": 8
          },
          {
            "itemId": "item-a10-crown-shard",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "astral-scar",
    "name": "The Astral Scar",
    "description": "Beyond the Hollow Crown, a fallen star has split an ancient observatory open. Gravity twists, constellations bleed, and pilgrims kneel to something burning beneath the crater.",
    "recommendedLevel": 49,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/astral-scar-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/astral-scar-edge.webp",
    "prerequisiteAdventureId": "hollow-crown",
    "travelText": "Crossing the broken causeway toward the Astral Scar",
    "completionTitle": "The Fallen Star Extinguished",
    "completionDescription": "Seraphel collapses into a rain of quiet embers. The observatory steadies, and a stair older than the stars opens beneath the crater.",
    "stages": [
      {
        "id": "a11-stage-1",
        "name": "The Passage 1",
        "entries": [
          {
            "id": "a11-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Starved Pilgrim Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-starved-pilgrim"
            ],
            "reward": {
              "experience": 395,
              "gold": 76
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a11-star-metal",
            "chance": 45
          }
        ]
      },
      {
        "id": "a11-stage-2",
        "name": "The Passage 2",
        "entries": [
          {
            "id": "a11-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Glasswing Moth Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-glasswing-moth"
            ],
            "reward": {
              "experience": 401,
              "gold": 76
            }
          },
          {
            "id": "a11-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Astral Scar.",
            "enemyIds": [
              "enemy-a11-glasswing-moth",
              "enemy-a11-gravity-warden",
              "enemy-a11-astral-devourer"
            ],
            "reward": {
              "experience": 539,
              "gold": 106
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a11-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a11-hazard",
            "reward": {
              "experience": 276,
              "gold": 30
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-4",
        "name": "The Passage 4",
        "entries": [
          {
            "id": "a11-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Comet Hound Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-comet-hound"
            ],
            "reward": {
              "experience": 413,
              "gold": 77
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-5",
        "name": "The Passage 5",
        "entries": [
          {
            "id": "a11-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Gravity Warden Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-gravity-warden"
            ],
            "reward": {
              "experience": 419,
              "gold": 78
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-6",
        "name": "The Passage 6",
        "entries": [
          {
            "id": "a11-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Astral Devourer Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-astral-devourer",
              "enemy-a11-glasswing-moth"
            ],
            "reward": {
              "experience": 425,
              "gold": 78
            }
          },
          {
            "id": "a11-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Astral Scar.",
            "enemyIds": [
              "enemy-a11-astral-devourer",
              "enemy-a11-fallen-astrologer",
              "enemy-a11-comet-hound"
            ],
            "reward": {
              "experience": 563,
              "gold": 106
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a11-comet-silk",
            "chance": 45
          }
        ]
      },
      {
        "id": "a11-stage-7",
        "name": "The Passage 7",
        "entries": [
          {
            "id": "a11-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Starved Pilgrim Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-starved-pilgrim",
              "enemy-a11-fallen-astrologer"
            ],
            "reward": {
              "experience": 431,
              "gold": 79
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-8",
        "name": "The Passage 8",
        "entries": [
          {
            "id": "a11-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Glasswing Moth Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-glasswing-moth",
              "enemy-a11-comet-hound"
            ],
            "reward": {
              "experience": 437,
              "gold": 79
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-9",
        "name": "The Passage 9",
        "entries": [
          {
            "id": "a11-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Fallen Astrologer Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-fallen-astrologer",
              "enemy-a11-gravity-warden"
            ],
            "reward": {
              "experience": 443,
              "gold": 80
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-10",
        "name": "The Passage 10",
        "entries": [
          {
            "id": "a11-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Comet Hound Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-comet-hound",
              "enemy-a11-astral-devourer"
            ],
            "reward": {
              "experience": 449,
              "gold": 80
            }
          },
          {
            "id": "a11-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Astral Scar.",
            "enemyIds": [
              "enemy-a11-comet-hound",
              "enemy-a11-starved-pilgrim",
              "enemy-a11-glasswing-moth"
            ],
            "reward": {
              "experience": 587,
              "gold": 106
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-11",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a11-event-11",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a11-relic",
            "reward": {
              "experience": 276,
              "gold": 30
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-12",
        "name": "The Passage 12",
        "entries": [
          {
            "id": "a11-combat-12-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Astral Devourer Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-astral-devourer",
              "enemy-a11-glasswing-moth",
              "enemy-a11-comet-hound"
            ],
            "reward": {
              "experience": 461,
              "gold": 81
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-13",
        "name": "The Passage 13",
        "entries": [
          {
            "id": "a11-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Starved Pilgrim Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-starved-pilgrim",
              "enemy-a11-fallen-astrologer",
              "enemy-a11-gravity-warden"
            ],
            "reward": {
              "experience": 467,
              "gold": 82
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-14",
        "name": "The Passage 14",
        "entries": [
          {
            "id": "a11-combat-14-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Glasswing Moth Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-glasswing-moth",
              "enemy-a11-comet-hound",
              "enemy-a11-astral-devourer"
            ],
            "reward": {
              "experience": 473,
              "gold": 82
            }
          },
          {
            "id": "a11-combat-14-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The Astral Scar.",
            "enemyIds": [
              "enemy-a11-glasswing-moth",
              "enemy-a11-gravity-warden",
              "enemy-a11-astral-devourer"
            ],
            "reward": {
              "experience": 611,
              "gold": 106
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-15",
        "name": "The Passage 15",
        "entries": [
          {
            "id": "a11-combat-15-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Fallen Astrologer Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-fallen-astrologer",
              "enemy-a11-gravity-warden",
              "enemy-a11-starved-pilgrim"
            ],
            "reward": {
              "experience": 479,
              "gold": 83
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-16",
        "name": "The Passage 16",
        "entries": [
          {
            "id": "a11-combat-16-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Comet Hound Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-comet-hound",
              "enemy-a11-astral-devourer",
              "enemy-a11-glasswing-moth"
            ],
            "reward": {
              "experience": 485,
              "gold": 83
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a11-star-metal",
            "chance": 45
          }
        ]
      },
      {
        "id": "a11-stage-17",
        "name": "The Passage 17",
        "entries": [
          {
            "id": "a11-combat-17-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Gravity Warden Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-gravity-warden",
              "enemy-a11-starved-pilgrim",
              "enemy-a11-fallen-astrologer"
            ],
            "reward": {
              "experience": 491,
              "gold": 84
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-18",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a11-event-18",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a11-refuge",
            "reward": {
              "experience": 276,
              "gold": 30
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-19",
        "name": "The Passage 19",
        "entries": [
          {
            "id": "a11-combat-19-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Starved Pilgrim Ambush",
            "description": "The path through The Astral Scar closes behind you.",
            "enemyIds": [
              "enemy-a11-starved-pilgrim",
              "enemy-a11-fallen-astrologer",
              "enemy-a11-gravity-warden"
            ],
            "reward": {
              "experience": 503,
              "gold": 85
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a11-stage-20",
        "name": "Heart of The Astral Scar",
        "entries": [
          {
            "id": "a11-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Seraphel, the Fallen Star",
            "description": "The crater bends around Seraphel as the fallen giant strains against its star-metal chains and reaches for the sky it shattered.",
            "enemyIds": [
              "enemy-a11-seraphel-fallen-star",
              "enemy-a11-gravity-warden",
              "enemy-a11-astral-devourer"
            ],
            "reward": {
              "experience": 1185,
              "gold": 304
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a11-cometfall",
            "chance": 8
          },
          {
            "itemId": "item-a11-astral-glass",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "world-below",
    "name": "The World Below",
    "description": "The stair beneath the fallen star descends beyond every map. Here the roots of Arkenfall coil around a sealed hunger, and the first voices still remember how the world was made.",
    "recommendedLevel": 50,
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/world-below-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/world-below-edge.webp",
    "prerequisiteAdventureId": "astral-scar",
    "travelText": "Descending the endless stair into the World Below",
    "completionTitle": "The First Hunger Bound",
    "completionDescription": "Eidolon is driven back behind the First Gate. The roots of Arkenfall close around the wound, and the deep voices fall silent—for now.",
    "stages": [
      {
        "id": "a12-stage-1",
        "name": "The Passage 1",
        "entries": [
          {
            "id": "a12-combat-1-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rootless Titan Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-rootless-titan"
            ],
            "reward": {
              "experience": 430,
              "gold": 84
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a12-worldroot-heartwood",
            "chance": 45
          }
        ]
      },
      {
        "id": "a12-stage-2",
        "name": "The Passage 2",
        "entries": [
          {
            "id": "a12-combat-2-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Pale Burrower Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-pale-burrower"
            ],
            "reward": {
              "experience": 436,
              "gold": 84
            }
          },
          {
            "id": "a12-combat-2-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The World Below.",
            "enemyIds": [
              "enemy-a12-pale-burrower",
              "enemy-a12-firstborn-shade",
              "enemy-a12-abyssal-choir"
            ],
            "reward": {
              "experience": 586,
              "gold": 117
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-3",
        "name": "The Broken Way",
        "entries": [
          {
            "id": "a12-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a12-hazard",
            "reward": {
              "experience": 301,
              "gold": 33
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-4",
        "name": "The Passage 4",
        "entries": [
          {
            "id": "a12-combat-4-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Worldvein Elemental Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-worldvein-elemental"
            ],
            "reward": {
              "experience": 448,
              "gold": 85
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-5",
        "name": "The Passage 5",
        "entries": [
          {
            "id": "a12-combat-5-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Firstborn Shade Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-firstborn-shade"
            ],
            "reward": {
              "experience": 454,
              "gold": 86
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-6",
        "name": "The Passage 6",
        "entries": [
          {
            "id": "a12-combat-6-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Abyssal Choir Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-abyssal-choir",
              "enemy-a12-pale-burrower"
            ],
            "reward": {
              "experience": 460,
              "gold": 86
            }
          },
          {
            "id": "a12-combat-6-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The World Below.",
            "enemyIds": [
              "enemy-a12-abyssal-choir",
              "enemy-a12-deep-oracle",
              "enemy-a12-worldvein-elemental"
            ],
            "reward": {
              "experience": 610,
              "gold": 117
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a12-abyssal-hide",
            "chance": 45
          }
        ]
      },
      {
        "id": "a12-stage-7",
        "name": "The Passage 7",
        "entries": [
          {
            "id": "a12-combat-7-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rootless Titan Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-rootless-titan",
              "enemy-a12-deep-oracle"
            ],
            "reward": {
              "experience": 466,
              "gold": 87
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-8",
        "name": "The Passage 8",
        "entries": [
          {
            "id": "a12-combat-8-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Pale Burrower Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-pale-burrower",
              "enemy-a12-worldvein-elemental"
            ],
            "reward": {
              "experience": 472,
              "gold": 87
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-9",
        "name": "The Passage 9",
        "entries": [
          {
            "id": "a12-combat-9-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Deep Oracle Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-deep-oracle",
              "enemy-a12-firstborn-shade"
            ],
            "reward": {
              "experience": 478,
              "gold": 88
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-10",
        "name": "The Passage 10",
        "entries": [
          {
            "id": "a12-combat-10-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Worldvein Elemental Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-worldvein-elemental",
              "enemy-a12-abyssal-choir"
            ],
            "reward": {
              "experience": 484,
              "gold": 88
            }
          },
          {
            "id": "a12-combat-10-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The World Below.",
            "enemyIds": [
              "enemy-a12-worldvein-elemental",
              "enemy-a12-rootless-titan",
              "enemy-a12-pale-burrower"
            ],
            "reward": {
              "experience": 634,
              "gold": 117
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-11",
        "name": "The Passage 11",
        "entries": [
          {
            "id": "a12-combat-11-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Firstborn Shade Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-firstborn-shade",
              "enemy-a12-rootless-titan",
              "enemy-a12-deep-oracle"
            ],
            "reward": {
              "experience": 490,
              "gold": 89
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a12-first-echo",
            "chance": 45
          }
        ]
      },
      {
        "id": "a12-stage-12",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a12-event-12",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a12-relic",
            "reward": {
              "experience": 301,
              "gold": 33
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-13",
        "name": "The Passage 13",
        "entries": [
          {
            "id": "a12-combat-13-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rootless Titan Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-rootless-titan",
              "enemy-a12-deep-oracle",
              "enemy-a12-firstborn-shade"
            ],
            "reward": {
              "experience": 502,
              "gold": 90
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-14",
        "name": "The Passage 14",
        "entries": [
          {
            "id": "a12-combat-14-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Pale Burrower Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-pale-burrower",
              "enemy-a12-worldvein-elemental",
              "enemy-a12-abyssal-choir"
            ],
            "reward": {
              "experience": 508,
              "gold": 90
            }
          },
          {
            "id": "a12-combat-14-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The World Below.",
            "enemyIds": [
              "enemy-a12-pale-burrower",
              "enemy-a12-firstborn-shade",
              "enemy-a12-abyssal-choir"
            ],
            "reward": {
              "experience": 658,
              "gold": 117
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-15",
        "name": "The Passage 15",
        "entries": [
          {
            "id": "a12-combat-15-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Deep Oracle Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-deep-oracle",
              "enemy-a12-firstborn-shade",
              "enemy-a12-rootless-titan"
            ],
            "reward": {
              "experience": 514,
              "gold": 91
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-16",
        "name": "The Passage 16",
        "entries": [
          {
            "id": "a12-combat-16-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Worldvein Elemental Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-worldvein-elemental",
              "enemy-a12-abyssal-choir",
              "enemy-a12-pale-burrower"
            ],
            "reward": {
              "experience": 520,
              "gold": 91
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a12-worldroot-heartwood",
            "chance": 45
          }
        ]
      },
      {
        "id": "a12-stage-17",
        "name": "The Passage 17",
        "entries": [
          {
            "id": "a12-combat-17-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Firstborn Shade Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-firstborn-shade",
              "enemy-a12-rootless-titan",
              "enemy-a12-deep-oracle"
            ],
            "reward": {
              "experience": 526,
              "gold": 92
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-18",
        "name": "The Passage 18",
        "entries": [
          {
            "id": "a12-combat-18-a",
            "type": "combat",
            "chance": 65,
            "eyebrow": "Encounter",
            "title": "Abyssal Choir Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-abyssal-choir",
              "enemy-a12-pale-burrower",
              "enemy-a12-worldvein-elemental"
            ],
            "reward": {
              "experience": 532,
              "gold": 92
            }
          },
          {
            "id": "a12-combat-18-b",
            "type": "combat",
            "chance": 35,
            "eyebrow": "Elite Encounter",
            "title": "Coordinated Hunters",
            "description": "A dangerous group has prepared the ground in The World Below.",
            "enemyIds": [
              "enemy-a12-abyssal-choir",
              "enemy-a12-deep-oracle",
              "enemy-a12-worldvein-elemental"
            ],
            "reward": {
              "experience": 682,
              "gold": 117
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-19",
        "name": "The Passage 19",
        "entries": [
          {
            "id": "a12-combat-19-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Rootless Titan Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-rootless-titan",
              "enemy-a12-deep-oracle",
              "enemy-a12-firstborn-shade"
            ],
            "reward": {
              "experience": 538,
              "gold": 93
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-20",
        "name": "A Last Shelter",
        "entries": [
          {
            "id": "a12-event-20",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "A choice on the road",
            "description": "",
            "eventId": "event-a12-refuge",
            "reward": {
              "experience": 301,
              "gold": 33
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a12-stage-21",
        "name": "The Passage 21",
        "entries": [
          {
            "id": "a12-combat-21-a",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Encounter",
            "title": "Deep Oracle Ambush",
            "description": "The path through The World Below closes behind you.",
            "enemyIds": [
              "enemy-a12-deep-oracle",
              "enemy-a12-firstborn-shade",
              "enemy-a12-rootless-titan"
            ],
            "reward": {
              "experience": 550,
              "gold": 94
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "item-a12-abyssal-hide",
            "chance": 45
          }
        ]
      },
      {
        "id": "a12-stage-22",
        "name": "Heart of The World Below",
        "entries": [
          {
            "id": "a12-boss",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Eidolon, the First Hunger",
            "description": "The First Gate buckles inward. Countless limbs claw into the chamber as Eidolon speaks your name in the voice of a starving world.",
            "enemyIds": [
              "enemy-a12-eidolon-first-hunger",
              "enemy-a12-firstborn-shade",
              "enemy-a12-abyssal-choir"
            ],
            "reward": {
              "experience": 1290,
              "gold": 336
            }
          }
        ],
        "dropTable": [
          {
            "itemId": "gear-a12-worldsplitter",
            "chance": 8
          },
          {
            "itemId": "item-a12-first-echo",
            "chance": 100
          }
        ]
      }
    ]
  },
  {
    "id": "sepulcher-of-hours",
    "name": "The Sepulcher of Hours",
    "description": "A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.",
    "recommendedLevel": 54,
    "prerequisiteAdventureId": "world-below",
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/sepulcher-of-hours-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/sepulcher-of-hours-edge.webp",
    "travelText": "Descending through the clocks beneath the dead",
    "completionTitle": "The Last Bell Falls Silent",
    "completionDescription": "Oris shatters with the final hourglass. For the first time in an age, the dead are permitted to keep their endings.",
    "stages": [
      {
        "id": "a13-stage-1",
        "name": "The Outer Threshold",
        "entries": [
          {
            "id": "a13-combat-1",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Hourglass Revenant Formation",
            "description": "The forces of The Sepulcher of Hours execute a prepared formation.",
            "enemyIds": [
              "enemy-a13-hourglass-revenant",
              "enemy-a13-chronowound-knight"
            ],
            "reward": {
              "experience": 755,
              "gold": 167
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a13-stage-2",
        "name": "The Returning Guard",
        "entries": [
          {
            "id": "a13-combat-2",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Chronowound Knight Formation",
            "description": "The forces of The Sepulcher of Hours execute a prepared formation.",
            "enemyIds": [
              "enemy-a13-ashen-mourner",
              "enemy-a13-hourglass-revenant",
              "enemy-a13-secondhand-assassin"
            ],
            "reward": {
              "experience": 790,
              "gold": 189
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a13-stage-3",
        "name": "The Remnant's Choice",
        "entries": [
          {
            "id": "a13-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "The Broken Hour",
            "description": "The path narrows around a choice that cannot be undone.",
            "eventId": "event-a13-broken-hour",
            "reward": {
              "experience": 825,
              "gold": 211
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a13-stage-4",
        "name": "The Deathless Formation",
        "entries": [
          {
            "id": "a13-combat-4",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Secondhand Assassin Formation",
            "description": "The forces of The Sepulcher of Hours execute a prepared formation.",
            "enemyIds": [
              "enemy-a13-ashen-mourner",
              "enemy-a13-chronowound-knight",
              "enemy-a13-secondhand-assassin"
            ],
            "reward": {
              "experience": 860,
              "gold": 233
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a13-stage-5",
        "name": "Heart of The Sepulcher of Hours",
        "entries": [
          {
            "id": "a13-boss-5",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Oris, Keeper of Last Dawn",
            "description": "The forces of The Sepulcher of Hours execute a prepared formation.",
            "enemyIds": [
              "enemy-a13-oris-last-dawn",
              "enemy-a13-ashen-mourner",
              "enemy-a13-hourglass-revenant"
            ],
            "reward": {
              "experience": 1750,
              "gold": 520
            }
          }
        ],
        "dropTable": []
      }
    ]
  },
  {
    "id": "sanguine-basilica",
    "name": "The Sanguine Basilica",
    "description": "A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.",
    "recommendedLevel": 58,
    "prerequisiteAdventureId": "sepulcher-of-hours",
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/sanguine-basilica-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/sanguine-basilica-edge.webp",
    "travelText": "Climbing the red steps of the blood-lit basilica",
    "completionTitle": "The Basilica Runs Dry",
    "completionDescription": "Veyra's stolen blood drains through the black marble. The bells toll once for the lives that can finally remain dead.",
    "stages": [
      {
        "id": "a14-stage-1",
        "name": "The Outer Threshold",
        "entries": [
          {
            "id": "a14-combat-1",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Crimson Penitent Formation",
            "description": "The forces of The Sanguine Basilica execute a prepared formation.",
            "enemyIds": [
              "enemy-a14-crimson-penitent",
              "enemy-a14-vein-choir"
            ],
            "reward": {
              "experience": 865,
              "gold": 167
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a14-stage-2",
        "name": "The Returning Guard",
        "entries": [
          {
            "id": "a14-combat-2",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Vein Choir Formation",
            "description": "The forces of The Sanguine Basilica execute a prepared formation.",
            "enemyIds": [
              "enemy-a14-bloodwake-hierophant",
              "enemy-a14-crimson-penitent",
              "enemy-a14-reliquary-gargoyle"
            ],
            "reward": {
              "experience": 900,
              "gold": 189
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a14-stage-3",
        "name": "The Remnant's Choice",
        "entries": [
          {
            "id": "a14-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "The Living Reliquary",
            "description": "The path narrows around a choice that cannot be undone.",
            "eventId": "event-a14-living-reliquary",
            "reward": {
              "experience": 935,
              "gold": 211
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a14-stage-4",
        "name": "The Deathless Formation",
        "entries": [
          {
            "id": "a14-combat-4",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Reliquary Gargoyle Formation",
            "description": "The forces of The Sanguine Basilica execute a prepared formation.",
            "enemyIds": [
              "enemy-a14-bloodwake-hierophant",
              "enemy-a14-vein-choir",
              "enemy-a14-reliquary-gargoyle"
            ],
            "reward": {
              "experience": 970,
              "gold": 233
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a14-stage-5",
        "name": "Heart of The Sanguine Basilica",
        "entries": [
          {
            "id": "a14-boss-5",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Saint Veyra, the Undying",
            "description": "The forces of The Sanguine Basilica execute a prepared formation.",
            "enemyIds": [
              "enemy-a14-saint-veyra-undying",
              "enemy-a14-bloodwake-hierophant",
              "enemy-a14-reliquary-gargoyle"
            ],
            "reward": {
              "experience": 1990,
              "gold": 605
            }
          }
        ],
        "dropTable": []
      }
    ]
  },
  {
    "id": "dreaming-wilds",
    "name": "The Dreaming Wilds",
    "description": "A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.",
    "recommendedLevel": 62,
    "prerequisiteAdventureId": "sanguine-basilica",
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/dreaming-wilds-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/dreaming-wilds-edge.webp",
    "travelText": "Following a path that changes whenever you blink",
    "completionTitle": "The Dream Releases Its Roots",
    "completionDescription": "Morwyn wakes for one lucid breath and lets the nightmare canopy dissolve into quiet silver rain.",
    "stages": [
      {
        "id": "a15-stage-1",
        "name": "The Outer Threshold",
        "entries": [
          {
            "id": "a15-combat-1",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Nightmare Stag Formation",
            "description": "The forces of The Dreaming Wilds execute a prepared formation.",
            "enemyIds": [
              "enemy-a15-nightmare-stag",
              "enemy-a15-dream-eater-moth"
            ],
            "reward": {
              "experience": 975,
              "gold": 167
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a15-stage-2",
        "name": "The Returning Guard",
        "entries": [
          {
            "id": "a15-combat-2",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Dream-Eater Moth Formation",
            "description": "The forces of The Dreaming Wilds execute a prepared formation.",
            "enemyIds": [
              "enemy-a15-somnolent-dryad",
              "enemy-a15-nightmare-stag",
              "enemy-a15-briar-doppelganger"
            ],
            "reward": {
              "experience": 1010,
              "gold": 189
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a15-stage-3",
        "name": "The Remnant's Choice",
        "entries": [
          {
            "id": "a15-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "The Sleeping Moon",
            "description": "The path narrows around a choice that cannot be undone.",
            "eventId": "event-a15-sleeping-moon",
            "reward": {
              "experience": 1045,
              "gold": 211
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a15-stage-4",
        "name": "The Deathless Formation",
        "entries": [
          {
            "id": "a15-combat-4",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Briar Doppelganger Formation",
            "description": "The forces of The Dreaming Wilds execute a prepared formation.",
            "enemyIds": [
              "enemy-a15-somnolent-dryad",
              "enemy-a15-dream-eater-moth",
              "enemy-a15-briar-doppelganger"
            ],
            "reward": {
              "experience": 1080,
              "gold": 233
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a15-stage-5",
        "name": "Heart of The Dreaming Wilds",
        "entries": [
          {
            "id": "a15-boss-5",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Morwyn, Root of Dreams",
            "description": "The forces of The Dreaming Wilds execute a prepared formation.",
            "enemyIds": [
              "enemy-a15-morwyn-root-of-dreams",
              "enemy-a15-somnolent-dryad",
              "enemy-a15-nightmare-stag"
            ],
            "reward": {
              "experience": 2230,
              "gold": 690
            }
          }
        ],
        "dropTable": []
      }
    ]
  },
  {
    "id": "iron-eclipse",
    "name": "The Iron Eclipse",
    "description": "A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.",
    "recommendedLevel": 66,
    "prerequisiteAdventureId": "dreaming-wilds",
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/iron-eclipse-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/iron-eclipse-edge.webp",
    "travelText": "Crossing the foundry beneath the black sun",
    "completionTitle": "The Black Sun Powers Down",
    "completionDescription": "Axiom-9's last command expires. The eclipse opens, revealing stars no machine had allowed the world to see.",
    "stages": [
      {
        "id": "a16-stage-1",
        "name": "The Outer Threshold",
        "entries": [
          {
            "id": "a16-combat-1",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Eclipse Centurion Formation",
            "description": "The forces of The Iron Eclipse execute a prepared formation.",
            "enemyIds": [
              "enemy-a16-eclipse-centurion",
              "enemy-a16-nullstar-artificer"
            ],
            "reward": {
              "experience": 1085,
              "gold": 167
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a16-stage-2",
        "name": "The Returning Guard",
        "entries": [
          {
            "id": "a16-combat-2",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Nullstar Artificer Formation",
            "description": "The forces of The Iron Eclipse execute a prepared formation.",
            "enemyIds": [
              "enemy-a16-continuance-engine",
              "enemy-a16-eclipse-centurion",
              "enemy-a16-black-sun-harrier"
            ],
            "reward": {
              "experience": 1120,
              "gold": 189
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a16-stage-3",
        "name": "The Remnant's Choice",
        "entries": [
          {
            "id": "a16-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "The Zero Foundry",
            "description": "The path narrows around a choice that cannot be undone.",
            "eventId": "event-a16-zero-foundry",
            "reward": {
              "experience": 1155,
              "gold": 211
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a16-stage-4",
        "name": "The Deathless Formation",
        "entries": [
          {
            "id": "a16-combat-4",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Black-Sun Harrier Formation",
            "description": "The forces of The Iron Eclipse execute a prepared formation.",
            "enemyIds": [
              "enemy-a16-continuance-engine",
              "enemy-a16-nullstar-artificer",
              "enemy-a16-black-sun-harrier"
            ],
            "reward": {
              "experience": 1190,
              "gold": 233
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a16-stage-5",
        "name": "Heart of The Iron Eclipse",
        "entries": [
          {
            "id": "a16-boss-5",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Axiom-9, the Final Engine",
            "description": "The forces of The Iron Eclipse execute a prepared formation.",
            "enemyIds": [
              "enemy-a16-axiom-9-final-engine",
              "enemy-a16-continuance-engine",
              "enemy-a16-black-sun-harrier"
            ],
            "reward": {
              "experience": 2470,
              "gold": 775
            }
          }
        ],
        "dropTable": []
      }
    ]
  },
  {
    "id": "throne-beyond-death",
    "name": "The Throne Beyond Death",
    "description": "A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.",
    "recommendedLevel": 70,
    "prerequisiteAdventureId": "iron-eclipse",
    "theme": "custom",
    "cardImageUrl": "/assets/backgrounds/throne-beyond-death-adventure.webp",
    "combatBackgroundUrl": "/assets/backgrounds/throne-beyond-death-edge.webp",
    "travelText": "Walking the road reserved for souls without graves",
    "completionTitle": "No Throne Is Eternal",
    "completionDescription": "Nhal's crown breaks into seven dying stars. The road back to Arkenfall opens, and every soul behind you remembers how to move on.",
    "stages": [
      {
        "id": "a17-stage-1",
        "name": "The Outer Threshold",
        "entries": [
          {
            "id": "a17-combat-1",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Oathless Seraph Formation",
            "description": "The forces of The Throne Beyond Death execute a prepared formation.",
            "enemyIds": [
              "enemy-a17-oathless-seraph",
              "enemy-a17-grave-tide-leviathan"
            ],
            "reward": {
              "experience": 1195,
              "gold": 167
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a17-stage-2",
        "name": "The Returning Guard",
        "entries": [
          {
            "id": "a17-combat-2",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Grave-Tide Leviathan Formation",
            "description": "The forces of The Throne Beyond Death execute a prepared formation.",
            "enemyIds": [
              "enemy-a17-soulbound-archon",
              "enemy-a17-oathless-seraph",
              "enemy-a17-crown-eater"
            ],
            "reward": {
              "experience": 1230,
              "gold": 189
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a17-stage-3",
        "name": "The Remnant's Choice",
        "entries": [
          {
            "id": "a17-event-3",
            "type": "event",
            "chance": 100,
            "eyebrow": "Event",
            "title": "The Empty Coronation",
            "description": "The path narrows around a choice that cannot be undone.",
            "eventId": "event-a17-empty-coronation",
            "reward": {
              "experience": 1265,
              "gold": 211
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a17-stage-4",
        "name": "The Deathless Formation",
        "entries": [
          {
            "id": "a17-combat-4",
            "type": "combat",
            "chance": 100,
            "eyebrow": "Endgame Encounter",
            "title": "Crown-Eater Formation",
            "description": "The forces of The Throne Beyond Death execute a prepared formation.",
            "enemyIds": [
              "enemy-a17-soulbound-archon",
              "enemy-a17-grave-tide-leviathan",
              "enemy-a17-crown-eater"
            ],
            "reward": {
              "experience": 1300,
              "gold": 233
            }
          }
        ],
        "dropTable": []
      },
      {
        "id": "a17-stage-5",
        "name": "Heart of The Throne Beyond Death",
        "entries": [
          {
            "id": "a17-boss-5",
            "type": "boss",
            "chance": 100,
            "eyebrow": "Boss Encounter",
            "title": "Nhal, Sovereign of Returning",
            "description": "The forces of The Throne Beyond Death execute a prepared formation.",
            "enemyIds": [
              "enemy-a17-nhal-sovereign-returning",
              "enemy-a17-soulbound-archon",
              "enemy-a17-oathless-seraph"
            ],
            "reward": {
              "experience": 2710,
              "gold": 860
            }
          }
        ],
        "dropTable": []
      }
    ]
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
