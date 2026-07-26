import assert from "node:assert/strict";
import { sortItemEditorEntries } from "../src/components/devtools/ItemDevtool";
import { calculateGearScalingValue, getGearScalingRank } from "../src/game/itemScaling";
import type { GearItem } from "../src/game/types";

const scoredGear: GearItem = {
  id: "scored-gear",
  name: "Scored Gear",
  slot: "head",
  rarity: "rare",
  description: "",
  stats: { strength: 2 },
  armor: 4,
  physicalPower: 2,
  combat: {
    passive: {
      energyRegen: 1,
      critChance: 0.05,
      initiative: 2,
    },
  },
};

const result = calculateGearScalingValue(scoredGear);
assert.equal(result.value, 11, "Scaling Value must combine attributes, defenses, Power, Energy, chance stats, and Initiative using the published weights.");
assert.deepEqual(result.components.map((component) => component.label), ["Energy Regeneration", "Strength", "Critical Strike Chance", "Physical Power", "Armor", "Initiative"], "The breakdown must place the largest contributions first.");
assert.equal(result.hasExcludedEffects, false, "Standard numeric gear stats must be fully covered by Scaling Value.");

const specialResult = calculateGearScalingValue({ ...scoredGear, specialEffectNotes: "Gain Guard on hit." });
assert.equal(specialResult.value, result.value, "Free-form mechanics must not silently change the numeric score.");
assert.equal(specialResult.hasExcludedEffects, true, "The calculator must flag effects that require manual evaluation.");

const weakerGear = { ...scoredGear, id: "weaker-gear", stats: { strength: 1 }, armor: 0, physicalPower: 0, combat: undefined };
const rank = getGearScalingRank(scoredGear, [weakerGear, scoredGear]);
assert.deepEqual(rank, { rank: 1, total: 2, average: 6 }, "Same-slot comparison must report rank and average against the current draft catalog.");

const sortedByScaling = sortItemEditorEntries([weakerGear, scoredGear], "scaling_desc", (item) => calculateGearScalingValue(item).value);
assert.deepEqual(sortedByScaling.map((item) => item.id), [scoredGear.id, weakerGear.id], "Item Editor must sort the strongest Scaling Value first without mutating the catalog.");
assert.deepEqual(sortItemEditorEntries([{ id: "z", name: "Zed" }, { id: "a", name: "Alpha" }], "name_asc").map((item) => item.id), ["a", "z"], "Item Editor must sort names alphabetically.");
