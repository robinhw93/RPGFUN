import { useEffect, useMemo, useRef, useState } from "react";
import {
  Backpack, BookOpen, ChevronRight, CircleDot, Coins, Footprints, Gem,
  Heart, Home, RotateCcw, Shield, Sparkles, Swords, Target, Trophy, UserRound,
} from "lucide-react";
import { ABILITIES, ADVENTURE, TALENTS } from "./game/data";
import { clearSave, loadGame, saveGame } from "./game/save";
import { createCombat, getDerivedStats, getLoot, INITIAL_GAME, slotForItem, useAbility } from "./game/engine";
import type { Ability, AdventureNode, CharacterState, GameState, GearItem, GearSlot, StatName, TalentBranch } from "./game/types";

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

function App() {
  const [game, setGame] = useState<GameState>(() => loadGame() ?? cloneInitial());
  const [view, setView] = useState<View>("adventure");
  const derived = useMemo(() => getDerivedStats(game.character), [game.character]);
  const combatLocked = game.adventure.combat?.outcome === "active";
  const activeNode = ADVENTURE[game.adventure.nodeIndex];
  const isCombatScreen = view === "adventure" && Boolean(game.adventure.combat) && activeNode?.type !== "event";

  useEffect(() => saveGame(game), [game]);
  useEffect(() => {
    document.body.classList.toggle("combat-open", isCombatScreen);
    return () => document.body.classList.remove("combat-open");
  }, [isCombatScreen]);

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

  const continueJourney = () => {
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
          character: { ...character, xp: character.xp + 100, talentPoints: character.talentPoints + 2 },
          adventure: { ...adventure, active: false, completed: true, carryHp, latestLoot: getLoot(adventure.nodeIndex), combat: null },
        };
      }

      const nextIndex = adventure.nodeIndex + 1;
      const nextNode = ADVENTURE[nextIndex];
      const combat = nextNode.enemies ? createCombat(character, nextNode.enemies, carryHp) : null;
      return {
        character,
        adventure: { ...adventure, nodeIndex: nextIndex, carryHp, combat, eventResolved: false, latestLoot: wonCombat ? getLoot(adventure.nodeIndex) : null },
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
        character: { ...current.character, talentPoints: current.character.talentPoints + 1 },
        adventure: { ...current.adventure, carryHp: Math.max(1, carryHp - 10), eventResolved: true },
      };
    });
  };

  const retryCombat = () => {
    setGame((current) => {
      const node = ADVENTURE[current.adventure.nodeIndex];
      return { ...current, adventure: { ...current.adventure, carryHp: getDerivedStats(current.character).maxHp, combat: createCombat(current.character, node.enemies!) } };
    });
  };

  const abandonAdventure = () => setGame((current) => ({
    ...current,
    adventure: { active: false, nodeIndex: 0, carryHp: null, combat: null, eventResolved: false, latestLoot: null, completed: false },
  }));

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

  const resetGame = () => {
    if (!window.confirm("Erase your current save and begin again?")) return;
    clearSave();
    setGame(cloneInitial());
    setView("adventure");
  };

  return (
    <div className={`app-shell ${isCombatScreen ? "in-combat" : ""}`}>
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
          <button className="icon-button" onClick={resetGame} title="Reset save"><RotateCcw size={15} /></button>
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
            onContinue={continueJourney}
            onEvent={resolveEvent}
            onRetry={retryCombat}
            onAbandon={abandonAdventure}
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
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function AdventureView({ game, derived, onBegin, onSelectEnemy, onAbility, onContinue, onEvent, onRetry, onAbandon, onTalents }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  onBegin: () => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onContinue: () => void;
  onEvent: (choice: "rest" | "ember") => void;
  onRetry: () => void;
  onAbandon: () => void;
  onTalents: () => void;
}) {
  const adventure = game.adventure;
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => setLogOpen(false), [adventure.nodeIndex]);

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
  return (
    <section className="combat-page compact-combat">
      <ProgressHeader index={adventure.nodeIndex} />
      <div className="compact-arena">
        <article className="compact-combatant player-combatant">
          <h2>{game.character.name}</h2>
          <div className="compact-resource-label"><span>Health</span><b>{combat.playerHp}/{combat.playerMaxHp}</b></div>
          <HealthBar value={combat.playerHp} max={combat.playerMaxHp} />
          <div className="compact-status-row">
            <span className="armor-badge"><Shield size={11} /> {derived.armor}</span>
            {combat.playerStatuses.map((status) => <StatusBadge key={status.id} name={status.name} stacks={status.stacks} kind={status.kind} />)}
          </div>
          <div className="compact-resource-label energy-label"><span>Energy</span><b>{combat.energy}/{combat.maxEnergy}</b></div>
          <div className="energy-bar"><i style={{ width: `${(combat.energy / combat.maxEnergy) * 100}%` }} /></div>
        </article>

        <div className={`compact-enemy-stack count-${combat.enemies.length}`}>
          {combat.enemies.map((enemy) => (
            <button
              key={enemy.instanceId}
              aria-label={`Target ${enemy.name}`}
              className={`compact-combatant enemy-combatant ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""}`}
              style={{ "--enemy-accent": enemy.accent } as React.CSSProperties}
              onClick={() => enemy.hp > 0 && onSelectEnemy(enemy.instanceId)}
            >
              <span className="compact-target"><Target size={11} /></span>
              <h2>{enemy.hp > 0 ? enemy.name : "Defeated"}</h2>
              <div className="compact-resource-label"><span>Health</span><b>{enemy.hp}/{enemy.maxHp}</b></div>
              <HealthBar value={enemy.hp} max={enemy.maxHp} />
              <div className="compact-status-row">
                {enemy.statuses.length === 0 && <span className="no-status">No effects</span>}
                {enemy.statuses.map((status) => <StatusBadge key={status.id} name={status.name} stacks={status.stacks} kind={status.kind} />)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <FloatingCombatText eventId={combat.eventId ?? 0} events={combat.floatingEvents ?? []} />

      <div className="compact-ability-grid">
        {game.character.equippedAbilities.map((id, index) => {
          const ability = ABILITIES[id];
          return <HoldAbilityButton key={id} ability={ability} index={index} disabled={combat.outcome !== "active" || ability.energyCost > combat.energy} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <button className="combat-log-button" onClick={() => setLogOpen(true)}><BookOpen size={14} /> Combat Log</button>

      {logOpen && (
        <div className="combat-log-modal" role="dialog" aria-modal="true" aria-label="Combat Log">
          <div className="combat-log-sheet">
            <div className="combat-log-title"><span><BookOpen size={16} /> Combat Log</span><button onClick={() => setLogOpen(false)} aria-label="Close combat log">×</button></div>
            <div>{combat.log.map((line, index) => <p key={`${line}-${index}`} className={index === 0 ? "latest" : ""}>{line}</p>)}</div>
          </div>
        </div>
      )}

      {combat.outcome !== "active" && (
        <div className={`compact-outcome ${combat.outcome}`}>
          <div className="compact-outcome-card">
            {combat.outcome === "victory" ? <Trophy /> : <Heart />}
            <p className="eyebrow">Combat {combat.outcome}</p>
            <h2>{combat.outcome === "victory" ? "The road is yours" : "Fallen in ash"}</h2>
            <p>{combat.outcome === "victory" ? `Claim ${getLoot(adventure.nodeIndex).name}.` : "Reconsider your approach and rise again."}</p>
            {combat.outcome === "victory" ? <button className="primary-button" onClick={onContinue}>{adventure.nodeIndex === ADVENTURE.length - 1 ? "Claim Victory" : "Claim & Continue"}<ChevronRight size={17} /></button> : <div className="outcome-actions"><button className="primary-button" onClick={onRetry}>Try Again</button><button className="text-button" onClick={onAbandon}>Return</button></div>}
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
  return <div className="journey-progress"><span>The Ashen Road</span><div>{ADVENTURE.map((node, itemIndex) => <i key={node.id} className={itemIndex < index ? "done" : itemIndex === index ? "current" : ""} />)}</div><span>{index + 1} / {ADVENTURE.length}</span></div>;
}

function HealthBar({ value, max }: { value: number; max: number }) {
  return <div className="health-bar"><i style={{ width: `${Math.max(0, value / max) * 100}%` }} /></div>;
}

function StatusBadge({ name, stacks, kind }: { name: string; stacks: number; kind: string }) {
  return <span className={`status-badge ${kind}`}>{name}{stacks > 1 ? ` ${stacks}` : ""}</span>;
}

function HoldAbilityButton({ ability, index, disabled, onUse }: { ability: Ability; index: number; disabled: boolean; onUse: () => void }) {
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
      aria-label={`${ability.name}, ${ability.energyCost} Energy. Hold for details.`}
    >
      <span className="compact-ability-key">{index + 1}</span>
      <span className="compact-ability-icon">{ability.icon}</span>
      <strong>{ability.name}</strong>
      <span className="compact-ability-cost">{ability.energyCost}<Sparkles size={10} /></span>
      {tooltipOpen && <span className="ability-hold-tooltip"><b>{ability.name}</b><small>{ability.description}</small><em>{ability.energyCost} Energy</em></span>}
    </button>
  );
}

function FloatingCombatText({ events, eventId }: { events: string[]; eventId: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [eventId]);
  useEffect(() => {
    if (events.length === 0 || index >= events.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 850);
    return () => window.clearTimeout(timer);
  }, [events, eventId, index]);

  const message = events[index];
  if (!message) return null;
  const tone = /damage|fallen/i.test(message) ? "damage" : /gain|reclaim|turn|victory/i.test(message) ? "positive" : "neutral";
  return <div className={`floating-combat-text ${tone}`} aria-live="polite"><span key={`${eventId}-${index}`}>{message}</span></div>;
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
      <div className="page-title"><div><p className="eyebrow">Level {character.level} Wayfarer</p><h1>Character & Equipment</h1><p>Shape your attributes through gear. Every choice changes the fight.</p></div><div className="power-seal"><Swords /><span><small>Power</small><strong>{derived.power + derived.strength}</strong></span></div></div>
      <div className="character-layout">
        <div className="paper-panel">
          <div className="panel-title"><span><UserRound size={17} /> Attributes</span><small>Base + equipment + talents</small></div>
          <div className="stats-list">
            {STAT_LABELS.map((stat) => <div key={stat.key}><span className="stat-rune">{stat.short}</span><span><strong>{stat.label}</strong><small>{stat.key === "strength" ? "Physical power" : stat.key === "agility" ? "Finesse & precision" : stat.key === "intelligence" ? "Arcane potency" : stat.key === "vitality" ? "Health & resilience" : "Critical fortune"}</small></span><b>{derived[stat.key]}</b></div>)}
          </div>
          <div className="derived-grid"><span><Heart /> <small>Max Health</small><strong>{derived.maxHp}</strong></span><span><Shield /> <small>Armor</small><strong>{derived.armor}</strong></span><span><Target /> <small>Critical</small><strong>{Math.round(derived.critChance * 100)}%</strong></span><span><Sparkles /> <small>Max Energy</small><strong>{derived.maxEnergy}</strong></span></div>
        </div>

        <div className="paper-panel equipment-panel">
          <div className="panel-title"><span><Shield size={17} /> Equipped Gear</span><small>8 equipment slots</small></div>
          <div className="equipment-grid">
            {(Object.keys(SLOT_LABELS) as GearSlot[]).map((slot) => {
              const item = character.equipment[slot];
              return <div className={`equipment-slot ${item ? item.rarity : "empty"}`} key={slot}><span className="slot-icon">{slot.includes("ring") ? "◌" : slot.includes("Hand") ? "⚔" : "◇"}</span><span><small>{SLOT_LABELS[slot]}</small><strong>{item?.name ?? "Empty"}</strong>{item && <em>{formatStats(item)}</em>}</span></div>;
            })}
          </div>
          {Object.keys(sets).length > 0 && <div className="set-bonuses">{Object.entries(sets).map(([id, set]) => <span key={id}><Gem size={14} /><strong>{set.name}</strong> · {set.count} pieces {set.count >= 2 && <b>— +2 Strength active</b>}</span>)}</div>}
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
  const branches: Array<{ id: Exclude<TalentBranch, "core">; name: string; subtitle: string; symbol: string }> = [
    { id: "brute", name: "Brute", subtitle: "Might · Armor · Control", symbol: "◆" },
    { id: "shadow", name: "Shadow", subtitle: "Speed · Bleed · Venom", symbol: "◢" },
    { id: "arcanist", name: "Arcanist", subtitle: "Arcane · Energy · Focus", symbol: "✧" },
  ];
  return (
    <section className="page talents-page">
      <div className="page-title"><div><p className="eyebrow">Classless Progression</p><h1>Talent Constellation</h1><p>Begin at the center. Follow one path or weave powers from every discipline.</p></div><div className="talent-points"><Sparkles /><span><small>Available</small><strong>{character.talentPoints} Points</strong></span></div></div>
      {locked && <div className="lock-banner"><Shield size={15} /> Talents and ability loadouts are locked during combat.</div>}
      <div className="loadout-panel paper-panel">
        <div><p className="eyebrow">Active Loadout</p><h3>Equipped Abilities</h3></div>
        <div className="loadout-slots">{Array.from({ length: 6 }).map((_, index) => { const id = character.equippedAbilities[index]; const ability = id ? ABILITIES[id] : null; return <button key={index} disabled={locked} className={ability ? ability.branch : "empty"} onClick={() => ability && onToggleAbility(ability.id)} title={ability && ability.id !== "strike" && ability.id !== "guard" ? "Click to unequip" : undefined}>{ability ? <><span>{ability.icon}</span><small>{ability.name}</small></> : <><span>+</span><small>Empty</small></>}</button>; })}</div>
      </div>

      <div className="talent-tree">
        <div className="origin-node"><span>✦</span><strong>Wayfarer's Spark</strong><small>Strike · Guard</small></div>
        <div className="branch-grid">
          {branches.map((branch) => (
            <div className={`talent-branch ${branch.id}`} key={branch.id}>
              <div className="branch-heading"><span>{branch.symbol}</span><div><h2>{branch.name}</h2><small>{branch.subtitle}</small></div></div>
              <div className="talent-line">
                {TALENTS.filter((talent) => talent.branch === branch.id).map((talent) => {
                  const unlocked = character.unlockedTalents.includes(talent.id);
                  const available = talent.requires.every((id) => character.unlockedTalents.includes(id));
                  const ability = talent.abilityId ? ABILITIES[talent.abilityId] : null;
                  const equipped = ability ? character.equippedAbilities.includes(ability.id) : false;
                  return (
                    <article className={`talent-node ${unlocked ? "unlocked" : available ? "available" : "locked"}`} key={talent.id}>
                      <div className="talent-icon">{ability?.icon ?? branch.symbol}</div><span className="tier">Tier {talent.tier}</span><h3>{talent.name}</h3><p>{talent.description}</p>
                      {unlocked ? <div className="talent-owned">Unlocked {ability && ability.id !== "strike" && ability.id !== "guard" && <button disabled={locked} onClick={() => onToggleAbility(ability.id)}>{equipped ? "Unequip" : "Equip"}</button>}</div> : <button className="unlock-button" disabled={locked || !available || character.talentPoints < talent.cost} onClick={() => onUnlock(talent.id)}>{locked ? "Locked in combat" : available ? `Unlock · ${talent.cost} pt${talent.cost > 1 ? "s" : ""}` : "Requires previous"}</button>}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
