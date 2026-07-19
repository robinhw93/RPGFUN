# Emberfall Chronicles

A mobile-first, build-focused text RPG made with React, TypeScript, and Vite.

Requires Node.js 18 or newer. Node.js 20 is recommended and selected by `.nvmrc`.

## Run locally

```bash
npm install
npm run dev
```

## GitHub Codespaces

The included dev-container uses Node.js 20, includes Git LFS support, and installs the locked dependencies automatically. When a Codespace starts, it checks for the local Vite binary and runs `npm ci --include=dev` only when dependencies are missing.

After pulling a new dev-container configuration into an existing Codespace, run **Codespaces: Rebuild Container** once from the command palette. Future starts restore the development environment automatically.

## Production build

```bash
npm run build
```

The production files are written to `dist`. The included `netlify.toml` configures the build and SPA routing for Netlify.

## Current vertical slice

- Four-node adventure with two combats, one event, and a boss
- Turn-based Energy combat against up to two enemies in the current adventure
- Buffs, debuffs, enemy intents, critical strikes, armor, and combat log
- Classless Brute, Shadow, and Arcanist talent branches
- Six-slot active ability loadout
- Eight equipment slots, item rarity, gear stats, and a set bonus
- Responsive mobile and desktop layouts
- Automatic local browser save

Game content lives in `src/game/data.ts`, while combat calculations are kept in `src/game/engine.ts`.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for module boundaries, combat timing contracts, and UI rules.
