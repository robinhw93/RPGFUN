# Development guide

## Technology and project shape

- React 19 renders the application.
- TypeScript 5.9 provides strict type checking.
- Vite 6 runs the development server and creates production assets.
- Lucide React supplies UI glyphs.
- There is no backend, account system, database, or server-authoritative game state.
- Game state and all developer-tool drafts are stored in browser `localStorage`; selected editor actions can also write validated canonical source while local Vite is running.
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
| `npm test` | Bundle and run focused regression checks against the live game modules. |
| `npm run docs:check` | Verify that documented talent counts match the canonical catalog. |
| `npm run build` | Run `tsc -b`, then create the production bundle in `dist/`. |
| `npm run preview` | Serve the existing production bundle for local review. |

Run `npm test`, `npm run docs:check`, and `npm run build` as the baseline checks. Follow them with focused browser testing for affected game systems.

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
npm test
npm run docs:check
npm run build
```

Do not commit `dist/` unless the hosting workflow is deliberately changed to require built assets in Git.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Top-level state, navigation, application orchestration, high-level actions, and lazy-loaded screen boundaries. |
| `src/components/character/` | Character creation, canonical starting-class selection, and Character and Equipment/Inventory screens, including the reusable gear-detail modal. |
| `src/components/adventure/` | Adventure selection, event/score presentation, and combat-screen composition. |
| `src/components/town/` | Illustrated Arkenfall hub, five Shop/Craft/Sell vendor surfaces, floating transaction feedback, and tavern rest presentation. |
| `src/components/combat/` | Combat HUD, initiative presentation, and transient combat/VFX renderers. |
| `src/game/combatStats.ts` | Shared status-adjusted combat-stat projection for player and enemy inspection. |
| `src/components/talents/` | Runtime talent tree, talent details, and ability-loadout dialogs. |
| `src/ui/gameUi.tsx` | Shared display helpers, stat/ability icons, encounter wording, and asset preloading. |
| `src/styles.css` | Responsive layout, game-owned tooltips, modals, combat animations, paper-doll layout, talent maps, and mobile rules. |
| `src/game/types.ts` | Shared domain types and data contracts. |
| `src/game/data.ts` | Stable public facade for the split canonical content catalogs. |
| `src/game/content/abilities.ts` | Canonical player abilities and ability-type normalization. |
| `src/game/content/talents.ts` | Canonical talent nodes and runtime tree canvas. |
| `src/game/content/enemies.ts` | Canonical enemy templates and executable enemy abilities. |
| `src/game/content/gear.ts` | Canonical items and gear-set thresholds. |
| `src/game/content/adventures.ts` | Canonical events and story adventures. |
| `src/game/character.ts` | New-character state and derived-stat calculation. |
| `src/game/engine.ts` | Stable public facade for combat transitions. |
| `src/game/combat/` | State creation, event queues, damage, turn flow/triggers, player actions, enemy actions, and presentation resolution. |
| `src/game/combatMath.ts` | Hit-versus-Dodge bounds and rolls. |
| `src/game/statusEffects.ts` | Status library, stacking, duration, damage/healing, and status multipliers. |
| `src/game/combatFeatures.ts` | Resolves gear, set, and talent passives, triggers, damage modifiers, and ability modifiers. |
| `src/game/combatSequence.ts` | Small pure helpers for queued combat presentation. |
| `src/hooks/useCombatEventSequencer.ts` | Synchronizes floating text, attack wind-up, impact, and state resolution. |
| `src/hooks/useCombatActionQueue.ts` | Queues player abilities and End Turn, projects reserved Energy/cooldowns, and dispatches actions between combat sequences. |
| `src/game/timing.ts` | Combat, initiative, adventure-transition, and event-presentation timings. |
| `src/game/gear.ts` | Equipping, unequipping, compatibility, hand rules, and material/category normalization. |
| `src/game/items.ts` / `src/game/consumables.ts` | Item classification, shared acquisition with automatic empty-slot equipping, descriptions, and executable combat-consumable transitions. |
| `src/game/town.ts` | Arkenfall vendor/recipe resolution, purchases, exact material consumption, crafted-item grants, one-copy Inventory sales, and tavern recovery. |
| `src/game/flee.ts` | Pure active-combat flee losses and adventure-reset transition. |
| `src/game/quests.ts` / `src/game/content/quests.ts` | Quest rules/progress/rewards and canonical Quest/Questline catalogs. |
| `src/game/progression.ts` | Experience thresholds and level rewards. |
| `src/game/developerTools.ts` | Pure saved-character test transitions used by the developer launcher. |
| `src/game/rewards.ts` | Grants each combat reward once and captures score-screen data. |
| `src/game/eventOutcomes.ts` | Normalizes and applies typed event outcomes, queued next-combat statuses, and immediate encounters. |
| `src/components/adventure/EventPresentation.tsx` | Full-screen staged event title, choice, d100, bonus, and outcome presentation. |
| `src/game/save.ts` | Browser save/load/clear plus backward-compatible migration. |
| `src/game/talentRequirements.ts` | Bidirectional ANY talent-connection evaluation. |
| `src/game/initiativeLayout.ts` | Pure FLIP geometry for initiative-card transitions. |
| `src/game/avatars.ts` | Appearance catalog and saved-avatar normalization. |
| `src/components/TalentDevtool.tsx` | Standalone Talent Editor draft/export UI plus restricted existing talent/ability tooltip and Power-scaling source sync. |
| `src/components/ContentDevtools.tsx` | Compatibility facade for the split content editors. |
| `src/components/devtools/` | Shared devtool contracts/launcher plus separate Enemy, Event, Adventure, Item, and Quest editors. |
| `src/components/PortraitDevtool.tsx` | Enemy/player artwork selection and normalized square combat-portrait crop drafts. |
| `vite.config.ts` | Small Vite composition and server configuration. |
| `tools/vite/localSourceSync.ts` | Development-only field routes, validation, and canonical source synchronization. |
| `scripts/regression-tests.ts` | Focused rules/content regression checks run by `npm test`. |
| `scripts/verify-docs.mjs` | Live-versus-documented talent-count verification. |
| `src/components/FloatingCombatText.tsx` | Timed floating-message presentation. |
| `src/components/GameConfirmDialog.tsx` | Game-owned destructive-action confirmation. |
| `src/components/GearSlotIcon.tsx` | Resolves equipment-category image assets. |
| `src/components/ItemIcon.tsx` | Resolves per-item artwork with safe category fallbacks. |
| `src/game/itemIcons.ts` | Stable live item-ID to generated artwork mapping. |
| `public/assets/` | Avatars and stat, attribute, gear, item, and gold images. |

See [Architecture](../ARCHITECTURE.md) for ownership and sequencing rules.

## Editing content

### Abilities

Add or edit `Ability` entries in `src/game/content/abilities.ts`.

Important fields:

- `energyCost`, `cooldownTurns`, and `target` define usability.
- `range` is required and is either `melee` or `ranged`. Direct Melee attacks use the normal combatant lunge. Direct Ranged attacks keep the caster in place. They launch `vfx` as a projectile by default, while `rangedPresentation: "target"` is required for detonations, weather, fields, freezes, and other effects that should resolve in place. Beams may retain projectile timing while rendering as a source-to-target connection.
- Runtime `types` use the same Physical, Shadow, Arcane, Fire, Frost, and Lightning schools as combat. They are inferred from damage components or `damageType`; utility, status, flavor-primary, and mixed-school exceptions belong in `ABILITY_TYPE_OVERRIDES`, while a definition may supply `types` explicitly. The first type controls the action-bar color and icon.
- `damageType`, `power`, and `powerScaling` define a single damage component.
- `damageComponents` defines mixed damage and supersedes the single-component fields for damage calculation. A component may also add `armorScaling` for reusable Armor-based direct damage.
- `hits` and `randomTargetPerHit` define multi-hit behavior. Each queued direct hit carries the total hit count so presentation can restart the lunge and divide animation, impact, and floating-event timing proportionally. This keeps all hit animations consecutive within one normal attack-duration budget. `simultaneousAreaImpact` attaches every target of an `all_enemies` damage ability to one shared event so its damage, statuses, and VFX appear together.
- `hitsWhenSelfHasStatus` changes the hit count from a live self-status without branching on an ability ID.
- `requiredTargetStatus` and `requiredSelfStatus` gate use.
- `requiredTargetStatusStacks`, fixed stack consumption, and their modifier overrides support stack-gated abilities. The action-queue projection must reserve the same stack counts as the engine.
- `selfGuard` derives Guard from Armor, Physical Power, and Spell Power. `guardPerConsumedTargetStatusStackMaxHpRatio` derives Guard from a bounded status-stack count, while `barrierFromSelfHealingRatio` uses only Health actually restored.
- `dealsDamage: false` creates a status/control utility ability.
- `effect`, status options, detonation, consumption, healing, Energy restoration, and status spreading fields route through engine-supported behaviors.
- `statusApplications` supports one or more on-hit statuses, including critical-only applications and independent base proc chances augmented by the character's chance-effect bonus. `statusApplicationsWhenTargetHasNoDebuffs` uses the target snapshot from before the hit and must be mirrored in action-queue projection.
- Ability modifiers can add or replace status applications, redirect random multi-hits to the selected target, alter per-status-stack damage, scale status amounts from Physical or Spell Power, pre-heal from a self-affliction's remaining damage, and grant next-turn Energy regeneration.
- `conditionalStatusReplacement` swaps an application when the target already has a configured status; Deep Freeze uses it to replace Slowed with Stunned.
- `statusApplicationsWhenSelfHas` supports conditional applications such as Shield Charge's Stun while Guarded. `triggerTargetStatusDamage` resolves one non-consuming status-damage tick.
- `randomSingleStatusApplication` applies one status to exactly one randomly chosen target of an area ability.
- `ignoresAbsorption`, `consumeTargetStatusRatio`, Energy restoration, and `grantsNextCritical` support the current advanced Shadow abilities. Ability modifiers can override status-consumption ratios, including Neurotoxin's partial Poison consumption.
- `spreadAllTargetDebuffs`, `damagePerTargetDebuff`, `damagePerTargetStatusStack`, conditional Critical Chance, immediate turns, and on-kill refund/reset fields support talent mechanics without hard-coding talent IDs. Arcane Blast uses the status-stack multiplier for Arcane Wound.
- `damageFromSelfStatusStacks` supports Guard- or Barrier-derived direct damage. `removeAllTargetBuffs` dispels target buffs at impact, while `consumeTargetStatusForOtherEnemiesDamage` consumes a target affliction and resolves its remaining damage against every other living enemy at the same event. Queue projection mirrors both removals.
- `consumeStatusFromAllEnemies` combines with per-affected-enemy Energy and cooldown fields for area status consumers. Queue projection mirrors those rewards and removals before accepting later queued actions.
- `freeAgainstTargetStatus` makes a cast free only against the marked target and consumes that marker. Both the engine and queued-action projection must use the target-aware Energy helper.
- `consumeTargetStatusForDamage` scales a damage component and optional follow-up status from the consumed stack count. `spreadDetonatedStatusOnKillRatio` and `spreadOnKillVfx` support lethal detonation spread without checking an ability ID in the engine.
- `selfHealPerTargetStatusStack` heals from a target's stack snapshot after a successful hit. `transferSelfStatusToTargetForHealing` consumes a self affliction, heals from its remaining damage, transfers it to the selected target, and must also be mirrored by action-queue status projection.
- `damageModifiers` applies conditional multipliers owned by the ability.
- `vfx` emits presentation metadata at the exact event where the ability resolves and supplies the preferred Ranged treatment. `areaVfxPerTarget` gives grouped, non-damaging area abilities one simultaneous local impact per target. `vfxDirection: "to_player"` reverses a resolved transfer from the struck target to the player. `consumeStatusFromAllEnemiesVfx` emits one source-enemy-to-player transfer at the shared removal event before later damage impacts. Add matching `CombatAbilityVfxKind` renderers without putting animation timing into combat rules.
- Consume-based modifiers may retain the target status while still calculating benefits from its stacks. Self-ability modifiers may add Spell Power Guard scaling or remove every self debuff; each must provide a complete `descriptionOverride`. Additive Power/Armor scaling, Power-source changes, and primary status-stack overrides may use the shared description tokens so every unlocked modifier combination resolves accurate player-facing text.
- Trigger damage can scale from Physical/Spell Power or from damage absorbed by a named defensive status. Reflective Barrier therefore reflects only the amount consumed from Barrier, even when Guard also absorbs the hit.

Adding an ability definition does not make it obtainable. A talent must reference its exact `abilityId`, or another loadout-granting system must be added.

### Talents

The runtime tree reads `TALENTS` and `TALENT_TREE_CANVAS` from `src/game/content/talents.ts` through the stable `src/game/data.ts` facade.

Each talent defines:

- Stable `id` used by saves and connections.
- Player-facing name and description.
- Branch, kind, point cost, position, icon, and shape.
- `requires` stores one side of each bidirectional connection. Runtime also discovers talents that point back to the node, so never store the same edge in both directions.
- Every connection uses the same rule: any one unlocked adjacent node is enough.
- Optional `abilityId`.
- Ability talents receive editor-facing Energy cost, cooldown, and Melee/Ranged metadata from that live ability definition, keeping existing nodes synchronized without duplicating combat rules.
- Optional data-driven `combat` bundle.

Changing or removing IDs is a save-migration decision. Existing saves store unlocked talent IDs and equipped ability IDs.

The runtime loadout remains a compact `equippedAbilities` array. The slot picker replaces or swaps occupied indices and appends newly selected abilities to the first available empty position; it never creates sparse slots. Its available list is derived from `abilityId` values on currently unlocked talents.

### Enemies, items, sets, and adventures

Live definitions are separated under `src/game/content/` and re-exported by `src/game/data.ts`:

- Enemy IDs referenced by an adventure must exist in `ENEMIES`.
- Enemy templates own separate Physical Power and Spell Power, executable abilities, Critical Strike Chance, Starting Energy, Energy Regeneration, and Max Energy as well as Health, Armor, Magic Resistance, Hit, and Dodge values. An omitted Starting Energy remains backward-compatible and resolves to Max Energy. Reusable enemy ability fields cover friendly-target healing/statuses, self-healing, immediate self-Energy, Gold theft, combat escape, and turn-spanning charge preparation; use those contracts before adding enemy-ID branches to combat resolution. Escaped enemies remain flagged in combat state so rewards and kill quests can exclude them.
- Story adventures are `ADVENTURES` definitions containing ordered stages. Every stage accepts an unlimited list of weighted combat, boss, and event entries. Runtime chooses one entry by its positive `chance` weights and saves that entry ID before presentation.
- Adventure `theme` selects its dedicated adventure-card and combat-board backgrounds. The built-in values are `windsong_forest`, `arkenfall_highlands`, and `highfall_mountains`; `custom` reads the definition's required `cardImageUrl` and `combatBackgroundUrl`. Custom combat boards use the same isolated full-viewport background, edge overlay, and translucent combat panels as the built-in themes so their artwork remains visible behind the board. Adventure Editor and local catalog validation support all four. Adventure `travelText` supplies the footsteps/loading copy whenever that adventure starts or advances to another stage; older editor drafts receive a theme-appropriate default during normalization.
- A selected story combat or boss entry uses its `description` as the encounter announcement between the footsteps and initiative. Empty descriptions fall back to generated enemy-count wording. `App.tsx` fades that transient announcement in, keeps it mounted as initiative starts, moves it below the roll, and begins its fade-out when `InitiativeRoll` starts the turn-order flight. Immediate encounters produced by event outcomes use the same announcement-to-initiative sequence without invoking the footsteps travel transition.
- Event IDs referenced by an adventure must exist in `ADVENTURE_EVENTS`. Choices contain an attribute, threshold, and structured success/failure outcome. Each outcome contains an ordered list of typed effects; next-combat status effects are stored in adventure progress until combat creation, while an immediate encounter uses its own enemy group and combat reward.
- Adventure rewards are granted only to combat/boss entries with a reward definition.
- Gear IDs should remain stable because save hydration looks up current definitions by ID.
- New set bonuses belong to `GEAR_SETS`; the flat `GEAR_SET_BONUSES` runtime list is derived automatically. Gear `set` IDs must reference one of those definitions.
- Standard consumables are `ConsumableItem` definitions. Use the shared typed effects and `useConsumable`; do not add item-ID branches for healing, Energy, fixed damage, status application, or named status removal.
- Two-Hand weapons must use `weaponEquipType: "twoHand"`; legacy `weaponType` exists only for older saves.

### Status effects

Add status IDs to `StatusEffectId` in `src/game/types.ts`, then add the definition to `STATUS_EFFECTS` in `src/game/statusEffects.ts`. Also update:

- Status icon mapping in `src/ui/gameUi.tsx`.
- Any outgoing/incoming multiplier or timing logic.
- Damage/healing formulas when the status ticks.
- Combat-engine application/removal behavior if it is not covered by the generic path.
- Player and developer status references in documentation.

The status definition alone provides metadata; special mechanics still require engine support.

Stunned is globally gated by Diminishing Returns. All generic, triggered, copied, conditional, self-applied, and projected status paths must use the shared status-application guard. Natural expiration and explicit removal both replace Stunned with a fresh three-turn Diminishing Returns buff at the same presentation event.

## Data-driven combat features

Gear items, gear-set thresholds, and unlocked talents can all supply a `CombatFeatureBundle`.

### Passive bonuses

Use `combat.passive` for attributes, Armor, Magic Resistance, powers, resources, chances, initiative, Guard/healing modifiers, unconditional status damage, status leech, guaranteed or chance-based status companions, preserved detonations, starting statuses, starting Max-Health-scaled Guard/Barrier, full-Health combat-start self damage, status immunities, additional applied-status stacks, Energy-based incoming-damage reduction, reusable death prevention, status-consuming death prevention, and guaranteed-hit status-stack thresholds. Flat bonuses are aggregated first; additive `statMultipliers`, `physicalPowerMultiplier`, and `magicalPowerMultiplier` values then scale their respective final totals. Derived stats aggregate every active source.

Use `combat.statusDamageModifiers` when a damage-over-time bonus depends on the source's current statuses. Matching bonuses add together before they multiply the normal status-damage result; this keeps conditional enemy Burn bonuses separate from self-inflicted Burn.

### Triggers

A `CombatTriggerDefinition` contains:

- An event: `combat_start`, `turn_start`, `before_ability`, `on_hit`, `on_crit`, `on_kill`, `damage_dealt`, `status_applied`, `status_removed`, `status_damage`, `health_restored`, `guard_gained`, `damage_taken`, `enemy_missed`, `enemy_stunned`, or `turn_end`.
- Optional ability-ID, ability-branch, damage-type, critical, minimum-damage, source-kind, target-status, applied/removed-status, removal-reason, absorbed-status, or Health-threshold conditions.
- Optional chance, once-per-turn rule, once-per-combat rule, or cooldown.
- One or more data-driven effects: flat/Power/Armor-scaled damage, trigger-damage or absorbed-status ratios, current-Health-percentage damage, status application, flat, trigger-damage-ratio, or Max-Health-based healing, Energy, next-turn Energy regeneration, cooldown reduction, Guard, or Barrier.

Triggered passives do not add central presentation events. Their damage, healing, status, and `passive_text` pending effects attach to the existing action event, so they resolve at the triggering action without extending the sequence. Proc names are grouped per affected target and appended to `combat.passiveAnimations`; the combatant-local CSS animation runs independently of the sequencer. Separate combat-log entries preserve inspectable trigger and result details.

Player `You use ...` action events are presentation-hidden and use `COMBAT_TIMING.silentEventMs`. Keep the event as the synchronization anchor for Energy expenditure and `before_ability` triggers; the ability-use combat-log entry remains player-inspectable.

`endPlayerTurn` must preserve resolved player-status durations. When turn-end events exist, it queues status reconciliation on the final turn-end event; without a sequence, it returns the resolved status list directly. Do not restore `combat.playerStatuses` unconditionally, or finite buffs such as Stealth will appear permanent.

Stealth normalization must also clear any legacy `permanent` flag during creation, refresh, combat loading, and duration decrement. Stealth created during its holder's active turn uses two owner-turn-end ticks (the current turn and the next); Stealth created after that holder's turn-end processing uses one, so both paths expire at the end of the holder's next turn.

`FloatingCombatText` snapshots hidden event indexes when a sequence mounts. Pending damage effects are consumed as soon as their event resolves, so recalculating visibility from live pending effects would reveal the hidden damage sentence for the remainder of that event.

Luck's chance-effect bonus is added only when `chance` is explicitly present. Final proc chance is clamped to 0–100%.

Some trigger event names are part of the general contract but are not yet emitted from every theoretically possible engine location. Verify the desired event in `engine.ts` before depending on it for new content.

### Damage modifiers

Damage modifiers multiply matching damage and can filter by damage type, attacker status, or target status. They may also scale by the target's number of unique debuffs. Multiple matching modifiers multiply together. General status multipliers are applied separately by the status system.

### Ability modifiers

Ability modifiers can currently:

- Permit an ability without its normal required self status.
- Change scaling when that requirement is missing.
- Override status duration, magnitude, start-expiration behavior, or stack scaling from Physical/Spell Power.
- Replace a status application or add further applications.
- Add applications only when the target already has a configured status, or derive applied stacks from target-status stacks.
- Redirect random multi-hits to the selected target.
- Change damage gained per target-status stack.
- Scale damage by the number of living enemies carrying a configured status.
- Heal from the remaining damage of a self-affliction before replacing it.
- Grant temporary Energy regeneration for the next turn.
- Override successful-hit self healing, next-turn Energy regeneration, or an immediate target status-damage trigger.
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
- Multiple flat and percentage passive bonuses, including attributes, Physical Power, and Spell Power.
- Ability-ID references, live-synced Energy cost, cooldown turns, and **Flat Damage per hit**, Melee/Ranged selection, free-form effect/proc notes, a dedicated live ability tooltip, and total **% of Physical Power** / **% of Spell Power** damage fields. Current values come from the canonical ability, including hybrid and multi-element component totals; non-damaging abilities keep every damage field at zero.
- Bidirectional connections where any one unlocked adjacent talent is enough.
- Searchable buff/debuff reference.
- Separate content and layout signatures. Canonical content updates preserve local placement, while an intentional canonical layout update migrates the canvas, positions, connections, icons, and shapes in an existing saved draft once.
- Toggleable snap-to-grid.
- Pan, zoom from 15% to 200%, and fit-to-view.
- Automatic canvas growth near every edge while preserving fixed world-grid spacing.
- Copy-to-clipboard and JSON download.

### What Save does

Every editor change already auto-saves the draft to browser `localStorage` under the legacy compatibility key `emberfall.talent-devtool.v1`. The **Save** button performs the same browser-local write immediately and confirms it in the editor UI. For an existing canonical talent, leaving the **Talent tooltip for players** field writes that description directly to `src/game/content/talents.ts` through the local Vite server. If the talent references an existing canonical ability, **Energy cost** writes to `src/game/content/abilities.ts` shortly after each edit and flushes immediately when the field loses focus. Leaving its **Cooldown**, **Flat Damage per hit**, **Ability tooltip for players**, or either Power-percentage field writes that value directly to the same canonical ability source. These restricted field writes are independent of the Save button.

The **Save** button itself does not:

- Apply other draft fields to the matching module under `src/game/content/`.
- Update the live player talent tree.
- Push to GitHub.
- Synchronize to another browser or computer.

**Copy for Codex** copies the full export JSON. **Export JSON** downloads `arkenfall-talents.json`. Those exports describe layout, connections, flat and percentage passive bonuses, ability IDs, Energy costs, cooldowns, and design notes; they still require review and integration into source code.

### Editor limitations

- Free-form effect notes are documentation for implementation, not executable mechanics.
- An ability ID must already exist or be implemented alongside the talent.
- Advanced triggers, damage modifiers, ability modifiers, and new status mechanics must currently be added in TypeScript after export.
- Direct source sync is available only through the local Vite development server and only when the talent and referenced ability already form the same canonical pair. This includes Energy cost, cooldown, Flat Damage, tooltip, and Physical/Spell Power totals; reassigned/new abilities stay draft-only.
- Editor storage belongs to one browser/site origin.

## Enemy, Event, Adventure, Item, Quest, and Portrait editors

The developer-tool launcher opens the isolated content editors listed below. It also contains two saved-character testing actions: **Level up** advances exactly one level through the normal progression formula and grants the usual three Attribute Points plus one Talent Point, while **Grant item** adds 1–99 independent copies of a selected live item to Inventory. Normal game autosave persists both actions. Level up is disabled during active combat and at level 50; item grants remain available during combat so consumables can be tested immediately.

- **Create Enemy** edits Physical Power, Spell Power, other combat stats, defenses, Hit/Dodge/Critical chances, Starting Energy, Energy Regeneration, Max Energy, full and portrait artwork, executable abilities, behavior priority, actions per turn, optional ally-death healing, and an item drop table whose percentage rows roll independently for every defeated instance. The same item may appear on several enemy drop rows, allowing each possible copy to have its own drop chance. Starting Energy accepts 0 through Max Energy; lowering Max Energy also lowers an excessive Starting Energy. Existing numeric fields and drop tables retain their narrow live writes. The editor's main **Save** validates and replaces the complete `ENEMIES` initializer through local Vite, so new enemies and advanced mechanics become canonical without a manual source import. Ability definitions use a complete JSON effect editor to preserve every reusable runtime field, including conditional bonus damage against one player status. **Advanced enemy fields and tactical AI** edits ordered ability rules, their AND-combined Health/Energy/status/group/phase conditions, explicit fallback abilities, and ordered or cycling fallback behavior. Source validation rejects unknown ability/status references, invalid condition values, and malformed fallback lists before writing.

  When the live enemy ID catalog changes, Create Enemy appends previously unseen canonical enemies to the existing browser draft while preserving local-only enemies. Explicit drop-table revisions may refresh named canonical enemies—currently the Windsong creatures plus the Highfall Bandits and Trolls—so newly implemented loot rows replace stale browser-draft rows without changing that draft's other enemy fields. The signature includes those live drop-table rows, allowing later canonical loot adjustments to appear automatically.
- **Event Manager** creates events with two or three choices. Each choice can use a d100 attribute check with positive/negative outcomes or a direct outcome determined solely by the selected choice. Outcomes can combine Health, gold, experience, Talent Points, Attribute Points, an item, a player/enemy status for the next combat, an immediate enemy encounter with an XP/gold reward, or a Wandering Merchant stocked from selected live items. Every merchant automatically exposes the character's current Inventory in a separate Sell tab; this does not require editor configuration. **New merchant** creates a ready-to-edit two-choice direct event with browse/leave actions and a merchant effect. Legacy signed-number outcomes are normalized into the version-2 effect list when their existing browser draft is opened. Event and choice IDs are internal: the editor hides them, preserves valid existing values, and automatically repairs missing, invalid, or duplicate values from the visible names.
- **Adventure Editor** creates adventures, prerequisites, travel-loading text, completion copy, ordered stages, and unlimited weighted combat/event possibilities. It also supports **Custom artwork** with separate adventure-card and combat-background URLs. Selecting an adventure expands its stages as nested tabs in the left navigation; selecting a stage scrolls directly to its editor, and adjacent up/down controls change the canonical stage order without exposing IDs. Enemy and event pickers display readable names while internal adventure, stage, and possibility IDs stay hidden. Valid existing IDs are preserved; missing, invalid, or duplicate IDs are repaired automatically from the visible names before browser storage, Save, Copy, or Export. Enemy counts support repeated templates, combat entries configure XP and gold, and every stage has an item drop table with independent percentage chances. Its **XP Guide** lists the experience needed from the previous level and the cumulative total for every level through the level-50 cap; the table is derived from the live progression formula.

  When the canonical Event or Adventure catalog gains IDs that are missing from an existing browser draft, the corresponding editor appends deep-cloned live definitions once while preserving local-only entries and edits to IDs already present. Catalog signatures prevent intentionally deleted draft entries from returning on every reopen. This keeps implemented content such as the Highfall events and all eleven Highfall stages visible without clearing local storage.
- **Item Editor** creates gear, set definitions, consumables, and ordinary **Other Items**. Every item has a non-negative Gold Cost used by event and Arkenfall merchants. **Sold in Arkenfall** assigns the item to Brunhilde's Blacksmith, Ray's Alchemist, Mirelle's Tailor shop, Torren's Leatherworker shop, or Celestine's Jeweler shop and may independently require one selected adventure to be completed before the item appears. **Craftable** assigns the matching Blacksmith Crafting, Alchemist Brew, Tailoring, Leatherworking, or Jewelcrafting station plus any number of live item ingredients, whole-number quantities, and its own optional completed-adventure requirement. Adventure selectors display names while persisting stable IDs. These fields are executable immediately after Save; source validation rejects missing/self/duplicate ingredient references, empty recipes, unknown locations, and missing adventure references. Gear supports slot/hand classification, type-filtered gear artwork, the ordered Common/Uncommon/Rare/Epic/Legendary rarity tiers, attributes, defenses, both Powers, set membership, and non-executable special notes. Set thresholds expose an executable passive JSON field, preserving advanced status, trigger, and combat-feature bundles in the canonical catalog. The gear-art library contains five generated alternatives for every Head, Chest, Pants, Boots, Ring, Sword, Axe, Mace, Dagger, Wand, Shield, Tome, Staff, and Polearm category in addition to legacy icons; changing a slot or weapon kind immediately switches the picker to the matching category. Consumables compose any number of typed Health, Energy, next-turn regeneration, fixed-damage, status-application, and named status-removal effects against self, selected target, or all enemies. Consumables and Other Items can select any generated artwork under `public/assets/items/`; the shared picker includes a twenty-icon potion library with red, blue, green, and purple **Minor**, **Normal**, **Greater**, **Major**, and **Superior** forms, plus Metal Scrap and twenty reusable crafting-material images spanning ores, fuel, wood, textiles, monster parts, alchemy ingredients, and elemental reagents. New consumable drafts default to the existing red Minor Healing Potion form. The selected URL is validated and saved with the canonical item. Other Items contain identity, rarity, price, description, and optional special notes but deliberately have no equip or combat-use behavior. Save validates and replaces `ITEMS` and `GEAR_SETS` in the canonical gear module; those standard fields therefore work in the live game without a Codex import. Special notes are retained in source/export but require implementation.

  When the live item or set ID catalog changes, Item Editor automatically appends previously unseen canonical entries to the existing browser draft. Entries already present by ID normally keep their local edits, and local-only unsaved entries remain untouched. Explicit content revisions may refresh named canonical definitions—currently the three Highfall sets—so implemented trigger changes replace their older browser-draft versions. A stored catalog signature prevents intentional draft deletions from being re-added on every reopen.

  Gear's live **Scaling Value** card converts standard numeric stats into a transparent comparison index, shows every scored contribution, and ranks the draft against other items for the same slot. The left list can sort gear by Scaling Value in either direction or sort every editor category alphabetically without changing canonical catalog order. One attribute point is the baseline value of 1; the centralized weights value Armor/Magic Resistance at 0.25, Physical/Spell Power at 0.75, Max Energy at 3, Energy Regeneration at 4, each percentage point of Hit/Dodge/Critical Strike Chance at 0.4, and Initiative at 0.25. Set bonuses, special notes, and advanced combat effects remain outside the numeric score and are explicitly flagged for manual evaluation.

- **Quest Editor** creates complete Quest and Questline catalogs. Each quest has a title and description, one typed goal (**Defeat enemies**, **Find items**, or **Complete adventures**) with a whole-number amount, a non-negative whole-number XP reward, and any number of live item rewards with quantities. Quests may remain standalone or belong to one ordered questline; moving quests changes their unlock order and a quest can belong to at most one questline. Save validates every enemy, item, adventure, reward, and questline reference before replacing `QUESTS` and `QUESTLINES` in `src/game/content/quests.ts`, so all standard fields execute immediately in the live Quest Board.

- **Portrait Editor** switches between enemies and player avatars, selects from the generated full-art library, and positions/resizes a square crop directly over the source image. It shows the exact square combat preview and exports normalized percentage coordinates, so the crop is independent of the editor's screen size.

They auto-save and expose Save, Copy for Codex, and Export JSON. Their browser keys include `emberfall.enemy-devtool.v1`, `emberfall.event-devtool.v1`, `emberfall.adventure-devtool.v1`, `emberfall.item-devtool.v1`, `emberfall.quest-devtool.v1`, and `emberfall.portrait-devtool.v1`. New exports use `arkenfall-*` format names and filenames. Item exports use version 1 and contain both items and sets; Event exports use version 2; Quest exports use version 1 and contain both quests and questlines. Local drafts can reference one another. Enemy, Event, Adventure, Item, and Quest Save post complete drafts to the local Vite server, which validates shapes and references before replacing only the owned catalog initializers. These writes are unavailable in production. Existing-enemy stats and drop tables plus Talent Editor tooltip/Power fields retain narrow direct-write behavior for fast field-level updates.

The launcher-level **Level up** and **Grant item** actions are different from editor source sync. They update the active character through React state and the normal `emberfall-save-v1` autosave; they never write TypeScript source. Level up is unavailable during active combat and at level 50. Grant item remains usable during combat, lists the canonical live `ITEMS` catalog, clamps quantity to 1-99, and adds independent cloned copies.

## Save compatibility

The live game key remains `emberfall-save-v1` for compatibility with saves created before the Arkenfall rename. When changing persistent types:

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
- Clamps loaded characters to the level-50 cap and clears stored experience at the cap.
- Restores a missing adventure mode as `story`. Saves left inside removed adventures, including Shadow Proving Grounds and Ashen Road, reset safely to the Windsong Forest map while preserving the character.
- Restores missing accepted/completed quest collections and progress maps, then removes quest IDs that no longer exist in the live catalog.

## UI conventions

- Never use `alert`, `confirm`, or `prompt`.
- Never rely on HTML `title` for game tooltips.
- Use `data-game-tooltip` for custom hover/keyboard hints.
- Use game-owned modals for detailed touch/click inspection.
- Tap uses an ability; long-press shows its explanation without firing it.
- Combat ability cards show their content icon, Energy cost, and base cooldown; do not reintroduce keyboard-slot numbers into the card corner.
- Clicking a status opens its detail modal; hover behavior must not overlap the click modal.
- Combat portraits use a compact square image surface with enough clearance above the Health bar. The player uses a thin gold frame; every enemy portrait keeps a thin dark-red frame in normal, hover, focus, selected, and defeated states. Hover/focus may add a restrained glow but must not scale or flash white on press. Enemy-card hover uses an accent overlay with an opacity transition, while pointer focus has an explicit game-owned outline from its first frame; do not transition between incompatible solid and gradient backgrounds or expose the browser's default focus ring. Player and enemy portrait dialogs use the shared stat icons and project temporary combat statuses into the displayed values through `combatStats.ts`.
- Combat resource values stay centered over the full Health/Energy bar width at every viewport size; do not offset them toward the portrait or pair them directly beside the left-aligned resource label.
- Modal backdrops may blur/dim the game but should not replace it with an opaque black screen unless the screen is intentionally a travel transition.
- Modal opening must lock document/background scrolling and restore it on close.
- Player-facing copy must use consistent names: **Hit Chance**, **Dodge Chance**, **Critical Strike Chance**, **Initiative**, **Physical Power**, and **Spell Power**.
- Preload and decode Character-screen avatars, their combat portraits, gear icons, and stat icons before rendering that screen. Current-encounter enemy portraits and full bestiary art are warmed through the shared image cache when combat loads so the card and information modal do not pop in late.
- Keep combat usable without page scrolling on mobile.

## Documentation maintenance

The implementation is the source of truth, but documentation changes are part of the implementation rather than a later cleanup task. Update the relevant files in the same commit whenever behavior or content changes:

| File | Update when |
| --- | --- |
| `README.md` | Headline scope, prerequisites, hosting, or the documentation map changes. |
| `docs/GAME_SYSTEMS.md` | A player-visible rule, formula, flow, status interaction, reward, gear rule, or talent behavior changes. |
| `docs/CONTENT_REFERENCE.md` | An ability, talent, status, enemy, item, set, adventure, reward, or live content count changes. |
| `ARCHITECTURE.md` | State ownership, shared contracts, sequencing, persistence, data flow, or UI/rules boundaries change. |
| `docs/DEVELOPMENT.md` | Setup, tooling, content-authoring steps, editor behavior, conventions, or verification changes. |
| `AGENTS.md` | The durable collaboration workflow or repository-wide implementation conventions change. |

Do not copy full content tables into several files. Keep exact catalogs in `CONTENT_REFERENCE.md`, player-system explanations in `GAME_SYSTEMS.md`, and link to them from higher-level documents.

## Git and change discipline

- Inspect `git status --short` before editing and before committing.
- Treat pre-existing modifications as user-owned. Preserve unrelated changes and do not overwrite or reformat them as collateral work.
- Use stable IDs for saved content. Renaming visible text is safe; changing an item, talent, ability, enemy, or avatar ID requires migration review.
- Keep commits scoped to one coherent request, including its documentation and verification changes.
- Do not commit `dist/`, temporary smoke-test scripts, logs, or dependency folders.
- Avoid destructive Git operations such as hard resets. Resolve pull conflicts deliberately and preserve local work.
- This project currently works directly on `main`; after a requested implementation is verified, commit it and push it unless the user explicitly asks to keep it local.

## Verification checklist

Always run:

```bash
npm test
npm run docs:check
npm run build
```

`npm test` bundles the focused TypeScript regression suite against the real modules with `esbuild`; extend it when a rule change has a stable, high-value invariant. `npm run docs:check` guards the live talent count. UI layout, touch behavior, animation, and VFX still require browser verification. If a managed Codex sandbox blocks Vite/esbuild process spawning with `EPERM`, rerun the same command with the appropriate approved escalation rather than changing project configuration to work around the sandbox.

Then test the changed system in a browser. For combat changes, verify at minimum:

- Initiative timing and ordering.
- Player Energy regeneration only at player-turn start.
- Enemy Energy regeneration only at that enemy's turn start.
- Initiative-changing statuses during an active turn; pending turn transitions must follow the stable actor ID after reordering and never repeat or skip an enemy.
- Multiple abilities in one turn and cooldown blocking.
- Hit, miss, critical, Guard, and one damage-over-time effect.
- Damage/status application at the matching floating message.
- Lethal-damage prevention, its delayed heal/status event, and the later real defeat.
- Combat fleeing at the 50% and 90% Gold-loss boundaries, both sides of the equipped-item loss roll, retained Health, full adventure reset, and the mandatory loss-summary acknowledgment before town navigation.
- Tavern recovery at one Gold per five missing Health, including rounded full recovery and spending all available Gold on partial recovery.
- Temporary next-turn Energy regeneration, including Exhausted and the Energy-bar preview.
- Final-enemy death, Victory message, reward screen, and continue flow.
- Defeat and save deletion when relevant.
- Narrow mobile viewport without combat page scrolling.

For talent changes, also verify:

- Node count and visible names.
- Prerequisite state from either side of every bidirectional connection.
- Unlock cost and automatic loadout behavior.
- Ability/passive detail modal content.
- Desktop wheel zoom, left/middle mouse pan, touch pan, mobile zoom buttons, intentional pinch-zoom suppression, node-drag suppression, stationary node selection, and large-tree bounds.
- Save/load of newly unlocked IDs.

For gear changes, verify:

- Slot filtering and compatibility.
- One-Hand placement and Two-Hand Off Hand locking.
- Inventory/equipment transfer without duplication or loss.
- Rarity colors, alphabetical stats, set thresholds, and comparison differences.
- Background scroll lock in all item and slot modals.
- Merchant read-only gear inspection, score-screen gear inspection with direct Inventory Equip actions, merchant purchase/sold-out animation, centered rising-and-fading town purchase confirmation without an inline success panel, grouped duplicate loot, structured event Outcome rows, and the event Inventory/Equipment shortcut at mobile and desktop widths.
- Per-item artwork consistency and rarity-colored item names across Inventory, equipment slots, details/comparison, the in-combat Inventory, merchants, crafting requirements, and score-screen loot.
- Completed adventures remain listed with the green Completed treatment and expose a Replay Adventure action. Replay combat and positive event XP pass through the shared 10%-reward rule, while locked prerequisites remain rejected at the application start boundary.
