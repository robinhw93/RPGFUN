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
}

export interface EnemyTemplate {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  power: number;
  armor: number;
  intentText: string;
  accent: string;
}

export interface EnemyState extends EnemyTemplate {
  instanceId: string;
  hp: number;
  statuses: StatusEffect[];
  stunned: boolean;
}

export interface CombatState {
  turn: number;
  eventId: number;
  floatingEvents: string[];
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  selectedEnemyId: string;
  enemies: EnemyState[];
  playerStatuses: StatusEffect[];
  log: string[];
  outcome: "active" | "victory" | "defeat";
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
  character: CharacterState;
  adventure: AdventureProgress;
}
