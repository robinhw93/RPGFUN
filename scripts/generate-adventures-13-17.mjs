import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relative) => path.join(root, relative);
const json = (value, indent = 2) => JSON.stringify(value, null, indent);

const chapters = [
  { n: 13, id: "sepulcher-of-hours", name: "The Sepulcher of Hours", level: 54, prerequisite: "world-below", travel: "Descending through the clocks beneath the dead", card: "sepulcher-of-hours-adventure.webp", bg: "sepulcher-of-hours-edge.webp", accent: "#b99a68", event: "event-a13-broken-hour", completion: ["The Last Bell Falls Silent", "Oris shatters with the final hourglass. For the first time in an age, the dead are permitted to keep their endings."], enemies: [
    ["hourglass-revenant", "Hourglass Revenant", "Time-Lost Duelist", "physical", "slowed", "Borrowed Second", "Rewinds its wounds, then punishes Slowed targets."],
    ["chronowound-knight", "Chronowound Knight", "Keeper of Repeated Wounds", "physical", "bleed", "Looping Cleave", "Builds Bleed and converts weakness into a guarded counterattack."],
    ["ashen-mourner", "Ashen Mourner", "Cantor of Returning", "shadow", "exhausted", "Last Rites Reversed", "Resurrects the fallen before flooding the formation with restorative ash.", "reviver"],
    ["secondhand-assassin", "Secondhand Assassin", "Blade Between Moments", "physical", "reckless", "Stolen Moment", "Uses rapid hits, then vanishes behind Stealth while healing."],
    ["oris-last-dawn", "Oris, Keeper of Last Dawn", "Final Bell of the Sepulcher", "arcane", "arcaneWound", "Hour Zero", "Marks the player with Arcane Wound, charges Hour Zero, and rewinds itself under pressure.", "boss"],
  ]},
  { n: 14, id: "sanguine-basilica", name: "The Sanguine Basilica", level: 58, prerequisite: "sepulcher-of-hours", travel: "Climbing the red steps of the blood-lit basilica", card: "sanguine-basilica-adventure.webp", bg: "sanguine-basilica-edge.webp", accent: "#b23b50", event: "event-a14-living-reliquary", completion: ["The Basilica Runs Dry", "Veyra's stolen blood drains through the black marble. The bells toll once for the lives that can finally remain dead."], enemies: [
    ["crimson-penitent", "Crimson Penitent", "Flagellant Vanguard", "physical", "vulnerable", "Penance Due", "Hurts itself through Reckless pressure, then restores itself from the opening it creates."],
    ["vein-choir", "Vein Choir", "Many-Throated Canticle", "shadow", "nullify", "Arterial Hymn", "Nullifies spellcasters and heals every surviving voice in its choir."],
    ["bloodwake-hierophant", "Bloodwake Hierophant", "Priest of the Open Vein", "shadow", "bleed", "Red Resurrection", "Resurrects a fallen worshipper and sustains the group through massive blood rites.", "reviver"],
    ["reliquary-gargoyle", "Reliquary Gargoyle", "Stone Vessel of Saints", "physical", "disarm", "Reliquary Crash", "Disarms physical attackers and turns incoming pressure into heavy self-restoration."],
    ["saint-veyra-undying", "Saint Veyra, the Undying", "Blood Saint of the Basilica", "shadow", "smite", "Communion of Knives", "Applies Smite, drains momentum with Bleed, and restores a third of her Health when the communion turns.", "boss"],
  ]},
  { n: 15, id: "dreaming-wilds", name: "The Dreaming Wilds", level: 62, prerequisite: "sanguine-basilica", travel: "Following a path that changes whenever you blink", card: "dreaming-wilds-adventure.webp", bg: "dreaming-wilds-edge.webp", accent: "#7c5ab8", event: "event-a15-sleeping-moon", completion: ["The Dream Releases Its Roots", "Morwyn wakes for one lucid breath and lets the nightmare canopy dissolve into quiet silver rain."], enemies: [
    ["nightmare-stag", "Nightmare Stag", "Antlered Pursuer", "physical", "sleep", "Dream-Gore", "Rarely forces Sleep, then delivers a brutal waking strike and regrows its flesh."],
    ["dream-eater-moth", "Dream-Eater Moth", "Powder-Winged Null", "shadow", "blind", "Devour Color", "Blinds accurate builds and heals by wrapping itself in dream-dust."],
    ["somnolent-dryad", "Somnolent Dryad", "Root of Returning", "spell", "weaken", "Wake the Buried", "Resurrects dead beasts at full Health and maintains the grove through deep restoration.", "reviver"],
    ["briar-doppelganger", "Briar Doppelganger", "Thorned Reflection", "physical", "poison", "Mirror Thorn", "Poisons the player, gains Evasion, and heals whenever its reflection begins to crack."],
    ["morwyn-root-of-dreams", "Morwyn, Root of Dreams", "The Dream Beneath All Leaves", "shadow", "sleep", "Night Without Morning", "Cycles Sleep, Poison, and a charged nightmare while repeatedly regrowing its ancient body.", "boss"],
  ]},
  { n: 16, id: "iron-eclipse", name: "The Iron Eclipse", level: 66, prerequisite: "dreaming-wilds", travel: "Crossing the foundry beneath the black sun", card: "iron-eclipse-adventure.webp", bg: "iron-eclipse-edge.webp", accent: "#52728e", event: "event-a16-zero-foundry", completion: ["The Black Sun Powers Down", "Axiom-9's last command expires. The eclipse opens, revealing stars no machine had allowed the world to see."], enemies: [
    ["eclipse-centurion", "Eclipse Centurion", "Black-Sun Phalanx", "physical", "disarm", "Formation Break", "Disarms the player, fortifies itself, and counters exposed turns with crushing force."],
    ["nullstar-artificer", "Nullstar Artificer", "Engineer of Silence", "arcane", "nullify", "Silence Engine", "Nullifies Spell Power and repairs the most damaged construct before attacking again."],
    ["continuance-engine", "Continuance Engine", "Machine That Refuses Endings", "lightning", "chained", "Recompile the Fallen", "Rebuilds a destroyed ally at full integrity and repairs the entire formation.", "reviver"],
    ["black-sun-harrier", "Black-Sun Harrier", "Winged Pursuit Frame", "lightning", "exhausted", "Event-Horizon Dive", "Drains Energy through Exhausted, attacks twice, and restores its shell behind Evasion."],
    ["axiom-9-final-engine", "Axiom-9, the Final Engine", "Perfect Weapon of the Eclipse", "arcane", "nullify", "Terminal Proof", "Alternates Nullify and Disarm, charges Terminal Proof, and initiates emergency reconstruction below half Health.", "boss"],
  ]},
  { n: 17, id: "throne-beyond-death", name: "The Throne Beyond Death", level: 70, prerequisite: "iron-eclipse", travel: "Walking the road reserved for souls without graves", card: "throne-beyond-death-adventure.webp", bg: "throne-beyond-death-edge.webp", accent: "#d3b767", event: "event-a17-empty-coronation", completion: ["No Throne Is Eternal", "Nhal's crown breaks into seven dying stars. The road back to Arkenfall opens, and every soul behind you remembers how to move on."], enemies: [
    ["oathless-seraph", "Oathless Seraph", "Angel Without a Heaven", "fire", "burn", "Forsworn Radiance", "Burns and Blinds the player, then restores itself in stolen holy light."],
    ["grave-tide-leviathan", "Grave-Tide Leviathan", "Beast Beneath the Soul-Road", "frost", "wet", "Drowning Memory", "Applies Wet before crushing with Frost and heals through the tide it summons."],
    ["soulbound-archon", "Soulbound Archon", "Warden of Returning Souls", "shadow", "vulnerable", "Sovereign Recall", "Returns a fallen servant at full Health and seals every survivor in restorative soul-light.", "reviver"],
    ["crown-eater", "Crown-Eater", "Devourer of Final Names", "physical", "reckless", "Eat the Name", "Forces Reckless, tears away certainty with Blind, and feeds on the resulting chaos."],
    ["nhal-sovereign-returning", "Nhal, Sovereign of Returning", "King Beyond the Final Door", "shadow", "vulnerable", "The Last Return", "Chains lethal curses, heals through every phase, and charges The Last Return when the player is exposed.", "boss"],
  ]},
];

const setDefs = [
  { id: "set-eclipsed-oath", name: "Eclipsed Oath", cls: "Shadow", primary: "agility", material: "leather", weapon: ["dagger", "oneHand"], offhand: ["dagger", "oneHand"], iconWeapon: "dagger-05.webp", iconOffhand: "dagger-04.webp", bonuses: [
    [2, "+24 Agility.", { stats: { agility: 24 } }], [3, "+32 Physical Power.", { physicalPower: 32 }], [4, "+12% Critical Strike Chance.", { critChance: 0.12 }], [5, "Your Poison and Bleed deal 40% more damage.", { statusDamage: { poison: 0.4, bleed: 0.4 } }], [6, "+10% Dodge Chance.", { dodgeChance: 0.1 }], [7, "Whenever you apply Poison or Bleed, apply 2 additional stacks and restore Health equal to 20% of their damage.", { statusApplicationStacks: { poison: 2, bleed: 2 }, statusDamageLeech: { poison: 0.2, bleed: 0.2 } }],
  ]},
  { id: "set-infinite-equation", name: "Infinite Equation", cls: "Arcanist", primary: "intelligence", material: "cloth", weapon: ["wand", "mainHand"], offhand: ["tome", "offHand"], iconWeapon: "wand-05.webp", iconOffhand: "tome-05.webp", bonuses: [
    [2, "+24 Intelligence.", { stats: { intelligence: 24 } }], [3, "+32 Spell Power.", { magicalPower: 32 }], [4, "+12% Hit Chance.", { hitChance: 0.12 }], [5, "Apply 2 additional Arcane Wounds whenever you apply Arcane Wound.", { statusApplicationStacks: { arcaneWound: 2 } }], [6, "+2 Energy regeneration.", { energyRegen: 2 }], [7, "Gain 25% more Spell Power. Your Burn, Cold, Electrified, and Arcane Wound last 1 additional turn.", { magicalPowerMultiplier: 0.25, statusDurationBonuses: { burn: 1, cold: 1, electrified: 1, arcaneWound: 1 } }],
  ]},
  { id: "set-last-rampart", name: "Last Rampart", cls: "Brute", primary: "strength", material: "plate", weapon: ["mace", "mainHand"], offhand: ["shield", "offHand"], iconWeapon: "mace-05.webp", iconOffhand: "shield-05.webp", bonuses: [
    [2, "+24 Strength.", { stats: { strength: 24 } }], [3, "+32 Physical Power.", { physicalPower: 32 }], [4, "+42 Armor.", { armor: 42 }], [5, "Generate 45% more Guard.", { guardGeneration: 0.45 }], [6, "Add direct damage equal to 12% of your Armor.", { bonusDirectDamageFromArmorRatio: 0.12 }], [7, "Begin combat with Guard equal to 35% of maximum Health and gain 25% more Armor.", { startingAbsorptionMaxHpRatios: { guard: 0.35 }, armorMultiplier: 0.25 }],
  ]},
  { id: "set-grave-communion", name: "Grave Communion", cls: "Cultist", primary: "intelligence", material: "cloth", weapon: ["wand", "mainHand"], offhand: ["tome", "offHand"], iconWeapon: "wand-04.webp", iconOffhand: "tome-04.webp", bonuses: [
    [2, "+18 Intelligence and +18 Vitality.", { stats: { intelligence: 18, vitality: 18 } }], [3, "+30 Spell Power.", { magicalPower: 30 }], [4, "Your Poison, Burn, and Bleed deal 35% more damage.", { statusDamage: { poison: 0.35, burn: 0.35, bleed: 0.35 } }], [5, "Restore Health equal to 18% of your Poison, Burn, and Bleed damage.", { statusDamageLeech: { poison: 0.18, burn: 0.18, bleed: 0.18 } }], [6, "+25% healing received.", { healingReceived: 0.25 }], [7, "Blood Covenant: enter combat wounded by 15%. The first lethal hit instead restores 35% of maximum Health, and your afflictions deal 50% more damage.", { fullHealthCombatStartSelfDamageMaxHpRatio: 0.15, deathPreventionHealRatio: 0.35, statusDamage: { poison: 0.5, burn: 0.5, bleed: 0.5 } }],
  ]},
];

const slots = [
  ["head", "Crown", "head-05.webp"], ["chest", "Vestment", "chest-05.webp"], ["pants", "Legguards", "pants-05.webp"], ["boots", "Treads", "boots-05.webp"], ["mainHand", "Weapon", null], ["offHand", "Focus", null], ["ring", "Seal", "ring-05.webp"],
];

const setItems = setDefs.flatMap((set, setIndex) => slots.map(([slot, label, fixedIcon], pieceIndex) => {
  const id = `gear-endgame-${set.id.slice(4)}-${slot.toLowerCase()}`;
  const icon = fixedIcon ?? (slot === "mainHand" ? set.iconWeapon : set.iconOffhand);
  const primaryAmount = 18 + setIndex * 2 + Math.floor(pieceIndex / 2);
  const item = {
    kind: "gear", id, name: `${set.name} ${label}`, slot, rarity: "legendary", goldCost: 1200,
    description: `A ${set.cls} relic claimed beyond the known world. Part of the seven-piece ${set.name} set.`,
    iconUrl: `/assets/gear-icons/${icon}`, stats: { [set.primary]: primaryAmount, vitality: 10 + Math.floor(pieceIndex / 2) },
    set: set.id, setName: set.name, arkenfallVendor: null, craftingRecipe: null, vendorPrerequisiteAdventureId: null,
  };
  if (["head", "chest", "pants", "boots"].includes(slot)) {
    item.armorMaterial = set.material;
    item.armor = 30 + setIndex * 3 + pieceIndex * 3;
    item.magicResistance = 22 + setIndex * 3 + pieceIndex * 2;
  } else if (slot === "mainHand" || slot === "offHand") {
    const [kind, equip] = slot === "mainHand" ? set.weapon : set.offhand;
    item.weaponKind = kind;
    item.weaponEquipType = equip;
    if (set.cls === "Shadow" || set.cls === "Brute") item.physicalPower = 38 + setIndex * 3 + pieceIndex;
    else item.magicalPower = 40 + setIndex * 3 + pieceIndex;
  } else {
    item.physicalPower = set.cls === "Shadow" || set.cls === "Brute" ? 22 : undefined;
    item.magicalPower = set.cls === "Arcanist" || set.cls === "Cultist" ? 22 : undefined;
  }
  Object.keys(item).forEach((key) => item[key] === undefined && delete item[key]);
  return item;
}));

const itemIds = setItems.map((item) => item.id);
const allEnemySpecs = chapters.flatMap((chapter) => chapter.enemies.map((enemy, index) => ({ chapter, enemy, index })));
const dropIdsByEnemy = new Map(allEnemySpecs.map((spec, index) => [spec.enemy[0], [itemIds[index]]]));
itemIds.slice(allEnemySpecs.length).forEach((itemId, index) => dropIdsByEnemy.get(allEnemySpecs[(index + 1) * 5 - 1].enemy[0]).push(itemId));

const ability = (id, name, description, fields) => ({ id, name, description, energyCost: 3, cooldownTurns: 0, range: "ranged", vfx: "enemy_hex", ...fields });
const buildEnemy = ({ chapter, enemy: spec, index }) => {
  const [slug, name, title, damageType, debuff, signature, notes, role] = spec;
  const prefix = `enemy-ability-a${chapter.n}-${slug}`;
  const tier = chapter.n - 13;
  const base = 82 + tier * 10;
  const drops = (dropIdsByEnemy.get(slug) ?? []).map((itemId) => ({ itemId, chance: role === "boss" ? 28 : 15 }));
  if (role === "reviver") {
    return {
      id: `enemy-a${chapter.n}-${slug}`, name, title, imageUrl: `/assets/enemies/full/a${chapter.n}-${slug}.webp`, portraitUrl: `/assets/enemies/portraits/a${chapter.n}-${slug}.webp`,
      maxHp: 900 + tier * 135, physicalPower: Math.round(base * 0.55), spellPower: base + 14, armor: 38 + tier * 5, magicResistance: 48 + tier * 6,
      hitChance: 1.06 + tier * 0.01, dodgeChance: 0.08 + tier * 0.01, critChance: 0.13 + tier * 0.01, energyRegen: 4, maxEnergy: 12, startingEnergy: 12,
      startingStatuses: [{ status: "resilient", stacks: 1, duration: 3 }], dropTable: drops,
      abilities: [
        ability(`${prefix}-resurrect`, signature, "Resurrects one defeated ally with 100% of its maximum Health.", { energyCost: 7, cooldownTurns: 4, resurrectFriendlyMaxHpRatio: 1, vfx: "enemy_spirit_heal" }),
        ability(`${prefix}-restore`, "Deathless Benediction", "Restores massive Health to every living ally and grants Shielded.", { energyCost: 6, cooldownTurns: 2, friendlyTarget: "all_enemies", friendlyHealSpellPowerScaling: 2.4 + tier * 0.12, friendlyStatusApplications: [{ status: "shielded", stacks: 1, duration: 2 }], vfx: "enemy_spirit_heal" }),
        ability(`${prefix}-curse`, "Funeral Malediction", `Afflicts the player with ${debuff} while the caster restores 18% of maximum Health.`, { energyCost: 3, cooldownTurns: 1, statusApplications: [{ status: debuff, stacks: debuff === "bleed" ? 3 : 1, duration: 2 }], selfHealMaxHpRatio: 0.18, vfx: "enemy_hex" }),
      ], behaviorNotes: notes, behavior: "priority", maxActionsPerTurn: 1, accent: chapter.accent,
      ai: { rules: [
        { abilityId: `${prefix}-resurrect`, all: [{ type: "dead_ally_exists" }, { type: "energy_at_least", amount: 7 }] },
        { abilityId: `${prefix}-restore`, all: [{ type: "any_ally_hp_below", ratio: 0.72 }] },
        { abilityId: `${prefix}-curse`, all: [{ type: "player_missing_status", status: debuff }] },
      ], fallbackAbilityIds: [`${prefix}-restore`, `${prefix}-curse`], fallback: "ordered" },
    };
  }
  if (role === "boss") {
    return {
      id: `enemy-a${chapter.n}-${slug}`, name, title, imageUrl: `/assets/enemies/full/a${chapter.n}-${slug}.webp`, portraitUrl: `/assets/enemies/portraits/a${chapter.n}-${slug}.webp`,
      maxHp: 1850 + tier * 260, physicalPower: base + 18, spellPower: base + 24, armor: 58 + tier * 6, magicResistance: 60 + tier * 7,
      hitChance: 1.1 + tier * 0.01, dodgeChance: 0.1 + tier * 0.01, critChance: 0.18 + tier * 0.015, energyRegen: 5, maxEnergy: 14, startingEnergy: 14, dropTable: drops,
      abilities: [
        ability(`${prefix}-setup`, "Sovereign's Mark", `Applies 2 stacks of ${debuff} and Vulnerable.`, { energyCost: 3, cooldownTurns: 2, statusApplications: [{ status: debuff, stacks: 2, duration: 3 }, { status: "vulnerable", stacks: 1, duration: 2 }], vfx: "enemy_hex" }),
        ability(`${prefix}-charge`, signature, `Charges for one turn, then releases a devastating ${damageType} attack.`, { energyCost: 8, cooldownTurns: 4, damageType, baseDamage: 28 + tier * 5, spellPowerScaling: damageType === "physical" ? 0 : 2.15, physicalPowerScaling: damageType === "physical" ? 2.15 : 0, chargeTurns: 1, chargeText: `${name} bends the battlefield toward ${signature}.`, chargeVfx: "elemental_fury", vfx: "elemental_fury" }),
        ability(`${prefix}-execution`, "End the Pilgrimage", `Deals 80% more damage while the player has ${debuff}.`, { energyCost: 6, cooldownTurns: 2, damageType, baseDamage: 16 + tier * 4, spellPowerScaling: damageType === "physical" ? 0 : 1.75, physicalPowerScaling: damageType === "physical" ? 1.75 : 0, targetStatusDamageBonus: { status: debuff, multiplier: 1.8 }, vfx: damageType === "physical" ? "enemy_heavy_cleave" : "enemy_natures_beam" }),
        ability(`${prefix}-recover`, "Sovereign Renewal", "Restores 32% of maximum Health and gains Shielded.", { energyCost: 5, cooldownTurns: 3, selfHealMaxHpRatio: 0.32, selfStatusApplications: [{ status: "shielded", stacks: 1, duration: 2 }], vfx: "enemy_spirit_heal" }),
        ability(`${prefix}-basic`, "Thronebreaker", `A reliable ${damageType} attack that applies Weaken.`, { energyCost: 2, damageType, baseDamage: 8 + tier * 3, spellPowerScaling: damageType === "physical" ? 0 : 1.35, physicalPowerScaling: damageType === "physical" ? 1.35 : 0, statusApplications: [{ status: "weaken", stacks: 1, duration: 2, chance: 0.35 }], vfx: damageType === "physical" ? "enemy_heavy_cleave" : "enemy_natures_beam" }),
      ], behaviorNotes: notes, behavior: "priority", maxActionsPerTurn: 2, accent: chapter.accent,
      ai: { rules: [
        { abilityId: `${prefix}-recover`, all: [{ type: "self_hp_below", ratio: 0.55 }] },
        { abilityId: `${prefix}-execution`, all: [{ type: "player_has_status", status: debuff }, { type: "energy_at_least", amount: 6 }] },
        { abilityId: `${prefix}-setup`, all: [{ type: "player_missing_status", status: debuff }] },
        { abilityId: `${prefix}-charge`, all: [{ type: "energy_at_least", amount: 8 }] },
      ], fallbackAbilityIds: [`${prefix}-basic`], fallback: "ordered" },
    };
  }
  const healTargetsAllies = index === 1;
  return {
    id: `enemy-a${chapter.n}-${slug}`, name, title, imageUrl: `/assets/enemies/full/a${chapter.n}-${slug}.webp`, portraitUrl: `/assets/enemies/portraits/a${chapter.n}-${slug}.webp`,
    maxHp: 710 + tier * 105 + index * 42, physicalPower: damageType === "physical" ? base + index * 4 : Math.round(base * 0.55), spellPower: damageType === "physical" ? Math.round(base * 0.4) : base + index * 4,
    armor: 42 + tier * 5 + index * 2, magicResistance: 42 + tier * 5 + (3 - index) * 2, hitChance: 1.04 + tier * 0.01, dodgeChance: 0.09 + index * 0.015, critChance: 0.14 + tier * 0.01,
    energyRegen: 4, maxEnergy: 11, startingEnergy: 9, dropTable: drops,
    abilities: [
      ability(`${prefix}-signature`, signature, `A tactical ${damageType} attack that applies ${debuff}.`, { energyCost: 5, cooldownTurns: 2, damageType, baseDamage: 12 + tier * 3, spellPowerScaling: damageType === "physical" ? 0 : 1.65, physicalPowerScaling: damageType === "physical" ? 1.65 : 0, hits: index === 3 ? 2 : 1, statusApplications: [{ status: debuff, stacks: ["bleed", "poison", "burn", "arcaneWound"].includes(debuff) ? 3 : 1, duration: 2 }], vfx: damageType === "physical" ? "enemy_heavy_cleave" : "enemy_natures_beam" }),
      ability(`${prefix}-recover`, healTargetsAllies ? "Sustain the Line" : "Refuse the Wound", healTargetsAllies ? "Heals the most wounded ally and grants it Shielded." : "Restores 24% of maximum Health and gains Shielded.", healTargetsAllies ? { energyCost: 4, cooldownTurns: 2, friendlyTarget: "lowest_health", friendlyHealSpellPowerScaling: 2.25 + tier * 0.1, friendlyStatusApplications: [{ status: "shielded", stacks: 1, duration: 2 }], vfx: "enemy_spirit_heal" } : { energyCost: 4, cooldownTurns: 2, selfHealMaxHpRatio: 0.24, selfStatusApplications: [{ status: "shielded", stacks: 1, duration: 2 }], vfx: "enemy_spirit_heal" }),
      ability(`${prefix}-pressure`, "Relentless Pressure", "A low-cost attack that applies Weaken and restores 10% of maximum Health.", { energyCost: 2, cooldownTurns: 0, damageType, baseDamage: 5 + tier * 2, spellPowerScaling: damageType === "physical" ? 0 : 1.15, physicalPowerScaling: damageType === "physical" ? 1.15 : 0, statusApplications: [{ status: "weaken", stacks: 1, duration: 2, chance: 0.3 }], selfHealMaxHpRatio: 0.1, vfx: damageType === "physical" ? "enemy_bite_claw" : "enemy_hex" }),
    ], behaviorNotes: notes, behavior: "priority", maxActionsPerTurn: index === 3 ? 2 : 1, accent: chapter.accent,
    ai: { rules: [
      { abilityId: `${prefix}-recover`, all: healTargetsAllies ? [{ type: "any_ally_hp_below", ratio: 0.62 }] : [{ type: "self_hp_below", ratio: 0.62 }] },
      { abilityId: `${prefix}-signature`, all: [{ type: "player_missing_status", status: debuff }] },
    ], fallbackAbilityIds: [`${prefix}-pressure`, `${prefix}-signature`], fallback: "cycle" },
  };
};

const newEnemies = Object.fromEntries(allEnemySpecs.map((spec) => { const enemy = buildEnemy(spec); return [enemy.id, enemy]; }));

const newEvents = Object.fromEntries(chapters.map((chapter) => [chapter.event, {
  id: chapter.event, name: chapter.n === 13 ? "The Broken Hour" : chapter.n === 14 ? "The Living Reliquary" : chapter.n === 15 ? "The Sleeping Moon" : chapter.n === 16 ? "The Zero Foundry" : "The Empty Coronation",
  eyebrow: "Endgame Event", description: `A dangerous remnant of ${chapter.name} offers power at a price.`, choices: [
    { id: `${chapter.event}-master`, label: "Master the remnant", description: "Force its power to obey.", resolution: "check", stat: chapter.n % 2 ? "intelligence" : "strength", threshold: 58 + (chapter.n - 13) * 4, success: { text: "The remnant yields and strengthens you for the next battle.", effects: [{ type: "heal", amount: 120 + (chapter.n - 13) * 20 }, { type: "playerNextCombatBuff", status: "fierce", stacks: 1 }] }, failure: { text: "The remnant turns your certainty against you.", effects: [{ type: "loseHealth", amount: 85 + (chapter.n - 13) * 15 }, { type: "playerNextCombatDebuff", status: chapter.n % 2 ? "nullify" : "disarm", stacks: 1 }] } },
    { id: `${chapter.event}-steal`, label: "Steal a fragment", description: "Take something valuable before the remnant notices.", resolution: "check", stat: "agility", threshold: 56 + (chapter.n - 13) * 4, success: { text: "You escape with a fragment of impossible wealth.", effects: [{ type: "gainGold", amount: 260 + (chapter.n - 13) * 45 }] }, failure: { text: "The trap closes around your limbs and breath.", effects: [{ type: "loseHealth", amount: 70 + (chapter.n - 13) * 15 }, { type: "playerNextCombatDebuff", status: "exhausted", stacks: 1 }] } },
    { id: `${chapter.event}-leave`, label: "Leave it untouched", description: "Some bargains deserve no answer.", resolution: "direct", stat: "luck", threshold: 0, success: { text: "", effects: [] }, failure: { text: "", effects: [] }, outcome: { text: "You pass without disturbing what waits there.", effects: [{ type: "heal", amount: 55 + (chapter.n - 13) * 10 }] } },
  ],
}]));

const newAdventures = chapters.map((chapter) => {
  const ids = chapter.enemies.map(([slug]) => `enemy-a${chapter.n}-${slug}`);
  const reward = (stage, boss = false) => ({ experience: boss ? 1750 + (chapter.n - 13) * 240 : 720 + (chapter.n - 13) * 110 + stage * 35, gold: boss ? 520 + (chapter.n - 13) * 85 : 145 + stage * 22 });
  const stage = (number, name, type, enemyIds, eventId) => ({ id: `a${chapter.n}-stage-${number}`, name, entries: [{ id: `a${chapter.n}-${type}-${number}`, type, chance: 100, eyebrow: type === "boss" ? "Boss Encounter" : type === "event" ? "Event" : "Endgame Encounter", title: type === "boss" ? chapter.enemies[4][1] : type === "event" ? newEvents[chapter.event].name : `${chapter.enemies[number - 1]?.[1] ?? chapter.name} Formation`, description: type === "event" ? "The path narrows around a choice that cannot be undone." : `The forces of ${chapter.name} execute a prepared formation.`, ...(enemyIds ? { enemyIds } : {}), ...(eventId ? { eventId } : {}), reward: reward(number, type === "boss") }], dropTable: [] });
  return { id: chapter.id, name: chapter.name, description: `A five-part endgame assault where enemies restore one another, weaponize debilitating curses, and refuse ordinary death.`, recommendedLevel: chapter.level, prerequisiteAdventureId: chapter.prerequisite, theme: "custom", cardImageUrl: `/assets/backgrounds/${chapter.card}`, combatBackgroundUrl: `/assets/backgrounds/${chapter.bg}`, travelText: chapter.travel, completionTitle: chapter.completion[0], completionDescription: chapter.completion[1], stages: [
    stage(1, "The Outer Threshold", "combat", [ids[0], ids[1]]),
    stage(2, "The Returning Guard", "combat", [ids[2], ids[0], ids[3]]),
    stage(3, "The Remnant's Choice", "event", null, chapter.event),
    stage(4, "The Deathless Formation", "combat", [ids[2], ids[1], ids[3]]),
    stage(5, `Heart of ${chapter.name}`, "boss", [ids[4], ids[2], ids[chapter.n % 2 ? 0 : 3]]),
  ] };
});

const newSets = setDefs.map((set) => ({ id: set.id, name: set.name, pieceCount: 7, bonuses: set.bonuses.map(([requiredPieces, description, passive]) => ({ requiredPieces, description, passive, ...(requiredPieces === 7 ? { specialEffectNotes: `${set.name}'s class-defining seven-piece effect.` } : {}) })) }));
const iconEntries = Object.fromEntries(setItems.map((item) => [item.id, item.iconUrl]));

async function insertBefore(file, marker, addition, guard) {
  const filename = source(file);
  const text = await readFile(filename, "utf8");
  if (text.includes(guard)) return;
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const fileMarker = marker.replaceAll("\n", newline);
  const fileAddition = addition.replaceAll("\n", newline);
  const index = text.indexOf(fileMarker);
  if (index < 0) throw new Error(`Marker not found in ${file}: ${marker}`);
  await writeFile(filename, `${text.slice(0, index)}${fileAddition}${text.slice(index)}`, "utf8");
}

await insertBefore("src/game/content/enemies.ts", "\n};\n", `,\n${json(newEnemies).slice(2, -2)}\n`, '"enemy-a13-hourglass-revenant"');
await insertBefore("src/game/content/adventures.ts", "\n};\n\nexport const ADVENTURES", `,\n${json(newEvents).slice(2, -2)}\n`, '"event-a13-broken-hour"');
await insertBefore("src/game/content/adventures.ts", "\n];\n\nexport const ENDLESS_ADVENTURE", `,\n${json(newAdventures).slice(2, -2)}\n`, '"id": "sepulcher-of-hours"');
await insertBefore("src/game/content/gear.ts", "\n  // SHOP PROGRESSION END", `\n${json(setItems).slice(2, -2)}\n`, '"gear-endgame-eclipsed-oath-head"');
await insertBefore("src/game/content/gear.ts", "\n  // SHOP PROGRESSION SETS START", `\n${json(newSets).slice(2, -2)},\n`, '"id": "set-eclipsed-oath"');
await insertBefore("src/game/itemIcons.ts", "\n  // SHOP PROGRESSION ICONS END", `\n${json(iconEntries).slice(2, -2)}\n`, '"gear-endgame-eclipsed-oath-head"');

console.log(`Added ${Object.keys(newEnemies).length} enemies, ${newAdventures.length} adventures, ${Object.keys(newEvents).length} events, ${setItems.length} items, and ${newSets.length} sets.`);
