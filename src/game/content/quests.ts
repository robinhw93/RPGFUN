import type { QuestDefinition, QuestlineDefinition } from "../types";

export const QUESTS: QuestDefinition[] = [
  {
    id: "quest-rats-at-the-storehouses",
    title: "Rats at the Storehouses",
    description: "The grain keepers need someone to thin the swarms nesting along the forest road.",
    objective: { type: "kill_enemy", enemyId: "enemy-mrxiut2a-k4kgv", quantity: 3 },
    reward: { experience: 35, items: [{ itemId: "consumable-ms0e551z-v6qcf", quantity: 1 }] },
  },
  {
    id: "quest-tails-for-the-tally",
    title: "Tails for the Tally",
    description: "Bring back proof that the storehouse paths are being cleared of vermin.",
    objective: { type: "collect_item", itemId: "item-ms0jej41-7sii2", quantity: 2 },
    reward: { experience: 50, items: [] },
  },
  {
    id: "quest-quiet-the-windsong",
    title: "Quiet the Windsong",
    description: "See the trouble in Windsong Forest through to its end and return with news of the road.",
    objective: { type: "complete_adventure", adventureId: "windsong-forest", quantity: 1 },
    reward: { experience: 100, items: [{ itemId: "item-ms0jf0sp-z8hcl", quantity: 1 }] },
  },
];

export const QUESTLINES: QuestlineDefinition[] = [
  {
    id: "questline-storehouse-troubles",
    title: "Storehouse Troubles",
    description: "A chain of notices concerning the creatures threatening Arkenfall's food stores.",
    questIds: ["quest-rats-at-the-storehouses", "quest-tails-for-the-tally", "quest-quiet-the-windsong"],
  },
];
