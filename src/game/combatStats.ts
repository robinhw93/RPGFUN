import { getEffectiveDodgeChance } from "./combatMath";
import {
  getCriticalChanceBonus,
  getDodgeChanceBonus,
  getEffectiveArmor,
  getEnergyRegeneration,
  getHitChanceMultiplier,
} from "./statusEffects";
import type { StatusEffect } from "./types";

export interface StatusModifiableCombatStats {
  armor: number;
  hitChance: number;
  dodgeChance: number;
  critChance: number;
  energyRegen: number;
  initiativeBonus?: number;
}

/** Applies the same temporary status modifiers used by live combat resolution. */
export function getStatusAdjustedCombatStats<T extends StatusModifiableCombatStats>(stats: T, statuses: StatusEffect[]): T {
  return {
    ...stats,
    armor: getEffectiveArmor(stats.armor, statuses),
    hitChance: stats.hitChance * getHitChanceMultiplier(statuses),
    dodgeChance: getEffectiveDodgeChance(stats.dodgeChance, getDodgeChanceBonus(statuses)),
    critChance: stats.critChance + getCriticalChanceBonus(statuses),
    energyRegen: getEnergyRegeneration(stats.energyRegen, statuses),
    ...(stats.initiativeBonus === undefined ? {} : { initiativeBonus: statuses.some((status) => status.id === "slowed") ? 0 : stats.initiativeBonus }),
  } as T;
}
