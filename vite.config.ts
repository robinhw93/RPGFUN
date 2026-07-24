// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { readFile, writeFile } from "node:fs/promises";
// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ts from "typescript";

const gameDataSourcePath = fileURLToPath(new URL("./src/game/data.ts", import.meta.url));
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
