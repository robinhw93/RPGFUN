import assert from "node:assert/strict";
import "./item-scaling-tests";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getScoreGearInspection } from "../src/components/adventure/AdventureView";
import { canonicalAdventureExchange, mergeAdventureDraftWithCanonical, moveAdventureStage, normalizeAdventureExchange } from "../src/components/devtools/AdventureDevtool";
import { canonicalEnemyExchange, mergeEnemyDraftWithCanonical, normalizeEnemyExchange, synchronizeEnemyDraftWithCanonical } from "../src/components/devtools/EnemyDevtool";
import { canonicalEventExchange, mergeEventDraftWithCanonical, normalizeEventExchange } from "../src/components/devtools/EventDevtool";
import { canonicalItemExchange, mergeItemDraftWithCanonical, normalizeItemExchange, synchronizeItemDraftWithCanonical } from "../src/components/devtools/ItemDevtool";
import type { AdventureExchange, EventExchange, ItemExchange } from "../src/components/devtools/shared";
import { canonicalQuestExchange, normalizeQuestExchange } from "../src/components/devtools/QuestDevtool";
import { GEAR_ICON_URLS, GEAR_ICON_VARIANTS, getGearIconCategory, getGearIconChoices } from "../src/components/GearSlotIcon";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, GEAR_SETS, ITEMS, QUESTLINES, QUESTS, TALENTS } from "../src/game/data";
import { canStartStoryAdventure, entryToNode, getAdventureStartingHp, getAdventureTravelText, getStoryAdventureAvailability, getStoryNodeIntroduction } from "../src/game/adventures";
import { ARENA_CHAMPION_MAX_HP, ARENA_SCORE_LIMIT, ARENA_TURN_LIMIT, getArenaExperience, getArenaScores, grantArenaChallengeReward, resetArenaAttemptAfterAdventure, startArenaChallenge } from "../src/game/arena";
import { getDerivedStats, INITIAL_GAME } from "../src/game/character";
import { chooseStartingClass, getUnlockedStartingClass, hasSpentIntroductionTalentPoint } from "../src/game/characterIntroduction";
import { getCharacterCombatFeatures } from "../src/game/combatFeatures";
import { grantItemForTesting, levelUpCharacterForTesting } from "../src/game/developerTools";
import { getEffectiveDodgeChance, getFinalHitChance, rollHit } from "../src/game/combatMath";
import { getStatusAdjustedCombatStats } from "../src/game/combatStats";
import { applyAbilityFlatDamage } from "../src/game/combat/damage";
import { createCombat, endPlayerTurn, getEnemyStartingEnergy, resolveCombatEvent, takeEnemyTurn, useAbility, useConsumable } from "../src/game/engine";
import { CHAINED_ENEMY_MIN_LEVEL, CHAINED_ON_ATTACK_CHANCE, getReadyEnemyAbility, shouldApplyChainedOnEnemyAttack, type EnemyAiContext } from "../src/game/combat/enemyActions";
import { getInitialEventPresentationPhase, purchaseEventMerchantItem, resolveAdventureEventChoice, sellEventMerchantItem } from "../src/game/eventOutcomes";
import { fleeCombat } from "../src/game/flee";
import { acquireItem, acquireItems, getAutomaticEquipSlot, getItemGoldCost, getItemSellValue, groupInventoryItems, isConsumableItem, isGearItem, isMiscItem } from "../src/game/items";
import { CONSUMABLE_POTION_ARTWORK_URLS, CRAFTING_MATERIAL_ARTWORK_URLS, ITEM_ICON_URLS } from "../src/game/itemIcons";
import { grantCombatReward, rollCombatDropTables, rollCombatLoot } from "../src/game/rewards";
import { acceptQuest, getQuestAvailability, getQuestBoardPostings, MAX_QUEST_BOARD_POSTINGS, recordQuestAdventureCompletion, recordQuestEnemyDefeats, turnInQuest } from "../src/game/quests";
import { addOrRefreshStatus, canApplyStatusEffect, createStatusEffect, decrementStatusDurations, getStatusDamage } from "../src/game/statusEffects";
import { canCraftTownItem, craftTownItem, gambleAtArkenfallTavern, getItemCraftingRecipe, getTavernRestCost, getTavernRestOffer, getTownCraftingCatalog, getTownVendorStock, isTownCraftingRecipeUnlocked, isTownVendorItemUnlocked, purchaseTavernMeal, purchaseTownItem, resetTavernGamblingAfterAdventure, restAtArkenfallTavern, sellTownItem, TAVERN_MEALS } from "../src/game/town";
import type { AdventureEventChoice, ConsumableItem, GameState, GearItem, InventoryItem, ItemDropDefinition } from "../src/game/types";
import { getItemNameClass, getItemStatLines } from "../src/ui/gameUi";

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

function testDeveloperCharacterTools() {
  const character = {
    ...structuredClone(INITIAL_GAME.character),
    level: 3,
    xp: 75,
    unspentStatPoints: 2,
    talentPoints: 1,
    inventory: [],
  };
  const leveled = levelUpCharacterForTesting(character);
  assert.equal(leveled.level, 4, "Developer Level up must advance exactly one level.");
  assert.equal(leveled.xp, 0, "Developer Level up must finish at the start of the new level.");
  assert.equal(leveled.unspentStatPoints, 5, "Developer Level up must grant the normal three Attribute Points.");
  assert.equal(leveled.talentPoints, 2, "Developer Level up must grant the normal one Talent Point.");

  const item = ITEMS[0];
  assert.ok(item, "Developer Grant item requires at least one live item.");
  const granted = grantItemForTesting(character, item, 3);
  assert.equal(granted.inventory.length, 3, "Developer Grant item must add the requested quantity.");
  assert.ok(granted.inventory.every((candidate) => candidate.id === item.id), "Every granted copy must use the selected live item.");
  assert.notEqual(granted.inventory[0], granted.inventory[1], "Granted inventory copies must not share object identity.");
  assert.equal(grantItemForTesting(character, item, Number.NaN).inventory.length, 1, "Invalid developer quantities must safely grant one copy.");

  const gear = ITEMS.find(isGearItem);
  assert.ok(gear, "Developer Grant item auto-equip regression requires live gear.");
  const grantedGear = grantItemForTesting({ ...character, equipment: {} }, gear, 2);
  assert.ok(Object.values(grantedGear.equipment).some((equipped) => equipped?.id === gear.id), "The first granted gear copy must equip when its slot is empty.");
  assert.equal(grantedGear.inventory.filter((candidate) => candidate.id === gear.id).length, 1, "Additional granted copies must remain in Inventory after the slot is filled.");
}

function testAutomaticGearAcquisition() {
  const emptyCharacter = { ...structuredClone(INITIAL_GAME.character), inventory: [], equipment: {} };
  const head: GearItem = { kind: "gear", id: "auto-head", name: "Auto Head", slot: "head", armorMaterial: "cloth", rarity: "common", description: "", stats: {} };
  const ring: GearItem = { kind: "gear", id: "auto-ring", name: "Auto Ring", slot: "ring", rarity: "common", description: "", stats: {} };
  const dagger: GearItem = { kind: "gear", id: "auto-dagger", name: "Auto Dagger", slot: "mainHand", weaponEquipType: "oneHand", weaponKind: "dagger", rarity: "common", description: "", stats: {} };
  const shield: GearItem = { kind: "gear", id: "auto-shield", name: "Auto Shield", slot: "offHand", weaponEquipType: "offHand", weaponKind: "shield", rarity: "common", description: "", stats: {} };
  const staff: GearItem = { kind: "gear", id: "auto-staff", name: "Auto Staff", slot: "mainHand", weaponEquipType: "twoHand", weaponKind: "staff", rarity: "common", description: "", stats: {} };

  const firstHead = acquireItem(emptyCharacter, head);
  assert.equal(firstHead.equippedSlot, "head", "New armor must identify its empty equipment slot.");
  assert.equal(firstHead.character.equipment.head?.id, head.id, "New armor must equip directly into an empty slot.");
  assert.equal(firstHead.character.inventory.length, 0, "Automatically equipped gear must not also remain in Inventory.");
  const secondHead = acquireItem(firstHead.character, { ...head, id: "second-head" });
  assert.equal(secondHead.equippedSlot, null, "Gear must never replace an occupied slot automatically.");
  assert.equal(secondHead.character.equipment.head?.id, head.id, "The existing equipped item must remain untouched.");
  assert.equal(secondHead.character.inventory[0]?.id, "second-head", "Gear without an empty slot must enter Inventory.");

  const rings = acquireItems(emptyCharacter, [ring, { ...ring, id: "auto-ring-2" }, { ...ring, id: "auto-ring-3" }]);
  assert.equal(rings.equipment.ring1?.id, ring.id, "The first ring must fill Ring 1.");
  assert.equal(rings.equipment.ring2?.id, "auto-ring-2", "The second ring must fill Ring 2.");
  assert.equal(rings.inventory[0]?.id, "auto-ring-3", "Further rings must enter Inventory.");

  const dualWield = acquireItems(emptyCharacter, [dagger, { ...dagger, id: "auto-dagger-2" }, { ...dagger, id: "auto-dagger-3" }]);
  assert.equal(dualWield.equipment.mainHand?.id, dagger.id, "The first one-hand weapon must fill Main Hand.");
  assert.equal(dualWield.equipment.offHand?.id, "auto-dagger-2", "The second one-hand weapon must fill Off Hand.");
  assert.equal(dualWield.inventory[0]?.id, "auto-dagger-3", "A third one-hand weapon must enter Inventory.");

  const twoHanded = acquireItem(emptyCharacter, staff);
  assert.equal(twoHanded.character.equipment.mainHand?.id, staff.id, "A two-hand weapon must equip when both weapon slots are free.");
  assert.equal(getAutomaticEquipSlot(twoHanded.character, shield), null, "A two-hand weapon must lock automatic Off Hand equipment.");
  const shieldFirst = acquireItem(emptyCharacter, shield).character;
  const blockedStaff = acquireItem(shieldFirst, staff);
  assert.equal(blockedStaff.equippedSlot, null, "A two-hand weapon must not displace an occupied Off Hand slot automatically.");
  assert.equal(blockedStaff.character.inventory[0]?.id, staff.id, "A blocked two-hand weapon must enter Inventory.");

  const consumable = ITEMS.find(isConsumableItem);
  assert.ok(consumable, "Automatic acquisition regression requires a consumable.");
  const carriedConsumable = acquireItem(emptyCharacter, consumable);
  assert.equal(carriedConsumable.equippedSlot, null, "Consumables must never auto-equip.");
  assert.equal(carriedConsumable.character.inventory[0]?.id, consumable.id, "Consumables must continue entering Inventory.");
}

function testNewCharacterIntroductionDefaults() {
  assert.equal(INITIAL_GAME.characterIntroductionStep, "class", "A new character must begin at the class-selection introduction step.");
  assert.equal(INITIAL_GAME.character.unspentStatPoints, 2, "A new character must receive two starting Attribute Points.");
  assert.equal(INITIAL_GAME.character.talentPoints, 1, "A new character must receive one starting Talent Point.");
  assert.deepEqual(INITIAL_GAME.character.unlockedTalents, ["origin"], "Only Wayfarer's Spark may be unlocked before choosing a class.");
  assert.equal(Object.values(INITIAL_GAME.character.equipment).filter(Boolean).length, 0, "The starting-item recommendation requires a new character to begin without equipped gear.");
  const startingClasses = TALENTS.filter((talent) => talent.id !== "origin" && talent.kind === "class" && talent.requires.includes("origin"));
  assert.equal(startingClasses.length, 4, "The introduction must offer four class nodes connected to Wayfarer's Spark.");
  assert.ok(startingClasses.every((talent) => talent.cost === 1), "Every starting class node must cost the single starting Talent Point.");

  const arcanist = chooseStartingClass(structuredClone(INITIAL_GAME.character), "arcanist_1");
  assert.equal(getUnlockedStartingClass(arcanist)?.id, "arcanist_1", "Choosing Arcanist must unlock its real class node.");
  assert.equal(arcanist.talentPoints, 1, "Choosing a starting class must preserve the point used for the first connected Talent.");
  assert.ok(arcanist.equippedAbilities.includes("arcaneBolt"), "Choosing Arcanist must equip Arcane Bolt.");
  assert.equal(getDerivedStats(arcanist).intelligence, 7, "Choosing Arcanist must immediately apply its +2 Intelligence class bonus.");
  assert.equal(hasSpentIntroductionTalentPoint(arcanist), false, "The introduction cannot finish before the post-class Talent Point is spent.");
  assert.deepEqual(chooseStartingClass(arcanist, "brute_1"), arcanist, "A starting class cannot be replaced after it is chosen.");
  assert.deepEqual(chooseStartingClass(structuredClone(INITIAL_GAME.character), "cultist_1"), INITIAL_GAME.character, "Cultist must remain unavailable while it is marked Coming Soon.");

  const connectedTalent = TALENTS.find((talent) => talent.kind !== "class" && talent.requires.includes("arcanist_1"));
  assert.ok(connectedTalent, "Arcanist must have a connected first Talent for the introduction.");
  const afterFirstTalent = {
    ...arcanist,
    talentPoints: 0,
    unlockedTalents: [...arcanist.unlockedTalents, connectedTalent.id],
  };
  assert.equal(hasSpentIntroductionTalentPoint(afterFirstTalent), true, "Spending the post-class Talent Point must complete the Talent step.");
}

function testAttributeAndAfflictionScaling() {
  const character = {
    ...structuredClone(INITIAL_GAME.character),
    baseStats: { strength: 10, agility: 10, intelligence: 10, vitality: 5, luck: 5 },
  };
  const derived = getDerivedStats(character);
  assert.equal(derived.physicalPower, 8, "Strength must grant 0.5 and Agility 0.25 Physical Power per point before whole-number rounding.");
  assert.equal(derived.magicalPower, 5, "Intelligence must grant 0.5 Spell Power per point before whole-number rounding.");

  assert.equal(getStatusDamage(createStatusEffect("bleed", { stacks: 2, sourcePower: 40 })), 8, "Bleed must scale at 7.5% Physical Power per stack.");
  assert.equal(getStatusDamage(createStatusEffect("poison", { stacks: 2, sourcePower: 80 })), 20, "Poison must scale at 11.25% Spell Power per stack.");
  assert.equal(getStatusDamage(createStatusEffect("burn", { stacks: 2, sourcePower: 40 })), 10, "Burn must scale at 10% Spell Power per stack.");
}

function testCraftingMaterialArtworkLibrary() {
  assert.equal(CRAFTING_MATERIAL_ARTWORK_URLS.length, 21, "Metal Scrap and twenty reusable crafting-material icons must be available.");
  assert.equal(new Set(CRAFTING_MATERIAL_ARTWORK_URLS).size, CRAFTING_MATERIAL_ARTWORK_URLS.length, "Crafting-material icon URLs must be unique.");
  CRAFTING_MATERIAL_ARTWORK_URLS.forEach((url) => assert.ok(existsSync(join(process.cwd(), "public", url)), `Missing crafting-material icon ${url}.`));
  assert.equal(ITEM_ICON_URLS["item-ms0ss0dt-z4bke"], "/assets/items/metal-scrap.webp", "Metal Scrap must use its dedicated artwork.");
}

function testConsumablePotionArtworkLibrary() {
  assert.equal(CONSUMABLE_POTION_ARTWORK_URLS.length, 20, "Four potion colors must each expose Minor, Normal, Greater, Major, and Superior artwork.");
  assert.equal(new Set(CONSUMABLE_POTION_ARTWORK_URLS).size, CONSUMABLE_POTION_ARTWORK_URLS.length, "Potion artwork URLs must be unique.");
  CONSUMABLE_POTION_ARTWORK_URLS.forEach((url) => assert.ok(existsSync(join(process.cwd(), "public", url)), `Missing generated potion artwork ${url}.`));
  assert.equal(CONSUMABLE_POTION_ARTWORK_URLS[0], "/assets/items/minor-healing-potion.webp", "The existing red Minor Healing Potion must remain the first potion form.");
}

function testScoreScreenGearInspection() {
  const drop: GearItem = { kind: "gear", id: "score-drop", name: "Score Drop", slot: "head", rarity: "rare", description: "", stats: { strength: 2 } };
  const equippedCharacter = {
    ...structuredClone(INITIAL_GAME.character),
    inventory: [],
    equipment: { ...structuredClone(INITIAL_GAME.character.equipment), head: structuredClone(drop) },
  };
  const equippedInspection = getScoreGearInspection(drop, equippedCharacter);
  assert.equal(equippedInspection.canEquip, false, "Automatically equipped score-screen loot must not expose a duplicate Equip action.");
  assert.equal(equippedInspection.equippedSlot, "head", "Automatically equipped score-screen loot must be recognized in its live slot.");

  const inventoryCharacter = { ...equippedCharacter, inventory: [structuredClone(drop)] };
  const inventoryInspection = getScoreGearInspection(drop, inventoryCharacter);
  assert.equal(inventoryInspection.canEquip, true, "A score-screen gear copy remaining in Inventory must expose Equip actions.");
  assert.equal(inventoryInspection.equippedSlot, undefined, "An Inventory copy must remain independently equippable when an identical copy is already equipped.");
  assert.equal(inventoryInspection.item, inventoryCharacter.inventory[0], "Score-screen Equip must act on the live Inventory copy.");
}

function testGearCombatStatsArePresented() {
  const boots: GearItem = {
    kind: "gear",
    id: "test-dusty-boots",
    name: "Dusty Boots",
    slot: "boots",
    rarity: "common",
    description: "",
    stats: {},
    combat: { passive: { initiative: 3, dodgeChance: 0.01 } },
  };
  const lines = getItemStatLines(boots);
  assert.deepEqual(lines.find((line) => line.label === "Initiative"), { label: "Initiative", value: 3, icon: "initiativeBonus", percent: undefined });
  assert.deepEqual(lines.find((line) => line.label === "Dodge Chance"), { label: "Dodge Chance", value: 0.01, icon: "dodgeChance", percent: true });
}

function testItemNameRarityClasses() {
  (["common", "uncommon", "rare", "epic", "legendary"] as const).forEach((rarity) => {
    assert.equal(getItemNameClass({ rarity }), `item-name item-name-${rarity}`, `${rarity} item names must use the global rarity presentation class.`);
  });
}

function testPassiveStatAggregationIsPure() {
  const nimbleCharacter = structuredClone(INITIAL_GAME.character);
  nimbleCharacter.unlockedTalents = ["origin", "shadow_1", "talent_1", "talent_254", "talent_255", "talent_256"];

  const firstFeatures = getCharacterCombatFeatures(nimbleCharacter);
  const secondFeatures = getCharacterCombatFeatures(nimbleCharacter);
  assert.notEqual(firstFeatures.passive, secondFeatures.passive, "Every feature aggregation must create a fresh passive result.");
  assert.notEqual(firstFeatures.passive.statMultipliers, secondFeatures.passive.statMultipliers, "Percentage attributes must never share mutable accumulator state.");
  assert.equal(firstFeatures.passive.statMultipliers.agility, 0.1, "Nimble 3 must contribute exactly 10% Agility.");
  assert.equal(secondFeatures.passive.statMultipliers.agility, 0.1, "Repeated aggregation must not accumulate Nimble 3 again.");

  firstFeatures.passive.statMultipliers.agility = 99;
  assert.equal(getCharacterCombatFeatures(nimbleCharacter).passive.statMultipliers.agility, 0.1, "Mutating one resolved feature bundle must not contaminate the next result.");

  for (let index = 0; index < 1_000; index += 1) {
    const derived = getDerivedStats(nimbleCharacter);
    assert.equal(derived.agility, 14, "Repeated stat reads must keep 13 flat Agility plus Nimble 3 at the same rounded value of 14.");
  }
  assert.equal(nimbleCharacter.baseStats.agility, 5, "Derived stat reads must never mutate saved base attributes.");

  const intellectCharacter = structuredClone(INITIAL_GAME.character);
  intellectCharacter.unlockedTalents = ["origin", "talent_248"];
  for (let index = 0; index < 100; index += 1) {
    assert.equal(getDerivedStats(intellectCharacter).intelligence, 6, "Sharpened Intellect 2 must remain a stable 10% Intelligence bonus.");
  }

  const cleanCharacter = structuredClone(INITIAL_GAME.character);
  const cleanDerived = getDerivedStats(cleanCharacter);
  assert.equal(cleanDerived.agility, 5, "One character's Agility multiplier must not leak into another character.");
  assert.equal(cleanDerived.intelligence, 5, "One character's Intelligence multiplier must not leak into another character.");
}

function testFleeCombatLossesAndReset() {
  const hood: GearItem = { kind: "gear", id: "flee-hood", name: "Flee Hood", slot: "head", rarity: "common", description: "", stats: {} };
  const chest: GearItem = { kind: "gear", id: "flee-chest", name: "Flee Chest", slot: "chest", rarity: "common", description: "", stats: {} };
  const combat = { ...createCombat(INITIAL_GAME.character, ["dummy"]), playerHp: 7, outcome: "active" as const };
  const state: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: {
      ...structuredClone(INITIAL_GAME.character),
      gold: 101,
      equipment: { head: hood, chest },
    },
    adventure: {
      ...structuredClone(INITIAL_GAME.adventure),
      active: true,
      nodeIndex: 4,
      stageEntryId: "flee-stage-entry",
      combat,
      eventResolved: true,
      nextCombatPlayerStatuses: [{ status: "fierce", stacks: 1 }],
    },
  };
  const rolls = [0, 0.49, 0.75];
  const result = fleeCombat(state, () => rolls.shift() ?? 0);
  assert.ok(result, "An active combat must be fleeable.");
  assert.equal(result.goldLossPercent, 50, "The minimum flee loss must be 50% of current Gold.");
  assert.equal(result.goldLost, 51, "Flee Gold loss must round up so the rolled percentage is fully lost.");
  assert.equal(result.state.character.gold, 50, "Fleeing must immediately deduct the rolled Gold loss.");
  assert.equal(result.lostItem?.id, chest.id, "A successful item-loss roll must remove one random equipped item.");
  assert.equal(result.state.character.equipment.chest, undefined, "The lost equipped item must be destroyed rather than moved to Inventory.");
  assert.equal(result.state.character.equipment.head?.id, hood.id, "Fleeing must not remove more than one equipped item.");
  assert.equal(result.state.adventure.active, false, "Fleeing must abandon the active adventure.");
  assert.equal(result.state.adventure.nodeIndex, 0, "Fleeing must reset adventure progress to its first stage.");
  assert.equal(result.state.adventure.stageEntryId, null, "Fleeing must discard the selected stage possibility.");
  assert.equal(result.state.adventure.combat, null, "Fleeing must end combat without triggering defeat.");
  assert.equal(result.state.adventure.carryHp, 7, "The character must reach town with their remaining combat Health.");
  assert.deepEqual(result.state.adventure.nextCombatPlayerStatuses, [], "Fleeing must clear queued adventure combat statuses.");

  const safeRolls = [1, 0.5];
  const safeResult = fleeCombat(state, () => safeRolls.shift() ?? 0);
  assert.ok(safeResult);
  assert.equal(safeResult.goldLossPercent, 90, "The maximum flee loss must be 90% of current Gold.");
  assert.equal(safeResult.lostItem, null, "An item-loss roll at or above 50% must preserve all equipped items.");
  assert.equal(Object.keys(safeResult.state.character.equipment).length, 2, "A failed item-loss roll must preserve the complete equipment loadout.");

  const inactive = { ...state, adventure: { ...state.adventure, active: false, combat: null } };
  assert.equal(fleeCombat(inactive), null, "Fleeing must do nothing outside active combat.");

  const chainedState = {
    ...state,
    adventure: {
      ...state.adventure,
      combat: { ...combat, playerStatuses: [createStatusEffect("chained")] },
    },
  };
  assert.equal(fleeCombat(chainedState), null, "Chained must authoritatively prevent fleeing even when the UI transition is called directly.");
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
    assert.ok(Number.isInteger(ability.flatDamage) && ability.flatDamage >= 0, `${ability.id} needs non-negative whole-number Flat Damage.`);
  });
  assert.equal(new Set([...ITEMS.map((item) => item.id), ...GEAR_SETS.map((set) => set.id)]).size, ITEMS.length + GEAR_SETS.length, "Item and gear-set IDs must be unique.");
  ITEMS.forEach((item) => assert.ok(typeof item.goldCost === "number" && item.goldCost >= 0, `${item.name} needs a non-negative Gold Cost.`));
  ITEMS.forEach((item) => assert.ok(ITEM_ICON_URLS[item.id], `${item.name} needs a generated inventory icon.`));
  const itemIds = new Set(ITEMS.map((item) => item.id));
  Object.values(ENEMIES).forEach((enemy) => (enemy.dropTable ?? []).forEach((drop) => {
    assert.ok(itemIds.has(drop.itemId), `${enemy.name} references missing drop item ${drop.itemId}.`);
    assert.ok(drop.chance >= 0 && drop.chance <= 100, `${enemy.name} has an invalid drop chance.`);
  }));
  Object.values(ENEMIES).forEach((enemy) => {
    assert.ok(existsSync(join(process.cwd(), "public", enemy.imageUrl)), `${enemy.name} needs its bestiary artwork.`);
    assert.ok(existsSync(join(process.cwd(), "public", enemy.portraitUrl)), `${enemy.name} needs its combat portrait.`);
  });
  const bossDescriptions: string[] = [];
  ADVENTURES.forEach((adventure) => {
    assert.ok(adventure.id, "Every adventure needs an internal ID.");
    assert.ok(adventure.travelText?.trim(), `${adventure.name} needs travel loading text.`);
    assert.equal(getAdventureTravelText(adventure), adventure.travelText?.trim(), `${adventure.name} must use its configured travel loading text.`);
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
        if (entry.type === "boss") {
          assert.ok(entry.description.trim(), `${entry.id} needs a flavorful boss introduction.`);
          assert.equal(/read the setup|survive the charged attack|bars the final path/i.test(entry.description), false, `${entry.id} must not use the tactical placeholder introduction.`);
          bossDescriptions.push(entry.description.trim());
        }
      });
    });
  });
  assert.equal(new Set(bossDescriptions).size, bossDescriptions.length, "Every boss encounter needs a unique introduction.");
  const lateAdventureExpectations = [
    ["mirefen-marsh", 13, 12, "highfall-mountains"],
    ["ashen-foundry", 18, 13, "mirefen-marsh"],
    ["sunken-reliquary", 23, 14, "ashen-foundry"],
    ["nightglass-citadel", 28, 15, "sunken-reliquary"],
    ["frostbound-expanse", 34, 16, "nightglass-citadel"],
    ["stormspire-aerie", 40, 17, "frostbound-expanse"],
    ["hollow-crown", 46, 18, "stormspire-aerie"],
    ["astral-scar", 49, 20, "hollow-crown"],
    ["world-below", 50, 22, "astral-scar"],
  ] as const;
  assert.equal(ADVENTURES.length, 12, "The complete story route must contain Adventures 1 through 12.");
  lateAdventureExpectations.forEach(([id, level, stageCount, prerequisite]) => {
    const adventure = ADVENTURES.find((candidate) => candidate.id === id);
    assert.ok(adventure, `Missing late-game adventure ${id}.`);
    const adventureNumber = lateAdventureExpectations.findIndex(([candidateId]) => candidateId === id) + 4;
    const originalBaseExperience = 300 + (adventureNumber - 4) * 70;
    assert.equal(adventure.recommendedLevel, level, `${adventure.name} needs its intended level gate.`);
    assert.equal(adventure.stages.length, stageCount, `${adventure.name} needs the intended increasing stage count.`);
    assert.equal(adventure.prerequisiteAdventureId, prerequisite, `${adventure.name} must remain in the linear story chain.`);
    assert.equal(adventure.theme, "custom", `${adventure.name} must use data-owned custom artwork.`);
    assert.ok(adventure.cardImageUrl && existsSync(join(process.cwd(), "public", adventure.cardImageUrl)), `${adventure.name} needs adventure-card artwork.`);
    assert.ok(adventure.combatBackgroundUrl && existsSync(join(process.cwd(), "public", adventure.combatBackgroundUrl)), `${adventure.name} needs combat-board artwork.`);
    const enemyIds = new Set(adventure.stages.flatMap((stage) => stage.entries.flatMap((entry) => entry.enemyIds ?? [])));
    assert.equal(enemyIds.size, 7, `${adventure.name} must use exactly seven biome enemies including its boss.`);
    const eventIds = new Set(adventure.stages.flatMap((stage) => stage.entries.flatMap((entry) => entry.eventId ? [entry.eventId] : [])));
    assert.equal(eventIds.size, 3, `${adventure.name} must offer three editable skill-check events.`);
    const finalEntries = adventure.stages.at(-1)?.entries ?? [];
    const bossEntry = finalEntries.find((entry) => entry.type === "boss");
    assert.ok(bossEntry, `${adventure.name} must end in a boss encounter.`);
    const bossEnemyId = bossEntry.enemyIds?.[0];
    assert.ok(bossEnemyId, `${adventure.name}'s final encounter must list its boss first.`);
    const bossEnemy = ENEMIES[bossEnemyId];
    assert.ok(bossEnemy, `${adventure.name} references missing boss ${bossEnemyId}.`);
    const originalBossHp = 170 + (adventureNumber - 3) ** 2 * 26;
    assert.equal(bossEnemy.maxHp, Math.round(originalBossHp * 1.3), `${bossEnemy.name} must retain the 30% late-campaign boss Health increase.`);
    adventure.stages.forEach((stage, stageIndex) => {
      stage.entries.filter((entry) => entry.type === "combat" || entry.type === "boss").forEach((entry) => {
        const originalExperience = entry.type === "boss"
          ? originalBaseExperience * 3
          : entry.id.endsWith("-b")
            ? Math.floor(originalBaseExperience * 1.35) + stageIndex * 12
            : originalBaseExperience + stageIndex * 12;
        assert.equal(entry.reward.experience, Math.floor(originalExperience * 0.5), `${entry.id} must retain the 50% late-campaign enemy-XP reduction.`);
      });
    });
    eventIds.forEach((eventId) => {
      const event = ADVENTURE_EVENTS[eventId];
      event.choices.forEach((choice) => {
        [choice.success, choice.failure, choice.outcome].forEach((outcome) => {
          (outcome?.effects ?? []).filter((effect) => effect.type === "immediateEncounter").forEach((effect) => {
            const originalExperience = eventId.endsWith("-relic") ? 120 + adventureNumber * 25 : 130 + adventureNumber * 25;
            assert.equal(effect.experience, Math.floor(originalExperience * 0.5), `${eventId}'s immediate enemy encounter must retain the 50% XP reduction.`);
          });
        });
      });
    });
  });
  const lateEnemies = Object.values(ENEMIES).filter((enemy) => /^enemy-a(?:[4-9]|1[0-2])-/.test(enemy.id));
  assert.equal(lateEnemies.length, 63, "Adventures 4 through 12 need seven new enemies each.");
  const lateSets = GEAR_SETS.filter((set) => /^set-a(?:[4-9]|1[0-2])-/.test(set.id));
  assert.equal(lateSets.length, 21, "Adventures 4 through 12 need twenty-one new five-piece sets.");
  lateSets.forEach((set) => {
    assert.equal(set.pieceCount, 5, `${set.name} must contain five pieces.`);
    assert.deepEqual(set.bonuses.map((bonus) => bonus.requiredPieces), [2, 3, 4, 5], `${set.name} must unlock bonuses at 2, 3, 4, and 5 pieces.`);
    assert.ok(set.bonuses.at(-1)?.passive, `${set.name}'s five-piece threshold needs an executable special effect.`);
    assert.equal(ITEMS.filter((item) => isGearItem(item) && item.set === set.id).length, 5, `${set.name} needs exactly five equippable pieces.`);
  });
  const lateItems = ITEMS.filter((item) => /^(?:item|gear|consumable)-a(?:[4-9]|1[0-2])-/.test(item.id));
  assert.equal(lateItems.length, 153, "The late-game content pack must retain its complete item catalog.");
  const preLegendaryItems = lateItems.filter((item) => /-a(?:[4-9]|10)-/.test(item.id));
  assert.ok(preLegendaryItems.every((item) => item.rarity !== "legendary"), "Legendary items must not appear before Adventure 11.");
  assert.ok(preLegendaryItems.filter((item) => item.rarity === "epic").every((item) => /-a(?:8|9|10)-/.test(item.id)), "Epic items must begin at Adventure 8, after Adventure 7.");
  const legendaryItems = lateItems.filter((item) => item.rarity === "legendary");
  assert.equal(legendaryItems.length, 34, "Adventures 11 and 12 need thirty-four Legendary set pieces and weapons.");
  assert.ok(legendaryItems.every((item) => /-a(?:11|12)-/.test(item.id)), "Legendary items must begin in Adventure 11.");
  const legendaryDropIds = new Set([
    ...Object.values(ENEMIES).flatMap((enemy) => enemy.dropTable ?? []),
    ...ADVENTURES.flatMap((adventure) => adventure.stages.flatMap((stage) => stage.dropTable ?? [])),
  ].map((drop) => drop.itemId).filter((id) => legendaryItems.some((item) => item.id === id)));
  assert.ok(legendaryItems.some((item) => /-a11-/.test(item.id) && legendaryDropIds.has(item.id)), "Adventure 11 must begin dropping Legendary loot.");
  assert.ok(legendaryItems.some((item) => /-a12-/.test(item.id) && legendaryDropIds.has(item.id)), "Adventure 12 must continue dropping Legendary loot.");
  legendaryItems.forEach((item) => {
    assert.ok(legendaryDropIds.has(item.id) || item.craftingRecipe, `${item.name} must be obtainable from a drop or its endgame recipe.`);
  });
  const questIds = new Set(QUESTS.map((quest) => quest.id));
  assert.equal(QUESTS.length, 39, "The live Quest Board catalog must contain all campaign quest packs.");
  assert.equal(questIds.size, QUESTS.length, "Quest IDs must be unique.");
  QUESTS.forEach((quest) => {
    assert.ok(quest.title.trim() && quest.description.trim(), `${quest.id} needs a title and description.`);
    assert.ok(Number.isInteger(quest.objective.quantity) && quest.objective.quantity > 0, `${quest.title} needs a positive whole-number goal.`);
    if (quest.objective.type === "kill_enemy") assert.ok(ENEMIES[quest.objective.enemyId], `${quest.title} references a missing enemy.`);
    if (quest.objective.type === "collect_item") assert.ok(itemIds.has(quest.objective.itemId), `${quest.title} references a missing item.`);
    if (quest.objective.type === "complete_adventure") assert.ok(ADVENTURES.some((adventure) => adventure.id === quest.objective.adventureId), `${quest.title} references a missing adventure.`);
    quest.reward.items.forEach((reward) => assert.ok(itemIds.has(reward.itemId), `${quest.title} rewards a missing item.`));
  });
  const assignedQuests = QUESTLINES.flatMap((questline) => questline.questIds);
  assert.equal(new Set(QUESTLINES.map((questline) => questline.id)).size, QUESTLINES.length, "Questline IDs must be unique.");
  assert.equal(new Set(assignedQuests).size, assignedQuests.length, "A quest can belong to only one questline.");
  assignedQuests.forEach((questId) => assert.ok(questIds.has(questId), `Questline references missing quest ${questId}.`));
  assert.equal(QUESTLINES.length, 4, "The campaign needs the original notice chain plus three adventure-wide questlines.");
  ADVENTURES.forEach((adventure) => {
    const enemyIds = new Set(adventure.stages.flatMap((stage) => stage.entries.flatMap((entry) => entry.enemyIds ?? [])));
    const dropItemIds = new Set([
      ...adventure.stages.flatMap((stage) => stage.dropTable.map((drop) => drop.itemId)),
      ...[...enemyIds].flatMap((enemyId) => ENEMIES[enemyId]?.dropTable.map((drop) => drop.itemId) ?? []),
    ]);
    assert.ok(QUESTS.some((quest) => quest.objective.type === "kill_enemy" && enemyIds.has(quest.objective.enemyId)), `${adventure.name} needs a local enemy bounty.`);
    assert.ok(QUESTS.some((quest) => quest.objective.type === "collect_item" && dropItemIds.has(quest.objective.itemId)), `${adventure.name} needs a local material requisition.`);
    assert.ok(QUESTS.some((quest) => quest.objective.type === "complete_adventure" && quest.objective.adventureId === adventure.id), `${adventure.name} needs a completion quest.`);
  });
}

function testQuestLifecycle() {
  const killQuest = QUESTS.find((quest) => quest.objective.type === "kill_enemy");
  const itemQuest = QUESTS.find((quest) => quest.objective.type === "collect_item");
  const adventureQuest = QUESTS.find((quest) => quest.objective.type === "complete_adventure");
  assert.ok(killQuest && killQuest.objective.type === "kill_enemy", "Quest lifecycle requires a kill quest.");
  assert.ok(itemQuest && itemQuest.objective.type === "collect_item", "Quest lifecycle requires an item quest.");
  assert.ok(adventureQuest && adventureQuest.objective.type === "complete_adventure", "Quest lifecycle requires an adventure quest.");

  const base = structuredClone(INITIAL_GAME) as GameState;
  const acceptedKill = acceptQuest(base, killQuest.id);
  assert.equal(acceptedKill.success, true, "An available quest must be accepted at the Quest Board.");
  assert.equal(getQuestAvailability(acceptedKill.state.character, killQuest), "accepted");
  const killProgress = recordQuestEnemyDefeats(acceptedKill.state.character, Array.from({ length: killQuest.objective.quantity }, () => killQuest.objective.enemyId));
  assert.equal(getQuestAvailability(killProgress, killQuest), "ready", "The exact enemy defeats must make a kill quest ready.");
  const turnedInKill = turnInQuest({ ...acceptedKill.state, character: killProgress }, killQuest.id);
  assert.equal(turnedInKill.success, true, "A finished kill quest must be turned in at the Quest Board.");
  assert.ok(turnedInKill.state.character.completedQuestIds.includes(killQuest.id));
  assert.equal(turnedInKill.state.character.xp, killQuest.reward.experience, "Quest XP must be granted exactly once.");
  killQuest.reward.items.forEach((reward) => assert.equal(turnedInKill.state.character.inventory.filter((item) => item.id === reward.itemId).length, reward.quantity, "Quest reward items must enter Inventory."));
  assert.equal(turnInQuest(turnedInKill.state, killQuest.id).success, false, "A quest reward cannot be claimed twice.");

  const targetItem = ITEMS.find((item) => item.id === itemQuest.objective.itemId)!;
  const itemState = structuredClone(INITIAL_GAME) as GameState;
  itemState.character.completedQuestIds = QUESTLINES.flatMap((questline) => questline.questIds.slice(0, questline.questIds.indexOf(itemQuest.id))).filter((id) => id !== itemQuest.id);
  itemState.character.inventory = Array.from({ length: itemQuest.objective.quantity }, () => structuredClone(targetItem));
  const acceptedItem = acceptQuest(itemState, itemQuest.id);
  assert.equal(getQuestAvailability(acceptedItem.state.character, itemQuest), "ready", "Owned quest items must count immediately after accepting the quest.");
  const turnedInItem = turnInQuest(acceptedItem.state, itemQuest.id);
  assert.equal(turnedInItem.state.character.inventory.filter((item) => item.id === targetItem.id).length, 0, "Find-item quest targets must be handed over at turn-in.");

  const adventureState = structuredClone(INITIAL_GAME) as GameState;
  adventureState.character.completedQuestIds = QUESTLINES.flatMap((questline) => questline.questIds.slice(0, questline.questIds.indexOf(adventureQuest.id))).filter((id) => id !== adventureQuest.id);
  const acceptedAdventure = acceptQuest(adventureState, adventureQuest.id);
  const adventureProgress = recordQuestAdventureCompletion(acceptedAdventure.state.character, adventureQuest.objective.adventureId);
  assert.equal(getQuestAvailability(adventureProgress, adventureQuest), "ready", "Completing the selected adventure must advance its quest.");

  const freshPostings = getQuestBoardPostings(base.character);
  assert.equal(freshPostings.length, MAX_QUEST_BOARD_POSTINGS, "A populated Quest Board must show six focused postings.");
  assert.equal(new Set(freshPostings.map((quest) => quest.id)).size, freshPostings.length, "Quest Board postings must not repeat a quest.");

  const fullQuestLog = structuredClone(INITIAL_GAME) as GameState;
  fullQuestLog.character.acceptedQuestIds = QUESTS.slice(0, MAX_QUEST_BOARD_POSTINGS).map((quest) => quest.id);
  const additionalQuest = QUESTS.find((quest) => !fullQuestLog.character.acceptedQuestIds.includes(quest.id) && getQuestAvailability(fullQuestLog.character, quest) === "available");
  assert.ok(additionalQuest, "Quest capacity regression requires another available posting.");
  assert.equal(acceptQuest(fullQuestLog, additionalQuest.id).success, false, "A character cannot track more than six active quests.");
}

function testQuestEditorCatalog() {
  const canonical = canonicalQuestExchange();
  const duplicated = structuredClone(canonical);
  if (duplicated.questlines.length > 1 && duplicated.questlines[0].questIds[0]) duplicated.questlines[1].questIds.push(duplicated.questlines[0].questIds[0]);
  const normalized = normalizeQuestExchange(duplicated);
  assert.equal(normalized.format, "arkenfall-quests");
  assert.equal(normalized.quests.length, QUESTS.length, "Quest Editor must preserve the complete live quest catalog.");
  assert.equal(new Set(normalized.questlines.flatMap((questline) => questline.questIds)).size, normalized.questlines.flatMap((questline) => questline.questIds).length, "Quest Editor normalization must keep each quest in at most one questline.");
}

function testAbilityFlatDamage() {
  const ability = { ...ABILITIES.quickSlash, flatDamage: 7 };
  const components = applyAbilityFlatDamage(ability, [{ damageType: "physical", power: 2, powerScaling: 0.5 }]);
  assert.deepEqual(components, [{ damageType: "physical", power: 9, powerScaling: 0.5 }], "Flat Damage must be added once to the primary damage component of every direct hit.");
  assert.equal(ABILITIES.crushingBlow.flatDamage, 12, "Legacy fixed ability damage must migrate without changing its value.");
  assert.equal(ABILITIES.siphon.flatDamage, 7, "Legacy spell fixed damage must migrate without changing its value.");
}

function testEnemyStartingEnergy() {
  assert.equal(getEnemyStartingEnergy({ maxEnergy: 7 }), 7, "Older enemies without Starting Energy must still enter combat at full Energy.");
  assert.equal(getEnemyStartingEnergy({ maxEnergy: 7, startingEnergy: 3 }), 3, "Configured enemy Starting Energy must be used at combat creation.");
  assert.equal(getEnemyStartingEnergy({ maxEnergy: 7, startingEnergy: 20 }), 7, "Enemy Starting Energy must never exceed Max Energy.");
  assert.equal(getEnemyStartingEnergy({ maxEnergy: 7, startingEnergy: -2 }), 0, "Enemy Starting Energy must never fall below zero.");

  const legacyDraft = canonicalEnemyExchange();
  delete (legacyDraft.enemies[0] as Partial<(typeof legacyDraft.enemies)[number]>).startingEnergy;
  const normalizedLegacyDraft = normalizeEnemyExchange(legacyDraft);
  assert.equal(normalizedLegacyDraft.enemies[0].startingEnergy, normalizedLegacyDraft.enemies[0].maxEnergy, "Older Enemy Creator drafts must default Starting Energy to Max Energy.");
}

function testEnemyChainedAttacks() {
  assert.equal(CHAINED_ENEMY_MIN_LEVEL, 6);
  assert.equal(CHAINED_ON_ATTACK_CHANCE, 0.1);
  assert.equal(shouldApplyChainedOnEnemyAttack(5, 1, () => 0), false, "Enemies below level 6 must never apply Chained.");
  assert.equal(shouldApplyChainedOnEnemyAttack(6, 0, () => 0), false, "A complete miss must never apply Chained.");
  assert.equal(shouldApplyChainedOnEnemyAttack(6, 3, () => 0.099), true, "A multi-hit attack must make one Chained roll at the configured chance.");
  assert.equal(shouldApplyChainedOnEnemyAttack(6, 1, () => 0.1), false, "The exact upper probability boundary must not proc Chained.");

  const created = createCombat(INITIAL_GAME.character, ["dummy"], undefined, { enemyLevel: 6 });
  assert.equal(created.enemies[0].level, 6, "Combat creation must stamp the adventure level onto its enemies.");
  const enemyEntry = created.turnOrder.find((entry) => entry.kind === "enemy")!;
  const playerEntry = created.turnOrder.find((entry) => entry.kind === "player")!;
  const enemyTurn = { ...created, turnOrder: [enemyEntry, playerEntry], activeTurnIndex: 0, initiativeRevealed: true };
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const result = takeEnemyTurn(enemyTurn, INITIAL_GAME.character, enemyEntry.actorId);
    const chainedEffects = result.pendingEffects.filter((effect) => effect.type === "status" && effect.targetId === "player" && effect.status.id === "chained");
    assert.equal(chainedEffects.length, 1, "A successful level-6 enemy attack must queue exactly one Chained application at impact.");
    assert.equal(chainedEffects[0].type === "status" ? chainedEffects[0].status.duration : 0, 2, "Enemy-applied Chained must last two player turns.");
  } finally {
    Math.random = originalRandom;
  }

  const chained = createStatusEffect("chained");
  const afterOneTurn = decrementStatusDurations([chained]);
  const afterTwoTurns = decrementStatusDurations(afterOneTurn);
  assert.equal(afterOneTurn.find((status) => status.id === "chained")?.duration, 1, "Chained must remain through the first affected player turn.");
  assert.equal(afterTwoTurns.some((status) => status.id === "chained"), false, "Chained must expire after the second affected player turn.");
}

function testEnemyEditorSynchronizesLiveDropTables() {
  const canonical = canonicalEnemyExchange();
  const liveHighfallEnemy = canonical.enemies.find((enemy) => enemy.id === "enemy-ms2vrqbb-8r5ux")!;
  const liveWindsongEnemy = canonical.enemies.find((enemy) => enemy.id === "enemy-mrxj4o6o-o45ia")!;
  const ordinaryLiveEnemy = canonical.enemies.find((enemy) => enemy.id === "dummy")!;
  const locallyCustomizedHighfallEnemy = { ...structuredClone(liveHighfallEnemy), name: "Locally Customized Troll", dropTable: [] };
  const locallyCustomizedWindsongEnemy = { ...structuredClone(liveWindsongEnemy), name: "Locally Customized Wolf", dropTable: [] };
  const locallyCustomizedOrdinaryEnemy = { ...structuredClone(ordinaryLiveEnemy), dropTable: [{ itemId: ITEMS[0].id, chance: 37 }] };
  const localOnlyEnemy = { ...structuredClone(liveHighfallEnemy), id: "local-draft-enemy", name: "Local Draft Enemy", dropTable: [] };
  const staleDraft = {
    format: "arkenfall-enemies" as const,
    version: 3 as const,
    enemies: [locallyCustomizedHighfallEnemy, locallyCustomizedWindsongEnemy, locallyCustomizedOrdinaryEnemy, localOnlyEnemy],
  };

  const merged = mergeEnemyDraftWithCanonical(staleDraft, canonical);
  canonical.enemies.forEach((enemy) => assert.ok(merged.enemies.some((candidate) => candidate.id === enemy.id), `${enemy.name} must be added to an older Enemy Editor draft.`));
  assert.ok(merged.enemies.some((enemy) => enemy.id === localOnlyEnemy.id), "Catalog hydration must preserve local-only enemy drafts.");

  const synchronized = synchronizeEnemyDraftWithCanonical(staleDraft, canonical);
  const synchronizedHighfallEnemy = synchronized.enemies.find((enemy) => enemy.id === liveHighfallEnemy.id)!;
  assert.deepEqual(synchronizedHighfallEnemy.dropTable, liveHighfallEnemy.dropTable, "Highfall Bandit and Troll drop-table revisions must replace stale browser-draft rows.");
  assert.equal(synchronizedHighfallEnemy.name, "Locally Customized Troll", "Drop-table hydration must preserve unrelated local enemy fields.");
  const synchronizedWindsongEnemy = synchronized.enemies.find((enemy) => enemy.id === liveWindsongEnemy.id)!;
  assert.deepEqual(synchronizedWindsongEnemy.dropTable, liveWindsongEnemy.dropTable, "Windsong item-drop revisions must replace stale browser-draft rows.");
  assert.equal(synchronizedWindsongEnemy.name, "Locally Customized Wolf", "Windsong drop-table hydration must preserve unrelated local enemy fields.");
  assert.deepEqual(synchronized.enemies.find((enemy) => enemy.id === ordinaryLiveEnemy.id)?.dropTable, locallyCustomizedOrdinaryEnemy.dropTable, "Unrelated enemy drop-table drafts must remain untouched.");
  assert.ok(synchronized.enemies.some((enemy) => enemy.id === localOnlyEnemy.id), "Refreshing live drop tables must preserve local-only enemy drafts.");
}

function combatWithActiveEnemy(enemyIds: string[], activeEnemyIndex: number) {
  const combat = createCombat(INITIAL_GAME.character, enemyIds);
  const activeEnemy = combat.enemies[activeEnemyIndex];
  return {
    ...combat,
    initiativeRevealed: true,
    activeTurnIndex: combat.turnOrder.findIndex((entry) => entry.actorId === activeEnemy.instanceId),
  };
}

function testGoblinEnemyBehaviors() {
  const longseer = ENEMIES["enemy-ms1ej4re-xskqn"];
  assert.equal(longseer.startingEnergy, 1, "Goblin Longseer must enter combat with its configured low Starting Energy.");
  assert.ok(existsSync(join(process.cwd(), "public", longseer.imageUrl)), "Goblin Longseer needs its Highlands bestiary artwork.");
  assert.ok(existsSync(join(process.cwd(), "public", longseer.portraitUrl)), "Goblin Longseer needs its combat portrait.");
  Object.values(ENEMIES).filter((enemy) => enemy.id.startsWith("enemy-ms1")).forEach((enemy) => {
    assert.ok(existsSync(join(process.cwd(), "public", enemy.imageUrl)), `${enemy.name} needs its generated bestiary artwork.`);
    assert.ok(existsSync(join(process.cwd(), "public", enemy.portraitUrl)), `${enemy.name} needs its generated combat portrait.`);
  });

  const longseerState = createCombat(INITIAL_GAME.character, [longseer.id]).enemies[0];
  assert.equal(getReadyEnemyAbility(longseerState)?.name, "Bow Shot", "Longseer must use Bow Shot before reaching full Energy.");
  assert.equal(getReadyEnemyAbility({ ...longseerState, energy: longseerState.maxEnergy })?.name, "Snipe", "Longseer must replace Bow Shot with Snipe at full Energy.");

  const woundfixerCombat = combatWithActiveEnemy(["enemy-ms1fnbla-fs4ul", "enemy-ms1ej4re-xskqn"], 0);
  woundfixerCombat.enemies[1] = { ...woundfixerCombat.enemies[1], hp: 10 };
  const healed = takeEnemyTurn(woundfixerCombat, INITIAL_GAME.character, woundfixerCombat.enemies[0].instanceId);
  assert.ok(healed.pendingEffects.some((effect) => effect.type === "heal" && effect.targetId === woundfixerCombat.enemies[1].instanceId && effect.amount === 6), "Woundfixer must heal the most wounded friendly target for 100% Spell Power.");

  const biggrownCombat = combatWithActiveEnemy(["enemy-ms1ftdlw-jz5lo", "enemy-ms1ej4re-xskqn"], 0);
  const protectedCombat = takeEnemyTurn(biggrownCombat, INITIAL_GAME.character, biggrownCombat.enemies[0].instanceId);
  assert.ok(protectedCombat.pendingEffects.some((effect) => effect.type === "status" && effect.targetId === biggrownCombat.enemies[1].instanceId && effect.status.id === "guard" && effect.status.stacks === 5), "Biggrown Protect must grant 5 Guard to other living enemies.");
  assert.ok(!protectedCombat.pendingEffects.some((effect) => effect.type === "status" && effect.targetId === biggrownCombat.enemies[0].instanceId && effect.status.id === "guard"), "Biggrown must not grant Protect to itself.");

  const strizCombat = combatWithActiveEnemy(["enemy-ms1fykbj-rhb65"], 0);
  const striz = strizCombat.enemies[0];
  strizCombat.enemies[0] = {
    ...striz,
    hitChance: 100,
    abilityCooldowns: {
      "enemy-ability-ms1g1ysa-6452h": 5,
      "enemy-ability-ms1g3m9s-n12oq": 5,
      "enemy-ability-ms1gucm0-0n5ec": 5,
    },
  };
  const charging = takeEnemyTurn(strizCombat, INITIAL_GAME.character, striz.instanceId);
  assert.ok(charging.floatingEvents.includes("Striz, Goblin Chieftain begins charging an attack."), "Impale must announce its charge with corrected Chieftain spelling.");
  assert.ok(!charging.pendingEffects.some((effect) => "damage" in effect && effect.targetId === "player"), "Impale must not deal damage on its charge turn.");
  const charged = resolveCombatEvent(charging, charging.eventId, 0);
  assert.equal(charged.enemies[0].chargingAbilityId, "enemy-ability-ms1gpjhe-m9ky3", "Impale must remain visibly charged until Striz's next turn.");
  const releaseState = {
    ...charged,
    activeTurnIndex: charged.turnOrder.findIndex((entry) => entry.actorId === striz.instanceId),
    enemyActionsTaken: 0,
    floatingEvents: [],
    pendingEffects: [],
    enemies: charged.enemies.map((enemy) => ({ ...enemy, hitChance: 100 })),
  };
  const released = takeEnemyTurn(releaseState, INITIAL_GAME.character, striz.instanceId);
  assert.ok(released.pendingEffects.some((effect) => "damage" in effect && effect.targetId === "player" && effect.damage > 0), "Charged Impale must release as a real attack on Striz's next turn.");
  assert.ok(released.pendingEffects.some((effect) => effect.type === "enemy_charge" && effect.abilityId === undefined), "Impale release must clear the persistent charging presentation at impact.");
}

function testHighfallEnemyBehaviorsAndLoot() {
  const highfallEnemyIds = [
    "enemy-ms2vrqbb-8r5ux",
    "enemy-ms2w17p6-txpmq",
    "enemy-ms2w93yt-v817a",
    "enemy-ms2wk1ul-6ol9b",
    "enemy-ms2wqzxv-srsgs",
    "enemy-ms2wuk5j-1ddqa",
    "enemy-ms2xaper-z7o3g",
  ];
  highfallEnemyIds.forEach((enemyId) => {
    const enemy = ENEMIES[enemyId];
    assert.ok(enemy, `Missing Highfall enemy ${enemyId}.`);
    assert.ok(enemy.abilities.length > 0, `${enemy.name} needs executable abilities.`);
    enemy.abilities.forEach((ability) => {
      assert.ok(ability.vfx, `${enemy.name}'s ${ability.name} needs readable VFX.`);
      assert.ok(ability.range === "melee" || ability.range === "ranged", `${enemy.name}'s ${ability.name} needs a valid range.`);
    });
  });

  const hillCombat = combatWithActiveEnemy(["enemy-ms2vrqbb-8r5ux"], 0);
  const hill = hillCombat.enemies[0];
  assert.equal(getReadyEnemyAbility(hill)?.name, "Club Smash", "Hill Troll must prepare Club Smash at full Energy.");
  const hillCharging = takeEnemyTurn(hillCombat, INITIAL_GAME.character, hill.instanceId);
  assert.ok(hillCharging.pendingEffects.some((effect) => effect.type === "enemy_charge" && effect.targetId === hill.instanceId), "Club Smash must visibly charge before dealing damage.");
  assert.ok(!hillCharging.pendingEffects.some((effect) => "damage" in effect && effect.targetId === "player"), "Club Smash must not deal damage during its charge event.");

  const shamanCombat = combatWithActiveEnemy(["enemy-ms2w93yt-v817a", "enemy-ms2vrqbb-8r5ux"], 0);
  shamanCombat.enemies[1] = { ...shamanCombat.enemies[1], hp: 1 };
  const shamanHealing = takeEnemyTurn(shamanCombat, INITIAL_GAME.character, shamanCombat.enemies[0].instanceId);
  assert.ok(shamanHealing.pendingEffects.some((effect) => effect.type === "heal" && effect.targetId === shamanCombat.enemies[1].instanceId && effect.amount === 20), "Hill Troll Shaman must heal the most wounded friendly target for 200% Spell Power.");

  const enforcerCharacter = { ...structuredClone(INITIAL_GAME.character), gold: 7 };
  const enforcerCombat = combatWithActiveEnemy(["enemy-ms2wk1ul-6ol9b"], 0);
  enforcerCombat.enemies[0] = { ...enforcerCombat.enemies[0], hitChance: 100 };
  const originalRandom = Math.random;
  Math.random = () => 0;
  let stolenCombat: ReturnType<typeof takeEnemyTurn>;
  try {
    stolenCombat = takeEnemyTurn(enforcerCombat, enforcerCharacter, enforcerCombat.enemies[0].instanceId);
  } finally {
    Math.random = originalRandom;
  }
  assert.equal(stolenCombat.goldStolen, 7, "Bandit Enforcer must steal no more Gold than the character owns.");
  assert.ok(stolenCombat.pendingEffects.some((effect) => effect.type === "passive_text" && effect.text === "-7 Gold"), "Stolen Gold must receive impact-timed combat feedback.");

  const lootCombat = combatWithActiveEnemy(["enemy-ms2wqzxv-srsgs"], 0);
  lootCombat.enemies[0] = { ...lootCombat.enemies[0], energy: 10 };
  const escaping = takeEnemyTurn(lootCombat, INITIAL_GAME.character, lootCombat.enemies[0].instanceId);
  assert.ok(escaping.pendingEffects.some((effect) => effect.type === "enemy_flee"), "Loot Goblin must queue its escape at the presentation event.");
  const escaped = resolveCombatEvent(escaping, escaping.eventId, 0);
  assert.equal(escaped.enemies[0].fled, true, "Loot Goblin must be marked as escaped when its flee event resolves.");
  assert.equal(escaped.outcome, "victory", "The encounter must end when the final enemy escapes.");
  const escapedState = structuredClone(INITIAL_GAME) as GameState;
  escapedState.adventure.combat = {
    ...escaped,
    enemies: escaped.enemies.map((enemy) => ({ ...enemy, dropTable: [{ itemId: ITEMS[0].id, chance: 100 }] })),
  };
  assert.equal(rollCombatLoot(escapedState, () => 0).some((item) => item.id === ITEMS[0].id), false, "An escaped Loot Goblin must take its drop table with it.");

  const klaus = createCombat(INITIAL_GAME.character, ["enemy-ms2xaper-z7o3g"]).enemies[0];
  assert.equal(getReadyEnemyAbility(klaus)?.name, "Patience", "Klaus must build Guard before reaching full Energy.");
  assert.equal(getReadyEnemyAbility({ ...klaus, energy: 10 })?.name, "No Patience", "Klaus must unleash No Patience at full Energy.");
  assert.equal(getReadyEnemyAbility({ ...klaus, energy: 10, behaviorPhase: "toying" })?.name, "Toying", "Klaus must switch permanently to Toying after No Patience.");

  const highfallSetItemIds = [
    "gear-nightveil-cowl", "gear-nightveil-jerkin", "gear-nightveil-legwraps", "gear-nightveil-treads",
    "gear-trollforged-greathelm", "gear-trollforged-breastplate", "gear-trollforged-legguards", "gear-trollforged-warboots",
    "gear-runewoven-cowl", "gear-runewoven-robes", "gear-runewoven-leggings", "gear-runewoven-boots",
  ];
  const highfallDropRows = highfallEnemyIds.flatMap((enemyId) => ENEMIES[enemyId].dropTable ?? []);
  highfallSetItemIds.forEach((itemId) => {
    const matchingRows = highfallDropRows.filter((drop) => drop.itemId === itemId);
    assert.equal(matchingRows.length, 1, `${itemId} must have one dedicated Bandit or Troll drop row.`);
    assert.equal(matchingRows[0].chance, 5, `${itemId} must use the requested 5% drop chance.`);
  });

  const expectedSetTriggers = new Map([
    ["set-nightveil", "nightveil-critical-evasion"],
    ["set-trollforged", "trollforged-retaliatory-guard"],
    ["set-runewoven", "runewoven-arcane-cycle"],
  ]);
  expectedSetTriggers.forEach((triggerId, setId) => {
    const pieces = ITEMS.filter((item): item is GearItem => isGearItem(item) && item.set === setId);
    const character = structuredClone(INITIAL_GAME.character);
    character.equipment = {};
    pieces.forEach((piece) => { character.equipment[piece.slot] = structuredClone(piece); });
    const trigger = getCharacterCombatFeatures(character).triggers.find((candidate) => candidate.id === triggerId);
    assert.equal(pieces.length, 4, `${setId} must still contain four equippable pieces.`);
    assert.ok(trigger, `${setId} must activate its unique four-piece combat trigger.`);
  });

  const nightveilSet = GEAR_SETS.find((set) => set.id === "set-nightveil")!;
  const nightveilEffect = nightveilSet.bonuses.find((bonus) => bonus.requiredPieces === 4)?.triggers?.[0]?.effects[0];
  assert.ok(nightveilEffect?.type === "apply_status" && nightveilEffect.status.id === "evasion" && nightveilEffect.status.magnitude === 0.2, "Nightveil critical strikes must grant exactly +20% Dodge Chance.");
  const trollforgedTrigger = GEAR_SETS.find((set) => set.id === "set-trollforged")!.bonuses.find((bonus) => bonus.requiredPieces === 4)?.triggers?.[0];
  assert.equal(trollforgedTrigger?.oncePerTurn, true, "Trollforged Guard must trigger at most once per turn.");
  assert.deepEqual(trollforgedTrigger?.conditions, { minimumDamage: 1 }, "Trollforged must require real Health damage before granting Guard.");
  const runewovenTrigger = GEAR_SETS.find((set) => set.id === "set-runewoven")!.bonuses.find((bonus) => bonus.requiredPieces === 4)?.triggers?.[0];
  assert.deepEqual(runewovenTrigger?.conditions?.damageTypes, ["spell", "arcane", "fire", "frost", "lightning"], "Runewoven must cover every Magic damage school.");
  assert.equal(runewovenTrigger?.oncePerTurn, true, "Runewoven Energy restoration must trigger at most once per turn.");
}

function testTacticalEnemyAiCatalogAndSelection() {
  const tacticalEnemies = Object.values(ENEMIES).filter((enemy) => enemy.ai);
  assert.equal(tacticalEnemies.length, 75, "Every distinct enemy introduced from recommended level 4 onward needs data-owned tactical AI.");
  tacticalEnemies.forEach((enemy) => {
    const abilityIds = new Set(enemy.abilities.map((ability) => ability.id));
    enemy.ai!.rules.forEach((rule) => assert.ok(abilityIds.has(rule.abilityId), `${enemy.name}'s tactical AI references a missing ability.`));
    (enemy.ai!.fallbackAbilityIds ?? []).forEach((abilityId) => assert.ok(abilityIds.has(abilityId), `${enemy.name}'s tactical fallback references a missing ability.`));
  });

  const lateRegularEnemies = tacticalEnemies.filter((enemy) => /^enemy-a(?:[4-9]|1[0-2])-/.test(enemy.id) && !enemy.title.toLowerCase().includes("boss"));
  assert.ok(lateRegularEnemies.every((enemy) => enemy.abilities.length >= 3), "Every late-campaign regular enemy needs at least three tactical tools.");
  assert.ok(lateRegularEnemies.every((enemy) => enemy.abilities.every((ability) => !["Savage Strike", "Ruinous Bolt", "Relentless Pressure"].includes(ability.name))), "Late enemies must not retain generic placeholder ability names.");

  const expectedExhaustedEnemies = [
    "enemy-a7-gloom-archer",
    "enemy-a8-frost-hermit",
    "enemy-a9-storm-channeler",
    "enemy-a10-veilbound-executioner",
    "enemy-a11-gravity-warden",
    "enemy-a12-deep-oracle",
  ];
  const exhaustedEnemies = Object.values(ENEMIES)
    .filter((enemy) => enemy.abilities.some((ability) => ability.statusApplications?.some((application) => application.status === "exhausted")))
    .map((enemy) => enemy.id);
  assert.deepEqual(exhaustedEnemies, expectedExhaustedEnemies, "Adventures 7-12 must each have exactly one regular enemy that applies Exhausted.");
  expectedExhaustedEnemies.forEach((enemyId) => {
    const application = ENEMIES[enemyId].abilities.flatMap((ability) => ability.statusApplications ?? []).find((status) => status.status === "exhausted");
    assert.equal(application?.duration, 1, `${ENEMIES[enemyId].name}'s Exhausted must last exactly one turn.`);
  });

  const expectedRareControlSources = [
    { enemyId: "enemy-a7-bloodbound-knight", status: "reckless", chance: 0.15, duration: 2 },
    { enemyId: "enemy-a8-aurora-wisp", status: "sleep", chance: 0.1, duration: 1 },
    { enemyId: "enemy-a9-spire-zealot", status: "reckless", chance: 0.15, duration: 2 },
    { enemyId: "enemy-a10-hollow-courtier", status: "sleep", chance: 0.1, duration: 1 },
    { enemyId: "enemy-a11-starved-pilgrim", status: "reckless", chance: 0.15, duration: 2 },
    { enemyId: "enemy-a12-abyssal-choir", status: "sleep", chance: 0.1, duration: 1 },
  ] as const;
  const rareControlEnemies = Object.values(ENEMIES)
    .filter((enemy) => enemy.abilities.some((ability) => ability.statusApplications?.some((application) => application.status === "sleep" || application.status === "reckless")))
    .map((enemy) => enemy.id);
  assert.deepEqual(rareControlEnemies, expectedRareControlSources.map((source) => source.enemyId), "Adventures 7-12 must each have exactly one enemy-inflicted Sleep or Reckless source.");
  expectedRareControlSources.forEach(({ enemyId, status, chance, duration }) => {
    const application = ENEMIES[enemyId].abilities.flatMap((ability) => ability.statusApplications ?? []).find((candidate) => candidate.status === status);
    assert.equal(application?.chance, chance, `${ENEMIES[enemyId].name}'s ${status} proc chance must remain rare.`);
    assert.equal(application?.duration, duration, `${ENEMIES[enemyId].name}'s ${status} duration changed unexpectedly.`);
  });

  const leech = createCombat(INITIAL_GAME.character, ["enemy-a4-bog-leech"]).enemies[0];
  const healthyContext: EnemyAiContext = { playerHp: 100, playerMaxHp: 100, playerStatusIds: [] };
  assert.equal(getReadyEnemyAbility(leech, [leech], healthyContext)?.name, "Open the Vein", "Bog Leech must create Bleed before attempting its payoff.");
  assert.equal(getReadyEnemyAbility(leech, [leech], { ...healthyContext, playerStatusIds: ["bleed"] })?.name, "Blood-Swollen Lunge", "Bog Leech must exploit an existing Bleed with its payoff.");
  const payoffCombat = combatWithActiveEnemy(["enemy-a4-bog-leech"], 0);
  const payoffEnemy = payoffCombat.enemies[0];
  const forcedPayoff = {
    ...payoffCombat,
    enemies: [{
      ...payoffEnemy,
      energy: payoffEnemy.maxEnergy,
      hitChance: 100,
      critChance: 0,
      abilityCooldowns: {
        "enemy-ability-a4-bog-leech-strike": 5,
        "enemy-ability-a4-bog-leech-setup": 5,
      },
    }],
  };
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    const plainPayoff = takeEnemyTurn(forcedPayoff, INITIAL_GAME.character, payoffEnemy.instanceId);
    const bleedingPayoff = takeEnemyTurn({ ...forcedPayoff, playerStatuses: [createStatusEffect("bleed", { stacks: 1, duration: 3 })] }, INITIAL_GAME.character, payoffEnemy.instanceId);
    const plainDamage = Math.max(...plainPayoff.pendingEffects.filter((effect) => "damage" in effect && effect.targetId === "player").map((effect) => "damage" in effect ? effect.damage : 0));
    const bleedingDamage = Math.max(...bleedingPayoff.pendingEffects.filter((effect) => "damage" in effect && effect.targetId === "player").map((effect) => "damage" in effect ? effect.damage : 0));
    assert.ok(bleedingDamage > plainDamage, "A status payoff must apply its executable target-status damage multiplier in real enemy-turn resolution.");
    assert.equal(bleedingPayoff.enemies[0].lastAbilityId, "enemy-ability-a4-bog-leech-pressure", "Enemy turns must remember the resolved ability for cycling tactical fallbacks.");
  } finally {
    Math.random = originalRandom;
  }

  const fenCombat = createCombat(INITIAL_GAME.character, ["enemy-a4-fen-witch", "enemy-a4-brood-guard"]);
  const fenWitch = fenCombat.enemies[0];
  assert.equal(getReadyEnemyAbility(fenWitch, fenCombat.enemies, healthyContext)?.name, "Fenward Covenant", "Fen Witch must protect an unwarded group before attacking.");
  const woundedGroup = fenCombat.enemies.map((enemy, index) => index === 1 ? { ...enemy, hp: Math.floor(enemy.maxHp * 0.4) } : enemy);
  assert.equal(getReadyEnemyAbility(fenWitch, woundedGroup, healthyContext)?.name, "Mire Mending", "Fen Witch must prioritize emergency healing over its group ward.");

  const vespara = createCombat(INITIAL_GAME.character, ["enemy-a4-vespara-broodmother"]).enemies[0];
  const setupStatus = vespara.abilities[0].statusApplications![0].status;
  assert.equal(getReadyEnemyAbility(vespara, [vespara], healthyContext)?.name, "Brood Call", "A late boss must begin by applying its setup status.");
  assert.equal(getReadyEnemyAbility(vespara, [vespara], { ...healthyContext, playerStatusIds: [setupStatus] })?.name, "Venom Deluge", "A late boss must convert its setup status into the charged execution.");
  const woundedVespara = { ...vespara, hp: Math.floor(vespara.maxHp * 0.3) };
  assert.equal(getReadyEnemyAbility(woundedVespara, [woundedVespara], healthyContext)?.name, "Matriarch's Fury", "A late boss must enter its unique low-Health phase before restarting the normal sequence.");
}

function testWindsongUncommonItemCollection() {
  const itemIds = [
    "gear-windsong-thornbark-visor",
    "gear-windsong-thornbark-buckler",
    "gear-windsong-galehide-jerkin",
    "gear-windsong-galehide-striders",
    "gear-windsong-wispwoven-leggings",
    "gear-windsong-wispwoven-band",
    "gear-windsong-bramblefang",
    "gear-windsong-moondrop-wand",
    "gear-windsong-wolfstep-loop",
    "consumable-windsong-whisperbloom-tonic",
  ];
  const collection = ITEMS.filter((item) => itemIds.includes(item.id));
  assert.equal(collection.length, 10, "Windsong Forest must contain all ten requested new items.");
  assert.ok(collection.every((item) => item.rarity === "uncommon"), "Every new Windsong item must be Uncommon.");
  assert.ok(collection.every((item) => ITEM_ICON_URLS[item.id]), "Every new Windsong item must reuse a registered live icon.");
  assert.ok(itemIds.every((itemId) => canonicalItemExchange().items.some((item) => item.id === itemId)), "Every new Windsong item must appear in Item Editor's canonical catalog.");

  const expectedSets = new Map([
    ["set-windsong-thornbark", ["gear-windsong-thornbark-visor", "gear-windsong-thornbark-buckler"]],
    ["set-windsong-galehide", ["gear-windsong-galehide-jerkin", "gear-windsong-galehide-striders"]],
    ["set-windsong-wispwoven", ["gear-windsong-wispwoven-leggings", "gear-windsong-wispwoven-band"]],
  ]);
  expectedSets.forEach((expectedPieceIds, setId) => {
    const set = GEAR_SETS.find((candidate) => candidate.id === setId);
    const pieces = ITEMS.filter((item): item is GearItem => isGearItem(item) && item.set === setId);
    assert.equal(set?.pieceCount, 2, `${setId} must be a two-piece set.`);
    assert.deepEqual(pieces.map((item) => item.id), expectedPieceIds, `${setId} must contain its intended pair.`);
    assert.equal(set?.bonuses.length, 1, `${setId} must have exactly one set bonus.`);
    assert.equal(set?.bonuses[0].requiredPieces, 2, `${setId} must activate at two pieces.`);
    assert.equal(set?.bonuses[0].description, "+1 Vitality.", `${setId} must describe the shared Vitality bonus.`);
    assert.deepEqual(set?.bonuses[0].passive, { stats: { vitality: 1 } }, `${setId} must grant exactly +1 Vitality.`);
  });
  assert.equal(collection.filter(isGearItem).filter((item) => item.set).length, 6, "Exactly six new Windsong items must be set pieces.");

  const windsongMaterialIds = new Set([
    "item-ms0jd8ky-lu2zb",
    "item-ms0jdzsp-pnyoa",
    "item-ms0jej41-7sii2",
    "item-ms0jf0sp-z8hcl",
    "item-ms0jgblm-ko16i",
  ]);
  const expectedStations = new Map([
    ["gear-windsong-thornbark-visor", "blacksmith"],
    ["gear-windsong-thornbark-buckler", "blacksmith"],
    ["gear-windsong-galehide-jerkin", "leatherworker"],
    ["gear-windsong-galehide-striders", "leatherworker"],
    ["gear-windsong-wispwoven-leggings", "tailor"],
    ["gear-windsong-wispwoven-band", "jeweler"],
    ["gear-windsong-bramblefang", "blacksmith"],
    ["gear-windsong-moondrop-wand", "jeweler"],
    ["gear-windsong-wolfstep-loop", "jeweler"],
    ["consumable-windsong-whisperbloom-tonic", "alchemist"],
  ]);
  collection.forEach((item) => {
    const recipe = getItemCraftingRecipe(item);
    assert.equal(recipe?.station, expectedStations.get(item.id), `${item.name} must be craftable at its intended Arkenfall artisan.`);
    assert.ok(recipe?.ingredients.length, `${item.name} must have a material recipe.`);
    assert.ok(recipe?.ingredients.every((ingredient) => windsongMaterialIds.has(ingredient.itemId)), `${item.name} must use only materials obtainable in Windsong Forest.`);
  });

  const windsongEnemyIds = [
    "enemy-mrxiut2a-k4kgv",
    "enemy-mrxj4o6o-o45ia",
    "enemy-mrxk609z-n04fq",
    "enemy-mrxkar5z-g9o5d",
    "enemy-mrxkjqs3-g7g5i",
  ];
  const dropRows = windsongEnemyIds.flatMap((enemyId) => ENEMIES[enemyId].dropTable ?? []);
  itemIds.forEach((itemId) => {
    const matchingRows = dropRows.filter((drop) => drop.itemId === itemId);
    assert.ok(matchingRows.length >= 1, `${itemId} must drop inside Windsong Forest.`);
    assert.ok(matchingRows.every((drop) => drop.chance > 0 && drop.chance <= 8), `${itemId} must retain a low positive Windsong drop chance.`);
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
      { kind: "misc", id: "", name: "Field Token", rarity: "uncommon", description: "A keepsake.", iconUrl: "/assets/items/wisp-essence.webp", arkenfallVendor: "jeweler", vendorPrerequisiteAdventureId: ADVENTURES[0].id, craftingRecipe: { station: "jeweler", ingredients: [{ itemId: "field-tonic", quantity: 1 }], prerequisiteAdventureId: ADVENTURES[0].id } },
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
  assert.equal(exchange.items[2].arkenfallVendor, "jeweler", "New town vendor assignments must survive Item Editor normalization.");
  assert.equal(exchange.items[2].craftingRecipe?.station, "jeweler", "New crafting-station assignments must survive Item Editor normalization.");
  assert.equal(exchange.items[2].vendorPrerequisiteAdventureId, ADVENTURES[0].id, "Shop adventure requirements must survive Item Editor normalization.");
  assert.equal(exchange.items[2].craftingRecipe?.prerequisiteAdventureId, ADVENTURES[0].id, "Recipe adventure requirements must survive Item Editor normalization.");
  assert.equal(isMiscItem(exchange.items[2]), true, "Other items must retain their non-usable item type.");
  assert.equal(isGearItem(exchange.items[2]), false, "Other items must never be classified as gear.");
  assert.equal(isConsumableItem(exchange.items[2]), false, "Other items must never be classified as consumables.");
}

function testItemEditorMergesNewLiveCatalogEntries() {
  const canonical = canonicalItemExchange();
  const customizedLiveItem = { ...structuredClone(canonical.items[0]), name: "Locally Customized Item" };
  const localOnlyItem: InventoryItem = { kind: "misc", id: "local-draft-item", name: "Local Draft Item", rarity: "common", description: "", goldCost: 0 };
  const localOnlySet = { id: "local-draft-set", name: "Local Draft Set", pieceCount: 2, bonuses: [] };
  const staleDraft: ItemExchange = {
    format: "arkenfall-items",
    version: 1,
    items: [customizedLiveItem, localOnlyItem],
    sets: [localOnlySet],
  };
  const merged = mergeItemDraftWithCanonical(staleDraft, canonical);

  canonical.items.forEach((item) => assert.ok(merged.items.some((candidate) => candidate.id === item.id), `${item.name} must be added to an older Item Editor draft.`));
  canonical.sets.forEach((set) => assert.ok(merged.sets.some((candidate) => candidate.id === set.id), `${set.name} must be added to an older Set Editor draft.`));
  assert.equal(merged.items.find((item) => item.id === customizedLiveItem.id)?.name, "Locally Customized Item", "Catalog hydration must preserve edits to existing item IDs.");
  assert.ok(merged.items.some((item) => item.id === localOnlyItem.id), "Catalog hydration must preserve unsaved local item drafts.");
  assert.ok(merged.sets.some((set) => set.id === localOnlySet.id), "Catalog hydration must preserve unsaved local set drafts.");

  const staleNightveil = structuredClone(canonical.sets.find((set) => set.id === "set-nightveil")!);
  staleNightveil.bonuses = staleNightveil.bonuses.map((bonus) => bonus.requiredPieces === 4 ? { requiredPieces: 4, description: "+2 Physical Power.", passive: { physicalPower: 2 } } : bonus);
  const synchronized = synchronizeItemDraftWithCanonical({ ...staleDraft, sets: [localOnlySet, staleNightveil] }, canonical);
  assert.deepEqual(synchronized.sets.find((set) => set.id === "set-nightveil"), canonical.sets.find((set) => set.id === "set-nightveil"), "Known live set revisions must replace their older browser-draft definitions.");
  assert.ok(synchronized.sets.some((set) => set.id === localOnlySet.id), "Refreshing known live sets must still preserve local-only set drafts.");
}

function testTownAdventureRequirements() {
  const prerequisiteAdventureId = ADVENTURES[0].id;
  const material: InventoryItem = { kind: "misc", id: "gate-material", name: "Gate Material", rarity: "common", description: "" };
  const gatedItem: InventoryItem = {
    kind: "misc",
    id: "gated-item",
    name: "Gated Item",
    rarity: "common",
    description: "",
    arkenfallVendor: "leatherworker",
    vendorPrerequisiteAdventureId: prerequisiteAdventureId,
    craftingRecipe: { station: "leatherworker", ingredients: [{ itemId: material.id, quantity: 1 }], prerequisiteAdventureId },
  };
  assert.equal(isTownVendorItemUnlocked(gatedItem, []), false, "A gated shop item must stay hidden before its adventure is completed.");
  assert.equal(isTownVendorItemUnlocked(gatedItem, [prerequisiteAdventureId]), true, "Completing the required adventure must reveal a gated shop item.");
  assert.equal(isTownCraftingRecipeUnlocked(gatedItem, []), false, "A gated recipe must stay hidden before its adventure is completed.");
  assert.equal(isTownCraftingRecipeUnlocked(gatedItem, [prerequisiteAdventureId]), true, "Completing the required adventure must reveal a gated recipe.");
  assert.equal(canCraftTownItem([material], gatedItem, "leatherworker", []), false, "Materials alone must not bypass a recipe's adventure requirement.");
  assert.equal(canCraftTownItem([material], gatedItem, "leatherworker", [prerequisiteAdventureId]), true, "A completed requirement plus all materials must enable crafting.");
  (["tailor", "leatherworker", "jeweler"] as const).forEach((vendor) => {
    assert.ok(Array.isArray(getTownVendorStock(vendor)), `${vendor} must be a valid live town vendor.`);
    assert.ok(Array.isArray(getTownCraftingCatalog(vendor)), `${vendor} must be a valid live crafting station.`);
  });
}

function testProgressiveTownStock() {
  const storyAdventureIds = [
    "windsong-forest",
    "adventure-ms1iq9ye-9ra1z",
    "highfall-mountains",
    "mirefen-marsh",
    "ashen-foundry",
    "sunken-reliquary",
    "nightglass-citadel",
    "frostbound-expanse",
    "stormspire-aerie",
    "hollow-crown",
    "astral-scar",
    "world-below",
  ];
  const vendors = ["blacksmith", "alchemist", "tailor", "leatherworker", "jeweler"] as const;
  const progressionItems = ITEMS.filter((item) => item.id.includes("-shop-a"));
  const progressionItemIds = new Set(progressionItems.map((item) => item.id));
  assert.equal(progressionItems.length, 120, "Twelve adventure clears must add two items to each of the five shops.");
  assert.ok(storyAdventureIds.every((id) => ADVENTURES.some((adventure) => adventure.id === id)), "Every shop-stock requirement must reference a live story adventure.");

  vendors.forEach((vendor) => {
    storyAdventureIds.forEach((adventureId, adventureIndex) => {
      const completedBefore = storyAdventureIds.slice(0, adventureIndex);
      const completedAfter = storyAdventureIds.slice(0, adventureIndex + 1);
      const before = getTownVendorStock(vendor, completedBefore).filter((item) => progressionItemIds.has(item.id));
      const after = getTownVendorStock(vendor, completedAfter).filter((item) => progressionItemIds.has(item.id));
      const newlyUnlocked = after.filter((item) => item.vendorPrerequisiteAdventureId === adventureId);
      assert.equal(before.length, adventureIndex * 2, `${vendor} must retain exactly two items from every earlier clear.`);
      assert.equal(after.length, (adventureIndex + 1) * 2, `${vendor} must add exactly two items after ${adventureId}.`);
      assert.equal(newlyUnlocked.length, 2, `${vendor} must unlock two new items for ${adventureId}.`);
      assert.ok(after.every((item) => completedAfter.includes(item.vendorPrerequisiteAdventureId ?? "")), `${vendor} must not reveal future progression stock.`);
    });
  });

  const rings = progressionItems.filter((item) => isGearItem(item) && item.slot === "ring");
  assert.equal(rings.length, 24, "The Jeweler progression must contain one executable ring for each supported build specialization.");
  assert.ok(rings.every((ring) => ring.arkenfallVendor === "jeweler" && ring.description.includes("wearable by every class")), "Every specialization ring must be class-agnostic and explain that in player-facing text.");
  assert.ok(rings.every((ring) => ring.combat && Object.keys(ring.combat).length > 0), "Every specialization ring must implement its unique effect through CombatFeatureBundle.");
  assert.equal(new Set(rings.map((ring) => JSON.stringify(ring.combat))).size, rings.length, "Every specialization ring must have a distinct executable effect.");

  const progressionSets = GEAR_SETS.filter((set) => set.id.startsWith("set-shop-"));
  assert.equal(progressionSets.length, 9, "Selected artisan stock must introduce nine paired progression sets.");
  progressionSets.forEach((set) => {
    const pieces = progressionItems.filter((item) => isGearItem(item) && item.set === set.id);
    assert.equal(set.pieceCount, 2, `${set.name} must be a two-piece artisan set.`);
    assert.equal(pieces.length, 2, `${set.name} must have exactly two purchasable pieces.`);
    assert.equal(set.bonuses.length, 1, `${set.name} must have one complete two-piece bonus.`);
    assert.equal(set.bonuses[0].requiredPieces, 2, `${set.name}'s bonus must activate at two pieces.`);
  });
  progressionItems.forEach((item) => assert.equal(ITEM_ICON_URLS[item.id], item.iconUrl, `${item.name} must reuse its selected registered icon.`));

  const firstUnlockedItem = progressionItems.find((item) => item.arkenfallVendor === "blacksmith" && item.vendorPrerequisiteAdventureId === storyAdventureIds[0]);
  assert.ok(firstUnlockedItem, "The first adventure must unlock Blacksmith stock.");
  const purchaseState: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: {
      ...structuredClone(INITIAL_GAME.character),
      completedAdventureIds: [storyAdventureIds[0]],
      gold: getItemGoldCost(firstUnlockedItem),
      inventory: [],
      equipment: {},
    },
  };
  assert.equal(purchaseTownItem({ ...purchaseState, character: { ...purchaseState.character, completedAdventureIds: [] } }, "blacksmith", firstUnlockedItem.id).success, false, "Progression stock must not be purchasable before its adventure is completed.");
  const purchased = purchaseTownItem(purchaseState, "blacksmith", firstUnlockedItem.id);
  assert.equal(purchased.success, true, "New stock must become purchasable immediately after its adventure is completed.");
  assert.equal(purchased.state.character.gold, 0, "A newly unlocked purchase must use its configured Gold Cost.");
  assert.ok(purchased.state.character.inventory.some((item) => item.id === firstUnlockedItem.id) || Object.values(purchased.state.character.equipment).some((item) => item?.id === firstUnlockedItem.id), "A newly unlocked purchase must enter Inventory or automatically equip.");
}

function testArkenfallTownCommerceAndCrafting() {
  const blacksmithStock = getTownVendorStock("blacksmith");
  const alchemistStock = getTownVendorStock("alchemist");
  assert.ok(blacksmithStock.some(isGearItem), "The Blacksmith must expose assigned gear stock.");
  assert.ok(alchemistStock.some(isConsumableItem), "The Alchemist must expose assigned consumable stock.");

  const soldItem = blacksmithStock.find(isGearItem);
  assert.ok(soldItem, "Town purchase auto-equip regression requires live Blacksmith gear.");
  const purchaseState: GameState = {
    ...structuredClone(INITIAL_GAME),
    characterCreated: true,
    character: { ...structuredClone(INITIAL_GAME.character), gold: getItemGoldCost(soldItem) + 5, inventory: [] },
  };
  const purchased = purchaseTownItem(purchaseState, "blacksmith", soldItem.id);
  assert.equal(purchased.success, true, "A town vendor must sell assigned stock when the character can afford it.");
  assert.equal(purchased.state.character.gold, 5, "Town purchases must deduct the full configured Gold Cost.");
  assert.ok(Object.values(purchased.state.character.equipment).some((item) => item?.id === soldItem.id), "Purchased gear must equip when its slot is empty.");
  assert.equal(purchased.state.character.inventory.length, 0, "Automatically equipped purchases must not remain in Inventory.");
  assert.equal(purchased.message, `${soldItem.name} equipped automatically.`, "Town purchase feedback must explain automatic equipment.");

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
  assert.equal(crafted.state.character.inventory.length, 0, "Crafting must consume the exact ingredient quantities before auto-equipping gear.");
  assert.ok(Object.values(crafted.state.character.equipment).some((item) => item?.id === recipeItem.id), "Crafted gear must equip when its slot is empty.");
  assert.equal(crafted.message, `${recipeItem.name} crafted and equipped automatically.`, "Crafting feedback must explain automatic equipment.");
  assert.equal(craftTownItem(purchaseState, "blacksmith", recipeItem.id).success, false, "Crafting must fail without the required materials.");

  const sellValue = getItemSellValue(soldItem);
  (["blacksmith", "alchemist", "tailor", "leatherworker", "jeweler"] as const).forEach((vendor) => {
    const saleState = { ...purchaseState, character: { ...purchaseState.character, gold: 0, inventory: [structuredClone(soldItem), structuredClone(soldItem)] } };
    const sold = sellTownItem(saleState, vendor, soldItem.id);
    assert.equal(sold.success, true, `Items must be sellable at the ${vendor}.`);
    assert.equal(sold.state.character.gold, sellValue, "Town vendors must pay 25% of Gold Cost using the shared sell-value rule.");
    assert.equal(sold.state.character.inventory.length, 1, "A town sale must remove exactly one inventory copy.");
  });

  const maxHp = getDerivedStats(purchaseState.character).maxHp;
  const restCost = getTavernRestCost(1, maxHp);
  const wounded = { ...purchaseState, character: { ...purchaseState.character, gold: restCost }, adventure: { ...purchaseState.adventure, carryHp: 1 } };
  const rested = restAtArkenfallTavern(wounded);
  assert.equal(rested.success, true, "The tavern must heal a wounded character between adventures.");
  assert.equal(rested.state.adventure.carryHp, maxHp, "Tavern rest must restore carried Health to the derived maximum.");
  assert.equal(rested.state.character.gold, 0, "Tavern rest must cost one Gold per five missing Health, rounded up.");
  assert.equal(getTavernRestCost(maxHp - 4, maxHp), 1, "Up to five missing Health must cost one Gold.");
  assert.equal(getTavernRestCost(maxHp - 6, maxHp), 2, "A partial second group of five missing Health must cost another Gold.");
  assert.deepEqual(getTavernRestOffer(maxHp - 7, maxHp, 1), { goldCost: 1, healthRestored: 5, fullyRestores: false }, "A limited budget must restore five Health per available Gold.");
  assert.deepEqual(getTavernRestOffer(maxHp - 7, maxHp, 20), { goldCost: 2, healthRestored: 7, fullyRestores: true }, "Full recovery must charge only the rounded-up Gold cost.");
  const partialRest = restAtArkenfallTavern({ ...wounded, character: { ...wounded.character, gold: 1 } });
  assert.equal(partialRest.success, true, "Rest must spend the available Gold even when it cannot buy full recovery.");
  assert.equal(partialRest.state.character.gold, 0, "Budget-limited rest must spend all available Gold.");
  assert.equal(partialRest.state.adventure.carryHp, Math.min(maxHp, 6), "One Gold must restore five carried Health.");
  assert.equal(restAtArkenfallTavern({ ...wounded, character: { ...wounded.character, gold: 0 } }).success, false, "Rest must require at least one Gold.");

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

  const gamblingStart = { ...structuredClone(INITIAL_GAME), characterCreated: true };
  const firstGamble = gambleAtArkenfallTavern(gamblingStart, 5, () => 0.49);
  assert.equal(firstGamble.success, true, "A funded tavern wager must resolve.");
  assert.equal(firstGamble.roll?.dieRoll, 50, "Tavern gambling must use a visible d100 roll.");
  assert.equal(firstGamble.roll?.luckBonus, 5, "Tavern gambling must add the character's derived Luck.");
  assert.equal(firstGamble.roll?.won, true, "A total of 55 must win the first house check.");
  assert.equal(firstGamble.state.character.gold, gamblingStart.character.gold + 5, "Winning must grant a net profit equal to the wager.");
  assert.equal(firstGamble.state.character.tavernGamblingAttempts, 1, "Every resolved wager must persistently increase the hidden pressure counter.");
  const secondGamble = gambleAtArkenfallTavern(firstGamble.state, 5, () => 0.49);
  assert.equal(secondGamble.roll?.won, false, "The same check total must fail after repeated gambling raises the concealed difficulty.");
  assert.equal(secondGamble.state.character.gold, gamblingStart.character.gold, "Losing must deduct exactly the wager.");
  assert.equal(resetTavernGamblingAfterAdventure(secondGamble.state.character).tavernGamblingAttempts, 0, "Completing an adventure must reset tavern gambling pressure.");
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
  assert.equal(adventure.travelText, "Walking beneath the Windsong canopy", "Older Adventure Editor drafts must receive theme-appropriate travel loading text.");
  assert.equal(adventure.stages[0].id, "first-stage", "A missing stage ID should be generated from its name.");
  assert.deepEqual(adventure.stages[0].entries.map((entry) => entry.id), ["repeated-encounter", "repeated-encounter-2"], "Missing or duplicate stage possibility IDs should be repaired without user input.");
}

function testHighfallMountainTheme() {
  const highfallAdventure = {
    id: "highfall-mountains",
    name: "Highfall Mountains",
    description: "",
    recommendedLevel: 1,
    theme: "highfall_mountains" as const,
    stages: [],
    completionTitle: "Complete",
    completionDescription: "",
  };
  assert.equal(getAdventureTravelText(highfallAdventure), "Climbing into the Highfall Mountains", "Highfall Mountains needs its own default travel text.");
  ["highfall-mountains-adventure.webp", "highfall-mountains-edge.webp"].forEach((filename) => {
    assert.ok(existsSync(join(process.cwd(), "public", "assets", "backgrounds", filename)), `Missing Highfall Mountains background ${filename}.`);
  });
}

function testHighfallMountainsAdventureContent() {
  const adventure = ADVENTURES.find((candidate) => candidate.id === "highfall-mountains");
  assert.ok(adventure, "Highfall Mountains must exist in the live adventure catalog.");
  assert.equal(adventure.stages.length, 11, "Highfall Mountains must contain exactly 11 stages.");
  assert.equal(adventure.prerequisiteAdventureId, "adventure-ms1iq9ye-9ra1z", "Completing Arkenfall Highlands must unlock Highfall Mountains.");

  const stage2 = adventure.stages[1];
  const stage5 = adventure.stages[4];
  const stage6 = adventure.stages[5];
  const stage8 = adventure.stages[7];
  const stage9 = adventure.stages[8];
  const stage11 = adventure.stages[10];
  assert.equal(stage2.entries[0]?.eventId, "event-highfall-sheltered-spring", "Stage 2 must be the healing and potion refuge event.");
  assert.equal(stage6.entries[0]?.eventId, "event-highfall-stormbound-camp", "Stage 6 must be the second recovery event.");
  assert.equal(stage8.entries[0]?.eventId, "event-highfall-frozen-cairn", "Stage 8 must be a dedicated event.");
  assert.equal(stage9.entries[0]?.eventId, "event-highfall-merchant", "Highfall Merchant must appear before the final ascent.");

  assert.deepEqual(stage5.entries.map((entry) => entry.chance), [90, 10], "Stage 5 must reserve exactly 10% for the Loot Goblin encounter.");
  const lootGoblinEncounter = stage5.entries.find((entry) => entry.chance === 10);
  assert.deepEqual(lootGoblinEncounter?.enemyIds, ["enemy-ms2vrqbb-8r5ux", "enemy-ms2wqzxv-srsgs"], "The rare Stage 5 encounter must pair a Hill Troll with the Highfall Loot Goblin.");
  assert.equal(stage11.entries.length, 1, "Stage 11 must have one final encounter.");
  assert.equal(stage11.entries[0].type, "boss", "Stage 11 must be a boss encounter.");
  assert.deepEqual(stage11.entries[0].enemyIds, ["enemy-ms2xaper-z7o3g"], "Troll Bandit King, Klaus must be the final boss.");

  const shelter = ADVENTURE_EVENTS["event-highfall-sheltered-spring"];
  const camp = ADVENTURE_EVENTS["event-highfall-stormbound-camp"];
  const merchant = ADVENTURE_EVENTS["event-highfall-merchant"];
  assert.ok(shelter.choices.some((choice) => choice.resolution === "direct" && choice.outcome?.effects.some((effect) => effect.type === "heal")), "Stage 2 must offer guaranteed recovery.");
  assert.ok(camp.choices.some((choice) => choice.success.effects.some((effect) => effect.type === "gainItem" && effect.itemId === "consumable-stonebloom-draught") && choice.failure.effects.some((effect) => effect.type === "gainItem" && effect.itemId === "consumable-highfall-restorative")), "Stage 6 must have a high-probability potion reward.");
  const merchantStock = merchant.choices.flatMap((choice) => choice.outcome?.effects ?? []).find((effect) => effect.type === "openMerchant");
  assert.ok(merchantStock && merchantStock.type === "openMerchant", "Highfall Merchant must open a merchant inventory.");
  ["item-highfall-frostroot", "consumable-highfall-restorative", "consumable-stonebloom-draught", "gear-cairnkeepers-loop"].forEach((itemId) => {
    assert.ok(ITEMS.some((item) => item.id === itemId), `Missing Highfall item ${itemId}.`);
    assert.ok(merchantStock.itemIds.includes(itemId), `${itemId} must be stocked by Highfall Merchant.`);
  });
}

function testAdventureAndEventEditorsMergeLiveCatalogs() {
  const canonicalAdventures = canonicalAdventureExchange();
  const localAdventure = { ...structuredClone(canonicalAdventures.adventures[0]), id: "local-only-adventure", name: "Local Only Adventure" };
  const staleAdventureDraft: AdventureExchange = { format: "arkenfall-adventures", version: 1, adventures: [structuredClone(canonicalAdventures.adventures[0]), localAdventure] };
  const mergedAdventures = mergeAdventureDraftWithCanonical(staleAdventureDraft, canonicalAdventures);
  assert.ok(mergedAdventures.adventures.some((adventure) => adventure.id === "highfall-mountains"), "Adventure Editor must add Highfall Mountains to older browser drafts.");
  assert.ok(mergedAdventures.adventures.some((adventure) => adventure.id === localAdventure.id), "Adventure catalog hydration must preserve local-only drafts.");

  const canonicalEvents = canonicalEventExchange();
  const localEvent = { ...structuredClone(canonicalEvents.events[0]), id: "local-only-event", name: "Local Only Event" };
  const staleEventDraft: EventExchange = { format: "arkenfall-events", version: 2, events: [structuredClone(canonicalEvents.events[0]), localEvent] };
  const mergedEvents = mergeEventDraftWithCanonical(staleEventDraft, canonicalEvents);
  ["event-highfall-sheltered-spring", "event-highfall-stormbound-camp", "event-highfall-frozen-cairn", "event-highfall-merchant"].forEach((eventId) => {
    assert.ok(mergedEvents.events.some((event) => event.id === eventId), `Event Manager must add ${eventId} to older browser drafts.`);
  });
  assert.ok(mergedEvents.events.some((event) => event.id === localEvent.id), "Event catalog hydration must preserve local-only drafts.");
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
    assert.equal(result.energy, created.energy - ABILITIES.quickSlash.energyCost, "Quick Slash must spend its configured Energy cost.");
    const damageEffect = result.pendingEffects.find((effect) => "damage" in effect && effect.targetId === created.enemies[0].instanceId);
    assert.ok(damageEffect && "damage" in damageEffect, "Quick Slash must queue damage against the selected target.");
    assert.equal(damageEffect.sourceLabel, "Crit", "Critical damage must carry the floating-number Crit label.");
  } finally {
    Math.random = originalRandom;
  }
}

function testShadowPoisonAbilityBalance() {
  assert.equal(ABILITIES.Epidemic.statusStacks, 4, "Epidemic must apply exactly four Poison stacks.");
  assert.equal(ABILITIES.Venomborn.consumeStatusForHealingMultiplier, 0.5, "Venomborn must convert only half of Poison's full-duration damage into healing.");

  const character = { ...structuredClone(INITIAL_GAME.character), name: "Poison Tester" };
  const created = createCombat(character, ["dummy", "dummy"]);
  const playerEntry = created.turnOrder.find((entry) => entry.kind === "player")!;
  const activeCombat = { ...created, turnOrder: [playerEntry, ...created.turnOrder.filter((entry) => entry.kind === "enemy")], activeTurnIndex: 0, initiativeRevealed: true };
  const epidemicResult = useAbility(activeCombat, character, "Epidemic");
  const epidemicPoison = epidemicResult.pendingEffects.filter((effect) => effect.type === "status" && effect.targetId !== "player" && effect.status.id === "poison");
  assert.equal(epidemicPoison.length, 2, "Epidemic must queue Poison for every living target.");
  assert.ok(epidemicPoison.every((effect) => effect.type === "status" && effect.status.stacks === 4), "Every Epidemic target must receive exactly four Poison stacks.");

  const poisonedTarget = { ...activeCombat.enemies[0], statuses: [createStatusEffect("poison", { stacks: 4, duration: 3, sourcePower: 0, sourceId: "player" })] };
  const venombornCombat = {
    ...activeCombat,
    playerHp: activeCombat.playerMaxHp - 50,
    enemies: [poisonedTarget, activeCombat.enemies[1]],
    selectedEnemyId: poisonedTarget.instanceId,
  };
  const venombornResult = useAbility(venombornCombat, character, "Venomborn");
  const venombornHeal = venombornResult.pendingEffects.find((effect) => effect.type === "heal" && effect.targetId === "player");
  assert.ok(venombornHeal?.type === "heal", "Venomborn must queue its healing at presentation time.");
  assert.equal(venombornHeal.amount, 6, "Venomborn must heal for 50% of four Poison damage across three turns.");
}

function testCooldownsCarryBetweenAdventureCombats() {
  const character = { ...structuredClone(INITIAL_GAME.character), name: "Cooldown Tester" };
  const nextCombat = createCombat(character, ["dummy"], undefined, {
    abilityCooldowns: { quickSlash: 3, expiringAbility: 1, invalidAbility: Number.NaN },
  });
  assert.deepEqual(nextCombat.abilityCooldowns, { quickSlash: 2 }, "A new combat in the same adventure must tick carried cooldowns once instead of resetting them.");

  const newAdventureCombat = createCombat(character, ["dummy"]);
  assert.deepEqual(newAdventureCombat.abilityCooldowns, {}, "A combat started without adventure-carried cooldowns must begin fully refreshed.");

  const fleeState = structuredClone(INITIAL_GAME) as GameState;
  fleeState.characterCreated = true;
  fleeState.adventure.active = true;
  fleeState.adventure.carriedAbilityCooldowns = { quickSlash: 2 };
  fleeState.adventure.combat = { ...nextCombat, outcome: "active" };
  const fled = fleeCombat(fleeState, () => 0.99);
  assert.deepEqual(fled?.state.adventure.carriedAbilityCooldowns, {}, "Abandoning an adventure must clear its carried cooldowns.");
}

function testStructuredEventOutcome() {
  const gear = ITEMS.find(isGearItem);
  assert.ok(gear, "Structured event outcome regression requires a live gear item.");
  const state = structuredClone(INITIAL_GAME) as GameState;
  state.characterCreated = true;
  state.character.equipment = {};
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
        { type: "loseHealth", amount: 50 },
        { type: "gainGold", amount: 5 },
        { type: "gainItem", itemId: gear.id },
        { type: "playerNextCombatBuff", status: "strengthened", stacks: 2 },
        { type: "immediateEncounter", enemyId: "dummy", count: 2, experience: 10, gold: 3 },
      ],
    },
    failure: { text: "Failure.", effects: [] },
  };
  const result = resolveAdventureEventChoice(state, choice, () => 0);
  assert.equal(result.character.gold, state.character.gold + 5, "Event gold must be granted once.");
  assert.equal(result.adventure.carryHp, 1, "Event Health loss must retain the one-Health floor.");
  assert.deepEqual(result.adventure.nextCombatPlayerStatuses, [{ status: "strengthened", stacks: 2 }]);
  assert.deepEqual(result.adventure.eventEncounter?.enemyIds, ["dummy", "dummy"]);
  const appliedEffects = result.adventure.eventRollResult?.appliedEffects ?? [];
  assert.deepEqual(appliedEffects.find((effect) => effect.type === "resource" && effect.resource === "health"), { type: "resource", resource: "health", direction: "lose", amount: 19 }, "Outcome presentation must store the actual clamped Health loss.");
  assert.deepEqual(appliedEffects.find((effect) => effect.type === "resource" && effect.resource === "gold"), { type: "resource", resource: "gold", direction: "gain", amount: 5 }, "Outcome presentation must store the applied Gold gain.");
  assert.ok(appliedEffects.some((effect) => effect.type === "item" && effect.itemId === gear.id && effect.equippedSlot), "Outcome presentation must record acquired gear and its automatic equipment slot.");
  assert.ok(appliedEffects.some((effect) => effect.type === "status" && effect.status === "strengthened" && effect.stacks === 2), "Outcome presentation must record queued next-combat statuses.");
  assert.ok(appliedEffects.some((effect) => effect.type === "encounter" && effect.enemyId === "dummy" && effect.count === 2), "Outcome presentation must record immediate encounters.");
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
  assert.deepEqual(result.adventure.eventRollResult?.appliedEffects, [{ type: "merchant", itemIds: [item.id] }], "Direct merchant results must persist their structured Outcome entry.");
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

  const remedy: ConsumableItem = {
    kind: "consumable",
    id: "regression-antivenom",
    name: "Regression Antivenom",
    rarity: "uncommon",
    description: "Removes Poison.",
    effects: [{ type: "remove_status", target: "self", status: "poison" }],
  };
  const poisonedCombat = {
    ...created,
    playerStatuses: [createStatusEffect("poison", { stacks: 3, duration: 3 })],
    turnOrder: [playerEntry, ...created.turnOrder.filter((entry) => entry.kind === "enemy")],
    activeTurnIndex: 0,
    initiativeRevealed: true,
  };
  const remedyCharacter = { ...character, inventory: [structuredClone(remedy)] };
  const remedyUsed = useConsumable(poisonedCombat, remedyCharacter, remedy);
  const remedyResolved = resolveCombatEvent(remedyUsed.combat, remedyUsed.combat.eventId, 0);
  assert.equal(remedyResolved.playerStatuses.some((status) => status.id === "poison"), false, "A status-removal consumable must clear its configured status at presentation time.");
}

function testStealthPotionLastsThroughNextTurn() {
  const item = ITEMS.find((candidate): candidate is ConsumableItem => candidate.id === "consumable-ms2vgbcc-5hb8n" && isConsumableItem(candidate));
  assert.ok(item, "The live Potion of Invisibility must exist as a consumable.");
  assert.equal(item.description, "Gain Stealth until the end of your next turn.", "The potion must state Stealth's exact lifetime.");

  const character = { ...structuredClone(INITIAL_GAME.character), name: "Stealth Tester", inventory: [structuredClone(item)] };
  const created = createCombat(character, ["dummy"]);
  const playerEntry = created.turnOrder.find((entry) => entry.kind === "player")!;
  const combat = { ...created, turnOrder: [playerEntry, ...created.turnOrder.filter((entry) => entry.kind === "enemy")], activeTurnIndex: 0, initiativeRevealed: true };
  const used = useConsumable(combat, character, item);
  const resolved = resolveCombatEvent(used.combat, used.combat.eventId, 0);
  assert.equal(resolved.playerStatuses.find((status) => status.id === "stealth")?.duration, 2, "Stealth used during the player's turn must cover the current and next turn-end ticks.");

  const afterCurrentTurn = endPlayerTurn(resolved, used.character);
  assert.equal(afterCurrentTurn.playerStatuses.find((status) => status.id === "stealth")?.duration, 1, "Stealth must remain after ending the turn in which the potion was used.");

  const nextPlayerTurn = {
    ...afterCurrentTurn,
    activeTurnIndex: afterCurrentTurn.turnOrder.findIndex((entry) => entry.kind === "player"),
    floatingEvents: [],
    pendingEffects: [],
  };
  const afterNextTurn = endPlayerTurn(nextPlayerTurn, used.character);
  assert.equal(afterNextTurn.playerStatuses.some((status) => status.id === "stealth"), false, "Stealth must expire when the player's next turn ends.");
}

function testIndependentItemDrops() {
  const firstItem = ITEMS.find((item) => !isGearItem(item));
  const secondItem = ITEMS.find((item) => !isGearItem(item) && item.id !== firstItem?.id);
  assert.ok(firstItem && secondItem, "Drop-table regression requires at least two live items.");
  const enemyTables: ItemDropDefinition[][] = [
    [{ itemId: firstItem.id, chance: 100 }],
    [{ itemId: firstItem.id, chance: 100 }, { itemId: firstItem.id, chance: 50 }, { itemId: secondItem.id, chance: 2 }],
  ];
  const rolls = [0.99, 0.5, 0.49, 0.02, 0.01];
  const loot = rollCombatDropTables(enemyTables, [{ itemId: secondItem.id, chance: 5 }], () => rolls.shift() ?? 1);
  assert.deepEqual(loot.map((item) => item.id), [firstItem.id, firstItem.id, firstItem.id, secondItem.id], "Every enemy instance and repeated drop-table row must roll independently, including exact percentage boundaries.");

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

  const gearDrop = ITEMS.find(isGearItem);
  assert.ok(gearDrop, "Gear-loot regression requires a live gear item.");
  const gearCombat = createCombat(character, ["dummy"]);
  const gearDropState: GameState = {
    ...state,
    character: { ...character, equipment: {} },
    adventure: {
      ...state.adventure,
      combat: { ...gearCombat, outcome: "victory", enemies: gearCombat.enemies.map((enemy) => ({ ...enemy, dropTable: [{ itemId: gearDrop.id, chance: 100 }] })) },
      pendingReward: null,
    },
  };
  const gearRolls = [0];
  const gearRewarded = grantCombatReward(gearDropState, 3, () => gearRolls.shift() ?? 1);
  assert.ok(Object.values(gearRewarded.character.equipment).some((item) => item?.id === gearDrop.id), "Looted gear must automatically fill an empty compatible equipment slot.");
  assert.equal(gearRewarded.character.inventory.some((item) => item.id === gearDrop.id), false, "Automatically equipped loot must not also enter Inventory.");
  assert.equal(gearRewarded.adventure.pendingReward?.loot.some((item) => item.id === gearDrop.id), true, "Automatically equipped loot must remain visible in the score-screen reward.");

  const grouped = groupInventoryItems([firstItem, structuredClone(firstItem), secondItem]);
  assert.deepEqual(grouped.map(({ item, count }) => [item.id, count]), [[firstItem.id, 2], [secondItem.id, 1]], "Duplicate score-screen loot must group by item without changing order.");
}

function testArenaDamageTrial() {
  const initial = structuredClone(INITIAL_GAME);
  initial.characterCreated = true;
  initial.character.name = "Arena Tester";
  initial.adventure.carryHp = 7;
  const started = startArenaChallenge(initial);
  assert.equal(started.adventure.mode, "arena", "The arena must use its dedicated safe challenge mode.");
  assert.equal(started.character.arenaAttemptAvailable, false, "Starting the arena must spend the current attempt.");
  assert.equal(started.adventure.combat?.enemies[0]?.id, "arena-champion", "The damage trial must spawn the Arena Champion.");
  assert.equal(started.adventure.combat?.enemies[0]?.maxHp, ARENA_CHAMPION_MAX_HP, "The Arena Champion must have exactly 100,000 Health.");
  assert.equal(started.adventure.combat?.challenge?.playerTurnLimit, ARENA_TURN_LIMIT, "The damage trial must last ten player turns.");

  let combat = started.adventure.combat!;
  const playerIndex = combat.turnOrder.findIndex((entry) => entry.kind === "player");
  const championId = combat.enemies[0].instanceId;
  for (let turn = 1; turn <= ARENA_TURN_LIMIT; turn += 1) {
    combat = endPlayerTurn({ ...combat, initiativeRevealed: true, activeTurnIndex: playerIndex, actedActorIds: [championId], floatingEvents: [], pendingEffects: [], outcome: "active" }, started.character);
    combat.floatingEvents.forEach((_, eventIndex) => { combat = resolveCombatEvent(combat, combat.eventId, eventIndex); });
    assert.equal(combat.challenge?.playerTurnsCompleted, turn, `Arena turn ${turn} must be counted exactly once.`);
  }
  assert.equal(combat.outcome, "victory", "The arena bell must end the trial after the tenth player turn.");

  const damagedCombat = {
    ...started.adventure.combat!,
    outcome: "victory" as const,
    playerActed: true,
    enemies: started.adventure.combat!.enemies.map((enemy) => ({ ...enemy, hp: 98766 })),
  };
  const rewarded = grantArenaChallengeReward({ ...started, adventure: { ...started.adventure, combat: damagedCombat } }, 123456);
  assert.equal(getArenaExperience(1234), 246, "Arena Experience must be 20% of damage, rounded down to a whole number.");
  assert.equal(rewarded.adventure.pendingReward?.experience, 246, "Arena damage must award 20% of its value as Experience.");
  assert.equal(rewarded.character.arenaScores[0]?.damage, 1234, "Arena damage must be recorded on the personal leaderboard.");
  assert.equal(grantArenaChallengeReward(rewarded, 123457), rewarded, "An arena result must never award Experience twice.");
  assert.equal(resetArenaAttemptAfterAdventure(rewarded.character).arenaAttemptAvailable, true, "Completing an adventure must restore the arena attempt.");

  const crowdedScores = Array.from({ length: 13 }, (_, index) => ({ id: `score-${index}`, damage: index * 10, turns: 10, level: 1, completedAt: index }));
  assert.deepEqual(getArenaScores({ ...rewarded.character, arenaScores: crowdedScores }).map((score) => score.damage), [120,110,100,90,80,70,60,50,40,30], "The arena leaderboard must retain only the ten highest results.");
  [
    "public/assets/town/arena-destination.webp",
    "public/assets/town/champion-gallery.webp",
    "public/assets/backgrounds/arkenfall-arena-combat.webp",
    "public/assets/enemies/full/arena-champion.webp",
    "public/assets/enemies/portraits/arena-champion.webp",
  ].forEach((path) => assert.ok(existsSync(join(process.cwd(), path)), `Missing arena artwork ${path}.`));
}

testAbilityFlatDamage();
testPassiveStatAggregationIsPure();
testDeveloperCharacterTools();
testAutomaticGearAcquisition();
testNewCharacterIntroductionDefaults();
testAttributeAndAfflictionScaling();
testEnemyStartingEnergy();
testEnemyChainedAttacks();
testEnemyEditorSynchronizesLiveDropTables();
testGoblinEnemyBehaviors();
testHighfallEnemyBehaviorsAndLoot();
testTacticalEnemyAiCatalogAndSelection();
testWindsongUncommonItemCollection();
testIndependentItemDrops();
testFleeCombatLossesAndReset();
testQuestLifecycle();
testQuestEditorCatalog();
testConsumablePotionArtworkLibrary();
testScoreScreenGearInspection();
testContentIntegrity();
testGearIconLibrary();
testCraftingMaterialArtworkLibrary();
testGearCombatStatsArePresented();
testItemNameRarityClasses();
testStoryEncounterIntroduction();
testCompletedAdventureAvailability();
testStoryReplayRewards();
testOpposedHitAndDodge();
testStatusAdjustedCombatStats();
testAdventureEditorRepairsInternalIds();
testHighfallMountainTheme();
testHighfallMountainsAdventureContent();
testAdventureAndEventEditorsMergeLiveCatalogs();
testAdventureEditorReordersStages();
testEventEditorRepairsInternalIds();
testItemEditorRepairsInternalIds();
testItemEditorMergesNewLiveCatalogEntries();
testTownAdventureRequirements();
testProgressiveTownStock();
testArkenfallTownCommerceAndCrafting();
testStatusContracts();
testBasicPlayerAbility();
testShadowPoisonAbilityBalance();
testCooldownsCarryBetweenAdventureCombats();
testStructuredEventOutcome();
testDirectEventMerchant();
testResolvedMerchantPresentation();
testCombatConsumable();
testStealthPotionLastsThroughNextTurn();
testArenaDamageTrial();
console.log("Arkenfall regression checks passed.");
