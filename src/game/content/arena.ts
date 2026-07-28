import type { AdventureDefinition } from "../types";

export const ARENA_ADVENTURE_ID = "arkenfall-arena";
export const ARENA_CHAMPION_ID = "arena-champion";
export const ARENA_CHAMPION_MAX_HP = 1_000_000;

export const ARENA_ADVENTURE: AdventureDefinition = {
  id: ARENA_ADVENTURE_ID,
  name: "Arkenfall Grand Arena",
  description: "A ten-turn damage trial against Arkenfall's undefeated champion.",
  recommendedLevel: 1,
  theme: "custom",
  cardImageUrl: "/assets/town/arena-destination.webp",
  combatBackgroundUrl: "/assets/backgrounds/arkenfall-arena-combat.webp",
  travelText: "Entering the Grand Arena",
  stages: [{
    id: "arena-damage-trial",
    name: "Champion's Trial",
    entries: [{
      id: "arena-champion-trial",
      type: "boss",
      chance: 100,
      eyebrow: "Ten-Turn Damage Trial",
      title: "Arena Champion",
      description: "Deal as much damage as possible before the arena bell ends your tenth turn.",
      enemyIds: [ARENA_CHAMPION_ID],
      reward: { experience: 0, gold: 0 },
    }],
  }],
  completionTitle: "Damage Recorded",
  completionDescription: "Your result has been added to the Hall of Challengers.",
};
