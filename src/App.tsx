import { useEffect, useMemo, useRef, useState } from "react";
import {
  Backpack, BookOpen, ChevronRight, CircleDot, Coins, Droplets, FlaskConical, Footprints, Gem,
  Heart, Home, RotateCcw, Shield, Skull, Sparkles, Swords, Target, Trophy, UserRound, Zap,
} from "lucide-react";
import { GameConfirmDialog } from "./components/GameConfirmDialog";
import { ABILITIES, ADVENTURE, ENEMIES, GEAR_SET_BONUSES, TALENTS } from "./game/data";
import { calculateInitiativeFlight, getInitiativeRowBounds } from "./game/initiativeLayout";
import { clearSave, loadGame, saveGame } from "./game/save";
import { createCombat, endPlayerTurn, ensureCombatState, getDerivedStats, getLoot, INITIAL_GAME, slotForItem, takeEnemyTurn, useAbility } from "./game/engine";
import { COMBAT_TIMING, INITIATIVE_TIMING } from "./game/timing";
import type { Ability, AdventureNode, CharacterState, CombatLogEntry, CombatState, GameState, GearItem, GearSlot, InspectableInfo, StatName, TalentBranch } from "./game/types";
import { useCombatEventSequencer } from "./hooks/useCombatEventSequencer";

type View = "adventure" | "character" | "talents";

const SLOT_LABELS: Record<GearSlot, string> = {
  head: "Head", chest: "Chest", pants: "Pants", boots: "Boots",
  mainHand: "Main Hand", offHand: "Off Hand", ring1: "Ring I", ring2: "Ring II",
};

const STAT_LABELS: Array<{ key: StatName; label: string; short: string }> = [
  { key: "strength", label: "Strength", short: "STR" },
  { key: "agility", label: "Agility", short: "AGI" },
  { key: "intelligence", label: "Intelligence", short: "INT" },
  { key: "vitality", label: "Vitality", short: "VIT" },
  { key: "luck", label: "Luck", short: "LCK" },
];

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
  const travelTimers = useRef<number[]>([]);
  const derived = useMemo(() => getDerivedStats(game.character), [game.character]);
  const revealCombatEvent = useCombatEventSequencer(game, setGame);
  const combatLocked = game.adventure.combat?.outcome === "active";
  const activeNode = ADVENTURE[game.adventure.nodeIndex];
  const isCombatScreen = view === "adventure" && Boolean(game.adventure.combat) && activeNode?.type !== "event";

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

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const beginAdventure = () => {
    const combat = createCombat(game.character, ADVENTURE[0].enemies!, derived.maxHp);
    setGame((current) => ({
      ...current,
      adventure: { active: true, nodeIndex: 0, carryHp: derived.maxHp, combat, eventResolved: false, latestLoot: null, completed: false },
    }));
  };

  const selectEnemy = (enemyId: string) => {
    setGame((current) => current.adventure.combat ? ({
      ...current,
      adventure: { ...current.adventure, combat: { ...current.adventure.combat, selectedEnemyId: enemyId } },
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

  const advanceJourney = () => {
    setGame((current) => {
      const adventure = current.adventure;
      const currentNode = ADVENTURE[adventure.nodeIndex];
      const wonCombat = adventure.combat?.outcome === "victory";
      const carryHp = wonCombat ? adventure.combat!.playerHp : (adventure.carryHp ?? getDerivedStats(current.character).maxHp);
      let character = current.character;

      if (wonCombat) {
        const loot = getLoot(adventure.nodeIndex);
        character = { ...character, inventory: [...character.inventory, { ...loot, id: `${loot.id}-${Date.now()}` }], gold: character.gold + (currentNode.type === "boss" ? 32 : 9) };
      }

      if (adventure.nodeIndex >= ADVENTURE.length - 1) {
        return {
          ...current,
          character: { ...character, xp: character.xp + 100, talentPoints: character.talentPoints + 2 },
          adventure: { ...adventure, active: false, completed: true, carryHp, latestLoot: getLoot(adventure.nodeIndex), combat: null },
        };
      }

      const nextIndex = adventure.nodeIndex + 1;
      const nextNode = ADVENTURE[nextIndex];
      const combat = nextNode.enemies ? createCombat(character, nextNode.enemies, carryHp) : null;
      return {
        ...current,
        character,
        adventure: { ...adventure, nodeIndex: nextIndex, carryHp, combat, eventResolved: false, latestLoot: wonCombat ? getLoot(adventure.nodeIndex) : null },
      };
    });
  };

  const continueJourney = () => {
    if (travelTransition) return;
    if (game.adventure.nodeIndex >= ADVENTURE.length - 1) {
      advanceJourney();
      return;
    }
    const nextNode = ADVENTURE[game.adventure.nodeIndex + 1];
    const message = nextNode.enemies
        ? `You encounter ${nextNode.enemies.map((id) => ENEMIES[id].name).join(" and ")}.`
        : `You discover ${nextNode.title}.`;
    setTravelTransition({ phase: "travel", dots: 1, message });
    const dotInterval = window.setInterval(() => {
      setTravelTransition((current) => current?.phase === "travel" ? { ...current, dots: Math.min(5, current.dots + 1) } : current);
    }, 500);
    const encounterTimer = window.setTimeout(() => {
      window.clearInterval(dotInterval);
      setTravelTransition({ phase: "encounter", dots: 5, message });
    }, 2500);
    const completeTimer = window.setTimeout(() => {
      advanceJourney();
      setTravelTransition(null);
    }, 4000);
    travelTimers.current = [dotInterval, encounterTimer, completeTimer];
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
      if (!talent.requires.every((requirement) => current.character.unlockedTalents.includes(requirement))) return current;
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
    if (abilityId === "strike" || abilityId === "guard") return;
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const equipped = current.character.equippedAbilities;
      const next = equipped.includes(abilityId) ? equipped.filter((id) => id !== abilityId) : equipped.length < 6 ? [...equipped, abilityId] : equipped;
      return { ...current, character: { ...current.character, equippedAbilities: next } };
    });
  };

  const equipItem = (item: GearItem) => {
    setGame((current) => {
      if (current.adventure.combat?.outcome === "active") return current;
      const slot = slotForItem(item, current.character.equipment);
      const oldItem = current.character.equipment[slot];
      const inventory = current.character.inventory.filter((candidate) => candidate.id !== item.id);
      if (oldItem) inventory.push(oldItem);
      return {
        ...current,
        character: { ...current.character, inventory, equipment: { ...current.character.equipment, [slot]: item } },
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

  const createCharacter = (name: string) => {
    setGame((current) => ({
      ...current,
      characterCreated: true,
      character: { ...current.character, name: name.trim() },
    }));
    setView("adventure");
  };

  if (!game.characterCreated) return <CharacterCreation onCreate={createCharacter} />;

  return (
    <div className={`app-shell ${isCombatScreen ? "in-combat" : ""}`} style={{ "--attack-duration": `${COMBAT_TIMING.attackDurationMs}ms` } as React.CSSProperties}>
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
          <span><Coins size={15} /> {game.character.gold}</span>
          <span><Sparkles size={15} /> {game.character.talentPoints}</span>
          <button className="icon-button" onClick={() => setResetDialogOpen(true)} title="Reset save" aria-label="Reset save"><RotateCcw size={15} /></button>
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
            onCombatEvent={revealCombatEvent}
            onInitiativeComplete={finishInitiativeRoll}
            onContinue={continueJourney}
            onEvent={resolveEvent}
            onPermadeath={returnToCharacterCreation}
            onTalents={() => navigate("talents")}
          />
        )}
        {view === "character" && <CharacterView character={game.character} locked={combatLocked} onEquip={equipItem} />}
        {view === "talents" && <TalentsView character={game.character} locked={combatLocked} onUnlock={unlockTalent} onToggleAbility={toggleAbility} />}
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
      {travelTransition && (
        <div className={`travel-transition ${travelTransition.phase}`} role="status" aria-live="polite">
          <div className="travel-transition-content">
            {travelTransition.phase === "travel" && (
              <div className="travel-footsteps" aria-hidden="true">
                <Footprints /><Footprints />
              </div>
            )}
            <span>{travelTransition.phase === "travel" ? `Following the ashen road${".".repeat(travelTransition.dots)}` : travelTransition.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function CharacterCreation({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedName) onCreate(trimmedName);
  };
  return (
    <main className="character-creation">
      <section className="creation-card">
        <div className="creation-sigil"><UserRound size={28} /></div>
        <p className="eyebrow">A New Chronicle</p>
        <h1>Create Your Character</h1>
        <p>Name the wanderer who will brave Emberfall. This journey uses permadeath: if your character falls, their progress and possessions are lost.</p>
        <form onSubmit={submit}>
          <label htmlFor="character-name">Character name</label>
          <input
            id="character-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={24}
            autoComplete="off"
            autoFocus
            placeholder="Enter a name"
          />
          <small>{name.length}/24</small>
          <button className="primary-button" type="submit" disabled={!trimmedName}>Begin Chronicle <ChevronRight size={17} /></button>
        </form>
        <div className="permadeath-warning"><Skull size={16} /><span><strong>Permadeath enabled</strong>Your save is erased when this character dies.</span></div>
      </section>
    </main>
  );
}

function AdventureView({ game, derived, onBegin, onSelectEnemy, onAbility, onEndTurn, onEnemyTurn, onCombatEvent, onInitiativeComplete, onContinue, onEvent, onPermadeath, onTalents }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  onBegin: () => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onEndTurn: () => void;
  onEnemyTurn: (actorId: string) => void;
  onCombatEvent: (eventId: number, eventIndex: number) => void;
  onInitiativeComplete: () => void;
  onContinue: () => void;
  onEvent: (choice: "rest" | "ember") => void;
  onPermadeath: () => void;
  onTalents: () => void;
}) {
  const adventure = game.adventure;
  const [logOpen, setLogOpen] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState<InspectableInfo | null>(null);
  const [sequencePlaying, setSequencePlaying] = useState(Boolean(adventure.combat?.floatingEvents?.length));
  const combatEventId = adventure.combat?.eventId ?? 0;
  const floatingEventCount = adventure.combat?.floatingEvents?.length ?? 0;
  const sequenceEventId = useRef(combatEventId);
  const initiativePlaying = Boolean(adventure.combat && adventure.combat.outcome === "active" && !adventure.combat.initiativeRevealed);
  const sequencePending = initiativePlaying || sequencePlaying || sequenceEventId.current !== combatEventId;
  const activeActor = adventure.combat?.turnOrder?.[adventure.combat.activeTurnIndex];

  useEffect(() => {
    setLogOpen(false);
    setInspectedInfo(null);
  }, [adventure.nodeIndex]);
  useEffect(() => {
    sequenceEventId.current = combatEventId;
    if (floatingEventCount === 0) {
      setSequencePlaying(false);
      return;
    }
    setSequencePlaying(true);
    const timer = window.setTimeout(() => setSequencePlaying(false), floatingEventCount * COMBAT_TIMING.floatingMessageMs);
    return () => window.clearTimeout(timer);
  }, [combatEventId, floatingEventCount]);
  useEffect(() => {
    if (!adventure.combat || adventure.combat.outcome !== "active" || sequencePending || logOpen || inspectedInfo || activeActor?.kind !== "enemy") return;
    const timer = window.setTimeout(() => onEnemyTurn(activeActor.actorId), 250);
    return () => window.clearTimeout(timer);
  }, [activeActor?.actorId, activeActor?.kind, adventure.combat?.outcome, combatEventId, inspectedInfo, logOpen, onEnemyTurn, sequencePending]);

  if (adventure.completed) {
    return (
      <section className="page narrow-page completion-page">
        <div className="boss-emblem"><Trophy size={34} /></div>
        <p className="eyebrow">Adventure Complete</p>
        <h1>The Black Gate Falls</h1>
        <p>The Warden's flame gutters out. Beyond the gate, Emberfall waits beneath a bruised and starless sky.</p>
        <div className="reward-strip">
          <span><strong>+100</strong> Experience</span><span><strong>+2</strong> Talent Points</span><span><strong>+32</strong> Gold</span>
        </div>
        <button className="primary-button" onClick={onBegin}>Venture Forth Again <ChevronRight size={17} /></button>
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
            <button className="primary-button" onClick={onBegin}>Begin Journey <ChevronRight size={18} /></button>
          </div>
          <div className="gate-art" aria-hidden="true"><div className="sun"/><div className="tower left"/><div className="tower right"/><div className="gate"/></div>
        </div>
        <div className="section-heading"><div><p className="eyebrow">Route Preview</p><h2>What lies ahead</h2></div><span className="muted">Progress saves automatically</span></div>
        <div className="route-grid">
          {ADVENTURE.map((node, index) => <RouteCard key={node.id} node={node} index={index} />)}
        </div>
      </section>
    );
  }

  const node = ADVENTURE[adventure.nodeIndex];
  if (node.type === "event") {
    return (
      <section className="page narrow-page event-page">
        <ProgressHeader index={adventure.nodeIndex} />
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
  const isPlayerTurn = activeActor?.kind === "player";
  return (
    <section className="combat-page compact-combat">
      <ProgressHeader index={adventure.nodeIndex} />
      <TurnOrderBar combat={combat} />
      {initiativePlaying && <InitiativeRoll key={`${adventure.nodeIndex}-${combat.eventId}`} combat={combat} onComplete={onInitiativeComplete} />}
      <div className="compact-arena">
        <article
          key="player"
          className={`compact-combatant player-combatant ${activeActor?.kind === "player" ? "active-turn" : ""} ${damagedTargets.includes("player") ? "damaged" : ""} ${combat.attackingActorId === "player" ? "attacking-right" : ""}`}
        >
          <h2>{game.character.name}</h2>
          <div className="compact-resource-label"><span>Health</span><b>{combat.playerHp}/{combat.playerMaxHp}</b></div>
          <HealthBar value={combat.playerHp} max={combat.playerMaxHp} />
          <div className="compact-status-row">
            <button
              type="button"
              className="armor-badge inspectable armor-indicator"
              aria-label={`${derived.armor} Armor. Show details.`}
              title={`${derived.armor} Armor`}
              onClick={() => setInspectedInfo({
                title: "Armor",
                description: `You have ${derived.armor} Armor. Enemy attacks reduce their damage by 35% of your Armor, rounded down.`,
                category: "stat",
              })}
            >
              <Shield size={13} /><b>{derived.armor}</b><span>Armor</span>
            </button>
            {combat.playerStatuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} kind={status.kind} onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
          </div>
          <div className="compact-resource-label energy-label"><span>Energy</span><b>{combat.energy}/{combat.maxEnergy}</b></div>
          <EnergySegments value={combat.energy} max={combat.maxEnergy} regen={derived.energyRegen} showGain />
        </article>

        <div className={`compact-enemy-stack count-${combat.enemies.length}`}>
          {combat.enemies.map((enemy) => (
            <article
              key={enemy.instanceId}
              role="button"
              tabIndex={enemy.hp > 0 ? 0 : -1}
              aria-disabled={enemy.hp <= 0}
              aria-label={`Target ${enemy.name}`}
              className={`compact-combatant enemy-combatant ${activeActor?.actorId === enemy.instanceId ? "active-turn" : ""} ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""} ${damagedTargets.includes(enemy.instanceId) ? "damaged" : ""} ${combat.attackingActorId === enemy.instanceId ? "attacking-left" : ""}`}
              style={{ "--enemy-accent": enemy.accent } as React.CSSProperties}
              onClick={() => enemy.hp > 0 && onSelectEnemy(enemy.instanceId)}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && enemy.hp > 0 && (event.key === "Enter" || event.key === " ")) {
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
                {enemy.statuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} kind={status.kind} onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
              </div>
              <div className="compact-resource-label energy-label"><span>Energy</span><b>{enemy.energy ?? 10}/{enemy.maxEnergy ?? 10}</b></div>
              <EnergySegments value={enemy.energy ?? 10} max={enemy.maxEnergy ?? 10} regen={1} />
            </article>
          ))}
        </div>
      </div>

      <FloatingCombatText key={combat.eventId ?? 0} eventId={combat.eventId ?? 0} events={combat.floatingEvents ?? []} onEventShown={onCombatEvent} />

      <div className="compact-ability-grid">
        {game.character.equippedAbilities.map((id, index) => {
          const ability = ABILITIES[id];
          const cooldown = combat.abilityCooldowns?.[id] ?? 0;
          return <HoldAbilityButton key={id} ability={ability} index={index} cooldown={cooldown} disabled={sequencePending || !isPlayerTurn || cooldown > 0 || combat.outcome !== "active" || ability.energyCost > combat.energy} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <div className="combat-footer-controls">
        <button className="combat-log-button" onClick={() => setLogOpen(true)}><BookOpen size={14} /> Combat Log</button>
        <button className="end-turn-button" disabled={sequencePending || !isPlayerTurn || combat.outcome !== "active"} onClick={onEndTurn}>
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

      {combat.outcome !== "active" && !sequencePending && (
        <div className={`compact-outcome ${combat.outcome}`}>
          <div className="compact-outcome-card">
            {combat.outcome === "victory" ? <Trophy /> : <Skull />}
            <p className="eyebrow">Combat {combat.outcome}</p>
            <h2>{combat.outcome === "victory" ? "The road is yours" : `${game.character.name} has fallen`}</h2>
            <p>{combat.outcome === "victory" ? `Claim ${getLoot(adventure.nodeIndex).name}.` : "This chronicle ends here. All progress, equipment, and talents are lost."}</p>
            {combat.outcome === "victory" ? <button className="primary-button" onClick={onContinue}>{adventure.nodeIndex === ADVENTURE.length - 1 ? "Claim Victory" : "Claim & Continue"}<ChevronRight size={17} /></button> : <button className="primary-button" onClick={onPermadeath}>Create New Character <ChevronRight size={17} /></button>}
          </div>
        </div>
      )}
    </section>
  );
}

function RouteCard({ node, index }: { node: AdventureNode; index: number }) {
  const icons = [<Footprints />, <Gem />, <Swords />, <Trophy />];
  return <article className={`route-card ${node.type}`}><span className="route-number">0{index + 1}</span><span className="route-icon">{icons[index]}</span><p className="eyebrow">{node.eyebrow}</p><h3>{node.title}</h3><p>{node.description}</p></article>;
}

function ProgressHeader({ index }: { index: number }) {
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
        <p className="initiative-caption" aria-live="polite">{phase === "rolling" ? "The D100 counters are racing." : phase === "landed" ? "Raw rolls are locked in." : phase === "bonus" ? "Initiative bonuses are now added." : "Highest initiative acts first."}</p>
        <div className="initiative-contestants" style={landingRect ? {
          "--initiative-target-top": `${landingRect.top}px`,
          "--initiative-target-left": `${landingRect.left}px`,
          "--initiative-target-width": `${landingRect.width}px`,
          "--initiative-target-height": `${landingRect.height}px`,
        } as React.CSSProperties : undefined}>
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
          const defeated = actor.kind === "player"
            ? combat.playerHp <= 0
            : (combat.enemies.find((enemy) => enemy.instanceId === actor.actorId)?.hp ?? 0) <= 0;
          return (
            <span
              key={actor.actorId}
              className={`${index === combat.activeTurnIndex ? "active" : ""} ${defeated ? "defeated" : ""} ${actor.kind}`}
              title={`${actor.name}: ${actor.initiative} Initiative`}
            >
              <b>{actor.kind === "player" ? "You" : actor.name}</b>
              <small>{actor.initiative}</small>
            </span>
          );
        })}
      </div>
    </div>
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

function StatusBadge({ id, name, stacks, kind, onInspect }: { id: string; name: string; stacks: number; kind: string; onInspect?: () => void }) {
  const icon = id === "bleed" ? <Droplets />
    : id === "poison" ? <FlaskConical />
      : id === "stunned" ? <Zap />
        : id === "vulnerable" ? <Target />
          : id === "guard" ? <Shield />
            : <Sparkles />;
  const label = `${name}${stacks > 1 ? `, ${stacks} stacks` : ""}`;
  if (!onInspect) return <span className={`status-badge status-icon ${kind}`} aria-label={label} title={label}>{icon}{stacks > 1 && <b>{stacks}</b>}</span>;
  return <button type="button" className={`status-badge status-icon inspectable ${kind}`} aria-label={label} title={label} onClick={(event) => { event.stopPropagation(); onInspect(); }}>{icon}{stacks > 1 && <b>{stacks}</b>}</button>;
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

function HoldAbilityButton({ ability, index, cooldown, disabled, onUse }: { ability: Ability; index: number; cooldown: number; disabled: boolean; onUse: () => void }) {
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
      aria-label={`${ability.name}, ${ability.energyCost} Energy${cooldown > 0 ? `, ${cooldown} turn cooldown remaining` : ""}. Hold for details.`}
    >
      <span className="compact-ability-key">{index + 1}</span>
      <span className="compact-ability-icon">{ability.icon}</span>
      <strong>{ability.name}</strong>
      <span className="compact-ability-cost">{ability.energyCost}<Sparkles size={10} /></span>
      {cooldown > 0 && <span className="compact-ability-cooldown" aria-hidden="true">{cooldown}</span>}
      {tooltipOpen && <span className="ability-hold-tooltip"><b>{ability.name}</b><small>{ability.description}</small><em>{ability.energyCost} Energy{ability.cooldownTurns ? ` · ${ability.cooldownTurns} turn cooldown` : ""}</em></span>}
    </button>
  );
}

function FloatingCombatText({ events, eventId, onEventShown }: { events: string[]; eventId: number; onEventShown: (eventId: number, eventIndex: number) => void }) {
  const [index, setIndex] = useState(0);
  const eventCallback = useRef(onEventShown);

  useEffect(() => { eventCallback.current = onEventShown; }, [onEventShown]);
  useEffect(() => setIndex(0), [eventId]);
  useEffect(() => {
    if (events.length === 0 || index >= events.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), COMBAT_TIMING.floatingMessageMs);
    return () => window.clearTimeout(timer);
  }, [events, eventId, index]);

  const message = events[index];
  useEffect(() => {
    if (message) eventCallback.current(eventId, index);
  }, [eventId, index, message]);
  if (!message) return null;
  const tone = /damage|fallen/i.test(message) ? "damage" : /gain|reclaim|turn|victory/i.test(message) ? "positive" : "neutral";
  return <div className={`floating-combat-text ${tone}`} aria-live="polite"><span key={`${eventId}-${index}`} style={{ animationDuration: `${COMBAT_TIMING.floatingMessageMs}ms` }}>{message}</span></div>;
}

function CharacterView({ character, locked, onEquip }: { character: CharacterState; locked: boolean; onEquip: (item: GearItem) => void }) {
  const derived = getDerivedStats(character);
  const equipped = Object.entries(character.equipment) as Array<[GearSlot, GearItem]>;
  const sets = equipped.reduce<Record<string, { name: string; count: number }>>((result, [, item]) => {
    if (item.set) result[item.set] = { name: item.setName ?? item.set, count: (result[item.set]?.count ?? 0) + 1 };
    return result;
  }, {});
  return (
    <section className="page character-page">
      <div className="page-title"><div><p className="eyebrow">Level {character.level} Wayfarer</p><h1>{character.name}</h1><p>Character & Equipment · Shape your attributes through gear.</p></div><div className="power-seal"><Swords /><span><small>Power</small><strong>{derived.power + derived.strength}</strong></span></div></div>
      <div className="character-layout">
        <div className="paper-panel">
          <div className="panel-title"><span><UserRound size={17} /> Attributes</span><small>Base + equipment + talents</small></div>
          <div className="stats-list">
            {STAT_LABELS.map((stat) => <div key={stat.key}><span className="stat-rune">{stat.short}</span><span><strong>{stat.label}</strong><small>{stat.key === "strength" ? "Physical power" : stat.key === "agility" ? "Finesse & precision" : stat.key === "intelligence" ? "Arcane potency" : stat.key === "vitality" ? "Health & resilience" : "Critical fortune"}</small></span><b>{derived[stat.key]}</b></div>)}
          </div>
          <div className="derived-grid"><span><Heart /> <small>Max Health</small><strong>{derived.maxHp}</strong></span><span><Shield /> <small>Armor</small><strong>{derived.armor}</strong></span><span><Target /> <small>Critical</small><strong>{Math.round(derived.critChance * 100)}%</strong></span><span><Sparkles /> <small>Max Energy</small><strong>{derived.maxEnergy}</strong></span><span title="d100 + Agility + half Intelligence"><Footprints /> <small>Initiative</small><strong>+{derived.initiativeBonus}</strong></span></div>
        </div>

        <div className="paper-panel equipment-panel">
          <div className="panel-title"><span><Shield size={17} /> Equipped Gear</span><small>8 equipment slots</small></div>
          <div className="equipment-grid">
            {(Object.keys(SLOT_LABELS) as GearSlot[]).map((slot) => {
              const item = character.equipment[slot];
              return <div className={`equipment-slot ${item ? item.rarity : "empty"}`} key={slot}><span className="slot-icon">{slot.includes("ring") ? "◌" : slot.includes("Hand") ? "⚔" : "◇"}</span><span><small>{SLOT_LABELS[slot]}</small><strong>{item?.name ?? "Empty"}</strong>{item && <em>{formatStats(item)}</em>}</span></div>;
            })}
          </div>
          {Object.keys(sets).length > 0 && <div className="set-bonuses">{Object.entries(sets).map(([id, set]) => {
            const activeBonuses = GEAR_SET_BONUSES.filter((bonus) => bonus.setId === id && set.count >= bonus.requiredPieces);
            return <span key={id}><Gem size={14} /><strong>{set.name}</strong> · {set.count} pieces {activeBonuses.map((bonus) => <b key={bonus.requiredPieces}>— {bonus.description} active</b>)}</span>;
          })}</div>}
        </div>
      </div>

      <div className="section-heading inventory-heading"><div><p className="eyebrow">Collected Items</p><h2>Inventory</h2></div><span className={locked ? "lock-note" : "muted"}>{locked ? "Equipment is locked during combat" : "Tap an item to equip it"}</span></div>
      <div className="inventory-grid">
        {character.inventory.length ? character.inventory.map((item) => <button key={item.id} className={`item-card ${item.rarity}`} disabled={locked} onClick={() => onEquip(item)}><span className="item-glyph">{item.slot === "ring" ? "◌" : item.slot.includes("Hand") ? "†" : "◇"}</span><span className="rarity">{item.rarity} {item.slot}</span><strong>{item.name}</strong><p>{item.description}</p><em>{formatStats(item)}</em><span className="equip-cta">{locked ? "Locked" : "Equip"} <ChevronRight size={14} /></span></button>) : <div className="empty-inventory">Your pack is empty. Adventure awaits.</div>}
      </div>
    </section>
  );
}

function formatStats(item: GearItem) {
  const values = Object.entries(item.stats).map(([key, value]) => `+${value} ${key.slice(0, 3).toUpperCase()}`);
  if (item.armor) values.push(`+${item.armor} ARM`);
  if (item.power) values.push(`+${item.power} PWR`);
  return values.join(" · ");
}

function TalentsView({ character, locked, onUnlock, onToggleAbility }: { character: CharacterState; locked: boolean; onUnlock: (id: string) => void; onToggleAbility: (id: string) => void }) {
  const branches: Array<{ id: Exclude<TalentBranch, "core">; symbol: string }> = [
    { id: "arcanist", symbol: "✧" },
    { id: "brute", symbol: "◆" },
    { id: "shadow", symbol: "◈" },
  ];
  return (
    <section className="page talents-page">
      <div className="page-title"><div><p className="eyebrow">Classless Progression</p><h1>Talent Tree</h1><p>Begin at the center, then grow outward into any discipline.</p></div><div className="talent-points"><Sparkles /><span><small>Available</small><strong>{character.talentPoints} Points</strong></span></div></div>
      {locked && <div className="lock-banner"><Shield size={15} /> Talents and ability loadouts are locked during combat.</div>}
      <div className="loadout-panel paper-panel">
        <div><p className="eyebrow">Active Loadout</p><h3>Equipped Abilities</h3></div>
        <div className="loadout-slots">{Array.from({ length: 6 }).map((_, index) => { const id = character.equippedAbilities[index]; const ability = id ? ABILITIES[id] : null; return <button key={index} disabled={locked} className={ability ? ability.branch : "empty"} onClick={() => ability && onToggleAbility(ability.id)} title={ability && ability.id !== "strike" && ability.id !== "guard" ? "Click to unequip" : undefined}>{ability ? <><span>{ability.icon}</span><small>{ability.name}</small></> : <><span>+</span><small>Empty</small></>}</button>; })}</div>
      </div>

      <div className="talent-tree" aria-label="Talent tree">
        <div className="talent-map">
          <div className="origin-node"><span>✦</span><strong>Wayfarer's Spark</strong><small>Starting node</small></div>
          {branches.map((branch) => {
            const talent = TALENTS.find((item) => item.branch === branch.id);
            if (!talent) return null;
            const unlocked = character.unlockedTalents.includes(talent.id);
            const available = talent.requires.every((id) => character.unlockedTalents.includes(id));
            const canUnlock = !locked && available && character.talentPoints >= talent.cost && !unlocked;
            const state = unlocked ? "unlocked" : available ? "available" : "locked";
            const action = unlocked ? "Unlocked" : locked ? "Locked in combat" : !available ? "Requires origin" : character.talentPoints < talent.cost ? "Not enough points" : `Unlock · ${talent.cost} point`;
            return (
              <div className={`talent-path ${branch.id}`} key={talent.id}>
                <button className={`class-talent-node ${branch.id} ${state}`} disabled={!canUnlock} onClick={() => onUnlock(talent.id)} aria-label={`${talent.name}. ${talent.description} ${action}`}>
                  <span className="class-node-symbol">{branch.symbol}</span>
                  <small>Class node</small>
                  <strong>{talent.name}</strong>
                  <span className="class-node-effect">{talent.description}</span>
                  <em>{action}</em>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default App;
