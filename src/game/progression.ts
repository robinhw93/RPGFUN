import type { CharacterState } from "./types";

export interface ExperienceResult {
  character: CharacterState;
  levelBefore: number;
  xpBefore: number;
  levelAfter: number;
  xpAfter: number;
  levelsGained: number;
}

export function experienceToNextLevel(level: number): number {
  return 100 + Math.max(0, level - 1) * 50;
}

export function addExperience(character: CharacterState, amount: number): ExperienceResult {
  const levelBefore = character.level;
  const xpBefore = character.xp;
  let level = levelBefore;
  let xp = xpBefore + Math.max(0, amount);

  while (xp >= experienceToNextLevel(level)) {
    xp -= experienceToNextLevel(level);
    level += 1;
  }

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
  let nextLevel = level;
  let nextXp = xp + Math.max(0, gained);
  while (nextXp >= experienceToNextLevel(nextLevel)) {
    nextXp -= experienceToNextLevel(nextLevel);
    nextLevel += 1;
  }
  return { level: nextLevel, xp: nextXp, required: experienceToNextLevel(nextLevel) };
}
