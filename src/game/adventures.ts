import { ADVENTURES, ADVENTURE_EVENTS, ENEMIES } from "./data";
import { ARENA_ADVENTURE, ARENA_ADVENTURE_ID } from "./content/arena";
import type { AdventureDefinition, AdventureNode, AdventureProgress, AdventureStageEntry, AdventureTheme } from "./types";

export const DEFAULT_ADVENTURE_ID = "windsong-forest";

export function getAdventureStartingHp(maxHp: number, carryHp: number | null): number {
  return Math.max(1, Math.min(maxHp, carryHp ?? maxHp));
}

export function getAdventureDefinition(id = DEFAULT_ADVENTURE_ID): AdventureDefinition {
  if (id === ARENA_ADVENTURE_ID) return ARENA_ADVENTURE;
  return ADVENTURES.find((adventure) => adventure.id === id) ?? ADVENTURES[0];
}

export function getAdventureDefaultTravelText(theme: AdventureTheme): string {
  if (theme === "arkenfall_highlands") return "Crossing the windswept highlands";
  if (theme === "highfall_mountains") return "Climbing into the Highfall Mountains";
  if (theme === "custom") return "Traveling deeper into Arkenfall";
  return "Walking beneath the Windsong canopy";
}

export function getAdventureTravelText(adventure: AdventureDefinition): string {
  const configuredText = adventure.travelText?.trim();
  if (configuredText) return configuredText;
  return getAdventureDefaultTravelText(adventure.theme);
}

export type StoryAdventureAvailability = "available" | "locked" | "completed";
export const STORY_REPLAY_EXPERIENCE_MULTIPLIER = 0.1;
export const STORY_REPLAY_GOLD_MULTIPLIER = 0.5;

function isReplayingCompletedStory(progress: Pick<AdventureProgress, "mode" | "adventureId">, completedAdventureIds: string[]): boolean {
  return progress.mode === "story" && completedAdventureIds.includes(progress.adventureId);
}

export function getStoryAdventureAvailability(adventure: AdventureDefinition, completedAdventureIds: string[]): StoryAdventureAvailability {
  if (completedAdventureIds.includes(adventure.id)) return "completed";
  if (adventure.prerequisiteAdventureId && !completedAdventureIds.includes(adventure.prerequisiteAdventureId)) return "locked";
  return "available";
}

export function canStartStoryAdventure(adventure: AdventureDefinition, completedAdventureIds: string[]): boolean {
  return getStoryAdventureAvailability(adventure, completedAdventureIds) !== "locked";
}

export function getAdventureExperienceReward(amount: number, progress: Pick<AdventureProgress, "mode" | "adventureId">, completedAdventureIds: string[]): number {
  const experience = Math.max(0, Math.round(Number.isFinite(amount) ? amount : 0));
  return isReplayingCompletedStory(progress, completedAdventureIds) ? Math.floor(experience * STORY_REPLAY_EXPERIENCE_MULTIPLIER) : experience;
}

export function getAdventureGoldReward(amount: number, progress: Pick<AdventureProgress, "mode" | "adventureId">, completedAdventureIds: string[]): number {
  const gold = Math.max(0, Math.round(Number.isFinite(amount) ? amount : 0));
  return isReplayingCompletedStory(progress, completedAdventureIds) ? Math.floor(gold * STORY_REPLAY_GOLD_MULTIPLIER) : gold;
}
export function selectStageEntry(adventure: AdventureDefinition, stageIndex: number, random = Math.random): AdventureStageEntry {
  const stage = adventure.stages[stageIndex];
  if (!stage || stage.entries.length === 0) throw new Error(`Adventure stage ${stageIndex + 1} has no entries.`);
  const positiveEntries = stage.entries.filter((entry) => entry.chance > 0);
  if (positiveEntries.length === 0) return stage.entries[0];
  const total = positiveEntries.reduce((sum, entry) => sum + entry.chance, 0);
  let roll = random() * total;
  return positiveEntries.find((entry) => {
    roll -= entry.chance;
    return roll <= 0;
  }) ?? positiveEntries[positiveEntries.length - 1];
}

export function entryToNode(entry: AdventureStageEntry): AdventureNode {
  const event = entry.eventId ? ADVENTURE_EVENTS[entry.eventId] : undefined;
  return {
    id: entry.id,
    type: entry.type,
    eyebrow: event?.eyebrow ?? entry.eyebrow,
    title: event?.name ?? entry.title,
    description: event?.description ?? entry.description,
    enemies: entry.enemyIds,
    eventId: entry.eventId,
    reward: entry.reward,
  };
}

export function getStoryNodeIntroduction(node: AdventureNode, encounterFallback: string): string {
  if (node.enemies?.length) return node.description.trim() || encounterFallback;
  if (node.type === "event") return "";
  return `You discover ${node.title}.`;
}

export function getAdventureEntry(progress: AdventureProgress): AdventureStageEntry | null {
  const adventure = getAdventureDefinition(progress.adventureId);
  const stage = adventure.stages[progress.nodeIndex];
  if (!stage) return null;
  return stage.entries.find((entry) => entry.id === progress.stageEntryId) ?? stage.entries[0] ?? null;
}

export function getAdventureNode(progress: AdventureProgress): AdventureNode {
  if (progress.combat && progress.eventEncounter) {
    const enemyNames = progress.eventEncounter.enemyIds.map((id) => ENEMIES[id]?.name ?? "Unknown Enemy");
    return {
      id: `event-encounter-${progress.nodeIndex}`,
      type: "combat",
      eyebrow: "Immediate Encounter",
      title: "An Unexpected Fight",
      description: enemyNames.length > 0 ? `${enemyNames.join(", ")} block your path.` : "Enemies block your path.",
      enemies: progress.eventEncounter.enemyIds,
      reward: progress.eventEncounter.reward,
    };
  }
  const entry = getAdventureEntry(progress);
  return entry ? entryToNode(entry) : {
    id: "missing-stage",
    type: "event",
    eyebrow: "Journey Interrupted",
    title: "The Path Fades",
    description: "This adventure stage could not be restored. Return to the adventure map and begin again.",
  };
}
