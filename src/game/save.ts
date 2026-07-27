import type { CharacterIntroductionStep, GameState } from "./types";
import { ITEMS, QUESTS, TALENTS } from "./data";
import { normalizeCharacterAvatarId } from "./avatars";
import { DEFAULT_ADVENTURE_ID } from "./adventures";
import { isGearItem } from "./items";
import { MAX_LEVEL } from "./progression";
import type { GearItem, InventoryItem } from "./types";
import type { ArenaAttemptRecord } from "./types";

const SAVE_KEY = "emberfall-save-v1";
const REMOVED_TALENT_COSTS: Record<string, number> = {
  brute_2: 1,
  brute_3: 2,
  shadow_2: 1,
  shadow_3: 2,
  arcanist_2: 1,
  arcanist_3: 2,
};

const CHARACTER_INTRODUCTION_STEPS = new Set<CharacterIntroductionStep>(["class", "talents", "attributes", "town", "complete"]);

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    const savedAdventureMode = (state.adventure as { mode?: unknown }).mode;
    const shouldResetAdventure = savedAdventureMode === "endless" || !state.adventure.adventureId;
    const normalizedLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(state.character.level || 1)));
    const validTalentIds = new Set(TALENTS.map((talent) => talent.id));
    const validQuestIds = new Set(QUESTS.map((quest) => quest.id));
    const removedTalents = state.character.unlockedTalents.filter((id) => !validTalentIds.has(id));
    const unlockedTalents = state.character.unlockedTalents.filter((id) => validTalentIds.has(id));
    const talentAbilities = TALENTS
      .filter((talent) => unlockedTalents.includes(talent.id) && talent.abilityId)
      .map((talent) => talent.abilityId!);
    const validAbilities = new Set(talentAbilities);
    const talentPoints = normalizedLevel === 1
      && unlockedTalents.length === 1
      && unlockedTalents[0] === "origin"
      && state.character.talentPoints === 3
      ? 1
      : state.character.talentPoints;
    const itemDefinitions = new Map(ITEMS.map((item) => [item.id, item]));
    const hydrateInventoryItem = (item: InventoryItem): InventoryItem => {
      const definition = itemDefinitions.get(item.id);
      return definition ? { ...item, ...structuredClone(definition) } : item;
    };
    const hydrateLoot = (value: unknown): InventoryItem[] => {
      const rawItems = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
      return rawItems.flatMap((item) => item && typeof item === "object" && "id" in item && typeof item.id === "string"
        ? [hydrateInventoryItem(item as InventoryItem)]
        : []);
    };
    const equipment = Object.fromEntries(
      Object.entries(state.character.equipment).map(([slot, item]) => {
        const hydrated = item ? hydrateInventoryItem(item) : item;
        return [slot, hydrated && isGearItem(hydrated) ? hydrated as GearItem : undefined];
      }),
    ) as GameState["character"]["equipment"];
    const inventory = (state.character.inventory ?? []).map(hydrateInventoryItem);
    const latestLoot = hydrateLoot(state.adventure.latestLoot);
    if ((equipment.mainHand?.weaponEquipType === "twoHand" || equipment.mainHand?.weaponType === "twoHanded") && equipment.offHand) {
      inventory.push(equipment.offHand);
      delete equipment.offHand;
    }
    const savedIntroductionStep = (state as { characterIntroductionStep?: unknown }).characterIntroductionStep;
    const hasStartingClass = TALENTS.some((talent) => talent.id !== "origin" && talent.kind === "class" && unlockedTalents.includes(talent.id));
    const hasPostClassTalent = TALENTS.some((talent) => talent.id !== "origin" && talent.kind !== "class" && unlockedTalents.includes(talent.id));
    const characterIntroductionStep: CharacterIntroductionStep = savedIntroductionStep === "attributes"
      ? hasStartingClass ? "attributes" : "class"
      : typeof savedIntroductionStep === "string" && CHARACTER_INTRODUCTION_STEPS.has(savedIntroductionStep as CharacterIntroductionStep)
        ? savedIntroductionStep === "class" && hasStartingClass
          ? "talents"
          : savedIntroductionStep === "talents" && !hasStartingClass
            ? "class"
            : savedIntroductionStep as CharacterIntroductionStep
        : "complete";
    const refundedTalentPoints = talentPoints + removedTalents.reduce((total, id) => total + (REMOVED_TALENT_COSTS[id] ?? 0), 0);
    const normalizedTalentPoints = savedIntroductionStep === "talents" && hasStartingClass && !hasPostClassTalent && refundedTalentPoints === 0
      ? 1
      : refundedTalentPoints;
    const arenaScores = (Array.isArray(state.character.arenaScores) ? state.character.arenaScores : []).flatMap((score): ArenaAttemptRecord[] => {
      if (!score || typeof score !== "object") return [];
      const candidate = score as Partial<ArenaAttemptRecord>;
      if (typeof candidate.id !== "string" || !Number.isFinite(candidate.damage) || !Number.isFinite(candidate.completedAt)) return [];
      return [{
        id: candidate.id,
        damage: Math.max(0, Math.min(10000, Math.floor(candidate.damage ?? 0))),
        turns: Math.max(1, Math.min(10, Math.floor(candidate.turns ?? 10))),
        level: Math.max(1, Math.min(MAX_LEVEL, Math.floor(candidate.level ?? 1))),
        completedAt: Math.max(0, Math.floor(candidate.completedAt ?? 0)),
      }];
    }).sort((left, right) => right.damage - left.damage || left.turns - right.turns || right.completedAt - left.completedAt).slice(0, 10);
    return {
      ...state,
      characterCreated: state.characterCreated ?? Boolean(state.character.name?.trim() && state.character.name !== "The Wayfarer"),
      characterIntroductionStep: characterIntroductionStep === "town" && Object.values(equipment).some(Boolean)
        ? "complete"
        : characterIntroductionStep,
      character: {
        ...state.character,
        avatarId: normalizeCharacterAvatarId(state.character.avatarId),
        level: normalizedLevel,
        xp: normalizedLevel >= MAX_LEVEL ? 0 : Math.max(0, state.character.xp ?? 0),
        unspentStatPoints: state.character.unspentStatPoints ?? Math.max(0, (normalizedLevel - 1) * 3),
        talentPoints: normalizedTalentPoints,
        unlockedTalents,
        equippedAbilities: state.character.equippedAbilities.filter((id) => validAbilities.has(id)),
        inventory,
        equipment,
        completedAdventureIds: state.character.completedAdventureIds ?? [],
        tavernGamblingAttempts: Math.max(0, Math.floor(state.character.tavernGamblingAttempts ?? 0)),
        arenaAttemptAvailable: state.character.arenaAttemptAvailable ?? true,
        arenaScores,
        acceptedQuestIds: (state.character.acceptedQuestIds ?? []).filter((id) => validQuestIds.has(id)),
        completedQuestIds: (state.character.completedQuestIds ?? []).filter((id) => validQuestIds.has(id)),
        questProgress: Object.fromEntries(Object.entries(state.character.questProgress ?? {}).flatMap(([id, progress]) => (
          validQuestIds.has(id) && typeof progress === "number" && Number.isFinite(progress)
            ? [[id, Math.max(0, Math.floor(progress))]]
            : []
        ))),
      },
      adventure: {
        ...state.adventure,
        mode: savedAdventureMode === "arena" ? "arena" : "story",
        adventureId: state.adventure.adventureId ?? DEFAULT_ADVENTURE_ID,
        stageEntryId: state.adventure.stageEntryId ?? null,
        eventRollResult: state.adventure.eventRollResult ?? null,
        nextCombatPlayerStatuses: state.adventure.nextCombatPlayerStatuses ?? [],
        nextCombatEnemyStatuses: state.adventure.nextCombatEnemyStatuses ?? [],
        eventEncounter: state.adventure.eventEncounter ?? null,
        eventMerchant: state.adventure.eventMerchant ? {
          itemIds: state.adventure.eventMerchant.itemIds ?? [],
          purchasedItemIds: state.adventure.eventMerchant.purchasedItemIds ?? [],
        } : null,
        latestLoot: latestLoot.length > 0 ? latestLoot : null,
        pendingReward: state.adventure.pendingReward
          ? { ...state.adventure.pendingReward, loot: hydrateLoot((state.adventure.pendingReward as unknown as { loot?: unknown }).loot) }
          : null,
        arenaResult: state.adventure.arenaResult ?? null,
        ...(shouldResetAdventure ? {
          adventureId: DEFAULT_ADVENTURE_ID,
          active: false,
          nodeIndex: 0,
          stageEntryId: null,
          combat: null,
          carryHp: null,
          eventResolved: false,
          eventRollResult: null,
          nextCombatPlayerStatuses: [],
          nextCombatEnemyStatuses: [],
          eventEncounter: null,
          eventMerchant: null,
          pendingReward: null,
          arenaResult: null,
          completed: false,
        } : {}),
      },
    };
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
