import { readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";
import ts from "typescript";

const lateAdventureIds = new Set([
  "mirefen-marsh",
  "ashen-foundry",
  "sunken-reliquary",
  "nightglass-citadel",
  "frostbound-expanse",
  "stormspire-aerie",
  "hollow-crown",
  "astral-scar",
  "world-below",
]);
const latePrefixes = Array.from({ length: 9 }, (_, index) => index + 4).flatMap((number) => [
  `enemy-a${number}-`,
  `item-a${number}-`,
  `gear-a${number}-`,
  `set-a${number}-`,
  `consumable-a${number}-`,
  `event-a${number}-`,
]);
const isLateId = (id) => latePrefixes.some((prefix) => id.startsWith(prefix)) || lateAdventureIds.has(id);

const ENEMY_DEFENSE_BONUSES = {
  5: { armor: 10, magicResistance: 10 },
  6: { armor: 20, magicResistance: 15 },
  7: { armor: 25, magicResistance: 20 },
  8: { armor: 30, magicResistance: 30 },
  9: { armor: 35, magicResistance: 35 },
  10: { armor: 10, magicResistance: 50 },
  11: { armor: 50, magicResistance: 10 },
  12: { armor: 100, magicResistance: 100 },
};

async function loadModule(entryPoint) {
  const result = await build({ entryPoints: [entryPoint], bundle: true, platform: "node", format: "esm", write: false });
  const source = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

function variableInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return declaration.initializer;
    }
  }
  throw new Error(`Could not locate ${name}.`);
}

async function replaceInitializers(path, replacements) {
  const source = await readFile(path, "utf8");
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits = Object.entries(replacements).map(([name, value]) => {
    const initializer = variableInitializer(sourceFile, name);
    return { start: initializer.getStart(sourceFile), end: initializer.getEnd(), text: JSON.stringify(value, null, 2) };
  });
  const updated = edits.sort((a, b) => b.start - a.start).reduce((text, edit) => text.slice(0, edit.start) + edit.text + text.slice(edit.end), source);
  await writeFile(path, updated, "utf8");
}

const specs = [
  {
    number: 4, id: "mirefen-marsh", name: "Mirefen Marsh", level: 13, stages: 12, prerequisite: "highfall-mountains",
    description: "Black water, drowned causeways, and venomous nests choke the southern Mirefen. Every safe foothold has teeth.",
    travelText: "Following the lantern road into Mirefen Marsh", completionTitle: "The Brood Falls Silent",
    completionDescription: "Vespara sinks beneath the black water. The reed paths clear, and Mirefen's lanterns burn safely again.",
    bossDescription: "The black water trembles as Vespara hauls her vast brood from the drowned nest, venom hissing from every fang.",
    cardImageUrl: "/assets/backgrounds/mirefen-marsh-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/mirefen-marsh-edge.webp",
    accent: "#5f8a58", statuses: ["poison", "wet"], materials: [
      ["bog-iron", "Bog Iron", "/assets/items/iron-ore.webp"],
      ["venom-sac", "Venom Sac", "/assets/items/poison-gland.webp"],
      ["mire-reed", "Mire Reed", "/assets/items/moonpetal.webp"],
    ],
    enemies: [
      ["reed-stalker", "Reed Stalker", "A long-limbed marsh predator camouflaged with reeds and algae.", "physical", "poison"],
      ["bog-leech", "Bog Leech", "A horse-sized black leech swollen with stolen blood.", "physical", "bleed"],
      ["mirefen-spitter", "Mirefen Spitter", "A squat amphibian that spits luminous venom from the fog.", "spell", "poison"],
      ["drowned-warden", "Drowned Warden", "A rusted marsh sentinel animated by the water in its armor.", "physical", "wet"],
      ["fen-witch", "Fen Witch", "A reed-cloaked witch carrying jars of venom and marshfire.", "spell", "weaken"],
      ["brood-guard", "Brood Guard", "A plated swamp arachnid bred to shield the nest.", "physical", "guard"],
      ["vespara-broodmother", "Vespara, Broodmother", "A colossal venom spider queen rising from a drowned nest.", "hybrid", "poison"],
    ],
    sets: [
      ["fenwarden", "Fenwarden", "plate", "strength", "poison"],
      ["mirestalker", "Mirestalker", "leather", "agility", "poison"],
    ],
    weapons: [["bogcleaver", "Bogcleaver", "axe", "oneHand", "physical"], ["witchlight-wand", "Witchlight Wand", "wand", "mainHand", "magical"]],
  },
  {
    number: 5, id: "ashen-foundry", name: "Ashen Foundry", level: 18, stages: 13, prerequisite: "mirefen-marsh",
    description: "An abandoned dwarven foundry has awakened beneath the ash fields, feeding armor and souls into an endless furnace.",
    travelText: "Crossing the ash fields toward the old foundry", completionTitle: "The Furnace Cools",
    completionDescription: "The Furnace Tyrant cracks apart and the foundry's great bellows fall still. For the first time in an age, clean air enters the halls.",
    bossDescription: "The foundry doors glow white-hot as the Furnace Tyrant tears free of its chains, each footfall ringing like a hammer blow.",
    cardImageUrl: "/assets/backgrounds/ashen-foundry-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/ashen-foundry-edge.webp",
    accent: "#a75835", statuses: ["burn", "charred"], materials: [
      ["cindersteel", "Cindersteel Ore", "/assets/items/copper-ore.webp"],
      ["ember-fragment", "Ember Core Fragment", "/assets/items/ember-core.webp"],
      ["sootweave", "Sootweave", "/assets/items/fine-cloth.webp"],
    ],
    enemies: [
      ["ash-hound", "Ash Hound", "A coal-black hunting beast with fire leaking between its ribs.", "physical", "burn"],
      ["cinder-smith", "Cinder Smith", "A masked forge cultist swinging a white-hot hammer.", "physical", "charred"],
      ["slag-elemental", "Slag Elemental", "A hulking body of molten iron and cooling stone.", "spell", "burn"],
      ["furnace-acolyte", "Furnace Acolyte", "A soot-robed channeler feeding spells into the foundry fires.", "spell", "enlightened"],
      ["ironbound-overseer", "Ironbound Overseer", "A heavily plated taskmaster with a chain flail.", "physical", "guard"],
      ["spark-swarm", "Spark Swarm", "A cloud of hungry forge spirits moving like embers in a gale.", "spell", "burn"],
      ["furnace-tyrant", "The Furnace Tyrant", "A towering iron golem crowned by a roaring furnace.", "hybrid", "burn"],
    ],
    sets: [
      ["emberforged", "Emberforged", "plate", "strength", "burn"],
      ["cinderweave", "Cinderweave", "cloth", "intelligence", "burn"],
    ],
    weapons: [["foundry-maul", "Foundry Maul", "mace", "twoHand", "physical"], ["cinderbrand", "Cinderbrand", "sword", "oneHand", "physical"]],
  },
  {
    number: 6, id: "sunken-reliquary", name: "Sunken Reliquary", level: 23, stages: 14, prerequisite: "ashen-foundry",
    description: "Tidal caverns expose a drowned temple where relic wards still hum beneath the surf and dead priests whisper through bronze masks.",
    travelText: "Descending with the tide into the Sunken Reliquary", completionTitle: "The Last Prophecy Drowned",
    completionDescription: "Nhalos releases the relic and the temple wards dim. The tide retreats, leaving the ancient road open.",
    bossDescription: "Nhalos rises above the storm-filled font, bronze masks chanting his final prophecy through mouths full of seawater.",
    cardImageUrl: "/assets/backgrounds/sunken-reliquary-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/sunken-reliquary-edge.webp",
    accent: "#397f91", statuses: ["wet", "electrified"], materials: [
      ["abyssal-pearl", "Abyssal Pearl", "/assets/items/arcane-crystal.webp"],
      ["relic-shard", "Drowned Relic Shard", "/assets/items/bone-fragments.webp"],
      ["tideglass", "Tideglass", "/assets/items/frost-shard.webp"],
    ],
    enemies: [
      ["brine-crawler", "Brine Crawler", "A many-legged shell beast plated in salt-crusted bronze.", "physical", "wet"],
      ["drowned-acolyte", "Drowned Acolyte", "A drowned priest chanting through a sealed bronze mask.", "spell", "wet"],
      ["relic-sentinel", "Relic Sentinel", "An ancient temple automaton lit by blue warding runes.", "hybrid", "barrier"],
      ["shock-eel", "Vault Shock Eel", "A levitating abyssal eel wrapped in snapping current.", "spell", "electrified"],
      ["tidebound-knight", "Tidebound Knight", "A barnacled knight dragging a coral-edged greatsword.", "physical", "shatter"],
      ["siren-oracle", "Siren Oracle", "A pale oracle whose song turns water into lightning.", "spell", "wet"],
      ["nhalos-drowned-seer", "Nhalos, the Drowned Seer", "A many-armed drowned prophet floating above a storm-filled font.", "hybrid", "electrified"],
    ],
    sets: [
      ["depthguard", "Depthguard", "plate", "vitality", "wet"],
      ["tidecaller", "Tidecaller", "cloth", "intelligence", "electrified"],
    ],
    weapons: [["tidebreaker", "Tidebreaker", "polearm", "twoHand", "physical"], ["oracle-tome", "Oracle's Tide Tome", "tome", "offHand", "magical"]],
  },
  {
    number: 7, id: "nightglass-citadel", name: "Nightglass Citadel", level: 28, stages: 15, prerequisite: "sunken-reliquary",
    description: "A fortress of black glass reflects paths that do not exist. Assassins and bloodbound knights hunt between its mirrored halls.",
    travelText: "Climbing the moonlit road to Nightglass Citadel", completionTitle: "Every Mirror Broken",
    completionDescription: "Lady Noctra's final reflection splinters. Dawn crosses the citadel walls and the hidden road beyond appears.",
    bossDescription: "Every mirror shows Lady Noctra smiling—then six reflections step through the glass and draw their blades as one.",
    cardImageUrl: "/assets/backgrounds/nightglass-citadel-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/nightglass-citadel-edge.webp",
    accent: "#65518c", statuses: ["stealth", "blind"], materials: [
      ["nightglass", "Nightglass Shard", "/assets/items/arcane-crystal.webp"],
      ["umbral-silk", "Umbral Silk", "/assets/items/spider-silk.webp"],
      ["bloodstone", "Bloodstone", "/assets/items/gold-ore.webp"],
    ],
    enemies: [
      ["mirror-stalker", "Mirror Stalker", "A masked assassin stepping between black mirrors.", "physical", "stealth"],
      ["gloom-archer", "Gloom Archer", "A silent marksman firing arrows made from reflected moonlight.", "physical", "blind"],
      ["bloodbound-knight", "Bloodbound Knight", "A crimson-armored duelist who grows stronger through wounds.", "physical", "bleed"],
      ["shard-magus", "Shard Magus", "A court mage shaping razor-edged panes of dark glass.", "spell", "shatter"],
      ["veil-dancer", "Veil Dancer", "A whirling killer wrapped in ribbons of living shadow.", "physical", "evasion"],
      ["reflection-wraith", "Reflection Wraith", "A stolen reflection that moves before its victim does.", "spell", "weaken"],
      ["lady-noctra", "Lady Noctra, the Last Reflection", "The citadel's immortal mistress surrounded by six mirrored selves.", "hybrid", "stealth"],
    ],
    sets: [
      ["nightglass", "Nightglass", "leather", "agility", "stealth"],
      ["bloodbound", "Bloodbound", "plate", "strength", "bleed"],
    ],
    weapons: [["mirrorfang", "Mirrorfang", "dagger", "oneHand", "physical"], ["eclipse-staff", "Eclipse Staff", "staff", "twoHand", "magical"]],
  },
  {
    number: 8, id: "frostbound-expanse", name: "Frostbound Expanse", level: 34, stages: 16, prerequisite: "nightglass-citadel",
    description: "Beyond the citadel lies a white waste where the wind freezes thought itself and ancient beasts wake beneath blue ice.",
    travelText: "Following the aurora across the Frostbound Expanse", completionTitle: "The White Maw Shattered",
    completionDescription: "Skara's roar collapses into drifting snow. The aurora steadies and a safe passage opens through the ice.",
    bossDescription: "The glacier splits beneath a roar, and Skara erupts from the ancient ice with winter burning in her jaws.",
    cardImageUrl: "/assets/backgrounds/frostbound-expanse-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/frostbound-expanse-edge.webp",
    accent: "#71a8c8", statuses: ["cold", "frozen"], materials: [
      ["rimebone", "Rimebone", "/assets/items/bone-fragments.webp"],
      ["frostheart", "Frostheart Crystal", "/assets/items/frost-shard.webp"],
      ["white-pelt", "White Pelt", "/assets/items/fur.webp"],
    ],
    enemies: [
      ["rime-wolf", "Rime Wolf", "A huge white wolf leaving frost in every footprint.", "physical", "cold"],
      ["icebound-raider", "Icebound Raider", "A nomad warrior armored in blue ice and white fur.", "physical", "shatter"],
      ["aurora-wisp", "Aurora Wisp", "A ribbon of living light pulsing with glacial magic.", "spell", "cold"],
      ["frost-hermit", "Frost Hermit", "A weathered seer carrying a staff carved from rimebone.", "spell", "frozen"],
      ["glacier-golem", "Glacier Golem", "A moving wall of ancient ice and trapped stone.", "physical", "guard"],
      ["snowblind-harrier", "Snowblind Harrier", "A pale winged hunter that vanishes inside the blizzard.", "physical", "blind"],
      ["skara-white-maw", "Skara, the White Maw", "A primordial frost wyrm bursting from beneath the glacier.", "hybrid", "frozen"],
    ],
    sets: [
      ["rimeguard", "Rimeguard", "plate", "vitality", "frozen"],
      ["winterweave", "Winterweave", "cloth", "intelligence", "cold"],
    ],
    weapons: [["white-maw-axe", "White Maw Greataxe", "axe", "twoHand", "physical"], ["aurora-wand", "Aurora Wand", "wand", "mainHand", "magical"]],
  },
  {
    number: 9, id: "stormspire-aerie", name: "Stormspire Aerie", level: 40, stages: 17, prerequisite: "frostbound-expanse",
    description: "Stone bridges climb into a permanent storm where sky cults chain lightning to the peaks and thunderbirds guard the final ascent.",
    travelText: "Ascending the chain bridges of Stormspire", completionTitle: "The Storm Unbound",
    completionDescription: "Vaelith's chains break and the storm rolls away from the peak. The road to the Hollow Crown stands revealed.",
    bossDescription: "Lightning crowns Vaelith as the chained colossus spreads its wings, turning the summit sky black from edge to edge.",
    cardImageUrl: "/assets/backgrounds/stormspire-aerie-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/stormspire-aerie-edge.webp",
    accent: "#547cb8", statuses: ["electrified", "stunned"], materials: [
      ["skyiron", "Skyiron", "/assets/items/silver-ore.webp"],
      ["storm-core", "Condensed Storm Essence", "/assets/items/storm-essence.webp"],
      ["cloudfeather", "Cloudfeather", "/assets/items/fine-cloth.webp"],
    ],
    enemies: [
      ["thunder-talon", "Thunder Talon", "A giant cliff raptor with lightning crawling across its feathers.", "physical", "electrified"],
      ["spire-zealot", "Spire Zealot", "A chain-armored cultist wielding a forked spear.", "physical", "electrified"],
      ["storm-channeler", "Storm Channeler", "A robed mage drawing current directly from the clouds.", "spell", "electrified"],
      ["cloud-djinn", "Cloud Djinn", "A laughing storm spirit bound inside rings of skyiron.", "spell", "evasion"],
      ["thunderhead-colossus", "Thunderhead Colossus", "A floating giant assembled from storm stone and cloud.", "hybrid", "guard"],
      ["chainwing-matron", "Chainwing Matron", "An armored harpy carrying hooked lightning chains.", "physical", "stunned"],
      ["vaelith-tempest-roc", "Vaelith, the Tempest Roc", "A colossal thunderbird chained to the crown of Stormspire.", "hybrid", "electrified"],
    ],
    sets: [
      ["stormrunner", "Stormrunner", "leather", "agility", "electrified"],
      ["tempest-sage", "Tempest Sage", "cloth", "intelligence", "electrified"],
    ],
    weapons: [["skybreaker", "Skybreaker Spear", "polearm", "twoHand", "physical"], ["stormcallers-tome", "Stormcaller's Tome", "tome", "offHand", "magical"]],
  },
  {
    number: 10, id: "hollow-crown", name: "The Hollow Crown", level: 46, stages: 18, prerequisite: "stormspire-aerie",
    description: "At the world's broken summit, a dead kingdom repeats its final night beneath an empty crown and a sun that never rises.",
    travelText: "Walking the silent causeway to the Hollow Crown", completionTitle: "A Crown Without a King",
    completionDescription: "Aldren's hollow crown strikes the floor and breaks. The false night lifts from Arkenfall, though deeper doors remain sealed.",
    bossDescription: "Aldren rises with the broken throne fused to his bones, and every dead courtier bows as the hollow crown ignites.",
    cardImageUrl: "/assets/backgrounds/hollow-crown-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/hollow-crown-edge.webp",
    accent: "#8e714a", statuses: ["vulnerable", "arcaneWound"], materials: [
      ["hollowsteel", "Hollowsteel", "/assets/items/gold-ore.webp"],
      ["crown-shard", "Crown Shard", "/assets/items/arcane-crystal.webp"],
      ["soul-ash", "Soul Ash", "/assets/items/coal.webp"],
    ],
    enemies: [
      ["crownless-guard", "Crownless Guard", "A royal guard whose empty armor still kneels to the throne.", "physical", "guard"],
      ["ashen-confessor", "Ashen Confessor", "A dead priest carrying censers filled with memories.", "spell", "burn"],
      ["veilbound-executioner", "Veilbound Executioner", "A hooded giant whose axe cuts flesh and reflection alike.", "physical", "bleed"],
      ["hollow-courtier", "Hollow Courtier", "A smiling revenant whispering curses from behind a golden mask.", "spell", "weaken"],
      ["crown-seraph", "Crown Seraph", "A six-winged construct of bone, gold, and cold fire.", "hybrid", "vulnerable"],
      ["royal-shadow", "The Royal Shadow", "The king's severed shadow, armed with every betrayal of the court.", "physical", "stealth"],
      ["aldren-hollow-king", "Aldren, the Hollow King", "An ancient king fused to a broken throne and an empty halo.", "hybrid", "vulnerable"],
    ],
    sets: [
      ["crownless", "Crownless", "plate", "strength", "guard"],
      ["veilborn", "Veilborn", "leather", "agility", "poison"],
      ["ashen-oracle", "Ashen Oracle", "cloth", "intelligence", "burn"],
    ],
    weapons: [["crown-sunder", "Crown-Sunder", "sword", "oneHand", "physical"], ["last-oracle-staff", "Staff of the Last Oracle", "staff", "twoHand", "magical"]],
  },
  {
    number: 11, id: "astral-scar", name: "The Astral Scar", level: 49, stages: 20, prerequisite: "hollow-crown",
    description: "Beyond the Hollow Crown, a fallen star has split an ancient observatory open. Gravity twists, constellations bleed, and pilgrims kneel to something burning beneath the crater.",
    travelText: "Crossing the broken causeway toward the Astral Scar", completionTitle: "The Fallen Star Extinguished",
    completionDescription: "Seraphel collapses into a rain of quiet embers. The observatory steadies, and a stair older than the stars opens beneath the crater.",
    bossDescription: "The crater bends around Seraphel as the fallen giant strains against its star-metal chains and reaches for the sky it shattered.",
    cardImageUrl: "/assets/backgrounds/astral-scar-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/astral-scar-edge.webp",
    accent: "#8c69c7", statuses: ["arcaneWound", "blind"], materials: [
      ["star-metal", "Star Metal", "/assets/items/silver-ore.webp"],
      ["astral-glass", "Astral Glass", "/assets/items/arcane-crystal.webp"],
      ["comet-silk", "Comet Silk", "/assets/items/fine-cloth.webp"],
    ],
    enemies: [
      ["starved-pilgrim", "Starved Pilgrim", "A hollow-eyed pilgrim whose prayer beads orbit a gravity wound.", "physical", "vulnerable"],
      ["glasswing-moth", "Glasswing Moth", "A great lunar moth scattering blinding dust from translucent wings.", "spell", "blind"],
      ["fallen-astrologer", "Fallen Astrologer", "An observatory sage branded with constellations that no longer exist.", "spell", "arcaneWound"],
      ["comet-hound", "Comet Hound", "A lean celestial predator with molten stone burning beneath its hide.", "physical", "burn"],
      ["gravity-warden", "Gravity Warden", "A black-armored sentinel bending the crater floor around its shield.", "hybrid", "slowed"],
      ["astral-devourer", "Astral Devourer", "A many-jawed void beast feeding on light and memory.", "spell", "weaken"],
      ["seraphel-fallen-star", "Seraphel, the Fallen Star", "A wounded celestial giant chained inside the crater it created.", "hybrid", "arcaneWound"],
    ],
    sets: [
      ["starforged", "Starforged", "plate", "vitality", "barrier"],
      ["voidstrider", "Voidstrider", "leather", "agility", "stealth"],
      ["astral-savant", "Astral Savant", "cloth", "intelligence", "arcaneWound"],
    ],
    weapons: [["cometfall", "Cometfall", "mace", "twoHand", "physical"], ["orrery-staff", "Staff of the Last Orrery", "staff", "twoHand", "magical"]],
  },
  {
    number: 12, id: "world-below", name: "The World Below", level: 50, stages: 22, prerequisite: "astral-scar",
    description: "The stair beneath the fallen star descends beyond every map. Here the roots of Arkenfall coil around a sealed hunger, and the first voices still remember how the world was made.",
    travelText: "Descending the endless stair into the World Below", completionTitle: "The First Hunger Bound",
    completionDescription: "Eidolon is driven back behind the First Gate. The roots of Arkenfall close around the wound, and the deep voices fall silent—for now.",
    bossDescription: "The First Gate buckles inward. Countless limbs claw into the chamber as Eidolon speaks your name in the voice of a starving world.",
    cardImageUrl: "/assets/backgrounds/world-below-adventure.webp", combatBackgroundUrl: "/assets/backgrounds/world-below-edge.webp",
    accent: "#b17a43", statuses: ["vulnerable", "weaken"], materials: [
      ["worldroot-heartwood", "Worldroot Heartwood", "/assets/items/hardwood.webp"],
      ["first-echo", "First Echo", "/assets/items/arcane-crystal.webp"],
      ["abyssal-hide", "Abyssal Hide", "/assets/items/monster-hide.webp"],
    ],
    enemies: [
      ["rootless-titan", "Rootless Titan", "A stone colossus torn free from the roots that once restrained it.", "physical", "guard"],
      ["pale-burrower", "Pale Burrower", "A blind plated horror that listens for heartbeats through the rock.", "physical", "bleed"],
      ["deep-oracle", "Deep Oracle", "A many-eyed prophet speaking with the voice of buried ages.", "spell", "blind"],
      ["worldvein-elemental", "Worldvein Elemental", "Living magma and root sap forced into a towering shape.", "hybrid", "burn"],
      ["firstborn-shade", "Firstborn Shade", "The shadow of a creature erased before history began.", "physical", "stealth"],
      ["abyssal-choir", "Abyssal Choir", "A ring of faceless singers whose harmony unravels courage.", "spell", "weaken"],
      ["eidolon-first-hunger", "Eidolon, the First Hunger", "An ancient devourer pressing its countless limbs through the First Gate.", "hybrid", "vulnerable"],
    ],
    sets: [
      ["worldroot-bastion", "Worldroot Bastion", "plate", "strength", "guard"],
      ["deepstalker", "Deepstalker", "leather", "agility", "bleed"],
      ["first-tongue", "First Tongue", "cloth", "intelligence", "vulnerable"],
    ],
    weapons: [["worldsplitter", "Worldsplitter", "axe", "twoHand", "physical"], ["voice-below", "Voice of the World Below", "tome", "offHand", "magical"]],
  },
];

const rarityFor = (number) => number >= 8 ? "epic" : number === 4 ? "uncommon" : "rare";
const itemRarityFor = (number) => number >= 11 ? "legendary" : rarityFor(number);
const materialRarityFor = (number) => number >= 11 ? "epic" : rarityFor(number);
const gearIcon = (slot, material, index) => slot === "ring"
  ? `/assets/gear-icons/ring-0${(index % 5) + 1}.webp`
  : `/assets/gear-icons/${slot === "head" ? "head" : slot}-0${(index % 5) + 1}.webp`;
const weaponIcon = (kind, index) => `/assets/gear-icons/${kind}-0${(index % 5) + 1}.webp`;
const enemyId = (spec, slug) => `enemy-a${spec.number}-${slug}`;
const materialId = (spec, slug) => `item-a${spec.number}-${slug}`;

function passiveSpecial(setSlug, status, material) {
  if (setSlug === "fenwarden") return { statusImmunities: ["poison"], bleedDamageReduction: 0.2 };
  if (setSlug === "mirestalker") return { statusApplicationStacks: { poison: 1 }, statusDamage: { poison: 0.25 } };
  if (setSlug === "emberforged") return { statusImmunities: ["burn"], startingAbsorptionMaxHpRatios: { guard: 0.12 } };
  if (setSlug === "cinderweave") return { statusDamage: { burn: 0.35 }, statusDamageLeech: { burn: 0.1 } };
  if (setSlug === "depthguard") return { statusImmunities: ["wet"], startingAbsorptionMaxHpRatios: { barrier: 0.15 } };
  if (setSlug === "tidecaller") return { statusApplicationCompanions: { wet: ["electrified"] }, statusDurationBonuses: { electrified: 1 } };
  if (setSlug === "nightglass") return { dodgeChance: 0.08, startingStatuses: [{ id: "stealth", name: "Stealth", kind: "buff", duration: 2, stacks: 1, description: "Cannot be targeted by enemies. Ends after attacking or taking damage." }] };
  if (setSlug === "bloodbound") return { statusDamage: { bleed: 0.35 }, statusDamageLeech: { bleed: 0.15 } };
  if (setSlug === "rimeguard") return { statusImmunities: ["cold", "frozen"], incomingDamageMultiplierWhileStunned: 0.7 };
  if (setSlug === "winterweave") return { statusApplicationCompanionChances: { cold: [{ status: "frozen", chance: 0.15 }] }, statusDamage: { cold: 0.25 } };
  if (setSlug === "stormrunner") return { statusDurationBonuses: { electrified: 1 }, dodgeChance: 0.1 };
  if (setSlug === "tempest-sage") return { statusApplicationStacks: { electrified: 1 }, magicalPowerMultiplier: 0.12 };
  if (setSlug === "crownless") return { startingAbsorptionMaxHpRatios: { guard: 0.2 }, guardGeneration: 0.25 };
  if (setSlug === "veilborn") return { statusApplicationStacks: { poison: 1 }, statusDamageLeech: { poison: 0.2 } };
  if (setSlug === "ashen-oracle") return { statusApplicationCompanions: { burn: ["arcaneWound"] }, statusDamage: { burn: 0.4 } };
  if (setSlug === "starforged") return { statusImmunities: ["arcaneWound"], startingAbsorptionMaxHpRatios: { barrier: 0.22 } };
  if (setSlug === "voidstrider") return { statusImmunities: ["blind"], dodgeChance: 0.12 };
  if (setSlug === "astral-savant") return { statusApplicationStacks: { arcaneWound: 1 }, magicalPowerMultiplier: 0.16 };
  if (setSlug === "worldroot-bastion") return { startingAbsorptionMaxHpRatios: { guard: 0.25 }, guardGeneration: 0.35 };
  if (setSlug === "deepstalker") return { statusDamage: { bleed: 0.45 }, statusDamageLeech: { bleed: 0.2 } };
  if (setSlug === "first-tongue") return { statusDurationBonuses: { vulnerable: 1 }, magicalPowerMultiplier: 0.18 };
  return { statusDamage: { [status]: 0.25 } };
}

function finalDescription(setSlug) {
  const descriptions = {
    fenwarden: "Venom cannot afflict you, and Bleed deals 20% less damage.",
    mirestalker: "Whenever you apply Poison, apply 1 additional stack; your Poison deals 25% more damage.",
    emberforged: "Burn cannot afflict you, and begin each combat with Guard equal to 12% of maximum Health.",
    cinderweave: "Your Burn deals 35% more damage and restores Health equal to 10% of its damage.",
    depthguard: "Wet cannot afflict you, and begin each combat with Barrier equal to 15% of maximum Health.",
    tidecaller: "Applying Wet also applies Electrified, and your Electrified lasts 1 additional turn.",
    nightglass: "Begin combat in Stealth and gain +8% Dodge Chance.",
    bloodbound: "Your Bleed deals 35% more damage and restores Health equal to 15% of its damage.",
    rimeguard: "Cold and Frozen cannot afflict you, and you take 30% less damage while Stunned.",
    winterweave: "Applying Cold has a 15% chance to also Freeze, and your Cold effects deal 25% more damage.",
    stormrunner: "Your Electrified lasts 1 additional turn and you gain +10% Dodge Chance.",
    "tempest-sage": "Whenever you apply Electrified, apply 1 additional stack; gain 12% more Spell Power.",
    crownless: "Begin combat with Guard equal to 20% of maximum Health and generate 25% more Guard.",
    veilborn: "Whenever you apply Poison, apply 1 additional stack; Poison restores Health equal to 20% of its damage.",
    "ashen-oracle": "Applying Burn also applies Arcane Wound, and your Burn deals 40% more damage.",
    starforged: "Arcane Wound cannot afflict you, and begin combat with Barrier equal to 22% of maximum Health.",
    voidstrider: "Blind cannot afflict you, and gain +12% Dodge Chance.",
    "astral-savant": "Whenever you apply Arcane Wound, apply 1 additional stack; gain 16% more Spell Power.",
    "worldroot-bastion": "Begin combat with Guard equal to 25% of maximum Health and generate 35% more Guard.",
    deepstalker: "Your Bleed deals 45% more damage and restores Health equal to 20% of its damage.",
    "first-tongue": "Your Vulnerable lasts 1 additional turn; gain 18% more Spell Power.",
  };
  return descriptions[setSlug];
}

function buildSetsAndGear(spec) {
  const sets = [];
  const items = [];
  const rarity = itemRarityFor(spec.number);
  const scale = 2 + (spec.number - 4) * 2;
  const materialIds = spec.materials.map(([slug]) => materialId(spec, slug));
  spec.sets.forEach(([slug, name, material, attribute, status], setIndex) => {
    const setId = `set-a${spec.number}-${slug}`;
    const powerField = material === "cloth" ? "magicalPower" : "physicalPower";
    const fourPiecePassive = ["poison", "burn", "bleed"].includes(status)
      ? { statusDamage: { [status]: (12 + spec.number * 2) / 100 } }
      : status === "guard"
        ? { guardGeneration: (12 + spec.number * 2) / 100 }
        : status === "stealth"
          ? { dodgeChance: 0.06 }
          : { statusDurationBonuses: { [status]: 1 } };
    const fourPieceDescription = ["poison", "burn", "bleed"].includes(status)
      ? `Your ${status[0].toUpperCase()}${status.slice(1)} deals ${12 + spec.number * 2}% more damage.`
      : status === "guard"
        ? `Generate ${12 + spec.number * 2}% more Guard.`
        : status === "stealth"
          ? "+6% Dodge Chance."
          : `Your ${status[0].toUpperCase()}${status.slice(1)} lasts 1 additional turn.`;
    sets.push({
      id: setId,
      name,
      pieceCount: 5,
      bonuses: [
        { requiredPieces: 2, description: `+${scale} ${attribute[0].toUpperCase()}${attribute.slice(1)}.`, passive: { stats: { [attribute]: scale } } },
        { requiredPieces: 3, description: `+${scale + 2} ${powerField === "magicalPower" ? "Spell" : "Physical"} Power.`, passive: { [powerField]: scale + 2 } },
        { requiredPieces: 4, description: fourPieceDescription, passive: fourPiecePassive },
        { requiredPieces: 5, description: finalDescription(slug), passive: passiveSpecial(slug, status, material) },
      ],
    });
    const slots = ["head", "chest", "pants", "boots", "ring"];
    const pieceNames = material === "plate" ? ["Helm", "Cuirass", "Greaves", "Sabatons", "Signet"] : material === "leather" ? ["Cowl", "Jerkin", "Legwraps", "Treads", "Band"] : ["Hood", "Robes", "Leggings", "Slippers", "Loop"];
    slots.forEach((slot, pieceIndex) => {
      const secondary = material === "plate" ? "vitality" : material === "leather" ? "luck" : "vitality";
      const stats = { [attribute]: Math.max(1, Math.floor(scale / 2) + (pieceIndex === 1 ? 1 : 0)), [secondary]: Math.max(1, Math.floor(scale / 3)) };
      const item = {
        kind: "gear",
        id: `gear-a${spec.number}-${slug}-${slot}`,
        name: `${name} ${pieceNames[pieceIndex]}`,
        goldCost: 80 + spec.number * 35 + pieceIndex * 8,
        slot,
        ...(slot !== "ring" ? { armorMaterial: material } : {}),
        rarity,
        description: `A ${rarity} ${slot === "ring" ? "ring" : material} piece shaped by the dangers of ${spec.name}.`,
        iconUrl: gearIcon(slot, material, setIndex + pieceIndex),
        stats,
        ...(material === "plate" ? { armor: 2 + Math.floor(spec.number / 2) + (slot === "chest" ? 2 : 0) } : {}),
        ...(material === "cloth" ? { magicResistance: 2 + Math.floor(spec.number / 2) + (slot === "chest" ? 2 : 0) } : {}),
        ...(material === "leather" ? { combat: { passive: { dodgeChance: 0.01 * (1 + Math.floor((spec.number - 4) / 2)) } } } : {}),
        set: setId,
        setName: name,
        arkenfallVendor: null,
        vendorPrerequisiteAdventureId: null,
        craftingRecipe: slot === "ring" ? {
          station: material === "plate" ? "jeweler" : material === "leather" ? "leatherworker" : "tailor",
          ingredients: [{ itemId: materialIds[0], quantity: 4 + spec.number }, { itemId: materialIds[1], quantity: 2 + setIndex }, { itemId: materialIds[2], quantity: 3 }],
          prerequisiteAdventureId: spec.id,
        } : null,
      };
      items.push(item);
    });
  });
  spec.weapons.forEach(([slug, name, kind, equipType, power], index) => {
    const isMagical = power === "magical";
    items.push({
      kind: "gear",
      id: `gear-a${spec.number}-${slug}`,
      name,
      goldCost: 140 + spec.number * 45,
      slot: equipType === "offHand" ? "offHand" : "mainHand",
      weaponEquipType: equipType,
      weaponKind: kind,
      rarity,
      description: `${name} carries the hard-won power of ${spec.name}.`,
      iconUrl: weaponIcon(kind, spec.number + index),
      stats: isMagical ? { intelligence: Math.ceil(scale / 2) } : { strength: Math.ceil(scale / 2) },
      ...(isMagical ? { magicalPower: scale * 2 + 4 } : { physicalPower: scale * 2 + 4 }),
      arkenfallVendor: null,
      vendorPrerequisiteAdventureId: null,
      craftingRecipe: {
        station: isMagical ? "jeweler" : "blacksmith",
        ingredients: [{ itemId: materialIds[0], quantity: 7 + spec.number }, { itemId: materialIds[1], quantity: 4 }, { itemId: materialIds[2], quantity: 4 }],
        prerequisiteAdventureId: spec.id,
      },
    });
  });
  return { sets, items };
}

function baseAbility(spec, enemy, index) {
  const [slug, name, , power, status] = enemy;
  const flavorNames = {
    "a11-starved-pilgrim": ["Gravitic Cut", "Orbiting Ruin"],
    "a11-glasswing-moth": ["Prismatic Dust", "Glasswing Flurry"],
    "a11-fallen-astrologer": ["Forbidden Constellation", "Orrery Barrage"],
    "a11-comet-hound": ["Meteor Fang", "Comet Rush"],
    "a11-gravity-warden": ["Crushing Horizon", "Singularity Press"],
    "a11-astral-devourer": ["Consume Light", "Many-Jawed Hunger"],
    "a12-rootless-titan": ["Worldstone Blow", "Titan's Advance"],
    "a12-pale-burrower": ["Heartseeker Claw", "Burrowing Frenzy"],
    "a12-deep-oracle": ["Buried Revelation", "Prophetic Chorus"],
    "a12-worldvein-elemental": ["Worldvein Fist", "Magma Pulse"],
    "a12-firstborn-shade": ["Before Memory", "Nameless Assault"],
    "a12-abyssal-choir": ["Unraveling Hymn", "Fivefold Dirge"],
  };
  const [strikeName] = flavorNames[`a${spec.number}-${slug}`] ?? [];
  const scale = 1 + (spec.number - 4) * 0.08;
  const magical = power === "spell" || power === "hybrid";
  const damageType = status === "burn" || status === "charred" ? "fire"
    : status === "cold" || status === "frozen" ? "frost"
      : status === "electrified" || status === "stunned" ? "lightning"
        : status === "arcaneWound" ? "arcane"
        : magical ? "spell" : "physical";
  return {
    id: `enemy-ability-a${spec.number}-${slug}-strike`,
    name: strikeName ?? (magical ? "Ruinous Bolt" : "Savage Strike"),
    description: `Deals ${Math.round(scale * 100)}% ${magical ? "Spell" : "Physical"} Power as ${damageType === "physical" ? "Physical" : damageType[0].toUpperCase() + damageType.slice(1)} damage${["guard", "barrier", "stealth", "evasion", "enlightened"].includes(status) ? "" : ` and applies ${status[0].toUpperCase() + status.slice(1)}`}.`,
    energyCost: 2,
    cooldownTurns: 1,
    range: magical ? "ranged" : "melee",
    ...(magical ? { rangedPresentation: "projectile" } : {}),
    damageType,
    ...(magical ? { spellPowerScaling: scale } : { physicalPowerScaling: scale }),
    ...(!["guard", "barrier", "stealth", "evasion", "enlightened"].includes(status) ? { statusApplications: [{ status, stacks: 1, duration: 3 }] } : {}),
    vfx: magical ? (damageType === "lightning" ? "lightning_strike" : damageType === "frost" ? "frostbolt" : damageType === "fire" ? "fireball" : "enemy_hex") : "enemy_heavy_cleave",
  };
}

function utilityAbility(spec, enemy, index) {
  const [slug, name, , power, status] = enemy;
  const flavorNames = {
    "a11-starved-pilgrim": "Orbiting Ruin",
    "a11-glasswing-moth": "Glasswing Flurry",
    "a11-fallen-astrologer": "Orrery Barrage",
    "a11-comet-hound": "Comet Rush",
    "a11-gravity-warden": "Singularity Press",
    "a11-astral-devourer": "Many-Jawed Hunger",
    "a12-rootless-titan": "Titan's Advance",
    "a12-pale-burrower": "Burrowing Frenzy",
    "a12-deep-oracle": "Prophetic Chorus",
    "a12-worldvein-elemental": "Magma Pulse",
    "a12-firstborn-shade": "Nameless Assault",
    "a12-abyssal-choir": "Fivefold Dirge",
  };
  if (["guard", "barrier", "stealth", "evasion", "enlightened"].includes(status)) {
    return {
      id: `enemy-ability-a${spec.number}-${slug}-stance`,
      name: status === "guard" || status === "barrier" ? "Hold the Line" : status === "stealth" ? "Vanish" : status === "evasion" ? "Gale Step" : "Dark Insight",
      description: `Gains ${status[0].toUpperCase() + status.slice(1)}.`,
      energyCost: 1,
      cooldownTurns: 3,
      range: "melee",
      selfStatusApplications: [{ status, stacks: status === "guard" || status === "barrier" ? 8 + spec.number * 2 : 1, duration: 3 }],
      vfx: status === "stealth" ? "enemy_quickstabber_stealth" : status === "evasion" ? "evasion" : "enemy_protect",
    };
  }
  return {
    id: `enemy-ability-a${spec.number}-${slug}-pressure`,
    name: flavorNames[`a${spec.number}-${slug}`] ?? "Relentless Pressure",
    description: `Strikes twice for 65% ${power === "spell" ? "Spell" : "Physical"} Power per hit.`,
    energyCost: 4,
    cooldownTurns: 3,
    range: power === "spell" ? "ranged" : "melee",
    ...(power === "spell" ? { rangedPresentation: "projectile", damageType: "spell", spellPowerScaling: 0.65 } : { damageType: "physical", physicalPowerScaling: 0.65 }),
    hits: 2,
    vfx: power === "spell" ? "enemy_natures_beam" : "enemy_bite_claw",
  };
}

function bossAbilities(spec, boss) {
  const [slug, name] = boss;
  const status = spec.statuses[0];
  const secondStatus = spec.statuses[1];
  const damageType = spec.number === 5 ? "fire" : spec.number === 6 || spec.number === 9 ? "lightning" : spec.number === 8 ? "frost" : spec.number === 10 ? "shadow" : spec.number === 11 ? "arcane" : spec.number === 12 ? "shadow" : "physical";
  const powerField = damageType === "physical" ? "physicalPowerScaling" : "spellPowerScaling";
  const firstStatusIsSelfBuff = ["guard", "barrier", "stealth", "evasion", "enlightened"].includes(status);
  return [
    {
      id: `enemy-ability-a${spec.number}-${slug}-setup`,
      name: spec.number === 4 ? "Brood Call" : spec.number === 5 ? "Stoke the Furnace" : spec.number === 6 ? "Drown the Future" : spec.number === 7 ? "Hall of Mirrors" : spec.number === 8 ? "Absolute Winter" : spec.number === 9 ? "Storm Chains" : spec.number === 10 ? "Royal Decree" : spec.number === 11 ? "Collapse the Heavens" : "Unmake the Living",
      description: `Applies ${status[0].toUpperCase() + status.slice(1)} and ${secondStatus[0].toUpperCase() + secondStatus.slice(1)}.`,
      energyCost: 2,
      cooldownTurns: 4,
      range: "ranged",
      rangedPresentation: "target",
      statusApplications: [
        ...(!firstStatusIsSelfBuff ? [{ status, stacks: 2, duration: 3 }] : []),
        { status: secondStatus, stacks: 1, duration: 3 },
      ],
      ...(firstStatusIsSelfBuff ? { selfStatusApplications: [{ status, stacks: 1, duration: 3 }] } : {}),
      vfx: spec.number === 5 ? "enemy_burning_glare" : spec.number === 8 ? "deep_freeze" : spec.number === 9 ? "thunderstorm" : spec.number === 11 ? "arcane_overload" : "enemy_hex",
    },
    {
      id: `enemy-ability-a${spec.number}-${slug}-execution`,
      name: spec.number === 4 ? "Venom Deluge" : spec.number === 5 ? "Core Meltdown" : spec.number === 6 ? "Foretold Tempest" : spec.number === 7 ? "Shatter the Self" : spec.number === 8 ? "Whiteout Devour" : spec.number === 9 ? "Heavenfall" : spec.number === 10 ? "The Last Night" : spec.number === 11 ? "Starfall Extinction" : "The World Devours",
      description: `Charges for one turn, then deals 260% ${damageType === "physical" ? "Physical" : "Spell"} Power as ${damageType[0].toUpperCase() + damageType.slice(1)} damage.`,
      energyCost: 7,
      cooldownTurns: 5,
      range: damageType === "physical" ? "melee" : "ranged",
      ...(damageType !== "physical" ? { rangedPresentation: "projectile" } : {}),
      damageType,
      [powerField]: 2.6,
      chargeTurns: 1,
      chargeText: `${name} begins preparing a devastating attack.`,
      chargeVfx: "enemy_impale_charge",
      vfx: damageType === "fire" ? "firestorm" : damageType === "frost" ? "absolute_zero" : damageType === "lightning" ? "thunderstorm" : damageType === "arcane" ? "elemental_fury" : damageType === "shadow" && spec.number >= 12 ? "enemy_hex" : "enemy_impale",
    },
    {
      id: `enemy-ability-a${spec.number}-${slug}-recover`,
      name: "Sovereign Recovery",
      description: "Restores 10% maximum Health and gains Guard.",
      energyCost: 3,
      cooldownTurns: 5,
      range: "melee",
      selfHealMaxHpRatio: 0.1,
      selfStatusApplications: [{ status: "guard", stacks: 10 + spec.number * 2, duration: 3 }],
      vfx: "enemy_spirit_heal",
    },
  ];
}

function buildEnemies(spec, items) {
  const scale = spec.number - 3;
  const materialIds = spec.materials.map(([slug]) => materialId(spec, slug));
  const setPieces = items.filter((item) => item.set).map((item) => item.id);
  const weapons = items.filter((item) => item.weaponKind).map((item) => item.id);
  return Object.fromEntries(spec.enemies.map((enemy, index) => {
    const [slug, name, , power] = enemy;
    const boss = index === spec.enemies.length - 1;
    const defenseBonus = ENEMY_DEFENSE_BONUSES[spec.number] ?? { armor: 0, magicResistance: 0 };
    const defenseBonusMultiplier = boss ? 2 : 1;
    const physical = power !== "spell";
    const magical = power !== "physical";
    const generatedHp = boss ? Math.round((170 + scale * scale * 26) * 1.3) : 55 + scale * 28 + index * 9;
    const hp = spec.number >= 7 ? Math.round((generatedHp + 100) * 1.5) : generatedHp;
    const powerValue = 9 + scale * 5 + index;
    const id = enemyId(spec, slug);
    const dropTable = [
      { itemId: materialIds[0], chance: boss ? 100 : 30 },
      { itemId: materialIds[1], chance: boss ? 80 : 18 },
      { itemId: materialIds[2], chance: boss ? 70 : 25 },
      { itemId: setPieces[(index * 2) % setPieces.length], chance: boss ? 14 : spec.number >= 8 ? 3 : 5 },
      ...((spec.number >= 11 || index % 2 === 0) ? [{ itemId: setPieces[(index * 2 + 1) % setPieces.length], chance: boss ? 12 : spec.number >= 8 ? 2 : 4 }] : []),
      ...(boss ? weapons.map((itemId) => ({ itemId, chance: spec.number >= 8 ? 8 : 12 })) : []),
    ];
    const abilities = boss ? bossAbilities(spec, enemy) : [baseAbility(spec, enemy, index), utilityAbility(spec, enemy, index)];
    return [id, {
      id,
      name,
      title: boss ? "Adventure Boss" : "Creature",
      imageUrl: `/assets/enemies/full/a${spec.number}-${slug}.webp`,
      portraitUrl: `/assets/enemies/portraits/a${spec.number}-${slug}.webp`,
      maxHp: hp,
      physicalPower: physical ? powerValue : Math.floor(powerValue * 0.45),
      spellPower: magical ? powerValue : 0,
      armor: Math.max(0, Math.floor(scale * 1.2) + (index % 3)) + defenseBonus.armor * defenseBonusMultiplier,
      magicResistance: Math.max(0, Math.floor(scale * 1.1) + ((index + 1) % 3)) + defenseBonus.magicResistance * defenseBonusMultiplier,
      hitChance: Math.min(1.2, 0.92 + scale * 0.015),
      dodgeChance: Math.min(0.35, 0.04 + (index % 3) * 0.03 + scale * 0.005),
      critChance: Math.min(0.3, 0.05 + scale * 0.015),
      energyRegen: boss ? 3 : 2,
      maxEnergy: 10,
      startingEnergy: boss ? 10 : 6,
      dropTable,
      abilities,
      behaviorNotes: boss ? "Applies its setup statuses first, prepares its charged execution, and uses Sovereign Recovery while its larger attacks cool down." : "Uses its first ready ability, prioritizing the listed order.",
      behavior: "priority",
      maxActionsPerTurn: boss ? 2 : 1,
      accent: spec.accent,
    }];
  }));
}

function outcome(text, effects) {
  return { text, effects };
}

function lateCombatExperience(value) {
  return Math.floor(value * 0.5);
}

function buildEvents(spec) {
  const [firstMaterial, secondMaterial, thirdMaterial] = spec.materials.map(([slug]) => materialId(spec, slug));
  const enemy = enemyId(spec, spec.enemies[1][0]);
  const threshold = 52 + spec.number;
  const eventDebuff = ["stealth", "guard"].includes(spec.statuses[0]) ? spec.statuses[1] : spec.statuses[0];
  const eventDefs = [
    {
      id: `event-a${spec.number}-hazard`, name: `${spec.name} Shortcut`, eyebrow: "Dangerous Route",
      description: `A dangerous shortcut could save hours, but ${spec.name} punishes careless steps.`,
      choices: [
        { id: `choice-a${spec.number}-hazard-agility`, label: "Take the narrow path", description: "Trust your footing and move quickly.", resolution: "check", stat: "agility", threshold, success: outcome("You cross cleanly and reach an untouched cache.", [{ type: "gainExperience", amount: 90 + spec.number * 20 }, { type: "gainItem", itemId: firstMaterial }]), failure: outcome("The route gives way beneath you.", [{ type: "loseHealth", amount: 15 + spec.number * 3 }, { type: "playerNextCombatDebuff", status: eventDebuff, stacks: 1 }]) },
        { id: `choice-a${spec.number}-hazard-strength`, label: "Force a safer route", description: "Break or move the obstacle instead.", resolution: "check", stat: "strength", threshold: threshold + 3, success: outcome("You carve a stable passage and salvage useful material.", [{ type: "gainItem", itemId: thirdMaterial }, { type: "gainGold", amount: 10 + spec.number * 3 }]), failure: outcome("The work exhausts you before the path is clear.", [{ type: "loseHealth", amount: 10 + spec.number * 2 }, { type: "playerNextCombatDebuff", status: "exhausted", stacks: 1 }]) },
        { id: `choice-a${spec.number}-hazard-leave`, label: "Stay on the road", description: "Lose time, not blood.", resolution: "direct", stat: "vitality", threshold: 0, success: outcome("", []), failure: outcome("", []), outcome: outcome("You keep to the longer road.", []) },
      ],
    },
    {
      id: `event-a${spec.number}-relic`, name: `Whispers of ${spec.name}`, eyebrow: "Forgotten Relic",
      description: "An old relic hums with a warning and a promise.",
      choices: [
        { id: `choice-a${spec.number}-relic-intelligence`, label: "Study the relic", description: "Read the pattern before touching it.", resolution: "check", stat: "intelligence", threshold: threshold + 2, success: outcome("The relic yields its secret without resistance.", [{ type: "gainExperience", amount: 130 + spec.number * 24 }, { type: "gainItem", itemId: secondMaterial }]), failure: outcome("The relic answers with a hostile pulse.", [{ type: "loseHealth", amount: 12 + spec.number * 3 }, { type: "enemiesNextCombatBuff", status: "fierce", stacks: 1 }]) },
        { id: `choice-a${spec.number}-relic-luck`, label: "Reach through the ward", description: "Trust the relic to choose kindly.", resolution: "check", stat: "luck", threshold: threshold + 5, success: outcome("Fortune turns the ward aside.", [{ type: "gainGold", amount: 24 + spec.number * 4 }, { type: "gainItem", itemId: secondMaterial }]), failure: outcome("The ward marks you for the guardians.", [{ type: "immediateEncounter", enemyId: enemy, count: 1, experience: lateCombatExperience(120 + spec.number * 25), gold: 15 + spec.number * 2 }]) },
        { id: `choice-a${spec.number}-relic-leave`, label: "Leave it untouched", description: "Some warnings deserve respect.", resolution: "direct", stat: "vitality", threshold: 0, success: outcome("", []), failure: outcome("", []), outcome: outcome("The relic's whisper fades behind you.", []) },
      ],
    },
    {
      id: `event-a${spec.number}-refuge`, name: `Last Refuge of ${spec.name}`, eyebrow: "Abandoned Shelter",
      description: "A barricaded shelter still holds supplies, but something scratches beyond its far wall.",
      choices: [
        { id: `choice-a${spec.number}-refuge-vitality`, label: "Clear the shelter", description: "Hold the entrance while searching every corner.", resolution: "check", stat: "vitality", threshold, success: outcome("You secure the refuge and recover in safety.", [{ type: "heal", amount: 30 + spec.number * 5 }, { type: "gainItem", itemId: thirdMaterial }]), failure: outcome("The shelter collapses into a frantic fight.", [{ type: "loseHealth", amount: 18 + spec.number * 3 }, { type: "immediateEncounter", enemyId: enemy, count: 1, experience: lateCombatExperience(130 + spec.number * 25), gold: 16 + spec.number * 2 }]) },
        { id: `choice-a${spec.number}-refuge-luck`, label: "Search the loose stones", description: "Look for the cache survivors would hide.", resolution: "check", stat: "luck", threshold: threshold + 4, success: outcome("Your hand finds a sealed emergency cache.", [{ type: "gainGold", amount: 28 + spec.number * 5 }, { type: "gainItem", itemId: firstMaterial }]), failure: outcome("You disturb what was nesting in the wall.", [{ type: "playerNextCombatDebuff", status: eventDebuff, stacks: 1 }, { type: "loseHealth", amount: 8 + spec.number * 2 }]) },
        { id: `choice-a${spec.number}-refuge-rest`, label: "Rest by the entrance", description: "Take only the safety you can confirm.", resolution: "direct", stat: "vitality", threshold: 0, success: outcome("", []), failure: outcome("", []), outcome: outcome("A short rest steadies you.", [{ type: "heal", amount: 12 + spec.number * 3 }]) },
      ],
    },
  ];
  return Object.fromEntries(eventDefs.map((event) => [event.id, event]));
}

function buildAdventure(spec, itemIds) {
  const regularIds = spec.enemies.slice(0, 6).map(([slug]) => enemyId(spec, slug));
  const bossId = enemyId(spec, spec.enemies[6][0]);
  const eventPositions = new Map([[2, `event-a${spec.number}-hazard`], [Math.floor(spec.stages / 2), `event-a${spec.number}-relic`], [spec.stages - 3, `event-a${spec.number}-refuge`]]);
  const baseXp = 300 + (spec.number - 4) * 70;
  const baseGold = 20 + (spec.number - 4) * 8;
  const stages = Array.from({ length: spec.stages }, (_, index) => {
    const number = index + 1;
    if (index === spec.stages - 1) {
      return {
        id: `a${spec.number}-stage-${number}`, name: `Heart of ${spec.name}`, entries: [{
          id: `a${spec.number}-boss`, type: "boss", chance: 100, eyebrow: "Boss Encounter", title: spec.enemies[6][1],
          description: spec.bossDescription,
          enemyIds: [bossId, regularIds[4], regularIds[5]], reward: { experience: lateCombatExperience(baseXp * 3), gold: baseGold * 4 },
        }], dropTable: [{ itemId: itemIds.weapons[0], chance: 8 }, { itemId: itemIds.materials[1], chance: 100 }],
      };
    }
    const eventId = eventPositions.get(index);
    if (eventId) {
      return {
        id: `a${spec.number}-stage-${number}`, name: number === 3 ? "The Broken Way" : number > spec.stages / 2 ? "A Last Shelter" : "Forgotten Ground",
        entries: [{ id: `a${spec.number}-event-${number}`, type: "event", chance: 100, eyebrow: "Event", title: "A choice on the road", description: "", eventId, reward: { experience: Math.floor(baseXp * 0.35), gold: Math.floor(baseGold * 0.4) } }],
        dropTable: [],
      };
    }
    const count = Math.min(3, 1 + Math.floor(index / Math.max(2, Math.floor(spec.stages / 4))));
    const first = regularIds[index % regularIds.length];
    const enemyIds = Array.from({ length: count }, (_, offset) => regularIds[(index + offset * 2) % regularIds.length]);
    const entries = [{
      id: `a${spec.number}-combat-${number}-a`, type: "combat", chance: index % 4 === 1 ? 65 : 100, eyebrow: "Encounter",
      title: `${spec.enemies[index % 6][1]} Ambush`, description: `The path through ${spec.name} closes behind you.`,
      enemyIds, reward: { experience: lateCombatExperience(baseXp + index * 12), gold: baseGold + Math.floor(index / 2) },
    }];
    if (index % 4 === 1) entries.push({
      id: `a${spec.number}-combat-${number}-b`, type: "combat", chance: 35, eyebrow: "Elite Encounter",
      title: "Coordinated Hunters", description: `A dangerous group has prepared the ground in ${spec.name}.`,
      enemyIds: [first, regularIds[(index + 3) % 6], regularIds[(index + 4) % 6]], reward: { experience: lateCombatExperience(Math.floor(baseXp * 1.35) + index * 12), gold: Math.floor(baseGold * 1.4) },
    });
    return {
      id: `a${spec.number}-stage-${number}`, name: `${spec.name.split(" ")[0]} Passage ${number}`, entries,
      dropTable: index % 5 === 0 ? [{ itemId: itemIds.materials[index % itemIds.materials.length], chance: 45 }] : [],
    };
  });
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    recommendedLevel: spec.level,
    theme: "custom",
    cardImageUrl: spec.cardImageUrl,
    combatBackgroundUrl: spec.combatBackgroundUrl,
    prerequisiteAdventureId: spec.prerequisite,
    travelText: spec.travelText,
    completionTitle: spec.completionTitle,
    completionDescription: spec.completionDescription,
    stages,
  };
}

const adventureModule = await loadModule("./src/game/content/adventures.ts");
const enemyModule = await loadModule("./src/game/content/enemies.ts");
const gearModule = await loadModule("./src/game/content/gear.ts");
const iconModule = await loadModule("./src/game/itemIcons.ts");

const newItems = [];
const newSets = [];
const newEnemies = {};
const newEvents = {};
const newAdventures = [];
const newIcons = {};

for (const spec of specs) {
  const materials = spec.materials.map(([slug, name, iconUrl], index) => ({
    kind: "misc",
    id: materialId(spec, slug),
    name,
    goldCost: 8 + spec.number * 4 + index * 3,
    rarity: materialRarityFor(spec.number),
    description: `A crafting material recovered from ${spec.name}.`,
    iconUrl,
    arkenfallVendor: null,
    vendorPrerequisiteAdventureId: null,
    craftingRecipe: null,
  }));
  const built = buildSetsAndGear(spec);
  newItems.push(...materials, ...built.items);
  newSets.push(...built.sets);
  Object.assign(newEnemies, buildEnemies(spec, built.items));
  Object.assign(newEvents, buildEvents(spec));
  const itemIds = { materials: materials.map((item) => item.id), weapons: built.items.filter((item) => item.weaponKind).map((item) => item.id) };
  newAdventures.push(buildAdventure(spec, itemIds));
  [...materials, ...built.items].forEach((item) => { newIcons[item.id] = item.iconUrl; });
}

const remedies = [
  {
    kind: "consumable", id: "consumable-a4-antivenom", name: "Mirefen Antivenom", goldCost: 45, rarity: "uncommon",
    description: "A sharp herbal antidote that removes Poison.", iconUrl: "/assets/items/potion-green-normal.webp",
    effects: [{ type: "remove_status", target: "self", status: "poison" }],
    arkenfallVendor: "alchemist", vendorPrerequisiteAdventureId: "mirefen-marsh",
    craftingRecipe: { station: "alchemist", ingredients: [{ itemId: "item-a4-venom-sac", quantity: 2 }, { itemId: "item-a4-mire-reed", quantity: 3 }], prerequisiteAdventureId: "mirefen-marsh" },
  },
  {
    kind: "consumable", id: "consumable-a5-cooling-salve", name: "Cooling Salve", goldCost: 60, rarity: "rare",
    description: "A frost-laced salve that removes Burn.", iconUrl: "/assets/items/potion-blue-normal.webp",
    effects: [{ type: "remove_status", target: "self", status: "burn" }],
    arkenfallVendor: "alchemist", vendorPrerequisiteAdventureId: "ashen-foundry",
    craftingRecipe: { station: "alchemist", ingredients: [{ itemId: "item-a5-ember-fragment", quantity: 1 }, { itemId: "item-a4-mire-reed", quantity: 3 }], prerequisiteAdventureId: "ashen-foundry" },
  },
  {
    kind: "consumable", id: "consumable-a6-coagulant", name: "Coagulant Bandage", goldCost: 75, rarity: "rare",
    description: "A treated field dressing that removes Bleed.", iconUrl: "/assets/items/potion-red-normal.webp",
    effects: [{ type: "remove_status", target: "self", status: "bleed" }],
    arkenfallVendor: "alchemist", vendorPrerequisiteAdventureId: "sunken-reliquary",
    craftingRecipe: { station: "alchemist", ingredients: [{ itemId: "item-a6-relic-shard", quantity: 1 }, { itemId: "item-a5-sootweave", quantity: 3 }], prerequisiteAdventureId: "sunken-reliquary" },
  },
];
newItems.push(...remedies);
remedies.forEach((item) => { newIcons[item.id] = item.iconUrl; });

const currentItems = gearModule.ITEMS.filter((item) => !isLateId(item.id));
const currentSets = gearModule.GEAR_SETS.filter((set) => !isLateId(set.id));
const currentEnemies = Object.fromEntries(Object.entries(enemyModule.ENEMIES).filter(([id]) => !isLateId(id)));
const currentEvents = Object.fromEntries(Object.entries(adventureModule.ADVENTURE_EVENTS).filter(([id]) => !isLateId(id)));
const currentAdventures = adventureModule.ADVENTURES.filter((adventure) => !lateAdventureIds.has(adventure.id));
const currentIcons = Object.fromEntries(Object.entries(iconModule.ITEM_ICON_URLS).filter(([id]) => !isLateId(id)));

await replaceInitializers("./src/game/content/gear.ts", { ITEMS: [...currentItems, ...newItems], GEAR_SETS: [...currentSets, ...newSets] });
await replaceInitializers("./src/game/content/enemies.ts", { ENEMIES: { ...currentEnemies, ...newEnemies } });
await replaceInitializers("./src/game/content/adventures.ts", { ADVENTURE_EVENTS: { ...currentEvents, ...newEvents }, ADVENTURES: [...currentAdventures, ...newAdventures] });
await replaceInitializers("./src/game/itemIcons.ts", { ITEM_ICON_URLS: { ...currentIcons, ...newIcons } });

console.log(JSON.stringify({
  adventures: newAdventures.map((adventure) => ({ id: adventure.id, stages: adventure.stages.length })),
  enemies: Object.keys(newEnemies).length,
  events: Object.keys(newEvents).length,
  items: newItems.length,
  sets: newSets.length,
}, null, 2));
