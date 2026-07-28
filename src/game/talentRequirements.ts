import type { Talent } from "./types";

export const TALENT_RESPEC_BASE_GOLD = 100;

export function getTalentRespecCost(respecCount: number): number {
  return TALENT_RESPEC_BASE_GOLD * (Math.max(0, Math.floor(respecCount)) + 1);
}

/** Prevents refunding an articulation node that would strand unlocked nodes away from Origin. */
export function canRespecTalent(talentId: string, unlockedTalents: readonly string[], talents: readonly Talent[]): boolean {
  if (talentId === "origin" || !unlockedTalents.includes(talentId)) return false;
  const remaining = new Set(unlockedTalents.filter((id) => id !== talentId && talents.some((talent) => talent.id === id)));
  if (!remaining.has("origin")) return false;
  const reached = new Set(["origin"]);
  const frontier = ["origin"];
  while (frontier.length > 0) {
    const current = frontier.shift()!;
    getTalentConnectionIds(current, talents).forEach((connection) => {
      if (!remaining.has(connection) || reached.has(connection)) return;
      reached.add(connection);
      frontier.push(connection);
    });
  }
  return [...remaining].every((id) => reached.has(id));
}

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

export function isAdditionalClassTalentLocked(
  talent: Pick<Talent, "id" | "kind">,
  unlockedTalents: readonly string[],
  level: number,
  talents: readonly Talent[],
): boolean {
  if (talent.kind !== "class" || talent.id === "origin" || level >= 10) return false;
  const unlocked = new Set(unlockedTalents);
  return talents.some((candidate) => (
    candidate.kind === "class"
    && candidate.id !== "origin"
    && candidate.id !== talent.id
    && unlocked.has(candidate.id)
  ));
}
