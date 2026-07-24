import {
  CircleDot,
  Footprints,
  Home,
  RotateCcw, Shield,
  Sparkles,
  UserRound,
  Wrench
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameConfirmDialog } from "./components/GameConfirmDialog";
import { DevtoolAccessDialog, type DevtoolKind } from "./components/devtools/shared";
import { DEFAULT_ADVENTURE_ID, entryToNode, getAdventureDefinition, getAdventureNode, selectStageEntry } from "./game/adventures";
import type { CharacterAvatarId } from "./game/avatars";
import { getCharacterAvatar } from "./game/avatars";
import { getDerivedStats, INITIAL_GAME } from "./game/character";
import { ADVENTURE_EVENTS, TALENTS } from "./game/data";
import { createCombat, ensureCombatState, selectEnemyTarget, takeEnemyTurn } from "./game/engine";
import { resolveAdventureEventChoice } from "./game/eventOutcomes";
import { equipGearItem, unequipGearItem } from "./game/gear";
import { grantCombatReward } from "./game/rewards";
import { clearSave, loadGame, saveGame } from "./game/save";
import { areTalentRequirementsMet, isAdditionalClassTalentLocked } from "./game/talentRequirements";
import { COMBAT_TIMING } from "./game/timing";
import type { AdventureMode, CharacterState, GameState, GearItem, GearSlot, StatName } from "./game/types";
import { useCombatActionQueue } from "./hooks/useCombatActionQueue";
import { useCombatEventSequencer } from "./hooks/useCombatEventSequencer";

import { AdventureView } from "./components/adventure/AdventureView";

import { CharacterCreation } from "./components/character/CharacterCreation";

import { CharacterAssetBoundary, CharacterView } from "./components/character/CharacterView";

import { describeEnemyEncounter, getAvailableCharacterAbilities, GoldIcon, preloadCharacterAssets, rollDummyEncounter, type CharacterSection } from "./ui/gameUi";

type View = "adventure" | "character" | DevtoolKind;

const TalentsView = lazy(() => import("./components/talents/TalentsView").then((module) => ({ default: module.TalentsView })));
const TalentDevtool = lazy(() => import("./components/TalentDevtool").then((module) => ({ default: module.TalentDevtool })));
const EnemyDevtool = lazy(() => import("./components/devtools/EnemyDevtool").then((module) => ({ default: module.EnemyDevtool })));
const EventDevtool = lazy(() => import("./components/devtools/EventDevtool").then((module) => ({ default: module.EventDevtool })));
const AdventureDevtool = lazy(() => import("./components/devtools/AdventureDevtool").then((module) => ({ default: module.AdventureDevtool })));
const PortraitDevtool = lazy(() => import("./components/PortraitDevtool").then((module) => ({ default: module.PortraitDevtool })));

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
  const [characterSection, setCharacterSection] = useState<CharacterSection>("overview");
  const [travelTransition, setTravelTransition] = useState<{ phase: "travel" | "encounter"; dots: number; message: string; travelLabel: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [devtoolGateOpen, setDevtoolGateOpen] = useState(false);
  const [characterAssetsReady, setCharacterAssetsReady] = useState(false);
  const [playerTurnReadyEventId, setPlayerTurnReadyEventId] = useState<number | null>(null);
  const travelTimers = useRef<number[]>([]);
  const presentedRewardIds = useRef(new Set<string>());
  const derived = useMemo(() => getDerivedStats(game.character), [game.character]);
  const combatSequencer = useCombatEventSequencer(game, setGame);
  const combatActionQueue = useCombatActionQueue(game, setGame, playerTurnReadyEventId);
  const combatLocked = game.adventure.combat?.outcome === "active";
  const activeNode = getAdventureNode(game.adventure);
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
    const avatar = getCharacterAvatar(game.character.avatarId);
    preloadCharacterAssets(avatar.imageUrl, avatar.portraitUrl).then(() => {
      if (!cancelled) setCharacterAssetsReady(true);
    });
    return () => { cancelled = true; };
  }, [game.character.avatarId]);

  const navigate = (next: View) => {
    if (next === "character") setCharacterSection("overview");
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCharacterSection = (section: CharacterSection) => {
    setCharacterSection(section);
    setView("character");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDevtool = (tool: DevtoolKind) => {
    setDevtoolGateOpen(false);
    setView(tool);
    window.scrollTo({ top: 0 });
  };

  const markRewardPresented = useCallback((rewardId: string) => {
    presentedRewardIds.current.add(rewardId);
  }, []);

  const playTravelTransition = (mode: AdventureMode, message: string, onComplete: () => void) => {
    if (travelTransition) return;
    const travelLabel = mode === "endless" ? "Returning to the proving grounds" : "Walking beneath the windsong canopy";
    setTravelTransition({ phase: "travel", dots: 1, message, travelLabel });
    const dotInterval = window.setInterval(() => {
      setTravelTransition((current) => current?.phase === "travel" ? { ...current, dots: Math.min(5, current.dots + 1) } : current);
    }, 500);
    const encounterTimer = window.setTimeout(() => {
      window.clearInterval(dotInterval);
      setTravelTransition({ phase: "encounter", dots: 5, message, travelLabel });
    }, 2500);
    const completeTimer = window.setTimeout(() => {
      onComplete();
      setTravelTransition(null);
    }, 4000);
    travelTimers.current = [dotInterval, encounterTimer, completeTimer];
  };

  const beginAdventure = (mode: AdventureMode, adventureId = DEFAULT_ADVENTURE_ID) => {
    if (mode === "story") {
      const definition = getAdventureDefinition(adventureId);
      if (definition.prerequisiteAdventureId && !game.character.completedAdventureIds.includes(definition.prerequisiteAdventureId)) return;
    }
    const entry = mode === "endless" ? null : selectStageEntry(getAdventureDefinition(adventureId), 0);
    const enemyIds = mode === "endless" ? rollDummyEncounter() : entry?.enemyIds;
    const node = entry ? entryToNode(entry) : null;
    const message = enemyIds?.length
      ? describeEnemyEncounter(enemyIds)
      : `You discover ${node?.title ?? "a new path"}.`;
    playTravelTransition(mode, message, () => {
      setGame((current) => {
        const maxHp = getDerivedStats(current.character).maxHp;
        const combat = enemyIds?.length ? createCombat(current.character, enemyIds, maxHp) : null;
        return {
          ...current,
          adventure: { mode, adventureId, active: true, nodeIndex: 0, stageEntryId: entry?.id ?? null, carryHp: maxHp, combat, eventResolved: false, eventRollResult: null, nextCombatPlayerStatuses: [], nextCombatEnemyStatuses: [], eventEncounter: null, latestLoot: null, pendingReward: null, completed: false },
        };
      });
    });
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

  const advanceJourney = (endlessEnemyIds?: string[], nextStoryEntryId?: string) => {
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
            eventRollResult: null,
            nextCombatPlayerStatuses: [],
            nextCombatEnemyStatuses: [],
            eventEncounter: null,
            stageEntryId: null,
            latestLoot: null,
            pendingReward: null,
          },
        };
      }

      const definition = getAdventureDefinition(adventure.adventureId);
      if (adventure.nodeIndex >= definition.stages.length - 1) {
        return {
          ...current,
          character: { ...character, completedAdventureIds: [...new Set([...character.completedAdventureIds, definition.id])] },
          adventure: { ...adventure, active: false, completed: true, carryHp, latestLoot, pendingReward: null, combat: null, eventEncounter: null, nextCombatPlayerStatuses: [], nextCombatEnemyStatuses: [] },
        };
      }

      const nextIndex = adventure.nodeIndex + 1;
      const stage = definition.stages[nextIndex];
      const entry = stage.entries.find((candidate) => candidate.id === nextStoryEntryId) ?? selectStageEntry(definition, nextIndex);
      const combat = entry.enemyIds?.length ? createCombat(character, entry.enemyIds, carryHp, {
        playerStatuses: adventure.nextCombatPlayerStatuses,
        enemyStatuses: adventure.nextCombatEnemyStatuses,
      }) : null;
      return {
        ...current,
        character,
        adventure: {
          ...adventure,
          nodeIndex: nextIndex,
          stageEntryId: entry.id,
          carryHp,
          combat,
          eventResolved: false,
          eventRollResult: null,
          nextCombatPlayerStatuses: combat ? [] : adventure.nextCombatPlayerStatuses,
          nextCombatEnemyStatuses: combat ? [] : adventure.nextCombatEnemyStatuses,
          eventEncounter: null,
          latestLoot: wonCombat ? latestLoot : null,
          pendingReward: null,
        },
      };
    });
  };

  const continueJourney = () => {
    if (travelTransition) return;
    if (game.adventure.eventResolved && game.adventure.eventEncounter && !game.adventure.combat) {
      const encounter = game.adventure.eventEncounter;
      playTravelTransition(game.adventure.mode, describeEnemyEncounter(encounter.enemyIds), () => {
        setGame((current) => {
          const pendingEncounter = current.adventure.eventEncounter;
          if (!pendingEncounter || current.adventure.combat) return current;
          const carryHp = current.adventure.carryHp ?? getDerivedStats(current.character).maxHp;
          const combat = createCombat(current.character, pendingEncounter.enemyIds, carryHp, {
            playerStatuses: current.adventure.nextCombatPlayerStatuses,
            enemyStatuses: current.adventure.nextCombatEnemyStatuses,
          });
          return {
            ...current,
            adventure: { ...current.adventure, combat, nextCombatPlayerStatuses: [], nextCombatEnemyStatuses: [] },
          };
        });
      });
      return;
    }
    const definition = getAdventureDefinition(game.adventure.adventureId);
    if (game.adventure.mode === "story" && game.adventure.nodeIndex >= definition.stages.length - 1) {
      advanceJourney();
      return;
    }
    const endlessEnemyIds = game.adventure.mode === "endless" ? rollDummyEncounter() : undefined;
    const nextEntry = game.adventure.mode === "endless" ? null : selectStageEntry(definition, game.adventure.nodeIndex + 1);
    const nextNode = nextEntry ? entryToNode(nextEntry) : null;
    const message = endlessEnemyIds
      ? describeEnemyEncounter(endlessEnemyIds)
      : nextNode?.enemies
        ? describeEnemyEncounter(nextNode.enemies)
        : `You discover ${nextNode?.title}.`;
    playTravelTransition(game.adventure.mode, message, () => {
      advanceJourney(endlessEnemyIds, nextEntry?.id);
    });
  };

  const leaveTraining = () => {
    setGame((current) => {
      if (current.adventure.mode !== "endless" || current.adventure.combat?.outcome !== "victory") return current;
      return {
        ...current,
        adventure: {
          mode: "story",
          adventureId: DEFAULT_ADVENTURE_ID,
          active: false,
          nodeIndex: 0,
          stageEntryId: null,
          carryHp: null,
          combat: null,
          eventResolved: false,
          eventRollResult: null,
          nextCombatPlayerStatuses: [],
          nextCombatEnemyStatuses: [],
          eventEncounter: null,
          latestLoot: null,
          pendingReward: null,
          completed: false,
        },
      };
    });
  };

  const resolveEvent = (choiceId: string) => {
    setGame((current) => {
      if (current.adventure.eventResolved) return current;
      const node = getAdventureNode(current.adventure);
      const definition = node.eventId ? ADVENTURE_EVENTS[node.eventId] : undefined;
      const choice = definition?.choices.find((candidate) => candidate.id === choiceId);
      if (!choice) return current;
      return resolveAdventureEventChoice(current, choice);
    });
  };

  const unlockTalent = (talentId: string) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const talent = TALENTS.find((item) => item.id === talentId);
      const freeTestingUnlock = current.adventure.mode === "endless";
      if (!talent || current.character.unlockedTalents.includes(talentId) || (!freeTestingUnlock && talent.cost > current.character.talentPoints)) return current;
      if (!areTalentRequirementsMet(talent, current.character.unlockedTalents, TALENTS)) return current;
      if (isAdditionalClassTalentLocked(talent, current.character.unlockedTalents, current.character.level, TALENTS)) return current;
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
      const previousMaxHp = getDerivedStats(current.character).maxHp;
      const character: CharacterState = {
        ...current.character,
        unspentStatPoints: current.character.unspentStatPoints - 1,
        baseStats: { ...current.character.baseStats, [stat]: current.character.baseStats[stat] + 1 },
      };
      const nextMaxHp = getDerivedStats(character).maxHp;
      const healthIncrease = stat === "vitality" ? Math.max(0, nextMaxHp - previousMaxHp) : 0;
      const combat = current.adventure.combat && healthIncrease > 0
        ? {
          ...current.adventure.combat,
          playerHp: Math.min(nextMaxHp, current.adventure.combat.playerHp + healthIncrease),
          playerMaxHp: nextMaxHp,
        }
        : current.adventure.combat;
      const carryHp = current.adventure.carryHp !== null && healthIncrease > 0
        ? Math.min(nextMaxHp, current.adventure.carryHp + healthIncrease)
        : current.adventure.carryHp;
      return {
        ...current,
        character,
        adventure: { ...current.adventure, carryHp, combat },
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
          <span><strong>ARKENFALL</strong></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Footprints size={17} />} label="Adventure" />
          <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<UserRound size={17} />} label="Character" />
        </nav>
        <div className="resources">
          <span><GoldIcon /> {game.character.gold}</span>
          <button className="icon-button devtool-menu-button" onClick={() => setDevtoolGateOpen(true)} data-game-tooltip="Developer tools" data-tooltip-placement="bottom" aria-label="Open developer tools"><Wrench size={14} /></button>
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
            onTalents={() => openCharacterSection("talents")}
            onCharacter={() => openCharacterSection("overview")}
            rewardPresentationPlayed={Boolean(game.adventure.pendingReward && presentedRewardIds.current.has(game.adventure.pendingReward.id))}
            onRewardPresentationStart={markRewardPresented}
          />
        )}
        {view === "character" && (
          <>
            <nav className="character-submenu" aria-label="Character sections">
              <button type="button" className={characterSection === "overview" ? "active" : ""} aria-current={characterSection === "overview" ? "page" : undefined} onClick={() => openCharacterSection("overview")}><UserRound size={16} /> Character</button>
              <button type="button" className={characterSection === "equipment" ? "active" : ""} aria-current={characterSection === "equipment" ? "page" : undefined} onClick={() => openCharacterSection("equipment")}><Shield size={16} /> Equipment and Inventory</button>
              <button type="button" className={`${characterSection === "talents" ? "active" : ""} ${game.character.talentPoints > 0 ? "talent-attention" : ""}`.trim()} aria-current={characterSection === "talents" ? "page" : undefined} onClick={() => openCharacterSection("talents")}><CircleDot size={16} /> Talents &amp; Abilities</button>
            </nav>
            {characterSection !== "talents" ? (
              <CharacterAssetBoundary preloaded={characterAssetsReady} assetKey={game.character.avatarId}>
                <CharacterView mode={characterSection} character={game.character} locked={combatLocked} onEquip={equipItem} onUnequip={unequipItem} onAllocateStat={allocateStat} />
              </CharacterAssetBoundary>
            ) : (
              <Suspense fallback={null}>
                <TalentsView character={game.character} locked={combatLocked} freeUnlocks={game.adventure.mode === "endless"} onUnlock={unlockTalent} onToggleAbility={toggleAbility} onSetAbilitySlot={setAbilitySlot} />
              </Suspense>
            )}
          </>
        )}
        <Suspense fallback={null}>
          {view === "talentDevtool" && <TalentDevtool onExit={() => navigate("adventure")} />}
          {view === "enemyDevtool" && <EnemyDevtool onExit={() => navigate("adventure")} />}
          {view === "eventDevtool" && <EventDevtool onExit={() => navigate("adventure")} />}
          {view === "adventureDevtool" && <AdventureDevtool onExit={() => navigate("adventure")} />}
          {view === "portraitDevtool" && <PortraitDevtool onExit={() => navigate("adventure")} />}
        </Suspense>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Home size={19} />} label="Adventure" />
        <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<UserRound size={19} />} label="Character" />
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
      {devtoolGateOpen && <DevtoolAccessDialog onClose={() => setDevtoolGateOpen(false)} onOpen={openDevtool} />}
      {travelTransition && (
        <div className={`travel-transition ${travelTransition.phase}`} role="status" aria-live="polite">
          <div className="travel-transition-content">
            {travelTransition.phase === "travel" && (
              <div className="travel-footsteps" aria-hidden="true">
                <Footprints /><Footprints />
              </div>
            )}
            <span>{travelTransition.phase === "travel" ? `${travelTransition.travelLabel}${".".repeat(travelTransition.dots)}` : travelTransition.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

export default App;
