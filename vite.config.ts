// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { readFile, writeFile } from "node:fs/promises";
// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ts from "typescript";

const gameDataSourcePath = fileURLToPath(new URL("./src/game/data.ts", import.meta.url));
const statusEffectsSourcePath = fileURLToPath(new URL("./src/game/statusEffects.ts", import.meta.url));
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

const positiveEventEffects = new Set(["heal", "playerNextCombatBuff", "gainGold", "gainItem", "gainExperience", "gainTalentPoints", "gainAttributePoints", "enemiesNextCombatDebuff"]);
const negativeEventEffects = new Set(["loseHealth", "loseGold", "playerNextCombatDebuff", "loseExperience", "enemiesNextCombatBuff", "immediateEncounter"]);
const amountEventEffects = new Set(["heal", "loseHealth", "gainGold", "loseGold", "gainExperience", "loseExperience", "gainTalentPoints", "gainAttributePoints"]);
const playerBuffEffects = new Set(["playerNextCombatBuff", "enemiesNextCombatBuff"]);
const playerDebuffEffects = new Set(["playerNextCombatDebuff", "enemiesNextCombatDebuff"]);

function validateEventOutcome(
  value: unknown,
  polarity: "positive" | "negative",
  itemIds: Set<string>,
  enemyIds: Set<string>,
  statusKinds: Map<string, string>,
) {
  const outcome = catalogObject(value, `${polarity} outcome`);
  catalogString(outcome.text, `${polarity} outcome text`, true);
  if (!Array.isArray(outcome.effects)) throw new Error(`${polarity} outcome effects must be a list.`);
  const allowed = polarity === "positive" ? positiveEventEffects : negativeEventEffects;
  let encounters = 0;
  outcome.effects.forEach((rawEffect: unknown, index: number) => {
    const effect = catalogObject(rawEffect, `${polarity} effect ${index + 1}`);
    const type = catalogString(effect.type, `${polarity} effect type`);
    if (!allowed.has(type)) throw new Error(`${type} is not a valid ${polarity} outcome effect.`);
    if (amountEventEffects.has(type)) catalogNumber(effect.amount, `${type} amount`);
    if (type === "gainItem" && !itemIds.has(catalogId(effect.itemId, "Item ID"))) throw new Error("The selected item is not part of the live item catalog.");
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
      if (!["strength", "agility", "intelligence", "vitality", "luck"].includes(choice.stat)) throw new Error("Choice attribute is invalid.");
      catalogNumber(choice.threshold, "Choice threshold", 1);
      validateEventOutcome(choice.success, "positive", itemIds, enemyIds, statusKinds);
      validateEventOutcome(choice.failure, "negative", itemIds, enemyIds, statusKinds);
    });
    record[id] = event;
  });
  return record;
}

function validateAdventureExchange(exchangeValue: unknown, enemyIds: Set<string>, eventIds: Set<string>): unknown[] {
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
    if (adventure.theme !== "windsong_forest") throw new Error("Adventure theme is invalid.");
    catalogString(adventure.completionTitle, "Completion title");
    catalogString(adventure.completionDescription, "Completion description", true);
    if (adventure.prerequisiteAdventureId !== undefined && !knownAdventureIds.has(catalogId(adventure.prerequisiteAdventureId, "Prerequisite adventure ID"))) throw new Error("Prerequisite adventure does not exist.");
    if (!Array.isArray(adventure.stages) || adventure.stages.length === 0) throw new Error(`${adventure.name} must have at least one stage.`);
    const stageIds = adventure.stages.map((rawStage: unknown) => catalogId(catalogObject(rawStage, "Stage").id, "Stage ID"));
    assertUniqueIds(stageIds, `${adventure.name} stage`);
    adventure.stages.forEach((rawStage: unknown) => {
      const stage = catalogObject(rawStage, "Stage");
      catalogString(stage.name, "Stage name");
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

function localSourceSync() {
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
              return [field, value];
            }));

            await enqueueSourceMutation(async () => {
              const source = await readFile(gameDataSourcePath, "utf8");
              const enemiesStart = source.indexOf("export const ENEMIES");
              const enemyMarker = `id: "${payload.id}"`;
              const enemyStart = source.indexOf(enemyMarker, enemiesStart);
              const abilitiesStart = source.indexOf("abilities:", enemyStart);
              if (enemiesStart < 0 || enemyStart < 0 || abilitiesStart < 0) throw new Error("This enemy is not part of the live source data.");

              let statBlock = source.slice(enemyStart, abilitiesStart);
              suppliedFields.forEach((field) => {
                const fieldPattern = new RegExp(`\\b${field}:\\s*-?\\d+(?:\\.\\d+)?`);
                if (!fieldPattern.test(statBlock)) throw new Error(`Could not locate ${field} in the live enemy definition.`);
                statBlock = statBlock.replace(fieldPattern, `${field}: ${stats[field]}`);
              });

              await writeFile(gameDataSourcePath, source.slice(0, enemyStart) + statBlock + source.slice(abilitiesStart), "utf8");
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
            const allowedFields = new Set(["talentDescription", "abilityDescription", "physicalPowerPercent", "spellPowerPercent"]);
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

            await enqueueSourceMutation(async () => {
              const source = await readFile(gameDataSourcePath, "utf8");
              const sourceFile = ts.createSourceFile(gameDataSourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const talents = variableInitializer(sourceFile, "TALENT_NODES");
              const abilities = variableInitializer(sourceFile, "ABILITY_DEFINITIONS");
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

              const edits: SourceEdit[] = [];
              if (typeof payload.changes?.talentDescription === "string") {
                edits.push(...collectObjectEdits(source, sourceFile, talent, { description: JSON.stringify(payload.changes.talentDescription) }));
              }
              if (needsAbility) {
                const abilityId = payload.abilityId as string;
                if (objectStringProperty(talent, "abilityId") !== abilityId) throw new Error("This ability is not owned by the selected live talent.");
                const ability = objectById(abilityObjects, abilityId);
                if (!ability) throw new Error("This ability is not part of the live source data.");
                const abilityReplacements: Record<string, string> = {};
                if (typeof payload.changes?.abilityDescription === "string") abilityReplacements.description = JSON.stringify(payload.changes.abilityDescription);
                if (typeof payload.changes?.physicalPowerPercent === "number") abilityReplacements.physicalPowerScaling = sourceScaling(payload.changes.physicalPowerPercent);
                if (typeof payload.changes?.spellPowerPercent === "number") abilityReplacements.spellPowerScaling = sourceScaling(payload.changes.spellPowerPercent);
                edits.push(...collectObjectEdits(source, sourceFile, ability, abilityReplacements));
              }
              if (edits.length === 0) throw new Error("No live source fields could be updated.");
              await writeFile(gameDataSourcePath, applySourceEdits(source, edits), "utf8");
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
            if (payload.kind !== "events" && payload.kind !== "adventures") throw new Error("Unknown live content catalog.");

            await enqueueSourceMutation(async () => {
              const [source, statusSource] = await Promise.all([
                readFile(gameDataSourcePath, "utf8"),
                readFile(statusEffectsSourcePath, "utf8"),
              ]);
              const sourceFile = ts.createSourceFile(gameDataSourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const statusSourceFile = ts.createSourceFile(statusEffectsSourcePath, statusSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
              const enemyIds = new Set(catalogObjectsFromRecord(variableInitializer(sourceFile, "ENEMIES")).flatMap((object) => {
                const id = objectStringProperty(object, "id");
                return id ? [id] : [];
              }));
              const itemIds = catalogIdsFromArray(variableInitializer(sourceFile, "ITEMS"));
              const eventObjects = catalogObjectsFromRecord(variableInitializer(sourceFile, "ADVENTURE_EVENTS"));
              const currentEventIds = new Set(eventObjects.flatMap((object) => {
                const id = objectStringProperty(object, "id");
                return id ? [id] : [];
              }));
              const statusKinds = new Map(catalogObjectsFromRecord(variableInitializer(statusSourceFile, "STATUS_EFFECTS")).flatMap((object) => {
                const id = objectStringProperty(object, "id");
                const kind = objectStringProperty(object, "kind");
                return id && kind ? [[id, kind] as const] : [];
              }));

              const variableName = payload.kind === "events" ? "ADVENTURE_EVENTS" : "ADVENTURES";
              const initializer = variableInitializer(sourceFile, variableName);
              if (!initializer) throw new Error(`The live ${payload.kind} catalog could not be located.`);
              const liveValue = payload.kind === "events"
                ? validateEventExchange(payload.exchange, itemIds, enemyIds, statusKinds)
                : validateAdventureExchange(payload.exchange, enemyIds, currentEventIds);
              const replacement = JSON.stringify(liveValue, null, 2);
              await writeFile(gameDataSourcePath, applySourceEdits(source, [{ start: initializer.getStart(sourceFile), end: initializer.getEnd(), text: replacement }]), "utf8");
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

export default defineConfig({
  plugins: [react(), localSourceSync()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".app.github.dev"],
  },
});
