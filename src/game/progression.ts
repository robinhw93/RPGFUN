import type { CharacterState } from "./types";

export interface ExperienceResult {
  character: CharacterState;
  levelBefore: number;
  xpBefore: number;
  levelAfter: number;
  xpAfter: number;
  levelsGained: number;
}

export const MAX_LEVEL = 50;

export function experienceToNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return 100 + Math.max(0, level - 1) * 50;
}

/** Returns the exact XP required to gain a number of complete levels from the current progress. */
export function experienceForLevelGains(level: number, xp: number, levels: number): number {
  let required = 0;
  let currentLevel = level;
  let currentXp = Math.max(0, xp);
  for (let gained = 0; gained < Math.max(0, levels) && currentLevel < MAX_LEVEL; gained += 1) {
    required += Math.max(0, experienceToNextLevel(currentLevel) - currentXp);
    currentLevel += 1;
    currentXp = 0;
  }
  return required;
}

export function addExperience(character: CharacterState, amount: number): ExperienceResult {
  const levelBefore = Math.min(MAX_LEVEL, Math.max(1, character.level));
  const xpBefore = levelBefore >= MAX_LEVEL ? 0 : Math.max(0, character.xp);
  let level = levelBefore;
  let xp = level >= MAX_LEVEL ? 0 : xpBefore + Math.max(0, amount);

  while (level < MAX_LEVEL && xp >= experienceToNextLevel(level)) {
    xp -= experienceToNextLevel(level);
    level += 1;
  }
  if (level >= MAX_LEVEL) xp = 0;

  const levelsGained = level - levelBefore;
  return {
    character: {
      ...character,
      level,
      xp,
      unspentStatPoints: character.unspentStatPoints + levelsGained * 3,
      talentPoints: character.talentPoints + levelsGained,
    },
    levelBefore,
    xpBefore,
    levelAfter: level,
    xpAfter: xp,
    levelsGained,
  };
}

export function experienceProgressAfterGain(level: number, xp: number, gained: number): { level: number; xp: number; required: number } {
  let nextLevel = Math.min(MAX_LEVEL, Math.max(1, level));
  let nextXp = nextLevel >= MAX_LEVEL ? 0 : xp + Math.max(0, gained);
  while (nextLevel < MAX_LEVEL && nextXp >= experienceToNextLevel(nextLevel)) {
    nextXp -= experienceToNextLevel(nextLevel);
    nextLevel += 1;
  }
  if (nextLevel >= MAX_LEVEL) nextXp = 0;
  return { level: nextLevel, xp: nextXp, required: experienceToNextLevel(nextLevel) };
}
