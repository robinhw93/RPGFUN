import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { moveAdventureStage, normalizeAdventureExchange } from "../src/components/devtools/AdventureDevtool";
import { normalizeEventExchange } from "../src/components/devtools/EventDevtool";
import { normalizeItemExchange } from "../src/components/devtools/ItemDevtool";
import { GEAR_ICON_URLS, GEAR_ICON_VARIANTS, getGearIconCategory, getGearIconChoices } from "../src/components/GearSlotIcon";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, GEAR_SETS, ITEMS, TALENTS } from "../src/game/data";
import { canStartStoryAdventure, entryToNode, getAdventureStartingHp, getStoryAdventureAvailability, getStoryNodeIntroduction } from "../src/game/adventures";
import { getDerivedStats, INITIAL_GAME } from "../src/game/character";
import { getEffectiveDodgeChance, getFinalHitChance, rollHit } from "../src/game/combatMath";
import { getStatusAdjustedCombatStats } from "../src/game/combatStats";
import { createCombat, resolveCombatEvent, useAbility, useConsumable } from "../src/game/engine";
import { getInitialEventPresentationPhase, purchaseEventMerchantItem, resolveAdventureEventChoice, sellEventMerchantItem } from "../src/game/eventOutcomes";
import { getItemGoldCost, getItemSellValue, groupInventoryItems, isConsumableItem, isGearItem, isMiscItem } from "../src/game/items";
import { ITEM_ICON_URLS } from "../src/game/itemIcons";
import { grantCombatReward, rollCombatDropTables } from "../src/game/rewards";
import { addOrRefreshStatus, canApplyStatusEffect, createStatusEffect } from "../src/game/statusEffects";
import { craftTownItem, getItemCraftingRecipe, getTavernRestCost, getTownCraftingCatalog, getTownVendorStock, purchaseTavernMeal, purchaseTownItem, restAtArkenfallTavern, TAVERN_MEALS } from "../src/game/town";
import type { AdventureEventChoice, ConsumableItem, GameState, GearItem, ItemDropDefinition } from "../src/game/types";

function testGearIconLibrary() {
  assert.equal(Object.keys(GEAR_ICON_VARIANTS).length, 14, "Every supported gear category needs its own generated icon group.");
  const generatedUrls = Object.values(GEAR_ICON_VARIANTS).flat();
  assert.equal(generatedUrls.length, 70, "Every supported gear category needs five generated icon alternatives.");
  assert.equal(new Set(generatedUrls).size, generatedUrls.length, "Generated gear icon URLs must be unique.");
  generatedUrls.forEach((url) => assert.ok(existsSync(join(process.cwd(), "public", url)), `Missing generated gear icon ${url}.`));
  generatedUrls.forEach((url) => assert.ok(GEAR_ICON_URLS.includes(url), `${url} must be part of the preloaded gear icon catalog.`));

  const staff: GearItem = { kind: "gear", id: "test-staff", name: "Test Staff", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "staff", rarity: "common", description: "", stats: {} };
  assert.equal(getGearIconCategory(staff), "staff", "Weapon kind must drive the focused gear-art category.");
  assert.deepEqual(getGearIconChoices(staff).slice(-5), GEAR_ICON_VARIANTS.staff, "The Staff picker must expose all five generated Staff icons.");
}

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
  ITEMS.forEach((item) => assert.ok(ITEM_ICON_URLS[item.id], `${item.name} needs a generated inventory icon.`));
  const itemIds = new Set(ITEMS.map((item) => item.id));
  Object.values(ENEMIES).forEach((enemy) => (enemy.dropTable ?? []).forEach((drop) => {
    assert.ok(itemIds.has(drop.itemId), `${enemy.name} references missing drop item ${drop.itemId}.`);
    assert.ok(drop.chance >= 0 && drop.chance <= 100, `${enemy.name} has an invalid drop chance.`);
  }));
  ADVENTURES.forEach((adventure) => {
    assert.ok(adventure.id, "Every adventure needs an internal ID.");
    assert.equal(new Set(adventure.stages.map((stage) => stage.id)).size, adventure.stages.length, `${adventure.name} stage IDs must be unique.`);
    adventure.stages.forEach((stage) => {
      (stage.dropTable ?? []).forEach((drop) => {
        assert.ok(itemIds.has(drop.itemId), `${stage.name} references missing drop item ${drop.itemId}.`);
        assert.ok(drop.chance >= 0 && drop.chance <= 100, `${stage.name} has an invalid drop chance.`);
      });
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
      { kind: "consumable", id: "", name: "Field Tonic", rarity: "common", description: "", iconUrl: "/assets/items/minor-healing-potion.webp", effects: [{ type: "heal", amount: 2 }] },
      { kind: "misc", id: "", name: "Field Token", rarity: "uncommon", description: "A keepsake.", iconUrl: "/assets/items/wisp-essence.webp" },
      { kind: "gear", id: "", name: "Legendary Crown", slot: "head", rarity: "legendary", description: "A relic.", stats: {} },
    ],
  });
  assert.equal(exchange.sets[0].id, "field-kit");
  assert.equal(exchange.items[0].id, "field-hood");
  assert.equal(exchange.items[1].id, "field-tonic");
  assert.equal(exchange.items[2].id, "field-token");
  assert.equal(exchange.items[3].id, "legendary-crown");
  assert.equal(exchange.items[0].goldCost, 12, "Old gear drafts must receive a sensible default Gold Cost.");
  assert.equal(exchange.items[1].goldCost, 8, "Old consumable drafts must receive a sensible default Gold Cost.");
  assert.equal(exchange.items[2].goldCost, 0, "Other items without a configured Gold Cost must remain valueless until priced.");
  assert.equal(exchange.items[3].goldCost, 300, "Legendary gear drafts must receive the highest default Gold Cost.");
  assert.equal(exchange.items[3].rarity, "legendary", "The Item Editor must preserve Legendary as a live rarity.");
  assert.equal(exchange.items[1].iconUrl, "/assets/items/minor-healing-potion.webp", "Consumable artwork selections must survive Item Editor normalization.");
  assert.equal(exchange.items[2].iconUrl, "/assets/items/wisp-essence.webp", "Other Item artwork selections must survive Item Editor normalization.");
  assert.equal(isMiscItem(exchange.items[2]), true, "Other items must retain their non-usable item type.");
  assert.equal(isGearItem(exchange.items[2]), false, "Other items must never be classified as gear.");
  assert.equal(isConsumableItem(exchange.items[2]), false, "Other items must never be classified as consumables.");
}

function testArkenfallTownCommerceAndCrafting() {
  const blacksmithStock = getTownVendorStock("blacksmith");
  const alchemistStock = getTownVendorStock("alchemist");
  assert.ok(blacksmithStock.some(isGearItem), "The Blacksmith must expose assigned gear stock.");
  assert.ok(alchemistStock.some(isConsumableItem), "The Alchemist must expose assigned consumable stock.");

  const soldItem = blacksmithStock[0];
  const purchaseState: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: { ...structuredClone(INITIAL_GAME.character), gold: getItemGoldCost(soldItem) + 5, inventory: [] },
  };
  const purchased = purchaseTownItem(purchaseState, "blacksmith", soldItem.id);
  assert.equal(purchased.success, true, "A town vendor must sell assigned stock when the character can afford it.");
  assert.equal(purchased.state.character.gold, 5, "Town purchases must deduct the full configured Gold Cost.");
  assert.equal(purchased.state.character.inventory[0]?.id, soldItem.id, "A purchased item must enter the persistent Inventory.");

  const recipeItem = getTownCraftingCatalog("blacksmith")[0];
  const recipe = getItemCraftingRecipe(recipeItem);
  assert.ok(recipe, "The Blacksmith regression requires a live recipe.");
  const materials = recipe.ingredients.flatMap((ingredient) => {
    const definition = ITEMS.find((item) => item.id === ingredient.itemId);
    assert.ok(definition, `Recipe material ${ingredient.itemId} must exist.`);
    return Array.from({ length: ingredient.quantity }, () => structuredClone(definition));
  });
  const craftingState = { ...purchaseState, character: { ...purchaseState.character, inventory: materials } };
  const crafted = craftTownItem(craftingState, "blacksmith", recipeItem.id);
  assert.equal(crafted.success, true, "Crafting must succeed when every required material is present.");
  assert.deepEqual(crafted.state.character.inventory.map((item) => item.id), [recipeItem.id], "Crafting must consume exact ingredient quantities and add one crafted item.");
  assert.equal(craftTownItem(purchaseState, "blacksmith", recipeItem.id).success, false, "Crafting must fail without the required materials.");

  const maxHp = getDerivedStats(purchaseState.character).maxHp;
  const restCost = getTavernRestCost(1, maxHp);
  const wounded = { ...purchaseState, character: { ...purchaseState.character, gold: restCost }, adventure: { ...purchaseState.adventure, carryHp: 1 } };
  const rested = restAtArkenfallTavern(wounded);
  assert.equal(rested.success, true, "The tavern must heal a wounded character between adventures.");
  assert.equal(rested.state.adventure.carryHp, maxHp, "Tavern rest must restore carried Health to the derived maximum.");
  assert.equal(rested.state.character.gold, 0, "Tavern rest must cost one Gold per three missing Health, rounded up.");
  assert.equal(getTavernRestCost(maxHp - 4, maxHp), 2, "Partial groups of three missing Health must still cost one Gold.");
  assert.equal(restAtArkenfallTavern({ ...wounded, character: { ...wounded.character, gold: restCost - 1 } }).success, false, "Rest must fail atomically when the character cannot afford full recovery.");

  assert.deepEqual(TAVERN_MEALS.map((meal) => meal.status), ["strengthened", "fierce", "regenerate"], "The tavern menu must cover all three requested next-combat buffs.");
  assert.ok(TAVERN_MEALS.every((meal) => meal.cost >= 5 && meal.cost <= 10), "Every tavern meal must cost between 5 and 10 Gold.");
  const mealBudget = TAVERN_MEALS.reduce((sum, meal) => sum + meal.cost, 0);
  let mealState: GameState = { ...structuredClone(INITIAL_GAME), characterCreated: true, character: { ...structuredClone(INITIAL_GAME.character), gold: mealBudget } };
  TAVERN_MEALS.forEach((meal) => {
    const ordered = purchaseTavernMeal(mealState, meal.id);
    assert.equal(ordered.success, true, `${meal.name} must be purchasable between adventures.`);
    mealState = ordered.state;
  });
  assert.equal(mealState.character.gold, 0, "Ordering meals must deduct each listed price.");
  assert.deepEqual(mealState.adventure.nextCombatPlayerStatuses, TAVERN_MEALS.map((meal) => ({ status: meal.status, stacks: 1 })), "Meals must queue their buffs for the next combat.");
  assert.equal(purchaseTavernMeal(mealState, TAVERN_MEALS[0].id).success, false, "A non-stackable meal benefit must not be charged twice before combat.");
  const mealCombat = createCombat(mealState.character, ["dummy"], undefined, { playerStatuses: mealState.adventure.nextCombatPlayerStatuses });
  assert.deepEqual(mealCombat.playerStatuses.map((status) => status.id), TAVERN_MEALS.map((meal) => meal.status), "Queued tavern meal buffs must become real combat statuses.");
  assert.equal(getAdventureStartingHp(50, 17), 17, "Starting another adventure must preserve carried Health instead of healing automatically.");
  assert.equal(getAdventureStartingHp(50, null), 50, "A fresh character without carried Health must begin at full Health.");
  assert.equal(getAdventureStartingHp(50, 80), 50, "Carried Health must never exceed current Max Health.");
}

function testStoryEncounterIntroduction() {
  const entry = ADVENTURES[0].stages[0].entries[0];
  const node = entryToNode(entry);
  assert.equal(getStoryNodeIntroduction(node, "Generated enemy wording."), entry.description, "A story combat must introduce the editor-authored entry description.");
  assert.equal(getStoryNodeIntroduction({ ...node, description: "" }, "Generated enemy wording."), "Generated enemy wording.", "An empty combat description must retain a readable fallback.");
  assert.equal(getStoryNodeIntroduction({ ...node, type: "event", enemies: undefined }, "Generated event wording."), "", "Events must not use the travel transition's generic discovery announcement.");
}

function testCompletedAdventureAvailability() {
  const firstAdventure = ADVENTURES[0];
  assert.equal(getStoryAdventureAvailability(firstAdventure, []), "available", "An unfinished adventure without a missing prerequisite must be playable.");
  assert.equal(getStoryAdventureAvailability(firstAdventure, [firstAdventure.id]), "completed", "A finished adventure must retain its Completed presentation state.");
  assert.equal(canStartStoryAdventure(firstAdventure, [firstAdventure.id]), true, "A completed adventure must remain replayable.");
  const lockedAdventure = { ...firstAdventure, id: "locked-regression-adventure", prerequisiteAdventureId: "required-regression-adventure" };
  assert.equal(getStoryAdventureAvailability(lockedAdventure, []), "locked", "A missing prerequisite must keep an unfinished adventure locked.");
  assert.equal(canStartStoryAdventure(lockedAdventure, []), false, "A missing prerequisite must still block an adventure start.");
  assert.equal(getStoryAdventureAvailability(lockedAdventure, ["required-regression-adventure"]), "available", "Completing a prerequisite must unlock the next unfinished adventure.");
}

function testStoryReplayRewards() {
  const definition = ADVENTURES[0];
  const entry = definition.stages[0].entries.find((candidate) => candidate.enemyIds?.length && candidate.reward);
  assert.ok(entry?.enemyIds?.length && entry.reward, "Replay reward regression requires a rewarded combat entry.");

  const replayCharacter = { ...structuredClone(INITIAL_GAME.character), completedAdventureIds: [definition.id] };
  const replayCombat = createCombat(replayCharacter, entry.enemyIds);
  const replayState: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: replayCharacter,
    adventure: {
      ...structuredClone(INITIAL_GAME.adventure),
      mode: "story",
      adventureId: definition.id,
      active: true,
      nodeIndex: 0,
      stageEntryId: entry.id,
      combat: { ...replayCombat, outcome: "victory" },
    },
  };
  const replayRewarded = grantCombatReward(replayState, 1, () => 1);
  const expectedReplayXp = Math.floor(entry.reward.experience * 0.1);
  const expectedReplayGold = Math.floor(entry.reward.gold * 0.5);
  assert.equal(replayRewarded.adventure.pendingReward?.experience, expectedReplayXp, "Replay combat rewards must display 10% of their original experience.");
  assert.equal(replayRewarded.adventure.pendingReward?.gold, expectedReplayGold, "Replay combat rewards must display 50% of their original gold, rounded down.");
  assert.equal(replayRewarded.character.xp, expectedReplayXp, "Replay combat rewards must grant exactly the reduced experience.");
  assert.equal(replayRewarded.character.gold, replayCharacter.gold + expectedReplayGold, "Replay combat rewards must grant exactly the reduced gold.");

  const firstRunCharacter = structuredClone(INITIAL_GAME.character);
  const firstRunCombat = createCombat(firstRunCharacter, entry.enemyIds);
  const firstRunRewarded = grantCombatReward({
    ...replayState,
    character: firstRunCharacter,
    adventure: { ...replayState.adventure, combat: { ...firstRunCombat, outcome: "victory" } },
  }, 2, () => 1);
  assert.equal(firstRunRewarded.adventure.pendingReward?.experience, entry.reward.experience, "A first story completion must retain its full experience reward.");
  assert.equal(firstRunRewarded.adventure.pendingReward?.gold, entry.reward.gold, "A first story completion must retain its full gold reward.");

  const replayEventState: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: replayCharacter,
    adventure: { ...structuredClone(INITIAL_GAME.adventure), mode: "story", adventureId: definition.id, active: true },
  };
  const replayEventChoice: AdventureEventChoice = {
    id: "replay-experience",
    label: "Accept the lesson",
    description: "You listen carefully.",
    resolution: "direct",
    stat: "intelligence",
    threshold: 1,
    success: { text: "You learn from the path.", effects: [] },
    failure: { text: "Unused.", effects: [] },
    outcome: { text: "You learn from the path.", effects: [{ type: "gainExperience", amount: 53 }] },
  };
  const replayEventRewarded = resolveAdventureEventChoice(replayEventState, replayEventChoice);
  assert.equal(replayEventRewarded.character.xp, 5, "Positive event experience must use the same 10% replay rule and round down.");
}

function testOpposedHitAndDodge() {
  const startingHitChance = 0.95 + 5 * 0.005;
  const wolfDodgeChance = 0.1;
  assert.ok(Math.abs(getFinalHitChance(startingHitChance, wolfDodgeChance) - 0.875) < 1e-10, "97.5% raw Hit against 10% Dodge must resolve to 87.5% final Hit Chance.");
  assert.equal(getEffectiveDodgeChance(0.2, 0.6), 0.5, "Permanent and temporary Dodge must share the global 50% cap.");
  assert.equal(getFinalHitChance(1.55, 0.4), 1, "Uncapped raw Hit must be able to fully overcome Dodge.");
  assert.equal(getFinalHitChance(0.1, 0.5), 0.2, "Final Hit Chance must retain its 20% minimum.");
  assert.equal(rollHit(startingHitChance, wolfDodgeChance, () => 0.8749), true, "A roll below final Hit Chance must hit.");
  assert.equal(rollHit(startingHitChance, wolfDodgeChance, () => 0.875), false, "A roll at final Hit Chance must miss.");
}

function testStatusAdjustedCombatStats() {
  const adjusted = getStatusAdjustedCombatStats({
    armor: 10,
    hitChance: 1,
    dodgeChance: 0.1,
    critChance: 0.05,
    energyRegen: 3,
    initiativeBonus: 7,
  }, [
    createStatusEffect("fierce"),
    createStatusEffect("evasion"),
    createStatusEffect("shatter"),
    createStatusEffect("blind"),
    createStatusEffect("exhausted"),
    createStatusEffect("slowed"),
  ]);
  assert.equal(adjusted.armor, 5, "Combat stat display must include temporary Armor debuffs.");
  assert.equal(adjusted.hitChance, 0.25, "Combat stat display must include Blind.");
  assert.equal(adjusted.dodgeChance, 0.5, "Combat stat display must include temporary Dodge and its cap.");
  assert.equal(adjusted.critChance, 0.25, "Combat stat display must include Fierce.");
  assert.equal(adjusted.energyRegen, 1, "Combat stat display must include Exhausted.");
  assert.equal(adjusted.initiativeBonus, 0, "Combat stat display must include Slowed.");
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
  assert.deepEqual(purchased.adventure.eventMerchant?.purchasedItemIds, [item.id], "A purchased merchant slot must remain sold out.");
  assert.equal(purchaseEventMerchantItem(purchased, item.id), purchased, "A sold-out merchant item cannot be purchased twice.");
  assert.equal(purchaseEventMerchantItem(purchased, "not-for-sale"), purchased, "Items outside merchant stock must not be purchasable.");
  const expectedSellValue = Math.max(1, Math.floor(getItemGoldCost(item) * 0.25));
  assert.equal(getItemSellValue(item), expectedSellValue, "Merchant sell value must be 25% of Gold Cost, rounded down to whole Gold.");
  const duplicated = { ...purchased, character: { ...purchased.character, inventory: [...purchased.character.inventory, structuredClone(item)] } };
  const soldOnce = sellEventMerchantItem(duplicated, item.id);
  assert.equal(soldOnce.character.gold, 5 + expectedSellValue, "Selling must immediately add the item's sell value.");
  assert.equal(soldOnce.character.inventory.length, 1, "Selling must remove exactly one inventory copy.");
  const soldTwice = sellEventMerchantItem(soldOnce, item.id);
  assert.equal(soldTwice.character.inventory.length, 0, "Duplicate inventory copies must be sellable one at a time.");
  assert.equal(sellEventMerchantItem(soldTwice, item.id), soldTwice, "An item that is no longer owned cannot be sold again.");
}

function testResolvedMerchantPresentation() {
  const result = { resolution: "direct" as const, choiceId: "browse", outcomeText: "The merchant opens their pack." };
  assert.equal(getInitialEventPresentationPhase(result, 1), "merchant", "Resolved merchant stock must open immediately.");
  assert.equal(getInitialEventPresentationPhase(result, 0), "outcome", "A resolved non-merchant event must show its outcome.");
  assert.equal(getInitialEventPresentationPhase(null, 1), "title", "An unresolved event must begin with its title.");
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

function testIndependentItemDrops() {
  const firstItem = ITEMS[0];
  const secondItem = ITEMS[1];
  assert.ok(firstItem && secondItem, "Drop-table regression requires at least two live items.");
  const enemyTables: ItemDropDefinition[][] = [
    [{ itemId: firstItem.id, chance: 100 }],
    [{ itemId: firstItem.id, chance: 100 }, { itemId: secondItem.id, chance: 2 }],
  ];
  const rolls = [0.99, 0.5, 0.01, 0.05];
  const loot = rollCombatDropTables(enemyTables, [{ itemId: secondItem.id, chance: 5 }], () => rolls.shift() ?? 1);
  assert.deepEqual(loot.map((item) => item.id), [firstItem.id, firstItem.id, secondItem.id], "Every enemy instance and stage entry must roll independently, including exact percentage boundaries.");

  const character = { ...structuredClone(INITIAL_GAME.character), inventory: [] };
  const combat = createCombat(character, ["dummy"]);
  const state: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character,
    adventure: {
      ...structuredClone(INITIAL_GAME.adventure),
      mode: "story",
      active: true,
      stageEntryId: ADVENTURES[0].stages[0].entries[0].id,
      combat: { ...combat, outcome: "victory", enemies: combat.enemies.map((enemy) => ({ ...enemy, dropTable: [{ itemId: firstItem.id, chance: 100 }] })) },
    },
  };
  const rewardRolls = [0];
  const rewarded = grantCombatReward(state, 1, () => rewardRolls.shift() ?? 1);
  assert.equal(rewarded.adventure.pendingReward?.loot.length, 1, "Rolled loot must be captured by the score-screen reward.");
  assert.equal(rewarded.character.inventory.at(-1)?.id, firstItem.id, "Rolled loot must enter the character inventory immediately.");
  assert.equal(grantCombatReward(rewarded, 2, () => 0).character.inventory.length, 1, "A resolved combat reward must never reroll or duplicate loot.");

  const grouped = groupInventoryItems([firstItem, structuredClone(firstItem), secondItem]);
  assert.deepEqual(grouped.map(({ item, count }) => [item.id, count]), [[firstItem.id, 2], [secondItem.id, 1]], "Duplicate score-screen loot must group by item without changing order.");
}

testContentIntegrity();
testGearIconLibrary();
testStoryEncounterIntroduction();
testCompletedAdventureAvailability();
testStoryReplayRewards();
testOpposedHitAndDodge();
testStatusAdjustedCombatStats();
testAdventureEditorRepairsInternalIds();
testAdventureEditorReordersStages();
testEventEditorRepairsInternalIds();
testItemEditorRepairsInternalIds();
testArkenfallTownCommerceAndCrafting();
testStatusContracts();
testBasicPlayerAbility();
testStructuredEventOutcome();
testDirectEventMerchant();
testResolvedMerchantPresentation();
testCombatConsumable();
testIndependentItemDrops();
console.log("Arkenfall regression checks passed.");
