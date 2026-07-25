import assert from "node:assert/strict";
import { moveAdventureStage, normalizeAdventureExchange } from "../src/components/devtools/AdventureDevtool";
import { normalizeEventExchange } from "../src/components/devtools/EventDevtool";
import { normalizeItemExchange } from "../src/components/devtools/ItemDevtool";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, GEAR_SETS, ITEMS, TALENTS } from "../src/game/data";
import { entryToNode, getStoryNodeIntroduction } from "../src/game/adventures";
import { INITIAL_GAME } from "../src/game/character";
import { createCombat, resolveCombatEvent, useAbility, useConsumable } from "../src/game/engine";
import { purchaseEventMerchantItem, resolveAdventureEventChoice } from "../src/game/eventOutcomes";
import { getItemGoldCost } from "../src/game/items";
import { addOrRefreshStatus, canApplyStatusEffect, createStatusEffect } from "../src/game/statusEffects";
import type { AdventureEventChoice, ConsumableItem, GameState } from "../src/game/types";

function testContentIntegrity() {
  assert.equal(TALENTS.length, 263, "The canonical talent count changed unexpectedly.");
  assert.equal(new Set(TALENTS.map((talent) => talent.id)).size, TALENTS.length, "Talent IDs must be unique.");
  const talentIds = new Set(TALENTS.map((talent) => talent.id));
  TALENTS.forEach((talent) => {
    talent.requires.forEach((requirement) => assert.ok(talentIds.has(requirement), `${talent.id} references missing talent ${requirement}.`));
    if (talent.abilityId) assert.ok(ABILITIES[talent.abilityId], `${talent.id} references missing ability ${talent.abilityId}.`);
  });
  Object.values(ABILITIES).forEach((ability) => {
    assert.ok(ability.range === "melee" || ability.range === "ranged", `${ability.id} needs a valid range.`);
    assert.ok(ability.types.length > 0, `${ability.id} needs at least one presentation type.`);
  });
  assert.equal(new Set([...ITEMS.map((item) => item.id), ...GEAR_SETS.map((set) => set.id)]).size, ITEMS.length + GEAR_SETS.length, "Item and gear-set IDs must be unique.");
  ITEMS.forEach((item) => assert.ok(typeof item.goldCost === "number" && item.goldCost >= 0, `${item.name} needs a non-negative Gold Cost.`));
  ADVENTURES.forEach((adventure) => {
    assert.ok(adventure.id, "Every adventure needs an internal ID.");
    assert.equal(new Set(adventure.stages.map((stage) => stage.id)).size, adventure.stages.length, `${adventure.name} stage IDs must be unique.`);
    adventure.stages.forEach((stage) => {
      assert.ok(stage.id, `${adventure.name} contains a stage without an internal ID.`);
      assert.equal(new Set(stage.entries.map((entry) => entry.id)).size, stage.entries.length, `${stage.name} possibility IDs must be unique.`);
      assert.equal(stage.entries.reduce((sum, entry) => sum + entry.chance, 0), 100, `${stage.name} possibility chances must total 100%.`);
      stage.entries.forEach((entry) => {
        assert.ok(entry.id, `${stage.name} contains a possibility without an internal ID.`);
        entry.enemyIds?.forEach((enemyId) => assert.ok(ENEMIES[enemyId], `${entry.id} references missing enemy ${enemyId}.`));
        if (entry.eventId) assert.ok(ADVENTURE_EVENTS[entry.eventId], `${entry.id} references missing event ${entry.eventId}.`);
      });
    });
  });
}

function testItemEditorRepairsInternalIds() {
  const exchange = normalizeItemExchange({
    format: "arkenfall-items",
    version: 1,
    sets: [{ id: "", name: "Field Kit", pieceCount: 2, bonuses: [] }],
    items: [
      { kind: "gear", id: "", name: "Field Hood", slot: "head", rarity: "common", description: "", stats: {}, set: "field-kit" },
      { kind: "consumable", id: "", name: "Field Tonic", rarity: "common", description: "", effects: [{ type: "heal", amount: 2 }] },
    ],
  });
  assert.equal(exchange.sets[0].id, "field-kit");
  assert.equal(exchange.items[0].id, "field-hood");
  assert.equal(exchange.items[1].id, "field-tonic");
  assert.equal(exchange.items[0].goldCost, 12, "Old gear drafts must receive a sensible default Gold Cost.");
  assert.equal(exchange.items[1].goldCost, 8, "Old consumable drafts must receive a sensible default Gold Cost.");
}

function testStoryEncounterIntroduction() {
  const entry = ADVENTURES[0].stages[0].entries[0];
  const node = entryToNode(entry);
  assert.equal(getStoryNodeIntroduction(node, "Generated enemy wording."), entry.description, "A story combat must introduce the editor-authored entry description.");
  assert.equal(getStoryNodeIntroduction({ ...node, description: "" }, "Generated enemy wording."), "Generated enemy wording.", "An empty combat description must retain a readable fallback.");
  assert.equal(getStoryNodeIntroduction({ ...node, type: "event", enemies: undefined }, "Generated event wording."), "", "Events must not use the travel transition's generic discovery announcement.");
}

function testAdventureEditorRepairsInternalIds() {
  const exchange = normalizeAdventureExchange({
    format: "arkenfall-adventures",
    version: 1,
    adventures: [{
      id: "",
      name: "Readable Adventure",
      description: "",
      recommendedLevel: 1,
      theme: "windsong_forest",
      completionTitle: "Complete",
      completionDescription: "",
      stages: [{
        id: "",
        name: "First Stage",
        entries: [
          { id: "", type: "combat", chance: 50, title: "Repeated Encounter", eyebrow: "Encounter", description: "", enemyIds: ["dummy"], reward: { experience: 1, gold: 0 } },
          { id: "", type: "combat", chance: 50, title: "Repeated Encounter", eyebrow: "Encounter", description: "", enemyIds: ["dummy"], reward: { experience: 1, gold: 0 } },
        ],
      }],
    }],
  });
  const adventure = exchange.adventures[0];
  assert.equal(adventure.id, "readable-adventure", "A missing adventure ID should be generated from its name.");
  assert.equal(adventure.stages[0].id, "first-stage", "A missing stage ID should be generated from its name.");
  assert.deepEqual(adventure.stages[0].entries.map((entry) => entry.id), ["repeated-encounter", "repeated-encounter-2"], "Missing or duplicate stage possibility IDs should be repaired without user input.");
}

function testAdventureEditorReordersStages() {
  const stages = [
    { id: "forest-edge", name: "Forest Edge", entries: [] },
    { id: "green-hollows", name: "Green Hollows", entries: [] },
    { id: "heartwood", name: "Heartwood", entries: [] },
  ];
  const movedDown = moveAdventureStage(stages, "forest-edge", 1);
  assert.deepEqual(movedDown.map((stage) => stage.id), ["green-hollows", "forest-edge", "heartwood"], "Moving a stage down must update the live adventure order.");
  assert.deepEqual(stages.map((stage) => stage.id), ["forest-edge", "green-hollows", "heartwood"], "Stage reordering must not mutate the previous draft.");
  assert.equal(moveAdventureStage(stages, "forest-edge", -1), stages, "A stage already at the top must remain in place.");
  assert.equal(moveAdventureStage(stages, "missing", 1), stages, "An unknown stage must not change the draft.");
}

function testEventEditorRepairsInternalIds() {
  const exchange = normalizeEventExchange({
    format: "arkenfall-events",
    version: 2,
    events: [{
      id: "",
      name: "Readable Event",
      eyebrow: "Event",
      description: "",
      choices: [
        { id: "", label: "Wait", description: "", stat: "agility", threshold: 50, success: { text: "Success.", effects: [] }, failure: { text: "Failure.", effects: [] } },
        { id: "", label: "Wait", description: "", stat: "strength", threshold: 50, success: { text: "Success.", effects: [] }, failure: { text: "Failure.", effects: [] } },
      ],
    }],
  });
  assert.equal(exchange.events[0].id, "readable-event", "A missing event ID should be generated from its name.");
  assert.deepEqual(exchange.events[0].choices.map((choice) => choice.id), ["wait", "wait-2"], "Missing or duplicate choice IDs should be repaired without user input.");
}

function testStatusContracts() {
  const stealth = createStatusEffect("stealth", { duration: 99, stacks: 8 });
  assert.equal(stealth.duration, 2, "Stealth must be capped to the end of the holder's next turn.");
  assert.equal(stealth.stacks, 1, "Stealth must never stack.");
  const protectedStatuses = addOrRefreshStatus([], createStatusEffect("diminishingReturns"));
  assert.equal(canApplyStatusEffect(protectedStatuses, "stunned"), false, "Diminishing Returns must block Stunned.");
}

function testBasicPlayerAbility() {
  const character = { ...structuredClone(INITIAL_GAME.character), name: "Regression Hero" };
  const created = createCombat(character, ["dummy"]);
  const playerEntry = created.turnOrder.find((entry) => entry.kind === "player");
  assert.ok(playerEntry, "Combat must contain the player in initiative.");
  const combat = { ...created, turnOrder: [playerEntry, ...created.turnOrder.filter((entry) => entry.kind === "enemy")], activeTurnIndex: 0, initiativeRevealed: true };
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const result = useAbility(combat, character, "quickSlash");
    assert.equal(result.energy, created.energy - 1, "Quick Slash must spend one Energy.");
    const damageEffect = result.pendingEffects.find((effect) => "damage" in effect && effect.targetId === created.enemies[0].instanceId);
    assert.ok(damageEffect && "damage" in damageEffect, "Quick Slash must queue damage against the selected target.");
    assert.equal(damageEffect.sourceLabel, "Crit", "Critical damage must carry the floating-number Crit label.");
  } finally {
    Math.random = originalRandom;
  }
}

function testStructuredEventOutcome() {
  const state = structuredClone(INITIAL_GAME) as GameState;
  state.characterCreated = true;
  state.adventure = { ...state.adventure, active: true, eventResolved: false, carryHp: 20 };
  const choice: AdventureEventChoice = {
    id: "regression-choice",
    label: "Test",
    description: "",
    stat: "strength",
    threshold: 1,
    success: {
      text: "Success.",
      effects: [
        { type: "gainGold", amount: 5 },
        { type: "playerNextCombatBuff", status: "strengthened", stacks: 2 },
        { type: "immediateEncounter", enemyId: "dummy", count: 2, experience: 10, gold: 3 },
      ],
    },
    failure: { text: "Failure.", effects: [] },
  };
  const result = resolveAdventureEventChoice(state, choice, () => 0);
  assert.equal(result.character.gold, state.character.gold + 5, "Event gold must be granted once.");
  assert.deepEqual(result.adventure.nextCombatPlayerStatuses, [{ status: "strengthened", stacks: 2 }]);
  assert.deepEqual(result.adventure.eventEncounter?.enemyIds, ["dummy", "dummy"]);
  assert.equal(resolveAdventureEventChoice(result, choice, () => 0), result, "A resolved event must not apply twice.");
}

function testDirectEventMerchant() {
  const item = ITEMS[0];
  assert.ok(item, "Merchant regression requires at least one live item.");
  const state = structuredClone(INITIAL_GAME) as GameState;
  state.characterCreated = true;
  state.character.gold = getItemGoldCost(item) + 5;
  state.adventure = { ...state.adventure, active: true, eventResolved: false };
  const choice: AdventureEventChoice = {
    id: "merchant-choice",
    label: "Browse the wares",
    description: "You approach the merchant.",
    resolution: "direct",
    stat: "luck",
    threshold: 100,
    success: { text: "Legacy fallback.", effects: [] },
    failure: { text: "Unused.", effects: [] },
    outcome: { text: "The merchant opens a weathered pack.", effects: [{ type: "openMerchant", itemIds: [item.id] }] },
  };
  const result = resolveAdventureEventChoice(state, choice, () => { throw new Error("Direct outcomes must not roll d100."); });
  assert.equal(result.adventure.eventRollResult?.resolution, "direct", "A direct choice must produce a non-roll resolution result.");
  assert.deepEqual(result.adventure.eventMerchant?.itemIds, [item.id], "The selected merchant stock must persist in adventure state.");
  const purchased = purchaseEventMerchantItem(result, item.id);
  assert.equal(purchased.character.gold, 5, "A merchant purchase must deduct the item's live Gold Cost.");
  assert.equal(purchased.character.inventory.at(-1)?.id, item.id, "A purchased item must be added to inventory.");
  assert.equal(purchaseEventMerchantItem(purchased, "not-for-sale"), purchased, "Items outside merchant stock must not be purchasable.");
}

function testCombatConsumable() {
  const item: ConsumableItem = {
    kind: "consumable",
    id: "regression-tonic",
    name: "Regression Tonic",
    rarity: "rare",
    description: "Test several standard effects.",
    effects: [
      { type: "heal", amount: 12 },
      { type: "gain_energy", amount: 3 },
      { type: "change_next_turn_energy_regen", amount: -1 },
      { type: "apply_status", target: "target", status: "poison", stacks: 2, duration: 3 },
    ],
  };
  const character = { ...structuredClone(INITIAL_GAME.character), name: "Item Tester", inventory: [structuredClone(item), structuredClone(item)] };
  const created = createCombat(character, ["dummy"]);
  const playerEntry = created.turnOrder.find((entry) => entry.kind === "player")!;
  const combat = { ...created, playerHp: 10, energy: 1, turnOrder: [playerEntry, ...created.turnOrder.filter((entry) => entry.kind === "enemy")], activeTurnIndex: 0, initiativeRevealed: true };
  const used = useConsumable(combat, character, item);
  assert.equal(used.character.inventory.length, 1, "Using a consumable must remove exactly one copy.");
  assert.equal(used.combat.turnOrder[used.combat.activeTurnIndex].kind, "player", "Using a consumable must not end the turn.");
  const resolved = resolveCombatEvent(used.combat, used.combat.eventId, 0);
  assert.equal(resolved.playerHp, 22, "Consumable healing must resolve at its presentation event.");
  assert.equal(resolved.energy, 4, "Consumable Energy must resolve at its presentation event.");
  assert.equal(resolved.nextTurnEnergyRegenBonus, -1, "Signed next-turn Energy regeneration must be supported.");
  const poison = resolved.enemies[0].statuses.find((status) => status.id === "poison");
  assert.equal(poison?.stacks, 2, "Consumable statuses must reach the selected enemy.");
  assert.equal(poison?.duration, 3, "Consumable status duration must be preserved.");
}

testContentIntegrity();
testStoryEncounterIntroduction();
testAdventureEditorRepairsInternalIds();
testAdventureEditorReordersStages();
testEventEditorRepairsInternalIds();
testItemEditorRepairsInternalIds();
testStatusContracts();
testBasicPlayerAbility();
testStructuredEventOutcome();
testDirectEventMerchant();
testCombatConsumable();
console.log("Arkenfall regression checks passed.");
