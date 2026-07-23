import { getDerivedStats } from "./character";
import { getAdventureNode } from "./adventures";
import { getLoot } from "./gear";
import { addExperience, experienceForLevelGains } from "./progression";
import type { CombatReward, GameState } from "./types";

/** Applies a combat reward once and stores the presentation snapshot used by the score screen. */
export function grantCombatReward(state: GameState, timestamp = Date.now()): GameState {
  const adventure = state.adventure;
  if (adventure.combat?.outcome !== "victory" || adventure.pendingReward?.nodeIndex === adventure.nodeIndex) return state;

  const rewardDefinition = adventure.mode === "endless"
    ? { experience: experienceForLevelGains(state.character.level, state.character.xp, 2), gold: 0, loot: false }
    : getAdventureNode(adventure).reward;
  if (!rewardDefinition) return state;

  const lootTemplate = rewardDefinition.loot ? getLoot(adventure.nodeIndex, getDerivedStats(state.character).lootRarityBonus, adventure.adventureId) : null;
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
