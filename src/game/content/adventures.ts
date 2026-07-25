import type { AdventureDefinition, AdventureEventDefinition, AdventureNode } from "../types";

export const ADVENTURE_EVENTS: Record<string, AdventureEventDefinition> = {
  "brokenFootbridge": {
    "id": "brokenFootbridge",
    "name": "Stalked by Wolves",
    "eyebrow": "Event",
    "description": "You hear rustling in the bushes not far behind you and realize that two wolves are stalking you.",
    "choices": [
      {
        "id": "climb",
        "label": "Climb up a tree",
        "description": "You climb up a tree to wait them out.",
        "stat": "agility",
        "threshold": 29,
        "success": {
          "text": "You make it up the tree and wait them out. You study the wolves' behaviour and gain 10 experience.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "You do not make it up the tree before the wolves pounce.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxj4o6o-o45ia",
              "count": 2,
              "experience": 71,
              "gold": 5
            }
          ]
        }
      },
      {
        "id": "ford",
        "label": "Scare them off",
        "description": "You attempt to scare the wolves away by making yourself big and threatening.",
        "stat": "strength",
        "threshold": 31,
        "success": {
          "text": "The wolves run away. You feel a renewed confidence grow within. Start next combat with Fierce.",
          "effects": [
            {
              "type": "playerNextCombatBuff",
              "status": "fierce",
              "stacks": 1
            }
          ]
        },
        "failure": {
          "text": "The wolves do not seem intimidated and leap at you.",
          "effects": [
            {
              "type": "immediateEncounter",
              "enemyId": "enemy-mrxj4o6o-o45ia",
              "count": 2,
              "experience": 71,
              "gold": 5
            }
          ]
        }
      },
      {
        "id": "repair",
        "label": "Keep walking",
        "description": "You keep walking and attempt to hide your tracks and scent from the wolves.",
        "stat": "intelligence",
        "threshold": 34,
        "success": {
          "text": "After a while you stop hearing the rustling in the bushes. It seems you were successful in avoiding the wolves, and gain 10 experience.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "In your attempt to lose the wolves, you become lost in the forest. Tired from the extra walk, you start the next combat with Weaken.",
          "effects": [
            {
              "type": "playerNextCombatDebuff",
              "status": "weaken",
              "stacks": 1
            }
          ]
        }
      }
    ]
  },
  "singingGrove": {
    "id": "singingGrove",
    "name": "The Singing Grove",
    "eyebrow": "Forest Event",
    "description": "Silver leaves turn without wind. Their song pulls at a memory you cannot quite name.",
    "choices": [
      {
        "id": "listen",
        "label": "Listen to the song",
        "description": "Let the grove's strange harmony guide you.",
        "stat": "luck",
        "threshold": 60,
        "success": {
          "text": "The melody settles into your bones and reveals a hidden cache.",
          "effects": [
            {
              "type": "heal",
              "amount": 6
            },
            {
              "type": "gainGold",
              "amount": 10
            },
            {
              "type": "gainExperience",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "The song leads you in circles until exhaustion breaks its hold.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 7
            }
          ]
        }
      },
      {
        "id": "mark",
        "label": "Mark a safe path",
        "description": "Ignore the song and navigate by bark, stone, and shadow.",
        "stat": "intelligence",
        "threshold": 55,
        "success": {
          "text": "Your marks lead cleanly through the shifting grove.",
          "effects": [
            {
              "type": "gainExperience",
              "amount": 18
            }
          ]
        },
        "failure": {
          "text": "Every mark appears twice. You escape only after a punishing detour.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 5
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
            "chance": 1,
            "eyebrow": "Forest Encounter",
            "title": "Rustling in the Clover",
            "description": "Two rabid rats burst from the sunlit undergrowth and close around the path.",
            "enemyIds": [
              "enemy-mrxiut2a-k4kgv",
              "enemy-mrxiut2a-k4kgv"
            ],
            "reward": {
              "experience": 50,
              "gold": 3
            }
          },
          {
            "id": "barkl",
            "type": "event",
            "chance": 99,
            "eyebrow": "Event",
            "title": "Stalked by Wolves",
            "description": "You hear rustling in the bushes not far behind you and realize that two wolves are stalking you.",
            "eventId": "brokenFootbridge"
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
              "experience": 53,
              "gold": 8
            }
          }
        ]
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
              "experience": 73,
              "gold": 6
            }
          }
        ]
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
            "description": "The spirit does not welcome you here.",
            "enemyIds": [
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 36,
              "gold": 5
            }
          }
        ]
      },
      {
        "id": "stage-mrxmqkyi-ydjnl",
        "name": "Dark Forest",
        "entries": [
          {
            "id": "entry-mrxmqmcg-ppgfa",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "They see you",
            "description": "Three Wisps silently glide down from the treetops.",
            "enemyIds": [
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 68,
              "gold": 10
            }
          },
          {
            "id": "entry-mrypo1bf-8fddw",
            "type": "combat",
            "chance": 50,
            "eyebrow": "Encounter",
            "title": "Bear Danger",
            "description": "You do not see it until it is too late. The Brown Bear charges at you, roaring.",
            "enemyIds": [
              "enemy-mrxkar5z-g9o5d"
            ],
            "reward": {
              "experience": 58,
              "gold": 8
            }
          }
        ]
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
            "description": "Before you, it rises—the thing that enrages the woodland animals: the Forest Spirit.",
            "enemyIds": [
              "enemy-mrxkjqs3-g7g5i",
              "enemy-mrxk609z-n04fq",
              "enemy-mrxk609z-n04fq"
            ],
            "reward": {
              "experience": 100,
              "gold": 28
            }
          }
        ]
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
