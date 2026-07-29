import type { CombatReport } from "./types";

export function createEmptyCombatReport(): CombatReport {
  return {
    damageDealt: 0,
    damageTaken: 0,
    healingDone: 0,
    absorbedDamage: 0,
    largestHit: 0,
    criticalHits: 0,
    missedAttacks: 0,
    energySpent: 0,
    energyGained: 0,
    playerTurns: 0,
    damageBySource: {},
  };
}

export function normalizeCombatReport(report: Partial<CombatReport> | null | undefined): CombatReport {
  const empty = createEmptyCombatReport();
  const whole = (value: unknown) => Math.max(0, Math.floor(typeof value === "number" && Number.isFinite(value) ? value : 0));
  return {
    damageDealt: whole(report?.damageDealt),
    damageTaken: whole(report?.damageTaken),
    healingDone: whole(report?.healingDone),
    absorbedDamage: whole(report?.absorbedDamage),
    largestHit: whole(report?.largestHit),
    criticalHits: whole(report?.criticalHits),
    missedAttacks: whole(report?.missedAttacks),
    energySpent: whole(report?.energySpent),
    energyGained: whole(report?.energyGained),
    playerTurns: whole(report?.playerTurns),
    damageBySource: Object.fromEntries(Object.entries(report?.damageBySource ?? empty.damageBySource).flatMap(([source, amount]) => (
      source.trim() && typeof amount === "number" && Number.isFinite(amount) && amount > 0
        ? [[source, Math.floor(amount)]]
        : []
    ))),
  };
}
