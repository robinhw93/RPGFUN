export type StatName = "strength" | "agility" | "intelligence" | "vitality" | "luck";
export type TalentBranch = "core" | "brute" | "shadow" | "arcanist";
export type GearSlot = "head" | "chest" | "pants" | "boots" | "mainHand" | "offHand" | "ring1" | "ring2";
export type GearType = Exclude<GearSlot, "ring1" | "ring2"> | "ring";
export type DamageType = "physical" | "arcane" | "shadow";
export type TargetType = "enemy" | "self" | "all_enemies";

export interface Stats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  luck: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  kind: "buff" | "debuff";
  duration: number;
  stacks: number;
  description: string;
}

export type CombatTriggerEvent = "combat_start" | "turn_start" | "before_ability" | "on_hit" | "on_crit" | "on_kill" | "damage_taken" | "turn_end";
export type CombatEffectTarget = "self" | "target" | "all_enemies" | "random_enemy";

export interface PassiveBonuses {
  stats?: Partial<Stats>;
  armor?: number;
  power?: number;
  maxHp?: number;
  maxEnergy?: number;
  energyRegen?: number;
  critChance?: number;
  initiative?: number;
}

export interface CombatTriggerCondition {
  abilityIds?: string[];
  damageTypes?: DamageType[];
  critical?: boolean;
  minimumDamage?: number;
  targetHasAnyStatus?: string[];
}

export type CombatEffectDefinition =
  | { type: "damage"; amount: number; target?: CombatEffectTarget; damageType?: DamageType; scalingStat?: StatName; scaling?: number }
  | { type: "apply_status"; status: StatusEffect; target?: CombatEffectTarget }
  | { type: "heal"; amount: number; target?: "self" }
  | { type: "gain_energy"; amount: number; target?: "self" }
  | { type: "gain_guard"; amount: number; duration?: number; target?: "self" };

export interface CombatTriggerDefinition {
  id: string;
  name: string;
  description: string;
  event: CombatTriggerEvent;
  chance?: number;
  conditions?: CombatTriggerCondition;
  effects: CombatEffectDefinition[];
  oncePerTurn?: boolean;
  cooldownTurns?: number;
}

export interface CombatFeatureBundle {
  passive?: PassiveBonuses;
  triggers?: CombatTriggerDefinition[];
}

export interface GearSetBonusDefinition extends CombatFeatureBundle {
  setId: string;
  setName: string;
  requiredPieces: number;
  description: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  target: TargetType;
  damageType?: DamageType;
  power?: number;
  scalingStat?: StatName;
  icon: string;
  branch: TalentBranch;
  effect?: "guard" | "bleed" | "poison" | "stun" | "heal" | "energy" | "vulnerable";
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  branch: TalentBranch;
  tier: number;
  cost: number;
  requires: string[];
  abilityId?: string;
  combat?: CombatFeatureBundle;
  /** Legacy passive shape; new bonuses should use combat.passive. */
  passive?: {
    stat?: StatName;
    amount?: number;
    maxHp?: number;
    maxEnergy?: number;
    energyRegen?: number;
    critChance?: number;
  };
}

export interface GearItem {
  id: string;
  name: string;
  slot: GearType;
  rarity: "common" | "uncommon" | "rare" | "epic";
  description: string;
  stats: Partial<Stats>;
  armor?: number;
  power?: number;
  set?: string;
  setName?: string;
  combat?: CombatFeatureBundle;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  power: number;
  armor: number;
  energyCost: number;
  intentText: string;
  attackDescription: string;
  onHitEffect?: "bleed";
  accent: string;
}

export interface EnemyState extends EnemyTemplate {
  instanceId: string;
  hp: number;
  energy: number;
  maxEnergy: number;
  statuses: StatusEffect[];
  stunned: boolean;
}

export interface TurnOrderEntry {
  actorId: string;
  kind: "player" | "enemy";
  name: string;
  roll: number;
  bonus: number;
  initiative: number;
}

export type CombatPendingEffect =
  | { id: string; eventIndex: number; type?: "damage"; targetId: "player" | string; damage: number; attackerId?: "player" | string }
  | { id: string; eventIndex: number; type: "status"; targetId: "player" | string; status: StatusEffect; stunned?: boolean }
  | { id: string; eventIndex: number; type: "turn"; activeTurnIndex: number; turn: number; playerActed?: boolean; playerStatuses?: StatusEffect[]; energy?: number };

export interface CombatState {
  turn: number;
  turnOrder: TurnOrderEntry[];
  activeTurnIndex: number;
  initiativeRevealed: boolean;
  playerActed: boolean;
  eventId: number;
  floatingEvents: string[];
  pendingEffects: CombatPendingEffect[];
  procUsage: Record<string, { lastTriggeredTurn: number }>;
  damagedTargets: string[];
  attackingActorId: "player" | string | null;
  attackAnimationId: number;
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  selectedEnemyId: string;
  enemies: EnemyState[];
  playerStatuses: StatusEffect[];
  log: Array<CombatLogEntry | string>;
  outcome: "active" | "victory" | "defeat";
}

export interface InspectableInfo {
  title: string;
  description: string;
  category: "ability" | "status";
}

export interface CombatLogEntry {
  id: string;
  text: string;
  info?: InspectableInfo;
}

export interface CharacterState {
  name: string;
  level: number;
  xp: number;
  gold: number;
  baseStats: Stats;
  talentPoints: number;
  unlockedTalents: string[];
  equippedAbilities: string[];
  inventory: GearItem[];
  equipment: Partial<Record<GearSlot, GearItem>>;
}

export interface AdventureNode {
  id: string;
  type: "combat" | "event" | "boss";
  eyebrow: string;
  title: string;
  description: string;
  enemies?: string[];
}

export interface AdventureProgress {
  active: boolean;
  nodeIndex: number;
  carryHp: number | null;
  combat: CombatState | null;
  eventResolved: boolean;
  latestLoot: GearItem | null;
  completed: boolean;
}

export interface GameState {
  characterCreated: boolean;
  character: CharacterState;
  adventure: AdventureProgress;
}
