import type { CharacterAvatarId } from "./avatars";

export type StatName = "strength" | "agility" | "intelligence" | "vitality" | "luck";
export type TalentBranch = "core" | "brute" | "shadow" | "arcanist" | "cultist";
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
  | "barrier"
  | "strengthened"
  | "enlightened"
  | "fierce"
  | "shielded"
  | "regenerate"
  | "taunt"
  | "stealth"
  | "evasion"
  | "distraction"
  | "pinpoint"
  | "poison"
  | "bleed"
  | "burn"
  | "weaken"
  | "shatter"
  | "vulnerable"
  | "stunned"
  | "diminishingReturns"
  | "exhausted"
  | "slowed"
  | "reckless"
  | "wet"
  | "electrified"
  | "cold"
  | "charred"
  | "arcaneWound"
  | "arcaneCharge"
  | "staticCharge"
  | "chargedUp"
  | "burningMomentum"
  | "smite"
  | "frozen"
  | "frozenPath"
  | "blind"
  | "sleep";

export type CombatTriggerEvent = "combat_start" | "turn_start" | "before_ability" | "on_hit" | "on_crit" | "on_kill" | "damage_dealt" | "status_applied" | "status_removed" | "status_damage" | "health_restored" | "guard_gained" | "damage_taken" | "enemy_missed" | "enemy_stunned" | "turn_end";
export type CombatEffectTarget = "self" | "target" | "all_enemies" | "random_enemy";

export interface PassiveBonuses {
  stats?: Partial<Stats>;
  /** Additive percentage multipliers applied to final attributes after flat bonuses. */
  statMultipliers?: Partial<Stats>;
  armor?: number;
  /** Additive multiplier applied after all flat and Strength-derived Armor. */
  armorMultiplier?: number;
  /** Additional Armor equal to this fraction of final Strength, rounded up. */
  armorFromStrengthRatio?: number;
  magicResistance?: number;
  physicalPower?: number;
  /** Additive multiplier applied to final Physical Power after flat bonuses. */
  physicalPowerMultiplier?: number;
  magicalPower?: number;
  /** Additive multiplier applied to final Spell Power after flat bonuses. */
  magicalPowerMultiplier?: number;
  /** Legacy generic power. Prefer physicalPower or magicalPower for new content. */
  power?: number;
  maxEnergy?: number;
  energyRegen?: number;
  critChance?: number;
  hitChance?: number;
  dodgeChance?: number;
  initiative?: number;
  /** Flat direct damage added to every hit as a fraction of current Armor. */
  bonusDirectDamageFromArmorRatio?: number;
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
  /** Status effects that cannot be applied to the character. */
  statusImmunities?: StatusEffectId[];
  /** Additional stacks whenever the character applies a matching status. */
  statusApplicationStacks?: Partial<Record<StatusEffectId, number>>;
  /** Healing gained as a fraction of damage dealt by matching statuses. */
  statusDamageLeech?: Partial<Record<StatusEffectId, number>>;
  /** Extra statuses applied alongside a matching player-applied status. */
  statusApplicationCompanions?: Partial<Record<StatusEffectId, StatusEffectId[]>>;
  /** Chance-based extra statuses applied alongside a matching player-applied status. */
  statusApplicationCompanionChances?: Partial<Record<StatusEffectId, Array<{ status: StatusEffectId; chance: number }>>>;
  /** Guard or Barrier granted at combat start as a fraction of maximum Health. */
  startingAbsorptionMaxHpRatios?: Partial<Record<"guard" | "barrier", number>>;
  /** Unabsorbable self damage taken at combat start when entering at full Health. */
  fullHealthCombatStartSelfDamageMaxHpRatio?: number;
  /** Additional duration applied whenever the character creates a matching status. */
  statusDurationBonuses?: Partial<Record<StatusEffectId, number>>;
  /** Incoming damage reduction per point of currently unspent Energy. */
  incomingDamageReductionPerEnergy?: number;
  /** Final incoming-damage multiplier while the character is Stunned. */
  incomingDamageMultiplierWhileStunned?: number;
  /** Fraction of Max Health restored the first time lethal damage is taken each combat. */
  deathPreventionHealRatio?: number;
  /** Stealth duration granted by the combat's death-prevention effect. */
  deathPreventionStealthDuration?: number;
  /** Consumes this self status on the first lethal hit and heals for its remaining damage. */
  deathPreventionConsumeStatusForHealing?: StatusEffectId;
  /** Cannot miss targets carrying at least this many stacks of the matching status. */
  guaranteedHitAgainstStatusStacks?: Partial<Record<StatusEffectId, number>>;
}

export interface CombatTriggerCondition {
  abilityIds?: string[];
  abilityBranches?: TalentBranch[];
  damageTypes?: DamageType[];
  critical?: boolean;
  minimumDamage?: number;
  targetHasAnyStatus?: string[];
  targetHadAnyStatus?: StatusEffectId[];
  selfHasAnyStatus?: StatusEffectId[];
  appliedAnyStatus?: StatusEffectId[];
  removedAnyStatus?: StatusEffectId[];
  removalReasons?: Array<"consumed" | "expired">;
  /** Matches damage originating from one of these status effects. */
  sourceAnyStatus?: StatusEffectId[];
  /** Matches whether the event source is an enemy or the player. */
  sourceKinds?: Array<"player" | "enemy">;
  absorbedByAnyStatus?: Array<"guard" | "barrier">;
  depletedAnyStatus?: Array<"guard" | "barrier">;
  /** Matches the source ability of an absorption status that was fully depleted. */
  depletedStatusSourceIds?: string[];
  /** Matches only when direct damage crosses from at-or-above to below this Health ratio. */
  targetHealthCrossedBelow?: number;
}

export type CombatEffectDefinition =
  | { type: "damage"; amount: number; target?: CombatEffectTarget; damageType?: DamageType; scalingStat?: StatName; scalingPower?: "physical" | "magical"; scaling?: number; armorScaling?: number; triggerDamageRatio?: number; triggerAbsorbedStatus?: "guard" | "barrier"; vfx?: CombatAbilityVfxKind }
  | { type: "damage_percent_current_hp"; ratio: number; target?: CombatEffectTarget; damageType?: DamageType }
  | { type: "apply_status"; status: StatusEffect; target?: CombatEffectTarget }
  | { type: "heal"; amount: number; triggerDamageRatio?: number; target?: "self" }
  | { type: "heal_percent_max_hp"; ratio: number; target?: "self" }
  | { type: "gain_energy"; amount: number; target?: "self" }
  | { type: "gain_next_turn_energy_regen"; amount: number; target?: "self" }
  | { type: "reduce_random_cooldown"; amount: number; target?: "self" }
  | { type: "build_status_charge"; status: StatusEffectId; amount: number; threshold: number; thresholdEnergy: number; target?: "self" }
  | { type: "gain_guard"; amount: number; duration?: number; target?: "self" }
  | { type: "gain_absorption"; status: "guard" | "barrier"; amount?: number; scalingPower?: "physical" | "magical"; scaling?: number; triggerDamageRatio?: number; duration?: number; target?: "self" };

export interface CombatTriggerDefinition {
  id: string;
  name: string;
  description: string;
  event: CombatTriggerEvent;
  chance?: number;
  conditions?: CombatTriggerCondition;
  effects: CombatEffectDefinition[];
  oncePerTurn?: boolean;
  oncePerCombat?: boolean;
  /** Fires on every matching Nth event during one player turn. */
  everyNthPerTurn?: number;
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
  targetHasAllStatuses?: StatusEffectId[];
  /** Additional multiplicative damage per unique debuff on the target. */
  multiplierPerTargetDebuff?: number;
  /** Active only before the player has taken damage in the current combat. */
  requiresPlayerUndamaged?: boolean;
  /** Active only before the player's first miss in the current combat. */
  requiresNoPlayerMiss?: boolean;
  /** Active only while the player leads the current initiative order. */
  requiresFirstInInitiative?: boolean;
}

export interface CombatStatusDamageModifierDefinition {
  id: string;
  name: string;
  description: string;
  /** Status effects whose outgoing damage receives this additive bonus. */
  statuses: StatusEffectId[];
  /** The bonus is active only while the status source has one of these effects. */
  sourceHasAnyStatus?: StatusEffectId[];
  /** Additive bonus where 0.1 means 10% more damage. */
  bonus: number;
}

export interface AbilityModifierDefinition {
  id: string;
  name: string;
  description: string;
  abilityIds: string[];
  /** Complete player-facing ability description while this modifier is active. */
  descriptionOverride?: string;
  allowWithoutRequiredSelfStatus?: boolean;
  powerScalingWhenRequirementMissing?: number;
  /** Adds to the primary direct-damage component's Power scaling. */
  powerScalingBonus?: number;
  /** Adds to the primary direct-damage component's Armor scaling. */
  armorScalingBonus?: number;
  /** Changes which derived Power scales the primary component without changing its damage type. */
  powerSourceOverride?: "physical" | "magical";
  /** Adds Critical Strike Chance for the modified ability. */
  critChanceBonus?: number;
  /** Overrides the base stack count of the ability's primary status effect. */
  statusStacks?: number;
  statusDuration?: number;
  statusMagnitude?: number;
  statusExpiresAtTurnStart?: boolean;
  statusStackPowerScaling?: { power: "physical" | "magical"; scaling: number };
  replaceStatusApplication?: { from: StatusEffectId; to: StatusEffectId };
  additionalStatusApplications?: Array<{ status: StatusEffectId; stacks?: number; duration?: number; chance?: number; chancePerArmor?: number; onlyOnCritical?: boolean }>;
  additionalStatusApplicationsWhenTargetHas?: { targetStatus: StatusEffectId; applications: Array<{ status: StatusEffectId; stacks?: number; duration?: number; chance?: number; chancePerArmor?: number; onlyOnCritical?: boolean }> };
  randomTargetPerHit?: boolean;
  damagePerTargetStatusStackMultiplierDelta?: number;
  /** Extra direct-damage multiplier per living enemy carrying the configured status. */
  damageMultiplierPerLivingEnemyWithStatus?: { status: StatusEffectId; multiplier: number };
  preHealSelfStatusRemainingDamage?: StatusEffectId;
  nextTurnEnergyRegenBonus?: number;
  nextTurnEnergyRegenOnHitBonus?: number;
  selfHealPercentMaxHp?: number;
  statusStacksPerTargetStatusDivisor?: number;
  triggerTargetStatusDamageWhenAppliedStacksAtLeast?: { status: StatusEffectId; minimumAppliedStacks: number };
  applyStatusAfterConsume?: { status: StatusEffectId; stacks?: number; duration?: number };
  detonationRetainedStackRatio?: number;
  statusConsumptionRatio?: number;
  /** Added to the live Energy cost, then rounded and clamped to zero. */
  energyCostDelta?: number;
  /** Added to the live cooldown, then rounded and clamped to zero. */
  cooldownTurnsDelta?: number;
  requiredTargetStatusStacksMinimum?: number;
  consumeTargetStatusStacksAmount?: number;
  /** Leaves a status in place while still using its current stacks to resolve consume-based benefits. */
  retainTargetStatusOnConsume?: boolean;
  /** Adds Spell Power scaling to Guard generated by the modified ability. */
  selfGuardMagicalPowerScalingBonus?: number;
  /** Removes every debuff from the player when the modified ability resolves. */
  removeAllSelfDebuffs?: boolean;
  additionalSelfStatusApplications?: Array<{ status: StatusEffectId; stacks?: number; duration?: number; expiresAtTurnStart?: boolean }>;
}

export interface CombatFeatureBundle {
  passive?: PassiveBonuses;
  triggers?: CombatTriggerDefinition[];
  damageModifiers?: CombatDamageModifierDefinition[];
  statusDamageModifiers?: CombatStatusDamageModifierDefinition[];
  abilityModifiers?: AbilityModifierDefinition[];
}

export interface GearSetBonusDefinition extends CombatFeatureBundle {
  setId: string;
  setName: string;
  requiredPieces: number;
  description: string;
}

export type CombatAbilityVfxKind =
  | "poison_cloud"
  | "contagion"
  | "neurotoxin"
  | "toxic_explosion"
  | "venomborn"
  | "evasion"
  | "focus"
  | "recuperate"
  | "guard"
  | "ambush"
  | "venomous_strike"
  | "flurry"
  | "slice_and_dice"
  | "lightning_strike"
  | "sharpened_blade"
  | "slowing_venom"
  | "weakening_venom"
  | "rabid_venom"
  | "pinpoint_slice"
  | "pandemic"
  | "light_speed"
  | "light_speed_turn"
  | "chain_assassination"
  | "cull_the_weak"
  | "epidemic"
  | "voltage_siphon"
  | "arcane_bolt"
  | "frostbolt"
  | "arcane_blast"
  | "fireball"
  | "lightning_beam"
  | "thunderstorm"
  | "deep_freeze"
  | "arcane_overload"
  | "combustion"
  | "combustion_spread"
  | "arcane_combustion"
  | "thundersnow"
  | "self_immolation"
  | "arcane_barrier"
  | "barrier_absorb"
  | "frozen_path"
  | "conductor"
  | "firestorm"
  | "mana_fracture"
  | "essence_siphon"
  | "rapid_fire"
  | "focused_blast"
  | "absolute_zero"
  | "blizzard"
  | "ride_the_lightning"
  | "charge_siphon"
  | "charge"
  | "elemental_fury"
  | "phoenix_heart"
  | "searing_strike"
  | "wounding_strike"
  | "swift_blade"
  | "flame_cleave"
  | "shield_bash"
  | "bloodletting"
  | "holy_strike"
  | "unbreakable"
  | "blood_barrier"
  | "burning_guard"
  | "lay_on_hands"
  | "shield_charge"
  | "bloodbath"
  | "furnace_breaker"
  | "divine_smite"
  | "smite_retribution"
  | "blood_frenzy"
  | "crushing_impact"
  | "explosive_strike"
  | "explosive_strike_blast"
  | "consecrated_ground"
  | "bash"
  | "brute_guard"
  | "defensive_maneuvers"
  | "vampirism"
  | "vampirism_drain"
  | "fire_eater"
  | "fire_eater_transfer"
  | "beacon_of_light"
  | "martyrdom";

export type AbilityRange = "melee" | "ranged";
export type AbilityAttackPresentation = "melee" | "projectile" | "target";

export interface Ability {
  id: string;
  name: string;
  description: string;
  /** Damage schools represented by the ability. The first entry controls its primary action-bar treatment. */
  types: DamageType[];
  energyCost: number;
  /** Player turns before this ability can be used again. */
  cooldownTurns?: number;
  target: TargetType;
  /** Controls targeting and the default direct-attack presentation. */
  range: AbilityRange;
  /** Ranged abilities may resolve their VFX directly on the target instead of travelling there. */
  rangedPresentation?: "projectile" | "target";
  /** Reverses the resolved VFX from the struck target back to the player. */
  vfxDirection?: "to_target" | "to_player";
  damageType?: DamageType;
  damageComponents?: Array<{ damageType: DamageType; power?: number; powerScaling?: number; armorScaling?: number; powerSource?: "physical" | "magical" }>;
  power?: number;
  /** Multiplier applied to Physical or Spell Power. Defaults to 1. */
  powerScaling?: number;
  /** Number of separate attacks performed by one use. Each attack can trigger on-hit effects. */
  hits?: number;
  /** Overrides hits while the player carries the configured status. */
  hitsWhenSelfHasStatus?: { status: StatusEffectId; hits: number };
  /** Chooses a new living enemy independently for every hit. */
  randomTargetPerHit?: boolean;
  /** All targets of an area attack resolve damage, statuses, and VFX on one shared impact event. */
  simultaneousAreaImpact?: boolean;
  /** Emits the ability VFX on every grouped area target instead of once as an arena-wide field. */
  areaVfxPerTarget?: boolean;
  /** False applies the ability's effect without dealing direct damage. */
  dealsDamage?: boolean;
  /** Number of stacks applied when effect is a status. Defaults to 1. */
  statusStacks?: number;
  statusDuration?: number;
  statusMagnitude?: number;
  statusExpiresAtTurnStart?: boolean;
  requiredTargetStatus?: StatusEffectId;
  requiredTargetStatusStacks?: { status: StatusEffectId; minimum: number };
  requiredSelfStatus?: StatusEffectId;
  critChanceBonus?: number;
  critChanceBonusWithStatus?: { status: StatusEffectId; bonus: number };
  /** Deals all remaining damage from this status immediately. */
  detonateStatus?: StatusEffectId;
  /** On a lethal detonation, copy this fraction of the consumed stacks to every other living enemy. */
  spreadDetonatedStatusOnKillRatio?: number;
  /** Presentation emitted for every destination of a lethal detonation spread. */
  spreadOnKillVfx?: CombatAbilityVfxKind;
  consumeTargetStatus?: StatusEffectId;
  /** Fixed number of stacks consumed instead of the ratio-based default. */
  consumeTargetStatusStacks?: number;
  /** Restores Energy from the number of target-status stacks consumed. */
  energyPerConsumedTargetStatusStacks?: { stacksPerEnergy: number };
  /** Fraction of the target status stacks consumed. Defaults to all stacks. */
  consumeTargetStatusRatio?: number;
  consumeStatusForHealing?: StatusEffectId;
  /** Copies this status from the selected target to another random living enemy. */
  spreadTargetStatus?: StatusEffectId;
  /** Copies every debuff from the selected target to all other living enemies. */
  spreadAllTargetDebuffs?: boolean;
  /** Statuses applied by a damaging ability after a successful hit. */
  statusApplications?: Array<{ status: StatusEffectId; stacks?: number; duration?: number; chance?: number; chancePerArmor?: number; onlyOnCritical?: boolean }>;
  /** Statuses applied only when the struck target had no debuffs before the hit. */
  statusApplicationsWhenTargetHasNoDebuffs?: Array<{ status: StatusEffectId; stacks?: number; duration?: number; chance?: number; onlyOnCritical?: boolean }>;
  /** Replaces one application when the target already has a configured status. */
  conditionalStatusReplacement?: { status: StatusEffectId; whenTargetHas: StatusEffectId; replacement: StatusEffectId };
  /** Replaces the full configured status-application list when its condition matches. */
  conditionalStatusApplications?: { whenTargetHas: StatusEffectId; applications: Array<{ status: StatusEffectId; stacks?: number; duration?: number; chance?: number; onlyOnCritical?: boolean }> };
  /** One living target receives this application when an area ability hits. */
  randomSingleStatusApplication?: { status: StatusEffectId; stacks?: number; duration?: number };
  /** Applies floor(target stacks / divisor) stacks of a status on a successful hit. */
  statusApplicationPerTargetStatusStacks?: { status: StatusEffectId; targetStatus: StatusEffectId; divisor: number };
  /** Scale direct damage and a follow-up status from stacks consumed on a successful hit. */
  consumeTargetStatusForDamage?: { status: StatusEffectId; damageType: DamageType; powerScalingPerStack: number; applyStatus?: StatusEffectId; appliedStacksPerConsumedStack?: number };
  /** This ability costs 0 Energy against a target carrying the marker, then consumes it. */
  freeAgainstTargetStatus?: StatusEffectId;
  /** Statuses applied to the player after the ability resolves. */
  selfStatusApplications?: Array<{ status: StatusEffectId; stacks?: number; duration?: number; expiresAtTurnStart?: boolean }>;
  /** Applies matching self and single-target statuses at one shared presentation event. */
  combineSelfAndTargetStatusEvent?: boolean;
  /** Presentation emitted when the ability applies one of its configured self statuses. */
  selfStatusVfx?: CombatAbilityVfxKind;
  /** Scales the primary status stack amount from one of the character's powers. */
  statusStackPowerScaling?: { power: "physical" | "magical"; scaling: number };
  /** Reusable self-benefits granted when the struck target already has a required status. */
  conditionalSelfEffects?: Array<{
    targetHasStatus: StatusEffectId;
    healPercentMaxHp?: number;
    nextTurnEnergyRegen?: number;
    /** Presentation emitted only when this conditional benefit resolves. */
    vfx?: CombatAbilityVfxKind;
  }>;
  /** Restores a fraction of maximum Health after a successful hit. */
  selfHealPercentMaxHp?: number;
  /** Restores flat Health per stack of a target status after a successful hit. */
  selfHealPerTargetStatusStack?: { status: StatusEffectId; multiplier: number; vfx?: CombatAbilityVfxKind };
  /** Grants Guard equal to this fraction of current Armor after a successful hit. */
  selfGuardFromArmorRatio?: number;
  /** Grants Guard from one or more derived values when the ability resolves. */
  selfGuard?: { armorScaling?: number; physicalPowerScaling?: number; magicalPowerScaling?: number; duration?: number };
  /** Grants Guard per target-status stack resolved by a consume-style ability. */
  guardPerConsumedTargetStatusStackMaxHpRatio?: number;
  /** Grants Barrier equal to this fraction of the Health actually restored by the ability. */
  barrierFromSelfHealingRatio?: number;
  /** Applies these statuses only while the player carries the configured status. */
  statusApplicationsWhenSelfHas?: { selfStatus: StatusEffectId; applications: Array<{ status: StatusEffectId; stacks?: number; duration?: number }> };
  /** Immediately resolves one tick of this target status without consuming it. */
  triggerTargetStatusDamage?: StatusEffectId;
  /** Grants a temporary Energy-regeneration bonus after a successful hit. */
  nextTurnEnergyRegenOnHit?: number;
  /** Incoming Guard and Barrier do not absorb this ability's direct damage. */
  ignoresAbsorption?: boolean;
  /** Restore this fraction of maximum Energy after paying the ability cost. */
  energyRestorePercentOfMax?: number;
  /** The next damaging ability used by the player is guaranteed to critically strike. */
  grantsNextCritical?: boolean;
  /** Direct damage gains this multiplier for every unique target debuff. */
  damagePerTargetDebuff?: number;
  /** Direct damage gains this additive multiplier for every stack of one target status. */
  damagePerTargetStatusStack?: { status: StatusEffectId; multiplier: number };
  /** Adds direct damage equal to a multiple of a self-status stack count. */
  damageFromSelfStatusStacks?: { status: StatusEffectId; multiplier: number; damageType: DamageType };
  /** Consumes one target status after impact and deals its remaining damage to every other living enemy. */
  consumeTargetStatusForOtherEnemiesDamage?: { status: StatusEffectId; damageType: DamageType; vfx?: CombatAbilityVfxKind };
  /** Removes every buff from the struck target at the same impact event. */
  removeAllTargetBuffs?: boolean;
  /** Consumes a self status, heals for its remaining damage, then transfers it to the selected target. */
  transferSelfStatusToTargetForHealing?: { status: StatusEffectId; selfVfx?: CombatAbilityVfxKind; transferVfx?: CombatAbilityVfxKind };
  /** Removes a status from every living enemy before resolving the ability's rewards. */
  consumeStatusFromAllEnemies?: StatusEffectId;
  /** Travels from every enemy whose status was consumed back to the player at removal time. */
  consumeStatusFromAllEnemiesVfx?: CombatAbilityVfxKind;
  energyPerConsumedEnemyStatus?: number;
  cooldownReductionPerConsumedEnemyStatus?: number;
  /** Resolves a complete player turn ending and immediately starts a new player turn. */
  grantsImmediateTurn?: boolean;
  /** Refund the Energy actually spent when this ability kills its target. */
  refundEnergyOnKill?: boolean;
  /** Clear this ability's cooldown when it kills its target. */
  resetCooldownOnKill?: boolean;
  /** Presentation emitted only when this ability kills its target. */
  killVfx?: CombatAbilityVfxKind;
  /** Presentation emitted when an immediate extra turn is announced. */
  immediateTurnVfx?: CombatAbilityVfxKind;
  /** Multiplies the complete direct-attack animation sequence without changing combat rules. */
  attackSequenceDurationMultiplier?: number;
  /** Presentation effect emitted when this ability resolves. */
  vfx?: CombatAbilityVfxKind;
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
  /** Stores each undirected connection once; runtime also discovers nodes that point back to this talent. */
  requires: string[];
  kind: "class" | "passive" | "ability";
  position: { x: number; y: number };
  icon: string;
  shape: "circle" | "square";
  abilityId?: string;
  /** Editor metadata mirrored from the referenced live ability definition. */
  abilityEnergyCost?: number;
  /** Editor metadata mirrored from the referenced live ability definition. */
  abilityCooldownTurns?: number;
  /** Editor metadata mirrored from the referenced live ability definition. */
  abilityRange?: AbilityRange;
  /** Design notes shown when this node becomes the starting point for a fresh devtool draft. */
  effectNotes?: string;
  combat?: CombatFeatureBundle;
  /** Legacy passive shape; new bonuses should use combat.passive. */
  passive?: {
    stat?: StatName;
    amount?: number;
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

export interface CombatStatusAnimation {
  id: string;
  statusId: StatusEffectId;
  targetId: "player" | string;
  sourceTargetId?: "player" | string;
}

export interface CombatPassiveAnimation {
  id: string;
  targetId: "player" | string;
  text: string;
  lane: number;
}

export interface CombatAbilityAnimation {
  id: string;
  kind: CombatAbilityVfxKind;
  targetId?: "player" | string;
  sourceTargetId?: "player" | string;
}

export interface CombatProjectileAnimation {
  id: string;
  targetId: "player" | string;
  sourceTargetId: "player" | string;
  vfx?: CombatAbilityVfxKind;
  damageType?: DamageType;
  hitCount: number;
  durationMultiplier: number;
}

export type CombatPendingEffect =
  | { id: string; eventIndex: number; type?: "damage"; targetId: "player" | string; damage: number; attackerId?: "player" | string; attackRange?: AbilityRange; attackPresentation?: AbilityAttackPresentation; projectileVfx?: CombatAbilityVfxKind; projectileDamageType?: DamageType; animationHitCount?: number; animationDurationMultiplier?: number; missed?: boolean; sourceLabel?: string }
  | { id: string; eventIndex: number; type: "heal"; targetId: "player" | string; amount: number }
  | { id: string; eventIndex: number; type: "status"; targetId: "player" | string; status: StatusEffect; stunned?: boolean; sourceTargetId?: "player" | string }
  | { id: string; eventIndex: number; type: "remove_status"; targetId: "player" | string; statusId: StatusEffectId }
  | { id: string; eventIndex: number; type: "set_status"; targetId: "player" | string; status: StatusEffect }
  | { id: string; eventIndex: number; type: "energy_regen_bonus"; amount: number }
  | { id: string; eventIndex: number; type: "passive_text"; targetId: "player" | string; text: string; lane: number }
  | { id: string; eventIndex: number; type: "ability_vfx"; kind: CombatAbilityVfxKind; targetId?: "player" | string; sourceTargetId?: "player" | string }
  | { id: string; eventIndex: number; type: "turn"; activeTurnIndex: number; activeActorId?: string; turn: number; playerActed?: boolean; playerStatuses?: StatusEffect[]; energy?: number; nextTurnEnergyRegenBonus?: number; abilityCooldowns?: Record<string, number> };

export interface CombatState {
  turn: number;
  turnOrder: TurnOrderEntry[];
  activeTurnIndex: number;
  actedActorIds: string[];
  initiativeRevealed: boolean;
  playerActed: boolean;
  abilityCooldowns: Record<string, number>;
  eventId: number;
  completedSequenceEventId: number;
  floatingEvents: string[];
  pendingEffects: CombatPendingEffect[];
  procUsage: Record<string, { lastTriggeredTurn: number; eventCount?: number; eventCountTurn?: number }>;
  deathPreventionUsed: boolean;
  playerHasTakenDamage: boolean;
  playerHasMissed: boolean;
  nextTurnEnergyRegenBonus: number;
  damagedTargets: string[];
  missedTargets: string[];
  damageSourceLabels: Record<string, string>;
  statusAnimations: CombatStatusAnimation[];
  abilityAnimations: CombatAbilityAnimation[];
  projectileAnimations: CombatProjectileAnimation[];
  passiveAnimations: CombatPassiveAnimation[];
  attackingActorId: "player" | string | null;
  attackAnimationId: number;
  attackAnimationHitCount: number;
  attackAnimationDurationMultiplier: number;
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

export type AdventureMode = "story" | "endless";

export interface AdventureProgress {
  mode: AdventureMode;
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
