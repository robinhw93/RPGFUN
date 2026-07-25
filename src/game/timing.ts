export const COMBAT_TIMING = {
  floatingMessageMs: 1800,
  silentEventMs: 16,
  damageNumberMs: 1050,
  attackDurationMs: 730,
  attackImpactMs: 320,
  turnOrderReorderMs: 480,
} as const;

export const INITIATIVE_TIMING = {
  rollTickMs: 45,
  rawRollMs: 1600,
  bonusMs: 3700,
  orderMs: 5800,
  flightMs: 1400,
  completeMs: 7600,
} as const;

export const ADVENTURE_TRANSITION_TIMING = {
  travelMs: 2500,
  encounterIntroMs: 1500,
  encounterEnterMs: 650,
  encounterMoveMs: 1100,
  encounterExitMs: INITIATIVE_TIMING.flightMs,
} as const;

export const ADVENTURE_EVENT_TIMING = {
  descriptionMs: 900,
  choicesMs: 1750,
  rollTickMs: INITIATIVE_TIMING.rollTickMs,
  rawRollMs: INITIATIVE_TIMING.rawRollMs,
  bonusMs: 2600,
  outcomeMs: 3750,
} as const;
