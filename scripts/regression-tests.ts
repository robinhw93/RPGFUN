import assert from "node:assert/strict";
import { normalizeAdventureExchange } from "../src/components/devtools/AdventureDevtool";
import { normalizeEventExchange } from "../src/components/devtools/EventDevtool";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, TALENTS } from "../src/game/data";
import { entryToNode, getStoryNodeIntroduction } from "../src/game/adventures";
import { INITIAL_GAME } from "../src/game/character";
import { createCombat, useAbility } from "../src/game/engine";
import { resolveAdventureEventChoice } from "../src/game/eventOutcomes";
import { addOrRefreshStatus, canApplyStatusEffect, createStatusEffect } from "../src/game/statusEffects";
import type { AdventureEventChoice, GameState } from "../src/game/types";

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

testContentIntegrity();
testStoryEncounterIntroduction();
testAdventureEditorRepairsInternalIds();
testEventEditorRepairsInternalIds();
testStatusContracts();
testBasicPlayerAbility();
testStructuredEventOutcome();
console.log("Arkenfall regression checks passed.");
