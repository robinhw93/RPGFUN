import type { Ability, AdventureNode, EnemyTemplate, GearItem, GearSetBonusDefinition, Talent } from "./types";
import { createStatusEffect } from "./statusEffects";

export const ABILITIES: Record<string, Ability> = {
  strike: {
    id: "strike", name: "Strike", description: "A reliable weapon attack.", energyCost: 0,
    cooldownTurns: 1, target: "enemy", damageType: "physical", power: 5, scalingStat: "strength", icon: "⚔", branch: "core",
  },
  guard: {
    id: "guard", name: "Guard", description: "Gain 6 Guard until the next turn.", energyCost: 2,
    target: "self", icon: "◆", branch: "core", effect: "guard",
  },
  quickSlash: {
    id: "quickSlash", name: "Quick Slash", description: "Deal Physical Damage equal to 50% of your Physical Power.", energyCost: 1,
    target: "enemy", damageType: "physical", powerScaling: 0.5, icon: "◢", branch: "shadow",
  },
  TwinStrike: {
    id: "TwinStrike", name: "Twin Strike", description: "Strike twice. Each hit deals Physical Damage equal to 50% of your Physical Power and triggers on-hit effects separately.", energyCost: 3,
    cooldownTurns: 1, target: "enemy", damageType: "physical", powerScaling: 0.5, hits: 2, icon: "⫸", branch: "shadow",
  },
  PoisonStab: {
    id: "PoisonStab", name: "Poison Stab", description: "Deal Physical Damage equal to 50% of your Physical Power and apply 1 Poison.", energyCost: 3,
    target: "enemy", damageType: "physical", powerScaling: 0.5, icon: "†", branch: "shadow", effect: "poison",
  },
  PoisonCloud: {
    id: "PoisonCloud", name: "Poison Cloud", description: "Apply 1 Poison to all enemies without dealing direct damage.", energyCost: 3,
    cooldownTurns: 2, target: "all_enemies", dealsDamage: false, icon: "☁", branch: "shadow", effect: "poison",
  },
  Stealth: {
    id: "Stealth", name: "Stealth", description: "Enemies cannot target you until the end of your next turn.", energyCost: 2,
    cooldownTurns: 3, target: "self", icon: "◌", branch: "shadow", effect: "stealth", statusDuration: 2, statusExpiresAtTurnStart: false,
  },
  Evasion: {
    id: "Evasion", name: "Evasion", description: "Gain 60% Dodge Chance until your next turn.", energyCost: 2,
    cooldownTurns: 3, target: "self", icon: "↝", branch: "shadow", effect: "evasion", statusDuration: 1, statusExpiresAtTurnStart: true,
  },
  Neurotoxin: {
    id: "Neurotoxin", name: "Neurotoxin", description: "Consume all Poison on an enemy to Stun it.", energyCost: 3,
    cooldownTurns: 2, target: "enemy", dealsDamage: false, requiredTargetStatus: "poison", consumeTargetStatus: "poison", icon: "⌁", branch: "shadow", effect: "stun",
  },
  VenomousStrike: {
    id: "VenomousStrike", name: "Venomous Strike", description: "Deal Physical Damage equal to 100% of your Physical Power and apply 2 Poison. Deals double damage if the target is already Poisoned.", energyCost: 4,
    cooldownTurns: 3, target: "enemy", damageType: "physical", powerScaling: 1, icon: "†", branch: "shadow", effect: "poison", statusStacks: 2,
    damageModifiers: [{ id: "venomous-strike-poisoned", name: "Venomous Strike", description: "Deals double damage to Poisoned targets.", multiplier: 2, targetHasAnyStatus: ["poison"] }],
  },
  Flurry: {
    id: "Flurry", name: "Flurry", description: "Attack five times, dealing Physical Damage equal to 50% of your Physical Power per hit. Each hit chooses a random enemy and can trigger on-hit effects.", energyCost: 4,
    cooldownTurns: 2, target: "enemy", damageType: "physical", powerScaling: 0.5, hits: 5, randomTargetPerHit: true, icon: "≋", branch: "shadow",
  },
  Ambush: {
    id: "Ambush", name: "Ambush", description: "Can only be used while Stealthed. Deal Physical Damage equal to 150% of your Physical Power with +50% Critical Strike Chance.", energyCost: 2,
    target: "enemy", damageType: "physical", powerScaling: 1.5, requiredSelfStatus: "stealth", critChanceBonus: 0.5, icon: "◈", branch: "shadow",
  },
  ToxicExplosion: {
    id: "ToxicExplosion", name: "Toxic Explosion", description: "Detonate all Poison on the target, dealing its full duration damage immediately and removing Poison.", energyCost: 5,
    cooldownTurns: 2, target: "enemy", dealsDamage: false, requiredTargetStatus: "poison", detonateStatus: "poison", icon: "☣", branch: "shadow",
  },
  Venomborn: {
    id: "Venomborn", name: "Venomborn", description: "Consume all Poison on the target to heal for the damage it would deal over its full duration.", energyCost: 2,
    cooldownTurns: 6, target: "enemy", dealsDamage: false, requiredTargetStatus: "poison", consumeStatusForHealing: "poison", icon: "♨", branch: "shadow",
  },
  LightningStrike: {
    id: "LightningStrike", name: "Lightning Strike", description: "Deal 50% Physical Power as Physical Damage and 50% Magical Power as Lightning Damage, then apply Electrified for 3 turns.", energyCost: 5,
    cooldownTurns: 4, target: "enemy", damageComponents: [{ damageType: "physical", powerScaling: 0.5 }, { damageType: "lightning", powerScaling: 0.5 }], effect: "electrified", statusDuration: 3, icon: "ϟ", branch: "shadow",
  },
  Focus: {
    id: "Focus", name: "Focus", description: "Reset all your other ability cooldowns.", energyCost: 1,
    cooldownTurns: 6, target: "self", effect: "reset_cooldowns", icon: "◎", branch: "shadow",
  },
  crushingBlow: {
    id: "crushingBlow", name: "Crushing Blow", description: "A heavy strike that leaves the enemy vulnerable.", energyCost: 4,
    target: "enemy", damageType: "physical", power: 12, scalingStat: "strength", icon: "✦", branch: "brute", effect: "vulnerable",
  },
  groundSlam: {
    id: "groundSlam", name: "Ground Slam", description: "Damage all enemies with a chance to stun.", energyCost: 6,
    target: "all_enemies", damageType: "physical", power: 7, scalingStat: "strength", icon: "✹", branch: "brute", effect: "stun",
  },
  sever: {
    id: "sever", name: "Sever", description: "A swift cut that applies Bleed for 3 turns.", energyCost: 3,
    target: "enemy", damageType: "shadow", power: 7, scalingStat: "agility", icon: "◢", branch: "shadow", effect: "bleed",
  },
  venom: {
    id: "venom", name: "Venom Edge", description: "Poison an enemy and deal light damage.", energyCost: 4,
    target: "enemy", damageType: "shadow", power: 5, scalingStat: "agility", icon: "⌁", branch: "shadow", effect: "poison",
  },
  arcaneBolt: {
    id: "arcaneBolt", name: "Arcane Bolt", description: "Focused arcane damage resisted by Magic Resistance.", energyCost: 3,
    target: "enemy", damageType: "arcane", power: 9, scalingStat: "intelligence", icon: "✧", branch: "arcanist",
  },
  siphon: {
    id: "siphon", name: "Essence Siphon", description: "Deal damage and recover 2 Energy.", energyCost: 4,
    target: "enemy", damageType: "arcane", power: 7, scalingStat: "intelligence", icon: "◎", branch: "arcanist", effect: "energy",
  },
};

export const TALENT_TREE_CANVAS = { width: 3410, height: 2400 } as const;

export const TALENTS: Talent[] = [
  { id: "origin", name: "Wayfarer's Spark", description: "Your first step. Unlocks Strike and Guard.", branch: "core", kind: "class", tier: 0, cost: 0, requires: [], position: { x: 32.258, y: 50 }, icon: "✦", shape: "square" },
  { id: "brute_1", name: "Brute", description: "+2 Strength.", branch: "brute", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 27.419, y: 50 }, icon: "◆", shape: "square", combat: { passive: { stats: { strength: 2 } } } },
  { id: "shadow_1", name: "Shadow", description: "+2 Agility. Unlocks Quick Slash.", branch: "shadow", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 37.097, y: 50 }, icon: "◈", shape: "square", abilityId: "quickSlash", combat: { passive: { stats: { agility: 2 } } } },
  { id: "arcanist_1", name: "Arcanist", description: "+2 Intelligence.", branch: "arcanist", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 32.258, y: 43.75 }, icon: "✧", shape: "square", combat: { passive: { stats: { intelligence: 2 } } } },
  { id: "talent_1", name: "Immaculate Timing", description: "+2 Agility. +5 Initiative.", branch: "shadow", kind: "passive", tier: 2, cost: 1, requires: ["shadow_1"], position: { x: 41.935, y: 50 }, icon: "✦", shape: "circle", combat: { passive: { stats: { agility: 2 }, initiative: 5 } } },
  { id: "talent_2", name: "Twin Strike", description: "Strike twice for 50% Physical Power per hit. Each hit triggers on-hit effects.", branch: "shadow", kind: "ability", tier: 3, cost: 1, requires: ["talent_1"], position: { x: 45.967, y: 45.312 }, icon: "✦", shape: "square", abilityId: "TwinStrike" },
  { id: "talent_3", name: "Poison Stab", description: "Deal 50% Physical Power as damage and apply 1 Poison.", branch: "shadow", kind: "ability", tier: 3, cost: 1, requires: ["talent_1"], position: { x: 45.967, y: 54.688 }, icon: "✦", shape: "square", abilityId: "PoisonStab" },
  { id: "talent_4", name: "Honed Skills", description: "+2% Critical Strike Chance.", branch: "shadow", kind: "passive", tier: 4, cost: 1, requires: ["talent_2"], position: { x: 50, y: 45.312 }, icon: "✦", shape: "circle", combat: { passive: { critChance: 0.02 } } },
  { id: "talent_5", name: "Precision", description: "+2% Hit Chance.", branch: "shadow", kind: "passive", tier: 4, cost: 1, requires: ["talent_3"], position: { x: 50, y: 54.688 }, icon: "✦", shape: "circle", combat: { passive: { hitChance: 0.02 } } },
  { id: "talent_6", name: "Evasion", description: "+2% Dodge Chance.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_4"], position: { x: 50, y: 39.844 }, icon: "✦", shape: "circle", combat: { passive: { dodgeChance: 0.02 } } },
  { id: "talent_7", name: "Stamina", description: "+1 Max Energy.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_4"], position: { x: 54.032, y: 45.312 }, icon: "✦", shape: "circle", combat: { passive: { maxEnergy: 1 } } },
  { id: "talent_8", name: "Setup", description: "+2 Initiative.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_5"], position: { x: 50, y: 60.157 }, icon: "✦", shape: "circle", combat: { passive: { initiative: 2 } } },
  { id: "talent_9", name: "Spell Dodger", description: "+2 Magic Resistance.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_5"], position: { x: 54.032, y: 54.688 }, icon: "✦", shape: "circle", combat: { passive: { magicResistance: 2 } } },
  { id: "talent_10", name: "Poison Cloud", description: "Apply 1 Poison to all enemies without dealing direct damage.", branch: "shadow", kind: "ability", tier: 6, cost: 1, requires: ["talent_9", "talent_34"], requireMode: "any", position: { x: 58.06451612903226, y: 56.25 }, icon: "✦", shape: "square", abilityId: "PoisonCloud" },
  { id: "talent_11", name: "Stealth", description: "Enemies cannot target you until the end of your next turn.", branch: "shadow", kind: "ability", tier: 6, cost: 1, requires: ["talent_7", "talent_34"], position: { x: 58.06451612903226, y: 43.75 }, icon: "✦", shape: "square", abilityId: "Stealth" },
  { id: "talent_12", name: "Poison Coating", description: "Each hit has a 50% chance to apply 1 Poison.", branch: "shadow", kind: "passive", tier: 6, cost: 1, requires: ["talent_8"], position: { x: 54.032, y: 64.844 }, icon: "✦", shape: "circle", combat: { triggers: [{ id: "poison-coating", name: "Poison Coating", description: "Each hit has a 50% chance to apply 1 Poison.", event: "on_hit", chance: 0.5, effects: [{ type: "apply_status", status: createStatusEffect("poison"), target: "target" }] }] } },
  { id: "talent_13", name: "Adrenaline", description: "Each hit has a 10% chance to restore 1 Energy.", branch: "shadow", kind: "passive", tier: 6, cost: 1, requires: ["talent_6"], position: { x: 54.032, y: 35.156 }, icon: "✦", shape: "circle", combat: { triggers: [{ id: "adrenaline", name: "Adrenaline", description: "Each hit has a 10% chance to restore 1 Energy.", event: "on_hit", chance: 0.1, effects: [{ type: "gain_energy", amount: 1, target: "self" }] }] } },
  { id: "talent_14", name: "Evasion", description: "Increase your Dodge Chance by 60% until your next turn.", branch: "shadow", kind: "ability", tier: 7, cost: 1, requires: ["talent_13"], position: { x: 58.064, y: 35.156 }, icon: "✦", shape: "square", abilityId: "Evasion" },
  { id: "talent_15", name: "Neurotoxin", description: "Consume all Poison on an enemy to Stun it.", branch: "shadow", kind: "ability", tier: 7, cost: 1, requires: ["talent_12"], position: { x: 58.065, y: 64.844 }, icon: "✦", shape: "square", abilityId: "Neurotoxin", effectNotes: "Consume all Poison on an enemy to Stun it." },
  { id: "talent_16", name: "Opportunist", description: "Deal 50% more damage while attacking from Stealth.", branch: "shadow", kind: "passive", tier: 7, cost: 1, requires: ["talent_11"], position: { x: 62.097, y: 45.312 }, icon: "✦", shape: "circle", combat: { damageModifiers: [{ id: "opportunist", name: "Opportunist", description: "Deal 50% more damage while attacking from Stealth.", multiplier: 1.5, attackerHasAnyStatus: ["stealth"] }] } },
  { id: "talent_17", name: "Blisters", description: "Deal 20% more Physical Damage to Poisoned enemies.", branch: "shadow", kind: "passive", tier: 7, cost: 1, requires: ["talent_10"], position: { x: 62.097, y: 54.688 }, icon: "✦", shape: "circle", combat: { damageModifiers: [{ id: "blisters", name: "Blisters", description: "Deal 20% more Physical Damage to Poisoned enemies.", multiplier: 1.2, damageTypes: ["physical"], targetHasAnyStatus: ["poison"] }] } },
  { id: "talent_18", name: "Agile", description: "+2 Agility.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_14"], position: { x: 62.097, y: 35.156 }, icon: "✦", shape: "circle", combat: { passive: { stats: { agility: 2 } } } },
  { id: "talent_19", name: "Smarts", description: "+2 Intelligence.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_15"], position: { x: 62.097, y: 64.844 }, icon: "✦", shape: "circle", combat: { passive: { stats: { intelligence: 2 } } } },
  { id: "talent_20", name: "Venomous Strike", description: "Deal 100% Physical Power as damage and apply 2 Poison. Deals double damage if the target is already Poisoned.", branch: "shadow", kind: "ability", tier: 9, cost: 1, requires: ["talent_19"], position: { x: 66.129, y: 69.531 }, icon: "✦", shape: "square", abilityId: "VenomousStrike" },
  { id: "talent_21", name: "Potency", description: "Your Poison deals 10% more damage.", branch: "shadow", kind: "passive", tier: 9, cost: 1, requires: ["talent_19"], position: { x: 66.129, y: 60.157 }, icon: "✦", shape: "circle", effectNotes: "Your Poison deals 10% more damage.", combat: { passive: { statusDamage: { poison: 0.1 } } } },
  { id: "talent_22", name: "Potency", description: "Your Poison deals 10% more damage.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_17"], position: { x: 66.129, y: 54.688 }, icon: "✦", shape: "circle", effectNotes: "Your Poison deals 10% more damage.", combat: { passive: { statusDamage: { poison: 0.1 } } } },
  { id: "talent_23", name: "Electrified", description: "Your attacks have a 20% chance to apply Electrified.", branch: "shadow", kind: "passive", tier: 9, cost: 1, requires: ["talent_18"], position: { x: 66.129, y: 39.844 }, icon: "✦", shape: "circle", effectNotes: "Your attacks have a 20% chance to apply Electrified.", combat: { triggers: [{ id: "electrified-strikes", name: "Electrified", description: "Each hit has a 20% chance to apply Electrified.", event: "on_hit", chance: 0.2, effects: [{ type: "apply_status", status: createStatusEffect("electrified"), target: "target" }] }] } },
  { id: "talent_24", name: "Flurry", description: "Attack five times for 50% Physical Power per hit. Each hit chooses a random enemy and can trigger on-hit effects.", branch: "shadow", kind: "ability", tier: 9, cost: 1, requires: ["talent_18"], position: { x: 66.129, y: 30.469 }, icon: "✦", shape: "square", abilityId: "Flurry", effectNotes: "Cooldown: 2 turns\nCost: 4 Energy\nAttack five times for 50% Physical Power per hit. Each hit chooses a random enemy and can trigger on-hit effects." },
  { id: "talent_25", name: "Energized", description: "+1 Energy gained at the start of your turn.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_16"], position: { x: 66.129, y: 45.312 }, icon: "✦", shape: "circle", effectNotes: "+1 Energy gained at the start of your turn.", combat: { passive: { energyRegen: 1 } } },
  { id: "talent_26", name: "Ambush", description: "Can only be used while Stealthed. Deal 150% Physical Power as damage with +50% Critical Strike Chance.", branch: "shadow", kind: "ability", tier: 9, cost: 1, requires: ["talent_25"], position: { x: 70.161, y: 45.312 }, icon: "✦", shape: "square", abilityId: "Ambush", effectNotes: "Cost: 2 Energy\nCan only be used while Stealthed. Deal 150% Physical Power as damage with +50% Critical Strike Chance." },
  { id: "talent_27", name: "Toxic Explosion", description: "Detonate all Poison on the target, dealing its full duration damage immediately and removing Poison.", branch: "shadow", kind: "ability", tier: 9, cost: 1, requires: ["talent_22"], position: { x: 70.161, y: 54.688 }, icon: "✦", shape: "square", abilityId: "ToxicExplosion", effectNotes: "Cost: 5 Energy\nCooldown: 2 turns\nDetonate all Poison on the target, dealing its full duration damage immediately and removing Poison." },
  { id: "talent_28", name: "Longevity", description: "Toxic Explosion now only removes half of the Poison stacks from the target.", branch: "shadow", kind: "passive", tier: 10, cost: 1, requires: ["talent_27"], position: { x: 70.161, y: 60.156 }, icon: "✦", shape: "circle", effectNotes: "Toxic Explosion now only removes half of the Poison stacks from the target.", combat: { abilityModifiers: [{ id: "longevity", name: "Longevity", description: "Toxic Explosion only removes half of the Poison stacks.", abilityIds: ["ToxicExplosion"], detonationRetainedStackRatio: 0.5 }] } },
  { id: "talent_29", name: "Maneuvers", description: "Ambush can be used outside Stealth, but deals 100% Physical Power when used that way.", branch: "shadow", kind: "passive", tier: 10, cost: 1, requires: ["talent_26"], position: { x: 70.161, y: 39.844 }, icon: "✦", shape: "circle", effectNotes: "Ambush can be used outside Stealth, but deals 100% Physical Power when used that way.", combat: { abilityModifiers: [{ id: "maneuvers", name: "Maneuvers", description: "Ambush can be used outside Stealth at 100% Physical Power.", abilityIds: ["Ambush"], allowWithoutRequiredSelfStatus: true, powerScalingWhenRequirementMissing: 1 }] } },
  { id: "talent_30", name: "Reapply", description: "After Neurotoxin consumes Poison, it applies 2 Poison.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_15"], position: { x: 58.065, y: 70.313 }, icon: "✦", shape: "circle", effectNotes: "After Neurotoxin consumes Poison, it applies 2 Poison.", combat: { abilityModifiers: [{ id: "reapply", name: "Reapply", description: "Neurotoxin applies 2 Poison after consuming the previous Poison.", abilityIds: ["Neurotoxin"], applyStatusAfterConsume: { status: "poison", stacks: 2 } }] } },
  { id: "talent_31", name: "Enduring Evasion", description: "Evasion grants 40% Dodge Chance but lasts for an additional turn.", branch: "shadow", kind: "passive", tier: 8, cost: 1, requires: ["talent_14"], position: { x: 58.06451612903226, y: 29.6875 }, icon: "✦", shape: "circle", effectNotes: "Evasion grants 40% Dodge Chance but lasts for an additional turn.", combat: { abilityModifiers: [{ id: "enduring-evasion", name: "Enduring Evasion", description: "Evasion grants 40% Dodge Chance for an additional turn.", abilityIds: ["Evasion"], statusDuration: 2, statusMagnitude: 0.4, statusExpiresAtTurnStart: false }] } },
  { id: "talent_32", name: "Self Medicate", description: "Enemies that deal direct damage to you gain 1 Poison. You start each combat with 2 Poison.", branch: "shadow", kind: "passive", tier: 10, cost: 1, requires: ["talent_20"], position: { x: 70.16129032258065, y: 69.53125 }, icon: "✦", shape: "circle", effectNotes: "Enemies that deal direct damage to you gain 1 Poison. You start each combat with 2 Poison.", combat: { passive: { startingStatuses: [createStatusEffect("poison", { stacks: 2, sourcePower: 0, sourceId: "self-medicate" })] }, triggers: [{ id: "self-medicate-retaliation", name: "Self Medicate", description: "Enemies that deal direct damage to you gain 1 Poison.", event: "damage_taken", effects: [{ type: "apply_status", status: createStatusEffect("poison"), target: "target" }] }] } },
  { id: "talent_33", name: "Shock Stabs", description: "Your hits against Electrified targets have a 5% chance to Stun them.", branch: "shadow", kind: "passive", tier: 10, cost: 1, requires: ["talent_24"], position: { x: 70.16129032258065, y: 30.46875 }, icon: "✦", shape: "circle", effectNotes: "Your hits against Electrified targets have a 5% chance to Stun them.", combat: { triggers: [{ id: "shock-stabs", name: "Shock Stabs", description: "Hits against Electrified targets have a 5% chance to Stun.", event: "on_hit", chance: 0.05, conditions: { targetHasAnyStatus: ["electrified"] }, effects: [{ type: "apply_status", status: createStatusEffect("stunned"), target: "target" }] }] } },
  { id: "talent_34", name: "Fatality", description: "When direct damage brings an enemy below 50% Health, gain Strengthened for 3 turns.", branch: "shadow", kind: "passive", tier: 7, cost: 1, requires: ["talent_11", "talent_10"], requireMode: "any", position: { x: 58.06451612903226, y: 50 }, icon: "✦", shape: "circle", combat: { triggers: [{ id: "fatality", name: "Fatality", description: "Crossing an enemy below 50% Health grants Strengthened.", event: "on_hit", conditions: { targetHealthCrossedBelow: 0.5 }, effects: [{ type: "apply_status", status: createStatusEffect("strengthened"), target: "self" }] }] } },
  { id: "talent_35", name: "Venomborn", description: "Consume all Poison on the target to heal for the damage it would deal over its full duration.", branch: "shadow", kind: "ability", tier: 11, cost: 1, requires: ["talent_32"], requireMode: "all", position: { x: 74.19354838709677, y: 69.53125 }, icon: "✦", shape: "square", abilityId: "Venomborn", effectNotes: "Cost: 2 Energy\nCooldown: 6 turns\nConsume all Poison on the target to heal for its full-duration damage." },
  { id: "talent_36", name: "Lightning Strike", description: "Deal 50% Physical Power as Physical Damage and 50% Magical Power as Lightning Damage, then apply Electrified for 3 turns.", branch: "shadow", kind: "ability", tier: 11, cost: 1, requires: ["talent_33"], requireMode: "all", position: { x: 74.19354838709677, y: 30.46875 }, icon: "✦", shape: "square", abilityId: "LightningStrike", effectNotes: "Cost: 5 Energy\nCooldown: 4 turns\nDeal 50% Physical Power as Physical Damage and 50% Magical Power as Lightning Damage, then apply Electrified for 3 turns." },
  { id: "talent_37", name: "Focus", description: "Reset all your other ability cooldowns.", branch: "shadow", kind: "ability", tier: 10, cost: 1, requires: ["talent_27", "talent_26"], requireMode: "any", position: { x: 74.19354838709677, y: 50 }, icon: "✦", shape: "square", abilityId: "Focus", effectNotes: "Cost: 1 Energy\nCooldown: 6 turns\nReset all your other ability cooldowns." },
];

export const ENEMIES: Record<string, EnemyTemplate> = {
  ashHound: { id: "ashHound", name: "Ash Hound", title: "Feral Beast", maxHp: 28, power: 7, armor: 1, magicResistance: 0, hitChance: 0.95, dodgeChance: 0.08, damageType: "physical", energyCost: 3, intentText: "Raking Claws · 7 damage", attackDescription: "Rakes the target with ash-caked claws. Costs 3 Energy and applies Bleed when it deals damage.", onHitEffect: "bleed", accent: "#d47a43" },
  cinderCultist: { id: "cinderCultist", name: "Cinder Cultist", title: "Fanatic", maxHp: 34, power: 9, armor: 2, magicResistance: 2, hitChance: 0.96, dodgeChance: 0.03, damageType: "arcane", energyCost: 4, intentText: "Searing Brand · 9 damage", attackDescription: "Brands the target with a searing sigil. Costs 4 Energy.", accent: "#a46ad4" },
  emberWisp: { id: "emberWisp", name: "Ember Wisp", title: "Restless Flame", maxHp: 22, power: 6, armor: 0, magicResistance: 3, hitChance: 0.98, dodgeChance: 0.12, damageType: "arcane", energyCost: 3, intentText: "Scorch · 6 damage", attackDescription: "Releases a focused burst of living flame. Costs 3 Energy.", accent: "#d6ad53" },
  ashenWarden: { id: "ashenWarden", name: "The Ashen Warden", title: "Keeper of the Black Gate", maxHp: 92, power: 12, armor: 4, magicResistance: 4, hitChance: 1, dodgeChance: 0.05, damageType: "physical", energyCost: 5, intentText: "Cinder Cleave · 12 damage", attackDescription: "Sweeps a burning blade across the battlefield. Costs 5 Energy.", accent: "#de5b47" },
};

export const ITEMS: GearItem[] = [
  { id: "ironCleaver", name: "Notched Iron Cleaver", slot: "mainHand", weaponEquipType: "oneHand", weaponKind: "axe", rarity: "uncommon", description: "Still sharp enough to draw blood.", stats: { strength: 2 }, physicalPower: 3, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "embershard", name: "Embershard Focus", slot: "offHand", weaponEquipType: "offHand", weaponKind: "tome", rarity: "rare", description: "Warm whispers curl around the crystal.", stats: { intelligence: 3 }, magicalPower: 2 },
  { id: "wandererHood", name: "Wanderer's Hood", slot: "head", armorMaterial: "leather", rarity: "common", description: "A little anonymity goes a long way.", stats: { agility: 1 }, armor: 1 },
  { id: "ashCuirass", name: "Ashborn Cuirass", slot: "chest", armorMaterial: "plate", rarity: "rare", description: "Forged in a fire that never cooled.", stats: { strength: 2, vitality: 2 }, armor: 5, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "veilTrousers", name: "Veilwalker Trousers", slot: "pants", armorMaterial: "leather", rarity: "uncommon", description: "They leave no footprint in soot.", stats: { agility: 2 }, armor: 2, set: "veilwalker", setName: "Veilwalker's Guile" },
  { id: "roadBoots", name: "Dustworn Boots", slot: "boots", armorMaterial: "leather", rarity: "common", description: "Made for roads best left unnamed.", stats: { vitality: 1 }, armor: 1 },
  { id: "garnetBand", name: "Garnet Signet", slot: "ring", rarity: "rare", description: "A noble crest has been scratched away.", stats: { strength: 1, luck: 2 } },
  { id: "moonRing", name: "Moonlit Coil", slot: "ring", rarity: "epic", description: "Its silver surface reflects an unfamiliar sky.", stats: { intelligence: 2, agility: 1, luck: 1 } },
  { id: "wardenHelm", name: "Warden's Broken Crown", slot: "head", armorMaterial: "plate", rarity: "epic", description: "The last ember still burns within.", stats: { vitality: 3, strength: 2 }, armor: 4, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "seerCowl", name: "Cowl of Quiet Sparks", slot: "head", armorMaterial: "cloth", rarity: "uncommon", description: "Tiny runes brighten whenever danger draws near.", stats: { intelligence: 2 }, magicResistance: 2 },
  { id: "nightstitchVest", name: "Nightstitch Vest", slot: "chest", armorMaterial: "leather", rarity: "uncommon", description: "Supple leather sewn for swift, silent movement.", stats: { agility: 2, vitality: 1 }, armor: 3 },
  { id: "emberweaveRobe", name: "Emberweave Robe", slot: "chest", armorMaterial: "cloth", rarity: "rare", description: "Warm threads carry old protective sigils.", stats: { intelligence: 3 }, armor: 1, magicResistance: 4 },
  { id: "ashboundLegguards", name: "Ashbound Legguards", slot: "pants", armorMaterial: "plate", rarity: "rare", description: "Blackened plates that still hold the Warden's heat.", stats: { strength: 1, vitality: 2 }, armor: 4, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "runeclothLegwraps", name: "Runecloth Legwraps", slot: "pants", armorMaterial: "cloth", rarity: "uncommon", description: "Loose-woven cloth marked with patient warding ink.", stats: { intelligence: 2, luck: 1 }, magicResistance: 2 },
  { id: "ironmarchSabatons", name: "Ironmarch Sabatons", slot: "boots", armorMaterial: "plate", rarity: "rare", description: "Every heavy step sounds like a closing gate.", stats: { strength: 1, vitality: 2 }, armor: 4 },
  { id: "softstepSlippers", name: "Softstep Slippers", slot: "boots", armorMaterial: "cloth", rarity: "uncommon", description: "Enchanted soles soften even a hurried retreat.", stats: { agility: 2, intelligence: 1 }, magicResistance: 1 },
  { id: "copperLoop", name: "Wayfarer's Copper Loop", slot: "ring", rarity: "common", description: "A plain ring polished smooth by years on the road.", stats: { vitality: 1, luck: 1 } },
  { id: "wardenShortsword", name: "Warden's Shortsword", slot: "mainHand", weaponEquipType: "mainHand", weaponKind: "sword", rarity: "uncommon", description: "A disciplined blade balanced for the dominant hand.", stats: { strength: 2 }, physicalPower: 4 },
  { id: "pilgrimMace", name: "Cinder Pilgrim's Mace", slot: "mainHand", weaponEquipType: "mainHand", weaponKind: "mace", rarity: "rare", description: "Its scorched head rewards deliberate, crushing blows.", stats: { strength: 3, vitality: 1 }, physicalPower: 5 },
  { id: "veilDagger", name: "Veilglass Dagger", slot: "mainHand", weaponEquipType: "oneHand", weaponKind: "dagger", rarity: "rare", description: "A thin edge suited to either hand.", stats: { agility: 3 }, physicalPower: 3 },
  { id: "ashWand", name: "Ashen Conduit", slot: "mainHand", weaponEquipType: "oneHand", weaponKind: "wand", rarity: "epic", description: "A charred wand that focuses heat into precise sigils.", stats: { intelligence: 3, luck: 1 }, magicalPower: 5 },
  { id: "gateShield", name: "Black Gate Buckler", slot: "offHand", weaponEquipType: "offHand", weaponKind: "shield", rarity: "uncommon", description: "A compact shield scarred by countless claws.", stats: { vitality: 2 }, armor: 3 },
  { id: "greatsword", name: "Roadcleaver Greatsword", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "sword", rarity: "rare", description: "A broad blade that leaves no hand free for defense.", stats: { strength: 4 }, physicalPower: 7 },
  { id: "greataxe", name: "Ashfall Greataxe", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "axe", rarity: "epic", description: "Its crescent edge falls with the weight of a burned oak.", stats: { strength: 5, vitality: 1 }, physicalPower: 8 },
  { id: "greatmace", name: "Gatebreaker Maul", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "mace", rarity: "rare", description: "Built to turn armor, stone, and bone into rubble.", stats: { strength: 4, vitality: 2 }, physicalPower: 7 },
  { id: "emberstaff", name: "Embercaller's Staff", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "staff", rarity: "epic", description: "A living coal glows between its forked branches.", stats: { intelligence: 5 }, magicalPower: 8 },
  { id: "cinderPolearm", name: "Cinderwatch Polearm", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "polearm", rarity: "rare", description: "Long reach keeps the ash-born at a cautious distance.", stats: { strength: 2, agility: 3 }, physicalPower: 7 },
];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = [
  {
    setId: "ashborn",
    setName: "Ashborn Warplate",
    requiredPieces: 2,
    description: "+2 Strength.",
    passive: { stats: { strength: 2 } },
  },
  {
    setId: "ashborn",
    setName: "Ashborn Warplate",
    requiredPieces: 3,
    description: "Bleed only deals half damage to you.",
    passive: { bleedDamageReduction: 0.5 },
  },
  {
    setId: "ashborn",
    setName: "Ashborn Warplate",
    requiredPieces: 4,
    description: "+3 Vitality.",
    passive: { stats: { vitality: 3 } },
  },
];

export const ADVENTURE: AdventureNode[] = [
  { id: "road", type: "combat", eyebrow: "Encounter I", title: "Smoke on the Road", description: "Two shapes stalk through the drifting ash. They have already caught your scent.", enemies: ["ashHound", "ashHound"], reward: { experience: 55, gold: 9, loot: true } },
  { id: "shrine", type: "event", eyebrow: "Unknown Event", title: "The Forgotten Shrine", description: "A cracked idol watches over a bowl of cold embers. Something valuable may still answer a prayer." },
  { id: "pilgrims", type: "combat", eyebrow: "Encounter II", title: "The Charred Pilgrims", description: "A fanatic raises their torch as a living flame coils at their shoulder.", enemies: ["cinderCultist", "emberWisp"], reward: { experience: 75, gold: 14, loot: true } },
  { id: "gate", type: "boss", eyebrow: "Boss Encounter", title: "The Black Gate", description: "The Warden rises from its throne. Iron groans, and the road behind you disappears.", enemies: ["ashenWarden"], reward: { experience: 125, gold: 32, loot: true } },
];
