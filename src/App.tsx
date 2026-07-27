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
import { canStartStoryAdventure, DEFAULT_ADVENTURE_ID, entryToNode, getAdventureDefinition, getAdventureNode, getAdventureStartingHp, getStoryNodeIntroduction, selectStageEntry } from "./game/adventures";
import type { CharacterAvatarId } from "./game/avatars";
import { getCharacterAvatar } from "./game/avatars";
import { getDerivedStats, INITIAL_GAME } from "./game/character";
import { ADVENTURE_EVENTS, ITEMS, TALENTS } from "./game/data";
import { grantItemForTesting, levelUpCharacterForTesting } from "./game/developerTools";
import { createCombat, ensureCombatState, selectEnemyTarget, takeEnemyTurn } from "./game/engine";
import { purchaseEventMerchantItem, resolveAdventureEventChoice, sellEventMerchantItem } from "./game/eventOutcomes";
import { equipGearItem, unequipGearItem } from "./game/gear";
import { grantCombatReward } from "./game/rewards";
import { clearSave, loadGame, saveGame } from "./game/save";
import { areTalentRequirementsMet, isAdditionalClassTalentLocked } from "./game/talentRequirements";
import { ADVENTURE_TRANSITION_TIMING, COMBAT_TIMING } from "./game/timing";
import { craftTownItem, purchaseTavernMeal, purchaseTownItem, restAtArkenfallTavern, type TavernMealId, type TownActionResult } from "./game/town";
import type { ArkenfallVendorId, CharacterState, GameState, GearItem, GearSlot, StatName } from "./game/types";
import { useCombatActionQueue } from "./hooks/useCombatActionQueue";
import { useCombatEventSequencer } from "./hooks/useCombatEventSequencer";

import { AdventureView } from "./components/adventure/AdventureView";

import { CharacterCreation } from "./components/character/CharacterCreation";
import { ClassSelection } from "./components/character/ClassSelection";

import { CharacterAssetBoundary, CharacterView } from "./components/character/CharacterView";
import { chooseStartingClass, hasSpentIntroductionTalentPoint } from "./game/characterIntroduction";

import { describeEnemyEncounter, getAvailableCharacterAbilities, GoldIcon, preloadCharacterAssets, type CharacterSection } from "./ui/gameUi";

type View = "adventure" | "character" | "town" | DevtoolKind;
type LevelUpFlowStep = "talents" | "attributes";
type EncounterFlavorPhase = "center" | "lower" | "exit";
type TownEntryLocation = "square" | "tavern";

const TalentsView = lazy(() => import("./components/talents/TalentsView").then((module) => ({ default: module.TalentsView })));
const TalentDevtool = lazy(() => import("./components/TalentDevtool").then((module) => ({ default: module.TalentDevtool })));
const EnemyDevtool = lazy(() => import("./components/devtools/EnemyDevtool").then((module) => ({ default: module.EnemyDevtool })));
const EventDevtool = lazy(() => import("./components/devtools/EventDevtool").then((module) => ({ default: module.EventDevtool })));
const AdventureDevtool = lazy(() => import("./components/devtools/AdventureDevtool").then((module) => ({ default: module.AdventureDevtool })));
const ItemDevtool = lazy(() => import("./components/devtools/ItemDevtool").then((module) => ({ default: module.ItemDevtool })));
const PortraitDevtool = lazy(() => import("./components/PortraitDevtool").then((module) => ({ default: module.PortraitDevtool })));
const TownView = lazy(() => import("./components/town/TownView").then((module) => ({ default: module.TownView })));

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
  const [view, setView] = useState<View>(() => game.characterIntroductionStep === "class" || game.characterIntroductionStep === "talents" || game.characterIntroductionStep === "attributes" ? "character" : game.adventure.active ? "adventure" : game.characterIntroductionStep === "town" ? "town" : "adventure");
  const [characterSection, setCharacterSection] = useState<CharacterSection>(() => game.characterIntroductionStep === "talents" ? "talents" : "overview");
  const [levelUpFlowStep, setLevelUpFlowStep] = useState<LevelUpFlowStep | null>(null);
  const [travelTransition, setTravelTransition] = useState<{ phase: "travel" | "encounter"; dots: number; travelLabel: string } | null>(null);
  const [encounterFlavor, setEncounterFlavor] = useState<{ message: string; phase: EncounterFlavorPhase } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [pendingAdventureId, setPendingAdventureId] = useState<string | null>(null);
  const [townEntryLocation, setTownEntryLocation] = useState<TownEntryLocation>("square");
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
  const characterIntroductionActive = game.characterIntroductionStep === "class" || game.characterIntroductionStep === "talents" || game.characterIntroductionStep === "attributes";
  const guidedCharacterFlowActive = characterIntroductionActive || levelUpFlowStep !== null;
  const recommendStartingItem = game.characterIntroductionStep === "town" && !Object.values(game.character.equipment).some(Boolean);

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
    if (game.characterIntroductionStep === "class" || game.characterIntroductionStep === "talents" || game.characterIntroductionStep === "attributes") {
      setCharacterSection(game.characterIntroductionStep === "talents" ? "talents" : "overview");
      setView("character");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (levelUpFlowStep) {
      setCharacterSection(levelUpFlowStep === "talents" ? "talents" : "overview");
      setView("character");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (next === "character") setCharacterSection("overview");
    if (next === "town") setTownEntryLocation("square");
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

  const levelUpForTesting = () => {
    if (combatLocked) return;
    setGame((current) => ({
      ...current,
      character: levelUpCharacterForTesting(current.character),
    }));
  };

  const grantItemFromDevtools = (itemId: string, quantity: number) => {
    const item = ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    setGame((current) => ({
      ...current,
      character: grantItemForTesting(current.character, item, quantity),
    }));
  };

  const markRewardPresented = useCallback((rewardId: string) => {
    presentedRewardIds.current.add(rewardId);
  }, []);

  const playTravelTransition = (message: string, onComplete: () => void, revealMessage = true) => {
    if (travelTransition || encounterFlavor) return;
    const travelLabel = "Walking beneath the windsong canopy";
    setTravelTransition({ phase: "travel", dots: 1, travelLabel });
    const dotInterval = window.setInterval(() => {
      setTravelTransition((current) => current?.phase === "travel" ? { ...current, dots: Math.min(5, current.dots + 1) } : current);
    }, 500);
    const encounterTimer = window.setTimeout(() => {
      window.clearInterval(dotInterval);
      if (!revealMessage) {
        onComplete();
        setTravelTransition(null);
        return;
      }
      setTravelTransition({ phase: "encounter", dots: 5, travelLabel });
      setEncounterFlavor({ message, phase: "center" });
    }, ADVENTURE_TRANSITION_TIMING.travelMs);
    if (!revealMessage) {
      travelTimers.current = [dotInterval, encounterTimer];
      return;
    }
    const completeTimer = window.setTimeout(() => {
      onComplete();
      setTravelTransition(null);
      setEncounterFlavor((current) => current ? { ...current, phase: "lower" } : current);
    }, ADVENTURE_TRANSITION_TIMING.travelMs + ADVENTURE_TRANSITION_TIMING.encounterIntroMs);
    travelTimers.current = [dotInterval, encounterTimer, completeTimer];
  };

  const playImmediateEncounterIntroduction = (message: string, onComplete: () => void) => {
    if (travelTransition || encounterFlavor) return;
    setEncounterFlavor({ message, phase: "center" });
    const completeTimer = window.setTimeout(() => {
      onComplete();
      setEncounterFlavor((current) => current ? { ...current, phase: "lower" } : current);
    }, ADVENTURE_TRANSITION_TIMING.encounterIntroMs);
    travelTimers.current = [completeTimer];
  };

  const beginAdventure = (adventureId = DEFAULT_ADVENTURE_ID) => {
    const definition = getAdventureDefinition(adventureId);
    if (!canStartStoryAdventure(definition, game.character.completedAdventureIds)) return;
    const entry = selectStageEntry(definition, 0);
    const enemyIds = entry.enemyIds;
    const node = entry ? entryToNode(entry) : null;
    const generatedEncounter = enemyIds?.length ? describeEnemyEncounter(enemyIds) : "";
    const message = node ? getStoryNodeIntroduction(node, generatedEncounter) : "You discover a new path.";
    playTravelTransition(message, () => {
      setGame((current) => {
        const maxHp = getDerivedStats(current.character).maxHp;
        const startingHp = getAdventureStartingHp(maxHp, current.adventure.carryHp);
        const combat = enemyIds?.length ? createCombat(current.character, enemyIds, startingHp, {
          playerStatuses: current.adventure.nextCombatPlayerStatuses,
          enemyStatuses: current.adventure.nextCombatEnemyStatuses,
        }) : null;
        return {
          ...current,
          adventure: { mode: "story", adventureId, active: true, nodeIndex: 0, stageEntryId: entry.id, carryHp: startingHp, combat, eventResolved: false, eventRollResult: null, nextCombatPlayerStatuses: combat ? [] : current.adventure.nextCombatPlayerStatuses, nextCombatEnemyStatuses: combat ? [] : current.adventure.nextCombatEnemyStatuses, eventEncounter: null, eventMerchant: null, latestLoot: null, pendingReward: null, completed: false },
        };
      });
    }, node?.type !== "event");
  };

  const requestAdventureStart = (adventureId = DEFAULT_ADVENTURE_ID) => {
    const definition = getAdventureDefinition(adventureId);
    if (!canStartStoryAdventure(definition, game.character.completedAdventureIds)) return;
    const startingHp = getAdventureStartingHp(derived.maxHp, game.adventure.carryHp);
    if (startingHp < derived.maxHp) {
      setPendingAdventureId(adventureId);
      return;
    }
    beginAdventure(adventureId);
  };

  const openTavern = () => {
    setPendingAdventureId(null);
    setTownEntryLocation("tavern");
    setView("town");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const returnToAdventureList = () => {
    setGame((current) => ({
      ...current,
      adventure: {
        ...current.adventure,
        active: false,
        completed: false,
        combat: null,
        eventEncounter: null,
        eventMerchant: null,
        latestLoot: null,
        pendingReward: null,
      },
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

  const beginInitiativeOrder = () => {
    if (!encounterFlavor) return;
    setEncounterFlavor((current) => current ? { ...current, phase: "exit" } : current);
    const flavorTimer = window.setTimeout(() => setEncounterFlavor(null), ADVENTURE_TRANSITION_TIMING.encounterExitMs);
    travelTimers.current = [...travelTimers.current, flavorTimer];
  };

  const advanceJourney = (nextStoryEntryId?: string) => {
    setGame((current) => {
      const adventure = current.adventure;
      const wonCombat = adventure.combat?.outcome === "victory";
      const carryHp = wonCombat ? adventure.combat!.playerHp : (adventure.carryHp ?? getDerivedStats(current.character).maxHp);
      const character = current.character;
      const latestLoot = adventure.pendingReward?.loot ?? adventure.latestLoot;

      const definition = getAdventureDefinition(adventure.adventureId);
      if (adventure.nodeIndex >= definition.stages.length - 1) {
        return {
          ...current,
          character: { ...character, completedAdventureIds: [...new Set([...character.completedAdventureIds, definition.id])] },
          adventure: { ...adventure, active: false, completed: true, carryHp, latestLoot, pendingReward: null, combat: null, eventEncounter: null, eventMerchant: null, nextCombatPlayerStatuses: [], nextCombatEnemyStatuses: [] },
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
          eventMerchant: null,
          latestLoot: wonCombat ? latestLoot : null,
          pendingReward: null,
        },
      };
    });
  };

  const continueJourney = () => {
    if (travelTransition || encounterFlavor) return;
    if (game.adventure.pendingReward?.levelsGained && (game.character.unspentStatPoints > 0 || game.character.talentPoints > 0)) return;
    if (game.adventure.eventResolved && game.adventure.eventEncounter && !game.adventure.combat) {
      const encounter = game.adventure.eventEncounter;
      playImmediateEncounterIntroduction(describeEnemyEncounter(encounter.enemyIds), () => {
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
    if (game.adventure.nodeIndex >= definition.stages.length - 1) {
      advanceJourney();
      return;
    }
    const nextEntry = selectStageEntry(definition, game.adventure.nodeIndex + 1);
    const nextNode = entryToNode(nextEntry);
    const message = getStoryNodeIntroduction(nextNode, nextNode.enemies?.length ? describeEnemyEncounter(nextNode.enemies) : "");
    playTravelTransition(message, () => {
      advanceJourney(nextEntry.id);
    }, nextNode.type !== "event");
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

  const buyMerchantItem = (itemId: string) => {
    setGame((current) => purchaseEventMerchantItem(current, itemId));
  };

  const sellMerchantItem = (itemId: string) => {
    setGame((current) => sellEventMerchantItem(current, itemId));
  };

  const runTownAction = (action: (current: GameState) => TownActionResult): TownActionResult => {
    const result = action(game);
    if (result.success) setGame(result.state);
    return result;
  };

  const buyTownItem = (vendor: ArkenfallVendorId, itemId: string) => runTownAction((current) => purchaseTownItem(current, vendor, itemId));
  const makeTownItem = (station: ArkenfallVendorId, itemId: string) => runTownAction((current) => craftTownItem(current, station, itemId));
  const restInTown = () => runTownAction(restAtArkenfallTavern);
  const eatInTown = (mealId: TavernMealId) => runTownAction((current) => purchaseTavernMeal(current, mealId));

  const unlockTalent = (talentId: string) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const talent = TALENTS.find((item) => item.id === talentId);
      if (!talent || current.character.unlockedTalents.includes(talentId) || talent.cost > current.character.talentPoints) return current;
      if (!areTalentRequirementsMet(talent, current.character.unlockedTalents, TALENTS)) return current;
      if (isAdditionalClassTalentLocked(talent, current.character.unlockedTalents, current.character.level, TALENTS)) return current;
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
      const character = equipGearItem(current.character, item, preferredSlot);
      return {
        ...current,
        characterIntroductionStep: current.characterIntroductionStep === "town" && Object.values(character.equipment).some(Boolean)
          ? "complete"
          : current.characterIntroductionStep,
        character,
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
    setCharacterSection("overview");
    setTravelTransition(null);
    setLevelUpFlowStep(null);
    setResetDialogOpen(false);
  };

  const createCharacter = (name: string, avatarId: CharacterAvatarId) => {
    setGame((current) => ({
      ...current,
      characterCreated: true,
      characterIntroductionStep: "class",
      character: { ...current.character, name: name.trim(), avatarId, unspentStatPoints: 2 },
    }));
    setCharacterSection("overview");
    setView("character");
    setLevelUpFlowStep(null);
    window.scrollTo({ top: 0 });
  };

  const selectIntroductionClass = (talentId: string) => {
    if (game.characterIntroductionStep !== "class") return;
    setGame((current) => {
      if (current.characterIntroductionStep !== "class") return current;
      const character = chooseStartingClass(current.character, talentId);
      return character === current.character ? current : { ...current, characterIntroductionStep: "talents", character };
    });
    setCharacterSection("talents");
    setView("character");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueIntroductionToAttributes = () => {
    if (game.characterIntroductionStep !== "talents" || !hasSpentIntroductionTalentPoint(game.character)) return;
    setGame((current) => current.characterIntroductionStep === "talents" && hasSpentIntroductionTalentPoint(current.character)
      ? { ...current, characterIntroductionStep: "attributes" }
      : current);
    setCharacterSection("overview");
    setView("character");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueIntroductionToTown = () => {
    if (game.characterIntroductionStep !== "attributes" || game.character.unspentStatPoints > 0) return;
    setGame((current) => current.characterIntroductionStep === "attributes" && current.character.unspentStatPoints === 0
      ? { ...current, characterIntroductionStep: "town" }
      : current);
    setTownEntryLocation("square");
    setView("town");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!game.characterCreated) return <CharacterCreation onCreate={createCharacter} />;
  const openScoreCharacter = () => {
    const reward = game.adventure.pendingReward;
    if (reward?.levelsGained && (game.character.talentPoints > 0 || game.character.unspentStatPoints > 0)) {
      const nextStep: LevelUpFlowStep = game.character.talentPoints > 0 ? "talents" : "attributes";
      setLevelUpFlowStep(nextStep);
      setCharacterSection(nextStep === "talents" ? "talents" : "overview");
      setView("character");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    openCharacterSection("overview");
  };

  const continueLevelUpToAttributes = () => {
    if (levelUpFlowStep !== "talents" || game.character.talentPoints > 0) return;
    setLevelUpFlowStep("attributes");
    setCharacterSection("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completeLevelUpFlow = () => {
    if (levelUpFlowStep !== "attributes" || game.character.unspentStatPoints > 0) return;
    setLevelUpFlowStep(null);
    setCharacterSection("overview");
    setView("adventure");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div
      className={`app-shell ${isCombatScreen ? "in-combat" : ""}`}
      style={{ "--attack-duration": `${COMBAT_TIMING.attackDurationMs * Math.max(0.1, game.adventure.combat?.attackAnimationDurationMultiplier ?? 1) / Math.max(1, game.adventure.combat?.attackAnimationHitCount ?? 1)}ms` } as React.CSSProperties}
    >
      <header className="topbar">
        <button className="brand" onClick={() => navigate("adventure")} aria-label={characterIntroductionActive ? "Introduction in progress" : levelUpFlowStep ? "Level up in progress" : "Go to adventure"}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          <span><strong>ARKENFALL</strong></span>
        </button>
        {!guidedCharacterFlowActive && <nav className="desktop-nav" aria-label="Main navigation">
          <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Footprints size={17} />} label="Adventure" />
          <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<UserRound size={17} />} label="Character" />
        </nav>}
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
            onBegin={requestAdventureStart}
            onTown={() => navigate("town")}
            onSelectEnemy={selectEnemy}
            queuedActions={combatActionQueue.actions}
            onAbility={combatActionQueue.queueAbility}
            onConsumable={combatActionQueue.queueConsumable}
            onEndTurn={combatActionQueue.queueEndTurn}
            onEnemyTurn={runEnemyTurn}
            onCombatEvent={combatSequencer.revealEvent}
            onCombatSequenceComplete={combatSequencer.completeSequence}
            onPlayerTurnReady={setPlayerTurnReadyEventId}
            onInitiativeOrderStart={beginInitiativeOrder}
            onInitiativeComplete={finishInitiativeRoll}
            onContinue={continueJourney}
            onReturnToAdventures={returnToAdventureList}
            onEvent={resolveEvent}
            onMerchantPurchase={buyMerchantItem}
            onMerchantSell={sellMerchantItem}
            onPermadeath={returnToCharacterCreation}
            onTalents={() => openCharacterSection("talents")}
            onCharacter={openScoreCharacter}
            onInventory={() => openCharacterSection("equipment")}
            rewardPresentationPlayed={Boolean(game.adventure.pendingReward && presentedRewardIds.current.has(game.adventure.pendingReward.id))}
            onRewardPresentationStart={markRewardPresented}
          />
        )}
        {view === "character" && (
          <>
            {game.characterIntroductionStep === "class" ? <ClassSelection onChoose={selectIntroductionClass} /> : <>
            {!guidedCharacterFlowActive && <nav className="character-submenu" aria-label="Character sections">
              <button type="button" className={characterSection === "overview" ? "active" : ""} aria-current={characterSection === "overview" ? "page" : undefined} onClick={() => openCharacterSection("overview")}><UserRound size={16} /> Character</button>
              <button type="button" className={characterSection === "equipment" ? "active" : ""} aria-current={characterSection === "equipment" ? "page" : undefined} onClick={() => openCharacterSection("equipment")}><Shield size={16} /> Equipment and Inventory</button>
              <button type="button" className={`${characterSection === "talents" ? "active" : ""} ${game.character.talentPoints > 0 ? "talent-attention" : ""}`.trim()} aria-current={characterSection === "talents" ? "page" : undefined} onClick={() => openCharacterSection("talents")}><CircleDot size={16} /> Talents &amp; Abilities</button>
            </nav>}
            {characterSection !== "talents" ? (
              <CharacterAssetBoundary preloaded={characterAssetsReady} assetKey={game.character.avatarId}>
                <CharacterView mode={characterSection} character={game.character} locked={combatLocked} introduction={game.characterIntroductionStep === "attributes"} levelUpFlow={levelUpFlowStep === "attributes"} onNext={levelUpFlowStep === "attributes" ? completeLevelUpFlow : continueIntroductionToTown} onEquip={equipItem} onUnequip={unequipItem} onAllocateStat={allocateStat} />
              </CharacterAssetBoundary>
            ) : (
              <Suspense fallback={null}>
                <TalentsView character={game.character} locked={combatLocked} introduction={game.characterIntroductionStep === "talents"} levelUpFlow={levelUpFlowStep === "talents"} onNext={levelUpFlowStep === "talents" ? continueLevelUpToAttributes : continueIntroductionToAttributes} onUnlock={unlockTalent} onToggleAbility={toggleAbility} onSetAbilitySlot={setAbilitySlot} />
              </Suspense>
            )}
            </>}
          </>
        )}
        {view === "town" && (
          <Suspense fallback={null}>
            <TownView game={game} maxHp={derived.maxHp} initialLocation={townEntryLocation} recommendStartingItem={recommendStartingItem} onExit={() => navigate("adventure")} onBuy={buyTownItem} onCraft={makeTownItem} onRest={restInTown} onMeal={eatInTown} />
          </Suspense>
        )}
        <Suspense fallback={null}>
          {view === "talentDevtool" && <TalentDevtool onExit={() => navigate("adventure")} />}
          {view === "enemyDevtool" && <EnemyDevtool onExit={() => navigate("adventure")} />}
          {view === "eventDevtool" && <EventDevtool onExit={() => navigate("adventure")} />}
          {view === "adventureDevtool" && <AdventureDevtool onExit={() => navigate("adventure")} />}
          {view === "itemDevtool" && <ItemDevtool onExit={() => navigate("adventure")} />}
          {view === "portraitDevtool" && <PortraitDevtool onExit={() => navigate("adventure")} />}
        </Suspense>
      </main>

      {!guidedCharacterFlowActive && <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavButton active={view === "adventure"} onClick={() => navigate("adventure")} icon={<Home size={19} />} label="Adventure" />
        <NavButton active={view === "character"} onClick={() => navigate("character")} icon={<UserRound size={19} />} label="Character" />
      </nav>}
      {resetDialogOpen && (
        <GameConfirmDialog
          title="Erase this character?"
          description="This permanently deletes the character, equipment, talents, and adventure progress. This cannot be undone."
          confirmLabel="Erase & Begin Again"
          onCancel={() => setResetDialogOpen(false)}
          onConfirm={returnToCharacterCreation}
        />
      )}
      {pendingAdventureId && (
        <GameConfirmDialog
          eyebrow="Adventure Preparation"
          title="Not at full Health"
          description={`You have ${getAdventureStartingHp(derived.maxHp, game.adventure.carryHp)} of ${derived.maxHp} Health. Are you sure you want to begin this adventure?`}
          confirmLabel="Yes"
          cancelLabel="Go to Tavern"
          variant="warning"
          onDismiss={() => setPendingAdventureId(null)}
          onCancel={openTavern}
          onConfirm={() => {
            const adventureId = pendingAdventureId;
            setPendingAdventureId(null);
            beginAdventure(adventureId);
          }}
        />
      )}
      {devtoolGateOpen && (
        <DevtoolAccessDialog
          onClose={() => setDevtoolGateOpen(false)}
          onOpen={openDevtool}
          onLevelUp={levelUpForTesting}
          onGrantItem={grantItemFromDevtools}
          characterLevel={game.character.level}
          levelUpDisabled={combatLocked}
        />
      )}
      {travelTransition && (
        <div className={`travel-transition ${travelTransition.phase}`} role="status" aria-live="polite">
          <div className="travel-transition-content">
            {travelTransition.phase === "travel" && (
              <div className="travel-footsteps" aria-hidden="true">
                <Footprints /><Footprints />
              </div>
            )}
            {travelTransition.phase === "travel" && <span>{`${travelTransition.travelLabel}${".".repeat(travelTransition.dots)}`}</span>}
          </div>
        </div>
      )}
      {encounterFlavor && (
        <div
          className={`encounter-flavor ${encounterFlavor.phase}`}
          style={{
            "--encounter-flavor-enter-duration": `${ADVENTURE_TRANSITION_TIMING.encounterEnterMs}ms`,
            "--encounter-flavor-move-duration": `${ADVENTURE_TRANSITION_TIMING.encounterMoveMs}ms`,
            "--encounter-flavor-exit-duration": `${ADVENTURE_TRANSITION_TIMING.encounterExitMs}ms`,
          } as React.CSSProperties}
          role="status"
          aria-live="polite"
        >
          <span>{encounterFlavor.message}</span>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

export default App;
