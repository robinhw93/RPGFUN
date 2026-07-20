import { GEAR_SET_BONUSES, TALENTS } from "./data";
import type {
  CharacterState,
  CombatDamageModifierDefinition,
  CombatFeatureBundle,
  CombatState,
  CombatTriggerDefinition,
  CombatTriggerEvent,
  DamageType,
  PassiveBonuses,
  StatusEffect,
  Stats,
} from "./types";

export interface ResolvedCombatTrigger extends CombatTriggerDefinition {
  runtimeId: string;
  sourceId: string;
  sourceName: string;
  sourceKind: "gear" | "set" | "talent";
}

export interface ResolvedCombatDamageModifier extends CombatDamageModifierDefinition {
  runtimeId: string;
  sourceId: string;
  sourceName: string;
  sourceKind: "gear" | "set" | "talent";
}

export interface CombatTriggerContext {
  abilityId?: string;
  damageType?: DamageType;
  critical?: boolean;
  damage?: number;
  targetStatusIds?: string[];
}

export interface CharacterCombatFeatures {
  passive: Required<Omit<PassiveBonuses, "stats" | "statusDamage" | "preserveStatusOnDetonation">> & {
    stats: Stats;
    statusDamage: Partial<Record<StatusEffect["id"], number>>;
    preserveStatusOnDetonation: StatusEffect["id"][];
  };
  triggers: ResolvedCombatTrigger[];
  damageModifiers: ResolvedCombatDamageModifier[];
}

const EMPTY_PASSIVE: CharacterCombatFeatures["passive"] = {
  stats: { strength: 0, agility: 0, intelligence: 0, vitality: 0, luck: 0 },
  armor: 0,
  magicResistance: 0,
  physicalPower: 0,
  magicalPower: 0,
  power: 0,
  maxHp: 0,
  maxEnergy: 0,
  energyRegen: 0,
  critChance: 0,
  hitChance: 0,
  dodgeChance: 0,
  initiative: 0,
  guardGeneration: 0,
  healingReceived: 0,
  bleedDamageReduction: 0,
  lootRarity: 0,
  chanceEffect: 0,
  statusDamage: {},
  preserveStatusOnDetonation: [],
};

function addPassive(target: CharacterCombatFeatures["passive"], passive?: PassiveBonuses): void {
  if (!passive) return;
  Object.entries(passive.stats ?? {}).forEach(([stat, amount]) => {
    target.stats[stat as keyof Stats] += amount ?? 0;
  });
  target.armor += passive.armor ?? 0;
  target.magicResistance += passive.magicResistance ?? 0;
  target.physicalPower += passive.physicalPower ?? 0;
  target.magicalPower += passive.magicalPower ?? 0;
  target.power += passive.power ?? 0;
  target.maxHp += passive.maxHp ?? 0;
  target.maxEnergy += passive.maxEnergy ?? 0;
  target.energyRegen += passive.energyRegen ?? 0;
  target.critChance += passive.critChance ?? 0;
  target.hitChance += passive.hitChance ?? 0;
  target.dodgeChance += passive.dodgeChance ?? 0;
  target.initiative += passive.initiative ?? 0;
  target.guardGeneration += passive.guardGeneration ?? 0;
  target.healingReceived += passive.healingReceived ?? 0;
  target.bleedDamageReduction += passive.bleedDamageReduction ?? 0;
  target.lootRarity += passive.lootRarity ?? 0;
  target.chanceEffect += passive.chanceEffect ?? 0;
  Object.entries(passive.statusDamage ?? {}).forEach(([statusId, amount]) => {
    const id = statusId as StatusEffect["id"];
    target.statusDamage[id] = (target.statusDamage[id] ?? 0) + (amount ?? 0);
  });
  (passive.preserveStatusOnDetonation ?? []).forEach((statusId) => {
    if (!target.preserveStatusOnDetonation.includes(statusId)) target.preserveStatusOnDetonation.push(statusId);
  });
}

function addBundle(
  features: CharacterCombatFeatures,
  bundle: CombatFeatureBundle | undefined,
  source: Pick<ResolvedCombatTrigger, "sourceId" | "sourceName" | "sourceKind">,
): void {
  if (!bundle) return;
  addPassive(features.passive, bundle.passive);
  (bundle.triggers ?? []).forEach((trigger) => {
    features.triggers.push({
      ...trigger,
      ...source,
      runtimeId: `${source.sourceKind}:${source.sourceId}:${trigger.id}`,
    });
  });
  (bundle.damageModifiers ?? []).forEach((modifier) => {
    features.damageModifiers.push({
      ...modifier,
      ...source,
      runtimeId: `${source.sourceKind}:${source.sourceId}:${modifier.id}`,
    });
  });
}

export function getCharacterCombatFeatures(character: CharacterState): CharacterCombatFeatures {
  const features: CharacterCombatFeatures = {
    passive: {
      ...EMPTY_PASSIVE,
      stats: { ...EMPTY_PASSIVE.stats },
      statusDamage: { ...EMPTY_PASSIVE.statusDamage },
      preserveStatusOnDetonation: [...EMPTY_PASSIVE.preserveStatusOnDetonation],
    },
    triggers: [],
    damageModifiers: [],
  };
  const setCounts: Record<string, number> = {};

  Object.values(character.equipment).forEach((item) => {
    if (!item) return;
    addBundle(features, item.combat, { sourceId: item.id, sourceName: item.name, sourceKind: "gear" });
    if (item.set) setCounts[item.set] = (setCounts[item.set] ?? 0) + 1;
  });

  TALENTS.filter((talent) => character.unlockedTalents.includes(talent.id)).forEach((talent) => {
    addBundle(features, talent.combat, { sourceId: talent.id, sourceName: talent.name, sourceKind: "talent" });
    if (talent.passive) {
      addPassive(features.passive, {
        stats: talent.passive.stat ? { [talent.passive.stat]: talent.passive.amount ?? 0 } : undefined,
        maxHp: talent.passive.maxHp,
        maxEnergy: talent.passive.maxEnergy,
        energyRegen: talent.passive.energyRegen,
        critChance: talent.passive.critChance,
      });
    }
  });

  GEAR_SET_BONUSES.forEach((setBonus) => {
    if ((setCounts[setBonus.setId] ?? 0) < setBonus.requiredPieces) return;
    addBundle(features, setBonus, {
      sourceId: `${setBonus.setId}:${setBonus.requiredPieces}`,
      sourceName: `${setBonus.setName} (${setBonus.requiredPieces})`,
      sourceKind: "set",
    });
  });

  return features;
}

export function getCharacterDamageMultiplier(
  character: CharacterState,
  attackerStatuses: StatusEffect[],
  targetStatuses: StatusEffect[],
  damageType?: DamageType,
): number {
  return getDamageModifierMultiplier(getCharacterCombatFeatures(character).damageModifiers, attackerStatuses, targetStatuses, damageType);
}

export function getDamageModifierMultiplier(
  modifiers: CombatDamageModifierDefinition[],
  attackerStatuses: StatusEffect[],
  targetStatuses: StatusEffect[],
  damageType?: DamageType,
): number {
  return modifiers.reduce((multiplier, modifier) => {
    if (modifier.damageTypes?.length && (!damageType || !modifier.damageTypes.includes(damageType))) return multiplier;
    if (modifier.attackerHasAnyStatus?.length && !modifier.attackerHasAnyStatus.some((id) => attackerStatuses.some((status) => status.id === id))) return multiplier;
    if (modifier.targetHasAnyStatus?.length && !modifier.targetHasAnyStatus.some((id) => targetStatuses.some((status) => status.id === id))) return multiplier;
    return multiplier * modifier.multiplier;
  }, 1);
}

function conditionsMatch(trigger: ResolvedCombatTrigger, context: CombatTriggerContext): boolean {
  const conditions = trigger.conditions;
  if (!conditions) return true;
  if (conditions.abilityIds && (!context.abilityId || !conditions.abilityIds.includes(context.abilityId))) return false;
  if (conditions.damageTypes && (!context.damageType || !conditions.damageTypes.includes(context.damageType))) return false;
  if (conditions.critical !== undefined && Boolean(context.critical) !== conditions.critical) return false;
  if (conditions.minimumDamage !== undefined && (context.damage ?? 0) < conditions.minimumDamage) return false;
  if (conditions.targetHasAnyStatus?.length && !conditions.targetHasAnyStatus.some((id) => context.targetStatusIds?.includes(id))) return false;
  return true;
}

export function resolveCharacterTriggers(
  character: CharacterState,
  combat: CombatState,
  event: CombatTriggerEvent,
  context: CombatTriggerContext,
  currentUsage: CombatState["procUsage"],
  chanceEffectBonus = 0,
): { triggered: ResolvedCombatTrigger[]; procUsage: CombatState["procUsage"] } {
  const procUsage = { ...currentUsage };
  const triggered = getCharacterCombatFeatures(character).triggers.filter((trigger) => {
    if (trigger.event !== event || !conditionsMatch(trigger, context)) return false;
    const previousTurn = procUsage[trigger.runtimeId]?.lastTriggeredTurn;
    if (trigger.oncePerTurn && previousTurn === combat.turn) return false;
    if (trigger.cooldownTurns && previousTurn !== undefined && combat.turn - previousTurn < trigger.cooldownTurns) return false;
    const bonus = trigger.chance === undefined ? 0 : chanceEffectBonus;
    const chance = Math.max(0, Math.min(1, (trigger.chance ?? 1) + bonus));
    if (Math.random() >= chance) return false;
    procUsage[trigger.runtimeId] = { lastTriggeredTurn: combat.turn };
    return true;
  });
  return { triggered, procUsage };
}
