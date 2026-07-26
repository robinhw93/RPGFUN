export { createCombat, ensureCombatState, getCombatInitiative, getEnemyStartingEnergy, selectEnemyTarget, type CombatStartEffects } from "./combat/state";
export { useAbility, endPlayerTurn } from "./combat/playerActions";
export { takeEnemyTurn } from "./combat/enemyActions";
export { finishCombatAttack, primeCombatAttack, resolveCombatEvent } from "./combat/presentation";
export { canUseConsumable, useConsumable } from "./consumables";
