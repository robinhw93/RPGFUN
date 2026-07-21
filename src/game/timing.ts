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
