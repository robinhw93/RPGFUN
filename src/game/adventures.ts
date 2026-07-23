import { ADVENTURES, ADVENTURE_EVENTS, ENDLESS_ADVENTURE } from "./data";
import type { AdventureDefinition, AdventureNode, AdventureProgress, AdventureStageEntry } from "./types";

export const DEFAULT_ADVENTURE_ID = "windsong-forest";

export function getAdventureDefinition(id = DEFAULT_ADVENTURE_ID): AdventureDefinition {
  return ADVENTURES.find((adventure) => adventure.id === id) ?? ADVENTURES[0];
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

export function getAdventureEntry(progress: AdventureProgress): AdventureStageEntry | null {
  if (progress.mode === "endless") return null;
  const adventure = getAdventureDefinition(progress.adventureId);
  const stage = adventure.stages[progress.nodeIndex];
  if (!stage) return null;
  return stage.entries.find((entry) => entry.id === progress.stageEntryId) ?? stage.entries[0] ?? null;
}

export function getAdventureNode(progress: AdventureProgress): AdventureNode {
  if (progress.mode === "endless") return { ...ENDLESS_ADVENTURE, eyebrow: `Training Fight ${progress.nodeIndex + 1}` };
  const entry = getAdventureEntry(progress);
  return entry ? entryToNode(entry) : {
    id: "missing-stage",
    type: "event",
    eyebrow: "Journey Interrupted",
    title: "The Path Fades",
    description: "This adventure stage could not be restored. Return to the adventure map and begin again.",
  };
}
