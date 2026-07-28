// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { readFile, writeFile } from "node:fs/promises";
// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { ITEM_ARTWORK_URLS } from "../../src/game/itemIcons";

const abilitySourcePath = fileURLToPath(new URL("../../src/game/content/abilities.ts", import.meta.url));
const talentSourcePath = fileURLToPath(new URL("../../src/game/content/talents.ts", import.meta.url));
const enemySourcePath = fileURLToPath(new URL("../../src/game/content/enemies.ts", import.meta.url));
const gearSourcePath = fileURLToPath(new URL("../../src/game/content/gear.ts", import.meta.url));
const adventureSourcePath = fileURLToPath(new URL("../../src/game/content/adventures.ts", import.meta.url));
const questSourcePath = fileURLToPath(new URL("../../src/game/content/quests.ts", import.meta.url));
const statusEffectsSourcePath = fileURLToPath(new URL("../../src/game/statusEffects.ts", import.meta.url));
const editableEnemyStatFields = [
  "maxHp",
  "physicalPower",
  "spellPower",
  "armor",
  "magicResistance",
  "hitChance",
  "dodgeChance",
  "critChance",
  "energyRegen",
  "maxEnergy",
  "startingEnergy",
] as const;

type SourceEdit = { start: number; end: number; text: string };

function propertyName(property: ts.ObjectLiteralElementLike): string | undefined {
  if (!property.name) return undefined;
  return ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name)
    ? property.name.text
    : undefined;
}

function objectStringProperty(object: ts.ObjectLiteralExpression, name: string): string | undefined {
  const property = object.properties.find((candidate) => ts.isPropertyAssignment(candidate) && propertyName(candidate) === name);
  return property && ts.isPropertyAssignment(property) && ts.isStringLiteralLike(property.initializer)
    ? property.initializer.text
    : undefined;
}

function variableInitializer(sourceFile: ts.SourceFile, name: string): ts.Expression | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return declaration.initializer;
    }
  }
  return undefined;
}

function objectById(objects: readonly ts.ObjectLiteralExpression[], id: string): ts.ObjectLiteralExpression | undefined {
  return objects.find((object) => objectStringProperty(object, "id") === id);
}

function collectObjectEdits(
  source: string,
  sourceFile: ts.SourceFile,
  object: ts.ObjectLiteralExpression,
  replacements: Record<string, string>,
): SourceEdit[] {
  const edits: SourceEdit[] = [];
  const missing: Array<[string, string]> = [];
  Object.entries(replacements).forEach(([name, text]) => {
    const property = object.properties.find((candidate) => ts.isPropertyAssignment(candidate) && propertyName(candidate) === name);
    if (property && ts.isPropertyAssignment(property)) {
      edits.push({ start: property.initializer.getStart(sourceFile), end: property.initializer.getEnd(), text });
    } else {
      missing.push([name, text]);
    }
  });
  if (missing.length > 0) {
    const objectStart = object.getStart(sourceFile);
    const lineStart = source.lastIndexOf("\n", objectStart) + 1;
    const objectIndent = source.slice(lineStart, objectStart).match(/^\s*/)?.[0] ?? "";
    const childIndent = `${objectIndent}  `;
    const inserted = `\n${missing.map(([name, text]) => `${childIndent}${name}: ${text},`).join("\n")}`;
    edits.push({ start: objectStart + 1, end: objectStart + 1, text: inserted });
  }
  return edits;
}

function applySourceEdits(source: string, edits: SourceEdit[]): string {
  return [...edits]
    .sort((left, right) => right.start - left.start)
    .reduce((updated, edit) => updated.slice(0, edit.start) + edit.text + updated.slice(edit.end), source);
}

function sourceScaling(percent: number): string {
  return String(Math.round(percent * 10_000) / 1_000_000);
}

function catalogObject(value: unknown, label: string): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, any>;
}

function catalogString(value: unknown, label: string, allowEmpty = false): string {
  if (typeof value !== "string" || (!allowEmpty && value.trim().length === 0) || value.length > 8_000) throw new Error(`${label} is invalid.`);
  return value;
}

function catalogNumber(value: unknown, label: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) throw new Error(`${label} must be at least ${minimum}.`);
  return value;
}

function catalogId(value: unknown, label: string): string {
  const id = catalogString(value, label);
  if (!/^[a-z0-9_-]+$/i.test(id)) throw new Error(`${label} may contain only letters, numbers, underscores, and hyphens.`);
  return id;
}

function catalogIdsFromArray(initializer: ts.Expression | undefined): Set<string> {
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) return new Set();
  return new Set(initializer.elements.filter(ts.isObjectLiteralExpression).flatMap((object) => {
    const id = objectStringProperty(object, "id");
    return id ? [id] : [];
  }));
}

function catalogObjectsFromRecord(initializer: ts.Expression | undefined): ts.ObjectLiteralExpression[] {
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) return [];
  return initializer.properties.filter(ts.isPropertyAssignment).map((property) => property.initializer).filter(ts.isObjectLiteralExpression);
}

function assertUniqueIds(ids: string[], label: string) {
  if (new Set(ids).size !== ids.length) throw new Error(`${label} IDs must be unique.`);
}

function validateDropTable(value: unknown, itemIds: Set<string>, label: string, allowDuplicateItems = false): Array<{ itemId: string; chance: number }> {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${label} must be a list.`);
  const drops = value.map((rawDrop, index) => {
    const drop = catalogObject(rawDrop, `${label} entry ${index + 1}`);
    const itemId = catalogId(drop.itemId, `${label} item`);
    if (!itemIds.has(itemId)) throw new Error(`${label} references an item that is not saved in the live game.`);
    const chance = catalogNumber(drop.chance, `${label} chance`);
    if (chance > 100) throw new Error(`${label} chance cannot exceed 100%.`);
    return { itemId, chance };
  });
  if (!allowDuplicateItems) assertUniqueIds(drops.map((drop) => drop.itemId), `${label} item`);
  return drops;
}

const enemyBehaviors = new Set([
  "single", "rabid_rat", "priority", "wisp_barrage", "brown_bear", "forest_spirit",
  "goblin_longseer", "goblin_woundfixer", "goblin_biggrown", "goblin_chieftain",
  "hill_troll", "mountain_troll", "troll_shaman", "bandit_enforcer", "loot_goblin",
  "bandit_trapper", "troll_bandit_king",
]);

function validateEnemyExchange(exchangeValue: unknown, itemIds: Set<string>, statusIds: Set<string>): Record<string, unknown> {
  const exchange = catalogObject(exchangeValue, "Enemy exchange");
  if (exchange.format !== "arkenfall-enemies" || exchange.version !== 3 || !Array.isArray(exchange.enemies)) throw new Error("Unsupported enemy exchange format.");
  const ids = exchange.enemies.map((raw: unknown) => catalogId(catalogObject(raw, "Enemy").id, "Enemy ID"));
  assertUniqueIds(ids, "Enemy");
  const record: Record<string, unknown> = {};
  exchange.enemies.forEach((raw: unknown) => {
    const enemy = catalogObject(raw, "Enemy");
    const id = catalogId(enemy.id, "Enemy ID");
    const name = catalogString(enemy.name, "Enemy name");
    catalogString(enemy.title, `${name} title`);
    if (!/^\/assets\/enemies\/full\/[a-z0-9-]+\.webp$/i.test(catalogString(enemy.imageUrl, `${name} full artwork`))) throw new Error(`${name} has an invalid full artwork URL.`);
    if (!/^\/assets\/enemies\/portraits\/[a-z0-9-]+\.webp$/i.test(catalogString(enemy.portraitUrl, `${name} portrait`))) throw new Error(`${name} has an invalid portrait URL.`);
    ["maxHp", "physicalPower", "spellPower", "armor", "magicResistance", "energyRegen", "maxEnergy", "startingEnergy"].forEach((field) => catalogNumber(enemy[field], `${name} ${field}`, field === "maxHp" || field === "maxEnergy" ? 1 : 0));
    if (enemy.startingEnergy > enemy.maxEnergy) throw new Error(`${name} Starting Energy cannot exceed Max Energy.`);
    if (enemy.startingStatuses !== undefined) {
      if (!Array.isArray(enemy.startingStatuses)) throw new Error(`${name} starting statuses must be a list.`);
      enemy.startingStatuses.forEach((rawStatus: unknown) => {
        const application = catalogObject(rawStatus, `${name} starting status`);
        const status = catalogId(application.status, `${name} starting status ID`);
        if (!statusIds.has(status)) throw new Error(`${name} references unknown starting status ${status}.`);
      });
    }
    ["hitChance", "dodgeChance", "critChance"].forEach((field) => {
      const percent = catalogNumber(enemy[field], `${name} ${field}`);
      if (percent > 1000) throw new Error(`${name} ${field} is too large.`);
    });
    const dropTable = validateDropTable(enemy.dropTable, itemIds, `${name} drop table`, true);
    if (!Array.isArray(enemy.abilities)) throw new Error(`${name} abilities must be a list.`);
    const abilityIds = enemy.abilities.map((rawAbility: unknown) => catalogId(catalogObject(rawAbility, `${name} ability`).id, `${name} ability ID`));
    assertUniqueIds(abilityIds, `${name} ability`);
    const abilities = enemy.abilities.map((rawAbility: unknown) => {
      const ability = catalogObject(rawAbility, `${name} ability`);
      catalogString(ability.name, `${name} ability name`);
      catalogString(ability.effect, `${name} ability effect`, true);
      catalogNumber(ability.energyCost, `${name} ability Energy cost`);
      catalogNumber(ability.cooldownTurns, `${name} ability cooldown`);
      if (ability.range !== "melee" && ability.range !== "ranged") throw new Error(`${name} ability range is invalid.`);
      catalogString(ability.vfx, `${name} ability VFX`);
      if (ability.resurrectFriendlyMaxHpRatio !== undefined) {
        const ratio = catalogNumber(ability.resurrectFriendlyMaxHpRatio, `${name} resurrection Health ratio`, 0);
        if (ratio > 1) throw new Error(`${name} resurrection Health ratio cannot exceed 1.`);
      }
      ["statusApplications", "selfStatusApplications", "selfStatusApplicationsWhenEnergyDepleted", "friendlyStatusApplications"].forEach((field) => {
        if (ability[field] === undefined) return;
        if (!Array.isArray(ability[field])) throw new Error(`${name} ${field} must be a list.`);
        ability[field].forEach((rawStatus: unknown) => {
          const application = catalogObject(rawStatus, `${name} status application`);
          const status = catalogId(application.status, `${name} status`);
          if (!statusIds.has(status)) throw new Error(`${name} references unknown status ${status}.`);
        });
      });
      if (ability.targetStatusDamageBonus !== undefined) {
        const bonus = catalogObject(ability.targetStatusDamageBonus, `${name} target status damage bonus`);
        const status = catalogId(bonus.status, `${name} target bonus status`);
        if (!statusIds.has(status)) throw new Error(`${name} references unknown target bonus status ${status}.`);
        const multiplier = catalogNumber(bonus.multiplier, `${name} target status damage multiplier`, 0);
        if (multiplier > 5) throw new Error(`${name} target status damage multiplier is too large.`);
      }
      const { effect, ...sourceAbility } = ability;
      return { ...sourceAbility, description: effect };
    });
    catalogString(enemy.behaviorNotes, `${name} behavior notes`, true);
    if (!enemyBehaviors.has(enemy.behavior as string)) throw new Error(`${name} behavior is invalid.`);
    if (enemy.ai !== undefined) {
      const ai = catalogObject(enemy.ai, `${name} tactical AI`);
      if (ai.fallback !== "ordered" && ai.fallback !== "cycle") throw new Error(`${name} tactical AI fallback is invalid.`);
      if (!Array.isArray(ai.rules)) throw new Error(`${name} tactical AI rules must be a list.`);
      const knownAbilityIds = new Set(abilityIds);
      ai.rules.forEach((rawRule: unknown) => {
        const rule = catalogObject(rawRule, `${name} tactical AI rule`);
        const abilityId = catalogId(rule.abilityId, `${name} tactical AI ability ID`);
        if (!knownAbilityIds.has(abilityId)) throw new Error(`${name} tactical AI references unknown ability ${abilityId}.`);
        if (rule.all !== undefined && !Array.isArray(rule.all)) throw new Error(`${name} tactical AI conditions must be a list.`);
        (rule.all ?? []).forEach((rawCondition: unknown) => {
          const condition = catalogObject(rawCondition, `${name} tactical AI condition`);
          const type = catalogString(condition.type, `${name} tactical AI condition type`);
          if (["self_hp_below", "self_hp_above", "player_hp_below", "player_hp_above", "any_ally_hp_below"].includes(type)) {
            const ratio = catalogNumber(condition.ratio, `${name} tactical AI health ratio`, 0);
            if (ratio > 1) throw new Error(`${name} tactical AI health ratio cannot exceed 1.`);
          } else if (["self_has_status", "self_missing_status", "player_has_status", "player_missing_status", "any_ally_missing_status"].includes(type)) {
            const status = catalogId(condition.status, `${name} tactical AI status`);
            if (!statusIds.has(status)) throw new Error(`${name} tactical AI references unknown status ${status}.`);
          } else if (type === "living_allies_at_least") {
            const count = catalogNumber(condition.count, `${name} tactical AI ally count`, 1);
            if (!Number.isInteger(count)) throw new Error(`${name} tactical AI ally count must be a whole number.`);
          } else if (type === "energy_at_least") {
            catalogNumber(condition.amount, `${name} tactical AI Energy threshold`, 0);
          } else if (type === "last_ability_is") {
            const previousAbilityId = catalogId(condition.abilityId, `${name} tactical AI previous ability ID`);
            if (!knownAbilityIds.has(previousAbilityId)) throw new Error(`${name} tactical AI references unknown previous ability ${previousAbilityId}.`);
          } else if (type === "phase_is" || type === "phase_is_not") {
            catalogString(condition.phase, `${name} tactical AI phase`);
          } else if (type !== "no_other_living_allies" && type !== "dead_ally_exists") throw new Error(`${name} tactical AI condition ${type} is invalid.`);
        });
      });
      if (ai.fallbackAbilityIds !== undefined) {
        if (!Array.isArray(ai.fallbackAbilityIds)) throw new Error(`${name} tactical AI fallback abilities must be a list.`);
        const fallbackIds = ai.fallbackAbilityIds.map((value: unknown) => catalogId(value, `${name} tactical AI fallback ability ID`));
        assertUniqueIds(fallbackIds, `${name} tactical AI fallback ability`);
        fallbackIds.forEach((abilityId: string) => {
          if (!knownAbilityIds.has(abilityId)) throw new Error(`${name} tactical AI references unknown fallback ability ${abilityId}.`);
        });
      }
    }
    const maxActionsPerTurn = catalogNumber(enemy.maxActionsPerTurn, `${name} maximum actions`, 1);
    if (!Number.isInteger(maxActionsPerTurn)) throw new Error(`${name} maximum actions must be a whole number.`);
    catalogString(enemy.accent, `${name} accent`);
    const sourceEnemy = {
      ...enemy,
      hitChance: enemy.hitChance / 100,
      dodgeChance: enemy.dodgeChance / 100,
      critChance: enemy.critChance / 100,
      dropTable,
      abilities,
    };
    record[id] = sourceEnemy;
  });
  return record;
}

const positiveEventEffects = new Set(["heal", "playerNextCombatBuff", "gainGold", "gainItem", "openMerchant", "gainExperience", "gainTalentPoints", "gainAttributePoints", "enemiesNextCombatDebuff"]);
const negativeEventEffects = new Set(["loseHealth", "loseGold", "playerNextCombatDebuff", "loseExperience", "enemiesNextCombatBuff", "immediateEncounter"]);
const allEventEffects = new Set([...positiveEventEffects, ...negativeEventEffects]);
const amountEventEffects = new Set(["heal", "loseHealth", "gainGold", "loseGold", "gainExperience", "loseExperience", "gainTalentPoints", "gainAttributePoints"]);
const playerBuffEffects = new Set(["playerNextCombatBuff", "enemiesNextCombatBuff"]);
const playerDebuffEffects = new Set(["playerNextCombatDebuff", "enemiesNextCombatDebuff"]);

function validateEventOutcome(
  value: unknown,
  polarity: "positive" | "negative" | "any",
  itemIds: Set<string>,
  enemyIds: Set<string>,
  statusKinds: Map<string, string>,
) {
  const outcome = catalogObject(value, `${polarity} outcome`);
  catalogString(outcome.text, `${polarity} outcome text`, true);
  if (!Array.isArray(outcome.effects)) throw new Error(`${polarity} outcome effects must be a list.`);
  const allowed = polarity === "positive" ? positiveEventEffects : polarity === "negative" ? negativeEventEffects : allEventEffects;
  let encounters = 0;
  let merchants = 0;
  outcome.effects.forEach((rawEffect: unknown, index: number) => {
    const effect = catalogObject(rawEffect, `${polarity} effect ${index + 1}`);
    const type = catalogString(effect.type, `${polarity} effect type`);
    if (!allowed.has(type)) throw new Error(`${type} is not a valid ${polarity} outcome effect.`);
    if (amountEventEffects.has(type)) catalogNumber(effect.amount, `${type} amount`);
    if (type === "gainItem" && !itemIds.has(catalogId(effect.itemId, "Item ID"))) throw new Error("The selected item is not part of the live item catalog.");
    if (type === "openMerchant") {
      merchants += 1;
      if (!Array.isArray(effect.itemIds) || effect.itemIds.length === 0) throw new Error("A Wandering Merchant must sell at least one item.");
      const merchantItemIds = effect.itemIds.map((itemId: unknown) => catalogId(itemId, "Merchant item ID"));
      assertUniqueIds(merchantItemIds, "Merchant item");
      if (merchantItemIds.some((itemId) => !itemIds.has(itemId))) throw new Error("The Wandering Merchant contains an item that is not part of the live item catalog.");
    }
    if (playerBuffEffects.has(type) || playerDebuffEffects.has(type)) {
      const status = catalogId(effect.status, "Status ID");
      const requiredKind = playerBuffEffects.has(type) ? "buff" : "debuff";
      if (statusKinds.get(status) !== requiredKind) throw new Error(`${status} is not a valid ${requiredKind}.`);
      catalogNumber(effect.stacks, "Status stacks", 1);
    }
    if (type === "immediateEncounter") {
      encounters += 1;
      if (!enemyIds.has(catalogId(effect.enemyId, "Enemy ID"))) throw new Error("The selected encounter enemy is not part of the live enemy catalog.");
      catalogNumber(effect.count, "Enemy count", 1);
      catalogNumber(effect.experience, "Encounter experience");
      catalogNumber(effect.gold, "Encounter gold");
    }
  });
  if (encounters > 1) throw new Error("An outcome can contain only one immediate encounter.");
  if (merchants > 1) throw new Error("An outcome can contain only one Wandering Merchant.");
}

function validateEventExchange(exchangeValue: unknown, itemIds: Set<string>, enemyIds: Set<string>, statusKinds: Map<string, string>): Record<string, unknown> {
  const exchange = catalogObject(exchangeValue, "Event exchange");
  if (exchange.format !== "arkenfall-events" || exchange.version !== 2 || !Array.isArray(exchange.events)) throw new Error("Unsupported event exchange format.");
  const eventIds = exchange.events.map((rawEvent: unknown) => catalogId(catalogObject(rawEvent, "Event").id, "Event ID"));
  assertUniqueIds(eventIds, "Event");
  const record: Record<string, unknown> = {};
  exchange.events.forEach((rawEvent: unknown) => {
    const event = catalogObject(rawEvent, "Event");
    const id = catalogId(event.id, "Event ID");
    catalogString(event.name, "Event name");
    catalogString(event.eyebrow, "Event eyebrow");
    catalogString(event.description, "Event description");
    if (!Array.isArray(event.choices) || event.choices.length < 2 || event.choices.length > 3) throw new Error(`${event.name} must have two or three choices.`);
    const choiceIds = event.choices.map((rawChoice: unknown) => catalogId(catalogObject(rawChoice, "Choice").id, "Choice ID"));
    assertUniqueIds(choiceIds, `${event.name} choice`);
    event.choices.forEach((rawChoice: unknown) => {
      const choice = catalogObject(rawChoice, "Choice");
      catalogString(choice.label, "Choice label");
      catalogString(choice.description, "Choice description", true);
      const resolution = choice.resolution ?? "check";
      if (resolution !== "check" && resolution !== "direct") throw new Error("Choice resolution is invalid.");
      if (resolution === "direct") {
        validateEventOutcome(choice.outcome, "any", itemIds, enemyIds, statusKinds);
      } else {
        if (!["strength", "agility", "intelligence", "vitality", "luck"].includes(choice.stat)) throw new Error("Choice attribute is invalid.");
        catalogNumber(choice.threshold, "Choice threshold", 1);
        validateEventOutcome(choice.success, "positive", itemIds, enemyIds, statusKinds);
        validateEventOutcome(choice.failure, "negative", itemIds, enemyIds, statusKinds);
      }
    });
    record[id] = event;
  });
  return record;
}

function validateAdventureExchange(exchangeValue: unknown, enemyIds: Set<string>, eventIds: Set<string>, itemIds: Set<string>): unknown[] {
  const exchange = catalogObject(exchangeValue, "Adventure exchange");
  if (exchange.format !== "arkenfall-adventures" || exchange.version !== 1 || !Array.isArray(exchange.adventures) || exchange.adventures.length === 0) throw new Error("Unsupported or empty adventure exchange format.");
  const adventureIds = exchange.adventures.map((rawAdventure: unknown) => catalogId(catalogObject(rawAdventure, "Adventure").id, "Adventure ID"));
  assertUniqueIds(adventureIds, "Adventure");
  const knownAdventureIds = new Set(adventureIds);
  exchange.adventures.forEach((rawAdventure: unknown) => {
    const adventure = catalogObject(rawAdventure, "Adventure");
    catalogString(adventure.name, "Adventure name");
    catalogString(adventure.description, "Adventure description");
    catalogNumber(adventure.recommendedLevel, "Recommended level", 1);
    if (adventure.theme !== "windsong_forest" && adventure.theme !== "arkenfall_highlands" && adventure.theme !== "highfall_mountains" && adventure.theme !== "custom") throw new Error("Adventure theme is invalid.");
    if (adventure.cardImageUrl !== undefined && !/^\/assets\/backgrounds\/[a-z0-9-]+\.webp$/i.test(catalogString(adventure.cardImageUrl, "Adventure card image"))) throw new Error("Adventure card image is invalid.");
    if (adventure.combatBackgroundUrl !== undefined && !/^\/assets\/backgrounds\/[a-z0-9-]+\.webp$/i.test(catalogString(adventure.combatBackgroundUrl, "Adventure combat background"))) throw new Error("Adventure combat background is invalid.");
    if (adventure.theme === "custom" && (!adventure.cardImageUrl || !adventure.combatBackgroundUrl)) throw new Error(`${adventure.name} needs both custom background images.`);
    if (adventure.travelText !== undefined) catalogString(adventure.travelText, "Travel loading text");
    catalogString(adventure.completionTitle, "Completion title");
    catalogString(adventure.completionDescription, "Completion description", true);
    if (adventure.prerequisiteAdventureId !== undefined && !knownAdventureIds.has(catalogId(adventure.prerequisiteAdventureId, "Prerequisite adventure ID"))) throw new Error("Prerequisite adventure does not exist.");
    if (!Array.isArray(adventure.stages) || adventure.stages.length === 0) throw new Error(`${adventure.name} must have at least one stage.`);
    const stageIds = adventure.stages.map((rawStage: unknown) => catalogId(catalogObject(rawStage, "Stage").id, "Stage ID"));
    assertUniqueIds(stageIds, `${adventure.name} stage`);
    adventure.stages.forEach((rawStage: unknown) => {
      const stage = catalogObject(rawStage, "Stage");
      catalogString(stage.name, "Stage name");
      stage.dropTable = validateDropTable(stage.dropTable, itemIds, `${stage.name} drop table`);
      if (!Array.isArray(stage.entries) || stage.entries.length === 0) throw new Error(`${stage.name} must have at least one possibility.`);
      const entryIds = stage.entries.map((rawEntry: unknown) => catalogId(catalogObject(rawEntry, "Stage possibility").id, "Stage possibility ID"));
      assertUniqueIds(entryIds, `${stage.name} possibility`);
      stage.entries.forEach((rawEntry: unknown) => {
        const entry = catalogObject(rawEntry, "Stage possibility");
        if (!["combat", "event", "boss"].includes(entry.type)) throw new Error("Stage possibility type is invalid.");
        catalogNumber(entry.chance, "Stage chance");
        catalogString(entry.title, "Stage title");
        catalogString(entry.eyebrow, "Stage eyebrow");
        catalogString(entry.description, "Stage description", true);
        if (entry.type === "event") {
          if (!eventIds.has(catalogId(entry.eventId, "Event ID"))) throw new Error("A stage references an event that is not saved in the live game.");
        } else {
          if (!Array.isArray(entry.enemyIds) || entry.enemyIds.length === 0 || entry.enemyIds.some((id: unknown) => typeof id !== "string" || !enemyIds.has(id))) throw new Error(`${entry.title} must contain only live enemies.`);
          const reward = catalogObject(entry.reward, "Victory reward");
          catalogNumber(reward.experience, "Victory experience");
          catalogNumber(reward.gold, "Victory gold");
        }
      });
    });
  });
  return exchange.adventures;
}

const itemRarities = new Set(["common", "uncommon", "rare", "epic", "legendary"]);
const itemArtworkUrls = new Set<string>(ITEM_ARTWORK_URLS);
const gearSlots = new Set(["head", "chest", "pants", "boots", "mainHand", "offHand", "ring"]);
const armorMaterials = new Set(["plate", "leather", "cloth"]);
const weaponEquipTypes = new Set(["mainHand", "oneHand", "offHand", "twoHand"]);
const weaponKinds = new Set(["sword", "axe", "mace", "dagger", "wand", "shield", "tome", "staff", "polearm"]);
const statNames = ["strength", "agility", "intelligence", "vitality", "luck"];

function optionalCatalogNumber(value: unknown, label: string, minimum?: number) {
  if (value === undefined) return;
  if (typeof value !== "number" || !Number.isFinite(value) || (minimum !== undefined && value < minimum)) throw new Error(`${label} is invalid.`);
}

function catalogFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} must be a number.`);
  return value;
}

function validateStats(value: unknown, label: string) {
  if (value === undefined) return;
  const stats = catalogObject(value, label);
  Object.entries(stats).forEach(([name, amount]) => {
    if (!statNames.includes(name)) throw new Error(`${label} contains an unknown attribute.`);
    optionalCatalogNumber(amount, `${label} ${name}`);
  });
}

function validatePassive(value: unknown, label: string) {
  if (value === undefined) return;
  const passive = catalogObject(value, label);
  validateStats(passive.stats, `${label} attributes`);
  Object.entries(passive).forEach(([name, amount]) => {
    if (name === "stats") return;
    if (typeof amount === "number") optionalCatalogNumber(amount, `${label} ${name}`);
    else if (amount !== undefined && typeof amount !== "object") throw new Error(`${label} ${name} is invalid.`);
  });
}

function validateItemExchange(exchangeValue: unknown, statusIds: Set<string>, adventureIds: Set<string>): { items: unknown[]; sets: unknown[] } {
  const exchange = catalogObject(exchangeValue, "Item exchange");
  if (exchange.format !== "arkenfall-items" || exchange.version !== 1 || !Array.isArray(exchange.items) || !Array.isArray(exchange.sets)) throw new Error("Unsupported item exchange format.");
  const itemIds = exchange.items.map((raw: unknown) => catalogId(catalogObject(raw, "Item").id, "Item ID"));
  const setIds = exchange.sets.map((raw: unknown) => catalogId(catalogObject(raw, "Gear set").id, "Gear set ID"));
  assertUniqueIds([...itemIds, ...setIds], "Item and set");
  const knownSets = new Set(setIds);
  const knownItems = new Set(itemIds);
  const townVendors = new Set(["blacksmith", "alchemist", "tailor", "leatherworker", "jeweler"]);
  const validateAdventureRequirement = (value: unknown, label: string) => {
    if (value === undefined || value === null) return;
    const adventureId = catalogId(value, label);
    if (!adventureIds.has(adventureId)) throw new Error(`${label} references an adventure that does not exist.`);
  };

  exchange.sets.forEach((raw: unknown) => {
    const set = catalogObject(raw, "Gear set");
    catalogString(set.name, "Gear set name");
    const pieceCount = catalogNumber(set.pieceCount, "Gear set piece count", 1);
    if (!Array.isArray(set.bonuses)) throw new Error(`${set.name} bonuses must be a list.`);
    set.bonuses.forEach((rawBonus: unknown, index: number) => {
      const bonus = catalogObject(rawBonus, `${set.name} bonus ${index + 1}`);
      const required = catalogNumber(bonus.requiredPieces, "Required set pieces", 1);
      if (required > pieceCount) throw new Error(`${set.name} has a bonus requiring more pieces than the set contains.`);
      catalogString(bonus.description, "Set bonus description", true);
      if (bonus.specialEffectNotes !== undefined) catalogString(bonus.specialEffectNotes, "Set special effect notes", true);
      validatePassive(bonus.passive, "Set passive bonus");
    });
  });

  exchange.items.forEach((raw: unknown) => {
    const item = catalogObject(raw, "Item");
    catalogString(item.name, "Item name");
    catalogString(item.description, "Item description", true);
    catalogNumber(item.goldCost, `${item.name} gold cost`);
    if (!itemRarities.has(item.rarity)) throw new Error(`${item.name} has an invalid rarity.`);
    if (item.arkenfallVendor !== undefined && item.arkenfallVendor !== null && !townVendors.has(item.arkenfallVendor as string)) throw new Error(`${item.name} has an invalid Arkenfall vendor.`);
    validateAdventureRequirement(item.vendorPrerequisiteAdventureId, `${item.name} shop unlock requirement`);
    if (item.arkenfallVendor === null && item.vendorPrerequisiteAdventureId) throw new Error(`${item.name} cannot have a shop unlock requirement without an Arkenfall vendor.`);
    if (item.craftingRecipe !== undefined && item.craftingRecipe !== null) {
      const recipe = catalogObject(item.craftingRecipe, `${item.name} crafting recipe`);
      if (!townVendors.has(recipe.station as string)) throw new Error(`${item.name} has an invalid crafting location.`);
      validateAdventureRequirement(recipe.prerequisiteAdventureId, `${item.name} recipe unlock requirement`);
      if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) throw new Error(`${item.name} needs at least one crafting ingredient.`);
      const recipeItemIds = new Set<string>();
      recipe.ingredients.forEach((rawIngredient: unknown, index: number) => {
        const ingredient = catalogObject(rawIngredient, `${item.name} ingredient ${index + 1}`);
        const ingredientId = catalogId(ingredient.itemId, "Crafting ingredient ID");
        if (!knownItems.has(ingredientId)) throw new Error(`${item.name} references a crafting ingredient that does not exist.`);
        if (ingredientId === item.id) throw new Error(`${item.name} cannot require itself as a crafting ingredient.`);
        if (recipeItemIds.has(ingredientId)) throw new Error(`${item.name} lists the same crafting ingredient more than once.`);
        recipeItemIds.add(ingredientId);
        const quantity = catalogNumber(ingredient.quantity, "Crafting ingredient quantity", 1);
        if (!Number.isInteger(quantity)) throw new Error(`${item.name} crafting quantities must be whole numbers.`);
      });
    }
    if (item.kind === "consumable") {
      if (item.iconUrl !== undefined && (typeof item.iconUrl !== "string" || !itemArtworkUrls.has(item.iconUrl))) throw new Error(`${item.name} has an invalid item image.`);
      if (item.specialEffectNotes !== undefined) catalogString(item.specialEffectNotes, "Consumable special effect notes", true);
      if (!Array.isArray(item.effects) || item.effects.length === 0) throw new Error(`${item.name} must have at least one effect.`);
      item.effects.forEach((rawEffect: unknown, index: number) => {
        const effect = catalogObject(rawEffect, `${item.name} effect ${index + 1}`);
        const type = catalogString(effect.type, "Consumable effect type");
        if (!["heal", "gain_energy", "change_next_turn_energy_regen", "change_energy", "damage", "apply_status", "remove_status"].includes(type)) throw new Error(`${type} is not a supported consumable effect.`);
        if (type !== "apply_status" && type !== "remove_status") {
          const amount = catalogFiniteNumber(effect.amount, `${item.name} effect amount`);
          if (!["change_energy", "change_next_turn_energy_regen"].includes(type) && amount < 0) throw new Error(`${item.name} effect amount cannot be negative.`);
        }
        if (type === "damage" || type === "apply_status" || type === "remove_status") {
          if (!["self", "target", "all_enemies"].includes(effect.target)) throw new Error(`${item.name} has an invalid effect target.`);
        }
        if (type === "apply_status" || type === "remove_status") {
          const status = catalogId(effect.status, "Consumable status");
          if (!statusIds.has(status)) throw new Error(`${status} is not a live status effect.`);
        }
        if (type === "apply_status") {
          catalogNumber(effect.stacks, "Consumable status stacks", 1);
          catalogNumber(effect.duration, "Consumable status duration", 1);
        }
      });
      return;
    }

    if (item.kind === "misc") {
      if (item.iconUrl !== undefined && (typeof item.iconUrl !== "string" || !itemArtworkUrls.has(item.iconUrl))) throw new Error(`${item.name} has an invalid item image.`);
      if (item.specialEffectNotes !== undefined) catalogString(item.specialEffectNotes, "Item special effect notes", true);
      return;
    }

    if (item.kind !== undefined && item.kind !== "gear") throw new Error(`${item.name} has an invalid item type.`);

    if (!gearSlots.has(item.slot)) throw new Error(`${item.name} has an invalid gear slot.`);
    if (item.armorMaterial !== undefined && !armorMaterials.has(item.armorMaterial)) throw new Error(`${item.name} has an invalid armor material.`);
    if (item.weaponEquipType !== undefined && !weaponEquipTypes.has(item.weaponEquipType)) throw new Error(`${item.name} has an invalid weapon grip.`);
    if (item.weaponKind !== undefined && !weaponKinds.has(item.weaponKind)) throw new Error(`${item.name} has an invalid weapon kind.`);
    if (item.iconUrl !== undefined && (typeof item.iconUrl !== "string" || !/^\/assets\/gear-icons\/[a-z0-9-]+\.webp$/i.test(item.iconUrl))) throw new Error(`${item.name} has an invalid gear image.`);
    validateStats(item.stats, `${item.name} attributes`);
    ["armor", "magicResistance", "physicalPower", "magicalPower"].forEach((field) => optionalCatalogNumber(item[field], `${item.name} ${field}`));
    if (item.combat !== undefined) validatePassive(catalogObject(item.combat, `${item.name} combat bonuses`).passive, `${item.name} combat passive`);
    if (item.set !== undefined && !knownSets.has(catalogId(item.set, "Gear set reference"))) throw new Error(`${item.name} references a gear set that does not exist.`);
    if (item.specialEffectNotes !== undefined) catalogString(item.specialEffectNotes, "Gear special effect notes", true);
  });
  return { items: exchange.items, sets: exchange.sets };
}

function validateQuestExchange(exchangeValue: unknown, enemyIds: Set<string>, itemIds: Set<string>, adventureIds: Set<string>): { quests: unknown[]; questlines: unknown[] } {
  const exchange = catalogObject(exchangeValue, "Quest exchange");
  if (exchange.format !== "arkenfall-quests" || exchange.version !== 1 || !Array.isArray(exchange.quests) || !Array.isArray(exchange.questlines)) throw new Error("Unsupported quest exchange format.");
  const questIds = exchange.quests.map((raw: unknown) => catalogId(catalogObject(raw, "Quest").id, "Quest ID"));
  const questlineIds = exchange.questlines.map((raw: unknown) => catalogId(catalogObject(raw, "Questline").id, "Questline ID"));
  assertUniqueIds([...questIds, ...questlineIds], "Quest and questline");
  const knownQuestIds = new Set(questIds);
  exchange.quests.forEach((raw: unknown) => {
    const quest = catalogObject(raw, "Quest");
    catalogString(quest.title, "Quest title");
    catalogString(quest.description, `${quest.title} description`);
    const objective = catalogObject(quest.objective, `${quest.title} goal`);
    const objectiveType = catalogString(objective.type, "Quest goal type");
    const quantity = catalogNumber(objective.quantity, "Quest goal quantity", 1);
    if (!Number.isInteger(quantity)) throw new Error(`${quest.title} goal quantity must be a whole number.`);
    if (objectiveType === "kill_enemy") {
      if (!enemyIds.has(catalogId(objective.enemyId, "Quest enemy ID"))) throw new Error(`${quest.title} references an enemy that is not saved in the live game.`);
    } else if (objectiveType === "collect_item") {
      if (!itemIds.has(catalogId(objective.itemId, "Quest item ID"))) throw new Error(`${quest.title} references an item that is not saved in the live game.`);
    } else if (objectiveType === "complete_adventure") {
      if (!adventureIds.has(catalogId(objective.adventureId, "Quest adventure ID"))) throw new Error(`${quest.title} references an adventure that is not saved in the live game.`);
    } else {
      throw new Error(`${quest.title} has an invalid goal type.`);
    }
    const reward = catalogObject(quest.reward, `${quest.title} reward`);
    const experience = catalogNumber(reward.experience, "Quest experience reward");
    if (!Number.isInteger(experience)) throw new Error(`${quest.title} experience reward must be a whole number.`);
    if (!Array.isArray(reward.items)) throw new Error(`${quest.title} reward items must be a list.`);
    const rewardItemIds = reward.items.map((rawReward: unknown, index: number) => {
      const itemReward = catalogObject(rawReward, `${quest.title} reward item ${index + 1}`);
      const itemId = catalogId(itemReward.itemId, "Quest reward item ID");
      if (!itemIds.has(itemId)) throw new Error(`${quest.title} rewards an item that is not saved in the live game.`);
      const rewardQuantity = catalogNumber(itemReward.quantity, "Quest reward item quantity", 1);
      if (!Number.isInteger(rewardQuantity)) throw new Error(`${quest.title} reward item quantities must be whole numbers.`);
      return itemId;
    });
    assertUniqueIds(rewardItemIds, `${quest.title} reward item`);
  });
  const assignedQuestIds = new Set<string>();
  exchange.questlines.forEach((raw: unknown) => {
    const questline = catalogObject(raw, "Questline");
    catalogString(questline.title, "Questline title");
    catalogString(questline.description, `${questline.title} description`);
    if (!Array.isArray(questline.questIds)) throw new Error(`${questline.title} quests must be a list.`);
    const orderedQuestIds = questline.questIds.map((rawId: unknown) => catalogId(rawId, "Questline quest ID"));
    assertUniqueIds(orderedQuestIds, `${questline.title} quest`);
    orderedQuestIds.forEach((questId: string) => {
      if (!knownQuestIds.has(questId)) throw new Error(`${questline.title} references a quest that does not exist.`);
      if (assignedQuestIds.has(questId)) throw new Error(`${questId} appears in more than one questline.`);
      assignedQuestIds.add(questId);
    });
  });
  return { quests: exchange.quests, questlines: exchange.questlines };
}

export function localSourceSync() {
  let sourceMutationQueue = Promise.resolve();
  const enqueueSourceMutation = (mutation: () => Promise<void>) => {
    const pending = sourceMutationQueue.then(mutation, mutation);
    sourceMutationQueue = pending.catch(() => undefined);
    return pending;
  };
  return {
    name: "arkenfall-local-source-sync",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use: (path: string, handler: (request: any, response: any, next: () => void) => void) => void } }) {
      server.middlewares.use("/__arkenfall/enemy-stats", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        request.setEncoding("utf8");
        let body = "";
        request.on("data", (chunk: string) => {
          body += chunk;
          if (body.length > 16_384) request.destroy();
        });
        request.on("end", async () => {
          try {
            const payload = JSON.parse(body) as { id?: unknown; stats?: Record<string, unknown> };
            if (typeof payload.id !== "string" || !/^[a-z0-9-]+$/i.test(payload.id) || !payload.stats) {
              throw new Error("Invalid enemy stat payload.");
            }

            const suppliedFields = editableEnemyStatFields.filter((field) => Object.prototype.hasOwnProperty.call(payload.stats, field));
            if (suppliedFields.length === 0) throw new Error("No editable enemy stats were supplied.");
            const stats = Object.fromEntries(suppliedFields.map((field) => {
              const value = payload.stats?.[field];
              if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number.`);
              if ((field === "maxHp" || field === "maxEnergy") && value < 1) throw new Error(`${field} must be at least 1.`);
              if (field === "startingEnergy" && !Number.isInteger(value)) throw new Error("startingEnergy must be a whole number.");
              return [field, value];
            }));

            await enqueueSourceMutation(async () => {
              const source = await readFile(enemySourcePath, "utf8");
              const enemiesStart = source.indexOf("export const ENEMIES");
              const enemyMarker = `id: "${payload.id}"`;
              const enemyStart = source.indexOf(enemyMarker, enemiesStart);
              const abilitiesStart = source.indexOf("abilities:", enemyStart);
              if (enemiesStart < 0 || enemyStart < 0 || abilitiesStart < 0) throw new Error("This enemy is not part of the live source data.");

              let statBlock = source.slice(enemyStart, abilitiesStart);
              suppliedFields.forEach((field) => {
                const fieldPattern = new RegExp(`\\b${field}:\\s*-?\\d+(?:\\.\\d+)?`);
                if (fieldPattern.test(statBlock)) {
                  statBlock = statBlock.replace(fieldPattern, `${field}: ${stats[field]}`);
                } else if (field === "startingEnergy") {
                  statBlock += `startingEnergy: ${stats[field]}, `;
                } else {
                  throw new Error(`Could not locate ${field} in the live enemy definition.`);
                }
              });

              const maxEnergy = Number(statBlock.match(/\bmaxEnergy:\s*(-?\d+(?:\.\d+)?)/)?.[1]);
              const startingEnergy = Number(statBlock.match(/\bstartingEnergy:\s*(-?\d+(?:\.\d+)?)/)?.[1] ?? maxEnergy);
              if (startingEnergy > maxEnergy) throw new Error("startingEnergy cannot exceed maxEnergy.");

              await writeFile(enemySourcePath, source.slice(0, enemyStart) + statBlock + source.slice(abilitiesStart), "utf8");
            });
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Enemy stats could not be written." }));
          }
        });
      });

      server.middlewares.use("/__arkenfall/enemy-drop-table", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        request.setEncoding("utf8");
        let body = "";
        request.on("data", (chunk: string) => {
          body += chunk;
          if (body.length > 128_000) request.destroy();
        });
        request.on("end", async () => {
          try {
            const payload = JSON.parse(body) as { id?: unknown; dropTable?: unknown };
            if (typeof payload.id !== "string" || !/^[a-z0-9_-]+$/i.test(payload.id)) throw new Error("Invalid enemy drop-table payload.");
            const enemyId = payload.id;

            await enqueueSourceMutation(async () => {
              const [enemySource, gearSource] = await Promise.all([
                readFile(enemySourcePath, "utf8"),
                readFile(gearSourcePath, "utf8"),
              ]);
              const enemySourceFile = ts.createSourceFile(enemySourcePath, enemySource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const gearSourceFile = ts.createSourceFile(gearSourcePath, gearSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const enemies = catalogObjectsFromRecord(variableInitializer(enemySourceFile, "ENEMIES"));
              const enemy = objectById(enemies, enemyId);
              if (!enemy) throw new Error("This enemy is not part of the live source data.");
              const itemIds = catalogIdsFromArray(variableInitializer(gearSourceFile, "ITEMS"));
              const dropTable = validateDropTable(payload.dropTable, itemIds, "Enemy drop table", true);
              const edits = collectObjectEdits(enemySource, enemySourceFile, enemy, { dropTable: JSON.stringify(dropTable, null, 2) });
              await writeFile(enemySourcePath, applySourceEdits(enemySource, edits), "utf8");
            });
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Enemy drop table could not be written." }));
          }
        });
      });

      server.middlewares.use("/__arkenfall/talent-content", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        request.setEncoding("utf8");
        let body = "";
        request.on("data", (chunk: string) => {
          body += chunk;
          if (body.length > 32_768) request.destroy();
        });
        request.on("end", async () => {
          try {
            const payload = JSON.parse(body) as { talentId?: unknown; abilityId?: unknown; changes?: Record<string, unknown> };
            if (typeof payload.talentId !== "string" || !/^[a-z0-9_-]+$/i.test(payload.talentId) || !payload.changes || typeof payload.changes !== "object") {
              throw new Error("Invalid talent content payload.");
            }
            const allowedFields = new Set(["talentDescription", "abilityDescription", "energyCost", "cooldownTurns", "flatDamage", "physicalPowerPercent", "spellPowerPercent"]);
            const suppliedFields = Object.keys(payload.changes);
            if (suppliedFields.length === 0 || suppliedFields.some((field) => !allowedFields.has(field))) {
              throw new Error("No editable talent content was supplied.");
            }
            const needsAbility = suppliedFields.some((field) => field !== "talentDescription");
            if (needsAbility && (typeof payload.abilityId !== "string" || !/^[a-z0-9_-]+$/i.test(payload.abilityId))) {
              throw new Error("A valid existing ability is required.");
            }
            ["talentDescription", "abilityDescription"].forEach((field) => {
              if (!Object.prototype.hasOwnProperty.call(payload.changes, field)) return;
              const value = payload.changes?.[field];
              if (typeof value !== "string" || value.trim().length === 0 || value.length > 4_000) throw new Error(`${field} must contain 1–4000 characters.`);
            });
            ["physicalPowerPercent", "spellPowerPercent"].forEach((field) => {
              if (!Object.prototype.hasOwnProperty.call(payload.changes, field)) return;
              const value = payload.changes?.[field];
              if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 10_000) throw new Error(`${field} must be between 0 and 10000.`);
            });
            ["energyCost", "cooldownTurns"].forEach((field) => {
              if (!Object.prototype.hasOwnProperty.call(payload.changes, field)) return;
              const value = payload.changes?.[field];
              if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1_000) throw new Error(`${field} must be a whole number between 0 and 1000.`);
            });
            if (Object.prototype.hasOwnProperty.call(payload.changes, "flatDamage")) {
              const value = payload.changes?.flatDamage;
              if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1_000_000) throw new Error("flatDamage must be a whole number between 0 and 1000000.");
            }

            await enqueueSourceMutation(async () => {
              const [talentSource, abilitySource] = await Promise.all([
                readFile(talentSourcePath, "utf8"),
                readFile(abilitySourcePath, "utf8"),
              ]);
              const talentSourceFile = ts.createSourceFile(talentSourcePath, talentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const abilitySourceFile = ts.createSourceFile(abilitySourcePath, abilitySource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const talents = variableInitializer(talentSourceFile, "TALENT_NODES");
              const abilities = variableInitializer(abilitySourceFile, "ABILITY_DEFINITIONS");
              if (!talents || !ts.isArrayLiteralExpression(talents) || !abilities || !ts.isObjectLiteralExpression(abilities)) {
                throw new Error("The live talent or ability catalog could not be located.");
              }
              const talentObjects = talents.elements.filter(ts.isObjectLiteralExpression);
              const abilityObjects = abilities.properties
                .filter(ts.isPropertyAssignment)
                .map((property) => property.initializer)
                .filter(ts.isObjectLiteralExpression);
              const talent = objectById(talentObjects, payload.talentId as string);
              if (!talent) throw new Error("This talent is not part of the live source data.");

              const talentEdits: SourceEdit[] = [];
              const abilityEdits: SourceEdit[] = [];
              if (typeof payload.changes?.talentDescription === "string") {
                talentEdits.push(...collectObjectEdits(talentSource, talentSourceFile, talent, { description: JSON.stringify(payload.changes.talentDescription) }));
              }
              if (needsAbility) {
                const abilityId = payload.abilityId as string;
                if (objectStringProperty(talent, "abilityId") !== abilityId) throw new Error("This ability is not owned by the selected live talent.");
                const ability = objectById(abilityObjects, abilityId);
                if (!ability) throw new Error("This ability is not part of the live source data.");
                const abilityReplacements: Record<string, string> = {};
                if (typeof payload.changes?.abilityDescription === "string") abilityReplacements.description = JSON.stringify(payload.changes.abilityDescription);
                if (typeof payload.changes?.energyCost === "number") abilityReplacements.energyCost = String(payload.changes.energyCost);
                if (typeof payload.changes?.cooldownTurns === "number") abilityReplacements.cooldownTurns = String(payload.changes.cooldownTurns);
                if (typeof payload.changes?.flatDamage === "number") abilityReplacements.flatDamage = String(payload.changes.flatDamage);
                if (typeof payload.changes?.physicalPowerPercent === "number") abilityReplacements.physicalPowerScaling = sourceScaling(payload.changes.physicalPowerPercent);
                if (typeof payload.changes?.spellPowerPercent === "number") abilityReplacements.spellPowerScaling = sourceScaling(payload.changes.spellPowerPercent);
                abilityEdits.push(...collectObjectEdits(abilitySource, abilitySourceFile, ability, abilityReplacements));
              }
              if (talentEdits.length === 0 && abilityEdits.length === 0) throw new Error("No live source fields could be updated.");
              await Promise.all([
                talentEdits.length > 0 ? writeFile(talentSourcePath, applySourceEdits(talentSource, talentEdits), "utf8") : Promise.resolve(),
                abilityEdits.length > 0 ? writeFile(abilitySourcePath, applySourceEdits(abilitySource, abilityEdits), "utf8") : Promise.resolve(),
              ]);
            });

            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Talent content could not be written." }));
          }
        });
      });

      server.middlewares.use("/__arkenfall/content-catalog", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        request.setEncoding("utf8");
        let body = "";
        request.on("data", (chunk: string) => {
          body += chunk;
          if (body.length > 2_000_000) request.destroy();
        });
        request.on("end", async () => {
          try {
            const payload = JSON.parse(body) as { kind?: unknown; exchange?: unknown };
            if (payload.kind !== "enemies" && payload.kind !== "events" && payload.kind !== "adventures" && payload.kind !== "items" && payload.kind !== "quests") throw new Error("Unknown live content catalog.");

            await enqueueSourceMutation(async () => {
              const [adventureSource, enemySource, gearSource, statusSource, questSource] = await Promise.all([
                readFile(adventureSourcePath, "utf8"),
                readFile(enemySourcePath, "utf8"),
                readFile(gearSourcePath, "utf8"),
                readFile(statusEffectsSourcePath, "utf8"),
                readFile(questSourcePath, "utf8"),
              ]);
              const adventureSourceFile = ts.createSourceFile(adventureSourcePath, adventureSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const enemySourceFile = ts.createSourceFile(enemySourcePath, enemySource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const gearSourceFile = ts.createSourceFile(gearSourcePath, gearSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const statusSourceFile = ts.createSourceFile(statusEffectsSourcePath, statusSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const questSourceFile = ts.createSourceFile(questSourcePath, questSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const enemyIds = new Set(catalogObjectsFromRecord(variableInitializer(enemySourceFile, "ENEMIES")).flatMap((object) => {
                const id = objectStringProperty(object, "id");
                return id ? [id] : [];
              }));
              const itemIds = catalogIdsFromArray(variableInitializer(gearSourceFile, "ITEMS"));
              const adventureIds = catalogIdsFromArray(variableInitializer(adventureSourceFile, "ADVENTURES"));
              const eventObjects = catalogObjectsFromRecord(variableInitializer(adventureSourceFile, "ADVENTURE_EVENTS"));
              const currentEventIds = new Set(eventObjects.flatMap((object) => {
                const id = objectStringProperty(object, "id");
                return id ? [id] : [];
              }));
              const statusKinds = new Map(catalogObjectsFromRecord(variableInitializer(statusSourceFile, "STATUS_EFFECTS")).flatMap((object) => {
                const id = objectStringProperty(object, "id");
                const kind = objectStringProperty(object, "kind");
                return id && kind ? [[id, kind] as const] : [];
              }));

              if (payload.kind === "enemies") {
                const enemyCatalog = validateEnemyExchange(payload.exchange, itemIds, new Set(statusKinds.keys()));
                const enemiesInitializer = variableInitializer(enemySourceFile, "ENEMIES");
                if (!enemiesInitializer) throw new Error("The live enemy catalog could not be located.");
                await writeFile(enemySourcePath, applySourceEdits(enemySource, [{
                  start: enemiesInitializer.getStart(enemySourceFile),
                  end: enemiesInitializer.getEnd(),
                  text: JSON.stringify(enemyCatalog, null, 2),
                }]), "utf8");
                return;
              }

              if (payload.kind === "items") {
                const itemCatalog = validateItemExchange(payload.exchange, new Set(statusKinds.keys()), adventureIds);
                const itemsInitializer = variableInitializer(gearSourceFile, "ITEMS");
                const setsInitializer = variableInitializer(gearSourceFile, "GEAR_SETS");
                if (!itemsInitializer || !setsInitializer) throw new Error("The live item catalog could not be located.");
                const updatedGearSource = applySourceEdits(gearSource, [
                  { start: itemsInitializer.getStart(gearSourceFile), end: itemsInitializer.getEnd(), text: JSON.stringify(itemCatalog.items, null, 2) },
                  { start: setsInitializer.getStart(gearSourceFile), end: setsInitializer.getEnd(), text: JSON.stringify(itemCatalog.sets, null, 2) },
                ]);
                await writeFile(gearSourcePath, updatedGearSource, "utf8");
                return;
              }

              if (payload.kind === "quests") {
                const questCatalog = validateQuestExchange(payload.exchange, enemyIds, itemIds, adventureIds);
                const questsInitializer = variableInitializer(questSourceFile, "QUESTS");
                const questlinesInitializer = variableInitializer(questSourceFile, "QUESTLINES");
                if (!questsInitializer || !questlinesInitializer) throw new Error("The live quest catalog could not be located.");
                const updatedQuestSource = applySourceEdits(questSource, [
                  { start: questsInitializer.getStart(questSourceFile), end: questsInitializer.getEnd(), text: JSON.stringify(questCatalog.quests, null, 2) },
                  { start: questlinesInitializer.getStart(questSourceFile), end: questlinesInitializer.getEnd(), text: JSON.stringify(questCatalog.questlines, null, 2) },
                ]);
                await writeFile(questSourcePath, updatedQuestSource, "utf8");
                return;
              }

              const variableName = payload.kind === "events" ? "ADVENTURE_EVENTS" : "ADVENTURES";
              const initializer = variableInitializer(adventureSourceFile, variableName);
              if (!initializer) throw new Error(`The live ${payload.kind} catalog could not be located.`);
              const liveValue = payload.kind === "events"
                ? validateEventExchange(payload.exchange, itemIds, enemyIds, statusKinds)
                : validateAdventureExchange(payload.exchange, enemyIds, currentEventIds, itemIds);
              const replacement = JSON.stringify(liveValue, null, 2);
              await writeFile(adventureSourcePath, applySourceEdits(adventureSource, [{ start: initializer.getStart(adventureSourceFile), end: initializer.getEnd(), text: replacement }]), "utf8");
            });

            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Live content could not be written." }));
          }
        });
      });
    },
  };
}
