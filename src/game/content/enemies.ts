import type { EnemyTemplate } from "../types";

export const ENEMIES: Record<string, EnemyTemplate> = {
  dummy: {
    id: "dummy", name: "DUMMY", title: "Training Construct", imageUrl: "/assets/enemies/full/dummy.webp", portraitUrl: "/assets/enemies/portraits/dummy.webp",
    maxHp: 100, physicalPower: 1, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 0.95, dodgeChance: 0, critChance: 0,
    energyRegen: 1, maxEnergy: 10, startingEnergy: 10, dropTable: [],
    abilities: [{ id: "trainingStrike", name: "Training Strike", description: "Deals 1 base Physical damage.", energyCost: 1, cooldownTurns: 0, range: "melee", damageType: "physical", baseDamage: 1, vfx: "enemy_training_strike" }],
    behaviorNotes: "Uses Training Strike whenever it has enough Energy.", behavior: "single", maxActionsPerTurn: 1, accent: "#a8a69d",
  },
  "enemy-mrxiut2a-k4kgv": {
    id: "enemy-mrxiut2a-k4kgv", name: "Rabid Rat", title: "Creature", imageUrl: "/assets/enemies/full/rabid-rat.webp", portraitUrl: "/assets/enemies/portraits/rabid-rat.webp",
    maxHp: 11, physicalPower: 1, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 0.95, dodgeChance: 0.05, critChance: 0.1,
    energyRegen: 1, maxEnergy: 3, startingEnergy: 3, dropTable: [{ itemId: "item-ms0jej41-7sii2", chance: 80 }],
    abilities: [
      { id: "enemy-ability-mrxjymmz-fomw6", name: "Bite", description: "Deals 100% Physical Power as Physical damage.", energyCost: 2, cooldownTurns: 1, range: "melee", damageType: "physical", physicalPowerScaling: 1, vfx: "enemy_bite" },
      { id: "enemy-ability-mrxk052s-zrgdh", name: "Scurry", description: "Recovers 1 extra Energy next turn.", energyCost: 0, cooldownTurns: 1, range: "melee", nextTurnEnergyRegen: 1, vfx: "enemy_scurry" },
      { id: "enemy-ability-mrxk0xn3-cg5w8", name: "Rabid Bite", description: "Deals 100% Physical Power as Physical damage and applies 1 Poison.", energyCost: 3, cooldownTurns: 2, range: "melee", damageType: "physical", physicalPowerScaling: 1, statusApplications: [{ status: "poison", stacks: 1 }], vfx: "enemy_rabid_bite" },
    ],
    behaviorNotes: "Starts with Bite, then Scurries until Rabid Bite is available. Afterwards it Scurries until Bite is available and repeats.", behavior: "rabid_rat", maxActionsPerTurn: 1, accent: "#79a86d",
  },
  "enemy-mrxj4o6o-o45ia": {
    id: "enemy-mrxj4o6o-o45ia", name: "Windsong Wolf", title: "Creature", imageUrl: "/assets/enemies/full/windsong-wolf.webp", portraitUrl: "/assets/enemies/portraits/windsong-wolf.webp",
    maxHp: 20, physicalPower: 2, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 0.95, dodgeChance: 0.1, critChance: 0.1,
    energyRegen: 1, maxEnergy: 6, startingEnergy: 6, dropTable: [{ itemId: "item-ms0jdzsp-pnyoa", chance: 20 }, { itemId: "item-ms0jd8ky-lu2zb", chance: 60 }],
    abilities: [
      { id: "enemy-ability-mrxjymmz-6ubjd", name: "Howl", description: "Applies Vulnerable.", energyCost: 0, cooldownTurns: 5, range: "ranged", rangedPresentation: "target", statusApplications: [{ status: "vulnerable" }], vfx: "enemy_howl" },
      { id: "enemy-ability-mrxk2rt1-qaobv", name: "Bite and Claw", description: "Strikes twice for 50% Physical Power as Physical damage per hit. Each hit has a 20% chance to apply Bleed.", energyCost: 2, cooldownTurns: 1, range: "melee", damageType: "physical", physicalPowerScaling: 0.5, hits: 2, statusApplications: [{ status: "bleed", chance: 0.2 }], vfx: "enemy_bite_claw" },
    ],
    behaviorNotes: "Always uses Howl when ready, then uses Bite and Claw when it has enough Energy.", behavior: "priority", maxActionsPerTurn: 1, accent: "#79a86d",
  },
  "enemy-mrxk609z-n04fq": {
    id: "enemy-mrxk609z-n04fq", name: "Forest Wisp", title: "Creature", imageUrl: "/assets/enemies/full/forest-wisp.webp", portraitUrl: "/assets/enemies/portraits/forest-wisp.webp",
    maxHp: 9, physicalPower: 0, spellPower: 2, armor: 0, magicResistance: 1, hitChance: 0.95, dodgeChance: 0.05, critChance: 0.05,
    energyRegen: 1, maxEnergy: 4, startingEnergy: 4, dropTable: [{ itemId: "item-ms0jf0sp-z8hcl", chance: 50 }],
    abilities: [{ id: "enemy-ability-mrxk7ose-fc13q", name: "Wisp Blast", description: "Deals Arcane damage equal to a random 50–100% of Spell Power and has a 10% chance to apply Weaken. When its final blast spends all Energy, the Forest Wisp becomes Stunned for 1 turn.", energyCost: 1, cooldownTurns: 0, range: "ranged", rangedPresentation: "projectile", damageType: "arcane", powerScalingRange: { power: "spell", min: 0.5, max: 1 }, statusApplications: [{ status: "weaken", chance: 0.1 }], selfStatusApplicationsWhenEnergyDepleted: [{ status: "stunned", duration: 2 }], vfx: "enemy_wisp_blast" }],
    behaviorNotes: "Uses Wisp Blast repeatedly until its Energy is empty, then becomes Stunned for its next turn.", behavior: "wisp_barrage", maxActionsPerTurn: 10, accent: "#79a86d",
  },
  "enemy-mrxkar5z-g9o5d": {
    id: "enemy-mrxkar5z-g9o5d", name: "Brown Bear", title: "Creature", imageUrl: "/assets/enemies/full/brown-bear.webp", portraitUrl: "/assets/enemies/portraits/brown-bear.webp",
    maxHp: 30, physicalPower: 3, spellPower: 0, armor: 5, magicResistance: 0, hitChance: 0.85, dodgeChance: 0.05, critChance: 0.05,
    energyRegen: 0, maxEnergy: 6, startingEnergy: 6, dropTable: [{ itemId: "item-ms0jgblm-ko16i", chance: 50 }],
    abilities: [
      { id: "enemy-ability-mrxkdwnl-vont1", name: "Maul", description: "Deals 100% Physical Power as Physical damage and applies 1 Bleed.", energyCost: 3, cooldownTurns: 1, range: "melee", damageType: "physical", physicalPowerScaling: 1, statusApplications: [{ status: "bleed", stacks: 1 }], vfx: "enemy_maul" },
      { id: "enemy-ability-mrxkeegm-8fny8", name: "Hibernate", description: "Gains Sleep and recovers 6 extra Energy next turn.", energyCost: 0, cooldownTurns: 1, range: "melee", selfStatusApplications: [{ status: "sleep", duration: 2 }], nextTurnEnergyRegen: 6, vfx: "enemy_hibernate" },
      { id: "enemy-ability-mrxkfj6b-snlgn", name: "Roar", description: "Applies Weaken and Vulnerable.", energyCost: 3, cooldownTurns: 6, range: "ranged", rangedPresentation: "target", statusApplications: [{ status: "weaken" }, { status: "vulnerable" }], vfx: "enemy_roar" },
    ],
    behaviorNotes: "Opens with Roar and Maul. Uses Hibernate when it has no Energy, and otherwise uses Maul while Roar is cooling down.", behavior: "brown_bear", maxActionsPerTurn: 1, accent: "#79a86d",
  },
  "enemy-mrxkjqs3-g7g5i": {
    id: "enemy-mrxkjqs3-g7g5i", name: "The Forest Spirit", title: "Creature", imageUrl: "/assets/enemies/full/forest-spirit.webp", portraitUrl: "/assets/enemies/portraits/forest-spirit.webp",
    maxHp: 40, physicalPower: 0, spellPower: 8, armor: 1, magicResistance: 1, hitChance: 0.95, dodgeChance: 0.1, critChance: 0.1,
    energyRegen: 2, maxEnergy: 10, startingEnergy: 10, dropTable: [{ itemId: "gear-ms0h89t2-sczql", chance: 100 }, { itemId: "gear-ms0h9jvh-cpg4y", chance: 100 }, { itemId: "gear-ms0haj6d-e8pmv", chance: 100 }, { itemId: "item-ms0jf0sp-z8hcl", chance: 80 }],
    abilities: [
      { id: "enemy-ability-mrxkkzcu-tqzsj", name: "Fade Out", description: "Gains Stealth until the end of its next turn and recovers 2 extra Energy next turn.", energyCost: 3, cooldownTurns: 5, range: "ranged", rangedPresentation: "target", selfStatusApplications: [{ status: "stealth" }], nextTurnEnergyRegen: 2, vfx: "enemy_fade_out" },
      { id: "enemy-ability-mrxkmol2-9006k", name: "Burning Glare", description: "Deals 75% Spell Power as Fire damage and applies 1 Burn.", energyCost: 2, cooldownTurns: 2, range: "ranged", rangedPresentation: "projectile", damageType: "fire", spellPowerScaling: 0.75, statusApplications: [{ status: "burn", stacks: 1 }], vfx: "enemy_burning_glare" },
      { id: "enemy-ability-mrxknrod-80ona", name: "Nature's Beam", description: "Deals 100% Spell Power as Arcane damage and applies Weaken.", energyCost: 3, cooldownTurns: 1, range: "ranged", rangedPresentation: "projectile", damageType: "arcane", spellPowerScaling: 1, statusApplications: [{ status: "weaken" }], vfx: "enemy_natures_beam" },
      { id: "enemy-ability-mrxkq0sr-q1e8h", name: "Shimmer", description: "Restores full Energy next turn.", energyCost: 0, cooldownTurns: 5, range: "ranged", rangedPresentation: "target", restoreFullEnergyNextTurn: true, vfx: "enemy_shimmer" },
    ],
    behaviorNotes: "Fights with two Forest Wisps. Whenever one dies, the Forest Spirit restores 25% of its maximum Health.", behavior: "forest_spirit", maxActionsPerTurn: 1,
    healOnAllyDeath: { allyId: "enemy-mrxk609z-n04fq", maxHpRatio: 0.25, vfx: "enemy_spirit_heal" }, accent: "#79a86d",
  },
  "enemy-ms1ej4re-xskqn": {
    id: "enemy-ms1ej4re-xskqn", name: "Goblin Longseer", title: "Creature", imageUrl: "/assets/enemies/full/goblin-longseer.webp", portraitUrl: "/assets/enemies/portraits/goblin-longseer.webp",
    maxHp: 30, physicalPower: 5, spellPower: 0, armor: 1, magicResistance: 1, hitChance: 0.95, dodgeChance: 0.08, critChance: 0.05,
    energyRegen: 1, maxEnergy: 5, startingEnergy: 1, dropTable: [{ itemId: "item-ms0ss0dt-z4bke", chance: 30 }],
    abilities: [
      { id: "enemy-ability-ms1ekpk5-l5ft7", name: "Bow Shot", description: "Deals 100% Physical Power as Physical damage.", energyCost: 0, cooldownTurns: 1, range: "ranged", rangedPresentation: "projectile", damageType: "physical", physicalPowerScaling: 1, vfx: "enemy_bow_shot" },
      { id: "enemy-ability-ms1fezxg-6sfj6", name: "Snipe", description: "Deals 200% Physical Power as Physical damage and applies Vulnerable.", energyCost: 5, cooldownTurns: 1, range: "ranged", rangedPresentation: "projectile", damageType: "physical", physicalPowerScaling: 2, statusApplications: [{ status: "vulnerable" }], vfx: "enemy_snipe" },
    ],
    behaviorNotes: "Uses Bow Shot once per turn, replacing it with Snipe whenever it reaches 5 Energy.", behavior: "goblin_longseer", maxActionsPerTurn: 1, accent: "#7f9453",
  },
  "enemy-ms1fgqar-mafv9": {
    id: "enemy-ms1fgqar-mafv9", name: "Goblin Quickstabber", title: "Creature", imageUrl: "/assets/enemies/full/goblin-quickstabber.webp", portraitUrl: "/assets/enemies/portraits/goblin-quickstabber.webp",
    maxHp: 24, physicalPower: 6, spellPower: 0, armor: 1, magicResistance: 0, hitChance: 0.95, dodgeChance: 0.1, critChance: 0.1,
    energyRegen: 1, maxEnergy: 5, startingEnergy: 5, dropTable: [{ itemId: "item-ms0ss0dt-z4bke", chance: 30 }, { itemId: "consumable-ms0e551z-v6qcf", chance: 10 }],
    abilities: [
      { id: "enemy-ability-ms1fjpq2-x44en", name: "Stealth", description: "Gains Stealth until the end of its next turn.", energyCost: 0, cooldownTurns: 5, range: "melee", selfStatusApplications: [{ status: "stealth" }], vfx: "enemy_quickstabber_stealth" },
      { id: "enemy-ability-ms1fkbg6-tw10h", name: "Shiv", description: "Deals 100% Physical Power as Physical damage and applies 1 Poison.", energyCost: 2, cooldownTurns: 1, range: "melee", damageType: "physical", physicalPowerScaling: 1, statusApplications: [{ status: "poison", stacks: 1 }], vfx: "enemy_shiv" },
    ],
    behaviorNotes: "Uses every available ability each turn, beginning with Stealth when it is ready.", behavior: "priority", maxActionsPerTurn: 2, accent: "#687b43",
  },
  "enemy-ms1fnbla-fs4ul": {
    id: "enemy-ms1fnbla-fs4ul", name: "Goblin Woundfixer", title: "Creature", imageUrl: "/assets/enemies/full/goblin-woundfixer.webp", portraitUrl: "/assets/enemies/portraits/goblin-woundfixer.webp",
    maxHp: 28, physicalPower: 2, spellPower: 6, armor: 0, magicResistance: 3, hitChance: 0.95, dodgeChance: 0.05, critChance: 0.05,
    energyRegen: 2, maxEnergy: 10, startingEnergy: 10, dropTable: [{ itemId: "item-ms0ss0dt-z4bke", chance: 20 }, { itemId: "consumable-ms0e3hjh-5bewd", chance: 5 }],
    abilities: [
      { id: "enemy-ability-ms1fpoku-tvscy", name: "Heal", description: "Restores Health to the most wounded friendly target equal to 100% of Spell Power.", energyCost: 3, cooldownTurns: 2, range: "ranged", rangedPresentation: "target", friendlyTarget: "lowest_health", friendlyHealSpellPowerScaling: 1, vfx: "enemy_woundfixer_heal" },
      { id: "enemy-ability-ms1fqn1u-55k6q", name: "Hex", description: "Deals 50% Spell Power as Spell damage and applies Slowed.", energyCost: 1, cooldownTurns: 1, range: "melee", damageType: "spell", spellPowerScaling: 0.5, statusApplications: [{ status: "slowed" }], vfx: "enemy_hex" },
    ],
    behaviorNotes: "Prioritizes healing the most wounded living ally, including itself, then uses Hex.", behavior: "goblin_woundfixer", maxActionsPerTurn: 1, accent: "#846b9e",
  },
  "enemy-ms1ftdlw-jz5lo": {
    id: "enemy-ms1ftdlw-jz5lo", name: "Goblin Biggrown", title: "Creature", imageUrl: "/assets/enemies/full/goblin-biggrown.webp", portraitUrl: "/assets/enemies/portraits/goblin-biggrown.webp",
    maxHp: 40, physicalPower: 6, spellPower: 0, armor: 4, magicResistance: 0, hitChance: 0.95, dodgeChance: 0, critChance: 0.05,
    energyRegen: 1, maxEnergy: 5, startingEnergy: 3, dropTable: [{ itemId: "item-ms0ss0dt-z4bke", chance: 50 }],
    abilities: [
      { id: "enemy-ability-ms1fv25a-ukf1s", name: "Heavy Cleave", description: "Deals 250% Physical Power as Physical damage and applies 1 Bleed.", energyCost: 5, cooldownTurns: 0, range: "melee", damageType: "physical", physicalPowerScaling: 2.5, statusApplications: [{ status: "bleed", stacks: 1 }], vfx: "enemy_heavy_cleave" },
      { id: "enemy-ability-ms1fwaul-zcws5", name: "Protect", description: "Grants 5 Guard to every other living enemy.", energyCost: 1, cooldownTurns: 3, range: "melee", friendlyTarget: "all_other_enemies", friendlyStatusApplications: [{ status: "guard", stacks: 5 }], vfx: "enemy_protect" },
    ],
    behaviorNotes: "Uses Protect whenever it is ready and Heavy Cleave whenever it reaches 5 Energy.", behavior: "goblin_biggrown", maxActionsPerTurn: 1, accent: "#8d6945",
  },
  "enemy-ms1fykbj-rhb65": {
    id: "enemy-ms1fykbj-rhb65", name: "Striz, Goblin Chieftain", title: "Creature", imageUrl: "/assets/enemies/full/striz-goblin-chieftain.webp", portraitUrl: "/assets/enemies/portraits/striz-goblin-chieftain.webp",
    maxHp: 80, physicalPower: 10, spellPower: 6, armor: 4, magicResistance: 4, hitChance: 0.95, dodgeChance: 0.05, critChance: 0.05,
    energyRegen: 1, maxEnergy: 10, startingEnergy: 10,
    dropTable: [{ itemId: "consumable-ms0e551z-v6qcf", chance: 60 }, { itemId: "item-ms0ss0dt-z4bke", chance: 100 }, { itemId: "item-ms0ss0dt-z4bke", chance: 100 }, { itemId: "item-ms0ss0dt-z4bke", chance: 60 }],
    abilities: [
      { id: "enemy-ability-ms1g1ysa-6452h", name: "Skewer", description: "Deals 100% Physical Power as Physical damage and applies 1 Bleed.", energyCost: 1, cooldownTurns: 3, range: "melee", damageType: "physical", physicalPowerScaling: 1, statusApplications: [{ status: "bleed", stacks: 1 }], vfx: "enemy_skewer" },
      { id: "enemy-ability-ms1g3m9s-n12oq", name: "Rally", description: "Grants Fierce to every living enemy.", energyCost: 1, cooldownTurns: 5, range: "melee", friendlyTarget: "all_enemies", friendlyStatusApplications: [{ status: "fierce" }], vfx: "enemy_rally" },
      { id: "enemy-ability-ms1gpjhe-m9ky3", name: "Impale", description: "Charges for one turn, then deals 150% Physical Power as Physical damage and applies 2 Bleed.", energyCost: 3, cooldownTurns: 4, range: "melee", damageType: "physical", physicalPowerScaling: 1.5, statusApplications: [{ status: "bleed", stacks: 2 }], chargeTurns: 1, chargeText: "Striz, Goblin Chieftain begins charging an attack.", chargeVfx: "enemy_impale_charge", vfx: "enemy_impale" },
      { id: "enemy-ability-ms1gucm0-0n5ec", name: "Spear Poke", description: "Deals 75% Physical Power as Physical damage.", energyCost: 2, cooldownTurns: 1, range: "melee", damageType: "physical", physicalPowerScaling: 0.75, vfx: "enemy_spear_poke" },
    ],
    behaviorNotes: "Uses every available ability when possible, with Spear Poke as its fallback. Impale is prepared for one turn before release.", behavior: "goblin_chieftain", maxActionsPerTurn: 4, accent: "#aa633f",
  },
};
