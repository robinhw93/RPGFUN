import { getDerivedStats } from "./character";
import { ENEMIES, ITEMS } from "./data";
import { addExperience } from "./progression";
import { isStatusEffectId } from "./statusEffects";
import type {
  AdventureCombatStartStatus,
  AdventureEventChoice,
  AdventureEventOutcome,
  AdventureEventOutcomeEffect,
  GameState,
} from "./types";

function nonNegativeInteger(value: number): number {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}

function legacyOutcomeEffects(outcome: AdventureEventOutcome): AdventureEventOutcomeEffect[] {
  const effects: AdventureEventOutcomeEffect[] = [];
  const health = outcome.health ?? 0;
  const gold = outcome.gold ?? 0;
  const experience = outcome.experience ?? 0;
  const talentPoints = outcome.talentPoints ?? 0;
  const attributePoints = outcome.attributePoints ?? 0;
  if (health > 0) effects.push({ type: "heal", amount: health });
  if (health < 0) effects.push({ type: "loseHealth", amount: Math.abs(health) });
  if (gold > 0) effects.push({ type: "gainGold", amount: gold });
  if (gold < 0) effects.push({ type: "loseGold", amount: Math.abs(gold) });
  if (experience > 0) effects.push({ type: "gainExperience", amount: experience });
  if (experience < 0) effects.push({ type: "loseExperience", amount: Math.abs(experience) });
  if (talentPoints > 0) effects.push({ type: "gainTalentPoints", amount: talentPoints });
  if (attributePoints > 0) effects.push({ type: "gainAttributePoints", amount: attributePoints });
  return effects;
}

export function getAdventureEventOutcomeEffects(outcome: AdventureEventOutcome): AdventureEventOutcomeEffect[] {
  return Array.isArray(outcome.effects) ? outcome.effects : legacyOutcomeEffects(outcome);
}

function addPendingStatus(statuses: AdventureCombatStartStatus[], status: AdventureCombatStartStatus): AdventureCombatStartStatus[] {
  const stacks = Math.max(1, nonNegativeInteger(status.stacks));
  const existing = statuses.find((candidate) => candidate.status === status.status);
  return existing
    ? statuses.map((candidate) => candidate.status === status.status ? { ...candidate, stacks: candidate.stacks + stacks } : candidate)
    : [...statuses, { status: status.status, stacks }];
}

/** Resolves a rolled event choice and applies every configured outcome effect exactly once. */
export function resolveAdventureEventChoice(state: GameState, choice: AdventureEventChoice, random = Math.random): GameState {
  if (state.adventure.eventResolved) return state;
  const statBonus = getDerivedStats(state.character)[choice.stat];
  const dieRoll = Math.floor(Math.max(0, Math.min(0.999999, random())) * 100) + 1;
  const total = dieRoll + statBonus;
  const success = total >= choice.threshold;
  const outcome = success ? choice.success : choice.failure;
  let character = state.character;
  const maxHp = getDerivedStats(character).maxHp;
  let carryHp = state.adventure.carryHp ?? maxHp;
  let nextCombatPlayerStatuses = [...(state.adventure.nextCombatPlayerStatuses ?? [])];
  let nextCombatEnemyStatuses = [...(state.adventure.nextCombatEnemyStatuses ?? [])];
  let eventEncounter = state.adventure.eventEncounter ?? null;

  getAdventureEventOutcomeEffects(outcome).forEach((effect) => {
    switch (effect.type) {
      case "heal":
        carryHp = Math.min(maxHp, carryHp + nonNegativeInteger(effect.amount));
        break;
      case "loseHealth":
        carryHp = Math.max(1, carryHp - nonNegativeInteger(effect.amount));
        break;
      case "gainGold":
        character = { ...character, gold: character.gold + nonNegativeInteger(effect.amount) };
        break;
      case "loseGold":
        character = { ...character, gold: Math.max(0, character.gold - nonNegativeInteger(effect.amount)) };
        break;
      case "gainExperience":
        character = addExperience(character, nonNegativeInteger(effect.amount)).character;
        break;
      case "loseExperience":
        character = { ...character, xp: Math.max(0, character.xp - nonNegativeInteger(effect.amount)) };
        break;
      case "gainTalentPoints":
        character = { ...character, talentPoints: character.talentPoints + nonNegativeInteger(effect.amount) };
        break;
      case "gainAttributePoints":
        character = { ...character, unspentStatPoints: character.unspentStatPoints + nonNegativeInteger(effect.amount) };
        break;
      case "gainItem": {
        const item = ITEMS.find((candidate) => candidate.id === effect.itemId);
        if (item) character = { ...character, inventory: [...character.inventory, structuredClone(item)] };
        break;
      }
      case "playerNextCombatBuff":
      case "playerNextCombatDebuff":
        if (isStatusEffectId(effect.status)) nextCombatPlayerStatuses = addPendingStatus(nextCombatPlayerStatuses, effect);
        break;
      case "enemiesNextCombatBuff":
      case "enemiesNextCombatDebuff":
        if (isStatusEffectId(effect.status)) nextCombatEnemyStatuses = addPendingStatus(nextCombatEnemyStatuses, effect);
        break;
      case "immediateEncounter": {
        const count = Math.max(1, nonNegativeInteger(effect.count));
        if (ENEMIES[effect.enemyId]) {
          eventEncounter = {
            enemyIds: Array.from({ length: count }, () => effect.enemyId),
            reward: { experience: nonNegativeInteger(effect.experience), gold: nonNegativeInteger(effect.gold) },
          };
        }
        break;
      }
    }
  });

  return {
    ...state,
    character,
    adventure: {
      ...state.adventure,
      carryHp: Math.min(getDerivedStats(character).maxHp, carryHp),
      eventResolved: true,
      eventRollResult: { choiceId: choice.id, dieRoll, stat: choice.stat, statBonus, total, threshold: choice.threshold, success, outcomeText: outcome.text },
      nextCombatPlayerStatuses,
      nextCombatEnemyStatuses,
      eventEncounter,
    },
  };
}
