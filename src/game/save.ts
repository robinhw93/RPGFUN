import type { GameState } from "./types";
import { ITEMS, TALENTS } from "./data";
import { normalizeCharacterAvatarId } from "./avatars";
import { DEFAULT_ADVENTURE_ID } from "./adventures";
import { MAX_LEVEL } from "./progression";

const SAVE_KEY = "emberfall-save-v1";
const REMOVED_TALENT_COSTS: Record<string, number> = {
  brute_2: 1,
  brute_3: 2,
  shadow_2: 1,
  shadow_3: 2,
  arcanist_2: 1,
  arcanist_3: 2,
};

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    const normalizedLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(state.character.level || 1)));
    const validTalentIds = new Set(TALENTS.map((talent) => talent.id));
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
    const hydrateGearMetadata = <T extends GameState["character"]["inventory"][number]>(item: T): T => {
      const definition = itemDefinitions.get(item.id);
      if (!definition) return item;
      return {
        ...item,
        armorMaterial: item.armorMaterial ?? definition.armorMaterial,
        weaponEquipType: item.weaponEquipType ?? definition.weaponEquipType,
        weaponKind: item.weaponKind ?? definition.weaponKind,
      };
    };
    const equipment = Object.fromEntries(
      Object.entries(state.character.equipment).map(([slot, item]) => [slot, item ? hydrateGearMetadata(item) : item]),
    ) as GameState["character"]["equipment"];
    const inventory = state.character.inventory.map(hydrateGearMetadata);
    if ((equipment.mainHand?.weaponEquipType === "twoHand" || equipment.mainHand?.weaponType === "twoHanded") && equipment.offHand) {
      inventory.push(equipment.offHand);
      delete equipment.offHand;
    }
    return {
      ...state,
      characterCreated: state.characterCreated ?? Boolean(state.character.name?.trim() && state.character.name !== "The Wayfarer"),
      character: {
        ...state.character,
        avatarId: normalizeCharacterAvatarId(state.character.avatarId),
        level: normalizedLevel,
        xp: normalizedLevel >= MAX_LEVEL ? 0 : Math.max(0, state.character.xp ?? 0),
        unspentStatPoints: state.character.unspentStatPoints ?? Math.max(0, (normalizedLevel - 1) * 3),
        talentPoints: talentPoints + removedTalents.reduce((total, id) => total + (REMOVED_TALENT_COSTS[id] ?? 0), 0),
        unlockedTalents,
        equippedAbilities: state.character.equippedAbilities.filter((id) => validAbilities.has(id)),
        inventory,
        equipment,
        completedAdventureIds: state.character.completedAdventureIds ?? [],
      },
      adventure: {
        ...state.adventure,
        mode: state.adventure.mode ?? "story",
        adventureId: state.adventure.adventureId ?? DEFAULT_ADVENTURE_ID,
        stageEntryId: state.adventure.mode === "endless" ? null : state.adventure.stageEntryId ?? null,
        eventRollResult: state.adventure.eventRollResult ?? null,
        nextCombatPlayerStatuses: state.adventure.nextCombatPlayerStatuses ?? [],
        nextCombatEnemyStatuses: state.adventure.nextCombatEnemyStatuses ?? [],
        eventEncounter: state.adventure.eventEncounter ?? null,
        pendingReward: state.adventure.pendingReward ?? null,
        ...(state.adventure.mode !== "endless" && !state.adventure.adventureId ? {
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
          pendingReward: null,
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
