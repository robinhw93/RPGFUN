import {
  BatteryLow,
  Brain,
  CircleDot, Crosshair, Droplets, Dumbbell,
  EyeOff, Flame, FlaskConical, Footprints,
  HeartPulse,
  Megaphone, Moon,
  Shield,
  ShieldCheck, ShieldOff, ShieldPlus, Skull, Snail, Snowflake, Sparkles, Sun, Swords, Target, TrendingDown,
  Waves,
  Zap,
  type LucideIcon
} from "lucide-react";
import { GEAR_ICON_URLS } from "../components/GearSlotIcon";
import { getDerivedStats } from "../game/character";
import { ABILITIES, ENEMIES, TALENTS } from "../game/data";
import { canEquipItemInSlot } from "../game/gear";
import type { Ability, CharacterState, DamageType, GearItem, GearSlot, StatName, StatusEffectId } from "../game/types";

export type CharacterSection = "overview" | "equipment" | "talents";

export const SLOT_LABELS: Record<GearSlot, string> = {
  head: "Head", chest: "Chest", pants: "Pants", boots: "Boots",
  mainHand: "Main Hand", offHand: "Off Hand", ring1: "Ring I", ring2: "Ring II",
};

export const EQUIPMENT_SLOT_ORDER: GearSlot[] = ["head", "chest", "pants", "boots", "mainHand", "offHand", "ring1", "ring2"];

export type InventoryGearFilter = "all" | "head" | "chest" | "pants" | "boots" | "mainHand" | "offHand" | "ring";
export type InventorySort = "rarity" | "name";

export const INVENTORY_GEAR_FILTERS: Array<{ id: InventoryGearFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "head", label: "Head" },
  { id: "chest", label: "Chest" },
  { id: "pants", label: "Pants" },
  { id: "boots", label: "Boots" },
  { id: "mainHand", label: "Main Hand" },
  { id: "offHand", label: "Off Hand" },
  { id: "ring", label: "Rings" },
];

export const RARITY_SORT_WEIGHT: Record<GearItem["rarity"], number> = { common: 0, uncommon: 1, rare: 2, epic: 3 };

export function itemMatchesInventoryFilter(item: GearItem, filter: InventoryGearFilter): boolean {
  if (filter === "all") return true;
  if (filter === "ring") return item.slot === "ring";
  if (filter === "mainHand" || filter === "offHand") return canEquipItemInSlot(item, filter);
  return item.slot === filter;
}

export const STAT_LABELS: Array<{ key: StatName; label: string }> = [
  { key: "strength", label: "Strength" },
  { key: "agility", label: "Agility" },
  { key: "intelligence", label: "Intelligence" },
  { key: "vitality", label: "Vitality" },
  { key: "luck", label: "Luck" },
];

export const ATTRIBUTE_ICON_URLS: Record<StatName, string> = {
  strength: "/assets/attribute-icons/strength.png",
  agility: "/assets/attribute-icons/agility.png",
  intelligence: "/assets/attribute-icons/intelligence.png",
  vitality: "/assets/attribute-icons/vitality.png",
  luck: "/assets/attribute-icons/luck.png",
};

export type DerivedStatIconName = "physicalPower" | "magicalPower" | "hitChance" | "dodgeChance" | "critChance" | "maxHp" | "armor" | "magicResistance" | "initiativeBonus" | "maxEnergy";
export type StatIconName = StatName | DerivedStatIconName;

export const DERIVED_STAT_ICON_URLS: Record<DerivedStatIconName, string> = {
  physicalPower: "/assets/stat-icons/physical-power.png",
  magicalPower: "/assets/stat-icons/magical-power.png",
  hitChance: "/assets/stat-icons/hit-chance.png",
  dodgeChance: "/assets/stat-icons/dodge-chance.png",
  critChance: "/assets/stat-icons/critical-chance.png",
  maxHp: "/assets/stat-icons/max-health.png",
  armor: "/assets/stat-icons/armor.png",
  magicResistance: "/assets/stat-icons/magic-resistance.png",
  initiativeBonus: "/assets/stat-icons/initiative.png",
  maxEnergy: "/assets/stat-icons/max-energy.png",
};

export const STAT_ICON_URLS: Record<StatIconName, string> = { ...ATTRIBUTE_ICON_URLS, ...DERIVED_STAT_ICON_URLS };

export function StatIcon({ stat }: { stat: StatIconName }) {
  return <img className="stat-icon" src={STAT_ICON_URLS[stat]} alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}

export function GoldIcon() {
  return <img className="gold-icon" src="/assets/resource-icons/gold.png" alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}

export const IMAGE_PRELOAD_CACHE = new Map<string, { image: HTMLImageElement; promise: Promise<void> }>();

export function preloadImage(url: string): Promise<void> {
  const cached = IMAGE_PRELOAD_CACHE.get(url);
  if (cached) return cached.promise;
  const image = new Image();
  const promise = new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (typeof image.decode === "function") image.decode().catch(() => undefined).finally(resolve);
      else resolve();
    };
    image.onload = finish;
    image.onerror = finish;
    image.src = url;
    if (image.complete) finish();
  });
  // Keep the decoded image alive for the lifetime of the app. A cached network
  // response alone does not guarantee that a new DOM image is already decoded.
  IMAGE_PRELOAD_CACHE.set(url, { image, promise });
  return promise;
}

export function preloadCharacterAssets(avatarUrl: string, portraitUrl: string): Promise<void[]> {
  return Promise.all([...new Set([
    avatarUrl,
    portraitUrl,
    ...Object.values(STAT_ICON_URLS),
    ...GEAR_ICON_URLS,
    "/assets/resource-icons/gold.png",
  ])].map(preloadImage));
}

export function rollDummyEncounter(): string[] {
  return Array.from({ length: Math.random() < 0.5 ? 2 : 3 }, () => "dummy");
}

export const ENCOUNTER_COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

export function pluralizeEnemyName(name: string): string {
  if (name === "DUMMY") return "DUMMIES";
  if (/wolf$/i.test(name)) return name.replace(/wolf$/i, (word) => word === "WOLF" ? "WOLVES" : word === "Wolf" ? "Wolves" : "wolves");
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  if (/(?:s|x|z|ch|sh)$/i.test(name)) return `${name}es`;
  return `${name}s`;
}

export function addIndefiniteArticle(name: string): string {
  const existingArticle = name.match(/^(a|an|the)\s/i);
  if (existingArticle) return `${existingArticle[1].toLowerCase()}${name.slice(existingArticle[1].length)}`;
  return `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;
}

export function describeEnemyEncounter(enemyIds: string[]): string {
  const counts = new Map<string, number>();
  enemyIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const groups = [...counts.entries()].map(([id, count]) => {
    const name = ENEMIES[id]?.name ?? id;
    if (count === 1) return addIndefiniteArticle(name);
    return `${ENCOUNTER_COUNT_WORDS[count] ?? count} ${pluralizeEnemyName(name)}`;
  });
  const description = groups.length <= 1
    ? groups[0] ?? "unknown enemies"
    : groups.length === 2
      ? groups.join(" and ")
      : `${groups.slice(0, -1).join(", ")}, and ${groups.at(-1)}`;
  return `You encounter ${description}.`;
}

export const STATUS_ICONS: Record<StatusEffectId, LucideIcon> = {
  guard: Shield,
  barrier: ShieldPlus,
  strengthened: Dumbbell,
  enlightened: Brain,
  fierce: Crosshair,
  shielded: ShieldCheck,
  regenerate: HeartPulse,
  taunt: Megaphone,
  stealth: EyeOff,
  evasion: Footprints,
  distraction: Sparkles,
  pinpoint: Crosshair,
  poison: FlaskConical,
  bleed: Droplets,
  burn: Flame,
  weaken: TrendingDown,
  shatter: ShieldOff,
  vulnerable: Target,
  stunned: Zap,
  diminishingReturns: ShieldCheck,
  exhausted: BatteryLow,
  slowed: Snail,
  reckless: Skull,
  wet: Waves,
  electrified: Zap,
  cold: Snowflake,
  charred: Flame,
  frozen: Snowflake,
  frozenPath: Footprints,
  blind: EyeOff,
  arcaneWound: CircleDot,
  arcaneCharge: Sparkles,
  staticCharge: Zap,
  chargedUp: Zap,
  burningMomentum: Flame,
  smite: Sun,
  sleep: Moon,
};

export const ABILITY_TYPE_LABELS: Record<DamageType, string> = {
  physical: "Physical",
  spell: "Spell Damage",
  shadow: "Shadow",
  arcane: "Arcane",
  fire: "Fire",
  frost: "Frost",
  lightning: "Lightning",
};

export const ABILITY_TYPE_ICONS: Record<DamageType, LucideIcon> = {
  physical: Swords,
  spell: FlaskConical,
  shadow: Moon,
  arcane: Sparkles,
  fire: Flame,
  frost: Snowflake,
  lightning: Zap,
};

export function getAbilityTypeLabel(ability: Ability): string {
  return ability.types.map((type) => ABILITY_TYPE_LABELS[type]).join(" / ");
}

export function AbilityTypeIcon({ ability, size = 18 }: { ability: Ability; size?: number }) {
  const Icon = ABILITY_TYPE_ICONS[ability.types[0]];
  return <Icon size={size} strokeWidth={1.8} />;
}

export const ATTRIBUTE_TOOLTIPS: Record<StatName, string> = {
  strength: "Increases your Physical Power and the amount of Guard you gain.",
  agility: "Increases your Physical Power, Hit Chance, Dodge Chance, and Initiative. Every 2 Agility grants 1 Initiative.",
  intelligence: "Increases your Spell Power and Initiative. Every 4 Intelligence grants 1 Initiative.",
  vitality: "Increases your Max Health and the amount of healing you receive.",
  luck: "Increases your Critical Chance, improves the quality of loot you find, and increases the chance for special effects to trigger.",
};

export const ATTRIBUTE_SUMMARIES: Record<StatName, string> = {
  strength: "Physical Power & Guard",
  agility: "Physical Power, Hit Chance, Dodge Chance & Initiative",
  intelligence: "Spell Power & Initiative",
  vitality: "Max Health & Healing Received",
  luck: "Critical Chance, Loot & Special Effects",
};

export function getAvailableCharacterAbilities(character: CharacterState): Ability[] {
  const abilityIds = TALENTS
    .filter((talent) => talent.abilityId && character.unlockedTalents.includes(talent.id))
    .map((talent) => talent.abilityId!);
  return [...new Set(abilityIds)].flatMap((abilityId) => ABILITIES[abilityId] ? [ABILITIES[abilityId]] : []);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatStat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function getDerivedStatRows(derived: ReturnType<typeof getDerivedStats>): Array<{ icon: DerivedStatIconName; label: string; value: string; tooltip: string }> {
  return [
    { icon: "physicalPower", label: "Physical Power", value: formatStat(derived.physicalPower), tooltip: "Your total power for Physical attacks." },
    { icon: "magicalPower", label: "Spell Power", value: formatStat(derived.magicalPower), tooltip: "Your total power for Spell attacks." },
    { icon: "hitChance", label: "Hit Chance", value: formatPercent(derived.hitChance), tooltip: "Your raw chance to hit. Enemy Dodge Chance is subtracted before the final 20â€“100% limit." },
    { icon: "dodgeChance", label: "Dodge Chance", value: formatPercent(derived.dodgeChance), tooltip: "Your chance to avoid enemy attacks. Dodge Chance is capped at 50%." },
    { icon: "critChance", label: "Critical Strike Chance", value: formatPercent(derived.critChance), tooltip: "Your chance for direct attacks to critically strike for increased damage." },
    { icon: "maxHp", label: "Max Health", value: formatStat(derived.maxHp), tooltip: "Your maximum Health." },
    { icon: "armor", label: "Armor", value: formatStat(derived.armor), tooltip: "Reduces incoming Physical damage." },
    { icon: "magicResistance", label: "Magic Resistance", value: formatStat(derived.magicResistance), tooltip: "Reduces incoming Spell damage." },
    { icon: "initiativeBonus", label: "Initiative", value: formatStat(derived.initiativeBonus), tooltip: "Added to your initiative roll at the start of combat." },
    { icon: "maxEnergy", label: "Max Energy", value: formatStat(derived.maxEnergy), tooltip: "Your maximum Energy. You regain Energy at the start of your turn." },
  ];
}
