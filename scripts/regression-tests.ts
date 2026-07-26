import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { moveAdventureStage, normalizeAdventureExchange } from "../src/components/devtools/AdventureDevtool";
import { canonicalEnemyExchange, normalizeEnemyExchange } from "../src/components/devtools/EnemyDevtool";
import { normalizeEventExchange } from "../src/components/devtools/EventDevtool";
import { normalizeItemExchange } from "../src/components/devtools/ItemDevtool";
import { GEAR_ICON_URLS, GEAR_ICON_VARIANTS, getGearIconCategory, getGearIconChoices } from "../src/components/GearSlotIcon";
import { ABILITIES, ADVENTURES, ADVENTURE_EVENTS, ENEMIES, GEAR_SETS, ITEMS, TALENTS } from "../src/game/data";
import { canStartStoryAdventure, entryToNode, getAdventureStartingHp, getStoryAdventureAvailability, getStoryNodeIntroduction } from "../src/game/adventures";
import { getDerivedStats, INITIAL_GAME } from "../src/game/character";
import { grantItemForTesting, levelUpCharacterForTesting } from "../src/game/developerTools";
import { getEffectiveDodgeChance, getFinalHitChance, rollHit } from "../src/game/combatMath";
import { getStatusAdjustedCombatStats } from "../src/game/combatStats";
import { applyAbilityFlatDamage } from "../src/game/combat/damage";
import { createCombat, getEnemyStartingEnergy, resolveCombatEvent, takeEnemyTurn, useAbility, useConsumable } from "../src/game/engine";
import { getReadyEnemyAbility } from "../src/game/combat/enemyActions";
import { getInitialEventPresentationPhase, purchaseEventMerchantItem, resolveAdventureEventChoice, sellEventMerchantItem } from "../src/game/eventOutcomes";
import { getItemGoldCost, getItemSellValue, groupInventoryItems, isConsumableItem, isGearItem, isMiscItem } from "../src/game/items";
import { CRAFTING_MATERIAL_ARTWORK_URLS, ITEM_ICON_URLS } from "../src/game/itemIcons";
import { grantCombatReward, rollCombatDropTables } from "../src/game/rewards";
import { addOrRefreshStatus, canApplyStatusEffect, createStatusEffect } from "../src/game/statusEffects";
import { canCraftTownItem, craftTownItem, getItemCraftingRecipe, getTavernRestCost, getTownCraftingCatalog, getTownVendorStock, isTownCraftingRecipeUnlocked, isTownVendorItemUnlocked, purchaseTavernMeal, purchaseTownItem, restAtArkenfallTavern, TAVERN_MEALS } from "../src/game/town";
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
}

function testCraftingMaterialArtworkLibrary() {
  assert.equal(CRAFTING_MATERIAL_ARTWORK_URLS.length, 21, "Metal Scrap and twenty reusable crafting-material icons must be available.");
  assert.equal(new Set(CRAFTING_MATERIAL_ARTWORK_URLS).size, CRAFTING_MATERIAL_ARTWORK_URLS.length, "Crafting-material icon URLs must be unique.");
  CRAFTING_MATERIAL_ARTWORK_URLS.forEach((url) => assert.ok(existsSync(join(process.cwd(), "public", url)), `Missing crafting-material icon ${url}.`));
  assert.equal(ITEM_ICON_URLS["item-ms0ss0dt-z4bke"], "/assets/items/metal-scrap.webp", "Metal Scrap must use its dedicated artwork.");
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
  assert.equal(purchased.message, `${soldItem.name} added to inventory.`, "Town purchase feedback must use the floating-text copy.");

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

  const grouped = groupInventoryItems([firstItem, structuredClone(firstItem), secondItem]);
  assert.deepEqual(grouped.map(({ item, count }) => [item.id, count]), [[firstItem.id, 2], [secondItem.id, 1]], "Duplicate score-screen loot must group by item without changing order.");
}

testAbilityFlatDamage();
testDeveloperCharacterTools();
testEnemyStartingEnergy();
testGoblinEnemyBehaviors();
testIndependentItemDrops();
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
testAdventureEditorReordersStages();
testEventEditorRepairsInternalIds();
testItemEditorRepairsInternalIds();
testTownAdventureRequirements();
testArkenfallTownCommerceAndCrafting();
testStatusContracts();
testBasicPlayerAbility();
testStructuredEventOutcome();
testDirectEventMerchant();
testResolvedMerchantPresentation();
testCombatConsumable();
console.log("Arkenfall regression checks passed.");
