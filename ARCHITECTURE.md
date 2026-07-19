# Emberfall architecture

## Boundaries

- `src/game/engine.ts` owns deterministic combat state transitions. UI components should not calculate damage, statuses, turn order, or outcomes.
- `src/game/combatFeatures.ts` resolves data-driven gear, set, and talent triggers before the engine applies their effects.
- `src/game/character.ts` is the only place that turns attributes plus passive gear/set/talent bonuses into derived character stats.
- `src/game/combatMath.ts` owns opposed combat rules such as Hit Chance versus Dodge Chance and their final bounds.
- `src/game/timing.ts` is the source of truth for JavaScript animation and event timings.
- `src/hooks/useCombatEventSequencer.ts` coordinates floating combat messages, attack wind-up, and the delayed impact state transition.
- `src/game/initiativeLayout.ts` contains the pure FLIP geometry used to move initiative cards between layouts.
- `src/components/` contains reusable game-owned UI overlays and controls.

## Combat timing contract

An attack damage event has two phases:

1. `primeCombatAttack` starts the attacker animation when its damage message appears.
2. `resolveCombatEvent` applies HP loss and the target reaction at the configured impact time.

Status and turn effects continue to resolve when their own floating message appears. This keeps visible feedback and state changes synchronized.

Player turns are explicitly ended with `endPlayerTurn`; using an ability never advances the active actor. `CombatState.abilityCooldowns` stores cooldowns in player turns, and the engine decrements them only when the next player turn begins. This lets a player chain any number of affordable, ready abilities without coupling action count to turn order.

## Stat and content contract

- Gear, set bonuses, and talents all contribute through `PassiveBonuses`. New direct derived-stat bonuses belong there instead of in UI or ability-specific conditionals.
- Raw Hit Chance and Critical Strike Chance are intentionally uncapped. Dodge Chance is capped at 50%. The opposed final hit roll is `Hit Chance - Dodge Chance`, clamped to 20–100%.
- Strength and Agility feed Physical Power. Intelligence feeds Magical Power. Abilities use the matching derived power once; their old `scalingStat` metadata is retained for content categorization and save compatibility, not added a second time to base damage.
- Luck bonuses to chance-based effects apply only to explicitly probabilistic triggers. Effects without a `chance` field remain guaranteed.

## UI rules

- All player-facing copy explains the game in the language of the character and player. Internal formulas, implementation terms, and developer-oriented rules do not belong in game UI.
- Never use browser-native `alert`, `confirm`, or `prompt` dialogs.
- Never use HTML `title` attributes for tooltips. Hover and keyboard hints use the game-owned `data-game-tooltip` UI; detailed touch interactions use game-owned modals.
- Confirmations and destructive actions use components from `src/components/`.
- Combat must remain usable without page scrolling at the mobile breakpoint.
- Combatant cards keep stable React keys so resource bars can interpolate between values and local damage/heal feedback can animate without remounting the card.
- Any animation that lands on persistent UI should measure the real destination geometry instead of assuming fixed widths.
