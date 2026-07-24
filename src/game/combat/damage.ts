import { getDerivedStats } from "../character";
import {
  createStatusEffect,
  getEffectiveArmor,
  getIncomingDamageMultiplier,
  getOutgoingDamageMultiplier,
  getStatusDamage,
  hasStatus,
  isMagicalDamage
} from "../statusEffects";
import type { Ability, DamageType, StatusEffect } from "../types";

export function getOffensivePower(derived: ReturnType<typeof getDerivedStats>, damageType?: DamageType): number {
  return isMagicalDamage(damageType) ? derived.magicalPower : derived.physicalPower;
}

export function applyAbilityPowerScalingTotals(
  ability: Ability,
  components: NonNullable<Ability["damageComponents"]>,
): NonNullable<Ability["damageComponents"]> {
  if (ability.physicalPowerScaling === undefined && ability.spellPowerScaling === undefined) return components;

  const powerKind = (component: NonNullable<Ability["damageComponents"]>[number]) => (
    component.powerSource === "magical" || (component.powerSource !== "physical" && isMagicalDamage(component.damageType))
      ? "magical"
      : "physical"
  );
  const desiredTotals = {
    physical: ability.physicalPowerScaling,
    magical: ability.spellPowerScaling,
  };
  const currentTotals = components.reduce((totals, component) => ({
    ...totals,
    [powerKind(component)]: totals[powerKind(component)] + (component.powerScaling ?? 1),
  }), { physical: 0, magical: 0 });

  const scaled = components.map((component) => {
    const kind = powerKind(component);
    const desired = desiredTotals[kind];
    if (desired === undefined) return component;
    const currentTotal = currentTotals[kind];
    return {
      ...component,
      powerScaling: currentTotal > 0 ? (component.powerScaling ?? 1) / currentTotal * desired : 0,
    };
  });

  if (ability.physicalPowerScaling !== undefined && ability.physicalPowerScaling > 0 && currentTotals.physical === 0) {
    scaled.push({ damageType: "physical", powerScaling: ability.physicalPowerScaling, powerSource: "physical" });
  }
  if (ability.spellPowerScaling !== undefined && ability.spellPowerScaling > 0 && currentTotals.magical === 0) {
    const magicalDamageType = ability.types.find((damageType) => isMagicalDamage(damageType)) ?? "spell";
    scaled.push({ damageType: magicalDamageType, powerScaling: ability.spellPowerScaling, powerSource: "magical" });
  }
  return scaled;
}

export function getDefense(armor: number, magicResistance: number, statuses: StatusEffect[], damageType?: DamageType): number {
  return damageType === "physical" ? getEffectiveArmor(armor, statuses) : magicResistance;
}

export function getModifiedDamage(baseDamage: number, attackerStatuses: StatusEffect[], targetStatuses: StatusEffect[], damageType?: DamageType): number {
  if (baseDamage <= 0) return 0;
  return Math.max(1, Math.round(baseDamage * getOutgoingDamageMultiplier(attackerStatuses, damageType) * getIncomingDamageMultiplier(targetStatuses, damageType)));
}

export function getAfflictionDamage(
  status: StatusEffect,
  targetStatuses: StatusEffect[],
  extraMultiplier = 1,
  armor = 0,
  magicResistance = 0,
): number {
  const damageType: DamageType = status.id === "burn" ? "fire" : status.id === "poison" ? "spell" : "physical";
  const relevantDefense = status.id === "bleed"
    ? getEffectiveArmor(armor, targetStatuses)
    : status.id === "poison" || status.id === "burn"
      ? Math.max(0, magicResistance)
      : 0;
  const damageAfterDefense = Math.max(1, getStatusDamage(status) - relevantDefense * 0.5);
  return Math.max(1, Math.round(damageAfterDefense * getIncomingDamageMultiplier(targetStatuses, damageType) * extraMultiplier));
}

export function getEnergyDefenseMultiplier(derived: ReturnType<typeof getDerivedStats>, energy: number, statuses: StatusEffect[] = []): number {
  const energyMultiplier = Math.max(0, 1 - Math.max(0, energy) * derived.incomingDamageReductionPerEnergy);
  const stunnedMultiplier = hasStatus(statuses, "stunned") ? derived.incomingDamageMultiplierWhileStunned : 1;
  return energyMultiplier * stunnedMultiplier;
}

export function createPlayerAppliedStatus(
  statusId: StatusEffect["id"],
  derived: ReturnType<typeof getDerivedStats>,
  options: Partial<Pick<StatusEffect, "duration" | "stacks" | "magnitude" | "expiresAtTurnStart">> = {},
): StatusEffect {
  const sourcePower = statusId === "bleed" ? derived.physicalPower
    : statusId === "poison" || statusId === "burn" || statusId === "regenerate" ? derived.magicalPower
      : undefined;
  const stacks = (options.stacks ?? 1) + (derived.statusApplicationStacks[statusId] ?? 0);
  const base = createStatusEffect(statusId);
  const duration = (options.duration ?? base.duration) + (derived.statusDurationBonuses[statusId] ?? 0);
  return createStatusEffect(statusId, { sourcePower, sourceId: "player", ...options, duration, stacks });
}

export function createPlayerCompanionStatuses(statusId: StatusEffect["id"], derived: ReturnType<typeof getDerivedStats>): StatusEffect[] {
  const guaranteed = (derived.statusApplicationCompanions[statusId] ?? []).map((companionId) => createPlayerAppliedStatus(companionId, derived));
  const chanceBased = (derived.statusApplicationCompanionChances[statusId] ?? [])
    .filter((companion) => Math.random() < Math.min(1, companion.chance + derived.chanceEffectBonus))
    .map((companion) => createPlayerAppliedStatus(companion.status, derived));
  return [...guaranteed, ...chanceBased];
}

export function wakeFromDamage(statuses: StatusEffect[], damage: number): StatusEffect[] {
  return damage > 0 ? statuses.filter((status) => status.id !== "sleep" && status.id !== "frozen") : statuses;
}
