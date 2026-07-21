import type { Talent } from "./types";

export function getTalentConnectionIds(talentId: string, talents: readonly Talent[]): string[] {
  const talent = talents.find((candidate) => candidate.id === talentId);
  if (!talent) return [];
  return [...new Set([
    ...talent.requires,
    ...talents.filter((candidate) => candidate.requires.includes(talentId)).map((candidate) => candidate.id),
  ])];
}

export function areTalentRequirementsMet(
  talent: Pick<Talent, "id" | "requires">,
  unlockedTalents: readonly string[],
  talents: readonly Talent[],
): boolean {
  const connections = getTalentConnectionIds(talent.id, talents);
  if (connections.length === 0) return true;
  const unlocked = new Set(unlockedTalents);
  return connections.some((connection) => unlocked.has(connection));
}
