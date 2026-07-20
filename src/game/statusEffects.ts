import type { DamageType, StatusEffect, StatusEffectId } from "./types";

export const DEFAULT_STATUS_DURATION = 3;
export const STATUS_DURATION_SEGMENTS = 3;
export const PERMANENT_STATUS_DURATION = 3;

export interface StatusEffectDefinition {
  id: StatusEffectId;
  name: string;
  kind: "buff" | "debuff";
  duration: number;
  permanent?: boolean;
  stackable?: boolean;
  description: string;
}

export const STATUS_EFFECTS: Record<StatusEffectId, StatusEffectDefinition> = {
  guard: { id: "guard", name: "Guard", kind: "buff", duration: 1, stackable: true, description: "Absorbs incoming damage before Health is lost." },
  strengthened: { id: "strengthened", name: "Strengthened", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Deals 20% more Physical Damage." },
  enlightened: { id: "enlightened", name: "Enlightened", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Deals 20% more Magic Damage." },
  fierce: { id: "fierce", name: "Fierce", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "+20% Critical Strike Chance." },
  shielded: { id: "shielded", name: "Shielded", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Reduces damage taken by 25%." },
  taunt: { id: "taunt", name: "Taunt", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, description: "You must target this enemy with single-target attacks." },
  stealth: { id: "stealth", name: "Stealth", kind: "buff", duration: 1, description: "Cannot be targeted by enemies this round." },
  poison: { id: "poison", name: "Poison", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Magic Damage at the end of each turn. Damage scales with the applier's Magical Power." },
  bleed: { id: "bleed", name: "Bleed", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Physical Damage whenever it uses an ability. Damage scales with the applier's Physical Power." },
  burn: { id: "burn", name: "Burn", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Fire Damage at the start of each turn. Damage scales with the applier's Magical Power." },
  weaken: { id: "weaken", name: "Weaken", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Deals 25% less damage." },
  shatter: { id: "shatter", name: "Shatter", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Armor is reduced by 50%." },
  vulnerable: { id: "vulnerable", name: "Vulnerable", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 25% more damage from all sources." },
  stunned: { id: "stunned", name: "Stunned", kind: "debuff", duration: 1, description: "Skips the next turn." },
  exhausted: { id: "exhausted", name: "Exhausted", kind: "debuff", duration: 1, description: "Regains only 1 Energy at the start of the next turn." },
  slowed: { id: "slowed", name: "Slowed", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Acts after combatants that are not Slowed." },
  reckless: { id: "reckless", name: "Reckless", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes damage equal to 50% of the damage it deals." },
  wet: { id: "wet", name: "Wet", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Lightning Damage and 50% less Fire Damage." },
  electrified: { id: "electrified", name: "Electrified", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Has a 10% chance to become Stunned at the start of each turn." },
  cold: { id: "cold", name: "Cold", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Frost Damage and 50% less Lightning Damage." },
  charred: { id: "charred", name: "Charred", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Fire Damage and 50% less Frost Damage." },
  sleep: { id: "sleep", name: "Sleep", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Cannot act. Has a 20% chance to wake at the start of each turn and wakes immediately upon taking damage." },
};

export function createStatusEffect(id: StatusEffectId, options: Partial<Pick<StatusEffect, "duration" | "stacks" | "description" | "sourcePower" | "sourceId">> = {}): StatusEffect {
  const definition = STATUS_EFFECTS[id];
  return {
    id,
    name: definition.name,
    kind: definition.kind,
    duration: options.duration ?? definition.duration,
    stacks: options.stacks ?? 1,
    description: options.description ?? definition.description,
    permanent: definition.permanent,
    sourcePower: options.sourcePower,
    sourceId: options.sourceId,
  };
}

export function hasStatus(statuses: StatusEffect[], id: StatusEffectId): boolean {
  return statuses.some((status) => status.id === id);
}

export function isStatusEffectId(value: string): value is StatusEffectId {
  return value in STATUS_EFFECTS;
}

export function addOrRefreshStatus(statuses: StatusEffect[], status: StatusEffect): StatusEffect[] {
  const existing = statuses.find((item) => item.id === status.id);
  if (!existing) return [...statuses, status];
  const stackable = STATUS_EFFECTS[status.id].stackable;
  return statuses.map((item) => item.id === status.id ? {
    ...item,
    duration: item.permanent ? item.duration : Math.max(item.duration, status.duration),
    stacks: stackable ? item.stacks + status.stacks : Math.max(item.stacks, status.stacks),
    sourcePower: Math.max(item.sourcePower ?? 0, status.sourcePower ?? 0) || undefined,
    sourceId: status.sourceId ?? item.sourceId,
  } : item);
}

export function decrementStatusDurations(statuses: StatusEffect[]): StatusEffect[] {
  return statuses.flatMap((status) => {
    if (status.permanent || status.id === "stealth" || status.id === "guard") return [status];
    const duration = status.duration - 1;
    return duration > 0 ? [{ ...status, duration }] : [];
  });
}

export function isMagicalDamage(damageType?: DamageType): boolean {
  return damageType === "arcane" || damageType === "fire" || damageType === "frost" || damageType === "lightning";
}

export function getOutgoingDamageMultiplier(statuses: StatusEffect[], damageType?: DamageType): number {
  let multiplier = 1;
  if (damageType === "physical" && hasStatus(statuses, "strengthened")) multiplier *= 1.2;
  if (isMagicalDamage(damageType) && hasStatus(statuses, "enlightened")) multiplier *= 1.2;
  if (hasStatus(statuses, "weaken")) multiplier *= 0.75;
  return multiplier;
}

export function getIncomingDamageMultiplier(statuses: StatusEffect[], damageType?: DamageType): number {
  let multiplier = 1;
  if (hasStatus(statuses, "shielded")) multiplier *= 0.75;
  if (hasStatus(statuses, "vulnerable")) multiplier *= 1.25;
  if (damageType === "lightning" && hasStatus(statuses, "wet")) multiplier *= 1.5;
  if (damageType === "fire" && hasStatus(statuses, "wet")) multiplier *= 0.5;
  if (damageType === "frost" && hasStatus(statuses, "cold")) multiplier *= 1.5;
  if (damageType === "lightning" && hasStatus(statuses, "cold")) multiplier *= 0.5;
  if (damageType === "fire" && hasStatus(statuses, "charred")) multiplier *= 1.5;
  if (damageType === "frost" && hasStatus(statuses, "charred")) multiplier *= 0.5;
  return multiplier;
}

export function getEffectiveArmor(armor: number, statuses: StatusEffect[]): number {
  return Math.max(0, Math.round(armor * (hasStatus(statuses, "shatter") ? 0.5 : 1)));
}

export function getCriticalChanceBonus(statuses: StatusEffect[]): number {
  return hasStatus(statuses, "fierce") ? 0.2 : 0;
}

export function getEnergyRegeneration(regeneration: number, statuses: StatusEffect[]): number {
  return hasStatus(statuses, "exhausted") ? Math.min(1, regeneration) : regeneration;
}

export function getStatusDamage(status: StatusEffect): number {
  const power = Math.max(0, status.sourcePower ?? 0);
  const perStack = status.id === "bleed"
    ? 2 + power * 0.25
    : status.id === "burn"
      ? 3 + power * 0.3
      : status.id === "poison"
        ? 2 + power * 0.3
        : 0;
  return Math.max(0, Math.round(perStack * status.stacks));
}
