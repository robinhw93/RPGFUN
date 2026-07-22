# Emberfall architecture

## Architectural goals

The project is a browser-only vertical slice optimized for rapid content iteration and mobile play. The architecture separates rules from presentation so combat results remain coherent while UI animation, floating text, and touch interaction evolve independently.

Primary rules:

- Game modules calculate outcomes; React renders and schedules presentation.
- Content is data-driven where a stable general contract exists.
- Damage, statuses, turns, and HP become visible at the event that describes them.
- Saved IDs remain stable and old state is normalized at the boundary.
- Game-owned UI replaces browser-native prompts, confirmations, and tooltips.

## Runtime layers

```text
React UI and interaction (App.tsx, components)
                |
                v
Application actions and event sequencer
                |
                v
Pure-ish game transitions (engine, gear, rewards, progression)
                |
                v
Content and rules (data, statuses, combat features, math)
                |
                v
Browser localStorage and static assets
```

There is no server authority. React owns the current `GameState`, and every non-defeat update is automatically serialized to browser storage.

## Module ownership

### Application and UI

- `src/App.tsx` owns top-level React state, navigation, character creation, adventure progression, event choices, reward presentation, runtime talent interaction, character/inventory interaction, and the high-level commands sent to game modules.
- `src/hooks/useCombatActionQueue.ts` owns the transient player-input queue, reserves Energy and cooldowns for queued abilities, captures targets, and dispatches one action whenever the presentation sequencer is ready.
- `src/hooks/useCombatEventSequencer.ts` schedules visible combat events and applies their pending state effects at the correct message/impact time.
- `src/components/FloatingCombatText.tsx` presents the event queue and reports when each entry appears and when the sequence completes.
- `src/components/GameConfirmDialog.tsx` owns game-styled confirmation UI.
- `src/components/GearSlotIcon.tsx` maps item classification to static gear artwork.
- `src/components/TalentDevtool.tsx` owns the isolated developer draft model and export workflow; it does not mutate live game content.
- `src/styles.css` owns responsive presentation and animation. Rules must not be implemented through CSS-only state.

### Domain and content

- `src/game/types.ts` is the shared domain schema.
- `src/game/data.ts` is the canonical static catalog for abilities, talents, tree canvas, enemies, items, set thresholds, and adventure nodes.
- `src/game/statusEffects.ts` is the canonical status catalog and owns generic status stacking, duration, multipliers, ticking damage, and healing formulas.
- `src/game/avatars.ts` owns the appearance catalog and normalization.

### Rules and transitions

- `src/game/engine.ts` owns combat creation, initiative, turn movement, targeting, abilities, enemy behavior, status timing, procs, pending effects, and outcomes.
- `src/game/character.ts` is the only module that converts base attributes plus equipment/set/talent passives into `DerivedStats`.
- `src/game/combatMath.ts` owns opposed Hit/Dodge rules and caps.
- `src/game/combatFeatures.ts` aggregates data-driven gear, set, and talent combat features.
- `src/game/talentRequirements.ts` owns bidirectional ANY-connection evaluation for both UI state and unlock authorization.
- `src/game/gear.ts` owns slot compatibility, hand classification, equip/unequip transfer, item category normalization, and loot selection.
- `src/game/progression.ts` owns experience thresholds and level rewards.
- `src/game/rewards.ts` applies a combat reward exactly once and stores the immutable score-screen snapshot.
- `src/game/combatSequence.ts` owns small presentation-queue predicates shared by UI.
- `src/game/initiativeLayout.ts` owns pure FLIP geometry for initiative cards.
- `src/game/timing.ts` is the source of truth for combat/initiative presentation durations.
- `src/game/save.ts` owns storage and migration.

## State model

`GameState` contains:

- `characterCreated`: whether creation has completed.
- `character`: persistent identity, progression, inventory, equipment, talents, and ability loadout.
- `adventure`: current node, carried Health, combat, event state, reward snapshot, loot, and completion.

`CombatState` contains both authoritative logical results and presentation synchronization state:

- Turn number, sorted initiative entries, active index, per-round acted-actor IDs, and initiative-reveal state.
- Player/enemy Health, Energy, statuses, targeting, and cooldowns.
- `floatingEvents`: ordered player-facing messages for the current sequence.
- `pendingEffects`: state changes indexed to those messages.
- `eventId` and `completedSequenceEventId`: queue-generation identity and completion guard.
- Attack actor/effect IDs and damaged targets for animation.
- Proc usage for once-per-turn and cooldown trigger rules.
- Per-combat death-prevention usage and temporary next-turn Energy regeneration.
- Combat log and active/victory/defeat outcome.

### Immutability

Game actions return new state objects. React state setters call the relevant transition and embed the result back into `GameState`. Avoid mutating saved arrays or nested objects in place; delayed presentation depends on previous visible values remaining intact.

## Character-stat pipeline

`getDerivedStats(character)` performs this order:

1. Clone base attributes.
2. Add equipped item attributes, Armor, Magic Resistance, and direct powers.
3. Resolve all active combat-feature sources.
4. Add talent/set/gear passive attributes and round the five attributes.
5. Add other direct passive values.
6. Calculate derived powers, resources, chances, initiative, Guard/healing multipliers, loot/chance bonuses, status modifiers, and detonation preservation.

UI modules display these results but never reproduce their formulas.

### Stat contract

- Raw Hit Chance and Critical Strike Chance are intentionally uncapped.
- Permanent and temporary Dodge modifiers are combined through the shared combat-math helper, then capped at 50%.
- Blind multiplies the attacker's raw Hit Chance by 0.25 before opposed Hit/Dodge resolution.
- Final Hit Chance is `modified raw Hit - capped Dodge`, clamped to 20–100%.
- Strength and Agility feed Physical Power.
- Intelligence feeds Magical Power.
- Agility contributes 0.5 Initiative per point and Intelligence contributes 0.25 Initiative per point before direct Initiative bonuses.
- Abilities use their relevant derived power exactly once. `scalingStat` remains legacy/category metadata for older definitions and is not independently added to damage.
- All visible stats and initiative values are rounded whole numbers.

## Data-driven combat features

`CombatFeatureBundle` is shared by gear items, set thresholds, and talents. `getCharacterCombatFeatures` collects sources in this order:

1. Equipped gear bundles and set-piece counts.
2. Bundles from unlocked talents.
3. Active set-threshold bundles.

Every resolved trigger/modifier carries source ID, source name, source kind, and a stable runtime ID.

### Passive bonuses

Passives aggregate additively into:

- Attributes and direct derived stats.
- Resources, regeneration, chances, and initiative.
- Guard generation and healing received.
- Bleed reduction, loot rarity, and probabilistic-effect chance.
- Per-status damage bonuses.
- Conditional per-status damage bonuses based on the source's current statuses.
- Status-preservation behavior.
- Status immunities, companion applications, and additional applied stacks.
- Starting combat statuses.
- Energy-based incoming-damage reduction, Stunned-state incoming-damage multipliers, reusable first-lethal-hit prevention, status-consuming death prevention, and guaranteed hits above configured status-stack thresholds.

New generally reusable static bonuses belong in `PassiveBonuses`, not UI conditions or talent-ID branches.

### Triggers

Trigger events are typed as:

```text
combat_start | turn_start | before_ability | on_hit | on_crit |
on_kill | status_applied | status_removed | damage_taken | enemy_missed |
enemy_stunned | turn_end
```

Conditions can filter by ability ID, ability branch, damage type, critical result, minimum damage, source kind, target status, newly applied or removed status, removal reason, damage absorbed by Guard/Barrier, or crossing a target-Health threshold. A trigger can have chance, once-per-turn, and cooldown constraints.

Effect definitions support:

- Flat damage, Physical/Magical Power-scaled damage, trigger-damage ratios, or damage based specifically on Guard/Barrier absorption, targeting self, target, all enemies, or a random enemy.
- Current-Health-percentage damage.
- Status application to those target modes.
- Flat or Max-Health-percentage self healing.
- Self Energy gain.
- Self Guard gain.

Luck's chance-effect bonus is added only to triggers with an explicit `chance` field. Final trigger chance is clamped from 0 to 1. Guaranteed triggers remain guaranteed.

The type contract is slightly broader than the currently emitted engine events. Before adding content for an event, confirm that the engine calls `runPlayerTriggerEvent` at the intended point.

### Damage modifiers

Damage modifiers are conditional multipliers filtered by:

- Damage type.
- Any matching attacker status.
- Any matching target status.

Every matching modifier multiplies the running result. Status-system outgoing/incoming multipliers are a separate later step.

### Status-damage modifiers

Conditional status-damage modifiers add bonuses for named damage-over-time effects while their source has a configured status. They are resolved separately from direct-damage modifiers so talents such as Living Furnace can strengthen Burn on enemies only while the player is Burning, without also changing the player's self-inflicted Burn.

### Ability modifiers

Ability modifiers target one or more ability IDs and currently support:

- Bypassing a required self status.
- Alternative scaling when bypassing that requirement.
- Status duration, magnitude, start-expiration, and Power-scaled stack overrides.
- Replacing or adding status applications.
- Redirecting random multi-hits to the selected target.
- Altering damage gained per target-status stack.
- Pre-healing from the remaining damage of a self status.
- Granting temporary next-turn Energy regeneration.
- Applying a new status after consuming another.
- Retaining a ratio of stacks after detonation.
- Overriding the ratio of target-status stacks consumed.
- Changing Energy costs and cooldowns through additive integer deltas, clamped at zero.

Each mechanical ability modifier may also provide a complete player-facing `descriptionOverride`. `getCharacterAbilityDescription` resolves description changes, while `getCharacterAbilityEnergyCost` and `getCharacterAbilityCooldownTurns` resolve numerical rule changes. Combat execution, action-queue projection, combat buttons, talent details, the loadout picker, and inspectable combat-log entries use these shared paths instead of reading character-owned base values directly.

This is the preferred extension point for talents that transform an existing ability, such as Maneuvers, Reapply, Enduring Evasion, and Longevity.

## Combat transition model

### Creation and normalization

`createCombat` builds enemy instances, initializes Energy/statuses, rolls initiative, and applies starting statuses. `ensureCombatState` repairs older saved combats by adding missing fields, normalizing definitions while preserving status-specific magnitude and expiration timing, rounding legacy initiative values, correcting selection, and recreating initiative when absent.

### Turn order

Base order is descending effective initiative. Exact player/enemy ties favor the player; remaining ties use actor ID. Slowed sets effective initiative to 0. Permanent combat Initiative stacks such as Charged Up are added by the same effective-initiative helper, so `reorderCombat` moves the affected combatant when the pending status application resolves and the turn-order row displays the updated whole number.

`actedActorIds` records every combatant that has finished a turn in the current round. `moveToNextActor` always chooses the highest-initiative living combatant not in that set and clears the set only when a new round begins. Dynamic reordering therefore cannot give a Slowed combatant a second action after it has already acted.

`moveToNextActor`:

1. Detects defeat or victory.
2. Finds the next living actor.
3. Advances the combat round counter when wrapping.
4. Queues the next actor's turn announcement.
5. Prepares player-turn start effects and regeneration when applicable.

The visible active index remains unchanged until the queued turn event resolves.

### Ability use

`useAbility` validates turn, outcome, Energy, cooldown, targets, and status requirements. It then:

1. Captures visible Health/status snapshots.
2. Resolves active ability modifiers.
3. Spends Energy and starts cooldown.
4. Emits the ability-use message.
5. Runs `before_ability` triggers.
6. Resolves self utility, status consumption/detonation, or direct hit loops.
7. For direct hits, rolls Hit, Critical, component damage, status application, conditional self benefits, on-hit/on-crit/on-kill triggers, and Reckless recoil.
8. Applies any ability-owned self statuses.
9. Resolves player Bleed and reusable lethal-damage prevention after the ability.
10. Returns logical resource/cooldown changes immediately but preserves visible Health/status snapshots until pending events resolve.

Non-damaging `all_enemies` status abilities use one shared event index for every target. This keeps their status applications, presentation metadata, and floating text synchronized as a single area effect rather than a target-by-target sequence.

Every ability also owns a `range` classification. A direct `melee` hit primes the existing attacker lunge. A direct `ranged` hit primes transient projectile metadata instead, leaving the player card stationary; the projectile travels from the attacker to the stored target and its duration is derived from the same impact timing as the pending damage. The impact still resolves through the normal pending-effect event, so misses, multi-hits, queued abilities, and death ordering do not depend on CSS completion. Ability-specific `vfx` selects the preferred projectile treatment, while damage type supplies a reusable fallback. Conditional no-debuff status applications are evaluated against the target snapshot before the hit adds statuses.

Using an ability sets `playerActed` but does not move turn order. The player may continue using affordable ready abilities until calling `endPlayerTurn`.

React keeps player inputs in a transient FIFO queue that is deliberately excluded from saved `GameState`. Ability buttons remain interactive while an earlier action animates. Queue projection reserves Energy, the free Distraction cast, cooldowns (including Focus resets), target status stacks, and conditional no-debuff applications, so the UI cannot enqueue a sequence that is already known to be unaffordable or unavailable. Each ability stores the selected target at click time; if that target is no longer valid when the action reaches the front, normal targeting rules retain the current valid target. **End Turn** can be appended once and closes the queue to later abilities. The dispatcher waits for the current combat sequence and attack return animation, executes one action, then waits again before taking the next FIFO entry.

### Enemy turns

`takeEnemyTurn` runs start statuses, regenerates Energy, handles insufficient Energy/Stealth, rolls the attack, applies defense/Guard/status effects, runs player `damage_taken` triggers, resolves enemy Bleed and Poison, then calls `moveToNextActor`. It snapshots visible enemy statuses and queues a reconciliation at the final status event, preventing duration changes or removals from appearing before their damage or skip effect resolves. Enemy-to-enemy and player-to-enemy turn transitions reuse the preceding sequence's final event instead of adding a standalone enemy-turn message.

Enemy AI currently has one fixed attack per enemy template and no ability selection tree.

## Combat timing contract

Combat rules often calculate a future result before the player sees it. The visible state must remain at the pre-result snapshot until the matching message.

### Pending effects

Each pending effect has an `eventIndex` into `floatingEvents`:

- `damage`
- `heal`
- `status`
- `remove_status`
- `set_status`
- `energy_regen_bonus`
- `passive_text`
- `ability_vfx`
- `turn`

When `FloatingCombatText` reveals an index, the sequencer resolves all effects attached to that index.

Resolved status effects also produce short-lived `statusAnimations` presentation metadata. Poison uses it to pulse the receiving combatant green, while Electrified flashes its target yellow with a local lightning overlay. Contagion includes the source combatant ID on its queued status effect, allowing the UI to measure the live source and destination icons and animate a copied Poison icon between them without coupling animation code to combat rules. Damage effects may carry a `sourceLabel`; resolution exposes it through transient `damageSourceLabels` so Health bars can distinguish status damage from ordinary attacks without parsing combat text. Passive and on-hit triggers similarly emit `passiveAnimations` targeted at the affected combatant. These local effects are not sequencer events, so their CSS animation never blocks combat input or extends a turn.

Abilities may declare a data-driven `vfx` kind. Resolution converts its `ability_vfx` pending effect into transient `abilityAnimations` metadata at the same event or attack impact as the mechanical result. Shadow abilities use this for smoke, flash, burst, transfer, and healing presentation. Arcanist abilities use the same event metadata for projectile paths and distinct Arcane, Frost, Fire, and Lightning impacts. The UI owns all of this presentation; none of these animations adds sequencer time. Status-application overlays are keyed by pending-effect ID rather than only a persistent CSS class, so refreshing an existing status reliably restarts its local application effect.

### Direct-attack two-phase contract

Direct attack damage has two presentation phases:

1. `primeCombatAttack` runs as the damage message appears, marks the attacker, and starts the backstep/charge animation.
2. After `attackImpactMs`, `resolveCombatEvent` applies damage, wakes Sleep or Frozen when relevant, marks the damaged target, and updates the HP bar.

Statuses attached to that same event index resolve at impact with damage. Non-attack effects resolve as soon as their floating message appears.

Pending effects sharing an event resolve in insertion order. A consume-and-reapply ability must therefore queue removal of the consumed status before its replacement status; otherwise the removal would erase the newly applied copy at presentation time.

Multi-hit abilities attach their total hit count to every direct-damage event. The sequencer divides animation duration and impact delay by that count, while `getCombatEventDurationMs` gives each direct-hit message the same shortened slot. This removes normal floating-message waits between hits and keeps the complete hit sequence within one normal attack-duration budget. `attackAnimationId` alternates equivalent CSS keyframes so consecutive hits by the same combatant always restart the lunge animation.

An ability may apply a presentation-only duration multiplier to that complete sequence. Flurry and Slice and Dice currently use `1.4`, making their five- and six-hit sequences 40% longer while leaving damage, hit timing order, and other multi-hit abilities unchanged.

Attack impact and animation completion are separate lifecycle points. Damage resolves at impact, while the attacker stays animated until the full return movement completes. A turn handoff attached to a damage event must therefore preserve the current attacker until the sequencer's animation-completion timer releases it.

Never update visible target HP/status early to simplify an animation; doing so breaks the event rhythm and can show victory before the final blow.

### Current combat timing

From `src/game/timing.ts`:

| Timing | Value |
| --- | ---: |
| Floating message slot | 1800 ms |
| Full attack animation | 730 ms |
| Attack impact after message | 320 ms |
| Turn-order reorder | 480 ms |

`eventId` prevents stale timers from resolving into a newer action sequence. `completedSequenceEventId` prevents score screens or enemy automation from advancing before all current messages complete.

## Initiative presentation

Initiative uses precomputed `TurnOrderEntry` values containing raw roll, bonus, and final initiative. The UI only presents the roll; it does not reroll or reorder combat.

Runtime changes to effective Initiative, such as Slowed setting a combatant to 0, reorder the rules state immediately. `TurnOrderBar` uses stable actor IDs and FLIP position measurements to animate the existing cards from their previous screen positions into the new responsive order.

Current milestones:

| Milestone | Time from start |
| --- | ---: |
| Counter tick interval | 45 ms |
| Raw rolls lock | 1600 ms |
| Bonuses shown/applied | 3700 ms |
| Final order phase | 5800 ms |
| Card flight duration | 1400 ms |
| Initiative presentation complete | 7600 ms |

`initiativeLayout.ts` measures real source and target rectangles. FLIP transforms include translation and scale from the source card to its final turn-order slot. This avoids the desktop-only snap/shrink bug caused by assuming natural row widths.

The initiative grid receives the live combatant count through a CSS variable. Two to four contestant cards therefore resize into one row before the FLIP flight begins, including three-enemy encounters on narrow screens.

## Adventure and reward flow

`AdventureProgress` stores the active adventure mode and carried Health independently of active combat. `story` uses the finite `ADVENTURE` node list; `endless` uses the dynamic Shadow Proving Grounds encounter.

- `beginAdventure` creates the first combat at Max Health.
- Victory triggers `grantCombatReward` through a React effect.
- Reward identity plus node index prevents duplicate application.
- The score screen reads `pendingReward`, which records before/after level and XP values even though the character has already received the reward.
- Continuing carries final Health into the next combat or event.
- The event modifies carried Health or talent points.
- Completing the final node clears active combat and marks the adventure completed.

The endless route generates two or three `dummy` enemy IDs before each travel transition, then reuses that exact group when creating combat so the encounter message and battlefield agree. It increments `nodeIndex` as an unbounded fight counter, restores the character to current Max Health, and never marks the adventure completed. `grantCombatReward` calculates the exact XP needed to cross two complete level thresholds from the character's current level and XP; normal story rewards still come from the node definition. The `unlockTalent` state boundary also treats `endless` as a test-only free-unlock mode: it enforces connections and the combat lock but skips both the point check and point deduction.

Travel transitions are UI-only timing; they do not modify rules until `advanceJourney` executes.

## Gear transaction rules

Equip and unequip helpers return a new `CharacterState` and transfer item objects between inventory and equipment.

- Equipping a replacement pushes the previous item into inventory.
- Equipping a Two-Hand item clears both hand slots into inventory before placing it in Main Hand.
- Off Hand is locked while Main Hand contains a Two-Hand item.
- One-Hand items accept an explicit preferred hand, otherwise the helper chooses an available hand.
- Ring placement accepts an explicit ring slot, otherwise it chooses the first empty ring, then Ring I.

The UI may preview and compare, but only these helpers authorize the transaction.

## Talent prerequisites and runtime tree

`areTalentRequirementsMet` is shared by visual availability and the actual unlock action:

- `getTalentConnectionIds` treats every stored edge as undirected by combining a node's own `requires` IDs with every node that references it.
- A node with no adjacent connections is available.
- Every node uses `some`: any one unlocked adjacent node makes it available.

Each edge should be stored once. The runtime tree draws that one line, while availability and modal requirement text work from either end. The Talent Editor presents the checkbox as connected from both node perspectives, removes either stored orientation when disconnected, and normalizes duplicate reciprocal edges on load.

The runtime tree derives its minimum bounding box from node world positions inside `TALENT_TREE_CANVAS`, then adds padding. It pans by scroll offset and zooms a scaled world surface between 20% and 160%. Fit uses the available viewport. The editor has independent zoom/canvas rules.

Connections render in an SVG layer with shape-aware black cutouts in a user-space mask for every node position. The lines therefore cannot show through nodes even when locked nodes use whole-element transparency. Circular passive nodes render at 75% of the square-node diameter, while unlocked nodes use a gold outer outline independent of branch color.

Ability-slot selection is an explicit indexed state transaction. Occupied slots can replace or swap abilities; removing a slot compacts the loadout, and empty selections append without creating sparse array entries. The picker only exposes core abilities and abilities granted by unlocked talents.

## Talent Editor isolation

The editor owns a `TalentDraft`, not live `Talent[]` data. Its storage keys are:

```text
emberfall.talent-devtool.v1
emberfall.talent-devtool.snap-to-grid
```

The draft is initialized from live content only when no valid stored draft exists. After that, browser-local draft data wins. Older drafts are normalized on load: obsolete requirement-mode data is discarded, duplicate reciprocal edges are collapsed, and ability Energy/cooldown fields are inferred from live definitions or older notes when absent. Save is an explicit repeat of the automatic local write. Copy/Export serialize a versioned JSON exchange format without a requirement-mode field.

Canvas positions are percentages, but grid spacing is stored as fixed world units. When nodes approach an edge, `ensureCanvasRoom` expands that side and recalculates percentages so existing absolute alignment remains stable.

An exported draft is design input. Advanced effect notes are not executable until translated into ability/status/combat-feature definitions.

## Save boundary and migration

The game save key is `emberfall-save-v1`.

`loadGame` is a defensive boundary:

- Invalid JSON returns no save.
- Removed talent IDs are filtered and known costs refunded.
- Equipped abilities are restricted to core abilities and abilities granted by still-unlocked talents.
- Item metadata is hydrated from current definitions.
- Invalid legacy Two-Hand plus Off Hand combinations are repaired.
- Avatar, stat points, and pending rewards receive fallbacks.
- Missing adventure mode is normalized to `story`.

`ensureCombatState` performs the separate in-combat migration because combat definitions and animation fields evolve more frequently.

On defeat, `clearSave` runs instead of `saveGame`. Reset also clears the save and returns to a deep clone of `INITIAL_GAME`.

## UI contracts

- All player-facing copy is English and uses player vocabulary.
- Internal rule labels such as “Hit rule” must not appear in player UI.
- Browser-native `alert`, `confirm`, and `prompt` are forbidden.
- HTML `title` tooltips are forbidden for game interaction.
- Short hints use the game-owned `data-game-tooltip` system.
- Detailed touch/click information uses game-owned modals.
- Tap and long-press must remain distinguishable for combat abilities.
- Opening a detail/choice modal must lock background scrolling and restore the prior scroll position.
- Combatant cards require stable React keys so HP interpolation and local hit/heal animations do not remount.
- Combat must remain usable without page scrolling at mobile breakpoints.
- Dead enemy cards remain mounted, grayed out, and untargetable.
- Armor is a derived defense, not a visible combat status icon.
- Character-screen raster assets are decoded through a shared preload cache before the screen renders; a game-owned loading screen covers a cold cache.
- Combat ability cards always show their content icon, Energy cost, and base cooldown with an hourglass. Keyboard-slot numbers are not displayed.
- Status duration rings always reserve three fixed segments; elapsed segments become empty.
- Animations that land on persistent UI must measure real destination geometry.

## Extension checklist

### New derived stat

1. Add it to the relevant types.
2. Add its passive accumulation contract.
3. Calculate it in `character.ts`.
4. Use it in rule modules, not UI.
5. Add a stat icon and player-facing tooltip/summary if displayed.
6. Add save fallbacks if persisted.
7. Update game systems and content documentation.

### New status

1. Extend `StatusEffectId`.
2. Add `STATUS_EFFECTS` metadata.
3. Add its combat icon.
4. Add generic or special timing/mechanics.
5. Ensure queued application/removal matches floating text.
6. Add it to the Content reference.

### New talent effect

Prefer, in order:

1. Existing passive bonus.
2. Existing trigger/effect combination.
3. Existing damage modifier.
4. Existing ability modifier.
5. A new general data contract and engine handler.

Avoid checking a talent ID directly inside damage or UI code unless the behavior genuinely cannot be generalized.

### New persistent field

1. Add it to the type.
2. Initialize fresh state.
3. Normalize old saves.
4. Preserve immutable state transitions.
5. Test refresh during the affected screen or combat phase.
