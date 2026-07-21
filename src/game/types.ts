import type { CharacterAvatarId } from "./avatars";

export type StatName = "strength" | "agility" | "intelligence" | "vitality" | "luck";
export type TalentBranch = "core" | "brute" | "shadow" | "arcanist";
export type TalentRequirementMode = "all" | "any";
export type GearSlot = "head" | "chest" | "pants" | "boots" | "mainHand" | "offHand" | "ring1" | "ring2";
export type GearType = Exclude<GearSlot, "ring1" | "ring2"> | "ring";
export type ArmorMaterial = "plate" | "leather" | "cloth";
export type WeaponEquipType = "mainHand" | "oneHand" | "offHand" | "twoHand";
export type WeaponKind = "sword" | "axe" | "mace" | "dagger" | "wand" | "shield" | "tome" | "staff" | "polearm";
/** Legacy save value. New items should use weaponEquipType. */
export type WeaponType = "oneHanded" | "twoHanded";
export type DamageType = "physical" | "arcane" | "shadow" | "fire" | "frost" | "lightning";
export type TargetType = "enemy" | "self" | "all_enemies";

export interface Stats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  luck: number;
}

export interface StatusEffect {
  id: StatusEffectId;
  name: string;
  kind: "buff" | "debuff";
  duration: number;
  stacks: number;
  description: string;
  permanent?: boolean;
  sourcePower?: number;
  sourceId?: "player" | string;
  /** Optional status-specific strength, expressed as a decimal bonus. */
  magnitude?: number;
  /** False keeps special one-round effects until their duration expires at turn end. */
  expiresAtTurnStart?: boolean;
}

export type StatusEffectId =
  | "guard"
  | "strengthened"
  | "enlightened"
  | "fierce"
  | "shielded"
  | "regenerate"
  | "taunt"
  | "stealth"
  | "evasion"
  | "poison"
  | "bleed"
  | "burn"
  | "weaken"
  | "shatter"
  | "vulnerable"
  | "stunned"
  | "exhausted"
  | "slowed"
  | "reckless"
  | "wet"
  | "electrified"
  | "cold"
  | "charred"
  | "sleep";

export type CombatTriggerEvent = "combat_start" | "turn_start" | "before_ability" | "on_hit" | "on_crit" | "on_kill" | "damage_taken" | "turn_end";
export type CombatEffectTarget = "self" | "target" | "all_enemies" | "random_enemy";

export interface PassiveBonuses {
  stats?: Partial<Stats>;
  armor?: number;
  magicResistance?: number;
  physicalPower?: number;
  magicalPower?: number;
  /** Legacy generic power. Prefer physicalPower or magicalPower for new content. */
  power?: number;
  maxHp?: number;
  maxEnergy?: number;
  energyRegen?: number;
  critChance?: number;
  hitChance?: number;
  dodgeChance?: number;
  initiative?: number;
  guardGeneration?: number;
  healingReceived?: number;
  bleedDamageReduction?: number;
  lootRarity?: number;
  chanceEffect?: number;
  /** Additive damage bonuses by damage-over-time status. 0.1 means 10% more damage. */
  statusDamage?: Partial<Record<StatusEffectId, number>>;
  /** Statuses kept when an ability would normally consume them through detonation. */
  preserveStatusOnDetonation?: StatusEffectId[];
  startingStatuses?: StatusEffect[];
}

export interface CombatTriggerCondition {
  abilityIds?: string[];
  damageTypes?: DamageType[];
  critical?: boolean;
  minimumDamage?: number;
  targetHasAnyStatus?: string[];
  /** Matches only when direct damage crosses from at-or-above to below this Health ratio. */
  targetHealthCrossedBelow?: number;
}

export type CombatEffectDefinition =
  | { type: "damage"; amount: number; target?: CombatEffectTarget; damageType?: DamageType; scalingStat?: StatName; scaling?: number }
  | { type: "apply_status"; status: StatusEffect; target?: CombatEffectTarget }
  | { type: "heal"; amount: number; target?: "self" }
  | { type: "gain_energy"; amount: number; target?: "self" }
  | { type: "gain_guard"; amount: number; duration?: number; target?: "self" };

export interface CombatTriggerDefinition {
  id: string;
  name: string;
  description: string;
  event: CombatTriggerEvent;
  chance?: number;
  conditions?: CombatTriggerCondition;
  effects: CombatEffectDefinition[];
  oncePerTurn?: boolean;
  cooldownTurns?: number;
}

export interface CombatDamageModifierDefinition {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  damageTypes?: DamageType[];
  attackerHasAnyStatus?: StatusEffectId[];
  targetHasAnyStatus?: StatusEffectId[];
}

export interface AbilityModifierDefinition {
  id: string;
  name: string;
  description: string;
  abilityIds: string[];
  allowWithoutRequiredSelfStatus?: boolean;
  powerScalingWhenRequirementMissing?: number;
  statusDuration?: number;
  statusMagnitude?: number;
  statusExpiresAtTurnStart?: boolean;
  applyStatusAfterConsume?: { status: StatusEffectId; stacks?: number; duration?: number };
  detonationRetainedStackRatio?: number;
}

export interface CombatFeatureBundle {
  passive?: PassiveBonuses;
  triggers?: CombatTriggerDefinition[];
  damageModifiers?: CombatDamageModifierDefinition[];
  abilityModifiers?: AbilityModifierDefinition[];
}

export interface GearSetBonusDefinition extends CombatFeatureBundle {
  setId: string;
  setName: string;
  requiredPieces: number;
  description: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  /** Player turns before this ability can be used again. */
  cooldownTurns?: number;
  target: TargetType;
  damageType?: DamageType;
  damageComponents?: Array<{ damageType: DamageType; power?: number; powerScaling?: number }>;
  power?: number;
  /** Multiplier applied to Physical or Magical Power. Defaults to 1. */
  powerScaling?: number;
  /** Number of separate attacks performed by one use. Each attack can trigger on-hit effects. */
  hits?: number;
  /** Chooses a new living enemy independently for every hit. */
  randomTargetPerHit?: boolean;
  /** False applies the ability's effect without dealing direct damage. */
  dealsDamage?: boolean;
  /** Number of stacks applied when effect is a status. Defaults to 1. */
  statusStacks?: number;
  statusDuration?: number;
  statusMagnitude?: number;
  statusExpiresAtTurnStart?: boolean;
  requiredTargetStatus?: StatusEffectId;
  requiredSelfStatus?: StatusEffectId;
  critChanceBonus?: number;
  /** Deals all remaining damage from this status immediately. */
  detonateStatus?: StatusEffectId;
  consumeTargetStatus?: StatusEffectId;
  consumeStatusForHealing?: StatusEffectId;
  /** Conditional multipliers belonging to this ability. */
  damageModifiers?: CombatDamageModifierDefinition[];
  scalingStat?: StatName;
  icon: string;
  branch: TalentBranch;
  effect?: StatusEffectId | "stun" | "heal" | "energy" | "reset_cooldowns";
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  branch: TalentBranch;
  tier: number;
  cost: number;
  requires: string[];
  /** Defaults to any. Use all only when every connected talent must be unlocked. */
  requireMode?: TalentRequirementMode;
  kind: "class" | "passive" | "ability";
  position: { x: number; y: number };
  icon: string;
  shape: "circle" | "square";
  abilityId?: string;
  /** Design notes shown when this node becomes the starting point for a fresh devtool draft. */
  effectNotes?: string;
  combat?: CombatFeatureBundle;
  /** Legacy passive shape; new bonuses should use combat.passive. */
  passive?: {
    stat?: StatName;
    amount?: number;
    maxHp?: number;
    maxEnergy?: number;
    energyRegen?: number;
    critChance?: number;
  };
}

export interface GearItem {
  id: string;
  name: string;
  slot: GearType;
  armorMaterial?: ArmorMaterial;
  weaponEquipType?: WeaponEquipType;
  weaponKind?: WeaponKind;
  /** Legacy save value. New items should use weaponEquipType. */
  weaponType?: WeaponType;
  rarity: "common" | "uncommon" | "rare" | "epic";
  description: string;
  stats: Partial<Stats>;
  armor?: number;
  magicResistance?: number;
  physicalPower?: number;
  magicalPower?: number;
  /** Legacy generic power. Prefer physicalPower or magicalPower for new content. */
  power?: number;
  set?: string;
  setName?: string;
  combat?: CombatFeatureBundle;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  power: number;
  armor: number;
  magicResistance: number;
  hitChance: number;
  dodgeChance: number;
  damageType: DamageType;
  energyCost: number;
  intentText: string;
  attackDescription: string;
  onHitEffect?: "bleed";
  accent: string;
}

export interface EnemyState extends EnemyTemplate {
  instanceId: string;
  hp: number;
  energy: number;
  maxEnergy: number;
  statuses: StatusEffect[];
  stunned: boolean;
}

export interface TurnOrderEntry {
  actorId: string;
  kind: "player" | "enemy";
  name: string;
  roll: number;
  bonus: number;
  initiative: number;
}

export type CombatPendingEffect =
  | { id: string; eventIndex: number; type?: "damage"; targetId: "player" | string; damage: number; attackerId?: "player" | string }
  | { id: string; eventIndex: number; type: "heal"; targetId: "player" | string; amount: number }
  | { id: string; eventIndex: number; type: "status"; targetId: "player" | string; status: StatusEffect; stunned?: boolean }
  | { id: string; eventIndex: number; type: "remove_status"; targetId: "player" | string; statusId: StatusEffectId }
  | { id: string; eventIndex: number; type: "set_status"; targetId: "player" | string; status: StatusEffect }
  | { id: string; eventIndex: number; type: "turn"; activeTurnIndex: number; turn: number; playerActed?: boolean; playerStatuses?: StatusEffect[]; energy?: number };

export interface CombatState {
  turn: number;
  turnOrder: TurnOrderEntry[];
  activeTurnIndex: number;
  initiativeRevealed: boolean;
  playerActed: boolean;
  abilityCooldowns: Record<string, number>;
  eventId: number;
  completedSequenceEventId: number;
  floatingEvents: string[];
  pendingEffects: CombatPendingEffect[];
  procUsage: Record<string, { lastTriggeredTurn: number }>;
  damagedTargets: string[];
  attackingActorId: "player" | string | null;
  attackAnimationId: number;
  attackEffectId: string | null;
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  selectedEnemyId: string;
  enemies: EnemyState[];
  playerStatuses: StatusEffect[];
  log: Array<CombatLogEntry | string>;
  outcome: "active" | "victory" | "defeat";
}

export interface InspectableInfo {
  title: string;
  description: string;
  category: "ability" | "status" | "stat";
}

export interface CombatLogEntry {
  id: string;
  text: string;
  info?: InspectableInfo;
}

export interface CharacterState {
  name: string;
  avatarId: CharacterAvatarId;
  level: number;
  xp: number;
  unspentStatPoints: number;
  gold: number;
  baseStats: Stats;
  talentPoints: number;
  unlockedTalents: string[];
  equippedAbilities: string[];
  inventory: GearItem[];
  equipment: Partial<Record<GearSlot, GearItem>>;
}

export interface AdventureNode {
  id: string;
  type: "combat" | "event" | "boss";
  eyebrow: string;
  title: string;
  description: string;
  enemies?: string[];
  reward?: {
    experience: number;
    gold: number;
    loot: boolean;
  };
}

export interface CombatReward {
  id: string;
  nodeIndex: number;
  experience: number;
  gold: number;
  loot: GearItem | null;
  levelBefore: number;
  xpBefore: number;
  levelAfter: number;
  xpAfter: number;
  levelsGained: number;
}

export interface AdventureProgress {
  active: boolean;
  nodeIndex: number;
  carryHp: number | null;
  combat: CombatState | null;
  eventResolved: boolean;
  latestLoot: GearItem | null;
  pendingReward: CombatReward | null;
  completed: boolean;
}

export interface GameState {
  characterCreated: boolean;
  character: CharacterState;
  adventure: AdventureProgress;
}
