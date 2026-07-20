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

export const TALENTS: Talent[] = [
  { id: "origin", name: "Wayfarer's Spark", description: "Your first step. Unlocks Strike and Guard.", branch: "core", kind: "class", tier: 0, cost: 0, requires: [], position: { x: 50, y: 50 }, icon: "✦", shape: "square" },
  { id: "brute_1", name: "Brute", description: "+2 Strength.", branch: "brute", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 42.5, y: 50 }, icon: "◆", shape: "square", combat: { passive: { stats: { strength: 2 } } } },
  { id: "shadow_1", name: "Shadow", description: "+2 Agility. Unlocks Quick Slash.", branch: "shadow", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 57.5, y: 50 }, icon: "◈", shape: "square", abilityId: "quickSlash", combat: { passive: { stats: { agility: 2 } } } },
  { id: "arcanist_1", name: "Arcanist", description: "+2 Intelligence.", branch: "arcanist", kind: "class", tier: 1, cost: 1, requires: ["origin"], position: { x: 50, y: 40 }, icon: "✧", shape: "square", combat: { passive: { stats: { intelligence: 2 } } } },
  { id: "talent_1", name: "Immaculate Timing", description: "+2 Agility. +5 Initiative.", branch: "shadow", kind: "passive", tier: 2, cost: 1, requires: ["shadow_1"], position: { x: 65, y: 50 }, icon: "✦", shape: "circle", combat: { passive: { stats: { agility: 2 }, initiative: 5 } } },
  { id: "talent_2", name: "Twin Strike", description: "Strike twice for 50% Physical Power per hit. Each hit triggers on-hit effects.", branch: "shadow", kind: "ability", tier: 3, cost: 1, requires: ["talent_1"], position: { x: 71.25, y: 42.5 }, icon: "✦", shape: "square", abilityId: "TwinStrike" },
  { id: "talent_3", name: "Poison Stab", description: "Deal 50% Physical Power as damage and apply 1 Poison.", branch: "shadow", kind: "ability", tier: 3, cost: 1, requires: ["talent_1"], position: { x: 71.25, y: 57.5 }, icon: "✦", shape: "square", abilityId: "PoisonStab" },
  { id: "talent_4", name: "Honed Skills", description: "+2% Critical Strike Chance.", branch: "shadow", kind: "passive", tier: 4, cost: 1, requires: ["talent_2"], position: { x: 77.5, y: 42.5 }, icon: "✦", shape: "circle", combat: { passive: { critChance: 0.02 } } },
  { id: "talent_5", name: "Precision", description: "+2% Hit Chance.", branch: "shadow", kind: "passive", tier: 4, cost: 1, requires: ["talent_3"], position: { x: 77.5, y: 57.5 }, icon: "✦", shape: "circle", combat: { passive: { hitChance: 0.02 } } },
  { id: "talent_6", name: "Evasion", description: "+2% Dodge Chance.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_4"], position: { x: 77.5, y: 33.75 }, icon: "✦", shape: "circle", combat: { passive: { dodgeChance: 0.02 } } },
  { id: "talent_7", name: "Stamina", description: "+1 Max Energy.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_4"], position: { x: 83.75, y: 42.5 }, icon: "✦", shape: "circle", combat: { passive: { maxEnergy: 1 } } },
  { id: "talent_8", name: "Setup", description: "+2 Initiative.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_5"], position: { x: 77.5, y: 66.25 }, icon: "✦", shape: "circle", combat: { passive: { initiative: 2 } } },
  { id: "talent_9", name: "Spell Dodger", description: "+2 Magic Resistance.", branch: "shadow", kind: "passive", tier: 5, cost: 1, requires: ["talent_5"], position: { x: 83.75, y: 57.5 }, icon: "✦", shape: "circle", combat: { passive: { magicResistance: 2 } } },
  { id: "talent_10", name: "Poison Cloud", description: "Apply 1 Poison to all enemies without dealing direct damage.", branch: "shadow", kind: "ability", tier: 6, cost: 1, requires: ["talent_9"], position: { x: 90, y: 57.5 }, icon: "✦", shape: "square", abilityId: "PoisonCloud" },
  { id: "talent_11", name: "Stealth", description: "Enemies cannot target you until the end of your next turn.", branch: "shadow", kind: "ability", tier: 6, cost: 1, requires: ["talent_7"], position: { x: 90, y: 42.5 }, icon: "✦", shape: "square", abilityId: "Stealth" },
  { id: "talent_12", name: "Poison Coating", description: "Each hit has a 50% chance to apply 1 Poison.", branch: "shadow", kind: "passive", tier: 6, cost: 1, requires: ["talent_8"], position: { x: 83.75, y: 73.75 }, icon: "✦", shape: "circle", combat: { triggers: [{ id: "poison-coating", name: "Poison Coating", description: "Each hit has a 50% chance to apply 1 Poison.", event: "on_hit", chance: 0.5, effects: [{ type: "apply_status", status: createStatusEffect("poison"), target: "target" }] }] } },
  { id: "talent_13", name: "Adrenaline", description: "Each hit has a 10% chance to restore 1 Energy.", branch: "shadow", kind: "passive", tier: 6, cost: 1, requires: ["talent_6"], position: { x: 83.75, y: 26.25 }, icon: "✦", shape: "circle", combat: { triggers: [{ id: "adrenaline", name: "Adrenaline", description: "Each hit has a 10% chance to restore 1 Energy.", event: "on_hit", chance: 0.1, effects: [{ type: "gain_energy", amount: 1, target: "self" }] }] } },
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
