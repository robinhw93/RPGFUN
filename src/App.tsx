import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Backpack, BatteryLow, Bolt, BookOpen, Brain, ChevronRight, CircleDot, Crosshair, Droplets, Dumbbell,
  EyeOff, Flame, FlaskConical, Footprints, Gem, Hand, Heart, HeartPulse, Home, Hourglass, Maximize2, Megaphone, Minus, Moon, Plus, RotateCcw, Shield,
  ShieldCheck, ShieldOff, ShieldPlus, Skull, Snail, Snowflake, Sparkles, Swords, Target, TrendingDown, Trophy,
  UserRound, Waves, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import { GameConfirmDialog } from "./components/GameConfirmDialog";
import { FloatingCombatText } from "./components/FloatingCombatText";
import { GEAR_ICON_URLS, GearSlotIcon } from "./components/GearSlotIcon";
import { TalentDevtool, TalentDevtoolAccessDialog } from "./components/TalentDevtool";
import { CHARACTER_AVATARS, DEFAULT_CHARACTER_AVATAR_ID, getCharacterAvatar } from "./game/avatars";
import { ABILITIES, ADVENTURE, ENDLESS_ADVENTURE, ENEMIES, GEAR_SET_BONUSES, TALENTS, TALENT_TREE_CANVAS } from "./game/data";
import { getDerivedStats, INITIAL_GAME } from "./game/character";
import { eventRevealsPlayerTurn, isCombatSequencePending } from "./game/combatSequence";
import { getCharacterAbilityModifiers } from "./game/combatFeatures";
import { calculateInitiativeFlight, getInitiativeRowBounds } from "./game/initiativeLayout";
import { canEquipItemInSlot, equipGearItem, getGearCategoryLabel, getWeaponEquipType, isEquipmentSlotLocked, slotForItem, unequipGearItem } from "./game/gear";
import { experienceProgressAfterGain, experienceToNextLevel } from "./game/progression";
import { grantCombatReward } from "./game/rewards";
import { clearSave, loadGame, saveGame } from "./game/save";
import { STATUS_DURATION_SEGMENTS, STATUS_EFFECTS } from "./game/statusEffects";
import { areTalentRequirementsMet, getTalentConnectionIds } from "./game/talentRequirements";
import { createCombat, endPlayerTurn, ensureCombatState, getCombatInitiative, selectEnemyTarget, takeEnemyTurn, useAbility } from "./game/engine";
import { COMBAT_TIMING, INITIATIVE_TIMING } from "./game/timing";
import type { Ability, AdventureMode, AdventureNode, CharacterState, CombatLogEntry, CombatReward, CombatState, CombatStatusAnimation, GameState, GearItem, GearSlot, InspectableInfo, StatName, StatusEffect, StatusEffectId } from "./game/types";
import type { CharacterAvatarId } from "./game/avatars";
import { useCombatEventSequencer } from "./hooks/useCombatEventSequencer";

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

const IMAGE_PRELOAD_CACHE = new Map<string, Promise<void>>();

function preloadImage(url: string): Promise<void> {
  const cached = IMAGE_PRELOAD_CACHE.get(url);
  if (cached) return cached;
  const promise = new Promise<void>((resolve) => {
    const image = new Image();
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
  IMAGE_PRELOAD_CACHE.set(url, promise);
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
  exhausted: BatteryLow,
  slowed: Snail,
  reckless: Skull,
  wet: Waves,
  electrified: Bolt,
  cold: Snowflake,
  charred: Flame,
  sleep: Moon,
};

const ATTRIBUTE_TOOLTIPS: Record<StatName, string> = {
  strength: "Increases your Physical Power and the amount of Guard you gain.",
  agility: "Increases your Physical Power, Hit Chance, Dodge Chance, and Initiative.",
  intelligence: "Increases your Magical Power and Initiative.",
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
  const travelTimers = useRef<number[]>([]);
  const derived = useMemo(() => getDerivedStats(game.character), [game.character]);
  const combatSequencer = useCombatEventSequencer(game, setGame);
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

  const castAbility = (abilityId: string) => {
    setGame((current) => {
      if (!current.adventure.combat) return current;
      return {
        ...current,
        adventure: { ...current.adventure, combat: useAbility(current.adventure.combat, current.character, abilityId) },
      };
    });
  };

  const finishPlayerTurn = () => {
    setGame((current) => {
      if (!current.adventure.combat) return current;
      return {
        ...current,
        adventure: { ...current.adventure, combat: endPlayerTurn(current.adventure.combat, current.character) },
      };
    });
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
      if (!talent || current.character.unlockedTalents.includes(talentId) || talent.cost > current.character.talentPoints) return current;
      if (!areTalentRequirementsMet(talent, current.character.unlockedTalents, TALENTS)) return current;
      const equipped = talent.abilityId && current.character.equippedAbilities.length < 6
        ? [...current.character.equippedAbilities, talent.abilityId]
        : current.character.equippedAbilities;
      return {
        ...current,
        character: {
          ...current.character,
          talentPoints: current.character.talentPoints - talent.cost,
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
      style={{ "--attack-duration": `${COMBAT_TIMING.attackDurationMs / Math.max(1, game.adventure.combat?.attackAnimationHitCount ?? 1)}ms` } as React.CSSProperties}
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
            onAbility={castAbility}
            onEndTurn={finishPlayerTurn}
            onEnemyTurn={runEnemyTurn}
            onCombatEvent={combatSequencer.revealEvent}
            onCombatSequenceComplete={combatSequencer.completeSequence}
            onInitiativeComplete={finishInitiativeRoll}
            onContinue={continueJourney}
            onLeaveTraining={leaveTraining}
            onEvent={resolveEvent}
            onPermadeath={returnToCharacterCreation}
            onTalents={() => navigate("talents")}
            onCharacter={() => navigate("character")}
          />
        )}
        {view === "character" && (characterAssetsReady
          ? <CharacterView character={game.character} locked={combatLocked} onEquip={equipItem} onUnequip={unequipItem} onAllocateStat={allocateStat} />
          : <CharacterLoadingScreen />)}
        {view === "talents" && <TalentsView character={game.character} locked={combatLocked} onUnlock={unlockTalent} onToggleAbility={toggleAbility} />}
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

function AdventureView({ game, derived, onBegin, onSelectEnemy, onAbility, onEndTurn, onEnemyTurn, onCombatEvent, onCombatSequenceComplete, onInitiativeComplete, onContinue, onLeaveTraining, onEvent, onPermadeath, onTalents, onCharacter }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  onBegin: (mode: AdventureMode) => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onEndTurn: () => void;
  onEnemyTurn: (actorId: string) => void;
  onCombatEvent: (eventId: number, eventIndex: number) => void;
  onCombatSequenceComplete: (eventId: number) => void;
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
  const [playerReadyEventId, setPlayerReadyEventId] = useState<number | null>(null);
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
  const poisonAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "poison");
  const poisonPulseTargets = new Set(poisonAnimations.map((animation) => animation.targetId));
  const playerStealthed = combat.playerStatuses.some((status) => status.id === "stealth");
  const forcedTargetId = combat.enemies.find((enemy) => enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth") && enemy.statuses.some((status) => status.id === "taunt"))?.instanceId ?? null;
  const isPlayerTurn = activeActor?.kind === "player";
  const playerIncapacitated = combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep");
  const playerInputLocked = initiativePlaying || playerIncapacitated || (sequencePending && playerReadyEventId !== combatEventId);
  const handleCombatEventShown = (eventId: number, eventIndex: number) => {
    if (eventRevealsPlayerTurn(combat, eventIndex)) setPlayerReadyEventId(eventId);
    onCombatEvent(eventId, eventIndex);
  };
  return (
    <section className={`combat-page compact-combat ${inspectedInfo ? "inspect-info-open" : ""}`}>
      <ProgressHeader index={adventure.nodeIndex} mode={adventure.mode} />
      <TurnOrderBar combat={combat} />
      {initiativePlaying && <InitiativeRoll key={`${adventure.nodeIndex}-${combat.eventId}`} combat={combat} onComplete={onInitiativeComplete} />}
      <div className="compact-arena">
        <article
          key="player"
          data-combatant-id="player"
          className={`compact-combatant player-combatant ${activeActor?.kind === "player" ? "active-turn" : ""} ${damagedTargets.includes("player") ? "damaged" : ""} ${combat.attackingActorId === "player" ? `attacking-right attack-cycle-${combat.attackAnimationId % 2}` : ""} ${poisonPulseTargets.has("player") ? "poison-applied" : ""} ${playerStealthed ? "stealthed" : ""}`}
        >
          {playerStealthed && <span className="stealth-smoke stealth-smoke-one" aria-hidden="true" />}
          {playerStealthed && <span className="stealth-smoke stealth-smoke-two" aria-hidden="true" />}
          <h2>{game.character.name}</h2>
          <div className="compact-resource-label"><span>Health</span><b>{combat.playerHp}/{combat.playerMaxHp}</b></div>
          <HealthBar value={combat.playerHp} max={combat.playerMaxHp} />
          <div className="compact-status-row">
            {combat.playerStatuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} duration={status.duration} permanent={status.permanent} kind={status.kind} onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
          </div>
          <div className="compact-resource-label energy-label"><span>Energy</span><b>{combat.energy}/{combat.maxEnergy}</b></div>
          <EnergySegments value={combat.energy} max={combat.maxEnergy} regen={derived.energyRegen + (combat.nextTurnEnergyRegenBonus ?? 0)} showGain />
        </article>

        <div className={`compact-enemy-stack count-${combat.enemies.length}`}>
          {combat.enemies.map((enemy) => {
            const targetable = enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth") && (!forcedTargetId || forcedTargetId === enemy.instanceId);
            return (
            <article
              key={enemy.instanceId}
              data-combatant-id={enemy.instanceId}
              role="button"
              tabIndex={targetable ? 0 : -1}
              aria-disabled={!targetable}
              aria-label={`Target ${enemy.name}`}
              className={`compact-combatant enemy-combatant ${activeActor?.actorId === enemy.instanceId ? "active-turn" : ""} ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""} ${!targetable && enemy.hp > 0 ? "untargetable" : ""} ${enemy.statuses.some((status) => status.id === "stunned") ? "is-stunned" : ""} ${damagedTargets.includes(enemy.instanceId) ? "damaged" : ""} ${combat.attackingActorId === enemy.instanceId ? `attacking-left attack-cycle-${combat.attackAnimationId % 2}` : ""} ${poisonPulseTargets.has(enemy.instanceId) ? "poison-applied" : ""}`}
              style={{ "--enemy-accent": enemy.accent } as React.CSSProperties}
              onClick={() => targetable && onSelectEnemy(enemy.instanceId)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && targetable && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelectEnemy(enemy.instanceId);
                }
              }}
            >
              <span className="compact-target"><Target size={11} /></span>
              <h2>{enemy.name}</h2>
              <div className="compact-resource-label"><span>Health</span><b>{enemy.hp}/{enemy.maxHp}</b></div>
              <HealthBar value={enemy.hp} max={enemy.maxHp} />
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

      {sequencePending && <FloatingCombatText key={combat.eventId} eventId={combat.eventId} events={combat.floatingEvents} onEventShown={handleCombatEventShown} onSequenceComplete={onCombatSequenceComplete} />}

      <div className="compact-ability-grid">
        {game.character.equippedAbilities.map((id) => {
          const ability = ABILITIES[id];
          const cooldown = combat.abilityCooldowns?.[id] ?? 0;
          const selectedTarget = combat.enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId);
          const targetRequirementMet = !ability.requiredTargetStatus || selectedTarget?.statuses.some((status) => status.id === ability.requiredTargetStatus);
          const spreadTargetAvailable = !ability.spreadTargetStatus || combat.enemies.some((enemy) => (
            enemy.hp > 0
            && enemy.instanceId !== selectedTarget?.instanceId
            && !enemy.statuses.some((status) => status.id === "stealth")
          ));
          const selfRequirementMet = !ability.requiredSelfStatus
            || combat.playerStatuses.some((status) => status.id === ability.requiredSelfStatus)
            || getCharacterAbilityModifiers(game.character, ability.id).some((modifier) => modifier.allowWithoutRequiredSelfStatus);
          const effectiveEnergyCost = combat.playerStatuses.some((status) => status.id === "distraction") ? 0 : ability.energyCost;
          return <HoldAbilityButton key={id} ability={ability} energyCost={effectiveEnergyCost} cooldown={cooldown} disabled={playerInputLocked || !isPlayerTurn || cooldown > 0 || combat.outcome !== "active" || effectiveEnergyCost > combat.energy || !targetRequirementMet || !spreadTargetAvailable || !selfRequirementMet} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <div className="combat-footer-controls">
        <button className="combat-log-button" onClick={() => setLogOpen(true)}><BookOpen size={14} /> Combat Log</button>
        <button className="end-turn-button" disabled={playerInputLocked || !isPlayerTurn || combat.outcome !== "active"} onClick={onEndTurn}>
          {isPlayerTurn ? "End Turn" : `${activeActor?.name ?? "Enemy"}'s Turn`} <ChevronRight size={14} />
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
  return (
    <div className="turn-order-bar" aria-label={`Turn order, round ${combat.turn}`}>
      <span className="round-label">Round {combat.turn}</span>
      <div>
        {combat.turnOrder.map((actor, index) => {
          const enemy = actor.kind === "enemy" ? combat.enemies.find((candidate) => candidate.instanceId === actor.actorId) : null;
          const defeated = actor.kind === "player" ? combat.playerHp <= 0 : (enemy?.hp ?? 0) <= 0;
          const currentTarget = Boolean(enemy && enemy.instanceId === combat.selectedEnemyId && enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth"));
          const initiative = getCombatInitiative(combat, actor);
          return (
            <span
              key={actor.actorId}
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

function HealthBar({ value, max }: { value: number; max: number }) {
  const previousValue = useRef(value);
  const [change, setChange] = useState<{ id: number; delta: number } | null>(null);

  useEffect(() => {
    const delta = value - previousValue.current;
    previousValue.current = value;
    if (delta !== 0) setChange({ id: Date.now(), delta });
  }, [value]);

  return (
    <div className="health-bar-wrap">
      <div className="health-bar"><i style={{ width: `${Math.max(0, value / max) * 100}%` }} /></div>
      {change && (
        <strong key={change.id} className={`health-change ${change.delta > 0 ? "heal" : "damage"}`} aria-hidden="true">
          {change.delta > 0 ? "+" : "−"}{Math.abs(change.delta)}
        </strong>
      )}
    </div>
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
  const amountLabel = id === "barrier" || id === "guard"
    ? `${stacks} remaining`
    : STATUS_EFFECTS[id].stackable
      ? `${stacks} ${stacks === 1 ? "stack" : "stacks"}`
      : "does not stack";
  const label = `${name}, ${amountLabel}, ${permanent ? "permanent" : `${duration} ${duration === 1 ? "turn" : "turns"} remaining`}`;
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

function HoldAbilityButton({ ability, energyCost, cooldown, disabled, onUse }: { ability: Ability; energyCost: number; cooldown: number; disabled: boolean; onUse: () => void }) {
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
      className={`compact-ability ${ability.branch}`}
      disabled={disabled}
      onClick={activate}
      onPointerDown={beginHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={`${ability.name}, ${energyCost} Energy, ${ability.cooldownTurns ?? 0} turn base cooldown${cooldown > 0 ? `, ${cooldown} remaining` : ""}. Hold for details.`}
    >
      <span className="compact-ability-icon">{ability.icon}</span>
      <strong>{ability.name}</strong>
      <span className="compact-ability-cost">{energyCost}<Sparkles size={10} /></span>
      <span className="compact-ability-cooldown-value"><Hourglass size={9} />{ability.cooldownTurns ?? 0}</span>
      {cooldown > 0 && <span className="compact-ability-cooldown" aria-hidden="true"><Hourglass size={15} /><b>{cooldown}</b></span>}
      <span className={`ability-hold-tooltip ${tooltipOpen ? "force-open" : ""}`}><b>{ability.name}</b><small>{ability.description}</small><em>{energyCost} Energy · {ability.cooldownTurns ? `${ability.cooldownTurns} turn cooldown` : "No cooldown"}</em></span>
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

function TalentDetailModal({ talent, character, locked, onClose, onUnlock, onToggleAbility }: {
  talent: (typeof TALENTS)[number];
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onUnlock: (id: string) => void;
  onToggleAbility: (id: string) => void;
}) {
  const ability = talent.abilityId ? ABILITIES[talent.abilityId] : null;
  const coreAbilities = talent.id === "origin" ? [ABILITIES.strike, ABILITIES.guard] : [];
  const unlocked = character.unlockedTalents.includes(talent.id);
  const available = areTalentRequirementsMet(talent, character.unlockedTalents, TALENTS);
  const abilityEquipped = Boolean(ability && character.equippedAbilities.includes(ability.id));
  const loadoutFull = character.equippedAbilities.length >= 6;
  const classBonus = talent.kind === "class" ? talent.description.replace(/\s*Unlocks?[^.]*\.?$/i, "").trim() : talent.description;
  const requiredNames = getTalentConnectionIds(talent.id, TALENTS)
    .filter((id) => !character.unlockedTalents.includes(id))
    .map((id) => TALENTS.find((candidate) => candidate.id === id)?.name ?? id);
  const canUnlock = !locked && available && character.talentPoints >= talent.cost && !unlocked;
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
              return (
                <section className="talent-core-ability" key={coreAbility.id}>
                  <div className="talent-core-ability-heading"><span aria-hidden="true">{coreAbility.icon}</span><strong>{coreAbility.name}</strong></div>
                  <div className="talent-ability-metrics">
                    <span><small>Energy</small><strong>{coreAbility.energyCost}</strong></span>
                    <span><small>Cooldown</small><strong>{coreAbility.cooldownTurns ? `${coreAbility.cooldownTurns} ${coreAbility.cooldownTurns === 1 ? "turn" : "turns"}` : "None"}</strong></span>
                  </div>
                  <p>{coreAbility.description}</p>
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
              <span><small>Energy</small><strong>{ability.energyCost}</strong></span>
              <span><small>Cooldown</small><strong>{ability.cooldownTurns ? `${ability.cooldownTurns} ${ability.cooldownTurns === 1 ? "turn" : "turns"}` : "None"}</strong></span>
            </div>
            {talent.kind === "class" && <div className="talent-detail-effect"><small>Class Bonus</small><p>{classBonus}</p></div>}
            <div className="talent-detail-effect"><small>Ability Effect</small><p>{ability.description}</p></div>
          </>
        ) : <div className="talent-detail-effect"><small>Effect</small><p>{talent.description}</p></div>}
        <div className="talent-detail-actions">
          <button type="button" className="talent-detail-close" onClick={onClose}>Close</button>
          {talent.id !== "origin" && !unlocked && <button type="button" className="talent-detail-primary" disabled={!canUnlock} onClick={() => onUnlock(talent.id)}>{unlockLabel}</button>}
          {unlocked && ability && <button type="button" className="talent-detail-primary" disabled={locked || (!abilityEquipped && loadoutFull)} onClick={() => onToggleAbility(ability.id)}>{abilityEquipped ? "Unequip Ability" : loadoutFull ? "Loadout Full" : "Equip Ability"}</button>}
        </div>
      </article>
    </div>
  );
}

function TalentsView({ character, locked, onUnlock, onToggleAbility }: { character: CharacterState; locked: boolean; onUnlock: (id: string) => void; onToggleAbility: (id: string) => void }) {
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
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
      <div className="loadout-panel paper-panel">
        <div><p className="eyebrow">Active Loadout</p><h3>Equipped Abilities</h3></div>
        <div className="loadout-slots">{Array.from({ length: 6 }).map((_, index) => { const id = character.equippedAbilities[index]; const ability = id ? ABILITIES[id] : null; return <button key={index} disabled={locked} className={ability ? ability.branch : "empty"} onClick={() => ability && onToggleAbility(ability.id)} data-game-tooltip={ability ? "Click to unequip" : undefined}>{ability ? <><span>{ability.icon}</span><small>{ability.name}</small></> : <><span>+</span><small>Empty</small></>}</button>; })}</div>
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
              {TALENTS.flatMap((talent) => talent.requires.map((requirement) => {
                const from = nodePositions.get(requirement);
                const to = nodePositions.get(talent.id);
                if (!from || !to) return null;
                const active = character.unlockedTalents.includes(requirement) && character.unlockedTalents.includes(talent.id);
                return <line key={`${requirement}-${talent.id}`} className={active ? "active" : ""} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
              }))}
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
      {selectedTalent && <TalentDetailModal talent={selectedTalent} character={character} locked={locked} onClose={closeTalentDetails} onUnlock={onUnlock} onToggleAbility={onToggleAbility} />}
    </section>
  );
}

export default App;
