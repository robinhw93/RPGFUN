# Emberfall architecture

## Boundaries

- `src/game/engine.ts` owns deterministic combat state transitions. UI components should not calculate damage, statuses, turn order, or outcomes.
- `src/game/combatFeatures.ts` resolves data-driven gear, set, and talent triggers before the engine applies their effects.
- `src/game/timing.ts` is the source of truth for JavaScript animation and event timings.
- `src/hooks/useCombatEventSequencer.ts` coordinates floating combat messages, attack wind-up, and the delayed impact state transition.
- `src/game/initiativeLayout.ts` contains the pure FLIP geometry used to move initiative cards between layouts.
- `src/components/` contains reusable game-owned UI overlays and controls.

## Combat timing contract

An attack damage event has two phases:

1. `primeCombatAttack` starts the attacker animation when its damage message appears.
2. `resolveCombatEvent` applies HP loss and the target reaction at the configured impact time.

Status and turn effects continue to resolve when their own floating message appears. This keeps visible feedback and state changes synchronized.

## UI rules

- Never use browser-native `alert`, `confirm`, or `prompt` dialogs.
- Confirmations and destructive actions use components from `src/components/`.
- Combat must remain usable without page scrolling at the mobile breakpoint.
- Any animation that lands on persistent UI should measure the real destination geometry instead of assuming fixed widths.
