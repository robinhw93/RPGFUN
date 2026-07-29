import { ADVENTURES } from "./data";
import type { CharacterAvatarId } from "./avatars";
import type { GameState } from "./types";

const FALLEN_HEROES_KEY = "arkenfall-fallen-heroes-v1";
const MAX_FALLEN_HEROES = 20;

export interface FallenHeroRecord {
  id: string;
  name: string;
  avatarId: CharacterAvatarId;
  level: number;
  location: string;
  defeatedBy: string;
  fallenAt: number;
  arenaBest: number;
  towerBest: number;
  equipment: string[];
}

export function normalizeFallenHeroes(value: unknown): FallenHeroRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): FallenHeroRecord[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Partial<FallenHeroRecord>;
    if (typeof record.id !== "string" || typeof record.name !== "string" || typeof record.avatarId !== "string") return [];
    return [{
      id: record.id,
      name: record.name,
      avatarId: record.avatarId as CharacterAvatarId,
      level: Math.max(1, Math.floor(record.level ?? 1)),
      location: typeof record.location === "string" ? record.location : "Unknown road",
      defeatedBy: typeof record.defeatedBy === "string" ? record.defeatedBy : "Unknown foe",
      fallenAt: Math.max(0, Math.floor(record.fallenAt ?? 0)),
      arenaBest: Math.max(0, Math.floor(record.arenaBest ?? 0)),
      towerBest: Math.max(0, Math.floor(record.towerBest ?? 0)),
      equipment: Array.isArray(record.equipment) ? record.equipment.filter((name): name is string => typeof name === "string").slice(0, 12) : [],
    }];
  }).slice(0, MAX_FALLEN_HEROES);
}

export function loadFallenHeroes(): FallenHeroRecord[] {
  try {
    return normalizeFallenHeroes(JSON.parse(localStorage.getItem(FALLEN_HEROES_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function createFallenHeroRecord(state: GameState): FallenHeroRecord {
  const combat = state.adventure.combat;
  const activeEnemy = combat?.turnOrder[combat.activeTurnIndex]?.kind === "enemy"
    ? combat.enemies.find((enemy) => enemy.instanceId === combat.turnOrder[combat.activeTurnIndex].actorId)
    : undefined;
  const enemy = activeEnemy ?? combat?.enemies.find((candidate) => candidate.hp > 0) ?? combat?.enemies[0];
  const adventure = ADVENTURES.find((candidate) => candidate.id === state.adventure.adventureId);
  return {
    id: `fallen-${Date.now()}-${state.character.name}`,
    name: state.character.name,
    avatarId: state.character.avatarId,
    level: state.character.level,
    location: adventure?.name ?? "The wilds of Arkenfall",
    defeatedBy: enemy?.name ?? "Unknown foe",
    fallenAt: Date.now(),
    arenaBest: Math.max(0, ...state.character.arenaScores.map((score) => score.damage)),
    towerBest: state.character.echoTowerBestFloor ?? 0,
    equipment: Object.values(state.character.equipment).flatMap((item) => item ? [item.name] : []),
  };
}

export function recordFallenHero(state: GameState): FallenHeroRecord[] {
  const records = [createFallenHeroRecord(state), ...loadFallenHeroes()].slice(0, MAX_FALLEN_HEROES);
  localStorage.setItem(FALLEN_HEROES_KEY, JSON.stringify(records));
  return records;
}
