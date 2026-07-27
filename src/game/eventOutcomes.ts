import { getDerivedStats } from "./character";
import { getAdventureExperienceReward } from "./adventures";
import { ENEMIES, ITEMS } from "./data";
import { acquireItem, getItemGoldCost, getItemSellValue } from "./items";
import { addExperience } from "./progression";
import { isStatusEffectId } from "./statusEffects";
import type {
  AdventureCombatStartStatus,
  AdventureEventChoice,
  AdventureEventAppliedEffect,
  AdventureEventRollResult,
  AdventureEventOutcome,
  AdventureEventOutcomeEffect,
  GameState,
} from "./types";

export function getInitialEventPresentationPhase(
  rollResult: AdventureEventRollResult | null,
  merchantItemCount: number,
): "title" | "outcome" | "merchant" {
  if (!rollResult) return "title";
  return merchantItemCount > 0 ? "merchant" : "outcome";
}

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

/** Resolves a checked or direct event choice and applies every configured outcome effect exactly once. */
export function resolveAdventureEventChoice(state: GameState, choice: AdventureEventChoice, random = Math.random): GameState {
  if (state.adventure.eventResolved) return state;
  const direct = choice.resolution === "direct";
  const statBonus = direct ? 0 : getDerivedStats(state.character)[choice.stat];
  const dieRoll = direct ? 0 : Math.floor(Math.max(0, Math.min(0.999999, random())) * 100) + 1;
  const total = dieRoll + statBonus;
  const success = direct || total >= choice.threshold;
  const outcome = direct ? (choice.outcome ?? choice.success) : success ? choice.success : choice.failure;
  let character = state.character;
  const maxHp = getDerivedStats(character).maxHp;
  let carryHp = state.adventure.carryHp ?? maxHp;
  let nextCombatPlayerStatuses = [...(state.adventure.nextCombatPlayerStatuses ?? [])];
  let nextCombatEnemyStatuses = [...(state.adventure.nextCombatEnemyStatuses ?? [])];
  let eventEncounter = state.adventure.eventEncounter ?? null;
  let eventMerchant = state.adventure.eventMerchant ?? null;
  const appliedEffects: AdventureEventAppliedEffect[] = [];
  const outcomeEffects = getAdventureEventOutcomeEffects(outcome);

  outcomeEffects.forEach((effect) => {
    switch (effect.type) {
      case "heal": {
        const previousHealth = carryHp;
        carryHp = Math.min(maxHp, carryHp + nonNegativeInteger(effect.amount));
        appliedEffects.push({ type: "resource", resource: "health", direction: "gain", amount: carryHp - previousHealth });
        break;
      }
      case "loseHealth": {
        const previousHealth = carryHp;
        carryHp = Math.max(1, carryHp - nonNegativeInteger(effect.amount));
        appliedEffects.push({ type: "resource", resource: "health", direction: "lose", amount: previousHealth - carryHp });
        break;
      }
      case "gainGold": {
        const amount = nonNegativeInteger(effect.amount);
        character = { ...character, gold: character.gold + amount };
        appliedEffects.push({ type: "resource", resource: "gold", direction: "gain", amount });
        break;
      }
      case "loseGold": {
        const previousGold = character.gold;
        character = { ...character, gold: Math.max(0, character.gold - nonNegativeInteger(effect.amount)) };
        appliedEffects.push({ type: "resource", resource: "gold", direction: "lose", amount: previousGold - character.gold });
        break;
      }
      case "gainExperience": {
        const amount = getAdventureExperienceReward(effect.amount, state.adventure, state.character.completedAdventureIds);
        character = addExperience(character, amount).character;
        appliedEffects.push({ type: "resource", resource: "experience", direction: "gain", amount });
        break;
      }
      case "loseExperience": {
        const previousExperience = character.xp;
        character = { ...character, xp: Math.max(0, character.xp - nonNegativeInteger(effect.amount)) };
        appliedEffects.push({ type: "resource", resource: "experience", direction: "lose", amount: previousExperience - character.xp });
        break;
      }
      case "gainTalentPoints": {
        const amount = nonNegativeInteger(effect.amount);
        character = { ...character, talentPoints: character.talentPoints + amount };
        appliedEffects.push({ type: "resource", resource: "talentPoints", direction: "gain", amount });
        break;
      }
      case "gainAttributePoints": {
        const amount = nonNegativeInteger(effect.amount);
        character = { ...character, unspentStatPoints: character.unspentStatPoints + amount };
        appliedEffects.push({ type: "resource", resource: "attributePoints", direction: "gain", amount });
        break;
      }
      case "gainItem": {
        const item = ITEMS.find((candidate) => candidate.id === effect.itemId);
        if (item) {
          const acquisition = acquireItem(character, item);
          character = acquisition.character;
          appliedEffects.push({ type: "item", itemId: item.id, equippedSlot: acquisition.equippedSlot });
        }
        break;
      }
      case "openMerchant": {
        const itemIds = [...new Set(effect.itemIds.filter((itemId) => ITEMS.some((item) => item.id === itemId)))];
        eventMerchant = {
          itemIds,
          purchasedItemIds: [],
        };
        appliedEffects.push({ type: "merchant", itemIds });
        break;
      }
      case "playerNextCombatBuff":
      case "playerNextCombatDebuff": {
        if (isStatusEffectId(effect.status)) {
          const stacks = Math.max(1, nonNegativeInteger(effect.stacks));
          nextCombatPlayerStatuses = addPendingStatus(nextCombatPlayerStatuses, effect);
          appliedEffects.push({ type: "status", target: "player", disposition: effect.type === "playerNextCombatBuff" ? "buff" : "debuff", status: effect.status, stacks });
        }
        break;
      }
      case "enemiesNextCombatBuff":
      case "enemiesNextCombatDebuff": {
        if (isStatusEffectId(effect.status)) {
          const stacks = Math.max(1, nonNegativeInteger(effect.stacks));
          nextCombatEnemyStatuses = addPendingStatus(nextCombatEnemyStatuses, effect);
          appliedEffects.push({ type: "status", target: "enemies", disposition: effect.type === "enemiesNextCombatBuff" ? "buff" : "debuff", status: effect.status, stacks });
        }
        break;
      }
      case "immediateEncounter": {
        const count = Math.max(1, nonNegativeInteger(effect.count));
        if (ENEMIES[effect.enemyId]) {
          const experience = nonNegativeInteger(effect.experience);
          const gold = nonNegativeInteger(effect.gold);
          eventEncounter = {
            enemyIds: Array.from({ length: count }, () => effect.enemyId),
            reward: { experience, gold },
          };
          appliedEffects.push({ type: "encounter", enemyId: effect.enemyId, count, experience, gold });
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
      eventRollResult: direct
        ? { resolution: "direct", choiceId: choice.id, outcomeText: outcome.text, appliedEffects }
        : { resolution: "check", choiceId: choice.id, dieRoll, stat: choice.stat, statBonus, total, threshold: choice.threshold, success, outcomeText: outcome.text, appliedEffects },
      nextCombatPlayerStatuses,
      nextCombatEnemyStatuses,
      eventEncounter,
      eventMerchant,
    },
  };
}

/** Purchases the merchant's single stocked copy and preserves its sold-out slot. */
export function purchaseEventMerchantItem(state: GameState, itemId: string): GameState {
  const merchant = state.adventure.eventMerchant;
  if (!state.adventure.active || !state.adventure.eventResolved || !merchant?.itemIds.includes(itemId) || merchant.purchasedItemIds.includes(itemId)) return state;
  const item = ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return state;
  const goldCost = getItemGoldCost(item);
  if (state.character.gold < goldCost) return state;
  const acquisition = acquireItem({ ...state.character, gold: state.character.gold - goldCost }, item);
  return {
    ...state,
    character: acquisition.character,
    adventure: {
      ...state.adventure,
      eventMerchant: {
        ...merchant,
        purchasedItemIds: [...merchant.purchasedItemIds, itemId],
      },
    },
  };
}

/** Sells exactly one inventory copy to the active event merchant. */
export function sellEventMerchantItem(state: GameState, itemId: string): GameState {
  if (!state.adventure.active || !state.adventure.eventResolved || !state.adventure.eventMerchant) return state;
  const inventoryIndex = state.character.inventory.findIndex((item) => item.id === itemId);
  if (inventoryIndex < 0) return state;
  const item = state.character.inventory[inventoryIndex];
  const sellValue = getItemSellValue(item);
  if (sellValue <= 0) return state;
  return {
    ...state,
    character: {
      ...state.character,
      gold: state.character.gold + sellValue,
      inventory: state.character.inventory.filter((_, index) => index !== inventoryIndex),
    },
  };
}
