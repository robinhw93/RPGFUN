import { addExperience, experienceForLevelGains, MAX_LEVEL } from "./progression";
import { acquireItems } from "./items";
import type { CharacterState, InventoryItem } from "./types";

export function levelUpCharacterForTesting(character: CharacterState): CharacterState {
  if (character.level >= MAX_LEVEL) return character;
  const requiredExperience = experienceForLevelGains(character.level, character.xp, 1);
  return addExperience(character, requiredExperience).character;
}

export function grantItemForTesting(
  character: CharacterState,
  item: InventoryItem,
  quantity: number,
): CharacterState {
  const safeQuantity = Number.isFinite(quantity)
    ? Math.min(99, Math.max(1, Math.floor(quantity)))
    : 1;
  return acquireItems(character, Array.from({ length: safeQuantity }, () => item));
}
