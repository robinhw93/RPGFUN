import assert from "node:assert/strict";
import { sortItemEditorEntries } from "../src/components/devtools/ItemDevtool";
import { GEAR_SETS, ITEMS } from "../src/game/data";
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

const highfallSets = [
  { id: "set-nightveil", prefix: "gear-nightveil-", expectedScaling: [5.1, 6.9, 5.3, 6.6] },
  { id: "set-trollforged", prefix: "gear-trollforged-", expectedScaling: [6, 7, 5.8, 5.4] },
  { id: "set-runewoven", prefix: "gear-runewoven-", expectedScaling: [5, 6, 6, 5.5] },
];
highfallSets.forEach(({ id, prefix, expectedScaling }) => {
  const set = GEAR_SETS.find((candidate) => candidate.id === id);
  const pieces = ITEMS.filter((item): item is GearItem => item.kind === "gear" && item.id.startsWith(prefix));
  assert.equal(set?.pieceCount, 4, `${id} must be a complete four-piece set.`);
  assert.deepEqual(new Set(pieces.map((item) => item.slot)), new Set(["head", "chest", "pants", "boots"]), `${id} must cover head, chest, pants, and boots.`);
  assert.deepEqual(pieces.map((item) => calculateGearScalingValue(item).value), expectedScaling, `${id} Scaling Values must remain at the intended tier above the earlier sets.`);
});

const windsongGearScaling = new Map([
  ["gear-windsong-thornbark-visor", 1.3],
  ["gear-windsong-thornbark-buckler", 1.3],
  ["gear-windsong-galehide-jerkin", 1.3],
  ["gear-windsong-galehide-striders", 1.5],
  ["gear-windsong-wispwoven-leggings", 1.3],
  ["gear-windsong-wispwoven-band", 1.8],
  ["gear-windsong-bramblefang", 1.8],
  ["gear-windsong-moondrop-wand", 1.8],
  ["gear-windsong-wolfstep-loop", 1.5],
]);
windsongGearScaling.forEach((expectedScaling, itemId) => {
  const item = ITEMS.find((candidate): candidate is GearItem => candidate.kind === "gear" && candidate.id === itemId);
  assert.ok(item, `${itemId} must exist as live gear.`);
  assert.equal(calculateGearScalingValue(item).value, expectedScaling, `${itemId} must stay within its intended Adventure 1 power budget.`);
});
