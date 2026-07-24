import type { AdventureDefinition, AdventureEventDefinition, AdventureNode } from "../types";

export const ADVENTURE_EVENTS: Record<string, AdventureEventDefinition> = {
  "brokenFootbridge": {
    "id": "brokenFootbridge",
    "name": "The Broken Footbridge",
    "eyebrow": "Forest Event",
    "description": "A rain-swollen stream has torn the footbridge from its anchors. The opposite bank is close, but the current is fast.",
    "choices": [
      {
        "id": "leap",
        "label": "Leap the gap",
        "description": "Trust your footing and clear the broken span.",
        "stat": "agility",
        "threshold": 62,
        "success": {
          "text": "You land lightly and find a dropped coin purse in the grass.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 8
            }
          ]
        },
        "failure": {
          "text": "The wet timber gives way. You strike the stones before hauling yourself ashore.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 8
            }
          ]
        }
      },
      {
        "id": "ford",
        "label": "Ford the stream",
        "description": "Push through the current and keep your pack above water.",
        "stat": "vitality",
        "threshold": 58,
        "success": {
          "text": "You withstand the freezing current and emerge invigorated.",
          "effects": [
            {
              "type": "heal",
              "amount": 10
            }
          ]
        },
        "failure": {
          "text": "The current batters you against the grey stones.",
          "effects": [
            {
              "type": "loseHealth",
              "amount": 6
            }
          ]
        }
      },
      {
        "id": "repair",
        "label": "Repair the bridge",
        "description": "Read the old joinery and bind the span back together.",
        "stat": "intelligence",
        "threshold": 65,
        "success": {
          "text": "The repaired crossing holds. A grateful traveller rewards your work.",
          "effects": [
            {
              "type": "gainGold",
              "amount": 12
            },
            {
              "type": "gainExperience",
              "amount": 15
            }
          ]
        },
        "failure": {
          "text": "The repair consumes time and supplies, but the rotten frame will not hold.",
          "effects": [
            {
              "type": "loseGold",
              "amount": 4
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
            "chance": 100,
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
            "chance": 100,
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
