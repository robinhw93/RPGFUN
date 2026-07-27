import { ADVENTURES, ENEMIES, ITEMS, QUESTLINES, QUESTS } from "./data";
import { acquireItems } from "./items";
import { addExperience } from "./progression";
import type { CharacterState, GameState, InventoryItem, QuestDefinition, QuestlineDefinition } from "./types";

export type QuestAvailability = "available" | "accepted" | "ready" | "completed" | "locked";

export interface QuestActionResult {
  state: GameState;
  success: boolean;
  message: string;
  quest?: QuestDefinition;
}

export function getQuestDefinition(questId: string): QuestDefinition | undefined {
  return QUESTS.find((quest) => quest.id === questId);
}

export function getQuestlineForQuest(questId: string): QuestlineDefinition | undefined {
  return QUESTLINES.find((questline) => questline.questIds.includes(questId));
}

export function getQuestObjectiveProgress(character: CharacterState, quest: QuestDefinition): number {
  if (quest.objective.type === "collect_item") {
    const itemId = quest.objective.itemId;
    return character.inventory.filter((item) => item.id === itemId).length;
  }
  return Math.max(0, Math.floor(character.questProgress[quest.id] ?? 0));
}

export function isQuestObjectiveComplete(character: CharacterState, quest: QuestDefinition): boolean {
  return getQuestObjectiveProgress(character, quest) >= quest.objective.quantity;
}

export function getQuestAvailability(character: CharacterState, quest: QuestDefinition): QuestAvailability {
  if (character.completedQuestIds.includes(quest.id)) return "completed";
  if (character.acceptedQuestIds.includes(quest.id)) return isQuestObjectiveComplete(character, quest) ? "ready" : "accepted";
  const questline = getQuestlineForQuest(quest.id);
  if (!questline) return "available";
  const index = questline.questIds.indexOf(quest.id);
  return index <= 0 || questline.questIds.slice(0, index).every((questId) => character.completedQuestIds.includes(questId))
    ? "available"
    : "locked";
}

export function describeQuestObjective(quest: QuestDefinition): string {
  const objective = quest.objective;
  if (objective.type === "kill_enemy") {
    const enemy = ENEMIES[objective.enemyId];
    return `Defeat ${objective.quantity}× ${enemy?.name ?? "selected enemy"}.`;
  }
  if (objective.type === "collect_item") {
    const item = ITEMS.find((candidate) => candidate.id === objective.itemId);
    return `Bring ${objective.quantity}× ${item?.name ?? "selected item"}.`;
  }
  const adventure = ADVENTURES.find((candidate) => candidate.id === objective.adventureId);
  return `Complete ${adventure?.name ?? "the selected adventure"}${objective.quantity > 1 ? ` ${objective.quantity} times` : ""}.`;
}

export function acceptQuest(state: GameState, questId: string): QuestActionResult {
  const quest = getQuestDefinition(questId);
  if (!quest) return { state, success: false, message: "That quest is no longer posted." };
  if (getQuestAvailability(state.character, quest) !== "available") return { state, success: false, message: "That quest cannot be accepted yet.", quest };
  return {
    success: true,
    message: `${quest.title} accepted.`,
    quest,
    state: {
      ...state,
      character: {
        ...state.character,
        acceptedQuestIds: [...state.character.acceptedQuestIds, quest.id],
        questProgress: { ...state.character.questProgress, [quest.id]: 0 },
      },
    },
  };
}

function removeQuestItems(inventory: InventoryItem[], itemId: string, quantity: number): InventoryItem[] | null {
  let remaining = quantity;
  const next = inventory.filter((item) => {
    if (item.id !== itemId || remaining <= 0) return true;
    remaining -= 1;
    return false;
  });
  return remaining === 0 ? next : null;
}

export function turnInQuest(state: GameState, questId: string): QuestActionResult {
  const quest = getQuestDefinition(questId);
  if (!quest) return { state, success: false, message: "That quest is no longer posted." };
  if (getQuestAvailability(state.character, quest) !== "ready") return { state, success: false, message: "The quest objective is not complete.", quest };
  const inventoryAfterObjective = quest.objective.type === "collect_item"
    ? removeQuestItems(state.character.inventory, quest.objective.itemId, quest.objective.quantity)
    : state.character.inventory;
  if (!inventoryAfterObjective) return { state, success: false, message: "The required items must be in your Inventory.", quest };
  const rewardItems = quest.reward.items.flatMap((reward) => {
    const item = ITEMS.find((candidate) => candidate.id === reward.itemId);
    return item ? Array.from({ length: reward.quantity }, () => structuredClone(item)) : [];
  });
  const { [quest.id]: _completedProgress, ...questProgress } = state.character.questProgress;
  const rewardedCharacter = acquireItems({
    ...state.character,
    inventory: inventoryAfterObjective,
    acceptedQuestIds: state.character.acceptedQuestIds.filter((id) => id !== quest.id),
    completedQuestIds: [...new Set([...state.character.completedQuestIds, quest.id])],
    questProgress,
  }, rewardItems);
  const experience = addExperience(rewardedCharacter, quest.reward.experience);
  const rewardParts = [
    quest.reward.experience > 0 ? `${quest.reward.experience} XP` : "",
    ...quest.reward.items.map((reward) => {
      const item = ITEMS.find((candidate) => candidate.id === reward.itemId);
      return item ? `${item.name}${reward.quantity > 1 ? ` x${reward.quantity}` : ""}` : "";
    }),
  ].filter(Boolean);
  return {
    success: true,
    message: rewardParts.length > 0 ? `${quest.title} completed. Received ${rewardParts.join(" and ")}.` : `${quest.title} completed.`,
    quest,
    state: { ...state, character: experience.character },
  };
}

export function recordQuestEnemyDefeats(character: CharacterState, enemyIds: string[]): CharacterState {
  if (enemyIds.length === 0) return character;
  let changed = false;
  const questProgress = { ...character.questProgress };
  character.acceptedQuestIds.forEach((questId) => {
    const quest = getQuestDefinition(questId);
    if (!quest || quest.objective.type !== "kill_enemy") return;
    const targetEnemyId = quest.objective.enemyId;
    const defeated = enemyIds.filter((enemyId) => enemyId === targetEnemyId).length;
    if (defeated <= 0) return;
    questProgress[quest.id] = Math.min(quest.objective.quantity, (questProgress[quest.id] ?? 0) + defeated);
    changed = true;
  });
  return changed ? { ...character, questProgress } : character;
}

export function recordQuestAdventureCompletion(character: CharacterState, adventureId: string): CharacterState {
  let changed = false;
  const questProgress = { ...character.questProgress };
  character.acceptedQuestIds.forEach((questId) => {
    const quest = getQuestDefinition(questId);
    if (!quest || quest.objective.type !== "complete_adventure" || quest.objective.adventureId !== adventureId) return;
    questProgress[quest.id] = Math.min(quest.objective.quantity, (questProgress[quest.id] ?? 0) + 1);
    changed = true;
  });
  return changed ? { ...character, questProgress } : character;
}
