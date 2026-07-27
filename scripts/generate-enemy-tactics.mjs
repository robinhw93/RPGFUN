import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/game/content/enemies.ts", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const prefix = "export const ENEMIES: Record<string, EnemyTemplate> = ";
const start = source.indexOf(prefix);
const end = source.lastIndexOf(";\n");
if (start < 0 || end < 0) throw new Error("Could not locate the enemy catalog initializer.");
const enemies = JSON.parse(source.slice(start + prefix.length, end));

const statusName = (id) => id.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const clone = (value) => structuredClone(value);
const without = (value, fields) => {
  const result = clone(value);
  fields.forEach((field) => delete result[field]);
  return result;
};
const adventureNumber = (enemyId) => Number(enemyId.match(/^enemy-a(\d+)-/)?.[1] ?? 3);
const tacticalAbilityId = (enemy, suffix) => `enemy-ability-${enemy.id.replace(/^enemy-/, "")}-${suffix}`;

const lateConfigs = [
  ["enemy-a4-reed-stalker", "assassin", "Reedknife", "Sink Beneath the Reeds", "Ambush from Stillwater", "stealth"],
  ["enemy-a4-bog-leech", "combo", "Clinging Bite", "Open the Vein", "Blood-Swollen Lunge", "bleed"],
  ["enemy-a4-mirefen-spitter", "combo", "Bog Spittle", "Venom Saturation", "Septic Burst", "poison"],
  ["enemy-a4-drowned-warden", "tank", "Waterlogged Cleave", "Drowned Bulwark", "Undertow Crush", "guard"],
  ["enemy-a4-fen-witch", "support", "Crooked Hex", "Fenward Covenant", "Mire Mending", "barrier"],
  ["enemy-a4-brood-guard", "tank", "Carapace Bash", "Guard the Brood", "Mandible Lock", "guard"],

  ["enemy-a5-ash-hound", "combo", "Cinder Fang", "Searing Scent", "Furnace Pounce", "burn"],
  ["enemy-a5-cinder-smith", "support", "Hammer Spark", "Temper the Line", "Emergency Quench", "fierce"],
  ["enemy-a5-slag-elemental", "combo", "Molten Knuckle", "Slag Coating", "Crucible Rupture", "burn"],
  ["enemy-a5-furnace-acolyte", "support", "Ember Scripture", "Furnace Litany", "Cauterizing Prayer", "enlightened"],
  ["enemy-a5-ironbound-overseer", "tank", "Chain Command", "Overseer's Wall", "Punitive Slam", "guard"],
  ["enemy-a5-spark-swarm", "combo", "Spark Kiss", "Static Kindling", "Flashover", "burn"],

  ["enemy-a6-brine-crawler", "combo", "Brine Claw", "Drenching Grasp", "Pressure-Shell Crush", "wet"],
  ["enemy-a6-drowned-acolyte", "support", "Saltwater Curse", "Reliquary Hymn", "Tidal Restoration", "barrier"],
  ["enemy-a6-relic-sentinel", "tank", "Relic Pulse", "Ancient Aegis", "Vaultbreaker", "barrier"],
  ["enemy-a6-shock-eel", "combo", "Galvanic Bite", "Conductive Flood", "Chain Discharge", "electrified"],
  ["enemy-a6-tidebound-knight", "tank", "Corroded Thrust", "Tidewall Stance", "Armor-Rending Surge", "guard"],
  ["enemy-a6-siren-oracle", "support", "Siren's Rebuke", "Choir of the Deep", "Restorative Verse", "regenerate"],

  ["enemy-a7-mirror-stalker", "assassin", "Silvered Claw", "Step Through Glass", "Reflected Ambush", "stealth"],
  ["enemy-a7-gloom-archer", "combo", "Gloam Arrow", "Blackglass Glare", "Sightless Volley", "blind"],
  ["enemy-a7-bloodbound-knight", "combo", "Bloodletter", "Crimson Oath", "Sanguine Reaping", "bleed"],
  ["enemy-a7-shard-magus", "support", "Shard Lance", "Prismatic Ward", "Glassweave Mend", "barrier"],
  ["enemy-a7-veil-dancer", "assassin", "Veil Cut", "Impossible Step", "Dance Behind the Blade", "evasion"],
  ["enemy-a7-reflection-wraith", "combo", "Echoing Touch", "Fracture Resolve", "Reverberating Ruin", "weaken"],

  ["enemy-a8-rime-wolf", "combo", "Rime Fang", "Winter's Scent", "White-Fang Rend", "cold"],
  ["enemy-a8-icebound-raider", "combo", "Ice-Axe Chop", "Crack the Guard", "Glacial Execution", "shatter"],
  ["enemy-a8-aurora-wisp", "support", "Aurora Ray", "Boreal Mantle", "Warmth of the Lights", "barrier"],
  ["enemy-a8-frost-hermit", "combo", "Hermit's Frost", "Still the Blood", "Shatter the Frozen", "frozen"],
  ["enemy-a8-glacier-golem", "tank", "Glacier Fist", "Permafrost Shell", "Calving Blow", "guard"],
  ["enemy-a8-snowblind-harrier", "combo", "Snowknife", "Whiteout Feint", "Blindside Barrage", "blind"],

  ["enemy-a9-thunder-talon", "combo", "Thunderclaw", "Mark with Lightning", "Sky-Splitter Dive", "electrified"],
  ["enemy-a9-spire-zealot", "support", "Zealot's Brand", "Tempest Sermon", "Stormborne Renewal", "fierce"],
  ["enemy-a9-storm-channeler", "combo", "Forked Spark", "Build the Charge", "Grounding Cataclysm", "electrified"],
  ["enemy-a9-cloud-djinn", "assassin", "Cloudlash", "Become the Gale", "Eye-of-the-Storm Strike", "evasion"],
  ["enemy-a9-thunderhead-colossus", "tank", "Thunderhead Fist", "Stormfront Bulwark", "Pressure Collapse", "guard"],
  ["enemy-a9-chainwing-matron", "combo", "Chainwing Rake", "Lock the Nerves", "Matron's Thunderfall", "stunned"],

  ["enemy-a10-crownless-guard", "tank", "Oathless Slash", "Broken Formation", "Crowncrusher", "guard"],
  ["enemy-a10-ashen-confessor", "combo", "Cinder Confession", "Name the Sin", "Pyre Absolution", "burn"],
  ["enemy-a10-veilbound-executioner", "combo", "Headsman's Cut", "Mark for Death", "Veiled Guillotine", "bleed"],
  ["enemy-a10-hollow-courtier", "support", "Courtly Malice", "Hollow Etiquette", "Royal Reprieve", "enlightened"],
  ["enemy-a10-crown-seraph", "combo", "Fallen Radiance", "Strip the Halo", "Judgment Without Mercy", "vulnerable"],
  ["enemy-a10-royal-shadow", "assassin", "Royal Knife", "Disappear Between Heartbeats", "The King's Blind Spot", "stealth"],

  ["enemy-a11-starved-pilgrim", "combo", "Gravitic Cut", "Pilgrim's Burden", "Orbiting Ruin", "vulnerable"],
  ["enemy-a11-glasswing-moth", "combo", "Glasswing Flit", "Prismatic Dust", "Thousand-Facet Flurry", "blind"],
  ["enemy-a11-fallen-astrologer", "combo", "Starless Ray", "Forbidden Constellation", "Orrery Barrage", "arcaneWound"],
  ["enemy-a11-comet-hound", "combo", "Comet Fang", "Meteor Scent", "Perihelion Rush", "burn"],
  ["enemy-a11-gravity-warden", "tank", "Horizon Maul", "Event-Horizon Guard", "Singularity Press", "guard"],
  ["enemy-a11-astral-devourer", "support", "Consume Light", "Starless Communion", "Devourer's Renewal", "barrier"],

  ["enemy-a12-rootless-titan", "tank", "Worldstone Blow", "Continental Stance", "Faultline Verdict", "guard"],
  ["enemy-a12-pale-burrower", "combo", "Pale Claw", "Heartseeker Wound", "Burrowing Frenzy", "bleed"],
  ["enemy-a12-deep-oracle", "combo", "Sightless Word", "Buried Revelation", "Prophetic Chorus", "blind"],
  ["enemy-a12-worldvein-elemental", "combo", "Worldvein Fist", "Magma in the Blood", "Mantle-Rift Pulse", "burn"],
  ["enemy-a12-firstborn-shade", "assassin", "Before Memory", "Return to Nothing", "First Murder", "stealth"],
  ["enemy-a12-abyssal-choir", "support", "Unraveling Hymn", "Choir Without End", "Deep Refrain", "enlightened"],
];

function makeComboEnemy(enemy, names, comboStatus) {
  const [oldBasic, oldPayoff] = enemy.abilities;
  const basic = without(oldBasic, ["statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications", "targetStatusDamageBonus"]);
  Object.assign(basic, { name: names[0], description: `Deals reliable ${statusName(basic.damageType ?? "physical")} damage.`, energyCost: Math.min(2, oldBasic.energyCost), cooldownTurns: 0 });
  const setup = clone(oldBasic);
  Object.assign(setup, {
    id: tacticalAbilityId(enemy, "setup"),
    name: names[1],
    description: `Deals a lighter hit and applies ${statusName(comboStatus)} for 3 turns.`,
    energyCost: 3,
    cooldownTurns: 3,
    ...(setup.baseDamage !== undefined ? { baseDamage: Math.max(1, Math.round(setup.baseDamage * 0.7)) } : {}),
    statusApplications: [{ status: comboStatus, stacks: 1, duration: 3 }],
  });
  const payoff = without(oldPayoff, ["statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications"]);
  const multiplier = Math.min(1.55, 1.22 + adventureNumber(enemy.id) * 0.025);
  Object.assign(payoff, {
    name: names[2],
    description: `A heavy attack that deals ${Math.round((multiplier - 1) * 100)}% more damage while you have ${statusName(comboStatus)}.`,
    energyCost: Math.max(4, oldPayoff.energyCost),
    cooldownTurns: 3,
    targetStatusDamageBonus: { status: comboStatus, multiplier },
  });
  enemy.abilities = [basic, setup, payoff];
  enemy.ai = {
    rules: [
      { abilityId: payoff.id, all: [{ type: "player_has_status", status: comboStatus }] },
      { abilityId: setup.id, all: [{ type: "player_missing_status", status: comboStatus }] },
    ],
    fallbackAbilityIds: [basic.id],
    fallback: "ordered",
  };
  enemy.behaviorNotes = `Sets up ${statusName(comboStatus)} with ${setup.name}, converts it into burst damage with ${payoff.name}, and uses ${basic.name} while either tool is unavailable.`;
}

function makeTankEnemy(enemy, names, stanceStatus) {
  const [oldBasic, oldStance] = enemy.abilities;
  const basic = clone(oldBasic);
  Object.assign(basic, { name: names[0], description: `Deals steady ${statusName(basic.damageType ?? "physical")} damage.`, energyCost: Math.min(2, oldBasic.energyCost), cooldownTurns: 0 });
  const stance = without(oldStance, ["damageType", "baseDamage", "physicalPowerScaling", "spellPowerScaling", "powerScalingRange", "hits", "statusApplications", "targetStatusDamageBonus"]);
  Object.assign(stance, {
    name: names[1],
    description: `Gains ${statusName(stanceStatus)} and prepares to punish an exposed target.`,
    energyCost: 2,
    cooldownTurns: 4,
    selfStatusApplications: [{ status: stanceStatus, stacks: Math.max(6, 4 + adventureNumber(enemy.id) * 2), duration: 3 }],
  });
  const payoff = without(oldBasic, ["statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications"]);
  Object.assign(payoff, {
    id: tacticalAbilityId(enemy, "payoff"),
    name: names[2],
    description: `A punishing blow used after taking a defensive stance.`,
    energyCost: 4,
    cooldownTurns: 3,
    ...(payoff.baseDamage !== undefined ? { baseDamage: Math.max(1, Math.round(payoff.baseDamage * 1.35)) } : {}),
    ...(payoff.physicalPowerScaling !== undefined ? { physicalPowerScaling: payoff.physicalPowerScaling * 1.25 } : {}),
    ...(payoff.spellPowerScaling !== undefined ? { spellPowerScaling: payoff.spellPowerScaling * 1.25 } : {}),
  });
  enemy.abilities = [basic, stance, payoff];
  enemy.ai = {
    rules: [
      { abilityId: payoff.id, all: [{ type: "self_has_status", status: stanceStatus }] },
      { abilityId: stance.id, all: [{ type: "self_hp_below", ratio: 0.78 }, { type: "self_missing_status", status: stanceStatus }] },
    ],
    fallbackAbilityIds: [basic.id],
    fallback: "ordered",
  };
  enemy.behaviorNotes = `Uses ${stance.name} once pressured, answers with ${payoff.name} while protected, and otherwise holds threat with ${basic.name}.`;
}

function makeAssassinEnemy(enemy, names, stanceStatus) {
  const [oldBasic, oldStance] = enemy.abilities;
  const basic = without(oldBasic, ["statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications"]);
  Object.assign(basic, { name: names[0], description: `A quick attack used while repositioning.`, energyCost: Math.min(2, oldBasic.energyCost), cooldownTurns: 0 });
  const stance = without(oldStance, ["damageType", "baseDamage", "physicalPowerScaling", "spellPowerScaling", "powerScalingRange", "hits", "statusApplications", "targetStatusDamageBonus"]);
  Object.assign(stance, {
    name: names[1],
    description: `Gains ${statusName(stanceStatus)} for 3 turns before attempting a decisive ambush.`,
    energyCost: 2,
    cooldownTurns: 4,
    selfStatusApplications: [{ status: stanceStatus, stacks: 1, duration: 3 }],
  });
  const payoff = without(oldBasic, ["statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications"]);
  Object.assign(payoff, {
    id: tacticalAbilityId(enemy, "ambush"),
    name: names[2],
    description: `A high-damage ambush prepared through ${stance.name}.`,
    energyCost: 4,
    cooldownTurns: 3,
    ...(payoff.baseDamage !== undefined ? { baseDamage: Math.max(1, Math.round(payoff.baseDamage * 1.45)) } : {}),
    ...(payoff.physicalPowerScaling !== undefined ? { physicalPowerScaling: payoff.physicalPowerScaling * 1.35 } : {}),
    ...(payoff.spellPowerScaling !== undefined ? { spellPowerScaling: payoff.spellPowerScaling * 1.35 } : {}),
  });
  enemy.abilities = [basic, stance, payoff];
  enemy.ai = {
    rules: [
      { abilityId: payoff.id, all: [{ type: "self_has_status", status: stanceStatus }] },
      { abilityId: stance.id, all: [{ type: "self_missing_status", status: stanceStatus }] },
    ],
    fallbackAbilityIds: [basic.id],
    fallback: "ordered",
  };
  enemy.behaviorNotes = `Enters ${statusName(stanceStatus)} with ${stance.name}, immediately looks for ${payoff.name}, then falls back to ${basic.name}.`;
}

function makeSupportEnemy(enemy, names, wardStatus) {
  const [oldAttack, oldUtility] = enemy.abilities;
  const attack = clone(oldAttack);
  Object.assign(attack, { name: names[0], description: oldAttack.description.replace(oldAttack.name, names[0]), energyCost: Math.min(2, oldAttack.energyCost), cooldownTurns: 0 });
  const ward = without(oldUtility, ["damageType", "baseDamage", "physicalPowerScaling", "spellPowerScaling", "powerScalingRange", "hits", "statusApplications", "selfStatusApplications", "targetStatusDamageBonus"]);
  Object.assign(ward, {
    name: names[1],
    description: `Grants ${statusName(wardStatus)} to every living enemy for 3 turns.`,
    energyCost: 3,
    cooldownTurns: 4,
    friendlyTarget: "all_enemies",
    friendlyStatusApplications: [{ status: wardStatus, stacks: wardStatus === "guard" || wardStatus === "barrier" ? 6 + adventureNumber(enemy.id) * 2 : 1, duration: 3 }],
  });
  const aid = without(oldAttack, ["damageType", "baseDamage", "physicalPowerScaling", "spellPowerScaling", "powerScalingRange", "hits", "statusApplications", "selfStatusApplications", "targetStatusDamageBonus"]);
  Object.assign(aid, {
    id: tacticalAbilityId(enemy, "aid"),
    name: names[2],
    description: `Restores Health to the most wounded living enemy.`,
    energyCost: 4,
    cooldownTurns: 4,
    range: "ranged",
    friendlyTarget: "lowest_health",
    friendlyHealSpellPowerScaling: 0.85 + adventureNumber(enemy.id) * 0.04,
  });
  enemy.abilities = [attack, ward, aid];
  enemy.ai = {
    rules: [
      { abilityId: aid.id, all: [{ type: "any_ally_hp_below", ratio: 0.58 }] },
      { abilityId: ward.id, all: [{ type: "living_allies_at_least", count: 2 }, { type: "any_ally_missing_status", status: wardStatus }] },
    ],
    fallbackAbilityIds: [attack.id],
    fallback: "ordered",
  };
  enemy.behaviorNotes = `Prioritizes ${aid.name} for badly wounded allies, maintains ${statusName(wardStatus)} with ${ward.name} in groups, and attacks with ${attack.name} when support is unnecessary.`;
}

for (const [id, role, basicName, setupName, payoffName, status] of lateConfigs) {
  const enemy = enemies[id];
  if (!enemy) throw new Error(`Missing tactical enemy ${id}.`);
  if (enemy.ai && enemy.abilities.some((ability) => ability.name === payoffName)) continue;
  if (enemy.abilities.length < 2) throw new Error(`${enemy.name} needs at least two source abilities.`);
  const names = [basicName, setupName, payoffName];
  if (role === "combo") makeComboEnemy(enemy, names, status);
  else if (role === "tank") makeTankEnemy(enemy, names, status);
  else if (role === "assassin") makeAssassinEnemy(enemy, names, status);
  else makeSupportEnemy(enemy, names, status);
  enemy.behavior = "priority";
}

const bossPhases = {
  "enemy-a4-vespara-broodmother": ["Matriarch's Fury", "Broodfang" , "fierce"],
  "enemy-a5-furnace-tyrant": ["Unsealed Core", "Tyrant's Hammer", "fierce"],
  "enemy-a6-nhalos-drowned-seer": ["The Tide Remembers", "Drowned Scepter", "enlightened"],
  "enemy-a7-lady-noctra": ["Perfect Reflection", "Noctra's Shard", "evasion"],
  "enemy-a8-skara-white-maw": ["Starving Winter", "Rimeclaw", "fierce"],
  "enemy-a9-vaelith-tempest-roc": ["Eye of the Tempest", "Stormbeak", "chargedUp"],
  "enemy-a10-aldren-hollow-king": ["The Empty Throne", "Royal Severance", "fierce"],
  "enemy-a11-seraphel-fallen-star": ["Supernova Heart", "Falling-Star Spear", "enlightened"],
  "enemy-a12-eidolon-first-hunger": ["Hunger Without End", "First Bite", "fierce"],
};

for (const [id, [phaseName, basicName, phaseStatus]] of Object.entries(bossPhases)) {
  const enemy = enemies[id];
  if (enemy?.abilities.some((ability) => ability.name === phaseName)) continue;
  const [setup, execution, recovery] = enemy.abilities;
  const setupStatus = setup.statusApplications?.[0]?.status;
  if (!enemy || !setupStatus) throw new Error(`Boss ${id} needs an executable setup status.`);
  const phase = without(recovery, ["damageType", "baseDamage", "physicalPowerScaling", "spellPowerScaling", "powerScalingRange", "hits", "statusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications", "targetStatusDamageBonus"]);
  Object.assign(phase, {
    id: tacticalAbilityId(enemy, "phase"),
    name: phaseName,
    description: `Below 40% Health, gains ${statusName(phaseStatus)} for 3 turns and accelerates the final sequence.`,
    energyCost: 2,
    cooldownTurns: 8,
    selfStatusApplications: [{ status: phaseStatus, stacks: 1, duration: 3 }],
  });
  const basic = without(execution, ["chargeTurns", "chargeText", "chargeVfx", "statusApplications", "selfStatusApplications", "friendlyTarget", "friendlyHealSpellPowerScaling", "friendlyStatusApplications", "targetStatusDamageBonus"]);
  Object.assign(basic, {
    id: tacticalAbilityId(enemy, "basic"),
    name: basicName,
    description: `A reliable attack used while the boss rebuilds its tactical sequence.`,
    energyCost: 2,
    cooldownTurns: 0,
    ...(basic.baseDamage !== undefined ? { baseDamage: Math.max(1, Math.round(basic.baseDamage * 0.55)) } : {}),
    ...(basic.physicalPowerScaling !== undefined ? { physicalPowerScaling: basic.physicalPowerScaling * 0.6 } : {}),
    ...(basic.spellPowerScaling !== undefined ? { spellPowerScaling: basic.spellPowerScaling * 0.6 } : {}),
  });
  execution.targetStatusDamageBonus = { status: setupStatus, multiplier: 1.45 };
  execution.description = `${execution.description} Deals 45% more damage while you have ${statusName(setupStatus)}.`;
  enemy.abilities = [setup, execution, recovery, phase, basic];
  enemy.ai = {
    rules: [
      { abilityId: phase.id, all: [{ type: "self_hp_below", ratio: 0.4 }, { type: "self_missing_status", status: phaseStatus }] },
      { abilityId: recovery.id, all: [{ type: "self_hp_below", ratio: 0.62 }, { type: "self_missing_status", status: "guard" }] },
      { abilityId: execution.id, all: [{ type: "player_has_status", status: setupStatus }, { type: "energy_at_least", amount: execution.energyCost }] },
      { abilityId: setup.id, all: [{ type: "player_missing_status", status: setupStatus }] },
    ],
    fallbackAbilityIds: [basic.id],
    fallback: "ordered",
  };
  enemy.behaviorNotes = `Opens with ${setup.name}, converts ${statusName(setupStatus)} into ${execution.name}, protects itself with ${recovery.name} under pressure, and enters ${phase.name} below 40% Health. ${basic.name} prevents dead turns while key abilities recover.`;
  enemy.behavior = "priority";
  enemy.maxActionsPerTurn = 2;
}

const attachAi = (enemyId, ai, notes) => {
  const enemy = enemies[enemyId];
  if (!enemy) throw new Error(`Missing legacy tactical enemy ${enemyId}.`);
  enemy.ai = ai;
  enemy.behaviorNotes = notes;
};

attachAi("enemy-ms1ej4re-xskqn", { rules: [{ abilityId: "enemy-ability-ms1fezxg-6sfj6", all: [{ type: "energy_at_least", amount: 5 }] }], fallbackAbilityIds: ["enemy-ability-ms1ekpk5-l5ft7"], fallback: "ordered" }, "Saves Energy for Snipe, then uses Bow Shot while rebuilding.");
attachAi("enemy-ms1fgqar-mafv9", { rules: [{ abilityId: "enemy-ability-ms1fkbg6-tw10h", all: [{ type: "self_has_status", status: "stealth" }] }, { abilityId: "enemy-ability-ms1fjpq2-x44en", all: [{ type: "self_missing_status", status: "stealth" }] }], fallbackAbilityIds: ["enemy-ability-ms1fkbg6-tw10h"], fallback: "ordered" }, "Enters Stealth before using Shiv, then keeps stabbing while the escape route recovers.");
attachAi("enemy-ms1fnbla-fs4ul", { rules: [{ abilityId: "enemy-ability-ms1fpoku-tvscy", all: [{ type: "any_ally_hp_below", ratio: 0.72 }] }, { abilityId: "enemy-ability-ms1fqn1u-55k6q", all: [{ type: "player_missing_status", status: "slowed" }] }], fallbackAbilityIds: ["enemy-ability-ms1fqn1u-55k6q"], fallback: "ordered" }, "Heals a wounded ally first and maintains Slowed with Hex when healing is unnecessary.");
attachAi("enemy-ms1ftdlw-jz5lo", { rules: [{ abilityId: "enemy-ability-ms1fwaul-zcws5", all: [{ type: "living_allies_at_least", count: 2 }, { type: "any_ally_missing_status", status: "guard" }] }], fallbackAbilityIds: ["enemy-ability-ms1fv25a-ukf1s"], fallback: "ordered" }, "Protects companions without repeatedly wasting Guard, then uses Heavy Cleave.");
attachAi("enemy-ms1fykbj-rhb65", { rules: [{ abilityId: "enemy-ability-ms1g3m9s-n12oq", all: [{ type: "living_allies_at_least", count: 2 }, { type: "any_ally_missing_status", status: "fierce" }] }, { abilityId: "enemy-ability-ms1gpjhe-m9ky3", all: [{ type: "player_has_status", status: "bleed" }] }, { abilityId: "enemy-ability-ms1g1ysa-6452h", all: [{ type: "player_missing_status", status: "bleed" }] }], fallbackAbilityIds: ["enemy-ability-ms1gucm0-0n5ec"], fallback: "ordered" }, "Rallies a group, opens Bleed with Skewer, then prepares Impale; Spear Poke fills recovery turns.");

attachAi("enemy-ms2vrqbb-8r5ux", { rules: [{ abilityId: "enemy-ability-ms2vx10q-s3qsn", all: [{ type: "energy_at_least", amount: 10 }] }], fallbackAbilityIds: ["enemy-ability-ms2vylq4-ubwfz"], fallback: "ordered" }, "Naps while gathering Energy, then charges Club Smash at full Energy.");
attachAi("enemy-ms2w17p6-txpmq", { rules: [{ abilityId: "enemy-ability-ms2w38yw-vp9bu", all: [{ type: "energy_at_least", amount: 5 }] }, { abilityId: "enemy-ability-ms2w4zyb-7c0ge", all: [{ type: "self_missing_status", status: "fierce" }] }], fallbackAbilityIds: ["enemy-ability-ms2w7zva-lxkg8"], fallback: "ordered" }, "Uses Heavy Fists whenever fueled, Roars to regain Fierce, and Naps only while rebuilding.");
attachAi("enemy-ms2w93yt-v817a", { rules: [{ abilityId: "enemy-ability-ms2wayvo-rnti2", all: [{ type: "any_ally_hp_below", ratio: 0.55 }] }, { abilityId: "enemy-ability-ms2wbr2c-66kcn", all: [{ type: "living_allies_at_least", count: 2 }, { type: "any_ally_missing_status", status: "regenerate" }] }, { abilityId: "enemy-ability-ms2wcm61-4wsw3", all: [{ type: "player_missing_status", status: "weaken" }] }], fallbackAbilityIds: ["enemy-ability-ms2we50g-kzi7f"], fallback: "ordered" }, "Emergency-heals first, maintains Regenerate in groups, applies Greater Hex, then Naps while support tools recover.");
attachAi("enemy-ms2wk1ul-6ol9b", { rules: [{ abilityId: "enemy-ability-ms2wloah-2gx3k" }, { abilityId: "enemy-ability-ms2wng0f-y2n2z", all: [{ type: "self_has_status", status: "stealth" }] }, { abilityId: "enemy-ability-ms2wmdjd-22til", all: [{ type: "self_missing_status", status: "stealth" }] }], fallbackAbilityIds: ["enemy-ability-ms2wng0f-y2n2z"], fallback: "ordered" }, "Steals whenever possible, enters Stealth before Poisoned Stab, and uses direct pressure while repositioning.");
attachAi("enemy-ms2wqzxv-srsgs", { rules: [{ abilityId: "enemy-ability-ms2wsv8u-j9a24", all: [{ type: "energy_at_least", amount: 10 }] }], fallbackAbilityIds: [], fallback: "ordered" }, "Builds to full Energy, then flees with every stolen trinket intact.");
const trapper = enemies["enemy-ms2wuk5j-1ddqa"];
trapper.abilities.find((ability) => ability.id === "enemy-ability-ms2wyie9-iisii").targetStatusDamageBonus = { status: "burn", multiplier: 1.35 };
if (!trapper.abilities.find((ability) => ability.id === "enemy-ability-ms2wyie9-iisii").description.includes("35% more damage")) {
  trapper.abilities.find((ability) => ability.id === "enemy-ability-ms2wyie9-iisii").description += " Deals 35% more damage while you are Burning.";
}
attachAi("enemy-ms2wuk5j-1ddqa", { rules: [{ abilityId: "enemy-ability-ms2wyie9-iisii", all: [{ type: "player_has_status", status: "burn" }] }, { abilityId: "enemy-ability-ms2wxm3t-nrfbj", all: [{ type: "player_missing_status", status: "burn" }] }], fallbackAbilityIds: ["enemy-ability-ms2wwtu0-ustxf"], fallback: "ordered" }, "Sets Fire Trap, exploits Burn with Snipe, and uses Bow Shot while the combination recovers.");
attachAi("enemy-ms2xaper-z7o3g", { rules: [{ abilityId: "enemy-ability-ms2xgcxa-lier7", all: [{ type: "phase_is", phase: "toying" }] }, { abilityId: "enemy-ability-ms2xe0t2-q41xk", all: [{ type: "phase_is_not", phase: "toying" }, { type: "energy_at_least", amount: 10 }] }, { abilityId: "enemy-ability-ms2xd4iz-c5j5z", all: [{ type: "phase_is_not", phase: "toying" }, { type: "self_missing_status", status: "guard" }] }], fallbackAbilityIds: ["enemy-ability-ms2xgcxa-lier7"], fallback: "ordered" }, "Builds Guard with Patience, unleashes No Patience at full Energy, then permanently switches to Toying.");

const tacticalIds = Object.values(enemies).filter((enemy) => enemy.ai).map((enemy) => enemy.id);
if (lateConfigs.length !== 54 || Object.keys(bossPhases).length !== 9 || tacticalIds.length !== 75) {
  throw new Error(`Unexpected tactical coverage: ${lateConfigs.length} regular, ${Object.keys(bossPhases).length} bosses, ${tacticalIds.length} total.`);
}

await writeFile(sourcePath, `${source.slice(0, start + prefix.length)}${JSON.stringify(enemies, null, 2)};\n`, "utf8");
console.log(`Updated ${tacticalIds.length} enemies with data-owned tactical AI.`);
