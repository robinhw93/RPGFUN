import type { GameState } from "./types";

const SAVE_KEY = "emberfall-save-v1";

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) as GameState : null;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
