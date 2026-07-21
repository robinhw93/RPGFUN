import type { GameState } from "./types";
import { ITEMS, TALENTS } from "./data";
import { normalizeCharacterAvatarId } from "./avatars";

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
    const validTalentIds = new Set(TALENTS.map((talent) => talent.id));
    const removedTalents = state.character.unlockedTalents.filter((id) => !validTalentIds.has(id));
    const unlockedTalents = state.character.unlockedTalents.filter((id) => validTalentIds.has(id));
    const talentAbilities = TALENTS
      .filter((talent) => unlockedTalents.includes(talent.id) && talent.abilityId)
      .map((talent) => talent.abilityId!);
    const validAbilities = new Set(["strike", "guard", ...talentAbilities]);
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
        unspentStatPoints: state.character.unspentStatPoints ?? Math.max(0, (state.character.level - 1) * 3),
        talentPoints: state.character.talentPoints + removedTalents.reduce((total, id) => total + (REMOVED_TALENT_COSTS[id] ?? 0), 0),
        unlockedTalents,
        equippedAbilities: state.character.equippedAbilities.filter((id) => validAbilities.has(id)),
        inventory,
        equipment,
      },
      adventure: {
        ...state.adventure,
        mode: state.adventure.mode ?? "story",
        pendingReward: state.adventure.pendingReward ?? null,
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
