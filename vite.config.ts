// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { readFile, writeFile } from "node:fs/promises";
// @ts-expect-error Node runtime types are supplied by Vite when this config executes.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const enemySourcePath = fileURLToPath(new URL("./src/game/data.ts", import.meta.url));
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

function enemySourceSync() {
  return {
    name: "arkenfall-enemy-source-sync",
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

            const source = await readFile(enemySourcePath, "utf8");
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

            await writeFile(enemySourcePath, source.slice(0, enemyStart) + statBlock + source.slice(abilitiesStart), "utf8");
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
    },
  };
}

export default defineConfig({
  plugins: [react(), enemySourceSync()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".app.github.dev"],
  },
});
