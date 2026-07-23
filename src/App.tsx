import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Backpack, BatteryLow, BookOpen, Brain, ChevronRight, CircleDot, Crosshair, Droplets, Dumbbell,
  EyeOff, Flame, FlaskConical, Footprints, Gem, Hand, Heart, HeartPulse, Home, Hourglass, Maximize2, Megaphone, Minus, Moon, Plus, RotateCcw, Shield,
  ShieldCheck, ShieldOff, ShieldPlus, Skull, Snail, Snowflake, Sparkles, Sun, Swords, Target, TrendingDown, Trophy,
  UserRound, Waves, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import { GameConfirmDialog } from "./components/GameConfirmDialog";
import { FloatingCombatText } from "./components/FloatingCombatText";
import { GEAR_ICON_URLS, GearSlotIcon } from "./components/GearSlotIcon";
import { TalentDevtool, TalentDevtoolAccessDialog } from "./components/TalentDevtool";
import { CHARACTER_AVATARS, DEFAULT_CHARACTER_AVATAR_ID, getCharacterAvatar } from "./game/avatars";
import { ABILITIES, ADVENTURE, ENDLESS_ADVENTURE, ENEMIES, GEAR_SET_BONUSES, TALENTS, TALENT_TREE_CANVAS } from "./game/data";
import { getDerivedStats, INITIAL_GAME } from "./game/character";
import { eventRevealsPlayerTurn, getCombatEventDurationMs, isCombatSequencePending, isHiddenDamageEvent, isHiddenPlayerAbilityEvent } from "./game/combatSequence";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCost, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers } from "./game/combatFeatures";
import { calculateInitiativeFlight, getInitiativeRowBounds } from "./game/initiativeLayout";
import { canEquipItemInSlot, equipGearItem, getGearCategoryLabel, getWeaponEquipType, isEquipmentSlotLocked, slotForItem, unequipGearItem } from "./game/gear";
import { experienceProgressAfterGain, experienceToNextLevel } from "./game/progression";
import { grantCombatReward } from "./game/rewards";
import { clearSave, loadGame, saveGame } from "./game/save";
import { STATUS_DURATION_SEGMENTS, STATUS_EFFECTS } from "./game/statusEffects";
import { areTalentRequirementsMet, getTalentConnectionIds } from "./game/talentRequirements";
import { createCombat, ensureCombatState, getCombatInitiative, selectEnemyTarget, takeEnemyTurn } from "./game/engine";
import { COMBAT_TIMING, INITIATIVE_TIMING } from "./game/timing";
import type { Ability, AdventureMode, AdventureNode, CharacterState, CombatAbilityAnimation, CombatAbilityVfxKind, CombatLogEntry, CombatPassiveAnimation, CombatProjectileAnimation, CombatReward, CombatState, CombatStatusAnimation, GameState, GearItem, GearSlot, InspectableInfo, StatName, StatusEffect, StatusEffectId } from "./game/types";
import type { CharacterAvatarId } from "./game/avatars";
import { useCombatEventSequencer } from "./hooks/useCombatEventSequencer";
import { projectCombatActionQueue, useCombatActionQueue, type QueuedCombatAction } from "./hooks/useCombatActionQueue";

type View = "adventure" | "character" | "talents" | "talentDevtool";

const SLOT_LABELS: Record<GearSlot, string> = {
  head: "Head", chest: "Chest", pants: "Pants", boots: "Boots",
  mainHand: "Main Hand", offHand: "Off Hand", ring1: "Ring I", ring2: "Ring II",
};

const EQUIPMENT_SLOT_ORDER: GearSlot[] = ["head", "chest", "pants", "boots", "mainHand", "offHand", "ring1", "ring2"];

type InventoryGearFilter = "all" | "head" | "chest" | "pants" | "boots" | "mainHand" | "offHand" | "ring";
type InventorySort = "rarity" | "name";

const INVENTORY_GEAR_FILTERS: Array<{ id: InventoryGearFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "head", label: "Head" },
  { id: "chest", label: "Chest" },
  { id: "pants", label: "Pants" },
  { id: "boots", label: "Boots" },
  { id: "mainHand", label: "Main Hand" },
  { id: "offHand", label: "Off Hand" },
  { id: "ring", label: "Rings" },
];

const RARITY_SORT_WEIGHT: Record<GearItem["rarity"], number> = { common: 0, uncommon: 1, rare: 2, epic: 3 };

function itemMatchesInventoryFilter(item: GearItem, filter: InventoryGearFilter): boolean {
  if (filter === "all") return true;
  if (filter === "ring") return item.slot === "ring";
  if (filter === "mainHand" || filter === "offHand") return canEquipItemInSlot(item, filter);
  return item.slot === filter;
}

const STAT_LABELS: Array<{ key: StatName; label: string }> = [
  { key: "strength", label: "Strength" },
  { key: "agility", label: "Agility" },
  { key: "intelligence", label: "Intelligence" },
  { key: "vitality", label: "Vitality" },
  { key: "luck", label: "Luck" },
];

const ATTRIBUTE_ICON_URLS: Record<StatName, string> = {
  strength: "/assets/attribute-icons/strength.png",
  agility: "/assets/attribute-icons/agility.png",
  intelligence: "/assets/attribute-icons/intelligence.png",
  vitality: "/assets/attribute-icons/vitality.png",
  luck: "/assets/attribute-icons/luck.png",
};

type DerivedStatIconName = "physicalPower" | "magicalPower" | "hitChance" | "dodgeChance" | "critChance" | "maxHp" | "armor" | "magicResistance" | "initiativeBonus" | "maxEnergy";
type StatIconName = StatName | DerivedStatIconName;

const DERIVED_STAT_ICON_URLS: Record<DerivedStatIconName, string> = {
  physicalPower: "/assets/stat-icons/physical-power.png",
  magicalPower: "/assets/stat-icons/magical-power.png",
  hitChance: "/assets/stat-icons/hit-chance.png",
  dodgeChance: "/assets/stat-icons/dodge-chance.png",
  critChance: "/assets/stat-icons/critical-chance.png",
  maxHp: "/assets/stat-icons/max-health.png",
  armor: "/assets/stat-icons/armor.png",
  magicResistance: "/assets/stat-icons/magic-resistance.png",
  initiativeBonus: "/assets/stat-icons/initiative.png",
  maxEnergy: "/assets/stat-icons/max-energy.png",
};

const STAT_ICON_URLS: Record<StatIconName, string> = { ...ATTRIBUTE_ICON_URLS, ...DERIVED_STAT_ICON_URLS };

function StatIcon({ stat }: { stat: StatIconName }) {
  return <img className="stat-icon" src={STAT_ICON_URLS[stat]} alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}

function GoldIcon() {
  return <img className="gold-icon" src="/assets/resource-icons/gold.png" alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}

const IMAGE_PRELOAD_CACHE = new Map<string, { image: HTMLImageElement; promise: Promise<void> }>();

function preloadImage(url: string): Promise<void> {
  const cached = IMAGE_PRELOAD_CACHE.get(url);
  if (cached) return cached.promise;
  const image = new Image();
  const promise = new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (typeof image.decode === "function") image.decode().catch(() => undefined).finally(resolve);
      else resolve();
    };
    image.onload = finish;
    image.onerror = finish;
    image.src = url;
    if (image.complete) finish();
  });
  // Keep the decoded image alive for the lifetime of the app. A cached network
  // response alone does not guarantee that a new DOM image is already decoded.
  IMAGE_PRELOAD_CACHE.set(url, { image, promise });
  return promise;
}

function preloadCharacterAssets(avatarUrl: string): Promise<void[]> {
  return Promise.all([...new Set([
    avatarUrl,
    ...Object.values(STAT_ICON_URLS),
    ...GEAR_ICON_URLS,
    "/assets/resource-icons/gold.png",
  ])].map(preloadImage));
}

function getAdventureNode(mode: AdventureMode, index: number): AdventureNode {
  return mode === "endless"
    ? { ...ENDLESS_ADVENTURE, eyebrow: `Training Fight ${index + 1}` }
    : ADVENTURE[index];
}

function rollDummyEncounter(): string[] {
  return Array.from({ length: Math.random() < 0.5 ? 2 : 3 }, () => "dummy");
}

function describeDummyEncounter(enemyIds: string[]): string {
  return `You encounter ${enemyIds.length} DUMMIES.`;
}

const STATUS_ICONS: Record<StatusEffectId, LucideIcon> = {
  guard: Shield,
  barrier: ShieldPlus,
  strengthened: Dumbbell,
  enlightened: Brain,
  fierce: Crosshair,
  shielded: ShieldCheck,
  regenerate: HeartPulse,
  taunt: Megaphone,
  stealth: EyeOff,
  evasion: Footprints,
  distraction: Sparkles,
  pinpoint: Crosshair,
  poison: FlaskConical,
  bleed: Droplets,
  burn: Flame,
  weaken: TrendingDown,
  shatter: ShieldOff,
  vulnerable: Target,
  stunned: Zap,
  diminishingReturns: ShieldCheck,
  exhausted: BatteryLow,
  slowed: Snail,
  reckless: Skull,
  wet: Waves,
  electrified: Zap,
  cold: Snowflake,
  charred: Flame,
  frozen: Snowflake,
  frozenPath: Footprints,
  blind: EyeOff,
  arcaneWound: CircleDot,
  arcaneCharge: Sparkles,
  staticCharge: Zap,
  chargedUp: Zap,
  burningMomentum: Flame,
  smite: Sun,
  sleep: Moon,
};

const ATTRIBUTE_TOOLTIPS: Record<StatName, string> = {
  strength: "Increases your Physical Power and the amount of Guard you gain.",
  agility: "Increases your Physical Power, Hit Chance, Dodge Chance, and Initiative. Every 2 Agility grants 1 Initiative.",
  intelligence: "Increases your Magical Power and Initiative. Every 4 Intelligence grants 1 Initiative.",
  vitality: "Increases your Max Health and the amount of healing you receive.",
  luck: "Increases your Critical Chance, improves the quality of loot you find, and increases the chance for special effects to trigger.",
};

const ATTRIBUTE_SUMMARIES: Record<StatName, string> = {
  strength: "Physical Power & Guard",
  agility: "Physical Power, Hit Chance, Dodge Chance & Initiative",
  intelligence: "Magical Power & Initiative",
  vitality: "Max Health & Healing Received",
  luck: "Critical Chance, Loot & Special Effects",
};

function getAvailableCharacterAbilities(character: CharacterState): Ability[] {
  const abilityIds = [
    "strike",
    "guard",
    ...TALENTS
      .filter((talent) => talent.abilityId && character.unlockedTalents.includes(talent.id))
      .map((talent) => talent.abilityId!),
  ];
  return [...new Set(abilityIds)].flatMap((abilityId) => ABILITIES[abilityId] ? [ABILITIES[abilityId]] : []);
}

function cloneInitial(): GameState {
  return JSON.parse(JSON.stringify(INITIAL_GAME)) as GameState;
}

function loadInitialGame(): GameState {
  const loaded = loadGame() ?? cloneInitial();
  if (!loaded.adventure.combat) return loaded;
  return {
    ...loaded,
    adventure: {
      ...loaded.adventure,
      combat: ensureCombatState(loaded.adventure.combat, loaded.character),
    },
  };
}

function App() {
  const [game, setGame] = useState<GameState>(loadInitialGame);
  const [view, setView] = useState<View>("adventure");
  const [travelTransition, setTravelTransition] = useState<{ phase: "travel" | "encounter"; dots: number; message: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [devtoolGateOpen, setDevtoolGateOpen] = useState(false);
  const [devtoolUnlocked, setDevtoolUnlocked] = useState(false);
  const [characterAssetsReady, setCharacterAssetsReady] = useState(false);
  const [playerTurnReadyEventId, setPlayerTurnReadyEventId] = useState<number | null>(null);
  const travelTimers = useRef<number[]>([]);
  const derived = useMemo(() => getDerivedStats(game.character), [game.character]);
  const combatSequencer = useCombatEventSequencer(game, setGame);
  const combatActionQueue = useCombatActionQueue(game, setGame, playerTurnReadyEventId);
  const combatLocked = game.adventure.combat?.outcome === "active";
  const activeNode = getAdventureNode(game.adventure.mode, game.adventure.nodeIndex);
  const isCombatScreen = view === "adventure" && Boolean(game.adventure.combat) && activeNode?.type !== "event";

  useEffect(() => {
    if (game.adventure.combat?.outcome !== "victory") return;
    setGame((current) => grantCombatReward(current));
  }, [game.adventure.combat?.outcome, game.adventure.nodeIndex]);

  useEffect(() => {
    if (game.adventure.combat?.outcome === "defeat") clearSave();
    else saveGame(game);
  }, [game]);
  useEffect(() => {
    document.body.classList.toggle("combat-open", isCombatScreen);
    return () => document.body.classList.remove("combat-open");
  }, [isCombatScreen]);
  useEffect(() => {
    document.body.classList.toggle("character-creation-open", !game.characterCreated);
    return () => document.body.classList.remove("character-creation-open");
  }, [game.characterCreated]);
  useEffect(() => () => travelTimers.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => setPlayerTurnReadyEventId(null), [game.adventure.active, game.adventure.mode, game.adventure.nodeIndex]);
  useEffect(() => {
    let cancelled = false;
    setCharacterAssetsReady(false);
    preloadCharacterAssets(getCharacterAvatar(game.character.avatarId).imageUrl).then(() => {
      if (!cancelled) setCharacterAssetsReady(true);
    });
    return () => { cancelled = true; };
  }, [game.character.avatarId]);

  const navigate = (next: View) => {
    if (view === "talentDevtool" && next !== "talentDevtool") setDevtoolUnlocked(false);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTalentDevtool = () => {
    setDevtoolUnlocked(false);
    setDevtoolGateOpen(true);
  };

  const unlockTalentDevtool = () => {
    setDevtoolGateOpen(false);
    setDevtoolUnlocked(true);
    setView("talentDevtool");
    window.scrollTo({ top: 0 });
  };

  const beginAdventure = (mode: AdventureMode) => {
    const enemyIds = mode === "endless" ? rollDummyEncounter() : ADVENTURE[0].enemies!;
    const combat = createCombat(game.character, enemyIds, derived.maxHp);
    setGame((current) => ({
      ...current,
      adventure: { mode, active: true, nodeIndex: 0, carryHp: derived.maxHp, combat, eventResolved: false, latestLoot: null, pendingReward: null, completed: false },
    }));
  };

  const selectEnemy = (enemyId: string) => {
    setGame((current) => current.adventure.combat ? ({
      ...current,
      adventure: { ...current.adventure, combat: selectEnemyTarget(current.adventure.combat, enemyId) },
    }) : current);
  };

  const runEnemyTurn = (actorId: string) => {
    setGame((current) => {
      if (!current.adventure.combat) return current;
      return {
        ...current,
        adventure: { ...current.adventure, combat: takeEnemyTurn(current.adventure.combat, current.character, actorId) },
      };
    });
  };

  const finishInitiativeRoll = () => {
    setGame((current) => {
      const combat = current.adventure.combat;
      if (!combat || combat.initiativeRevealed) return current;
      return { ...current, adventure: { ...current.adventure, combat: { ...combat, initiativeRevealed: true } } };
    });
  };

  const advanceJourney = (endlessEnemyIds?: string[]) => {
    setGame((current) => {
      const adventure = current.adventure;
      const wonCombat = adventure.combat?.outcome === "victory";
      const carryHp = wonCombat ? adventure.combat!.playerHp : (adventure.carryHp ?? getDerivedStats(current.character).maxHp);
      const character = current.character;
      const latestLoot = adventure.pendingReward?.loot ?? adventure.latestLoot;

      if (adventure.mode === "endless") {
        const maxHp = getDerivedStats(character).maxHp;
        const nextIndex = adventure.nodeIndex + 1;
        const combat = createCombat(character, endlessEnemyIds ?? rollDummyEncounter(), maxHp);
        return {
          ...current,
          adventure: {
            ...adventure,
            active: true,
            completed: false,
            nodeIndex: nextIndex,
            carryHp: maxHp,
            combat,
            eventResolved: false,
            latestLoot: null,
            pendingReward: null,
          },
        };
      }

      if (adventure.nodeIndex >= ADVENTURE.length - 1) {
        return {
          ...current,
          character,
          adventure: { ...adventure, active: false, completed: true, carryHp, latestLoot, pendingReward: null, combat: null },
        };
      }

      const nextIndex = adventure.nodeIndex + 1;
      const nextNode = ADVENTURE[nextIndex];
      const combat = nextNode.enemies ? createCombat(character, nextNode.enemies, carryHp) : null;
      return {
        ...current,
        character,
        adventure: { ...adventure, nodeIndex: nextIndex, carryHp, combat, eventResolved: false, latestLoot: wonCombat ? latestLoot : null, pendingReward: null },
      };
    });
  };

  const continueJourney = () => {
    if (travelTransition) return;
    if (game.adventure.mode === "story" && game.adventure.nodeIndex >= ADVENTURE.length - 1) {
      advanceJourney();
      return;
    }
    const endlessEnemyIds = game.adventure.mode === "endless" ? rollDummyEncounter() : undefined;
    const nextNode = game.adventure.mode === "endless" ? null : ADVENTURE[game.adventure.nodeIndex + 1];
    const message = endlessEnemyIds
      ? describeDummyEncounter(endlessEnemyIds)
      : nextNode?.enemies
        ? `You encounter ${nextNode.enemies.map((id) => ENEMIES[id].name).join(" and ")}.`
        : `You discover ${nextNode?.title}.`;
    setTravelTransition({ phase: "travel", dots: 1, message });
    const dotInterval = window.setInterval(() => {
      setTravelTransition((current) => current?.phase === "travel" ? { ...current, dots: Math.min(5, current.dots + 1) } : current);
    }, 500);
    const encounterTimer = window.setTimeout(() => {
      window.clearInterval(dotInterval);
      setTravelTransition({ phase: "encounter", dots: 5, message });
    }, 2500);
    const completeTimer = window.setTimeout(() => {
      advanceJourney(endlessEnemyIds);
      setTravelTransition(null);
    }, 4000);
    travelTimers.current = [dotInterval, encounterTimer, completeTimer];
  };

  const leaveTraining = () => {
    setGame((current) => {
      if (current.adventure.mode !== "endless" || current.adventure.combat?.outcome !== "victory") return current;
      return {
        ...current,
        adventure: {
          mode: "story",
          active: false,
          nodeIndex: 0,
          carryHp: null,
          combat: null,
          eventResolved: false,
          latestLoot: null,
          pendingReward: null,
          completed: false,
        },
      };
    });
  };

  const resolveEvent = (choice: "rest" | "ember") => {
    setGame((current) => {
      const maxHp = getDerivedStats(current.character).maxHp;
      const carryHp = current.adventure.carryHp ?? maxHp;
      if (choice === "rest") {
        return { ...current, adventure: { ...current.adventure, carryHp: Math.min(maxHp, carryHp + 24), eventResolved: true } };
      }
      return {
        ...current,
        character: { ...current.character, talentPoints: current.character.talentPoints + 1 },
        adventure: { ...current.adventure, carryHp: Math.max(1, carryHp - 10), eventResolved: true },
      };
    });
  };

  const unlockTalent = (talentId: string) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const talent = TALENTS.find((item) => item.id === talentId);
      const freeTestingUnlock = current.adventure.mode === "endless";
      if (!talent || current.character.unlockedTalents.includes(talentId) || (!freeTestingUnlock && talent.cost > current.character.talentPoints)) return current;
      if (!areTalentRequirementsMet(talent, current.character.unlockedTalents, TALENTS)) return current;
      const equipped = talent.abilityId && current.character.equippedAbilities.length < 6
        ? [...current.character.equippedAbilities, talent.abilityId]
        : current.character.equippedAbilities;
      return {
        ...current,
        character: {
          ...current.character,
          talentPoints: freeTestingUnlock ? current.character.talentPoints : current.character.talentPoints - talent.cost,
          unlockedTalents: [...current.character.unlockedTalents, talentId],
          equippedAbilities: equipped,
        },
      };
    });
  };

  const toggleAbility = (abilityId: string) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const equipped = current.character.equippedAbilities;
      const next = equipped.includes(abilityId) ? equipped.filter((id) => id !== abilityId) : equipped.length < 6 ? [...equipped, abilityId] : equipped;
      return { ...current, character: { ...current.character, equippedAbilities: next } };
    });
  };

  const setAbilitySlot = (slotIndex: number, abilityId: string | null) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active" || slotIndex < 0 || slotIndex >= 6) return current;
      const equipped = [...current.character.equippedAbilities];
      if (abilityId === null) {
        if (slotIndex >= equipped.length) return current;
        equipped.splice(slotIndex, 1);
      } else {
        const availableIds = new Set(getAvailableCharacterAbilities(current.character).map((ability) => ability.id));
        if (!availableIds.has(abilityId)) return current;
        const existingIndex = equipped.indexOf(abilityId);
        if (existingIndex === slotIndex) return current;
        if (slotIndex < equipped.length) {
          const replacedAbilityId = equipped[slotIndex];
          equipped[slotIndex] = abilityId;
          if (existingIndex >= 0) equipped[existingIndex] = replacedAbilityId;
        } else if (existingIndex < 0 && equipped.length < 6) {
          equipped.push(abilityId);
        }
      }
      return { ...current, character: { ...current.character, equippedAbilities: equipped } };
    });
  };

  const equipItem = (item: GearItem, preferredSlot?: GearSlot) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      return {
        ...current,
        character: equipGearItem(current.character, item, preferredSlot),
      };
    });
  };

  const unequipItem = (slot: GearSlot) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      return { ...current, character: unequipGearItem(current.character, slot) };
    });
  };

  const allocateStat = (stat: StatName) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active" || current.character.unspentStatPoints <= 0) return current;
      return {
        ...current,
        character: {
          ...current.character,
          unspentStatPoints: current.character.unspentStatPoints - 1,
          baseStats: { ...current.character.baseStats, [stat]: current.character.baseStats[stat] + 1 },
        },
      };
    });
  };

  const returnToCharacterCreation = () => {
    clearSave();
    setGame(cloneInitial());
    setView("adventure");
    setTravelTransition(null);
    setResetDialogOpen(false);
  };

  const createCharacter = (name: string, avatarId: CharacterAvatarId) => {
    setGame((current) => ({
      ...current,
      characterCreated: true,
      character: { ...current.character, name: name.trim(), avatarId },
    }));
    setView("adventure");
  };

  if (!game.characterCreated) return <CharacterCreation onCreate={createCharacter} />;

  return (
    <div
      className={`app-shell ${isCombatScreen ? "in-combat" : ""}`}
      style={{ "--attack-duration": `${COMBAT_TIMING.attackDurationMs * Math.max(0.1, game.adventure.combat?.attackAnimationDurationMultiplier ?? 1) / Math.max(1, game.adventure.combat?.attackAnimationHitCount ?? 1)}ms` } as React.CSSProperties}
    >
      <header className="topbar">
        <button className="brand" onClick={() => navigate("adventure")} aria-label="Go to adventure">
          <span className="brand-mark"><Sparkles size={17} /></span>
          <span><strong>EMBERFALL</strong><small>CHRONICLES</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Footprints size={17} />} label="Adventure" />
          <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<UserRound size={17} />} label="Character" />
          <NavButton active={view === "talents"} onClick={() => navigate("talents")} icon={<CircleDot size={17} />} label="Talents" />
        </nav>
        <div className="resources">
          <span><GoldIcon /> {game.character.gold}</span>
          <button className="icon-button devtool-menu-button" onClick={openTalentDevtool} data-game-tooltip="Developer tools" data-tooltip-placement="bottom" aria-label="Open developer tools"><Wrench size={14} /></button>
          <button className="icon-button" onClick={() => setResetDialogOpen(true)} data-game-tooltip="Reset save" data-tooltip-placement="bottom" aria-label="Reset save"><RotateCcw size={15} /></button>
        </div>
      </header>

      <main>
        {view === "adventure" && (
          <AdventureView
            game={game}
            derived={derived}
            onBegin={beginAdventure}
            onSelectEnemy={selectEnemy}
            queuedActions={combatActionQueue.actions}
            onAbility={combatActionQueue.queueAbility}
            onEndTurn={combatActionQueue.queueEndTurn}
            onEnemyTurn={runEnemyTurn}
            onCombatEvent={combatSequencer.revealEvent}
            onCombatSequenceComplete={combatSequencer.completeSequence}
            onPlayerTurnReady={setPlayerTurnReadyEventId}
            onInitiativeComplete={finishInitiativeRoll}
            onContinue={continueJourney}
            onLeaveTraining={leaveTraining}
            onEvent={resolveEvent}
            onPermadeath={returnToCharacterCreation}
            onTalents={() => navigate("talents")}
            onCharacter={() => navigate("character")}
          />
        )}
        {view === "character" && (
          <CharacterAssetBoundary preloaded={characterAssetsReady} assetKey={game.character.avatarId}>
            <CharacterView character={game.character} locked={combatLocked} onEquip={equipItem} onUnequip={unequipItem} onAllocateStat={allocateStat} />
          </CharacterAssetBoundary>
        )}
        {view === "talents" && <TalentsView character={game.character} locked={combatLocked} freeUnlocks={game.adventure.mode === "endless"} onUnlock={unlockTalent} onToggleAbility={toggleAbility} onSetAbilitySlot={setAbilitySlot} />}
        {view === "talentDevtool" && devtoolUnlocked && <TalentDevtool onExit={() => navigate("talents")} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Home size={19} />} label="Adventure" />
        <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<Backpack size={19} />} label="Gear" />
        <NavButton active={view === "talents"} onClick={() => navigate("talents")} icon={<CircleDot size={19} />} label="Talents" />
      </nav>
      {resetDialogOpen && (
        <GameConfirmDialog
          title="Erase this character?"
          description="This permanently deletes the character, equipment, talents, and adventure progress. This cannot be undone."
          confirmLabel="Erase & Begin Again"
          onCancel={() => setResetDialogOpen(false)}
          onConfirm={returnToCharacterCreation}
        />
      )}
      {devtoolGateOpen && <TalentDevtoolAccessDialog onClose={() => setDevtoolGateOpen(false)} onUnlock={unlockTalentDevtool} />}
      {travelTransition && (
        <div className={`travel-transition ${travelTransition.phase}`} role="status" aria-live="polite">
          <div className="travel-transition-content">
            {travelTransition.phase === "travel" && (
              <div className="travel-footsteps" aria-hidden="true">
                <Footprints /><Footprints />
              </div>
            )}
            <span>{travelTransition.phase === "travel" ? `${game.adventure.mode === "endless" ? "Returning to the proving grounds" : "Following the ashen road"}${".".repeat(travelTransition.dots)}` : travelTransition.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function CharacterCreation({ onCreate }: { onCreate: (name: string, avatarId: CharacterAvatarId) => void }) {
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<CharacterAvatarId>(DEFAULT_CHARACTER_AVATAR_ID);
  const trimmedName = name.trim();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedName) onCreate(trimmedName, avatarId);
  };
  return (
    <main className="character-creation">
      <section className="creation-card">
        <div className="creation-sigil"><UserRound size={28} /></div>
        <p className="eyebrow">A New Chronicle</p>
        <h1>Create Your Character</h1>
        <p>Choose the wanderer who will brave Emberfall. This journey uses permadeath: if your character falls, their progress and possessions are lost.</p>
        <form onSubmit={submit}>
          <fieldset className="avatar-picker">
            <legend>Choose appearance</legend>
            <div className="avatar-options">
              {CHARACTER_AVATARS.map((avatar) => (
                <label className={`avatar-option ${avatar.id === avatarId ? "selected" : ""}`} key={avatar.id}>
                  <input
                    type="radio"
                    name="character-avatar"
                    value={avatar.id}
                    checked={avatar.id === avatarId}
                    onChange={() => setAvatarId(avatar.id)}
                    aria-label={avatar.label}
                  />
                  <span className="avatar-option-image"><img src={avatar.imageUrl} alt="" loading={avatar.id === avatarId ? "eager" : "lazy"} decoding="async" draggable={false} /></span>
                  <span className="avatar-option-check" aria-hidden="true">✓</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="creation-name-field">
            <label htmlFor="character-name">Character name</label>
            <input
              id="character-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              autoComplete="off"
              placeholder="Enter a name"
            />
            <small>{name.length}/24</small>
          </div>
          <button className="primary-button" type="submit" disabled={!trimmedName}>Begin Chronicle <ChevronRight size={17} /></button>
        </form>
        <div className="permadeath-warning"><Skull size={16} /><span>Permadeath - Your character is erased when it dies.</span></div>
      </section>
    </main>
  );
}

function AdventureView({ game, derived, queuedActions, onBegin, onSelectEnemy, onAbility, onEndTurn, onEnemyTurn, onCombatEvent, onCombatSequenceComplete, onPlayerTurnReady, onInitiativeComplete, onContinue, onLeaveTraining, onEvent, onPermadeath, onTalents, onCharacter }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  queuedActions: QueuedCombatAction[];
  onBegin: (mode: AdventureMode) => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onEndTurn: () => void;
  onEnemyTurn: (actorId: string) => void;
  onCombatEvent: (eventId: number, eventIndex: number) => void;
  onCombatSequenceComplete: (eventId: number) => void;
  onPlayerTurnReady: (eventId: number) => void;
  onInitiativeComplete: () => void;
  onContinue: () => void;
  onLeaveTraining: () => void;
  onEvent: (choice: "rest" | "ember") => void;
  onPermadeath: () => void;
  onTalents: () => void;
  onCharacter: () => void;
}) {
  const adventure = game.adventure;
  const [logOpen, setLogOpen] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState<InspectableInfo | null>(null);
  const combatEventId = adventure.combat?.eventId ?? 0;
  const initiativePlaying = Boolean(adventure.combat && adventure.combat.outcome === "active" && !adventure.combat.initiativeRevealed);
  const sequencePending = Boolean(adventure.combat && isCombatSequencePending(adventure.combat));
  const activeActor = adventure.combat?.turnOrder?.[adventure.combat.activeTurnIndex];

  useEffect(() => {
    setLogOpen(false);
    setInspectedInfo(null);
  }, [adventure.nodeIndex]);
  useEffect(() => {
    if (!adventure.combat || adventure.combat.outcome !== "active" || initiativePlaying || sequencePending || logOpen || inspectedInfo || activeActor?.kind !== "enemy") return;
    const timer = window.setTimeout(() => onEnemyTurn(activeActor.actorId), 250);
    return () => window.clearTimeout(timer);
  }, [activeActor?.actorId, activeActor?.kind, adventure.combat?.outcome, combatEventId, initiativePlaying, inspectedInfo, logOpen, onEnemyTurn, sequencePending]);

  if (adventure.completed) {
    return (
      <section className="page narrow-page completion-page">
        <div className="boss-emblem"><Trophy size={34} /></div>
        <p className="eyebrow">Adventure Complete</p>
        <h1>The Black Gate Falls</h1>
        <p>The Warden's flame gutters out. Beyond the gate, Emberfall waits beneath a bruised and starless sky.</p>
        <div className="reward-strip">
          <span><strong>{game.character.level}</strong> Level</span><span><strong>{game.character.talentPoints}</strong> Talent Points</span><span><strong className="reward-value-with-icon"><GoldIcon />{game.character.gold}</strong> Gold</span>
        </div>
        <button className="primary-button" onClick={() => onBegin("story")}>Venture Forth Again <ChevronRight size={17} /></button>
        <button className="text-button" onClick={() => onBegin("endless")}>Enter Shadow Proving Grounds</button>
        <button className="text-button" onClick={onTalents}>Spend talent points</button>
      </section>
    );
  }

  if (!adventure.active) {
    return (
      <section className="page adventure-home">
        <div className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Available Adventure</p>
            <h1>The Ashen Road</h1>
            <p>Caravans vanish on the old imperial road. Follow their trail through the cinderwood and discover what guards the Black Gate.</p>
            <div className="adventure-tags"><span>Recommended Level 1</span><span>4 Encounters</span><span>Rare Loot</span></div>
            <button className="primary-button" onClick={() => onBegin("story")}>Begin Journey <ChevronRight size={18} /></button>
          </div>
          <div className="gate-art" aria-hidden="true"><div className="sun"/><div className="tower left"/><div className="tower right"/><div className="gate"/></div>
        </div>
        <div className="training-adventure-card">
          <div>
            <p className="eyebrow">Testing Adventure</p>
            <h2>Shadow Proving Grounds</h2>
            <p>An endless training route built for testing talents, abilities, and Shadow builds.</p>
            <div className="adventure-tags"><span>2–3 DUMMIES</span><span>100 Health</span><span>+2 Levels per Victory</span></div>
          </div>
          <button className="secondary-button" onClick={() => onBegin("endless")}>Begin Testing <ChevronRight size={18} /></button>
        </div>
        <div className="section-heading"><div><p className="eyebrow">Route Preview</p><h2>What lies ahead</h2></div><span className="muted">Progress saves automatically</span></div>
        <div className="route-grid">
          {ADVENTURE.map((node, index) => <RouteCard key={node.id} node={node} index={index} />)}
        </div>
      </section>
    );
  }

  const node = getAdventureNode(adventure.mode, adventure.nodeIndex);
  if (node.type === "event") {
    return (
      <section className="page narrow-page event-page">
        <ProgressHeader index={adventure.nodeIndex} mode={adventure.mode} />
        <div className="event-sigil">♢</div>
        <p className="eyebrow">{node.eyebrow}</p>
        <h1>{node.title}</h1>
        <p>{node.description}</p>
        {!adventure.eventResolved ? (
          <div className="event-choices">
            <button className="choice-card" onClick={() => onEvent("rest")}><Heart /><span><strong>Rest by the shrine</strong><small>Recover up to 24 Health.</small></span><ChevronRight /></button>
            <button className="choice-card danger" onClick={() => onEvent("ember")}><Sparkles /><span><strong>Touch the dying ember</strong><small>Lose 10 Health. Gain 1 Talent Point.</small></span><ChevronRight /></button>
          </div>
        ) : (
          <div className="outcome-panel"><p>The shrine accepts your choice. Its ancient light fades, and the road calls once more.</p><button className="primary-button" onClick={onContinue}>Continue Journey <ChevronRight size={17} /></button></div>
        )}
      </section>
    );
  }

  const combat = adventure.combat!;
  const damagedTargets = combat.damagedTargets ?? [];
  const missedTargets = combat.missedTargets ?? [];
  const passiveAnimations = combat.passiveAnimations ?? [];
  const poisonAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "poison");
  const bleedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "bleed");
  const electrifiedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "electrified");
  const frozenAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "frozen");
  const smiteAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "smite");
  const diminishingReturnsAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "diminishingReturns");
  const electrifiedPulseTargets = new Set(electrifiedAnimations.map((animation) => animation.targetId));
  const abilityAnimations = combat.abilityAnimations ?? [];
  const barrierPulseTargets = new Set(abilityAnimations.filter((animation) => animation.kind === "barrier_absorb").flatMap((animation) => animation.targetId ? [animation.targetId] : []));
  const poisonCloudAnimations = abilityAnimations.filter((animation) => animation.kind === "poison_cloud");
  const contagionAnimations = abilityAnimations.filter((animation) => animation.kind === "contagion" && animation.targetId && animation.sourceTargetId);
  const neurotoxinAnimations = abilityAnimations.filter((animation) => animation.kind === "neurotoxin");
  const toxicExplosionAnimations = abilityAnimations.filter((animation) => animation.kind === "toxic_explosion");
  const venombornAnimations = abilityAnimations.filter((animation) => animation.kind === "venomborn");
  const evasionAnimations = abilityAnimations.filter((animation) => animation.kind === "evasion" && animation.targetId === "player");
  const focusAnimations = abilityAnimations.filter((animation) => animation.kind === "focus" && animation.targetId === "player");
  const recuperateAnimations = abilityAnimations.filter((animation) => animation.kind === "recuperate" && animation.targetId === "player");
  const epidemicAnimations = abilityAnimations.filter((animation) => animation.kind === "epidemic");
  const pandemicAnimations = abilityAnimations.filter((animation) => animation.kind === "pandemic");
  const lightSpeedAnimations = abilityAnimations.filter((animation) => animation.kind === "light_speed");
  const voltageSiphonAnimations = abilityAnimations.filter((animation) => animation.kind === "voltage_siphon");
  const combustionSpreadAnimations = abilityAnimations.filter((animation) => animation.kind === "combustion_spread");
  const conductorAnimations = abilityAnimations.filter((animation) => animation.kind === "conductor" && !animation.targetId);
  const manaFractureAnimations = abilityAnimations.filter((animation) => animation.kind === "mana_fracture" && animation.targetId && animation.sourceTargetId);
  const essenceSiphonAnimations = abilityAnimations.filter((animation) => animation.kind === "essence_siphon" && animation.targetId && animation.sourceTargetId);
  const rideTheLightningAnimations = abilityAnimations.filter((animation) => animation.kind === "ride_the_lightning");
  const blizzardAnimation = abilityAnimations.find((animation) => animation.kind === "blizzard");
  const chargeReturnAnimations = abilityAnimations.filter((animation) => animation.kind === "charge" && animation.targetId && animation.sourceTargetId);
  const bloodBarrierAnimations = abilityAnimations.filter((animation) => animation.kind === "blood_barrier" && animation.targetId && animation.sourceTargetId);
  const vampirismDrainAnimations = abilityAnimations.filter((animation) => animation.kind === "vampirism_drain" && animation.targetId && animation.sourceTargetId);
  const fireEaterTransferAnimations = abilityAnimations.filter((animation) => animation.kind === "fire_eater_transfer" && animation.targetId && animation.sourceTargetId);
  const projectileAnimations = combat.projectileAnimations ?? [];
  const playerStealthed = combat.playerStatuses.some((status) => status.id === "stealth");
  const forcedTargetId = combat.enemies.find((enemy) => enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth") && enemy.statuses.some((status) => status.id === "taunt"))?.instanceId ?? null;
  const isPlayerTurn = activeActor?.kind === "player";
  const playerIncapacitated = combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep" || status.id === "frozen");
  const abilityInputUnavailable = initiativePlaying || playerIncapacitated;
  const handleCombatEventShown = (eventId: number, eventIndex: number) => {
    if (eventRevealsPlayerTurn(combat, eventIndex)) onPlayerTurnReady(eventId);
    onCombatEvent(eventId, eventIndex);
  };
  const queueProjection = projectCombatActionQueue(combat, game.character, queuedActions);
  const queuedEndTurnPosition = queuedActions.findIndex((action) => action.type === "end_turn") + 1;
  return (
    <section className={`combat-page compact-combat ${inspectedInfo ? "inspect-info-open" : ""}`}>
      <ProgressHeader index={adventure.nodeIndex} mode={adventure.mode} />
      <TurnOrderBar combat={combat} />
      {initiativePlaying && <InitiativeRoll key={`${adventure.nodeIndex}-${combat.eventId}`} combat={combat} onComplete={onInitiativeComplete} />}
      <div className="compact-arena">
        <article
          key="player"
          data-combatant-id="player"
          className={`compact-combatant player-combatant ${activeActor?.kind === "player" ? "active-turn" : ""} ${damagedTargets.includes("player") ? "damaged" : ""} ${combat.attackingActorId === "player" ? `attacking-right attack-cycle-${combat.attackAnimationId % 2}` : ""} ${playerStealthed ? "stealthed" : ""} ${combat.playerStatuses.some((status) => status.id === "frozen") ? "is-frozen" : ""} ${evasionAnimations.length > 0 ? "evasion-cast" : ""} ${focusAnimations.length > 0 ? "focus-cast" : ""} ${recuperateAnimations.length > 0 ? "recuperate-cast" : ""}`}
        >
          {(combat.playerStatuses.some((status) => status.id === "barrier") || barrierPulseTargets.has("player")) && <BarrierShimmer pulsing={barrierPulseTargets.has("player")} />}
          {poisonAnimations.filter((animation) => animation.targetId === "player").map((animation) => <PoisonApplicationEffect key={animation.id} />)}
          {bleedAnimations.filter((animation) => animation.targetId === "player").map((animation) => <BleedApplicationEffect key={animation.id} />)}
          {electrifiedPulseTargets.has("player") && <ElectrifiedApplicationEffect />}
          {frozenAnimations.some((animation) => animation.targetId === "player") && <FrozenApplicationEffect />}
          {smiteAnimations.filter((animation) => animation.targetId === "player").map((animation) => <SmiteApplicationEffect key={animation.id} />)}
          {diminishingReturnsAnimations.filter((animation) => animation.targetId === "player").map((animation) => <DiminishingReturnsApplicationEffect key={animation.id} />)}
          {venombornAnimations.filter((animation) => animation.targetId === "player").map((animation) => <VenombornHealingEffect key={animation.id} />)}
          {focusAnimations.map((animation) => <FocusCastEffect key={animation.id} />)}
          {recuperateAnimations.map((animation) => <RecuperateCastEffect key={animation.id} />)}
          {abilityAnimations.filter((animation) => animation.targetId === "player").map((animation) => <AbilityImpactEffect key={`player-${animation.id}`} kind={animation.kind} />)}
          {playerStealthed && <span className="stealth-smoke stealth-smoke-one" aria-hidden="true" />}
          {playerStealthed && <span className="stealth-smoke stealth-smoke-two" aria-hidden="true" />}
          <PassiveProcFloats animations={passiveAnimations.filter((animation) => animation.targetId === "player")} />
          <h2>{game.character.name}</h2>
          <div className="compact-resource-label"><span>Health</span><b>{combat.playerHp}/{combat.playerMaxHp}</b></div>
          <HealthBar value={combat.playerHp} max={combat.playerMaxHp} damageSource={combat.damageSourceLabels?.player} missed={missedTargets.includes("player")} />
          <div className="compact-status-row">
            {combat.playerStatuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} duration={status.duration} permanent={status.permanent} kind={status.kind} onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
          </div>
          <div className="compact-resource-label energy-label"><span>Energy</span><b>{combat.energy}/{combat.maxEnergy}</b></div>
          <EnergySegments value={combat.energy} max={combat.maxEnergy} regen={derived.energyRegen + (combat.nextTurnEnergyRegenBonus ?? 0)} showGain />
        </article>

        <div className={`compact-enemy-stack count-${combat.enemies.length}`}>
          {poisonCloudAnimations.map((animation) => <PoisonCloudEffect key={animation.id} />)}
          {epidemicAnimations.map((animation) => <EpidemicEffect key={animation.id} />)}
          {conductorAnimations.map((animation) => <ConductorFieldEffect key={animation.id} />)}
          {rideTheLightningAnimations.map((animation) => <span key={animation.id} className="ride-lightning-field" aria-hidden="true"><Zap /><i /><i /><i /><i /><i /></span>)}
          {blizzardAnimation && <BlizzardFieldEffect key={blizzardAnimation.id} />}
          {combat.enemies.map((enemy) => {
            const targetable = enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth") && (!forcedTargetId || forcedTargetId === enemy.instanceId);
            const neurotoxinEffects = neurotoxinAnimations.filter((animation) => animation.targetId === enemy.instanceId);
            const toxicExplosionEffects = toxicExplosionAnimations.filter((animation) => animation.targetId === enemy.instanceId);
            return (
            <article
              key={enemy.instanceId}
              data-combatant-id={enemy.instanceId}
              role="button"
              tabIndex={targetable ? 0 : -1}
              aria-disabled={!targetable}
              aria-label={`Target ${enemy.name}`}
              className={`compact-combatant enemy-combatant ${activeActor?.actorId === enemy.instanceId ? "active-turn" : ""} ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""} ${!targetable && enemy.hp > 0 ? "untargetable" : ""} ${enemy.statuses.some((status) => status.id === "stunned") ? "is-stunned" : ""} ${enemy.statuses.some((status) => status.id === "frozen") ? "is-frozen" : ""} ${damagedTargets.includes(enemy.instanceId) ? "damaged" : ""} ${combat.attackingActorId === enemy.instanceId ? `attacking-left attack-cycle-${combat.attackAnimationId % 2}` : ""} ${neurotoxinEffects.length > 0 ? "neurotoxin-hit" : ""}`}
              style={{ "--enemy-accent": enemy.accent } as React.CSSProperties}
              onClick={() => targetable && onSelectEnemy(enemy.instanceId)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && targetable && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelectEnemy(enemy.instanceId);
                }
              }}
            >
              {(enemy.statuses.some((status) => status.id === "barrier") || barrierPulseTargets.has(enemy.instanceId)) && <BarrierShimmer pulsing={barrierPulseTargets.has(enemy.instanceId)} />}
              {poisonAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <PoisonApplicationEffect key={animation.id} />)}
              {bleedAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <BleedApplicationEffect key={animation.id} />)}
              {electrifiedPulseTargets.has(enemy.instanceId) && <ElectrifiedApplicationEffect />}
              {frozenAnimations.some((animation) => animation.targetId === enemy.instanceId) && <FrozenApplicationEffect />}
              {smiteAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <SmiteApplicationEffect key={animation.id} />)}
              {diminishingReturnsAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <DiminishingReturnsApplicationEffect key={animation.id} />)}
              {neurotoxinEffects.map((animation) => <NeurotoxinEffect key={animation.id} />)}
              {toxicExplosionEffects.map((animation) => <ToxicExplosionEffect key={animation.id} />)}
              {abilityAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <AbilityImpactEffect key={`${enemy.instanceId}-${animation.id}`} kind={animation.kind} />)}
              <PassiveProcFloats animations={passiveAnimations.filter((animation) => animation.targetId === enemy.instanceId)} />
              <span className="compact-target"><Target size={11} /></span>
              <h2>{enemy.name}</h2>
              <div className="compact-resource-label"><span>Health</span><b>{enemy.hp}/{enemy.maxHp}</b></div>
              <HealthBar value={enemy.hp} max={enemy.maxHp} damageSource={combat.damageSourceLabels?.[enemy.instanceId]} missed={missedTargets.includes(enemy.instanceId)} />
              <div className="compact-status-row">
                {enemy.hp <= 0 ? <span className="no-status">Defeated</span> : enemy.statuses.length === 0 && <span className="no-status">No effects</span>}
                {enemy.statuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} duration={status.duration} permanent={status.permanent} kind={status.kind} onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
              </div>
              <div className="compact-resource-label energy-label"><span>Energy</span><b>{enemy.energy ?? 10}/{enemy.maxEnergy ?? 10}</b></div>
              <EnergySegments value={enemy.energy ?? 10} max={enemy.maxEnergy ?? 10} regen={1} />
            </article>
          );})}
        </div>
      </div>

      {poisonAnimations.filter((animation) => animation.sourceTargetId).map((animation) => <PoisonTransferAnimation key={animation.id} animation={animation} />)}
      {contagionAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path contagion-path"><FlaskConical /><i /><i /></CombatantPathEffect>)}
      {venombornAnimations.map((animation) => <VenombornTransferAnimation key={animation.id} animation={animation} />)}
      {pandemicAnimations.map((animation) => <PandemicSpreadEffect key={animation.id} animation={animation} statusIds={combat.enemies.find((enemy) => enemy.instanceId === animation.sourceTargetId)?.statuses.filter((status) => status.kind === "debuff").map((status) => status.id) ?? []} />)}
      {lightSpeedAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="light-speed-path"><Zap /><i /><i /></CombatantPathEffect>)}
      {voltageSiphonAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="voltage-siphon-path"><Zap /><HeartPulse /><i /></CombatantPathEffect>)}
      {combustionSpreadAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="combustion-spread-path"><Flame /><i /><i /></CombatantPathEffect>)}
      {manaFractureAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path mana-fracture-path"><CircleDot /><i /><i /></CombatantPathEffect>)}
      {essenceSiphonAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path essence-siphon-path"><CircleDot /><i /><i /><b /><b /></CombatantPathEffect>)}
      <LingeringThunderstormEffects animations={abilityAnimations} />
      <LingeringChargeSiphonEffects animations={abilityAnimations} />
      {chargeReturnAnimations.map((animation) => <CombatantBeamEffect key={animation.id} animation={animation} durationMs={COMBAT_TIMING.attackDurationMs} className="charge-lightning-path charge-return-path"><i /><i /><i /><b /></CombatantBeamEffect>)}
      {bloodBarrierAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="blood-barrier-path"><Droplets /><i /><i /><i /></CombatantPathEffect>)}
      {vampirismDrainAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="vampirism-drain-path"><Droplets /><Heart /><i /><i /><i /></CombatantPathEffect>)}
      {fireEaterTransferAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="fire-eater-transfer-path"><Flame /><i /><i /><i /><b /></CombatantPathEffect>)}
      {projectileAnimations.map((animation) => <AbilityProjectileEffect key={animation.id} animation={animation} />)}

      {sequencePending && <FloatingCombatText key={combat.eventId} eventId={combat.eventId} events={combat.floatingEvents} eventDurationsMs={combat.floatingEvents.map((_, eventIndex) => getCombatEventDurationMs(combat, eventIndex))} hiddenEventIndexes={combat.floatingEvents.flatMap((_, eventIndex) => isHiddenDamageEvent(combat, eventIndex) || isHiddenPlayerAbilityEvent(combat, eventIndex) ? [eventIndex] : [])} onEventShown={handleCombatEventShown} onSequenceComplete={onCombatSequenceComplete} />}

      <div className="compact-ability-grid">
        {game.character.equippedAbilities.map((id) => {
          const ability = ABILITIES[id];
          const cooldown = combat.abilityCooldowns?.[id] ?? 0;
          const selectedTarget = combat.enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId);
          const projectedTargetStatuses = queueProjection.targetStatusIds.get(combat.selectedEnemyId) ?? new Set<StatusEffectId>();
          const targetRequirementMet = !ability.requiredTargetStatus || projectedTargetStatuses.has(ability.requiredTargetStatus);
          const requiredStackMinimum = getCharacterAbilityModifiers(game.character, ability.id).find((modifier) => modifier.requiredTargetStatusStacksMinimum !== undefined)?.requiredTargetStatusStacksMinimum ?? ability.requiredTargetStatusStacks?.minimum;
          const targetStackRequirementMet = !ability.requiredTargetStatusStacks || (queueProjection.targetStatusStacks.get(combat.selectedEnemyId)?.get(ability.requiredTargetStatusStacks.status) ?? 0) >= (requiredStackMinimum ?? 0);
          const spreadTargetAvailable = !ability.spreadTargetStatus || combat.enemies.some((enemy) => (
            enemy.hp > 0
            && enemy.instanceId !== selectedTarget?.instanceId
            && !enemy.statuses.some((status) => status.id === "stealth")
          ));
          const selfRequirementMet = !ability.requiredSelfStatus
            || queueProjection.playerStatusIds.has(ability.requiredSelfStatus)
            || getCharacterAbilityModifiers(game.character, ability.id).some((modifier) => modifier.allowWithoutRequiredSelfStatus);
          const modifiedEnergyCost = getCharacterAbilityEnergyCostForTarget(game.character, ability, projectedTargetStatuses);
          const effectiveEnergyCost = queueProjection.nextAbilityIsFree ? 0 : modifiedEnergyCost;
          const effectiveCooldownTurns = getCharacterAbilityCooldownTurns(game.character, ability);
          const queuedCount = queuedActions.filter((action) => action.type === "ability" && action.abilityId === id).length;
          return <HoldAbilityButton key={id} ability={ability} description={getCharacterAbilityDescription(game.character, ability)} energyCost={effectiveEnergyCost} baseCooldown={effectiveCooldownTurns} cooldown={cooldown} queuedCount={queuedCount} disabled={abilityInputUnavailable || !isPlayerTurn || queueProjection.closed || cooldown > 0 || queueProjection.cooldownAbilityIds.has(id) || combat.outcome !== "active" || effectiveEnergyCost > queueProjection.energy || !targetRequirementMet || !targetStackRequirementMet || !spreadTargetAvailable || !selfRequirementMet} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <div className="combat-footer-controls">
        <button className="combat-log-button" onClick={() => setLogOpen(true)}><BookOpen size={14} /> Combat Log</button>
        <button className={`end-turn-button ${queuedEndTurnPosition > 0 ? "queued" : ""}`} disabled={initiativePlaying || !isPlayerTurn || combat.outcome !== "active" || queueProjection.closed} onClick={onEndTurn}>
          {queuedEndTurnPosition > 0 ? `End Turn Queued` : isPlayerTurn ? "End Turn" : `${activeActor?.name ?? "Enemy"}'s Turn`} <ChevronRight size={14} />
        </button>
      </div>

      {logOpen && (
        <div className="combat-log-modal" role="dialog" aria-modal="true" aria-label="Combat Log">
          <div className="combat-log-sheet">
            <div className="combat-log-title"><span><BookOpen size={16} /> Combat Log</span><button onClick={() => setLogOpen(false)} aria-label="Close combat log">×</button></div>
            <div>{combat.log.map((entry, index) => {
              const item: CombatLogEntry = typeof entry === "string"
                ? { id: `legacy-${index}`, text: entry }
                : entry;
              if (!item.info) return <p key={item.id} className={index === 0 ? "latest" : ""}>{item.text}</p>;
              const termIndex = item.text.toLocaleLowerCase().indexOf(item.info.title.toLocaleLowerCase());
              if (termIndex < 0) return <p key={item.id} className={index === 0 ? "latest" : ""}>{item.text}</p>;
              const termEnd = termIndex + item.info.title.length;
              return (
                <p key={item.id} className={`combat-log-entry ${index === 0 ? "latest" : ""}`}>
                  {item.text.slice(0, termIndex)}
                  <button type="button" className="combat-log-term" onClick={() => setInspectedInfo(item.info ?? null)}>
                    {item.text.slice(termIndex, termEnd)}
                  </button>
                  {item.text.slice(termEnd)}
                </p>
              );
            })}</div>
          </div>
        </div>
      )}

      {inspectedInfo && <InspectInfoModal info={inspectedInfo} onClose={() => setInspectedInfo(null)} />}

      {combat.outcome === "victory" && !sequencePending && adventure.pendingReward && (
        <VictoryScoreScreen
          reward={adventure.pendingReward}
          encounterTitle={node.title}
          onCharacter={onCharacter}
          onTalents={onTalents}
          onContinue={onContinue}
          onLeaveTraining={onLeaveTraining}
          finalEncounter={adventure.mode === "story" && adventure.nodeIndex === ADVENTURE.length - 1}
          endless={adventure.mode === "endless"}
        />
      )}
      {combat.outcome === "defeat" && !sequencePending && (
        <div className="compact-outcome defeat">
          <div className="compact-outcome-card">
            <Skull />
            <p className="eyebrow">Combat defeat</p>
            <h2>{game.character.name} has fallen</h2>
            <p>This chronicle ends here. All progress, equipment, and talents are lost.</p>
            <button className="primary-button" onClick={onPermadeath}>Create New Character <ChevronRight size={17} /></button>
          </div>
        </div>
      )}
    </section>
  );
}

function VictoryScoreScreen({ reward, encounterTitle, onCharacter, onTalents, onContinue, onLeaveTraining, finalEncounter, endless }: {
  reward: CombatReward;
  encounterTitle: string;
  onCharacter: () => void;
  onTalents: () => void;
  onContinue: () => void;
  onLeaveTraining: () => void;
  finalEncounter: boolean;
  endless: boolean;
}) {
  const [displayedExperience, setDisplayedExperience] = useState(0);
  const displayedProgress = experienceProgressAfterGain(reward.levelBefore, reward.xpBefore, displayedExperience);
  const displayLevelGain = displayedProgress.level - reward.levelBefore;

  useEffect(() => {
    setDisplayedExperience(0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayedExperience(reward.experience);
      return;
    }

    let frame = 0;
    const delay = window.setTimeout(() => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1700);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedExperience(Math.round(reward.experience * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    }, 450);

    return () => {
      window.clearTimeout(delay);
      window.cancelAnimationFrame(frame);
    };
  }, [reward.id, reward.experience]);

  return (
    <div className="victory-score-screen" role="dialog" aria-modal="true" aria-label="Combat rewards">
      <section className="victory-score-card">
        <header className="victory-score-heading">
          <span className="score-trophy"><Trophy size={25} /></span>
          <div><p className="eyebrow">Encounter Complete</p><h2>{encounterTitle}</h2></div>
        </header>

        <div className={`score-reward-totals ${reward.gold === 0 ? "single" : ""}`}>
          <span><Sparkles size={15} /><strong>+{reward.experience}</strong><small>Experience</small></span>
          {reward.gold > 0 && <span><GoldIcon /><strong>+{reward.gold}</strong><small>Gold</small></span>}
        </div>

        <div className="score-experience-panel">
          <div className="score-experience-meta"><strong>Level {displayedProgress.level}</strong><span>{displayedProgress.xp} / {displayedProgress.required} XP</span></div>
          <div className="score-experience-track" role="progressbar" aria-label="Experience progress" aria-valuemin={0} aria-valuemax={displayedProgress.required} aria-valuenow={displayedProgress.xp}>
            <i style={{ width: `${Math.min(100, (displayedProgress.xp / displayedProgress.required) * 100)}%` }} />
          </div>
          <small className="score-xp-count">+{displayedExperience} XP</small>
        </div>

        {reward.levelsGained > 0 && (
          <div className={`score-level-up ${displayLevelGain > 0 ? "revealed" : ""}`}>
            <strong>Level Up!</strong>
            <span>+{reward.levelsGained * 3} Attribute Points</span>
            <span>+{reward.levelsGained} Talent {reward.levelsGained === 1 ? "Point" : "Points"}</span>
          </div>
        )}

        {reward.loot && (
          <div className={`score-loot-card ${reward.loot.rarity}`}>
            <span className="score-loot-glyph"><GearSlotIcon slot={reward.loot.slot} item={reward.loot} size={24} /></span>
            <span><small>{reward.loot.rarity} · {getGearCategoryLabel(reward.loot)}</small><strong>{reward.loot.name}</strong><em>{reward.loot.description}</em></span>
          </div>
        )}

        <div className="victory-score-actions">
          <button className="score-character-button" onClick={onCharacter}><UserRound size={16} /> View Character</button>
          <button className="score-character-button" onClick={onTalents}><CircleDot size={16} /> Talents & Abilities</button>
          <button className="primary-button" onClick={onContinue}>{endless ? "Continue Training" : finalEncounter ? "Complete Adventure" : "Continue Journey"}<ChevronRight size={16} /></button>
        </div>
        {endless && <button className="text-button score-leave-training" onClick={onLeaveTraining}>Leave Training</button>}
      </section>
    </div>
  );
}

function RouteCard({ node, index }: { node: AdventureNode; index: number }) {
  const icons = [<Footprints />, <Gem />, <Swords />, <Trophy />];
  return <article className={`route-card ${node.type}`}><span className="route-number">0{index + 1}</span><span className="route-icon">{icons[index]}</span><p className="eyebrow">{node.eyebrow}</p><h3>{node.title}</h3><p>{node.description}</p></article>;
}

function ProgressHeader({ index, mode }: { index: number; mode: AdventureMode }) {
  if (mode === "endless") {
    return <div className="journey-progress endless"><span>Shadow Proving Grounds</span><div className="journey-progress-track" aria-hidden="true"><i style={{ width: "100%" }} /></div><span>Fight {index + 1}</span></div>;
  }
  const progress = ((index + 1) / ADVENTURE.length) * 100;
  return <div className="journey-progress"><span>The Ashen Road</span><div className="journey-progress-track" role="progressbar" aria-label="Adventure progress" aria-valuemin={0} aria-valuemax={ADVENTURE.length} aria-valuenow={index + 1}><i style={{ width: `${progress}%` }} /></div><span>{index + 1} / {ADVENTURE.length}</span></div>;
}

function InitiativeRoll({ combat, onComplete }: { combat: CombatState; onComplete: () => void }) {
  const [phase, setPhase] = useState<"rolling" | "landed" | "bonus" | "order">("rolling");
  const [displayedRolls, setDisplayedRolls] = useState<Record<string, number>>(() => Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, Math.floor(Math.random() * 100) + 1])));
  const [landingRect, setLandingRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [flightGeometry, setFlightGeometry] = useState<Record<string, { x: number; y: number; scaleX: number; scaleY: number }>>({});
  const neutralOrder = useMemo(() => {
    const player = combat.turnOrder.find((actor) => actor.kind === "player");
    const enemies = combat.enemies
      .map((enemy) => combat.turnOrder.find((actor) => actor.actorId === enemy.instanceId))
      .filter((actor): actor is CombatState["turnOrder"][number] => Boolean(actor));
    return player ? [player, ...enemies] : enemies;
  }, [combat.enemies, combat.turnOrder]);
  const participants = phase === "order" ? combat.turnOrder : neutralOrder;

  useEffect(() => {
    const captureLandingRect = () => {
      const targetCards = [...document.querySelectorAll<HTMLElement>(".turn-order-bar > div > span")];
      const bounds = getInitiativeRowBounds(targetCards.map((card) => card.getBoundingClientRect()));
      if (bounds) setLandingRect(bounds);
    };
    captureLandingRect();
    window.addEventListener("resize", captureLandingRect);
    return () => window.removeEventListener("resize", captureLandingRect);
  }, []);

  useEffect(() => {
    const rollTimer = window.setInterval(() => {
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, Math.floor(Math.random() * 100) + 1])));
    }, INITIATIVE_TIMING.rollTickMs);
    const landedTimer = window.setTimeout(() => {
      window.clearInterval(rollTimer);
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, actor.roll])));
      setPhase("landed");
    }, INITIATIVE_TIMING.rawRollMs);
    const bonusTimer = window.setTimeout(() => {
      setDisplayedRolls(Object.fromEntries(combat.turnOrder.map((actor) => [actor.actorId, actor.initiative])));
      setPhase("bonus");
    }, INITIATIVE_TIMING.bonusMs);
    let orderFrame = 0;
    const orderTimer = window.setTimeout(() => {
      const targetCards = [...document.querySelectorAll<HTMLElement>(".turn-order-bar > div > span")];
      const sourceCards = [...document.querySelectorAll<HTMLElement>(".initiative-overlay .initiative-contestant")];
      const nextGeometry: Record<string, { x: number; y: number; scaleX: number; scaleY: number }> = {};
      const bounds = getInitiativeRowBounds(targetCards.map((card) => card.getBoundingClientRect()));
      if (bounds) setLandingRect(bounds);
      sourceCards.forEach((sourceCard) => {
        const actorId = sourceCard.dataset.initiativeActor;
        const targetIndex = combat.turnOrder.findIndex((actor) => actor.actorId === actorId);
        const targetCard = targetCards[targetIndex];
        if (!actorId || !targetCard) return;
        const source = sourceCard.getBoundingClientRect();
        const target = targetCard.getBoundingClientRect();
        nextGeometry[actorId] = calculateInitiativeFlight(source, target);
      });
      setFlightGeometry(nextGeometry);
      orderFrame = window.requestAnimationFrame(() => setPhase("order"));
    }, INITIATIVE_TIMING.orderMs);
    const completeTimer = window.setTimeout(onComplete, INITIATIVE_TIMING.completeMs);
    return () => {
      window.clearInterval(rollTimer);
      window.clearTimeout(landedTimer);
      window.clearTimeout(bonusTimer);
      window.clearTimeout(orderTimer);
      window.clearTimeout(completeTimer);
      window.cancelAnimationFrame(orderFrame);
    };
  }, [combat.eventId]);

  return (
    <div
      className={`initiative-overlay ${phase}`}
      style={{ "--initiative-flight-duration": `${INITIATIVE_TIMING.flightMs}ms` } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Rolling initiative"
    >
      <div className="initiative-panel">
        <p className="eyebrow">Combat Begins</p>
        <h2>{phase === "rolling" ? "Rolling Initiative" : phase === "landed" ? "Rolls Locked" : phase === "bonus" ? "Applying Bonuses" : "Turn Order"}</h2>
        <p className="initiative-caption" aria-live="polite">{phase === "rolling" ? "The D100 counters are racing." : phase === "landed" ? "\u00A0" : phase === "bonus" ? "Initiative bonuses are now added." : "Highest initiative acts first."}</p>
        <div className="initiative-contestants" style={{
          "--initiative-count": participants.length,
          ...(landingRect ? {
            "--initiative-target-top": `${landingRect.top}px`,
            "--initiative-target-left": `${landingRect.left}px`,
            "--initiative-target-width": `${landingRect.width}px`,
            "--initiative-target-height": `${landingRect.height}px`,
          } : {}),
        } as React.CSSProperties}>
          {participants.map((actor, index) => {
            const geometry = flightGeometry[actor.actorId];
            return (
              <article
                className={`initiative-contestant ${actor.kind}`}
                data-initiative-actor={actor.actorId}
                key={actor.actorId}
                style={{
                  "--initiative-delay": `${index * 90}ms`,
                  "--initiative-from-x": `${geometry?.x ?? 0}px`,
                  "--initiative-from-y": `${geometry?.y ?? 0}px`,
                  "--initiative-from-scale-x": geometry?.scaleX ?? 1,
                  "--initiative-from-scale-y": geometry?.scaleY ?? 1,
                } as React.CSSProperties}
              >
                <strong className="initiative-name">{actor.kind === "player" ? "You" : actor.name}</strong>
                <div className={`initiative-counter ${phase}`} aria-label={`D100 result ${displayedRolls[actor.actorId]}`}>
                  <span>{displayedRolls[actor.actorId]}</span>
                </div>
                <small className="initiative-counter-label">{phase === "rolling" ? "Rolling D100" : phase === "landed" ? "Raw roll" : "Final initiative"}</small>
                <div className="initiative-math">
                  {phase === "landed" ? <span>D100 = {actor.roll}</span> : phase === "bonus" ? <span>{actor.roll}{actor.bonus > 0 ? ` + ${actor.bonus} bonus` : " + 0 bonus"}</span> : <span>&nbsp;</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TurnOrderBar({ combat }: { combat: CombatState }) {
  const rowElement = useRef<HTMLDivElement | null>(null);
  const cardElements = useRef(new Map<string, HTMLSpanElement>());
  const previousPositions = useRef(new Map<string, DOMRect>());
  const reorderAnimations = useRef(new Map<string, Animation>());
  const orderSignature = combat.turnOrder.map((actor) => actor.actorId).join("|");
  const lightSpeedTurn = (combat.abilityAnimations ?? []).some((animation) => animation.kind === "light_speed_turn");

  useLayoutEffect(() => {
    reorderAnimations.current.forEach((animation) => animation.cancel());
    reorderAnimations.current.clear();

    const nextPositions = new Map<string, DOMRect>();
    cardElements.current.forEach((element, actorId) => nextPositions.set(actorId, element.getBoundingClientRect()));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion && previousPositions.current.size > 0) {
      nextPositions.forEach((nextPosition, actorId) => {
        const previousPosition = previousPositions.current.get(actorId);
        const element = cardElements.current.get(actorId);
        if (!previousPosition || !element) return;
        const x = previousPosition.left - nextPosition.left;
        const y = previousPosition.top - nextPosition.top;
        if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
        const animation = element.animate(
          [{ transform: `translate3d(${x}px, ${y}px, 0)` }, { transform: "translate3d(0, 0, 0)" }],
          { duration: COMBAT_TIMING.turnOrderReorderMs, easing: "cubic-bezier(.2,.82,.2,1)" },
        );
        reorderAnimations.current.set(actorId, animation);
        animation.onfinish = () => reorderAnimations.current.delete(actorId);
        animation.oncancel = () => reorderAnimations.current.delete(actorId);
      });
    }

    previousPositions.current = nextPositions;
  }, [orderSignature]);

  useEffect(() => {
    const updatePositions = () => {
      if (reorderAnimations.current.size > 0) return;
      previousPositions.current = new Map(
        [...cardElements.current].map(([actorId, element]) => [actorId, element.getBoundingClientRect()]),
      );
    };
    const resizeObserver = new ResizeObserver(updatePositions);
    if (rowElement.current) resizeObserver.observe(rowElement.current);
    return () => {
      resizeObserver.disconnect();
      reorderAnimations.current.forEach((animation) => animation.cancel());
      reorderAnimations.current.clear();
    };
  }, []);

  return (
    <div className={`turn-order-bar ${lightSpeedTurn ? "light-speed-turn" : ""}`} aria-label={`Turn order, round ${combat.turn}`}>
      <span className="round-label">Round {combat.turn}</span>
      <div ref={rowElement}>
        {combat.turnOrder.map((actor, index) => {
          const enemy = actor.kind === "enemy" ? combat.enemies.find((candidate) => candidate.instanceId === actor.actorId) : null;
          const defeated = actor.kind === "player" ? combat.playerHp <= 0 : (enemy?.hp ?? 0) <= 0;
          const currentTarget = Boolean(enemy && enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth"));
          const initiative = getCombatInitiative(combat, actor);
          return (
            <span
              key={actor.actorId}
              ref={(element) => {
                if (element) cardElements.current.set(actor.actorId, element);
                else cardElements.current.delete(actor.actorId);
              }}
              data-turn-actor={actor.actorId}
              className={`${index === combat.activeTurnIndex ? "active" : ""} ${defeated ? "defeated" : ""} ${currentTarget ? "current-target" : ""} ${actor.kind}`}
              data-game-tooltip={`${actor.name}: ${initiative} Initiative${currentTarget ? " · Current target" : ""}`}
              data-tooltip-placement="bottom"
              aria-label={`${actor.kind === "player" ? "You" : actor.name}, ${initiative} Initiative${currentTarget ? ", current target" : ""}`}
            >
              <span className="turn-order-name">{currentTarget && <Target className="turn-order-target-icon" size={10} aria-hidden="true" />}<b>{actor.kind === "player" ? "You" : actor.name}</b></span>
              <small>{initiative}</small>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PoisonApplicationEffect() {
  return <span className="poison-application-effect" aria-hidden="true" />;
}

function BleedApplicationEffect() {
  return (
    <span className="bleed-application-effect" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <i key={index} style={{ "--blood-left": `${8 + index * 14}%`, "--blood-delay": `${index * 38}ms`, "--blood-distance": `${100 + (index % 3) * 24}px` } as React.CSSProperties} />
      ))}
    </span>
  );
}

function PoisonCloudEffect() {
  return (
    <span className="poison-cloud-effect" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--smoke-left": `${3 + index * 13}%`, "--smoke-delay": `${index * 45}ms` } as React.CSSProperties} />)}
    </span>
  );
}

function NeurotoxinEffect() {
  return (
    <span className="neurotoxin-effect" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function ToxicExplosionEffect() {
  return (
    <span className="toxic-explosion-effect" aria-hidden="true">
      <b>☣</b>
      <i className="toxic-wave" />
      {Array.from({ length: 7 }).map((_, index) => <i className="toxic-particle" key={index} style={{ "--particle-angle": `${index * (360 / 7)}deg`, "--particle-delay": `${index * 18}ms` } as React.CSSProperties} />)}
    </span>
  );
}

function FocusCastEffect() {
  return (
    <span className="focus-cast-effect" aria-hidden="true">
      <i className="focus-ring focus-ring-outer" />
      <i className="focus-ring focus-ring-inner" />
      <Crosshair />
      <b />
    </span>
  );
}

function RecuperateCastEffect() {
  return (
    <span className="recuperate-cast-effect" aria-hidden="true">
      <i className="recuperate-wave recuperate-wave-one" />
      <i className="recuperate-wave recuperate-wave-two" />
      <BatteryLow />
      {Array.from({ length: 6 }).map((_, index) => (
        <b key={index} style={{ "--energy-particle-x": `${14 + index * 14}%`, "--energy-particle-delay": `${index * 42}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}

function FrozenApplicationEffect() {
  return <span className="frozen-application-effect" aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
}

function SmiteApplicationEffect() {
  return <span className="smite-application-effect" aria-hidden="true"><Sun /><i /><i /><i /><i /></span>;
}

function DiminishingReturnsApplicationEffect() {
  return <span className="diminishing-returns-application-effect" aria-hidden="true"><ShieldCheck /><i /><i /><i /></span>;
}

function ConductorFieldEffect() {
  return <span className="conductor-field-effect" aria-hidden="true"><Zap />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--conductor-x": `${5 + index * 15}%`, "--conductor-delay": `${index * 34}ms` } as React.CSSProperties} />)}</span>;
}

function BlizzardFieldEffect() {
  return (
    <span className="blizzard-field-effect" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, index) => (
        <Snowflake key={index} style={{
          "--blizzard-top": `${-8 + (index % 10) * 11}%`,
          "--blizzard-delay": `${(index % 7) * 48}ms`,
          "--blizzard-duration": `${520 + (index % 5) * 85}ms`,
          "--blizzard-size": `${10 + (index % 4) * 4}px`,
          "--blizzard-drop": `${45 + (index % 6) * 13}px`,
        } as React.CSSProperties} />
      ))}
      {Array.from({ length: 7 }).map((_, index) => <b key={index} style={{ "--gust-top": `${8 + index * 13}%`, "--gust-delay": `${index * 42}ms` } as React.CSSProperties} />)}
    </span>
  );
}

function BarrierShimmer({ pulsing }: { pulsing: boolean }) {
  return <span className={`barrier-shimmer ${pulsing ? "barrier-shimmer-pulse" : ""}`} aria-hidden="true"><i /><i /><b /></span>;
}

function AbilityImpactEffect({ kind }: { kind: CombatAbilityVfxKind }) {
  if (kind === "guard") {
    return <span className="ability-impact-effect guard-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /></span>;
  }
  if (kind === "ambush") {
    return <span className="ability-impact-effect ambush-impact" aria-hidden="true"><Moon /><i /><i /><i /></span>;
  }
  if (kind === "venomous_strike" || kind === "slowing_venom" || kind === "weakening_venom" || kind === "rabid_venom") {
    return <span className={`ability-impact-effect venom-impact ${kind}`} aria-hidden="true"><FlaskConical /><i /><i /><i /></span>;
  }
  if (kind === "flurry" || kind === "slice_and_dice") {
    return <span className={`ability-impact-effect slash-storm-impact ${kind}`} aria-hidden="true"><Swords /><i /><i /><i /><i /></span>;
  }
  if (kind === "lightning_strike" || kind === "light_speed") {
    return <span className={`ability-impact-effect lightning-impact ${kind}`} aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "sharpened_blade") {
    return <span className="ability-impact-effect sharpened-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /></span>;
  }
  if (kind === "pinpoint_slice") {
    return <span className="ability-impact-effect pinpoint-impact" aria-hidden="true"><Crosshair /><b /></span>;
  }
  if (kind === "chain_assassination") {
    return <span className="ability-impact-effect chain-impact" aria-hidden="true"><Skull /><i /><i /><i /></span>;
  }
  if (kind === "cull_the_weak") {
    return <span className="ability-impact-effect cull-impact" aria-hidden="true"><Target />{Array.from({ length: 6 }).map((_, index) => <i key={index} style={{ "--cull-angle": `${index * 60}deg` } as React.CSSProperties} />)}</span>;
  }
  if (kind === "voltage_siphon") {
    return <span className="ability-impact-effect voltage-siphon-impact" aria-hidden="true"><Zap /><HeartPulse /><i /></span>;
  }
  if (kind === "light_speed_turn") {
    return <span className="ability-impact-effect light-speed-turn-impact" aria-hidden="true"><Zap /><Sparkles /><i /><i /></span>;
  }
  if (kind === "arcane_bolt") {
    return <span className="ability-impact-effect arcane-bolt-impact" aria-hidden="true"><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "frostbolt") {
    return <span className="ability-impact-effect frostbolt-impact" aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
  }
  if (kind === "arcane_blast") {
    return <span className="ability-impact-effect arcane-blast-impact" aria-hidden="true"><CircleDot /><i /><i /><i /></span>;
  }
  if (kind === "fireball") {
    return <span className="ability-impact-effect fireball-impact" aria-hidden="true"><Flame /><i /><i /><i /><i /></span>;
  }
  if (kind === "lightning_beam") {
    return <span className="ability-impact-effect lightning-beam-impact" aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "thunderstorm") {
    return <span className="ability-impact-effect thunderstorm-impact" aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "deep_freeze") {
    return <span className="ability-impact-effect deep-freeze-impact" aria-hidden="true"><Snowflake /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "arcane_overload") {
    return <span className="ability-impact-effect arcane-overload-impact" aria-hidden="true"><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "combustion" || kind === "combustion_spread") {
    return <span className={`ability-impact-effect combustion-impact ${kind}`} aria-hidden="true"><Flame />{Array.from({ length: 6 }).map((_, index) => <i key={index} style={{ "--combustion-angle": `${index * 60}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "arcane_combustion") {
    return <span className="ability-impact-effect arcane-combustion-impact" aria-hidden="true"><CircleDot /><Flame /><i /><i /><i /></span>;
  }
  if (kind === "thundersnow") {
    return <span className="ability-impact-effect thundersnow-impact" aria-hidden="true"><Snowflake /><Zap />{Array.from({ length: 5 }).map((_, index) => <i key={index} style={{ "--thundersnow-x": `${12 + index * 19}%`, "--thundersnow-delay": `${index * 38}ms` } as React.CSSProperties} />)}</span>;
  }
  if (kind === "self_immolation") {
    return <span className="ability-impact-effect self-immolation-impact" aria-hidden="true"><Flame />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--immolation-angle": `${index * 51}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "firestorm") {
    return <span className="ability-impact-effect firestorm-impact" aria-hidden="true"><Flame />{Array.from({ length: 9 }).map((_, index) => <i key={index} style={{ "--firestorm-x": `${5 + index * 11.25}%`, "--firestorm-delay": `${index * 34}ms` } as React.CSSProperties} />)}<b /><b /></span>;
  }
  if (kind === "arcane_barrier") {
    return <span className="ability-impact-effect arcane-barrier-impact" aria-hidden="true"><ShieldPlus /><i /><i /><i /></span>;
  }
  if (kind === "frozen_path") {
    return <span className="ability-impact-effect frozen-path-impact" aria-hidden="true"><Footprints /><Snowflake /><i /><i /><i /></span>;
  }
  if (kind === "conductor") {
    return <span className="ability-impact-effect conductor-impact" aria-hidden="true"><Zap /><i /><i /><i /><i /></span>;
  }
  if (kind === "mana_fracture" || kind === "focused_blast") {
    return <span className={`ability-impact-effect new-arcane-impact ${kind}`} aria-hidden="true"><CircleDot /><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "rapid_fire") {
    return <span className="ability-impact-effect rapid-fire-impact" aria-hidden="true"><Flame /><i /><i /><i /><i /></span>;
  }
  if (kind === "essence_siphon") {
    return <span className="ability-impact-effect essence-siphon-impact" aria-hidden="true"><CircleDot /><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "absolute_zero") {
    return <span className={`ability-impact-effect new-frost-impact ${kind}`} aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
  }
  if (kind === "blizzard") return null;
  if (kind === "ride_the_lightning" || kind === "charge") {
    return <span className={`ability-impact-effect new-lightning-impact ${kind}`} aria-hidden="true"><Zap /><i /><i /><i /><i /></span>;
  }
  if (kind === "elemental_fury") {
    return <span className="ability-impact-effect elemental-fury-impact" aria-hidden="true"><Flame /><Snowflake /><Zap /><CircleDot />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--elemental-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "phoenix_heart") {
    return <span className="ability-impact-effect phoenix-heart-impact" aria-hidden="true"><Flame /><Heart />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--phoenix-angle": `${index * 51.4}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "searing_strike" || kind === "wounding_strike" || kind === "swift_blade" || kind === "flame_cleave" || kind === "bloodletting") {
    const icon = kind === "searing_strike" || kind === "flame_cleave" ? <Flame /> : <Swords />;
    return <span className={`ability-impact-effect brute-slash-impact ${kind}`} aria-hidden="true">{icon}<i /><i /><i /><b /></span>;
  }
  if (kind === "shield_bash") {
    return <span className="ability-impact-effect shield-bash-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "holy_strike") {
    return <span className="ability-impact-effect holy-strike-impact" aria-hidden="true"><Sparkles /><Heart /><i /><i /><i /><b /></span>;
  }
  if (kind === "unbreakable") {
    return <span className="ability-impact-effect unbreakable-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "blood_barrier") {
    return <span className="ability-impact-effect blood-barrier-impact" aria-hidden="true"><Droplets /><ShieldPlus /><i /><i /><b /></span>;
  }
  if (kind === "burning_guard") {
    return <span className="ability-impact-effect burning-guard-impact" aria-hidden="true"><Shield /><Flame /><i /><i /><i /><b /></span>;
  }
  if (kind === "lay_on_hands") {
    return <span className="ability-impact-effect lay-on-hands-impact" aria-hidden="true"><Hand /><Heart /><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "shield_charge") {
    return <span className="ability-impact-effect shield-charge-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "bloodbath") {
    return <span className="ability-impact-effect bloodbath-impact" aria-hidden="true"><Swords /><Droplets /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "furnace_breaker") {
    return <span className="ability-impact-effect furnace-breaker-impact" aria-hidden="true"><Flame /><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "divine_smite" || kind === "smite_retribution") {
    return <span className={`ability-impact-effect divine-smite-impact ${kind}`} aria-hidden="true"><Sun /><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "blood_frenzy") {
    return <span className="ability-impact-effect blood-frenzy-impact" aria-hidden="true"><Swords /><Droplets /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "crushing_impact") {
    return <span className="ability-impact-effect crushing-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "explosive_strike" || kind === "explosive_strike_blast") {
    return <span className={`ability-impact-effect explosive-strike-impact ${kind}`} aria-hidden="true"><Flame />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--explosive-angle": `${index * 51.43}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "consecrated_ground") {
    return <span className="ability-impact-effect consecrated-ground-impact" aria-hidden="true"><Sun /><Sparkles />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--consecrated-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "bash") {
    return <span className="ability-impact-effect bash-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "brute_guard") {
    return <span className="ability-impact-effect brute-guard-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "defensive_maneuvers") {
    return <span className="ability-impact-effect defensive-maneuvers-impact" aria-hidden="true"><Shield /><Swords /><i /><i /><i /><b /></span>;
  }
  if (kind === "vampirism" || kind === "vampirism_drain") {
    return <span className={`ability-impact-effect vampirism-impact ${kind}`} aria-hidden="true"><Droplets /><Heart /><i /><i /><i /><b /></span>;
  }
  if (kind === "fire_eater" || kind === "fire_eater_transfer") {
    return <span className={`ability-impact-effect fire-eater-impact ${kind}`} aria-hidden="true"><Flame /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "beacon_of_light") {
    return <span className="ability-impact-effect beacon-of-light-impact" aria-hidden="true"><Sun /><Sparkles />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--beacon-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "martyrdom") {
    return <span className="ability-impact-effect martyrdom-impact" aria-hidden="true"><Heart /><Flame /><i /><i /><i /><b /></span>;
  }
  return null;
}

function EpidemicEffect() {
  return (
    <span className="epidemic-effect" aria-hidden="true">
      <b>☣</b>
      {Array.from({ length: 11 }).map((_, index) => (
        <i key={index} style={{ "--epidemic-left": `${2 + index * 9.4}%`, "--epidemic-delay": `${index * 38}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}

function CombatantPathEffect({ animation, className, children, durationMs }: { animation: Pick<CombatAbilityAnimation, "id" | "sourceTargetId" | "targetId">; className: string; children: ReactNode; durationMs?: number }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 16,
      top: sourceY - 16,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className={`combatant-path-effect ${className}`}
      style={{ left: path.left, top: path.top, "--path-x": `${path.x}px`, "--path-y": `${path.y}px`, ...(durationMs ? { "--projectile-flight": `${durationMs}ms` } : {}) } as React.CSSProperties}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function CombatantBeamEffect({ animation, className, children, durationMs }: { animation: Pick<CombatAbilityAnimation, "id" | "sourceTargetId" | "targetId">; className: string; children: ReactNode; durationMs: number }) {
  const [beam, setBeam] = useState<{ left: number; top: number; length: number; angle: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    setBeam({
      left: sourceX,
      top: sourceY,
      length: Math.hypot(targetX - sourceX, targetY - sourceY),
      angle: Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!beam) return null;
  return (
    <span
      className={`combatant-beam-effect ${className}`}
      style={{ left: beam.left, top: beam.top, width: beam.length, "--beam-angle": `${beam.angle}deg`, "--beam-duration": `${durationMs}ms` } as React.CSSProperties}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function useLingeringAbilityAnimations(animations: CombatAbilityAnimation[], kind: CombatAbilityVfxKind, durationMs: number) {
  const [visible, setVisible] = useState<CombatAbilityAnimation[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const incoming = animations.filter((animation) => animation.kind === kind && animation.targetId);
    if (incoming.length === 0) return;
    setVisible((current) => [...current, ...incoming.filter((animation) => !current.some((existing) => existing.id === animation.id))]);
    incoming.forEach((animation) => {
      if (timers.current.has(animation.id)) return;
      const timer = window.setTimeout(() => {
        setVisible((current) => current.filter((existing) => existing.id !== animation.id));
        timers.current.delete(animation.id);
      }, durationMs);
      timers.current.set(animation.id, timer);
    });
  }, [animations, durationMs, kind]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return visible;
}

function LingeringChargeSiphonEffects({ animations }: { animations: CombatAbilityAnimation[] }) {
  const visible = useLingeringAbilityAnimations(animations, "charge_siphon", COMBAT_TIMING.attackImpactMs);

  return visible.map((animation) => (
    <CombatantBeamEffect key={animation.id} animation={animation} durationMs={COMBAT_TIMING.attackImpactMs} className="charge-lightning-path charge-siphon-path">
      <i /><i /><i /><b />
    </CombatantBeamEffect>
  ));
}

function LingeringThunderstormEffects({ animations }: { animations: CombatAbilityAnimation[] }) {
  const visible = useLingeringAbilityAnimations(animations, "thunderstorm", COMBAT_TIMING.attackDurationMs);
  return visible.map((animation) => <ScreenLightningStrikeEffect key={animation.id} animation={animation} />);
}

function ScreenLightningStrikeEffect({ animation }: { animation: Pick<CombatAbilityAnimation, "id" | "targetId"> }) {
  const [strike, setStrike] = useState<{ left: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.targetId) return;
    const target = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")]
      .find((element) => element.dataset.combatantId === animation.targetId);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setStrike({ left: rect.left + rect.width / 2 - 28, height: rect.top + rect.height / 2 });
  }, [animation.id, animation.targetId]);

  if (!strike) return null;
  return (
    <span className="screen-lightning-strike" style={{ left: strike.left, height: strike.height }} aria-hidden="true">
      <i className="screen-lightning-outer" />
      <i className="screen-lightning-core" />
      <i className="screen-lightning-fork screen-lightning-fork-left" />
      <i className="screen-lightning-fork screen-lightning-fork-right" />
      <b />
    </span>
  );
}

function AbilityProjectileEffect({ animation }: { animation: CombatProjectileAnimation }) {
  const durationMs = COMBAT_TIMING.attackImpactMs * Math.max(0.1, animation.durationMultiplier) / Math.max(1, animation.hitCount);
  const beamDurationMs = COMBAT_TIMING.attackDurationMs * Math.max(0.1, animation.durationMultiplier) / Math.max(1, animation.hitCount);
  const kind = animation.vfx;
  if (kind === "frostbolt" || kind === "deep_freeze" || (!kind && animation.damageType === "frost")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path frostbolt-path"><Snowflake /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "absolute_zero" || kind === "blizzard") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className={`ability-projectile-path ${kind.replace("_", "-")}-path`}><Snowflake /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "fireball") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path fireball-path"><Flame /><i /><i /><i /><b /><b /><b /><b /></CombatantPathEffect>;
  }
  if (kind === "combustion" || kind === "firestorm" || (!kind && animation.damageType === "fire")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path ember-projectile-path"><Flame /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "lightning_beam") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="charge-lightning-path lightning-beam-charge-path"><i /><i /><i /><b /></CombatantBeamEffect>;
  }
  if (kind === "thunderstorm" || (!kind && animation.damageType === "lightning")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path lightning-beam-path"><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "charge" || kind === "ride_the_lightning") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path charge-path"><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "thundersnow") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path thundersnow-path"><Snowflake /><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "toxic_explosion") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path poison-projectile-path"><FlaskConical /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "cull_the_weak" || animation.damageType === "shadow") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path shadow-projectile-path"><Moon /><i /><i /></CombatantPathEffect>;
  }
  if (!kind && animation.damageType === "physical") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path physical-projectile-path"><Target /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_blast") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="arcane-beam-path"><i /><i /><b /><Sparkles /></CombatantBeamEffect>;
  }
  if (kind === "focused_blast") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="focused-blast-beam-path"><i /><i /><b /><Sparkles /></CombatantBeamEffect>;
  }
  if (kind === "rapid_fire") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="rapid-fire-beam-path"><i /><i /><i /><b /><Flame /></CombatantBeamEffect>;
  }
  if (kind === "mana_fracture") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className={`ability-projectile-path ${kind.replace("_", "-")}-path`}><CircleDot /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_overload") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-overload-path"><Sparkles /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_combustion") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-combustion-path"><CircleDot /><Flame /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "elemental_fury") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="elemental-fury-beam-path"><i /><i /><i /><i /><b /><Flame /><Snowflake /><Zap /><Sparkles /></CombatantBeamEffect>;
  }
  return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-bolt-path"><Sparkles /><i /><i /></CombatantPathEffect>;
}

function PandemicSpreadEffect({ animation, statusIds }: { animation: CombatAbilityAnimation; statusIds: StatusEffectId[] }) {
  const [paths, setPaths] = useState<Array<{ id: string; left: number; top: number; x: number; y: number }>>([]);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    if (!source) return;
    const sourceRect = source.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPaths(combatants
      .filter((element) => element.dataset.combatantId !== "player" && element.dataset.combatantId !== animation.sourceTargetId && !element.classList.contains("dead"))
      .map((target) => {
        const targetRect = target.getBoundingClientRect();
        return {
          id: target.dataset.combatantId ?? `${targetRect.left}-${targetRect.top}`,
          left: sourceX - 15,
          top: sourceY - 15,
          x: targetRect.left + targetRect.width / 2 - sourceX,
          y: targetRect.top + targetRect.height / 2 - sourceY,
        };
      }));
  }, [animation.id, animation.sourceTargetId]);

  return (
    <>
      {paths.map((path, pathIndex) => (
        <span
          key={path.id}
          className="pandemic-flight"
          style={{ left: path.left, top: path.top, "--path-x": `${path.x}px`, "--path-y": `${path.y}px`, "--path-delay": `${pathIndex * 55}ms` } as React.CSSProperties}
          aria-hidden="true"
        >
          {(statusIds.length > 0 ? statusIds.slice(0, 4) : ["poison" as const]).map((statusId, index) => {
            const Icon = STATUS_ICONS[statusId];
            return <Icon key={`${statusId}-${index}`} style={{ "--status-flight-index": index } as React.CSSProperties} />;
          })}
          <i />
        </span>
      ))}
    </>
  );
}

function VenombornHealingEffect() {
  return (
    <span className="venomborn-healing-effect" aria-hidden="true">
      <HeartPulse />
      <i /><i /><i />
    </span>
  );
}

function VenombornTransferAnimation({ animation }: { animation: CombatAbilityAnimation }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceAnchor = source.querySelector<HTMLElement>(".status-poison") ?? source.querySelector<HTMLElement>(".compact-status-row") ?? source;
    const targetAnchor = target.querySelector<HTMLElement>(".health-bar-wrap") ?? target;
    const sourceRect = sourceAnchor.getBoundingClientRect();
    const targetRect = targetAnchor.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 14,
      top: sourceY - 14,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className="venomborn-transfer-animation"
      style={{ left: path.left, top: path.top, "--venomborn-x": `${path.x}px`, "--venomborn-y": `${path.y}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <FlaskConical />
      <i /><i /><i />
    </span>
  );
}

function PoisonTransferAnimation({ animation }: { animation: CombatStatusAnimation }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceAnchor = source.querySelector<HTMLElement>(".status-poison") ?? source.querySelector<HTMLElement>(".compact-status-row") ?? source;
    const targetAnchor = target.querySelector<HTMLElement>(".status-poison") ?? target.querySelector<HTMLElement>(".compact-status-row") ?? target;
    const sourceRect = sourceAnchor.getBoundingClientRect();
    const targetRect = targetAnchor.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 12,
      top: sourceY - 12,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className="poison-transfer-animation"
      style={{ left: path.left, top: path.top, "--poison-transfer-x": `${path.x}px`, "--poison-transfer-y": `${path.y}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <FlaskConical size={13} />
    </span>
  );
}

function HealthBar({ value, max, damageSource, missed = false }: { value: number; max: number; damageSource?: string; missed?: boolean }) {
  const previousValue = useRef(value);
  const [change, setChange] = useState<{ id: number; kind: "damage" | "heal" | "miss"; delta: number; source?: string } | null>(null);

  useEffect(() => {
    const delta = value - previousValue.current;
    previousValue.current = value;
    if (delta !== 0) {
      setChange({ id: Date.now(), kind: delta > 0 ? "heal" : "damage", delta, source: delta < 0 ? damageSource : undefined });
    } else if (missed) {
      setChange({ id: Date.now(), kind: "miss", delta: 0 });
    }
  }, [damageSource, missed, value]);

  return (
    <div className="health-bar-wrap">
      <div className="health-bar"><i style={{ width: `${Math.max(0, value / max) * 100}%` }} /></div>
      {change && (
        <strong key={change.id} className={`health-change ${change.kind}`} aria-hidden="true">
          {change.kind === "miss" ? "Missed!" : <>{change.delta > 0 ? "+" : "−"}{Math.abs(change.delta)}{change.source && <span className="health-change-source"> ({change.source})</span>}</>}
        </strong>
      )}
    </div>
  );
}

function PassiveProcFloats({ animations }: { animations: CombatPassiveAnimation[] }) {
  const visible = animations.slice(-3);
  if (visible.length === 0) return null;
  return (
    <div className="passive-proc-floats" aria-hidden="true">
      {visible.map((animation) => {
        const direction = [-1, 0, 1][animation.lane % 3] ?? 0;
        return (
          <strong
            key={animation.id}
            className="passive-proc-float"
            style={{
              "--passive-proc-offset": `${animation.lane * 14}px`,
              "--passive-proc-mid-x": `${direction * 24}px`,
              "--passive-proc-end-x": `${direction * 54}px`,
            } as React.CSSProperties}
          >
            {animation.text}
          </strong>
        );
      })}
    </div>
  );
}

function ElectrifiedApplicationEffect() {
  return (
    <span className="electrified-application-effect" aria-hidden="true">
      <Zap className="electrified-bolt electrified-bolt-one" />
      <Zap className="electrified-bolt electrified-bolt-two" />
      <Zap className="electrified-bolt electrified-bolt-three" />
    </span>
  );
}

function EnergySegments({ value, max, regen, showGain = false }: { value: number; max: number; regen: number; showGain?: boolean }) {
  const previousValue = useRef(value);
  const [gain, setGain] = useState<{ id: number; amount: number } | null>(null);
  const segmentCount = Math.max(1, Math.floor(max));
  const filled = Math.max(0, Math.min(segmentCount, Math.floor(value)));
  const projected = Math.min(segmentCount, filled + Math.max(0, Math.floor(regen)));

  useEffect(() => {
    const delta = value - previousValue.current;
    previousValue.current = value;
    if (showGain && delta > 0) setGain({ id: Date.now(), amount: delta });
  }, [showGain, value]);

  return (
    <div className="energy-segments-wrap">
      <div
        className="energy-segments"
        style={{ gridTemplateColumns: `repeat(${segmentCount}, minmax(0, 1fr))` }}
        aria-label={`${filled} of ${segmentCount} Energy. ${projected - filled} Energy will regenerate next round.`}
      >
        {Array.from({ length: segmentCount }, (_, index) => (
          <i key={index} className={index < filled ? "filled" : index < projected ? "projected" : ""} />
        ))}
      </div>
      {gain && <strong key={gain.id} className="energy-change" aria-hidden="true">+{gain.amount} Energy</strong>}
    </div>
  );
}

function StatusBadge({ id, name, stacks, duration, permanent = false, kind, onInspect }: { id: StatusEffectId; name: string; stacks: number; duration: number; permanent?: boolean; kind: StatusEffect["kind"]; onInspect?: () => void }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const Icon = STATUS_ICONS[id];
  const label = [
    name,
    id === "barrier" || id === "guard"
      ? `${stacks} remaining`
      : STATUS_EFFECTS[id].stackable
        ? `${stacks} ${stacks === 1 ? "stack" : "stacks"}`
        : null,
    permanent ? null : `${duration} ${duration === 1 ? "turn" : "turns"} remaining`,
  ].filter(Boolean).join(", ");
  const remainingSegments = Math.max(0, Math.min(STATUS_DURATION_SEGMENTS, Math.floor(duration)));
  const gap = 6;
  const segmentLength = 100 / STATUS_DURATION_SEGMENTS - gap;
  const ring = permanent ? (
    <svg className="status-duration-ring permanent" viewBox="0 0 40 40" aria-hidden="true">
      <circle className="remaining" cx="20" cy="20" r="17" />
    </svg>
  ) : (
    <svg className="status-duration-ring" viewBox="0 0 40 40" aria-hidden="true">
      {Array.from({ length: STATUS_DURATION_SEGMENTS }, (_, index) => (
        <circle
          key={index}
          className={index < remainingSegments ? "remaining" : "expired"}
          cx="20"
          cy="20"
          r="17"
          pathLength="100"
          style={{
            strokeDasharray: `${segmentLength} ${100 - segmentLength}`,
            strokeDashoffset: -(index * 100 / STATUS_DURATION_SEGMENTS + gap / 2),
          }}
        />
      ))}
    </svg>
  );
  const stackCounter = STATUS_EFFECTS[id].stackable ? <b className="status-stack-count" aria-hidden="true">{stacks}</b> : null;

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  if (!onInspect) return <span className={`status-badge status-icon status-${id} ${kind}`} aria-label={label} data-game-tooltip={label}>{ring}<Icon />{stackCounter}</span>;

  const beginHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") return;
    longPressed.current = false;
    holdTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setTooltipOpen(true);
    }, 420);
  };

  const endHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setTooltipOpen(false);
    window.setTimeout(() => { longPressed.current = false; }, 250);
  };

  return (
    <button
      type="button"
      className={`status-badge status-icon status-${id} inspectable ${kind}`}
      aria-label={label}
      data-game-tooltip={label}
      data-tooltip-open={tooltipOpen ? "true" : undefined}
      onPointerDown={beginHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        if (longPressed.current) {
          event.preventDefault();
          return;
        }
        onInspect();
      }}
    >
      {ring}<Icon />{stackCounter}
    </button>
  );
}

function InspectInfoModal({ info, onClose }: { info: InspectableInfo; onClose: () => void }) {
  return (
    <div className="inspect-info-modal" role="dialog" aria-modal="true" aria-label={`${info.title} details`} onClick={onClose}>
      <div className="inspect-info-card" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">{info.category === "ability" ? "Attack" : info.category === "stat" ? "Character Stat" : "Status Effect"}</p>
        <h2>{info.title}</h2>
        <p>{info.description}</p>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function HoldAbilityButton({ ability, description, energyCost, baseCooldown, cooldown, queuedCount, disabled, onUse }: { ability: Ability; description: string; energyCost: number; baseCooldown: number; cooldown: number; queuedCount: number; disabled: boolean; onUse: () => void }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const beginHold = () => {
    longPressed.current = false;
    holdTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setTooltipOpen(true);
    }, 420);
  };

  const endHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setTooltipOpen(false);
    window.setTimeout(() => { longPressed.current = false; }, 250);
  };

  const activate = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (longPressed.current) {
      event.preventDefault();
      return;
    }
    onUse();
  };

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  return (
    <button
      className={`compact-ability ${ability.branch} ${queuedCount > 0 ? "queued" : ""}`}
      disabled={disabled}
      onClick={activate}
      onPointerDown={beginHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={`${ability.name}, ${ability.range === "ranged" ? "Ranged" : "Melee"}, ${energyCost} Energy, ${baseCooldown} turn base cooldown${cooldown > 0 ? `, ${cooldown} remaining` : ""}. Hold for details.`}
    >
      <span className="compact-ability-icon">{ability.icon}</span>
      <strong>{ability.name}</strong>
      <span className="compact-ability-cost">{energyCost}<Sparkles size={10} /></span>
      <span className="compact-ability-cooldown-value"><Hourglass size={9} />{baseCooldown}</span>
      {queuedCount > 0 && <span className="compact-ability-queued" aria-hidden="true">Queued{queuedCount > 1 ? ` ×${queuedCount}` : ""}</span>}
      {cooldown > 0 && <span className="compact-ability-cooldown" aria-hidden="true"><Hourglass size={15} /><b>{cooldown}</b></span>}
      <span className={`ability-hold-tooltip ${tooltipOpen ? "force-open" : ""}`}><b>{ability.name}</b><small>{description}</small><em>{energyCost} Energy · {baseCooldown ? `${baseCooldown} turn cooldown` : "No cooldown"} · {ability.range === "ranged" ? "Ranged" : "Melee"}</em></span>
    </button>
  );
}

function CharacterLoadingScreen() {
  return (
    <section className="character-loading-screen" role="status" aria-live="polite">
      <span className="character-loading-sigil"><Shield /></span>
      <p className="eyebrow">Preparing Character</p>
      <h1>Gathering your equipment…</h1>
    </section>
  );
}

function waitForRenderedImage(image: HTMLImageElement): Promise<void> {
  const loaded = image.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  return loaded.then(() => typeof image.decode === "function" ? image.decode().catch(() => undefined) : undefined);
}

function CharacterAssetBoundary({ preloaded, assetKey, children }: {
  preloaded: boolean;
  assetKey: string;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [renderedAssetsReady, setRenderedAssetsReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    let revealFrame = 0;
    setRenderedAssetsReady(false);
    if (!preloaded || !contentRef.current) return () => { cancelled = true; };

    const images = [...contentRef.current.querySelectorAll<HTMLImageElement>("img")];
    Promise.all(images.map(waitForRenderedImage)).then(() => {
      revealFrame = window.requestAnimationFrame(() => {
        if (!cancelled) setRenderedAssetsReady(true);
      });
    });

    return () => {
      cancelled = true;
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
    };
  }, [preloaded, assetKey]);

  return (
    <div className="character-asset-boundary">
      <div ref={contentRef} className={`character-assets-stage ${renderedAssetsReady ? "ready" : "loading"}`} aria-hidden={!renderedAssetsReady}>
        {children}
      </div>
      {!renderedAssetsReady && <CharacterLoadingScreen />}
    </div>
  );
}

function CharacterView({ character, locked, onEquip, onUnequip, onAllocateStat }: {
  character: CharacterState;
  locked: boolean;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  onUnequip: (slot: GearSlot) => void;
  onAllocateStat: (stat: StatName) => void;
}) {
  const [inspectedItem, setInspectedItem] = useState<{ item: GearItem; equippedSlot?: GearSlot; preferredSlot?: GearSlot } | null>(null);
  const [selectedGearSlot, setSelectedGearSlot] = useState<GearSlot | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryGearFilter>("all");
  const [inventorySort, setInventorySort] = useState<InventorySort>("rarity");
  const modalOpen = Boolean(inspectedItem || selectedGearSlot);
  useEffect(() => {
    if (!modalOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const previousRootOverflow = root.style.overflow;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      body.style.paddingRight = previousBody.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [modalOpen]);
  const derived = getDerivedStats(character);
  const avatar = getCharacterAvatar(character.avatarId);
  const requiredExperience = experienceToNextLevel(character.level);
  const visibleInventory = character.inventory
    .filter((item) => itemMatchesInventoryFilter(item, inventoryFilter))
    .sort((left, right) => inventorySort === "name"
      ? left.name.localeCompare(right.name)
      : RARITY_SORT_WEIGHT[right.rarity] - RARITY_SORT_WEIGHT[left.rarity] || left.name.localeCompare(right.name));
  const activeInventoryFilter = INVENTORY_GEAR_FILTERS.find((filter) => filter.id === inventoryFilter)!;
  return (
    <section className="page character-page">
      <div className="page-title"><div><p className="eyebrow">Level {character.level} Wayfarer</p><h1>{character.name}</h1><div className="character-xp"><span><i style={{ width: `${Math.min(100, (character.xp / requiredExperience) * 100)}%` }} /></span><small>{character.xp} / {requiredExperience} XP</small></div></div></div>
      <div className="character-layout">
        <div className="paper-panel">
          <div className="panel-title"><span><UserRound size={17} /> Attributes</span>{character.unspentStatPoints > 0 && <strong className="stat-points-available">{character.unspentStatPoints} Points Available</strong>}</div>
          <div className="stats-list">
            {STAT_LABELS.map((stat) => <div key={stat.key} data-game-tooltip={ATTRIBUTE_TOOLTIPS[stat.key]}><span className="stat-rune"><StatIcon stat={stat.key} /></span><span><strong>{stat.label}</strong><small>{ATTRIBUTE_SUMMARIES[stat.key]}</small></span><span className="stat-value-actions"><b>{formatStat(derived[stat.key])}</b>{character.unspentStatPoints > 0 && <button type="button" className="allocate-stat-button" disabled={locked} onClick={() => onAllocateStat(stat.key)} aria-label={`Add one point to ${stat.label}`}>+</button>}</span></div>)}
          </div>
          <div className="derived-grid">
            <span data-game-tooltip="Determines the damage dealt by your physical and shadow abilities."><StatIcon stat="physicalPower" /> <small>Physical Power</small><strong>{formatStat(derived.physicalPower)}</strong></span>
            <span data-game-tooltip="Determines the damage dealt by your arcane abilities."><StatIcon stat="magicalPower" /> <small>Magical Power</small><strong>{formatStat(derived.magicalPower)}</strong></span>
            <span data-game-tooltip="Determines how likely your attacks are to hit."><StatIcon stat="hitChance" /> <small>Hit Chance</small><strong>{formatPercent(derived.hitChance)}</strong></span>
            <span data-game-tooltip="Determines how likely you are to avoid enemy attacks."><StatIcon stat="dodgeChance" /> <small>Dodge Chance</small><strong>{formatPercent(derived.dodgeChance)}</strong></span>
            <span data-game-tooltip="Determines how likely your attacks are to critically strike."><StatIcon stat="critChance" /> <small>Critical Chance</small><strong>{formatPercent(derived.critChance)}</strong></span>
            <span data-game-tooltip="Determines how much damage you can take before falling."><StatIcon stat="maxHp" /> <small>Max Health</small><strong>{formatStat(derived.maxHp)}</strong></span>
            <span data-game-tooltip="Reduces damage you take from physical attacks."><StatIcon stat="armor" /> <small>Armor</small><strong>{formatStat(derived.armor)}</strong></span>
            <span data-game-tooltip="Reduces damage you take from magical attacks."><StatIcon stat="magicResistance" /> <small>Magic Resistance</small><strong>{formatStat(derived.magicResistance)}</strong></span>
            <span data-game-tooltip="Determines how early you act when combat begins."><StatIcon stat="initiativeBonus" /> <small>Initiative</small><strong>+{formatStat(derived.initiativeBonus)}</strong></span>
            <span data-game-tooltip="Determines how much Energy you can hold at once."><StatIcon stat="maxEnergy" /> <small>Max Energy</small><strong>{formatStat(derived.maxEnergy)}</strong></span>
          </div>
        </div>

        <div className="paper-panel equipment-panel">
          <div className="panel-title"><span><Shield size={17} /> Equipment</span></div>
          <div className="equipment-paper-doll">
            <div className="character-silhouette" aria-hidden="true">
              <img src={avatar.imageUrl} alt="" draggable={false} decoding="sync" />
            </div>
            {EQUIPMENT_SLOT_ORDER.map((slot) => {
              const item = character.equipment[slot];
              const slotLocked = isEquipmentSlotLocked(slot, character.equipment);
              return (
                <button
                  type="button"
                  className={`paper-doll-slot slot-${slot} ${item ? item.rarity : "empty"}${slotLocked ? " locked" : ""}`}
                  key={slot}
                  onClick={() => setSelectedGearSlot(slot)}
                  aria-label={`Choose equipment for ${SLOT_LABELS[slot]}${item ? `, currently ${item.name}` : slotLocked ? ", slot locked" : ", currently empty"}`}
                >
                  <small>{SLOT_LABELS[slot]}</small>
                  <span className="paper-doll-slot-glyph"><GearSlotIcon slot={slot} item={item} /></span>
                  <strong>{slotLocked ? "Locked" : item?.name ?? "Empty"}</strong>
                  {slotLocked && <em>Two-Hand weapon equipped</em>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-heading inventory-heading"><div><h2>Inventory</h2></div><span className={locked ? "lock-note" : "muted"}>{locked ? "Equipment is locked during combat" : "Tap an item to view its details"}</span></div>
      <div className="inventory-controls">
        <div className="inventory-tabs" role="tablist" aria-label="Filter inventory by gear slot">
          {INVENTORY_GEAR_FILTERS.map((filter) => {
            const count = character.inventory.filter((item) => itemMatchesInventoryFilter(item, filter.id)).length;
            return <button type="button" role="tab" aria-selected={inventoryFilter === filter.id} className={inventoryFilter === filter.id ? "selected" : ""} key={filter.id} onClick={() => setInventoryFilter(filter.id)}><span>{filter.label}</span><small>{count}</small></button>;
          })}
        </div>
        <div className="inventory-sort" role="group" aria-label="Sort inventory">
          <span>Sort</span>
          <button type="button" className={inventorySort === "rarity" ? "selected" : ""} aria-pressed={inventorySort === "rarity"} onClick={() => setInventorySort("rarity")}>Rarity</button>
          <button type="button" className={inventorySort === "name" ? "selected" : ""} aria-pressed={inventorySort === "name"} onClick={() => setInventorySort("name")}>Name</button>
        </div>
      </div>
      <div className="inventory-grid">
        {visibleInventory.length ? visibleInventory.map((item, index) => <button key={`${item.id}-${index}`} className={`item-card ${item.rarity}`} onClick={() => setInspectedItem({ item })}><span className="item-glyph"><GearSlotIcon slot={item.slot} item={item} size={25} /></span><span className="rarity">{item.rarity} · {getGearCategoryLabel(item)}</span><strong>{item.name}</strong><p>{item.description}</p><span className="equip-cta">View Details <ChevronRight size={14} /></span></button>) : <div className="empty-inventory">{character.inventory.length ? `No ${activeInventoryFilter.label.toLowerCase()} items in your inventory.` : "Your pack is empty. Adventure awaits."}</div>}
      </div>
      {selectedGearSlot && (
        <GearSlotPickerModal
          slot={selectedGearSlot}
          character={character}
          locked={locked}
          onClose={() => setSelectedGearSlot(null)}
          onInspect={(item, equippedSlot) => {
            setSelectedGearSlot(null);
            setInspectedItem({ item, equippedSlot, preferredSlot: equippedSlot ? undefined : selectedGearSlot });
          }}
        />
      )}
      {inspectedItem && (
        <ItemDetailModal
          item={inspectedItem.item}
          equippedSlot={inspectedItem.equippedSlot}
          preferredSlot={inspectedItem.preferredSlot}
          character={character}
          locked={locked}
          onClose={() => setInspectedItem(null)}
          onEquip={(item, slot) => { onEquip(item, slot); setInspectedItem(null); }}
          onUnequip={(slot) => { onUnequip(slot); setInspectedItem(null); }}
        />
      )}
    </section>
  );
}

function GearSlotPickerModal({ slot, character, locked, onClose, onInspect }: {
  slot: GearSlot;
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onInspect: (item: GearItem, equippedSlot?: GearSlot) => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const equippedItem = character.equipment[slot];
  const compatibleItems = character.inventory.filter((item) => canEquipItemInSlot(item, slot));
  const slotLocked = isEquipmentSlotLocked(slot, character.equipment);

  const itemRow = (item: GearItem, current = false) => (
    <button type="button" className={`gear-choice-row ${item.rarity}`} key={`${current ? "equipped" : "inventory"}-${item.id}`} onClick={() => onInspect(item, current ? slot : undefined)}>
      <span className="gear-choice-icon"><GearSlotIcon slot={item.slot} item={item} size={34} /></span>
      <span><small>{item.rarity} · {getGearCategoryLabel(item)}</small><strong>{item.name}</strong><em>{item.description}</em></span>
      <span className="gear-choice-action">{current ? "View Equipped" : locked || slotLocked ? "View Details" : "Select"}<ChevronRight size={15} /></span>
    </button>
  );

  return (
    <div className="item-detail-backdrop" role="dialog" aria-modal="true" aria-label={`${SLOT_LABELS[slot]} equipment`} onClick={onClose}>
      <article className="gear-slot-picker" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="item-detail-close" onClick={onClose} aria-label="Close equipment list">×</button>
        <header className="gear-slot-picker-header">
          <div><h2>Equipment Slot - {SLOT_LABELS[slot]}</h2><p>Choose an item from your inventory.</p></div>
        </header>
        {slotLocked && <p className="item-action-lock"><Shield size={14} /> Unequip your Two-Hand weapon before using this slot.</p>}
        {equippedItem && <section className="gear-choice-section"><h3>Currently Equipped</h3>{itemRow(equippedItem, true)}</section>}
        <section className="gear-choice-section">
          <h3>Available Items <small>{compatibleItems.length}</small></h3>
          <div className="gear-choice-list">{compatibleItems.length > 0 ? compatibleItems.map((item) => itemRow(item)) : <p className="gear-choice-empty">You have no items that can be equipped in this slot.</p>}</div>
        </section>
      </article>
    </div>
  );
}

const ITEM_STAT_LABELS: Record<StatName, string> = {
  strength: "Strength",
  agility: "Agility",
  intelligence: "Intelligence",
  vitality: "Vitality",
  luck: "Luck",
};

type ItemStatLine = { label: string; value: number; icon?: StatIconName };

function getItemStatLines(item: GearItem): ItemStatLine[] {
  const lines: ItemStatLine[] = (Object.entries(item.stats) as Array<[StatName, number | undefined]>).flatMap(([stat, value]) => value ? [{ label: ITEM_STAT_LABELS[stat], value, icon: stat }] : []);
  if (item.armor) lines.push({ label: "Armor", value: item.armor, icon: "armor" });
  if (item.magicResistance) lines.push({ label: "Magic Resistance", value: item.magicResistance, icon: "magicResistance" });
  if (item.physicalPower) lines.push({ label: "Physical Power", value: item.physicalPower, icon: "physicalPower" });
  if (item.magicalPower) lines.push({ label: "Magical Power", value: item.magicalPower, icon: "magicalPower" });
  if (item.power) lines.push({ label: "Power", value: item.power, icon: "physicalPower" });
  return lines.sort((left, right) => left.label.localeCompare(right.label));
}

function getItemComparisonLines(current: GearItem, candidate: GearItem): Array<{ label: string; current: number; candidate: number; difference: number; icon?: StatIconName }> {
  const currentLines = getItemStatLines(current);
  const candidateLines = getItemStatLines(candidate);
  const currentStats = new Map(currentLines.map((stat) => [stat.label, stat.value]));
  const candidateStats = new Map(candidateLines.map((stat) => [stat.label, stat.value]));
  const icons = new Map([...currentLines, ...candidateLines].map((stat) => [stat.label, stat.icon]));
  const labels = [...new Set([...currentStats.keys(), ...candidateStats.keys()])];
  return labels.map((label) => {
    const currentValue = currentStats.get(label) ?? 0;
    const candidateValue = candidateStats.get(label) ?? 0;
    return { label, current: currentValue, candidate: candidateValue, difference: candidateValue - currentValue, icon: icons.get(label) };
  });
}

function ItemDetailModal({ item, equippedSlot, preferredSlot, character, locked, onClose, onEquip, onUnequip }: {
  item: GearItem;
  equippedSlot?: GearSlot;
  preferredSlot?: GearSlot;
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  onUnequip: (slot: GearSlot) => void;
}) {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const stats = getItemStatLines(item);
  const equippedEntries = Object.entries(character.equipment) as Array<[GearSlot, GearItem]>;
  const setBonuses = item.set ? GEAR_SET_BONUSES.filter((bonus) => bonus.setId === item.set) : [];
  const equippedSetPieces = item.set ? equippedEntries.filter(([, equipped]) => equipped.set === item.set).length : 0;
  const equipType = getWeaponEquipType(item);
  const offHandLocked = isEquipmentSlotLocked("offHand", character.equipment);
  const actionLocked = locked || (preferredSlot ? isEquipmentSlotLocked(preferredSlot, character.equipment) : equipType === "offHand" && offHandLocked);
  const comparisonSlot = preferredSlot ?? slotForItem(item, character.equipment);
  const comparisonItem = equippedSlot ? undefined : character.equipment[comparisonSlot];
  const comparisonLines = comparisonItem ? getItemComparisonLines(comparisonItem, item) : [];

  return (
    <div className="item-detail-backdrop" role="dialog" aria-modal="true" aria-label={`${item.name} details`} onClick={onClose}>
      <article className="item-detail-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="item-detail-close" onClick={onClose} aria-label="Close item details">×</button>
        <header className="item-detail-header">
          <span className={`item-detail-icon ${item.rarity}`}><GearSlotIcon slot={item.slot} item={item} size={58} /></span>
          <span>
            <small>{item.rarity} · {getGearCategoryLabel(item)}</small>
            <h2 className={`item-name-${item.rarity}`}>{item.name}</h2>
            <p>{item.description}</p>
          </span>
        </header>

        <section className="item-detail-section">
          <h3>Item Stats</h3>
          {stats.length ? <div className="item-stat-grid">{stats.map((stat) => <span key={stat.label}><small className="item-stat-label">{stat.icon && <StatIcon stat={stat.icon} />}{stat.label}</small><strong>+{stat.value}</strong></span>)}</div> : <p className="item-detail-muted">This item grants no direct stat bonuses.</p>}
        </section>

        {item.set && (
          <section className="item-detail-section item-set-section">
            <div className="item-set-title"><Gem size={16} /><strong>{item.setName ?? item.set} Set</strong></div>
            {setBonuses.length > 0 && <div className="item-set-bonuses">{setBonuses.map((bonus) => <span className={equippedSetPieces >= bonus.requiredPieces ? "unlocked" : "locked"} key={bonus.requiredPieces}><strong>{bonus.requiredPieces} Pieces:</strong><em>{bonus.description}</em></span>)}</div>}
          </section>
        )}

        {comparisonOpen && comparisonItem && (
          <section className="item-comparison" aria-label={`Compare ${item.name} with ${comparisonItem.name}`}>
            <h3>Item Comparison</h3>
            <div className="comparison-items">
              <div><small>Currently Equipped</small><span><GearSlotIcon slot={comparisonItem.slot} item={comparisonItem} size={34} /><strong className={`item-name-${comparisonItem.rarity}`}>{comparisonItem.name}</strong></span></div>
              <div><small>New Item</small><span><GearSlotIcon slot={item.slot} item={item} size={34} /><strong className={`item-name-${item.rarity}`}>{item.name}</strong></span></div>
            </div>
            <div className="comparison-stats">
              {comparisonLines.length > 0 ? comparisonLines.map((stat) => (
                <div key={stat.label}>
                  <strong className="comparison-stat-label">{stat.icon && <StatIcon stat={stat.icon} />}{stat.label}</strong>
                  <span>{stat.current} <i>→</i> {stat.candidate}</span>
                  <em className={stat.difference > 0 ? "positive" : stat.difference < 0 ? "negative" : "neutral"}>{stat.difference > 0 ? `+${stat.difference}` : stat.difference < 0 ? stat.difference : "—"}</em>
                </div>
              )) : <p className="item-detail-muted">These items grant no direct stat bonuses.</p>}
            </div>
          </section>
        )}

        {locked && <p className="item-action-lock"><Shield size={14} /> Equipment cannot be changed during combat.</p>}
        <div className="item-detail-actions">
          {comparisonItem && <button type="button" className="item-compare-button" aria-expanded={comparisonOpen} onClick={() => setComparisonOpen((open) => !open)}>{comparisonOpen ? "Close Comparison" : "Compare"}</button>}
          {equippedSlot ? (
            <button type="button" className="item-unequip-button" disabled={locked} onClick={() => onUnequip(equippedSlot)}>Unequip</button>
          ) : preferredSlot ? (
            <button type="button" disabled={actionLocked} onClick={() => onEquip(item, preferredSlot)}>{actionLocked && !locked ? `${SLOT_LABELS[preferredSlot]} Locked` : `Equip in ${SLOT_LABELS[preferredSlot]}`}</button>
          ) : equipType === "oneHand" ? (
            <>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "mainHand")}>Equip Main Hand</button>
              <button type="button" disabled={locked || offHandLocked} onClick={() => onEquip(item, "offHand")}>{offHandLocked ? "Off Hand Locked" : "Equip Off Hand"}</button>
            </>
          ) : item.slot === "ring" ? (
            <>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "ring1")}>Equip Ring I</button>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "ring2")}>Equip Ring II</button>
            </>
          ) : (
            <button type="button" disabled={actionLocked} onClick={() => onEquip(item)}>{offHandLocked && equipType === "offHand" ? "Off Hand Locked" : "Equip"}</button>
          )}
        </div>
      </article>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatStat(value: number): string {
  return String(Math.round(value));
}

const RUNTIME_TALENT_MIN_ZOOM = 0.2;
const RUNTIME_TALENT_MAX_ZOOM = 1.6;
const RUNTIME_TALENT_ZOOM_STEP = 0.1;
const RUNTIME_TALENT_DEFAULT_ZOOM = 0.65;

function TalentDetailModal({ talent, character, locked, freeUnlocks, onClose, onUnlock, onToggleAbility }: {
  talent: (typeof TALENTS)[number];
  character: CharacterState;
  locked: boolean;
  freeUnlocks: boolean;
  onClose: () => void;
  onUnlock: (id: string) => void;
  onToggleAbility: (id: string) => void;
}) {
  const ability = talent.abilityId ? ABILITIES[talent.abilityId] : null;
  const coreAbilities = talent.id === "origin" ? [ABILITIES.strike, ABILITIES.guard] : [];
  const abilityDescription = ability ? getCharacterAbilityDescription(character, ability) : null;
  const abilityEnergyCost = ability ? getCharacterAbilityEnergyCost(character, ability) : 0;
  const abilityCooldownTurns = ability ? getCharacterAbilityCooldownTurns(character, ability) : 0;
  const unlocked = character.unlockedTalents.includes(talent.id);
  const available = areTalentRequirementsMet(talent, character.unlockedTalents, TALENTS);
  const abilityEquipped = Boolean(ability && character.equippedAbilities.includes(ability.id));
  const loadoutFull = character.equippedAbilities.length >= 6;
  const classBonus = talent.kind === "class" ? talent.description.replace(/\s*Unlocks?[^.]*\.?$/i, "").trim() : talent.description;
  const requiredNames = getTalentConnectionIds(talent.id, TALENTS)
    .filter((id) => !character.unlockedTalents.includes(id))
    .map((id) => TALENTS.find((candidate) => candidate.id === id)?.name ?? id);
  const canUnlock = !locked && available && (freeUnlocks || character.talentPoints >= talent.cost) && !unlocked;
  const typeLabel = talent.kind === "ability" ? "Ability" : talent.kind === "passive" ? "Passive" : "Class";

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    const previousOverflow = document.documentElement.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const unlockLabel = locked
    ? "Locked during combat"
    : !available
      ? `Requires one of: ${requiredNames.join(", ")}`
      : freeUnlocks
        ? "Unlock for Free"
        : character.talentPoints < talent.cost
        ? `Requires ${talent.cost} Talent Point${talent.cost === 1 ? "" : "s"}`
        : `Unlock for ${talent.cost} Talent Point${talent.cost === 1 ? "" : "s"}`;

  return (
    <div className="talent-detail-modal" role="dialog" aria-modal="true" aria-label={`${talent.name} details`} onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={`talent-detail-card ${talent.branch}`}>
        <div className="talent-detail-heading">
          <div><p className="eyebrow">{typeLabel}</p><h2>{talent.name}</h2></div>
          <span className={`talent-detail-state ${unlocked ? "unlocked" : available ? "available" : "locked"}`}>{talent.id === "origin" ? "Starting Node" : unlocked ? "Unlocked" : available ? "Available" : "Locked"}</span>
        </div>
        {coreAbilities.length > 0 ? (
          <div className="talent-core-abilities">
            {coreAbilities.map((coreAbility) => {
              const equipped = character.equippedAbilities.includes(coreAbility.id);
              const cannotEquip = !equipped && loadoutFull;
              const energyCost = getCharacterAbilityEnergyCost(character, coreAbility);
              const cooldownTurns = getCharacterAbilityCooldownTurns(character, coreAbility);
              return (
                <section className="talent-core-ability" key={coreAbility.id}>
                  <div className="talent-core-ability-heading"><span aria-hidden="true">{coreAbility.icon}</span><strong>{coreAbility.name}</strong></div>
                  <div className="talent-ability-metrics">
                    <span><small>Energy</small><strong>{energyCost}</strong></span>
                    <span><small>Cooldown</small><strong>{cooldownTurns ? `${cooldownTurns} ${cooldownTurns === 1 ? "turn" : "turns"}` : "None"}</strong></span>
                    <span><small>Range</small><strong>{coreAbility.range === "ranged" ? "Ranged" : "Melee"}</strong></span>
                  </div>
                  <p>{getCharacterAbilityDescription(character, coreAbility)}</p>
                  <button type="button" disabled={locked || cannotEquip} onClick={() => onToggleAbility(coreAbility.id)}>{equipped ? "Unequip Ability" : cannotEquip ? "Loadout Full" : "Equip Ability"}</button>
                </section>
              );
            })}
          </div>
        ) : ability ? (
          <>
            {talent.kind === "class" && (
              <div className="talent-ability-grant">
                <small>Ability Granted</small>
                <strong><span aria-hidden="true">{ability.icon}</span>{ability.name}</strong>
                <p>Unlocking this class node permanently adds this ability to your available loadout.</p>
              </div>
            )}
            <div className="talent-ability-metrics">
              <span><small>Energy</small><strong>{abilityEnergyCost}</strong></span>
              <span><small>Cooldown</small><strong>{abilityCooldownTurns ? `${abilityCooldownTurns} ${abilityCooldownTurns === 1 ? "turn" : "turns"}` : "None"}</strong></span>
              <span><small>Range</small><strong>{ability.range === "ranged" ? "Ranged" : "Melee"}</strong></span>
            </div>
            <div className="talent-detail-effect"><small>Ability Effect</small><p>{abilityDescription}</p></div>
            {talent.kind === "class" && <div className="talent-detail-effect"><small>Passive Bonus</small><p>{classBonus}</p></div>}
          </>
        ) : <div className="talent-detail-effect"><small>{talent.kind === "class" ? "Passive Bonus" : "Effect"}</small><p>{talent.description}</p></div>}
        <div className="talent-detail-actions">
          <button type="button" className="talent-detail-close" onClick={onClose}>Close</button>
          {talent.id !== "origin" && !unlocked && <button type="button" className="talent-detail-primary" disabled={!canUnlock} onClick={() => onUnlock(talent.id)}>{unlockLabel}</button>}
          {unlocked && ability && <button type="button" className="talent-detail-primary" disabled={locked || (!abilityEquipped && loadoutFull)} onClick={() => onToggleAbility(ability.id)}>{abilityEquipped ? "Unequip Ability" : loadoutFull ? "Loadout Full" : "Equip Ability"}</button>}
        </div>
      </article>
    </div>
  );
}

function AbilitySlotPicker({ slotIndex, character, onClose, onSetSlot }: {
  slotIndex: number;
  character: CharacterState;
  onClose: () => void;
  onSetSlot: (slotIndex: number, abilityId: string | null) => void;
}) {
  const currentAbilityId = character.equippedAbilities[slotIndex] ?? null;
  const abilities = getAvailableCharacterAbilities(character);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const previousRootOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="ability-slot-picker" role="dialog" aria-modal="true" aria-label={`Choose Ability for Slot ${slotIndex + 1}`} onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className="ability-slot-picker-card">
        <div className="ability-slot-picker-heading">
          <div><p className="eyebrow">Equipped Ability Slot {slotIndex + 1}</p><h2>Choose Ability</h2></div>
          <button type="button" onClick={onClose} aria-label="Close ability picker">Close</button>
        </div>
        <p className="ability-slot-picker-copy">Choose an unlocked ability for this combat slot.</p>
        <div className="ability-slot-picker-list">
          {abilities.map((ability) => {
            const abilityDescription = getCharacterAbilityDescription(character, ability);
            const energyCost = getCharacterAbilityEnergyCost(character, ability);
            const cooldownTurns = getCharacterAbilityCooldownTurns(character, ability);
            const equippedSlot = character.equippedAbilities.indexOf(ability.id);
            const equippedHere = equippedSlot === slotIndex;
            const occupiedTarget = currentAbilityId !== null;
            const unavailableForEmptySlot = !occupiedTarget && equippedSlot >= 0;
            const slotLabel = equippedHere
              ? "Equipped here"
              : equippedSlot >= 0
                ? occupiedTarget ? `Swap with Slot ${equippedSlot + 1}` : `Equipped in Slot ${equippedSlot + 1}`
                : "Equip here";
            return (
              <button
                type="button"
                key={ability.id}
                className={`ability-slot-picker-option ${ability.branch} ${equippedHere ? "current" : ""}`}
                disabled={equippedHere || unavailableForEmptySlot}
                onClick={() => { onSetSlot(slotIndex, ability.id); onClose(); }}
              >
                <span className="ability-slot-picker-icon" aria-hidden="true">{ability.icon}</span>
                <span className="ability-slot-picker-info"><strong>{ability.name}</strong><small>{abilityDescription}</small></span>
                <span className="ability-slot-picker-metrics"><small>{energyCost} Energy</small><small>{cooldownTurns} CD · {ability.range === "ranged" ? "Ranged" : "Melee"}</small><em>{slotLabel}</em></span>
              </button>
            );
          })}
        </div>
        <div className="ability-slot-picker-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          {currentAbilityId && <button type="button" className="unequip" onClick={() => { onSetSlot(slotIndex, null); onClose(); }}>Unequip Slot</button>}
        </div>
      </article>
    </div>
  );
}

function TalentsView({ character, locked, freeUnlocks, onUnlock, onToggleAbility, onSetAbilitySlot }: { character: CharacterState; locked: boolean; freeUnlocks: boolean; onUnlock: (id: string) => void; onToggleAbility: (id: string) => void; onSetAbilitySlot: (slotIndex: number, abilityId: string | null) => void }) {
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [selectedAbilitySlot, setSelectedAbilitySlot] = useState<number | null>(null);
  const [treeZoom, setTreeZoom] = useState(RUNTIME_TALENT_DEFAULT_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const treeCanvasRef = useRef<HTMLDivElement>(null);
  const treeZoomRef = useRef(RUNTIME_TALENT_DEFAULT_ZOOM);
  const treePanRef = useRef<{ pointerId: number; x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const closeTalentDetails = useCallback(() => setSelectedTalentId(null), []);
  const padding = 86;
  const xs = TALENTS.map((talent) => talent.position.x / 100 * TALENT_TREE_CANVAS.width);
  const ys = TALENTS.map((talent) => talent.position.y / 100 * TALENT_TREE_CANVAS.height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const treeWidth = Math.max(520, maxX - minX + padding * 2);
  const treeHeight = Math.max(390, maxY - minY + padding * 2);
  const nodePositions = new Map(TALENTS.map((talent) => [talent.id, {
    x: padding + talent.position.x / 100 * TALENT_TREE_CANVAS.width - minX,
    y: padding + talent.position.y / 100 * TALENT_TREE_CANVAS.height - minY,
  }]));
  const selectedTalent = TALENTS.find((talent) => talent.id === selectedTalentId) ?? null;

  const zoomTreeTo = (requestedZoom: number, anchorClientX?: number, anchorClientY?: number) => {
    const scroller = treeScrollRef.current;
    const canvas = treeCanvasRef.current;
    const nextZoom = Math.max(RUNTIME_TALENT_MIN_ZOOM, Math.min(RUNTIME_TALENT_MAX_ZOOM, Math.round(requestedZoom * 100) / 100));
    if (!scroller || !canvas || nextZoom === treeZoomRef.current) return;
    const scrollRect = scroller.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const clientX = anchorClientX ?? scrollRect.left + scroller.clientWidth / 2;
    const clientY = anchorClientY ?? scrollRect.top + scroller.clientHeight / 2;
    const anchorX = clientX - scrollRect.left;
    const anchorY = clientY - scrollRect.top;
    const worldX = (clientX - canvasRect.left) / treeZoomRef.current;
    const worldY = (clientY - canvasRect.top) / treeZoomRef.current;
    treeZoomRef.current = nextZoom;
    setTreeZoom(nextZoom);
    window.requestAnimationFrame(() => {
      scroller.scrollLeft = worldX * nextZoom - anchorX;
      scroller.scrollTop = worldY * nextZoom - anchorY;
    });
  };

  const fitTalentTree = () => {
    const scroller = treeScrollRef.current;
    if (!scroller) return;
    const nextZoom = Math.max(RUNTIME_TALENT_MIN_ZOOM, Math.min(RUNTIME_TALENT_MAX_ZOOM, Math.min((scroller.clientWidth - 20) / treeWidth, (scroller.clientHeight - 20) / treeHeight)));
    treeZoomRef.current = nextZoom;
    setTreeZoom(nextZoom);
    window.requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
      scroller.scrollTop = Math.max(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    });
  };

  useEffect(() => {
    const scroller = treeScrollRef.current;
    const origin = nodePositions.get("origin");
    if (!scroller || !origin) return;
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, origin.x * treeZoomRef.current - scroller.clientWidth / 2);
      scroller.scrollTop = Math.max(0, origin.y * treeZoomRef.current - scroller.clientHeight / 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [treeHeight, treeWidth]);

  const beginTreePan = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".runtime-talent-node") || (event.pointerType === "mouse" && event.button !== 0 && event.button !== 1)) return;
    const scroller = treeScrollRef.current;
    if (!scroller) return;
    event.preventDefault();
    treeCanvasRef.current?.setPointerCapture(event.pointerId);
    treePanRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: scroller.scrollLeft, scrollTop: scroller.scrollTop };
    setIsPanning(true);
  };

  const moveTreePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = treePanRef.current;
    const scroller = treeScrollRef.current;
    if (!pan || pan.pointerId !== event.pointerId || !scroller) return;
    event.preventDefault();
    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.y);
  };

  const endTreePan = (pointerId: number) => {
    if (treePanRef.current?.pointerId !== pointerId) return;
    treePanRef.current = null;
    setIsPanning(false);
  };

  return (
    <section className="page talents-page">
      <div className="page-title"><div><p className="eyebrow">Classless Progression</p><h1>Talent Tree</h1><p>Begin at the center, then grow outward into any discipline.</p></div><div className="talent-points"><Sparkles /><span><small>Available</small><strong>{character.talentPoints} Points</strong></span></div></div>
      {locked && <div className="lock-banner"><Shield size={15} /> Talents and ability loadouts are locked during combat.</div>}
      {freeUnlocks && !locked && <div className="testing-talent-banner"><Sparkles size={15} /> Shadow Proving Grounds: talents unlock for free.</div>}
      <div className="loadout-panel paper-panel">
        <div><p className="eyebrow">Active Loadout</p><h3>Equipped Abilities</h3></div>
        <div className="loadout-slots">{Array.from({ length: 6 }).map((_, index) => { const id = character.equippedAbilities[index]; const ability = id ? ABILITIES[id] : null; return <button key={index} type="button" disabled={locked} className={ability ? ability.branch : "empty"} aria-label={`Ability Slot ${index + 1}: ${ability?.name ?? "Empty"}. Choose ability.`} onClick={() => setSelectedAbilitySlot(index)} data-game-tooltip="Choose ability">{ability ? <><span>{ability.icon}</span><small>{ability.name}</small></> : <><span>+</span><small>Empty</small></>}</button>; })}</div>
      </div>
      <div className="runtime-talent-toolbar">
        <span><Hand size={14} /> Drag empty space to pan</span>
        <div className="runtime-talent-zoom" aria-label="Talent tree zoom controls">
          <button type="button" aria-label="Zoom out" onClick={() => zoomTreeTo(treeZoom - RUNTIME_TALENT_ZOOM_STEP)}><Minus size={15} /></button>
          <output aria-label="Current zoom">{Math.round(treeZoom * 100)}%</output>
          <button type="button" aria-label="Zoom in" onClick={() => zoomTreeTo(treeZoom + RUNTIME_TALENT_ZOOM_STEP)}><Plus size={15} /></button>
          <button type="button" aria-label="Fit talent tree to view" onClick={fitTalentTree}><Maximize2 size={14} /><span>Fit</span></button>
        </div>
      </div>
      <div ref={treeScrollRef} className="talent-tree runtime-talent-tree" aria-label="Talent tree" onWheel={(event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        zoomTreeTo(treeZoom - Math.sign(event.deltaY) * RUNTIME_TALENT_ZOOM_STEP, event.clientX, event.clientY);
      }}>
        <div className="runtime-talent-zoom-surface" style={{ width: treeWidth * treeZoom, height: treeHeight * treeZoom }}>
          <div ref={treeCanvasRef} className={`talent-map runtime-talent-map ${isPanning ? "panning" : ""}`} style={{ width: treeWidth, height: treeHeight, transform: `scale(${treeZoom})` }} onPointerDown={beginTreePan} onPointerMove={moveTreePan} onPointerUp={(event) => endTreePan(event.pointerId)} onPointerCancel={(event) => endTreePan(event.pointerId)} onLostPointerCapture={(event) => endTreePan(event.pointerId)}>
            <svg className="runtime-talent-connections" viewBox={`0 0 ${treeWidth} ${treeHeight}`} aria-hidden="true">
              <defs>
                <mask id="runtime-talent-connection-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={treeWidth} height={treeHeight}>
                  <rect width={treeWidth} height={treeHeight} fill="white" />
                  {TALENTS.map((talent) => {
                    const position = nodePositions.get(talent.id)!;
                    return talent.shape === "circle"
                      ? <circle key={talent.id} cx={position.x} cy={position.y} r="47" fill="black" />
                      : <rect key={talent.id} x={position.x - 61} y={position.y - 61} width="122" height="122" fill="black" />;
                  })}
                </mask>
              </defs>
              <g mask="url(#runtime-talent-connection-mask)">
                {TALENTS.flatMap((talent) => talent.requires.map((requirement) => {
                  const from = nodePositions.get(requirement);
                  const to = nodePositions.get(talent.id);
                  if (!from || !to) return null;
                  const active = character.unlockedTalents.includes(requirement) && character.unlockedTalents.includes(talent.id);
                  return <line key={`${requirement}-${talent.id}`} className={active ? "active" : ""} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
                }))}
              </g>
            </svg>
            {TALENTS.map((talent) => {
              const unlocked = character.unlockedTalents.includes(talent.id);
              const available = areTalentRequirementsMet(talent, character.unlockedTalents, TALENTS);
              const state = unlocked ? "unlocked" : available ? "available" : "locked";
              const position = nodePositions.get(talent.id)!;
              const typeLabel = talent.kind === "ability" ? "Ability" : talent.kind === "passive" ? "Passive" : "Class";
              return (
                <button type="button" aria-label={`${talent.name}, ${typeLabel}, ${state}`} className={`runtime-talent-node ${talent.branch} ${talent.shape} ${state}`} key={talent.id} style={{ left: position.x, top: position.y }} onClick={() => setSelectedTalentId(talent.id)}>
                  <small>{typeLabel}</small>
                  <strong>{talent.name}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedTalent && <TalentDetailModal
        talent={selectedTalent}
        character={character}
        locked={locked}
        freeUnlocks={freeUnlocks}
        onClose={closeTalentDetails}
        onUnlock={(talentId) => {
          onUnlock(talentId);
          closeTalentDetails();
        }}
        onToggleAbility={onToggleAbility}
      />}
      {selectedAbilitySlot !== null && <AbilitySlotPicker slotIndex={selectedAbilitySlot} character={character} onClose={() => setSelectedAbilitySlot(null)} onSetSlot={onSetAbilitySlot} />}
    </section>
  );
}

export default App;
