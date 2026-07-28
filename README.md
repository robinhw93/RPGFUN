# Arkenfall

Arkenfall is a mobile-first, build-focused, text RPG made with React, TypeScript, and Vite. The current campaign follows one permadeath character through twelve increasingly dangerous story adventures, from **Windsong Forest** to **The World Below**, with turn-based combat, a classless talent tree, equipment, leveling, and browser-local saving.

The game UI and all player-facing text are in English. Project documentation is also kept in English so names and rules match the game exactly.

## Documentation

- [Game systems](docs/GAME_SYSTEMS.md) — character creation, attributes, derived stats, combat, statuses, adventures, rewards, gear, talents, and saving.
- [Content reference](docs/CONTENT_REFERENCE.md) — the currently implemented abilities, talents, enemies, encounters, items, set bonuses, and status effects.
- [Development guide](docs/DEVELOPMENT.md) — local setup, Codespaces, deployment, content editing, the Talent Editor, verification, and project conventions.
- [Architecture](ARCHITECTURE.md) — module ownership, state flow, data-driven combat features, timing contracts, save compatibility, and UI rules.
- [AI collaborator guide](AGENTS.md) — repository-wide working agreements, implementation patterns, verification expectations, and handoff context for future coding sessions.

The TypeScript implementation remains the source of truth. When a rule changes, update the relevant documentation in the same change.

## Requirements

- Node.js 18 or newer
- Node.js 20 recommended and selected by `.nvmrc`
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local address in the terminal. On a phone connected to the same network, start Vite with a network host if needed:

```bash
npm run dev -- --host 0.0.0.0
```

## Production build

```bash
npm test
npm run docs:check
npm run build
```

The checks run focused gameplay regressions, verify documentation against the live talent catalog, type-check the project, and create the production bundle in `dist/`.

## Current playable scope

- Character creation with ten selectable appearances, a guided Class/Talent/Attribute introduction, and permadeath.
- Five base attributes and ten displayed derived combat stats.
- The twelve-adventure story route progresses through Windsong Forest, Arkenfall Highlands, Highfall Mountains, Mirefen Marsh, Ashen Foundry, Sunken Reliquary, Nightglass Citadel, Frostbound Expanse, Stormspire Aerie, The Hollow Crown, The Astral Scar, and The World Below. Adventures 4–12 grow from 12 to 22 stages, each introduce seven biome enemies, three skill-check events, a tactical final boss, dedicated card/combat artwork, and a deliberately slower enemy-XP curve. Completed story adventures remain visible and can be replayed for 10% of their original XP and 50% of their original combat Gold rewards.
- Arkenfall Town: the responsive illustrated main hub, with Adventures, Shops, Tavern and Inn, Quest Board, and Grand Arena as its five destinations. The Grand Arena grants one safe ten-turn damage trial against its 100,000-Health champion when each story adventure is completed for the first time; replays do not grant another attempt. Experience equals 20% of damage dealt, rounded down, and the character's ten best results remain on a personal leaderboard. Shops opens the dedicated Blacksmith, Alchemist, Tailor, Leatherworker, and Jeweler locations; completing each story adventure immediately adds two level-appropriate items to every shop while retaining all earlier stock. The five data-driven shops/crafting stations support Inventory selling, while the tavern provides paid recovery, next-combat meals, and Luck-based Gold gambling. The Quest Board rotates through at most six focused postings from 39 persistent quests spanning every story adventure.
- Initiative-based combat against up to three enemies in current content; the state model supports larger groups. Combat can be fled at the cost of 50–90% of current Gold and a 50% risk of losing one equipped item, returning the character to town and resetting the active adventure.
- Energy, cooldowns, multi-action player turns, buffs, debuffs, damage-over-time effects, enemy intent, floating combat text, and an inspectable combat log. Enemies in recommended-level-6-and-higher story encounters can Chain the player with their attacks, temporarily preventing escape. All 75 distinct enemies introduced from recommended level 4 onward use editable tactical priorities; late regular enemies have named three-ability role kits and late bosses use five-part phase sequences.
- A 263-node classless talent tree with bidirectional ANY connections, pan, zoom, and a six-slot ability loadout.
- Eight equipment slots, weapon-hand rules, automatic empty-slot equipping for newly acquired gear, five item rarities from Common through Legendary, 354 current item definitions, 39 gear sets including twenty-one late-game five-piece sets and nine artisan two-piece sets, 24 class-agnostic specialization rings, item comparison, inventory filtering/sorting, combat consumables and status remedies, ordinary carried items, item prices, independent enemy/stage item drops, grouped reward presentation, and event-driven single-stock Wandering Merchants with buying, gear inspection, inventory selling. Epic loot begins in Adventure 8 and Legendary gear begins dropping in Adventure 11.
- Experience and level-ups through the level-50 cap, plus stat points, talent points, and gold rewards.
- Automatic local browser saves plus save migration for older talent and gear data.
- Password-gated Talent, Enemy, Event, Adventure, Item, Quest, and Portrait editors with browser-local drafts and Codex-ready JSON exports, plus saved-character test actions for granting one normal level or selected live items. Enemy, Event, Adventure, Item, and Quest Save replace their complete canonical live catalogs while Vite is running locally. Enemy abilities/behavior/artwork, custom Adventure artwork, executable set passives, status-removal consumables, vendor assignment, and typed material recipes are all editable through those catalogs.

## Hosting

`netlify.toml` configures the production build and SPA fallback for Netlify. Static assets live under `public/assets/`.
