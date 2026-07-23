import { getAdventureNode } from "./adventures";
import { addExperience, experienceForLevelGains } from "./progression";
import type { CombatReward, GameState } from "./types";

/** Applies a combat reward once and stores the presentation snapshot used by the score screen. */
export function grantCombatReward(state: GameState, timestamp = Date.now()): GameState {
  const adventure = state.adventure;
  if (adventure.combat?.outcome !== "victory" || adventure.pendingReward?.nodeIndex === adventure.nodeIndex) return state;

  const rewardDefinition = adventure.mode === "endless"
    ? { experience: experienceForLevelGains(state.character.level, state.character.xp, 2), gold: 0 }
    : getAdventureNode(adventure).reward;
  if (!rewardDefinition) return state;

  const experience = addExperience(state.character, rewardDefinition.experience);
  const reward: CombatReward = {
    id: `combat-reward-${adventure.nodeIndex}-${timestamp}`,
    nodeIndex: adventure.nodeIndex,
    experience: rewardDefinition.experience,
    gold: rewardDefinition.gold,
    loot: null,
    levelBefore: experience.levelBefore,
    xpBefore: experience.xpBefore,
    levelAfter: experience.levelAfter,
    xpAfter: experience.xpAfter,
    levelsGained: experience.levelsGained,
  };

  return {
    ...state,
    character: {
      ...experience.character,
      gold: experience.character.gold + rewardDefinition.gold,
    },
    adventure: { ...adventure, latestLoot: null, pendingReward: reward },
  };
}
