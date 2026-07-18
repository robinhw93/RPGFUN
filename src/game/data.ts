import type { Ability, AdventureNode, EnemyTemplate, GearItem, GearSetBonusDefinition, Talent } from "./types";

export const ABILITIES: Record<string, Ability> = {
  strike: {
    id: "strike", name: "Strike", description: "A reliable weapon attack.", energyCost: 0,
    target: "enemy", damageType: "physical", power: 5, scalingStat: "strength", icon: "⚔", branch: "core",
  },
  guard: {
    id: "guard", name: "Guard", description: "Gain 6 Guard until the next turn.", energyCost: 2,
    target: "self", icon: "◆", branch: "core", effect: "guard",
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
    id: "arcaneBolt", name: "Arcane Bolt", description: "Focused arcane damage that ignores some armor.", energyCost: 3,
    target: "enemy", damageType: "arcane", power: 9, scalingStat: "intelligence", icon: "✧", branch: "arcanist",
  },
  siphon: {
    id: "siphon", name: "Essence Siphon", description: "Deal damage and recover 2 Energy.", energyCost: 4,
    target: "enemy", damageType: "arcane", power: 7, scalingStat: "intelligence", icon: "◎", branch: "arcanist", effect: "energy",
  },
};

export const TALENTS: Talent[] = [
  { id: "origin", name: "Wayfarer's Spark", description: "Your first step. Unlocks Strike and Guard.", branch: "core", tier: 0, cost: 0, requires: [] },
  { id: "brute_1", name: "Brute", description: "+2 Strength.", branch: "brute", tier: 1, cost: 1, requires: ["origin"], combat: { passive: { stats: { strength: 2 } } } },
  { id: "shadow_1", name: "Shadow", description: "+2 Agility.", branch: "shadow", tier: 1, cost: 1, requires: ["origin"], combat: { passive: { stats: { agility: 2 } } } },
  { id: "arcanist_1", name: "Arcanist", description: "+2 Intelligence.", branch: "arcanist", tier: 1, cost: 1, requires: ["origin"], combat: { passive: { stats: { intelligence: 2 } } } },
];

export const ENEMIES: Record<string, EnemyTemplate> = {
  ashHound: { id: "ashHound", name: "Ash Hound", title: "Feral Beast", maxHp: 28, power: 7, armor: 1, energyCost: 3, intentText: "Raking Claws · 7 damage", attackDescription: "Rakes the target with ash-caked claws. Costs 3 Energy and applies Bleed when it deals damage.", onHitEffect: "bleed", accent: "#d47a43" },
  cinderCultist: { id: "cinderCultist", name: "Cinder Cultist", title: "Fanatic", maxHp: 34, power: 9, armor: 2, energyCost: 4, intentText: "Searing Brand · 9 damage", attackDescription: "Brands the target with a searing sigil. Costs 4 Energy.", accent: "#a46ad4" },
  emberWisp: { id: "emberWisp", name: "Ember Wisp", title: "Restless Flame", maxHp: 22, power: 6, armor: 0, energyCost: 3, intentText: "Scorch · 6 damage", attackDescription: "Releases a focused burst of living flame. Costs 3 Energy.", accent: "#d6ad53" },
  ashenWarden: { id: "ashenWarden", name: "The Ashen Warden", title: "Keeper of the Black Gate", maxHp: 92, power: 12, armor: 4, energyCost: 5, intentText: "Cinder Cleave · 12 damage", attackDescription: "Sweeps a burning blade across the battlefield. Costs 5 Energy.", accent: "#de5b47" },
};

export const ITEMS: GearItem[] = [
  { id: "ironCleaver", name: "Notched Iron Cleaver", slot: "mainHand", rarity: "uncommon", description: "Still sharp enough to draw blood.", stats: { strength: 2 }, power: 3, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "embershard", name: "Embershard Focus", slot: "offHand", rarity: "rare", description: "Warm whispers curl around the crystal.", stats: { intelligence: 3 }, power: 2 },
  { id: "wandererHood", name: "Wanderer's Hood", slot: "head", rarity: "common", description: "A little anonymity goes a long way.", stats: { agility: 1 }, armor: 1 },
  { id: "ashCuirass", name: "Ashborn Cuirass", slot: "chest", rarity: "rare", description: "Forged in a fire that never cooled.", stats: { strength: 2, vitality: 2 }, armor: 5, set: "ashborn", setName: "Ashborn Warplate" },
  { id: "veilTrousers", name: "Veilwalker Trousers", slot: "pants", rarity: "uncommon", description: "They leave no footprint in soot.", stats: { agility: 2 }, armor: 2, set: "veilwalker", setName: "Veilwalker's Guile" },
  { id: "roadBoots", name: "Dustworn Boots", slot: "boots", rarity: "common", description: "Made for roads best left unnamed.", stats: { vitality: 1 }, armor: 1 },
  { id: "garnetBand", name: "Garnet Signet", slot: "ring", rarity: "rare", description: "A noble crest has been scratched away.", stats: { strength: 1, luck: 2 } },
  { id: "moonRing", name: "Moonlit Coil", slot: "ring", rarity: "epic", description: "Its silver surface reflects an unfamiliar sky.", stats: { intelligence: 2, agility: 1, luck: 1 } },
  { id: "wardenHelm", name: "Warden's Broken Crown", slot: "head", rarity: "epic", description: "The last ember still burns within.", stats: { vitality: 3, strength: 2 }, armor: 4, set: "ashborn", setName: "Ashborn Warplate" },
];

export const GEAR_SET_BONUSES: GearSetBonusDefinition[] = [
  {
    setId: "ashborn",
    setName: "Ashborn Warplate",
    requiredPieces: 2,
    description: "+2 Strength.",
    passive: { stats: { strength: 2 } },
  },
];

export const ADVENTURE: AdventureNode[] = [
  { id: "road", type: "combat", eyebrow: "Encounter I", title: "Smoke on the Road", description: "Two shapes stalk through the drifting ash. They have already caught your scent.", enemies: ["ashHound", "ashHound"] },
  { id: "shrine", type: "event", eyebrow: "Unknown Event", title: "The Forgotten Shrine", description: "A cracked idol watches over a bowl of cold embers. Something valuable may still answer a prayer." },
  { id: "pilgrims", type: "combat", eyebrow: "Encounter II", title: "The Charred Pilgrims", description: "A fanatic raises their torch as a living flame coils at their shoulder.", enemies: ["cinderCultist", "emberWisp"] },
  { id: "gate", type: "boss", eyebrow: "Boss Encounter", title: "The Black Gate", description: "The Warden rises from its throne. Iron groans, and the road behind you disappears.", enemies: ["ashenWarden"] },
];
