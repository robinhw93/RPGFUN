export const COMBAT_TIMING = {
  floatingMessageMs: 1800,
  attackDurationMs: 730,
  attackImpactMs: 320,
} as const;

export const INITIATIVE_TIMING = {
  rollTickMs: 45,
  rawRollMs: 1600,
  bonusMs: 3200,
  orderMs: 4800,
  flightMs: 1400,
  completeMs: 6600,
} as const;
