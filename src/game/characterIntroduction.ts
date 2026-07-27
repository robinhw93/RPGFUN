import { TALENTS } from "./data";
import type { CharacterState, Talent } from "./types";

export const AVAILABLE_STARTING_CLASS_IDS = ["arcanist_1", "brute_1", "shadow_1"] as const;

export type AvailableStartingClassId = typeof AVAILABLE_STARTING_CLASS_IDS[number];

export function getStartingClassTalents(): Talent[] {
  return TALENTS.filter((talent) => talent.id !== "origin" && talent.kind === "class" && talent.requires.includes("origin"));
}

export function getUnlockedStartingClass(character: CharacterState): Talent | null {
  return getStartingClassTalents().find((talent) => character.unlockedTalents.includes(talent.id)) ?? null;
}

export function hasSpentIntroductionTalentPoint(character: CharacterState): boolean {
  const unlockedStartingClass = getUnlockedStartingClass(character);
  if (!unlockedStartingClass || character.talentPoints > 0) return false;
  return TALENTS.some((talent) => talent.id !== "origin" && talent.kind !== "class" && character.unlockedTalents.includes(talent.id));
}

export function chooseStartingClass(character: CharacterState, talentId: string): CharacterState {
  if (getUnlockedStartingClass(character)) return character;
  if (!AVAILABLE_STARTING_CLASS_IDS.includes(talentId as AvailableStartingClassId)) return character;

  const talent = getStartingClassTalents().find((candidate) => candidate.id === talentId);
  if (!talent) return character;

  const equippedAbilities = talent.abilityId && character.equippedAbilities.length < 6
    ? [...character.equippedAbilities, talent.abilityId]
    : character.equippedAbilities;

  return {
    ...character,
    unlockedTalents: [...character.unlockedTalents, talent.id],
    equippedAbilities,
  };
}
