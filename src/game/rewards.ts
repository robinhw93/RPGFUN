import { getAdventureDefinition, getAdventureNode } from "./adventures";
import { ITEMS } from "./data";
import { addExperience, experienceForLevelGains } from "./progression";
import type { CombatReward, GameState, InventoryItem, ItemDropDefinition } from "./types";

export function rollItemDropTable(
  dropTable: ItemDropDefinition[] | undefined,
  random: () => number = Math.random,
): InventoryItem[] {
  if (!dropTable?.length) return [];
  const itemsById = new Map(ITEMS.map((item) => [item.id, item]));
  return dropTable.flatMap((drop) => {
    const chance = Math.min(100, Math.max(0, drop.chance));
    const item = itemsById.get(drop.itemId);
    return item && chance > 0 && random() * 100 < chance ? [structuredClone(item)] : [];
  });
}

export function rollCombatLoot(state: GameState, random: () => number = Math.random): InventoryItem[] {
  const enemyDropTables = state.adventure.combat?.enemies.map((enemy) => enemy.dropTable) ?? [];
  const stageDropTable = state.adventure.mode === "endless"
    ? undefined
    : getAdventureDefinition(state.adventure.adventureId).stages[state.adventure.nodeIndex]?.dropTable;
  return rollCombatDropTables(enemyDropTables, stageDropTable, random);
}

export function rollCombatDropTables(
  enemyDropTables: Array<ItemDropDefinition[] | undefined>,
  stageDropTable: ItemDropDefinition[] | undefined,
  random: () => number = Math.random,
): InventoryItem[] {
  return [
    ...enemyDropTables.flatMap((dropTable) => rollItemDropTable(dropTable, random)),
    ...rollItemDropTable(stageDropTable, random),
  ];
}

/** Applies a combat reward once and stores the presentation snapshot used by the score screen. */
export function grantCombatReward(state: GameState, timestamp = Date.now(), random: () => number = Math.random): GameState {
  const adventure = state.adventure;
  if (adventure.combat?.outcome !== "victory" || adventure.pendingReward?.nodeIndex === adventure.nodeIndex) return state;

  const rewardDefinition = adventure.mode === "endless"
    ? { experience: experienceForLevelGains(state.character.level, state.character.xp, 2), gold: 0 }
    : getAdventureNode(adventure).reward;
  if (!rewardDefinition) return state;

  const experience = addExperience(state.character, rewardDefinition.experience);
  const loot = rollCombatLoot(state, random);
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
      inventory: [...experience.character.inventory, ...loot.map((item) => structuredClone(item))],
    },
    adventure: { ...adventure, latestLoot: loot.length > 0 ? loot : null, pendingReward: reward },
  };
}
