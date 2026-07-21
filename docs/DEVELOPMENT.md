# Development guide

## Technology and project shape

- React 19 renders the application.
- TypeScript 5.9 provides strict type checking.
- Vite 6 runs the development server and creates production assets.
- Lucide React supplies UI glyphs.
- There is no backend, account system, database, or server-authoritative game state.
- Game state and Talent Editor drafts are stored in browser `localStorage`.
- Netlify serves the static production build with an SPA fallback.

The UI language is English. All player-facing copy must be written for players rather than exposing implementation language or formulas that only make sense to developers.

## Local setup

Node.js 20 is recommended. The repository includes `.nvmrc` with `20`; Node.js 18 is the package minimum.

```bash
npm install
npm run dev
```

Vite is configured to listen on `0.0.0.0:5173` with a strict port. If port 5173 is occupied, stop that process rather than expecting Vite to select a different port automatically.

### `vite: not found`

`vite` is a local development dependency. The error means `node_modules` is absent or incomplete, which commonly happens after creating or restarting an environment whose dependency directory was not persisted.

Repair it with:

```bash
npm ci --include=dev
npm run dev
```

Use `npm install` instead of `npm ci` only when intentionally changing dependencies or the lockfile.

### Node `styleText` error

If a Vite/Rolldown startup error says that `node:util` does not export `styleText`, the active Node version is too old for the installed build tools. Switch to Node 20, reinstall locked dependencies, and retry:

```bash
nvm use 20
npm ci --include=dev
npm run dev
```

## GitHub Codespaces

`.devcontainer/devcontainer.json` uses the Node 20 Bookworm development-container image and installs Git LFS. It runs:

- `npm ci --include=dev` when the container is created.
- `test -x node_modules/.bin/vite || npm ci --include=dev` whenever it starts.
- Automatic forwarding for port 5173.

After pulling a changed dev-container definition into an existing Codespace, run **Codespaces: Rebuild Container** once. A newly created Codespace applies the current definition automatically.

If a stale Codespace returns a 404 after Vite starts, verify that the forwarded port is 5173 and its visibility is appropriate, then reopen the forwarded URL. Recreating the Codespace can appear to fix the issue because it rebuilds the container, reinstalls dependencies, recreates port forwarding, and discards stale process/port state at once.

Git LFS warnings after `git pull` mean Git LFS is not installed in that environment. The dev container includes it. Outside the container, install Git LFS or remove the LFS hook only if the repository no longer uses LFS-managed files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development mode on port 5173. |
| `npm run build` | Run `tsc -b`, then create the production bundle in `dist/`. |
| `npm run preview` | Serve the existing production bundle for local review. |

There is currently no automated unit-test command. `npm run build` is the required baseline check, followed by focused browser testing for affected game systems.

## Mobile testing

The combat screen is designed to fit a phone viewport without vertical page scrolling.

Recommended checks:

1. Use a real phone against the forwarded Codespaces URL or the local network URL.
2. Test both portrait and landscape where practical.
3. In desktop browser devtools, test several narrow viewport widths, but do not treat emulation as a replacement for a real touch device.
4. Verify long-press ability/status inspection separately from tap-to-use.
5. Confirm the browser's safe top area does not cover progress or initiative.
6. Confirm combat, item, status, and talent modals prevent background scrolling.
7. Confirm no combat action requires page scrolling and that all six abilities plus End Turn remain usable.

## Production and Netlify

`netlify.toml` runs `npm run build`, publishes `dist/`, and redirects every route to `index.html` with status 200 so client-side navigation survives direct loads.

Before deployment:

```bash
npm ci
npm run build
```

Do not commit `dist/` unless the hosting workflow is deliberately changed to require built assets in Git.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Top-level stateful UI, navigation, adventure screens, character/inventory UI, runtime talent tree, modals, and player actions. |
| `src/styles.css` | Responsive layout, game-owned tooltips, modals, combat animations, paper-doll layout, talent maps, and mobile rules. |
| `src/game/types.ts` | Shared domain types and data contracts. |
| `src/game/data.ts` | Canonical abilities, talent nodes/canvas, enemies, items, gear-set bonuses, and adventure nodes. |
| `src/game/character.ts` | New-character state and derived-stat calculation. |
| `src/game/engine.ts` | Combat transitions, initiative, abilities, targeting, status timing, enemy turns, and pending visible effects. |
| `src/game/combatMath.ts` | Hit-versus-Dodge bounds and rolls. |
| `src/game/statusEffects.ts` | Status library, stacking, duration, damage/healing, and status multipliers. |
| `src/game/combatFeatures.ts` | Resolves gear, set, and talent passives, triggers, damage modifiers, and ability modifiers. |
| `src/game/combatSequence.ts` | Small pure helpers for queued combat presentation. |
| `src/hooks/useCombatEventSequencer.ts` | Synchronizes floating text, attack wind-up, impact, and state resolution. |
| `src/hooks/useCombatActionQueue.ts` | Queues player abilities and End Turn, projects reserved Energy/cooldowns, and dispatches actions between combat sequences. |
| `src/game/timing.ts` | Combat and initiative presentation timings. |
| `src/game/gear.ts` | Equipping, unequipping, compatibility, hand rules, material/category normalization, and loot selection. |
| `src/game/progression.ts` | Experience thresholds and level rewards. |
| `src/game/rewards.ts` | Grants each combat reward once and captures score-screen data. |
| `src/game/save.ts` | Browser save/load/clear plus backward-compatible migration. |
| `src/game/talentRequirements.ts` | Bidirectional ANY talent-connection evaluation. |
| `src/game/initiativeLayout.ts` | Pure FLIP geometry for initiative-card transitions. |
| `src/game/avatars.ts` | Appearance catalog and saved-avatar normalization. |
| `src/components/TalentDevtool.tsx` | Password gate and standalone Talent Editor draft UI. |
| `src/components/FloatingCombatText.tsx` | Timed floating-message presentation. |
| `src/components/GameConfirmDialog.tsx` | Game-owned destructive-action confirmation. |
| `src/components/GearSlotIcon.tsx` | Resolves equipment-category image assets. |
| `public/assets/` | Avatars and stat, attribute, gear, and gold images. |

See [Architecture](../ARCHITECTURE.md) for ownership and sequencing rules.

## Editing content

### Abilities

Add or edit `Ability` entries in `src/game/data.ts`.

Important fields:

- `energyCost`, `cooldownTurns`, and `target` define usability.
- `damageType`, `power`, and `powerScaling` define a single damage component.
- `damageComponents` defines mixed damage and supersedes the single-component fields for damage calculation.
- `hits` and `randomTargetPerHit` define multi-hit behavior. Each queued direct hit carries the total hit count so presentation can restart the lunge and divide animation, impact, and floating-event timing proportionally. This keeps all hit animations consecutive within one normal attack-duration budget.
- `requiredTargetStatus` and `requiredSelfStatus` gate use.
- `dealsDamage: false` creates a status/control utility ability.
- `effect`, status options, detonation, consumption, healing, Energy restoration, and status spreading fields route through engine-supported behaviors.
- `statusApplications` supports one or more on-hit statuses, including critical-only applications and independent base proc chances augmented by the character's chance-effect bonus.
- `conditionalStatusReplacement` swaps an application when the target already has a configured status; Deep Freeze uses it to replace Slowed with Stunned.
- `randomSingleStatusApplication` applies one status to exactly one randomly chosen target of an area ability.
- `ignoresAbsorption`, `consumeTargetStatusRatio`, Energy restoration, and `grantsNextCritical` support the current advanced Shadow abilities. Ability modifiers can override status-consumption ratios, including Neurotoxin's partial Poison consumption.
- `spreadAllTargetDebuffs`, `damagePerTargetDebuff`, `damagePerTargetStatusStack`, conditional Critical Chance, immediate turns, and on-kill refund/reset fields support talent mechanics without hard-coding talent IDs. Arcane Blast uses the status-stack multiplier for Arcane Wound.
- `freeAgainstTargetStatus` makes a cast free only against the marked target and consumes that marker. Both the engine and queued-action projection must use the target-aware Energy helper.
- `consumeTargetStatusForDamage` scales a damage component and optional follow-up status from the consumed stack count. `spreadDetonatedStatusOnKillRatio` and `spreadOnKillVfx` support lethal detonation spread without checking an ability ID in the engine.
- `damageModifiers` applies conditional multipliers owned by the ability.
- `vfx` emits presentation metadata at the exact event where the ability resolves. Add the matching `CombatAbilityVfxKind` and UI renderer without putting animation timing into combat rules.

Adding an ability definition does not make it obtainable. A talent must reference its exact `abilityId`, or another loadout-granting system must be added.

### Talents

The runtime tree reads `TALENTS` and `TALENT_TREE_CANVAS` from `src/game/data.ts`.

Each talent defines:

- Stable `id` used by saves and connections.
- Player-facing name and description.
- Branch, kind, point cost, position, icon, and shape.
- `requires` stores one side of each bidirectional connection. Runtime also discovers talents that point back to the node, so never store the same edge in both directions.
- Every connection uses the same rule: any one unlocked adjacent node is enough.
- Optional `abilityId`.
- Ability talents receive editor-facing Energy cost and cooldown metadata from that live ability definition, keeping existing nodes synchronized without duplicating combat rules.
- Optional data-driven `combat` bundle.

Changing or removing IDs is a save-migration decision. Existing saves store unlocked talent IDs and equipped ability IDs.

The runtime loadout remains a compact `equippedAbilities` array. The slot picker replaces or swaps occupied indices and appends newly selected abilities to the first available empty position; it never creates sparse slots. Its available list is derived from Strike, Guard, and `abilityId` values on currently unlocked talents.

### Enemies, items, sets, and adventures

All live definitions are in `src/game/data.ts`:

- Enemy IDs referenced by an adventure must exist in `ENEMIES`.
- Adventure rewards are granted only to combat/boss nodes with a reward definition.
- Gear IDs should remain stable because save hydration looks up current definitions by ID.
- New set bonuses require both item `set` IDs and matching `GEAR_SET_BONUSES` entries.
- Two-Hand weapons must use `weaponEquipType: "twoHand"`; legacy `weaponType` exists only for older saves.

### Status effects

Add status IDs to `StatusEffectId` in `src/game/types.ts`, then add the definition to `STATUS_EFFECTS` in `src/game/statusEffects.ts`. Also update:

- Status icon mapping in `src/App.tsx`.
- Any outgoing/incoming multiplier or timing logic.
- Damage/healing formulas when the status ticks.
- Combat-engine application/removal behavior if it is not covered by the generic path.
- Player and developer status references in documentation.

The status definition alone provides metadata; special mechanics still require engine support.

## Data-driven combat features

Gear items, gear-set thresholds, and unlocked talents can all supply a `CombatFeatureBundle`.

### Passive bonuses

Use `combat.passive` for attributes, Armor, Magic Resistance, powers, resources, chances, initiative, Guard/healing modifiers, status damage, status leech, status companions, preserved detonations, starting statuses, status immunities, additional applied-status stacks, Energy-based incoming-damage reduction, and reusable death prevention. Derived stats aggregate every active source.

### Triggers

A `CombatTriggerDefinition` contains:

- An event: `combat_start`, `turn_start`, `before_ability`, `on_hit`, `on_crit`, `on_kill`, `damage_taken`, `enemy_missed`, `enemy_stunned`, or `turn_end`.
- Optional ability, damage type, critical, minimum-damage, target-status, or Health-threshold conditions.
- Optional chance, once-per-turn rule, or cooldown.
- One or more data-driven effects: flat/scaling damage, current-Health-percentage damage, status application, flat or Max-Health-based healing, Energy, or Guard.

Triggered passives do not add central presentation events. Their damage, healing, status, and `passive_text` pending effects attach to the existing action event, so they resolve at the triggering action without extending the sequence. Proc names are grouped per affected target and appended to `combat.passiveAnimations`; the combatant-local CSS animation runs independently of the sequencer. Separate combat-log entries preserve inspectable trigger and result details.

Player `You use ...` action events are presentation-hidden and use `COMBAT_TIMING.silentEventMs`. Keep the event as the synchronization anchor for Energy expenditure and `before_ability` triggers; the ability-use combat-log entry remains player-inspectable.

`endPlayerTurn` must preserve resolved player-status durations. When turn-end events exist, it queues status reconciliation on the final turn-end event; without a sequence, it returns the resolved status list directly. Do not restore `combat.playerStatuses` unconditionally, or finite buffs such as Stealth will appear permanent.

`FloatingCombatText` snapshots hidden event indexes when a sequence mounts. Pending damage effects are consumed as soon as their event resolves, so recalculating visibility from live pending effects would reveal the hidden damage sentence for the remainder of that event.

Luck's chance-effect bonus is added only when `chance` is explicitly present. Final proc chance is clamped to 0–100%.

Some trigger event names are part of the general contract but are not yet emitted from every theoretically possible engine location. Verify the desired event in `engine.ts` before depending on it for new content.

### Damage modifiers

Damage modifiers multiply matching damage and can filter by damage type, attacker status, or target status. They may also scale by the target's number of unique debuffs. Multiple matching modifiers multiply together. General status multipliers are applied separately by the status system.

### Ability modifiers

Ability modifiers can currently:

- Permit an ability without its normal required self status.
- Change scaling when that requirement is missing.
- Override status duration, magnitude, or start-expiration behavior.
- Apply a status after consuming another status.
- Retain a ratio of status stacks after detonation.
- Override the fraction of target-status stacks consumed by supported abilities.
- Add integer deltas to Energy cost or cooldown, clamped at zero.
- Replace the player-facing ability description while the modifier is active.

Use these for talents that alter an existing ability rather than branching the engine on a talent ID. A modifier that changes the ability's prose must define a matching `descriptionOverride`; Energy and cooldown modifiers are shown through the shared effective-value helpers instead.

Abilities can also declare reusable `selfStatusApplications` and `conditionalSelfEffects`. Conditional self effects currently check for a status on the struck target and can restore a percentage of Max Health or add temporary Energy regeneration for the player's next turn. Keep these rules on the ability definition instead of checking ability IDs in the engine.

## Talent Editor

Open the discreet wrench button in the top menu and enter the current development code:

```text
bajs321
```

The editor supports:

- Creating, deleting, selecting, and dragging nodes.
- Live Shadow, Arcanist, Brute, and Cultist node counters in the editor header.
- Player-facing descriptions, branches, class/passive/ability types, costs, icons, and circle/square shapes.
- Multiple direct passive bonuses.
- Ability-ID references, Energy cost, cooldown turns, and free-form effect/proc notes.
- Bidirectional connections where any one unlocked adjacent talent is enough.
- Searchable buff/debuff reference.
- Separate content and layout signatures. Canonical content updates preserve local placement, while an intentional canonical layout update migrates the canvas, positions, connections, icons, and shapes in an existing saved draft once.
- Toggleable snap-to-grid.
- Pan, zoom from 15% to 200%, and fit-to-view.
- Automatic canvas growth near every edge while preserving fixed world-grid spacing.
- Copy-to-clipboard and JSON download.

### What Save does

Every editor change already auto-saves the draft to browser `localStorage` under `emberfall.talent-devtool.v1`. The **Save** button performs the same write immediately and confirms it in the editor UI. It does not:

- Change `src/game/data.ts`.
- Update the live player talent tree.
- Push to GitHub.
- Synchronize to another browser or computer.

**Copy for Codex** copies the full export JSON. **Export JSON** downloads `emberfall-talents.json`. Those exports describe layout, connections, basic passive bonuses, ability IDs, Energy costs, cooldowns, and design notes; they still require review and integration into source code.

### Editor limitations

- Free-form effect notes are documentation for implementation, not executable mechanics.
- An ability ID must already exist or be implemented alongside the talent.
- Advanced triggers, damage modifiers, ability modifiers, and new status mechanics must currently be added in TypeScript after export.
- Editor storage belongs to one browser/site origin.

## Save compatibility

The live game key is `emberfall-save-v1`. When changing persistent types:

1. Make new fields optional while loading older saves.
2. Normalize them in `loadGame` or `ensureCombatState`.
3. Refund or translate removed content when practical.
4. Keep stable item, talent, ability, avatar, and enemy IDs.
5. Test a fresh character and at least one saved in-progress combat.

Current migration behavior:

- Filters removed talents and refunds known removed talent costs.
- Filters equipped abilities to core and currently unlocked talent abilities.
- Hydrates armor material and weapon metadata from current item definitions.
- Resolves legacy two-handed weapon values and moves an invalid Off Hand item into inventory.
- Restores missing avatar, stat-point, pending-reward, initiative, cooldown, status, per-round acted-actor, and combat-sequencing fields.
- Restores a missing adventure mode as `story`; new saves may use `endless` for the Shadow Proving Grounds.

## UI conventions

- Never use `alert`, `confirm`, or `prompt`.
- Never rely on HTML `title` for game tooltips.
- Use `data-game-tooltip` for custom hover/keyboard hints.
- Use game-owned modals for detailed touch/click inspection.
- Tap uses an ability; long-press shows its explanation without firing it.
- Combat ability cards show their content icon, Energy cost, and base cooldown; do not reintroduce keyboard-slot numbers into the card corner.
- Clicking a status opens its detail modal; hover behavior must not overlap the click modal.
- Modal backdrops may blur/dim the game but should not replace it with an opaque black screen unless the screen is intentionally a travel transition.
- Modal opening must lock document/background scrolling and restore it on close.
- Player-facing copy must use consistent names: **Hit Chance**, **Dodge Chance**, **Critical Strike Chance**, **Initiative**, **Physical Power**, and **Magical Power**.
- Preload and decode Character-screen avatars, gear icons, and stat icons before rendering that screen. Use the game-owned loading state instead of allowing individual icons to pop in.
- Keep combat usable without page scrolling on mobile.

## Verification checklist

Always run:

```bash
npm run build
```

Then test the changed system in a browser. For combat changes, verify at minimum:

- Initiative timing and ordering.
- Player Energy regeneration only at player-turn start.
- Enemy Energy regeneration only at that enemy's turn start.
- Multiple abilities in one turn and cooldown blocking.
- Hit, miss, critical, Guard, and one damage-over-time effect.
- Damage/status application at the matching floating message.
- Lethal-damage prevention, its delayed heal/status event, and the later real defeat.
- Temporary next-turn Energy regeneration, including Exhausted and the Energy-bar preview.
- Final-enemy death, Victory message, reward screen, and continue flow.
- Defeat and save deletion when relevant.
- Narrow mobile viewport without combat page scrolling.

For talent changes, also verify:

- Node count and visible names.
- Prerequisite state from either side of every bidirectional connection.
- Unlock cost and automatic loadout behavior.
- Ability/passive detail modal content.
- Pan, zoom, fit, and large-tree bounds.
- Save/load of newly unlocked IDs.

For gear changes, verify:

- Slot filtering and compatibility.
- One-Hand placement and Two-Hand Off Hand locking.
- Inventory/equipment transfer without duplication or loss.
- Rarity colors, alphabetical stats, set thresholds, and comparison differences.
- Background scroll lock in all item and slot modals.
