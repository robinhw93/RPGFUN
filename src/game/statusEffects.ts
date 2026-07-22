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
  expiresAtTurnStart?: boolean;
  initiativePerStack?: number;
  description: string;
}

export const STATUS_EFFECTS: Record<StatusEffectId, StatusEffectDefinition> = {
  guard: { id: "guard", name: "Guard", kind: "buff", duration: 1, stackable: true, description: "Absorbs incoming damage before Health is lost." },
  barrier: { id: "barrier", name: "Barrier", kind: "buff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Absorbs incoming damage before Health is lost. Incoming damage reduces the remaining Barrier amount." },
  strengthened: { id: "strengthened", name: "Strengthened", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Deals 20% more Physical Damage." },
  enlightened: { id: "enlightened", name: "Enlightened", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Deals 20% more Magic Damage." },
  fierce: { id: "fierce", name: "Fierce", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "+20% Critical Strike Chance." },
  shielded: { id: "shielded", name: "Shielded", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Reduces damage taken by 25%." },
  regenerate: { id: "regenerate", name: "Regenerate", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "Restores 3 Health plus 20% of the applier's Magical Power at the start of each turn." },
  taunt: { id: "taunt", name: "Taunt", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, description: "You must target this enemy with single-target attacks." },
  stealth: { id: "stealth", name: "Stealth", kind: "buff", duration: 2, stackable: false, expiresAtTurnStart: false, description: "Cannot be targeted by enemies until the end of your next turn." },
  evasion: { id: "evasion", name: "Evasion", kind: "buff", duration: 1, description: "+60% Dodge Chance until your next turn. Dodge Chance cannot exceed 50%." },
  distraction: { id: "distraction", name: "Distraction", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, description: "Your next ability costs 0 Energy." },
  pinpoint: { id: "pinpoint", name: "Pinpoint", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, description: "Your next damaging ability is guaranteed to critically strike." },
  poison: { id: "poison", name: "Poison", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Arcane Damage at the end of each turn. Each stack deals 2 damage plus 15% of the applier's Magical Power. Magic Resistance is 50% effective against this damage." },
  bleed: { id: "bleed", name: "Bleed", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Physical Damage whenever it uses an ability. Damage scales with the applier's Physical Power. Armor is 50% effective against this damage." },
  burn: { id: "burn", name: "Burn", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Takes Fire Damage at the start of each turn. Damage scales with the applier's Magical Power. Magic Resistance is 50% effective against this damage." },
  weaken: { id: "weaken", name: "Weaken", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Deals 25% less damage." },
  shatter: { id: "shatter", name: "Shatter", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Armor is reduced by 50%." },
  vulnerable: { id: "vulnerable", name: "Vulnerable", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 25% more damage from all sources." },
  stunned: { id: "stunned", name: "Stunned", kind: "debuff", duration: 1, stackable: false, description: "Skips the next turn. Cannot stack." },
  exhausted: { id: "exhausted", name: "Exhausted", kind: "debuff", duration: 1, description: "Regains only 1 Energy at the start of the next turn." },
  slowed: { id: "slowed", name: "Slowed", kind: "debuff", duration: 1, description: "Initiative is reduced to 0 until the end of the next turn." },
  reckless: { id: "reckless", name: "Reckless", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes damage equal to 50% of the damage it deals." },
  wet: { id: "wet", name: "Wet", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Lightning Damage and 50% less Fire Damage." },
  electrified: { id: "electrified", name: "Electrified", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Has a 10% chance to become Stunned at the start of each turn." },
  cold: { id: "cold", name: "Cold", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Frost Damage and 50% less Lightning Damage." },
  charred: { id: "charred", name: "Charred", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Takes 50% more Fire Damage and 50% less Frost Damage." },
  arcaneWound: { id: "arcaneWound", name: "Arcane Wound", kind: "debuff", duration: DEFAULT_STATUS_DURATION, stackable: true, description: "Each stack increases Arcane Blast damage against this target by 10%." },
  arcaneCharge: { id: "arcaneCharge", name: "Arcane Charge", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "For 3 turns, your next Arcane Blast against this target costs 0 Energy and consumes Arcane Charge." },
  staticCharge: { id: "staticCharge", name: "Static Charge", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, stackable: true, description: "At 5 charges, remove them and restore 2 Energy." },
  chargedUp: { id: "chargedUp", name: "Charged Up", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, stackable: true, initiativePerStack: 2, description: "Each stack grants +2 Initiative until combat ends." },
  burningMomentum: { id: "burningMomentum", name: "Burning Momentum", kind: "buff", duration: PERMANENT_STATUS_DURATION, permanent: true, stackable: true, initiativePerStack: 1, description: "Each stack grants +1 Initiative until combat ends." },
  frozen: { id: "frozen", name: "Frozen", kind: "debuff", duration: 1, description: "Cannot act. Frozen ends immediately upon taking damage." },
  frozenPath: { id: "frozenPath", name: "Frozen Path", kind: "buff", duration: DEFAULT_STATUS_DURATION, description: "+30% Dodge Chance for 3 turns. Dodge Chance cannot exceed 50%." },
  blind: { id: "blind", name: "Blind", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Hit Chance is reduced by 75%." },
  sleep: { id: "sleep", name: "Sleep", kind: "debuff", duration: DEFAULT_STATUS_DURATION, description: "Cannot act. Has a 20% chance to wake at the start of each turn and wakes immediately upon taking damage." },
};

export function createStatusEffect(id: StatusEffectId, options: Partial<Pick<StatusEffect, "duration" | "stacks" | "description" | "sourcePower" | "sourceId" | "magnitude" | "expiresAtTurnStart">> = {}): StatusEffect {
  const definition = STATUS_EFFECTS[id];
  return {
    id,
    name: definition.name,
    kind: definition.kind,
    duration: options.duration ?? definition.duration,
    stacks: definition.stackable ? options.stacks ?? 1 : 1,
    description: options.description ?? definition.description,
    permanent: definition.permanent,
    sourcePower: options.sourcePower,
    sourceId: options.sourceId,
    magnitude: options.magnitude,
    expiresAtTurnStart: options.expiresAtTurnStart ?? definition.expiresAtTurnStart,
  };
}

export function hasStatus(statuses: StatusEffect[], id: StatusEffectId): boolean {
  return statuses.some((status) => status.id === id);
}

export function isStatusEffectId(value: string): value is StatusEffectId {
  return value in STATUS_EFFECTS;
}

export function addOrRefreshStatus(statuses: StatusEffect[], status: StatusEffect): StatusEffect[] {
  const stackable = STATUS_EFFECTS[status.id].stackable === true;
  const normalizedStatus = stackable ? status : { ...status, stacks: 1 };
  const existing = statuses.find((item) => item.id === status.id);
  if (!existing) return [...statuses, normalizedStatus];
  return statuses.map((item) => item.id === status.id ? {
    ...item,
    duration: item.permanent ? item.duration : Math.max(item.duration, normalizedStatus.duration),
    stacks: stackable ? item.stacks + normalizedStatus.stacks : 1,
    sourcePower: Math.max(item.sourcePower ?? 0, normalizedStatus.sourcePower ?? 0) || undefined,
    sourceId: normalizedStatus.sourceId ?? item.sourceId,
    magnitude: normalizedStatus.magnitude ?? item.magnitude,
    expiresAtTurnStart: normalizedStatus.expiresAtTurnStart ?? item.expiresAtTurnStart,
  } : item);
}

export function decrementStatusDurations(statuses: StatusEffect[]): StatusEffect[] {
  return statuses.flatMap((status) => {
    if (status.permanent || status.expiresAtTurnStart === true || (status.id === "stealth" && status.expiresAtTurnStart !== false) || status.id === "guard") return [status];
    const duration = status.duration - 1;
    return duration > 0 ? [{ ...status, duration }] : [];
  });
}

export interface DamageAbsorptionResult {
  damage: number;
  statuses: StatusEffect[];
  absorbed: number;
  absorbedBy: Partial<Record<"guard" | "barrier", number>>;
}

/** Guard is consumed before Barrier because it expires sooner. */
export function absorbIncomingDamage(statuses: StatusEffect[], incomingDamage: number): DamageAbsorptionResult {
  let remainingDamage = Math.max(0, Math.round(incomingDamage));
  let nextStatuses = [...statuses];
  const absorbedBy: DamageAbsorptionResult["absorbedBy"] = {};
  (["guard", "barrier"] as const).forEach((statusId) => {
    if (remainingDamage <= 0) return;
    const status = nextStatuses.find((candidate) => candidate.id === statusId);
    if (!status) return;
    const absorbed = Math.min(Math.max(0, status.stacks), remainingDamage);
    if (absorbed <= 0) return;
    absorbedBy[statusId] = absorbed;
    remainingDamage -= absorbed;
    const remainingAmount = status.stacks - absorbed;
    nextStatuses = nextStatuses.flatMap((candidate) => candidate.id !== statusId
      ? [candidate]
      : remainingAmount > 0
        ? [{ ...candidate, stacks: remainingAmount }]
        : []);
  });
  return {
    damage: remainingDamage,
    statuses: nextStatuses,
    absorbed: Math.max(0, Math.round(incomingDamage)) - remainingDamage,
    absorbedBy,
  };
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

export function getDodgeChanceBonus(statuses: StatusEffect[]): number {
  return statuses.reduce((bonus, status) => {
    if (status.id === "evasion") return bonus + (status.magnitude ?? 0.6);
    if (status.id === "frozenPath") return bonus + (status.magnitude ?? 0.3);
    return bonus;
  }, 0);
}

/** Blind reduces the afflicted combatant's raw Hit Chance before Dodge is opposed. */
export function getHitChanceMultiplier(statuses: StatusEffect[]): number {
  return hasStatus(statuses, "blind") ? 0.25 : 1;
}

export function getEnergyRegeneration(regeneration: number, statuses: StatusEffect[]): number {
  return hasStatus(statuses, "exhausted") ? Math.min(1, regeneration) : regeneration;
}

export function getStatusInitiativeBonus(statuses: StatusEffect[]): number {
  return statuses.reduce((bonus, status) => bonus + (STATUS_EFFECTS[status.id].initiativePerStack ?? 0) * status.stacks, 0);
}

export function getStatusDamage(status: StatusEffect): number {
  const power = Math.max(0, status.sourcePower ?? 0);
  const perStack = status.id === "bleed"
    ? 2 + power * 0.25
    : status.id === "burn"
      ? 3 + power * 0.3
      : status.id === "poison"
        ? 2 + power * 0.15
        : 0;
  return Math.max(0, Math.round(perStack * status.stacks));
}

export function getStatusHealing(status: StatusEffect): number {
  if (status.id !== "regenerate") return 0;
  const power = Math.max(0, status.sourcePower ?? 0);
  return Math.max(1, Math.round((3 + power * 0.2) * status.stacks));
}
