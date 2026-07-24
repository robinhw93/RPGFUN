import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [talentSource, readme, agents, systems, content] = await Promise.all([
  readFile(new URL("src/game/content/talents.ts", root), "utf8"),
  readFile(new URL("README.md", root), "utf8"),
  readFile(new URL("AGENTS.md", root), "utf8"),
  readFile(new URL("docs/GAME_SYSTEMS.md", root), "utf8"),
  readFile(new URL("docs/CONTENT_REFERENCE.md", root), "utf8"),
]);

const sourceTalentCount = [...talentSource.matchAll(/branch: "(?:core|shadow|arcanist|brute|cultist)"/g)].length;
const documentedTalentRows = [...content.matchAll(/^\| (?:origin|brute_1|shadow_1|arcanist_1|cultist_1|talent_\d+) \|/gm)].length;
assert.equal(sourceTalentCount, 263, "Update the expected live talent count in scripts/verify-docs.mjs.");
assert.equal(documentedTalentRows, sourceTalentCount, "CONTENT_REFERENCE.md does not list every live talent.");
assert.match(readme, new RegExp(`A ${sourceTalentCount}-node classless talent tree`));
assert.match(agents, new RegExp(`current live tree has ${sourceTalentCount} nodes`));
assert.match(systems, new RegExp(`live tree currently has ${sourceTalentCount} nodes`));
assert.match(content, new RegExp(`live tree has ${sourceTalentCount} nodes`));
console.log(`Documentation matches the ${sourceTalentCount}-node live talent tree.`);
