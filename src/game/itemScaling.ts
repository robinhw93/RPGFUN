import type { GearItem, PassiveBonuses, StatName } from "./types";

export const GEAR_SCALING_WEIGHTS = {
  attribute: 1,
  armor: 0.25,
  magicResistance: 0.25,
  physicalPower: 0.75,
  magicalPower: 0.75,
  maxEnergy: 3,
  energyRegen: 4,
  chancePercent: 0.4,
  initiative: 0.25,
} as const;

export interface GearScalingComponent {
  id: string;
  label: string;
  amount: number;
  unit?: "%";
  weight: number;
  value: number;
}

export interface GearScalingValue {
  value: number;
  components: GearScalingComponent[];
  hasExcludedEffects: boolean;
}

const STAT_LABELS: Record<StatName, string> = {
  strength: "Strength",
  agility: "Agility",
  intelligence: "Intelligence",
  vitality: "Vitality",
  luck: "Luck",
};

const SUPPORTED_PASSIVE_KEYS = new Set<keyof PassiveBonuses>([
  "stats",
  "armor",
  "magicResistance",
  "physicalPower",
  "magicalPower",
  "power",
  "maxEnergy",
  "energyRegen",
  "hitChance",
  "dodgeChance",
  "critChance",
  "initiative",
]);

function finite(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (value && typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return false;
}

export function calculateGearScalingValue(item: GearItem): GearScalingValue {
  const components: GearScalingComponent[] = [];
  const passive = item.combat?.passive;
  const add = (id: string, label: string, amount: number, weight: number, unit?: "%") => {
    if (!Number.isFinite(amount) || amount === 0) return;
    components.push({ id, label, amount, unit, weight, value: amount * weight });
  };

  (Object.keys(STAT_LABELS) as StatName[]).forEach((stat) => {
    add(stat, STAT_LABELS[stat], finite(item.stats[stat]) + finite(passive?.stats?.[stat]), GEAR_SCALING_WEIGHTS.attribute);
  });
  add("armor", "Armor", finite(item.armor) + finite(passive?.armor), GEAR_SCALING_WEIGHTS.armor);
  add("magicResistance", "Magic Resistance", finite(item.magicResistance) + finite(passive?.magicResistance), GEAR_SCALING_WEIGHTS.magicResistance);
  add("physicalPower", "Physical Power", finite(item.physicalPower) + finite(passive?.physicalPower), GEAR_SCALING_WEIGHTS.physicalPower);
  add("magicalPower", "Spell Power", finite(item.magicalPower) + finite(passive?.magicalPower), GEAR_SCALING_WEIGHTS.magicalPower);
  add("legacyPower", "Legacy Power", finite(item.power) + finite(passive?.power), GEAR_SCALING_WEIGHTS.physicalPower + GEAR_SCALING_WEIGHTS.magicalPower);
  add("maxEnergy", "Max Energy", finite(passive?.maxEnergy), GEAR_SCALING_WEIGHTS.maxEnergy);
  add("energyRegen", "Energy Regeneration", finite(passive?.energyRegen), GEAR_SCALING_WEIGHTS.energyRegen);
  add("hitChance", "Hit Chance", finite(passive?.hitChance) * 100, GEAR_SCALING_WEIGHTS.chancePercent, "%");
  add("dodgeChance", "Dodge Chance", finite(passive?.dodgeChance) * 100, GEAR_SCALING_WEIGHTS.chancePercent, "%");
  add("critChance", "Critical Strike Chance", finite(passive?.critChance) * 100, GEAR_SCALING_WEIGHTS.chancePercent, "%");
  add("initiative", "Initiative", finite(passive?.initiative), GEAR_SCALING_WEIGHTS.initiative);

  const hasAdvancedCombatEffects = Object.entries(item.combat ?? {}).some(([key, value]) => key !== "passive" && hasMeaningfulValue(value));
  const hasUnsupportedPassives = Object.entries(passive ?? {}).some(([key, value]) => !SUPPORTED_PASSIVE_KEYS.has(key as keyof PassiveBonuses) && hasMeaningfulValue(value));
  const value = components.reduce((total, component) => total + component.value, 0);

  return {
    value: Math.round(value * 10) / 10,
    components: components.sort((left, right) => Math.abs(right.value) - Math.abs(left.value)),
    hasExcludedEffects: Boolean(item.set || item.specialEffectNotes?.trim() || hasAdvancedCombatEffects || hasUnsupportedPassives),
  };
}

export function getGearScalingRank(item: GearItem, catalog: GearItem[]): { rank: number; total: number; average: number } {
  const sameSlot = catalog.filter((candidate) => candidate.slot === item.slot);
  const currentValue = calculateGearScalingValue(item).value;
  const values = sameSlot.map((candidate) => candidate.id === item.id ? currentValue : calculateGearScalingValue(candidate).value);
  return {
    rank: 1 + values.filter((value) => value > currentValue).length,
    total: values.length,
    average: values.length > 0 ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : currentValue,
  };
}
