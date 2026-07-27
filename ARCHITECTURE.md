# Arkenfall architecture

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
React UI and interaction (App.tsx, screen components)
                |
                v
Application actions and event sequencer
                |
                v
Pure-ish game transitions (combat modules, gear, rewards, progression)
                |
                v
Content and rules (content catalogs, statuses, combat features, math)
                |
                v
Browser localStorage and static assets
```

There is no server authority. React owns the current `GameState`, and every non-defeat update is automatically serialized to browser storage.

## Module ownership

### Application and UI

- `src/App.tsx` owns top-level React state, navigation, application orchestration, and the high-level commands sent to game modules. It lazy-loads the talent screen and developer tools so those large editing surfaces are absent from the initial bundle.
- `src/components/character/` owns character creation, the starting-class selection screen, and the Character and Equipment/Inventory screens. Its class selection reads the canonical class Talent and ability definitions, while its gear-detail modal is also reused by loot, merchant, town-shop, Sell-list, and quest-reward surfaces so item rules and equipped-item comparison remain visually consistent. Score-screen Inventory loot exposes its normal Equip actions; merchant, shop, Sell-list, and quest-reward inspection remains read-only.
- `src/components/adventure/` owns adventure selection, combat-screen composition, score screens, the cinematic event sequence, and the mandatory flee-loss acknowledgment shown before returning to town. `EventPresentation.tsx` reveals the title, scenario, choices, precomputed d100 result, derived-stat bonus, narrative result, and a structured Outcome panel in order without recalculating the event rule; direct merchant choices reveal their resolved text and stock together while retaining any additional applied changes in that same Outcome treatment.
- `src/components/town/` owns the illustrated Arkenfall main hub and its Adventures, Shops, Tavern and Inn, Quest Board, and Grand Arena destinations. Shops owns the Blacksmith/Alchemist/Tailor/Leatherworker/Jeweler submenu and each vendor's Shop/Craft/Sell tabs, recipe/material presentation, shared centered floating confirmations for successful purchases, crafting, sales, and meals, inline error feedback, tavern rest and gambling presentation, Quest Board, and the arena challenge/leaderboard menu. Quest reward items reuse the town item-detail dialog so their live stats remain inspectable before acceptance.
- `src/components/combat/` owns the combat HUD, initiative presentation, and transient combat/VFX renderers.
- `src/components/talents/` owns the runtime talent tree, talent details, and ability-loadout dialogs.
- `src/ui/gameUi.tsx` owns shared presentation helpers such as stat/ability icons, the global rarity-based item-name class, encounter wording, asset preloading, and display-only derived-stat rows.
- `src/hooks/useCombatActionQueue.ts` owns the transient player-input queue, projects abilities and consumable counts/effects, captures targets, and dispatches one action whenever the presentation sequencer is ready.
- `src/hooks/useCombatEventSequencer.ts` schedules visible combat events and applies their pending state effects at the correct message/impact time.
- `src/components/FloatingCombatText.tsx` presents the event queue and reports when each entry appears and when the sequence completes.
- `src/components/GameConfirmDialog.tsx` owns game-styled confirmation UI.
- `src/components/GearSlotIcon.tsx` maps item classification to static gear artwork.
- `src/components/ItemIcon.tsx` presents item-specific artwork across equipment, inventory, combat consumables, merchants, loot, and detail dialogs while retaining category fallbacks for unmapped drafts.
- `src/components/TalentDevtool.tsx` owns the isolated talent draft model and export workflow. Existing ability Energy costs use debounced live writes while editing and flush on blur. Existing talent tooltips plus referenced live-ability tooltips, cooldown, Flat Damage, and Physical/Spell Power scaling totals call the restricted local source-sync route when their fields lose focus.
- `src/components/ContentDevtools.tsx` is the compatibility facade for `src/components/devtools/`. The submodules separately own the launcher/shared draft contracts and Enemy, Event, Adventure, Item, and Quest editors. Quest Editor owns complete quest/questline drafts, ordered questline membership, the three live goal types, and XP/item rewards. The launcher also exposes saved-character test actions; `src/game/developerTools.ts` owns their pure level/item transitions while `App.tsx` applies them to the active game state. Existing-enemy numeric stat and drop-table edits call restricted local source-sync routes. Enemy, Event, Adventure, Item, and Quest Save validate and replace their complete live catalogs while the local Vite server is running; Enemy Save includes executable abilities, conditional damage bonuses, and data-owned tactical AI.
- `src/components/PortraitDevtool.tsx` owns the isolated enemy/player artwork selection and normalized square portrait-crop workflow.
- `src/styles.css` owns responsive presentation and animation. Rules must not be implemented through CSS-only state.
- `vite.config.ts` contains only Vite composition and server settings. `tools/vite/localSourceSync.ts` owns the development-only source-sync plugin. Narrow routes accept known numeric enemy fields, validated existing-enemy drop tables, or known tooltip/Energy/cooldown/Flat-Damage/Power-scaling fields for existing canonical talent/ability pairs. Catalog routes validate complete Event, Adventure, Item, or Quest exchanges, including cross-catalog references, before replacing only the matching initializer in its canonical content module. All source mutations share a queue so rapid edits cannot overwrite one another.

### Domain and content

- `src/game/types.ts` is the shared domain schema.
- `src/game/data.ts` is the stable public content facade. Canonical definitions live in responsibility-specific modules under `src/game/content/`: abilities, talents/tree canvas, enemies, gear/set thresholds, adventures/events, and quests/questlines.
- `src/game/statusEffects.ts` is the canonical status catalog and owns generic status stacking, duration, multipliers, ticking damage, and healing formulas.
- `src/game/combatStats.ts` projects the temporary status adjustments used by combat onto player/enemy stat readouts, keeping inspection values aligned with resolution rules.
- `src/game/avatars.ts` owns the appearance catalog, full-figure and combat-portrait asset mapping, and normalization.

### Rules and transitions

- `src/game/engine.ts` is the stable public combat facade. `src/game/combat/` separates state creation/normalization, event queues, damage, turn flow and triggers, player actions, enemy actions, and presentation-time resolution. Callers continue importing the public transitions from `engine.ts`.
- `src/game/character.ts` is the only module that converts base attributes plus equipment/set/talent passives into `DerivedStats`.
- `src/game/combatMath.ts` owns opposed Hit/Dodge rules and caps.
- `src/game/combatFeatures.ts` aggregates data-driven gear, set, and talent combat features.
- `src/game/talentRequirements.ts` owns bidirectional ANY-connection evaluation for both UI state and unlock authorization.
- `src/game/gear.ts` owns slot compatibility, hand classification, equip/unequip transfer, and item category normalization.
- `src/game/items.ts` owns the explicit gear, consumable, and ordinary-item classification plus prices, inventory grouping, shared item acquisition with automatic empty-slot equipping, consumable counts/removal, and effect descriptions. `src/game/consumables.ts` translates standard consumable effects into presentation-timed combat effects without ending the turn.
- `src/game/itemScaling.ts` owns Item Editor's pure, non-persistent gear comparison index, its centralized stat weights, contribution breakdown, excluded-effect detection, and same-slot ranking.
- `src/game/itemIcons.ts` maps stable live item IDs to their generated, optimized artwork under `public/assets/items/` and exposes that complete artwork library to Item Editor pickers. Consumables and Other Items persist an optional selected item-art URL; explicit editor selections override their legacy ID mapping at presentation time.
- `src/components/GearSlotIcon.tsx` owns gear-art fallback resolution and the complete generated gear-icon catalog. Item Editor asks it for the current slot or weapon-kind category, so its picker remains focused while the global URL list still preloads and validates every icon.
- `src/game/progression.ts` owns experience thresholds and level rewards.
- `src/game/developerTools.ts` owns pure developer-only character transitions. `levelUpCharacterForTesting` advances exactly one normal level through `progression.ts`; `grantItemForTesting` adds 1-99 deep-cloned copies of a caller-validated live item.
- `src/game/rewards.ts` independently rolls every row of every defeated, non-escaped enemy instance's drop table plus every current-stage drop-table row, including repeated rows for the same item, applies a combat reward exactly once, transfers found items into inventory, excludes escaped enemies from kill-quest progress, and stores the immutable score-screen snapshot.
- `src/game/arena.ts` owns the safe Arena Champion session, attempt lock/reset, actual-damage Experience reward, top-ten personal records, early trial completion, and restoration of pre-trial carried Health. `src/game/content/arena.ts` owns its hidden combat definition and artwork mapping without adding it to the story-adventure catalog.
- `src/game/flee.ts` owns the pure flee transition: randomized Gold and equipped-item loss, retained combat Health, and complete active-adventure abandonment back to stage one.
- `src/game/quests.ts` owns quest availability, the six-posting Quest Board projection, the six-active-quest cap, sequential questline gates, objective progress, item hand-in, XP/item rewards, enemy-defeat tracking, and completed-adventure tracking. Kill and adventure progress begins only after acceptance; collect-item progress is derived from current Inventory.
- `src/game/eventOutcomes.ts` normalizes legacy event outcomes, resolves checked or direct choices, applies typed effects, stores the exact applied resource/item/status/encounter changes for resumable Outcome presentation, persists per-item event-merchant sold-out state, and owns atomic single-stock purchases and one-copy inventory sales.
- `src/game/town.ts` resolves editor-owned vendor/recipe data, independent completed-adventure gates for shop stock and recipes, legacy town defaults, ingredient counts, atomic repeatable vendor purchases, exact material consumption, crafted-item grants, one-copy Inventory sales at the shared sell value, full or budget-limited tavern recovery, purchased meal buffs queued for the next combat, and persistent Luck-based tavern wagers with concealed escalating difficulty.
- `src/game/combatSequence.ts` owns small presentation-queue predicates shared by UI.
- `src/game/initiativeLayout.ts` owns pure FLIP geometry for initiative cards.
- `src/game/timing.ts` is the source of truth for combat, initiative, and adventure-event presentation durations.
- `src/game/save.ts` owns storage and migration.

## State model

`GameState` contains:

- `characterCreated`: whether creation has completed.
- `characterIntroductionStep`: the saved new-character route through class selection, the first connected Talent, starting Attributes, and the optional starting-item recommendation in Town. Older saves normalize safely around the current step.
- `character`: persistent identity, progression, inventory, equipment, talents, ability loadout, accepted/completed quest IDs, non-item quest progress, and the tavern's current gambling-pressure counter.
- `adventure`: current node, carried Health, combat, event state, reward snapshot, loot, and completion.

`CombatState` contains both authoritative logical results and presentation synchronization state:

- Turn number, sorted initiative entries, active index, per-round acted-actor IDs, the active enemy's resolved-action count, and initiative-reveal state.
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
- Strength contributes 0.5 Physical Power per point and Agility contributes 0.25 Physical Power per point.
- Intelligence contributes 0.5 Spell Power per point.
- Agility contributes 0.5 Initiative per point and Intelligence contributes 0.25 Initiative per point before direct Initiative bonuses.
- Abilities use their relevant derived power exactly once. `scalingStat` remains legacy/category metadata for older definitions and is not independently added to damage.
- All visible stats and initiative values are rounded whole numbers.

## Data-driven combat features

`CombatFeatureBundle` is shared by gear items, set thresholds, and talents. `getCharacterCombatFeatures` collects sources in this order:

1. Equipped gear bundles and set-piece counts.
2. Bundles from unlocked talents.
3. Active set-threshold bundles.

Every resolved trigger/modifier carries source ID, source name, source kind, and a stable runtime ID.

Every player ability resolves a whole-number `flatDamage` value. Direct hits add it once to the primary damage component before Critical Strike, damage modifiers, and defense; multi-hit abilities add it to every separate hit. Direct-damage abilities may also store editor-owned total `physicalPowerScaling` and `spellPowerScaling` values. When present, combat distributes each total proportionally across that Power type's existing damage components, preserving hybrid and multi-element damage schools. A newly added Power type uses Physical or generic Spell Damage. Dynamic stack-derived damage keeps its dedicated scaling path.

Status-stack scaling has two distinct reusable forms. `damagePerTargetStatusStack.multiplier` increases the completed direct-damage result per stack, while `damagePerTargetStatusStack.powerScaling` adds that many percentage points of the primary damage component's relevant Power scaling per stack. Ability modifiers can add to either value independently, so player-facing wording such as “10% more damage” and “an additional 10% of Spell Power” remain mechanically distinct.

### Passive bonuses

Passives aggregate additively into:

- Attributes and direct derived stats.
- Resources, regeneration, chances, and initiative.
- Guard generation and healing received.
- Bleed reduction, loot rarity, and probabilistic-effect chance.
- Per-status damage bonuses.
- Conditional per-status damage bonuses based on the source's current statuses.
- Status-preservation behavior.
- Status immunities, guaranteed and chance-based companion applications, and additional applied stacks.
- Starting combat statuses, Max-Health-scaled Guard/Barrier, and full-Health combat-start self damage that bypasses absorption.
- Energy-based incoming-damage reduction, Stunned-state incoming-damage multipliers, reusable first-lethal-hit prevention, status-consuming death prevention, and guaranteed hits above configured status-stack thresholds.
- Percentage Armor bonuses, applied after flat and Strength-derived Armor.

New generally reusable static bonuses belong in `PassiveBonuses`, not UI conditions or talent-ID branches.

### Triggers

Trigger events are typed as:

```text
combat_start | turn_start | before_ability | on_hit | on_crit |
on_kill | damage_dealt | status_applied | status_removed | status_damage | health_restored |
guard_gained | damage_taken | enemy_missed | enemy_stunned | turn_end
```

Conditions can filter by ability ID, ability branch, damage type, critical result, minimum damage, source kind, target status, newly applied or removed status, removal reason, damage absorbed by Guard/Barrier, the source ability of a depleted absorption status, or crossing a target-Health threshold. A trigger can have chance, once-per-turn, once-per-combat, and cooldown constraints.

Effect definitions support:

- Flat damage, Physical/Spell Power/Armor-scaled damage, trigger-damage ratios, or damage based specifically on Guard/Barrier absorption, targeting self, target, all enemies, or a random enemy.
- Current-Health-percentage damage.
- Status application to those target modes.
- Flat, trigger-damage-ratio, or Max-Health-percentage self healing.
- Self Energy gain.
- Temporary next-turn Energy regeneration.
- Self Guard or Barrier gain, including trigger-damage-ratio scaling.

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
- Conditional applications and target-status-stack-derived applications.
- Redirecting random multi-hits to the selected target.
- Altering damage gained per target-status stack.
- Scaling direct damage by living enemies carrying a configured status.
- Pre-healing from the remaining damage of a self status.
- Granting temporary next-turn Energy regeneration.
- Overriding successful-hit healing or regeneration and triggering target status damage after a stack threshold.
- Applying a new status after consuming another.
- Retaining a ratio of stacks after detonation.
- Overriding the ratio of target-status stacks consumed.
- Changing Energy costs and cooldowns through additive integer deltas, clamped at zero.
- Retaining target statuses during consume-style benefits, adding Spell Power to self-Guard, and cleansing self debuffs.

Each mechanical ability modifier may also provide a complete player-facing `descriptionOverride`. `getCharacterAbilityDescription` resolves description changes, while `getCharacterAbilityEnergyCost` and `getCharacterAbilityCooldownTurns` resolve numerical rule changes. Combat execution, action-queue projection, combat buttons, talent details, the loadout picker, and inspectable combat-log entries use these shared paths instead of reading character-owned base values directly.

This is the preferred extension point for talents that transform an existing ability, such as Maneuvers, Reapply, Enduring Evasion, and Longevity.

## Combat transition model

### Creation and normalization

`createCombat` builds enemy instances, initializes Energy/statuses, rolls initiative, and applies starting statuses. `ensureCombatState` repairs older saved combats by adding missing fields, normalizing definitions while preserving status-specific magnitude and expiration timing, rounding legacy initiative values, correcting selection, and recreating initiative when absent.

Status application uses the shared status-library guard before mutating or projecting state. Diminishing Returns blocks Stunned across direct abilities, triggers, copied statuses, self applications, Electrified, and queued-action projection. When Stunned is removed, duration reconciliation inserts Diminishing Returns after the removal so its three-turn duration is not decremented on the same turn.

### Turn order

Base order is descending effective initiative. Exact player/enemy ties favor the player; remaining ties use actor ID. Slowed sets effective initiative to 0. Permanent combat Initiative stacks such as Charged Up are added by the same effective-initiative helper, so `reorderCombat` moves the affected combatant when the pending status application resolves and the turn-order row displays the updated whole number. Pending turn effects identify the acting combatant by stable actor ID and translate that ID back to the current order when the event resolves. Initiative changes can therefore reorder the list without making an actor repeat or lose its turn.

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
6. Resolves self utility, status consumption/detonation, buff removal, cross-target affliction damage, or direct hit loops.
7. For direct hits, rolls Hit, Critical, component damage, status application, conditional self benefits, on-hit/on-crit/on-kill triggers, and Reckless recoil.
8. Applies any ability-owned self statuses.
9. Resolves player Bleed and reusable lethal-damage prevention after the ability.
10. Returns logical resource/cooldown changes immediately but preserves visible Health/status snapshots until pending events resolve.

Non-damaging `all_enemies` status abilities use one shared event index for every target. Damaging area abilities can opt into the same behavior with `simultaneousAreaImpact`. This keeps their damage, status applications, presentation metadata, and floating text synchronized as a single area effect rather than a target-by-target sequence.

Every ability also owns a `range` classification. A direct `melee` hit primes the existing attacker lunge. A direct `ranged` hit leaves the player card stationary and normally primes transient projectile metadata; `rangedPresentation: "target"` instead resolves the ability's VFX directly on the target without a projectile. Projectile duration is derived from the same impact timing as the pending damage. The impact still resolves through the normal pending-effect event, so misses, multi-hits, queued abilities, and death ordering do not depend on CSS completion. Ability-specific `vfx` selects the preferred treatment, while damage type supplies a reusable projectile fallback. Directional VFX metadata preserves the real source and destination for drains and transfers; status-consumption VFX can therefore resolve before a later set of damage impacts without coupling mechanics to animation completion. Conditional no-debuff status applications are evaluated against the target snapshot before the hit adds statuses.

Using an ability sets `playerActed` but does not move turn order. The player may continue using affordable ready abilities until calling `endPlayerTurn`.

React keeps player inputs in a transient FIFO queue that is deliberately excluded from saved `GameState`. Ability buttons remain interactive while an earlier action animates. Queue projection reserves Energy, the free Distraction cast, cooldowns (including Focus resets), target status stacks, and conditional no-debuff applications, so the UI cannot enqueue a sequence that is already known to be unaffordable or unavailable. Each ability stores the selected target at click time; if that target is no longer valid when the action reaches the front, normal targeting rules retain the current valid target. **End Turn** can be appended once and closes the queue to later abilities. Control statuses block queued abilities but not End Turn, allowing a player who self-applies Stunned, Frozen, or Sleep during the active turn to finish it. The dispatcher waits for the current combat sequence and attack return animation, executes one action, then waits again before taking the next FIFO entry.

### Enemy turns

`takeEnemyTurn` runs start statuses and Energy regeneration once, then resolves at most one enemy ability per presentation sequence. `enemyActionsTaken` keeps the active actor in place when its template permits another ready ability, so repeated attacks receive separate text, hit rolls, impact VFX, Energy costs, and Bleed triggers. Poison and duration reconciliation run only when the enemy's final action ends, after which `moveToNextActor` resets the counter. Visible enemy statuses are snapshotted and reconciled at the matching event, preventing duration changes or removals from appearing early. Enemy-to-enemy and player-to-enemy turn transitions reuse the preceding sequence's final event instead of adding a standalone enemy-turn message.

Enemy templates contain separate Physical Power, Spell Power, Starting Energy, Max Energy, and Energy Regeneration plus an ordered list of executable abilities. Missing Starting Energy falls back to Max Energy, while combat creation clamps an explicit value into the valid resource range. Ability damage can use fixed Physical/Spell scaling, a reusable randomly rolled Power-scaling range, or a typed multiplier while the player has one configured status. Reusable utility metadata covers friendly-target healing/statuses, self-healing, immediate self-Energy, Gold theft, and combat escape. Escapes resolve through a pending effect, keep their own presentation, and set `fled` so rewards and kill quests distinguish them from defeated enemies. Energy-depletion self statuses attach to the ability impact, then participate in normal end-of-turn duration and Diminishing Returns handling. Charged enemy abilities persist `chargingAbilityId` through a presentation-timed pending effect: preparation pays Energy and starts cooldown once, forces the current turn to end, and release takes priority on the caster's next turn before clearing the marker at impact.

`EnemyAiProfile` owns executable selection rather than embedding new enemy IDs in the engine. Its ordered rules reference stable ability IDs and AND-combine typed conditions over self/player Health, Energy, self/player/ally statuses, living group size, and optional phase state. If no rule is both true and ready, an explicit ability subset resolves in fixed order or rotates from `lastAbilityId`; a final ready-ability fallback prevents accidental dead turns after editor changes. `takeEnemyTurn` supplies the current logical player snapshot so a setup applied by the first action can unlock a payoff during a multi-action turn. Older named behaviors remain as a compatibility path for early enemies without an AI profile. Active saves reload the canonical ability and AI definitions while preserving a valid last-used ability and charge marker.

The Enemy Editor writes changed numeric stats for existing enemies directly to `src/game/content/enemies.ts` through a development-only Vite route, one edited field at a time so stale browser drafts cannot overwrite unrelated values. Its complete-catalog Save preserves and validates executable abilities, status-linked damage bonuses, tactical rules, condition references, and fallbacks before replacing the initializer. A catalog revision refreshes canonical tactical fields into older browser drafts without overwriting unrelated local stats or drop-table work.

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

Resolved status effects also produce short-lived `statusAnimations` presentation metadata. Poison uses it to pulse the receiving combatant green, while Electrified flashes its target yellow with a local lightning overlay. Contagion includes the source combatant ID on its queued status effect, allowing the UI to measure the live source and destination icons and animate a copied Poison icon between them without coupling animation code to combat rules. Damage resolution exposes the full calculated amount through transient `damageAmounts`, independently of the target's remaining Health, so lethal overkill is visible while HP remains clamped at 0. Effects may also carry a `sourceLabel`; transient `damageSourceLabels` lets Health bars distinguish status damage from ordinary attacks without parsing combat text. Passive and on-hit triggers similarly emit `passiveAnimations` targeted at the affected combatant. These local effects are not sequencer events, so their CSS animation never blocks combat input or extends a turn.

Abilities may declare a data-driven `vfx` kind. Resolution converts its `ability_vfx` pending effect into transient `abilityAnimations` metadata at the same event or attack impact as the mechanical result. Shadow abilities use this for smoke, flash, burst, transfer, and healing presentation. Arcanist abilities use the same event metadata for projectile paths and distinct Arcane, Frost, Fire, and Lightning impacts. Brute abilities use it for fiery, bloody, swift, shield, and holy melee impacts while retaining the normal melee lunge. Barrier absorption emits the same transient metadata to pulse the persistent card shimmer at the exact absorption event. The UI owns all of this presentation; none of these animations adds sequencer time. Status-application overlays are keyed by pending-effect ID rather than only a persistent CSS class, so refreshing an existing status reliably restarts its local application effect.

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

`AdventureProgress` stores the active adventure ID, selected stage-entry ID, mode, carried Health, event-roll result, queued next-combat statuses, a possible immediate event encounter, and combat independently. Story adventures use finite weighted stage definitions; `stageEntryId` locks in a randomly selected possibility so refreshing cannot reroll it.

Starting an adventure uses the same travel-transition contract as advancing a stage: footsteps render first beside the active adventure's editor-owned `travelText`, then the selected story combat entry's Description fades in as an App-owned transient encounter layer. Empty combat descriptions fall back to generated enemy-count wording. Combat is created after the centered introduction, while that same layer slides below the initiative roll. `InitiativeRoll` explicitly signals when its turn-order flight begins so the encounter layer can fade out over the same flight duration. A selected event skips the travel transition's encounter announcement after the footsteps and enters its own full-screen black presentation instead. If an event outcome launches an immediate encounter, it skips the footsteps transition entirely and begins with the generated encounter layer before continuing through the same initiative presentation.

- `beginAdventure` creates the first combat at carried Health, clamped to current Max Health. A new character's null carried value means full Health.
- Victory triggers `grantCombatReward` through a React effect.
- Arena victory or defeat instead triggers `grantArenaChallengeReward`; the mode-specific result is idempotent, records damage and XP, and never rolls normal combat loot.
- Reward identity plus node index prevents duplicate application.
- The score screen reads `pendingReward`, which records before/after level and XP values even though the character has already received the reward. It groups identical loot for presentation. Inspecting a gear drop exposes the shared Equip actions whenever an Inventory copy remains; gear that filled an empty slot automatically is recognized as already equipped and cannot be duplicated. After a level gain, **Level up!** opens a transient focused flow that requires all Talent Points to be spent first and all Attribute Points second before returning to the unchanged score screen; journey progression remains blocked until both balances reach zero.
- Continuing carries final Health into the next combat or event.
- Completing or leaving an adventure preserves carried Health. Only tavern rest (or another explicit healing rule) restores it between adventures.
- Events roll `d100 + the selected derived attribute` against their configured threshold, then apply every effect in the structured success or failure outcome. The resolved roll remains authoritative while `EventPresentation` first fades in and lifts the title, reveals the scenario and label-only choices, then presents the chosen description alongside the cycling d100, locks the raw die, adds the attribute bonus, and finally reveals the narrative outcome. Outcomes can heal or remove Health, add or remove currency/XP, grant points/items, queue player or enemy statuses for the next combat, or launch an immediate rewarded encounter. Queued statuses persist across non-combat stages and are consumed exactly once when combat is created.
- Completing the final stage clears active combat, records the adventure ID on the character, and marks the adventure completed. The persistent ID keeps the green Completed treatment and unlocks replay rather than becoming terminal. Shared adventure reward scaling reduces every positive XP source during that replay to 10% and every combat gold reward to 50%, both rounded down. Item drops retain their normal rules.

Travel transitions are UI-only timing; they do not modify rules until `advanceJourney` executes.

## Gear transaction rules

Equip and unequip helpers return a new `CharacterState` and transfer item objects between inventory and equipment.

- Equipping a replacement pushes the previous item into inventory.
- Equipping a Two-Hand item clears both hand slots into inventory before placing it in Main Hand.
- Off Hand is locked while Main Hand contains a Two-Hand item.
- One-Hand items accept an explicit preferred hand, otherwise the helper chooses an available hand.
- Ring placement accepts an explicit ring slot, otherwise it chooses the first empty ring, then Ring I.

The UI may preview and compare, but only these helpers authorize the transaction.

Consumables are executable inventory definitions rather than equipment. `useConsumable` validates the active player turn and captured target, removes exactly one copy, and queues Health, Energy, regeneration, fixed damage, status, and VFX effects at one presentation event. It returns both the updated `CharacterState` and `CombatState`; the transient action queue is not persisted.

## Talent prerequisites and runtime tree

`areTalentRequirementsMet` is shared by visual availability and the actual unlock action. `isAdditionalClassTalentLocked` is applied by both paths as a second gate: once any non-origin class node is unlocked, other class nodes remain unavailable below level 10.

Fresh characters choose Arcanist, Brute, or Shadow before entering the runtime tree; Cultist is visible but unavailable. `characterIntroduction.ts` unlocks the selected canonical class node and equips its granted ability without consuming the separate starting Talent Point. The introductory talent tree centers on that class node and requires the remaining point to be spent on a connected non-class node. The flow then requires both starting Attribute Points to be assigned before continuing to Town.

- `getTalentConnectionIds` treats every stored edge as undirected by combining a node's own `requires` IDs with every node that references it.
- A node with no adjacent connections is available.
- Every node uses `some`: any one unlocked adjacent node makes it available.

Each edge should be stored once. The runtime tree draws that one line, while availability and modal requirement text work from either end. The Talent Editor presents the checkbox as connected from both node perspectives, removes either stored orientation when disconnected, and normalizes duplicate reciprocal edges on load.

The runtime tree derives its minimum bounding box from node world positions inside `TALENT_TREE_CANVAS`, then adds a 260-world-unit margin on every side. The scaled canvas also sits inside an 80-screen-pixel gutter on all four sides; this second margin does not shrink with zoom and keeps outer nodes reachable above fixed mobile UI even at 20%. The tree pans by scroll offset and zooms between 20% and 160%. Desktop wheel input eases toward its target through a request-animation-frame loop while keeping the world point at the center of the talent-tree viewport fixed. Mobile exposes icon-only zoom-out and zoom-in controls that move in 20-percentage-point steps around the same viewport center, and mobile pinch zoom is intentionally disabled. The imperative canvas transform avoids rerendering every talent node while zoom changes, and the non-passive wheel listener prevents browser and scroll-container movement on desktop. Pointer gesture state supports left/middle mouse dragging and one-finger touch panning. Node selection is resolved on pointer release only when movement stays below the drag threshold, then deferred until the following animation frame so the same touch cannot click through into Talent Details. A node press only opens its details; unlocking requires a separate action inside the modal. The editor has independent zoom/canvas rules.

Connections render in an SVG layer with shape-aware black cutouts in a user-space mask for every node position. The lines therefore cannot show through nodes even when locked nodes use whole-element transparency. Circular passive nodes render at 75% of the square-node diameter, while unlocked nodes use a gold outer outline independent of branch color.

Ability-slot selection is an explicit indexed state transaction. The Talent Tree opens its six-slot loadout from a compact button into a scroll-locking game-owned modal; selecting a slot opens the existing ability picker above it. Occupied slots can replace or swap abilities; removing a slot compacts the loadout, and empty selections append without creating sparse array entries. The picker only exposes core abilities and abilities granted by unlocked talents.

## Talent Editor isolation

The editor owns a `TalentDraft`, not live `Talent[]` data. Its storage keys are:

```text
emberfall.talent-devtool.v1
emberfall.talent-devtool.snap-to-grid
```

The draft is initialized from live content only when no valid stored draft exists. After that, browser-local draft data wins. Older drafts are normalized on load: obsolete requirement-mode data is discarded, duplicate reciprocal edges are collapsed, Energy/cooldown fields are inferred, and ability tooltip plus Physical/Spell Power percentages are populated from live definitions when absent. Save is an explicit repeat of the automatic local write. Copy/Export serialize a versioned JSON exchange format without a requirement-mode field.

Canvas positions are percentages, but grid spacing is stored as fixed world units. When nodes approach an edge, `ensureCanvasRoom` expands that side and recalculates percentages so existing absolute alignment remains stable.

An exported draft is design input. Advanced effect notes are not executable until translated into ability/status/combat-feature definitions. The exception is the restricted local-development sync: leaving the talent-tooltip field updates an existing talent, while leaving the ability-tooltip or Power-percentage fields updates the ability already referenced by that live talent. New/reassigned abilities and all other fields remain draft-only.

Enemy, Event, Adventure, and Item editors retain browser-local drafts under legacy-compatible `emberfall.*-devtool.v1` keys. New files and exchange-format labels use the Arkenfall name. Event Manager uses exchange version 2 and supports checked choices, direct choices, and item-referenced Wandering Merchants. Item Editor uses `arkenfall-items` version 1 for the combined item and set catalogs, including each item's Gold Cost, optional Arkenfall vendor, typed crafting recipe, executable set-passive JSON, and status-removal consumables. An explicit null disables legacy vendor or recipe defaults. Internal IDs remain stable or are regenerated from readable names when missing, invalid, or duplicated. While local Vite is running, Enemy Save replaces `ENEMIES` in `src/game/content/enemies.ts`; Event and Adventure Save write the appropriate initializer in `src/game/content/adventures.ts`; and Item Save writes `ITEMS` plus `GEAR_SETS` in `src/game/content/gear.ts`. Adventure definitions can select data-owned custom card/combat artwork. Existing enemy numeric fields and drop tables retain narrow writes for rapid edits, while the complete catalog route preserves executable abilities, behavior, artwork, action limits, and advanced fields. Standard gear stats, set passives, consumable effects, prices, town and event merchant catalogs, crafting recipes, and enemy/stage item drops are executable immediately; free-form special notes remain design input. Validation completes before any file changes.

The password-gated launcher also contains **Level up** and **Grant item**. These mutate only the current browser-owned `GameState`, so they work without the Vite source-sync route and persist through the normal save effect. Level up is blocked during active combat and at level 50. Grant item accepts a live catalog ID plus a clamped quantity of 1-99 and remains available during combat for consumable testing. Neither action changes canonical content source.

## Regression protection

- `npm test` bundles and runs focused rule checks against the real TypeScript modules. It covers content references and item prices, talent graph integrity, editor ID repair, developer level/item grants, opposed Hit/Dodge arithmetic and caps, temporary combat-stat projection, Stealth and Stun/Diminishing Returns behavior, a representative player ability, checked/direct event outcomes, single-stock event merchants, repeatable town purchases, exact recipe consumption, tavern recovery, grouped item drops, and presentation-timed consumable resolution.
- `npm run docs:check` verifies that the documented talent count matches the live talent catalog.
- `npm run build` remains the full type-check and production-bundle gate. UI, touch, animation, and VFX behavior still require browser verification at desktop and mobile widths.

At the 2026-07-26 handoff, `npm test` reaches the content-integrity suite and fails because eight newly authored item IDs are missing from `ITEM_ICON_URLS`. The owner-owned content changes remain uncommitted; see `AGENTS.md` and `docs/CONTENT_REFERENCE.md` for the exact affected items. Documentation and build checks pass. Preserve this distinction when taking over: the test failure is known integration debt in the current worktree, not a failure introduced by documentation-only changes.

## Save boundary and migration

The game save key remains `emberfall-save-v1` as a legacy compatibility contract. Renaming the product must not invalidate existing characters.

`loadGame` is a defensive boundary:

- Invalid JSON returns no save.
- Removed talent IDs are filtered and known costs refunded.
- Equipped abilities are restricted to core abilities and abilities granted by still-unlocked talents.
- Item metadata is hydrated from current definitions.
- Invalid legacy Two-Hand plus Off Hand combinations are repaired.
- Avatar, stat points, and pending rewards receive fallbacks.
- Character level is clamped to the level-50 cap, with no stored experience retained at max level.
- Missing adventure mode is normalized to `story`.

`ensureCombatState` performs the separate in-combat migration because combat definitions and animation fields evolve more frequently.

On story defeat, `clearSave` runs instead of `saveGame`. Arena outcomes are safe and continue through normal autosave. Reset also clears the save and returns to a deep clone of `INITIAL_GAME`.

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
