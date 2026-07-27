import type { GameState, GearItem, GearSlot } from "./types";
import { hasStatus } from "./statusEffects";

export interface CombatFleeResult {
  state: GameState;
  goldLossPercent: number;
  goldLost: number;
  lostItem: GearItem | null;
}

function randomUnit(random: () => number): number {
  return Math.min(1 - Number.EPSILON, Math.max(0, random()));
}

/** Resolves the permanent losses and abandons the current adventure. */
export function fleeCombat(state: GameState, random: () => number = Math.random): CombatFleeResult | null {
  const combat = state.adventure.combat;
  if (!state.adventure.active || !combat || combat.outcome !== "active" || hasStatus(combat.playerStatuses, "chained")) return null;

  const goldLossPercent = 50 + Math.floor(randomUnit(random) * 41);
  const goldLost = Math.ceil(state.character.gold * goldLossPercent / 100);
  const equippedItems = Object.entries(state.character.equipment)
    .filter((entry): entry is [GearSlot, GearItem] => Boolean(entry[1]));
  const losesItem = equippedItems.length > 0 && randomUnit(random) < 0.5;
  const lostEntry = losesItem
    ? equippedItems[Math.floor(randomUnit(random) * equippedItems.length)]
    : undefined;
  const equipment = { ...state.character.equipment };
  if (lostEntry) delete equipment[lostEntry[0]];

  return {
    goldLossPercent,
    goldLost,
    lostItem: lostEntry?.[1] ?? null,
    state: {
      ...state,
      character: {
        ...state.character,
        gold: Math.max(0, state.character.gold - goldLost),
        equipment,
      },
      adventure: {
        ...state.adventure,
        active: false,
        nodeIndex: 0,
        stageEntryId: null,
        carryHp: Math.max(1, Math.min(combat.playerHp, combat.playerMaxHp)),
        combat: null,
        eventResolved: false,
        eventRollResult: null,
        nextCombatPlayerStatuses: [],
        nextCombatEnemyStatuses: [],
        carriedAbilityCooldowns: {},
        eventEncounter: null,
        eventMerchant: null,
        latestLoot: null,
        pendingReward: null,
        completed: false,
      },
    },
  };
}
