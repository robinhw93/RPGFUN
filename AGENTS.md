# Emberfall collaborator guide

This file applies to the complete repository. Read it before changing the project. It is the durable handoff for future Codex/ChatGPT coding sessions and records the working agreements established with the project owner.

## Start here

Before implementing a request:

1. Read `README.md` for the current playable scope.
2. Read `ARCHITECTURE.md` for ownership and sequencing contracts.
3. Read the relevant sections of `docs/GAME_SYSTEMS.md`, `docs/CONTENT_REFERENCE.md`, and `docs/DEVELOPMENT.md`.
4. Inspect the implementation and `git status --short`. Source code is authoritative when documentation and code disagree; reconcile the documentation in the same change.
5. Prefer a small, explicit plan for work that crosses several systems.

Do not infer current rules from an old conversation alone. This game changes frequently, and exact values should be verified in the live definitions.

## Product contract

- Emberfall Chronicles is a mobile-first, browser-based, build-focused text RPG made with React, TypeScript, and Vite.
- All game UI, player-facing descriptions, tooltips, combat text, and content names are English. Communicate with the project owner in Swedish unless they use another language.
- Write for players. Do not expose internal field names, formulas labelled as developer rules, debug terminology, or implementation notes in the game UI.
- Never use browser-native `alert`, `confirm`, `prompt`, or `title` tooltips. Use game-owned dialogs, modals, and `data-game-tooltip` behavior.
- Combat must fit a phone viewport without vertical page scrolling. Respect browser safe areas and test narrow mobile layouts.
- Tap and long-press are distinct: tap performs an action; long-press explains it without performing it.
- Modals lock background scrolling. Their backdrop may dim and blur the game, but should not become fully opaque unless the screen is intentionally a travel transition.
- Preserve permadeath behavior and save deletion on defeat.

## Source ownership

Use the existing module boundaries rather than putting more rules into `App.tsx`:

- `src/game/data.ts`: canonical abilities, talents, canvas, enemies, gear, sets, and adventures.
- `src/game/types.ts`: shared domain contracts.
- `src/game/engine.ts`: combat transitions, turns, targeting, abilities, triggers, statuses, pending effects, and outcomes.
- `src/game/character.ts`: the only derived-stat pipeline.
- `src/game/combatMath.ts`: Hit/Dodge rules and caps.
- `src/game/statusEffects.ts`: status definitions, stacking, durations, ticking formulas, and generic multipliers.
- `src/game/combatFeatures.ts`: data-driven passives, triggers, damage modifiers, and ability modifiers from talents, gear, and sets.
- `src/game/talentRequirements.ts`: bidirectional ANY talent connections.
- `src/hooks/useCombatActionQueue.ts`: queued player abilities and End Turn projection.
- `src/hooks/useCombatEventSequencer.ts`: presentation-time event resolution.
- `src/game/timing.ts`: shared presentation durations.
- `src/game/save.ts`: load, save, and migrations.
- `src/App.tsx`: application orchestration and rendering, not duplicated rule formulas.
- `src/styles.css`: presentation and animation only; CSS must not decide game outcomes.
- `src/components/TalentDevtool.tsx`: isolated editor draft/export UI. Saving there does not update live source data.

See `ARCHITECTURE.md` for the complete map.

## Combat implementation rules

### Event rhythm is part of correctness

Combat computes ahead but presents results in sequence. Health, statuses, Energy regeneration, cooldown changes, active turns, death, and victory must become visible at the event or attack impact that describes them.

- Queue visible changes as `CombatPendingEffect` values instead of mutating the visible snapshot early.
- Direct attacks use two phases: prime the lunge, then apply damage at `attackImpactMs`.
- Let the attacker complete its return animation before dispatching the next queued action or actor transition.
- Pending effects sharing an event resolve in insertion order. For consume-and-reapply behavior, remove the old status before applying its replacement.
- Do not show central damage sentences or player `You use ...` announcements. Damage uses local numbers; misses use `Missed!`.
- Local damage numbers, proc labels, status flashes, and ability VFX are non-blocking. They must not add floating-event slots or lock input.
- Enemy turns do not need a generic `Enemies Turn` message. The initiative highlight moves when the relevant turn event resolves.
- Final-enemy death must finish, then `Victory.` must resolve, then the score screen may appear.

### Player input queue

Abilities and End Turn remain usable while an ability animates. Inputs enter a FIFO queue.

- Project reserved Energy, cooldowns, statuses, target requirements, free casts, and cooldown resets before accepting a queued action.
- Store the selected target when the player queues the action.
- End Turn may be appended once and closes the queue to later abilities.
- Keep the queue transient; it is not saved in `GameState`.

### Prefer reusable data contracts

New talent, gear, and set mechanics should use `CombatFeatureBundle` whenever a general contract can express them:

- Static values belong in `PassiveBonuses`.
- Proc behavior belongs in `CombatTriggerDefinition`.
- Conditional outgoing damage belongs in `CombatDamageModifierDefinition`.
- Changes to an existing ability belong in `AbilityModifierDefinition`.

Avoid branching the engine on a talent ID. Add a reusable typed field and shared resolution path when a mechanic can reasonably appear on another talent, set, or item later. Hard-code only behavior that is genuinely unique to the ability itself.

When an ability modifier changes behavior, also provide the correct `descriptionOverride`. Combat tooltips, talent details, the loadout picker, and combat-log inspection must all resolve the same effective description, Energy cost, and cooldown.

### Stats and status rules

- Display whole numbers for every stat and initiative roll.
- Raw Hit Chance and Critical Strike Chance are uncapped.
- Dodge Chance is capped at 50%.
- Blind multiplies raw Hit Chance by 0.25 before Dodge is subtracted.
- Final Hit Chance is clamped to 20–100%, so sufficient uncapped Hit can fully overcome Dodge or Blind.
- Use the shared derived-stat and combat-math helpers; never reproduce these formulas in UI components.
- Armor and Magic Resistance mitigation is owned by combat/status rules, not by the display layer.

When adding a status, update all of the following as applicable:

1. `StatusEffectId` and related type unions.
2. `STATUS_EFFECTS` metadata and generic stack/duration behavior.
3. Engine timing, ticking, control, wake-up, immunity, and removal mechanics.
4. Status icon mapping and local application/persistent visual treatment.
5. Player-facing tooltips plus `GAME_SYSTEMS.md` and `CONTENT_REFERENCE.md`.

Status icons use circular badges and fixed three-segment duration rings by default. Expired ring segments remain empty; remaining segments never stretch. Do not show implementation notes such as `does not stack` or `permanent` in player tooltips unless the rule needs a natural player-facing explanation.

### VFX pattern

Active abilities should have distinct, readable feedback when their effect warrants it.

- Every ability declares `range: "melee" | "ranged"`. Direct Melee attacks use the combatant lunge; direct Ranged attacks keep the attacker stationary and launch a damage-type or ability-specific projectile that reaches the target at attack impact.
- Preserve the range value in Talent Editor drafts and exports. A Ranged direct-damage ability must have readable projectile presentation even when it has no bespoke `vfx`; the shared damage-type fallback is the minimum treatment.

1. Add or reuse a `CombatAbilityVfxKind`.
2. Put the ability's `vfx` and `range` on its data definition.
3. Queue `ability_vfx` at the same event/impact as the mechanic.
4. Render it from transient `abilityAnimations` metadata in `App.tsx` and CSS.
5. Keep mechanics independent of animation completion and keep VFX non-blocking.

Status refreshes must restart their application effect, so key transient overlays by effect/event identity rather than only a persistent class name.

## Talent-tree workflow

The current live tree has 161 nodes: origin, four class nodes, 78 later Shadow nodes, and 78 later Arcanist nodes. Shadow and Arcanist each have 79 nodes including their class node; Brute and Cultist currently have one class node each. Verify these counts against `TALENTS` after every import.

- Talent IDs are save contracts. Preserve them unless a migration is intentionally implemented.
- All requirements use ANY. There is no ALL mode.
- Connections are bidirectional at runtime. Store each edge once; do not duplicate both directions in `requires`.
- Unlocking either connected end may make the other end available.
- The runtime tree and Talent Editor must support pan, zoom, fit-to-view, fixed world-grid alignment, and canvas growth in every direction.
- Talent nodes display name and Ability/Passive/Class on the map; full rules belong in the selected-node modal.
- Class-node details show the granted ability before the Passive Bonus.
- Circular passive nodes are 25% smaller than square ability/class nodes. Unlocked nodes have a gold outline, and connection lines must be masked beneath nodes.

When the owner supplies Talent Editor JSON:

1. Read the complete attachment/export.
2. Preserve its positions, shapes, icons, connections, IDs, names, descriptions, Energy values, cooldowns, Melee/Ranged values, and effect notes unless the owner explicitly requests a design change.
3. Apply the complete intended canvas/layout update, not only newly added nodes.
4. Treat `effectNotes` as design instructions, not executable data. Implement the mechanic in typed source contracts.
5. Correct obvious spelling and naming inconsistencies without silently changing balance or intent.
6. Keep existing ability definitions, talent combat bundles, editor metadata, and all documentation synchronized.
7. Verify every ability talent points to a real ability and every connection points to a real node.

The Talent Editor's **Save** button only writes its browser-local draft. It does not edit `src/game/data.ts`, update the runtime tree, or push Git changes.

## Saves and compatibility

The live save key is `emberfall-save-v1`. Existing characters may load into any new code.

- Keep ability, talent, item, enemy, avatar, and set IDs stable.
- Normalize new persistent fields at the load boundary and in `ensureCombatState` where appropriate.
- Make newly persisted fields tolerant of older saves.
- Filter, translate, or refund removed content when practical.
- Test both a fresh character and an older/in-progress state for persistent-schema changes.
- Do not save transient UI state such as action queues and animation metadata unless the domain model explicitly requires it.

## Working method

- Start with read-only inspection. Search with `rg`/`rg --files` and follow the relevant state path before editing.
- Use `apply_patch` for hand-edited source and documentation changes.
- Preserve unrelated user changes in a dirty worktree. Do not perform broad cleanup, formatting, resets, or dependency changes outside the request.
- Prefer shared helpers and typed contracts over local conditionals.
- Keep player-visible mechanics and their text synchronized in the same change.
- Update documentation as part of the implementation, using the ownership table in `docs/DEVELOPMENT.md`.
- Run `npm run build` after source changes. Add focused temporary smoke checks for rule-heavy mechanics when useful, then remove all temporary artifacts.
- Verify touch/layout/VFX changes in a browser at a narrow mobile viewport as well as desktop.
- Review `git diff` and `git status --short` before committing.
- The established project workflow is to commit coherent completed work and push `main` after verification unless the owner says otherwise.
- Report the outcome, verification performed, commit, and push status concisely in Swedish.

## Definition of done

A change is complete only when the applicable items are true:

- The requested behavior works through the real runtime path, not only in editor metadata or prose.
- Game copy is English, player-facing, consistent, and uses game-owned UI.
- Combat state changes occur at the correct presentation event.
- Action queue, multi-action turns, saves, and mobile layout remain intact.
- Reusable mechanics use the shared feature architecture.
- Effective ability descriptions/costs/cooldowns reflect unlocked modifiers.
- Relevant docs and content counts are updated.
- `npm run build` passes.
- Focused browser or smoke verification covers the risky behavior.
- No generated build output, temporary files, or unrelated edits are included.
- The verified change is committed and pushed when requested by the established workflow.

## Current content baseline

At the time of this handoff:

- The Ashen Road is the four-step story adventure.
- Shadow Proving Grounds is the endless testing adventure with two or three 100-Health DUMMIES per fight and two level-ups per victory.
- Shadow is the first complete talent branch.
- Arcanist is implemented through `talent_156`, including Fire, Frost, Lightning, Arcane, Barrier, self-Burn, Frozen Path, Conductor, Arcane Wound consumption, frost-control combinations, Electrified-chain mechanics, and Elemental Fury with active-ability VFX.
- Brute and Cultist currently have only their class nodes.
- The newest status in the catalog is Charged Up, a combat-only stackable buff that grants +2 Initiative per stack.

Use `docs/CONTENT_REFERENCE.md` rather than this summary for exact live values and the full catalog.
