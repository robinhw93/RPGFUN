import { readFile, writeFile } from "node:fs/promises";

const ITEM_START = "  // SHOP PROGRESSION START";
const ITEM_END = "  // SHOP PROGRESSION END";
const SET_START = "  // SHOP PROGRESSION SETS START";
const SET_END = "  // SHOP PROGRESSION SETS END";
const ICON_START = "  // SHOP PROGRESSION ICONS START";
const ICON_END = "  // SHOP PROGRESSION ICONS END";

const adventures = [
  { id: "windsong-forest", code: "a1", level: 1, name: "Windsong", rarity: "uncommon", blacksmith: ["Canopy-Forged Shortsword", "Barkbound Buckler"], tailor: ["Whisperleaf Hood", "Wayfarer's Sash"], leatherworker: ["Briarhide Jerkin", "Softstep Boots"], alchemist: ["Windsong Remedy", "Bottled Tailwind"] },
  { id: "adventure-ms1iq9ye-9ra1z", code: "a2", level: 4, name: "Highlands", rarity: "uncommon", blacksmith: ["Highland Cleaver", "Windscarred Helm"], tailor: ["Skyweave Robe", "Heatherstep Slippers"], leatherworker: ["Galehunter Vest", "Galehunter Leggings"], alchemist: ["Highland Restorative", "Cliffside Courage"] },
  { id: "highfall-mountains", code: "a3", level: 8, name: "Highfall", rarity: "rare", blacksmith: ["Cragforged Maul", "Cragforged Cuirass"], tailor: ["Cloudpeak Cowl", "Cloudpeak Robes"], leatherworker: ["Goatpath Leathers", "Goatpath Treads"], alchemist: ["Highfall Elixir", "Stoneblood Draught"] },
  { id: "mirefen-marsh", code: "a4", level: 13, name: "Mirefen", rarity: "rare", blacksmith: ["Bog-Iron Hatchet", "Mireplate Greaves"], tailor: ["Fenweaver Hood", "Fenweaver Wraps"], leatherworker: ["Reedstalker Coat", "Reedstalker Boots"], alchemist: ["Mirefen Lifebloom", "Purewater Antivenom"] },
  { id: "ashen-foundry", code: "a5", level: 18, name: "Ashen", rarity: "rare", blacksmith: ["Ash Tempered Blade", "Foundry Wardshield"], tailor: ["Sootscribe Mantle", "Sootscribe Sandals"], leatherworker: ["Cinderhide Vest", "Cinderhide Legguards"], alchemist: ["Foundry Heart-Tonic", "Cooling Ember Salve"] },
  { id: "sunken-reliquary", code: "a6", level: 23, name: "Reliquary", rarity: "rare", blacksmith: ["Drowned Temple Spear", "Relicguard Helm"], tailor: ["Tidecaller's Vestments", "Tidecaller's Slippers"], leatherworker: ["Tidestrider Coat", "Tidestrider Leggings"], alchemist: ["Reliquary Panacea", "Pearlwater Infusion"] },
  { id: "nightglass-citadel", code: "a7", level: 28, name: "Nightglass", rarity: "rare", blacksmith: ["Nightguard Dirk", "Nightguard Breastplate"], tailor: ["Mirror-Silk Hood", "Mirror-Silk Robes"], leatherworker: ["Veilrunner Jerkin", "Veilrunner Boots"], alchemist: ["Nightglass Elixir", "Bottled Eclipse"] },
  { id: "frostbound-expanse", code: "a8", level: 34, name: "Frostbound", rarity: "epic", blacksmith: ["Rimebone Axe", "Glacier Bulwark"], tailor: ["Rimeweaver Crown", "Rimeweaver Vestments"], leatherworker: ["Whitewind Leathers", "Whitewind Treads"], alchemist: ["Frostheart Restorative", "Thawing Aurora"] },
  { id: "stormspire-aerie", code: "a9", level: 40, name: "Stormspire", rarity: "epic", blacksmith: ["Stormspire Glaive", "Thunderhead Plate"], tailor: ["Tempest-Silk Cowl", "Tempest-Silk Robes"], leatherworker: ["Skystrider Harness", "Skystrider Legguards"], alchemist: ["Stormspire Vitality", "Condensed Thunder"] },
  { id: "hollow-crown", code: "a10", level: 46, name: "Hollow Crown", rarity: "epic", blacksmith: ["Crownless Greatsword", "Hollowguard Sabatons"], tailor: ["Gravecourt Hood", "Gravecourt Vestments"], leatherworker: ["Crownstalker Coat", "Crownstalker Boots"], alchemist: ["Crownless Reprieve", "Royal Rejuvenant"] },
  { id: "astral-scar", code: "a11", level: 49, name: "Astral Scar", rarity: "legendary", blacksmith: ["Starward Warhammer", "Starward Aegis"], tailor: ["Cometweave Crown", "Cometweave Robes"], leatherworker: ["Voidwalker Harness", "Voidwalker Leggings"], alchemist: ["Astral Renewal", "Distilled Starlight"] },
  { id: "world-below", code: "a12", level: 50, name: "World Below", rarity: "legendary", blacksmith: ["Deepforge Cleaver", "Rootsteel Cuirass"], tailor: ["First-Echo Veil", "First-Echo Vestments"], leatherworker: ["Abysswalker Leathers", "Abysswalker Treads"], alchemist: ["Worldroot Elixir", "Essence of the First Echo"] },
];

const ringSpecs = [
  ["Venomcoil Ring", "Poison", "Your Poison deals 10% more damage.", { passive: { statusDamage: { poison: 0.1 } } }],
  ["Bulwark Band", "Guard", "You generate 10% more Guard.", { passive: { guardGeneration: 0.1 } }],
  ["Quietstep Signet", "Stealth", "You deal 12% more damage while Stealthed.", { damageModifiers: [{ id: "quietstep-ambush", name: "Quietstep", description: "Deal 12% more damage while Stealthed.", multiplier: 1.12, attackerHasAnyStatus: ["stealth"] }] }],
  ["Cinder Loop", "Fire", "Your Burn deals 12% more damage.", { passive: { statusDamage: { burn: 0.12 } } }],
  ["Bloodletter's Seal", "Bleed", "Your Bleed deals 15% more damage.", { passive: { statusDamage: { bleed: 0.15 } } }],
  ["Static Fang Ring", "Shockblade", "Your Electrified effects last 1 additional turn.", { passive: { statusDurationBonuses: { electrified: 1 } } }],
  ["Rimebound Band", "Frost", "Your Frost damage against Slowed or Frozen enemies is increased by 14%.", { damageModifiers: [{ id: "rimebound-control", name: "Rimebound", description: "Deal 14% more Frost damage to Slowed or Frozen enemies.", multiplier: 1.14, damageTypes: ["frost"], targetHasAnyStatus: ["slowed", "frozen"] }] }],
  ["Woundkeeper Ring", "Arcane Wound", "Your Arcane Wounds last 1 additional turn.", { passive: { statusDurationBonuses: { arcaneWound: 1 } } }],
  ["Immolator's Loop", "Self-Immolation", "You deal 18% more Fire damage while Burning.", { damageModifiers: [{ id: "immolator-fire", name: "Immolator", description: "Deal 18% more Fire damage while Burning.", multiplier: 1.18, damageTypes: ["fire"], attackerHasAnyStatus: ["burn"] }] }],
  ["Wardweaver Circle", "Barrier", "Begin each combat with Barrier equal to 6% of your maximum Health.", { passive: { startingAbsorptionMaxHpRatios: { barrier: 0.06 } } }],
  ["Stormcaller's Band", "Lightning", "Whenever you apply Electrified, apply 1 additional stack.", { passive: { statusApplicationStacks: { electrified: 1 } } }],
  ["Consecrated Seal", "Smite", "Whenever you apply Smite, apply 1 additional stack.", { passive: { statusApplicationStacks: { smite: 1 } } }],
  ["Opportunist's Mark", "Debuff Exploitation", "Deal 2.5% more damage per unique debuff on the target.", { damageModifiers: [{ id: "opportunists-mark", name: "Opportunist's Mark", description: "Deal 2.5% more damage per unique debuff on the target.", multiplier: 1, multiplierPerTargetDebuff: 0.025 }] }],
  ["Furnaceguard Ring", "Burning Guard", "Deal 15% more Fire damage while Guarded.", { damageModifiers: [{ id: "furnaceguard-fire", name: "Furnaceguard", description: "Deal 15% more Fire damage while Guarded.", multiplier: 1.15, damageTypes: ["fire"], attackerHasAnyStatus: ["guard"] }] }],
  ["Avalanche Signet", "Frost Control", "Deal 18% more damage to Frozen enemies.", { damageModifiers: [{ id: "avalanche-shatter", name: "Avalanche", description: "Deal 18% more damage to Frozen enemies.", multiplier: 1.18, targetHasAnyStatus: ["frozen"] }] }],
  ["Crimson Feast Ring", "Vampiric Bleed", "Your Bleed restores Health equal to 10% of its damage.", { passive: { statusDamageLeech: { bleed: 0.1 } } }],
  ["Tempest Circuit", "Electrified Burst", "Deal 20% more Lightning damage to Electrified enemies.", { damageModifiers: [{ id: "tempest-circuit", name: "Tempest Circuit", description: "Deal 20% more Lightning damage to Electrified enemies.", multiplier: 1.2, damageTypes: ["lightning"], targetHasAnyStatus: ["electrified"] }] }],
  ["Virulent Promise", "Venom Debilitation", "Applying Poison has a 20% chance to also apply Weaken.", { passive: { statusApplicationCompanionChances: { poison: [{ status: "weaken", chance: 0.2 }] } } }],
  ["Crownless Bastion Ring", "Fortress", "Begin combat with Guard equal to 15% of your maximum Health and generate 15% more Guard.", { passive: { startingAbsorptionMaxHpRatios: { guard: 0.15 }, guardGeneration: 0.15 } }],
  ["Elemental Conflux Ring", "Elemental Fury", "Deal 3% more damage per unique debuff on the target.", { damageModifiers: [{ id: "elemental-conflux", name: "Elemental Conflux", description: "Deal 3% more damage per unique debuff on the target.", multiplier: 1, multiplierPerTargetDebuff: 0.03 }] }],
  ["Astral Fracture Ring", "Arcane Detonation", "Deal 25% more Arcane damage to enemies with Arcane Wound.", { damageModifiers: [{ id: "astral-fracture", name: "Astral Fracture", description: "Deal 25% more Arcane damage to enemies with Arcane Wound.", multiplier: 1.25, damageTypes: ["arcane"], targetHasAnyStatus: ["arcaneWound"] }] }],
  ["Perfect Execution Ring", "Critical Execution", "Your first Critical Strike each turn restores 1 Energy.", { triggers: [{ id: "perfect-execution-energy", name: "Perfect Execution", description: "Your first Critical Strike each turn restores 1 Energy.", event: "on_crit", oncePerTurn: true, effects: [{ type: "gain_energy", amount: 1, target: "self" }] }] }],
  ["Worldroot Seal", "Undying Guardian", "The first time you would die each combat, restore 20% of your maximum Health instead.", { passive: { deathPreventionHealRatio: 0.2 } }],
  ["First Flame Circle", "Affliction Mastery", "Your Poison, Burn, and Bleed deal 30% more damage.", { passive: { statusDamage: { poison: 0.3, burn: 0.3, bleed: 0.3 } } }],
];

const pairedSets = new Map([
  ["a2-leatherworker", ["set-shop-a2-galehunter", "Galehunter"]],
  ["a3-blacksmith", ["set-shop-a3-cragforged", "Cragforged"]],
  ["a4-tailor", ["set-shop-a4-fenweaver", "Fenweaver"]],
  ["a6-leatherworker", ["set-shop-a6-tidestrider", "Tidestrider"]],
  ["a7-blacksmith", ["set-shop-a7-nightguard", "Nightguard"]],
  ["a8-tailor", ["set-shop-a8-rimeweaver", "Rimeweaver"]],
  ["a10-leatherworker", ["set-shop-a10-crownstalker", "Crownstalker"]],
  ["a11-blacksmith", ["set-shop-a11-starward", "Starward"]],
  ["a12-tailor", ["set-shop-a12-first-echo", "First Echo"]],
]);

const weaponKinds = ["sword", "axe", "mace", "axe", "sword", "polearm", "dagger", "axe", "polearm", "sword", "mace", "axe"];
const weaponIcons = ["sword-01", "axe-02", "mace-03", "axe-04", "sword-05", "polearm-01", "dagger-02", "axe-03", "polearm-04", "sword-02", "mace-05", "axe-05"];
const secondBlacksmithSlots = ["offHand", "head", "chest", "pants", "offHand", "head", "chest", "offHand", "chest", "boots", "offHand", "chest"];
const secondBlacksmithIcons = ["shield-01", "head-02", "chest-03", "pants-04", "shield-05", "head-01", "chest-02", "shield-03", "chest-04", "boots-05", "shield-02", "chest-05"];
const clothSlots = [["head", "pants"], ["chest", "boots"], ["head", "chest"], ["head", "pants"], ["chest", "boots"], ["chest", "boots"], ["head", "chest"], ["head", "chest"], ["head", "chest"], ["head", "chest"], ["head", "chest"], ["head", "chest"]];
const leatherSlots = [["chest", "boots"], ["chest", "pants"], ["chest", "boots"], ["chest", "boots"], ["chest", "pants"], ["chest", "pants"], ["chest", "boots"], ["chest", "boots"], ["chest", "pants"], ["chest", "boots"], ["chest", "pants"], ["chest", "boots"]];
const potionIcons = ["minor", "normal", "greater", "major", "superior"];

function gearIcon(slot, material, index) {
  const number = (index % 5) + 1;
  if (slot === "head") return `/assets/gear-icons/head-${number.toString().padStart(2, "0")}.webp`;
  if (slot === "chest") return `/assets/gear-icons/chest-${number.toString().padStart(2, "0")}.webp`;
  if (slot === "pants") return `/assets/gear-icons/pants-${number.toString().padStart(2, "0")}.webp`;
  if (slot === "boots") return `/assets/gear-icons/boots-${number.toString().padStart(2, "0")}.webp`;
  return `/assets/gear-icons/${material === "cloth" ? "tome" : "dagger"}-${number.toString().padStart(2, "0")}.webp`;
}

function baseAvailability(adventure, vendor) {
  return { arkenfallVendor: vendor, craftingRecipe: null, vendorPrerequisiteAdventureId: adventure.id };
}

function makeGear(adventure, vendor, index, name, options) {
  const primary = Math.max(2, Math.round(adventure.level * 0.28) + 1);
  const secondary = Math.max(1, Math.round(primary * 0.45));
  const item = {
    kind: "gear",
    id: `gear-shop-${adventure.code}-${vendor}-${index + 1}`,
    name,
    goldCost: Math.round(25 + adventure.level * 8 + index * 12),
    slot: options.slot,
    rarity: adventure.rarity,
    description: options.description,
    iconUrl: options.iconUrl,
    stats: { [options.primaryStat]: primary, vitality: secondary },
    ...baseAvailability(adventure, vendor),
  };
  if (options.material) item.armorMaterial = options.material;
  if (options.physicalPower) item.physicalPower = options.physicalPower;
  if (options.magicalPower) item.magicalPower = options.magicalPower;
  if (options.armor) item.armor = options.armor;
  if (options.magicResistance) item.magicResistance = options.magicResistance;
  if (options.combat) item.combat = options.combat;
  if (options.weaponKind) {
    item.weaponKind = options.weaponKind;
    item.weaponEquipType = options.weaponEquipType;
  }
  const set = pairedSets.get(`${adventure.code}-${vendor}`);
  if (set) {
    item.set = set[0];
    item.setName = set[1];
  }
  return item;
}

function utilityEffect(index) {
  const effects = [
    [{ type: "gain_energy", amount: 2 }],
    [{ type: "apply_status", target: "self", status: "fierce", stacks: 1, duration: 2 }],
    [{ type: "apply_status", target: "self", status: "strengthened", stacks: 1, duration: 2 }],
    [{ type: "remove_status", target: "self", status: "poison" }],
    [{ type: "remove_status", target: "self", status: "burn" }],
    [{ type: "gain_energy", amount: 3 }],
    [{ type: "apply_status", target: "all_enemies", status: "blind", stacks: 1, duration: 1 }],
    [{ type: "remove_status", target: "self", status: "frozen" }],
    [{ type: "apply_status", target: "self", status: "enlightened", stacks: 1, duration: 2 }],
    [{ type: "apply_status", target: "self", status: "regenerate", stacks: 1, duration: 3 }],
    [{ type: "gain_energy", amount: 4 }],
    [{ type: "change_next_turn_energy_regen", amount: 4 }],
  ];
  return effects[index];
}

function utilityDescription(index) {
  return [
    "Restore 2 Energy.", "Gain Fierce for 2 turns.", "Gain Strengthened for 2 turns.", "Remove Poison.",
    "Remove Burn.", "Restore 3 Energy.", "Apply Blind to all enemies for 1 turn.", "Remove Frozen.",
    "Gain Enlightened for 2 turns.", "Gain Regenerate for 3 turns.", "Restore 4 Energy.", "Gain +4 Energy regeneration next turn.",
  ][index];
}

const items = [];
const sets = [];
const icons = {};

for (const [adventureIndex, adventure] of adventures.entries()) {
  const weaponPower = Math.round(adventure.level * 0.52) + 2;
  const armorPower = Math.round(adventure.level * 0.3) + 1;
  const defense = Math.round(adventure.level / 10) + 1;
  const blacksmithItems = [
    makeGear(adventure, "blacksmith", 0, adventure.blacksmith[0], {
      slot: "mainHand", primaryStat: "strength", physicalPower: weaponPower, weaponKind: weaponKinds[adventureIndex],
      weaponEquipType: weaponKinds[adventureIndex] === "mace" || weaponKinds[adventureIndex] === "polearm" ? "twoHand" : "oneHand",
      iconUrl: `/assets/gear-icons/${weaponIcons[adventureIndex]}.webp`, description: `A ${adventure.name} weapon forged for the dangers beyond Arkenfall.`,
    }),
    makeGear(adventure, "blacksmith", 1, adventure.blacksmith[1], {
      slot: secondBlacksmithSlots[adventureIndex], primaryStat: "strength", physicalPower: armorPower, armor: defense,
      material: "plate", iconUrl: `/assets/gear-icons/${secondBlacksmithIcons[adventureIndex]}.webp`, description: `Protective platework shaped from techniques recovered in ${adventure.name}.`,
    }),
  ];
  const tailorItems = adventure.tailor.map((name, index) => makeGear(adventure, "tailor", index, name, {
    slot: clothSlots[adventureIndex][index], primaryStat: "intelligence", magicalPower: armorPower, magicResistance: defense,
    material: "cloth", iconUrl: gearIcon(clothSlots[adventureIndex][index], "cloth", adventureIndex + index),
    description: `Arcane clothwork inspired by the secrets of ${adventure.name}.`,
  }));
  const leatherItems = adventure.leatherworker.map((name, index) => makeGear(adventure, "leatherworker", index, name, {
    slot: leatherSlots[adventureIndex][index], primaryStat: "agility", physicalPower: armorPower,
    material: "leather", iconUrl: gearIcon(leatherSlots[adventureIndex][index], "leather", adventureIndex + index + 2),
    combat: { passive: index === 0 ? { dodgeChance: 0.01 + Math.floor(adventureIndex / 4) * 0.01 } : { initiative: 2 + adventureIndex } },
    description: `Supple field gear patterned after hunters of ${adventure.name}.`,
  }));
  const healIcon = `/assets/items/potion-red-${potionIcons[Math.min(4, Math.floor(adventureIndex / 3) + 1)]}.webp`;
  const utilityIcon = `/assets/items/potion-${["blue", "purple", "green"][adventureIndex % 3]}-${potionIcons[Math.min(4, Math.floor(adventureIndex / 3) + 1)]}.webp`;
  const alchemistItems = [
    { kind: "consumable", id: `consumable-shop-${adventure.code}-healing`, name: adventure.alchemist[0], goldCost: 18 + adventure.level * 5, rarity: adventure.rarity, description: `Restore ${20 + adventure.level * 3} Health.`, iconUrl: healIcon, effects: [{ type: "heal", amount: 20 + adventure.level * 3 }], ...baseAvailability(adventure, "alchemist") },
    { kind: "consumable", id: `consumable-shop-${adventure.code}-utility`, name: adventure.alchemist[1], goldCost: 22 + adventure.level * 5, rarity: adventure.rarity, description: utilityDescription(adventureIndex), iconUrl: utilityIcon, effects: utilityEffect(adventureIndex), ...baseAvailability(adventure, "alchemist") },
  ];
  const rings = ringSpecs.slice(adventureIndex * 2, adventureIndex * 2 + 2).map(([name, spec, description, combat], ringIndex) => ({
    kind: "gear", id: `gear-shop-${adventure.code}-jeweler-${ringIndex + 1}`, name, goldCost: 35 + adventure.level * 9 + ringIndex * 15,
    slot: "ring", rarity: adventure.rarity, description: `${description} Favored by ${spec} specialists, but wearable by every class.`,
    iconUrl: `/assets/gear-icons/ring-${((adventureIndex * 2 + ringIndex) % 5 + 1).toString().padStart(2, "0")}.webp`,
    stats: { vitality: Math.max(1, Math.floor(adventure.level / 10) + 1), luck: Math.max(1, Math.floor(adventureIndex / 3) + 1) },
    combat, ...baseAvailability(adventure, "jeweler"),
  }));
  const adventureItems = [...blacksmithItems, ...alchemistItems, ...tailorItems, ...leatherItems, ...rings];
  items.push(...adventureItems);
  for (const item of adventureItems) icons[item.id] = item.iconUrl;
}

for (const [key, [id, name]] of pairedSets) {
  const [code, vendor] = key.split("-");
  const adventureIndex = adventures.findIndex((adventure) => adventure.code === code);
  const scale = Math.max(1, Math.round(adventures[adventureIndex].level / 8));
  const bonus = vendor === "blacksmith"
    ? { description: `+${scale} Strength and generate ${10 + adventureIndex}% more Guard.`, passive: { stats: { strength: scale }, guardGeneration: (10 + adventureIndex) / 100 } }
    : vendor === "tailor"
      ? { description: `+${scale} Intelligence and +${scale + 1} Spell Power.`, passive: { stats: { intelligence: scale }, magicalPower: scale + 1 } }
      : { description: `+${scale} Agility and +${2 + Math.floor(adventureIndex / 3)}% Critical Strike Chance.`, passive: { stats: { agility: scale }, critChance: (2 + Math.floor(adventureIndex / 3)) / 100 } };
  sets.push({ id, name, pieceCount: 2, bonuses: [{ requiredPieces: 2, ...bonus }] });
}

if (items.length !== 120) throw new Error(`Expected 120 progression items, received ${items.length}.`);
if (ringSpecs.length !== 24) throw new Error(`Expected 24 specialization rings, received ${ringSpecs.length}.`);

function withComma(json) {
  return json.split("\n").map((line) => `  ${line}`).join("\n") + ",";
}

function replaceOrInsertBlock(source, start, end, block, anchor, insertionPrefix = "") {
  const startIndex = source.indexOf(start);
  if (startIndex >= 0) {
    const endIndex = source.indexOf(end, startIndex);
    if (endIndex < 0) throw new Error(`Could not find closing marker ${end}.`);
    return source.slice(0, startIndex) + block + source.slice(endIndex + end.length);
  }
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) throw new Error(`Could not find insertion anchor ${anchor}.`);
  return source.slice(0, anchorIndex) + insertionPrefix + block + "\n" + source.slice(anchorIndex);
}

const gearPath = "src/game/content/gear.ts";
let gearSource = await readFile(gearPath, "utf8");
const itemBlock = `${ITEM_START}\n${items.map((item) => withComma(JSON.stringify(item, null, 2))).join("\n")}\n${ITEM_END}`;
gearSource = replaceOrInsertBlock(gearSource, ITEM_START, ITEM_END, itemBlock, "];\n\nexport const GEAR_SETS", ",\n");
const setBlock = `${SET_START}\n${sets.map((set) => withComma(JSON.stringify(set, null, 2))).join("\n")}\n${SET_END}`;
gearSource = replaceOrInsertBlock(gearSource, SET_START, SET_END, setBlock, "];\n\nexport const GEAR_SET_BONUSES", ",\n");
await writeFile(gearPath, gearSource, "utf8");

const iconPath = "src/game/itemIcons.ts";
let iconSource = await readFile(iconPath, "utf8");
const iconEntries = Object.entries(icons).map(([id, url]) => `  ${JSON.stringify(id)}: ${JSON.stringify(url)},`).join("\n");
const iconBlock = `${ICON_START}\n${iconEntries}\n${ICON_END}`;
iconSource = replaceOrInsertBlock(iconSource, ICON_START, ICON_END, iconBlock, "};\n\nexport const CRAFTING_MATERIAL_ARTWORK_URLS", ",\n");
await writeFile(iconPath, iconSource, "utf8");

console.log(`Generated ${items.length} shop items, ${sets.length} paired sets, and ${Object.keys(icons).length} icon mappings.`);
