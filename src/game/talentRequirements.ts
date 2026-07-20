import type { Talent } from "./types";

export function areTalentRequirementsMet(
  talent: Pick<Talent, "requires" | "requireMode">,
  unlockedTalents: readonly string[],
): boolean {
  if (talent.requires.length === 0) return true;
  const unlocked = new Set(unlockedTalents);
  return talent.requireMode === "any"
    ? talent.requires.some((requirement) => unlocked.has(requirement))
    : talent.requires.every((requirement) => unlocked.has(requirement));
}
