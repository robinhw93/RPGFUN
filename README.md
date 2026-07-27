# Arkenfall

Arkenfall is a mobile-first, build-focused, text RPG made with React, TypeScript, and Vite. The current vertical slice follows one permadeath character through **Windsong Forest** in the world of Arkenfall, with turn-based combat, a classless talent tree, equipment, leveling, and browser-local saving.

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

- Character creation with ten selectable appearances, a guided Class/Talent introduction, and permadeath.
- Five base attributes and ten displayed derived combat stats.
- Windsong Forest: a nine-stage story route mixing fixed combats, weighted combat/event stages, a Wandering Merchant, and a final Forest Spirit encounter; completed story adventures remain visible and can be replayed for 10% of their original XP and 50% of their original combat Gold rewards.
- Arkenfall Town: a responsive illustrated hub above the adventure list with dedicated Blacksmith, Alchemist, Tailor, Leatherworker, Jeweler, and tavern destinations; five data-driven shops/crafting stations; paid recovery; and next-combat meals.
- Initiative-based combat against up to three enemies in current content; the state model supports larger groups.
- Energy, cooldowns, multi-action player turns, buffs, debuffs, damage-over-time effects, enemy intent, floating combat text, and an inspectable combat log.
- A 263-node classless talent tree with bidirectional ANY connections, pan, zoom, and a six-slot ability loadout.
- Eight equipment slots, weapon-hand rules, five item rarities from Common through Legendary, 30 current item definitions, two three-piece gear sets, item comparison, inventory filtering/sorting, combat consumables, ordinary carried items, item prices, independent enemy/stage item drops, grouped reward presentation, and event-driven single-stock Wandering Merchants with buying, gear inspection, and inventory selling.
- Experience and level-ups through the level-50 cap, plus stat points, talent points, and gold rewards.
- Automatic local browser saves plus save migration for older talent and gear data.
- Password-gated Talent, Enemy, Event, Adventure, Item, and Portrait editors with browser-local drafts and Codex-ready JSON exports, plus saved-character test actions for granting one normal level or selected live items. Item Editor includes Arkenfall vendor assignment and typed material recipes. While Vite is running locally, Event Manager, Adventure Editor, and Item Editor Save replace their complete canonical live catalogs; existing ability tooltips, Energy cost, cooldown, Flat Damage, and Power totals plus supported enemy fields use narrower source-sync writes.

## Hosting

`netlify.toml` configures the production build and SPA fallback for Netlify. Static assets live under `public/assets/`.
