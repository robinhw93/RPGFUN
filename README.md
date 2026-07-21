# Emberfall Chronicles

Emberfall Chronicles is a mobile-first, build-focused, text RPG made with React, TypeScript, and Vite. The current vertical slice follows one permadeath character through **The Ashen Road**, with turn-based combat, a classless talent tree, equipment, loot, leveling, and browser-local saving.

The game UI and all player-facing text are in English. Project documentation is also kept in English so names and rules match the game exactly.

## Documentation

- [Game systems](docs/GAME_SYSTEMS.md) — character creation, attributes, derived stats, combat, statuses, adventures, rewards, gear, talents, and saving.
- [Content reference](docs/CONTENT_REFERENCE.md) — the currently implemented abilities, talents, enemies, encounters, items, set bonuses, and status effects.
- [Development guide](docs/DEVELOPMENT.md) — local setup, Codespaces, deployment, content editing, the Talent Editor, verification, and project conventions.
- [Architecture](ARCHITECTURE.md) — module ownership, state flow, data-driven combat features, timing contracts, save compatibility, and UI rules.

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
npm run build
```

The command runs the TypeScript project build and then creates the production bundle in `dist/`.

## Current playable scope

- Character creation with ten selectable appearances and permadeath.
- Five base attributes and ten displayed derived combat stats.
- A four-node adventure: two regular combats, one choice event, and one boss.
- Initiative-based combat against up to two enemies in current content; the state model supports larger groups.
- Energy, cooldowns, multi-action player turns, buffs, debuffs, damage-over-time effects, enemy intent, floating combat text, and an inspectable combat log.
- A 43-node classless talent tree with bidirectional ANY connections, pan, zoom, and a six-slot ability loadout.
- Eight equipment slots, weapon-hand rules, rarity, item comparison, inventory filtering/sorting, and the Ashborn Warplate set.
- Experience, level-ups, stat points, talent points, gold, and loot rewards.
- Automatic local browser saves plus save migration for older talent and gear data.
- A password-gated in-game Talent Editor for designing and exporting tree layouts.

## Hosting

`netlify.toml` configures the production build and SPA fallback for Netlify. Static assets live under `public/assets/`.
