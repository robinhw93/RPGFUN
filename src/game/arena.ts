import { DEFAULT_ADVENTURE_ID } from "./adventures";
import { getDerivedStats } from "./character";
import { createCombat } from "./combat/state";
import { ARENA_ADVENTURE, ARENA_CHAMPION_ID } from "./content/arena";
import { addExperience } from "./progression";
import type { ArenaAttemptRecord, CharacterState, CombatReward, GameState } from "./types";

export const ARENA_TURN_LIMIT = 10;
export const ARENA_SCORE_LIMIT = 10;
export const ARENA_CHAMPION_MAX_HP = 100_000;
export const ARENA_EXPERIENCE_DAMAGE_RATIO = 0.2;

export function getArenaExperience(damage: number): number {
  return Math.floor(Math.max(0, damage) * ARENA_EXPERIENCE_DAMAGE_RATIO);
}

function makeArenaAttemptId(timestamp: number): string {
  return `arena-attempt-${timestamp}`;
}

export function getArenaScores(character: CharacterState): ArenaAttemptRecord[] {
  return [...(character.arenaScores ?? [])]
    .sort((left, right) => right.damage - left.damage || left.turns - right.turns || right.completedAt - left.completedAt)
    .slice(0, ARENA_SCORE_LIMIT);
}

export function resetArenaAttemptAfterAdventure(character: CharacterState): CharacterState {
  return character.arenaAttemptAvailable ? character : { ...character, arenaAttemptAvailable: true };
}

export function startArenaChallenge(state: GameState): GameState {
  if (state.adventure.active || !state.character.arenaAttemptAvailable) return state;
  const maxHp = getDerivedStats(state.character).maxHp;
  const returnCarryHp = state.adventure.carryHp;
  const combat = createCombat(state.character, [ARENA_CHAMPION_ID], maxHp);
  combat.challenge = {
    kind: "damage_trial",
    playerTurnLimit: ARENA_TURN_LIMIT,
    playerTurnsCompleted: 0,
    completionPending: false,
    returnCarryHp,
  };
  return {
    ...state,
    character: { ...state.character, arenaAttemptAvailable: false },
    adventure: {
      mode: "arena",
      adventureId: ARENA_ADVENTURE.id,
      active: true,
      nodeIndex: 0,
      stageEntryId: ARENA_ADVENTURE.stages[0].entries[0].id,
      carryHp: maxHp,
      combat,
      eventResolved: false,
      eventRollResult: null,
      nextCombatPlayerStatuses: state.adventure.nextCombatPlayerStatuses,
      nextCombatEnemyStatuses: state.adventure.nextCombatEnemyStatuses,
      carriedAbilityCooldowns: {},
      eventEncounter: null,
      eventMerchant: null,
      latestLoot: null,
      pendingReward: null,
      arenaResult: null,
      completed: false,
    },
  };
}

export function endArenaChallenge(state: GameState): GameState {
  const combat = state.adventure.mode === "arena" ? state.adventure.combat : null;
  if (!combat || combat.outcome !== "active") return state;
  return { ...state, adventure: { ...state.adventure, combat: { ...combat, outcome: "victory", floatingEvents: [], pendingEffects: [] } } };
}

export function grantArenaChallengeReward(state: GameState, timestamp = Date.now()): GameState {
  const { adventure } = state;
  const combat = adventure.mode === "arena" ? adventure.combat : null;
  if (!combat || combat.outcome === "active" || adventure.arenaResult) return state;
  const champion = combat.enemies.find((enemy) => enemy.id === ARENA_CHAMPION_ID);
  const damage = Math.max(0, Math.min(ARENA_CHAMPION_MAX_HP, (champion?.maxHp ?? ARENA_CHAMPION_MAX_HP) - (champion?.hp ?? ARENA_CHAMPION_MAX_HP)));
  const turns = Math.min(
    ARENA_TURN_LIMIT,
    Math.max(1, (combat.challenge?.playerTurnsCompleted ?? 0) + (combat.playerActed ? 1 : 0)),
  );
  const record: ArenaAttemptRecord = {
    id: makeArenaAttemptId(timestamp),
    damage,
    turns,
    level: state.character.level,
    completedAt: timestamp,
  };
  const experienceReward = getArenaExperience(damage);
  const experience = addExperience(state.character, experienceReward);
  const character = {
    ...experience.character,
    arenaAttemptAvailable: false,
    arenaScores: getArenaScores({ ...experience.character, arenaScores: [...(state.character.arenaScores ?? []), record] }),
  };
  const reward: CombatReward = {
    id: record.id,
    nodeIndex: 0,
    experience: experienceReward,
    gold: 0,
    loot: [],
    levelBefore: experience.levelBefore,
    xpBefore: experience.xpBefore,
    levelAfter: experience.levelAfter,
    xpAfter: experience.xpAfter,
    levelsGained: experience.levelsGained,
  };
  return { ...state, character, adventure: { ...adventure, arenaResult: record, pendingReward: reward } };
}

export function returnFromArena(state: GameState): GameState {
  if (state.adventure.mode !== "arena") return state;
  const returnCarryHp = state.adventure.combat?.challenge?.returnCarryHp ?? null;
  return {
    ...state,
    adventure: {
      ...state.adventure,
      mode: "story",
      adventureId: DEFAULT_ADVENTURE_ID,
      active: false,
      nodeIndex: 0,
      stageEntryId: null,
      carryHp: returnCarryHp,
      combat: null,
      eventResolved: false,
      eventRollResult: null,
      carriedAbilityCooldowns: {},
      eventEncounter: null,
      eventMerchant: null,
      latestLoot: null,
      pendingReward: null,
      arenaResult: null,
      completed: false,
    },
  };
}
