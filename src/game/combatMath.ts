export const MIN_FINAL_HIT_CHANCE = 0.2;
export const MAX_FINAL_HIT_CHANCE = 1;
export const MAX_DODGE_CHANCE = 0.5;

export function capDodgeChance(dodgeChance: number): number {
  return Math.max(0, Math.min(MAX_DODGE_CHANCE, dodgeChance));
}

/** Combines permanent and temporary Dodge modifiers before applying the global cap. */
export function getEffectiveDodgeChance(baseDodgeChance: number, temporaryBonus = 0): number {
  return capDodgeChance(baseDodgeChance + temporaryBonus);
}

/** Raw Hit Chance is intentionally uncapped; only the final opposed roll is capped. */
export function getFinalHitChance(rawHitChance: number, targetDodgeChance: number): number {
  return Math.max(
    MIN_FINAL_HIT_CHANCE,
    Math.min(MAX_FINAL_HIT_CHANCE, rawHitChance - getEffectiveDodgeChance(targetDodgeChance)),
  );
}

export function rollHit(rawHitChance: number, targetDodgeChance: number): boolean {
  return Math.random() < getFinalHitChance(rawHitChance, targetDodgeChance);
}
