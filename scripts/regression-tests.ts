import assert from "node:assert/strict";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, TALENTS } from "../src/game/data";
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
  ADVENTURES.forEach((adventure) => adventure.stages.forEach((stage) => stage.entries.forEach((entry) => {
    entry.enemyIds?.forEach((enemyId) => assert.ok(ENEMIES[enemyId], `${entry.id} references missing enemy ${enemyId}.`));
    if (entry.eventId) assert.ok(ADVENTURE_EVENTS[entry.eventId], `${entry.id} references missing event ${entry.eventId}.`);
  })));
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
  Math.random = () => 0.5;
  try {
    const result = useAbility(combat, character, "quickSlash");
    assert.equal(result.energy, created.energy - 1, "Quick Slash must spend one Energy.");
    assert.ok(result.pendingEffects.some((effect) => "damage" in effect && effect.targetId === created.enemies[0].instanceId), "Quick Slash must queue damage against the selected target.");
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
testStatusContracts();
testBasicPlayerAbility();
testStructuredEventOutcome();
console.log("Arkenfall regression checks passed.");
