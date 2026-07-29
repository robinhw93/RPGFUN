import { ADVENTURES } from "./data";
import { getDerivedStats } from "./character";
import { createCombat } from "./engine";
import type { AdventureStageEntry, CombatState, GameState } from "./types";

export const ECHO_TOWER_ADVENTURE_ID = "tower-of-echoes";
export const ECHO_TOWER_UNLOCK_ADVENTURE_ID = ADVENTURES.at(-1)?.id ?? "the-throne-beyond-death";

const FORMATIONS: Array<{ entry: AdventureStageEntry; recommendedLevel: number }> = ADVENTURES.flatMap((adventure) => (
  adventure.stages.flatMap((stage) => stage.entries
    .filter((entry) => (entry.type === "combat" || entry.type === "boss") && (entry.enemyIds?.length ?? 0) > 0)
    .map((entry) => ({ entry, recommendedLevel: adventure.recommendedLevel })))
));

export function isEchoTowerUnlocked(state: GameState): boolean {
  return state.character.completedAdventureIds.includes(ECHO_TOWER_UNLOCK_ADVENTURE_ID);
}

export function getEchoTowerCheckpoint(bestFloor: number): number {
  if (bestFloor < 5) return 1;
  return Math.max(1, Math.floor(bestFloor / 5) * 5);
}

function getFormation(floor: number): { entry: AdventureStageEntry; recommendedLevel: number } {
  const bossFormations = FORMATIONS.filter(({ entry }) => entry.type === "boss");
  const pool = floor % 5 === 0 && bossFormations.length > 0 ? bossFormations : FORMATIONS;
  return pool[(Math.max(1, floor) * 7 - 1) % pool.length];
}

export function createEchoTowerCombat(state: GameState, floor: number, carryHp?: number): CombatState {
  const formation = getFormation(floor);
  const targetLevel = 70 + Math.max(1, floor) * 2;
  const levelRatio = Math.max(1, targetLevel / Math.max(1, formation.recommendedLevel));
  const hpMultiplier = Math.min(12, 1 + (levelRatio - 1) * 0.7 + floor * 0.08);
  const powerMultiplier = Math.min(7, 1 + (levelRatio - 1) * 0.35 + floor * 0.035);
  const combat = createCombat(state.character, formation.entry.enemyIds ?? [], carryHp, { enemyLevel: targetLevel });
  return {
    ...combat,
    enemies: combat.enemies.map((enemy) => {
      const maxHp = Math.max(enemy.maxHp, Math.round(enemy.maxHp * hpMultiplier));
      return {
        ...enemy,
        level: targetLevel,
        hp: maxHp,
        maxHp,
        physicalPower: Math.max(1, Math.round(enemy.physicalPower * powerMultiplier)),
        spellPower: Math.max(1, Math.round(enemy.spellPower * powerMultiplier)),
        armor: Math.round(enemy.armor * Math.min(3, 1 + floor * 0.025)),
        magicResistance: Math.round(enemy.magicResistance * Math.min(3, 1 + floor * 0.025)),
        dropTable: undefined,
      };
    }),
  };
}

export function startEchoTower(state: GameState): GameState {
  if (!isEchoTowerUnlocked(state) || state.adventure.active) return state;
  const floor = getEchoTowerCheckpoint(state.character.echoTowerBestFloor ?? 0);
  const maxHp = getDerivedStats(state.character).maxHp;
  return {
    ...state,
    adventure: {
      ...state.adventure,
      mode: "tower",
      adventureId: ECHO_TOWER_ADVENTURE_ID,
      active: true,
      nodeIndex: 0,
      stageEntryId: `echo-floor-${floor}`,
      carryHp: maxHp,
      combat: createEchoTowerCombat(state, floor, maxHp),
      eventResolved: false,
      eventRollResult: null,
      nextCombatPlayerStatuses: [],
      nextCombatEnemyStatuses: [],
      carriedAbilityCooldowns: {},
      eventEncounter: null,
      eventMerchant: null,
      latestLoot: null,
      pendingReward: null,
      arenaResult: null,
      towerFloor: floor,
      towerEssenceEarned: 0,
      towerReturnCarryHp: state.adventure.carryHp,
      towerFloorReward: null,
      completed: false,
    },
  };
}

export function grantEchoTowerFloorReward(state: GameState): GameState {
  const { adventure } = state;
  if (adventure.mode !== "tower" || adventure.combat?.outcome !== "victory" || adventure.towerFloorReward !== null) return state;
  const reward = 4 + Math.max(1, adventure.towerFloor) * 2;
  return {
    ...state,
    character: { ...state.character, salvageEssence: (state.character.salvageEssence ?? 0) + reward },
    adventure: { ...adventure, towerFloorReward: reward, towerEssenceEarned: adventure.towerEssenceEarned + reward },
  };
}

export function advanceEchoTower(state: GameState): GameState {
  const { adventure } = state;
  if (adventure.mode !== "tower" || adventure.combat?.outcome !== "victory" || adventure.towerFloorReward === null) return state;
  const floor = adventure.towerFloor + 1;
  const maxHp = getDerivedStats(state.character).maxHp;
  const carryHp = adventure.towerFloor % 5 === 0 ? maxHp : Math.max(1, adventure.combat.playerHp);
  return {
    ...state,
    adventure: {
      ...adventure,
      towerFloor: floor,
      stageEntryId: `echo-floor-${floor}`,
      carryHp,
      combat: createEchoTowerCombat(state, floor, carryHp),
      towerFloorReward: null,
      carriedAbilityCooldowns: adventure.combat.abilityCooldowns,
    },
  };
}

export function leaveEchoTower(state: GameState): GameState {
  if (state.adventure.mode !== "tower") return state;
  const clearedCurrent = state.adventure.combat?.outcome === "victory" && state.adventure.towerFloorReward !== null;
  const floorReached = Math.max(0, state.adventure.towerFloor - (clearedCurrent ? 0 : 1));
  const run = {
    id: `echo-run-${Date.now()}`,
    floorReached,
    essenceEarned: state.adventure.towerEssenceEarned,
    completedAt: Date.now(),
  };
  return {
    ...state,
    character: {
      ...state.character,
      echoTowerBestFloor: Math.max(state.character.echoTowerBestFloor ?? 0, floorReached),
      echoTowerRuns: [run, ...(state.character.echoTowerRuns ?? [])].slice(0, 10),
    },
    adventure: {
      ...state.adventure,
      mode: "story",
      adventureId: ADVENTURES[0].id,
      active: false,
      nodeIndex: 0,
      stageEntryId: null,
      carryHp: state.adventure.towerReturnCarryHp,
      combat: null,
      carriedAbilityCooldowns: {},
      latestLoot: null,
      pendingReward: null,
      towerFloor: 0,
      towerEssenceEarned: 0,
      towerReturnCarryHp: null,
      towerFloorReward: null,
      completed: false,
    },
  };
}
