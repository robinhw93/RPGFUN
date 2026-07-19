import { ADVENTURE } from "./data";
import { getDerivedStats } from "./character";
import { getLoot } from "./gear";
import { addExperience } from "./progression";
import type { CombatReward, GameState } from "./types";

/** Applies a combat reward once and stores the presentation snapshot used by the score screen. */
export function grantCombatReward(state: GameState, timestamp = Date.now()): GameState {
  const adventure = state.adventure;
  if (adventure.combat?.outcome !== "victory" || adventure.pendingReward?.nodeIndex === adventure.nodeIndex) return state;

  const rewardDefinition = ADVENTURE[adventure.nodeIndex]?.reward;
  if (!rewardDefinition) return state;

  const lootTemplate = rewardDefinition.loot ? getLoot(adventure.nodeIndex, getDerivedStats(state.character).lootRarityBonus) : null;
  const loot = lootTemplate ? { ...lootTemplate, id: `${lootTemplate.id}-${adventure.nodeIndex}-${timestamp}` } : null;
  const experience = addExperience(state.character, rewardDefinition.experience);
  const reward: CombatReward = {
    id: `combat-reward-${adventure.nodeIndex}-${timestamp}`,
    nodeIndex: adventure.nodeIndex,
    experience: rewardDefinition.experience,
    gold: rewardDefinition.gold,
    loot,
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
      inventory: loot ? [...experience.character.inventory, loot] : experience.character.inventory,
    },
    adventure: { ...adventure, latestLoot: loot, pendingReward: reward },
  };
}
