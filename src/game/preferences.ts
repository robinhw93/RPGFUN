export type CombatSpeed = 1 | 1.5 | 2;

export interface GamePreferences {
  combatSpeed: CombatSpeed;
  reducedMotion: boolean;
}

const PREFERENCES_KEY = "arkenfall-preferences-v1";
export const DEFAULT_GAME_PREFERENCES: GamePreferences = { combatSpeed: 1, reducedMotion: false };

export function normalizeGamePreferences(value: unknown): GamePreferences {
  if (!value || typeof value !== "object") return DEFAULT_GAME_PREFERENCES;
  const preferences = value as Partial<GamePreferences>;
  const combatSpeed = preferences.combatSpeed === 1.5 || preferences.combatSpeed === 2 ? preferences.combatSpeed : 1;
  return { combatSpeed, reducedMotion: preferences.reducedMotion === true };
}

export function loadGamePreferences(): GamePreferences {
  try {
    return normalizeGamePreferences(JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}"));
  } catch {
    return DEFAULT_GAME_PREFERENCES;
  }
}

export function saveGamePreferences(preferences: GamePreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalizeGamePreferences(preferences)));
}
