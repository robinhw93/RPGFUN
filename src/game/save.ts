import type { GameState } from "./types";
import { TALENTS } from "./data";

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
    return {
      ...state,
      characterCreated: state.characterCreated ?? Boolean(state.character.name?.trim() && state.character.name !== "The Wayfarer"),
      character: {
        ...state.character,
        unspentStatPoints: state.character.unspentStatPoints ?? Math.max(0, (state.character.level - 1) * 3),
        talentPoints: state.character.talentPoints + removedTalents.reduce((total, id) => total + (REMOVED_TALENT_COSTS[id] ?? 0), 0),
        unlockedTalents,
        equippedAbilities: state.character.equippedAbilities.filter((id) => validAbilities.has(id)),
      },
      adventure: {
        ...state.adventure,
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
